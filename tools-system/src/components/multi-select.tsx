"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type MultiSelectOption<V extends string> = {
  value: V;
  label: string;
};

export function MultiSelect<V extends string>({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  className,
  buttonClassName,
}: {
  options: MultiSelectOption<V>[];
  selected: V[];
  onChange: (next: V[]) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const selectedSet = new Set(selected);
  const labels = options
    .filter((o) => selectedSet.has(o.value))
    .map((o) => o.label);

  function toggle(v: V) {
    if (selectedSet.has(v)) {
      onChange(selected.filter((s) => s !== v));
    } else {
      onChange([...selected, v]);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-app bg-app px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent",
          buttonClassName,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate">
          {labels.length === 0 ? (
            <span className="text-muted-fg">{placeholder}</span>
          ) : labels.length <= 2 ? (
            labels.join(", ")
          ) : (
            `${labels.length} selected`
          )}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("flex-shrink-0 transition", open && "rotate-180")}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-64 w-full min-w-[14rem] overflow-auto rounded-lg border border-app bg-card p-1 shadow-lg"
        >
          {options.map((o) => {
            const checked = selectedSet.has(o.value);
            return (
              <label
                key={o.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted",
                  checked && "bg-muted",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="h-4 w-4 rounded border-app accent-accent"
                />
                <span className="flex-1">{o.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
