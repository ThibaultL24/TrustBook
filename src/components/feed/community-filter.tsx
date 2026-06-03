// src/components/feed/community-filter.tsx
"use client";

import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { cn } from "@/lib/utils/cn";

interface CommunityFilterProps {
  value: string | null;
  onChange: (communityId: string | null) => void;
}

export function CommunityFilter({ value, onChange }: CommunityFilterProps) {
  return (
    <div className="px-4 pb-3">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Community
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2",
          "text-sm text-slate-800 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100",
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
