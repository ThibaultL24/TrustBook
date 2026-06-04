// src/lib/circles/live-authors.ts
// Registered Circles avatars on Gnosis — tips/boosts work on-chain.

import {
  GNOSIS_GROUP_TRUST_ANCHOR,
  HIST_GROUP_ADDRESS,
  HIST_GUESSR_SAFE_ADDRESS,
} from "./history-guessr-addresses";

/** Well-known human avatar (Circles SDK smoke tests). */
export const SAMPLE_HUMAN_ADDRESS =
  "0xde374ece6fa50e781e81aac78e811b33d16912c7" as const;

export const GNOSIS_GROUP_ADDRESS = GNOSIS_GROUP_TRUST_ANCHOR;

/** Live authors from History Guessr + Circles ecosystem demos. */
export const LIVE_CIRCLES_AUTHORS = {
  /** Primary demo recipient — Lenormand Safe (CRC on Gnosis). */
  lenormandSafe: HIST_GUESSR_SAFE_ADDRESS,
  histGroup: HIST_GROUP_ADDRESS,
  gnosisGroup: GNOSIS_GROUP_ADDRESS,
  sampleHuman: SAMPLE_HUMAN_ADDRESS,
} as const;

const LIVE_SET = new Set(
  Object.values(LIVE_CIRCLES_AUTHORS).map((a) => a.toLowerCase()),
);

/** Pitch / judging — tip this post to test CRC on your History Guessr Safe. */
export const DEMO_LIVE_TIP_POST_ID = "post-live-circles-help";

/** Default profile URL for wallet demos (History Guessr operator). */
export const DEMO_CIRCLES_PROFILE_PATH = `/profile/${HIST_GUESSR_SAFE_ADDRESS}`;

export function isLiveCirclesAuthor(address: string): boolean {
  return LIVE_SET.has(address.trim().toLowerCase());
}

export function getLiveAuthorAddresses(): string[] {
  return [...LIVE_SET];
}
