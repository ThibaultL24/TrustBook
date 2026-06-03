// src/lib/circles/format.ts

export function shortenAddress(address: string, chars = 4): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-chars)}`;
}

export function formatCrcBalance(raw?: string): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw);
  if (Number.isNaN(value)) return undefined;
  if (value > 1_000_000) return Math.round((value / 1e18) * 100) / 100;
  return Math.round(value * 100) / 100;
}
