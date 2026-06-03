// src/components/ui/toast-stack.tsx
"use client";

import { useTrustbook } from "@/providers/trustbook-provider";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export function ToastStack() {
  const { toasts, dismissToast } = useTrustbook();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 shadow-lg",
            "bg-white/95 backdrop-blur",
            toast.type === "error"
              ? "border-red-200 text-red-900"
              : toast.type === "info"
                ? "border-sky-200 text-sky-900"
                : "border-slate-200 text-slate-800",
          )}
          onClick={() => dismissToast(toast.id)}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          )}
          {toast.type === "info" && (
            <Info className="h-5 w-5 shrink-0 text-sky-600" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <p className="text-sm leading-snug">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
