// 本文の h2 / h3 ごとに、見出しとその下の内容を <details open> で包む。
// 見出しは <summary> の中に入るので、見出しをクリックすると節を開閉できる。
// JavaScript がなくても開閉でき、最初はすべて開いた状態で出す。

const MAX_DEPTH = 3;

function headingLevel(node) {
  if (node.type !== 'element') return 0;
  const m = /^h([1-6])$/.exec(node.tagName);
  return m ? Number(m[1]) : 0;
}

function wrap(children, depth) {
  const out = [];
  let i = 0;

  while (i < children.length) {
    const node = children[i];
    if (headingLevel(node) !== depth) {
      out.push(node);
      i++;
      continue;
    }

    // 同じか上の階層の見出しが来るまでを、この節の中身とする
    let j = i + 1;
    while (j < children.length) {
      const level = headingLevel(children[j]);
      if (level > 0 && level <= depth) break;
      j++;
    }

    let body = children.slice(i + 1, j);
    if (depth < MAX_DEPTH) body = wrap(body, depth + 1);

    out.push({
      type: 'element',
      tagName: 'details',
      properties: { className: ['sec', `sec-${depth}`], open: true },
      children: [
        { type: 'element', tagName: 'summary', properties: {}, children: [node] },
        { type: 'element', tagName: 'div', properties: { className: ['sec-body'] }, children: body },
      ],
    });
    i = j;
  }

  return out;
}

// Astro 7 の Markdown 処理系（Sätteri）の hast プラグインとして使う。
// 見出しの id を付ける処理より前に走るので、summary の中の見出しにも id が付く
export const sectionsPlugin = {
  name: 'sections',
  before(root, ctx) {
    ctx.replaceNode(root, { ...root, children: wrap(root.children, 2) });
  },
};
