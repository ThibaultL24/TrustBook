// src/components/profile/profile-about-section.tsx
"use client";

import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { useTrustbook } from "@/providers/trustbook-provider";
import { TrustRelationDisplay } from "./trust-relation-display";
import { Coins, Copy, Users } from "lucide-react";
import { useState } from "react";

interface ProfileAboutSectionProps {
  profile: UserProfile;
}

export function ProfileAboutSection({ profile }: ProfileAboutSectionProps) {
  const { viewer } = useTrustbook();
  const [copied, setCopied] = useState(false);

  const sharedCommunities = profile.groups.filter((g) =>
    viewer.groups.includes(g),
  );

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(profile.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-3 px-3 py-3">
      <section className="card-surface rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Overview</h3>
        <ul className="space-y-3 text-sm text-slate-700">
          {profile.bio && (
            <li>
              <p className="text-xs font-semibold uppercase text-slate-400">Bio</p>
              <p className="mt-0.5">{profile.bio}</p>
            </li>
          )}
          {profile.crcBalance != null && (
            <li className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span>{profile.crcBalance} CRC balance</span>
            </li>
          )}
          <li>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Circles address
            </p>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="mt-1 flex items-center gap-1 font-mono text-xs text-emerald-700 hover:underline"
            >
              {profile.address}
              <Copy className="h-3 w-3" />
              {copied && <span className="font-sans text-slate-500">Copied</span>}
            </button>
          </li>
        </ul>
      </section>

      <TrustRelationDisplay profile={profile} />

      {profile.groups.length > 0 && (
        <section className="card-surface rounded-2xl p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Users className="h-4 w-4 text-emerald-600" />
            Communities
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.groups.map((id) => {
              const c = COMMUNITY_MAP[id];
              return c ? (
                <Link
                  key={id}
                  href={`/community/${id}`}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-100"
                >
                  {c.name}
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}

      {sharedCommunities.length > 0 && (
        <section className="card-surface rounded-2xl p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-900">
            Shared with you
          </h3>
          <div className="flex flex-wrap gap-2">
            {sharedCommunities.map((id) => {
              const c = COMMUNITY_MAP[id];
              return c ? (
                <span
                  key={id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {c.name}
                </span>
              ) : null;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
