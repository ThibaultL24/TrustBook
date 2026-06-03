// src/components/ui/share-button.tsx
"use client";

import { useState } from "react";
import { shareTrustbookLink } from "@/lib/circles/share";
import type { SharePostInput } from "@/lib/circles/adapter-types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ShareButtonProps {
  input: SharePostInput;
  label?: string;
  className?: string;
  variant?: "icon" | "button";
}

export function ShareButton({
  input,
  label = "Share",
  className,
  variant = "button",
}: ShareButtonProps) {
  const { showActionToast } = useTrustbook();
  const [pending, setPending] = useState(false);

  async function handleShare() {
    setPending(true);
    try {
      const result = await shareTrustbookLink(input);
      showActionToast(
        result.message,
        result.ok ? "success" : "error",
      );
    } finally {
      setPending(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={pending}
        aria-label={label}
        className={cn(
          "rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50",
          className,
        )}
      >
        <Share2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={pending}
      className={cn(
        "flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50",
        className,
      )}
    >
      <Share2 className="h-3.5 w-3.5" />
      {pending ? "Sharing…" : label}
    </button>
  );
}
