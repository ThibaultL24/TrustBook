// src/components/feed/feed-tabs.tsx
"use client";

import type { FeedTab } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const TABS: { id: FeedTab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "circle", label: "Circle" },
  { id: "needs", label: "Needs" },
  { id: "offers", label: "Offers" },
  { id: "recos", label: "Recos" },
  { id: "events", label: "Events" },
];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

export function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="mx-auto max-w-lg border-b border-[var(--border)] bg-white">
      <div className="flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors",
              active === tab.id
                ? "text-emerald-700"
                : "text-slate-500 hover:bg-emerald-50/50 hover:text-slate-700",
            )}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
