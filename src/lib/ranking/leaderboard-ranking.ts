// src/lib/ranking/leaderboard-ranking.ts

import type { Community, Post, TrustEdge, UserProfile } from "@/lib/types";
import { rankPost } from "./feed-ranking";

export interface AuthorLeaderboardEntry {
  address: string;
  displayName: string;
  avatarUrl: string;
  totalTips: number;
  totalBoosted: number;
  postCount: number;
  trustConnections: number;
  score: number;
}

export interface CommunityLeaderboardEntry {
  communityId: string;
  name: string;
  postCount: number;
  totalBoosted: number;
  activeAuthors: number;
  needsOffersCount: number;
  score: number;
}

export interface PostLeaderboardEntry {
  post: Post;
  authorName: string;
  trustWeightedScore: number;
  impactScore: number;
}

export function rankAuthors(
  posts: Post[],
  users: UserProfile[],
  viewerAddress: string,
  edges: TrustEdge[],
): AuthorLeaderboardEntry[] {
  const byAuthor = new Map<
    string,
    { tips: number; boosted: number; count: number }
  >();

  for (const post of posts) {
    const cur = byAuthor.get(post.authorAddress) ?? {
      tips: 0,
      boosted: 0,
      count: 0,
    };
    cur.tips += post.tipCount;
    cur.boosted += post.amountBoosted;
    cur.count += 1;
    byAuthor.set(post.authorAddress, cur);
  }

  const entries: AuthorLeaderboardEntry[] = [];

  for (const [address, stats] of byAuthor) {
    const user = users.find((u) => u.address === address);
    if (!user) continue;

    const trustConnections =
      (edges.some((e) => e.from === viewerAddress && e.to === address) ? 1 : 0) +
      (edges.some((e) => e.from === address && e.to === viewerAddress) ? 1 : 0) +
      edges.filter((e) => e.from === address || e.to === address).length * 0.1;

    const score =
      stats.tips * 2 +
      stats.boosted * 0.5 +
      stats.count * 5 +
      trustConnections * 15;

    entries.push({
      address,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      totalTips: stats.tips,
      totalBoosted: stats.boosted,
      postCount: stats.count,
      trustConnections: Math.round(trustConnections),
      score,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
}

export function rankCommunities(
  posts: Post[],
  communities: Community[],
): CommunityLeaderboardEntry[] {
  return communities
    .map((community) => {
      const communityPosts = posts.filter(
        (p) => p.communityId === community.id,
      );
      const authors = new Set(communityPosts.map((p) => p.authorAddress));
      const totalBoosted = communityPosts.reduce(
        (s, p) => s + p.amountBoosted,
        0,
      );
      const needsOffersCount = communityPosts.filter(
        (p) => p.type === "need" || p.type === "offer",
      ).length;

      const score =
        communityPosts.length * 10 +
        totalBoosted * 0.4 +
        authors.size * 8 +
        needsOffersCount * 12;

      return {
        communityId: community.id,
        name: community.name,
        postCount: communityPosts.length,
        totalBoosted,
        activeAuthors: authors.size,
        needsOffersCount,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankImpactPosts(
  posts: Post[],
  viewerAddress: string,
  viewerGroups: string[],
  getAuthor: (address: string) => UserProfile | undefined,
  getAuthorName: (address: string) => string,
): PostLeaderboardEntry[] {
  return posts
    .map((post) => {
      const ranked = rankPost(
        post,
        viewerAddress,
        viewerGroups,
        getAuthor(post.authorAddress),
      );
      const typeBonus =
        post.type === "need" ? 20 : post.type === "offer" ? 15 : 0;
      const impactScore =
        post.amountBoosted * 0.6 +
        post.tipCount * 3 +
        typeBonus +
        ranked.score * 0.3;

      return {
        post,
        authorName: getAuthorName(post.authorAddress),
        trustWeightedScore: ranked.score,
        impactScore,
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);
}
