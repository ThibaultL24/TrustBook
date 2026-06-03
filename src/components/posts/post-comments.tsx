// src/components/posts/post-comments.tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTrustbook } from "@/providers/trustbook-provider";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface PostCommentsProps {
  postId: string;
  inputId?: string;
}

function formatCommentTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function PostComments({ postId, inputId }: PostCommentsProps) {
  const { viewer, getCommentsForPost, addComment, getUser } = useTrustbook();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const comments = getCommentsForPost(postId);
  const preview = comments.slice(0, expanded ? comments.length : 2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addComment(postId, text);
    setDraft("");
    setExpanded(true);
  }

  return (
    <div className="border-t border-[var(--border)] pt-2">
      {comments.length > 0 && (
        <>
          {!expanded && comments.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mb-2 text-xs font-semibold text-slate-500 hover:text-emerald-700"
            >
              View all {comments.length} comments
            </button>
          )}
          <ul className="mb-2 space-y-2">
            {preview.map((comment) => {
              const author = getUser(comment.authorAddress);
              if (!author) return null;
              return (
                <li key={comment.id} className="flex gap-2">
                  <Avatar src={author.avatarUrl} alt={author.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="inline-block max-w-full rounded-2xl bg-[var(--surface-muted)] px-3 py-1.5">
                      <p className="text-xs font-semibold text-slate-900">
                        {author.displayName}
                      </p>
                      <p className="text-sm text-slate-700">{comment.body}</p>
                    </div>
                    <p className="mt-0.5 pl-1 text-[10px] text-slate-400">
                      {formatCommentTime(comment.createdAt)} · Like · Reply
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar src={viewer.avatarUrl} alt={viewer.displayName} size="sm" />
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment…"
            className={cn(
              "w-full rounded-full bg-[var(--surface-muted)] py-2 pl-3 pr-10 text-sm",
              "ring-1 ring-[var(--border)] outline-none focus:ring-emerald-400",
            )}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-emerald-600 disabled:opacity-30"
            aria-label="Send comment"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
