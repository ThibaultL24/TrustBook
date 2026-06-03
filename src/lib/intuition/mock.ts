// src/lib/intuition/mock.ts

import type {
  IntuitionClaim,
  TrustbookIntuitionSignal,
} from "./types";
import {
  makeAuthorClaimSubject,
  makeCommunityClaimSubject,
  makePostClaimSubject,
} from "./references";

const MOCK_CLAIMS: IntuitionClaim[] = [
  {
    id: "claim-bob-builder",
    subject: makeAuthorClaimSubject("0xBob2222222222222222222222222222222222"),
    predicate: "isTrustedBuilder",
    object: "Circles mini-apps",
    confidence: 0.92,
    source: "intuition-mock",
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "claim-post-reco",
    subject: makePostClaimSubject("post-reco-trustbook"),
    predicate: "recommendedFor",
    object: "Circles Garage hackathon",
    confidence: 0.88,
    source: "intuition-mock",
  },
  {
    id: "claim-community-builders",
    subject: makeCommunityClaimSubject("circles-builders"),
    predicate: "hasActiveCommunity",
    object: "developer ecosystem",
    confidence: 0.85,
    source: "intuition-mock",
  },
  {
    id: "claim-hans-maker",
    subject: makePostClaimSubject("post-boost-only-hans"),
    predicate: "validatedByNetwork",
    object: "local makers community",
    confidence: 0.75,
    source: "intuition-mock",
  },
];

export function getMockIntuitionSignals(): TrustbookIntuitionSignal[] {
  return [
    {
      postId: "post-reco-trustbook",
      authorAddress: "0xBob2222222222222222222222222222222222",
      claim: MOCK_CLAIMS[1]!,
      weight: 6,
      explanation: "Intuition claim: recommended for Circles Garage",
    },
    {
      postId: "post-boost-only-hans",
      authorAddress: "0xHans8888888888888888888888888888888888",
      claim: MOCK_CLAIMS[3]!,
      weight: 4,
      explanation: "Intuition claim: validated by local makers network",
    },
    {
      authorAddress: "0xBob2222222222222222222222222222222222",
      claim: MOCK_CLAIMS[0]!,
      weight: 5,
      explanation: "Intuition claim: trusted Circles builder",
    },
    {
      communityId: "circles-builders",
      claim: MOCK_CLAIMS[2]!,
      weight: 3,
      explanation: "Intuition claim: active developer community",
    },
  ];
}
