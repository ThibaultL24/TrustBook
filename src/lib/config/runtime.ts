// src/lib/config/runtime.ts

export type TrustbookMode = "mock" | "miniapp" | "readonly" | "wallet";

const VALID_MODES: TrustbookMode[] = [
  "mock",
  "miniapp",
  "readonly",
  "wallet",
];

function parseBool(raw: string | undefined): boolean {
  return raw === "true" || raw === "1";
}

function parseMode(raw: string | undefined): TrustbookMode {
  if (raw && VALID_MODES.includes(raw as TrustbookMode)) {
    return raw as TrustbookMode;
  }
  return "mock";
}

/** Active integration mode (default: mock). Override with NEXT_PUBLIC_TRUSTBOOK_MODE. */
export const TRUSTBOOK_MODE: TrustbookMode = parseMode(
  process.env.NEXT_PUBLIC_TRUSTBOOK_MODE,
);

export const isMockMode = TRUSTBOOK_MODE === "mock";
export const isMiniAppMode = TRUSTBOOK_MODE === "miniapp";
export const isReadonlyMode = TRUSTBOOK_MODE === "readonly";
export const isWalletMode = TRUSTBOOK_MODE === "wallet";

/** Hackathon judging UI — banner, quick links, reset demo. */
export const isJudgingMode = parseBool(
  process.env.NEXT_PUBLIC_TRUSTBOOK_JUDGING_MODE,
);

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const CIRCLES_API_URL =
  process.env.NEXT_PUBLIC_CIRCLES_API_URL ?? "";

export const CIRCLES_CHAIN_ID =
  process.env.NEXT_PUBLIC_CIRCLES_CHAIN_ID ?? "";

export const CIRCLES_RPC_URL =
  process.env.NEXT_PUBLIC_CIRCLES_RPC_URL ?? "";

export const INTUITION_API_URL =
  process.env.NEXT_PUBLIC_INTUITION_API_URL ?? "";

export const INTUITION_APP_URL =
  process.env.NEXT_PUBLIC_INTUITION_APP_URL ??
  "https://app.intuition.systems";

export const INTUITION_DOCS_URL =
  process.env.NEXT_PUBLIC_INTUITION_DOCS_URL ??
  "https://docs.intuition.systems";

export const isCirclesApiConfigured = Boolean(CIRCLES_API_URL);
export const isIntuitionApiConfigured = Boolean(INTUITION_API_URL);
