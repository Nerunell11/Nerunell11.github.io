聞き手と音源の位置から距離減衰とパンを計算します。残響ゾーンの選択・ブレンドと遮蔽による減衰も、副作用のない関数として用意しています。

### 距離と方向

距離減衰には線形、逆数、指数を選べます。最小距離以内は音量 1 です。線形の場合、それより外側の音量を次のように計算します。

```math
V=\operatorname{clamp}\left(\frac{d_{\max}-d}{d_{\max}-d_{\min}},0,1\right)
```

`$d$` は距離、`$d_{\min},d_{\max}$` は設定距離、`$V$` は音量です。最大距離が最小距離以下の場合は外側を 0 とします。

```cpp
// Engine/Audio/Src/Spatial3D.cpp
                if (atten.maxDistance <= minDistance)
                {
                    return 0.0f;
                }

                const f32 volume = (atten.maxDistance - distance) / (atten.maxDistance - minDistance);
                return Saturate(volume);
```

パンは音源方向と聞き手の右方向の内積から求めます。残響ゾーンは優先度を比べ、同じ優先度ならブレンド量が大きいものを選びます。

### 接続状況

結果をミキサへ渡す一般的な処理は実装途中で、残響効果もミキサにはつながっていません。Sandbox のキャラクターデモは空間音響と残響を計算し、足音にゲインを適用しています。
