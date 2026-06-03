// src/components/trust/trust-circle-panel.tsx
"use client";

import Link from "next/link";
import { useTrustbook } from "@/providers/trustbook-provider";
import { useMockSession } from "@/providers/mock-session-provider";
import { Avatar } from "@/components/ui/avatar";
import {
  peerDisplayName,
  relationLabel,
} from "@/lib/circles/trust-peers";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { cn } from "@/lib/utils/cn";
import { Loader2, RefreshCw, Users } from "lucide-react";

interface TrustCirclePanelProps {
  compact?: boolean;
}

export function TrustCirclePanel({ compact }: TrustCirclePanelProps) {
  const { usesLiveWallet, isGuest } = useMockSession();
  const {
    trustPeers,
    isLoadingTrustGraph,
    trustGraphError,
    refreshTrustGraph,
    viewer,
  } = useTrustbook();

  if (isGuest) {
    return (
      <div className="card-surface rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Your trust circle</h2>
        </div>
        <p className="mb-3 text-xs text-slate-600">
          Connect your Circles wallet to load your real trust graph — like
          HistoryGuessr.
        </p>
        <ConnectWalletButton variant="outline" />
      </div>
    );
  }

  return (
    <div className="card-surface rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your trust circle</h2>
            <p className="text-[10px] text-slate-500">
              Live from Circles · {viewer.displayName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refreshTrustGraph()}
          disabled={isLoadingTrustGraph}
          className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          aria-label="Refresh trust graph"
        >
          {isLoadingTrustGraph ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>

      {isLoadingTrustGraph && trustPeers.length === 0 && (
        <p className="text-xs text-slate-500">Loading your Circles contacts…</p>
      )}

      {trustGraphError && trustPeers.length === 0 && !isLoadingTrustGraph && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {trustGraphError}
        </p>
      )}

      {trustPeers.length > 0 && (
        <ul className={cn("space-y-2", compact && "max-h-48 overflow-y-auto")}>
          {trustPeers.map((peer) => (
            <li key={peer.address}>
              <Link
                href={`/profile/${encodeURIComponent(peer.address)}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 hover:bg-white"
              >
                <Avatar
                  src={
                    peer.avatarUrl ??
                    `https://placekitten.com/230/230`
                  }
                  alt={peerDisplayName(peer)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {peerDisplayName(peer)}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    {relationLabel(peer.relation)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {usesLiveWallet &&
        !isLoadingTrustGraph &&
        trustPeers.length === 0 &&
        !trustGraphError && (
          <p className="text-xs text-slate-500">
            No peers yet — add trust in the Circles app, then refresh.
          </p>
        )}
    </div>
  );
}
