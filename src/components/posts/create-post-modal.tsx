// src/components/posts/create-post-modal.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { PostType } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
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

export function CreatePostModal({
  onClose,
  defaultCommunityId,
  mode = "standard",
}: CreatePostModalProps) {
  const { createPost, viewer } = useTrustbook();
  const meta = MODE_META[mode];
  const ModeIcon = meta.icon;

  const [type, setType] = useState<PostType>(
    mode === "live" ? "event" : mode === "photo" ? "recommendation" : "offer",
  );
  const [communityId, setCommunityId] = useState(
    defaultCommunityId ?? viewer.groups[0] ?? MOCK_COMMUNITIES[0]!.id,
  );
  const [title, setTitle] = useState(defaultTitleForMode(mode));
  const [body, setBody] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [tagsRaw, setTagsRaw] = useState(
    mode === "live" ? "live, community" : mode === "photo" ? "photo" : "",
  );
  const [imageUrl, setImageUrl] = useState(
    mode === "photo"
      ? `https://placekitten.com/${300 + Math.floor(Math.random() * 50)}/${300 + Math.floor(Math.random() * 50)}`
      : "",
  );
  const [selectedMood, setSelectedMood] = useState<string>(MOOD_OPTIONS[0]!.id);
  const [shareToStory, setShareToStory] = useState(
    mode === "live" || mode === "photo",
  );
  const [error, setError] = useState<string | null>(null);

  const moodOption = MOOD_OPTIONS.find((m) => m.id === selectedMood);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const resolvedTitle =
      title.trim() ||
      defaultTitleForMode(mode, moodOption?.label) ||
      "Untitled post";

    if (resolvedTitle.length < 3) {
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

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    createPost({
      type,
      communityId,
      title: resolvedTitle,
      body: body.trim(),
      amountRequested: amountRequested ? Number(amountRequested) : undefined,
      tags,
      format: composerModeToFormat(mode),
      imageUrl: mode === "photo" ? imageUrl.trim() : undefined,
      mood: mode === "mood" ? selectedMood : undefined,
      isLive: mode === "live",
      shareToStory,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ModeIcon className={cn("h-5 w-5", meta.accent)} />
            <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
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
            their feeds for 24h.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "standard" && (
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Type
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Community
            </label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {MOCK_COMMUNITIES.filter((c) =>
                viewer.groups.includes(c.id),
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="What are you sharing?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              {mode === "live" ? "Live description" : "Body"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={placeholderForMode(mode)}
              required
            />
          </div>

          {(type === "need" || type === "event") && mode !== "mood" && (
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

          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <input
              type="checkbox"
              checked={shareToStory}
              onChange={(e) => setShareToStory(e.target.checked)}
              className="rounded border-emerald-300 text-emerald-600"
            />
            Also share to my story (24h)
          </label>

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
