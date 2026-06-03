// src/lib/circles/adapter-types.ts

import type { TrustbookMode } from "@/lib/config/runtime";
import type { MiniAppUser } from "./host";

export type CirclesActionFailureReason =
  | "readonly"
  | "host_unavailable"
  | "user_rejected"
  | "network_error"
  | "not_registered"
  | "invalid_recipient"
  | "unknown";

export type CirclesActionResult =
  | {
      ok: true;
      mode: TrustbookMode;
      txHash?: string;
      reference?: string;
      message: string;
    }
  | {
      ok: false;
      mode: TrustbookMode;
      reason: CirclesActionFailureReason;
      message: string;
    };

export interface TrustbookProfile {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  crcBalance?: number;
}

export interface TrustRelation {
  address: string;
  direction: "outgoing" | "incoming";
}

export interface CommonTrustResult {
  count: number;
}

export interface TipPostInput {
  from: string;
  to: string;
  amount: number;
  postId: string;
}

export interface BoostPostInput {
  from: string;
  postId: string;
  amount: number;
  authorAddress: string;
}

export interface TrustUserInput {
  from: string;
  target: string;
}

export interface SharePostInput {
  postId?: string;
  communityId?: string;
  profileAddress?: string;
  title?: string;
  text?: string;
}

export type CirclesAdapter = {
  mode: TrustbookMode;
  getCurrentUser(): Promise<MiniAppUser | null>;
  getProfile(address: string): Promise<TrustbookProfile | null>;
  getTrustRelations(address: string): Promise<TrustRelation[]>;
  getCommonTrust(
    viewerAddress: string,
    targetAddress: string,
  ): Promise<CommonTrustResult>;
  tipPost(input: TipPostInput): Promise<CirclesActionResult>;
  boostPost(input: BoostPostInput): Promise<CirclesActionResult>;
  trustUser(input: TrustUserInput): Promise<CirclesActionResult>;
  sharePost(input: SharePostInput): Promise<CirclesActionResult>;
};
