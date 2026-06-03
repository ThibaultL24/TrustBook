// src/lib/intuition/adapter.ts

import { isIntuitionApiConfigured } from "@/lib/config/runtime";
import type {
  CreateRecommendationClaimInput,
  CreateTrustbookPostClaimInput,
  IntuitionClaim,
  TrustbookIntuitionSignal,
} from "./types";
import { getMockIntuitionSignals } from "./mock";

/**
 * Optional Intuition adapter — degrades to mock/offline when API is unset.
 * TODO: wire to Intuition GraphQL/indexer per https://docs.intuition.systems/
 */

let useMock = !isIntuitionApiConfigured;

export function setIntuitionMockMode(enabled: boolean): void {
  useMock = enabled;
}

export async function getClaimsForProfile(
  address: string,
): Promise<TrustbookIntuitionSignal[]> {
  if (useMock) {
    return getMockIntuitionSignals().filter(
      (s) => s.authorAddress === address,
    );
  }
  // TODO: GET claims where subject = trustbook:author:{address}
  return [];
}

export async function getClaimsForCommunity(
  communityId: string,
): Promise<TrustbookIntuitionSignal[]> {
  if (useMock) {
    return getMockIntuitionSignals().filter(
      (s) => s.communityId === communityId,
    );
  }
  // TODO: GET claims where subject = trustbook:community:{communityId}
  return [];
}

export async function getClaimsForPost(
  postId: string,
): Promise<TrustbookIntuitionSignal[]> {
  if (useMock) {
    return getMockIntuitionSignals().filter((s) => s.postId === postId);
  }
  // TODO: GET claims where subject = trustbook:post:{postId}
  return [];
}

export function getIntuitionSignalsForRanking(
  postId: string,
  authorAddress: string,
  communityId: string,
): TrustbookIntuitionSignal[] {
  if (!useMock && !isIntuitionApiConfigured) return [];

  const signals = getMockIntuitionSignals();
  return signals.filter(
    (s) =>
      s.postId === postId ||
      s.authorAddress === authorAddress ||
      s.communityId === communityId,
  );
}

export function computeIntuitionScore(
  signals: TrustbookIntuitionSignal[],
): number {
  if (signals.length === 0) return 0;
  const sum = signals.reduce((acc, s) => acc + s.weight, 0);
  return Math.min(sum, 10);
}

export async function createRecommendationClaim(
  input: CreateRecommendationClaimInput,
): Promise<IntuitionClaim | null> {
  if (useMock) {
    return {
      id: `mock-reco-${input.postId}`,
      subject: `trustbook:post:${input.postId}`,
      predicate: "recommends",
      object: input.title,
      creatorAddress: input.creatorAddress,
      source: "intuition-mock",
      createdAt: new Date().toISOString(),
    };
  }
  // TODO: create atom/triple via Intuition SDK — no private keys in frontend
  void input;
  return null;
}

export async function createTrustbookPostClaim(
  input: CreateTrustbookPostClaimInput,
): Promise<IntuitionClaim | null> {
  if (useMock) {
    return {
      id: `mock-post-${input.postId}`,
      subject: `trustbook:post:${input.postId}`,
      predicate: "publishedIn",
      object: input.communityId,
      creatorAddress: input.creatorAddress,
      source: "intuition-mock",
      createdAt: new Date().toISOString(),
    };
  }
  // TODO: publish Trustbook post claim to Intuition graph
  void input;
  return null;
}
