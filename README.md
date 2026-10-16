# ポートフォリオサイト

`https://nerunell11.github.io/` のソースです。Astro で作った静的サイトで、`main` に push すると GitHub Actions がビルドして自動で公開します。

## ファイル構成

```
src/
├─ content/works/        作品 ← 1ファイル = 1作品。増やすのはここ
├─ data/
│  ├─ site.ts            名前・肩書き・About本文・GitHubリンク
│  └─ skills.ts          スキル一覧
├─ pages/
│  ├─ index.astro        トップ（Hero / About / Works / Skills / Contact）
│  └─ works/[...slug].astro  作品詳細ページ（自動生成）
├─ components/
│  ├─ ShaderHero.astro   トップのWebGLシェーダー背景
│  ├─ WorkRow.astro      作品一覧の1行
│  ├─ Header.astro / Footer.astro
├─ layouts/Base.astro    共通のhead・ヘッダー・フッター
├─ styles/global.css     配色・フォント・共通スタイル
└─ content.config.ts     作品frontmatterの定義（必須項目のチェック）

public/                  そのまま配信されるファイル
└─ images/works/         作品のスクリーンショット置き場
```

## ローカルで動かす

```bash
npm install
```

```bash
npm run dev
```

`http://localhost:4321` が開きます。ファイルを保存すると自動で反映されます。

公開されるものと同じ状態を確認したいときは `npm run build` のあと `npm run preview`。

## 作品を追加する

`src/content/works/` に Markdown を1つ置けば、**一覧カードと詳細ページの両方が自動で生成されます。** ファイル名がそのまま URL になります（`nexus.md` → `/works/nexus/`）。

```markdown
---
title: My Game
period: 2026.04 - 2026.08     # 制作期間
category: 個人開発
role: メインプログラマー        # 個人開発など、書く必要がなければこの行ごと消す
tech: ["C++", "DirectX"]      # ここに書いた技術が絞り込みボタンに出る
summary: 一覧に出る1〜2行の概要。
cover: /images/works/mygame.png   # 無ければこの行ごと消す（自動でプレースホルダ）
order: 15                      # 小さいほど上に出る
links:
  - label: GitHub
    url: https://github.com/Nerunell11/mygame
---

## 概要

ここから下は普通の Markdown です。見出し、リスト、コードブロック、画像、表が使えます。

## 技術的に取り組んだこと

実装の判断や工夫をしっかり書ける場所です。
```

書きかけを公開したくないときは frontmatter に `draft: true` を足します。`npm run dev` では見えますが、本番ビルドからは除外されます。

必須項目が抜けているとビルド時にエラーで教えてくれます（定義は `src/content.config.ts`）。

> **注意**: 非公開（private）リポジトリの URL を `links` に入れても、他の人からは 404 に見えます。公開しているものだけ載せてください。

## 画像を追加する

`public/images/works/` に置いて、Markdown からは `/images/works/ファイル名` で参照します。本文中なら `![説明](/images/works/shot1.png)` でそのまま貼れます。

## 文章・スキルを編集する

| 直したいもの | 場所 |
| --- | --- |
| 名前・肩書き・ヒーローの文章 | `src/data/site.ts` の `SITE` |
| About の本文 | `src/data/site.ts` の `ABOUT` |
| About 右側の項目（所属など） | `src/data/site.ts` の `FACTS` |
| スキル一覧 | `src/data/skills.ts` |

## 配色・フォントを変える

`src/styles/global.css` の先頭にある `:root` を書き換えると全ページに反映されます。

| 変数 | 用途 |
| --- | --- |
| `--bg` / `--bg-raise` | 背景色（セクションごとに交互） |
| `--accent` | アクセント色。ここを変えると全体の印象が変わる |
| `--text` / `--text-dim` | 本文 / 補足テキスト |
| `--f-display` / `--f-mono` | 見出し / 等幅フォント |

トップの背景はシェーダーで描いています。色や流れを変えたいときは `src/components/ShaderHero.astro` の `FRAG` を直接いじってください。WebGL が使えない環境では、その下の CSS グラデーションが見えます。

## SNS用のサムネイル

`public/og.png`（1200x630 推奨）を置いて、`src/layouts/Base.astro` の `OG_IMAGE_EXISTS` を `true` にすると、リンクを貼ったときにサムネイルが出るようになります。

## 別のPCで編集する

```bash
git clone https://github.com/Nerunell11/Nerunell11.github.io.git
cd Nerunell11.github.io
npm install
```

## 公開する

```bash
git add -A
git commit -m "作品を追加"
git push
```

push すると GitHub Actions がビルドしてデプロイします。進行状況はリポジトリの Actions タブで見られます。1〜2分で反映されます。
