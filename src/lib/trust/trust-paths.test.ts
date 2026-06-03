// src/lib/trust/trust-paths.test.ts

import { describe, expect, it } from "vitest";
import { findTrustPath } from "./trust-paths";
import { MOCK_TRUST_EDGES } from "@/lib/mock/trust-edges";
import { MOCK_ADDRESSES, VIEWER_ADDRESS } from "@/lib/mock/addresses";

const name = (addr: string) => addr;

describe("findTrustPath", () => {
  it("returns mutual trust for bob", () => {
    const path = findTrustPath(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.bob,
      MOCK_TRUST_EDGES,
      name,
    );
    expect(path.kind).toBe("mutual");
  });

  it("returns direct trust when one-way only", () => {
    const path = findTrustPath(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.carla,
      MOCK_TRUST_EDGES,
      name,
    );
    expect(path.kind).toBe("direct");
  });

  it("returns mutual trust", () => {
    const path = findTrustPath(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.bob,
      [
        ...MOCK_TRUST_EDGES,
        { from: VIEWER_ADDRESS, to: MOCK_ADDRESSES.bob },
        { from: MOCK_ADDRESSES.bob, to: VIEWER_ADDRESS },
      ],
      name,
    );
    expect(path.kind).toBe("mutual");
  });

  it("returns transitive path via bob to hans", () => {
    const path = findTrustPath(
      VIEWER_ADDRESS,
      MOCK_ADDRESSES.hans,
      MOCK_TRUST_EDGES,
      name,
    );
    expect(path.kind).toBe("transitive");
    expect(path.addresses.length).toBeGreaterThan(2);
  });

  it("returns none for disconnected address", () => {
    const path = findTrustPath(
      VIEWER_ADDRESS,
      "0xUnknown000000000000000000000000000000",
      MOCK_TRUST_EDGES,
      name,
    );
    expect(path.kind).toBe("none");
  });
});
