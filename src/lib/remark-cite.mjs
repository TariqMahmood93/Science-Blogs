// Numbers <Cite id="…" /> elements in MDX from the article's `references`
// frontmatter, and fails the build if a citation points at a missing reference.
export default function remarkCite() {
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter ?? {};
    const refs = Array.isArray(fm.references) ? fm.references : [];
    const seen = new Map();
    const walk = (node) => {
      if ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'Cite') {
        const idAttr = node.attributes.find((a) => a.name === 'id');
        const id = typeof idAttr?.value === 'string' ? idAttr.value : null;
        const index = refs.findIndex((r) => r.id === id);
        if (!id || index === -1) {
          throw new Error(`[cite] ${file.path}: <Cite id="${id}"> has no matching entry in frontmatter "references".`);
        }
        const count = (seen.get(id) ?? 0) + 1;
        seen.set(id, count);
        const ref = refs[index];
        node.attributes.push(
          { type: 'mdxJsxAttribute', name: 'n', value: String(index + 1) },
          { type: 'mdxJsxAttribute', name: 'occurrence', value: String(count) },
          { type: 'mdxJsxAttribute', name: 'verified', value: ref.verified ? 'true' : 'false' },
          { type: 'mdxJsxAttribute', name: 'summary', value: String(ref.text ?? '') },
        );
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}
