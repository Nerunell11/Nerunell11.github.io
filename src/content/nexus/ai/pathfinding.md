移動可能なグリッドから経路を探し、複数のエージェントが進む方向を得るための機能です。グリッド探索のほか、領域をつなぐ NavMesh と、単一のゴールへ向かうフローフィールドがあります。

### グリッドの探索

A* は縦横の移動を 1、斜め移動を約 1.414 として扱います。斜め方向の両脇のマスが通れない場合は角を横切れません。探索候補は合計費用、残りの推定費用、挿入順の順で比較します。

```math
h = \sqrt{2}\min(\Delta x,\Delta y)+\max(\Delta x,\Delta y)-\min(\Delta x,\Delta y)
```

`$h$` はゴールまでの推定費用、`$\Delta x,\Delta y$` は各軸のマス数の差です。コードの定数は平方根の近似値です。

```cpp
// Engine/AI/Src/GridPathfind.cpp
        f32 OctileDistance(GridCoord a, GridCoord b)
        {
            const i32 dx = AbsI32(a.x - b.x);
            const i32 dy = AbsI32(a.y - b.y);
            const f32 minDistance = static_cast<f32>(MinI32(dx, dy));
            const f32 maxDistance = static_cast<f32>(MaxI32(dx, dy));
            return (kDiagonalCost * minDistance) + (maxDistance - minDistance);
        }
```

### 経路の表現

NavMesh はグリッドを領域に分け、領域間のポータルをたどります。ポータルから滑らかにした経路も返します。フローフィールドはゴールを一つ決めて各マスの進行方向を持ちます。Sandbox の AI デモはグリッドの A* を呼び出します。
