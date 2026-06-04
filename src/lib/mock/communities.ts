// src/lib/mock/communities.ts

import type { Community } from "@/lib/types";
import { HIST_GROUP_ADDRESS } from "@/lib/circles/history-guessr-addresses";

export const OPEN_FEED_COMMUNITY_ID = "open-feed";
export const HISTORY_GUESSR_COMMUNITY_ID = "history-guessr";

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: OPEN_FEED_COMMUNITY_ID,
    name: "Fil ouvert",
    description:
      "Publications libres sans communauté ciblée — visibles selon la portée choisie (cercle, découverte).",
    avatarUrl: "https://placekitten.com/100/100",
    memberCount: 999,
    category: "other",
  },
  {
    id: HISTORY_GUESSR_COMMUNITY_ID,
    name: "History Guessr",
    description:
      "Groupe HIST sur Gnosis — même économie que le mini-app OpenCircles / History Guessr.",
    avatarUrl: "https://placekitten.com/105/105",
    memberCount: 42,
    category: "education",
  },
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
