"use client";

import { useState, useCallback } from "react";
import type { SectionId, CalView, DashboardSettings, ReportsTab, TodosTab } from "./types";
import { DEFAULT_SETTINGS } from "./mock-data";
import { OnboardingFlow } from "./_onboarding/onboarding-flow";
import { Sidebar } from "./_shell/sidebar";
import { Topbar } from "./_shell/topbar";
import { HomeSection } from "./sections/home/home-section";
import { CmoBrainSection } from "./sections/website-intelligence/wi-section";
import { CreateSection } from "./sections/create/create-section";
import { ReportsSection } from "./sections/reports/reports-section";
import { SchedulingSection } from "./sections/scheduling/scheduling-section";
import { SettingsSection } from "./sections/settings/settings-section";
import { IntegrationsSection } from "./sections/integrations/integrations-section";
import { MarketplaceSection } from "./sections/marketplace/marketplace-section";
import { TrendsSection } from "./sections/trends/trends-section";
import { BillingSection } from "./sections/billing/billing-section";
import { TodosSection } from "./sections/todos/todos-section";
import { ComingSoonSection } from "./sections/coming-soon/coming-soon-section";

export function DashboardClient() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [calView, setCalView] = useState<CalView>("month");
  const [calDate, setCalDate] = useState(new Date(2025, 4, 1));
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [reportsTab, setReportsTab] = useState<ReportsTab>("blogy");
  const [todosTab, setTodosTab] = useState<TodosTab>("todos");

  const updateSetting = useCallback(<K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app text-fg">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} settings={settings} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar activeSection={activeSection} onNewBlog={() => setActiveSection("create")} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {activeSection === "home" && <HomeSection onNavigate={setActiveSection} onNewBlog={() => setActiveSection("create")} />}
            {activeSection === "cmo-brain" && <CmoBrainSection />}
            {activeSection === "create" && <CreateSection />}
            {activeSection === "reports" && <ReportsSection activeTab={reportsTab} onTabChange={setReportsTab} />}
            {activeSection === "scheduling" && (
              <SchedulingSection
                view={calView} onViewChange={setCalView}
                date={calDate} onDateChange={setCalDate}
                onCreateContent={() => setActiveSection("create")}
              />
            )}
            {activeSection === "settings" && <SettingsSection settings={settings} onUpdate={updateSetting} />}
            {activeSection === "integrations" && <IntegrationsSection />}
            {activeSection === "marketplace" && <MarketplaceSection />}
            {activeSection === "trends" && <TrendsSection onCreateContent={() => setActiveSection("create")} />}
            {activeSection === "billing" && <BillingSection />}
            {activeSection === "todos" && <TodosSection activeTab={todosTab} onTabChange={setTodosTab} />}
            {activeSection === "coming-soon" && <ComingSoonSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
