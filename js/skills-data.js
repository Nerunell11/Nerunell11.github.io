/*
 * スキルデータ
 * ------------------------------------------------------------------
 * level は 1〜5 で指定します（バーの長さになります）。
 *   1: 触ったことがある   2: 基本的な実装ができる   3: 一通り実装できる
 *   4: 業務・制作で問題なく使える   5: 得意分野として説明できる
 *
 * note には補足を短く書けます（不要なら "" にしてください）。
 * カテゴリごと不要になったら、そのブロックを丸ごと削除して構いません。
 */

const SKILLS = [
  {
    category: "言語",
    items: [
      { name: "C++",        level: 4, note: "ゲーム制作のメイン言語" },
      { name: "C#",         level: 3, note: "" },
      { name: "Python",     level: 3, note: "自動化・ツール作成" },
      { name: "TypeScript", level: 2, note: "" }
    ]
  },
  {
    category: "エンジン / ライブラリ",
    items: [
      { name: "DirectX",    level: 3, note: "" },
      { name: "Unity",      level: 2, note: "" },
      { name: "Node.js",    level: 2, note: "" },
      { name: "Playwright", level: 2, note: "E2Eテスト" }
    ]
  },
  {
    category: "ツール / 環境",
    items: [
      { name: "Git / GitHub",   level: 4, note: "" },
      { name: "Visual Studio",  level: 4, note: "" },
      { name: "VS Code",        level: 3, note: "" }
    ]
  }
];
