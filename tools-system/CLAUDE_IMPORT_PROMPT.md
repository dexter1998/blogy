# Claude Prompt — Import Tools System into Production

Copy-paste the block below into Claude Code (or any Claude session) running **inside your production repo**. Do not run it from any other directory.

---

```
I need you to import the "tools-system" module from a public GitHub repo into THIS production repo, and re-skin its UI to match this repo's existing design system / style guide.

## Source

- Public repo: https://github.com/dexter1998/blogy
- Path to import: tools-system/   (entire folder, branch: main)
- Read the import guide first: https://github.com/dexter1998/blogy/blob/main/tools-system/IMPORT_GUIDE.md

You can fetch source files raw via:
  https://raw.githubusercontent.com/dexter1998/blogy/main/tools-system/<path>

Or clone shallow into a temp dir if you prefer:
  git clone --depth 1 https://github.com/dexter1998/blogy.git /tmp/blogy-src
  (then read from /tmp/blogy-src/tools-system/)

Do NOT add the source repo as a submodule, dependency, or remote of THIS repo.

## What to import

15 tool pages, 15 REST endpoints, 15 docs pages, 1 methodology page. Full inventory in IMPORT_GUIDE.md.

Layered architecture (must preserve):
  tool UI → API route (auth, ratelimit, envelope) → runScraper() → Scraper.execute() → scoring engine
  - Scrapers (src/scrapers/*) are pure — no auth, no HTTP wrappers, no response envelopes
  - Scoring (src/scoring/*) is pure deterministic functions — no I/O
  - Only API routes touch auth / rate limiting / response shape

## What to keep as-is (just adjust import paths for THIS repo's structure)

- src/scrapers/**
- src/scoring/**
- src/lib/**           (api-response, cache, ratelimit, auth, validation, registry, route-helpers, env)
- src/types/**
- API route handler logic in src/app/api/v1/**
- Docs page CONTENT in src/app/docs-api/**
- Methodology page CONTENT

## What to RE-SKIN to match THIS repo's style guide

Before writing any UI, do this:

1. Find this repo's existing design system. Look for: a style guide doc, design tokens file, components/ui directory, Storybook, Tailwind config, theme provider, existing navbar/footer, existing button/input/card primitives, typography scale, color tokens, spacing scale, dark-mode strategy.
2. Identify the patterns this repo uses (component library names, file conventions, CSS approach, naming, layout shell).
3. THEN port the tool pages — keep the form → results → score card → recommendations STRUCTURE, but render every visible element using THIS repo's existing components and tokens. No new design primitives.

Specifically DROP from the source and replace with this repo's equivalents:
- src/components/navbar.tsx, footer.tsx, theme-toggle.tsx, theme-provider.tsx
- src/components/ui.tsx, tool-shell.tsx, multi-select.tsx
- src/providers/  (next-themes — drop if this repo has its own theme strategy)
- tailwind.config.ts, postcss.config.mjs, globals.css  (merge tool-specific tokens into existing setup; do NOT replace this repo's Tailwind config)
- next.config.mjs  (merge config keys into existing one; do NOT replace it)

If this repo uses a different framework (not Next.js App Router), STOP and ask me before continuing — the API route + page structure will need a port, not a copy.

## Dependencies to add

axios ^1.7.7, cheerio ^1.0.0, clsx ^2.1.1, fast-xml-parser ^4.5.0, next-themes ^0.4.4 (only if this repo doesn't already have a theme provider), tailwind-merge ^2.5.5, whois-json ^2.0.4, zod ^3.23.8

Skip any dep this repo already has at a compatible version.

## Vercel function config

The DA/PA endpoint needs maxDuration: 30 in vercel.json. Update the path to match wherever you place the route in this repo.

## Env vars to document

- NEXT_PUBLIC_SITE_URL
- API_AUTH_MODE  (none | key, default none)
- API_KEYS       (comma-separated, only when API_AUTH_MODE=key)

## Acceptance criteria

- All 15 tool pages render using THIS repo's design system (not the source repo's components)
- All 15 API endpoints respond at /api/v1/<endpoint>
- All 15 docs pages render at /docs-api/<api>
- /methodology renders
- npm run typecheck passes
- npm run build passes
- Dark mode works via THIS repo's theme strategy
- No imports remain that point at the source repo or any /tmp clone
- No leftover references to next-themes if this repo uses a different theme provider

## Process

1. First, read IMPORT_GUIDE.md from the source repo and this repo's style guide / design system. Report back what you found before writing code.
2. Propose the file mapping (source path → destination path in this repo) for one tool end-to-end (page + API + scraper + scoring + docs). Wait for my approval.
3. Once I approve the mapping, port that one tool fully and run typecheck/build.
4. After the first tool ships cleanly, batch-port the remaining 14 using the same mapping.
5. Final pass: remove the proxy rewrites for /tools/*, /api/v1/*, /docs-api/*, /methodology, /_next/* from this repo's vercel.json (if they exist), since the routes will now be served directly.

Start with step 1.
```

---

## Notes for the human running this

- The prompt assumes you run Claude **from inside the production repo's working directory**. Claude will use the prod repo's existing style guide and components.
- The source repo (`dexter1998/blogy`) is public, so Claude can read it via raw GitHub URLs or a shallow clone — no auth / no token needed.
- Claude is told to **propose the mapping for one tool first** before bulk-porting. That gate prevents 15 wrong copies.
- The DA/PA endpoint timeout (30s) is the only Vercel-specific config that needs to carry over.
- After import, remove the rewrites in the **root** `blogy` project's `vercel.json` that currently proxy `/tools/*` etc. to `tools-system.vercel.app` — otherwise prod will keep hitting the standalone instance instead of the imported code.
