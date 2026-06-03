// src/components/feed/feed-header.tsx
"use client";

import { useMemo } from "react";
import { useTrustbook } from "@/providers/trustbook-provider";
import { computeFeedImpactStats } from "@/lib/feed/feed-stats";
import { Coins, PlayCircle, TrendingUp } from "lucide-react";
import { useMockSession } from "@/providers/mock-session-provider";
import { CirclesWalletBadge } from "@/components/wallet/circles-wallet-badge";
import { cn } from "@/lib/utils/cn";

const MODE_LABELS = {
  mock: "Mock",
  miniapp: "Mini App",
  readonly: "Readonly",
  wallet: "Wallet · Gnosis",
} as const;

interface FeedHeaderProps {
  onOpenDemoTour: () => void;
}

export function FeedHeader({ onOpenDemoTour }: FeedHeaderProps) {
  const { viewer, integrationMode, canSignActions, rankedFeed, trustEdges } =
    useTrustbook();
  const { isMiniAppMode, hasHost, isMiniappHostSdk, usesLiveWallet } =
    useMockSession();
  const showWalletBadge =
    usesLiveWallet || (isMiniAppMode && (hasHost || isMiniappHostSdk));

  const stats = useMemo(
    () => computeFeedImpactStats(rankedFeed, viewer.address, trustEdges),
    [rankedFeed, viewer.address, trustEdges],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Trustbook
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  integrationMode === "mock"
                    ? "text-amber-600"
                    : integrationMode === "readonly"
                      ? "text-slate-500"
                      : integrationMode === "wallet"
                        ? "text-emerald-700"
                        : "text-teal-700",
                )}
              >
                {MODE_LABELS[integrationMode]} mode
              </span>
              {isMiniAppMode && !hasHost && (
                <span className="text-[10px] text-amber-600">· no host</span>
              )}
              {!canSignActions && (
                <span className="text-[10px] text-slate-400">· view only</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDemoTour}
              className="flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800 hover:bg-teal-100"
            >
              <PlayCircle className="h-3 w-3" />
              Demo tour
            </button>
            {showWalletBadge ? (
              <CirclesWalletBadge />
            ) : (
              <div className="text-right text-xs">
                <p className="font-medium text-slate-900">{viewer.displayName}</p>
                <p className="flex items-center justify-end gap-1 text-emerald-700">
                  <Coins className="h-3 w-3" />
                  {viewer.crcBalance ?? 0} CRC
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-50 p-2 text-center">
          <div>
            <p className="flex items-center justify-center gap-0.5 text-xs font-bold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {stats.totalBoosted}
            </p>
            <p className="text-[9px] text-slate-500">CRC boosted</p>
          </div>
          <div>
            <p className="text-xs font-bold text-sky-700">{stats.totalTips}</p>
            <p className="text-[9px] text-slate-500">Tips</p>
          </div>
          <div>
            <p className="text-xs font-bold text-teal-700">
              {stats.trustedAuthorsVisible}
            </p>
            <p className="text-[9px] text-slate-500">Trusted</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">
              {stats.activeCommunitiesVisible}
            </p>
            <p className="text-[9px] text-slate-500">Communities</p>
          </div>
        </div>
      </div>
    </header>
  );
}
