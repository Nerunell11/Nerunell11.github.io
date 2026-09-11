# ポートフォリオサイト

ポートフォリオサイトのソースです。ビルド不要の静的サイト（HTML / CSS / JavaScript のみ）。

**現在このリポジトリは private です。** まだ Web サイトとしては公開されていません。
文章を埋め終わったら「公開する」の手順で public に切り替えると、`https://nerunell11.github.io/` で見られるようになります。

## ファイル構成

```
.
├─ index.html            ページ本体（文章はここを編集）
├─ css/style.css         スタイル（配色は先頭の :root で調整）
├─ js/works-data.js      作品データ ← 作品を増やすときはここ
├─ js/skills-data.js     スキルデータ ← 技術を増やすときはここ
├─ js/main.js            描画・絞り込み・スクロール演出（通常さわらない）
├─ assets/images/        作品のスクリーンショット置き場
├─ assets/favicon.svg    ファビコン
└─ .nojekyll             GitHub Pages の Jekyll 処理を無効化
```

## ローカルで確認する

`index.html` をブラウザにドラッグ＆ドロップするか、ダブルクリックするだけで確認できます。ビルドもサーバーも不要です。

## 作品を追加する

1. スクリーンショットを `assets/images/` に置く（例: `assets/images/mygame.png`）
2. `js/works-data.js` の `WORKS` 配列に1件追加する

```js
{
  id: "mygame",
  title: "My Game",
  year: "2026",
  category: "個人制作",
  role: "プログラム全般",
  tech: ["C++", "DirectX"],       // ここに書いた技術が絞り込みボタンに出る
  summary: "1〜2行の概要",
  description: "こだわった点や技術的な工夫",
  image: "assets/images/mygame.png",   // 画像が無ければ "" でOK（自動でプレースホルダ）
  links: [
    { label: "GitHub", url: "https://github.com/Nerunell11/mygame" }
  ]
}
```

3. 保存してブラウザを再読み込みすると、カードが増えます

> **注意**: 非公開（private）リポジトリの URL を `links` に入れても、他の人からは 404 に見えます。公開しているものだけ載せてください。

## スキルを編集する

`js/skills-data.js` の `SKILLS` を編集します。`level` は 1〜5 で、そのままバーの長さになります。

## 別のPCで編集する

```bash
git clone https://github.com/Nerunell11/Nerunell11.github.io.git
```

編集したら、いつも通り push します。

```bash
git add -A
git commit -m "作品を追加"
git push
```

## 公開する（初回だけ）

文章とスクリーンショットが揃ったら、private から public に切り替えて GitHub Pages を有効化します。

```bash
gh repo edit Nerunell11/Nerunell11.github.io --visibility public --accept-visibility-change-consequences
```

```bash
gh api -X POST repos/Nerunell11/Nerunell11.github.io/pages -f "source[branch]=main" -f "source[path]=/"
```

数分で `https://nerunell11.github.io/` が見られるようになります。以降は push するだけで1分ほどで反映されます。反映状況はリポジトリページの Actions / Settings → Pages から確認できます。

## 配色を変えたいとき

`css/style.css` の先頭にある `:root` の変数を書き換えると、サイト全体の色がまとめて変わります。

| 変数 | 用途 |
| --- | --- |
| `--bg` / `--bg-alt` | 背景色（セクションごとに交互） |
| `--surface` | カードの背景色 |
| `--text` / `--text-muted` | 本文 / 補足テキスト |
| `--accent` | アクセントカラー（ボタン・リンク・バー） |
