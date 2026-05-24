"use client";

import { cn } from "@/lib/cn";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({ tabs, active, onChange, className, variant = "underline" }: TabsProps) {
  if (variant === "pill") {
    return (
      <div className={cn("flex gap-1 rounded-lg bg-muted p-1", className)}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              active === t.id ? "bg-card text-fg shadow-sm" : "text-muted-fg hover:text-fg",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", active === t.id ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex border-b border-app", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px",
            active === t.id ? "border-teal-500 text-teal-600 dark:text-teal-400" : "border-transparent text-muted-fg hover:text-fg",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 text-[10px] text-muted-fg">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
