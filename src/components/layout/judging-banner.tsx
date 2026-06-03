// src/components/layout/judging-banner.tsx
"use client";

import Link from "next/link";
import { useTrustbook } from "@/providers/trustbook-provider";
import { resetDemoTour } from "@/components/demo/demo-tour";
import { isJudgingMode } from "@/lib/config/runtime";
import {
  LayoutList,
  ListChecks,
  Presentation,
  RotateCcw,
  Trophy,
  Activity,
  PlayCircle,
} from "lucide-react";

interface JudgingBannerProps {
  onOpenDemoTour?: () => void;
}

export function JudgingBanner({ onOpenDemoTour }: JudgingBannerProps) {
  const { resetDemoState } = useTrustbook();

  if (!isJudgingMode) return null;

  function handleReset() {
    resetDemoState();
    resetDemoTour();
  }

  function handleTour() {
    resetDemoTour();
    onOpenDemoTour?.();
  }

  const links = [
    { href: "/pitch", label: "Pitch", icon: Presentation },
    { href: "/feed", label: "Feed", icon: LayoutList },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/demo", label: "Demo", icon: ListChecks },
    { href: "/status", label: "Status", icon: Activity },
  ];

  return (
    <div className="border-b border-amber-200 bg-amber-50/90 px-4 py-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Hackathon demo
        </span>
        <div className="flex flex-1 flex-wrap gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-white"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
          {onOpenDemoTour && (
            <button
              type="button"
              onClick={handleTour}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-white"
            >
              <PlayCircle className="h-3 w-3" />
              Tour
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-full bg-amber-800 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-amber-900"
        >
          <RotateCcw className="h-3 w-3" />
          Reset demo
        </button>
      </div>
    </div>
  );
}
