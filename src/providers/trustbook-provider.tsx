// src/providers/trustbook-provider.tsx
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
import type { CirclesActionResult } from "@/lib/circles/adapter-types";
import {
  isMockMode,
  isReadonlyMode,
  isMiniAppMode,
  isWalletMode,
  TRUSTBOOK_MODE,
  type TrustbookMode,
} from "@/lib/config/runtime";
import { useMockSession } from "@/providers/mock-session-provider";
import { getCirclesAdapter } from "@/lib/circles/adapter";
import { getCirclesSession } from "@/lib/circles/circles-session";
import {
  getLiveAuthorAddresses,
  isLiveCirclesAuthor,
} from "@/lib/circles/live-authors";
import {
  liveAuthorPlaceholder,
  trustbookProfileToUser,
} from "@/lib/circles/live-profiles";
import { fetchCirclesProfile } from "@/lib/circles/public-api";
import { syncTrustEdgesForViewer } from "@/lib/circles/sync-trust-edges";
import { resetDemoTour } from "@/components/demo/demo-tour";
import { setIntuitionMockMode } from "@/lib/intuition/adapter";
import { SEED_POSTS } from "@/lib/mock/posts";
import { MOCK_TRUST_EDGES, VIEWER_TRUSTS } from "@/lib/mock/trust-edges";
import { getMockUsers, VIEWER_PROFILE } from "@/lib/mock/users";
import { rankFeed, filterByTab } from "@/lib/ranking/feed-ranking";
import type {
  FeedTab,
  Post,
  PostType,
  RankedPost,
  UserProfile,
} from "@/lib/types";
import { VIEWER_ADDRESS } from "@/lib/mock/addresses";
import type { TrustEdge } from "@/lib/types";

type ToastType = "success" | "info" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface CreatePostInput {
  type: PostType;
  communityId: string;
  title: string;
  body: string;
  amountRequested?: number;
  tags: string[];
}

interface TrustbookContextValue {
  viewer: UserProfile;
  users: UserProfile[];
  posts: Post[];
  trustEdges: TrustEdge[];
  viewerTrusts: string[];
  rankedFeed: RankedPost[];
  integrationMode: TrustbookMode;
  canSignActions: boolean;
  getRankedForTab: (tab: FeedTab, communityId?: string | null) => RankedPost[];
  getUser: (address: string) => UserProfile | undefined;
  getPostsByAuthor: (address: string) => Post[];
  getPostsByCommunity: (communityId: string) => Post[];
  tipOnPost: (postId: string) => Promise<void>;
  boostOnPost: (postId: string, amount?: number) => Promise<void>;
  trustAuthor: (address: string) => Promise<void>;
  createPost: (input: CreatePostInput) => Post;
  updatePost: (postId: string, patch: Partial<Post>) => void;
  isActionPending: (key: string) => boolean;
  toasts: Toast[];
  showActionToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  focusedPostId: string | null;
  setFocusedPostId: (id: string | null) => void;
  communityFilter: string | null;
  setCommunityFilter: (id: string | null) => void;
  resetDemoState: () => void;
}

const TrustbookContext = createContext<TrustbookContextValue | null>(null);

function toastFromResult(result: CirclesActionResult): {
  message: string;
  type: ToastType;
} {
  if (result.ok) return { message: result.message, type: "success" };
  if (
    result.reason === "readonly" ||
    result.reason === "host_unavailable" ||
    result.reason === "invalid_recipient"
  ) {
    return { message: result.message, type: "info" };
  }
  return { message: result.message, type: "error" };
}

export function TrustbookProvider({ children }: { children: ReactNode }) {
  const {
    circlesAvatarAddress,
    isConnected: sessionConnected,
    usesLiveWallet,
  } = useMockSession();
  const viewerAddress = circlesAvatarAddress ?? VIEWER_ADDRESS;
  const hasOnChainSession = Boolean(getCirclesSession());

  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [trustEdges, setTrustEdges] = useState<TrustEdge[]>(MOCK_TRUST_EDGES);
  const [viewerTrusts, setViewerTrusts] = useState<string[]>(VIEWER_TRUSTS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>(
    {},
  );
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [communityFilter, setCommunityFilter] = useState<string | null>(null);

  const canSignActions = usesLiveWallet && !isReadonlyMode;

  const showActionToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const setPending = useCallback((key: string, value: boolean) => {
    setPendingActions((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: true };
    });
  }, []);

  const isActionPending = useCallback(
    (key: string) => Boolean(pendingActions[key]),
    [pendingActions],
  );

  const [walletViewer, setWalletViewer] = useState<UserProfile | null>(null);
  const [liveProfiles, setLiveProfiles] = useState<Record<string, UserProfile>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    const addresses = getLiveAuthorAddresses();

    void (async () => {
      const entries = await Promise.all(
        addresses.map(async (address) => {
          try {
            const profile = await fetchCirclesProfile(address);
            if (!profile) {
              return [
                address.toLowerCase(),
                liveAuthorPlaceholder(address),
              ] as const;
            }
            return [
              address.toLowerCase(),
              trustbookProfileToUser(profile, viewerAddress),
            ] as const;
          } catch {
            return [address.toLowerCase(), liveAuthorPlaceholder(address)] as const;
          }
        }),
      );
      if (!cancelled) {
        setLiveProfiles(Object.fromEntries(entries));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewerAddress]);

  useEffect(() => {
    if (!usesLiveWallet || !circlesAvatarAddress) return;

    let cancelled = false;
    void (async () => {
      try {
        const { edges, viewerTrusts: trusts } =
          await syncTrustEdgesForViewer(circlesAvatarAddress);
        if (cancelled) return;
        setTrustEdges(edges);
        setViewerTrusts(trusts);
      } catch {
        /* seed graph fallback */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [usesLiveWallet, circlesAvatarAddress]);

  useEffect(() => {
    if (!usesLiveWallet) {
      setWalletViewer(null);
      return;
    }
    if (!circlesAvatarAddress) {
      setWalletViewer(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const adapter = getCirclesAdapter();
      const profile = await adapter.getProfile(circlesAvatarAddress);
      if (cancelled || !profile) return;
      setWalletViewer({
        address: profile.address,
        displayName: profile.displayName ?? "You",
        avatarUrl: profile.avatarUrl ?? "",
        bio: profile.bio ?? "",
        crcBalance: profile.crcBalance ?? 0,
        groups: [],
        trustedByViewer: false,
        trustsViewer: false,
        mutualTrustCount: 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [circlesAvatarAddress, usesLiveWallet]);

  const users = useMemo(() => {
    return getMockUsers(viewerAddress).map((u) => {
      if (u.address === viewerAddress) return u;
      return {
        ...u,
        trustedByViewer: viewerTrusts.includes(u.address),
        trustsViewer: trustEdges.some(
          (e) => e.from === u.address && e.to === viewerAddress,
        ),
        mutualTrustCount: u.mutualTrustCount,
      };
    });
  }, [viewerTrusts, trustEdges, viewerAddress]);

  const viewer = useMemo(() => {
    if (walletViewer) return walletViewer;
    return users.find((u) => u.address === viewerAddress) ?? VIEWER_PROFILE;
  }, [users, viewerAddress, walletViewer]);

  const getUser = useCallback(
    (address: string) => {
      const key = address.trim().toLowerCase();
      const live = liveProfiles[key];
      const mock = users.find(
        (u) => u.address.trim().toLowerCase() === key,
      );
      if (live) {
        return {
          ...live,
          trustedByViewer:
            mock?.trustedByViewer ?? live.trustedByViewer,
          trustsViewer: mock?.trustsViewer ?? live.trustsViewer,
          mutualTrustCount: mock?.mutualTrustCount ?? live.mutualTrustCount,
          groups: mock?.groups ?? live.groups,
        };
      }
      if (mock) return mock;
      if (isLiveCirclesAuthor(address)) return liveAuthorPlaceholder(address);
      return undefined;
    },
    [users, liveProfiles],
  );

  const getPostsByAuthor = useCallback(
    (address: string) =>
      [...posts]
        .filter((p) => p.authorAddress === address)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [posts],
  );

  const getPostsByCommunity = useCallback(
    (communityId: string) =>
      [...posts]
        .filter((p) => p.communityId === communityId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [posts],
  );

  const rankedFeed = useMemo(
    () =>
      rankFeed(posts, viewerAddress, viewer.groups, getUser, trustEdges),
    [posts, viewerAddress, viewer.groups, getUser, trustEdges],
  );

  const getRankedForTab = useCallback(
    (tab: FeedTab, communityId?: string | null) => {
      let filtered = filterByTab(rankedFeed, tab);
      const cid = communityId ?? communityFilter;
      if (cid) filtered = filtered.filter((r) => r.post.communityId === cid);
      return filtered;
    },
    [rankedFeed, communityFilter],
  );

  const updatePost = useCallback((postId: string, patch: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
    );
  }, []);

  const applyLocalActionOnSuccess = useCallback(
    (result: CirclesActionResult) => {
      return (
        result.ok &&
        (result.mode === "wallet" ||
          result.mode === "miniapp" ||
          (isMockMode && !hasOnChainSession))
      );
    },
    [hasOnChainSession],
  );

  const tipOnPost = useCallback(
    async (postId: string) => {
      const key = `tip:${postId}`;
      if (pendingActions[key]) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (canSignActions && (viewer.crcBalance ?? 0) < 1) {
        showActionToast("Insufficient CRC balance", "info");
        return;
      }

      if (!canSignActions) {
        showActionToast("Connect your wallet to send CRC on Gnosis", "info");
        return;
      }

      setPending(key, true);
      try {
        const adapter = getCirclesAdapter();
        const result = await adapter.tipPost({
          from: viewer.address,
          to: post.authorAddress,
          amount: 1,
          postId,
        });

        const { message, type } = toastFromResult(result);
        showActionToast(message, type);

        if (applyLocalActionOnSuccess(result)) {
          updatePost(postId, {
            tipCount: post.tipCount + 1,
            amountBoosted: post.amountBoosted + 1,
          });
        }
      } finally {
        setPending(key, false);
      }
    },
    [
      posts,
      viewer,
      pendingActions,
      canSignActions,
      showActionToast,
      updatePost,
      applyLocalActionOnSuccess,
      setPending,
    ],
  );

  const boostOnPost = useCallback(
    async (postId: string, amount = 5) => {
      const key = `boost:${postId}`;
      if (pendingActions[key]) return;

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (canSignActions && (viewer.crcBalance ?? 0) < amount) {
        showActionToast("Insufficient CRC for boost", "info");
        return;
      }

      if (!canSignActions) {
        showActionToast("Connect your wallet to boost on Gnosis", "info");
        return;
      }

      setPending(key, true);
      try {
        const adapter = getCirclesAdapter();
        const result = await adapter.boostPost({
          from: viewer.address,
          postId,
          amount,
          authorAddress: post.authorAddress,
        });

        const { message, type } = toastFromResult(result);
        showActionToast(message, type);

        if (applyLocalActionOnSuccess(result)) {
          updatePost(postId, { amountBoosted: post.amountBoosted + amount });
        }
      } finally {
        setPending(key, false);
      }
    },
    [
      posts,
      viewer,
      pendingActions,
      canSignActions,
      showActionToast,
      updatePost,
      applyLocalActionOnSuccess,
      setPending,
    ],
  );

  const trustAuthor = useCallback(
    async (address: string) => {
      const key = `trust:${address}`;
      if (pendingActions[key] || viewerTrusts.includes(address)) return;

      if (!canSignActions) {
        showActionToast("Connect your wallet to trust on Circles", "info");
        return;
      }

      setPending(key, true);
      try {
        const adapter = getCirclesAdapter();
        const result = await adapter.trustUser({
          from: viewer.address,
          target: address,
        });

        const { message, type } = toastFromResult(result);
        showActionToast(message, type);

        if (applyLocalActionOnSuccess(result)) {
          setViewerTrusts((prev) => [...prev, address]);
          setTrustEdges((prev) => [
            ...prev,
            { from: viewer.address, to: address },
          ]);
        }
      } finally {
        setPending(key, false);
      }
    },
    [
      viewer.address,
      viewerTrusts,
      pendingActions,
      canSignActions,
      showActionToast,
      applyLocalActionOnSuccess,
      setPending,
    ],
  );

  const createPost = useCallback(
    (input: CreatePostInput): Post => {
      const post: Post = {
        id: `post-${crypto.randomUUID().slice(0, 8)}`,
        authorAddress: viewer.address,
        communityId: input.communityId,
        type: input.type,
        title: input.title.trim(),
        body: input.body.trim(),
        createdAt: new Date().toISOString(),
        amountRequested: input.amountRequested,
        amountBoosted: 0,
        tipCount: 0,
        tags: input.tags,
      };
      setPosts((prev) => [post, ...prev]);
      showActionToast("Post published to your communities");
      return post;
    },
    [viewer.address, showActionToast],
  );

  const resetDemoState = useCallback(() => {
    setPosts([...SEED_POSTS]);
    setTrustEdges([...MOCK_TRUST_EDGES]);
    setViewerTrusts([...VIEWER_TRUSTS]);
    setCommunityFilter(null);
    setFocusedPostId(null);
    setPendingActions({});
    setToasts([]);
    setIntuitionMockMode(true);
    resetDemoTour();
    showActionToast("Demo state reset", "info");
  }, [showActionToast]);

  const value: TrustbookContextValue = {
    viewer,
    users,
    posts,
    trustEdges,
    viewerTrusts,
    rankedFeed,
    integrationMode: TRUSTBOOK_MODE,
    canSignActions,
    getRankedForTab,
    getUser,
    getPostsByAuthor,
    getPostsByCommunity,
    tipOnPost,
    boostOnPost,
    trustAuthor,
    createPost,
    updatePost,
    isActionPending,
    toasts,
    showActionToast,
    dismissToast: (id) =>
      setToasts((prev) => prev.filter((t) => t.id !== id)),
    focusedPostId,
    setFocusedPostId,
    communityFilter,
    setCommunityFilter,
    resetDemoState,
  };

  return (
    <TrustbookContext.Provider value={value}>
      {children}
    </TrustbookContext.Provider>
  );
}

export function useTrustbook() {
  const ctx = useContext(TrustbookContext);
  if (!ctx) throw new Error("useTrustbook must be used within TrustbookProvider");
  return ctx;
}
