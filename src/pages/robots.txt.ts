import type { APIContext } from 'astro';

// Previews and staging are kept out of search engines unless DEPLOY_ENV=production.
export function GET({ site }: APIContext) {
  const production = import.meta.env.DEPLOY_ENV === 'production';
  const body = production
    ? `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
