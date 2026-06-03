#!/usr/bin/env node
/**
 * Smoke test Circles SDK reads (no private key).
 *   npm run test:circles
 */
import { Sdk } from "@aboutcircles/sdk";

const SAMPLE_AVATAR = "0xde374ece6fa50e781e81aac78e811b33d16912c7";
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

try {
  const rels = await sdk.data.getTrustRelations(SAMPLE_AVATAR);
  pass(`getTrustRelations (${rels.length} rows)`);
} catch (err) {
  fail("getTrustRelations", err);
}

try {
  const view = await sdk.rpc.sdk.getProfileView(SAMPLE_AVATAR);
  pass(`getProfileView (${view.profile?.name ?? "avatar"})`);
} catch (err) {
  fail("getProfileView", err);
}

try {
  const common = await sdk.rpc.trust.getCommonTrust(
    SAMPLE_AVATAR,
    SAMPLE_AVATAR,
  );
  pass(`getCommonTrust (${common.length})`);
} catch (err) {
  fail("getCommonTrust", err);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
