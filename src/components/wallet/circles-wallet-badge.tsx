// src/components/wallet/circles-wallet-badge.tsx
"use client";

import { useState } from "react";
import { useMockSession } from "@/providers/mock-session-provider";
import { useTrustbook } from "@/providers/trustbook-provider";
import { shortenAddress } from "@/lib/circles/format";
import { Avatar } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export function CirclesWalletBadge() {
  const {
    isConnected,
    isMiniAppMode,
    isMiniappHostSdk,
    isWalletConnecting,
    hasSignedIn,
    completeSignIn,
    circlesAvatarAddress,
    walletError,
    usesLiveWallet,
  } = useMockSession();
  const { viewer } = useTrustbook();
  const [signStatus, setSignStatus] = useState<string | null>(null);
  const showCirclesUi =
    isConnected && (usesLiveWallet || isMiniAppMode || isMiniappHostSdk);
  const showSignIn =
    isConnected && isMiniappHostSdk && !hasSignedIn;

  async function handleSignIn() {
    setSignStatus(null);
    const verified = await completeSignIn();
    setSignStatus(verified ? "Signed in" : "Sign-in failed");
    window.setTimeout(() => setSignStatus(null), 3000);
  }

  if (!showCirclesUi && !isWalletConnecting) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isWalletConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
        ) : (
          <Avatar src={viewer.avatarUrl} alt={viewer.displayName} size="sm" />
        )}
        <div className="text-right text-xs">
          <p className="font-medium text-slate-900">
            {isWalletConnecting
              ? "Connecting…"
              : viewer.displayName || shortenAddress(viewer.address, 2)}
          </p>
          <p className="text-emerald-700">
            {viewer.crcBalance !== undefined
              ? `${viewer.crcBalance} CRC`
              : "CRC —"}
          </p>
        </div>
      </div>

      {isMiniAppMode && isMiniappHostSdk && isConnected && (
        <div className="flex items-center gap-1">
          {showSignIn ? (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="rounded-full border border-teal-200 px-2 py-0.5 text-[10px] font-medium text-teal-800 hover:bg-teal-50"
            >
              Sign in
            </button>
          ) : (
            <span className="text-[10px] text-emerald-600">Session active</span>
          )}
        </div>
      )}

      {signStatus && (
        <p className="text-[10px] text-emerald-600">{signStatus}</p>
      )}
      {walletError && (
        <p className="max-w-[180px] text-right text-[10px] text-red-600">
          {walletError}
        </p>
      )}
      {circlesAvatarAddress && usesLiveWallet && (
        <p className="text-[9px] text-slate-400">
          {shortenAddress(circlesAvatarAddress, 4)}
        </p>
      )}
    </div>
  );
}
