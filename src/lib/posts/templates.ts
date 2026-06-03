// src/lib/posts/templates.ts

import type { PostType } from "@/lib/types";

export interface PostTemplate {
  id: string;
  label: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "need",
    label: "I need help with…",
    type: "need",
    title: "I need help with…",
    body: "Describe what you need, when, and what CRC you can offer in return. Trusted neighbors see this first.",
    tags: ["need", "mutual-aid"],
  },
  {
    id: "offer",
    label: "I can offer…",
    type: "offer",
    title: "I can offer…",
    body: "Share a skill, tool, ride, or time you can give to people in your trust network.",
    tags: ["offer", "community"],
  },
  {
    id: "reco",
    label: "I recommend…",
    type: "recommendation",
    title: "I recommend…",
    body: "Recommend a person, project, or tool your trusted network should know about — and why.",
    tags: ["recommendation"],
  },
  {
    id: "event",
    label: "I'm organizing…",
    type: "event",
    title: "I'm organizing…",
    body: "Community event details: when, where, and optional CRC to reserve a spot.",
    tags: ["event", "community"],
  },
];
