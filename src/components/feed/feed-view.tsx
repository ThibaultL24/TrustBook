// src/components/feed/feed-view.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { FeedTab } from "@/lib/types";
import type { ComposerMode } from "@/lib/posts/composer-modes";
import { useTrustbook } from "@/providers/trustbook-provider";
import { useMockSession } from "@/providers/mock-session-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { parseDeepLinkDataSafe } from "@/lib/utils/deep-link";
import {
  DemoTour,
  shouldAutoOpenDemoTour,
} from "@/components/demo/demo-tour";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationsSheet } from "@/components/layout/notifications-sheet";
import { JudgingBanner } from "@/components/layout/judging-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { StoriesStrip } from "./stories-strip";
import { PostComposer } from "./post-composer";
import { FeedTabs } from "./feed-tabs";
import { CommunityFilter } from "./community-filter";
import { ShareStoryModal } from "./share-story-modal";
import { StoryViewer } from "./story-viewer";
import { PostCard } from "@/components/posts/post-card";
import { TrustConfirmModal } from "@/components/trust/trust-confirm-modal";
import { CreatePostModal } from "@/components/posts/create-post-modal";
import { PostFocusModal } from "@/components/posts/post-focus-modal";
import { ToastStack } from "@/components/ui/toast-stack";
import { Inbox, Users } from "lucide-react";

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
    viewer,
    storyGroups,
  } = useTrustbook();

  const [tab, setTab] = useState<FeedTab>("for-you");
  const [trustTarget, setTrustTarget] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [composerMode, setComposerMode] = useState<ComposerMode>("standard");
  const [showShareStory, setShowShareStory] = useState(false);
  const [activeStoryAuthor, setActiveStoryAuthor] = useState<string | null>(
    null,
  );
  const [showTour, setShowTour] = useState(getInitialTourOpen);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const dataRaw = searchParams.get("data");
  const deepLinkParse = dataRaw ? parseDeepLinkDataSafe(dataRaw) : null;
  const deepLinkError =
    deepLinkParse && !deepLinkParse.ok ? deepLinkParse.error : null;

  const activeStoryGroup = activeStoryAuthor
    ? storyGroups.find((g) => g.authorAddress === activeStoryAuthor)
    : null;

  function openCreate(mode: ComposerMode = "standard") {
    setComposerMode(mode);
    setShowCreate(true);
  }

  function openDemoTour() {
    setTourKey((k) => k + 1);
    setShowTour(true);
  }

  useEffect(() => {
    const postId = searchParams.get("postId");
    const communityId = searchParams.get("communityId");
    const raw = searchParams.get("data");
    const create = searchParams.get("create");

    if (communityId) setCommunityFilter(communityId);
    if (postId) setFocusedPostId(postId);
    if (create === "1") openCreate("standard");

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
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <JudgingBanner onOpenDemoTour={openDemoTour} />
      <AppTopBar onNotificationsClick={() => setShowNotifications(true)} />

      {isGuest && (
        <div className="mx-auto max-w-lg px-3 py-2">
          <div className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              Browsing as guest · connect to tip & trust on Gnosis
            </p>
            <ConnectWalletButton className="sm:max-w-[180px]" variant="outline" />
          </div>
        </div>
      )}

      {usesLiveWallet && (
        <div className="mx-auto max-w-lg px-3 pb-1">
          <p className="rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-[11px] font-medium text-white">
            Connected · {viewer.crcBalance ?? 0} CRC available
          </p>
        </div>
      )}

      <div className="mx-auto max-w-lg space-y-2 py-2">
        <StoriesStrip
          onOpenOwnStoryPicker={() => setShowShareStory(true)}
          onOpenStory={setActiveStoryAuthor}
        />
        <PostComposer onOpenCreate={openCreate} />
      </div>

      <FeedTabs active={tab} onChange={setTab} />

      {tab === "circle" && (
        <div className="mx-auto max-w-lg px-3 py-1">
          <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 ring-1 ring-emerald-100">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Posts from people in your trust circle — mutual trust, direct trust,
            and shared paths.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-lg px-3 py-2">
        <CommunityFilter value={communityFilter} onChange={setCommunityFilter} />
      </div>

      {deepLinkError && (
        <div className="mx-auto max-w-lg px-3 pb-2">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Deep link error: {deepLinkError}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-lg space-y-2 px-0 pb-4 sm:px-3">
        {ranked.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={tab === "circle" ? "No posts from your circle yet" : "No posts here yet"}
            description={
              tab === "circle"
                ? "Trust more authors on Circles to grow your circle feed."
                : "Try another filter or create a post for your communities."
            }
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

      {trustTarget && (
        <TrustConfirmModal
          address={trustTarget}
          profile={getUser(trustTarget)}
          onClose={() => setTrustTarget(null)}
        />
      )}

      {showCreate && (
        <CreatePostModal
          mode={composerMode}
          onClose={() => setShowCreate(false)}
        />
      )}

      {showShareStory && (
        <ShareStoryModal onClose={() => setShowShareStory(false)} />
      )}

      {activeStoryGroup && (
        <StoryViewer
          group={activeStoryGroup}
          onClose={() => setActiveStoryAuthor(null)}
        />
      )}

      {focusedPost && (
        <PostFocusModal
          postId={focusedPost.id}
          onClose={() => setFocusedPostId(null)}
        />
      )}

      <NotificationsSheet
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <DemoTour key={tourKey} open={showTour} onClose={() => setShowTour(false)} />
      <ToastStack />
      <BottomNav onCreateClick={() => openCreate("standard")} />
    </div>
  );
}
