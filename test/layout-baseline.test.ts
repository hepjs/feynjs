import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { defaultTheme } from "../src/theme.ts";
// @ts-ignore: a plain .mjs helper shared with scripts/approve-layouts.mjs
import { layoutPoints } from "../scripts/lib/layout-points.mjs";

// Every approved layout (the validation set and the examples) must stay where it was approved.
// Points are compared within a small tolerance, a twentieth of a line length: the solver is
// iterative, and different processors round the last bits of its arithmetic differently, which
// moves points by far less than that; a real change to the layout moves them by far more. To
// change the layout on purpose, look at what moved and approve again:
//   npm run build && npm run approve-layouts
const BASELINE = "validation/layout-baseline.json";
const TOLERANCE = 0.05;

test("every approved layout is where it was approved", { skip: !existsSync(BASELINE) && "no approved layouts yet" }, () => {
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  assert.deepEqual(defaultTheme.forces, baseline.settings.forces, "a layout setting changed: approve again after looking at what moved");
  const moved: string[] = [];
  for (const [id, expected] of Object.entries(baseline.items as Record<string, Record<string, [number, number]>>)) {
    const file = baseline.files[id];
    if (!existsSync(file)) continue;
    const now = layoutPoints(readFileSync(file, "utf8").trim());
    const keys = Object.keys(expected);
    const far = keys.length !== Object.keys(now).length ? Infinity
      : Math.max(0, ...keys.map((k) => (now[k] ? Math.hypot(now[k][0] - expected[k][0], now[k][1] - expected[k][1]) : Infinity)));
    if (far > TOLERANCE) moved.push(`${id} (by ${far === Infinity ? "a change of points" : far.toFixed(2)})`);
  }
  assert.equal(moved.length, 0, `${moved.length} layouts moved since they were approved:\n  ${moved.slice(0, 20).join("\n  ")}`);
});
