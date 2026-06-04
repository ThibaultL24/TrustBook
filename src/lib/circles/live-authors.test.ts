// src/lib/circles/live-authors.test.ts

import { describe, expect, it } from "vitest";
import {
  HIST_GUESSR_SAFE_ADDRESS,
  HIST_GROUP_ADDRESS,
} from "./history-guessr-addresses";
import {
  DEMO_LIVE_TIP_POST_ID,
  GNOSIS_GROUP_ADDRESS,
  isLiveCirclesAuthor,
  LIVE_CIRCLES_AUTHORS,
  SAMPLE_HUMAN_ADDRESS,
} from "./live-authors";

describe("live-authors", () => {
  it("recognizes registered Circles addresses", () => {
    expect(isLiveCirclesAuthor(GNOSIS_GROUP_ADDRESS)).toBe(true);
    expect(isLiveCirclesAuthor(SAMPLE_HUMAN_ADDRESS)).toBe(true);
    expect(isLiveCirclesAuthor(HIST_GUESSR_SAFE_ADDRESS)).toBe(true);
    expect(isLiveCirclesAuthor(HIST_GROUP_ADDRESS)).toBe(true);
    expect(isLiveCirclesAuthor(LIVE_CIRCLES_AUTHORS.lenormandSafe)).toBe(true);
    expect(isLiveCirclesAuthor(GNOSIS_GROUP_ADDRESS.toUpperCase())).toBe(true);
  });

  it("rejects mock demo addresses", () => {
    expect(isLiveCirclesAuthor("0xBob2222222222222222222222222222222222")).toBe(
      false,
    );
  });

  it("exposes demo post id for pitch deep link", () => {
    expect(DEMO_LIVE_TIP_POST_ID).toBe("post-live-circles-help");
  });
});
