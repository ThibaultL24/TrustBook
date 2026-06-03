// src/components/layout/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Plus,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTrustbook } from "@/providers/trustbook-provider";

interface BottomNavProps {
  onCreateClick?: () => void;
}

export function BottomNav({ onCreateClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { viewer } = useTrustbook();

  function handleCreate() {
    if (onCreateClick) onCreateClick();
    else router.push("/feed");
  }

  const links = [
    { href: "/feed", label: "Home", icon: Home, match: (p: string) => p === "/feed" || p.startsWith("/feed") },
    { href: "/leaderboard", label: "Ranks", icon: Trophy, match: (p: string) => p.startsWith("/leaderboard") },
    {
      href: `/profile/${encodeURIComponent(viewer.address)}`,
      label: "Profile",
      icon: User,
      match: (p: string) => p.startsWith("/profile"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgb(0_0_0/0.04)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1">
        {links.slice(0, 2).map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <Icon
                className={cn("h-6 w-6", active && "fill-emerald-100 stroke-emerald-700")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleCreate}
          className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg ring-4 ring-[var(--background)]"
          aria-label="Create post"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Link
          href="/community/circles-builders"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
            pathname.startsWith("/community")
              ? "text-emerald-700"
              : "text-slate-500",
          )}
        >
          <Users
            className={cn(
              "h-6 w-6",
              pathname.startsWith("/community") && "fill-emerald-100 stroke-emerald-700",
            )}
          />
          Groups
        </Link>

        {links.slice(2).map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <Icon
                className={cn("h-6 w-6", active && "fill-emerald-100 stroke-emerald-700")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
