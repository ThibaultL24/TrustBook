// src/components/community/community-view.tsx
"use client";

import { useState } from "react";
import type { Community } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { getMockUsers } from "@/lib/mock/users";
import { PostCard } from "@/components/posts/post-card";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { ShareButton } from "@/components/ui/share-button";
import { rankPost } from "@/lib/ranking/feed-ranking";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface CommunityViewProps {
  community: Community;
}

export function CommunityView({ community }: CommunityViewProps) {
  const { viewer, trustEdges, getPostsByCommunity, getUser } = useTrustbook();
  const [showCreate, setShowCreate] = useState(false);
  const [trustTarget, setTrustTarget] = useState<string | null>(null);

  const posts = getPostsByCommunity(community.id).slice(0, 8);
  const members = getMockUsers()
    .filter((u) => u.groups.includes(community.id))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <div className="mx-auto max-w-lg px-4 pt-4">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-20 bg-gradient-to-r from-teal-100 to-sky-100" />
          <div className="relative px-6 pb-6">
            <div className="-mt-10 mb-3">
              <Avatar
                src={community.avatarUrl}
                alt={community.name}
                size="lg"
                className="ring-4 ring-white"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{community.name}</h1>
            <p className="mt-1 text-xs capitalize text-slate-500">
              {community.category.replace("-", " ")} · {community.memberCount}{" "}
              members
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {community.description}
            </p>

            <div className="mt-4 flex gap-2">
              <ShareButton
                className="flex-1 py-2 text-sm"
                label="Share community"
                input={{
                  communityId: community.id,
                  title: community.name,
                  text: community.description,
                }}
              />
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create post
              </button>
            </div>
          </div>
        </div>

        <h2 className="mb-2 text-sm font-semibold text-slate-900">Members</h2>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {members.map((m) => (
            <Link
              key={m.address}
              href={`/profile/${encodeURIComponent(m.address)}`}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <Avatar src={m.avatarUrl} alt={m.displayName} size="sm" />
              <span className="max-w-[4rem] truncate text-[10px] text-slate-600">
                {m.displayName.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-slate-900">Top posts</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-slate-500">No posts in this community yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                ranked={rankPost(
                  post,
                  viewer.address,
                  viewer.groups,
                  getUser(post.authorAddress),
                  trustEdges,
                )}
                onTrustAuthor={setTrustTarget}
              />
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          defaultCommunityId={community.id}
          onClose={() => setShowCreate(false)}
        />
      )}

      {trustTarget && (
        <TrustConfirmModal
          address={trustTarget}
          profile={getUser(trustTarget)}
          onClose={() => setTrustTarget(null)}
        />
      )}
    </div>
  );
}
