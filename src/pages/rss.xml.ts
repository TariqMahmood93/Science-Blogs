import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { getPublishedArticles } from '../lib/content';

export async function GET(context: APIContext) {
  const articles = (await getPublishedArticles()).filter((a) => !a.data.sample);
  return rss({
    title: site.name,
    description: site.description,
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.dek,
      pubDate: a.data.publishDate,
      link: `${import.meta.env.BASE_URL}article/${a.id}/`,
      categories: [a.data.category.id, ...a.data.tags],
    })),
  });
}
