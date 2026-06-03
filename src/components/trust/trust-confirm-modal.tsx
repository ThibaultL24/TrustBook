// src/components/trust/trust-confirm-modal.tsx
"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useTrustbook } from "@/providers/trustbook-provider";
import { Avatar } from "@/components/ui/avatar";
import { AlertTriangle, X } from "lucide-react";

interface TrustConfirmModalProps {
  address: string;
  profile?: UserProfile;
  onClose: () => void;
}

export function TrustConfirmModal({
  address,
  profile,
  onClose,
}: TrustConfirmModalProps) {
  const { trustAuthor, canSignActions } = useTrustbook();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!confirmed) return;
    setLoading(true);
    try {
      await trustAuthor(address);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="trust-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {profile && (
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="md"
              />
            )}
            <div>
              <h2
                id="trust-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                Trust {profile?.displayName ?? "this person"}
              </h2>
              <p className="text-xs text-slate-500">Circles trust — not a follow</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-950">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-2 leading-relaxed">
            <p>
              Trusting someone in Circles means <strong>accepting their personal CRC</strong>{" "}
              as part of your economic graph.
            </p>
            <p>
              You expose part of your own currency routing to them — this is a serious,
              explicit decision, not a casual social connection.
            </p>
          </div>
        </div>

        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700">
            I understand that I am accepting this person&apos;s CRC and sharing economic
            trust — not just following them.
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              !canSignActions ||
              !confirmed ||
              loading ||
              profile?.trustedByViewer
            }
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Confirming…" : "Confirm trust"}
          </button>
        </div>
      </div>
    </div>
  );
}
