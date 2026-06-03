// src/lib/circles/session-sign-in.ts

const STORAGE_KEY = "trustbook-circles-signin";

interface StoredSignIn {
  address: string;
  at: number;
}

function normalize(addr: string): string {
  return addr.trim().toLowerCase();
}

export function readSessionSignIn(address: string | null): boolean {
  if (!address || typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as StoredSignIn;
    return normalize(parsed.address) === normalize(address);
  } catch {
    return false;
  }
}

export function writeSessionSignIn(address: string): void {
  if (typeof sessionStorage === "undefined") return;
  const payload: StoredSignIn = {
    address: normalize(address),
    at: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSessionSignIn(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
