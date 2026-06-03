// src/lib/mock/trust-edges.ts

import type { TrustEdge } from "@/lib/types";
import { MOCK_ADDRESSES, VIEWER_ADDRESS } from "./addresses";

/** Viewer → author trust (viewer accepts author's CRC) */
export const VIEWER_TRUSTS: string[] = [
  MOCK_ADDRESSES.bob,
  MOCK_ADDRESSES.carla,
  MOCK_ADDRESSES.elena,
  MOCK_ADDRESSES.gina,
];

/** Author → viewer trust */
export const TRUSTS_VIEWER: string[] = [
  MOCK_ADDRESSES.bob,
  MOCK_ADDRESSES.diego,
  MOCK_ADDRESSES.fern,
  MOCK_ADDRESSES.iris,
];

/** All trust edges in the mock graph */
export const MOCK_TRUST_EDGES: TrustEdge[] = [
  { from: VIEWER_ADDRESS, to: MOCK_ADDRESSES.bob },
  { from: MOCK_ADDRESSES.bob, to: VIEWER_ADDRESS },
  { from: VIEWER_ADDRESS, to: MOCK_ADDRESSES.carla },
  { from: VIEWER_ADDRESS, to: MOCK_ADDRESSES.elena },
  { from: VIEWER_ADDRESS, to: MOCK_ADDRESSES.gina },
  { from: MOCK_ADDRESSES.diego, to: VIEWER_ADDRESS },
  { from: MOCK_ADDRESSES.fern, to: VIEWER_ADDRESS },
  { from: MOCK_ADDRESSES.iris, to: VIEWER_ADDRESS },
  { from: MOCK_ADDRESSES.bob, to: MOCK_ADDRESSES.carla },
  { from: MOCK_ADDRESSES.bob, to: MOCK_ADDRESSES.hans },
  { from: MOCK_ADDRESSES.carla, to: MOCK_ADDRESSES.elena },
  { from: MOCK_ADDRESSES.carla, to: MOCK_ADDRESSES.hans },
  { from: MOCK_ADDRESSES.elena, to: MOCK_ADDRESSES.gina },
  { from: MOCK_ADDRESSES.hans, to: MOCK_ADDRESSES.gina },
  { from: MOCK_ADDRESSES.hans, to: MOCK_ADDRESSES.iris },
  { from: MOCK_ADDRESSES.diego, to: MOCK_ADDRESSES.fern },
  { from: MOCK_ADDRESSES.fern, to: MOCK_ADDRESSES.gina },
];

export function getCommonTrustCount(
  viewerAddress: string,
  targetAddress: string,
  edges: TrustEdge[] = MOCK_TRUST_EDGES,
): number {
  const viewerTrusts = new Set(
    edges.filter((e) => e.from === viewerAddress).map((e) => e.to),
  );
  const targetTrusts = new Set(
    edges.filter((e) => e.from === targetAddress).map((e) => e.to),
  );

  let count = 0;
  for (const addr of viewerTrusts) {
    if (targetTrusts.has(addr) && addr !== viewerAddress && addr !== targetAddress) {
      count++;
    }
  }
  return count;
}

export function viewerTrustsAuthor(
  viewerAddress: string,
  authorAddress: string,
  edges: TrustEdge[] = MOCK_TRUST_EDGES,
): boolean {
  return edges.some(
    (e) => e.from === viewerAddress && e.to === authorAddress,
  );
}

export function authorTrustsViewer(
  viewerAddress: string,
  authorAddress: string,
  edges: TrustEdge[] = MOCK_TRUST_EDGES,
): boolean {
  return edges.some(
    (e) => e.from === authorAddress && e.to === viewerAddress,
  );
}
