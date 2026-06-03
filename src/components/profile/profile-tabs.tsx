// src/components/profile/profile-tabs.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import { FileText, GitBranch, User } from "lucide-react";

export type ProfileTab = "posts" | "about" | "trust";

interface ProfileTabsProps {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  postCount: number;
}

const TABS: {
  id: ProfileTab;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "about", label: "About", icon: User },
  { id: "trust", label: "Trust", icon: GitBranch },
];

export function ProfileTabs({ active, onChange, postCount }: ProfileTabsProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur-md" data-profile-tab="posts">
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors",
              active === id
                ? "text-emerald-700"
                : "text-slate-500 hover:bg-emerald-50/50",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "posts" && postCount > 0 && (
              <span className="text-[10px] font-normal text-slate-400">
                ({postCount})
              </span>
            )}
            {active === id && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
