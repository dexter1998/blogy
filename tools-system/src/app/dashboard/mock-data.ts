import type {
  Blog, Competitor, CompetitorChange, ScheduleEvent, Trend,
  Todo, Suggestion, Achievement, MarketplaceItem, Integration,
  AiFeedItem, RiskAlert, GscKeyword, ContentCluster, SeoIssue,
  DashboardSettings,
} from "./types";

export const COMPANY = {
  name: "FinShield Insurance",
  domain: "finshield.in",
  industry: "InsurTech",
  founded: 2020,
  cin: "U74999MH2020PTC123456",
  gst: "27AABCF1234A1Z5",
  cms: "WordPress 6.4",
  hosting: "AWS Mumbai",
  cdn: "Cloudflare",
  framework: "PHP / React (hybrid)",
  ssl: true,
  domainAge: "4 years",
  trafficEstimate: 12400,
  potentialTraffic: 48000,
  healthScore: 72,
  da: 28,
  pa: 34,
  sitemapUrls: 47,
  indexedPages: 1240,
  contentOpportunities: 53,
  missingKeywords: 17,
  competitorGaps: 8,
  tagline: "Insurance that works when it matters most",
  referringDomains: 43,
  growthScore: 72,
  growthTarget: 90,
  growthProgress: 24,
};

export const BRAND_COLORS = [
  { name: "Primary", hex: "#0F4C81", label: "Trust Blue" },
  { name: "Accent", hex: "#14B8A6", label: "Growth Teal" },
  { name: "Alert", hex: "#F59E0B", label: "Attention Amber" },
  { name: "Background", hex: "#F8FAFC", label: "Clean White" },
];

export const BRAND_FONTS = [
  { name: "Headlines", font: "Inter Bold", usage: "H1, H2, H3" },
  { name: "Body", font: "Inter Regular", usage: "Paragraphs, captions" },
];

export const AI_KNOWLEDGE = {
  targetAudience: "SME owners, salaried professionals aged 28–45",
  usp: "24-hour claim settlement. India's largest cashless hospital network in Tier 2 cities.",
  brandVoice: "Professional but approachable. Data-driven. Never condescending.",
  mustMention: ["24-hour claim settlement", "Cashless hospital network", "Plan comparison before buying"],
  mustAvoid: ["cheap", "budget", "affordable", "low-cost", "basic plan"],
  personas: [
    { name: "Startup Founder", age: "30–40", need: "Group health for 10–50 employees" },
    { name: "Salaried Professional", age: "28–35", need: "First insurance buyer, needs guidance" },
    { name: "HR Manager", age: "32–45", need: "Bulk policy + claims support" },
  ],
};

export const AI_LEARNING = [
  { insight: "Comparison articles get 42% more clicks on your site", source: "Based on 47 published blogs" },
  { insight: "Claim-related content has 3× better engagement time", source: "Top 10 performing pages" },
  { insight: "FAQs increase time-on-page by 28%", source: "GA4 scroll depth data" },
  { insight: "Tuesday publications perform 18% better than other days", source: "Publishing history analysis" },
  { insight: "'Best X in India' titles outperform 'How to X' by 31%", source: "CTR analysis from GSC" },
];

export const SEO_HEALTH_TIMELINE = [
  { month: "Jan", score: 63 },
  { month: "Feb", score: 67 },
  { month: "Mar", score: 68 },
  { month: "Apr", score: 72 },
  { month: "May", score: 72 },
];

export const COMPETITORS: Competitor[] = [
  { domain: "policybazaar.com", name: "PolicyBazaar", da: 72, sitemapUrls: 4200, threatScore: 92, distanceMonths: 18, contentGapPct: 94 },
  { domain: "acko.com", name: "Acko Insurance", da: 61, sitemapUrls: 1200, threatScore: 74, distanceMonths: 8, contentGapPct: 67 },
  { domain: "coverfox.com", name: "Coverfox", da: 54, sitemapUrls: 890, threatScore: 68, distanceMonths: 5, contentGapPct: 51 },
  { domain: "digit.in", name: "Digit Insurance", da: 48, sitemapUrls: 630, threatScore: 61, distanceMonths: 3, contentGapPct: 34 },
];

export const COMPETITOR_CHANGES: CompetitorChange[] = [
  { competitor: "PolicyBazaar", type: "pages_added", count: 12, date: "2 days ago" },
  { competitor: "Acko", type: "pages_removed", count: 4, date: "3 days ago" },
  { competitor: "Digit Insurance", type: "homepage_messaging", detail: "Changed headline to 'India's Simplest Insurance'", date: "1 week ago" },
  { competitor: "Coverfox", type: "new_service", detail: "Launched Cyber Insurance product page", date: "5 days ago" },
];

export const BLOGS: Blog[] = [
  { id: "b1", title: "Best Term Insurance Plans in India 2025", slug: "best-term-insurance-2025", status: "published", publishedAt: "2025-01-10", keywords: ["term insurance india", "best term plan 2025"], clicks: 3240, impressions: 42000, position: 4.2, isLiveDetected: true, wordCount: 2840, assignedTo: "Priya" },
  { id: "b2", title: "How to Compare Health Insurance Plans Online", slug: "compare-health-insurance-online", status: "published", publishedAt: "2025-01-22", keywords: ["compare health insurance", "health insurance comparison"], clicks: 2180, impressions: 31000, position: 6.8, isLiveDetected: true, wordCount: 2100, assignedTo: "Rachit" },
  { id: "b3", title: "Group Health Insurance for Startups: Complete Guide", slug: "group-health-insurance-startups", status: "published", publishedAt: "2025-02-05", keywords: ["group health insurance startup", "employee health insurance india"], clicks: 1840, impressions: 24000, position: 8.1, isLiveDetected: true, wordCount: 3200 },
  { id: "b4", title: "Term Insurance Tax Benefits Under Section 80C", slug: "term-insurance-tax-benefit-80c", status: "published", publishedAt: "2025-02-18", keywords: ["term insurance tax benefit", "80c insurance deduction"], clicks: 4100, impressions: 58000, position: 3.4, isLiveDetected: true, wordCount: 1980 },
  { id: "b5", title: "ULIP vs Mutual Fund: Which is Better in 2025?", slug: "ulip-vs-mutual-fund-2025", status: "published", publishedAt: "2025-03-02", keywords: ["ulip vs mutual fund", "ulip or mutual fund better"], clicks: 890, impressions: 18000, position: 11.2, isLiveDetected: true, wordCount: 2650 },
  { id: "b6", title: "Cashless Health Insurance: How It Works", slug: "cashless-health-insurance-guide", status: "published", publishedAt: "2025-03-15", keywords: ["cashless health insurance", "cashless claim process"], clicks: 1560, impressions: 22000, position: 7.3, isLiveDetected: true, wordCount: 1800 },
  { id: "b7", title: "Car Insurance Renewal Online: Step-by-Step", slug: "car-insurance-renewal-online", status: "published", publishedAt: "2025-03-28", keywords: ["car insurance renewal", "renew car insurance online"], clicks: 2740, impressions: 38000, position: 5.1, isLiveDetected: true, wordCount: 1500 },
  { id: "b8", title: "Travel Insurance for International Trips 2025", slug: "international-travel-insurance-2025", status: "published", publishedAt: "2025-04-10", keywords: ["international travel insurance", "travel insurance india"], clicks: 980, impressions: 14000, position: 9.8, isLiveDetected: false, wordCount: 2100 },
  { id: "b9", title: "Health Insurance for Senior Citizens: Best Options", slug: "health-insurance-senior-citizens", status: "published", publishedAt: "2025-04-22", keywords: ["senior citizen health insurance", "health insurance elderly india"], clicks: 1200, impressions: 16000, position: 8.7, isLiveDetected: true, wordCount: 2400 },
  { id: "b10", title: "Life Insurance vs Term Insurance: Key Differences", slug: "life-vs-term-insurance", status: "published", publishedAt: "2025-05-01", keywords: ["life insurance vs term insurance", "difference term life insurance"], clicks: 3800, impressions: 51000, position: 3.9, isLiveDetected: true, wordCount: 2200 },
  { id: "b11", title: "Cyber Insurance for Small Businesses in India", slug: "cyber-insurance-small-business-india", status: "scheduled", scheduledAt: "2025-06-03", keywords: ["cyber insurance india", "cyber liability insurance small business"], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 0, assignedTo: "Rachit", dueDate: "Jun 3" },
  { id: "b12", title: "Best Family Floater Health Insurance Plans 2025", slug: "best-family-floater-insurance-2025", status: "scheduled", scheduledAt: "2025-06-08", keywords: ["family floater health insurance", "best family health plan"], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 0, dueDate: "Jun 8" },
  { id: "b13", title: "How to File a Health Insurance Claim Online", slug: "file-health-insurance-claim-online", status: "scheduled", scheduledAt: "2025-06-12", keywords: ["health insurance claim process", "file insurance claim online"], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 0, dueDate: "Jun 12" },
  { id: "b14", title: "Motor Insurance Third Party vs Comprehensive", slug: "motor-insurance-third-party-comprehensive", status: "draft", keywords: [], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 320, assignedTo: "Priya" },
  { id: "b15", title: "Health Insurance Portability: Everything You Need to Know", slug: "health-insurance-portability-guide", status: "draft", keywords: [], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 0 },
  { id: "b16", title: "Top 10 Reasons Your Insurance Claim Gets Rejected", slug: "insurance-claim-rejection-reasons", status: "draft", keywords: [], clicks: 0, impressions: 0, position: 0, isLiveDetected: false, wordCount: 580 },
];

export const CONTENT_DECAY: Blog[] = [
  { ...BLOGS[4], clicks: 290, impressions: 7000 } as Blog,
  { ...BLOGS[7], clicks: 310, impressions: 6200 } as Blog,
];

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    topic: "Health Insurance",
    coverage: 72,
    subtopics: [
      { title: "Best Health Insurance Plans India 2025", published: true, url: "/best-health-insurance-india" },
      { title: "Cashless Health Insurance Guide", published: true, url: "/cashless-health-insurance-guide" },
      { title: "Health Insurance for Senior Citizens", published: true, url: "/health-insurance-senior-citizens" },
      { title: "Family Floater Health Insurance", published: true, url: "/family-floater-plans" },
      { title: "Health Insurance Claim Process", published: false },
      { title: "Maternity Insurance Coverage", published: false },
    ],
  },
  {
    topic: "Term Insurance",
    coverage: 85,
    subtopics: [
      { title: "Best Term Insurance Plans 2025", published: true },
      { title: "Term Insurance Tax Benefit 80C", published: true },
      { title: "Life vs Term Insurance", published: true },
      { title: "Term Insurance for NRIs", published: false },
    ],
  },
  {
    topic: "Car Insurance",
    coverage: 40,
    subtopics: [
      { title: "Car Insurance Renewal Online", published: true },
      { title: "Third Party vs Comprehensive Motor Insurance", published: false },
      { title: "No-Claim Bonus Guide", published: false },
      { title: "Car Insurance Claims Process", published: false },
    ],
  },
  {
    topic: "Travel Insurance",
    coverage: 20,
    subtopics: [
      { title: "International Travel Insurance 2025", published: true },
      { title: "Domestic Travel Insurance India", published: false },
      { title: "Student Travel Insurance Guide", published: false },
      { title: "Adventure Sports Travel Coverage", published: false },
    ],
  },
  {
    topic: "Group Health Insurance",
    coverage: 30,
    subtopics: [
      { title: "Group Health Insurance for Startups", published: true },
      { title: "Employee Benefits: Health Coverage Guide", published: false },
      { title: "SME Group Insurance Comparison", published: false },
      { title: "HR Guide to Group Health Policies", published: false },
    ],
  },
];

export const SEO_ISSUES: SeoIssue[] = [
  { id: "i1", severity: "critical", title: "/health-insurance-comparison has 0 internal links", page: "/health-insurance-comparison", recommendation: "Add 5 internal links from related articles" },
  { id: "i2", severity: "critical", title: "/ulip-vs-mutual-fund-2025 returning soft 404", page: "/ulip-vs-mutual-fund-2025", recommendation: "Fix page content or redirect to canonical" },
  { id: "i3", severity: "critical", title: "Crawl blocked: /group-health-sme in robots.txt", page: "/group-health-sme", recommendation: "Remove disallow rule from robots.txt" },
  { id: "i4", severity: "high", title: "9 pages last updated over 6 months ago", recommendation: "Refresh content for freshness score" },
  { id: "i5", severity: "high", title: "14 blog posts missing meta descriptions", recommendation: "Add unique meta descriptions under 160 chars" },
  { id: "i6", severity: "high", title: "6 pages not indexed (pending)", recommendation: "Request indexing via GSC" },
  { id: "i7", severity: "medium", title: "23 images missing alt text", recommendation: "Add descriptive alt tags for accessibility and SEO" },
  { id: "i8", severity: "medium", title: "Weak internal link structure on Term Insurance cluster", recommendation: "Add cross-links between term insurance articles" },
  { id: "i9", severity: "low", title: "12 pages with title tags over 60 characters", recommendation: "Trim titles to 55–60 characters" },
];

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: "e1", title: "Term Insurance Guide 2025", type: "blog", date: "2025-05-26" },
  { id: "e2", title: "Instagram: Health Awareness Week", type: "social", date: "2025-05-27" },
  { id: "e3", title: "Product Demo: ULIPs Explained", type: "video", date: "2025-05-28" },
  { id: "e4", title: "LinkedIn: SME Insurance Tips", type: "social", date: "2025-05-29" },
  { id: "e5", title: "Claim Process Step-by-Step Guide", type: "blog", date: "2025-06-02" },
  { id: "e6", title: "OG Image: Senior Citizen Insurance", type: "image", date: "2025-06-03" },
  { id: "e7", title: "Cyber Insurance for SMEs", type: "blog", date: "2025-06-03" },
  { id: "e8", title: "Twitter: Insurance Myth-Busting Thread", type: "social", date: "2025-06-05" },
  { id: "e9", title: "Family Floater Plans 2025", type: "blog", date: "2025-06-08" },
  { id: "e10", title: "YouTube: How to Choose Health Insurance", type: "video", date: "2025-06-10" },
  { id: "e11", title: "Health Insurance Claim Online", type: "blog", date: "2025-06-12" },
  { id: "e12", title: "LinkedIn: Group Health Benefits for HR Teams", type: "social", date: "2025-06-14" },
  { id: "e13", title: "Motor Insurance Comparison Deep-Dive", type: "blog", date: "2025-06-17" },
  { id: "e14", title: "Instagram: Travel Insurance Essentials", type: "image", date: "2025-06-19" },
];

export const TRENDS: Trend[] = [
  { id: "t1", keyword: "group health insurance for startups", volume: 2900, maturity: "emerging", windowDays: 7, competitorsCovering: 8, youCovering: 1, trafficPotential: "high", leadPotential: "high", difficulty: "low", confidence: 94 },
  { id: "t2", keyword: "ULIP vs mutual fund 2025", volume: 18000, maturity: "growing", windowDays: 14, competitorsCovering: 12, youCovering: 1, trafficPotential: "high", leadPotential: "medium", difficulty: "medium", confidence: 87 },
  { id: "t3", keyword: "cyber insurance india 2025", volume: 4400, maturity: "emerging", windowDays: 7, competitorsCovering: 3, youCovering: 0, trafficPotential: "medium", leadPotential: "high", difficulty: "low", confidence: 91 },
  { id: "t4", keyword: "term insurance section 80c benefit", volume: 33000, maturity: "growing", windowDays: 30, competitorsCovering: 18, youCovering: 1, trafficPotential: "high", leadPotential: "medium", difficulty: "medium", confidence: 82 },
  { id: "t5", keyword: "LIC new jeevan anand", volume: 9000, maturity: "saturated", windowDays: null, competitorsCovering: 25, youCovering: 0, trafficPotential: "medium", leadPotential: "low", difficulty: "high", confidence: 61 },
  { id: "t6", keyword: "insurance portability rules 2025", volume: 6200, maturity: "emerging", windowDays: 14, competitorsCovering: 4, youCovering: 0, trafficPotential: "medium", leadPotential: "high", difficulty: "low", confidence: 88 },
];

export const TODOS: Todo[] = [
  { id: "td1", title: "Create: Group Health Insurance for Startups (pillar)", effort: "medium", impact: "high", reason: "PolicyBazaar (#1), Acko (#2), Coverfox (#4) all rank. You have zero pillar content.", trafficPotential: 4200, confidence: 94, done: false },
  { id: "td2", title: "Add FAQ schema to /best-term-insurance-2025", effort: "low", impact: "high", reason: "This page gets 42K impressions but only 3.2K clicks (7.6% CTR). FAQ schema can double CTR.", trafficPotential: 3200, confidence: 87, done: false },
  { id: "td3", title: "Update /ulip-vs-mutual-fund-2025 — content is 14 months old", effort: "low", impact: "high", reason: "Page dropped from #7 to #11. Freshness decay detected. Competitor published fresher guide.", trafficPotential: 1800, confidence: 83, done: false },
  { id: "td4", title: "Fix crawl block on /group-health-sme (robots.txt)", effort: "low", impact: "high", reason: "Critical: Google cannot crawl this page. You're losing potential rankings.", trafficPotential: 2100, confidence: 96, done: false },
  { id: "td5", title: "Add 5 internal links to /health-insurance-comparison", effort: "low", impact: "medium", reason: "Zero internal links = low page authority. Related articles exist that should link here.", trafficPotential: 800, confidence: 79, done: false },
  { id: "td6", title: "Connect Google Search Console to unlock real-time data", effort: "low", impact: "high", reason: "Without GSC, Blogy cannot show real click/impression data. You're flying blind.", trafficPotential: 0, confidence: 100, done: false },
];

export const SUGGESTIONS: Suggestion[] = [
  { id: "sg1", title: "Publish: Cyber Insurance for SMEs (emerging)", description: "Competitor Coverfox just launched a Cyber Insurance page. You have zero content here.", reason: "Coverfox launched Cyber Insurance 5 days ago. First-mover advantage available for ~7 more days before competition intensifies.", impact: "high", confidence: 91, trafficPotential: 3800 },
  { id: "sg2", title: "Target: 'insurance portability rules 2025' — high opportunity", description: "Only 4 competitors cover this. Volume is growing 40% MoM.", reason: "Google Trends shows 40% MoM growth. PolicyBazaar has no content on this yet.", impact: "high", confidence: 88, trafficPotential: 2400 },
  { id: "sg3", title: "Build Travel Insurance cluster (coverage only 20%)", description: "Your Travel Insurance cluster has 1 article vs competitors' 8-12. Massive gap.", reason: "Acko has 11 travel insurance articles. You have 1. Coverage gap of 80% means you're invisible for most travel queries.", impact: "medium", confidence: 82, trafficPotential: 5200 },
  { id: "sg4", title: "Acquire backlink from moneymint.com (DA 42)", description: "They published a health insurance comparison article without linking to FinShield.", reason: "Moneymint.com published 'Best Health Insurance 2025' 3 days ago and linked to PolicyBazaar and Coverfox, not you.", impact: "medium", confidence: 76, trafficPotential: 0 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ac1", title: "First Blog Published", description: "Publish your first piece of content", pct: 100, completedAt: "2024-03-15", icon: "📝" },
  { id: "ac2", title: "10 Keywords Ranked", description: "Get 10 keywords into top 100 results", pct: 100, completedAt: "2024-07-02", icon: "🔑" },
  { id: "ac3", title: "1,000 Impressions", description: "Reach 1,000 monthly impressions in GSC", pct: 100, completedAt: "2024-09-10", icon: "👁" },
  { id: "ac4", title: "10,000 Impressions", description: "Reach 10,000 monthly impressions", pct: 100, completedAt: "2025-01-08", icon: "🚀" },
  { id: "ac5", title: "First 100 Clicks", description: "Get 100 organic clicks in a month", pct: 100, completedAt: "2024-11-20", icon: "🖱" },
  { id: "ac6", title: "50,000 Impressions", description: "Reach 50,000 monthly impressions", pct: 74, completedAt: null, icon: "⭐" },
  { id: "ac7", title: "First Backlink Earned", description: "Earn a backlink from an external domain", pct: 100, completedAt: "2024-12-05", icon: "🔗" },
  { id: "ac8", title: "100 Referring Domains", description: "Build 100 unique referring domains", pct: 43, completedAt: null, icon: "🌐" },
  { id: "ac9", title: "50 Blogs Published", description: "Publish 50 pieces of content", pct: 94, completedAt: null, icon: "📚" },
  { id: "ac10", title: "Page 1 Ranking", description: "Rank on page 1 for any keyword", pct: 100, completedAt: "2025-02-14", icon: "🥇" },
];

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: "m1", category: "Guest Post", type: "guest_post", site: "startupindiastory.com", da: 38, price: 2999, upsellReason: "Competitor coverfox.com was featured here last month. Same audience, same authority signal." },
  { id: "m2", category: "PR Package", type: "pr", site: "CNBC TV18 Digital", da: 84, price: 18000, upsellReason: "Trending keyword 'insurance startup India' spiking. Ideal PR window — act in next 14 days." },
  { id: "m3", category: "Backlink", type: "backlink", site: "moneymint.com", da: 42, price: 1499, upsellReason: "They published 'Best Health Insurance 2025' without linking to you. Easy outreach win." },
  { id: "m4", category: "Guest Post", type: "guest_post", site: "yourstory.com", da: 61, price: 7999, upsellReason: "Your DA is 31 points below competitors. Authority gap is your #1 growth blocker." },
  { id: "m5", category: "GEO Package", type: "geo", site: "LLMs.txt Optimization", da: 0, price: 4999, upsellReason: "ChatGPT and Perplexity are answering insurance questions. You have zero AI presence." },
  { id: "m6", category: "Social Promotion", type: "social", site: "LinkedIn Sponsored", da: 0, price: 3499, upsellReason: "Your HR Manager persona is most active on LinkedIn. Group health content gets 3× more engagement there." },
];

export const INTEGRATIONS: Integration[] = [
  { id: "wp", name: "WordPress", description: "Publish blogs directly to your WordPress site", category: "publishing", status: "connected", lastSync: "2 hrs ago", healthScore: 96, icon: "W" },
  { id: "shopify", name: "Shopify", description: "Publish content to your Shopify blog", category: "publishing", status: "disconnected", icon: "S" },
  { id: "wix", name: "Wix", description: "Publish to Wix CMS automatically", category: "publishing", status: "coming-soon", icon: "W" },
  { id: "webflow", name: "Webflow", description: "Push content to Webflow CMS", category: "publishing", status: "coming-soon", icon: "W" },
  { id: "ga4", name: "Google Analytics 4", description: "Import real traffic and conversion data", category: "analytics", status: "connected", lastSync: "3 min ago", healthScore: 99, icon: "G" },
  { id: "gsc", name: "Google Search Console", description: "Import impressions, clicks, and ranking data", category: "analytics", status: "disconnected", icon: "G" },
  { id: "clarity", name: "Microsoft Clarity", description: "Heatmaps and session recordings", category: "analytics", status: "disconnected", icon: "C" },
  { id: "openai", name: "OpenAI GPT-4o", description: "Use GPT-4o as content generation engine", category: "content_ai", status: "connected", lastSync: "Active", healthScore: 100, icon: "O" },
  { id: "gemini", name: "Google Gemini", description: "Alternative AI model for content generation", category: "content_ai", status: "disconnected", icon: "G" },
  { id: "claude", name: "Claude (Anthropic)", description: "Anthropic Claude for long-form content", category: "content_ai", status: "disconnected", icon: "A" },
  { id: "slack", name: "Slack", description: "Get weekly reports and alerts in Slack", category: "communication", status: "disconnected", icon: "S" },
  { id: "discord", name: "Discord", description: "Alerts and report delivery via Discord", category: "communication", status: "disconnected", icon: "D" },
  { id: "teams", name: "Microsoft Teams", description: "Weekly reports in your Teams workspace", category: "communication", status: "coming-soon", icon: "T" },
];

export const AI_FEED: AiFeedItem[] = [
  { id: "f1", type: "keyword", text: "New opportunity: 'group health insurance for startups' (2,900/mo) — 3 competitors rank, you don't", time: "2 min ago" },
  { id: "f2", type: "rank_drop", text: "Page '/ulip-vs-mutual-fund-2025' dropped from #7 to #11 — freshness decay detected", time: "1 hr ago" },
  { id: "f3", type: "backlink", text: "Backlink opportunity: moneymint.com published health insurance comparison without linking to you", time: "3 hrs ago" },
  { id: "f4", type: "trend", text: "Trending now: 'ULIP vs Mutual Fund 2025' spiking on Google Trends (+40% last 7 days)", time: "5 hrs ago" },
  { id: "f5", type: "competitor", text: "PolicyBazaar published 3 new blogs today — 2 targeting your keywords", time: "6 hrs ago" },
  { id: "f6", type: "rank_rise", text: "Page '/best-term-insurance-2025' moved from #5 to #4 — CTR improved", time: "Yesterday" },
  { id: "f7", type: "index", text: "3 pages still not indexed after 12 days — recommend requesting GSC indexing", time: "Yesterday" },
];

export const RISK_ALERTS: RiskAlert[] = [
  { type: "traffic", text: "Traffic dropped 8.2% this week vs last week — 2 decaying blogs detected", severity: "warn" },
  { type: "sitemap", text: "3 pages returning 404 in sitemap — estimated loss: 840 visitors/month", severity: "bad" },
];

export const GSC_WEEKS = ["Mar 10", "Mar 17", "Mar 24", "Mar 31", "Apr 7", "Apr 14", "Apr 21", "Apr 28", "May 5", "May 12", "May 19", "May 24"];
export const GSC_IMPRESSIONS = [28400, 31200, 29800, 33100, 35400, 34200, 38600, 41200, 39800, 43100, 44200, 42800];
export const GSC_CLICKS = [840, 920, 870, 1010, 1120, 1080, 1240, 1380, 1290, 1440, 1520, 1480];
export const GSC_CTR = [2.9, 2.95, 2.92, 3.05, 3.16, 3.16, 3.21, 3.35, 3.24, 3.34, 3.44, 3.46];
export const GSC_POSITION = [18.4, 17.2, 17.8, 16.9, 16.1, 15.8, 15.2, 14.6, 14.2, 13.8, 13.4, 14.2];

export const GSC_KEYWORDS: GscKeyword[] = [
  { keyword: "best term insurance india", impressions: 8200, clicks: 310, ctr: 3.78, position: 6.2 },
  { keyword: "health insurance comparison india", impressions: 6400, clicks: 248, ctr: 3.88, position: 7.1 },
  { keyword: "group health insurance startup", impressions: 4100, clicks: 142, ctr: 3.46, position: 8.4 },
  { keyword: "term insurance tax benefit 80c", impressions: 9800, clicks: 310, ctr: 3.16, position: 4.1 },
  { keyword: "car insurance renewal online", impressions: 7200, clicks: 198, ctr: 2.75, position: 5.8 },
  { keyword: "cashless health insurance guide", impressions: 3800, clicks: 112, ctr: 2.95, position: 9.2 },
  { keyword: "life vs term insurance india", impressions: 11200, clicks: 420, ctr: 3.75, position: 3.9 },
  { keyword: "ulip vs mutual fund 2025", impressions: 5600, clicks: 98, ctr: 1.75, position: 11.4 },
];

export const GA4_DAYS = ["May 17", "May 18", "May 19", "May 20", "May 21", "May 22", "May 23"];
export const GA4_USERS = [312, 298, 341, 389, 362, 278, 212];
export const GA4_PREV_USERS = [288, 321, 298, 344, 401, 312, 252];
export const GA4_SESSIONS = [428, 381, 442, 512, 467, 348, 281];
export const GA4_BOUNCE = [62, 58, 61, 54, 57, 64, 68];

export const CONTENT_ROI = {
  total: 47,
  indexed: 41,
  ranking: 29,
  trafficDrivers: 14,
  leadDrivers: 6,
  decaying: 12,
};

export const RANKING_WINNERS = [
  { title: "Life vs Term Insurance", change: "+3", from: 6, to: 3 },
  { title: "Best Term Insurance 2025", change: "+1", from: 5, to: 4 },
  { title: "Car Insurance Renewal", change: "+2", from: 7, to: 5 },
];

export const RANKING_LOSERS = [
  { title: "ULIP vs Mutual Fund 2025", change: "-4", from: 7, to: 11 },
  { title: "Travel Insurance 2025", change: "-2", from: 8, to: 10 },
  { title: "Cashless Health Insurance", change: "-1", from: 6, to: 7 },
];

export const WIN_LOSS_REASONS = {
  "Life vs Term Insurance": { type: "win", reasons: ["3 new backlinks acquired this week", "CTR improved from 2.1% to 3.8%", "Competitor page lost featured snippet position"] },
  "ULIP vs Mutual Fund 2025": { type: "loss", reasons: ["Lost 2 referring backlinks", "Content freshness score low (14 months since update)", "Digit Insurance published a more comprehensive guide last week"] },
};

export const PUBLISHING_VELOCITY = { current: 3, recommended: 8, unit: "blogs/week" };

export const CREDIT_FORECAST = { used: 1840, total: 3000, exhaustionDays: 22 };

export const CHANGED_SINCE_LOGIN = {
  daysAgo: 2,
  indexedPages: 4,
  newKeywords: 2,
  competitorChanges: 1,
  opportunities: 3,
  trafficChange: "+8.2%",
};

export const AUTOPILOT_STATUS = {
  sitemapMonitoring: true,
  competitorTracking: true,
  trendDiscovery: true,
  publishDetection: true,
  gscConnected: false,
  autoPublishing: false,
};

export const ACTION_HISTORY = {
  blogsGenerated: 12,
  indexingIssues: 4,
  competitorChanges: 2,
  opportunities: 17,
  blogsPublished: 8,
  sitemapUrlsMonitored: 47,
  competitorsTracked: 4,
};

export const GROWTH_SCORE_ACTIONS = [
  { action: "Connect Google Search Console", points: 3, cta: "Connect" },
  { action: "Fix 3 critical indexing issues", points: 4, cta: "Fix Issues" },
  { action: "Publish Health Insurance cluster article", points: 2, cta: "Create" },
];

export const STREAK = { weeks: 4, unit: "weeks consistent publishing" };

export const DEFAULT_SETTINGS: DashboardSettings = {
  autoUpdateBlogs: false,
  autoPublish: false,
  autoInternalLinking: false,
  backlinkExchange: true,
  weeklyReport: true,
  goalMode: "leads",
};

export const STRATEGY = {
  goal: "Lead Generation",
  northStar: "10,000 qualified leads in 12 months",
  primaryCluster: "Health Insurance",
  secondaryCluster: "Group Health Insurance",
  tertiaryCluster: "Term Insurance",
  publishingFrequency: { current: 3, target: 8 },
  keywordMix: { commercial: 60, informational: 30, transactional: 10 },
  contentMix: { comparison: 8, pillar: 3, cluster: 56 },
  currentTraffic: 12400,
  targetTraffic: 50000,
  progress: 24,
  roadmap: [
    { month: "Month 1 (Now)", milestone: "Foundation", detail: "Fix 37 SEO issues, setup GSC tracking" },
    { month: "Month 2", milestone: "Topical Authority", detail: "20 cluster blogs for Health Insurance" },
    { month: "Month 3", milestone: "Expansion", detail: "Build Group Health Insurance cluster" },
    { month: "Month 4", milestone: "Scale", detail: "8 blogs/week + backlink campaign" },
  ],
};

export const MOCK_BLOG_TEXT = `Term insurance is the purest form of life insurance — you pay a fixed premium, and your family receives a sum assured if something happens to you during the policy term.

In 2025, with rising living costs and financial responsibilities, term insurance isn't optional anymore. It's essential.

## How to Choose the Right Term Insurance Plan

The right plan depends on three things: coverage amount, policy term, and premium affordability.

**Coverage Amount**
A general rule of thumb: your sum assured should be at least 10-15x your annual income. If you earn ₹10 lakh per year, aim for ₹1-1.5 crore in coverage.

**Policy Term**
Choose a term that covers your peak earning and responsibility years. Most financial advisors recommend covering yourself until age 60-65.

**Claim Settlement Ratio**
This is often overlooked but critical. A company's CSR (Claim Settlement Ratio) tells you how many claims they actually settled vs. how many were filed. FinShield Insurance maintains a 98.7% CSR — among the highest in the industry.

## Top Term Insurance Plans in India 2025

| Plan | Sum Assured | Premium (30yr, ₹1Cr) | CSR |
|------|-------------|----------------------|-----|
| FinShield Protect Plus | ₹25L - ₹5Cr | ₹9,800/year | 98.7% |`;

export const MOCK_HTML_PREVIEW = `<h1>Best Term Insurance Plans in India 2025</h1>
<p class="lead">Term insurance is the purest form of life insurance. In 2025, with rising costs, it's not optional — it's essential.</p>
<h2>How to Choose the Right Term Insurance</h2>
<p>The right plan depends on three things: <strong>coverage amount</strong>, policy term, and premium affordability.</p>
<h3>Coverage Amount</h3>
<p>Aim for 10–15× your annual income. Earning ₹10L/year? Get ₹1–1.5 crore in coverage.</p>
<h3>Claim Settlement Ratio</h3>
<p>FinShield Insurance maintains a <strong>98.7% CSR</strong> — among the highest in India.</p>
<h2>Top Plans in 2025</h2>
<table><tr><th>Plan</th><th>Premium</th><th>CSR</th></tr><tr><td>FinShield Protect Plus</td><td>₹9,800/yr</td><td>98.7%</td></tr></table>`;
