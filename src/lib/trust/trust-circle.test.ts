// src/lib/trust/trust-circle.test.ts

import { describe, expect, it } from "vitest";
import { MOCK_TRUST_EDGES, VIEWER_TRUSTS } from "@/lib/mock/trust-edges";
import { VIEWER_ADDRESS, MOCK_ADDRESSES } from "@/lib/mock/addresses";
import {
  getTrustCircleLevel,
  getTrustCirclePriority,
  isInTrustCircle,
} from "./trust-circle";

describe("trust circle", () => {
  it("marks direct trusted authors as in circle", () => {
    expect(isInTrustCircle(VIEWER_ADDRESS, MOCK_ADDRESSES.bob, MOCK_TRUST_EDGES)).toBe(
      true,
    );
    expect(getTrustCircleLevel(VIEWER_ADDRESS, MOCK_ADDRESSES.bob, MOCK_TRUST_EDGES)).toBe(
      "mutual",
    );
  });

  it("prioritizes mutual trust over unknown authors", () => {
    const mutual = getTrustCirclePriority(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.bob,
      MOCK_TRUST_EDGES,
    );
    const unknown = getTrustCirclePriority(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.hans,
      MOCK_TRUST_EDGES,
    );
    expect(mutual).toBeGreaterThan(unknown);
  });

  it("includes all viewer trusts in circle addresses", () => {
    for (const addr of VIEWER_TRUSTS) {
      expect(isInTrustCircle(VIEWER_ADDRESS, addr, MOCK_TRUST_EDGES)).toBe(true);
    }
  });
});
