---
name: codex
description: 単一のタスクをOpenAI Codex CLIワーカーに委譲する。「Codexにやらせて」「Codexで実装して」「Codexに調査させて」などの依頼や、作品本文の下書き・リポジトリ調査・機械的な編集で使う。
---

# Codex へのタスク委譲

Codex CLI (`codex exec`) を非対話モードで起動し、1つのタスクを実行させる。
Claude は発注者兼レビュアーとして、プロンプト作成と結果の検証に責任を持つ。

## 何を Codex に回すか

- 他リポジトリ(`C:\dev\C++\Nexus` など)を読んで作品本文の材料を集める調査 → `-Sandbox read-only`
- `src/content/works/*.md` の本文下書き、パスと変更内容が確定した機械的な編集 → `-Effort low`
- Claude が自分でやるのは、ユーザーとの方針決め・文章の最終判断・diff レビューだけ

## 手順

1. **プロンプトを自己完結にする。** Codex はこの会話を見えない。対象ファイルのパス、期待する変更、制約を全部書く。
   **探索させない。** Codex の消費は「ターン数 × 文脈の大きさ」で決まる。読むべきファイル・節・行を指定し、全体を読ませない。
   - 本文は日本語。frontmatter のスキーマは `src/content.config.ts`
   - 検証は `npm run build` の末尾数行だけ見させる(全文ログを出させない)
2. **委譲を実行する。** 長そうなら `run_in_background` で起動する。

   ```powershell
   ./scripts/codex-task.ps1 -Prompt "<自己完結の指示>" -OutFile out/codex/task.md
   ./scripts/codex-task.ps1 -Prompt "<機械的な編集>" -Effort low -OutFile out/codex/task.md
   ./scripts/codex-task.ps1 -Prompt "<調査>" -Sandbox read-only -OutFile out/codex/answer.md
   ```

   - Windows の codex はサンドボックスが効かないため、書き込みタスクの既定は `danger-full-access`。範囲を厳密に指示し、終了後に必ず `git diff` を見る。
3. **結果を検証する。** `-OutFile` を読み、`git diff` を確認し、`npm run build` が通ることを確かめる。
4. **報告では Codex の成果と Claude の修正を区別する。**

## Claude 側の節約ルール

- ブラウザのスクリーンショットは見た目を変えたときだけ。文言変更は build と curl で足りる
- 長い README / ADR を Claude が直接読まない。必要な節だけ Codex に要約させる
- ユーザーへの報告は短く。変えたこと・確認したこと・残りだけ
