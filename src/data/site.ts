/**
 * サイト全体で使う基本情報。
 * 名前・肩書き・紹介文・リンクを変えたいときはここだけ直せば全ページに反映されます。
 */
export const SITE = {
  name: 'Neru',
  role: 'エンジンプログラマー志望',
  description:
    'エンジンプログラマーを志望している Neru のポートフォリオ。C++ を中心に、ゲームを動かす土台そのものをつくっています。',
  lead: 'C++ を中心に、ゲームを動かす土台そのものをつくることに取り組んでいます。描画・アセット周りの仕組みを自分の手で組み立てながら、扱いやすく速い基盤を目指しています。',
  github: 'https://github.com/Nerunell11',
  githubHandle: '@Nerunell11',
  email: 'minoruiwashita28@gmail.com',
} as const;

/**
 * Contact セクションに並べるリンク。
 * 増やすときはここに足せば、カードが1枚増えます。
 */
export const CONTACTS: { label: string; value: string; href: string; external: boolean }[] = [
  {
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
  },
  {
    label: 'GitHub',
    value: SITE.githubHandle,
    href: SITE.github,
    external: true,
  },
];

/** About セクションの本文。段落ごとに配列の要素にしてください。 */
export const ABOUT: string[] = [
  '【自己紹介：エンジンプログラマーを志すようになったきっかけや、どんなことに面白さを感じているかを3〜5行で。】',
  '【現在力を入れていること（描画、アセットパイプライン、メモリ管理など）と、今後やっていきたいこと。】',
];

/** About の右側に並ぶ項目。 */
export const FACTS: { label: string; value: string; href?: string }[] = [
  { label: '所属', value: '【学校名・学科 / 所属】' },
  { label: '専門', value: 'ゲームエンジン / グラフィックス' },
  // Skills セクションの「言語」と揃えてください（片方だけ直すと食い違います）
  { label: '主な言語', value: 'C++ / C# / HLSL / Python' },
  { label: 'GitHub', value: SITE.githubHandle, href: SITE.github },
];
