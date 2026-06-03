// src/lib/circles/references.test.ts

import { describe, expect, it } from "vitest";
import {
  makeBoostReference,
  makeTipReference,
  parseTrustbookReference,
} from "./references";

describe("references", () => {
  it("makeTipReference", () => {
    expect(makeTipReference("post-1")).toBe("trustbook:tip:post-1");
  });

  it("makeBoostReference", () => {
    expect(makeBoostReference("abc")).toBe("trustbook:boost:abc");
  });

  it("parseTrustbookReference tip", () => {
    expect(parseTrustbookReference("trustbook:tip:post-2")).toEqual({
      kind: "tip",
      postId: "post-2",
    });
  });

  it("parseTrustbookReference boost", () => {
    expect(parseTrustbookReference("trustbook:boost:x")).toEqual({
      kind: "boost",
      postId: "x",
    });
  });

  it("parseTrustbookReference rejects malformed", () => {
    expect(parseTrustbookReference("")).toBeNull();
    expect(parseTrustbookReference("trustbook:tip:")).toBeNull();
    expect(parseTrustbookReference("other:data")).toBeNull();
    expect(parseTrustbookReference("trustbook:unknown:1")).toBeNull();
  });
});
