"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DrilldownShell, type Row } from "../_drilldown/drilldown-shell";

async function loadLinks(url: string): Promise<{ rows: Row[]; total?: number; error?: string }> {
  const res = await fetch("/api/v1/website-intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, depth: 12 }),
  });
  const json = await res.json();
  if (!json.ok) return { rows: [], error: json.error?.message ?? "Failed to load" };
  const ia = json.data?.result?.signals?.internalArchitecture;
  const sample: Array<{ url: string; count: number }> = ia?.internalSample ?? [];
  return {
    rows: sample.map((s) => ({
      primary: s.url,
      href: s.url,
      meta: `${s.count}× linked`,
    })),
    total: ia?.uniqueInternalUrls,
  };
}

function Inner() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";
  if (!url) return <div className="container py-10 text-sm text-muted-fg">Missing ?url= parameter.</div>;
  return (
    <DrilldownShell
      title="Internal Links"
      subtitle="Most-linked internal URLs from a bounded crawl (sorted by inbound count)"
      url={url}
      fetchRows={loadLinks}
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
