// src/app/pitch/page.tsx
"use client";

import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { resetDemoTour } from "@/components/demo/demo-tour";
import {
  DEMO_LIVE_TIP_POST_ID,
  DEMO_CIRCLES_PROFILE_PATH,
} from "@/lib/circles/live-authors";
import {
  ArrowRight,
  Coins,
  GitBranch,
  HeartHandshake,
  Shield,
  Users,
  Zap,
} from "lucide-react";

const LIVE_DEMO_FEED = `/feed?postId=${DEMO_LIVE_TIP_POST_ID}`;

export default function PitchPage() {
  function handleStartTour() {
    resetDemoTour();
    window.location.href = "/feed?tour=1";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-teal-50/40 pb-24">
      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-lg">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Trustbook</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            A Circles-native feed where visibility follows explicit trust — not
            opaque engagement — and useful actions receive CRC on Gnosis.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-emerald-900">
            <Zap className="h-4 w-4" />
            <h2 className="text-sm font-bold">Live demo for judges (60s)</h2>
          </div>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-emerald-950">
            <li>
              <Link href="/" className="font-medium underline">
                Connect wallet
              </Link>{" "}
              on Gnosis Chain (mode: wallet)
            </li>
            <li>
              Open the highlighted post with the{" "}
              <span className="font-semibold">Live CRC</span> badge
            </li>
            <li>
              Tap <strong>Tip 1 CRC (live)</strong> on Lenormand&apos;s Safe (
              <Link href={DEMO_CIRCLES_PROFILE_PATH} className="underline">
                History Guessr
              </Link>
              ) —{" "}
              <code className="rounded bg-white/80 px-1 text-[10px]">
                trustbook:tip:{DEMO_LIVE_TIP_POST_ID}
              </code>
            </li>
            <li>Expand “Why am I seeing this?” — explainable ranking</li>
          </ol>
          <Link
            href={LIVE_DEMO_FEED}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Coins className="h-4 w-4" />
            Jump to live tip post
          </Link>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Problem</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Social feeds rank by opaque engagement. They ignore who you
            economically trust and which communities shape your CRC economy.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Solution</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Trustbook ranks posts via Circles trust, shared communities, and CRC
            boosts — every card explains why you see it.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/50 p-5">
          <h2 className="mb-3 text-sm font-bold text-teal-900">
            Circles primitives used
          </h2>
          <ul className="space-y-3 text-sm text-slate-700">
            {[
              {
                icon: Coins,
                text: "CRC transfers with annotated txData (tip / boost).",
              },
              {
                icon: HeartHandshake,
                text: "Trust graph — explicit trust, not a casual follow.",
              },
              {
                icon: Users,
                text: "Real avatars via getProfileView (Gnosis Group, humans).",
              },
              {
                icon: GitBranch,
                text: "Wallet + mini-app SDK — Garage-ready integration.",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">MVP scope</h2>
          <p className="text-sm text-slate-600">
            5 posts on real Circles avatars · explainable feed · live tip on
            Gnosis · mock/demo posts for narrative · leaderboard · Garage pitch
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Next</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Indexer for trustbook:* on-chain refs</li>
            <li>Feed from indexer + Circles Groups</li>
            <li>Trust-path via SDK pathfinder</li>
          </ul>
        </section>

        <div className="space-y-2">
          <Link
            href={LIVE_DEMO_FEED}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Live demo feed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/feed"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Full feed
          </Link>
          <Link
            href="/leaderboard"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Leaderboard
          </Link>
          <button
            type="button"
            onClick={handleStartTour}
            className="w-full rounded-2xl border border-teal-200 bg-teal-50 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-100"
          >
            Guided tour
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
