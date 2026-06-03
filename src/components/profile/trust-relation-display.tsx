// src/components/profile/trust-relation-display.tsx

import type { UserProfile } from "@/lib/types";
import { GitBranch } from "lucide-react";

function getRelationLabel(profile: UserProfile): string {
  if (profile.trustedByViewer && profile.trustsViewer) return "Mutual trust";
  if (profile.trustedByViewer) return "You trust this user";
  if (profile.trustsViewer) return "This user trusts you";
  return "No direct trust yet";
}

interface TrustRelationDisplayProps {
  profile: UserProfile;
}

export function TrustRelationDisplay({ profile }: TrustRelationDisplayProps) {
  const label = getRelationLabel(profile);

  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-teal-700" />
        <p className="text-sm font-semibold text-teal-900">{label}</p>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-slate-600">
        Trust in Circles is economic acceptance, not a casual follow. Accepting
        someone&apos;s CRC exposes part of your routing graph to their currency.
      </p>
      <p className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">
          {profile.mutualTrustCount}
        </span>{" "}
        common trust path{profile.mutualTrustCount === 1 ? "" : "s"} via your
        network
      </p>
    </div>
  );
}
