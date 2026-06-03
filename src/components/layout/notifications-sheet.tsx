// src/components/layout/notifications-sheet.tsx
"use client";

import { X, Coins, HeartHandshake, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    icon: Coins,
    color: "text-emerald-600 bg-emerald-50",
    title: "Bob tipped your post",
    time: "2h",
    avatar: "https://placekitten.com/201/201",
    unread: true,
  },
  {
    id: "n2",
    icon: HeartHandshake,
    color: "text-teal-600 bg-teal-50",
    title: "Carla trusted you on Circles",
    time: "5h",
    avatar: "https://placekitten.com/203/203",
    unread: true,
  },
  {
    id: "n3",
    icon: Users,
    color: "text-sky-600 bg-sky-50",
    title: "New post in Circles Builders",
    time: "1d",
    avatar: "https://placekitten.com/204/204",
    unread: false,
  },
];

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close notifications"
      />
      <div className="fixed inset-x-0 top-0 z-[70] mx-auto max-h-[85vh] max-w-lg overflow-hidden rounded-b-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="max-h-[calc(85vh-3.5rem)] overflow-y-auto">
          {MOCK_NOTIFICATIONS.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex gap-3 border-b border-[var(--border)] px-4 py-3",
                n.unread && "bg-emerald-50/40",
              )}
            >
              <div className="relative shrink-0">
                <Avatar src={n.avatar} alt="" size="md" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white",
                    n.color,
                  )}
                >
                  <n.icon className="h-3 w-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500">{n.time} ago</p>
              </div>
              {n.unread && (
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
