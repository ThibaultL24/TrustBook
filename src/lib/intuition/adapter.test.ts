// src/lib/intuition/adapter.test.ts

import { describe, expect, it } from "vitest";
import {
  computeIntuitionScore,
  getClaimsForPost,
  getIntuitionSignalsForRanking,
  setIntuitionMockMode,
} from "./adapter";

describe("Intuition adapter", () => {
  it("returns mock claims for known post", async () => {
    const claims = await getClaimsForPost("post-reco-trustbook");
    expect(claims.length).toBeGreaterThan(0);
  });

  it("computeIntuitionScore caps at 10", () => {
    const signals = getIntuitionSignalsForRanking(
      "post-reco-trustbook",
      "0xBob2222222222222222222222222222222222",
      "circles-builders",
    );
    const score = computeIntuitionScore(signals);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("returns empty when mock disabled and no API", async () => {
    setIntuitionMockMode(false);
    const signals = getIntuitionSignalsForRanking("unknown", "0x0", "x");
    expect(signals).toEqual([]);
    setIntuitionMockMode(true);
  });
});
