ゲーム内 UI のうち、描画に依存しない計算を担う部分です。Flexbox 風のレイアウト計算(`UiLayout`)、イージング付きの値の補間(`Tween`)、3D 座標の画面座標への変換(`WorldToScreen`)があります。画面に UI を描く部分は、このモジュールにはありません。

### UI を描く側: Dear ImGui

ゲーム内 UI の描画には Dear ImGui を使います(ADR 012)。ADR 012 は改訂で ImGui の適用範囲をインゲーム UI に広げ、自作の `Engine/UI` は新規の用途に使わない方針に変えました。ImGui の描画は、公式バックエンドを使わず、自前の RHI 上のバックエンドで行います。Sandbox のデバッグ用の画面(性能の表示、コンソール、操作パネル)も ImGui です。

C# で作ったエディタの UI フレームワーク(`Nexus.UI`)は、エディタに依存しない形を保ち、ゲーム内 UI にも使えるようにしてあります。ただしゲーム内 UI を ImGui から移すかどうかは、エディタの移行が終わってから別に決める、とされています(ADR 037 の決定 7)。

### レイアウト

`UiLayout` はノードの木を持ち、ルートの矩形を渡すと、全ノードの矩形を計算します。ノードの設定は、並べる向き(行か列)、幅や高さの固定値、余白(`padding`)、すき間(`gap`)、余りを分け合う割合(`flexGrow`)、交差方向の揃え(`align`)、並べる方向の寄せ(`justify`)です。

並べる方向の長さは、次のように決まります。固定値のあるノードと、内容から大きさが決まるノードは、その大きさを使います。`flexGrow` を持つノードは、残りを割合で分けます。

```math
r = \max\!\left(0,\ A - \sum_i m_i - g\,(n-1)\right),\qquad
m_{\text{grow},\,i} = r \cdot \frac{w_i}{\sum_j w_j}
```

`A` は余白を除いた並べる方向の長さ、`m_i` は固定または内容で決まるノードの長さ、`g` はすき間、`n` は子の数、`w` は `flexGrow` です。`flexGrow` を持つ子が 1 つでもあれば、残りは使い切るので、`justify` による寄せは働きません。

```cpp
// Engine/Runtime/Src/UiLayout.cpp
            if (node.flexGrow > 0.0f && totalGrow > 0.0f)
            {
                return remainingMain * (node.flexGrow / totalGrow);
            }

            return MainFromSize(MeasureContentSize(nodes, index), parentDirection);
```

### 補間と座標変換

`Tween` は開始値、終了値、長さを渡して始め、`Update(dt)` で進めます。曲線(`Curve<f32>`)を渡せばイージングが効き、渡さなければ線形です。

```math
v = (1-e)\,v_0 + e\,v_1,\qquad e = \begin{cases} t/T & \text{(曲線なし)} \\ \mathrm{curve}(t/T) & \text{(曲線あり)} \end{cases}
```

`t` は経過時間、`T` は長さです。

`WorldToScreen` は、ワールド座標に view-projection 行列を掛け、`w` が 0 以下(カメラの後ろ)なら失敗を返します。成功すると、正規化デバイス座標から画面のピクセルに直します。Y は上下を反転します。

```cpp
// Engine/Runtime/Src/UiAnim.cpp
        const f32 invW = 1.0f / clip.w;
        const f32 ndcX = clip.x * invW;
        const f32 ndcY = clip.y * invW;

        outScreen.x = ((ndcX * 0.5f) + 0.5f) * screenSize.x;
        outScreen.y = (1.0f - ((ndcY * 0.5f) + 0.5f)) * screenSize.y;
```

### 限界

- `UiLayout` と `WorldToScreen` は、Runtime のテスト以外から呼ばれていません。Sandbox、Samples、Server、Editor、Tools を検索しても、使っている箇所はありません。
- `Tween` を使っているのは、Sandbox の画面遷移のデモ(`FrontendDemo`)だけです。
- 文字の描画、ウィジェット、入力の処理はここにはありません。
