"use client";

interface StepContactProps {
  data: { phone: string; designation: string };
  onUpdate: (p: { phone?: string; designation?: string }) => void;
  onNext: () => void;
}

const inputClass =
  "mt-1.5 w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors";

export function StepContact({ data, onUpdate, onNext }: StepContactProps) {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm p-8 shadow-xl dark:shadow-2xl">
        <h2 className="text-2xl font-serif italic text-gray-900 dark:text-white text-center mb-1">
          Quick Profile
        </h2>
        <p className="text-sm text-gray-400 dark:text-zinc-400 text-center mb-7">
          Optional — helps us personalize your reports
        </p>

        <div className="space-y-4 mb-7">
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Phone (optional)
            </label>
            <input
              value={data.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Designation (optional)
            </label>
            <input
              value={data.designation}
              onChange={(e) => onUpdate({ designation: e.target.value })}
              placeholder="Founder / Marketing Head / SEO Manager"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="flex-1 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 py-2.5 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="flex-1 h-11 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
