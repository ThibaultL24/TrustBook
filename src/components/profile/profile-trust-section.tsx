// src/components/profile/profile-trust-section.tsx
"use client";

import type { UserProfile } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { TrustPathDisplay } from "@/components/trust/trust-path-display";
import { findTrustPath } from "@/lib/trust/trust-paths";
import { getTrustCircleLevel, trustCircleLabel } from "@/lib/trust/trust-circle";
import { peerDisplayName, relationLabel } from "@/lib/circles/trust-peers";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { GitBranch } from "lucide-react";

interface ProfileTrustSectionProps {
  profile: UserProfile;
}

export function ProfileTrustSection({ profile }: ProfileTrustSectionProps) {
  const { viewer, trustEdges, trustPeers, getUser } = useTrustbook();

  const isOwn =
    profile.address.toLowerCase() === viewer.address.toLowerCase();

  const trustPath =
    !isOwn &&
    findTrustPath(
      viewer.address,
      profile.address,
      trustEdges,
      (addr) => getUser(addr)?.displayName ?? addr.slice(0, 8),
    );

  const level = getTrustCircleLevel(viewer.address, profile.address, trustEdges);

  const relatedPeers = isOwn
    ? trustPeers
    : trustPeers.filter(
        (p) => p.address.toLowerCase() === profile.address.toLowerCase(),
      );

  return (
    <div className="mx-auto max-w-lg space-y-3 px-3 py-3">
      <section className="card-surface rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Trust on Circles</h3>
        </div>

        {!isOwn && (
          <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {trustCircleLabel(level) || "Outside your direct trust circle"}
          </p>
        )}

        {trustPath && (
          <div className="mb-3 rounded-xl bg-[var(--surface-muted)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Path from you
            </p>
            <TrustPathDisplay
              path={trustPath}
              resolveName={(a) => getUser(a)?.displayName ?? "?"}
            />
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-[var(--surface-muted)] p-3">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              You trust
            </dt>
            <dd className="mt-0.5 font-bold text-slate-900">
              {profile.trustedByViewer ? "Yes" : "No"}
            </dd>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-3">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              Trusts you
            </dt>
            <dd className="mt-0.5 font-bold text-slate-900">
              {profile.trustsViewer ? "Yes" : "No"}
            </dd>
          </div>
          <div className="col-span-2 rounded-lg bg-[var(--surface-muted)] p-3">
            <dt className="text-[10px] font-semibold uppercase text-slate-500">
              Common trust paths
            </dt>
            <dd className="mt-0.5 font-bold text-slate-900">
              {profile.mutualTrustCount}
            </dd>
          </div>
        </dl>
      </section>

      {isOwn && trustPeers.length > 0 && (
        <section className="card-surface rounded-2xl p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Your trust circle
          </h3>
          <ul className="space-y-2">
            {trustPeers.map((peer) => (
              <li key={peer.address}>
                <Link
                  href={`/profile/${encodeURIComponent(peer.address)}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-2.5 hover:bg-[var(--surface-muted)]"
                >
                  <Avatar
                    src={peer.avatarUrl ?? "https://placekitten.com/231/231"}
                    alt={peerDisplayName(peer)}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {peerDisplayName(peer)}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      {relationLabel(peer.relation)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
