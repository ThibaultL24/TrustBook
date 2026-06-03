// src/components/feed/feed-tabs.tsx
"use client";

import type { FeedTab } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const TABS: { id: FeedTab; label: string }[] = [
  { id: "for-you", label: "For You" },
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
    <div className="flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            active === tab.id
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
