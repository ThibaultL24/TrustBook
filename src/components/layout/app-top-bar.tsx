// src/components/layout/app-top-bar.tsx
"use client";

import Link from "next/link";
import { useTrustbook } from "@/providers/trustbook-provider";
import { useMockSession } from "@/providers/mock-session-provider";
import { Avatar } from "@/components/ui/avatar";
import { Search, Bell, MessageCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppTopBarProps {
  showSearch?: boolean;
  onNotificationsClick?: () => void;
  className?: string;
}

export function AppTopBar({
  showSearch = true,
  onNotificationsClick,
  className,
}: AppTopBarProps) {
  const { viewer } = useTrustbook();
  const { usesLiveWallet } = useMockSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-2.5">
        <Link
          href="/feed"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-0.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md">
            <Shield className="h-4 w-4" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-emerald-800 sm:inline">
            Trustbook
          </span>
        </Link>

        {showSearch && (
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-2 ring-1 ring-[var(--border)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search Trustbook"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              readOnly
              aria-label="Search Trustbook"
            />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-emerald-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
          <Link
            href="/feed"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-emerald-50"
            aria-label="Messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            href={`/profile/${encodeURIComponent(viewer.address)}`}
            className="ml-0.5 rounded-full ring-2 ring-transparent hover:ring-emerald-200"
          >
            <Avatar
              src={viewer.avatarUrl}
              alt={viewer.displayName}
              size="sm"
              className={cn(
                usesLiveWallet && "ring-2 ring-emerald-400",
              )}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
