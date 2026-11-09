CPU の処理時間を区間で記録するプロファイラと、フレームごとの数値を流すカウンタの 2 つです。どちらも、計測の呼び出し自体が処理を重くしないことを優先して作っています。

<figure>
  <img src="/images/works/nexus/sandbox-overlay.webp" alt="Sandbox の画面。右の Performance パネルに frame、avg、fps と、Stats 欄のカウンタが並んでいる" loading="lazy" />
  <figcaption>Sandbox の Performance パネル。frame 1.94 ms、avg 1.85 ms、540 fps。Stats 欄に Network/Entities、Network/Packets、Physics3D/Cubes が出ています。</figcaption>
</figure>

### 仕組み

CPU 側は、スレッドごとのバッファに区間 (名前、開始、終了、階層の深さ) を記録します。区間を開く・閉じる呼び出しは、そのスレッド自身のデータにしか触れず、ロックしません。グローバルなロックを取るのは、スレッドが初めて記録するときの登録と、書き出し・リセットのときだけです。

書き出しは、Chrome Tracing 形式の JSON です。`chrome://tracing` か Perfetto で開けるので、専用の閲覧ツールは要りません。書き出しとリセットは、ワーカーが止まっている間 (フレームの合間) に呼ぶ決まりです。

出荷ビルド (`NX_BUILD_SHIPPING`) では、計測用のマクロが `((void)0)` に置き換わり、計測のコードごと消えます。

```cpp
// Engine/Foundation/Include/Nexus/Foundation/Profile/Profiler.h
#if NX_BUILD_SHIPPING
    #define NX_PROFILE_SCOPE(name) ((void)0)
    #define NX_PROFILE_FUNCTION() ((void)0)
    #define NX_PROFILE_FRAME_BEGIN() ((void)0)
    #define NX_PROFILE_FRAME_END() ((void)0)
#else
    #define NX_PROFILE_SCOPE(name)                                                              \
        ::nx::ProfileScope NX_PROFILE_CONCAT(nxProfileScope_, __LINE__)(name)
```

フレームの長さは `BeginFrame` / `EndFrame` で記録し、直近のフレームの平均を取れます。フレームの長さがしきい値を超えると、そのフレームの番号を覚え、設定したコールバックを呼ぶスパイク検出もあります。

### 実装

フレームごとの数値は、別の仕組み `StatCounter` で扱います。`NX_STAT_ADD` は足し込み、`NX_STAT_SET` は上書きで、どのスレッドからも呼べます。同じ名前を使う呼び出し箇所は、1 つのカウンタを共有して集計されます。フレームの終わりに `StatsEndFrame()` を呼ぶと、値が 128 フレーム分の履歴に確定され、平均・最大・最小を取れます。

```cpp
// Engine/Foundation/Include/Nexus/Foundation/Profile/Stats.h
#define NX_STAT_COUNTER_REF(name)                                                           \
    ([]() -> ::nx::StatCounter& {                                                           \
        static ::nx::StatCounter& nxStatCounter = ::nx::FindOrCreateStatCounter(name);      \
        return nxStatCounter;                                                               \
    }())
```

呼び出し箇所ごとに、カウンタへの参照を `static` に覚えます。初回以降の探索は、1 回のロードで済みます。カウンタは自分で登録するので、事前の準備は要りません。画面の Stats 欄は、この登録されたカウンタを列挙して並べたものです。

### 設計判断

ECS のシステム別の計測には、このプロファイラを使っていません (ADR 019)。サンプルのバッファがスレッドごとに際限なく伸び、`Reset()` するまで解放されないため、数分走り続けるゲームには載せられないからです。HUD に必要なのは、直前のフレームで各システムが何ミリ秒使ったかだけで、階層のトレースではありません。そのためスケジューラは、システムごとの固定のスロットに最新のフレームの時間だけを持ちます。

### 限界

- `ExportChromeTrace` を呼んでいるのは、Foundation のテストだけです。Sandbox、Samples、Editor、Runtime からは呼ばれていません (検索して確認しました)。
- 書き出しとリセットは、ワーカーが動いていない間に呼ぶ決まりです。動いている最中の一貫した読み出しは保証しません。
