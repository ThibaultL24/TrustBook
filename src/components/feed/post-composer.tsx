// src/components/feed/post-composer.tsx
"use client";

import { ImageIcon, Smile, Video } from "lucide-react";
import { useTrustbook } from "@/providers/trustbook-provider";
import { Avatar } from "@/components/ui/avatar";
import type { ComposerMode } from "@/lib/posts/composer-modes";
import { cn } from "@/lib/utils/cn";

interface PostComposerProps {
  onOpenCreate: (mode?: ComposerMode) => void;
  onOpenUtility: () => void;
}

const ACTIONS: {
  mode: ComposerMode;
  icon: typeof Video;
  label: string;
  color: string;
}[] = [
  { mode: "live", icon: Video, label: "Live", color: "text-rose-600" },
  { mode: "photo", icon: ImageIcon, label: "Photo", color: "text-emerald-600" },
  { mode: "mood", icon: Smile, label: "Humeur", color: "text-amber-500" },
];

export function PostComposer({ onOpenCreate, onOpenUtility }: PostComposerProps) {
  const { viewer } = useTrustbook();
  const firstName = viewer.displayName.split(" ")[0];

  return (
    <div className="card-surface mx-auto max-w-lg rounded-none border-x-0 px-3 py-3 sm:rounded-xl sm:border-x">
      <div className="flex items-center gap-3">
        <Avatar src={viewer.avatarUrl} alt={viewer.displayName} size="md" />
        <button
          type="button"
          onClick={() => onOpenCreate("standard")}
          className="flex-1 rounded-full bg-[var(--surface-muted)] px-4 py-2.5 text-left text-sm text-slate-500 ring-1 ring-[var(--border)] transition hover:bg-white"
        >
          Qu’avez-vous en tête, {firstName} ?
        </button>
      </div>
      <div className="divider-fb my-2.5" />
      <div className="flex justify-around">
        {ACTIONS.map(({ mode, icon: Icon, label, color }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onOpenCreate(mode)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[var(--surface-muted)]"
          >
            <Icon className={cn("h-4 w-4", color)} />
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpenUtility}
        className="mt-2 w-full text-center text-[11px] font-medium text-emerald-700 hover:underline"
      >
        Publier une annonce (besoin, offre, événement…)
      </button>
    </div>
  );
}
