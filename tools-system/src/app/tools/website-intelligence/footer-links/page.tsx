"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DrilldownShell, type Row } from "../_drilldown/drilldown-shell";

async function loadFooter(url: string): Promise<{ rows: Row[]; total?: number; error?: string }> {
  const res = await fetch("/api/v1/website-intelligence/footer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.ok) return { rows: [], error: json.error?.message ?? "Failed to load" };
  const sig = json.data?.result?.signal;
  const links: Array<{ text: string; href: string }> = sig?.links ?? [];
  return {
    rows: links.map((l) => ({ primary: l.text || l.href, secondary: l.href, href: l.href })),
    total: sig?.totalLinks,
  };
}

function Inner() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";
  if (!url) return <div className="container py-10 text-sm text-muted-fg">Missing ?url= parameter.</div>;
  return (
    <DrilldownShell
      title="Footer Links"
      subtitle="Every link in the site footer — anchor text + destination"
      url={url}
      fetchRows={loadFooter}
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
