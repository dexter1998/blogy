"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui";
import { cn } from "@/lib/cn";

export type CodeSample = { language: string; label: string; code: string };

export function CodePanel({
  title,
  samples,
  responseSample,
}: {
  title: string;
  samples: CodeSample[];
  responseSample?: string;
}) {
  const [active, setActive] = useState(0);
  const sample = samples[active]!;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
          <div className="flex items-center gap-1">
            {samples.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition",
                  i === active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              {title}
            </span>
            <CopyButton
              text={sample.code}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
            />
          </div>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-200">
          {sample.code}
        </pre>
      </div>

      {responseSample && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-900/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                200
              </span>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                Response
              </span>
            </div>
            <CopyButton
              text={responseSample}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
            />
          </div>
          <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed text-zinc-200">
            {responseSample}
          </pre>
        </div>
      )}
    </div>
  );
}
