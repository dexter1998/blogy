"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DrilldownShell, type Row } from "../_drilldown/drilldown-shell";

async function loadSocial(url: string): Promise<{ rows: Row[]; total?: number; error?: string }> {
  const res = await fetch("/api/v1/website-intelligence/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.ok) return { rows: [], error: json.error?.message ?? "Failed to load" };
  const sig = json.data?.result?.signal;
  const links: Array<{ platform: string; url: string }> = sig?.links ?? [];
  return {
    rows: links.map((l) => ({ primary: l.url, href: l.url, meta: l.platform })),
    total: sig?.count,
  };
}

function Inner() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";
  if (!url) return <div className="container py-10 text-sm text-muted-fg">Missing ?url= parameter.</div>;
  return (
    <DrilldownShell
      title="Social Profiles"
      subtitle="Detected social media links across LinkedIn, X, Instagram, GitHub, YouTube, and more"
      url={url}
      fetchRows={loadSocial}
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
