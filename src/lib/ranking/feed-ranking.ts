// src/lib/ranking/feed-ranking.ts

import type {
  FeedExplanation,
  FeedScoreBreakdown,
  FeedRubric,
  Post,
  RankedPost,
  TrustEdge,
  UserProfile,
} from "@/lib/types";
import {
  computeIntuitionScore,
  getIntuitionSignalsForRanking,
} from "@/lib/intuition/adapter";
import {
  authorTrustsViewer,
  getCommonTrustCount,
  viewerTrustsAuthor,
} from "@/lib/mock/trust-edges";
import { COMMUNITY_MAP } from "@/lib/mock/communities";
import { DEMO_REFERENCE_TIME } from "@/lib/mock/demo-time";
import {
  getTrustCirclePriority,
  isInTrustCircle,
} from "@/lib/trust/trust-circle";

export const WEIGHTS = {
  directTrust: 100,
  mutualTrust: 90,
  sharedCommunity: 40,
  commonTrustPerConnection: 8,
  commonTrustCap: 40,
  boostPerCrc: 0.5,
  boostCap: 30,
  recencyMax: 25,
  typeNeed: 15,
  typeOffer: 10,
  typeEvent: 5,
  typeRecommendation: 0,
  intuitionMax: 10,
} as const;

function postTypeBonus(type: Post["type"]): number {
  switch (type) {
    case "need":
      return WEIGHTS.typeNeed;
    case "offer":
      return WEIGHTS.typeOffer;
    case "event":
      return WEIGHTS.typeEvent;
    case "thought":
    case "recommendation":
      return WEIGHTS.typeRecommendation;
  }
}

export function computeRecencyScore(
  createdAt: string,
  nowMs: number = DEMO_REFERENCE_TIME,
): number {
  const ageHours =
    (nowMs - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const decay = Math.max(0, 1 - ageHours / (24 * 7));
  return decay * WEIGHTS.recencyMax;
}

export function computeBoostScore(amountBoosted: number): number {
  return Math.min(amountBoosted * WEIGHTS.boostPerCrc, WEIGHTS.boostCap);
}

function buildExplanation(
  factors: {
    directTrust: boolean;
    mutualTrust: boolean;
    sharedCommunity: string | null;
    commonTrust: number;
    boosted: number;
    intuitionScore: number;
  },
): FeedExplanation {
  if (factors.directTrust) {
    return {
      reasonLabel: "You trust this author",
      reasonDetails:
        "You have explicitly accepted this person's CRC — their posts rank higher in your feed.",
    };
  }

  if (factors.mutualTrust) {
    return {
      reasonLabel: "Mutual trust",
      reasonDetails:
        "You and this author trust each other — a strong signal for relevant community content.",
    };
  }

  if (factors.commonTrust >= 3) {
    return {
      reasonLabel: `${factors.commonTrust} common trust connections`,
      reasonDetails:
        "People you both trust create an understandable path — you're not seeing random content.",
    };
  }

  if (factors.sharedCommunity) {
    const community = COMMUNITY_MAP[factors.sharedCommunity];
    return {
      reasonLabel: `Active in ${community?.name ?? "shared community"}`,
      reasonDetails:
        "You share a community with the author, so their posts are relevant to your interests.",
    };
  }

  if (factors.boosted >= 20) {
    return {
      reasonLabel: "Boosted by trusted users",
      reasonDetails:
        "This post received CRC boosts from your network, signaling community validation.",
    };
  }

  if (factors.intuitionScore > 0) {
    return {
      reasonLabel: "Supported by Intuition claims",
      reasonDetails:
        "Contextual claims/reputation signals from Intuition — complementary to Circles trust, not a wallet trust substitute.",
    };
  }

  if (factors.commonTrust > 0) {
    return {
      reasonLabel: `${factors.commonTrust} common trust connection${factors.commonTrust > 1 ? "s" : ""}`,
      reasonDetails:
        "Shared trust paths connect you to this author even without a direct trust line.",
    };
  }

  return {
    reasonLabel: "Recent in your network",
    reasonDetails:
      "Ranked by recency and post type — needs and offers surface slightly above general recommendations.",
  };
}

export function computeScoreBreakdown(
  post: Post,
  viewerAddress: string,
  viewerGroups: string[],
  authorProfile?: UserProfile,
  edges?: TrustEdge[],
): FeedScoreBreakdown {
  const authorAddress = post.authorAddress;
  const directTrust = viewerTrustsAuthor(viewerAddress, authorAddress, edges);
  const trustsViewer = authorTrustsViewer(viewerAddress, authorAddress, edges);
  const mutualTrust = directTrust && trustsViewer;
  const commonTrustCount = getCommonTrustCount(viewerAddress, authorAddress, edges);

  const viewerGroupSet = new Set(viewerGroups);
  const sharedCommunityId =
    authorProfile?.groups.find((g) => viewerGroupSet.has(g)) ?? null;

  const directTrustScore = directTrust ? WEIGHTS.directTrust : 0;
  const mutualTrustScore = mutualTrust
    ? WEIGHTS.mutualTrust
    : trustsViewer && !directTrust
      ? WEIGHTS.mutualTrust * 0.5
      : 0;
  const sharedCommunityScore = sharedCommunityId ? WEIGHTS.sharedCommunity : 0;
  const commonTrustScore = Math.min(
    commonTrustCount * WEIGHTS.commonTrustPerConnection,
    WEIGHTS.commonTrustCap,
  );
  const crcBoost = computeBoostScore(post.amountBoosted);
  const recency = computeRecencyScore(post.createdAt);
  const postType = postTypeBonus(post.type);

  const intuitionSignals = getIntuitionSignalsForRanking(
    post.id,
    authorAddress,
    post.communityId,
  );
  const intuitionSignal = computeIntuitionScore(intuitionSignals);

  const total =
    directTrustScore +
    mutualTrustScore +
    sharedCommunityScore +
    commonTrustScore +
    crcBoost +
    recency +
    postType +
    intuitionSignal;

  return {
    directTrust: directTrustScore,
    mutualTrust: mutualTrustScore,
    sharedCommunity: sharedCommunityScore,
    commonTrust: commonTrustScore,
    crcBoost,
    recency,
    postType,
    ...(intuitionSignal > 0 ? { intuitionSignal } : {}),
    total,
  };
}

export function rankPost(
  post: Post,
  viewerAddress: string,
  viewerGroups: string[],
  authorProfile?: UserProfile,
  edges?: TrustEdge[],
): RankedPost {
  const authorAddress = post.authorAddress;
  const directTrust = viewerTrustsAuthor(viewerAddress, authorAddress, edges);
  const trustsViewer = authorTrustsViewer(viewerAddress, authorAddress, edges);
  const mutualTrust = directTrust && trustsViewer;
  const commonTrust = getCommonTrustCount(viewerAddress, authorAddress, edges);

  const viewerGroupSet = new Set(viewerGroups);
  const sharedCommunityId =
    authorProfile?.groups.find((g) => viewerGroupSet.has(g)) ?? null;

  const scoreBreakdown = computeScoreBreakdown(
    post,
    viewerAddress,
    viewerGroups,
    authorProfile,
    edges,
  );

  const explanation = buildExplanation({
    directTrust,
    mutualTrust,
    sharedCommunity: sharedCommunityId,
    commonTrust,
    boosted: post.amountBoosted,
    intuitionScore: scoreBreakdown.intuitionSignal ?? 0,
  });

  return {
    post,
    score: scoreBreakdown.total,
    explanation,
    scoreBreakdown,
  };
}

export function rankFeed(
  posts: Post[],
  viewerAddress: string,
  viewerGroups: string[],
  getAuthor: (address: string) => UserProfile | undefined,
  edges?: TrustEdge[],
): RankedPost[] {
  return posts
    .map((post) =>
      rankPost(
        post,
        viewerAddress,
        viewerGroups,
        getAuthor(post.authorAddress),
        edges,
      ),
    )
    .sort((a, b) => {
      const liveDiff =
        (b.post.isLive || b.post.format === "live" ? 50 : 0) -
        (a.post.isLive || a.post.format === "live" ? 50 : 0);
      if (liveDiff !== 0) return liveDiff;

      const priorityDiff =
        getTrustCirclePriority(viewerAddress, b.post.authorAddress, edges ?? []) -
        getTrustCirclePriority(viewerAddress, a.post.authorAddress, edges ?? []);
      if (priorityDiff !== 0) return priorityDiff;
      return b.score - a.score;
    });
}

export function filterByRubric(
  ranked: RankedPost[],
  rubric: FeedRubric,
  viewerAddress?: string,
  edges?: TrustEdge[],
): RankedPost[] {
  if (rubric === "all") return ranked;

  if (rubric === "circle") {
    if (!viewerAddress || !edges) return ranked;
    return ranked.filter(
      (r) =>
        r.post.authorAddress === viewerAddress ||
        isInTrustCircle(viewerAddress, r.post.authorAddress, edges),
    );
  }

  if (rubric === "thoughts") {
    return ranked.filter((r) => r.post.type === "thought");
  }

  const typeMap = {
    needs: "need",
    offers: "offer",
    recos: "recommendation",
    events: "event",
  } as const;
  const targetType = typeMap[rubric as keyof typeof typeMap];
  if (!targetType) return ranked;
  return ranked.filter((r) => r.post.type === targetType);
}
