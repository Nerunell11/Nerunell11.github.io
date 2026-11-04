# ポートフォリオサイト

Astro 製の静的サイト。`main` への push で GitHub Pages に自動公開される。構成と作品の足し方は `README.md` (必要な節だけ読む)。

## 作業の分担 (トークン節約)

メイン (Opus) は方針決め・文章とデザインの最終判断・diff レビューに集中し、それ以外は下に回す。

| 作業 | 回し先 |
| --- | --- |
| 所在探し、他リポジトリから作品の材料集め | `scout` (Haiku)。組み込みの Explore より優先 |
| `npm run build` / `npm run check` | `build-runner` (Haiku)。ログをメインに流さない |
| 作品本文の下書き、機械的な編集、調査 | Codex。`codex-runner` (Haiku) 経由で呼ぶ。手順は `.claude/skills/codex/SKILL.md` |
| Codex が使えないときの本文下書き | `writer` (Sonnet) |
| Codex が使えないときの実装 | `implementer` (Sonnet) |

- 名前を指定しないサブエージェントは Sonnet で動く (`.claude/settings.json`)。
- 下に回すときは、読むべきファイル・節と期待する結果を指示書に書き切る。広く探索させない。
- スクリーンショットは見た目を変えたときだけ。文言変更は build と `dist/` の grep で確かめる。
- ユーザーへの報告は短く: 変えたこと・確認したこと・残り。
