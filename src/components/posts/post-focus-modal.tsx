// src/components/posts/post-focus-modal.tsx
"use client";

import { useTrustbook } from "@/providers/trustbook-provider";
import { rankPost } from "@/lib/ranking/feed-ranking";
import { PostCard } from "./post-card";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { useState } from "react";
import { X } from "lucide-react";

interface PostFocusModalProps {
  postId: string;
  onClose: () => void;
}

export function PostFocusModal({ postId, onClose }: PostFocusModalProps) {
  const { posts, viewer, trustEdges, getUser } = useTrustbook();
  const [trustTarget, setTrustTarget] = useState<string | null>(null);

  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const ranked = rankPost(
    post,
    viewer.address,
    viewer.groups,
    getUser(post.authorAddress),
    trustEdges,
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">Post</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <PostCard
          ranked={ranked}
          onTrustAuthor={setTrustTarget}
        />
      </div>
      {trustTarget && (
        <TrustConfirmModal
          address={trustTarget}
          profile={getUser(trustTarget)}
          onClose={() => setTrustTarget(null)}
        />
      )}
    </div>
  );
}
