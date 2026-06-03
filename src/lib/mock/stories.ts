// src/lib/mock/stories.ts

import { getMockUsers } from "./users";
import { VIEWER_ADDRESS } from "./addresses";

export interface StoryItem {
  id: string;
  address: string;
  displayName: string;
  avatarUrl: string;
  isOwn?: boolean;
  hasNew?: boolean;
}

export function getStoryItems(viewerAddress = VIEWER_ADDRESS): StoryItem[] {
  const users = getMockUsers(viewerAddress).slice(0, 8);
  const viewer = users.find((u) => u.address === viewerAddress) ?? users[0]!;

  return [
    {
      id: "story-own",
      address: viewer.address,
      displayName: "Your story",
      avatarUrl: viewer.avatarUrl,
      isOwn: true,
    },
    ...users
      .filter((u) => u.address !== viewerAddress)
      .map((u, i) => ({
        id: `story-${u.address}`,
        address: u.address,
        displayName: u.displayName.split(" ")[0] ?? u.displayName,
        avatarUrl: u.avatarUrl,
        hasNew: i < 5,
      })),
  ];
}
