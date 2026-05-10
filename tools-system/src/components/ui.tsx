"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  const variants = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "bg-muted text-fg hover:opacity-90",
    ghost: "border border-app bg-transparent text-fg hover:bg-muted",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        sizes[size],
        variants[variant],
        className,
      )}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-app bg-card p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-app bg-card px-2.5 py-1 text-xs font-medium text-muted-fg transition hover:text-fg",
        className,
      )}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

export function CodeBlock({
  code,
  language,
  copyable = true,
}: {
  code: string;
  language?: string;
  copyable?: boolean;
}) {
  return (
    <div className="relative">
      {copyable && (
        <CopyButton
          text={code}
          className="absolute right-3 top-3 z-10 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
        />
      )}
      {language && (
        <div className="absolute left-4 top-3 z-10 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {language}
        </div>
      )}
      <pre className={cn("code-block", (language || copyable) && "pt-10")}>
        {code}
      </pre>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "text-fg",
    good: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-600 dark:text-amber-400",
    bad: "text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="rounded-lg border border-app bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-fg">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", tones[tone])}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-muted-fg">{hint}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "accent";
}) {
  const tones = {
    neutral: "bg-muted text-muted-fg",
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    bad: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    accent: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
