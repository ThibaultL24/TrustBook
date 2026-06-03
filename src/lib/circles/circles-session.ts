// src/lib/circles/circles-session.ts

import type { Sdk } from "@aboutcircles/sdk";
import type { SafeBrowserRunner } from "@aboutcircles/sdk-runner";
import type { Address } from "viem";

export interface CirclesSession {
  eoaAddress: Address;
  avatarAddress: Address;
  runner: SafeBrowserRunner;
  sdk: Sdk;
}

let activeSession: CirclesSession | null = null;

export function getCirclesSession(): CirclesSession | null {
  return activeSession;
}

export function setCirclesSession(session: CirclesSession | null): void {
  activeSession = session;
}
