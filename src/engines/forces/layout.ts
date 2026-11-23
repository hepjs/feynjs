import type { Diagram } from "../../model.ts";
import type { ForceRules } from "../../theme.ts";
import { allForces, givenOffToward, levelTies, mirroredPairs, quarkRails, segmentsCross } from "./forces.ts";
import { balance } from "./solve.ts";
import { readStructure } from "./structure.ts";
import type { Sizes, Structure } from "./structure.ts";
import type { Force } from "./forces.ts";

/**
 * Layout v2: decide when each point happens, then let a few forces settle where it goes.
 * Positions are in propagator lengths, x across and y down; `rowOverRank` converts y to
 * the renderer's rows.
 */
export function layoutWithForces(diagram: Diagram, rules: ForceRules, rowOverRank: number, sizes?: Sizes, crossIncoming = true): void {
  // a line that is not drawn (a vacuum pair's invisible line in) has no say in the layout,
  // unless the author drew it [invisible] to hold the layout together
  // (no lines at all, a nucleus or a hadron drawn on its own: each point where it is, side by side)
  if (diagram.edges.length === 0) { [...diagram.vertices.values()].forEach((v, k) => { v.x = v.fixed?.x ?? k; v.y = v.fixed ? -v.fixed.y : 0; }); return; }
  const shown = diagram.edges.map((e) => e.style.line !== "none" || !!e.style.guide);
  const d: Diagram = { ...diagram, edges: diagram.edges.filter((_, k) => shown[k]) };
  if (sizes) sizes = { ...sizes, edgeLabel: sizes.edgeLabel.filter((_, k) => shown[k]) };
  const s = readStructure(d, sizes, rules.vertexPad);
  const start = startingPositions(d, s, rules, rowOverRank);
  const pinned = s.ids.flatMap((id) => (d.vertices.get(id)!.fixed ? [true, true] : [false, false]));
  const forces = allForces(s, rules), ties = levelTies(s);
  const heights = ties.filter((t) => t.axis === 1);
  // settle first with only the level ties, then lock the hadrons' columns from that settled
  // layout (locking them from the start can trap the solver in the wrong arrangement)
  const settle = (from: Float64Array, extra: Force[] = [], without = "") => {
    const all = [...forces.filter((f) => f.name !== without), ...extra];
    let q = balance(from, all, pinned, 1500, heights);
    if (heights.length < ties.length) q = balance(q, all, pinned, 1500, ties);
    return q;
  };
  let p = settle(start);
  // (with the final plane first, the diagram settles one moment at a time, each moment with
  // what came before it fixed and only the forces among the points so far: what a particle
  // decays to never turns the particle, or anything before it)
  if (rules.planeFirst) {
    const moments = [...new Set(s.time)].sort((a, b) => a - b);
    for (const t of moments.slice(1)) {
      const upTo = (i: number) => s.time[i] <= t;
      const now = forces.map((f) => ({ name: f.name, terms: f.terms.filter((term) => term.points.every(upTo)) }));
      const held = pinned.map((isPinned, k) => isPinned || s.time[k >> 1] < t || s.time[k >> 1] > t);
      p = balance(p, now, held, 1500, ties.filter((tie) => tie.points.every(upTo)));
    }
  }
  // the legs the author listed in `in:` / `out:` run in that order top to bottom; the forces
  // cannot swap two legs past each other, so if the settled layout has them the wrong way
  // round, branches are turned over to follow the order, and the layout settles again from
  // there with a guard that keeps the listed legs from crossing back
  const listed = listedPairs(d, s);
  const wrong = (q: Float64Array) => listed.filter(([a, b]) => q[2 * a + 1] > q[2 * b + 1] + 1e-3).length;
  if (listed.length && wrong(p) > 0) {
    const flipped = flipBranchesToListedOrder(s, p, wrong);
    if (wrong(flipped) < wrong(p)) {
      // (the author has chosen the order, so the force that would choose one stands down)
      p = settle(flipped, [keepListedOrder(listed, rules)], "light outside");
    }
  }
  settlePairs(s, p);
  if (rules.planeFirst && !s.hadrons.length) planeTree(s, p, rules);
  else if (rules.alignFinalStates) alignFinalStates(s, p, rules);
  crossListedLegs(s, p, listed);
  // (incoming lines that should cross: try the layout again with the two the other way round;
  // if that has fewer crossings, keep it and cross the two incoming lines)
  // (a point the author placed stays exactly where they put it, whatever the steps after the
  // forces did: the manual layout, TikZ-Feynman style, with the forces placing the rest)
  const anyPinned = pinned.some(Boolean);
  pinned.forEach((isPinned, k) => { if (isPinned) p[k] = start[k]; });
  const toCross = crossIncoming && !anyPinned ? incomingToCross(s, p) : undefined;
  if (toCross) {
    const before = crossingCount(s, p);
    const [a, b] = toCross.map((i) => diagram.vertices.get(s.ids[i])!);
    const order = [a.declaredOrder, b.declaredOrder];
    [a.declaredOrder, b.declaredOrder] = [order[1] ?? order[0], order[0] ?? order[1]];
    layoutWithForces(diagram, rules, rowOverRank, sizes, false);
    [a.declaredOrder, b.declaredOrder] = order;
    const q = new Float64Array(p.length);
    s.ids.forEach((id, i) => { const v = diagram.vertices.get(id)!; q[2 * i] = v.x; q[2 * i + 1] = v.y * rowOverRank; });
    // (the beams crossed: their legs trade places)
    [q[2 * toCross[0]], q[2 * toCross[1]]] = [q[2 * toCross[1]], q[2 * toCross[0]]];
    [q[2 * toCross[0] + 1], q[2 * toCross[1] + 1]] = [q[2 * toCross[1] + 1], q[2 * toCross[0] + 1]];
    if (crossingCount(s, q) < before) { [a.x, b.x, a.y, b.y] = [b.x, a.x, b.y, a.y]; return; }
    // (no better: back to the layout as it was)
    layoutWithForces(diagram, rules, rowOverRank, sizes, false);
    return;
  }
  s.ids.forEach((id, i) => {
    const v = d.vertices.get(id)!;
    v.x = p[2 * i];
    v.y = p[2 * i + 1] / rowOverRank;
  });
  bendAlongCircles(d, s, p);
  bendLoopArcs(d, s, p);
  // an undrawn line's far end sits level behind the point it leads to
  diagram.edges.forEach((e, k) => {
    if (shown[k]) return;
    const [here, there] = s.index.has(e.to) ? [e.to, e.from] : [e.from, e.to];
    const v = d.vertices.get(here), w = d.vertices.get(there);
    if (v && w && !s.index.has(there)) { w.x = (v.x ?? 0) - rules.lineLength; w.y = v.y; }
  });
}

/**
 * A vacuum pair's point ends exactly level with the gap between its quarks' ends (so the
 * pair is never twisted, whatever made it pulls on it); a curved pair also sits back by
 * half their spread, so its arcs are a true half circle and reach the hadrons level.
 */
function settlePairs(s: Structure, p: Float64Array): void {
  for (const { at, ends: [e1, e2], curved } of s.pairs) {
    p[2 * at + 1] = (p[2 * e1 + 1] + p[2 * e2 + 1]) / 2;
    if (curved) p[2 * at] = (p[2 * e1] + p[2 * e2]) / 2 - Math.abs(p[2 * e1 + 1] - p[2 * e2 + 1]) / 2;
  }
}

/**
 * An arc over a straight stretch (a vertex correction, a penguin) is drawn as a half circle
 * on the stretch: each of its lines bends by half the angle it spans about the stretch's
 * middle. An arc with no point of its own bulges away from the rest of the diagram (or, on a
 * quark rail, away from the hadron's other quarks). A bend the author gave is kept.
 */
function bendLoopArcs(d: Diagram, s: Structure, p: Float64Array): void {
  const rails = quarkRails(s);
  for (const loop of s.loops) {
    if (!loop.run || !loop.path || !loop.pathLines) continue;
    const [a, b] = [loop.run[0], loop.run[loop.run.length - 1]];
    const cx = (p[2 * a] + p[2 * b]) / 2, cy = (p[2 * a + 1] + p[2 * b + 1]) / 2;
    // which way is away: from the hadron's other quarks, else from everything off the loop
    const rail = rails.find((r) => r.path.includes(a) && r.path.includes(b) && r.others.length);
    const away = rail ? rail.others : s.ids.map((_, i) => i).filter((i) => !loop.points.includes(i));
    const ax = away.reduce((sum, i) => sum + p[2 * i], 0) / Math.max(1, away.length) - cx;
    const ay = away.reduce((sum, i) => sum + p[2 * i + 1], 0) / Math.max(1, away.length) - cy;
    for (const l of loop.pathLines) {
      const e = d.edges[l];
      if (e.bend !== undefined && !e.bendIsAutomatic) continue;
      const i = s.index.get(e.from)!, j = s.index.get(e.to)!;
      const ux = p[2 * j] - p[2 * i], uy = p[2 * j + 1] - p[2 * i + 1];
      const vx = p[2 * i] - cx, vy = p[2 * i + 1] - cy, wx = p[2 * j] - cx, wy = p[2 * j + 1] - cy;
      const spans = Math.acos(Math.max(-1, Math.min(1, (vx * wx + vy * wy) / ((Math.hypot(vx, vy) * Math.hypot(wx, wy)) || 1))));
      // bulge away from the centre; a line through the centre bulges away from the rest
      const mx = (p[2 * i] + p[2 * j]) / 2 - cx, my = (p[2 * i + 1] + p[2 * j + 1]) / 2 - cy;
      const [bx, by] = Math.hypot(mx, my) > 1e-6 * Math.hypot(ux, uy) ? [mx, my] : [-ax, -ay];
      // (positive bends bulge to the left of travel: on screen, y down, that is (uy, -ux))
      e.bend = (bx * uy - by * ux > 0 ? 1 : -1) * (spans * 90) / Math.PI;
      e.bendIsAutomatic = true;
    }
  }
}

/**
 * A curved vacuum pair and its partners are drawn as arcs of circles about the middle of
 * the gap between their two hadrons: each line bends by half the angle it spans there.
 */
function bendAlongCircles(d: Diagram, s: Structure, p: Float64Array): void {
  for (const pair of s.pairs) {
    if (!pair.curved) continue;
    const [e1, e2] = pair.ends;
    const cx = (p[2 * e1] + p[2 * e2]) / 2, cy = (p[2 * e1 + 1] + p[2 * e2 + 1]) / 2;
    for (const l of [...pair.lines, ...pair.partners.map((q) => q.line)]) {
      const e = d.edges[l];
      const a = s.index.get(e.from)!, b = s.index.get(e.to)!;
      const ax = p[2 * a] - cx, ay = p[2 * a + 1] - cy, bx = p[2 * b] - cx, by = p[2 * b + 1] - cy;
      const spans = Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx, by)) || 1))));
      // bulge away from the centre: the centre lies left of travel (screen, y down) or right
      const ux = bx - ax, uy = by - ay;
      const centreLeft = (cx - (p[2 * a] + p[2 * b]) / 2) * uy + (cy - (p[2 * a + 1] + p[2 * b + 1]) / 2) * -ux > 0;
      e.bend = (centreLeft ? -1 : 1) * (spans * 90) / Math.PI;
      e.bendIsAutomatic = true;
    }
  }
}

/**
 * Where the points start: each moment in its own column, the points of a column spread
 * evenly about the middle in the order they were written. Starting symmetric means the
 * forces keep a symmetric diagram symmetric.
 */
function startingPositions(d: Diagram, s: Structure, rules: ForceRules, rowOverRank = 1): Float64Array {
  const p = new Float64Array(s.ids.length * 2);
  const columns = new Map<number, number[]>();
  s.time.forEach((t, i) => (columns.get(t) ?? columns.set(t, []).get(t)!).push(i));
  const declared = (i: number) => d.vertices.get(s.ids[i])!.declaredOrder ?? i;
  const railOrder = railStartOrder(s, declared);
  const written = (i: number) => railOrder.get(i) ?? declared(i);
  // each column in turn: legs in the order written, other points level with the points before them
  const row = new Map<number, number>();
  const earlier = (i: number) => s.linesAt[i].map((l) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a)).filter((j) => s.time[j] < s.time[i] && row.has(j));
  // a vertex on an exchange starts in its place along it, between the two incoming particles
  const alongSpine = new Map<number, { path: number[]; k: number }>();
  for (const path of s.spines) path.forEach((v, k) => alongSpine.set(v, { path, k }));
  // what a quark rail gives off starts a step away from its hadron's other quarks
  const railEmission = new Map<number, { v: number; start: number; others: number[]; toward: boolean }>();
  const rails = quarkRails(s), onRail = new Set(rails.flatMap((r) => r.path));
  for (const { path, start, others } of rails) for (let k = 1; k + 1 < path.length; k++) {
    const v = path[k];
    for (const l of s.linesAt[v]) {
      const e = s.lines[l].a === v ? s.lines[l].b : s.lines[l].a;
      // (given off at two points, as a loop hanging from a rail is: the first counts)
      if (e !== path[k - 1] && e !== path[k + 1] && others.length && !onRail.has(e) && !railEmission.has(e)) railEmission.set(e, { v, start, others, toward: givenOffToward(s, l, v, path[path.length - 1], path) });
    }
  }
  const height = (i: number): number => {
    const emitted = railEmission.get(i);
    if (emitted && row.has(emitted.v) && row.has(emitted.start) && emitted.others.every((o) => row.has(o))) {
      const bundle = emitted.others.reduce((sum, o) => sum + row.get(o)!, 0) / emitted.others.length;
      // (toward the other quarks: half way to them, between the lines)
      if (emitted.toward) return (row.get(emitted.v)! + bundle) / 2;
      return row.get(emitted.v)! + (Math.sign(row.get(emitted.start)! - bundle) || 1) * rules.lineLength;
    }
    const spot = alongSpine.get(i);
    if (spot && spot.path.length > 1) {
      const [first, last] = [spot.path[0], spot.path[spot.path.length - 1]].map((v) => {
        const legs = earlier(v);
        return legs.length ? legs.reduce((sum, j) => sum + row.get(j)!, 0) / legs.length : 0;
      });
      return first + ((last - first) * spot.k) / (spot.path.length - 1);
    }
    const before = earlier(i);
    // everything after the incoming legs starts level with what it comes from, so nothing
    // crosses; the order the author wrote only breaks ties (see the sort below)
    return before.length ? before.reduce((sum, j) => sum + row.get(j)!, 0) / before.length : written(i);
  };
  const times = [...columns.keys()].sort((a, b) => a - b);
  // points in a moment go in the order given, each as near its wanted height as the spacing allows
  const place = (ordered: number[], wanted: (i: number) => number = (i) => row.get(i) ?? 0) => {
    const ys = ordered.map(wanted);
    for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k], ys[k - 1] + rules.lineLength);
    const shift = (ordered.map(wanted).reduce((a, b) => a + b, 0) - ys.reduce((a, b) => a + b, 0)) / Math.max(1, ys.length);
    ordered.forEach((i, k) => row.set(i, ys[k] + shift));
  };
  // where two points want the same height, the lighter kind of line goes on the outside, away
  // from the middle of the diagram: heavy (SUSY) lines innermost, then bosons, then fermions
  // (and a leg outside an internal line, so what a line emits leaves away from the exchange)
  const outside = (a: number, b: number, at: number) => {
    const order = outwardness(s, a) - outwardness(s, b);
    return order === 0 ? 0 : Math.sign(order) * (at >= 0 ? 1 : -1);
  };
  for (const t of times) {
    const ordered = columns.get(t)!.slice().sort((a, b) => height(a) - height(b) || outside(a, b, height(a)) || written(a) - written(b));
    // the incoming legs start evenly spaced; everything after starts near what it comes from
    place(ordered, t === 0 ? (i) => (ordered.indexOf(i) - (ordered.length - 1) / 2) * rules.lineLength : height);
  }
  untangle(s, columns, times, row, place, alongSpine);
  s.ids.forEach((id, i) => {
    const fixed = d.vertices.get(id)!.fixed;
    p[2 * i] = fixed ? fixed.x : s.time[i] * rules.lineLength;
    // (a position the author fixed is in the drawing's units; the layout's rows are rowOverRank of them)
    p[2 * i + 1] = fixed ? -fixed.y * rowOverRank : row.get(i)!;
  });
  return p;
}

/**
 * Reorder the points within each moment so that as few lines as possible start out crossed:
 * sweep back and forth, putting each point level with the average of its neighbours on the
 * side just placed (the usual way of drawing layered graphs). The forces cannot pull two
 * crossed lines back through each other, so the start has to be untangled already.
 */
/**
 * The order an incoming hadron's quarks start in, top to bottom: two quark rails a line joins
 * start next to each other, and a rail that gives off something going elsewhere starts on the
 * outside. Every order of the hadron's legs is tried (a baryon has six); ties keep the order
 * written. Returns a rank for each leg it reorders.
 */
function railStartOrder(s: Structure, declared: (i: number) => number): Map<number, number> {
  const rank = new Map<number, number>();
  const rails = quarkRails(s);
  const railOf = new Map<number, number>();
  rails.forEach((r) => r.path.forEach((v) => railOf.set(v, r.start)));
  for (const h of s.hadrons) {
    if (h.outgoing || h.legs.length < 3) continue;
    const links: [number, number][] = [], emits: number[] = [];
    for (const r of rails.filter((r) => h.legs.includes(r.start))) for (const v of r.path.slice(1, -1)) {
      for (const l of s.linesAt[v]) {
        const e = s.lines[l].a === v ? s.lines[l].b : s.lines[l].a;
        if (r.path.includes(e)) continue;
        const to = railOf.get(e);
        if (to !== undefined && h.legs.includes(to)) links.push([r.start, to]);
        else if (to === undefined) emits.push(r.start);
      }
    }
    if (!links.length && !emits.length) continue;
    const legs = h.legs.slice().sort((a, b) => declared(a) - declared(b));
    let best = legs, fewest = Infinity;
    for (const order of permutations(legs)) {
      const at = (leg: number) => order.indexOf(leg);
      const cost = links.reduce((c, [a, b]) => c + Math.abs(at(a) - at(b)) - 1, 0)
        + emits.reduce((c, a) => c + Math.min(at(a), order.length - 1 - at(a)), 0);
      if (cost < fewest) { fewest = cost; best = order; }
    }
    // the legs take the written places of the hadron's legs, in the new order
    best.forEach((leg, k) => rank.set(leg, declared(legs[k])));
  }
  return rank;
}

function permutations(items: number[]): number[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((x, k) => permutations([...items.slice(0, k), ...items.slice(k + 1)]).map((rest) => [x, ...rest]));
}

function untangle(s: Structure, columns: Map<number, number[]>, times: number[], row: Map<number, number>,
  place: (ordered: number[], wanted?: (i: number) => number) => void, alongSpine: Map<number, unknown>): void {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const neighbours = (i: number, side: 1 | -1) => s.linesAt[i].map((l) => other(l, i)).filter((j) => Math.sign(s.time[j] - s.time[i]) === side);
  let best = new Map(row), fewest = crossings(s, row);
  for (let sweep = 0; sweep < 6 && fewest > 0; sweep++) {
    const side: 1 | -1 = sweep % 2 === 0 ? 1 : -1;
    for (const t of side === 1 ? times.slice().reverse() : times) {
      const key = (i: number) => {
        const near = neighbours(i, side);
        // a point on the exchange keeps its place along it
        return alongSpine.has(i) || near.length === 0 ? row.get(i)! : near.reduce((sum, j) => sum + row.get(j)!, 0) / near.length;
      };
      const outside = (a: number, b: number) => { const order = outwardness(s, a) - outwardness(s, b); return order === 0 ? 0 : Math.sign(order) * (key(a) >= 0 ? 1 : -1); };
      place(columns.get(t)!.slice().sort((a, b) => key(a) - key(b) || outside(a, b) || row.get(a)! - row.get(b)!), key);
    }
    const now = crossings(s, row);
    if (now < fewest) { fewest = now; best = new Map(row); }
  }
  for (const [i, y] of best) row.set(i, y);
}

/** How many pairs of lines cross when each point sits at (its moment, its row). */
function crossings(s: Structure, row: Map<number, number>): number {
  const at = (i: number) => [s.time[i], row.get(i)!] as const;
  const side = (o: number, u: number, w: number) => {
    const [ox, oy] = at(o), [ux, uy] = at(u), [wx, wy] = at(w);
    return (ux - ox) * (wy - oy) - (uy - oy) * (wx - ox);
  };
  let count = 0;
  s.lines.forEach((m, i) => s.lines.forEach((n, j) => {
    if (j <= i || m.a === n.a || m.a === n.b || m.b === n.a || m.b === n.b) return;
    // touching counts: a point lying on another line will be pushed across it
    if (side(m.a, m.b, n.a) * side(m.a, m.b, n.b) <= 0 && side(n.a, n.b, m.a) * side(n.a, n.b, m.b) <= 0) count++;
  }));
  return count;
}

/**
 * How far out a point belongs: on the exchange between the beams innermost; otherwise by the
 * line that brings it in, heavy (SUSY) lines first, then bosons, then fermions; a final-state
 * leg a little further out than an internal line.
 */
function outwardness(s: Structure, i: number): number {
  // a point on the exchange between the beams is innermost, whatever brings it in
  if (s.spines.some((path) => path.includes(i))) return -1;
  const into = s.linesAt[i].find((l) => s.time[s.lines[l].a === i ? s.lines[l].b : s.lines[l].a] < s.time[i]);
  const kind = into === undefined ? 1 : s.lines[into].heavy ? 0 : s.lines[into].fermion ? 2 : 1;
  return 2 * kind + (s.external[i] ? 1 : 0);
}

/** Every pair of legs in the author's `in:` and `out:` lists, as point indices, the upper one first (so the count of pairs the wrong way round measures how far the order is off). */
function listedPairs(d: Diagram, s: Structure): [number, number][] {
  const pairs: [number, number][] = [];
  for (const role of ["in", "out"] as const) {
    const listed = [...d.vertices.values()].filter((v) => v.role === role && v.declaredOrder !== undefined && s.index.has(v.id))
      .sort((a, b) => a.declaredOrder! - b.declaredOrder!).map((v) => s.index.get(v.id)!);
    for (let j = 0; j < listed.length; j++) for (let k = j + 1; k < listed.length; k++) pairs.push([listed[j], listed[k]]);
  }
  return pairs;
}

/**
 * Turn branches over until the listed legs run in order: at each vertex, in time order, the
 * whole of what follows it is reflected across the line it came in on (which swaps its
 * products top for bottom), and the reflection is kept when it puts more listed legs in order.
 */
function flipBranchesToListedOrder(s: Structure, p: Float64Array, wrong: (q: Float64Array) => number): Float64Array {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const later = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] > s.time[i]);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const after = (v: number) => {
    const seen = new Set<number>(), stack = later(v);
    while (stack.length) { const j = stack.pop()!; if (!seen.has(j)) { seen.add(j); stack.push(...later(j)); } }
    return seen;
  };
  const reflect = (pos: Float64Array, v: number): Float64Array => {
    // the line to reflect across: through v, along the middle of its products' headings, so
    // the products swap sides while each keeps heading forward (reflecting across the line it
    // came in on would turn a product leaving level into one leaving upright)
    let ux = 0, uy = 0;
    for (const j of later(v)) {
      const fx = pos[2 * j] - pos[2 * v], fy = pos[2 * j + 1] - pos[2 * v + 1], n = Math.hypot(fx, fy) || 1;
      ux += fx / n; uy += fy / n;
    }
    const n = Math.hypot(ux, uy);
    if (n < 1e-6) { ux = 1; uy = 0; } else { ux /= n; uy /= n; }
    const q = Float64Array.from(pos), cx = pos[2 * v], cy = pos[2 * v + 1];
    for (const j of after(v)) {
      const x = pos[2 * j] - cx, y = pos[2 * j + 1] - cy, along = x * ux + y * uy;
      q[2 * j] = cx + 2 * along * ux - x;
      q[2 * j + 1] = cy + 2 * along * uy - y;
    }
    return q;
  };
  const forks = s.ids.map((_, i) => i).filter((i) => !s.external[i] && later(i).length >= 2).sort((a, b) => s.time[a] - s.time[b]);
  // every combination of flips, applied in time order (a fork turned over can need its inner
  // forks turned back); a diagram has few forks, so this stays small
  if (forks.length > 10) return p;
  let best: Float64Array = p, fewest = wrong(p);
  for (let mask = 1; mask < 1 << forks.length && fewest > 0; mask++) {
    let q: Float64Array = p;
    forks.forEach((v, k) => { if (mask & (1 << k)) q = reflect(q, v); });
    const w = wrong(q);
    if (w < fewest) { best = q; fewest = w; }
  }
  return best;
}

/**
 * A guard for the listed order once the layout follows it: zero while every listed pair keeps
 * its upper leg above, a firm push back as soon as one would cross. (It only holds an order
 * the layout already has; started from the wrong order it would squeeze the legs together.)
 */
function keepListedOrder(listed: [number, number][], rules: ForceRules): Force {
  const gap = 0.15 * rules.lineLength;
  return {
    name: "listed order",
    terms: listed.map(([a, b]) => ({
      points: [a, b],
      oneSided: true,
      energy: (p: Float64Array) => { const over = p[2 * a + 1] - p[2 * b + 1] + gap; return over > 0 ? 40 * over * over : 0; },
      clear: (p: Float64Array) => (p[2 * b + 1] - p[2 * a + 1] - gap) / 2,
    })),
  };
}

/**
 * The final states end level, as papers draw them: each outgoing leg of a decay is lengthened
 * along its own direction until its end reaches the furthest one. Only legs grow (nothing else
 * moves), none to more than `alignStretch` times its length, and none that leaves steeper
 * than `alignSteepest`.
 */
function alignFinalStates(s: Structure, p: Float64Array, rules: ForceRules): void {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const legs = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] > 0 && s.linesAt[i].length === 1 && !s.hadrons.length);
  // only where something decays: a plain scatter's legs already end where they should
  const decays = legs.some((i) => { const v = other(s.linesAt[i][0], i); return s.linesAt[v].filter((l) => s.time[other(l, v)] < s.time[v]).length === 1 && s.time[v] > 1; });
  if (legs.length < 2 || !decays) return;
  // (in a SUSY cascade the products of a boson's decay keep their own length: they go the
  // boson's way, not to the plane)
  const cascade = s.lines.some((l) => l.heavy) && !rules.planeFirst;
  const bosonDecay = (v: number) => cascade && !s.linesAt[v].some((l) => s.lines[l].heavy)
    && s.linesAt[v].some((l) => !s.lines[l].fermion && s.time[other(l, v)] < s.time[v]);
  const plane = Math.max(...legs.map((i) => p[2 * i]));
  const grown = new Map<number, number>();
  for (const i of legs) {
    const v = other(s.linesAt[i][0], i);
    const x = p[2 * i] - p[2 * v], y = p[2 * i + 1] - p[2 * v + 1];
    // which legs reach the plane: those of a branch's last decay heading on toward the right
    // (within alignSteepest of level), and any leg leaving near level (within alignLevel);
    // a leg thrown off steeply earlier in a chain (a b from a top, an f' from a chargino)
    // keeps its own length
    const lean = (Math.atan2(Math.abs(y), x) * 180) / Math.PI;
    const lastDecay = s.linesAt[v].every((l) => { const j = other(l, v); return s.time[j] < s.time[v] || s.external[j]; });
    // (radiation keeps its own length: it is given off on the way, not a product of the collision;
    // so does what is left of a beam that passes through a blob, the Pb(*) of an ion collision)
    const remnant = s.blob[v] && s.linesAt[v].some((l) => { const j = other(l, v); return s.external[j] && s.time[j] === 0; });
    if (x <= 1e-6 || lean > (lastDecay ? rules.alignSteepest : rules.alignLevel) || bosonDecay(v) || s.radiatesInto[v] >= 0 || remnant) continue;
    // (a leg thrown off before the last decay, a chi beside the s that decays on, grows only as
    // long as the line that brought its parent in: the plane is for what the last decays make)
    const before = s.linesAt[v].map((l) => other(l, v)).filter((j) => s.time[j] < s.time[v]);
    const parentLength = before.length ? before.reduce((sum, j) => sum + Math.hypot(p[2 * v] - p[2 * j], p[2 * v + 1] - p[2 * j + 1]), 0) / before.length : 0;
    let grow = Math.min((plane - p[2 * v]) / x, lastDecay ? rules.alignStretch : Math.max(1, parentLength / (Math.hypot(x, y) || 1)));
    if (grow <= 1) continue;
    // (a leg stops short of another leg's end: two legs heading the same way must not meet)
    const clear = (g: number) => legs.every((j) => j === i || Math.hypot(p[2 * v] + x * g - p[2 * j], p[2 * v + 1] + y * g - p[2 * j + 1]) >= rules.alignGap * rules.lineLength);
    while (grow > 1 && !clear(grow)) grow = Math.max(1, grow - 0.05);
    grown.set(i, grow);
  }
  // each leg by its own factor, as far as it stays clear of the other legs' ends: every final
  // state ends on the plane, so legs leaving at like angles come out alike and a steep one runs
  // longer, as papers draw them (alignStretch keeps it from running away)
  const clearOf = (i: number, v: number, g: number) => legs.every((j) => j === i || Math.hypot(p[2 * v] + (p[2 * i] - p[2 * v]) * g - p[2 * j], p[2 * v + 1] + (p[2 * i + 1] - p[2 * v + 1]) * g - p[2 * j + 1]) >= rules.alignGap * rules.lineLength);
  const own = new Map<number, number>();
  for (const [i, g] of grown) {
    const v = other(s.linesAt[i][0], i);
    let gg = g;
    while (gg > 1 && !clearOf(i, v, gg)) gg = Math.max(1, gg - 0.05);
    own.set(i, gg);
  }
  // (the legs of one decay grow alike: the two invisibles of an S are the same length)
  const byParent = new Map<number, number[]>();
  for (const i of legs) { const v = other(s.linesAt[i][0], i); (byParent.get(v) ?? byParent.set(v, []).get(v)!).push(i); }
  const legLength = (i: number) => { const v = other(s.linesAt[i][0], i); return Math.hypot(p[2 * i] - p[2 * v], p[2 * i + 1] - p[2 * v + 1]) || 1; };
  const twinName = (i: number) => s.label[i] ?? s.particle[i];
  for (const siblings of byParent.values()) {
    if (siblings.length < 2) continue;
    // (two of the same particle, the two invisibles of an S, do not reach for the plane: they
    // keep the one length the forces gave them, short, clear of the final states beside them)
    if (siblings.every((i) => twinName(i) !== undefined && twinName(i) === twinName(siblings[0]))) { for (const i of siblings) own.set(i, 1); continue; }
    // (to the same length: the shortest any of them would reach, never shorter than the longest is already)
    const reach = Math.max(Math.min(...siblings.map((i) => legLength(i) * (own.get(i) ?? 1))), ...siblings.map(legLength));
    for (const i of siblings) own.set(i, reach / legLength(i));
  }
  // (the legs of mirrored branches grow alike)
  for (const { matches } of mirroredPairs(s)) for (const [m, n] of matches) {
    if (!own.has(m) && !own.has(n)) continue;
    const least = Math.min(own.get(m) ?? 1, own.get(n) ?? 1);
    own.set(m, least); own.set(n, least);
  }
  // (grown in turn, each checked against the ends as they now are, so two legs that both grow
  // do not meet; a leg that would is pulled back until it is clear)
  const start = new Map([...own.keys()].map((i) => [i, [p[2 * i], p[2 * i + 1]] as [number, number]]));
  const endsClear = (i: number) => legs.every((j) => j === i || Math.hypot(p[2 * i] - p[2 * j], p[2 * i + 1] - p[2 * j + 1]) >= rules.alignGap * rules.lineLength);
  for (const [i, g0] of [...own].sort((a, b) => b[1] - a[1])) {
    if (g0 <= 1) continue;
    const v = other(s.linesAt[i][0], i), [x0, y0] = start.get(i)!;
    for (let g = g0; g >= 1; g -= 0.05) {
      p[2 * i] = p[2 * v] + (x0 - p[2 * v]) * g;
      p[2 * i + 1] = p[2 * v + 1] + (y0 - p[2 * v + 1]) * g;
      if (endsClear(i)) break;
    }
  }
  // (a leg pulled back to stay clear takes its twins, the same particle from the same decay,
  // back with it: they stay one length)
  const name = (i: number) => s.label[i] ?? s.particle[i];
  for (const all of byParent.values()) for (const siblings of new Map(all.filter((i) => name(i) !== undefined).map((i) => [name(i), all.filter((j) => name(j) === name(i))])).values()) {
    if (siblings.length < 2) continue;
    const shortest = Math.min(...siblings.map(legLength));
    for (const i of siblings) {
      const v = other(s.linesAt[i][0], i), k = shortest / legLength(i);
      p[2 * i] = p[2 * v] + (p[2 * i] - p[2 * v]) * k;
      p[2 * i + 1] = p[2 * v + 1] + (p[2 * i + 1] - p[2 * v + 1]) * k;
    }
  }
}

/**
 * The final plane first (`final plane: on`): the decays are laid out as a tree. Every final
 * state ends on one vertical plane; every particle that decays sits a step beyond its parent,
 * in the middle of the room its branches take, and the branches of one decay take equal room
 * (as much as the widest needs), so they mirror each other about their parent's line. What
 * comes before the first decays (the collision, a loop) stays put.
 */
function planeTree(s: Structure, p: Float64Array, rules: ForceRules): void {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  const later = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] > s.time[i]);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const leaf = (i: number) => s.external[i] && s.time[i] > 0 && !s.field[i];
  // a decay: one particle in, something out, not part of a loop
  // (not a point a beam comes into: a spectator quark's vertex stays where the forces put it)
  const decay = (i: number) => !s.external[i] && !onLoop.has(i) && earlier(i).length === 1 && later(i).length > 0 && !(s.external[earlier(i)[0]] && s.time[earlier(i)[0]] === 0);
  const tops = s.ids.map((_, i) => i).filter((i) => (decay(i) || leaf(i)) && !decay(earlier(i)[0] ?? -1));
  if (!tops.some(decay)) return;
  // room on the plane, in final-state spacings: a final state takes one; branches from one
  // decay take equal room, as much as the widest of them needs, so they mirror each other
  const byHeight = (a: number, b: number) => p[2 * a + 1] - p[2 * b + 1];
  const room = new Map<number, number>();
  // (a final state takes one; only the branches that decay on share equal room, as much as the
  // widest of them needs: the quarks beside a gluino's neutralino take one each)
  const roomOf = (i: number): number => {
    if (!room.has(i)) {
      const kids = later(i), on = kids.filter((j) => !leaf(j));
      room.set(i, leaf(i) ? 1 : kids.length - on.length + on.length * (on.length ? Math.max(...on.map(roomOf)) : 0));
    }
    return room.get(i)!;
  };
  const share = (i: number) => (leaf(i) ? 1 : Math.max(...later(earlier(i)[0]).filter((j) => !leaf(j)).map(roomOf)));
  // (close enough that the tree is not spread out tall: room for a label between neighbours)
  const gap = rules.lineLength * 0.55;
  const columnOf = new Map<number, number>();
  const leaves: number[] = [];
  // each in the band it is given: a final state in its middle, a decay at its middle with its
  // branches in equal bands below it, top to bottom as the forces left them
  const place = (i: number, x: number, top: number, height: number) => {
    p[2 * i + 1] = top + height / 2;
    if (leaf(i)) { leaves.push(i); return; }
    columnOf.set(i, x);
    p[2 * i] = x;
    const branches = later(i).sort(byHeight);
    let at = top;
    for (const j of branches) { const h = (share(j) / roomOf(i)) * height; place(j, x + rules.lineLength, at, h); at += h; }
  };
  tops.sort(byHeight);
  const roots = tops.filter(decay);
  const centre = roots.reduce((sum, i) => sum + p[2 * i + 1], 0) / roots.length;
  const total = roots.reduce((sum, i) => sum + roomOf(i), 0) * gap;
  let top = centre - total / 2;
  for (const i of roots) {
    const height = roomOf(i) * gap;
    place(i, p[2 * i], top, height);
    top += height;
  }
  // (a final state straight from the collision, a spectator quark, keeps the direction the
  // forces gave it: it only runs on, or back, along it to end on the plane; the plane does not
  // make its line level)
  const straightOut = tops.filter((i) => leaf(i));
  const order = leaves;
  // every final state on the plane, a step beyond the furthest particle that decays
  const plane = Math.max(...[...columnOf.values()], ...straightOut.map((i) => p[2 * earlier(i)[0]])) + rules.lineLength;
  for (const i of order) p[2 * i] = plane;
  for (const i of straightOut) {
    const v = earlier(i)[0], x = p[2 * i] - p[2 * v], y = p[2 * i + 1] - p[2 * v + 1];
    if (x > 1e-6) { const k = (plane - p[2 * v]) / x; p[2 * i] = plane; p[2 * i + 1] = p[2 * v + 1] + y * k; }
  }
}

/**
 * Lines that cross in a settled layout, as pairs of lines that share no point: zero in a
 * clean drawing.
 */
function crossingCount(s: Structure, p: Float64Array): number {
  let n = 0;
  for (let m = 0; m < s.lines.length; m++) for (let k = m + 1; k < s.lines.length; k++) {
    const A = s.lines[m], B = s.lines[k];
    if (A.a === B.a || A.a === B.b || A.b === B.a || A.b === B.b) continue;
    if (segmentsCross(p, A.a, A.b, B.a, B.b)) n++;
  }
  return n;
}

/**
 * Two incoming particles that enter at the two ends of an exchange, in a layout where lines
 * cross: the candidates for crossing the incoming lines instead (a crossed box, g g -> Q Qbar
 * through a u-channel Q, which papers draw with the gluons crossed and the box clean).
 */
function incomingToCross(s: Structure, p: Float64Array): [number, number] | undefined {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  if (crossingCount(s, p) === 0) return undefined;
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  for (let m = 0; m < incoming.length; m++) for (let k = m + 1; k < incoming.length; k++) {
    const va = other(s.linesAt[incoming[m]][0], incoming[m]), vb = other(s.linesAt[incoming[k]][0], incoming[k]);
    // (joined directly, or along one exchange between them: a VBF Higgs's crossed diagram)
    const joined = s.linesAt[va].some((l) => other(l, va) === vb) || s.spines.some((path) => path.includes(va) && path.includes(vb));
    if (va === vb || s.external[va] || s.external[vb] || !joined) continue;
    return [incoming[m], incoming[k]];
  }
  return undefined;
}

/**
 * The crossed final states of a u-channel diagram: where the listed order puts a leg from a
 * lower vertex above a leg from a higher one, and the two vertices exchange a line directly,
 * the two legs swap ends, so they cross in an X
 * as papers draw it. Done last, once everything has settled: only the two legs' ends move.
 */
function crossListedLegs(s: Structure, p: Float64Array, listed: [number, number][]): void {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const vertexOf = (i: number) => other(s.linesAt[i][0], i);
  for (const [a, b] of listed) {
    // (outgoing legs from different vertices, the one listed first lying lower)
    if (!s.external[a] || !s.external[b] || s.time[a] === 0 || s.time[b] === 0) continue;
    const va = vertexOf(a), vb = vertexOf(b);
    if (va === vb || p[2 * a + 1] <= p[2 * b + 1]) continue;
    // only the u-channel shape: two vertices on the exchange between the incoming particles,
    // joined directly, each giving off just this one leg
    const onSpine = (v: number) => s.spines.some((path) => path.includes(v));
    const legsOut = (v: number) => s.linesAt[v].filter((l) => { const j = other(l, v); return s.external[j] && s.time[j] > s.time[v]; }).length;
    // (or two neighbouring corners of one loop: the crossed box)
    const sameLoop = s.loops.some((loop) => loop.points.includes(va) && loop.points.includes(vb));
    if (!((onSpine(va) && onSpine(vb)) || sameLoop) || !s.linesAt[va].some((l) => other(l, va) === vb) || legsOut(va) !== 1 || legsOut(vb) !== 1) continue;
    [p[2 * a], p[2 * b]] = [p[2 * b], p[2 * a]];
    [p[2 * a + 1], p[2 * b + 1]] = [p[2 * b + 1], p[2 * a + 1]];
  }
}
