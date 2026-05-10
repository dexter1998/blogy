"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DrilldownShell, type Row } from "../_drilldown/drilldown-shell";

async function loadSitemap(url: string): Promise<{ rows: Row[]; total?: number; error?: string }> {
  const res = await fetch("/api/v1/sitemap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.ok) return { rows: [], error: json.error?.message ?? "Failed to load" };
  const data = json.data?.result;
  const urls: Array<{ loc: string; lastmod: string | null; priority: number | null; changefreq: string | null; source: string }> = data?.urls ?? [];
  return {
    rows: urls.map((u) => ({
      primary: u.loc,
      href: u.loc,
      secondary: u.source ? `from ${u.source}` : undefined,
      meta: [u.lastmod, u.priority != null ? `p=${u.priority}` : null, u.changefreq].filter(Boolean).join(" · "),
    })),
    total: data?.stats?.totalUrls,
  };
}

function Inner() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";
  if (!url) {
    return <div className="container py-10 text-sm text-muted-fg">Missing ?url= parameter.</div>;
  }
  return (
    <DrilldownShell
      title="Sitemap URLs"
      subtitle="Full URL list expanded from robots.txt + sitemap-index trees"
      url={url}
      fetchRows={loadSitemap}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="container py-10 text-sm text-muted-fg">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
