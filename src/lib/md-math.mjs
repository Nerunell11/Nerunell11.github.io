// 数式を KaTeX でビルド時に HTML へ変換する。ブラウザ側の JavaScript は要らない。
// 書き方: ブロックは ```math のコードブロック、行内は `$x^2$` のインラインコード。
import katex from 'katex';

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));
const render = (tex, displayMode) => ({
  type: 'raw',
  value: katex.renderToString(tex, { displayMode, throwOnError: true, strict: false }),
});
const hasClass = (node, name) => {
  const c = node.properties?.className;
  return Array.isArray(c) ? c.includes(name) : c === name;
};

export const mathPlugin = {
  name: 'math',
  element: [
    {
      filter: ['pre'],
      visit(node, ctx) {
        const code = node.children?.find((c) => c.tagName === 'code');
        if (code && hasClass(code, 'language-math')) ctx.replaceNode(node, render(textOf(code).trim(), true));
      },
    },
    {
      filter: ['code'],
      visit(node, ctx) {
        if (hasClass(node, 'language-math')) return;
        const m = /^\$(.+)\$$/s.exec(textOf(node));
        if (m) ctx.replaceNode(node, render(m[1], false));
      },
    },
  ],
};
