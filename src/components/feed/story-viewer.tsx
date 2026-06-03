// src/components/feed/story-viewer.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useTrustbook } from "@/providers/trustbook-provider";
import type { StoryGroup } from "@/lib/stories/helpers";
import { getTrustCircleLevel, trustCircleLabel } from "@/lib/trust/trust-circle";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
}

export function StoryViewer({ group, onClose }: StoryViewerProps) {
  const {
    stories,
    getPostById,
    getUser,
    viewer,
    trustEdges,
    markStoryGroupViewed,
  } = useTrustbook();

  const authorStories = useMemo(
    () =>
      stories
        .filter((s) => group.storyIds.includes(s.id))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [stories, group.storyIds],
  );

  const [index, setIndex] = useState(0);
  const currentStory = authorStories[index];
  const post = currentStory ? getPostById(currentStory.postId) : undefined;
  const author = getUser(group.authorAddress);
  const trustLevel = getTrustCircleLevel(
    viewer.address,
    group.authorAddress,
    trustEdges,
  );
  const trustLabel = trustCircleLabel(trustLevel);

  useEffect(() => {
    markStoryGroupViewed(group.authorAddress);
  }, [group.authorAddress, markStoryGroupViewed]);

  const goNext = useCallback(() => {
    if (index < authorStories.length - 1) setIndex((i) => i + 1);
    else onClose();
  }, [index, authorStories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    const timer = window.setTimeout(goNext, 8000);
    return () => window.clearTimeout(timer);
  }, [index, goNext]);

  if (!currentStory || !post || !author) return null;

  const moodEmoji =
    post.mood &&
    ({
      grateful: "🙏",
      excited: "🎉",
      hopeful: "🌱",
      curious: "🤔",
      proud: "💪",
      supported: "🤝",
      inspired: "✨",
      celebrating: "🥳",
    }[post.mood] ??
      "😊");

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black">
      <div className="flex gap-1 px-2 pt-3">
        {authorStories.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-0.5 flex-1 rounded-full bg-white/30",
              i <= index && "bg-white",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Avatar src={author.avatarUrl} alt={author.displayName} size="sm" />
          <div>
            <p className="text-sm font-semibold text-white">{author.displayName}</p>
            {trustLabel && (
              <p className="text-[10px] text-emerald-300">{trustLabel}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Close story"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col">
        {post.imageUrl && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-lg flex-1">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5",
            !post.imageUrl && "justify-center bg-gradient-to-b from-emerald-900 to-black",
          )}
        >
          {post.isLive && (
            <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
          )}
          {post.format === "mood" && post.mood && (
            <p className="mb-2 text-2xl">
              {moodEmoji}{" "}
              <span className="text-lg font-semibold capitalize text-white">
                {post.mood}
              </span>
            </p>
          )}
          <h2 className="text-xl font-bold text-white">{post.title}</h2>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/90">
            {post.body}
          </p>
          <Link
            href={`/feed?postId=${post.id}`}
            onClick={onClose}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Open full post
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          className="absolute left-0 top-0 h-full w-1/3"
          onClick={goPrev}
          aria-label="Previous"
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-full w-1/3"
          onClick={goNext}
          aria-label="Next"
        />

        <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
          {index > 0 && (
            <ChevronLeft className="h-8 w-8 text-white/50" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {index < authorStories.length - 1 && (
            <ChevronRight className="h-8 w-8 text-white/50" />
          )}
        </div>
      </div>
    </div>
  );
}
