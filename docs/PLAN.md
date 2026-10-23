# Stage 1 — Discovery and plan

## Context inspected
No existing repository was provided, so this is a new project. Scope agreed for the first release: **static MVP** — published articles, categories, content types, tags, search and a newsletter integration point. No database, accounts, admin UI or public submission form in this release.

## Architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (static output) | Ships zero JavaScript by default, content collections with typed schemas, first-class MDX. A publication is mostly reading, so a static site is the fastest, cheapest and most secure option. |
| Content | **MDX files in Git** (`src/content/articles`) | Portable plain text, reviewable in pull requests, revision history for free. Editors who can't use Git can later get a Git-backed CMS (Decap, Keystatic, TinaCMS) on top of the same files without migration. |
| Taxonomy | Data files (`categories.yaml`, `content-types.yaml`, `authors.yaml`) | Categories are added, renamed, reordered or hidden by editing one YAML file; no layout hard-codes them. |
| Styling | Hand-written CSS with design tokens (`src/styles/tokens.css`) | Small, readable, no build plugin. Tokens cover colour, type, spacing, radii and both themes. |
| Search | **Pagefind** | Builds a static index after `astro build`; runs entirely in the browser, supports filters (topic, type, year), contextual excerpts, and needs no server or third-party service. |
| Newsletter | Form that posts to a provider URL from `PUBLIC_NEWSLETTER_ACTION` | Works with any provider that offers a hosted signup endpoint (Buttondown, Mailchimp, EmailOctopus…). No secret is involved, and when the variable is empty the form says plainly that signup is not yet enabled. |
| Hosting | Any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages) | `dist/` is plain files. |
| Analytics | None by default | Nothing to consent to; add a privacy-first tool later if wanted. |

### Trade-offs accepted
- **No admin UI.** Publishing means editing an MDX file and merging it. This is the main cost of the static approach; a Git-backed CMS is the planned upgrade path.
- **Scheduling** is handled by `publishDate`: future-dated articles are excluded from the build, so a scheduled rebuild (e.g. a daily host build hook) publishes them.
- **Search only works on a built site** (`npm run build && npm run preview`), not in `astro dev`.
- **Equations** are not enabled yet: the usual KaTeX plugin chain pulled in a version with a published vulnerability. Add `remark-math` + `rehype-katex` once a patched chain is available.

## Editorial safeguards built into the code
- Every article must declare a content type (Scientific explainer, Research discovery, Research idea, Future hypothesis, Commentary); it is shown on every card and article.
- Research ideas must state a research question in frontmatter and follow the eight-section template.
- References carry a `verified` flag. Unverified references render as visible editorial placeholders, and **the build fails** if a non-sample, non-draft article contains an unverified reference.
- Sample content carries `sample: true`, shows a visible "Sample content" banner and is excluded from the sitemap and search engines (`noindex`).
- Evidence callouts (`<Evidence kind="established | interpretation | speculation | open">`) let writers mark status inline, using shape and words, not colour alone.

## File structure
```
src/
  config/site.ts            site name, nav, social links (only rendered when set)
  content.config.ts         collection schemas + integrity rules
  content/
    articles/*.mdx          articles
    categories.yaml         topics (order, hidden, description)
    content-types.yaml      the five content types
    authors.yaml            authors and bios
  components/               Header, Footer, ArticleCard, Cite, References, Evidence, …
  layouts/                  BaseLayout, ArticleLayout
  lib/                      article queries, reading time, related articles
  pages/                    home, articles, topics, type, tags, search, static pages, 404, rss, robots
  styles/                   tokens.css, global.css, prose.css
templates/research-idea.mdx starter file for new research ideas
```

## Accounts or credentials you will need to create
- **Hosting account** (e.g. Netlify or Cloudflare Pages) connected to your Git repository.
- **Newsletter provider** account, to obtain a public form endpoint for `PUBLIC_NEWSLETTER_ACTION`.
- **Domain name** and DNS access once the brand name is confirmed.
- **Contact address** for editorial, corrections and security reports (`PUBLIC_CONTACT_EMAIL`).

## Unresolved decisions (defaults chosen)
1. Brand name is provisional — check domain, handles and trademark before launch.
2. Contact email — placeholder until you set `PUBLIC_CONTACT_EMAIL`.
3. Legal pages (privacy, terms) are plain-language drafts and need review for EU/Italian requirements; this is not legal advice.
4. Submissions: the Submit page explains how to pitch by email and describes the editorial (not peer) review states. A form with a backend is a later phase.
