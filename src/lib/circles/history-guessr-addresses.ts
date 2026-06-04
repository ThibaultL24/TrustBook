// src/lib/circles/history-guessr-addresses.ts
// Aligned with OpenCircles / History Guessr (see ../OpenCircles/.env.local).

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function parseAddress(
  raw: string | undefined,
  fallback: `0x${string}`,
): `0x${string}` {
  const trimmed = raw?.trim();
  if (trimmed && ADDRESS_RE.test(trimmed)) return trimmed as `0x${string}`;
  return fallback;
}

/** Circles Safe — profil Lenormand, CRC utilisable pour tips live. */
export const HIST_GUESSR_SAFE_ADDRESS = parseAddress(
  process.env.NEXT_PUBLIC_HIST_GUESSR_SAFE,
  "0xD55a912aF5639a6769AE5c1894C0c7BFB5Bf539E",
);

/** Groupe History Guessr (HIST) sur Gnosis. */
export const HIST_GROUP_ADDRESS = parseAddress(
  process.env.NEXT_PUBLIC_HIST_GROUP_ADDRESS,
  "0x5AC1C8b6c9BCB8D1a8Ef4fa5484738877EfA763E",
);

/** Gnosis Group — ancre de confiance (partagé avec History Guessr). */
export const GNOSIS_GROUP_TRUST_ANCHOR = parseAddress(
  process.env.NEXT_PUBLIC_GNOSIS_GROUP_ADDRESS,
  "0xc19bc204eb1c1d5b3fe500e5e5dfabab625f286c",
);
