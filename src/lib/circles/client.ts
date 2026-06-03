// src/lib/circles/client.ts

import { getCirclesAdapter } from "./adapter";
import type { CirclesSession, TrustRelations } from "./types";

/**
 * Legacy client facade — delegates to CirclesAdapter.
 * Prefer getCirclesAdapter() for new code.
 */
export interface CirclesClient {
  getSession(): Promise<CirclesSession | null>;
  getProfile(address: string): Promise<CirclesSession | null>;
  getTrustRelations(address: string): Promise<TrustRelations>;
  getCommonTrust(
    viewerAddress: string,
    targetAddress: string,
  ): Promise<number>;
}

class AdapterCirclesClient implements CirclesClient {
  async getSession(): Promise<CirclesSession | null> {
    const user = await getCirclesAdapter().getCurrentUser();
    if (!user) return null;
    const profile = await getCirclesAdapter().getProfile(user.address);
    return {
      address: user.address,
      displayName: user.displayName ?? profile?.displayName,
      avatarUrl: user.avatarUrl ?? profile?.avatarUrl,
      crcBalance: profile?.crcBalance,
    };
  }

  async getProfile(address: string): Promise<CirclesSession | null> {
    const profile = await getCirclesAdapter().getProfile(address);
    if (!profile) return null;
    return {
      address: profile.address,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      crcBalance: profile.crcBalance,
    };
  }

  async getTrustRelations(address: string): Promise<TrustRelations> {
    const relations = await getCirclesAdapter().getTrustRelations(address);
    return {
      trusts: relations
        .filter((r) => r.direction === "outgoing")
        .map((r) => r.address),
      trustedBy: relations
        .filter((r) => r.direction === "incoming")
        .map((r) => r.address),
    };
  }

  async getCommonTrust(
    viewerAddress: string,
    targetAddress: string,
  ): Promise<number> {
    const result = await getCirclesAdapter().getCommonTrust(
      viewerAddress,
      targetAddress,
    );
    return result.count;
  }
}

let client: CirclesClient = new AdapterCirclesClient();

export function setCirclesClient(next: CirclesClient): void {
  client = next;
}

export function getCirclesClient(): CirclesClient {
  return client;
}

export async function getCurrentAvatar(): Promise<string | null> {
  const session = await client.getSession();
  return session?.avatarUrl ?? null;
}
