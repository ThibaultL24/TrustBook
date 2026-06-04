// src/lib/circles/format.ts

export function shortenAddress(address: string, chars = 4): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-chars)}`;
}

const WEI_PER_CRC = BigInt("1000000000000000000");

/** Parses Circles RPC balance strings (human CRC or wei). */
export function formatCrcBalance(raw?: string | bigint): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;

  if (typeof raw === "bigint") {
    const whole = raw / WEI_PER_CRC;
    const frac =
      Number(((raw % WEI_PER_CRC) * BigInt(100)) / WEI_PER_CRC) / 100;
    return Number(whole) + frac;
  }

  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (/^\d+$/.test(trimmed)) {
    try {
      return formatCrcBalance(BigInt(trimmed));
    } catch {
      return undefined;
    }
  }

  const value = Number(trimmed);
  if (Number.isNaN(value)) return undefined;
  if (value > 1_000_000) return Math.round((value / 1e18) * 100) / 100;
  return Math.round(value * 100) / 100;
}
