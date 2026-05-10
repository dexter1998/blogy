"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DrilldownShell, type Row } from "../_drilldown/drilldown-shell";

async function loadSchema(url: string): Promise<{ rows: Row[]; total?: number; error?: string }> {
  const res = await fetch("/api/v1/schema", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.ok) return { rows: [], error: json.error?.message ?? "Failed to load" };
  const data = json.data?.result;
  const items: Array<{ format: string; type: string; errors?: string[]; warnings?: string[] }> = data?.items ?? [];
  return {
    rows: items.map((it) => ({
      primary: it.type,
      secondary: [
        it.errors?.length ? `${it.errors.length} error${it.errors.length === 1 ? "" : "s"}` : null,
        it.warnings?.length ? `${it.warnings.length} warning${it.warnings.length === 1 ? "" : "s"}` : null,
      ].filter(Boolean).join(" · ") || undefined,
      meta: it.format,
    })),
    total: data?.totalItems,
  };
}

function Inner() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";
  if (!url) return <div className="container py-10 text-sm text-muted-fg">Missing ?url= parameter.</div>;
  return (
    <DrilldownShell
      title="Schema Items"
      subtitle="Every JSON-LD, Microdata, and RDFa item detected on the page"
      url={url}
      fetchRows={loadSchema}
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
