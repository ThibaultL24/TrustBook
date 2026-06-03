// src/lib/circles/share.ts

import { getCirclesAdapter } from "./adapter";
import type { SharePostInput } from "./adapter-types";
import type { CirclesActionResult } from "./adapter-types";

export async function shareTrustbookLink(
  input: SharePostInput,
): Promise<CirclesActionResult> {
  return getCirclesAdapter().sharePost(input);
}
