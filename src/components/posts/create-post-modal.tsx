// src/components/posts/create-post-modal.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { PostAudience, PostType } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import {
  MOCK_COMMUNITIES,
  OPEN_FEED_COMMUNITY_ID,
} from "@/lib/mock/communities";
import { audienceAllowsStoryShare } from "@/lib/posts/visibility";
import { POST_TEMPLATES } from "@/lib/posts/templates";
import {
  type ComposerMode,
  MOOD_OPTIONS,
  composerModeToFormat,
  defaultTitleForMode,
  placeholderForMode,
} from "@/lib/posts/composer-modes";
import { Video, ImageIcon, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CreatePostModalProps {
  onClose: () => void;
  defaultCommunityId?: string;
  mode?: ComposerMode;
  variant?: "thought" | "utility";
}

const MODE_META: Record<
  ComposerMode,
  { title: string; icon: typeof Video; accent: string }
> = {
  standard: { title: "Create post", icon: Smile, accent: "text-slate-700" },
  live: { title: "Go live", icon: Video, accent: "text-rose-600" },
  photo: { title: "Share a photo", icon: ImageIcon, accent: "text-emerald-600" },
  mood: { title: "Share a feeling", icon: Smile, accent: "text-amber-500" },
};

const AUDIENCE_OPTIONS: {
  id: PostAudience;
  label: string;
  hint: string;
}[] = [
  {
    id: "circle",
    label: "Circle",
    hint: "People in your Circles trust graph",
  },
  {
    id: "communities",
    label: "Communities",
    hint: "Members of the selected community (+ your circle)",
  },
  {
    id: "discovery",
    label: "Discovery",
    hint: "Visible in the broader home feed, still ranked by trust",
  },
];

export function CreatePostModal({
  onClose,
  defaultCommunityId,
  mode = "standard",
  variant = "thought",
}: CreatePostModalProps) {
  const { createPost, viewer } = useTrustbook();
  const isThought = variant === "thought";
  const meta = MODE_META[mode];
  const ModeIcon = meta.icon;

  const [audience, setAudience] = useState<PostAudience>("circle");
  const [type, setType] = useState<PostType>(
    isThought
      ? "thought"
      : mode === "live"
        ? "event"
        : mode === "photo"
          ? "recommendation"
          : "offer",
  );
  const [communityId, setCommunityId] = useState(
    defaultCommunityId ?? viewer.groups[0] ?? MOCK_COMMUNITIES[0]!.id,
  );
  const [title, setTitle] = useState(
    isThought && mode === "standard" ? "" : defaultTitleForMode(mode),
  );
  const [body, setBody] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [tagsRaw, setTagsRaw] = useState(
    mode === "live" ? "live, community" : mode === "photo" ? "photo" : "",
  );
  const [imageUrl, setImageUrl] = useState(
    mode === "photo" ? "https://placekitten.com/320/320" : "",
  );
  const [selectedMood, setSelectedMood] = useState<string>(MOOD_OPTIONS[0]!.id);
  const [shareToStory, setShareToStory] = useState(
    audienceAllowsStoryShare("circle") &&
      (mode === "live" || mode === "photo"),
  );
  const [error, setError] = useState<string | null>(null);

  const moodOption = MOOD_OPTIONS.find((m) => m.id === selectedMood);
  const canShareStory = audienceAllowsStoryShare(audience);

  function handleAudienceChange(next: PostAudience) {
    setAudience(next);
    if (!audienceAllowsStoryShare(next)) setShareToStory(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const resolvedTitle =
      title.trim() ||
      defaultTitleForMode(mode, moodOption?.label) ||
      (isThought ? "" : "Untitled post");

    if (!isThought && resolvedTitle.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Body must be at least 10 characters.");
      return;
    }
    if (mode === "photo" && !imageUrl.trim()) {
      setError("Add a photo URL or use the suggested placeholder.");
      return;
    }
    if (audience === "communities" && !communityId) {
      setError("Choose a community for this audience.");
      return;
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const postType: PostType = isThought ? "thought" : type;

    createPost({
      type: postType,
      audience,
      communityId: audience === "communities" ? communityId : undefined,
      title: resolvedTitle || "…",
      body: body.trim(),
      amountRequested: amountRequested ? Number(amountRequested) : undefined,
      tags,
      format: composerModeToFormat(mode),
      imageUrl: mode === "photo" ? imageUrl.trim() : undefined,
      mood: mode === "mood" ? selectedMood : undefined,
      isLive: mode === "live",
      shareToStory: canShareStory && shareToStory,
    });
    onClose();
  }

  const modalTitle = isThought
    ? mode === "standard"
      ? "Share a thought"
      : meta.title
    : "Post a listing";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ModeIcon className={cn("h-5 w-5", meta.accent)} />
            <h2 className="text-lg font-bold text-slate-900">{modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "live" && (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800 ring-1 ring-rose-100">
            Going live notifies your trust circle. Live posts stay at the top of
            the feed for 24h for people allowed to see the post.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Who can see this?
            </label>
            <div className="space-y-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5 transition",
                    audience === opt.id
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={opt.id}
                    checked={audience === opt.id}
                    onChange={() => handleAudienceChange(opt.id)}
                    className="mt-1 text-emerald-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {opt.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {!isThought && mode === "standard" && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Quick templates
              </label>
              <div className="flex flex-wrap gap-2">
                {POST_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setType(tpl.type);
                      setTitle(tpl.title);
                      setBody(tpl.body);
                      setTagsRaw(tpl.tags.join(", "));
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "mood" && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                How are you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMood(m.id);
                      setTitle(defaultTitleForMode("mood", m.label));
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      selectedMood === m.id
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "photo" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Photo URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://…"
              />
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="mt-2 max-h-40 w-full rounded-xl object-cover"
                />
              )}
            </div>
          )}

          {!isThought && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Listing type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PostType)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                disabled={mode === "live"}
              >
                <option value="recommendation">Recommendation</option>
                <option value="offer">Offer</option>
                <option value="need">Need</option>
                <option value="event">Event</option>
              </select>
            </div>
          )}

          {(audience === "communities" || !isThought) && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Community
              </label>
              <select
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                disabled={audience !== "communities" && isThought}
              >
                {MOCK_COMMUNITIES.filter(
                  (c) =>
                    c.id !== OPEN_FEED_COMMUNITY_ID &&
                    (viewer.groups.includes(c.id) || !isThought),
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(!isThought || mode !== "standard") && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Title {isThought ? "(optional)" : ""}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder={
                  isThought ? "Optional" : "What are you sharing?"
                }
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              {mode === "live" ? "Live description" : "Body"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={
                isThought
                  ? "Share freely — news, ideas, everyday life…"
                  : placeholderForMode(mode)
              }
              required
            />
          </div>

          {!isThought &&
            (type === "need" || type === "event") &&
            mode !== "mood" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Amount requested (CRC, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Tags (comma-separated)
            </label>
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="mutual-aid, local"
            />
          </div>

          {canShareStory && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <input
                type="checkbox"
                checked={shareToStory}
                onChange={(e) => setShareToStory(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600"
              />
              Also share to my story (24h)
            </label>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={cn(
              "w-full rounded-xl py-2.5 text-sm font-semibold text-white",
              mode === "live"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {mode === "live" ? "Go live" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
