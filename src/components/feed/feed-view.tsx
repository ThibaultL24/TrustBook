// src/components/feed/feed-view.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { FeedTab } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { useMockSession } from "@/providers/mock-session-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { parseDeepLinkDataSafe } from "@/lib/utils/deep-link";
import {
  DemoTour,
  shouldAutoOpenDemoTour,
} from "@/components/demo/demo-tour";
import { BottomNav } from "@/components/layout/bottom-nav";
import { JudgingBanner } from "@/components/layout/judging-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedHeader } from "./feed-header";
import { FeedTabs } from "./feed-tabs";
import { CommunityFilter } from "./community-filter";
import { PostCard } from "@/components/posts/post-card";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { PostFocusModal } from "@/components/posts/post-focus-modal";
import { ToastStack } from "@/components/ui/toast-stack";
import { Plus, Inbox } from "lucide-react";

function getInitialTourOpen(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("tour") === "1" || shouldAutoOpenDemoTour();
}

export function FeedView() {
  const searchParams = useSearchParams();
  const { isGuest, usesLiveWallet } = useMockSession();
  const {
    getRankedForTab,
    communityFilter,
    setCommunityFilter,
    focusedPostId,
    setFocusedPostId,
    getUser,
    posts,
  } = useTrustbook();

  const [tab, setTab] = useState<FeedTab>("for-you");
  const [trustTarget, setTrustTarget] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTour, setShowTour] = useState(getInitialTourOpen);
  const [tourKey, setTourKey] = useState(0);

  const dataRaw = searchParams.get("data");
  const deepLinkParse = dataRaw ? parseDeepLinkDataSafe(dataRaw) : null;
  const deepLinkError =
    deepLinkParse && !deepLinkParse.ok ? deepLinkParse.error : null;

  function openDemoTour() {
    setTourKey((k) => k + 1);
    setShowTour(true);
  }

  useEffect(() => {
    const postId = searchParams.get("postId");
    const communityId = searchParams.get("communityId");
    const raw = searchParams.get("data");

    if (communityId) setCommunityFilter(communityId);
    if (postId) setFocusedPostId(postId);

    if (raw) {
      const parsed = parseDeepLinkDataSafe(raw);
      if (parsed.ok) {
        if (parsed.data.communityId)
          setCommunityFilter(parsed.data.communityId);
        if (parsed.data.postId) setFocusedPostId(parsed.data.postId);
      }
    }
  }, [searchParams, setCommunityFilter, setFocusedPostId]);

  useEffect(() => {
    if (!focusedPostId) return;
    const timer = window.setTimeout(() => {
      document
        .getElementById(`post-${focusedPostId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [focusedPostId, posts]);

  const ranked = getRankedForTab(tab, communityFilter);
  const focusedPost = focusedPostId
    ? posts.find((p) => p.id === focusedPostId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <JudgingBanner onOpenDemoTour={openDemoTour} />
      <FeedHeader onOpenDemoTour={openDemoTour} />

      {isGuest && (
        <div className="mx-auto max-w-lg px-4 pb-2">
          <div className="flex flex-col gap-2 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-teal-900">
              Browsing as guest — connect to tip, boost, or trust on Gnosis.
            </p>
            <ConnectWalletButton
              className="sm:max-w-[200px]"
              variant="outline"
            />
          </div>
        </div>
      )}

      {usesLiveWallet && (
        <div className="mx-auto max-w-lg px-4 pb-2">
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-[10px] text-emerald-800">
            Connected to Circles — CRC actions are on-chain.
          </p>
        </div>
      )}

      <FeedTabs active={tab} onChange={setTab} />
      <CommunityFilter
        value={communityFilter}
        onChange={setCommunityFilter}
      />

      {deepLinkError && (
        <div className="mx-auto max-w-lg px-4 pb-2">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Deep link error: {deepLinkError}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-lg space-y-4 px-4 pb-4">
        {ranked.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No posts here yet"
            description="Try another filter or create a post for your communities."
          />
        ) : (
          ranked.map((r) => (
            <PostCard
              key={r.post.id}
              ranked={r}
              onTrustAuthor={setTrustTarget}
            />
          ))
        )}
      </main>

      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800"
        aria-label="Create post"
      >
        <Plus className="h-6 w-6" />
      </button>

      {trustTarget && (
        <TrustConfirmModal
          address={trustTarget}
          profile={getUser(trustTarget)}
          onClose={() => setTrustTarget(null)}
        />
      )}

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}

      {focusedPost && (
        <PostFocusModal
          postId={focusedPost.id}
          onClose={() => setFocusedPostId(null)}
        />
      )}

      <DemoTour key={tourKey} open={showTour} onClose={() => setShowTour(false)} />
      <ToastStack />
      <BottomNav />
    </div>
  );
}
