// src/lib/types/index.ts

export type PostType = "recommendation" | "offer" | "need" | "event";

export type PostFormat = "standard" | "live" | "photo" | "mood";

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
  coverUrl?: string;
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
  format?: PostFormat;
  imageUrl?: string;
  mood?: string;
  isLive?: boolean;
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

export type FeedTab = "for-you" | "circle" | "needs" | "offers" | "recos" | "events";

export interface TrustEdge {
  from: string;
  to: string;
}

export interface DeepLinkData {
  postId?: string;
  communityId?: string;
  action?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorAddress: string;
  body: string;
  createdAt: string;
}

export interface Story {
  id: string;
  postId: string;
  authorAddress: string;
  createdAt: string;
  expiresAt: string;
}
