// src/lib/circles/links.ts

export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://trustbook.vercel.app";
}

export function makeFeedPostLink(postId: string, baseUrl?: string): string {
  const url = new URL("/feed", baseUrl ?? getAppOrigin());
  url.searchParams.set("postId", postId);
  return url.toString();
}

export function makeFeedCommunityLink(
  communityId: string,
  baseUrl?: string,
): string {
  const url = new URL("/feed", baseUrl ?? getAppOrigin());
  url.searchParams.set("communityId", communityId);
  return url.toString();
}

export function makeProfileLink(address: string, baseUrl?: string): string {
  return new URL(
    `/profile/${encodeURIComponent(address)}`,
    baseUrl ?? getAppOrigin(),
  ).toString();
}
