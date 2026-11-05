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
  /** src/icons/skills/ のファイル名（拡張子なし） */
  icon?: string;
  /** 公式アイコンが無いものは短い文字で代用する */
  mono?: string;
}

export interface SkillGroup {
  category: string;
  items: Skill[];
}

export const SKILLS: SkillGroup[] = [
  {
    category: '言語',
    items: [
      { name: 'C++', icon: 'cplusplus', level: 5, note: 'メイン言語' },
      { name: 'C#', icon: 'csharp', level: 4 },
      { name: 'HLSL', mono: 'HLSL', level: 3, note: 'シェーダー' },
      { name: 'Python', icon: 'python', level: 3, note: '自動化・ツール' },
    ],
  },
  {
    category: 'グラフィックス・エンジン',
    items: [
      { name: 'DirectX', mono: 'DX', level: 4 },
      { name: 'Vulkan', icon: 'vulkan', level: 3 },
      { name: 'Unity', icon: 'unity', level: 4 },
      { name: 'Unreal Engine 5', icon: 'unrealengine', level: 3 },
    ],
  },
  {
    category: 'ツール',
    items: [
      { name: 'Visual Studio', icon: 'visualstudio', level: 5 },
      { name: 'Rider', icon: 'rider', level: 3 },
      { name: 'Git / GitHub', icon: 'git', level: 4 },
      { name: 'UVCS', mono: 'UVCS', level: 3, note: 'Unity Version Control' },
      { name: 'CMake', icon: 'cmake', level: 4 },
    ],
  },
];
