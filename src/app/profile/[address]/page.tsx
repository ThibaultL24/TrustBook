// src/app/profile/[address]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useTrustbook } from "@/providers/trustbook-provider";
import { ProfileView } from "@/components/profile/profile-view";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const address = decodeURIComponent(params.address as string);
  const { getUser } = useTrustbook();
  const profile = getUser(address);

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-600">Profile not found.</p>
        <Link href="/feed" className="text-sm text-teal-700 hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  return <ProfileView profile={profile} />;
}
