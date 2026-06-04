// src/lib/posts/visibility.test.ts

import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/types";
import { VIEWER_ADDRESS, MOCK_ADDRESSES } from "@/lib/mock/addresses";
import { MOCK_TRUST_EDGES } from "@/lib/mock/trust-edges";
import {
  canViewerSeePost,
  audienceAllowsStoryShare,
  OPEN_FEED_COMMUNITY_ID,
} from "./visibility";

const basePost: Post = {
  id: "vis-test",
  authorAddress: MOCK_ADDRESSES.hans,
  communityId: "local-makers",
  audience: "circle",
  type: "thought",
  title: "",
  body: "Circle-only thought for visibility tests",
  createdAt: new Date().toISOString(),
  amountBoosted: 0,
  tipCount: 0,
  tags: [],
};

describe("canViewerSeePost", () => {
  it("always shows author their own post", () => {
    const own: Post = { ...basePost, authorAddress: VIEWER_ADDRESS };
    expect(
      canViewerSeePost(VIEWER_ADDRESS, own, ["circles-builders"], MOCK_TRUST_EDGES),
    ).toBe(true);
  });

  it("circle audience requires trust circle", () => {
    expect(
      canViewerSeePost(
        VIEWER_ADDRESS,
        basePost,
        ["circles-builders"],
        MOCK_TRUST_EDGES,
      ),
    ).toBe(false);
  });

  it("communities audience allows shared community members", () => {
    const post: Post = {
      ...basePost,
      audience: "communities",
      communityId: "history-culture",
    };
    expect(
      canViewerSeePost(
        VIEWER_ADDRESS,
        post,
        ["circles-builders", "history-culture"],
        MOCK_TRUST_EDGES,
      ),
    ).toBe(true);
  });

  it("discovery audience is visible to everyone", () => {
    const post: Post = { ...basePost, audience: "discovery" };
    expect(
      canViewerSeePost(VIEWER_ADDRESS, post, [], []),
    ).toBe(true);
  });
});

describe("audienceAllowsStoryShare", () => {
  it("allows circle and communities only", () => {
    expect(audienceAllowsStoryShare("circle")).toBe(true);
    expect(audienceAllowsStoryShare("communities")).toBe(true);
    expect(audienceAllowsStoryShare("discovery")).toBe(false);
  });
});

describe("OPEN_FEED_COMMUNITY_ID", () => {
  it("is stable", () => {
    expect(OPEN_FEED_COMMUNITY_ID).toBe("open-feed");
  });
});
