// src/components/posts/post-type-badge.tsx

import type { PostType } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<PostType, string> = {
  thought: "bg-slate-100 text-slate-700 border-slate-200",
  recommendation: "bg-violet-50 text-violet-700 border-violet-100",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-100",
  need: "bg-amber-50 text-amber-800 border-amber-100",
  event: "bg-sky-50 text-sky-700 border-sky-100",
};

const LABELS: Record<PostType, string> = {
  thought: "Pensée",
  recommendation: "Reco",
  offer: "Offre",
  need: "Besoin",
  event: "Événement",
};

export function PostTypeBadge({ type }: { type: PostType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STYLES[type],
      )}
    >
      {LABELS[type]}
    </span>
  );
}
