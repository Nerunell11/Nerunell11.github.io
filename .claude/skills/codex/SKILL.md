---
name: codex
description: OpenAI Codex CLI に差分のレビューを依頼する(read-only)。「Codexにレビューさせて」「Codexに見てもらって」「Codexに聞いて」などの依頼、および PR を作る前に使用。Codex に実装・下書きはさせない(実装と文章は Claude が行う)。
---

# Codex へのレビュー依頼

実装・文章・検証は Claude が同じ文脈で行い、Codex には**別のモデルの目で差分を読ませる**。Codex は read-only で起動され、ファイルを書き換えない。レビューの観点と報告の形式は `AGENTS.md` にあるので、依頼文で繰り返さない。

## いつ頼むか

- **PR を作る前に 1 回。** 作業のまとまり(PR 単位)が `npm run build` を通ってから。コミットごとには頼まない。
- 省略してよいもの: 作品本文の文言だけの変更、README・CLAUDE.md などの文書だけの変更、数行の修正。
- 再レビューは、重大な指摘を受けて大きく直したときだけ 1 回。指摘が軽微なら直して終える。

## 1. 意図を書く(省略可)

差分だけでは意図が読めないときに、`out/codex/prompts/<ID>.md` へ **5 行以内**で書く(日本語可。BOM はスクリプトが足す)。

```markdown
## 意図
(何を、なぜ変えたか。1〜3 行)
## 特に見てほしい点
(リンクのパス・スキーマ変更の追従・狭い画面など、自信が無いところ。無ければ省略)
```

## 2. 実行する

```powershell
git fetch origin main
```

```powershell
./scripts/codex-task.ps1 -Review -OutFile out/codex/<ID>.md -LogFile out/codex/logs/<ID>.codex.log
```

- 比較の相手は既定で `origin/main`(worktree のローカル `main` は古いことが多いので、先に fetch する)。
- 手順 1 の意図ファイルを書いたときは `-PromptFile out/codex/prompts/<ID>.md` を足す。
- `run_in_background` で起動し、終了通知を待つ。ポーリングしない。**`-LogFile` は必ず付ける**(付ければ画面には終了コードと報告のパスしか出ない)。
- 対象は `origin/main` とのマージベースから作業ツリーまで(コミット済み + 未コミット + 未追跡)。未コミットだけなら `-Uncommitted`、別の相手なら `-Base <ref>`。
- `-Effort high` は、コンテンツのスキーマ・共通レイアウト・ビルド設定に触るときだけ。
- 利用上限・認証エラーで exit 1 になったら、レビューなしで進めてよいかをユーザーに確認する(代わりに `/code-review` を使う手もある)。

## 3. 採否を決めて直す

1. `out/codex/<ID>.md` **だけ**を読む(要約 + `[P1]`〜`[P3]` の指摘)。ログは読まない。
2. 指摘ごとに該当箇所を確かめ、採用・不採用を決める。**判定の責任は Claude にある**(採らない理由は 1 行で残す)。
3. 採用した指摘は**このセッションで**直し、`npm run build` を通す。
4. ユーザーへの報告には、指摘の件数・採用したもの・採らなかったものと理由を書く。

## 質問だけしたいとき

差分のレビューでない相談は `-Review` を外す。質問を `out/codex/prompts/<ID>.md` に自己完結で書き(Codex はこの会話を見えない)、読むべきファイルと行番号を挙げる。

```powershell
./scripts/codex-task.ps1 -PromptFile out/codex/prompts/<ID>.md -OutFile out/codex/<ID>.md -LogFile out/codex/logs/<ID>.codex.log
```
