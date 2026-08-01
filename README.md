# ポートフォリオサイト

`https://nerunell11.github.io/` で公開しているポートフォリオサイトのソースです。

ビルド不要の静的サイト（HTML / CSS / JavaScript のみ）で、`main` ブランチに push すると GitHub Pages が自動で公開内容を更新します。

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

## 公開する

```bash
git add -A
git commit -m "作品を追加"
git push
```

push から1分ほどでサイトに反映されます。反映状況は GitHub のリポジトリページの Actions / Settings → Pages から確認できます。

## 配色を変えたいとき

`css/style.css` の先頭にある `:root` の変数を書き換えると、サイト全体の色がまとめて変わります。

| 変数 | 用途 |
| --- | --- |
| `--bg` / `--bg-alt` | 背景色（セクションごとに交互） |
| `--surface` | カードの背景色 |
| `--text` / `--text-muted` | 本文 / 補足テキスト |
| `--accent` | アクセントカラー（ボタン・リンク・バー） |
