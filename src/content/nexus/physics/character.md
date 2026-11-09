球形のキャラクターを AABB（軸に沿った境界箱）の集まりに対して動かし、位置、速度、接地状態を返します。衝突相手は呼び出し側が渡します。

### 衝突の解消

移動後の球について、最も深い侵入を選び、法線方向へ押し戻します。面に向かう速度成分も除き、残る侵入があれば指定回数まで繰り返します。法線の Y 成分が 0.7 以上なら接地とします。

```math
p'=p+nd,\qquad v'=v-n\min(v\cdot n,0)
```

`$p,v$` は位置と速度、`$n$` は接触法線、`$d$` は侵入深さです。

```cpp
// Engine/Physics/Src/CharacterController.cpp
            result.position += deepest.normal * deepest.depth;

            const f32 velocityIntoSurface = Dot(result.velocity, deepest.normal);
            if (velocityIntoSurface < 0.0f)
            {
                result.velocity -= deepest.normal * velocityIntoSurface;
            }
```

物理ワールドとはつながっていません。Samples と Sandbox を含むエンジンの他のモジュールからの呼び出しは確認できず、テストで使用されています。
