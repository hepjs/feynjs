import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { defaultTheme } from "../src/theme.ts";
import { measure } from "../src/index.ts";
// @ts-ignore: a plain .mjs helper shared with scripts/approve-layouts.mjs
import { layoutPoints } from "../scripts/lib/layout-points.mjs";

// Diagrams the author looked at, side by side with other layouts, and judged right. A change to
// the layout may move them a little (less than 0.15 of a line once lined up with how they were
// approved, the most a reader would call a minor shift), but never more, and never into a new
// problem (a crossing, crowding, a stub, a crowded label). Unlike the approved layouts, which
// catch any movement, these catch a change that spoils a diagram someone checked by eye.
const GOLDEN = JSON.parse(readFileSync("validation/golden-layouts.json", "utf8")) as {
  items: Record<string, { source: string; points: Record<string, [number, number]>; problems: number }>;
};
const MINOR = 0.15;
const ROW = defaultTheme.unitY / defaultTheme.unitX;

/** The largest move of any point, in line lengths, after lining each panel up (shifted and scaled alike) with how it was approved. */
function shiftFrom(approved: Record<string, [number, number]>, now: Record<string, [number, number]>): number {
  const keys = Object.keys(approved);
  if (keys.length !== Object.keys(now).length || keys.some((k) => !now[k])) return Infinity;
  let worst = 0;
  for (const panel of new Set(keys.map((k) => k.split(":")[0]))) {
    const ks = keys.filter((k) => k.startsWith(`${panel}:`));
    const A = ks.map((k) => [approved[k][0], approved[k][1] * ROW]), B = ks.map((k) => [now[k][0], now[k][1] * ROW]);
    const mean = (P: number[][], i: number) => P.reduce((s, p) => s + p[i], 0) / P.length;
    const [ax, ay, bx, by] = [mean(A, 0), mean(A, 1), mean(B, 0), mean(B, 1)];
    let num = 0, den = 0;
    B.forEach((p, i) => { const x = p[0] - bx, y = p[1] - by; num += x * (A[i][0] - ax) + y * (A[i][1] - ay); den += x * x + y * y; });
    const scale = den > 1e-12 ? num / den : 1;
    B.forEach((p, i) => { worst = Math.max(worst, Math.hypot(ax + scale * (p[0] - bx) - A[i][0], ay + scale * (p[1] - by) - A[i][1])); });
  }
  return worst;
}

test("the diagrams checked by eye keep their shape and gain no problem", () => {
  const spoiled: string[] = [];
  for (const [id, { source, points, problems }] of Object.entries(GOLDEN.items)) {
    const shift = shiftFrom(points, layoutPoints(source));
    const q = measure(source), now = q.crossings + q.crowdedVertices + q.stubs + q.crowdedLabels;
    if (shift >= MINOR) spoiled.push(`${id}: moved by ${shift === Infinity ? "a change of points" : shift.toFixed(2)} of a line`);
    if (now > problems) spoiled.push(`${id}: ${now} problems, ${problems} when approved (${q.problems.join("; ")})`);
  }
  assert.deepEqual(spoiled, []);
});

test("the gradients written out for the commonest terms are those terms' slopes", async () => {
  const { parse } = await import("../src/parse/parse.ts");
  const { readStructure } = await import("../src/engines/forces/structure.ts");
  const { allForces } = await import("../src/engines/forces/forces.ts");
  const { splitPanels } = await import("../src/render/panels.ts");
  let checked = 0, worst = 0, seed = 3;
  const next = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (const panel of Object.values(GOLDEN.items).flatMap(({ source }) => splitPanels(source))) {
    const d = parse(panel.source);
    if (!d.edges.length) continue;
    const s = readStructure(d);
    const p = new Float64Array(2 * s.ids.length).map(() => next() * 3);
    for (const f of allForces(s, defaultTheme.forces)) for (const t of f.terms) {
      if (!t.grad) continue;
      const g = new Float64Array(p.length);
      t.grad(p, g);
      for (const i of t.points) for (const k of [2 * i, 2 * i + 1]) {
        const h = 1e-6, keep = p[k];
        p[k] = keep + h; const up = t.energy(p); p[k] = keep - h; const down = t.energy(p); p[k] = keep;
        const slope = (up - down) / (2 * h);
        worst = Math.max(worst, Math.abs(slope - g[k]) / Math.max(1, Math.abs(slope)));
        checked++;
      }
    }
  }
  assert.ok(checked > 100, `only ${checked} coordinates checked`);
  assert.ok(worst < 1e-5, `a written-out gradient is off by ${worst} (relative)`);
});
