// src/lib/circles/actions.ts

import { getCirclesAdapter } from "./adapter";
import type {
  BoostPostInput,
  SharePostInput,
  TipPostInput,
  TrustUserInput,
} from "./adapter-types";
import { makeFeedCommunityLink, makeFeedPostLink } from "./links";

export {
  makeTipReference,
  makeBoostReference,
  parseTrustbookReference,
  buildTipReference,
  buildBoostReference,
} from "./references";

export { getCirclesAdapter, resetCirclesAdapter, setCirclesAdapter } from "./adapter";
export type { CirclesActionResult, CirclesAdapter } from "./adapter-types";

export async function tipPost(params: TipPostInput) {
  return getCirclesAdapter().tipPost(params);
}

export async function boostPost(params: BoostPostInput) {
  return getCirclesAdapter().boostPost(params);
}

export async function trustUser(params: TrustUserInput) {
  return getCirclesAdapter().trustUser(params);
}

export async function sharePost(params: SharePostInput) {
  return getCirclesAdapter().sharePost(params);
}

export async function getProfile(address: string) {
  return getCirclesAdapter().getProfile(address);
}

export async function getTrustRelations(address: string) {
  return getCirclesAdapter().getTrustRelations(address);
}

export async function getCommonTrust(
  viewerAddress: string,
  targetAddress: string,
) {
  return getCirclesAdapter().getCommonTrust(viewerAddress, targetAddress);
}

export function generateMiniAppDeepLink(params: {
  postId?: string;
  communityId?: string;
  baseUrl?: string;
}): string {
  if (params.postId) return makeFeedPostLink(params.postId, params.baseUrl);
  if (params.communityId)
    return makeFeedCommunityLink(params.communityId, params.baseUrl);
  return makeFeedPostLink("", params.baseUrl);
}
