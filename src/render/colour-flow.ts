import { Curve, fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import type { Diagram, Edge, Vertex } from "../model.ts";
import { particleOfEdge } from "../particles/identify.ts";
import { halfWidth } from "./lines.ts";
import type { Scene } from "./scene.ts";
import { vertexRadius } from "./vertices.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * Colour flow, in 't Hooft's double-line notation: a thin coloured line beside every quark
 * (a colour triplet carries one colour) and two beside every gluon (an octet carries a colour
 * and an anticolour, running opposite ways), joined at each vertex the way colour passes
 * through it. Each colour line, followed through the whole diagram, gets a colour of its own,
 * and a small arrow on each stretch shows which way it runs: along the quark arrows.
 *
 * At a vertex the colour lines turn through the gaps between neighbouring lines, so they never
 * cross a line where they meet: going round the vertex, a gluon offers a colour line on each
 * side and a quark one, and neighbours pair up across the gap between them.
 */
export function drawColourFlow(scene: Scene, d: Diagram): { warnings: string[]; coloured: Set<Edge> } {
  const charge = colourCharges(d);
  const coloured = new Set([...charge].filter(([, c]) => c !== 0).map(([e]) => e));
  const strands = strandsAlongLines(d, charge);
  if (strands.length === 0) return { warnings: [], coloured };
  if (scene.colourOnly) for (const s of strands) onlyOffsets.set(s.edge, charge.get(s.edge) === 8 ? scene.theme.colourFlow.gap * 1.1 : scene.theme.colourFlow.gap * 0.45);
  const problems: string[] = [];
  const joins = joinAtVertices(scene, d, charge, strands, problems);
  twistGluons(strands, joins);
  const lines = followColourLines(strands, joins);
  drawStrands(scene, d, strands, joins, lines);
  return { warnings: [...problems, ...hadronProblems(d, strands)], coloured };
}

/** Under `colour flow: only`, how far beside each line its strands run: close, as there is no line between. */
const onlyOffsets = new WeakMap<Edge, number>();

/**
 * Hadrons the colour flow does not suit. Joining each meson's two quarks closes the colour
 * lines into loops, and the amplitude goes as N_c to the number of loops: a colour-allowed decay
 * has one loop for each hadron beyond the incoming ones; fewer, and this flow is
 * colour-suppressed. A baryon's three colours cannot be drawn as double lines at all.
 */
function hadronProblems(d: Diagram, strands: Strand[]): string[] {
  const problems: string[] = [];
  const named = (label: string) => label.replace(/\\(\w+)/g, "$1").replace(/[{}^_]/g, "").replace(/\s+/g, "");
  const parent = new Map<number, number>();
  const find = (k: number): number => { while (parent.get(k)! !== k) k = parent.get(k)!; return k; };
  for (const s of strands) parent.set(s.line, s.line);
  let mesons = 0, incoming = 0;
  const mixed: string[] = [];
  for (const group of d.hadrons) {
    const coloured = group.legs.map((leg) => strands.find((s) => s.edge.from === leg || s.edge.to === leg)).filter((s): s is Strand => !!s);
    if (coloured.length >= 3) { problems.push(`colour flow cannot show the three colours of the baryon ${named(group.label)}`); continue; }
    if (coloured.length !== 2) continue;
    mesons++;
    if (group.legs.some((leg) => d.vertices.get(leg)?.role === "in")) incoming++;
    else if (coloured[0].line !== coloured[1].line) mixed.push(named(group.label));
    parent.set(find(coloured[0].line), find(coloured[1].line));
  }
  if (incoming > 0) {
    const loops = new Set([...parent.keys()].map(find)).size;
    if (loops < mesons - incoming) problems.push(`colour-suppressed: the quarks of ${mixed.join(" and ")} come from different colour lines`);
  }
  return problems;
}

// ---- which lines carry colour -------------------------------------------------------------

/** 3 for a colour triplet (quarks, squarks, leptoquarks), 8 for an octet (gluons, gluinos), 0 otherwise. */
type Charge = 0 | 3 | 8;

const TRIPLETS = new Set(["u", "ubar", "d", "dbar", "s", "sbar", "c", "cbar", "b", "bbar", "t", "tbar",
  "q", "qbar", "q'", "qbar'", "squark", "stop", "sbottom", "LQ", "T", "B"]);
const OCTETS = new Set(["g", "gluino"]);

/**
 * The colour charge of every line. Named particles say it outright, and a coil is a gluon. A
 * plain fermion line named no particle is a quark when it meets a gluon or another quark at a
 * vertex where only two fermion lines meet (colour has to come in and go out).
 */
function colourCharges(d: Diagram): Map<Edge, Charge> {
  const charge = new Map<Edge, Charge>();
  const unknown = new Set<Edge>();
  for (const e of d.edges) {
    const name = particleOfEdge(d, e);
    if (e.from === e.to || e.style.line === "none") charge.set(e, 0);
    else if (name && TRIPLETS.has(name)) charge.set(e, 3);
    else if (name && OCTETS.has(name)) charge.set(e, 8);
    else if (!name && e.style.line === "coil") charge.set(e, 8);
    else if (!name && e.style.line === "plain") unknown.add(e);
    else charge.set(e, 0);
  }
  const around = linesAround(d);
  for (let changed = true; changed && unknown.size;) {
    changed = false;
    for (const [, lines] of around) {
      const fermions = lines.filter((e) => e.style.line === "plain" && (charge.get(e) === 3 || unknown.has(e)));
      if (fermions.length !== 2) continue;
      const coloured = lines.some((e) => charge.get(e) === 8) || fermions.some((e) => charge.get(e) === 3);
      if (!coloured) continue;
      for (const e of fermions) if (unknown.delete(e)) { charge.set(e, 3); changed = true; }
    }
  }
  for (const e of unknown) charge.set(e, 0);
  return charge;
}

function linesAround(d: Diagram): Map<string, Edge[]> {
  const around = new Map<string, Edge[]>();
  for (const e of d.edges) {
    if (e.from === e.to) continue;
    for (const id of [e.from, e.to]) (around.get(id) ?? around.set(id, []).get(id)!).push(e);
  }
  return around;
}

// ---- the strands beside each line ---------------------------------------------------------

/**
 * One colour line along one line of the diagram. `side` is which side of the line it runs on
 * at each end (+1: right of the line's direction from `from` to `to`, as `Curve.offset`
 * measures it; -1: left). A gluon's two strands keep to their sides; a quark's one strand takes
 * the side each vertex needs, and crosses over its line half way if those differ.
 */
interface Strand {
  id: number;
  edge: Edge;
  side: { from: number; to: number };
  /** +1 when colour runs from `from` to `to`, -1 against */
  dir: number;
  /** which colour line it belongs to */
  line: number;
}

function strandsAlongLines(d: Diagram, charge: Map<Edge, Charge>): Strand[] {
  const strands: Strand[] = [];
  for (const e of d.edges) {
    const c = charge.get(e);
    // colour runs along the quark arrow; a gluon's two lines run opposite ways
    if (c === 3) strands.push({ id: strands.length, edge: e, side: { from: 0, to: 0 }, dir: e.style.arrow === -1 ? -1 : 1, line: -1 });
    if (c === 8) for (const side of [1, -1]) strands.push({ id: strands.length, edge: e, side: { from: side, to: side }, dir: 0, line: -1 });
  }
  return strands;
}

// ---- how colour passes through each vertex ------------------------------------------------

/** A strand's end at a vertex, and the direction its line leaves the vertex. */
interface Slot { strand: Strand; end: "from" | "to"; angle: number; edge: Edge; kind: "before" | "after" | "either" }

/** Two strand ends joined at a vertex, turning through the gap from `a`'s line to `b`'s. */
export interface Join { vertex: Vertex; a: Slot; b: Slot }

/** The direction a line leaves vertex `v`, in screen radians. */
function leavingAngle(curve: Curve, leavesFrom: boolean): number {
  const p = curve.at(leavesFrom ? 0 : curve.length);
  return leavesFrom ? portable.atan2(p.ty, p.tx) : portable.atan2(-p.ty, -p.tx);
}

/**
 * Which side of its line a strand runs on near vertex `v`, as `Curve.offset` measures it, when it
 * turns toward the next line round the vertex ("after", larger angle) or the one before.
 */
function sideToward(kind: "before" | "after", leavesFrom: boolean): number {
  return (kind === "after" ? 1 : -1) * (leavesFrom ? 1 : -1);
}

function joinAtVertices(scene: Scene, d: Diagram, charge: Map<Edge, Charge>, strands: Strand[], problems: string[]): Join[] {
  const joins: Join[] = [];
  const byEdge = new Map<Edge, Strand[]>();
  for (const s of strands) (byEdge.get(s.edge) ?? byEdge.set(s.edge, []).get(s.edge)!).push(s);
  // a quark passing a colourless line (an H, W or photon) is joined last, once its neighbours know their sides
  const around = [...linesAround(d)];
  const passing = (lines: Edge[]) => lines.filter((e) => charge.get(e) === 3).length === 2 && lines.every((e) => charge.get(e) !== 8);
  around.sort(([, a], [, b]) => Number(passing(a)) - Number(passing(b)));
  for (const [id, lines] of around) {
    const v = d.vertices.get(id)!;
    // colour does not pass through a blob (an unresolved process), and ends on an external leg
    if (lines.length < 2 || v.shape === "blob" || v.shape === "hatched") continue;
    const ends = lines.map((e) => ({ e, angle: leavingAngle(scene.edgeCurves.get(e)!, e.from === id) })).sort((p, q) => p.angle - q.angle);
    // going round the vertex: a gluon offers a strand on each side, a quark one on either
    const slots: Slot[] = [];
    for (const { e, angle } of ends) {
      const mine = byEdge.get(e) ?? [];
      const end = e.from === id ? "from" : "to";
      if (charge.get(e) === 8) {
        // the strand on the side toward the previous line comes first
        const before = mine.find((s) => s.side[end] === sideToward("before", end === "from"))!;
        const after = mine.find((s) => s !== before)!;
        slots.push({ strand: before, end, angle, edge: e, kind: "before" }, { strand: after, end, angle, edge: e, kind: "after" });
      } else if (charge.get(e) === 3) slots.push({ strand: mine[0], end, angle, edge: e, kind: "either" });
    }
    if (slots.length === 1) problems.push(`colour is not conserved at ${id}: one coloured line meets only colourless ones`);
    if (slots.length < 2) continue;
    if (slots.length % 2 === 1) problems.push(`colour is not conserved at ${id}: ${slots.length} colour lines meet there`);
    const { pairs, cost } = bestPairing(slots, ends.map((x) => ({ angle: x.angle, colourless: charge.get(x.e) === 0 && x.e.style.line !== "none" })), passing(lines));
    if (cost >= 100) problems.push(`colour cannot pass through ${id} as drawn`);
    for (const [a, b] of pairs) {
      // a quark's strand runs on the side facing the line it turns toward
      if (a.kind === "either") a.strand.side[a.end] = sideToward("after", a.end === "from");
      if (b.kind === "either") b.strand.side[b.end] = sideToward("before", b.end === "from");
      joins.push({ vertex: v, a, b });
    }
  }
  // a quark strand with an open end (an external leg) keeps the side of its other end
  for (const s of strands) {
    if (s.side.from === 0) s.side.from = s.side.to || 1;
    if (s.side.to === 0) s.side.to = s.side.from;
  }
  return joins;
}

/**
 * Pair the slots round a vertex, each with a neighbour, through the gap between their lines:
 * either slots (0,1), (2,3), ... or (1,2), (3,4), ..., (n-1,0). A pair must turn out of the
 * gap after its first line and into the gap before its second (a gluon never meets itself),
 * and the better pairing crosses fewer colourless lines (the W or photon a quark emits).
 */
function bestPairing(slots: Slot[], lines: { angle: number; colourless: boolean }[], weighSides = false): { pairs: [Slot, Slot][]; cost: number } {
  const n = slots.length;
  const usable = n % 2 === 0 ? n : n - 1;
  let best: [Slot, Slot][] = [], bestCost = Infinity;
  for (const shift of [0, 1]) {
    const pairs: [Slot, Slot][] = [];
    let cost = 0;
    for (let k = 0; k < usable; k += 2) {
      const a = slots[(k + shift) % n], b = slots[(k + shift + 1) % n];
      if (a.kind === "before" || b.kind === "after" || a.edge === b.edge) cost += 100;
      // colourless lines strictly inside the gap from a's line round to b's
      const span = (b.angle - a.angle + 2 * Math.PI) % (2 * Math.PI) || 2 * Math.PI;
      for (const l of lines) {
        const at = (l.angle - a.angle + 2 * Math.PI) % (2 * Math.PI);
        if (l.colourless && at > 1e-6 && at < span - 1e-6) cost += 1;
      }
      // (where a quark passes a colourless line: a strand made to cross over its own line, its other
      // end being on the far side, costs most of crossing the colourless line, so two of them cost more)
      if (weighSides) cost += 0.75 * (crossesOver(a, "after") + crossesOver(b, "before"));
      pairs.push([a, b]);
    }
    if (cost < bestCost) { best = pairs; bestCost = cost; }
  }
  return { pairs: best, cost: bestCost };
}

/** 1 if a quark strand turning this way at this end runs on the other side of its line at its other end. */
function crossesOver(slot: Slot, kind: "before" | "after"): number {
  if (slot.kind !== "either") return 0;
  const far = slot.strand.side[slot.end === "from" ? "to" : "from"];
  return far !== 0 && far !== sideToward(kind, slot.end === "from") ? 1 : 0;
}

/**
 * Which way colour runs along each gluon's strands, and whether they twist. At every vertex the
 * colour arriving on one strand leaves on the one it is joined to, and a gluon's two strands run
 * opposite ways; quarks fix the way at their vertices (along their arrows). A gluon whose two ends
 * then disagree about which side carries colour in has its strands cross over each other half way
 * (gluon exchange between two quarks: each quark's colour passes to the other).
 */
function twistGluons(strands: Strand[], joins: Join[]): void {
  const slots: Slot[] = joins.flatMap((j) => [j.a, j.b]);
  const arriving = new Map<Slot, boolean>();
  for (const s of slots) if (s.kind === "either") arriving.set(s, (s.end === "to") === (s.strand.dir === 1));
  const partnerAt = (s: Slot) => slots.find((o) => o !== s && o.kind !== "either" && o.edge === s.edge && o.end === s.end);
  const otherEnd = (s: Slot) => slots.find((o) => o.strand === s.strand && o.end !== s.end);
  const settle = () => {
    for (let changed = true; changed;) {
      changed = false;
      const set = (s: Slot | undefined, value: boolean) => { if (s && !arriving.has(s)) { arriving.set(s, value); changed = true; } };
      for (const j of joins) {
        if (arriving.has(j.a)) set(j.b, !arriving.get(j.a));
        if (arriving.has(j.b)) set(j.a, !arriving.get(j.b));
      }
      for (const s of slots) if (s.kind !== "either" && arriving.has(s)) set(partnerAt(s), !arriving.get(s));
    }
  };
  settle();
  // (where nothing fixes the way, as round a vertex of gluons alone: untwisted, if a neighbour knows)
  for (let open = slots.filter((s) => !arriving.has(s)); open.length; open = slots.filter((s) => !arriving.has(s))) {
    const known = open.find((s) => { const o = otherEnd(s); return o && arriving.has(o); });
    arriving.set(known ?? open[0], known ? !arriving.get(otherEnd(known)!) : true);
    settle();
  }
  for (const e of new Set(strands.filter((s) => s.dir === 0).map((s) => s.edge))) {
    const [s1, s2] = strands.filter((s) => s.edge === e);
    const at = (s: Strand, end: "from" | "to") => slots.find((o) => o.strand === s && o.end === end);
    const from1 = at(s1, "from"), to1 = at(s1, "to"), to2 = at(s2, "to");
    if (from1 && to1 && to2 && arriving.get(from1) === arriving.get(to1)) {
      // colour comes in at both ends on one side: the strands change sides half way
      to1.strand = s2; to2.strand = s1;
      s1.side.to = -s1.side.to; s2.side.to = -s2.side.to;
    }
    for (const s of [s1, s2]) {
      const f = at(s, "from"), t = at(s, "to");
      if (f && arriving.has(f)) s.dir = arriving.get(f) ? -1 : 1;
      else if (t && arriving.has(t)) s.dir = arriving.get(t) ? 1 : -1;
    }
  }
}

// ---- colour lines, followed through the diagram -------------------------------------------

/**
 * Follow each colour line through its joins, giving it one number, and set the direction of
 * every strand on it: colour leaves a vertex on one strand as it arrives on the other.
 * Quark strands already know their direction; a line of gluons only takes one.
 */
function followColourLines(strands: Strand[], joins: Join[]): number {
  const links = new Map<Strand, { other: Strand; mine: "from" | "to"; theirs: "from" | "to" }[]>();
  const link = (s: Strand, mine: "from" | "to", other: Strand, theirs: "from" | "to") => (links.get(s) ?? links.set(s, []).get(s)!).push({ other, mine, theirs });
  for (const j of joins) { link(j.a.strand, j.a.end, j.b.strand, j.b.end); link(j.b.strand, j.b.end, j.a.strand, j.a.end); }
  let count = 0;
  // start from quark strands (so the lines through quarks are numbered first), then whatever is left
  const quark = (s: Strand) => strands.filter((o) => o.edge === s.edge).length === 1;
  const order = [...strands.filter(quark), ...strands.filter((s) => !quark(s) && s.dir !== 0), ...strands.filter((s) => !quark(s) && s.dir === 0)];
  // (a gluon's two strands run opposite ways: a line of gluons alone takes its direction from the
  // strand beside it, once that has one)
  const partner = (s: Strand) => strands.find((o) => o !== s && o.edge === s.edge);
  for (let k = 0; k < order.length; k++) {
    let start = order[k];
    if (start.line >= 0) continue;
    if (start.dir === 0) {
      const set = order.find((s) => s.line < 0 && s.dir === 0 && (partner(s)?.dir ?? 0) !== 0);
      if (set) { start = set; start.dir = -partner(set)!.dir; k--; } else start.dir = 1;
    }
    start.line = count;
    const queue = [start];
    while (queue.length) {
      const s = queue.pop()!;
      for (const { other, mine, theirs } of links.get(s) ?? []) {
        // arriving at the vertex on s means leaving it on the other strand
        const arrives = (mine === "to") === (s.dir === 1);
        const dir = (theirs === "from") === arrives ? 1 : -1;
        if (other.dir === 0) other.dir = dir;
        if (other.line < 0) { other.line = count; queue.push(other); }
      }
    }
    count++;
  }
  return count;
}

// ---- drawing ------------------------------------------------------------------------------

/** How far beside its line a strand runs: clear of the widest part of the line. */
function offsetOf(scene: Scene, e: Edge): number {
  if (scene.colourOnly && onlyOffsets.has(e)) return onlyOffsets.get(e)!;
  return halfWidth(e.style, scene.theme.line) + scene.theme.line.stroke / 2 + scene.theme.colourFlow.gap;
}

const smoothStep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * Where each strand starts and stops along its line: short of a vertex where it turns into the
 * next line (further back the narrower the gap, so the two strands meet before they cross), at
 * the end of an external leg, or clear of a blob where colour stops.
 */
function strandSpan(scene: Scene, d: Diagram, s: Strand, turnAt: Map<string, number>): [number, number] {
  const curve = scene.edgeCurves.get(s.edge)!, look = scene.theme.vertex;
  const stop = (id: string) => {
    const turn = turnAt.get(endKey(id, s.edge.from === id ? "from" : "to", s));
    if (turn !== undefined) return Math.min(turn, curve.length * 0.42);
    const v = d.vertices.get(id)!;
    return v.role ? 0 : vertexRadius(v, look) + scene.theme.colourFlow.turn * 0.6;
  };
  return [stop(s.edge.from), curve.length - stop(s.edge.to)];
}

/** How far from its vertex each joined strand turns. */
function turnDistances(scene: Scene, joins: Join[]): Map<string, number> {
  const turnAt = new Map<string, number>();
  for (const j of joins) {
    const gap = ((j.b.angle - j.a.angle + 2 * Math.PI) % (2 * Math.PI)) || 2 * Math.PI;
    const offset = Math.max(offsetOf(scene, j.a.edge), offsetOf(scene, j.b.edge));
    // two lines offset beside lines meeting at `gap` cross at offset / tan(gap / 2) from the vertex
    const meet = gap < Math.PI * 0.9 ? offset / portable.tan(gap / 2) : 0;
    const turn = Math.max(scene.theme.colourFlow.turn, meet + scene.theme.colourFlow.turn * 0.7);
    turnAt.set(endKey(j.vertex.id, j.a.end, j.a.strand), turn);
    turnAt.set(endKey(j.vertex.id, j.b.end, j.b.strand), turn);
  }
  return turnAt;
}

/** A strand's end at a vertex, as a key. */
const endKey = (vertex: string, end: "from" | "to", s: Strand) => `${vertex}|${end}|${s.id}`;

/** The points of a strand beside its line, crossing over half way if its two ends need different sides. */
function strandPoints(curve: Curve, s: Strand, offset: number, span: [number, number]): Pt[] {
  const [s0, s1] = span, pts: Pt[] = [];
  const steps = Math.max(2, Math.ceil((s1 - s0) / 3));
  for (let k = 0; k <= steps; k++) {
    const at = s0 + ((s1 - s0) * k) / steps;
    const w = smoothStep((at / curve.length - 0.2) / 0.6);
    pts.push(curve.offset(at, offset * (s.side.from * (1 - w) + s.side.to * w)));
  }
  return pts;
}

function drawStrands(scene: Scene, d: Diagram, strands: Strand[], joins: Join[], lineCount: number): void {
  const look = scene.theme.colourFlow;
  // each colour line carries red, green or blue, in turn: the colour where it runs forward in time
  // (left to right; down, on an upright line), its anticolour where it runs back
  const pick = (list: string[], k: number) => scene.resolveColor(list[k % list.length]) ?? list[k % list.length];
  const hueOf = (s: Strand) => {
    const a = scene.position(d.vertices.get(s.edge.from)!), b = scene.position(d.vertices.get(s.edge.to)!);
    const dx = (b.x - a.x) * s.dir, dy = (b.y - a.y) * s.dir, len = portable.hypot(dx, dy) || 1;
    const forward = Math.abs(dx) > len * 0.2 ? dx > 0 : dy > 0;
    return forward ? pick(look.palette, s.line) : pick(look.anti, s.line);
  };
  const turnAt = turnDistances(scene, joins);

  // the points of every strand, from its line's `from` end to its `to` end
  const points = new Map<Strand, Pt[]>();
  for (const s of strands) {
    const span = strandSpan(scene, d, s, turnAt);
    if (span[1] - span[0] < 2) continue;
    const pts = strandPoints(scene.edgeCurves.get(s.edge)!, s, offsetOf(scene, s.edge), span);
    points.set(s, pts);
    for (const p of pts) scene.bounds.include(p.x, p.y, look.width);
    scene.addObstacleCurve(new Curve(pts), look.width / 2 + 0.5);
  }
  // each join, found from either of its two strand ends
  const joinAt = new Map<string, { join: Join; other: Slot }>();
  for (const j of joins) {
    joinAt.set(endKey(j.vertex.id, j.a.end, j.a.strand), { join: j, other: j.b });
    joinAt.set(endKey(j.vertex.id, j.b.end, j.b.strand), { join: j, other: j.a });
  }
  const vertexAt = (s: Strand, end: "from" | "to") => (end === "from" ? s.edge.from : s.edge.to);
  const other = (end: "from" | "to") => (end === "from" ? "to" : "from");
  const isOpen = (s: Strand, end: "from" | "to") => !joinAt.has(endKey(vertexAt(s, end), end, s));

  // walk each colour line from an open end (or anywhere, for a closed loop), strand, turn,
  // strand, so it is one path: a single see-through stroke does not darken where it bends
  const paths: { line: number; hue: string; d: string }[] = [];
  const arrows: [string, string][] = [];
  const walked = new Set<Strand>();
  const walkFrom = (start: Strand, startEnd: "from" | "to") => {
    const line: Pt[] = [], owner: Strand[] = [];
    let current = start, enter = startEnd, closed = false;
    while (true) {
      walked.add(current);
      const pts = points.get(current)!;
      const ordered = enter === "from" ? pts : [...pts].reverse();
      line.push(...ordered);
      owner.push(...ordered.map(() => current));
      arrows.push([hueOf(current), arrowOn(pts, current.dir, look.arrowLength, look.arrowWidth, current.side.from !== current.side.to ? 0.2 : 0.5)]);
      const exit = other(enter);
      const next = joinAt.get(endKey(vertexAt(current, exit), exit, current));
      if (!next || !points.has(next.other.strand)) break;
      const theirs = points.get(next.other.strand)!;
      const theirsOrdered = next.other.end === "from" ? theirs : [...theirs].reverse();
      // (the turn changes hue half way round)
      const turn = turnPoints(ordered, theirsOrdered);
      line.push(...turn);
      owner.push(...turn.map((_, k) => (k < turn.length / 2 ? current : next.other.strand)));
      if (walked.has(next.other.strand)) { closed = true; break; } // round a closed loop, back to the start
      current = next.other.strand;
      enter = next.other.end;
    }
    const even = smoothed(line, owner, closed);
    if (closed) even.push(even[0]);
    // one path for each stretch of one hue, each running on into the next one's first point
    for (let k = 0; k < even.length;) {
      let j = k;
      while (j + 1 < even.length && hueOf(even[j + 1].owner) === hueOf(even[k].owner)) j++;
      paths.push({ line: start.line, hue: hueOf(even[k].owner), d: pathFrom(even.slice(k, Math.min(j + 2, even.length))) });
      k = j + 1;
    }
  };
  for (const s of points.keys()) if (!walked.has(s) && (isOpen(s, "from") || isOpen(s, "to"))) walkFrom(s, isOpen(s, "from") ? "from" : "to");
  for (const s of points.keys()) if (!walked.has(s)) walkFrom(s, "from");

  // solid, so a stroke never darkens where it meets itself or its arrows: the colour as it looks
  // see-through on a white page; on their own, colour lines are the diagram's lines, at a line's weight
  const opacity = scene.colourOnly ? 1 : look.opacity, width = scene.colourOnly ? scene.theme.line.stroke * 1.2 : look.width;
  const stroke = `fill="none" stroke="currentColor" stroke-width="${fmt(width)}" stroke-linecap="round" stroke-linejoin="round"`;
  const lines = paths.map((p) => `<path data-colour-line="${p.line}" d="${p.d}" ${stroke} color="${onWhite(p.hue, opacity)}"/>`).join("")
    + arrows.map(([hue, arrow]) => (arrow ? `<g color="${onWhite(hue, opacity)}">${arrow}</g>` : "")).join("");
  // (the last of the edges: the renderer moves it beneath the diagram's lines, which it runs beside and sometimes passes under)
  scene.edges.push(`<g class="feynjs-colour-flow">${lines}</g>`);
}

/** A colour seen at `opacity` over white, as a solid colour. */
function onWhite(colour: string, opacity: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(colour);
  if (!m || opacity >= 1) return colour;
  const n = parseInt(m[1], 16), mix = (c: number) => Math.round(255 - (255 - c) * opacity).toString(16).padStart(2, "0");
  return `#${mix(n >> 16)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

/** The points of a turn between the end of one strand and the start of the next (neither end included). */
function turnPoints(leaving: Pt[], joining: Pt[]): Pt[] {
  const p0 = leaving[leaving.length - 1], p3 = joining[0], [c1, c2] = turnControls(leaving, joining);
  const steps = Math.max(4, Math.ceil(portable.hypot(p3.x - p0.x, p3.y - p0.y) / 2));
  const pts: Pt[] = [];
  for (let k = 1; k < steps; k++) {
    const t = k / steps, u = 1 - t;
    pts.push({ x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x, y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y });
  }
  return pts;
}

/**
 * A colour line made smooth all along: its points spaced evenly, then each moved to the average
 * of its neighbours a few px either way (fewer near an open end, so the ends stay put), twice.
 * Each point keeps the strand it was made from.
 */
function smoothed(line: Pt[], owner: Strand[], closed: boolean): (Pt & { owner: Strand })[] {
  const spacing = 1.5, reach = 5;
  let pts = evenlySpaced(line, owner, spacing, closed);
  const n = pts.length;
  if (n < 3) return pts;
  for (let pass = 0; pass < 2; pass++) {
    pts = pts.map((q, k) => {
      const r = closed ? reach : Math.min(reach, k, n - 1 - k);
      let x = 0, y = 0;
      for (let j = -r; j <= r; j++) { const p = pts[(k + j + n) % n]; x += p.x; y += p.y; }
      return { x: x / (2 * r + 1), y: y / (2 * r + 1), owner: q.owner };
    });
  }
  return pts;
}

/** Points along a polyline `spacing` apart (round to the start again, if closed), each with its strand. */
function evenlySpaced(line: Pt[], owner: Strand[], spacing: number, closed: boolean): (Pt & { owner: Strand })[] {
  const path = closed ? [...line, line[0]] : line;
  const out: (Pt & { owner: Strand })[] = [{ ...path[0], owner: owner[0] }];
  let carried = 0;
  for (let k = 1; k < path.length; k++) {
    const a = path[k - 1], b = path[k], len = portable.hypot(b.x - a.x, b.y - a.y), o = owner[k % owner.length];
    let at = spacing - carried;
    while (at <= len) { out.push({ x: a.x + ((b.x - a.x) * at) / len, y: a.y + ((b.y - a.y) * at) / len, owner: o }); at += spacing; }
    carried = len - (at - spacing);
  }
  if (closed) out.pop(); else out.push({ ...path[path.length - 1], owner: owner[owner.length - 1] });
  return out;
}

/**
 * The two control points of a turn from the end of one strand to the start of the next: each
 * along its own strand's heading, so the turn leaves and joins them without a kink, and as far
 * out as a circular arc through the same turn would put them.
 */
function turnControls(leaving: Pt[], joining: Pt[]): [Pt, Pt] {
  const p0 = leaving[leaving.length - 1], p3 = joining[0];
  const heading = (a: Pt, b: Pt) => { const n = portable.hypot(b.x - a.x, b.y - a.y) || 1; return { x: (b.x - a.x) / n, y: (b.y - a.y) / n }; };
  const t0 = heading(leaving[Math.max(0, leaving.length - 3)], p0), t3 = heading(p3, joining[Math.min(joining.length - 1, 2)]);
  const chord = portable.hypot(p3.x - p0.x, p3.y - p0.y);
  const turn = portable.acos(Math.max(-1, Math.min(1, t0.x * t3.x + t0.y * t3.y)));
  // a circular arc turning through `turn` puts its controls (4/3) tan(turn/4) r out, and its chord is 2 r sin(turn/2)
  const reach = turn < 1e-3 ? chord / 3 : (chord * (2 / 3) * portable.tan(turn / 4)) / portable.sin(Math.min(turn, Math.PI - 1e-3) / 2);
  return [{ x: p0.x + t0.x * reach, y: p0.y + t0.y * reach }, { x: p3.x - t3.x * reach, y: p3.y - t3.y * reach }];
}

/** A small arrowhead part way along a strand (half way, unless it is crossing over its line there), pointing the way colour runs. */
function arrowOn(pts: Pt[], dir: number, length: number, width: number, along = 0.5): string {
  let total = 0;
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push((total += portable.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)));
  if (total < length * 2.5) return "";
  const half = total * (dir > 0 ? along : 1 - along);
  let k = 1;
  while (k < pts.length - 1 && cum[k] < half) k++;
  const a = pts[k - 1], b = pts[k], seg = cum[k] - cum[k - 1] || 1, f = (half - cum[k - 1]) / seg;
  const m = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  const tx = ((b.x - a.x) / seg) * dir, ty = ((b.y - a.y) / seg) * dir, w = width / 2;
  const tip = { x: m.x + tx * length * 0.5, y: m.y + ty * length * 0.5 };
  const back = { x: m.x - tx * length * 0.5, y: m.y - ty * length * 0.5 };
  return `<path d="${pathFrom([tip, { x: back.x - ty * w, y: back.y + tx * w }, { x: back.x + ty * w, y: back.y - tx * w }], true)}" fill="currentColor"/>`;
}
