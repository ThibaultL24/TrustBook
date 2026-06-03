// src/components/profile/profile-view.tsx
"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { Avatar } from "@/components/ui/avatar";
import { ShareButton } from "@/components/ui/share-button";
import { TrustRelationDisplay } from "./trust-relation-display";
import { TrustPathDisplay } from "@/components/trust/trust-path-display";
import { findTrustPath } from "@/lib/trust/trust-paths";
import { PostCard } from "@/components/posts/post-card";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { rankPost } from "@/lib/ranking/feed-ranking";
import Link from "next/link";
import { ArrowLeft, HeartHandshake, Users } from "lucide-react";

interface ProfileViewProps {
  profile: UserProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const {
    viewer,
    trustEdges,
    getPostsByAuthor,
    getUser,
    canSignActions,
    isActionPending,
  } = useTrustbook();
  const [trustOpen, setTrustOpen] = useState(false);
  const authorPosts = getPostsByAuthor(profile.address).slice(0, 5);

  const sharedCommunities = profile.groups.filter((g) =>
    viewer.groups.includes(g),
  );

  const trustLabel = profile.trustedByViewer
    ? "Trusted"
    : profile.trustsViewer
      ? "Trust back"
      : "Trust";

  const trustPending = isActionPending(`trust:${profile.address}`);

  const trustPath =
    profile.address !== viewer.address
      ? findTrustPath(
          viewer.address,
          profile.address,
          trustEdges,
          (addr) => getUser(addr)?.displayName ?? addr.slice(0, 8),
        )
      : null;

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

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="lg"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {profile.displayName}
                </h1>
                <p className="font-mono text-xs text-slate-400">
                  {profile.address.slice(0, 10)}…
                </p>
                {profile.trustLevel && (
                  <span className="mt-1 inline-block text-xs text-teal-700">
                    {profile.trustLevel}
                    {profile.trustScore != null && ` · ${profile.trustScore}`}
                  </span>
                )}
              </div>
            </div>
            <ShareButton
              variant="icon"
              input={{
                profileAddress: profile.address,
                title: profile.displayName,
                text: profile.bio,
              }}
            />
          </div>

          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            {profile.bio}
          </p>

          <div className="mb-4 space-y-3">
            <TrustRelationDisplay profile={profile} />
            {trustPath && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <TrustPathDisplay
                  path={trustPath}
                  resolveName={(a) => getUser(a)?.displayName ?? "?"}
                />
              </div>
            )}
          </div>

          {sharedCommunities.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
                <Users className="h-3 w-3" />
                Shared communities
              </p>
              <div className="flex flex-wrap gap-2">
                {sharedCommunities.map((id) => {
                  const c = COMMUNITY_MAP[id];
                  return c ? (
                    <Link
                      key={id}
                      href={`/community/${id}`}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      {c.name}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {profile.address !== viewer.address && (
            <button
              type="button"
              disabled={
                !canSignActions || profile.trustedByViewer || trustPending
              }
              onClick={() => setTrustOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              <HeartHandshake className="h-4 w-4" />
              {trustPending ? "Trusting…" : trustLabel}
            </button>
          )}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Recent posts
        </h2>
        <div className="space-y-4">
          {authorPosts.length === 0 ? (
            <p className="text-sm text-slate-500">No posts yet.</p>
          ) : (
            authorPosts.map((post) => (
              <PostCard
                key={post.id}
                ranked={rankPost(
                  post,
                  viewer.address,
                  viewer.groups,
                  getUser(post.authorAddress),
                  trustEdges,
                )}
                onTrustAuthor={() => setTrustOpen(true)}
              />
            ))
          )}
        </div>
      </div>

      {trustOpen && (
        <TrustConfirmModal
          address={profile.address}
          profile={profile}
          onClose={() => setTrustOpen(false)}
        />
      )}
    </div>
  );
}
