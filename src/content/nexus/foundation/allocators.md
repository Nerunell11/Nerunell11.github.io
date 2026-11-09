`IAllocator` を共通の入口にして、リニア、スタック、プール、TLSF の 4 種類を用意しています。`new` / `delete` を直接書かない代わりに、使う側が用途に合う確保方法を選べるようにするためです。

### 仕組み

`IAllocator` は `Alloc(size, align)`、`Free(ptr)`、`Name()` だけを持つ小さなインターフェースです。コンテナやワールドなどは、確保先を `IAllocator&` で受け取ります。何も渡さなければ、OS のヒープを使う `GetSystemAllocator()` が既定値になります。

```cpp
// Engine/Foundation/Include/Nexus/Foundation/Memory/Allocator.h
class IAllocator
{
public:
    virtual ~IAllocator() = default;
    virtual void* Alloc(usize size, usize align) = 0;
    virtual void  Free(void* ptr) = 0;
    virtual const char* Name() const = 0;
};
```

4 種類の使い分けは次のとおりです。

| 種類 | 性質 | 使いどころ |
| --- | --- | --- |
| `LinearAllocator` | 確保を進めるだけ。`Free` は何もしない。`Reset` で全部戻す | フレーム境界で捨てる一時データ |
| `StackAllocator` | `Marker` を取っておき、`FreeToMarker` で巻き戻す | スコープ単位の一時データ |
| `PoolAllocator` | 固定サイズのスロットをフリーリストで管理 | 同じ大きさのオブジェクト |
| `TLSFAllocator` | 汎用ヒープ。単一スレッド前提 | モジュールが持つ任意サイズの確保 |

どの種類も、親のアロケータから領域を借りるか、呼び出し側が用意したバッファを使うコンストラクタを持ちます。`SystemAllocator` 以外は単一スレッド前提で、同期が必要なら、そのアロケータを持つモジュール側で入れます。

TLSF (Two-Level Segregated Fit) は、空きブロックをサイズで 2 段に分けたリストで持ちます。確保したいサイズ `$s$` に対して、1 段目の添字 `$f$` と 2 段目の添字 `$k$` は次のとおりです。

```math
f = \lfloor \log_2 s \rfloor, \qquad k = \left\lfloor \frac{s - 2^{f}}{2^{f}/32} \right\rfloor
```

`$k$` は 0 から 31 で、2 段目は 32 分割 (`kSecondLevelBits = 5`) です。ここで `$f \ge 5$` の場合の式です。`$f < 5$` では刻み幅を 1 にしています。空きがあるリストはビットマップで持つので、要求を満たす空きブロックを、ビット走査で探せます。

```cpp
// Engine/Foundation/Src/Memory/TLSFAllocator.cpp
first = BitScanReverse64(static_cast<u64>(size));
const usize base = static_cast<usize>(1) << first;
const usize step = first >= kSecondLevelBits ? base >> kSecondLevelBits : 1;
second = static_cast<u32>((size - base) / step);
if (second >= kSecondLevelCount)
{
    second = kSecondLevelCount - 1;
}
```

### 設計判断

使う側が確保方法を選べるように、確保先は常に `IAllocator&` で受け取ります。コンテナも `World` も `SystemScheduler` も、同じ形です。

確保量はカテゴリ別に集計できます。`TrackingAllocator` は内側のアロケータを包み、確保のたびに `MemoryTracker` のカテゴリへ報告します。カテゴリごとに現在値とピーク、確保回数を持ち、予算を超えたものを検出します。カテゴリは最大 64 個です。

メモリの増加を見逃した経験があります。ジョブの状態を解放しない不具合が、NexusDefense で毎秒 245 MB のメモリ増加として見つかりました (ADR 021)。その調査では、`AllocatorStats::totalAllocatedBytes` が累計で、`Free` では減らないことも確認しています。現在の使用量として読むと、常に右肩上がりに見えます。

### 限界

リニア、スタック、プール、TLSF、`TrackingAllocator` を使っているのは、今のところ Foundation の中のテストだけです。Engine の他のモジュール、Samples、Sandbox、Editor は、まだこれらを使っていません (ソース全体を検索して確認しました)。他のモジュールが持つのは、`IAllocator&` を受け取る口までです。
