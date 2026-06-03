// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useMockSession } from "@/providers/mock-session-provider";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StoriesStrip } from "@/components/feed/stories-strip";
import { ShareStoryModal } from "@/components/feed/share-story-modal";
import { StoryViewer } from "@/components/feed/story-viewer";
import { useTrustbook } from "@/providers/trustbook-provider";
import { GitBranch, Coins, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { usesLiveWallet, walletError, isGuest } = useMockSession();
  const { storyGroups } = useTrustbook();
  const [showShareStory, setShowShareStory] = useState(false);
  const [activeStoryAuthor, setActiveStoryAuthor] = useState<string | null>(
    null,
  );

  const activeStoryGroup = activeStoryAuthor
    ? storyGroups.find((g) => g.authorAddress === activeStoryAuthor)
    : null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <AppTopBar showSearch={false} />

      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Trustbook</h1>
          <p className="mt-1 text-sm text-emerald-50/90">
            Your trust-native social feed on Circles
          </p>
          <Link
            href="/feed"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-emerald-800 shadow-md hover:bg-emerald-50"
          >
            Open your feed
          </Link>
        </div>

        <StoriesStrip
          onOpenOwnStoryPicker={() => setShowShareStory(true)}
          onOpenStory={setActiveStoryAuthor}
        />

        <div className="card-surface mt-4 space-y-4 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-900">
            Why Trustbook?
          </h2>
          {[
            {
              icon: GitBranch,
              title: "Trust-ranked feed",
              text: "Posts ranked by your Circles graph, not ads.",
            },
            {
              icon: Coins,
              title: "Real CRC actions",
              text: "Tip and boost with on-chain trustbook references.",
            },
            {
              icon: Sparkles,
              title: "Circles profiles",
              text: "Connect on Gnosis to unlock live actions.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {isGuest && <ConnectWalletButton />}
          {usesLiveWallet && (
            <p className="text-center text-xs font-medium text-emerald-700">
              Circles connected — you&apos;re ready to tip & trust.
            </p>
          )}
          {walletError && (
            <p className="text-center text-xs text-red-600">{walletError}</p>
          )}
        </div>
      </main>

      {showShareStory && (
        <ShareStoryModal onClose={() => setShowShareStory(false)} />
      )}

      {activeStoryGroup && (
        <StoryViewer
          group={activeStoryGroup}
          onClose={() => setActiveStoryAuthor(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
