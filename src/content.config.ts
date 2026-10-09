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
    /** 制作年。"2026" や "2026.04" など自由 */
    year: z.string(),
    /** 一覧カードの小さいラベル（個人制作 / チーム制作 / ツール など） */
    category: z.string(),
    /** 自分の担当範囲 */
    role: z.string(),
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
    /** 一覧での並び順。小さいほど上。同値なら year の降順 */
    order: z.number().default(100),
    /** トップで大きく扱う代表作かどうか */
    featured: z.boolean().default(false),
    /** 下書き。true の間は本番ビルドに出力されない */
    draft: z.boolean().default(false),
  }),
});

export const collections = { works };
