import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Category = CollectionEntry<'categories'>;
export type ContentType = CollectionEntry<'contentTypes'>;

const now = () => new Date();

/** Articles visible on the site: not drafts, not scheduled for the future. Newest first. */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft && data.publishDate <= now());
  return all.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export async function getCategories(includeHidden = false): Promise<Category[]> {
  const all = await getCollection('categories');
  return all.filter((c) => includeHidden || !c.data.hidden).sort((a, b) => a.data.order - b.data.order);
}

export async function getContentTypes(): Promise<ContentType[]> {
  const all = await getCollection('contentTypes');
  return all.sort((a, b) => a.data.position - b.data.position);
}

/** Resolved lookups used by cards, so components don't each re-query. */
export async function getLookups() {
  const [categories, types, authors] = await Promise.all([
    getCollection('categories'),
    getCollection('contentTypes'),
    getCollection('authors'),
  ]);
  return {
    category: (id: string) => categories.find((c) => c.id === id),
    type: (id: string) => types.find((t) => t.id === id),
    author: (id: string) => authors.find((a) => a.id === id),
  };
}

export async function getAuthor(id: string) {
  return getEntry('authors', id);
}

/** Roughly 225 words a minute, ignoring MDX/markup noise. */
export function readingTime(body = ''): number {
  const text = body
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`\[\]()|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

/** Editor-chosen related articles first, then by shared category and tags. */
export function relatedArticles(article: Article, pool: Article[], limit = 3): Article[] {
  const others = pool.filter((a) => a.id !== article.id);
  const chosen = article.data.related
    .map((id) => others.find((a) => a.id === id))
    .filter((a): a is Article => Boolean(a));
  const scored = others
    .filter((a) => !chosen.includes(a))
    .map((a) => {
      let score = a.data.category.id === article.data.category.id ? 2 : 0;
      score += a.data.tags.filter((t) => article.data.tags.includes(t)).length;
      return { a, score };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || y.a.data.publishDate.valueOf() - x.a.data.publishDate.valueOf())
    .map((s) => s.a);
  return [...chosen, ...scored].slice(0, limit);
}

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function articleUrl(a: Article) {
  return `/article/${a.id}/`;
}
