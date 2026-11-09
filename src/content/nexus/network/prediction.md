サーバ権威のゲームでは、入力が結果に反映されるのはサーバの応答が返ってからです。そのままだと操作に遅れが出ます。クライアントは自分の入力を先に適用して動きを見せ、サーバの状態が届いたら食い違いを直します。他のプレイヤーなどは、届いたスナップショットを少し遅らせて補間して表示します。

### 自分の入力: 予測と再調整

`ClientPrediction` は入力を 1 つ適用するたびに、予測した状態を進め、その入力を未確認の一覧に積みます。サーバから「入力 `k` まで処理した時点の状態」が届いたら、`Reconcile` が次のことをします。

1. 連番が `k` 以下の入力を一覧から捨てる。
2. サーバの状態を出発点にして、残った入力を順に適用し直す。

```math
s_{n} = f(\cdots f(f(s_{\text{auth}},\, i_{k+1}),\, i_{k+2}) \cdots,\, i_{n})
```

`f` は 1 ステップの更新関数、`s_auth` はサーバから届いた状態、`i` は入力です。予測が合っていれば `s_n` は再調整前の予測と同じになり、画面上の補正は出ません。更新関数 `f` はクライアントとサーバで同じものを使い、入力と状態だけで決まる純関数にする約束です。

```cpp
// Engine/Network/Src/Prediction.cpp
        // Rebuild the prediction from the authoritative state by replaying the inputs the server
        // has not yet acknowledged. If the prediction was correct, this reproduces it exactly.
        m_predicted = authoritative;
        if (m_sim != nullptr)
        {
            for (usize i = 0; i < m_pending.Size(); ++i)
            {
                m_predicted = m_sim(m_predicted, m_pending[i], m_user);
            }
        }
```

### 他者の状態: 補間

`InterpolationBuffer` は遠隔のエンティティのスナップショットをティック順に保ち、指定した描画ティックの状態を返します。描画ティックを最新データより遅らせておけば、パケットの揺れや欠けを隠せます。遅らせる量を決めるのは呼び出し側です。

描画ティック `t` を挟む 2 つのスナップショット `(t_0, a)` と `(t_1, b)` から、位置と速度を線形補間します。範囲の外では端の値を返します。

```math
\alpha = \frac{t - t_0}{t_1 - t_0},\quad \text{state} = (1-\alpha)\,a + \alpha\,b
```

```cpp
// Engine/Network/Src/Prediction.cpp
                const f32 span = t1 - t0;
                const f32 alpha = span > 0.0f ? (renderTick - t0) / span : 0.0f;
                const PredictedState& a = m_snapshots[i].state;
                const PredictedState& b = m_snapshots[i + 1].state;
                PredictedState out;
                out.position = Lerp(a.position, b.position, alpha);
                out.velocity = Lerp(a.velocity, b.velocity, alpha);
                return out;
```

### 設計判断

標準モデルは「サーバ権威 + クライアント予測」です(ADR 006)。格闘ゲーム向けのロールバック方式は将来の検討とされています。ADR 006 は、乱数や時間のような非決定の要素をシステムとして注入できるようにし、シミュレーションを固定ステップとティック番号で組む制約も定めています。再調整が成り立つには、同じ入力から同じ状態が出ることが要るからです。

### 限界

- 予測する状態は位置と速度だけの参照実装です。回転や体力などは持ちません。
- `ClientPrediction` と `InterpolationBuffer` を呼んでいるのはテストだけです。ECS のレプリケーションにも、サーバのセッションにもつながっていません。
- サーバ側は、クライアントの入力を受け取る入口(`ServerSession::OnReceiveFromClient`)が空で、ソースのコメントでも後の作業とされています。入力の送信と、`ackedSequence` をクライアントへ返す経路は未実装です。
