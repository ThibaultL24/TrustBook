#!/usr/bin/env node
/**
 * Smoke test Circles SDK reads (no private key).
 *   npm run test:circles
 */
import { Sdk } from "@aboutcircles/sdk";

const SAMPLE_AVATAR = "0xde374ece6fa50e781e81aac78e811b33d16912c7";
/** History Guessr / OpenCircles — Lenormand Safe (CRC on Gnosis) */
const HIST_GUESSR_SAFE = "0xD55a912aF5639a6769AE5c1894C0c7BFB5Bf539E";
const AVATARS = [SAMPLE_AVATAR, HIST_GUESSR_SAFE];
const checks = [];

function pass(label) {
  checks.push({ label, ok: true });
  console.log(`✅ ${label}`);
}

function fail(label, err) {
  checks.push({ label, ok: false });
  console.error(`❌ ${label}:`, err instanceof Error ? err.message : err);
}

const sdk = new Sdk();

for (const avatar of AVATARS) {
  try {
    const rels = await sdk.data.getTrustRelations(avatar);
    pass(`getTrustRelations ${avatar.slice(0, 8)}… (${rels.length} rows)`);
  } catch (err) {
    fail(`getTrustRelations ${avatar.slice(0, 8)}…`, err);
  }

  try {
    const view = await sdk.rpc.sdk.getProfileView(avatar);
    const bal = view.v2Balance ?? view.v1Balance ?? "—";
    pass(`getProfileView ${view.profile?.name ?? avatar.slice(0, 8)} (CRC ${bal})`);
  } catch (err) {
    fail(`getProfileView ${avatar.slice(0, 8)}…`, err);
  }
}

try {
  const common = await sdk.rpc.trust.getCommonTrust(
    SAMPLE_AVATAR,
    HIST_GUESSR_SAFE,
  );
  pass(`getCommonTrust sample↔lenormand (${common.length})`);
} catch (err) {
  fail("getCommonTrust sample↔lenormand", err);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
