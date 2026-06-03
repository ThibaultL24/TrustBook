// src/lib/intuition/types.ts

/**
 * Optional Intuition claims layer — complements Circles trust, does not replace it.
 * TODO: map to Intuition atoms/triples when official read/write API is confirmed.
 */

export type IntuitionClaim = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence?: number;
  source?: string;
  creatorAddress?: string;
  createdAt?: string;
};

export type TrustbookIntuitionSignal = {
  postId?: string;
  authorAddress?: string;
  communityId?: string;
  claim: IntuitionClaim;
  weight: number;
  explanation: string;
};

export interface CreateRecommendationClaimInput {
  postId: string;
  authorAddress: string;
  title: string;
  creatorAddress: string;
}

export interface CreateTrustbookPostClaimInput {
  postId: string;
  communityId: string;
  postType: string;
  creatorAddress: string;
}
