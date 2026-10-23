import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { getPublishedArticles } from '../lib/content';

export async function GET(context: APIContext) {
  const articles = (await getPublishedArticles()).filter((a) => !a.data.sample);
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.dek,
      pubDate: a.data.publishDate,
      link: `/article/${a.id}/`,
      categories: [a.data.category.id, ...a.data.tags],
    })),
  });
}
