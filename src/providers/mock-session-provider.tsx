// src/providers/mock-session-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useConnection,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  isMiniAppMode,
  isMockMode,
  isReadonlyMode,
  isWalletMode,
  TRUSTBOOK_MODE,
  type TrustbookMode,
} from "@/lib/config/runtime";
import {
  hasMiniAppHost,
  signInMessage,
  subscribeWallet,
} from "@/lib/circles/host";
import { CIRCLES_CHAIN_ID } from "@/lib/circles/chains";
import {
  clearCirclesSession,
  computeCirclesAvatarAddress,
  initCirclesSession,
} from "@/lib/circles/sdk-client";
import { resetCirclesAdapter } from "@/lib/circles/adapter";
import {
  clearSessionSignIn,
  readSessionSignIn,
  writeSessionSignIn,
} from "@/lib/circles/session-sign-in";
import type { Address } from "viem";
import type { Eip1193Provider } from "@safe-global/protocol-kit";

interface MockSessionContextValue {
  /** Circles avatar connected (mini-app host or browser wallet). */
  isConnected: boolean;
  isGuest: boolean;
  mode: TrustbookMode;
  isMockMode: boolean;
  isMiniAppMode: boolean;
  isReadonlyMode: boolean;
  isWalletMode: boolean;
  hasHost: boolean;
  isMiniappHostSdk: boolean;
  isWalletConnecting: boolean;
  isWalletConnected: boolean;
  circlesAvatarAddress: string | null;
  walletError: string | null;
  hasSignedIn: boolean;
  usesLiveWallet: boolean;
  connect: () => void;
  disconnect: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  completeSignIn: () => Promise<boolean>;
}

const MockSessionContext = createContext<MockSessionContextValue | null>(null);

function getWindowEthereum(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [mockBrowsing, setMockBrowsing] = useState(false);
  const [hasHost, setHasHost] = useState(false);
  const [isMiniappHostSdk, setIsMiniappHostSdk] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [miniappAvatar, setMiniappAvatar] = useState<string | null>(null);
  const [wagmiAvatar, setWagmiAvatar] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [hasSignedIn, setHasSignedIn] = useState(false);

  const { address, isConnected: wagmiConnected, chainId } = useConnection();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const circlesAvatarAddress = miniappAvatar ?? wagmiAvatar;
  const usesLiveWallet = Boolean(circlesAvatarAddress);
  const isGuest = !usesLiveWallet;
  const isWalletConnected = Boolean(wagmiConnected && wagmiAvatar);

  // OpenCircles pattern: always listen for Circles mini-app wallet when embedded.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void subscribeWallet((addr) => {
      setMiniappAvatar(addr);
      if (addr) {
        resetCirclesAdapter();
        setWalletError(null);
      } else {
        clearSessionSignIn();
        resetCirclesAdapter();
      }
    }).then(({ unsubscribe: unsub, isMiniappHost: host }) => {
      unsubscribe = unsub;
      setIsMiniappHostSdk(host);
      setHasHost(host || hasMiniAppHost());
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!circlesAvatarAddress) {
      setHasSignedIn(false);
      return;
    }
    if (isMiniappHostSdk) {
      writeSessionSignIn(circlesAvatarAddress);
      setHasSignedIn(true);
      return;
    }
    setHasSignedIn(readSessionSignIn(circlesAvatarAddress));
  }, [circlesAvatarAddress, isMiniappHostSdk]);

  const completeSignIn = useCallback(async (): Promise<boolean> => {
    if (!circlesAvatarAddress || !isMiniappHostSdk) return false;
    try {
      const nonce = crypto.randomUUID().slice(0, 8);
      const { verified } = await signInMessage(nonce);
      writeSessionSignIn(circlesAvatarAddress);
      setHasSignedIn(true);
      return verified;
    } catch {
      return false;
    }
  }, [circlesAvatarAddress, isMiniappHostSdk]);

  // Browser wallet → derive Circles Safe avatar + SDK session.
  useEffect(() => {
    if (miniappAvatar || !wagmiConnected || !address) {
      if (!wagmiConnected) {
        setWagmiAvatar(null);
        clearCirclesSession();
        resetCirclesAdapter();
      }
      return;
    }

    let cancelled = false;

    async function bootstrapCircles() {
      setIsWalletConnecting(true);
      setWalletError(null);
      try {
        if (chainId !== CIRCLES_CHAIN_ID) {
          await switchChainAsync({ chainId: CIRCLES_CHAIN_ID });
        }

        const eip1193 = getWindowEthereum();
        if (!eip1193) {
          throw new Error(
            "No Web3 wallet found. Install MetaMask on Gnosis Chain.",
          );
        }

        const avatar = computeCirclesAvatarAddress(address as Address);
        await initCirclesSession(address as Address, eip1193);
        resetCirclesAdapter();

        if (!cancelled) setWagmiAvatar(avatar);
      } catch (err) {
        clearCirclesSession();
        resetCirclesAdapter();
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to connect Circles";
          setWalletError(
            /not found|avatarnotfound/i.test(message)
              ? "Circles avatar not registered — register on Circles first."
              : message,
          );
          setWagmiAvatar(null);
        }
      } finally {
        if (!cancelled) setIsWalletConnecting(false);
      }
    }

    void bootstrapCircles();
    return () => {
      cancelled = true;
    };
  }, [
    miniappAvatar,
    wagmiConnected,
    address,
    chainId,
    switchChainAsync,
  ]);

  function connect() {
    setMockBrowsing(true);
  }

  const disconnectWallet = useCallback(() => {
    void disconnectAsync();
    clearCirclesSession();
    clearSessionSignIn();
    resetCirclesAdapter();
    setWagmiAvatar(null);
    setWalletError(null);
    setHasSignedIn(false);
  }, [disconnectAsync]);

  const connectWallet = useCallback(async () => {
    if (miniappAvatar) return;
    setWalletError(null);
    const connector = connectors[0];
    if (!connector) {
      setWalletError("No wallet connector available");
      return;
    }
    try {
      await connectAsync({ connector, chainId: CIRCLES_CHAIN_ID });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wallet connection failed";
      setWalletError(
        /reject|denied|cancel/i.test(message)
          ? "Connection cancelled"
          : message,
      );
    }
  }, [connectAsync, connectors, miniappAvatar]);

  const sessionConnected = usesLiveWallet || (isMockMode && mockBrowsing);

  const value = useMemo<MockSessionContextValue>(
    () => ({
      isConnected: sessionConnected,
      isGuest,
      mode: TRUSTBOOK_MODE,
      isMockMode,
      isMiniAppMode,
      isReadonlyMode,
      isWalletMode,
      hasHost,
      isMiniappHostSdk,
      isWalletConnecting,
      isWalletConnected,
      circlesAvatarAddress,
      walletError,
      hasSignedIn,
      usesLiveWallet,
      connect,
      disconnect: () => {
        if (wagmiAvatar) disconnectWallet();
        else {
          setMockBrowsing(false);
          clearSessionSignIn();
        }
      },
      connectWallet,
      disconnectWallet,
      completeSignIn,
    }),
    [
      sessionConnected,
      isGuest,
      hasHost,
      isMiniappHostSdk,
      isWalletConnecting,
      isWalletConnected,
      circlesAvatarAddress,
      walletError,
      hasSignedIn,
      usesLiveWallet,
      disconnectWallet,
      connectWallet,
      completeSignIn,
      wagmiAvatar,
    ],
  );

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const ctx = useContext(MockSessionContext);
  if (!ctx)
    throw new Error("useMockSession must be used within MockSessionProvider");
  return ctx;
}
