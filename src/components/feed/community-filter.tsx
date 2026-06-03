// src/components/feed/community-filter.tsx
"use client";

import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CommunityFilterProps {
  value: string | null;
  onChange: (communityId: string | null) => void;
}

export function CommunityFilter({ value, onChange }: CommunityFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-emerald-600" />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          "min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5",
          "text-xs font-medium text-slate-700 shadow-sm",
          "focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100",
        )}
      >
        <option value="">All communities</option>
        {MOCK_COMMUNITIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
