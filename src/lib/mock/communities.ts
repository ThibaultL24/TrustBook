// src/lib/mock/communities.ts

import type { Community } from "@/lib/types";

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "circles-builders",
    name: "Circles Builders",
    description:
      "Developers and designers building Circles-native tools, mini-apps, and trust infrastructure.",
    avatarUrl: "https://placekitten.com/101/101",
    memberCount: 128,
    category: "dev",
  },
  {
    id: "mutual-aid",
    name: "Mutual Aid",
    description:
      "Neighbors supporting neighbors — food, rides, childcare, and emergency help routed through trust.",
    avatarUrl: "https://placekitten.com/102/102",
    memberCount: 342,
    category: "mutual-aid",
  },
  {
    id: "local-makers",
    name: "Local Makers",
    description:
      "Artisans, repair cafes, and makers sharing skills, tools, and workshop space.",
    avatarUrl: "https://placekitten.com/103/103",
    memberCount: 89,
    category: "local",
  },
  {
    id: "history-culture",
    name: "History & Culture",
    description:
      "Walking tours, oral history, archives, and cultural events rooted in place.",
    avatarUrl: "https://placekitten.com/104/104",
    memberCount: 56,
    category: "education",
  },
];

export const COMMUNITY_MAP = Object.fromEntries(
  MOCK_COMMUNITIES.map((c) => [c.id, c]),
);
