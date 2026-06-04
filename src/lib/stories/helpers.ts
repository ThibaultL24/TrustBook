// src/lib/stories/helpers.ts

import type { Post, Story, UserProfile, TrustEdge } from "@/lib/types";
import { canViewerSeePost } from "@/lib/posts/visibility";
import {
  getTrustCirclePriority,
  isInTrustCircle,
} from "@/lib/trust/trust-circle";

export interface StoryGroup {
  authorAddress: string;
  displayName: string;
  avatarUrl: string;
  isOwn: boolean;
  hasNew: boolean;
  storyIds: string[];
  previewImageUrl?: string;
  trustPriority: number;
}

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export function storyExpiresAt(fromIso = new Date().toISOString()): string {
  return new Date(new Date(fromIso).getTime() + STORY_TTL_MS).toISOString();
}

export function isStoryActive(story: Story, nowMs = Date.now()): boolean {
  return new Date(story.expiresAt).getTime() > nowMs;
}

export function getActiveStories(stories: Story[]): Story[] {
  return stories.filter((s) => isStoryActive(s));
}

export function buildSeedStories(
  posts: Post[],
  trustedAuthorAddresses: string[],
): Story[] {
  const now = new Date().toISOString();
  return posts
    .filter((p) => trustedAuthorAddresses.includes(p.authorAddress))
    .slice(0, 5)
    .map((post) => ({
      id: `story-seed-${post.id}`,
      postId: post.id,
      authorAddress: post.authorAddress,
      createdAt: now,
      expiresAt: storyExpiresAt(now),
    }));
}

export function buildStoryGroups(
  stories: Story[],
  viewerAddress: string,
  edges: TrustEdge[],
  getUser: (address: string) => UserProfile | undefined,
  getPost: (postId: string) => Post | undefined,
  viewedStoryIds: Set<string>,
  viewerGroups: string[] = [],
): StoryGroup[] {
  const active = getActiveStories(stories).filter((story) => {
    if (story.authorAddress === viewerAddress) return true;
    if (!isInTrustCircle(viewerAddress, story.authorAddress, edges)) {
      return false;
    }
    const post = getPost(story.postId);
    if (!post) return true;
    return canViewerSeePost(viewerAddress, post, viewerGroups, edges);
  });
  const byAuthor = new Map<string, Story[]>();

  for (const story of active) {
    const list = byAuthor.get(story.authorAddress) ?? [];
    list.push(story);
    byAuthor.set(story.authorAddress, list);
  }

  const groups: StoryGroup[] = [];

  for (const [authorAddress, authorStories] of byAuthor) {
    const user = getUser(authorAddress);
    if (!user) continue;

    const sortedStories = [...authorStories].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const latestPost = getPost(sortedStories[sortedStories.length - 1]!.postId);
    const previewImageUrl =
      latestPost?.imageUrl ?? user.avatarUrl;

    groups.push({
      authorAddress,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOwn: authorAddress === viewerAddress,
      hasNew: sortedStories.some((s) => !viewedStoryIds.has(s.id)),
      storyIds: sortedStories.map((s) => s.id),
      previewImageUrl,
      trustPriority: getTrustCirclePriority(viewerAddress, authorAddress, edges),
    });
  }

  return groups.sort((a, b) => {
    if (a.isOwn && !b.isOwn) return -1;
    if (!a.isOwn && b.isOwn) return 1;
    if (a.hasNew !== b.hasNew) return a.hasNew ? -1 : 1;
    return b.trustPriority - a.trustPriority;
  });
}

export function filterPostsForTrustCircle(
  posts: Post[],
  viewerAddress: string,
  edges: TrustEdge[],
): Post[] {
  return posts.filter((p) =>
    isInTrustCircle(viewerAddress, p.authorAddress, edges),
  );
}
