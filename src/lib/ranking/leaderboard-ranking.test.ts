// src/lib/ranking/leaderboard-ranking.test.ts

import { describe, expect, it } from "vitest";
import { rankAuthors, rankImpactPosts } from "./leaderboard-ranking";
import { SEED_POSTS } from "@/lib/mock/posts";
import { getMockUsers } from "@/lib/mock/users";
import { MOCK_TRUST_EDGES } from "@/lib/mock/trust-edges";
import { VIEWER_ADDRESS } from "@/lib/mock/addresses";

describe("leaderboard ranking", () => {
  it("ranks authors by score descending", () => {
    const users = getMockUsers();
    const ranked = rankAuthors(SEED_POSTS, users, VIEWER_ADDRESS, MOCK_TRUST_EDGES);
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.score).toBeGreaterThanOrEqual(ranked[i]!.score);
    }
  });

  it("impact posts favor boosted needs", () => {
    const users = getMockUsers();
    const viewer = users.find((u) => u.address === VIEWER_ADDRESS)!;
    const impact = rankImpactPosts(
      SEED_POSTS,
      VIEWER_ADDRESS,
      viewer.groups,
      (addr) => users.find((u) => u.address === addr),
      (addr) => users.find((u) => u.address === addr)?.displayName ?? "?",
    );
    expect(impact[0]!.impactScore).toBeGreaterThan(0);
  });
});
