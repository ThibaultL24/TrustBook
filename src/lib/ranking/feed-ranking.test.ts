// src/lib/ranking/feed-ranking.test.ts

import { describe, expect, it } from "vitest";
import { computeScoreBreakdown, rankPost } from "./feed-ranking";
import type { Post } from "@/lib/types";
import { VIEWER_ADDRESS, MOCK_ADDRESSES } from "@/lib/mock/addresses";
import { getMockUser } from "@/lib/mock/users";

const basePost: Post = {
  id: "test-post",
  authorAddress: MOCK_ADDRESSES.bob,
  communityId: "circles-builders",
  type: "need",
  title: "Test",
  body: "Body text for ranking test",
  createdAt: new Date().toISOString(),
  amountBoosted: 10,
  tipCount: 2,
  tags: [],
};

describe("rankPost", () => {
  it("returns explanation with label and details", () => {
    const author = getMockUser(MOCK_ADDRESSES.bob)!;
    const ranked = rankPost(
      basePost,
      VIEWER_ADDRESS,
      ["circles-builders", "mutual-aid"],
      author,
    );

    expect(ranked.explanation.reasonLabel.length).toBeGreaterThan(0);
    expect(ranked.explanation.reasonDetails.length).toBeGreaterThan(10);
    expect(ranked.score).toBeGreaterThan(0);
    expect(ranked.scoreBreakdown.total).toBe(ranked.score);
  });
});

describe("computeScoreBreakdown", () => {
  it("total equals sum of components", () => {
    const author = getMockUser(MOCK_ADDRESSES.bob)!;
    const breakdown = computeScoreBreakdown(
      basePost,
      VIEWER_ADDRESS,
      ["circles-builders", "mutual-aid"],
      author,
    );
    const sum =
      breakdown.directTrust +
      breakdown.mutualTrust +
      breakdown.sharedCommunity +
      breakdown.commonTrust +
      breakdown.crcBoost +
      breakdown.recency +
      breakdown.postType +
      (breakdown.intuitionSignal ?? 0);
    expect(breakdown.total).toBeCloseTo(sum, 5);
  });
});
