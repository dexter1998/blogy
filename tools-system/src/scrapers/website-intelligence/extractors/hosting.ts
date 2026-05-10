import type { IntelligenceContext } from "../core/engine";
import { firstHeader } from "../core/fingerprint";
import { extractTechStack } from "./techstack";
import type { HostingSignals } from "../types";

export function extractHosting(ctx: IntelligenceContext): HostingSignals {
  const tech = extractTechStack(ctx);
  const hosting = tech.hosting[0] ?? null;
  const cdn = tech.cdn[0] ?? null;
  const server = firstHeader(ctx, "server");
  const poweredBy = firstHeader(ctx, "x-powered-by");

  const evidence: HostingSignals["evidence"] = [];
  for (const e of tech.evidence.filter(
    (e) => tech.hosting.includes(e.tech) || tech.cdn.includes(e.tech),
  )) {
    evidence.push({ provider: e.tech, via: e.via, sample: e.sample });
  }
  if (server && !evidence.find((e) => /^server:/i.test(e.sample))) {
    evidence.push({ provider: server, via: "header", sample: `server: ${server}` });
  }

  return {
    hosting,
    cdn,
    server,
    poweredBy,
    evidence,
  };
}
