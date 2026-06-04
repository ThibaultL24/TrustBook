// src/components/posts/post-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RankedPost } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { Avatar } from "@/components/ui/avatar";
import { ShareButton } from "@/components/ui/share-button";
import { PostTypeBadge } from "./post-type-badge";
import { PostAudienceBadge } from "./post-audience-badge";
import { PostLiveBadge } from "./post-live-badge";
import { TrustExplanation } from "./trust-explanation";
import { PostComments } from "./post-comments";
import {
  DEMO_LIVE_TIP_POST_ID,
  isLiveCirclesAuthor,
} from "@/lib/circles/live-authors";
import {
  getTrustCircleLevel,
  trustCircleLabel,
} from "@/lib/trust/trust-circle";
import {
  ArrowUpCircle,
  Coins,
  HeartHandshake,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PostCardProps {
  ranked: RankedPost;
  onTrustAuthor: (address: string) => void;
  compact?: boolean;
}

function formatPostTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function PostCard({ ranked, onTrustAuthor, compact }: PostCardProps) {
  const {
    viewer,
    trustEdges,
    tipOnPost,
    boostOnPost,
    isActionPending,
    getCommentsForPost,
    getUser,
    sharePostToStory,
  } = useTrustbook();
  const { post, explanation, scoreBreakdown } = ranked;
  const author = getUser(post.authorAddress);
  const community = COMMUNITY_MAP[post.communityId];
  const commentCount = getCommentsForPost(post.id).length;

  const tipPending = isActionPending(`tip:${post.id}`);
  const boostPending = isActionPending(`boost:${post.id}`);
  const trustPending = isActionPending(`trust:${post.authorAddress}`);

  const [showWhy, setShowWhy] = useState(false);

  if (!author) return null;

  const engagementTotal = post.tipCount + post.amountBoosted;
  const trustLevel = getTrustCircleLevel(
    viewer.address,
    post.authorAddress,
    trustEdges,
  );
  const circleLabel = trustCircleLabel(trustLevel);
  const isOwnPost = post.authorAddress === viewer.address;

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
    }[post.mood] ?? "😊");

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        "card-surface mx-auto max-w-lg overflow-hidden rounded-none border-x-0 sm:rounded-xl sm:border-x",
        post.id === DEMO_LIVE_TIP_POST_ID && "ring-2 ring-emerald-200",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 px-3 pt-3">
        <Link href={`/profile/${encodeURIComponent(author.address)}`}>
          <Avatar src={author.avatarUrl} alt={author.displayName} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${encodeURIComponent(author.address)}`}
            className="font-semibold text-slate-900 hover:underline"
          >
            {author.displayName}
          </Link>
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <span>{formatPostTime(post.createdAt)}</span>
            <PostAudienceBadge audience={post.audience} />
            {community && community.id !== "open-feed" && (
              <>
                <span>·</span>
                <Link
                  href={`/community/${community.id}`}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {community.name}
                </Link>
              </>
            )}
            {circleLabel && (
              <>
                <span>·</span>
                <span className="font-medium text-emerald-600">{circleLabel}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(post.isLive || post.format === "live") && (
            <span className="flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
          )}
          <PostTypeBadge type={post.type} />
          <PostLiveBadge authorAddress={post.authorAddress} />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 pb-2 pt-2">
        {post.type !== "thought" && post.title && post.title !== "…" && (
          <h3 className="mb-1 text-[15px] font-bold text-slate-900">
            {post.title}
          </h3>
        )}
        {post.id === DEMO_LIVE_TIP_POST_ID &&
          isLiveCirclesAuthor(post.authorAddress) && (
            <p className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 ring-1 ring-emerald-100">
              Live on Circles — tips send real CRC on Gnosis.
            </p>
          )}

        {post.format === "mood" && post.mood && (
          <p className="mb-2 text-lg">
            {moodEmoji}{" "}
            <span className="font-semibold capitalize text-slate-800">
              {post.mood}
            </span>
          </p>
        )}

        {!compact && (
          <p className="text-sm leading-relaxed text-slate-700">{post.body}</p>
        )}

        {post.imageUrl && (
          <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {post.amountRequested != null && post.amountRequested > 0 && (
          <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-100">
            Requesting {post.amountRequested} CRC
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Engagement stats */}
      {(engagementTotal > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {post.tipCount > 0 && (
              <>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                  <Coins className="h-2.5 w-2.5" />
                </span>
                {post.tipCount} tip{post.tipCount !== 1 ? "s" : ""}
              </>
            )}
            {post.amountBoosted > 0 && (
              <span className="ml-2">
                {post.amountBoosted} CRC boosted
              </span>
            )}
          </span>
          {commentCount > 0 && (
            <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      <div className="divider-fb mx-3" />

      {/* Action bar — Facebook style */}
      <div className="grid grid-cols-4 px-1 py-0.5">
        <button
          type="button"
          onClick={() => tipOnPost(post.id)}
          disabled={tipPending}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition hover:bg-[var(--surface-muted)] disabled:opacity-50",
            isLiveCirclesAuthor(post.authorAddress)
              ? "text-emerald-700"
              : "text-slate-600",
          )}
        >
          <Coins className="h-4 w-4" />
          {tipPending ? "…" : "Tip"}
        </button>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(`comment-input-${post.id}`)
              ?.focus()
          }
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-600 hover:bg-[var(--surface-muted)]"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <ShareButton
          variant="action"
          input={{
            postId: post.id,
            title: post.title,
            text: post.body.slice(0, 120),
          }}
        />
        <button
          type="button"
          onClick={() => boostOnPost(post.id)}
          disabled={boostPending}
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-600 hover:bg-[var(--surface-muted)] disabled:opacity-50"
        >
          <ArrowUpCircle className="h-4 w-4" />
          {boostPending ? "…" : "Boost"}
        </button>
      </div>

      <div className="divider-fb mx-3" />

      {/* Trust row */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-[11px] font-medium text-emerald-700 hover:underline"
        >
          {showWhy ? "Hide" : "Why am I seeing this?"}
        </button>
        <div className="flex items-center gap-1.5">
          {isOwnPost && (
            <button
              type="button"
              onClick={() => sharePostToStory(post.id)}
              className="flex items-center gap-1 rounded-full border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Story
            </button>
          )}
          <button
            type="button"
            onClick={() => onTrustAuthor(post.authorAddress)}
            disabled={author.trustedByViewer || trustPending}
            className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-100 disabled:opacity-50"
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            {author.trustedByViewer
              ? "Trusted"
              : trustPending
                ? "Trusting…"
                : "Trust author"}
          </button>
        </div>
      </div>

      {showWhy && (
        <div className="border-t border-[var(--border)] px-3 py-2">
          <TrustExplanation
            explanation={explanation}
            scoreBreakdown={scoreBreakdown}
          />
        </div>
      )}

      {/* Comments */}
      <div className="px-3 pb-3" id={`comments-${post.id}`}>
        <PostComments postId={post.id} inputId={`comment-input-${post.id}`} />
      </div>
    </article>
  );
}
