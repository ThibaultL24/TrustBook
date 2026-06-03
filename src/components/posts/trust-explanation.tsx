// src/components/posts/trust-explanation.tsx
"use client";

import { useState } from "react";
import type { FeedExplanation, FeedScoreBreakdown } from "@/lib/types";
import { TrustSignalBreakdown } from "@/components/trust/trust-signal-breakdown";
import { ChevronDown, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrustExplanationProps {
  explanation: FeedExplanation;
  scoreBreakdown?: FeedScoreBreakdown;
}

export function TrustExplanation({
  explanation,
  scoreBreakdown,
}: TrustExplanationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-teal-100/80 bg-gradient-to-r from-teal-50/80 to-sky-50/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-teal-900"
        aria-expanded={open}
      >
        <GitBranch className="h-3.5 w-3.5 shrink-0 text-teal-600" />
        <span className="flex-1">Why am I seeing this?</span>
        <span className="text-teal-700/80">{explanation.reasonLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-teal-600 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-teal-100/60 px-3 pb-3 pt-2">
          <p className="text-xs leading-relaxed text-slate-600">
            {explanation.reasonDetails}
          </p>
          {scoreBreakdown && (
            <TrustSignalBreakdown breakdown={scoreBreakdown} />
          )}
        </div>
      )}
    </div>
  );
}
