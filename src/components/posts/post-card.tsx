// src/components/posts/post-card.tsx
"use client";

import Link from "next/link";
import type { RankedPost } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { Avatar } from "@/components/ui/avatar";
import { ShareButton } from "@/components/ui/share-button";
import { PostTypeBadge } from "./post-type-badge";
import { PostLiveBadge } from "./post-live-badge";
import { TrustExplanation } from "./trust-explanation";
import {
  DEMO_LIVE_TIP_POST_ID,
  isLiveCirclesAuthor,
} from "@/lib/circles/live-authors";
import { TrustPathDisplay } from "@/components/trust/trust-path-display";
import { findTrustPath } from "@/lib/trust/trust-paths";
import {
  ArrowUpCircle,
  Coins,
  HeartHandshake,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PostCardProps {
  ranked: RankedPost;
  onTrustAuthor: (address: string) => void;
  compact?: boolean;
}

export function PostCard({ ranked, onTrustAuthor, compact }: PostCardProps) {
  const {
    viewer,
    getUser,
    trustEdges,
    tipOnPost,
    boostOnPost,
    isActionPending,
  } = useTrustbook();
  const { post, explanation, scoreBreakdown } = ranked;
  const author = getUser(post.authorAddress);
  const community = COMMUNITY_MAP[post.communityId];

  const tipPending = isActionPending(`tip:${post.id}`);
  const boostPending = isActionPending(`boost:${post.id}`);
  const trustPending = isActionPending(`trust:${post.authorAddress}`);

  if (!author) return null;

  const trustPath = findTrustPath(
    viewer.address,
    author.address,
    trustEdges,
    (addr) => getUser(addr)?.displayName ?? addr.slice(0, 8),
  );

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm",
        "ring-1 ring-slate-50/80",
        post.id === DEMO_LIVE_TIP_POST_ID &&
          "border-emerald-200 ring-2 ring-emerald-100",
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <Link href={`/profile/${encodeURIComponent(author.address)}`}>
          <Avatar src={author.avatarUrl} alt={author.displayName} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profile/${encodeURIComponent(author.address)}`}
              className="truncate font-semibold text-slate-900 hover:text-teal-700"
            >
              {author.displayName}
            </Link>
            <PostTypeBadge type={post.type} />
            <PostLiveBadge authorAddress={post.authorAddress} />
            <ShareButton
              variant="icon"
              input={{
                postId: post.id,
                title: post.title,
                text: post.body.slice(0, 120),
              }}
            />
          </div>
          {community && (
            <Link
              href={`/community/${community.id}`}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600"
            >
              <Users className="h-3 w-3" />
              {community.name}
            </Link>
          )}
        </div>
      </div>

      {post.id === DEMO_LIVE_TIP_POST_ID && isLiveCirclesAuthor(post.authorAddress) && (
        <p className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          Live Circles author — tips send real CRC on Gnosis with a{" "}
          <code className="text-[10px]">trustbook:tip</code> reference.
        </p>
      )}

      <h3 className="mb-1 text-base font-semibold text-slate-900">{post.title}</h3>
      {!compact && (
        <p className="mb-3 text-sm leading-relaxed text-slate-600">{post.body}</p>
      )}

      {post.amountRequested != null && post.amountRequested > 0 && (
        <p className="mb-2 text-xs font-medium text-amber-800">
          Requested: {post.amountRequested} CRC
        </p>
      )}

      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-2 rounded-lg bg-slate-50/80 px-3 py-2">
        <TrustPathDisplay path={trustPath} resolveName={(a) => getUser(a)?.displayName ?? "?"} compact />
      </div>

      <div className="mb-3">
        <TrustExplanation
          explanation={explanation}
          scoreBreakdown={scoreBreakdown}
        />
      </div>

      <div className="mb-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-600" />
          {post.amountBoosted} CRC boosted
        </span>
        <span className="flex items-center gap-1">
          <Coins className="h-3.5 w-3.5 text-sky-600" />
          {post.tipCount} tips
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => tipOnPost(post.id)}
          disabled={tipPending}
          className={cn(
            "flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50",
            isLiveCirclesAuthor(post.authorAddress)
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-sky-50 text-sky-800 hover:bg-sky-100",
          )}
        >
          <Coins className="h-3.5 w-3.5" />
          {tipPending
            ? "Tipping…"
            : isLiveCirclesAuthor(post.authorAddress)
              ? "Tip 1 CRC (live)"
              : "Tip 1 CRC"}
        </button>
        <button
          type="button"
          onClick={() => boostOnPost(post.id)}
          disabled={boostPending}
          className="flex items-center justify-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          {boostPending ? "Boosting…" : "Boost"}
        </button>
        <button
          type="button"
          onClick={() => onTrustAuthor(post.authorAddress)}
          disabled={author.trustedByViewer || trustPending}
          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          {author.trustedByViewer
            ? "Trusted"
            : trustPending
              ? "Trusting…"
              : "Trust author"}
        </button>
        <Link
          href={`/profile/${encodeURIComponent(author.address)}`}
          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </Link>
        {community && (
          <Link
            href={`/community/${community.id}`}
            className="col-span-2 flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:col-span-1"
          >
            <Users className="h-3.5 w-3.5" />
            Community
          </Link>
        )}
      </div>
    </article>
  );
}
