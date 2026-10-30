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
];

/**
 * About の本文の下に置く写真。
 * 不要になったら null にすれば、写真ごと消えます。
 */
export const ABOUT_PHOTO: { src: string; alt: string } | null = {
  src: '/images/about-sailing.webp',
  alt: '強風の中、ヨットで走っているところ',
};

/** About の右側に並ぶ項目。 */
export const FACTS: { label: string; value: string; href?: string }[] = [
  { label: '所属', value: 'HAL東京 ゲーム制作コース' },
  { label: '関心領域', value: 'ゲームプログラム全般（特に基盤・ツール）' },
  // Skills セクションの「言語」と揃えてください（片方だけ直すと食い違います）
  { label: '主な言語', value: 'C++ / C# / HLSL / Python' },
  { label: 'GitHub', value: SITE.githubHandle, href: SITE.github },
];

/** 資格・実績。上から順に表示されます。 */
export const ACHIEVEMENTS: { kind: string; title: string; when?: string; note?: string }[] = [
  { kind: '資格', title: '基本情報技術者試験 合格' },
  { kind: '受賞', title: '進級制作展（HAL EVENT WEEK）独創力賞', when: '1年次' },
  { kind: '受賞', title: '進級制作展（HAL EVENT WEEK）ビジュアル賞', when: '2年次' },
  { kind: 'インターン', title: 'ゲーム会社のインターンシップに参加', note: 'NDA のため社名は非公開' },
];
