import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { HumanizerForm } from "./humanizer-form";

const tool = getTool("ai-humanizer")!;

export const metadata: Metadata = {
  title: "AI Humanizer — Make AI Text Sound Human",
  description:
    "Deterministic AI text humanizer. Detects 30+ AI tells, applies contractions, trims transitions, restructures long sentences. No LLM needed.",
  alternates: { canonical: "/tools/ai-humanizer" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/ai-humanizer \\
  -H "Content-Type: application/json" \\
  -d '{"text": "It is important to note that, in todays fast-paced world, leveraging robust solutions is a game-changer.", "level": "medium"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Content · Humanizer"
      howItWorks={[
        "Detects 30+ AI tell phrases (delve, tapestry, …)",
        "Applies contractions (do not → don't)",
        "Trims AI transitions (Moreover, Furthermore, …)",
        "level=heavy splits long sentences and leads with verbs",
      ]}
      exampleCurl={exampleCurl}
    >
      <HumanizerForm />
    </ToolShell>
  );
}
