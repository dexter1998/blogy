"use client";

import { cn } from "@/lib/cn";

interface ScoreGaugeProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

function getColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.7) return "#14b8a6";
  if (pct >= 0.4) return "#f59e0b";
  return "#f43f5e";
}

export function ScoreGauge({ score, max = 100, size = 80, strokeWidth = 7, showLabel = true, className }: ScoreGaugeProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const dash = pct * circ;
  const color = getColor(score, max);
  const cx = size / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-bold tabular-nums" style={{ color, fontSize: size < 48 ? 10 : 13 }}>
          {score}
        </span>
      )}
    </div>
  );
}
