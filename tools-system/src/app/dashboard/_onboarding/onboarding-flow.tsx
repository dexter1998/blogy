"use client";

import { useState, useCallback } from "react";
import { StepAuth } from "./step-auth";
import { StepWebsite } from "./step-website";
import { StepCompetitors } from "./step-competitors";
import { StepContact } from "./step-contact";
import { StepProcessing } from "./step-processing";
import { StepReview } from "./step-review";

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface FormData {
  email: string;
  name: string;
  website: string;
  goalMode: string;
  phone: string;
  designation: string;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    email: "",
    name: "",
    website: "",
    goalMode: "leads",
    phone: "",
    designation: "",
  });
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 45 });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gray-50 dark:bg-[#0e0e0e]"
      onMouseMove={handleMouseMove}
    >
      {/* Large slow-rotating blurred glow in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: "absolute",
            width: "160%",
            height: "160%",
            top: "-30%",
            left: "-30%",
            background:
              "conic-gradient(from 0deg, transparent 38%, rgba(20,184,166,0.09) 52%, rgba(94,234,212,0.06) 58%, transparent 68%)",
            animation: "spin 18s linear infinite",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* Cursor-following teal glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-500"
        style={{
          background: `radial-gradient(circle 380px at ${cursorPos.x}% ${cursorPos.y}%, rgba(20,184,166,0.11) 0%, transparent 65%)`,
          filter: "blur(4px)",
        }}
      />

      {/* Back button */}
      {step > 0 && step < 5 && (
        <button
          onClick={back}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 text-sm transition-colors z-20"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      )}

      <div className="relative z-10 w-full flex items-center justify-center">
        {step === 0 && <StepAuth data={data} onUpdate={update} onNext={next} />}
        {step === 1 && <StepWebsite data={data} onUpdate={update} onNext={next} />}
        {step === 2 && <StepCompetitors onNext={next} />}
        {step === 3 && <StepContact data={data} onUpdate={update} onNext={next} />}
        {step === 4 && <StepProcessing onComplete={next} />}
        {step === 5 && <StepReview data={data} onComplete={onComplete} />}
      </div>
    </div>
  );
}
