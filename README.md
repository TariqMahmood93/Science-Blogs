# The Research Frontier

A static, editorially controlled science publication built with Astro, MDX and Pagefind.
The architecture and its trade-offs are in [`docs/PLAN.md`](docs/PLAN.md); test results and known gaps are in [`docs/QA.md`](docs/QA.md).

## Run it locally

Requires Node.js 22 or later.

```bash
npm install
npm run dev        # http://localhost:4321 — live reload; search is not available in dev
npm run build      # builds dist/ and the search index
npm run preview    # serves the built site, with working search
npx astro check    # type and content-schema check
```

Copy `.env.example` to `.env` and fill in what you have. Every variable starting with `PUBLIC_` ends up in the browser, so never put API keys or passwords in this project — none are needed.

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public address, used for canonical links, sitemap and RSS. |
| `DEPLOY_ENV` | Set to `production` only on the live site. Anything else adds `noindex` and a block-all `robots.txt`, which keeps previews out of search engines. |
| `PUBLIC_CONTACT_EMAIL` | Shown on Contact, Corrections, Submit and Privacy pages. Until set, those pages show a visible placeholder. |
| `PUBLIC_NEWSLETTER_ACTION` | Your email provider's public signup URL (the `action` of its embeddable form). Until set, the site says signup isn't open yet. |
| `PUBLIC_NEWSLETTER_EMAIL_FIELD` | The field name your provider expects for the email address (usually `email`). |

## Publishing an article

1. Create `src/content/articles/<url-slug>.mdx`. The file name becomes the address: `/article/<url-slug>/`.
   For research ideas, copy `templates/research-idea.mdx`, which already has the eight required sections.
2. Fill in the frontmatter. Required: `title`, `dek` (max 280 characters), `type`, `category`, `authors`, `publishDate`.
   - `type`: `scientific-explainer`, `research-discovery`, `research-idea`, `future-hypothesis` or `commentary`.
   - `category`: an id from `src/content/categories.yaml`.
   - `authors`: ids from `src/content/authors.yaml` (add the person there first, with a real bio).
   - Research ideas also need `researchQuestion`.
   - Optional: `subtitle`, `tags`, `updatedDate`, `updateNote`, `corrections`, `heroImage` (`src`, `alt`, `credit`), `featured`, `editorsPick`, `openQuestion`, `sourceLink`, `aiAssistance`, `related`, `seoTitle`, `seoDescription`, `toc`.
3. Add references to the frontmatter and cite them in the text with `<Cite id="…" />`. Numbers are filled in automatically.
   ```yaml
   references:
     - id: rubin1976
       text: "Rubin, D. B. (1976). Inference and missing data. Biometrika, 63(3), 581–592."
       doi: 10.1093/biomet/63.3.581
       verified: true   # only after an editor has checked it
   ```
4. Mark the status of claims where it helps readers:
   ```mdx
   <Evidence kind="established">…</Evidence>      // also: interpretation, speculation, open
   <Callout title="Key term">…</Callout>
   import fig from '../../assets/my-figure.png';   // at the top of the file
   <Figure src={fig} alt="…" caption="…" credit="…" />
   ```
5. Preview with `npm run dev`. Keep `draft: true` while the piece is in review; drafts are never built.
6. Merge to the main branch. The host rebuilds and the article goes live.

**Scheduling:** set a future `publishDate`. Future-dated articles are left out of the build, so add a daily build hook on your host (Netlify and Cloudflare both support scheduled builds) and the article appears on its date.

**Corrections:** fix the text, set `updatedDate`, and add an entry under `corrections` with the date and what changed. It is shown on the article.

### Safeguards the build enforces
- A non-draft, non-sample article with any reference not marked `verified: true` **fails the build**.
- A `<Cite>` pointing at a reference that doesn't exist fails the build.
- A research idea without `researchQuestion` fails the build.
- Unknown types, topics or authors fail the build.

### Topics, types and navigation
- Topics: `src/content/categories.yaml` — rename, reorder (`order`) or hide (`hidden: true`) without touching layouts.
- Main navigation, footer links and social links: `src/config/site.ts`. Social links appear only once filled in.

## Sample content — remove before launch

The six articles in `src/content/articles/` are **labelled outlines** (`sample: true`). They show a visible "Sample content" banner, are marked `noindex`, are excluded from the sitemap and RSS, and every reference is an unverified placeholder. The author entry "The Research Frontier editors" is also a placeholder. Replace them with at least five real, editor-reviewed articles before launch.

## Deploying

Any static host works. Netlify or Cloudflare Pages are the simplest:

1. Push this folder to a Git repository (GitHub, GitLab).
2. Create a site on the host and connect the repository.
3. Build command: `npm run build`. Output directory: `dist`. Node version: 22.
4. Set environment variables: `SITE_URL`, `DEPLOY_ENV=production` (production only), `PUBLIC_CONTACT_EMAIL`, `PUBLIC_NEWSLETTER_ACTION`.
5. Point your domain at the host and enable HTTPS.
6. Optional: a scheduled daily build for future-dated articles.

Recommended response headers (set in the host's config):
`Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; form-action 'self' <your newsletter provider>; frame-ancestors 'none'`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`.
Test the CSP on a preview first: the theme and search scripts need the inline and WASM allowances.

**This site has not been deployed.** Nothing in this repository has been published to a live address.

## Newsletter

The form posts directly to your provider's hosted signup endpoint, so no API key is involved and the provider handles double opt-in, confirmation and unsubscribe. The site never says someone has subscribed; the provider's confirmation page does. Providers with embeddable forms include Buttondown, EmailOctopus, Mailchimp and Brevo — choose one with EU data handling if that matters for your readers, and add it to the privacy notice.

## Backups and updates

- **Content and code** live in Git; the repository is the backup. Keep a second remote (or the host's own copy) so one account outage can't lose it.
- **No database** and no personal data are stored by the site itself. Newsletter subscribers live with your email provider — export the list periodically.
- **Dependencies:** run `npm outdated` and `npm audit` monthly; update, rebuild and check with `npm run build && npx astro check`.

## Project layout

```
src/config/site.ts          name, nav, footer, social, newsletter settings
src/content.config.ts       article schema and integrity rules
src/content/                articles (MDX) and taxonomy (YAML)
src/components/             UI components and MDX components (Cite, Evidence, Callout, Figure)
src/layouts/                base and page layouts
src/lib/content.ts          queries, reading time, related articles
src/lib/remark-cite.mjs     numbers citations, validates them at build time
src/pages/                  routes
src/styles/                 design tokens, global and article styles
templates/research-idea.mdx starter for research ideas
docs/                       plan and QA report
```
