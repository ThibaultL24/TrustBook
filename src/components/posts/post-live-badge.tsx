// src/components/posts/post-live-badge.tsx
"use client";

import { isLiveCirclesAuthor } from "@/lib/circles/live-authors";
import { useMockSession } from "@/providers/mock-session-provider";
import { cn } from "@/lib/utils/cn";
import { Coins, FlaskConical } from "lucide-react";

interface PostLiveBadgeProps {
  authorAddress: string;
  className?: string;
}

export function PostLiveBadge({ authorAddress, className }: PostLiveBadgeProps) {
  const { usesLiveWallet } = useMockSession();
  const isLive = isLiveCirclesAuthor(authorAddress);

  if (isLive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800",
          className,
        )}
        title="Real Circles avatar on Gnosis — tip and boost send on-chain CRC"
      >
        <Coins className="h-3 w-3" />
        Live CRC
      </span>
    );
  }

  if (!usesLiveWallet) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500",
        className,
      )}
      title="Demo author — on-chain tip not available"
    >
      <FlaskConical className="h-3 w-3" />
      Demo only
    </span>
  );
}
