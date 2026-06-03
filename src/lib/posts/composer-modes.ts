// src/lib/posts/composer-modes.ts

import type { PostFormat } from "@/lib/types";

export type ComposerMode = "standard" | "live" | "photo" | "mood";

export const MOOD_OPTIONS = [
  { id: "grateful", emoji: "🙏", label: "Grateful" },
  { id: "excited", emoji: "🎉", label: "Excited" },
  { id: "hopeful", emoji: "🌱", label: "Hopeful" },
  { id: "curious", emoji: "🤔", label: "Curious" },
  { id: "proud", emoji: "💪", label: "Proud" },
  { id: "supported", emoji: "🤝", label: "Supported" },
  { id: "inspired", emoji: "✨", label: "Inspired" },
  { id: "celebrating", emoji: "🥳", label: "Celebrating" },
] as const;

export function composerModeToFormat(mode: ComposerMode): PostFormat {
  if (mode === "live") return "live";
  if (mode === "photo") return "photo";
  if (mode === "mood") return "mood";
  return "standard";
}

export function defaultTitleForMode(mode: ComposerMode, moodLabel?: string): string {
  switch (mode) {
    case "live":
      return "Going live in the community";
    case "photo":
      return "Shared a photo";
    case "mood":
      return moodLabel ? `Feeling ${moodLabel.toLowerCase()}` : "Sharing a feeling";
    default:
      return "";
  }
}

export function placeholderForMode(mode: ComposerMode): string {
  switch (mode) {
    case "live":
      return "What are you going live about? Add context for your trust circle…";
    case "photo":
      return "Caption your photo — who should see this?";
    case "mood":
      return "Tell your circle why you feel this way…";
    default:
      return "Details for trusted neighbors…";
  }
}
