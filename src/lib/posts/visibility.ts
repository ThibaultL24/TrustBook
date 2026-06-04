// src/lib/posts/visibility.ts

import type { Post, PostAudience, TrustEdge } from "@/lib/types";
import { OPEN_FEED_COMMUNITY_ID } from "@/lib/mock/communities";
import { isInTrustCircle } from "@/lib/trust/trust-circle";

export { OPEN_FEED_COMMUNITY_ID };

export function canViewerSeePost(
  viewerAddress: string,
  post: Post,
  viewerGroups: string[],
  edges: TrustEdge[] = [],
): boolean {
  if (post.authorAddress === viewerAddress) return true;

  switch (post.audience) {
    case "circle":
      return isInTrustCircle(viewerAddress, post.authorAddress, edges);
    case "communities":
      return (
        isInTrustCircle(viewerAddress, post.authorAddress, edges) ||
        viewerGroups.includes(post.communityId)
      );
    case "discovery":
      return true;
    default:
      return false;
  }
}

export function audienceAllowsStoryShare(audience: PostAudience): boolean {
  return audience === "circle" || audience === "communities";
}

export function defaultAudienceForType(type: Post["type"]): PostAudience {
  return type === "thought" ? "circle" : "discovery";
}

export function resolveCommunityId(
  audience: PostAudience,
  communityId: string | undefined,
  viewerGroups: string[],
): string {
  if (audience === "communities") {
    return communityId ?? viewerGroups[0] ?? OPEN_FEED_COMMUNITY_ID;
  }
  return communityId ?? OPEN_FEED_COMMUNITY_ID;
}
