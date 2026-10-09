// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ユーザーサイトなので base は不要（ルート直下で配信される）
export default defineConfig({
  site: 'https://nerunell11.github.io',
  integrations: [sitemap()],
  build: {
    // /works/nexus/ のような末尾スラッシュ付きURLで出力する
    format: 'directory',
  },
});
