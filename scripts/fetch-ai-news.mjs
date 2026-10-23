#!/usr/bin/env node
// Pull the latest AI headlines from a short list of public RSS feeds and
// write a small JSON file the homepage consumes. Runs on a daily cron
// inside the deploy workflow, where network access is unrestricted.
// Fails soft: if every feed is unreachable, the existing JSON is left
// alone so the previous day's items keep showing.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// Feeds without API keys. We only ever read; nothing is sent.
const FEEDS = [
  { source: 'Hacker News', url: 'https://hnrss.org/newest?q=artificial+intelligence&count=25' },
  { source: 'The Verge', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
  { source: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/' },
  { source: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
];

const AI_KEYWORDS = /\b(ai|a\.i\.|artificial intelligence|machine learning|deep learning|neural|llm|gpt|chatgpt|openai|anthropic|claude|gemini|mistral|robot|autonomous|generative|transformer)\b/i;

const OUT_PATH = new URL('../src/data/ai-news.json', import.meta.url);
const MAX_ITEMS = 8;
const USER_AGENT = 'ResearchFrontier-NewsBot/1.0 (+static site aggregator)';
const TIMEOUT_MS = 15_000;

async function fetchFeed(feed) {
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8' }, signal: ac.signal });
    if (!res.ok) {
      console.warn(`[ai-news] ${feed.source}: HTTP ${res.status}`);
      return [];
    }
    const text = await res.text();
    return parseFeed(text, feed.source);
  } catch (err) {
    console.warn(`[ai-news] ${feed.source}: ${err?.message ?? err}`);
    return [];
  } finally {
    clearTimeout(to);
  }
}

// Minimal RSS/Atom extractor. We only need title, link, pubDate and
// (optionally) description, so a small regex pass is enough — no
// third-party XML parser.
function parseFeed(xml, source) {
  const items = [];
  const isAtom = /<feed\b/i.test(xml) && !/<rss\b/i.test(xml);
  const entryRe = isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi;
  const chunks = xml.match(entryRe) ?? [];
  for (const chunk of chunks) {
    const title = decode(firstTag(chunk, 'title'));
    const link = isAtom ? atomLink(chunk) : decode(firstTag(chunk, 'link'));
    const pubRaw = isAtom
      ? firstTag(chunk, 'updated') || firstTag(chunk, 'published')
      : firstTag(chunk, 'pubDate') || firstTag(chunk, 'dc:date');
    const summaryRaw = isAtom ? firstTag(chunk, 'summary') : firstTag(chunk, 'description');
    const summary = stripHtml(decode(summaryRaw || '')).slice(0, 220).trim();
    const date = pubRaw ? new Date(pubRaw).toISOString() : new Date().toISOString();
    if (title && link) items.push({ title, url: link, source, date, summary });
  }
  return items;
}

function firstTag(chunk, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = chunk.match(re);
  return m ? m[1].trim().replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
}

function atomLink(chunk) {
  const m = chunk.match(/<link\b([^>]*)\/?>/i);
  if (!m) return '';
  const attrs = m[1];
  const href = attrs.match(/\bhref=["']([^"']+)["']/i);
  return href ? href[1] : '';
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

function decode(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

async function main() {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const all = results.flat();
  if (all.length === 0) {
    console.warn('[ai-news] Every feed returned no items; keeping existing JSON file.');
    return;
  }
  // Keep only AI-related headlines, dedupe by URL, newest first.
  const seen = new Set();
  const curated = all
    .filter((it) => AI_KEYWORDS.test(`${it.title} ${it.summary}`))
    .filter((it) => { if (seen.has(it.url)) return false; seen.add(it.url); return true; })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, MAX_ITEMS);

  if (curated.length === 0) {
    console.warn('[ai-news] No AI-related items after filtering; keeping existing JSON file.');
    return;
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    items: curated,
  };
  await mkdir(dirname(OUT_PATH.pathname), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(`[ai-news] Wrote ${curated.length} items at ${payload.fetchedAt}`);
}

try {
  await main();
} catch (err) {
  console.error('[ai-news] Unexpected error:', err);
  // Non-zero exit would fail the build. News is nice-to-have, so swallow.
  process.exit(0);
}
