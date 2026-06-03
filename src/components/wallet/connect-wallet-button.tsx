// src/components/wallet/connect-wallet-button.tsx
"use client";

import { useMockSession } from "@/providers/mock-session-provider";
import { isReadonlyMode } from "@/lib/config/runtime";
import { cn } from "@/lib/utils/cn";
import { Loader2, Wallet } from "lucide-react";

interface ConnectWalletButtonProps {
  className?: string;
  variant?: "primary" | "outline";
}

export function ConnectWalletButton({
  className,
  variant = "primary",
}: ConnectWalletButtonProps) {
  const {
    isWalletConnecting,
    usesLiveWallet,
    walletError,
    connectWallet,
    disconnectWallet,
    circlesAvatarAddress,
  } = useMockSession();

  if (isReadonlyMode) return null;

  if (usesLiveWallet) {
    return (
      <div className={cn("space-y-2", className)}>
        <button
          type="button"
          onClick={disconnectWallet}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Disconnect
          {circlesAvatarAddress && (
            <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
              {circlesAvatarAddress.slice(0, 8)}…{circlesAvatarAddress.slice(-6)}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={connectWallet}
        disabled={isWalletConnecting}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold shadow-md disabled:opacity-60",
          variant === "primary"
            ? "bg-teal-700 text-white hover:bg-teal-800"
            : "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100",
        )}
      >
        {isWalletConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isWalletConnecting ? "Connecting…" : "Connect wallet (Gnosis)"}
      </button>
      {walletError && (
        <p className="text-center text-xs text-red-600">{walletError}</p>
      )}
    </div>
  );
}
