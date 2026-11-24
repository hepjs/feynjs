import type { Diagram, Edge } from "../../model.ts";
import type { ForceRules } from "../../theme.ts";
import { allForces, levelTies } from "./forces.ts";
import { startingPositions } from "./layout.ts";
import { balance } from "./solve.ts";
import { readStructure } from "./structure.ts";
import type { Sizes } from "./structure.ts";

/** One reason a line lies where it does: a force, in words, and how far the line moves without it. */
export interface LineReason {
  force: string;
  reason: string;
  /** how much the line itself (its length and direction) changes when the force is left out, in line lengths */
  amount: number;
}

/** Each force's name, as a reason a line lies where it does. */
const REASONS: Record<string, string> = {
  "length": "its length",
  "even angles": "even angles at its ends",
  "time flow": "time running left to right",
  "time order": "later points staying to the right",
  "clearance": "keeping clear of other lines and labels",
  "upright exchange": "the exchange standing upright",
  "exchange fan": "lines off the exchange fanning out",
  "shower fan": "the shower fanning evenly",
  "mirror branches": "mirroring its twin branch",
  "beams start together": "the incoming lines mirroring each other",
  "final plane": "final states ending on one plane",
  "light outside": "light particles going outside",
  "heavy carries on": "a heavy particle carrying on straight",
  "no converging": "outgoing lines not running back together",
  "hadrons": "a hadron's quarks running side by side",
  "vacuumArcs": "a vacuum pair's arcs",
  "loops": "the loop keeping its shape",
  "forward forks": "the decay forking forward",
  "rest level": "a resonance at rest running level",
  "equal products": "one decay's products matching in length",
  "pairs together": "the vacuum pair staying together",
  "straight into blob": "running straight into the blob",
  "given off sideways": "a fermion given off leaving outside",
};

/**
 * Why each line lies where it does, for `debug: on`: the diagram settled again with each force
 * left out in turn, and for each line, the forces without which it moves most, most first.
 * Measured, not told: a force is a reason for a line when leaving it out changes that line.
 * (the forces settle only, as they do first: what the steps after them did is in the trace)
 */
export function whyLines(diagram: Diagram, rules: ForceRules, rowOverRank: number, sizes?: Sizes, most = 3): Map<Edge, LineReason[]> {
  const shown = diagram.edges.filter((e) => e.style.line !== "none" || !!e.style.guide);
  const why = new Map<Edge, LineReason[]>(shown.map((e) => [e, []]));
  if (!shown.length) return why;
  const kept = diagram.edges.map((e) => e.style.line !== "none" || !!e.style.guide);
  const d: Diagram = { ...diagram, edges: shown };
  if (sizes) sizes = { ...sizes, edgeLabel: sizes.edgeLabel.filter((_, k) => kept[k]) };
  const s = readStructure(d, sizes, rules.vertexPad);
  const start = startingPositions(d, s, rules, rowOverRank);
  const pinned = s.ids.flatMap((id) => (d.vertices.get(id)!.fixed ? [true, true] : [false, false]));
  const forces = allForces(s, rules), ties = levelTies(s);
  const heights = ties.filter((t) => t.axis === 1);
  const settle = (without = "") => {
    const all = forces.filter((f) => f.name !== without);
    let q = balance(start, all, pinned, 1500, heights);
    if (heights.length < ties.length) q = balance(q, all, pinned, 1500, ties);
    return q;
  };
  const settled = settle();
  // (a line's own change: its length and direction, wherever the whole diagram went)
  const vector = (q: Float64Array, l: number) => { const { a, b } = s.lines[l]; return [q[2 * b] - q[2 * a], q[2 * b + 1] - q[2 * a + 1]]; };
  for (const force of forces) {
    if (!force.terms.length) continue;
    const without = settle(force.name);
    s.lines.forEach((_, l) => {
      const [x0, y0] = vector(settled, l), [x1, y1] = vector(without, l);
      const amount = Math.hypot(x1 - x0, y1 - y0) / rules.lineLength;
      if (amount > 0.05) why.get(shown[l])!.push({ force: force.name, reason: REASONS[force.name] ?? force.name, amount });
    });
  }
  for (const [e, reasons] of why) why.set(e, reasons.sort((a, b) => b.amount - a.amount).slice(0, most));
  return why;
}
