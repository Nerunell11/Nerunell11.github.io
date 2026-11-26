// decks/*.md を 1 つずつ Slidev でビルドし、../public/slides/<name>/ に出す。
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = resolve(root, '..', 'public', 'slides');

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

const decks = readdirSync(join(root, 'decks'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3));

for (const name of decks) {
  console.log(`[slides] build ${name}`);
  const r = spawnSync(
    'npx',
    ['slidev', 'build', `decks/${name}.md`, '--base', `/slides/${name}/`, '--out', join(outRoot, name)],
    { cwd: root, stdio: 'inherit', shell: true },
  );
  if (r.status !== 0) {
    console.error(`[slides] ${name} のビルドに失敗しました`);
    process.exit(1);
  }
  if (!existsSync(join(outRoot, name, 'index.html'))) {
    console.error(`[slides] ${name}: 出力先に index.html がありません`);
    process.exit(1);
  }
}
