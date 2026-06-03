// src/app/page.tsx
"use client";

import Link from "next/link";
import { useMockSession } from "@/providers/mock-session-provider";
import { TRUSTBOOK_MODE } from "@/lib/config/runtime";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Shield, Sparkles, Coins, GitBranch } from "lucide-react";

export default function LandingPage() {
  const { usesLiveWallet, walletError, isGuest } = useMockSession();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50 to-teal-50/30 pb-20">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-lg">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Trustbook
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Circles-native feed · trust graph ranking · CRC actions
          </p>
        </div>

        <div className="mb-8 space-y-4 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <p className="text-lg font-medium leading-snug text-slate-800">
            Browse the feed now. Connect when you want to tip, boost, or trust
            on Gnosis.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            Posts are curated community content; authors on Circles accept real
            CRC. Your trust graph personalizes ranking once connected.
          </p>
        </div>

        <ul className="mb-10 space-y-3">
          {[
            {
              icon: GitBranch,
              text: "Explainable ranking via trust, communities, and CRC",
            },
            {
              icon: Coins,
              text: "On-chain tips with trustbook:tip annotations",
            },
            {
              icon: Sparkles,
              text: "Circles profile + balance when wallet is connected",
            },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Link
            href="/feed"
            className="block w-full rounded-2xl bg-slate-900 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-slate-800"
          >
            Open feed
          </Link>

          {isGuest && <ConnectWalletButton />}

          {usesLiveWallet && (
            <p className="text-center text-xs text-emerald-700">
              Circles connected — tips and trust are live on Gnosis.
            </p>
          )}

          {walletError && (
            <p className="text-center text-xs text-red-600">{walletError}</p>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-400">
          Mode: <span className="font-medium">{TRUSTBOOK_MODE}</span>
        </p>
      </main>
    </div>
  );
}
