import type { Force, Term } from "./forces.ts";
import * as portable from "../../geometry/portable-math.ts";

/** Steps the last call to `balance` took (for tuning). */
export let lastSteps = 0;

/** The solver stops once a step lowers the energy by less than this share of it. */
export const settings = { tolerance: 1e-6 };

/** How far a point may move before the solver looks again at which one-sided terms are clear. */
const LOOK_AGAIN = 0.3;

/**
 * Find the positions where the forces balance. Gradient descent on the total energy, with
 * each step sized from how the gradient changed over the last one (Barzilai-Borwein), and
 * halved whenever it would overshoot. The gradient is taken numerically, one term at a
 * time: moving a point only changes the terms that touch it. Pinned coordinates
 * (manual positions) do not move; tied points share one coordinate exactly.
 */
/**
 * Points held to one coordinate: one height (axis 1), or one place across the page (axis 0).
 * `start` says where the tie first puts them: their average, or the furthest out of them
 * (`max` for a column of final states, `min` for incoming ones).
 */
export interface Tie { axis: 0 | 1; points: number[]; start?: "mean" | "max" | "min" }

export function balance(start: Float64Array, forces: Force[], pinned: boolean[], iterations = 1500, ties: Tie[] = []): Float64Array {
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
  // a one-sided term known to be clear of its limit by more than the points have since moved
  // is zero without measuring it: how clear each was when last looked at (`seen`), and how
  // far any point has moved since
  const seen = start.slice(), clearBy = new Float64Array(terms.length).fill(-1);
  const look = (q: Float64Array) => {
    seen.set(q);
    for (let k = 0; k < terms.length; k++) clearBy[k] = terms[k].clear?.(q) ?? -1;
  };
  const movedSince = (q: Float64Array) => {
    let most = 0;
    for (let i = 0; i < n; i += 2) most = Math.max(most, portable.hypot(q[i] - seen[i], q[i + 1] - seen[i + 1]));
    return most;
  };
  // each term's value at the last layout measured (the gradient there needs them again)
  const values = new Float64Array(terms.length);
  const total = (q: Float64Array) => {
    let moved = movedSince(q);
    if (moved > LOOK_AGAIN) { look(q); moved = 0; }
    let e = 0;
    for (let k = 0; k < terms.length; k++) e += values[k] = clearBy[k] > 2 * moved ? 0 : terms[k].energy(q);
    return e;
  };
  const p = start.slice(), trial = new Float64Array(n);
  level(p, true);
  look(p);
  let energy = total(p), grad = gradient(p, terms, pinned, values), step = 0.05;
  let it = 0, nudged = false;
  for (; it < iterations; it++) {
    // shrink the step until it lowers the energy
    let e = Infinity;
    for (let tries = 0; tries < 30; tries++) {
      for (let k = 0; k < n; k++) trial[k] = p[k] - step * grad[k];
      level(trial);
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
        level(p);
        energy = total(p); grad = gradient(p, terms, pinned, values); step = 0.05; it = -1;
        continue;
      }
      break;
    }
    const gain = energy - e;
    // (the trial was the last layout measured, so `values` are its terms')
    const next = gradient(trial, terms, pinned, values);
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

/** The gradient of the total energy, built term by term from the points each term touches. */
function gradient(p: Float64Array, terms: Term[], pinned: boolean[], values: Float64Array): Float64Array {
  const grad = new Float64Array(p.length), h = 1e-6;
  for (let n = 0; n < terms.length; n++) {
    const t = terms[n];
    // a one-sided term that is zero here pulls on nothing
    if (t.oneSided && values[n] === 0) continue;
    for (const i of t.points) for (let k = 2 * i; k <= 2 * i + 1; k++) {
    if (pinned[k]) continue;
    const keep = p[k];
    p[k] = keep + h; const up = t.energy(p);
    p[k] = keep - h; const down = t.energy(p);
    p[k] = keep;
    grad[k] += (up - down) / (2 * h);
    }
  }
  return grad;
}
