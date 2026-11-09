カメラの動きやフェード、効果音の合図のような、時間に沿って決まっている演出を扱います。ゲームの外で作った動画(FMV)を再生する部品もあります。

### タイムライン

`CinematicTimeline` は、1 本の時間軸の上に次の 3 つを並べます。

- カメラの軌道: 位置のカーブ(`Curve<Vec3>`)と、回転のキー(時刻と四元数の列)。
- フェード: 透明度のカーブ。
- イベント: 時刻と ID の組。

状態は停止、再生中、一時停止、終了の 4 つで、`Play`、`Pause`、`Stop`、`Seek` で操作します。毎フレーム `Update(dt, 出力, 発火したイベントの一覧)` を呼ぶと、時刻を進めて、その時刻のカメラ位置、回転、フェードの値と、今回発火したイベントの ID を返します。長さを指定し、ループの有無も選べます。

回転は、隣り合う 2 つのキーの間を、正規化した線形補間(nlerp)でつなぎます。2 つの四元数の内積が負なら片方の符号を反転して、近い向きへ回します。キーの範囲の外では端の値を返します。

```math
q(t) = \operatorname{normalize}\bigl(a + (b' - a)\,u\bigr),\quad
b' = \begin{cases} -b & a \cdot b < 0 \\ b & \text{otherwise} \end{cases},\quad
u = \operatorname{saturate}\!\left(\frac{t - t_a}{t_b - t_a}\right)
```

`a`、`b` は前後のキーの回転、`t_a`、`t_b` はその時刻です。

イベントは、前回の時刻を除き今回の時刻を含む区間 `(t_prev, t_now]` にあるものを発火します。ループで先頭に戻った直後の区間だけは、始点(時刻 0)も含めます。

```cpp
// Engine/Runtime/Src/CinematicTimeline.cpp
        for (const CineEventKey& event : m_events)
        {
            if (event.time > end)
            {
                break;
            }

            if (event.time < start)
            {
                continue;
            }

            if (!includeStart && event.time == start)
            {
                continue;
            }

            outFired.Push(event.id);
        }
```

ループ再生で 1 フレームが終端をまたぐときは、終端までの区間と、先頭からの区間を続けて処理します。終端ちょうどのイベントは終端側の区間で、時刻 0 のイベントは先頭側の区間で、それぞれ 1 回発火します。

### `Sequencer`

時刻ごとにイベントの ID を返すだけの、より小さな部品です。カメラやフェードは持ちません。再生、一時停止、停止、シーク、ループは `CinematicTimeline` と同じ形です。

### FMV

動画は独自のコンテナ形式 NXV で持ちます。ヘッダ(20 バイト)に、幅、高さ、fps、音声のチャンネル数とサンプルレート、フレーム数が入り、続くフレームの索引(1 フレーム 29 バイト)が、映像と音声の位置とサイズ、時刻(ミリ秒)、キーフレームかどうかを持ちます。`NxvWriter` が書き、`ParseNxv` が読みます。

`FmvPlayer` は、時刻に対して「時刻が現在以下の最後のフレーム」を選び、`IVideoDecoder::DecodeFrame` にそのフレームの映像パケットを渡します。動画の長さは、最後のフレームの時刻に 1 フレーム分(`1000 / fps` ミリ秒)を足したものです。

### 限界

- `IVideoDecoder` はインターフェースだけで、実装はテストの中にしかありません。実際の動画をデコードして画面に出す処理は未実装です。
- `CinematicTimeline`、`Sequencer`、`FmvPlayer` は、Runtime のテスト以外から呼ばれていません。Sandbox、Samples、Server、Editor、Tools を検索しても使用箇所はありません。
- 時刻 0 のイベントは、最初の再生では発火せず、ループで先頭に戻ったときから発火します(最初の更新の区間は、始点を含めないためです)。
- カメラの軌道は位置と回転の 2 つだけです。回転はキーの間を nlerp でつなぐので、角度が大きく離れたキーの間では、動きの速さが一定になりません。
