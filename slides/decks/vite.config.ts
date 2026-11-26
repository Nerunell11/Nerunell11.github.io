import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// dev ではサイトの public/ を配信して /images/works/... を見えるようにする。
// build では public 全体 (画像・動画・public/slides 自身) を複製しないよう無効にする。
// その代わり、build 時に /images/... を import として解決できなくなるので、URL 文字列のまま返す。
export default defineConfig(({ command }) => ({
  publicDir: command === 'serve' ? resolve(import.meta.dirname, '../../public') : false,
  plugins:
    command === 'build'
      ? [
          {
            name: 'site-public-images',
            enforce: 'pre' as const,
            resolveId(id: string) {
              if (id.startsWith('/images/')) return '\0site-public:' + id;
            },
            load(id: string) {
              if (id.startsWith('\0site-public:')) {
                return `export default ${JSON.stringify(id.slice('\0site-public:'.length))}`;
              }
            },
          },
        ]
      : [],
}));
