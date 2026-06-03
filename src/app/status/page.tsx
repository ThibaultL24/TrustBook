// src/app/status/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { hasMiniAppHost } from "@/lib/circles/host";
import {
  getIntegrationStatus,
  PRODUCTION_TODOS,
  getModeLabel,
} from "@/lib/status/integration-status";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

function StatusRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail?: string;
}) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-emerald-600" : "text-slate-400"}`}
      />
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [hostDetected] = useState(() =>
    typeof window !== "undefined" ? hasMiniAppHost() : false,
  );

  const status = getIntegrationStatus(hostDetected);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="mx-auto max-w-lg px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Integration status
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Transparent production readiness for Circles Garage judging.
        </p>

        <section className="mb-6 space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Runtime</h2>
          <StatusRow label={`Mode: ${getModeLabel()}`} ok detail={status.mode} />
          <StatusRow
            label="Judging mode"
            ok={status.judgingMode}
            detail={status.judgingMode ? "enabled" : "disabled"}
          />
          <StatusRow
            label="Host bridge detected"
            ok={status.hostBridgeDetected}
            detail={
              status.hostBridgeDetected
                ? "circlesMiniApp / gnosisMiniApp"
                : "Not in Circles iframe or host not injected"
            }
          />
          <StatusRow
            label="App URL configured"
            ok={status.appUrlConfigured}
            detail={status.appUrl}
          />
          <StatusRow label="Version" ok detail={status.version} />
        </section>

        <section className="mb-6 space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">APIs</h2>
          <StatusRow
            label="Circles public API"
            ok={status.circlesApiConfigured}
            detail={
              status.circlesApiConfigured
                ? status.circlesChainId || "URL set"
                : "Using mock / placeholders"
            }
          />
          <StatusRow
            label="Intuition API"
            ok={status.intuitionApiConfigured}
            detail={
              status.intuitionApiConfigured
                ? status.intuitionApiUrl
                : "Mock Intuition signals (optional layer)"
            }
          />
        </section>

        <section className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertCircle className="h-4 w-4" />
            Production TODOs
          </h2>
          <ul className="space-y-2 text-xs leading-relaxed text-amber-950">
            {PRODUCTION_TODOS.map((todo) => (
              <li key={todo} className="flex gap-2">
                <span className="text-amber-600">•</span>
                {todo}
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/demo"
          className="block rounded-xl bg-teal-700 py-3 text-center text-sm font-semibold text-white"
        >
          Open demo script
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
