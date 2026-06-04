// src/lib/mock/users.ts

import type { UserProfile } from "@/lib/types";
import { MOCK_ADDRESSES, VIEWER_ADDRESS } from "./addresses";
import { DEMO_AVATARS, DEMO_COVERS } from "./demo-media";
import {
  authorTrustsViewer,
  getCommonTrustCount,
  viewerTrustsAuthor,
} from "./trust-edges";

interface BaseUser {
  address: string;
  displayName: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  trustScore?: number;
  trustLevel?: string;
  groups: string[];
  crcBalance?: number;
}

const BASE_USERS: BaseUser[] = [
  {
    address: VIEWER_ADDRESS,
    displayName: "Alice Chen",
    avatarUrl: DEMO_AVATARS.alice,
    coverUrl: DEMO_COVERS.alice,
    bio: "Community organizer exploring Circles-native discovery.",
    trustScore: 82,
    trustLevel: "Established",
    groups: [
      "circles-builders",
      "mutual-aid",
      "local-makers",
      "history-guessr",
    ],
    crcBalance: 240,
  },
  {
    address: MOCK_ADDRESSES.bob,
    displayName: "Bob Okonkwo",
    avatarUrl: DEMO_AVATARS.bob,
    coverUrl: DEMO_COVERS.bob,
    bio: "Full-stack builder. Ships mini-apps for local economies.",
    trustScore: 91,
    trustLevel: "Highly trusted",
    groups: ["circles-builders", "local-makers"],
    crcBalance: 180,
  },
  {
    address: MOCK_ADDRESSES.carla,
    displayName: "Carla Mendez",
    avatarUrl: DEMO_AVATARS.carla,
    coverUrl: DEMO_COVERS.carla,
    bio: "Mutual aid coordinator. Connects needs with trusted helpers.",
    trustScore: 88,
    trustLevel: "Established",
    groups: ["mutual-aid", "circles-builders"],
    crcBalance: 95,
  },
  {
    address: MOCK_ADDRESSES.diego,
    displayName: "Diego Ruiz",
    avatarUrl: DEMO_AVATARS.diego,
    coverUrl: DEMO_COVERS.diego,
    bio: "Bike repair and tool library steward.",
    trustScore: 74,
    trustLevel: "Growing",
    groups: ["local-makers", "mutual-aid"],
    crcBalance: 62,
  },
  {
    address: MOCK_ADDRESSES.elena,
    displayName: "Elena Vasquez",
    avatarUrl: DEMO_AVATARS.elena,
    coverUrl: DEMO_COVERS.elena,
    bio: "History walks and neighborhood storytelling.",
    trustScore: 79,
    trustLevel: "Established",
    groups: ["history-culture", "mutual-aid"],
    crcBalance: 110,
  },
  {
    address: MOCK_ADDRESSES.fern,
    displayName: "Fern Taylor",
    avatarUrl: DEMO_AVATARS.fern,
    coverUrl: DEMO_COVERS.fern,
    bio: "Food sharing network. Weekly surplus redistribution.",
    trustScore: 85,
    trustLevel: "Established",
    groups: ["mutual-aid"],
    crcBalance: 45,
  },
  {
    address: MOCK_ADDRESSES.gina,
    displayName: "Gina Park",
    avatarUrl: DEMO_AVATARS.gina,
    coverUrl: DEMO_COVERS.gina,
    bio: "Open-source design systems for community apps.",
    trustScore: 77,
    trustLevel: "Growing",
    groups: ["circles-builders", "history-culture"],
    crcBalance: 130,
  },
  {
    address: MOCK_ADDRESSES.hans,
    displayName: "Hans Weber",
    avatarUrl: DEMO_AVATARS.hans,
    coverUrl: DEMO_COVERS.hans,
    bio: "Woodworking workshops and skill shares.",
    trustScore: 70,
    trustLevel: "Growing",
    groups: ["local-makers", "history-culture"],
    crcBalance: 88,
  },
  {
    address: MOCK_ADDRESSES.iris,
    displayName: "Iris Nakamura",
    avatarUrl: DEMO_AVATARS.iris,
    coverUrl: DEMO_COVERS.iris,
    bio: "Event producer for community gatherings and hackathons.",
    trustScore: 83,
    trustLevel: "Established",
    groups: ["circles-builders", "history-culture"],
    crcBalance: 155,
  },
];

export function enrichProfile(
  base: BaseUser,
  viewerAddress: string = VIEWER_ADDRESS,
): UserProfile {
  const trustedByViewer = viewerTrustsAuthor(viewerAddress, base.address);
  const trustsViewer = authorTrustsViewer(viewerAddress, base.address);
  const mutualTrustCount =
    trustedByViewer && trustsViewer
      ? getCommonTrustCount(viewerAddress, base.address) + 1
      : getCommonTrustCount(viewerAddress, base.address);

  return {
    ...base,
    trustedByViewer,
    trustsViewer,
    mutualTrustCount,
  };
}

export function getMockUsers(viewerAddress: string = VIEWER_ADDRESS): UserProfile[] {
  return BASE_USERS.map((u) => enrichProfile(u, viewerAddress));
}

export function getMockUser(
  address: string,
  viewerAddress: string = VIEWER_ADDRESS,
): UserProfile | undefined {
  const base = BASE_USERS.find((u) => u.address === address);
  return base ? enrichProfile(base, viewerAddress) : undefined;
}

export const VIEWER_PROFILE = enrichProfile(
  BASE_USERS[0]!,
  VIEWER_ADDRESS,
);
