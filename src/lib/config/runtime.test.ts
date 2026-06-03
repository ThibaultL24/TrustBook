// src/lib/config/runtime.test.ts

import { describe, expect, it, vi, afterEach } from "vitest";

describe("runtime mode parsing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to mock when env unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_MODE", "");
    const mod = await import("./runtime");
    expect(mod.TRUSTBOOK_MODE).toBe("mock");
    expect(mod.isMockMode).toBe(true);
  });

  it("accepts readonly", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_MODE", "readonly");
    const mod = await import("./runtime");
    expect(mod.TRUSTBOOK_MODE).toBe("readonly");
    expect(mod.isReadonlyMode).toBe(true);
  });

  it("accepts wallet", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_MODE", "wallet");
    const mod = await import("./runtime");
    expect(mod.TRUSTBOOK_MODE).toBe("wallet");
    expect(mod.isWalletMode).toBe(true);
  });

  it("falls back on invalid value", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_MODE", "invalid");
    const mod = await import("./runtime");
    expect(mod.TRUSTBOOK_MODE).toBe("mock");
  });

  it("parses judging mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_JUDGING_MODE", "true");
    const mod = await import("./runtime");
    expect(mod.isJudgingMode).toBe(true);
  });

  it("judging mode defaults false", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRUSTBOOK_JUDGING_MODE", "");
    const mod = await import("./runtime");
    expect(mod.isJudgingMode).toBe(false);
  });
});
