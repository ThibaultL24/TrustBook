// src/lib/intuition/references.ts

/** Provisional claim subject prefixes for Trustbook ↔ Intuition correlation. */
export function makePostClaimSubject(postId: string): string {
  return `trustbook:post:${postId}`;
}

export function makeAuthorClaimSubject(address: string): string {
  return `trustbook:author:${address}`;
}

export function makeCommunityClaimSubject(communityId: string): string {
  return `trustbook:community:${communityId}`;
}
