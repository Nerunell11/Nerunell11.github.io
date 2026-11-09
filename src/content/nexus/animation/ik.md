2 本の骨で手足を目標へ伸ばす 2 ボーン IK と、関節列を反復して目標に寄せる FABRIK を用意しています。2 ボーン IK は回転補正と到達可能かどうかを返します。

### 2 ボーン IK

根元から目標までの距離を 2 本の骨が届く範囲に制限し、中間関節を曲げる方向に配置します。距離が十分に大きい場合、投影距離と高さは次の式です。

```math
x=\operatorname{clamp}\left(\frac{L_1^2+d^2-L_2^2}{2d},-L_1,L_1\right),\quad h=\sqrt{\max(L_1^2-x^2,0)}
```

`$L_1,L_2$` は骨の長さ、`$d$` は制限した目標距離、`$x$` と `$h$` は投影距離と高さです。

```cpp
// Engine/Animation/Src/TwoBoneIk.cpp
            const f32 upperSq = upperLength * upperLength;
            const f32 lowerSq = lowerLength * lowerLength;
            const f32 solveSq = solveDistance * solveDistance;
            const f32 projectedDistance =
                Clamp((upperSq + solveSq - lowerSq) / (2.0f * solveDistance),
                      -upperLength, upperLength);
            const f32 heightSq = Max(upperSq - (projectedDistance * projectedDistance),
                                     0.0f);
            desiredMid = root + (targetDir * projectedDistance) +
                         (bendDir * Sqrt(heightSq));
```

### 関節列の反復

FABRIK は先端を目標に置いて根元側へ距離を保って戻し、根元を固定して先端側へ進めます。反復回数と許容誤差を指定できます。届かない目標には関節列を伸ばします。Sandbox ではワールド空間の回転補正をローカルポーズへ適用します。
