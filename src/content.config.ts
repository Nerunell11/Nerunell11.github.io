import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 作品コレクション
 * ------------------------------------------------------------------
 * src/content/works/ に Markdown を1ファイル置くと、1作品として
 * トップの一覧と /works/<ファイル名>/ の詳細ページが自動で生成されます。
 *
 * frontmatter の項目はここで定義している通りで、必須のものが欠けていると
 * ビルド時にエラーで教えてくれます。
 */
const works = defineCollection({
  loader: glob({ base: './src/content/works', pattern: '**/*.md' }),
  schema: z.object({
    /** 作品名 */
    title: z.string(),
    /** 制作期間。"2026.04 - 2026.08" や "2026.04 - 制作中" など自由 */
    period: z.string(),
    /** 一覧カードの小さいラベル（個人開発 / チーム制作 など） */
    category: z.string(),
    /** 自分の担当範囲。個人開発など、書く必要がない作品では省略する */
    role: z.string().optional(),
    /** 使用技術。ここから絞り込みタグが自動生成される */
    tech: z.array(z.string()).min(1),
    /** 一覧に出る1〜2行の概要 */
    summary: z.string(),
    /** 代表画像。public/images/works/ からの相対パス。無ければ省略可 */
    cover: z.string().optional(),
    /** 外部リンク */
    links: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    /** 一覧での並び順。小さいほど上 */
    order: z.number().default(100),
    /** トップで大きく扱う代表作かどうか */
    featured: z.boolean().default(false),
    /** 現在も開発を続けている作品。true にすると「開発中」バッジが出る */
    ongoing: z.boolean().default(false),
    /** 下書き。true の間は本番ビルドに出力されない */
    draft: z.boolean().default(false),
  }),
});

export const collections = { works };
