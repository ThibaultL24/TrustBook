// src/lib/circles/types.ts

export interface CirclesSession {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  crcBalance?: number;
}

export interface AnnotatedTransfer {
  from: string;
  to: string;
  amount: number;
  reference: string;
  postId?: string;
}

export interface TrustRelations {
  trusts: string[];
  trustedBy: string[];
}

export interface TipPostParams {
  from: string;
  to: string;
  amount: number;
  postId: string;
}

export interface BoostPostParams {
  from: string;
  postId: string;
  amount: number;
  authorAddress: string;
}

export interface TrustUserParams {
  from: string;
  target: string;
}

export interface DeepLinkParams {
  postId?: string;
  communityId?: string;
  baseUrl?: string;
}
