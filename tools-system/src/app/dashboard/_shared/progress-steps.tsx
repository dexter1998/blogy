import { cn } from "@/lib/cn";

type StepStatus = "pending" | "running" | "done";

interface Step {
  label: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-5 h-5 shrink-0 flex items-center justify-center">
            {step.status === "done" && (
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {step.status === "running" && (
              <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            )}
            {step.status === "pending" && (
              <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700" />
            )}
          </div>
          <span className={cn("text-sm", step.status === "done" ? "text-fg" : step.status === "running" ? "text-teal-600 dark:text-teal-400 font-medium" : "text-muted-fg")}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
