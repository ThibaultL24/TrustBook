// src/components/ui/empty-state.tsx

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12 px-6 text-center",
        className,
      )}
    >
      <Icon className="h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="max-w-xs text-xs leading-relaxed text-slate-500">
        {description}
      </p>
      {action}
    </div>
  );
}
