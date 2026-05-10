export type InternalLinkInput = {
  url: string;
  /** Pagination offset for the link list slice (default 0). */
  offset?: number;
  /** Pagination limit for the link list slice (default 500, max 500). */
  limit?: number;
  fresh?: boolean;
};

export type LinkSection = "navbar" | "footer" | "body";
export type LinkScope = "internal" | "external";

export type ExtractedLink = {
  /** Resolved absolute URL. */
  url: string;
  /** Raw href as written in the HTML. */
  href: string;
  /** Visible anchor text (collapsed whitespace). */
  text: string;
  section: LinkSection;
  scope: LinkScope;
  rel: string | null;
  /** Status code from the live check; null = no response (timeout/network). */
  status: number | null;
  /** True when status is null or >= 400. */
  broken: boolean;
};

export type SectionCounts = {
  total: number;
  internal: number;
  external: number;
  broken: number;
};

export type InternalLinkResult = {
  /** The fetched page URL (post-redirect). */
  pageUrl: string;
  /** The origin of the fetched page. */
  origin: string;
  /** Registrable hostname used to bucket internal vs external. */
  baseHost: string;
  /** Status of the source page fetch. */
  pageStatus: number | null;
  pageTitle: string | null;
  fetchedAt: string;

  totals: {
    all: SectionCounts;
    navbar: SectionCounts;
    footer: SectionCounts;
    body: SectionCounts;
  };

  /** Sliced view, governed by offset/limit on the request. */
  page: {
    offset: number;
    limit: number;
    total: number;
    links: ExtractedLink[];
  };
};
