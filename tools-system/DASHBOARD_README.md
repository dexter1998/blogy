# Blogy Dashboard — Complete Technical Reference

> Read this before touching any dashboard file. This document covers every file, type, component, convention, and integration point so Claude Code (or any engineer) can make changes without breaking anything.

---

## 1. Overview

The dashboard lives at `/dashboard` and is a **single-page shell** that swaps content sections based on a `SectionId` state variable. There is no client-side routing — no `useRouter()`, no URL change. Clicking a sidebar item calls `setActiveSection(id)` and the main content area re-renders.

**Entry point:** `src/app/dashboard/page.tsx` → renders `DashboardClient`  
**Shell:** `DashboardClient` manages all top-level state and composes `Sidebar` + `Topbar` + section content  
**Theme:** Dark/light via `next-themes`. CSS variables map `--color-app`, `--color-fg`, etc. to Tailwind classes `bg-app`, `text-fg`, `border-app`, `bg-card`, `text-muted-fg`.

---

## 2. File Structure

```
src/app/dashboard/
├── page.tsx                          # Server component — renders DashboardClient
├── dashboard-client.tsx              # Root client component — all top-level state
├── types.ts                          # SectionId union + all shared interfaces
├── mock-data.ts                      # All mock data (BLOGS, COMPANY, TRENDS, etc.)
│
├── _shell/
│   ├── sidebar.tsx                   # Left nav (10 items) + Claude-style user menu
│   └── topbar.tsx                    # Top bar (section title, search, notifications, New Blog)
│
├── _shared/
│   ├── section-header.tsx            # Title + subtitle used at top of every section
│   ├── mini-bar-chart.tsx            # Inline sparkline bar chart
│   ├── modal.tsx                     # Generic modal wrapper (overlay + close)
│   ├── progress-steps.tsx            # Vertical step list (done/running/pending)
│   ├── score-gauge.tsx               # SVG radial gauge (0-100 score)
│   ├── tabs.tsx                      # Reusable horizontal tab bar
│   └── toggle-switch.tsx             # iOS-style toggle
│
├── _onboarding/
│   ├── onboarding-flow.tsx           # Wrapper: dark bg + cursor glow + step routing
│   ├── step-auth.tsx                 # Step 0: OTP login + goal selection
│   ├── step-website.tsx              # Step 1: URL input → rotating glow analysis → AI reveal
│   ├── step-competitors.tsx          # Step 2: Competitor list confirm/edit
│   ├── step-contact.tsx              # Step 3: Optional phone + designation
│   ├── step-processing.tsx           # Step 4: "Generating your Business DNA" loading
│   └── step-review.tsx               # Step 5: DNA review (tabs) + AI Growth Copilot panel
│
└── sections/
    ├── home/home-section.tsx         # Dashboard home with stats, quick actions, activity
    ├── website-intelligence/
    │   └── wi-section.tsx            # CMO Brain: 6 sticky tabs (DNA, SEO, Coverage, etc.)
    ├── create/create-section.tsx     # Auto Mode card + Blog table + inline 6-step workflow
    ├── reports/reports-section.tsx   # Traffic, keyword, content performance
    ├── scheduling/scheduling-section.tsx  # Content calendar
    ├── trends/trends-section.tsx     # 4-col news grid + zero-click + competitor feed
    ├── marketplace/marketplace-section.tsx
    ├── integrations/integrations-section.tsx  # 7-tab + compact hover cards
    ├── todos/todos-section.tsx
    ├── coming-soon/coming-soon-section.tsx    # Upvotable feature roadmap
    ├── settings/settings-section.tsx          # 2-pane Claude-style settings
    └── billing/billing-section.tsx            # Plan card, credits, invoices
```

---

## 3. The `SectionId` Type

**File:** `src/app/dashboard/types.ts`

```ts
export type SectionId =
  | "home"
  | "cmo-brain"
  | "create"
  | "reports"
  | "scheduling"
  | "trends"
  | "marketplace"
  | "integrations"
  | "todos"
  | "coming-soon"
  | "billing"
  | "settings";
```

**Critical rule:** Every `Record<SectionId, ...>` in the codebase (e.g. `SECTION_LABELS` in `topbar.tsx`) must have a key for every value in this union. TypeScript will error if any key is missing. When adding a new SectionId:
1. Add it to the union in `types.ts`
2. Add it to `SECTION_LABELS` in `topbar.tsx`
3. Add it to `NAV_ITEMS` in `sidebar.tsx` (or user menu if it's not in main nav)
4. Add a render case in `dashboard-client.tsx`
5. Create the section component

---

## 4. `dashboard-client.tsx` — Root Component

**State managed here:**
```ts
const [showOnboarding, setShowOnboarding] = useState(true);   // show onboarding first
const [activeSection, setActiveSection] = useState<SectionId>("home");
```

**How navigation works:**
- `Sidebar` receives `activeSection` + `onNavigate` (= `setActiveSection`)
- `Topbar` receives `activeSection` + `onNewBlog` (= `() => setActiveSection("create")`)
- The main content area is a sequence of `{activeSection === "..." && <Section />}`
- `CmoBrainSection` is imported from `wi-section.tsx` which exports `{ CmoBrainSection as WiSection }` for legacy compat

**Adding a new section:**
```tsx
// 1. Import
import { MyNewSection } from "./sections/my-new/my-new-section";

// 2. Add render case in the main content area
{activeSection === "my-new" && <MyNewSection />}
```

---

## 5. `sidebar.tsx` — Navigation Shell

**NAV_ITEMS** (10 items, in order):
```ts
{ id: "home",         label: "Home",        icon: HomeIcon }
{ id: "cmo-brain",    label: "CMO Brain",   icon: BrainIcon }
{ id: "create",       label: "Create",      icon: PenIcon }
{ id: "reports",      label: "Reports",     icon: BarIcon }
{ id: "scheduling",   label: "Scheduling",  icon: CalIcon }
{ id: "trends",       label: "Trends",      icon: TrendIcon }
{ id: "marketplace",  label: "Marketplace", icon: StoreIcon }
{ id: "integrations", label: "Integrations",icon: PlugIcon }
{ id: "todos",        label: "Todos",       icon: CheckIcon }
{ id: "coming-soon",  label: "Coming Soon", icon: RocketIcon }
```

**User menu (bottom of sidebar):**
- Shows `T` avatar (first letter of user name)
- On click: dropdown opens **upward** (`absolute bottom-full`)
- Uses `useRef` + `useEffect` with `mousedown` listener for outside-click close
- Menu items: email (non-clickable), Settings ⇧⌘,, Language, Get help, separator, Upgrade plan (with credit bar), Get apps, Gift Blogy, Learn more, separator, Log out

**Credit bar** embedded in "Upgrade plan" row: `1,240 / 5,000 credits · 12d left`

---

## 6. `topbar.tsx` — Top Bar

- Renders the current section's human-readable name via `SECTION_LABELS[activeSection]`
- Contains: section title (h1), search bar (visual only), notification bell, "New Blog" CTA button, avatar
- `onNewBlog` prop calls `setActiveSection("create")` in the parent

---

## 7. CMO Brain Section (`wi-section.tsx`)

**Export:** `CmoBrainSection` (also exported as `WiSection` for compat)

**6 sticky tabs:**
| Tab ID | Label | Content Component |
|--------|-------|-------------------|
| `dna` | Business DNA | `BusinessDnaSection` |
| `seo` | SEO Health | `SeoHealthSection` |
| `coverage` | Content Coverage | `ContentCoverageSection` |
| `competitors` | Competitors | `CompetitorIntelSection` |
| `technical` | Technical | `TechnicalSpecsSection` |
| `ai-learning` | AI Learning | `AiLearningSection` |

Tab bar uses `sticky top-0 z-10 bg-app -mx-6 px-6 border-b border-app`. Active tab: `border-b-2 border-teal-500 text-teal-700 dark:text-teal-300`.

---

## 8. Create Section (`create-section.tsx`)

**No modal.** The old `BlogWizardModal` (935 lines) was deleted and replaced with inline `BlogWorkflow`.

**Structure:**
1. `AutoModeCard`: Shows Scheduled/Generating/Pending counts + progress bar + Manage button
2. `BlogWorkflow` (inline accordion, 6 steps): Shown when `workflowOpen === true`
   - Steps: `Title` → `Keywords` → `Intent` → `Internal Links` → `References` → `Generate`
   - `WizardStep = 0|1|2|3|4|5`
   - Completed steps: collapsed with green checkmark + summary value
   - Current step: expanded
   - Any completed step is clickable to re-expand
3. `BlogTable`: Sub-tabs (All/Published/Scheduled/Draft) + blog rows

**State:**
```ts
const [workflowOpen, setWorkflowOpen] = useState(false);
const [currentStep, setCurrentStep] = useState<WizardStep>(0);
const [draftData, setDraftData] = useState<DraftData>({ ... });
```

---

## 9. Trends Section (`trends-section.tsx`)

**Grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`

**TrendCard layout:**
- Top: `h-[120px]` gradient bg with keyword overlay text, maturity badge (top-left), urgency badge (top-right)
- Body: volume/confidence row, traffic potential + difficulty dots
- Hover overlay: dark bg with "Create Content", "Schedule Later", "Dismiss" buttons

**Below the grid:**
- `ZeroClickSection`: Featured Snippet, PAA, AI Overview, Knowledge Panel opportunities
- `CompetitorFeed`: Competitor changes in last 7 days

---

## 10. Integrations Section (`integrations-section.tsx`)

**7 tabs:** All / Publishing / Analytics / Social Media / Email / AI Models / Requested

**`IntegrationCard`** (compact):
- Default: `w-10 h-10` icon, name, description, Connect/Manage button
- Hover reveal (using `group`/`group-hover:opacity-100`): shows Last Sync, Health, Status, full-width CTA

**`RequestedTab`:** Form with text input + Submit. Shows success state on submit.

**`StatsStrip`:** Connected / Available / Coming Soon counts (horizontal).

**`categoryToTab()` mapping:**
```ts
"publishing"    → "publishing"
"analytics"     → "analytics"
"content_ai"    → "ai"
"communication" → "social"
others          → stays in "all"
```

---

## 11. Settings Section (`settings-section.tsx`)

**Two-pane layout** (Claude-style):
- Left sidebar: `w-52 shrink-0 sticky top-0 h-screen` with inner nav
- Right panel: scrollable content

**5 inner tabs:**
| Tab | Content |
|-----|---------|
| `general` | Profile card + goal mode grid |
| `billing` | Plan card, credit breakdown, invoices |
| `automation` | Toggles for auto-update, auto-publish, auto-linking, etc. |
| `brand` | Brand voice rules (always/never lists) |
| `team` | Member list, invite, agency mode toggle |

Active tab style: `border-l-2 border-teal-500 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/20`

---

## 12. Coming Soon Section (`coming-soon-section.tsx`)

**10 features** with vote counts. Sorted by votes descending. Local state only (`useState<Set<string>>`).

**Feature card layout:** Name, description, category badge, upvote button + count, "Most Wanted" badge for #1.

**Stats strip:** Total votes / Features planned / Your votes

**Suggest a feature form** at bottom.

---

## 13. Onboarding Flow

**Trigger:** `showOnboarding` state in `dashboard-client.tsx`. Set to `false` when onboarding completes.

**6 steps (0-indexed):**
| Step | Component | What it does |
|------|-----------|--------------|
| 0 | `StepAuth` | OTP login + goal selection |
| 1 | `StepWebsite` | URL input → rotating glow analyze → AI reveal |
| 2 | `StepCompetitors` | Confirm/edit competitors |
| 3 | `StepContact` | Optional phone + designation |
| 4 | `StepProcessing` | "Generating Business DNA" animated loader |
| 5 | `StepReview` | DNA review (3 tabs) + AI Growth Copilot panel |

**Visual system (all steps):**
- Background: `bg-gray-50 dark:bg-[#0e0e0e]` — adapts to system theme
- Slow rotating blurred glow in background (18s rotation, `blur(70px)`, very subtle)
- Cursor-following teal radial glow (follows `mousemove`)
- Cards: `border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90`
- Headings: `font-serif italic` (system serif — Georgia/Cambria)
- Analyzing card: rotating blurred conic gradient border (2.5s spin, `blur(14px)`)

**Step 1 "analyzing" phase rotating border technique:**
```tsx
// Outer: clips overflow, defines border radius
<div className="relative rounded-2xl overflow-hidden">
  {/* Oversized spinning element — centered (300% × 300%, top/left: -100%) */}
  <div style={{
    position: "absolute", width: "300%", height: "300%",
    top: "-100%", left: "-100%",
    background: "conic-gradient(from 0deg, transparent 55%, rgba(20,184,166,0.65) 67%, ...)",
    animation: "spin 2.5s linear infinite",
    filter: "blur(14px)",
  }} />
  {/* Inner card: 2px margin reveals the glow */}
  <div className="relative z-10 m-[2px] rounded-[14px] bg-white dark:bg-zinc-900/98">
    ...
  </div>
</div>
```

`spin` keyframe is globally defined by Tailwind when `animate-spin` is used anywhere.

---

## 14. Mock Data (`mock-data.ts`)

Key exports:
- `COMPANY`: Single company object (FinShield Insurance) — domain age, DA, traffic, CMS, health score, etc.
- `BLOGS`: Array of blog objects with status, traffic, keywords, score
- `COMPETITORS`: 4 competitor objects with domain, DA, sitemapUrls, threatScore
- `TRENDS`: 10 trend objects with keyword, volume, maturity, windowDays, trafficPotential
- `COMPETITOR_CHANGES`: Feed items for competitor activity section
- `INTEGRATIONS`: Integration objects with id, name, category, status, lastSync, healthScore, icon
- `REPORTS_DATA`: Traffic, keyword, and content performance data

All data is **static mock** — no API calls. Replace with real data by swapping the import source.

---

## 15. Types (`types.ts`)

Key interfaces:
```ts
interface Blog {
  id: string; title: string; status: "draft"|"published"|"scheduled";
  traffic: number; keywords: string[]; score: number; lastUpdated: string;
}

interface Competitor {
  domain: string; name: string; da: number; sitemapUrls: number; threatScore: number;
}

interface Trend {
  id: string; keyword: string; volume: number;
  maturity: "emerging"|"growing"|"saturated";
  windowDays: number|null; trafficPotential: "high"|"medium"|"low";
  difficulty: "low"|"medium"|"high"; confidence: number;
  competitorsCovering: number; youCovering: number;
}

interface Integration {
  id: string; name: string; description: string;
  category: "publishing"|"analytics"|"content_ai"|"communication";
  status: "connected"|"disconnected"|"coming-soon";
  lastSync?: string; healthScore?: number; icon: string;
}

interface CompetitorChange {
  competitor: string; type: "pages_added"|"pages_removed"|"homepage_messaging"|"new_service";
  count?: number; detail?: string; date: string;
}
```

---

## 16. Styling Conventions

**CSS variable classes (use these, not hardcoded colors):**
| Class | Dark | Light |
|-------|------|-------|
| `bg-app` | `#09090b` | `#f9fafb` |
| `bg-card` | `#18181b` | `#ffffff` |
| `text-fg` | `#fafafa` | `#09090b` |
| `text-muted-fg` | `#a1a1aa` | `#71717a` |
| `border-app` | `#27272a` | `#e4e4e7` |
| `bg-muted` | `#27272a` | `#f4f4f5` |

**Sticky tab bar pattern (copy exactly):**
```tsx
<div className="sticky top-0 z-10 bg-app -mx-6 px-6 border-b border-app">
  <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
    {/* tabs */}
  </div>
</div>
```

The `main` scroll container in `dashboard-client.tsx` is `overflow-y-auto`. Sticky positioning works relative to this scrollport.

**Section content container:**
All sections are rendered inside `<main className="flex-1 overflow-y-auto p-6">`. Sections receive this padding automatically — don't add extra outer padding.

**Hover reveal pattern (integrations cards):**
```tsx
<div className="group relative ...">
  {/* Default content */}
  <div className="...">default visible</div>
  
  {/* Hover reveal */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity ...">
    revealed content
  </div>
</div>
```

---

## 17. Adding a New Section — Step by Step

1. **Add the `SectionId`** to `types.ts` union
2. **Add label** to `SECTION_LABELS` in `topbar.tsx`
3. **Add nav item** to `NAV_ITEMS` in `sidebar.tsx` (with icon SVG)
4. **Create section file** at `sections/my-section/my-section-section.tsx`
   - Always `"use client"` at top
   - Export a named function: `export function MySection() { ... }`
   - Use `SectionHeader` from `../../_shared/section-header` for the page title
   - Use sticky tab bar pattern if tabbed
5. **Import and render** in `dashboard-client.tsx`:
   ```tsx
   import { MySection } from "./sections/my-section/my-section-section";
   // ...
   {activeSection === "my-section" && <MySection />}
   ```
6. **Run `npx tsc --noEmit`** to verify no TypeScript errors

---

## 18. Running Locally

```bash
cd tools-system
npm install
npm run dev     # starts on port 3000 (or 3001 if 3000 is in use)
```

Dashboard: `http://localhost:3000/dashboard`

Build check (no emit, just type-check):
```bash
npx tsc --noEmit
```

Production build:
```bash
npm run build
```

---

## 19. Key Constraints & Gotchas

- **No `useRouter()` in sections** — navigation is handled by `onNavigate` prop passed from `dashboard-client.tsx`. If a section needs to navigate, accept `onNavigate: (id: SectionId) => void` as a prop.
- **`Record<SectionId, T>` exhaustiveness** — TypeScript enforces every SectionId key is present. After adding/removing a SectionId, check `topbar.tsx` (`SECTION_LABELS`) and any other Record maps.
- **`WiSection` legacy alias** — `wi-section.tsx` exports both `CmoBrainSection` and `WiSection` (alias). Don't remove the alias until all references are updated.
- **No modal for blog creation** — `BlogWizardModal` was deleted. Blog creation is the inline `BlogWorkflow` accordion inside `create-section.tsx`.
- **Onboarding is not in router** — it renders over the dashboard via a state flag in `dashboard-client.tsx`, not via a separate route or page.
- **Billing is in both nav and settings** — `billing` SectionId can be navigated to directly (via user menu) and also appears as a tab inside the Settings section inner sidebar.
