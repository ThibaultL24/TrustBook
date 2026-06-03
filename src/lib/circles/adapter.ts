// src/lib/circles/adapter.ts
// Routes mock | miniapp | readonly. TODO: swap mock payment/trust for host.requestPayment/requestTrust.

import {
  isMiniAppMode,
  isMockMode,
  isReadonlyMode,
  isWalletMode,
  type TrustbookMode,
} from "@/lib/config/runtime";
import { createWalletCirclesAdapter } from "./wallet-adapter";
import { getCirclesSession } from "./circles-session";
import type {
  CirclesActionFailureReason,
  CirclesActionResult,
  CirclesAdapter,
  SharePostInput,
  TrustbookProfile,
  TrustRelation,
} from "./adapter-types";
import { getMiniAppHost, hasMiniAppHost, type MiniAppHost, type MiniAppUser } from "./host";
import {
  fetchCirclesProfile,
  fetchCommonTrust,
  fetchTrustRelations,
} from "./public-api";
import { makeBoostReference, makeTipReference } from "./references";
import {
  getAppOrigin,
  makeFeedCommunityLink,
  makeFeedPostLink,
  makeProfileLink,
} from "./links";
import { VIEWER_ADDRESS } from "@/lib/mock/addresses";
import { getMockUser, VIEWER_PROFILE } from "@/lib/mock/users";
import {
  getCommonTrustCount,
  MOCK_TRUST_EDGES,
} from "@/lib/mock/trust-edges";

function success(
  mode: TrustbookMode,
  message: string,
  extra?: { txHash?: string; reference?: string },
): CirclesActionResult {
  return { ok: true, mode, message, ...extra };
}

function failure(
  mode: TrustbookMode,
  reason: CirclesActionFailureReason,
  message: string,
): CirclesActionResult {
  return { ok: false, mode, reason, message };
}

function profileFromMock(address: string): TrustbookProfile | null {
  const mock = getMockUser(address);
  if (!mock) return { address };
  return {
    address: mock.address,
    displayName: mock.displayName,
    avatarUrl: mock.avatarUrl,
    bio: mock.bio,
    crcBalance: mock.crcBalance,
  };
}

function mockTrustRelations(address: string): TrustRelation[] {
  const outgoing = MOCK_TRUST_EDGES.filter((e) => e.from === address).map(
    (e) => ({ address: e.to, direction: "outgoing" as const }),
  );
  const incoming = MOCK_TRUST_EDGES.filter((e) => e.to === address).map(
    (e) => ({ address: e.from, direction: "incoming" as const }),
  );
  return [...outgoing, ...incoming];
}

async function shareViaHostOrFallback(
  mode: TrustbookMode,
  input: SharePostInput,
): Promise<CirclesActionResult> {
  const url = input.postId
    ? makeFeedPostLink(input.postId)
    : input.communityId
      ? makeFeedCommunityLink(input.communityId)
      : input.profileAddress
        ? makeProfileLink(input.profileAddress)
        : `${getAppOrigin()}/feed`;

  const payload = {
    title: input.title ?? "Trustbook",
    text: input.text,
    url,
  };

  const host = getMiniAppHost();
  if (host?.share) {
    try {
      await host.share(payload);
      return success(mode, "Shared via Circles host");
    } catch {
      return failure(mode, "user_rejected", "Share cancelled");
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return success(mode, "Shared");
    } catch {
      return failure(mode, "user_rejected", "Share cancelled");
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return success(mode, "Link copied to clipboard");
  }

  return success(mode, url);
}

function createMockAdapter(): CirclesAdapter {
  const mode: TrustbookMode = "mock";

  return {
    mode,
    async getCurrentUser() {
      return {
        address: VIEWER_PROFILE.address,
        displayName: VIEWER_PROFILE.displayName,
        avatarUrl: VIEWER_PROFILE.avatarUrl,
      };
    },
    async getProfile(address) {
      return profileFromMock(address);
    },
    async getTrustRelations(address) {
      return mockTrustRelations(address);
    },
    async getCommonTrust(viewerAddress, targetAddress) {
      return { count: getCommonTrustCount(viewerAddress, targetAddress) };
    },
    async tipPost(input) {
      const reference = makeTipReference(input.postId);
      console.info("[Trustbook mock] tip", { ...input, reference });
      return success(mode, `Tipped ${input.amount} CRC (mock)`, { reference });
    },
    async boostPost(input) {
      const reference = makeBoostReference(input.postId);
      console.info("[Trustbook mock] boost", { ...input, reference });
      return success(mode, `Boosted ${input.amount} CRC (mock)`, { reference });
    },
    async trustUser(input) {
      console.info("[Trustbook mock] trust", input);
      return success(mode, "Trust recorded (mock)");
    },
    async sharePost(input) {
      return shareViaHostOrFallback(mode, input);
    },
  };
}

function createReadonlyAdapter(): CirclesAdapter {
  const mode: TrustbookMode = "readonly";

  return {
    mode,
    async getCurrentUser() {
      return fetchCirclesProfile(VIEWER_ADDRESS).then((p) =>
        p
          ? {
              address: p.address,
              displayName: p.displayName,
              avatarUrl: p.avatarUrl,
            }
          : null,
      );
    },
    async getProfile(address) {
      return fetchCirclesProfile(address);
    },
    async getTrustRelations(address) {
      return fetchTrustRelations(address);
    },
    async getCommonTrust(viewerAddress, targetAddress) {
      return fetchCommonTrust(viewerAddress, targetAddress);
    },
    async tipPost() {
      return failure(
        mode,
        "readonly",
        "Tipping is disabled in readonly mode. Set NEXT_PUBLIC_TRUSTBOOK_MODE=miniapp inside Circles Garage.",
      );
    },
    async boostPost() {
      return failure(
        mode,
        "readonly",
        "Boosting is disabled in readonly mode.",
      );
    },
    async trustUser() {
      return failure(
        mode,
        "readonly",
        "Trust actions are disabled in readonly mode.",
      );
    },
    async sharePost(input) {
      return shareViaHostOrFallback(mode, input);
    },
  };
}

function mapHostError(mode: TrustbookMode, err: unknown): CirclesActionResult {
  const message =
    err instanceof Error ? err.message : "Transaction failed";
  if (/reject|cancel|denied/i.test(message)) {
    return failure(mode, "user_rejected", "Action cancelled");
  }
  if (/network|fetch|timeout/i.test(message)) {
    return failure(mode, "network_error", message);
  }
  return failure(mode, "unknown", message);
}

function createMiniAppAdapter(host: MiniAppHost | null): CirclesAdapter {
  const mode: TrustbookMode = "miniapp";
  const mockFallback = createMockAdapter();

  async function resolveUser(): Promise<MiniAppUser | null> {
    if (host?.getCurrentUser) {
      try {
        const user = await host.getCurrentUser();
        if (user?.address) return user;
      } catch {
        /* fall through */
      }
    }
    return mockFallback.getCurrentUser();
  }

  return {
    mode,
    getCurrentUser: resolveUser,
    async getProfile(address) {
      if (host?.getCurrentUser) {
        const profile = await fetchCirclesProfile(address);
        if (profile) return profile;
      }
      return mockFallback.getProfile(address);
    },
    async getTrustRelations(address) {
      try {
        return await fetchTrustRelations(address);
      } catch {
        return mockFallback.getTrustRelations(address);
      }
    },
    async getCommonTrust(viewerAddress, targetAddress) {
      try {
        return await fetchCommonTrust(viewerAddress, targetAddress);
      } catch {
        return mockFallback.getCommonTrust(viewerAddress, targetAddress);
      }
    },
    async tipPost(input) {
      const reference = makeTipReference(input.postId);
      if (!host?.requestPayment) {
        if (!hasMiniAppHost()) {
          return failure(
            mode,
            "host_unavailable",
            "Circles host not found — open Trustbook inside Circles Garage, or use mock mode.",
          );
        }
        return mockFallback.tipPost(input);
      }
      try {
        const tx = await host.requestPayment({
          to: input.to,
          amount: input.amount,
          data: reference,
          note: `Trustbook tip · post ${input.postId}`,
        });
        return success(mode, `Tipped ${input.amount} CRC`, {
          txHash: tx.txHash,
          reference,
        });
      } catch (err) {
        return mapHostError(mode, err);
      }
    },
    async boostPost(input) {
      const reference = makeBoostReference(input.postId);
      if (!host?.requestPayment) {
        if (!hasMiniAppHost()) {
          return failure(
            mode,
            "host_unavailable",
            "Circles host not found for boost — embed in mini-app or use mock mode.",
          );
        }
        return mockFallback.boostPost(input);
      }
      try {
        const tx = await host.requestPayment({
          to: input.authorAddress,
          amount: input.amount,
          data: reference,
          note: `Trustbook boost · post ${input.postId}`,
        });
        return success(mode, `Boosted ${input.amount} CRC`, {
          txHash: tx.txHash,
          reference,
        });
      } catch (err) {
        return mapHostError(mode, err);
      }
    },
    async trustUser(input) {
      if (!host?.requestTrust) {
        if (!hasMiniAppHost()) {
          return failure(
            mode,
            "host_unavailable",
            "Circles host trust API unavailable.",
          );
        }
        return mockFallback.trustUser(input);
      }
      try {
        const tx = await host.requestTrust({ target: input.target });
        return success(mode, "Trust submitted to Circles host", {
          txHash: tx.txHash,
        });
      } catch (err) {
        return mapHostError(mode, err);
      }
    },
    async sharePost(input) {
      return shareViaHostOrFallback(mode, input);
    },
  };
}

let adapterInstance: CirclesAdapter | null = null;

export function getCirclesAdapter(): CirclesAdapter {
  if (adapterInstance) return adapterInstance;

  if (getCirclesSession()) {
    adapterInstance = createWalletCirclesAdapter();
    return adapterInstance;
  }

  if (hasMiniAppHost()) {
    adapterInstance = createMiniAppAdapter(getMiniAppHost());
    return adapterInstance;
  }

  if (isMockMode) {
    adapterInstance = createMockAdapter();
  } else if (isReadonlyMode) {
    adapterInstance = createReadonlyAdapter();
  } else if (isMiniAppMode) {
    adapterInstance = createMiniAppAdapter(getMiniAppHost());
  } else if (isWalletMode) {
    adapterInstance = createWalletCirclesAdapter();
  } else {
    adapterInstance = createMockAdapter();
  }

  return adapterInstance;
}

/** Reset adapter (e.g. after host injection in tests). */
export function resetCirclesAdapter(): void {
  adapterInstance = null;
}

export function setCirclesAdapter(adapter: CirclesAdapter): void {
  adapterInstance = adapter;
}
