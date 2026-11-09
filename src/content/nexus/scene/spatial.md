空間クエリのためのデータ構造です。動く物、動かない物、毎フレーム全部が動く物で、構造を分けています。

### 仕組み

- **`AabbTree`**: 動く物向けです。挿入・削除・更新ができ、箱・視錐台・レイで問い合わせられます。
- **`StaticBvh`**: 動かない物向けです。ロードやクックのときに一度だけ、時間をかけて質の高い木を作ります。構築には binned SAH (表面積ヒューリスティック) を使い、箱・視錐台・レイで列挙できます。
- **`SpatialGrid2D`**: 2D の近傍探索で、数千個の準静的なプロキシを想定した作りです。
- **`UniformGrid2D`**: 数万体が毎フレーム全部動く用途向けに、毎フレーム作り直す 2D グリッドです。

`UniformGrid2D` は、個別の挿入も削除も更新もありません。`Build` が数え上げソート (カウンティングソート) で点をセルに束ねます。セル `$c$` に入る点の数を `$n_c$` とすると、各セルの開始位置 `$s_c$` は先頭からの累積です。

```math
s_0 = 0, \qquad s_{c+1} = s_c + n_c
```

点 `$i$` は、自分のセルの開始位置から順に詰めて `m_indices` に書かれます。このソートは安定なので、同じ入力からは同じ順序が出ます。決定論シミュレーションを壊しません。

### 実装

`Build` は 2 回走査します。1 回目でセルごとの点数を数えて累積し、2 回目で添字を散らします。

```cpp
// Engine/Scene/Src/UniformGrid2D.cpp
for (usize i = 0; i < count; ++i)
{
    ++m_cellStart[static_cast<usize>(CellIndex(positions[i])) + 1u];
}
// ...
m_indices.Resize(count);
for (usize i = 0; i < count; ++i)
{
    const u32 cell = CellIndex(positions[i]);
    m_indices[m_cellStart[cell]++] = static_cast<u32>(i);
}
```

クエリはセルの範囲を走査し、粗い候補の添字だけをコールバックに渡します。正確な判定は、位置を持っている呼び出し側が行います。範囲外の点は、端のセルに押し込まれるので、入力の添字が失われることはありません。

```cpp
// Engine/Scene/Include/Nexus/Scene/UniformGrid2D.h
template<typename Fn>
void QueryCircle(Vec2 center, f32 radius, Fn&& fn) const
{
    const f32 queryRadius = radius > 0.0f ? radius : 0.0f;
    QueryRange(center - queryRadius, center + queryRadius, fn);
}
```

### 設計判断

`SpatialGrid2D` は、ハッシュマップと、プロキシ単位の挿入・削除・更新で作られています。数万体が毎フレーム全部動く用途では、ハッシュ引きとセルごとのヒープ配列が支配的になったので、毎フレーム作り直す `UniformGrid2D` を別に足しました (ADR 019)。

### 限界

Engine と Samples、Sandbox、Editor の中で、これらを使っているのは NexusDefense (`UniformGrid2D` だけ) です。`AabbTree`、`StaticBvh`、`SpatialGrid2D` を呼ぶコードは、Scene のテスト以外にありません。
