通常のメッシュは Forward+ の PBR で描きます。バインドレスのリソースと Reversed-Z を使います。同じメッシュを大量に並べるときは、カリングなしで 1 回の描画にまとめる専用の入口があります (ADR 019)。

トゥーンは別のレンダラで、陰影を段階に切るか、1 次元のランプテクスチャを引くかをマテリアルごとに選びます。輪郭線は、裏面を法線方向に膨らませてもう一度描く方式です。深度を通常のメッシュと共有するので、両者が正しく前後関係を持ちます。

### 仕組み

#### PBR メッシュ (`MeshRenderer`)

ライティングは、1 つの平行光源 (太陽)、点光源のリスト、環境マップです。太陽にはカスケードシャドウマップ (1〜4 枚のカスケード) が付きます。点光源は、コンピュートシェーダ `ClusterAssign` で画面をクラスタに分け、各クラスタに効くライトの番号の一覧を作ります。ピクセルシェーダは、自分のクラスタの一覧だけを回します。クラスタの切り方は、深度方向が対数スライスです。

BRDF は Disney の principled BRDF で、メタリック、ラフネス、異方性、サブサーフェス、光沢の縁 (sheen)、クリアコートのパラメータを持ちます。主なスペキュラは異方性の GGX (GTR2) です。

```math
D = \frac{1}{\pi\,a_x a_y\left(\left(\frac{\mathbf{h}\cdot\mathbf{x}}{a_x}\right)^2 + \left(\frac{\mathbf{h}\cdot\mathbf{y}}{a_y}\right)^2 + (\mathbf{n}\cdot\mathbf{h})^2\right)^2}
```

`$a_x, a_y$` は、`roughness²` を異方性で縦横に振り分けた値です。`$\mathbf{h}$` はハーフベクトル、`$\mathbf{x}, \mathbf{y}$` は接線と従接線、`$\mathbf{n}$` は法線です。

大量に同じメッシュを並べるときは、`DrawInstancedBatch(mesh, models, count)` に、メッシュごとにまとめた連続した行列配列を渡します。`DrawItem` の列と並べ替えを経由せず、1 回の `DrawIndexed` で提出します。

#### トゥーン (`ToonRenderer`)

陰影の値は、ハーフランバートです。

```math
d = \text{saturate}(0.5\,(\mathbf{n}\cdot\mathbf{l}) + 0.5)
```

`kSteps` モードは、`$d$` を `$s$` 段 (`$s\ge 2$`) に切ります。

```math
b = \text{saturate}\!\left(\frac{\lfloor d\,s\rfloor}{s-1}\right),\qquad
\text{lit} = \text{lerp}(\text{shadowColor},\ 1,\ b)
```

`kRamp` モードでは、`$(d, 0.5)$` でランプテクスチャを引きます。最終の色は、次の式です。

```math
\text{color} = \text{base}\cdot(\text{lit}\cdot\text{lightColor}/\pi + 0.12) + 0.25\,[\ (\mathbf{n}\cdot\mathbf{h})^{48} \ge 0.5\ ]
```

ライトの色を `$\pi$` で割るのは、PBR 側が BRDF で `$\pi$` で割っているので、トゥーンの面を同じ露出の範囲に置くためです。`$0.12$` は環境光の定数です。最後の項は、2 値のスペキュラのハイライトです。

輪郭線は、同じメッシュをもう一度、表面を前面カリング、頂点を法線方向に膨らませて描きます。膨らませる量はマテリアルの輪郭の幅 (ワールド単位) です。裏面だけが残り、輪郭になります。

### 実装

段階への量子化です。

```hlsl
// Shaders/MeshToon.hlsl
float3 QuantizeToonBand(float d, float3 shadowColor, float stepCount)
{
    const float steps = max(stepCount, 2.0);
    const float band = saturate(floor(d * steps) / (steps - 1.0));
    return lerp(shadowColor, float3(1.0, 1.0, 1.0), band);
}
```

輪郭線の頂点シェーダです。

```hlsl
// Shaders/MeshToonOutline.hlsl
    const float4 outlineColor = LoadOutlineColor(matBuf);
    const float3 normalWS = normalize(mul(input.normal, (float3x3)gPush.model));
    float4 world = mul(float4(input.position, 1.0), gPush.model);
    world.xyz += normalWS * outlineColor.w;
```

`ToonRenderer::End` は、輪郭のパス、トゥーンのパスの順に、キューした描画をすべて記録します。呼び出しは `MeshRenderer::End` のあと、同じレンダリングパスの中です。深度アタッチメントが `MeshRenderer` と同じなので、PBR の物体と深度テストが合います。

<figure>
  <img src="/images/works/nexus/sandbox-overlay.webp" alt="Sandbox の画面。奥に黒い輪郭線付きのトゥーンの物体が 2 つ、手前に金色の PBR の球と青緑の箱があり、地面に影が落ちている" loading="lazy" />
  <figcaption>Sandbox。奥が輪郭線付きのトゥーン、手前が金色の PBR の球と青緑の箱です。</figcaption>
</figure>

### 設計判断

- **速い経路は、既存の API を作り変えず別の入口にする。** `MeshRenderer::Draw` はそのまま残し、`DrawInstancedBatch` を足しました。1 件ずつ扱う用途では、`Draw` が正しく読みやすいからです。ADR 019 では、`Draw` が 1 インスタンスにつき 168 バイトの `DrawItem` を積み、同一メッシュを連続させる並べ替えが最悪 O(n²) だったことが理由として挙がっています。
- **バッチにカリングを持たせない。** 数万インスタンスのバッチは、画面に入っているかいないかのどちらかです。粗いカリングは呼ぶ側の責務です。
- **トゥーンは別のレンダラ。** PBR のシェーダに分岐を足さず、専用のパイプラインとシェーダを持ちます。深度だけを共有します。
- **輪郭は反転した殻。** 画像処理の輪郭抽出ではなく、ジオメトリを膨らませる方式です。幅はワールド単位なので、遠くでは細くなります。

### 限界

- `DrawInstancedBatch` に透過マテリアルとスキンメッシュは渡せません。透過は前後の並べ替えが壊れ、スキンはインスタンスごとのボーンブロックがないためです。黙って捨てずに、一度だけ警告して無視します。
- バッチは、シャドウ、深度プリパス、速度パスに参加しません (ヘッダの記述)。
- 輪郭の幅は、ワールド単位です。画面上の太さを一定に保つ処理はありません。
