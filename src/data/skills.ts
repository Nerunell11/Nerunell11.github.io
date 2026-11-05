/** スキル一覧。 */
export interface Skill {
  name: string;
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
      { name: 'C++', icon: 'cplusplus', note: 'メイン言語' },
      { name: 'C#', icon: 'csharp' },
      { name: 'HLSL', mono: 'HLSL', note: 'シェーダー' },
      { name: 'Python', icon: 'python', note: '自動化・ツール' },
    ],
  },
  {
    category: 'グラフィックス・エンジン',
    items: [
      { name: 'DirectX', mono: 'DX' },
      { name: 'Vulkan', icon: 'vulkan' },
      { name: 'Unity', icon: 'unity' },
      { name: 'Unreal Engine 5', icon: 'unrealengine' },
    ],
  },
  {
    category: 'ツール',
    items: [
      { name: 'Visual Studio', icon: 'visualstudio' },
      { name: 'Rider', icon: 'rider' },
      { name: 'Git / GitHub', icon: 'git' },
      { name: 'UVCS', mono: 'UVCS', note: 'Unity Version Control' },
      { name: 'CMake', icon: 'cmake' },
    ],
  },
];
