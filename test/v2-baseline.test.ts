import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { defaultTheme } from "../src/theme.ts";
// @ts-ignore: a plain .mjs helper shared with scripts/review.mjs
import { fingerprint } from "../scripts/lib/v2-fingerprint.mjs";

// Layout v2 is frozen once its review is approved (node scripts/review.mjs --approve): every
// approved diagram must lay out exactly as it did then. To change v2 on purpose, review the
// changes on the review page and approve again.
const BASELINE = "validation/layout-baseline.json";

test("layout v2 matches its approved baseline", { skip: !existsSync(BASELINE) && "no approved v2 baseline yet" }, () => {
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  assert.deepEqual(defaultTheme.forces, baseline.settings.forces, "a v2 setting changed: approve again after review");
  const moved: string[] = [];
  for (const [id, expected] of Object.entries(baseline.items as Record<string, string>)) {
    const file = baseline.files[id];
    if (!existsSync(file)) continue;
    if (fingerprint(readFileSync(file, "utf8").trim()) !== expected) moved.push(id);
  }
  assert.equal(moved.length, 0, `${moved.length} v2 layouts moved since the approved baseline:\n  ${moved.slice(0, 20).join("\n  ")}`);
});
