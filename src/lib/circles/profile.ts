// src/lib/circles/profile.ts

import type { TrustbookProfile } from "./adapter-types";
import { formatCrcBalance } from "./format";

async function resolveCrcBalance(
  sdk: import("@aboutcircles/sdk").Sdk,
  address: `0x${string}`,
  view: { v1Balance?: string; v2Balance?: string },
): Promise<number | undefined> {
  const fromView = formatCrcBalance(view.v2Balance ?? view.v1Balance);
  if (fromView != null) return fromView;

  try {
    const total = await sdk.rpc.balance.getTotalBalance(address);
    return formatCrcBalance(total);
  } catch {
    return undefined;
  }
}

export async function fetchCirclesProfileFromSdk(
  address: string,
): Promise<TrustbookProfile> {
  const { Sdk } = await import("@aboutcircles/sdk");
  const sdk = new Sdk();
  const normalized = address as `0x${string}`;
  const view = await sdk.rpc.sdk.getProfileView(normalized);

  return {
    address: view.address,
    displayName: view.profile?.name ?? undefined,
    avatarUrl:
      view.profile?.previewImageUrl ?? view.profile?.imageUrl ?? undefined,
    bio: view.profile?.description,
    crcBalance: await resolveCrcBalance(sdk, normalized, view),
  };
}
