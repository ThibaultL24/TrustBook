// src/components/feed/feed-rubric-chips.tsx
"use client";

import type { FeedRubric } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const RUBRICS: { id: FeedRubric; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "thoughts", label: "Pensées" },
  { id: "needs", label: "Besoins" },
  { id: "offers", label: "Offres" },
  { id: "recos", label: "Recos" },
  { id: "events", label: "Événements" },
  { id: "circle", label: "Mon cercle" },
];

interface FeedRubricChipsProps {
  active: FeedRubric;
  onChange: (rubric: FeedRubric) => void;
}

export function FeedRubricChips({ active, onChange }: FeedRubricChipsProps) {
  return (
    <div className="mx-auto max-w-lg border-b border-[var(--border)] bg-white">
      <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-hide">
        {RUBRICS.map((rubric) => (
          <button
            key={rubric.id}
            type="button"
            onClick={() => onChange(rubric.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              active === rubric.id
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50",
            )}
          >
            {rubric.label}
          </button>
        ))}
      </div>
    </div>
  );
}
