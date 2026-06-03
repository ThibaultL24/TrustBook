// src/app/providers.tsx
"use client";

import { MockSessionProvider } from "@/providers/mock-session-provider";
import { TrustbookProvider } from "@/providers/trustbook-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <MockSessionProvider>
        <TrustbookProvider>{children}</TrustbookProvider>
      </MockSessionProvider>
    </WalletProvider>
  );
}
