// src/components/posts/create-post-modal.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { PostType } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { POST_TEMPLATES } from "@/lib/posts/templates";
import { X } from "lucide-react";

interface CreatePostModalProps {
  onClose: () => void;
  defaultCommunityId?: string;
}

export function CreatePostModal({
  onClose,
  defaultCommunityId,
}: CreatePostModalProps) {
  const { createPost, viewer } = useTrustbook();
  const [type, setType] = useState<PostType>("offer");
  const [communityId, setCommunityId] = useState(
    defaultCommunityId ?? viewer.groups[0] ?? MOCK_COMMUNITIES[0]!.id,
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Body must be at least 10 characters.");
      return;
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    createPost({
      type,
      communityId,
      title,
      body,
      amountRequested: amountRequested
        ? Number(amountRequested)
        : undefined,
      tags,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Create post</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-teal-50 hover:border-teal-200"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Details for trusted neighbors…"
              required
            />
          </div>

          {(type === "need" || type === "event") && (
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

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Publish
          </button>
        </form>
      </div>
    </div>
  );
}
