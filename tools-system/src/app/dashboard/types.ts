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

export type BlogStatus = "published" | "scheduled" | "draft" | "generating";
export type ContentType = "blog" | "social" | "video" | "image";
export type TrendMaturity = "emerging" | "growing" | "saturated";
export type GoalMode = "traffic" | "leads" | "sales" | "authority";
export type ReportsTab = "blogy" | "gsc" | "ga4";
export type TodosTab = "todos" | "suggestions" | "achievements";
export type CalView = "month" | "week" | "day";
export type Effort = "low" | "medium" | "high";
export type Impact = "low" | "medium" | "high";
export type IntegrationStatus = "connected" | "disconnected" | "coming-soon";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  status: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;
  keywords: string[];
  clicks: number;
  impressions: number;
  position: number;
  isLiveDetected: boolean;
  assignedTo?: string;
  dueDate?: string;
  wordCount: number;
}

export interface Competitor {
  domain: string;
  name: string;
  da: number;
  sitemapUrls: number;
  threatScore: number;
  distanceMonths: number;
  contentGapPct: number;
}

export interface CompetitorChange {
  competitor: string;
  type: "pages_added" | "pages_removed" | "homepage_messaging" | "new_service";
  detail?: string;
  count?: number;
  date: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ContentType;
  date: string;
}

export interface Trend {
  id: string;
  keyword: string;
  volume: number;
  maturity: TrendMaturity;
  windowDays: number | null;
  competitorsCovering: number;
  youCovering: number;
  trafficPotential: "high" | "medium" | "low";
  leadPotential: "high" | "medium" | "low";
  difficulty: "low" | "medium" | "high";
  confidence: number;
}

export interface Todo {
  id: string;
  title: string;
  effort: Effort;
  impact: Impact;
  reason: string;
  done: boolean;
  trafficPotential?: number;
  confidence?: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  impact: Impact;
  confidence: number;
  trafficPotential?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  pct: number;
  completedAt: string | null;
  icon: string;
}

export interface MarketplaceItem {
  id: string;
  category: string;
  site: string;
  da: number;
  price: number;
  upsellReason: string;
  type: "backlink" | "guest_post" | "pr" | "social" | "geo";
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: "publishing" | "analytics" | "content_ai" | "communication";
  status: IntegrationStatus;
  lastSync?: string;
  healthScore?: number;
  icon: string;
}

export interface AiFeedItem {
  id: string;
  type: "keyword" | "rank_drop" | "rank_rise" | "backlink" | "trend" | "competitor" | "index";
  text: string;
  time: string;
}

export interface RiskAlert {
  type: "traffic" | "sitemap" | "index" | "backlink";
  text: string;
  severity: "warn" | "bad";
}

export interface GscKeyword {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface ContentCluster {
  topic: string;
  coverage: number;
  subtopics: Array<{ title: string; published: boolean; url?: string }>;
}

export interface WizardDraft {
  title: string;
  keywords: string[];
  intent: "informational" | "commercial" | "transactional";
  internalLinks: string[];
  references: string[];
}

export interface DashboardSettings {
  autoUpdateBlogs: boolean;
  autoPublish: boolean;
  autoInternalLinking: boolean;
  backlinkExchange: boolean;
  weeklyReport: boolean;
  goalMode: GoalMode;
}

export interface SeoIssue {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  page?: string;
  recommendation: string;
}
