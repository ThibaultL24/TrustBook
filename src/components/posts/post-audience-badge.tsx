// src/components/posts/post-audience-badge.tsx

import type { PostAudience } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Globe, Users, UsersRound } from "lucide-react";

const CONFIG: Record<
  PostAudience,
  { label: string; className: string; Icon: typeof Users }
> = {
  circle: {
    label: "Circle",
    className: "bg-emerald-50 text-emerald-800 border-emerald-100",
    Icon: UsersRound,
  },
  communities: {
    label: "Communities",
    className: "bg-violet-50 text-violet-800 border-violet-100",
    Icon: Users,
  },
  discovery: {
    label: "Discovery",
    className: "bg-sky-50 text-sky-800 border-sky-100",
    Icon: Globe,
  },
};

export function PostAudienceBadge({ audience }: { audience: PostAudience }) {
  const { label, className, Icon } = CONFIG[audience];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {label}
    </span>
  );
}
