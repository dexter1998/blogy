"use client";

import { cn } from "@/lib/cn";

interface MiniBarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  className?: string;
  showValues?: boolean;
}

export function MiniBarChart({ data, labels, height = 80, color = "#14b8a6", className, showValues }: MiniBarChartProps) {
  const max = Math.max(...data);
  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }}>
      {data.map((v, i) => {
        const pct = max > 0 ? (v / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
            {showValues && <span className="text-[9px] text-muted-fg tabular-nums">{v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}</span>}
            <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.8 + (pct / 100) * 0.2 }} />
            {labels && <span className="text-[9px] text-muted-fg mt-0.5 truncate w-full text-center">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  unit?: string;
  className?: string;
}

export function HorizontalBar({ label, value, max = 100, color = "#14b8a6", unit = "%", className }: HorizontalBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm text-muted-fg w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium text-fg tabular-nums w-10 text-right">{value}{unit}</span>
    </div>
  );
}
