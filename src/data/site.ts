/**
 * サイト全体で使う基本情報。
 * 名前・肩書き・紹介文・リンクを変えたいときはここだけ直せば全ページに反映されます。
 */
export const SITE = {
  name: 'Neru',
  role: 'ゲームプログラマー志望',
  description:
    'ゲームプログラマーを志望している Neru のポートフォリオ。C++ を中心に、ゲームを動かす土台そのものをつくっています。',
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
  '小学1年から高校卒業までヨットを続けていました。その12年間、ゲームはずっと息抜きで、ときには人と話すきっかけにもなっていました。何かを続けるとき、支えになるものは確かにあります。人の生きがいになるものを作りたい、そのお手伝いをしたいというのが根底にあります。',
  'だから土台のほうに手が伸びています。どれだけ良い体験を設計しても、処理が間に合わなければその瞬間は壊れてしまいます。作り手が「作ること」に集中できる状態を増やしたくて、エンジンの中身や、開発を支える道具のほうに時間を使ってきました。やりたいのはゲームを面白くするためのプログラムなので、分野は絞らず広く触っていきたいと思っています。',
  '作るときに決めているのは、「気をつける」で解決しないことです。人が注意し続けることを前提にした仕組みは、規模が大きくなれば必ず破綻します。間違いが起きない形にするか、起きたときに必ず気づく形にするか。そのどちらかに落とすところまでを設計だと考えています。',
];

/** About の右側に並ぶ項目。 */
export const FACTS: { label: string; value: string; href?: string }[] = [
  { label: '所属', value: 'HAL東京 ゲーム制作コース' },
  { label: '専門', value: 'ゲームエンジン / グラフィックス' },
  // Skills セクションの「言語」と揃えてください（片方だけ直すと食い違います）
  { label: '主な言語', value: 'C++ / C# / HLSL / Python' },
  { label: 'GitHub', value: SITE.githubHandle, href: SITE.github },
];
