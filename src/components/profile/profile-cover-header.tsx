// src/components/profile/profile-cover-header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { ShareButton } from "@/components/ui/share-button";
import { useMockSession } from "@/providers/mock-session-provider";
import { getTrustCircleLevel, trustCircleLabel } from "@/lib/trust/trust-circle";
import { useTrustbook } from "@/providers/trustbook-provider";
import {
  demoAvatarForAddress,
  demoCoverForAddress,
} from "@/lib/mock/demo-media";
import { defaultCoverForAddress } from "@/lib/profile/profile-media-store";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft,
  Camera,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

function coverImageForAddress(address: string, coverUrl?: string): string {
  return (
    coverUrl ??
    demoCoverForAddress(address) ??
    defaultCoverForAddress(address)
  );
}

interface ProfileCoverHeaderProps {
  profile: UserProfile;
  postCount: number;
  isOwnProfile: boolean;
  onTrustClick: () => void;
  onEditClick: () => void;
  trustPending: boolean;
  canTrust: boolean;
}

export function ProfileCoverHeader({
  profile,
  postCount,
  isOwnProfile,
  onTrustClick,
  onEditClick,
  trustPending,
  canTrust,
}: ProfileCoverHeaderProps) {
  const { viewer, trustEdges, trustPeers } = useTrustbook();
  const { usesLiveWallet } = useMockSession();

  const trustLevel = getTrustCircleLevel(
    viewer.address,
    profile.address,
    trustEdges,
  );
  const circleLabel = trustCircleLabel(trustLevel);

  const trustLabel = profile.trustedByViewer
    ? "Trusted"
    : profile.trustsViewer
      ? "Trust back"
      : "Trust on Circles";

  const connectionCount =
    profile.address.toLowerCase() === viewer.address.toLowerCase()
      ? trustPeers.length
      : profile.mutualTrustCount +
        (profile.trustedByViewer ? 1 : 0) +
        (profile.trustsViewer ? 1 : 0);

  return (
    <div className="card-surface overflow-hidden rounded-none border-x-0 sm:rounded-b-2xl sm:border-x">
      {/* Cover — Facebook-style with X overlay nav */}
      <div className="relative h-40 w-full sm:h-48">
        <Image
          src={coverImageForAddress(profile.address, profile.coverUrl)}
          alt=""
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
          <Link
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="truncate px-2 text-sm font-bold text-white drop-shadow md:hidden">
            {profile.displayName}
          </p>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {isOwnProfile && (
          <button
            type="button"
            onClick={onEditClick}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow hover:bg-white"
          >
            <Camera className="h-3.5 w-3.5" />
            Edit cover
          </button>
        )}
      </div>

      {/* Avatar + identity */}
      <div className="relative px-4 pb-4">
        <div className="-mt-14 mb-3 flex items-end justify-between">
          {isOwnProfile ? (
            <button
              type="button"
              onClick={onEditClick}
              className="relative rounded-full bg-white p-1 shadow-lg ring-4 ring-white hover:ring-emerald-200"
              aria-label="Change profile photo"
            >
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="lg"
                className="!h-28 !w-28"
              />
              <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow ring-2 ring-white">
                <Camera className="h-4 w-4" />
              </span>
            </button>
          ) : (
            <div className="rounded-full bg-white p-1 shadow-lg ring-4 ring-white">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="lg"
                className="!h-28 !w-28"
              />
            </div>
          )}
          {!isOwnProfile && (
            <div className="mb-1 flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Message"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <ShareButton
                variant="icon"
                input={{
                  profileAddress: profile.address,
                  title: profile.displayName,
                  text: profile.bio,
                }}
                className="!flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-sm"
              />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{profile.displayName}</h1>
        <p className="font-mono text-xs text-slate-400">
          {profile.address.slice(0, 8)}…{profile.address.slice(-6)}
        </p>

        {profile.bio && (
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{profile.bio}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {circleLabel && (
            <span className="font-medium text-emerald-700">{circleLabel}</span>
          )}
          {profile.trustLevel && <span>{profile.trustLevel}</span>}
          {usesLiveWallet && profile.crcBalance != null && (
            <span className="font-semibold text-emerald-700">
              {profile.crcBalance} CRC
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            Circles · Gnosis
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-8 border-y border-[var(--border)] py-3">
          <div>
            <p className="text-xl font-bold text-slate-900">{postCount}</p>
            <p className="text-xs text-slate-500">Posts</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{connectionCount}</p>
            <p className="text-xs text-slate-500">Trust links</p>
          </div>
          {profile.trustScore != null && (
            <div>
              <p className="text-xl font-bold text-slate-900">{profile.trustScore}</p>
              <p className="text-xs text-slate-500">Trust score</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {isOwnProfile ? (
            <>
              <Link
                href="/feed"
                className="flex items-center justify-center rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                View feed
              </Link>
              <button
                type="button"
                onClick={onEditClick}
                className="flex items-center justify-center rounded-lg bg-[var(--surface-muted)] py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-[var(--border)] hover:bg-white"
              >
                Edit profile
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!canTrust || profile.trustedByViewer || trustPending}
                onClick={onTrustClick}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold",
                  profile.trustedByViewer
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
                )}
              >
                <HeartHandshake className="h-4 w-4" />
                {trustPending ? "Trusting…" : trustLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  document
                    .querySelector("[data-profile-tab=posts]")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center rounded-lg bg-[var(--surface-muted)] py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-[var(--border)] hover:bg-white"
              >
                Follow posts
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
