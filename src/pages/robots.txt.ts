import type { APIContext } from 'astro';

// Previews and staging are kept out of search engines unless DEPLOY_ENV=production.
export function GET({ site }: APIContext) {
  const production = import.meta.env.DEPLOY_ENV === 'production';
  const base = import.meta.env.BASE_URL;
  const origin = site ? new URL(site).origin : '';
  const body = production
    ? `User-agent: *\nAllow: ${base}\nDisallow: ${base}search/\n\nSitemap: ${origin}${base}sitemap-index.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
