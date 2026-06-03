// src/components/feed/share-story-modal.tsx
"use client";

import { useTrustbook } from "@/providers/trustbook-provider";
import { X, Sparkles } from "lucide-react";

interface ShareStoryModalProps {
  onClose: () => void;
}

export function ShareStoryModal({ onClose }: ShareStoryModalProps) {
  const { viewer, getPostsByAuthor, sharePostToStory, stories } = useTrustbook();
  const myPosts = getPostsByAuthor(viewer.address);
  const sharedPostIds = new Set(
    stories
      .filter((s) => s.authorAddress === viewer.address)
      .map((s) => s.postId),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Share to story</h2>
            <p className="text-xs text-slate-500">
              Pick a post — visible 24h to your trust circle
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {myPosts.length === 0 ? (
          <p className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-slate-600">
            Publish a post first, then share it to your story.
          </p>
        ) : (
          <ul className="space-y-2">
            {myPosts.map((post) => {
              const alreadyShared = sharedPostIds.has(post.id);
              return (
                <li
                  key={post.id}
                  className="rounded-xl border border-[var(--border)] p-3"
                >
                  <p className="font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                    {post.body}
                  </p>
                  <button
                    type="button"
                    disabled={alreadyShared}
                    onClick={() => {
                      sharePostToStory(post.id);
                      onClose();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {alreadyShared ? "Already in story" : "Add to story"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
