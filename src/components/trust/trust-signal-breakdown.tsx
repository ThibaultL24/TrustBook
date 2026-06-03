// src/components/trust/trust-signal-breakdown.tsx

import type { FeedScoreBreakdown } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const SIGNALS: {
  key: keyof Omit<FeedScoreBreakdown, "total">;
  label: string;
  color: string;
}[] = [
  { key: "directTrust", label: "Direct trust", color: "bg-teal-500" },
  { key: "mutualTrust", label: "Mutual trust", color: "bg-teal-400" },
  { key: "sharedCommunity", label: "Community", color: "bg-sky-500" },
  { key: "commonTrust", label: "Common paths", color: "bg-indigo-400" },
  { key: "crcBoost", label: "CRC boost", color: "bg-emerald-500" },
  { key: "recency", label: "Recency", color: "bg-slate-400" },
  { key: "postType", label: "Post type", color: "bg-amber-400" },
  { key: "intuitionSignal", label: "Intuition", color: "bg-violet-400" },
];

interface TrustSignalBreakdownProps {
  breakdown: FeedScoreBreakdown;
}

export function TrustSignalBreakdown({ breakdown }: TrustSignalBreakdownProps) {
  const maxBar = Math.max(breakdown.total, 1);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Trust signal breakdown
      </p>
      {SIGNALS.map(({ key, label, color }) => {
        const value = breakdown[key];
        if (value == null || value <= 0) return null;
        const pct = Math.round((value / maxBar) * 100);
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[10px] text-slate-600">
              {label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-[10px] font-medium text-slate-700">
              {Math.round(value)}
            </span>
          </div>
        );
      })}
      <p className="text-[10px] text-slate-500">
        Total score:{" "}
        <span className="font-semibold text-slate-800">
          {Math.round(breakdown.total)}
        </span>
      </p>
    </div>
  );
}
