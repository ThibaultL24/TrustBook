// src/lib/circles/sdk-client.ts

import { Sdk } from "@aboutcircles/sdk";
import { Invitations } from "@aboutcircles/sdk-invitations";
import { SafeBrowserRunner, chains } from "@aboutcircles/sdk-runner";
import { createPublicClient, http, type Address } from "viem";
import type { Eip1193Provider } from "@safe-global/protocol-kit";
import { CIRCLES_CHAIN, getCirclesRpcUrl } from "./chains";
import type { CirclesSession } from "./circles-session";
import { getCirclesSession, setCirclesSession } from "./circles-session";

let readOnlySdk: Sdk | null = null;

export function getReadOnlySdk(): Sdk {
  if (!readOnlySdk) readOnlySdk = new Sdk();
  return readOnlySdk;
}

export function computeCirclesAvatarAddress(signer: Address): Address {
  const invitations = new Invitations(getReadOnlySdk().circlesConfig);
  return invitations.computeAddress(signer) as Address;
}

export async function isCirclesAvatarRegistered(
  address: Address,
): Promise<boolean> {
  try {
    await getReadOnlySdk().rpc.avatar.getAvatarInfo(address);
    return true;
  } catch {
    return false;
  }
}

function createPublicClientForCircles() {
  return createPublicClient({
    chain: CIRCLES_CHAIN,
    transport: http(getCirclesRpcUrl()),
  });
}

export async function initCirclesSession(
  eoaAddress: Address,
  eip1193: Eip1193Provider,
): Promise<CirclesSession> {
  const avatarAddress = computeCirclesAvatarAddress(eoaAddress);
  const publicClient = createPublicClientForCircles();
  const runner = await SafeBrowserRunner.create(
    getCirclesRpcUrl(),
    eip1193,
    avatarAddress,
    chains.gnosis,
  );
  await runner.init(avatarAddress);

  const sdk = new Sdk(undefined, runner);
  await sdk.getAvatar(avatarAddress);

  const session: CirclesSession = {
    eoaAddress,
    avatarAddress,
    runner,
    sdk,
  };
  setCirclesSession(session);
  return session;
}

export function clearCirclesSession(): void {
  setCirclesSession(null);
}

export function getActiveSdk(): Sdk {
  return getCirclesSession()?.sdk ?? getReadOnlySdk();
}

export function referenceToTxData(reference: string): Uint8Array {
  return new TextEncoder().encode(reference);
}
