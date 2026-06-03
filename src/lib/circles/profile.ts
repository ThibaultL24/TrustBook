// src/lib/circles/profile.ts

import type { TrustbookProfile } from "./adapter-types";
import { formatCrcBalance } from "./format";

export async function fetchCirclesProfileFromSdk(
  address: string,
): Promise<TrustbookProfile> {
  const { Sdk } = await import("@aboutcircles/sdk");
  const sdk = new Sdk();
  const view = await sdk.rpc.sdk.getProfileView(address as `0x${string}`);

  return {
    address: view.address,
    displayName: view.profile?.name ?? undefined,
    avatarUrl:
      view.profile?.previewImageUrl ?? view.profile?.imageUrl ?? undefined,
    bio: view.profile?.description,
    crcBalance: formatCrcBalance(view.v2Balance ?? view.v1Balance),
  };
}
