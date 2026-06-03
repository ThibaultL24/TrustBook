// src/lib/circles/wallet-adapter.ts

import { CirclesConverter } from "@aboutcircles/sdk-utils";
import type { Address } from "viem";
import type { TrustbookMode } from "@/lib/config/runtime";
import type {
  CirclesActionFailureReason,
  CirclesActionResult,
  CirclesAdapter,
  SharePostInput,
  TrustRelation,
} from "./adapter-types";
import { getCirclesSession } from "./circles-session";
import { fetchCirclesProfileFromSdk } from "./profile";
import {
  getReadOnlySdk,
  isCirclesAvatarRegistered,
  referenceToTxData,
} from "./sdk-client";
import { makeBoostReference, makeTipReference } from "./references";
import {
  getAppOrigin,
  makeFeedCommunityLink,
  makeFeedPostLink,
  makeProfileLink,
} from "./links";
import { getMiniAppHost } from "./host";

function success(
  message: string,
  extra?: { txHash?: string; reference?: string },
): CirclesActionResult {
  return { ok: true, mode: "wallet", message, ...extra };
}

function failure(
  reason: CirclesActionFailureReason,
  message: string,
): CirclesActionResult {
  return { ok: false, mode: "wallet", reason, message };
}

function mapWalletError(err: unknown): CirclesActionResult {
  const message =
    err instanceof Error ? err.message : "Transaction failed";
  if (/reject|cancel|denied/i.test(message)) {
    return failure("user_rejected", "Transaction cancelled");
  }
  if (/not found|avatarnotfound|not registered/i.test(message)) {
    return failure("not_registered", message);
  }
  if (/network|fetch|timeout/i.test(message)) {
    return failure("network_error", message);
  }
  return failure("unknown", message);
}

async function profileFromAvatar(address: Address) {
  try {
    return await fetchCirclesProfileFromSdk(address);
  } catch {
    return { address };
  }
}

async function shareViaHostOrFallback(
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
      return success("Shared via Circles host");
    } catch {
      return failure("user_rejected", "Share cancelled");
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return success("Shared");
    } catch {
      return failure("user_rejected", "Share cancelled");
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return success("Link copied to clipboard");
  }

  return success(url);
}

export function createWalletCirclesAdapter(): CirclesAdapter {
  const mode: TrustbookMode = "wallet";

  async function requireSession() {
    const session = getCirclesSession();
    if (!session) {
      throw new Error("Connect your wallet on Gnosis Chain");
    }
    return session;
  }

  async function requireSenderAvatar() {
    const { sdk, avatarAddress } = await requireSession();
    return sdk.getAvatar(avatarAddress);
  }

  return {
    mode,
    async getCurrentUser() {
      const session = getCirclesSession();
      if (!session) return null;
      const profile = await profileFromAvatar(session.avatarAddress);
      return {
        address: profile.address,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      };
    },
    async getProfile(address) {
      return profileFromAvatar(address as Address);
    },
    async getTrustRelations(address) {
      const sdk = getReadOnlySdk();
      const [trusts, trustedBy] = await Promise.all([
        sdk.rpc.trust.getTrusts(address as Address),
        sdk.rpc.trust.getTrustedBy(address as Address),
      ]);
      const outgoing: TrustRelation[] = trusts.map((t) => ({
        address: t.objectAvatar,
        direction: "outgoing",
      }));
      const incoming: TrustRelation[] = trustedBy.map((t) => ({
        address: t.subjectAvatar,
        direction: "incoming",
      }));
      return [...outgoing, ...incoming];
    },
    async getCommonTrust(viewerAddress, targetAddress) {
      const sdk = getReadOnlySdk();
      const common = await sdk.rpc.trust.getCommonTrust(
        viewerAddress as Address,
        targetAddress as Address,
      );
      return { count: common.length };
    },
    async tipPost(input) {
      try {
        const registered = await isCirclesAvatarRegistered(
          input.to as Address,
        );
        if (!registered) {
          return failure(
            "invalid_recipient",
            "This author is not on Circles (demo posts use mock addresses). Open a real Circles profile to tip.",
          );
        }

        const avatar = await requireSenderAvatar();
        const reference = makeTipReference(input.postId);
        const amount = CirclesConverter.circlesToAttoCircles(input.amount);
        const receipt = await avatar.transfer.advanced(
          input.to as Address,
          amount,
          { txData: referenceToTxData(reference) },
        );

        return success(`Tipped ${input.amount} CRC on Gnosis`, {
          txHash: receipt.transactionHash,
          reference,
        });
      } catch (err) {
        return mapWalletError(err);
      }
    },
    async boostPost(input) {
      try {
        const registered = await isCirclesAvatarRegistered(
          input.authorAddress as Address,
        );
        if (!registered) {
          return failure(
            "invalid_recipient",
            "This author is not on Circles. Boost works with real Circles avatars only.",
          );
        }

        const avatar = await requireSenderAvatar();
        const reference = makeBoostReference(input.postId);
        const amount = CirclesConverter.circlesToAttoCircles(input.amount);
        const receipt = await avatar.transfer.advanced(
          input.authorAddress as Address,
          amount,
          { txData: referenceToTxData(reference) },
        );

        return success(`Boosted ${input.amount} CRC on Gnosis`, {
          txHash: receipt.transactionHash,
          reference,
        });
      } catch (err) {
        return mapWalletError(err);
      }
    },
    async trustUser(input) {
      try {
        const registered = await isCirclesAvatarRegistered(
          input.target as Address,
        );
        if (!registered) {
          return failure(
            "invalid_recipient",
            "Target is not registered on Circles.",
          );
        }

        const avatar = await requireSenderAvatar();
        const receipt = await avatar.trust.add(input.target as Address);
        return success("Trust submitted on Gnosis", {
          txHash: receipt.transactionHash,
        });
      } catch (err) {
        return mapWalletError(err);
      }
    },
    async sharePost(input) {
      return shareViaHostOrFallback(input);
    },
  };
}
