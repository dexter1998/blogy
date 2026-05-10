import type { PageSpeedResult } from "@/scrapers/pagespeed/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function scorePageSpeed(r: PageSpeedResult): PageSpeedResult["scores"] {
  const performance = r.lab.performanceScore ?? 0;

  let cwv = 50;
  if (r.field.available) {
    const goodCount = r.field.metrics.filter((m) => m.category === "good").length;
    const poorCount = r.field.metrics.filter((m) => m.category === "poor").length;
    cwv = clamp(20 + goodCount * 16 - poorCount * 12);
    if (r.field.coreWebVitalsAssessment === "PASS") cwv = Math.max(cwv, 80);
    if (r.field.coreWebVitalsAssessment === "FAIL") cwv = Math.min(cwv, 60);
  } else {
    // Fall back to lab metrics
    const lcp = r.lab.metrics.lcp;
    const cls = r.lab.metrics.cls;
    const tbt = r.lab.metrics.tbt;
    let lab = 60;
    if (lcp !== null) lab += lcp <= 2500 ? 15 : lcp <= 4000 ? 0 : -20;
    if (cls !== null) lab += cls <= 0.1 ? 15 : cls <= 0.25 ? 0 : -20;
    if (tbt !== null) lab += tbt <= 200 ? 10 : tbt <= 600 ? 0 : -15;
    cwv = clamp(lab);
  }

  const overall = clamp(performance * 0.5 + cwv * 0.5);
  return { overall, performance, cwv };
}
