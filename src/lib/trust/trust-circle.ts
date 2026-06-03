// src/lib/trust/trust-circle.ts

import type { TrustEdge } from "@/lib/types";
import {
  authorTrustsViewer,
  getCommonTrustCount,
  viewerTrustsAuthor,
} from "@/lib/mock/trust-edges";

export type TrustCircleLevel = "mutual" | "trusted" | "trusts-you" | "connected" | "none";

export function getTrustCircleLevel(
  viewerAddress: string,
  targetAddress: string,
  edges: TrustEdge[],
): TrustCircleLevel {
  if (viewerAddress === targetAddress) return "mutual";

  const outgoing = viewerTrustsAuthor(viewerAddress, targetAddress, edges);
  const incoming = authorTrustsViewer(viewerAddress, targetAddress, edges);

  if (outgoing && incoming) return "mutual";
  if (outgoing) return "trusted";
  if (incoming) return "trusts-you";

  const common = getCommonTrustCount(viewerAddress, targetAddress, edges);
  if (common >= 2) return "connected";

  return "none";
}

export function isInTrustCircle(
  viewerAddress: string,
  targetAddress: string,
  edges: TrustEdge[],
): boolean {
  return getTrustCircleLevel(viewerAddress, targetAddress, edges) !== "none";
}

/** Higher = closer in the trust graph — used for feed & story ordering. */
export function getTrustCirclePriority(
  viewerAddress: string,
  targetAddress: string,
  edges: TrustEdge[],
): number {
  switch (getTrustCircleLevel(viewerAddress, targetAddress, edges)) {
    case "mutual":
      return 400;
    case "trusted":
      return 300;
    case "trusts-you":
      return 200;
    case "connected":
      return 100;
    default:
      return 0;
  }
}

export function getTrustCircleAddresses(
  viewerAddress: string,
  edges: TrustEdge[],
): string[] {
  const addresses = new Set<string>();

  for (const edge of edges) {
    if (edge.from === viewerAddress) addresses.add(edge.to);
    if (edge.to === viewerAddress) addresses.add(edge.from);
  }

  for (const edge of edges) {
    if (!addresses.has(edge.from) && addresses.has(edge.to)) {
      const common = getCommonTrustCount(viewerAddress, edge.from, edges);
      if (common >= 2) addresses.add(edge.from);
    }
  }

  addresses.delete(viewerAddress);
  return [...addresses];
}

export function trustCircleLabel(level: TrustCircleLevel): string {
  switch (level) {
    case "mutual":
      return "Mutual trust";
    case "trusted":
      return "In your trust circle";
    case "trusts-you":
      return "Trusts you";
    case "connected":
      return "Connected via trust paths";
    default:
      return "";
  }
}
