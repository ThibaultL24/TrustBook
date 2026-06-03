// src/lib/circles/chains.ts

import { gnosis } from "viem/chains";

export const CIRCLES_CHAIN = gnosis;
export const CIRCLES_CHAIN_ID = gnosis.id;

export const DEFAULT_CIRCLES_RPC_URL = "https://rpc.gnosischain.com";

export function getCirclesRpcUrl(): string {
  return process.env.NEXT_PUBLIC_CIRCLES_RPC_URL || DEFAULT_CIRCLES_RPC_URL;
}
