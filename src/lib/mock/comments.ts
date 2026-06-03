// src/lib/mock/comments.ts

import type { Comment } from "@/lib/types";
import { MOCK_ADDRESSES, VIEWER_ADDRESS } from "./addresses";

export const SEED_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "post-live-circles-help",
    authorAddress: MOCK_ADDRESSES.bob,
    body: "Happy to help — DM me if you need a walkthrough of the SDK.",
    createdAt: "2025-05-28T14:22:00.000Z",
  },
  {
    id: "c2",
    postId: "post-live-circles-help",
    authorAddress: VIEWER_ADDRESS,
    body: "This is exactly what our garage team needed. Thanks!",
    createdAt: "2025-05-28T15:01:00.000Z",
  },
  {
    id: "c3",
    postId: "post-need-ride",
    authorAddress: MOCK_ADDRESSES.carla,
    body: "I can cover Tuesday if the route works — ping me on Circles.",
    createdAt: "2025-05-27T09:15:00.000Z",
  },
  {
    id: "c4",
    postId: "post-gina-design",
    authorAddress: MOCK_ADDRESSES.iris,
    body: "Would love a quick audit on our community landing page.",
    createdAt: "2025-05-26T18:40:00.000Z",
  },
];
