# Tools System — Import Guide

This is the standalone **Tools + APIs** module that powers `/tools/*`, `/api/v1/*`, `/docs-api/*`, and `/methodology` on Blogy. It is currently deployed as a separate Vercel project (`tools-system.vercel.app`) and proxied from the main site via `vercel.json` rewrites.

This guide is for **importing it into a different production codebase** (e.g. merging into the main site repo, or porting into another Next.js app).

---

## Source location

Public GitHub repo (read-only source for the import):

- **Repo:** https://github.com/dexter1998/blogy
- **Path:** [`tools-system/`](https://github.com/dexter1998/blogy/tree/main/tools-system)
- **Branch:** `main`

Everything that needs to be imported lives **inside the `tools-system/` folder**. Nothing outside that folder is required.

```
tools-system/
├── src/
│   ├── app/
│   │   ├── tools/<slug>/         # 15 tool UI pages (page.tsx)
│   │   ├── api/v1/<endpoint>/    # 15 REST endpoints (route.ts)
│   │   ├── docs-api/<api>/       # API reference docs
│   │   ├── methodology/          # Public scoring methodology page
│   │   ├── layout.tsx
│   │   ├── page.tsx              # /tools index
│   │   └── globals.css
│   ├── components/               # navbar, footer, tool-shell, ui primitives
│   ├── lib/                      # api-response, cache, ratelimit, auth, validation, registry
│   ├── scrapers/                 # Pure scraper services (no HTTP, no auth)
│   ├── scoring/                  # Pure scoring engines (deterministic)
│   ├── providers/                # next-themes provider
│   └── types/
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## What the module ships

**15 tool pages** at `/tools/<slug>`:

`ai-humanizer`, `ai-readiness`, `backlinks`, `da-pa-checker`, `geo-checker`, `internal-links`, `metadata-checker`, `paa-checker`, `pagespeed-checker`, `schema-checker`, `seo-audit`, `serp-checker`, `sitemap-checker`, `website-intelligence`, `whois-checker`

**15 REST endpoints** at `/api/v1/<endpoint>`:

`ai-humanizer`, `ai-readiness`, `backlinks`, `da-pa`, `geo`, `internal-links`, `metadata`, `paa`, `pagespeed`, `schema`, `seo-audit`, `serp`, `sitemap`, `website-intelligence`, `whois`

**Docs pages** at `/docs-api/<api>` — one per endpoint, plus a `/docs-api` index.

**Methodology page** at `/methodology`.

---

## Architecture (must be preserved on import)

```
   tool UI page  →  API route (auth, rate limit, envelope)  →  runScraper() → Scraper.execute()
   docs page     →  /api/v1/<endpoint>                                            │
                                                                                  ▼
                                                                          signal collectors
                                                                          (whois, http, dns)
                                                                                  │
                                                                                  ▼
                                                                          scoring engine
                                                                          (pure functions)
```

**Hard rules:**

- Scrapers (`src/scrapers/*`) **never** import auth, rate limiting, or response wrappers. They are pure services callable from queue workers, server actions, or other scrapers.
- Scoring engines (`src/scoring/*`) are **pure deterministic functions** — no I/O, no fetch.
- API routes are the only layer that handles auth, rate limiting, and the response envelope. They wrap `runScraper()`.

---

## Required dependencies

From `tools-system/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.7.7",
    "cheerio": "^1.0.0",
    "clsx": "^2.1.1",
    "fast-xml-parser": "^4.5.0",
    "next": "^15.5.18",
    "next-themes": "^0.4.4",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "tailwind-merge": "^2.5.5",
    "whois-json": "^2.0.4",
    "zod": "^3.23.8"
  }
}
```

Engine: `node >= 20`. Tailwind 3.4, TypeScript 5.7.

---

## Vercel function config

The DA/PA endpoint runs slow WHOIS/DNS lookups and needs a 30s timeout:

```json
{
  "functions": {
    "src/app/api/v1/da-pa/route.ts": { "maxDuration": 30 }
  }
}
```

Carry this over to the production project's `vercel.json` (path will change if the routes get moved under a different prefix).

---

## Environment variables

- `NEXT_PUBLIC_SITE_URL` — deployed origin (used in canonical URLs / OG tags)
- `API_AUTH_MODE` — `none` (default) or `key`
- `API_KEYS` — comma-separated keys, only used when `API_AUTH_MODE=key`

---

## UI / design system

The current `tools-system` UI uses its own minimal Tailwind setup (`navbar`, `footer`, `tool-shell`, `ui.tsx`, `theme-provider`). **On import into production, the UI must be re-skinned to match the production repo's existing style guide / design tokens.** Do not bring the standalone Tailwind config or component primitives wholesale — adapt to whatever the prod repo already uses.

Specifically:

- Use the production repo's existing `Button`, `Input`, `Card`, layout shell, navbar, footer, typography scale, color tokens, spacing scale, and dark-mode strategy.
- Keep the page **structure** (form → results panel → score card → recommendations) but apply the prod repo's component library.
- Drop `next-themes` if the prod repo already has its own theme provider.
- Drop or replace `tools-system/src/components/*` with the prod repo's equivalents.

---

## What to import vs what to drop

**Import (keep as-is, only adjust import paths):**

- `src/scrapers/**` — pure logic, no UI, no framework coupling
- `src/scoring/**` — pure functions
- `src/lib/**` — api-response, cache, ratelimit, auth, validation, registry, route-helpers, env
- `src/app/api/v1/**` — route handlers (logic stays, only adjust auth/ratelimit hooks if prod repo has its own)
- `src/types/**`

**Re-skin (keep behavior, swap components):**

- `src/app/tools/<slug>/page.tsx` — keep the form fields, validation, fetch logic, and result rendering shape; replace the visual components with prod repo's design system
- `src/app/docs-api/**` — keep the content; re-render with prod repo's docs layout if one exists
- `src/app/methodology/page.tsx`

**Drop / replace with prod equivalents:**

- `src/components/navbar.tsx`, `footer.tsx`, `theme-toggle.tsx`, `theme-provider.tsx`
- `src/components/ui.tsx`, `tool-shell.tsx`, `multi-select.tsx`
- `src/providers/`
- `tailwind.config.ts`, `postcss.config.mjs`, `globals.css` (merge any tool-specific tokens into prod's existing setup if needed)
- `next.config.mjs` (merge config keys into prod's existing one)

---

## Routing

After import, the production site should serve the same paths directly (no proxy):

- `/tools` and `/tools/<slug>`
- `/api/v1/<endpoint>`
- `/docs-api` and `/docs-api/<api>`
- `/methodology`

Once the import is live, the **rewrites in the root `blogy` project's `vercel.json`** that point these paths at `tools-system.vercel.app` should be removed.

---

## Acceptance checklist

- [ ] All 15 tool pages render with prod repo's design system
- [ ] All 15 API endpoints respond at `/api/v1/<endpoint>` on the prod domain
- [ ] All 15 docs pages render at `/docs-api/<api>`
- [ ] `/methodology` renders
- [ ] DA/PA endpoint has 30s `maxDuration` configured
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Dark mode works using prod repo's theme strategy (not `next-themes` if prod uses something else)
- [ ] Rate limiting + auth wired through prod repo's existing middleware (if any), or kept standalone if not
- [ ] Root `blogy` project's proxy rewrites for `/tools/*`, `/api/v1/*`, `/docs-api/*`, `/methodology`, `/_next/*` removed
