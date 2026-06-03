// src/components/layout/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutList, Trophy, Presentation } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: LayoutList },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/pitch", label: "Pitch", icon: Presentation },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-teal-700"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
