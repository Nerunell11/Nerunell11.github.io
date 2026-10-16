/**
 * スキル一覧。
 *
 * level は 1〜5。そのままバーの長さになります。
 *   1 触ったことがある / 2 基本的な実装ができる / 3 一通り実装できる
 *   4 制作で問題なく使える / 5 得意分野として説明できる
 *
 * ※ 現在の level は暫定値です。実感と違うものは書き換えてください。
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
      { name: 'C++', level: 5, note: 'メイン言語' },
      { name: 'C#', level: 4 },
      { name: 'HLSL', level: 3, note: 'シェーダー' },
      { name: 'Python', level: 3, note: '自動化・ツール' },
    ],
  },
  {
    category: '開発環境',
    items: [
      { name: 'Visual Studio', level: 5 },
      { name: 'Git / GitHub', level: 4 },
      { name: 'DirectX', level: 4 },
      { name: 'Unity', level: 4 },
      { name: 'CMake', level: 4 },
      { name: 'Vulkan', level: 3 },
      { name: 'Rider', level: 3 },
    ],
  },
];
