目標への移動や周囲との間隔を保つため、2D のステアリング力と回避速度を計算します。実際に位置を動かす処理は呼び出し側に委ねます。

### 目標速度と力

Seek は目標へ、Flee は目標から離れる方向へ最高速度を向けます。現在速度との差を最大力で制限します。Arrive は目標の近くで希望速度を距離に比例して下げます。Separation は指定半径内の近傍から離れる方向を合成します。

```cpp
// Engine/AI/Src/Steering.cpp
        const f32 distance = Sqrt(distanceSq);
        f32 desiredSpeed = agent.maxSpeed;
        if (slowRadius > 0.0f && distance < slowRadius)
        {
            desiredSpeed = agent.maxSpeed * (distance / slowRadius);
        }

        return SteeringForce(toTarget * (desiredSpeed / distance), agent);
```

### 速度の回避

相互の速度障害物を使う簡易的な回避では、希望速度に加え 16 方向・4 速度の候補を採点します。衝突までの時間が予測範囲内なら早い衝突ほど大きな罰点を加え、希望速度との差も足します。最小点の速度を返します。

```math
P(v)=\lVert v-v_{\text{希望}}\rVert+\sum_{t_i<T}\frac{T}{t_i+0.001}
```

`$v$` は候補速度、`$t_i$` は近傍との衝突予測時間、`$T$` は予測範囲です。Sandbox の AI デモでは Arrive と回避速度を組み合わせています。
