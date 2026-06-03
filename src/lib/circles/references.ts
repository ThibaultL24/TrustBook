// src/lib/circles/references.ts

const TIP_PREFIX = "trustbook:tip:";
const BOOST_PREFIX = "trustbook:boost:";

export type ParsedTrustbookReference =
  | { kind: "tip"; postId: string }
  | { kind: "boost"; postId: string };

export function makeTipReference(postId: string): string {
  return `${TIP_PREFIX}${postId}`;
}

export function makeBoostReference(postId: string): string {
  return `${BOOST_PREFIX}${postId}`;
}

/** @deprecated use makeTipReference */
export const buildTipReference = makeTipReference;

/** @deprecated use makeBoostReference */
export const buildBoostReference = makeBoostReference;

export function parseTrustbookReference(
  data: string,
): ParsedTrustbookReference | null {
  if (typeof data !== "string" || data.length === 0) return null;

  if (data.startsWith(TIP_PREFIX)) {
    const postId = data.slice(TIP_PREFIX.length).trim();
    return postId.length > 0 ? { kind: "tip", postId } : null;
  }

  if (data.startsWith(BOOST_PREFIX)) {
    const postId = data.slice(BOOST_PREFIX.length).trim();
    return postId.length > 0 ? { kind: "boost", postId } : null;
  }

  return null;
}
