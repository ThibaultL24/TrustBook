// src/components/feed/stories-strip.tsx
"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useTrustbook } from "@/providers/trustbook-provider";
import { cn } from "@/lib/utils/cn";

interface StoriesStripProps {
  onOpenOwnStoryPicker: () => void;
  onOpenStory: (authorAddress: string) => void;
}

export function StoriesStrip({
  onOpenOwnStoryPicker,
  onOpenStory,
}: StoriesStripProps) {
  const { storyGroups, viewer } = useTrustbook();

  const ownGroup = storyGroups.find((g) => g.isOwn);
  const otherGroups = storyGroups.filter((g) => !g.isOwn);

  return (
    <div className="card-surface mx-auto max-w-lg overflow-hidden rounded-none border-x-0 sm:rounded-xl sm:border-x">
      <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
        {/* Your story */}
        <button
          type="button"
          onClick={() => {
            if (ownGroup && ownGroup.storyIds.length > 0) {
              onOpenStory(viewer.address);
            } else {
              onOpenOwnStoryPicker();
            }
          }}
          className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              ownGroup?.storyIds.length
                ? "story-ring"
                : "rounded-full p-[2.5px] ring-2 ring-slate-200",
            )}
          >
            <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-white">
              <Image
                src={
                  ownGroup?.previewImageUrl ?? viewer.avatarUrl
                }
                alt="Your story"
                fill
                className="object-cover"
                unoptimized
              />
              <span
                className="absolute bottom-0 left-0 right-0 flex h-5 items-center justify-center bg-emerald-600 text-white"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </div>
          </div>
          <span className="max-w-full truncate text-[11px] font-medium text-slate-700">
            Your story
          </span>
        </button>

        {otherGroups.map((group) => (
          <button
            key={group.authorAddress}
            type="button"
            onClick={() => onOpenStory(group.authorAddress)}
            className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                group.hasNew ? "story-ring" : "rounded-full p-[2.5px] ring-2 ring-slate-200",
              )}
            >
              <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-white">
                <Image
                  src={group.previewImageUrl ?? group.avatarUrl}
                  alt={group.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            <span className="max-w-full truncate text-[11px] font-medium text-slate-700">
              {group.displayName.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
