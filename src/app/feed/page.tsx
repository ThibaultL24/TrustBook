// src/app/feed/page.tsx
import { Suspense } from "react";
import { FeedView } from "@/components/feed/feed-view";

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading feed…
        </div>
      }
    >
      <FeedView />
    </Suspense>
  );
}
