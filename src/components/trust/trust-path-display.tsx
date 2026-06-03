// src/components/trust/trust-path-display.tsx

import type { TrustPath } from "@/lib/trust/trust-paths";
import { ArrowRight, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TrustPathDisplayProps {
  path: TrustPath;
  resolveName: (address: string) => string;
  compact?: boolean;
}

export function TrustPathDisplay({
  path,
  resolveName,
  compact,
}: TrustPathDisplayProps) {
  if (path.kind === "none") {
    return (
      <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
        <GitBranch className="h-3 w-3" />
        {path.label}
      </p>
    );
  }

  if (path.kind === "direct" || path.kind === "mutual") {
    return (
      <p
        className={cn(
          "flex items-center gap-1.5 font-medium text-teal-800",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        <GitBranch className="h-3 w-3 shrink-0" />
        {path.label}
      </p>
    );
  }

  return (
    <div className={compact ? "text-[10px]" : "text-xs"}>
      <p className="mb-1.5 flex items-center gap-1 font-medium text-slate-700">
        <GitBranch className="h-3 w-3 text-teal-600" />
        Trust path
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {path.addresses.map((addr, i) => (
          <span key={addr} className="flex items-center gap-1">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
              {resolveName(addr)}
            </span>
            {i < path.addresses.length - 1 && (
              <ArrowRight className="h-3 w-3 text-slate-400" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
