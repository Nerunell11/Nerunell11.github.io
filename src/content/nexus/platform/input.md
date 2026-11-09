キーボードとマウスの状態を、毎フレームの「押されている」「押された瞬間」「離された瞬間」として読めるようにします。キーやボタンの割り当てを、ゲームの動作名(「ジャンプ」「前後移動」など)に置き換える層もあります。

### キーボードとマウス

`InputState` は `Window` が持ち、`window->Input()` で読みます。フレームの頭で、押された瞬間と離された瞬間のフラグ、マウスの移動量、ホイール量、文字入力の列を消します。そのあと OS のメッセージを処理するたびに、状態が書き込まれます。

読める値は次のとおりです。

- キー: `IsKeyDown`、`WasKeyPressed`、`WasKeyReleased`
- マウスのボタン(左、右、中): `IsMouseButtonDown`、`WasMouseButtonPressed`、`WasMouseButtonReleased`
- マウス: 位置、移動量、ホイールの量
- 文字入力: そのフレームに入力された文字(`CharCount`、`CharAt`)

同じ状態への設定(すでに押されているキーをもう一度押す、など)では、「押された瞬間」のフラグを立てません。

```cpp
// Engine/Platform/Src/Input.cpp
        const bool wasDown = m_keyDown[index];
        if (wasDown == isDown)
        {
            return;
        }

        m_keyDown[index] = isDown;
        if (isDown)
        {
            m_keyPressed[index] = true;
        }
```

文字入力は 1 フレームに 32 文字までで、あふれると `CharOverflowed` が立ちます。`InputState` はフレーム末の状態だけを持つので、フレーム内の順序や座標が要る用途には、`Window` の順序つきイベントキューを使います(別ページの「ウィンドウ」で扱います)。

### アクションへの割り当て

`ActionMap` は、動作の名前(`StringId`)にキーとパッドのボタンを、軸の名前にキーの組み合わせとスティックの軸を結びつけます。

- 動作: 割り当てた入力のどれかが押されていれば「押されている」。`IsPressed`、`IsHeld`、`IsReleased` で、押された瞬間、保持、離された瞬間が取れます。
- 軸: 「正のキー」と「負のキー」の組(押していれば +1 / -1)と、スティックの軸(左右・上下、左右の 4 本)を割り当てられます。複数の割り当てがあるときは、絶対値が最大のものを採用します。

`Update` は毎フレーム、キーの配列とパッドの状態を渡して呼び、割り当てごとの現在値を更新します。ゲームのコードは、キーコードではなく動作の名前だけを見ればよくなります。

### ゲームパッドの型

`GamepadState` は、14 個のボタン、左右のスティック、左右のトリガー、接続中かどうかを持つ型です。デッドゾーンの処理が静的関数で用意されています。

```math
f(x) = \operatorname{sign}(x)\,\frac{|x| - d}{1 - d} \quad (|x| > d),\qquad f(x) = 0 \quad (|x| \le d)
```

`d` はデッドゾーンの大きさです。`d` 以下は 0 にし、残りは 0〜1 に引き伸ばします。`d` が 0 以下なら値をそのまま、1 以上なら 0 を返します。

### 限界

- ゲームパッドは型だけです。XInput などから値を入れる実装はありません。ソースのコメントでも後の作業とされています。
- `ActionMap` は、Platform のテスト以外から呼ばれていません。Sandbox、Samples、Server、Editor、Tools を検索しても、使っている箇所はありません。
- `ActionMap::Update` はキーの状態を `bool` の配列で受け取りますが、`InputState` は内部の配列を公開していません。テストは配列を直接作って渡しています。
- デッドゾーンは `GamepadState::ApplyDeadzone` として用意されているだけで、`ActionMap` の中では適用していません。
- マウスの生入力(Raw Input)による相対移動は、`InputState` の範囲外とヘッダに書かれています。
