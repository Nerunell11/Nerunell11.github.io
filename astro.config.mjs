// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { sectionsPlugin } from './src/lib/md-sections.mjs';
import { mathPlugin } from './src/lib/md-math.mjs';

// ユーザーサイトなので base は不要（ルート直下で配信される）
export default defineConfig({
  site: 'https://nerunell11.github.io',
  integrations: [sitemap()],
  markdown: {
    // ```mermaid はハイライトせず素のまま出し、詳細ページ側で図に変換する
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
    // 見出しごとに開閉できるようにする
    processor: satteri({ hastPlugins: [mathPlugin, sectionsPlugin] }),
  },
  build: {
    // /works/nexus/ のような末尾スラッシュ付きURLで出力する
    format: 'directory',
  },
});
