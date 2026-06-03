// src/lib/utils/deep-link.ts

import type { DeepLinkData } from "@/lib/types";

export type DeepLinkParseResult =
  | { ok: true; data: DeepLinkData }
  | { ok: false; error: string };

export function parseDeepLinkData(raw: string | null): DeepLinkData | null {
  const result = parseDeepLinkDataSafe(raw);
  return result.ok ? result.data : null;
}

export function parseDeepLinkDataSafe(raw: string | null): DeepLinkParseResult {
  if (!raw) return { ok: false, error: "No deep link data provided" };

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Deep link data must be a JSON object" };
    }

    const data = parsed as Record<string, unknown>;
    const result: DeepLinkData = {};

    if (data.postId !== undefined && typeof data.postId !== "string") {
      return { ok: false, error: "postId must be a string" };
    }
    if (data.communityId !== undefined && typeof data.communityId !== "string") {
      return { ok: false, error: "communityId must be a string" };
    }
    if (data.action !== undefined && typeof data.action !== "string") {
      return { ok: false, error: "action must be a string" };
    }

    if (typeof data.postId === "string") result.postId = data.postId;
    if (typeof data.communityId === "string")
      result.communityId = data.communityId;
    if (typeof data.action === "string") result.action = data.action;

    if (Object.keys(result).length === 0) {
      return { ok: false, error: "Deep link object has no recognized fields" };
    }

    return { ok: true, data: result };
  } catch {
    return { ok: false, error: "Malformed deep link JSON" };
  }
}
