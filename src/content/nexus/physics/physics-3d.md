3D 剛体の形状には球・ボックス・カプセルがあり、静的・キネマティック・ダイナミックの種類を扱います。接触イベントとレイキャストに加え、距離・ボール・ヒンジ・固定のジョイントがあります。

### 衝突への応答

接触点では相対速度と有効質量から法線方向の衝撃量を求め、両方の剛体へ反対向きに適用します。反発係数には 2 剛体の大きい方を使います。

```math
j=-\frac{(1+e)v_n}{M_{\mathrm{eff}}^{-1}}
```

`$j$` は衝撃量、`$e$` は反発係数、`$v_n$` は接触法線方向の相対速度、分母は回転を含む有効逆質量です。

```cpp
// Engine/Physics/Src/PhysicsWorld3D.cpp
                    const f32 restitution = Max(a->def.restitution, b->def.restitution);
                    const f32 j = -(1.0f + restitution) * velAlongNormal / invMassSum;
                    const Vec3 impulse = contact.normal * j;
                    ApplyImpulseToBody(*a, -impulse, ra);
                    ApplyImpulseToBody(*b, impulse, rb);
                    contact.normalImpulse += j;
```

### 連続衝突と候補の列挙

連続衝突判定は指定した剛体で有効になり、動く球と静的な球・ボックスの組み合わせを対象とします。動くもの同士は範囲外です。AABB を 1 軸で並べて重なりを列挙する Sweep and Prune もありますが、剛体ソルバとは独立したクラスです。Sandbox の物理デモは 3D 剛体を使用します。

<figure>
  <img src="/images/works/nexus/sandbox-overlay.webp" alt="物理デモと性能パネルを表示した Sandbox" loading="lazy" />
  <figcaption>Physics demo を有効にした Sandbox。Stats に Physics3D/Cubes: 4.0 が表示されています。</figcaption>
</figure>
