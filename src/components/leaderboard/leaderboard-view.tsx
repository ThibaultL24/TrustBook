// src/components/leaderboard/leaderboard-view.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTrustbook } from "@/providers/trustbook-provider";
import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { VIEWER_ADDRESS } from "@/lib/mock/addresses";
import {
  rankAuthors,
  rankCommunities,
  rankImpactPosts,
} from "@/lib/ranking/leaderboard-ranking";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { PostTypeBadge } from "@/components/posts/post-type-badge";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Coins, TrendingUp, Users } from "lucide-react";

type LeaderboardTab = "authors" | "communities" | "posts";

export function LeaderboardView() {
  const { posts, users, trustEdges, getUser } = useTrustbook();
  const [tab, setTab] = useState<LeaderboardTab>("authors");

  const viewer = users.find((u) => u.address === VIEWER_ADDRESS)!;

  const authors = useMemo(
    () => rankAuthors(posts, users, VIEWER_ADDRESS, trustEdges),
    [posts, users, trustEdges],
  );

  const communities = useMemo(
    () => rankCommunities(posts, MOCK_COMMUNITIES),
    [posts],
  );

  const impactPosts = useMemo(
    () =>
      rankImpactPosts(
        posts,
        VIEWER_ADDRESS,
        viewer.groups,
        getUser,
        (addr) => getUser(addr)?.displayName ?? "Unknown",
      ),
    [posts, viewer.groups, getUser],
  );

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: "authors", label: "Authors" },
    { id: "communities", label: "Communities" },
    { id: "posts", label: "Impact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <header className="border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <Link
          href="/feed"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Feed
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-xs text-slate-500">
          CRC signals and trust-weighted impact — updates live as you tip and
          boost
        </p>
      </header>

      <div className="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold",
              tab === t.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="mx-auto max-w-lg space-y-3 px-4">
        {tab === "authors" &&
          authors.map((entry, i) => (
            <Link
              key={entry.address}
              href={`/profile/${encodeURIComponent(entry.address)}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="w-6 text-center text-sm font-bold text-slate-400">
                {i + 1}
              </span>
              <Avatar
                src={entry.avatarUrl}
                alt={entry.displayName}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {entry.displayName}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.postCount} posts · {entry.totalTips} tips ·{" "}
                  {entry.totalBoosted} CRC boosted
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-teal-700">
                  {Math.round(entry.score)}
                </p>
                <p className="text-[10px] text-slate-400">score</p>
              </div>
            </Link>
          ))}

        {tab === "communities" &&
          communities.map((entry, i) => (
            <Link
              key={entry.communityId}
              href={`/community/${entry.communityId}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="w-6 text-center text-sm font-bold text-slate-400">
                {i + 1}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{entry.name}</p>
                <p className="text-xs text-slate-500">
                  {entry.postCount} posts · {entry.activeAuthors} authors ·{" "}
                  {entry.needsOffersCount} needs/offers
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-0.5 text-xs text-emerald-700">
                  <Coins className="h-3 w-3" />
                  {entry.totalBoosted}
                </p>
                <p className="text-[10px] text-slate-400">boosted</p>
              </div>
            </Link>
          ))}

        {tab === "posts" &&
          impactPosts.map((entry, i) => (
            <Link
              key={entry.post.id}
              href={`/feed?postId=${entry.post.id}`}
              className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400">
                  #{i + 1}
                </span>
                <PostTypeBadge type={entry.post.type} />
                <span className="text-xs text-slate-500">{entry.authorName}</span>
              </div>
              <p className="mb-2 font-semibold text-slate-900">
                {entry.post.title}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  {entry.post.amountBoosted} boosted
                </span>
                <span>{entry.post.tipCount} tips</span>
                <span>Trust score {Math.round(entry.trustWeightedScore)}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-teal-700">
                Impact {Math.round(entry.impactScore)}
              </p>
            </Link>
          ))}
      </main>

      <BottomNav />
    </div>
  );
}
