2 つのポーズをボーンごとの重みで混ぜる処理と、基準ポーズとの差分を加算する処理です。上半身だけ別のポーズにする用途向けにマスクを作る補助関数もあります。

### 差分の加算

移動は加算ポーズと基準ポーズの差を重み付きで足します。回転は基準からの差を求め、単位回転から球面補間して基礎ポーズに掛けます。スケールは基準との比を 1 から補間します。

```math
p_{\text{結果}}=p_{\text{基礎}}+t(p_{\text{加算}}-p_{\text{基準}})
```

`$p$` は各ポーズの移動、`$t$` は 0〜1 に制限した重みです。

```cpp
// Engine/Animation/Src/PoseBlend.cpp
            const Vec3 translationDelta =
                (additiveTransform.translation - referenceTransform.translation) * t;
            const Quat rotationDelta =
                Normalize(Inverse(referenceTransform.rotation) * additiveTransform.rotation);
            const Quat weightedRotationDelta = Slerp(Quat::kIdentity, rotationDelta, t);
            const Vec3 scaleDelta =
                Lerp(Vec3::kOne, SafeScaleRatio(additiveTransform.scale,
                                                referenceTransform.scale),
                     t);

            BoneTransform result;
            result.translation = baseTransform.translation + translationDelta;
            result.rotation = Normalize(baseTransform.rotation * weightedRotationDelta);
            result.scale = baseTransform.scale * scaleDelta;
```

### マスク

マスクブレンドは各ボーンの重みを使います。マスクに対応する要素がないボーンの重みは 0 です。Sandbox のキャラクターデモで上半身マスクを作り、ポーズに適用しています。
