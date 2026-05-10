"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={cn("h-9 w-9", className)} />;
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app bg-card text-fg transition hover:bg-muted",
        className,
      )}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
