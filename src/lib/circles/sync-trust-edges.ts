// src/lib/circles/sync-trust-edges.ts

import type { TrustEdge } from "@/lib/types";
import { fetchTrustRelations } from "./public-api";

export async function syncTrustEdgesForViewer(
  viewerAddress: string,
): Promise<{ edges: TrustEdge[]; viewerTrusts: string[] }> {
  const relations = await fetchTrustRelations(viewerAddress);
  const viewerTrusts = relations
    .filter((r) => r.direction === "outgoing")
    .map((r) => r.address);

  const edges: TrustEdge[] = relations
    .filter((r) => r.direction === "outgoing")
    .map((r) => ({ from: viewerAddress, to: r.address }));

  return { edges, viewerTrusts };
}
