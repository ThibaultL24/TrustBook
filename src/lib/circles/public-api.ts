// src/lib/circles/public-api.ts

import { isMockMode } from "@/lib/config/runtime";
import type {
  CommonTrustResult,
  TrustbookProfile,
  TrustRelation,
} from "./adapter-types";
import { fetchCirclesProfileFromSdk } from "./profile";
import { getCirclesSession } from "./circles-session";
import { getMockUser } from "@/lib/mock/users";
import {
  getCommonTrustCount,
  MOCK_TRUST_EDGES,
} from "@/lib/mock/trust-edges";

function profileFromMock(address: string): TrustbookProfile | null {
  const mock = getMockUser(address);
  if (!mock) return { address };
  return {
    address: mock.address,
    displayName: mock.displayName,
    avatarUrl: mock.avatarUrl,
    bio: mock.bio,
    crcBalance: mock.crcBalance,
  };
}

export async function fetchCirclesProfile(
  address: string,
): Promise<TrustbookProfile | null> {
  if (isMockMode && !getCirclesSession()) return profileFromMock(address);

  try {
    return await fetchCirclesProfileFromSdk(address);
  } catch {
    return profileFromMock(address) ?? { address };
  }
}

export async function fetchCommonTrust(
  viewerAddress: string,
  targetAddress: string,
): Promise<CommonTrustResult> {
  if (isMockMode && !getCirclesSession()) {
    return { count: getCommonTrustCount(viewerAddress, targetAddress) };
  }

  try {
    const { Sdk } = await import("@aboutcircles/sdk");
    const sdk = new Sdk();
    const common = await sdk.rpc.trust.getCommonTrust(
      viewerAddress as `0x${string}`,
      targetAddress as `0x${string}`,
    );
    return { count: common.length };
  } catch {
    return { count: getCommonTrustCount(viewerAddress, targetAddress) };
  }
}

function isHumanAvatar(type?: string): boolean {
  if (!type) return true;
  return type.includes("Human") || type.includes("RegisterHuman");
}

export async function fetchTrustRelations(
  address: string,
): Promise<TrustRelation[]> {
  if (isMockMode && !getCirclesSession()) {
    const outgoing = MOCK_TRUST_EDGES.filter((e) => e.from === address).map(
      (e) => ({ address: e.to, direction: "outgoing" as const }),
    );
    const incoming = MOCK_TRUST_EDGES.filter((e) => e.to === address).map(
      (e) => ({ address: e.from, direction: "incoming" as const }),
    );
    return [...outgoing, ...incoming];
  }

  try {
    const { Sdk } = await import("@aboutcircles/sdk");
    const sdk = new Sdk();
    const rels = await sdk.data.getTrustRelations(address as `0x${string}`);

    const outgoing = new Set<string>();
    const incoming = new Set<string>();

    for (const row of rels) {
      const avatarType = (row as { objectAvatarType?: string }).objectAvatarType;
      if (!isHumanAvatar(avatarType)) continue;
      const peer = row.objectAvatar.toLowerCase();
      if (peer === address.toLowerCase()) continue;
      if (row.relation === "trusts") outgoing.add(row.objectAvatar);
      if (row.relation === "trustedBy") incoming.add(row.objectAvatar);
    }

    return [
      ...[...outgoing].map((a) => ({
        address: a,
        direction: "outgoing" as const,
      })),
      ...[...incoming].map((a) => ({
        address: a,
        direction: "incoming" as const,
      })),
    ];
  } catch {
    const outgoing = MOCK_TRUST_EDGES.filter((e) => e.from === address).map(
      (e) => ({ address: e.to, direction: "outgoing" as const }),
    );
    const incoming = MOCK_TRUST_EDGES.filter((e) => e.to === address).map(
      (e) => ({ address: e.from, direction: "incoming" as const }),
    );
    return [...outgoing, ...incoming];
  }
}
