// src/lib/circles/live-authors.ts
// Registered Circles avatars on Gnosis — tips/boosts work on-chain.

/** Gnosis Group — trust anchor used across Circles ecosystem docs. */
export const GNOSIS_GROUP_ADDRESS =
  "0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c" as const;

/** Well-known human avatar (Circles SDK smoke tests). */
export const SAMPLE_HUMAN_ADDRESS =
  "0xde374ece6fa50e781e81aac78e811b33d16912c7" as const;

export const LIVE_CIRCLES_AUTHORS = {
  gnosisGroup: GNOSIS_GROUP_ADDRESS,
  sampleHuman: SAMPLE_HUMAN_ADDRESS,
} as const;

const LIVE_SET = new Set(
  Object.values(LIVE_CIRCLES_AUTHORS).map((a) => a.toLowerCase()),
);

/** Pitch / judging deep link — first post judges should tip. */
export const DEMO_LIVE_TIP_POST_ID = "post-live-circles-help";

export function isLiveCirclesAuthor(address: string): boolean {
  return LIVE_SET.has(address.trim().toLowerCase());
}

export function getLiveAuthorAddresses(): string[] {
  return [...LIVE_SET];
}
