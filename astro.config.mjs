// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkCite from './src/lib/remark-cite.mjs';
import { readdirSync, readFileSync } from 'node:fs';

const site = process.env.SITE_URL || 'https://example.org';

// Sample and draft articles are kept out of the sitemap.
const articleDir = new URL('./src/content/articles/', import.meta.url);
const excluded = readdirSync(articleDir)
  .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  .filter((f) => /^(sample|draft):\s*true\s*$/m.test(readFileSync(new URL(f, articleDir), 'utf8').split('---')[1] ?? ''))
  .map((f) => `/article/${f.replace(/\.mdx?$/, '')}/`);

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !excluded.some((p) => page.endsWith(p)) && !page.includes('/search/') && !page.includes('/tags/') }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [remarkCite] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
