"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { SectionId, DashboardSettings } from "../types";
import { COMPANY, CREDIT_FORECAST } from "../mock-data";

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "home",        label: "Home",         icon: <HomeIcon /> },
  { id: "cmo-brain",   label: "CMO Brain",    icon: <BrainIcon />, badge: "new" },
  { id: "create",      label: "Create",       icon: <CreateIcon /> },
  { id: "reports",     label: "Reports",      icon: <ReportsIcon /> },
  { id: "scheduling",  label: "Scheduling",   icon: <CalendarIcon /> },
  { id: "trends",      label: "Trends",       icon: <TrendIcon /> },
  { id: "marketplace", label: "Marketplace",  icon: <MarketIcon /> },
  { id: "integrations",label: "Integrations", icon: <IntegrationsIcon /> },
  { id: "todos",       label: "Todos",        icon: <TodoIcon /> },
  { id: "coming-soon", label: "Coming Soon",  icon: <RocketIcon /> },
];

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (s: SectionId) => void;
  settings: DashboardSettings;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const creditPct = Math.round((CREDIT_FORECAST.used / CREDIT_FORECAST.total) * 100);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  function navigate(id: SectionId) {
    onNavigate(id);
    setMenuOpen(false);
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-app bg-card h-screen overflow-hidden">
      {/* Logo + Company */}
      <div className="px-4 pt-4 pb-3 border-b border-app">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="text-sm font-bold text-fg">Blogy</span>
        </div>
        <button className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0">
              <span className="text-teal-700 dark:text-teal-300 text-[9px] font-bold">FS</span>
            </div>
            <span className="text-xs font-medium text-fg truncate">{COMPANY.name}</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-fg shrink-0">
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium"
                  : "text-muted-fg hover:bg-muted hover:text-fg",
              )}
            >
              <span className={cn("shrink-0", isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-fg")}>
                {item.icon}
              </span>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && !isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom user menu */}
      <div className="border-t border-app px-2 py-2 relative" ref={menuRef}>
        {/* Upward dropdown */}
        {menuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-app bg-card shadow-xl z-50 overflow-hidden py-1">
            {/* Email */}
            <div className="px-3 py-2 border-b border-app">
              <p className="text-[11px] text-muted-fg truncate">kumartarun276@gmail.com</p>
            </div>

            {/* Primary actions */}
            <div className="py-1">
              <MenuRow
                icon={<SettingsIcon />}
                label="Settings"
                shortcut="⇧⌘,"
                onClick={() => navigate("settings")}
              />
              <MenuRow icon={<GlobeIcon />} label="Language" chevron onClick={() => {}} />
              <MenuRow icon={<HelpIcon />} label="Get help" onClick={() => {}} />
            </div>

            <div className="border-t border-app my-1" />

            {/* Upgrade + extras */}
            <div className="py-1">
              <button
                onClick={() => navigate("billing")}
                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-muted transition text-left rounded-lg mx-0"
              >
                <span className="text-muted-fg mt-0.5 shrink-0"><UpgradeIcon /></span>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-fg">Upgrade plan</div>
                  <div className="text-[10px] text-muted-fg mt-0.5">
                    {CREDIT_FORECAST.used.toLocaleString()} / {CREDIT_FORECAST.total.toLocaleString()} credits
                    <span className="mx-1">·</span>
                    {CREDIT_FORECAST.exhaustionDays}d left
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden w-full max-w-[140px]">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${creditPct}%` }} />
                  </div>
                </div>
              </button>
              <MenuRow icon={<DownloadIcon />} label="Get apps and extensions" onClick={() => {}} />
              <MenuRow icon={<GiftIcon />} label="Gift Blogy" onClick={() => {}} />
              <MenuRow icon={<InfoIcon />} label="Learn more" chevron onClick={() => {}} />
            </div>

            <div className="border-t border-app my-1" />

            {/* Logout */}
            <div className="py-1">
              <MenuRow icon={<LogoutIcon />} label="Log out" onClick={() => {}} danger />
            </div>
          </div>
        )}

        {/* Trigger row */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted transition group"
        >
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">TK</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-fg truncate">Tarun Kumar</div>
            <div className="text-[10px] text-muted-fg truncate">Pro plan</div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={cn("text-muted-fg shrink-0 transition-transform", menuOpen && "rotate-180")}
          >
            <path d="M3.5 5.5L7 2.5l3.5 3M3.5 8.5L7 11.5l3.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function MenuRow({
  icon, label, shortcut, chevron, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  chevron?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-1.5 text-xs transition hover:bg-muted rounded-lg",
        danger ? "text-rose-600 dark:text-rose-400" : "text-fg",
      )}
    >
      <span className="shrink-0 text-muted-fg">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-[10px] text-muted-fg font-mono">{shortcut}</span>}
      {chevron && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-fg">
          <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L1 7h2v6.5h3.5V10h2v3.5H12V7h2L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>; }
function BrainIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 2.5C3.5 2.5 2 4 2 6c0 1 .4 1.8 1 2.4V11h2V9h1v2h1V9h1v2h1V8.4c.6-.6 1-1.4 1-2.4 0-2-1.5-3.5-3.5-3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M9 5c1.1 0 2 .9 2 2s-.9 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="M11 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function CreateIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function ReportsIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5 10V7M7.5 10V5M10 10V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function CalendarIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5 2v2M10 2v2M2 7h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function TrendIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 11l3.5-3.5 2.5 2L12 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 5h2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MarketIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11l-1 6H3L2 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="5.5" cy="12.5" r="1" stroke="currentColor" strokeWidth="1.2" /><circle cx="10" cy="12.5" r="1" stroke="currentColor" strokeWidth="1.2" /></svg>; }
function IntegrationsIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" /><circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6 4h3M7.5 4v3M4 6v3M6 11H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function TodoIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M3 7.5h9M3 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function RocketIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C9.5 2 12 3.5 12 7c0 2-1 3.5-2.5 4.5L9 13H6l-.5-1.5C4 10.5 3 9 3 7c0-3.5 2.5-5 4.5-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="7.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" /></svg>; }
function SettingsIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M7.5 2v1.5M7.5 11.5V13M2 7.5h1.5M11.5 7.5H13M3.6 3.6l1.1 1.1M10.3 10.3l1.1 1.1M3.6 11.4l1.1-1.1M10.3 4.7l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function GlobeIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M7.5 1.5c-2 2-2 8 0 12M7.5 1.5c2 2 2 8 0 12M1.5 7.5h12" stroke="currentColor" strokeWidth="1.2" /></svg>; }
function HelpIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 5.5a2 2 0 013.5 1.5c0 1-1 1.5-1.5 2V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><circle cx="7.5" cy="12" r="0.75" fill="currentColor" /></svg>; }
function UpgradeIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M7.5 10.5V5M5 7.5l2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function DownloadIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M5 8l2.5 2.5L10 8M2 13h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function GiftIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><rect x="2" y="6" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 6h11M7.5 6V13M7.5 6C7.5 4 6 2.5 4.5 3S3 5 4.5 6H7.5zM7.5 6c0-2 1.5-3.5 3-3s1.5 2 0 3H7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>; }
function InfoIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M7.5 7v4M7.5 5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function LogoutIcon() { return <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M6 13H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 10l3-2.5L10 5M13 7.5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
