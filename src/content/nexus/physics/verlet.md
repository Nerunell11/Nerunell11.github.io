現在と前回の位置から粒子の動きを求める Verlet ソルバです。粒子は逆質量を持ち、固定もできます。拘束は 2 点間の距離で、剛性を指定できます。

### 位置の積分と拘束

固定されていない粒子は、前回からの位置差を速度に相当する値として使い、重力を時間刻みの二乗で加えます。その後、距離拘束を指定回数だけ投影します。

```math
x_{n+1}=x_n+(x_n-x_{n-1})+g\Delta t^2
```

`$x_n,x_{n-1}$` は現在と前回の位置、`$g$` は重力、`$\Delta t$` は時間刻みです。

```cpp
// Engine/Physics/Src/VerletSolver.cpp
            const Vec3 velocity = particle.position - particle.prevPosition;
            particle.prevPosition = particle.position;
            particle.position += velocity + m_gravity * dtSq;
        }

        for (u32 iteration = 0; iteration < iterations; ++iteration)
        {
            for (const VerletDistanceConstraint& constraint : m_constraints)
            {
                ProjectDistanceConstraint(constraint);
            }
        }
```

拘束の補正は両粒子の逆質量と剛性に応じて配分します。Samples と Sandbox を含む他のモジュールからの利用は確認できず、テストで使用されています。
