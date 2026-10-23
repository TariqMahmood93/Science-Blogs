# QA report (23 October 2026)

## Update 4: animated cover illustrations
- Six original animated SVG covers (brain, code scan, data gaps, agent boundary, hypotheses, uncertainty), coloured by content type.
- Animations pause off-screen and are switched off when the reader asks for reduced motion (checked: animation-name is `none` under reduced motion).
- Real photos via `heroImage` were tested: a test image was resized to WebP and shown with its credit, then removed.
- 64 pages build; 2,573 links resolve; axe-core finds no violations on 18 pages in both themes.

## Update 3: clean tech-blog restyle
- One sans-serif family, white base, image-led cards with deep-coloured cover art, single-row sticky header on wide screens, large featured story, topic tabs on the latest-articles grid, dark spotlight and newsletter bands.
- 64 pages build; 2,521 internal links resolve; axe-core finds no violations on 18 pages in light and dark themes; no horizontal overflow from 320 px to 1920 px.
- Header fits on one row from 360 px; on 320 px screens the tools move to a second row.

## Update 2: research questions, dynamic layouts, founder profile
- 64 pages build; 21 pages indexed for search (articles and questions); `astro check` 0 errors, 0 warnings.
- 2,587 internal links resolve. axe-core (WCAG 2.2 AA + best practice) finds no violations on 18 pages in light and dark themes, including the questions hub (filtered and unfiltered), a question page, the filtered article list and About.
- Questions hub: topic, status and keyword filters combine correctly, show a live count, keep state in the URL, and offer "Clear filters" when nothing matches.
- Homepage question rail scrolls with its buttons, which disable at each end; the rail is keyboard-focusable.
- Article list: type and topic filters work; grid/list choice persists between visits.
- Article pages: citation pop-ups open on click or tap, move focus inside, close with Escape and return focus; the table of contents highlights the section being read; a reading-progress bar appears once reading starts.
- No horizontal overflow at 390 px on the new pages. Page transitions use the browser's built-in view transitions and are off when reduced motion is requested.

## Stage 5 (first release)

All checks below were run against the production build (`npm run build`) served locally in headless Chromium.

## What was tested and passed
- **Build:** 48 pages built, search index generated, `astro check` reports 0 errors and 0 warnings. `npm audit`: 0 vulnerabilities.
- **Links:** 1,725 internal links and in-page anchors across all 48 pages resolve.
- **Accessibility (automated):** axe-core with WCAG 2.0/2.1/2.2 A and AA rules plus best practices found **no violations** on 13 representative pages (home, two articles, listings, topic, type, tag, search with results, contact, newsletter, about, 404), in both light and dark themes.
- **Keyboard:** tab order starts with "Skip to content", then logo, Search, theme toggle, Subscribe, navigation. Mobile menu opens with Enter, reports `aria-expanded`, closes with Escape and returns focus to the button.
- **Responsive:** no horizontal overflow at 390 px on any tested page; layouts checked visually at 390 px and 1366 px.
- **Search:** finds articles by body text ("imputation"), topic and type filters, author name, and tolerates a missing letter ("calibraton" found the calibration article). Empty results give guidance and topic links. Filter state is kept in the URL.
- **Newsletter:** with no provider configured the site says signup isn't open. With a provider URL set, the form validates empty email, malformed email and missing consent with specific messages and moves focus to the field.
- **Integrity guards:** a test article with an unverified reference failed the build with a clear message; a `<Cite>` to a missing reference failed the build.
- **SEO:** with `DEPLOY_ENV=production`, `robots.txt` allows crawling and links the sitemap; sample articles are `noindex` and excluded from the sitemap and RSS; tag and search pages are excluded from the sitemap. Previews are `noindex` site-wide.

## Not tested
- A real screen reader (NVDA, VoiceOver). Only automated checks and keyboard flows were run.
- Real newsletter provider round-trip (no account configured).
- Performance scores (Lighthouse / Core Web Vitals) — not measured; no claims made.
- Safari and Firefox rendering; only Chromium was used.
- Deployment to a live host.

## Known limitations
- No admin interface: articles are published by editing files in Git (see PLAN.md for the CMS upgrade path).
- No public submission form; proposals arrive by email.
- No "Was this useful?" widget: it can't record anything without a backend or analytics, so it was left out rather than faked.
- Equations are not enabled (the usual KaTeX plugin chain had an open vulnerability at build time).
- Search requires JavaScript; listings and topic pages work without it.
- Legal pages are drafts for review.
