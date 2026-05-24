"use client";

import { cn } from "@/lib/cn";

interface ToggleSwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function ToggleSwitch({ on, onChange, disabled, size = "md" }: ToggleSwitchProps) {
  const sm = size === "sm";
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        sm ? "h-5 w-9" : "h-6 w-11",
        on ? "bg-teal-500" : "bg-zinc-200 dark:bg-zinc-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
          sm ? "h-4 w-4" : "h-5 w-5",
          on ? (sm ? "translate-x-4" : "translate-x-5") : "translate-x-0",
        )}
      />
    </button>
  );
}
