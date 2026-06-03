// src/providers/trustbook-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import {
  fetchTrustPeers,
  type TrustPeer,
} from "@/lib/circles/trust-peers";
import { resetDemoTour } from "@/components/demo/demo-tour";
import { setIntuitionMockMode } from "@/lib/intuition/adapter";
import { SEED_POSTS } from "@/lib/mock/posts";
import { SEED_COMMENTS } from "@/lib/mock/comments";
import { MOCK_TRUST_EDGES, VIEWER_TRUSTS } from "@/lib/mock/trust-edges";
import { getMockUsers, VIEWER_PROFILE } from "@/lib/mock/users";
import {
  demoAvatarForAddress,
  demoCoverForAddress,
} from "@/lib/mock/demo-media";
import { rankFeed, filterByTab } from "@/lib/ranking/feed-ranking";
import { buildSeedStories, buildStoryGroups, storyExpiresAt } from "@/lib/stories/helpers";
import type { StoryGroup } from "@/lib/stories/helpers";
import { getTrustCircleAddresses } from "@/lib/trust/trust-circle";
import {
  applyProfileMediaToUser,
  defaultCoverForAddress,
  loadAllProfileMedia,
  ProfileMediaStorageError,
  saveProfileMedia,
  type ProfileMedia,
} from "@/lib/profile/profile-media-store";
import type {
  FeedTab,
  Post,
  PostFormat,
  PostType,
  RankedPost,
  UserProfile,
  Comment,
  Story,
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
  format?: PostFormat;
  imageUrl?: string;
  mood?: string;
  isLive?: boolean;
  shareToStory?: boolean;
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
  getCommentsForPost: (postId: string) => Comment[];
  addComment: (postId: string, body: string) => void;
  stories: Story[];
  storyGroups: StoryGroup[];
  sharePostToStory: (postId: string) => void;
  markStoryGroupViewed: (authorAddress: string) => void;
  getPostById: (postId: string) => Post | undefined;
  trustPeers: TrustPeer[];
  isLoadingTrustGraph: boolean;
  trustGraphError: string | null;
  refreshTrustGraph: () => Promise<void>;
  getProfileMedia: (address: string) => ProfileMedia;
  updateProfileMedia: (address: string, patch: Partial<ProfileMedia>) => boolean;
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

function profileMediaKey(address: string): string {
  return address.trim().toLowerCase();
}

function withProfileMedia(
  profile: UserProfile,
  mediaMap: Record<string, ProfileMedia>,
): UserProfile {
  return applyProfileMediaToUser(profile, mediaMap);
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
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);
  const [stories, setStories] = useState<Story[]>(() =>
    buildSeedStories(
      SEED_POSTS,
      getTrustCircleAddresses(VIEWER_ADDRESS, MOCK_TRUST_EDGES),
    ),
  );
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());
  const [trustPeers, setTrustPeers] = useState<TrustPeer[]>([]);
  const [isLoadingTrustGraph, setIsLoadingTrustGraph] = useState(false);
  const [trustGraphError, setTrustGraphError] = useState<string | null>(null);
  const [profileMediaMap, setProfileMediaMap] = useState<
    Record<string, ProfileMedia>
  >({});

  useLayoutEffect(() => {
    setProfileMediaMap(loadAllProfileMedia());
  }, []);

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

  const isLiveViewer = Boolean(
    circlesAvatarAddress &&
      circlesAvatarAddress.toLowerCase() !== VIEWER_ADDRESS.toLowerCase(),
  );

  const refreshTrustGraph = useCallback(async () => {
    if (!circlesAvatarAddress || !isLiveViewer) {
      setTrustPeers([]);
      setTrustGraphError(null);
      return;
    }

    setIsLoadingTrustGraph(true);
    setTrustGraphError(null);
    try {
      const [syncResult, peers] = await Promise.all([
        syncTrustEdgesForViewer(circlesAvatarAddress),
        fetchTrustPeers(circlesAvatarAddress),
      ]);

      setTrustEdges((prev) => {
        if (syncResult.edges.length === 0) return prev;
        return syncResult.edges;
      });
      setViewerTrusts(syncResult.viewerTrusts);
      setTrustPeers(peers);

      if (peers.length === 0 && syncResult.edges.length === 0) {
        setTrustGraphError(
          "No trust connections found for this Circles avatar yet.",
        );
      }
    } catch (err) {
      setTrustGraphError(
        err instanceof Error ? err.message : "Could not load trust graph",
      );
    } finally {
      setIsLoadingTrustGraph(false);
    }
  }, [circlesAvatarAddress, isLiveViewer]);

  useEffect(() => {
    if (!isLiveViewer) return;
    void refreshTrustGraph();
  }, [isLiveViewer, refreshTrustGraph]);

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
    const mockUsers = getMockUsers(viewerAddress).map((u) => {
      if (u.address.toLowerCase() === viewerAddress.toLowerCase()) return u;
      return {
        ...u,
        trustedByViewer: viewerTrusts.some(
          (a) => a.toLowerCase() === u.address.toLowerCase(),
        ),
        trustsViewer: trustEdges.some(
          (e) =>
            e.from.toLowerCase() === u.address.toLowerCase() &&
            e.to.toLowerCase() === viewerAddress.toLowerCase(),
        ),
        mutualTrustCount: u.mutualTrustCount,
      };
    });

    const known = new Set(
      mockUsers.map((u) => u.address.trim().toLowerCase()),
    );

    const fromPeers: UserProfile[] = trustPeers
      .filter((p) => !known.has(p.address.toLowerCase()))
      .map((peer) => ({
        address: peer.address,
        displayName: peer.displayName ?? peer.address.slice(0, 10),
        avatarUrl:
          peer.avatarUrl ??
          demoAvatarForAddress(peer.address) ??
          `https://placekitten.com/220/220`,
        bio: "",
        groups: [],
        trustedByViewer: peer.relation === "trusts" || peer.relation === "mutual",
        trustsViewer: peer.relation === "trustedBy" || peer.relation === "mutual",
        mutualTrustCount: peer.relation === "mutual" ? 1 : 0,
      }));

    return [...mockUsers, ...fromPeers];
  }, [viewerTrusts, trustEdges, viewerAddress, trustPeers]);

  const viewer = useMemo(() => {
    const base = walletViewer
      ? walletViewer
      : (users.find((u) => u.address === viewerAddress) ?? VIEWER_PROFILE);
    return withProfileMedia(base, profileMediaMap);
  }, [users, viewerAddress, walletViewer, profileMediaMap]);

  const getProfileMedia = useCallback(
    (address: string) => profileMediaMap[profileMediaKey(address)] ?? {},
    [profileMediaMap],
  );

  const updateProfileMedia = useCallback(
    (address: string, patch: Partial<ProfileMedia>): boolean => {
      try {
        const saved = saveProfileMedia(address, patch);
        const key = profileMediaKey(address);
        setProfileMediaMap((prev) => {
          const next = { ...prev };
          if (Object.keys(saved).length === 0) delete next[key];
          else next[key] = saved;
          return next;
        });
        return true;
      } catch (err) {
        const message =
          err instanceof ProfileMediaStorageError
            ? err.message
            : "Could not save profile photos.";
        showActionToast(message, "error");
        return false;
      }
    },
    [showActionToast],
  );

  const getUser = useCallback(
    (address: string) => {
      const key = address.trim().toLowerCase();
      const live = liveProfiles[key];
      const mock = users.find(
        (u) => u.address.trim().toLowerCase() === key,
      );
      let profile: UserProfile | undefined;
      if (live) {
        profile = {
          ...live,
          trustedByViewer:
            mock?.trustedByViewer ?? live.trustedByViewer,
          trustsViewer: mock?.trustsViewer ?? live.trustsViewer,
          mutualTrustCount: mock?.mutualTrustCount ?? live.mutualTrustCount,
          groups: mock?.groups ?? live.groups,
        };
      } else if (mock) {
        profile = mock;
      } else if (
        walletViewer &&
        walletViewer.address.trim().toLowerCase() === key
      ) {
        profile = walletViewer;
      } else if (isLiveCirclesAuthor(address)) {
        profile = liveAuthorPlaceholder(address);
      }
      if (!profile) return undefined;
      return withProfileMedia(profile, profileMediaMap);
    },
    [users, liveProfiles, profileMediaMap, walletViewer],
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
      let filtered = filterByTab(rankedFeed, tab, viewerAddress, trustEdges);
      const cid = communityId ?? communityFilter;
      if (cid) filtered = filtered.filter((r) => r.post.communityId === cid);
      return filtered;
    },
    [rankedFeed, communityFilter, viewerAddress, trustEdges],
  );

  const getPostById = useCallback(
    (postId: string) => posts.find((p) => p.id === postId),
    [posts],
  );

  const storyGroups = useMemo(
    () =>
      buildStoryGroups(
        stories,
        viewerAddress,
        trustEdges,
        getUser,
        getPostById,
        viewedStoryIds,
      ),
    [stories, viewerAddress, trustEdges, getUser, getPostById, viewedStoryIds],
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
      const format = input.format ?? "standard";
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
        format,
        imageUrl: input.imageUrl,
        mood: input.mood,
        isLive: input.isLive ?? format === "live",
      };
      setPosts((prev) => [post, ...prev]);

      if (input.shareToStory) {
        const createdAt = post.createdAt;
        setStories((prev) => [
          ...prev,
          {
            id: `story-${crypto.randomUUID().slice(0, 8)}`,
            postId: post.id,
            authorAddress: viewer.address,
            createdAt,
            expiresAt: storyExpiresAt(createdAt),
          },
        ]);
      }

      showActionToast(
        input.isLive
          ? "You are live — your trust circle was notified"
          : "Post published to your communities",
      );
      return post;
    },
    [viewer.address, showActionToast],
  );

  const sharePostToStory = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.authorAddress !== viewerAddress) {
        showActionToast("You can only share your own posts to stories", "info");
        return;
      }

      const createdAt = new Date().toISOString();
      setStories((prev) => [
        ...prev.filter(
          (s) => !(s.authorAddress === viewerAddress && s.postId === postId),
        ),
        {
          id: `story-${crypto.randomUUID().slice(0, 8)}`,
          postId,
          authorAddress: viewerAddress,
          createdAt,
          expiresAt: storyExpiresAt(createdAt),
        },
      ]);
      showActionToast("Added to your story for 24h", "success");
    },
    [posts, viewerAddress, showActionToast],
  );

  const markStoryGroupViewed = useCallback(
    (authorAddress: string) => {
      const ids = stories
        .filter((s) => s.authorAddress === authorAddress)
        .map((s) => s.id);
      setViewedStoryIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });
    },
    [stories],
  );

  const resetDemoState = useCallback(() => {
    setPosts([...SEED_POSTS]);
    setTrustEdges([...MOCK_TRUST_EDGES]);
    setViewerTrusts([...VIEWER_TRUSTS]);
    setComments([...SEED_COMMENTS]);
    setStories(
      buildSeedStories(
        SEED_POSTS,
        getTrustCircleAddresses(VIEWER_ADDRESS, MOCK_TRUST_EDGES),
      ),
    );
    setViewedStoryIds(new Set());
    setTrustPeers([]);
    setTrustGraphError(null);
    setCommunityFilter(null);
    setFocusedPostId(null);
    setPendingActions({});
    setToasts([]);
    setIntuitionMockMode(true);
    resetDemoTour();
    showActionToast("Demo state reset", "info");
  }, [showActionToast]);

  const getCommentsForPost = useCallback(
    (postId: string) =>
      comments
        .filter((c) => c.postId === postId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [comments],
  );

  const addComment = useCallback(
    (postId: string, body: string) => {
      const comment: Comment = {
        id: `c-${crypto.randomUUID()}`,
        postId,
        authorAddress: viewerAddress,
        body,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, comment]);
      showActionToast("Comment posted", "success");
    },
    [viewerAddress, showActionToast],
  );

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
    getCommentsForPost,
    addComment,
    stories,
    storyGroups,
    sharePostToStory,
    markStoryGroupViewed,
    getPostById,
    trustPeers,
    isLoadingTrustGraph,
    trustGraphError,
    refreshTrustGraph,
    getProfileMedia,
    updateProfileMedia,
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
