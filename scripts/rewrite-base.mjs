#!/usr/bin/env node
// Post-build rewrite: prefix absolute "/foo" URLs in built HTML/XML/TXT with
// the deploy base path. The Astro `base` config already prefixes everything
// Astro itself emits (page routes, bundled assets, sitemap entries), but
// hardcoded strings in templates like `href="/articles/"` are not touched.
// This script fills that gap so the site works at a GitHub Pages project URL.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const raw = process.env.BASE_PATH || '/';
const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;

if (!base) {
  console.log('[rewrite-base] BASE_PATH is "/", nothing to do.');
  process.exit(0);
}

const dist = process.argv[2] || 'dist';
const extensions = new Set(['.html', '.xml', '.txt']);

// Attributes whose value is a single URL.
const singleAttrs = ['href', 'src', 'action', 'poster', 'data-src', 'formaction'];
// Attributes whose value is a comma-separated list of URL/descriptor pairs.
const multiAttrs = ['srcset', 'imagesrcset'];

const alreadyPrefixed = base.slice(1) + '/'; // 'Science-Blogs/'
const escapedPrefix = alreadyPrefixed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Match attr="/path" or attr='/path', but not //cdn, not already-prefixed,
// and not the single-slash root (which is already correct after Astro's base).
const singleRe = new RegExp(
  `\\b(${singleAttrs.join('|')})=(["'])/(?!/|${escapedPrefix})([^"']*)\\2`,
  'g',
);

const multiRe = new RegExp(`\\b(${multiAttrs.join('|')})=(["'])([^"']+)\\2`, 'g');

const cssUrlRe = /url\((["']?)\/(?!\/|__PREFIX__)([^")]+)\1\)/g;
const cssUrlFinal = new RegExp(cssUrlRe.source.replace('__PREFIX__', escapedPrefix), 'g');

function prefixSingle(_m, attr, quote, path) {
  return `${attr}=${quote}${base}/${path}${quote}`;
}

function prefixSrcset(_m, attr, quote, value) {
  const rewritten = value
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return entry;
      if (trimmed.startsWith(alreadyPrefixed, 1)) return entry;
      return entry.replace(/^(\s*)\//, `$1${base}/`);
    })
    .join(',');
  return `${attr}=${quote}${rewritten}${quote}`;
}

function prefixCssUrl(_m, quote, path) {
  return `url(${quote}${base}/${path}${quote})`;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(p);
      continue;
    }
    const dot = entry.name.lastIndexOf('.');
    if (dot < 0) continue;
    const ext = entry.name.slice(dot);
    if (!extensions.has(ext)) continue;
    await rewriteFile(p);
  }
}

async function rewriteFile(file) {
  const original = await readFile(file, 'utf8');
  let updated = original.replace(singleRe, prefixSingle);
  updated = updated.replace(multiRe, prefixSrcset);
  updated = updated.replace(cssUrlFinal, prefixCssUrl);
  if (updated !== original) {
    await writeFile(file, updated);
  }
}

await walk(dist);
console.log(`[rewrite-base] Rewrote URLs under ${dist}/ with prefix ${base}/`);
