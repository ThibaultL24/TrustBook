// src/lib/circles/host.ts

export type MiniAppUser = {
  address: string;
  displayName?: string;
  avatarUrl?: string;
};

export type MiniAppPaymentRequest = {
  to: string;
  amount: number;
  data: string;
  note?: string;
};

export type MiniAppTrustRequest = {
  target: string;
};

export type MiniAppTransactionResult = {
  txHash?: string;
  success?: boolean;
};

export type MiniAppSharePayload = {
  title?: string;
  text?: string;
  url: string;
};

export type MiniAppHost = {
  getCurrentUser?: () => Promise<MiniAppUser | null>;
  requestPayment?: (
    request: MiniAppPaymentRequest,
  ) => Promise<MiniAppTransactionResult>;
  requestTrust?: (
    request: MiniAppTrustRequest,
  ) => Promise<MiniAppTransactionResult>;
  openExternal?: (url: string) => Promise<void> | void;
  share?: (payload: MiniAppSharePayload) => Promise<void> | void;
};

/**
 * Circles/Gnosis hosted mini-app host bridge.
 * TODO: align method names with @aboutcircles/sdk + CirclesMiniapps repo.
 * Docs: https://miniapps.aboutcircles.com/developers
 */
declare global {
  interface Window {
    /** TODO: map to official Circles Garage mini-app host object */
    circlesMiniApp?: MiniAppHost;
    /** TODO: map to official Gnosis mini-app host object */
    gnosisMiniApp?: MiniAppHost;
  }
}

function isMiniAppHost(value: unknown): value is MiniAppHost {
  return typeof value === "object" && value !== null;
}

/**
 * Resolve the embedded mini-app host bridge from known global names.
 * Returns null on server or when no host is injected.
 */
export function getMiniAppHost(): MiniAppHost | null {
  if (typeof window === "undefined") return null;

  const candidates: unknown[] = [
    window.circlesMiniApp,
    window.gnosisMiniApp,
  ];

  for (const candidate of candidates) {
    if (isMiniAppHost(candidate)) return candidate;
  }

  // TODO: postMessage handshake with window.parent for sandboxed iframes
  return null;
}

export function hasMiniAppHost(): boolean {
  const host = getMiniAppHost();
  return Boolean(
    host?.getCurrentUser ||
      host?.requestPayment ||
      host?.requestTrust ||
      host?.share,
  );
}

/** Official Circles Garage mini-app wallet (OpenCircles pattern). */
export async function subscribeWallet(
  onAddress: (address: string | null) => void,
): Promise<{ unsubscribe: () => void; isMiniappHost: boolean }> {
  const { onWalletChange, isMiniappMode } = await import(
    "@aboutcircles/miniapp-sdk"
  );
  const unsubscribe = onWalletChange(onAddress);
  return { unsubscribe, isMiniappHost: isMiniappMode() };
}

export async function signInMessage(nonce: string): Promise<{
  signature: string;
  verified: boolean;
}> {
  const { signMessage } = await import("@aboutcircles/miniapp-sdk");
  return signMessage(`Sign in to Trustbook\nNonce: ${nonce}`, "erc1271");
}
