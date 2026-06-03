// src/lib/trust/trust-paths.ts

import type { TrustEdge } from "@/lib/types";

/**
 * Demo-level trust path explanation; real transitive transfer routing
 * must use Circles routing/indexer logic.
 */

export type TrustPath = {
  kind: "direct" | "mutual" | "transitive" | "none";
  addresses: string[];
  label: string;
};

function buildAdjacency(edges: TrustEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const { from, to } of edges) {
    const list = adj.get(from) ?? [];
    list.push(to);
    adj.set(from, list);
  }
  return adj;
}

function bfsPath(
  adj: Map<string, string[]>,
  start: string,
  goal: string,
  maxHops: number,
): string[] | null {
  if (start === goal) return [start];

  const queue: { node: string; path: string[] }[] = [{ node: start, path: [start] }];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (path.length > maxHops + 1) continue;

    const neighbors = adj.get(node) ?? [];
    for (const next of neighbors) {
      if (visited.has(next)) continue;
      const nextPath = [...path, next];
      if (next === goal) return nextPath;
      visited.add(next);
      queue.push({ node: next, path: nextPath });
    }
  }

  return null;
}

export function findTrustPath(
  viewerAddress: string,
  targetAddress: string,
  edges: TrustEdge[],
  resolveName: (address: string) => string,
): TrustPath {
  if (viewerAddress === targetAddress) {
    return { kind: "direct", addresses: [viewerAddress], label: "You" };
  }

  const viewerTrustsTarget = edges.some(
    (e) => e.from === viewerAddress && e.to === targetAddress,
  );
  const targetTrustsViewer = edges.some(
    (e) => e.from === targetAddress && e.to === viewerAddress,
  );

  if (viewerTrustsTarget && targetTrustsViewer) {
    return {
      kind: "mutual",
      addresses: [viewerAddress, targetAddress],
      label: "Mutual trust",
    };
  }

  if (viewerTrustsTarget) {
    return {
      kind: "direct",
      addresses: [viewerAddress, targetAddress],
      label: "Direct trust",
    };
  }

  const adj = buildAdjacency(edges);
  const path = bfsPath(adj, viewerAddress, targetAddress, 3);

  if (path && path.length > 1) {
    const names = path.map(resolveName);
    const via =
      names.length === 2
        ? names[1]
        : names.slice(1, -1).join(" → ") + " → " + names[names.length - 1];
    return {
      kind: "transitive",
      addresses: path,
      label: `Connected through ${via}`,
    };
  }

  return {
    kind: "none",
    addresses: [],
    label: "No known trust path",
  };
}
