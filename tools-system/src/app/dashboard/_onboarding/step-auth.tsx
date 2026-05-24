"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface StepAuthProps {
  data: { email: string; name: string; goalMode: string };
  onUpdate: (p: { email?: string; name?: string; goalMode?: string }) => void;
  onNext: () => void;
}

const GOALS = [
  { id: "traffic",   label: "Grow Traffic",    desc: "TOFU clusters, informational content",  emoji: "📈" },
  { id: "leads",     label: "Generate Leads",  desc: "Comparison pages, commercial intent",    emoji: "🎯" },
  { id: "sales",     label: "Drive Sales",     desc: "Product pages, transactional keywords",  emoji: "💰" },
  { id: "authority", label: "Build Authority", desc: "Thought leadership, PR, citations",      emoji: "🏆" },
];

const inputClass =
  "mt-1.5 w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors";

export function StepAuth({ data, onUpdate, onNext }: StepAuthProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [goalStep, setGoalStep] = useState(false);

  const handleSendOtp = () => {
    if (data.email && data.name) setOtpSent(true);
  };

  const handleVerify = () => {
    if (otp.length >= 4) setGoalStep(true);
  };

  const handleGoal = (id: string) => {
    onUpdate({ goalMode: id });
    onNext();
  };

  // ── Goal selection ──────────────────────────────────────────────────────────
  if (goalStep) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <h2 className="text-3xl font-serif italic text-gray-900 dark:text-white mb-2 leading-snug">
            What's your primary goal?
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Your entire dashboard will be personalized to this goal
          </p>
        </div>
        <div className="space-y-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGoal(g.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-teal-300 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group"
            >
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-zinc-100 group-hover:text-gray-900 dark:group-hover:text-white">
                  {g.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">{g.desc}</div>
              </div>
              <svg
                width="15" height="15" viewBox="0 0 15 15" fill="none"
                className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors shrink-0"
              >
                <path d="M5.5 4l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Auth form ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm p-8 shadow-xl dark:shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center mx-auto mb-6 shadow-md shadow-teal-200 dark:shadow-teal-900/40">
          <span className="text-white font-bold text-sm">B</span>
        </div>

        <h2 className="text-2xl font-serif italic text-gray-900 dark:text-white text-center mb-1">
          Welcome to Blogy
        </h2>
        <p className="text-sm text-gray-400 dark:text-zinc-400 text-center mb-7">
          Your Organic Growth Operating System
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Tarun Kumar"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Business Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="name@company.com"
              className={inputClass}
            />
          </div>

          {otpSent && (
            <div>
              <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                OTP (sent to your email)
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className={cn(
                  inputClass,
                  "text-center tracking-widest font-bold border-teal-400 dark:border-teal-700 focus:border-teal-500",
                )}
              />
            </div>
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={!data.email || !data.name}
              className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              Send OTP
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={otp.length < 4}
              className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              Verify & Continue
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 dark:text-zinc-600 mt-5">
          No password. No friction. Just OTP.
        </p>
      </div>
    </div>
  );
}
