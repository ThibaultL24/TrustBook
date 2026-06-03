// src/components/profile/profile-view.tsx
"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { applyProfileMediaToUser } from "@/lib/profile/profile-media-store";
import { PostCard } from "@/components/posts/post-card";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { rankPost } from "@/lib/ranking/feed-ranking";
import { BottomNav } from "@/components/layout/bottom-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileCoverHeader } from "./profile-cover-header";
import { ProfileTabs, type ProfileTab } from "./profile-tabs";
import { ProfileAboutSection } from "./profile-about-section";
import { ProfileTrustSection } from "./profile-trust-section";
import { EditProfileModal } from "./edit-profile-modal";
import { FileText } from "lucide-react";

interface ProfileViewProps {
  profile: UserProfile;
}

export function ProfileView({ profile: profileProp }: ProfileViewProps) {
  const {
    viewer,
    trustEdges,
    getPostsByAuthor,
    getUser,
    getProfileMedia,
    canSignActions,
    isActionPending,
  } = useTrustbook();

  const profile =
    getUser(profileProp.address) ??
    applyProfileMediaToUser(profileProp, {
      [profileProp.address.trim().toLowerCase()]: getProfileMedia(
        profileProp.address,
      ),
    });

  const [tab, setTab] = useState<ProfileTab>("posts");
  const [trustOpen, setTrustOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const authorPosts = getPostsByAuthor(profile.address);
  const isOwnProfile =
    profile.address.toLowerCase() === viewer.address.toLowerCase();
  const trustPending = isActionPending(`trust:${profile.address}`);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="mx-auto max-w-lg">
        <ProfileCoverHeader
          profile={profile}
          postCount={authorPosts.length}
          isOwnProfile={isOwnProfile}
          onTrustClick={() => setTrustOpen(true)}
          onEditClick={() => setEditOpen(true)}
          trustPending={trustPending}
          canTrust={canSignActions}
        />

        <ProfileTabs
          active={tab}
          onChange={setTab}
          postCount={authorPosts.length}
        />

        {tab === "posts" && (
          <div className="space-y-2 px-0 py-2 sm:px-3">
            {authorPosts.length === 0 ? (
              <div className="px-3">
                <EmptyState
                  icon={FileText}
                  title="No posts yet"
                  description={
                    isOwnProfile
                      ? "Share something with your trust circle from the feed."
                      : `${profile.displayName} hasn't posted yet.`
                  }
                />
              </div>
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
        )}

        {tab === "about" && <ProfileAboutSection profile={profile} />}

        {tab === "trust" && <ProfileTrustSection profile={profile} />}
      </div>

      {trustOpen && (
        <TrustConfirmModal
          address={profile.address}
          profile={profile}
          onClose={() => setTrustOpen(false)}
        />
      )}

      {editOpen && isOwnProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
