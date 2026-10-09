/**
 * スキル一覧。
 * level は 1〜5。そのままバーの長さになります。
 *   1 触ったことがある / 2 基本的な実装ができる / 3 一通り実装できる
 *   4 制作で問題なく使える / 5 得意分野として説明できる
 */
export interface Skill {
  name: string;
  level: number;
  note?: string;
}

export interface SkillGroup {
  category: string;
  items: Skill[];
}

export const SKILLS: SkillGroup[] = [
  {
    category: '言語',
    items: [
      { name: 'C++', level: 4, note: 'メイン言語' },
      { name: 'C#', level: 3 },
      { name: 'Python', level: 3, note: '自動化・ツール' },
      { name: 'TypeScript', level: 2 },
    ],
  },
  {
    category: 'グラフィックス / エンジン',
    items: [
      { name: 'DirectX', level: 3 },
      { name: 'HLSL', level: 3, note: 'シェーダー' },
      { name: 'Unity', level: 2 },
      { name: 'WebGL / GLSL', level: 2 },
    ],
  },
  {
    category: 'ツール / 環境',
    items: [
      { name: 'Git / GitHub', level: 4 },
      { name: 'Visual Studio', level: 4 },
      { name: 'CMake', level: 2 },
      { name: 'Playwright', level: 2, note: 'E2Eテスト' },
    ],
  },
];
