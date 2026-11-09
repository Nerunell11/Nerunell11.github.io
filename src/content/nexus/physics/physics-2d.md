2D の剛体、衝突、接触イベントを扱う物理ワールドです。形状は円・ボックス・カプセルで、静的・キネマティック・ダイナミックの剛体があります。

### 速度と接触

ダイナミック剛体の速度に重力と力を加え、線形ダンピングを掛けます。減衰係数が負にならないよう 0 で下限を設けています。

```math
v'=(v+(gs+Fm^{-1})\Delta t)\max(0,1-c\Delta t)
```

`$v$` は速度、`$g$` は重力、`$s$` は重力スケール、`$F$` は力、`$m^{-1}$` は逆質量、`$c$` はダンピング、`$\Delta t$` は時間刻みです。

```cpp
// Engine/Physics/Src/PhysicsWorld2D.cpp
                body.def.linearVelocity += (gravity * body.def.gravityScale + body.force * body.invMass) * dt;
                body.def.angularVelocity += body.torque * body.invInertia * dt;
                body.def.linearVelocity *= Max(0.0f, 1.0f - body.def.linearDamping * dt);
                body.force = Vec2::kZero;
                body.torque = 0.0f;
```

密度、摩擦、反発、トリガー、衝突カテゴリとマスクを設定でき、接触の開始・終了をイベントで受け取れます。レイキャストもあります。速度と位置の反復回数の既定値はそれぞれ 8 回と 3 回です。Sandbox の物理デモでは固定ステップで 10 回と 6 回を指定しています。
