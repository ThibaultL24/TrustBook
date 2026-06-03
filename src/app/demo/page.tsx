// src/app/demo/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { resetDemoTour } from "@/components/demo/demo-tour";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const STEPS = [
  { n: 1, text: "Start at /pitch — read the Circles-native thesis", href: "/pitch" },
  { n: 2, text: "Open /feed — trust-aware ranked feed", href: "/feed" },
  { n: 3, text: "Run demo tour (auto on first visit)", href: "/feed?tour=1", action: "tour" },
  { n: 4, text: "Expand “Why am I seeing this?” + signal breakdown", href: "/feed" },
  { n: 5, text: "Show Circles trust signals (direct, mutual, paths, CRC)", href: "/feed" },
  { n: 6, text: "Show optional Intuition claim line (violet bar)", href: "/feed?postId=post-reco-trustbook" },
  { n: 7, text: "Tip or boost a post — watch header stats", href: "/feed" },
  { n: 8, text: "Trust an author — read economic acceptance warning", href: "/feed" },
  { n: 9, text: "Open leaderboard — CRC impact rankings", href: "/leaderboard" },
  { n: 10, text: "Explain production: host SDK + on-chain references", href: "/status" },
];

export default function DemoPage() {
  const router = useRouter();

  function startTour() {
    resetDemoTour();
    router.push("/feed?tour=1");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Demo script</h1>
        <p className="mb-6 text-sm text-slate-600">
          Presenter checklist for judges — ~2 minutes. Circles trust is primary;
          Intuition is optional context.
        </p>

        <ol className="mb-8 space-y-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                {step.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">{step.text}</p>
                {step.action === "tour" ? (
                  <button
                    type="button"
                    onClick={startTour}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Start tour <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <Link
                    href={step.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Go <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-200" />
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-2">
          <Link
            href="/pitch"
            className="rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white"
          >
            Start at pitch
          </Link>
          <Link
            href="/feed"
            className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800"
          >
            Open feed
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
