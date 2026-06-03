// src/lib/status/integration-status.ts

import {
  APP_URL,
  CIRCLES_CHAIN_ID,
  CIRCLES_RPC_URL,
  INTUITION_API_URL,
  isCirclesApiConfigured,
  isIntuitionApiConfigured,
  isJudgingMode,
  isMiniAppMode,
  isMockMode,
  isReadonlyMode,
  TRUSTBOOK_MODE,
} from "@/lib/config/runtime";

export interface IntegrationStatus {
  mode: string;
  judgingMode: boolean;
  hostBridgeDetected: boolean;
  circlesApiConfigured: boolean;
  intuitionApiConfigured: boolean;
  appUrlConfigured: boolean;
  appUrl: string;
  circlesChainId: string;
  circlesRpcUrl: string;
  intuitionApiUrl: string;
  version: string;
}

export function getIntegrationStatus(
  hostBridgeDetected = false,
): IntegrationStatus {
  return {
    mode: TRUSTBOOK_MODE,
    judgingMode: isJudgingMode,
    hostBridgeDetected,
    circlesApiConfigured: isCirclesApiConfigured,
    intuitionApiConfigured: isIntuitionApiConfigured,
    appUrlConfigured: APP_URL !== "http://localhost:3000",
    appUrl: APP_URL,
    circlesChainId: CIRCLES_CHAIN_ID,
    circlesRpcUrl: CIRCLES_RPC_URL,
    intuitionApiUrl: INTUITION_API_URL,
    version: process.env.npm_package_version ?? "0.1.0",
  };
}

export const PRODUCTION_TODOS = [
  "Map host bridge to official Circles/Gnosis SDK (@aboutcircles/sdk, CirclesMiniapps repo)",
  "Replace Circles public API placeholders (circles_searchProfiles RPC / indexer)",
  "Replace Intuition placeholders with real atoms/triples/claims integration",
  "Index on-chain Trustbook references (trustbook:tip:{postId}, trustbook:boost:{postId})",
  "Replace demo trust paths with real Circles routing/indexer logic",
  "Optionally publish Trustbook recommendation claims to Intuition",
  "Submit hosted mini-app listing per miniapps.aboutcircles.com/developers",
] as const;

export function getModeLabel(): string {
  if (isMockMode) return "Mock";
  if (isMiniAppMode) return "Mini App";
  if (isReadonlyMode) return "Readonly";
  return TRUSTBOOK_MODE;
}
