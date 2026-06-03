// src/app/community/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { CommunityView } from "@/components/community/community-view";
import Link from "next/link";

export default function CommunityPage() {
  const params = useParams();
  const id = params.id as string;
  const community = COMMUNITY_MAP[id];

  if (!community) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-600">Community not found.</p>
        <Link href="/feed" className="text-sm text-teal-700 hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  return <CommunityView community={community} />;
}
