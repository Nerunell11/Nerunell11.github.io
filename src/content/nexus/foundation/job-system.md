ECS のチャンク並列、アセットのロード、物理のアイランド並列を載せるための、ワークスティーリング方式のジョブシステムです。スレッドの基礎部品と一緒に、Foundation に置いています。

### 仕組み

ワーカーごとにキューを持ち、投入されたジョブはワーカーのキューへ分配されます。ワーカーは自分のキューの末尾から取り出し (キャッシュに載っているうちに使うため)、空いたワーカーは、他のキューの先頭から仕事を盗みます。グローバルなキューは使いません。

待つ側も遊びません。`Wait` は、完了するまでの間、まずキューにある仕事を実行し、仕事がなくなって初めて眠ります。そのため、ジョブの中から別のジョブを投入して待っても、デッドロックしません。

```cpp
// Engine/Foundation/Src/Jobs/JobSystem.cpp
while (state->status.Load(MemoryOrder::kSeqCst) == pending)
{
    // Help first: executing a queued job is always better than blocking on it.
    if (ExecuteOne())
    {
        continue;
    }

    ParkUntilJobCompletes([state, pending]() {
        return state->status.Load(MemoryOrder::kSeqCst) != pending;
    });
}
```

`ParallelFor(count, grainSize, fn)` は、`count` 個の要素を `grainSize` 個ずつのチャンクに割り、チャンクごとにジョブを投入して、全部を待ちます。チャンクの数は次のとおりです。

```math
n_{\text{chunk}} = \left\lceil \frac{\text{count}}{\text{grainSize}} \right\rceil
```

粒度が小さすぎるとジョブの投入と完了の処理が重くなり、大きすぎるとワーカーに仕事が行き渡りません。粒度は呼び出し側が指定します。

### 実装

ジョブは `Submit` で投入し、`JobHandle` を返します。依存するジョブのハンドルを渡すこともできます。呼び出し可能なオブジェクトは `nx::Function` に入れます。小さなラムダは確保なしで持てるので、投入の経路で確保が起きにくくなります。

ジョブの状態は使い回します。ハンドルは、状態へのポインタと世代番号を持ちます。完了したかどうかと世代を、1 本の atomic にまとめています。

```math
\text{status} = (\text{generation} \ll 1) \mid \text{completedBit}
```

待っているジョブが終わったのか、状態が再利用されて別のジョブのものになったのかを、1 回のロードで決められます。解放時は `(generation + 1) << 1` を 1 回のストアで書き込み、世代を上げることと完了ビットを落とすことを同時に行います。

```cpp
// Engine/Foundation/Src/Jobs/JobSystem.cpp
const u64 generation = state->status.Load(MemoryOrder::kAcquire) >> 1;
// ...
state->status.Store((generation + 1) << 1, MemoryOrder::kSeqCst);
```

### 実測

粒度による違いを測る `NexusJobBench` の結果です。120,000 要素の ParallelFor を 10 回測りました。要素ごとの処理は、4x4 の変換行列を作る数十ナノ秒の計算です。動かした環境は Ryzen 7 9800X3D、16 スレッドで、ワーカーは 15 本です。単位は ms です。出力のうち、各行の下にある `runs:` の行 (10 回の生の値) は省略しています。

```text
system timer resolution: current 0.5000 ms (coarsest 15.6250, finest 0.5000)
hardware_concurrency: 16
count: 120000, reps: 10

[single-threaded] min 2.29  median 2.30  max 2.37 ms

JobSystem workers: 15

grain      chunks     min      median   max     
128        938        0.27     0.55     1.09    
256        469        0.27     0.39     0.58    
512        235        0.25     0.34     0.61    
1024       118        0.27     0.35     0.45    
2048       59         0.28     0.31     0.44    
8192       15         0.25     0.45     0.48    
60000      2          1.29     1.32     1.56    
...
checksum: -1.523859
```

直列で 2.30 ms の仕事が、粒度 2048 では中央値 0.31 ms になりました。粒度 128 (チャンク 938 個) では中央値 0.55 ms、粒度 60000 (チャンク 2 個) では 1.32 ms で、どちらも 2048 より遅くなりました。

### 設計判断

- **ジョブシステムは Foundation に置く (ADR 008)**: 最初、スレッドの部品は Platform にありました。ジョブを Foundation の非同期ファイル I/O が使うと、Platform と Foundation が循環するので、スレッドの部品ごと Foundation に移しました。
- **状態を回収せず、再利用する (ADR 021)**: 初期の実装は、投入したジョブの状態を解放していませんでした。NexusDefense で毎秒 245 MB ずつメモリが増えて気づきました。ハンドルは古いポインタを持ったまま完了後も `Wait` できるので、状態は破棄せず、世代番号で意味だけを直します。メモリは、同時に生きているジョブ数の最大値までしか伸びません。
- **参照カウントは採らない**: ハンドルは値でコピーされるため、カウントの増減がそのままホットパスの atomic 操作になります。世代番号なら、ハンドルの複製は無料です。
- **空きリストをワーカーごとに分ける**: 最初は 1 本のミューテックスで実装しましたが、計測で否定されました。`Submit` が毎回取るロックに集中し、ECS の処理だけが一貫して遅くなったためです (800,000 体で 15.64 ms から 17.49 ms)。バケットに分けると 14.62 ms になり、メモリを解放しなかった元の版より速くなりました。バケット数は `workerCount + 1` で、最後の 1 本は、ワーカーでないスレッド (メインスレッド) 用です。

### 限界

- `ParallelFor` は、呼び出しごとにチャンク数ぶんのハンドルの配列をヒープに確保します。ADR 021 が「次に測る候補」として残している点です。同じ確保は、`World::ForEachChunkParallel` にもあります。
- ADR 021 は、ロックフリーのスタックを却下しています。バケット分割で計測上の問題が消えたため、複雑さを買う理由がないという判断です。
