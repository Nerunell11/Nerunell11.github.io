数学とコンテナを自作して、Foundation に置いています。エンジンの他のモジュールは、これらを共通の部品として使います。

### 仕組み

数学は Vec2 / Vec3 / Vec4、Mat44、Quat に加えて、境界ボリューム (`Bounds`)、交差判定 (`Intersect`)、カーブ、ノイズ、半精度浮動小数 (`Half`)、イージング、モートン符号、LOD の計算などです。

コンテナは、`Array`、`HashMap`、`SlotMap`、`ObjectPool`、`RingBuffer`、`BitSet`、`String`、`FixedString` などを自作しています。確保先は `IAllocator&` で受け取れます。

個別に説明が必要なものが 3 つあります。

- **`ChunkedArray`**: 要素のアドレスが動かないことを保証するコンテナです。固定個数のチャンクを足していく構造で、要素の位置はチャンク番号と、チャンク内の番号で決まります。
- **`Function`**: 小さなラムダを確保なしで持てる、`std::function` の代わりです。キャプチャが 48 バイト (`kFunctionInlineCapacity`) 以下で、アラインメントが合うなら、本体の中に直接置きます。ジョブの投入で確保が起きにくくなります。
- **`Handle`**: インデックスと世代番号を 1 つの整数にまとめた、型付きのハンドルです。

`Handle` は 32 ビットで、下位 24 ビットがインデックス、上位 8 ビットが世代です。

```math
\text{value} = (g \ll 24) \mid (i \,\&\, (2^{24}-1))
```

`$g$` は世代、`$i$` はインデックスです。スロットを解放するたびに世代を 1 上げ、古いハンドルが再利用されたスロットを指さないようにします。ECS の `Entity` は、この `Handle` に型の印を付けたものです。

### 実装

`Function` が本体を中に置けるかどうかは、コンパイル時に決まります。

```cpp
// Engine/Foundation/Include/Nexus/Foundation/Containers/Function.h
template <typename Callable>
static constexpr bool kFitsInline =
    sizeof(Callable) <= kFunctionInlineCapacity &&
    alignof(Callable) <= kInlineAlignment &&
    (kInlineAlignment % alignof(Callable)) == 0;
```

`HandleAllocator` は、解放のたびに世代を進めます。コメントに書かれているとおり、8 ビットの世代は、同じスロットの解放が 256 回に達すると一周します。長く生きる、または入れ替わりの多い対象には、世代が 32 ビットの `Handle64` を使います。

```cpp
// Engine/Foundation/Include/Nexus/Foundation/Handle.h
// 8-bit generations can wrap after 256 releases of the same slot.
// Use Handle64 for long-lived or high-churn object domains.
slot.generation = static_cast<u8>(slot.generation + 1u);
```

### 設計判断

`Function` を作ったのは、ジョブの投入のたびに確保が起きるのを避けるためです。ジョブシステムは、呼び出し可能なオブジェクトを `Function<void()>` に入れて保持します。48 バイトを超えるキャプチャは、アロケータ付きの経路で確保します。

`ChunkedArray` を使っているのは、ジョブの状態を、アドレスを変えずに保持するためです。`std::vector` のように再確保で要素が動くと、状態へのポインタを持つハンドルが壊れます (ADR 021)。

### 限界

- 8 ビットの世代は 256 回で一周します。`Entity` は `Handle` なので、同じスロットが 256 回作り直される間、古いハンドルを持ち続けると、別のエンティティを指す可能性があります。この点はヘッダのコメントが指摘している制約です。
