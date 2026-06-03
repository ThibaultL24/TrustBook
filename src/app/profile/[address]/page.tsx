// src/app/profile/[address]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTrustbook } from "@/providers/trustbook-provider";
import { ProfileView } from "@/components/profile/profile-view";
import { fetchCirclesProfile } from "@/lib/circles/public-api";
import { trustbookProfileToUser } from "@/lib/circles/live-profiles";
import type { UserProfile } from "@/lib/types";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const address = decodeURIComponent(params.address as string);
  const { getUser, viewer, trustEdges, viewerTrusts } = useTrustbook();
  const [remoteProfile, setRemoteProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const localProfile = getUser(address);
  const profile = localProfile ?? remoteProfile;

  useEffect(() => {
    if (localProfile) {
      setRemoteProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const fetched = await fetchCirclesProfile(address);
        if (cancelled || !fetched) return;

        const user = trustbookProfileToUser(fetched, viewer.address);
        const trustedByViewer = viewerTrusts.some(
          (a) => a.toLowerCase() === address.toLowerCase(),
        );
        const trustsViewer = trustEdges.some(
          (e) =>
            e.from.toLowerCase() === address.toLowerCase() &&
            e.to.toLowerCase() === viewer.address.toLowerCase(),
        );

        setRemoteProfile({
          ...user,
          trustedByViewer,
          trustsViewer,
          mutualTrustCount: trustsViewer && trustedByViewer ? 1 : 0,
          groups: user.groups ?? [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, localProfile, viewer.address, viewerTrusts, trustEdges]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500">Loading Circles profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
        <p className="text-slate-600">Profile not found on Circles.</p>
        <Link
          href="/feed"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  return <ProfileView profile={profile} />;
}
