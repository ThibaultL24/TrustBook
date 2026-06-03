// src/lib/circles/live-profiles.ts

import type { TrustbookProfile } from "./adapter-types";
import type { UserProfile } from "@/lib/types";
import { shortenAddress } from "./format";

export function trustbookProfileToUser(
  profile: TrustbookProfile,
  viewerAddress: string,
): UserProfile {
  return {
    address: profile.address,
    displayName: profile.displayName ?? shortenAddress(profile.address),
    avatarUrl: profile.avatarUrl ?? "",
    bio: profile.bio ?? "",
    crcBalance: profile.crcBalance,
    groups: [],
    trustedByViewer: false,
    trustsViewer: false,
    mutualTrustCount: 0,
  };
}

export function liveAuthorPlaceholder(address: string): UserProfile {
  return {
    address,
    displayName: shortenAddress(address),
    avatarUrl: "",
    bio: "Loading Circles profile…",
    groups: [],
    trustedByViewer: false,
    trustsViewer: false,
    mutualTrustCount: 0,
  };
}
