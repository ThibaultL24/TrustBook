// src/lib/utils/deep-link.test.ts

import { describe, expect, it } from "vitest";
import { parseDeepLinkDataSafe } from "./deep-link";

describe("parseDeepLinkDataSafe", () => {
  it("parses valid JSON", () => {
    const raw = encodeURIComponent(JSON.stringify({ postId: "post-1" }));
    const result = parseDeepLinkDataSafe(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.postId).toBe("post-1");
  });

  it("rejects malformed JSON", () => {
    const result = parseDeepLinkDataSafe("{not-json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Malformed");
  });

  it("rejects empty object", () => {
    const raw = encodeURIComponent("{}");
    const result = parseDeepLinkDataSafe(raw);
    expect(result.ok).toBe(false);
  });

  it("rejects wrong types", () => {
    const raw = encodeURIComponent(JSON.stringify({ postId: 123 }));
    const result = parseDeepLinkDataSafe(raw);
    expect(result.ok).toBe(false);
  });
});
