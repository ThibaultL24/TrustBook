// src/lib/feed/feed-stats.ts

import type { RankedPost, TrustEdge } from "@/lib/types";
import { viewerTrustsAuthor } from "@/lib/mock/trust-edges";

export interface FeedImpactStats {
  totalBoosted: number;
  totalTips: number;
  trustedAuthorsVisible: number;
  activeCommunitiesVisible: number;
}

export function computeFeedImpactStats(
  ranked: RankedPost[],
  viewerAddress: string,
  edges?: TrustEdge[],
): FeedImpactStats {
  const posts = ranked.map((r) => r.post);
  const authorAddresses = new Set(posts.map((p) => p.authorAddress));
  const communityIds = new Set(posts.map((p) => p.communityId));

  let trustedAuthorsVisible = 0;
  for (const addr of authorAddresses) {
    if (viewerTrustsAuthor(viewerAddress, addr, edges)) trustedAuthorsVisible++;
  }

  return {
    totalBoosted: posts.reduce((s, p) => s + p.amountBoosted, 0),
    totalTips: posts.reduce((s, p) => s + p.tipCount, 0),
    trustedAuthorsVisible,
    activeCommunitiesVisible: communityIds.size,
  };
}
