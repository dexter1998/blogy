# Blogy Tools System

Isolated **Tools + APIs** module for Blogy. Self-contained Next.js 15 app that ships:

- Public tool pages at `/tools/<slug>`
- REST APIs at `/api/v1/<endpoint>`
- API reference docs at `/docs-api/<api>`

This folder is intentionally standalone so it can later be moved into a separate
repo or microservice without touching the main Blogy site.

## Architecture

```
tools-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── tools/<slug>/       # Tool UI pages
│   │   ├── docs-api/<slug>/    # MDX-style docs pages
│   │   ├── api/v1/<endpoint>/  # REST endpoints (route.ts)
│   │   └── methodology/        # Public scoring methodology
│   ├── components/             # UI primitives + docs layout
│   ├── lib/                    # api-response, cache, ratelimit, auth, validation, registry
│   ├── scrapers/               # Pure scraper services (no HTTP, no auth)
│   │   ├── base/               # Scraper<I,O> contract + runScraper()
│   │   ├── _shared/            # http client used by every scraper
│   │   └── da-pa/              # First reference scraper
│   └── scoring/                # Pure scoring engines (deterministic)
│       └── da-pa/              # Weighted DA/PA combiner
├── next.config.mjs
├── package.json
└── vercel.json
```

### Layered design

```
                    ┌────────────────────────┐
   tool UI page  →  │  API route (auth, RL)  │  →  runScraper() → Scraper.execute()
   docs page     →  │  /api/v1/<endpoint>    │                        │
                    └────────────────────────┘                        ▼
                                                              signal collectors
                                                              (whois, http, dns)
                                                                      │
                                                                      ▼
                                                              scoring engine
                                                              (pure functions)
```

The **scraper layer never imports auth, rate limiting, or response wrappers**.
That keeps scrapers reusable from queue workers, server actions, or other scrapers.

## Local development

```bash
cd tools-system
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Deploying to Vercel

1. Connect this folder as a Vercel project (root: `tools-system`).
2. Set `NEXT_PUBLIC_SITE_URL` to your deployed URL.
3. (Optional) Set `API_AUTH_MODE=key` and provide a comma-separated `API_KEYS`.

The `vercel.json` here bumps the DA/PA function timeout to 30s for slower
WHOIS/DNS lookups.

## Adding a new tool

1. Create a scraper at `src/scrapers/<slug>/index.ts` implementing `Scraper<I, O>`.
2. (Optional) Add a scoring engine at `src/scoring/<slug>/`.
3. Create the API route at `src/app/api/v1/<endpoint>/route.ts` — copy
   `da-pa/route.ts` as a template (same auth + rate limit + envelope).
4. Add a tool UI at `src/app/tools/<slug>/page.tsx`.
5. Add a docs page at `src/app/docs-api/<slug>/page.tsx` using `<DocsLayout>`.
6. Register the entry in `src/lib/registry/index.ts`.

The `/tools` and `/docs-api` index pages render automatically from the registry.

## Reference implementation: DA/PA Checker

- Tool: `/tools/da-pa-checker`
- API: `POST /api/v1/da-pa`
- Docs: `/docs-api/da-pa-api`
- Methodology: `/methodology`

Signals collected:
- WHOIS creation date, registrar
- DNS A / MX / SPF presence
- robots.txt + sitemap.xml inspection
- On-page parse: title, meta, H1, links, schema, OG, trust pages
- External-host diversity (referring-domain proxy)
- Spam pattern detection (suspicious keywords, link ratios)

Scoring is **deterministic and explainable** — the API returns an
`explanations[]` array describing why the score is what it is, and a
`signals` object with every raw value used.

## Production todo

These are intentionally stubbed for now. Wire them up when going live:

- [ ] Replace `lib/cache` in-memory adapter with Upstash Redis
- [ ] Replace `lib/ratelimit` with Upstash sliding-window
- [ ] Wire Postgres + Prisma for API key storage and usage tracking
- [ ] Add BullMQ queue for async bulk jobs (>25 URLs)
- [ ] Add OpenTelemetry / Sentry for error tracking
- [ ] Write integration tests with recorded HTTP fixtures
