// src/lib/mock/demo-time.ts
// Fixed anchor so SSR and client hydration match (no Date.now() at import).

export const DEMO_REFERENCE_TIME = Date.parse("2026-05-29T12:00:00.000Z");

export function demoDaysAgo(days: number): string {
  return new Date(
    DEMO_REFERENCE_TIME - days * 24 * 60 * 60 * 1000,
  ).toISOString();
}
