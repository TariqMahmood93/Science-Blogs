# Guidance for Claude Code on this repository

## Working style
- The owner has standing permission for Claude to merge its own pull requests on this repository without a per-PR "go ahead" message. After opening a draft PR, mark it ready for review and merge it (squash merge) once local build and the normal PR checklist pass. The owner will interrupt if they want to review something first.
- The deploy workflow runs on push to `main`, so merging is what publishes a change. Watch the resulting deploy run via `send_later` and report its outcome.
- Articles stay flagged `sample: true` unless the owner says otherwise, because they have not been verified by a named human editor.

## Development conventions
- Node 22, Astro 7, Pagefind. See `README.md` for the local commands.
- Deploy base path and site URL come from the GitHub Actions workflow via `actions/configure-pages`. The post-build `scripts/rewrite-base.mjs` prefixes any absolute `/` URLs in `dist/` with the deploy base; do not re-introduce hardcoded root paths without accounting for the rewriter.
- Daily `Latest in AI` headlines come from `scripts/fetch-ai-news.mjs`, which runs inside the deploy workflow on cron. The fetch step is `continue-on-error`; the script fails soft when every feed is unreachable so stale data stays rather than disappearing.
- Covers for new articles should reuse the existing illustrations in `src/components/covers/` where they fit. Add a new cover (and update `src/components/CoverArt.astro` plus the `cover` enum in `src/content.config.ts`) only when no existing illustration applies.

## Where to find things
- Site-wide settings (nav, footer, newsletter, contact email): `src/config/site.ts`.
- Content schemas: `src/content.config.ts`.
- Deploy workflow: `.github/workflows/deploy.yml`.
