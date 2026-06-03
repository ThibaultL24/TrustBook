// src/lib/types/index.ts

export type PostType = "recommendation" | "offer" | "need" | "event";

export type CommunityCategory =
  | "local"
  | "dev"
  | "mutual-aid"
  | "art"
  | "education"
  | "event"
  | "other";

export interface UserProfile {
  address: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  trustScore?: number;
  trustLevel?: string;
  trustedByViewer: boolean;
  trustsViewer: boolean;
  mutualTrustCount: number;
  groups: string[];
  crcBalance?: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  memberCount: number;
  category: CommunityCategory;
}

export interface Post {
  id: string;
  authorAddress: string;
  communityId: string;
  type: PostType;
  title: string;
  body: string;
  createdAt: string;
  amountRequested?: number;
  amountBoosted: number;
  tipCount: number;
  tags: string[];
  targetUrl?: string;
}

export interface FeedExplanation {
  reasonLabel: string;
  reasonDetails: string;
}

export interface FeedScoreBreakdown {
  directTrust: number;
  mutualTrust: number;
  sharedCommunity: number;
  commonTrust: number;
  crcBoost: number;
  recency: number;
  postType: number;
  intuitionSignal?: number;
  total: number;
}

export interface RankedPost {
  post: Post;
  score: number;
  explanation: FeedExplanation;
  scoreBreakdown: FeedScoreBreakdown;
}

export type FeedTab = "for-you" | "needs" | "offers" | "recos" | "events";

export interface TrustEdge {
  from: string;
  to: string;
}

export interface DeepLinkData {
  postId?: string;
  communityId?: string;
  action?: string;
}
