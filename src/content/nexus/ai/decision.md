行動の選択には、ビヘイビアツリー、階層型ステートマシン、ユーティリティ AI を用意しています。いずれも値の共有に Blackboard を使います。

### 点数による選択

ユーティリティ AI は行動の重みに、その行動に登録した各評価値を掛けます。評価曲線には線形、べき乗、逆数型、ロジスティックがあり、結果は 0〜1 に収めます。

```math
S_a = w_a \prod_{i \in a} C_i(x_i)
```

`$S_a$` は行動の点数、`$w_a$` は重み、`$C_i(x_i)$` は入力に対する評価値です。最大点を選び、同点なら先に登録した行動を残します。

```cpp
// Engine/AI/Src/UtilityAi.cpp
        f32 score = m_actions[actionIndex].weight;
        for (usize i = 0; i < m_considerations.Size(); ++i)
        {
            const Consideration& c = m_considerations[i];
            if (c.actionIndex != actionIndex)
            {
                continue;
            }
            const f32 x = c.input != nullptr ? c.input(bb, c.user) : 0.0f;
            score *= EvaluateUtilityCurve(c.curve, x);
        }
        return score;
```

### 他の選択方法

ビヘイビアツリーにはシーケンス、セレクタ、並列、反転、タスクがあります。階層型ステートマシンは状態を階層で扱います。Sandbox の AI デモではツリーとユーティリティ AI を使用しています。
