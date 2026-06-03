// src/components/demo/demo-tour.tsx
"use client";

import { useState } from "react";
import { Coins, GitBranch, HeartHandshake, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "trustbook_demo_tour_completed";

const STEPS = [
  {
    icon: GitBranch,
    title: "Trust-aware feed",
    body: "This feed is ranked through your Circles trust graph — not opaque engagement or virality.",
  },
  {
    icon: Sparkles,
    title: "Explainable recommendations",
    body: "Every post explains why it appears: direct trust, mutual trust, common trust paths, shared communities, or CRC boosts.",
  },
  {
    icon: Coins,
    title: "CRC-backed actions",
    body: "Tips and boosts are not likes. They are economic signals using your personal Circles CRC.",
  },
  {
    icon: HeartHandshake,
    title: "Trust is serious",
    body: "Trusting someone in Circles means accepting their CRC. It is economic acceptance — closer to currency routing than following.",
  },
];

interface DemoTourProps {
  open: boolean;
  onClose: () => void;
}

export function DemoTour({ open, onClose }: DemoTourProps) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const current = STEPS[step]!;
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  function handleNext() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="demo-tour-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <Icon className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={finish}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-1 text-xs font-medium text-teal-700">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 id="demo-tour-title" className="mb-2 text-lg font-bold text-slate-900">
          {current.title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          {current.body}
        </p>

        <div className="mb-4 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-teal-600" : "w-1.5 bg-slate-200",
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={() => finish()}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldAutoOpenDemoTour(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function resetDemoTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}
