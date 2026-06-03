// src/lib/circles/trust-peers.ts

import { fetchCirclesProfile } from "./public-api";

export interface TrustPeer {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  relation: "trusts" | "trustedBy" | "mutual";
}

function normalize(addr: string): string {
  return addr.trim().toLowerCase();
}

function isHumanAvatar(type?: string): boolean {
  if (!type) return true;
  return type.includes("Human") || type.includes("RegisterHuman");
}

/** Peers from the Circles trust graph (same approach as HistoryGuessr). */
export async function fetchTrustPeers(
  avatarAddress: string,
  limit = 48,
): Promise<TrustPeer[]> {
  try {
    const { Sdk } = await import("@aboutcircles/sdk");
    const sdk = new Sdk();
    const rels = await sdk.data.getTrustRelations(
      avatarAddress as `0x${string}`,
    );

    const trusting = new Set<string>();
    const trustedBy = new Set<string>();

    for (const row of rels) {
      const avatarType = (row as { objectAvatarType?: string }).objectAvatarType;
      if (!isHumanAvatar(avatarType)) continue;
      const peer = normalize(row.objectAvatar);
      if (peer === normalize(avatarAddress)) continue;
      if (row.relation === "trusts") trusting.add(peer);
      if (row.relation === "trustedBy") trustedBy.add(peer);
    }

    const addresses = [...new Set([...trusting, ...trustedBy])].slice(0, limit);
    if (addresses.length === 0) return [];

    const peers: TrustPeer[] = addresses.map((address) => {
      const t = trusting.has(normalize(address));
      const b = trustedBy.has(normalize(address));
      return {
        address,
        relation: t && b ? "mutual" : t ? "trusts" : "trustedBy",
      };
    });

    const profiles = await Promise.all(
      peers.map(async (peer) => {
        try {
          const profile = await fetchCirclesProfile(peer.address);
          return {
            address: peer.address,
            displayName: profile?.displayName,
            avatarUrl: profile?.avatarUrl,
            relation: peer.relation,
          };
        } catch {
          return peer;
        }
      }),
    );

    return profiles.sort((a, b) => {
      const rank = (r: TrustPeer["relation"]) =>
        r === "mutual" ? 0 : r === "trusts" ? 1 : 2;
      return rank(a.relation) - rank(b.relation);
    });
  } catch {
    return [];
  }
}

export function peerDisplayName(peer: TrustPeer): string {
  if (peer.displayName?.trim()) return peer.displayName.trim();
  return `${peer.address.slice(0, 6)}…${peer.address.slice(-4)}`;
}

export function relationLabel(relation: TrustPeer["relation"]): string {
  switch (relation) {
    case "mutual":
      return "Mutual trust";
    case "trusts":
      return "You trust";
    case "trustedBy":
      return "Trusts you";
  }
}
