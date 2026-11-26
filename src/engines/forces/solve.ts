import type { Force, Term } from "./forces.ts";
import * as portable from "../../geometry/portable-math.ts";

/** Steps the last call to `balance` took (for tuning). */
export let lastSteps = 0;

/**
 * The solver stops once a step lowers the energy by less than this share of it. (Tighter than
 * this moves almost nothing: at 3e-6, 1.3% of diagrams move by more than a tenth of a line from
 * where 1e-6 puts them, and the solve takes 13% fewer steps.)
 */
export const settings = { tolerance: 3e-6 };

/** How far a point may move before the solver looks again at which one-sided terms are clear. */
const LOOK_AGAIN = 0.3;

/**
 * A solve with at least this many terms finds the clearance terms that can matter through a
 * grid of where things are, instead of asking every pair; below it, asking every pair is
 * cheaper than keeping the grid.
 */
const GRID_FROM = 2500;
/** How far a point may move before a solve that uses the grid looks again. */
const GRID_LOOK_AGAIN = 0.6;

/**
 * Find the positions where the forces balance. Gradient descent on the total energy, with
 * each step sized from how the gradient changed over the last one (Barzilai-Borwein), and
 * halved whenever it would overshoot. The gradient is taken term by term: from the term's own
 * formula where it has one, else by moving each point it touches a little forward (moving a
 * point only changes the terms that touch it). Pinned coordinates (manual positions) do not
 * move; tied points share one coordinate exactly.
 */
/**
 * Points held to one coordinate: one height (axis 1), or one place across the page (axis 0).
 * `start` says where the tie first puts them: their average, or the furthest out of them
 * (`max` for a column of final states, `min` for incoming ones).
 */
export interface Tie { axis: 0 | 1; points: number[]; start?: "mean" | "max" | "min" }

/**
 * A shape put back exactly after every step (as the ties are): it moves points to where a rule
 * says, a loop to a regular polygon.
 */
export type Projection = (q: Float64Array, pinned: boolean[]) => void;

export function balance(start: Float64Array, forces: Force[], pinned: boolean[], iterations = 1500, ties: Tie[] = [], project?: Projection): Float64Array {
  const terms: Term[] = forces.flatMap((f) => f.terms);
  // tied points are put back on their common coordinate after every step
  const level = (q: Float64Array, first = false) => {
    for (const { axis, points, start } of ties) {
      const values = points.map((i) => q[2 * i + axis]);
      const c = first && start === "max" ? Math.max(...values) : first && start === "min" ? Math.min(...values)
        : values.reduce((a, b) => a + b, 0) / values.length;
      for (const i of points) q[2 * i + axis] = c;
    }
  };
  const n = start.length;
  // each term's value at the last layout measured (the gradient there needs them again)
  const values = new Float64Array(terms.length);
  // a one-sided term known to be clear of its limit by more than the points have since moved
  // is zero without measuring it: how clear each was when last looked at (`seen`), and how
  // far any point has moved since
  const seen = start.slice(), clearBy = new Float64Array(terms.length).fill(-1);
  // (a large solve looks through a grid, and keeps a list of the terms that can be more than
  // zero before it looks again: every term left off is zero until then, so the sum, taken in
  // the same order, is exactly what measuring them all would give)
  const big = terms.length >= GRID_FROM, lookAgain = big ? GRID_LOOK_AGAIN : LOOK_AGAIN;
  const near = big ? clearanceGrid(terms, clearBy, lookAgain) : undefined;
  const active = new Int32Array(terms.length);
  let live = terms.length;
  for (let k = 0; k < terms.length; k++) active[k] = k;
  const look = (q: Float64Array) => {
    seen.set(q);
    if (near) near(q);
    else for (let k = 0; k < terms.length; k++) clearBy[k] = terms[k].clear?.(q) ?? -1;
    if (big) {
      live = 0;
      for (let k = 0; k < terms.length; k++) if (clearBy[k] > 2 * lookAgain) values[k] = 0; else active[live++] = k;
    }
  };
  const movedSince = (q: Float64Array) => {
    let most = 0;
    for (let i = 0; i < n; i += 2) most = Math.max(most, portable.hypot(q[i] - seen[i], q[i + 1] - seen[i + 1]));
    return most;
  };
  const total = (q: Float64Array) => {
    let moved = movedSince(q);
    if (moved > lookAgain) { look(q); moved = 0; }
    let e = 0;
    if (big) {
      for (let m = 0; m < live; m++) { const k = active[m]; e += values[k] = clearBy[k] > 2 * moved ? 0 : terms[k].energy(q); }
      return e;
    }
    for (let k = 0; k < terms.length; k++) e += values[k] = clearBy[k] > 2 * moved ? 0 : terms[k].energy(q);
    return e;
  };
  const slope = (q: Float64Array) => gradient(q, terms, pinned, values, big ? active.subarray(0, live) : undefined);
  const p = start.slice(), trial = new Float64Array(n);
  level(p, true); project?.(p, pinned);
  look(p);
  let energy = total(p), grad = slope(p), step = 0.05;
  let it = 0, nudged = false;
  for (; it < iterations; it++) {
    // shrink the step until it lowers the energy
    let e = Infinity;
    for (let tries = 0; tries < 30; tries++) {
      for (let k = 0; k < n; k++) trial[k] = p[k] - step * grad[k];
      level(trial); project?.(trial, pinned);
      e = total(trial);
      if (e <= energy) break;
      step *= 0.5;
    }
    if (!(e <= energy)) {
      // (stuck at the very start: a starting layout can sit exactly on a kink, where no step
      // down the measured slope lowers the energy. Nudge every free point a hair, the same
      // way each time, and set off again)
      if (it === 0 && !nudged) {
        nudged = true;
        for (let k = 0; k < n; k++) if (!pinned[k]) p[k] += 1e-3 * portable.sin(1.7 * k + 0.3);
        level(p); project?.(p, pinned);
        energy = total(p); grad = slope(p); step = 0.05; it = -1;
        continue;
      }
      break;
    }
    const gain = energy - e;
    // (the trial was the last layout measured, so `values` are its terms')
    const next = slope(trial);
    // Barzilai-Borwein: the step that fits the curvature seen between the two points
    let ss = 0, sy = 0;
    for (let k = 0; k < n; k++) { const sk = trial[k] - p[k], yk = next[k] - grad[k]; ss += sk * sk; sy += sk * yk; }
    p.set(trial); grad = next; energy = e;
    step = sy > 1e-12 ? Math.min(1, ss / sy) : step * 2;
    if (gain < settings.tolerance * Math.max(1, energy)) break;
  }
  lastSteps = it;
  return p;
}

/**
 * The gradient of the total energy, built term by term from the points each term touches:
 * from the term's own formula where it has one, else by moving each coordinate a little
 * forward and measuring again (the value where it stands is already known). `only` lists the
 * terms that can be more than zero, when the solve keeps such a list.
 */
function gradient(p: Float64Array, terms: Term[], pinned: boolean[], values: Float64Array, only?: Int32Array): Float64Array {
  const grad = new Float64Array(p.length), h = 1e-6;
  const count = only ? only.length : terms.length;
  for (let m = 0; m < count; m++) {
    const n = only ? only[m] : m;
    const t = terms[n];
    // a one-sided term that is zero here pulls on nothing
    if (t.oneSided && values[n] === 0) continue;
    if (t.grad) { t.grad(p, grad); continue; }
    for (const i of t.points) for (let k = 2 * i; k <= 2 * i + 1; k++) {
      if (pinned[k]) continue;
      const keep = p[k];
      p[k] = keep + h; const up = t.energy(p);
      p[k] = keep;
      grad[k] += (up - values[n]) / h;
    }
  }
  // (a written-out gradient pulls on pinned points too: they stay where they are)
  for (let k = 0; k < grad.length; k++) if (pinned[k]) grad[k] = 0;
  return grad;
}

/**
 * For a large solve: a look that asks only the clearance terms whose two things are near
 * each other. Each tagged term names the two things it keeps apart and how near they must
 * come before it can be more than zero; the things are put in a grid of cells wider than that
 * reach plus twice the distance points may move before the next look, so a pair in cells that
 * do not touch is clear by more than that distance, and its terms are marked clear without
 * being asked. Untagged terms are asked as usual.
 */
function clearanceGrid(terms: Term[], clearBy: Float64Array, lookAgain: number): (q: Float64Array) => void {
  const untagged: number[] = [], tagged: number[] = [], things: number[][] = [], thingOf = new Map<string, number>(), termsOf = new Map<number, number[]>();
  let reach = 0;
  const thing = (pts: number[]) => {
    const key = pts.join(",");
    let e = thingOf.get(key);
    if (e === undefined) { e = things.length; things.push(pts); thingOf.set(key, e); }
    return e;
  };
  const pairKey = (a: number, b: number) => (a < b ? a * 100003 + b : b * 100003 + a);
  for (let k = 0; k < terms.length; k++) {
    const tag = terms[k].tag;
    if (!tag) { untagged.push(k); continue; }
    tagged.push(k);
    reach = Math.max(reach, tag.reach);
    const key = pairKey(thing(tag.A), thing(tag.B));
    (termsOf.get(key) ?? termsOf.set(key, []).get(key)!).push(k);
  }
  const visited = new Map<number, number>();
  let stamp = 0;
  return (q: Float64Array) => {
    for (const k of untagged) clearBy[k] = terms[k].clear?.(q) ?? -1;
    const lim = 2 * lookAgain, cell = reach + lim + 1e-6;
    for (const k of tagged) clearBy[k] = lim + 1;
    const cells = new Map<number, number[]>(), range: (number[] | null)[] = [], spread: number[] = [];
    const cellKey = (x: number, y: number) => (x + 32768) * 65536 + (y + 32768);
    for (let e = 0; e < things.length; e++) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const i of things[e]) {
        const x = q[2 * i], y = q[2 * i + 1];
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      const r = [Math.floor(x0 / cell), Math.floor(y0 / cell), Math.floor(x1 / cell), Math.floor(y1 / cell)];
      // (a thing across very many cells, or not where a number can say, is compared with every other directly)
      if (!(Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(x1) && Number.isFinite(y1)) || (r[2] - r[0] + 1) * (r[3] - r[1] + 1) > 256) { spread.push(e); range.push(null); continue; }
      range.push(r);
      for (let cx = r[0]; cx <= r[2]; cx++) for (let cy = r[1]; cy <= r[3]; cy++) {
        const key = cellKey(cx, cy);
        (cells.get(key) ?? cells.set(key, []).get(key)!).push(e);
      }
    }
    stamp++;
    const ask = (key: number) => {
      const ks = termsOf.get(key);
      if (!ks || visited.get(key) === stamp) return;
      visited.set(key, stamp);
      for (const k of ks) clearBy[k] = terms[k].clear!(q);
    };
    for (const e of spread) for (let f = 0; f < things.length; f++) ask(pairKey(e, f));
    for (let e = 0; e < things.length; e++) {
      const r = range[e];
      if (!r) continue;
      for (let cx = r[0] - 1; cx <= r[2] + 1; cx++) for (let cy = r[1] - 1; cy <= r[3] + 1; cy++) {
        const list = cells.get(cellKey(cx, cy));
        if (!list) continue;
        for (const f of list) if (f >= e) ask(e * 100003 + f);
      }
    }
  };
}
