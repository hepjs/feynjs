import type { Edge, Vertex } from "../../model.ts";
import type { Ranks } from "./columns.ts";
import { isLeg, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";
import * as portable from "../../geometry/portable-math.ts";

/**
 * Loops that sit on a line, as in penguin and box diagrams: a boson that leaves a quark
 * line and rejoins it further along is drawn as an arc over the line, and a vertex on
 * that boson sits at the top of the arc.
 */

const DEGREES_OF_HALF_CIRCLE = 90;
const DEGREES_OF_QUARTER_CIRCLE = 45;

/**
 * Which side of their line loops are drawn on: -1 above, 1 below. They go above unless
 * a spectator line will be there.
 */
export function loopSide(g: Graph): number {
  const incoming = [...g.diagram.vertices.values()].filter((v) => g.legs.has(v.id) && v.role === "in");
  const isSpectator = (v: Vertex) => g.legs.has(neighboursOf(g, v.id)[0]);
  const firstOtherListed = Math.min(...incoming.filter((v) => !isSpectator(v)).map((v) => v.declaredOrder ?? Infinity));
  const spectatorAbove = incoming.some((v) => isSpectator(v) && (v.declaredOrder ?? -1) < firstOtherListed);
  return spectatorAbove ? 1 : -1;
}

/** Bend that makes an edge bulge to the given side on screen, whichever way it was written. */
function bendTowards(g: Graph, e: Edge, side: number, degrees: number): number {
  const from = g.diagram.vertices.get(e.from)!, to = g.diagram.vertices.get(e.to)!;
  const runsRight = to.x >= from.x;
  return (runsRight ? 1 : -1) * (side < 0 ? 1 : -1) * degrees;
}

/** Position of each vertex along the rail it is on. */
function railPositions(g: Graph): Map<string, { rail: number; index: number }> {
  const positions = new Map<string, { rail: number; index: number }>();
  g.railPaths.forEach((path, rail) => path.forEach((id, index) => {
    if (!isLeg(g, id)) positions.set(id, { rail, index });
  }));
  return positions;
}

/**
 * Arc every line that leaves a rail and rejoins the same rail. Lines the author bent
 * by hand are left alone.
 */
export function arcLinesThatRejoinTheirRail(g: Graph): void {
  const onRail = railPositions(g);
  for (const e of g.diagram.edges) {
    if ((e.bend !== undefined && !e.bendIsAutomatic) || e.style.line === "plain") continue;
    const a = onRail.get(e.from), b = onRail.get(e.to);
    if (!a || !b || a.rail !== b.rail || a.index === b.index) continue;
    e.bend = bendTowards(g, e, loopSide(g), DEGREES_OF_HALF_CIRCLE);
  }
}

/**
 * A vertex joined to two points of one rail by the same kind of line is the top of a
 * loop over that rail. Put it there, and draw its two lines as the halves of the arc.
 * Whatever else hangs from it moves with it.
 */
export function placeVerticesOnArcs(g: Graph, rank: Ranks, moveBranch: (id: string, dx: number, dy: number) => void): void {
  const onRail = railPositions(g);
  for (const v of g.vertices) {
    if (isLeg(g, v.id) || onRail.has(v.id)) continue;
    const feet = neighboursOf(g, v.id).filter((n) => onRail.has(n));
    if (feet.length !== 2 || onRail.get(feet[0])!.rail !== onRail.get(feet[1])!.rail) continue;
    const lines = feet.map((foot) => g.diagram.edges.find((e) =>
      (e.from === v.id && e.to === foot) || (e.from === foot && e.to === v.id))!);
    if (lines.some((e) => !e)) continue; // two different kinds of line (Z and H) still make a loop over the rail

    const [left, right] = feet.map((id) => g.diagram.vertices.get(id)!).sort((a, b) => a.x - b.x);
    const radius = (right.x - left.x) / 2;
    const side = loopSide(g);
    const apexX = (left.x + right.x) / 2, apexY = (left.y + right.y) / 2 + (side * radius) / g.rowOverRank;
    moveBranch(v.id, apexX - v.x, apexY - v.y);
    // what leaves the top of the loop heads on, away from the line, clear of the arc
    for (const n of neighboursOf(g, v.id)) {
      if (feet.includes(n)) continue;
      const branch = g.diagram.vertices.get(n)!;
      const length = Math.max(portable.hypot(branch.x - v.x, (branch.y - v.y) * g.rowOverRank), g.rules.loopMinRadius * 1.2);
      const angle = (g.rules.loopEmissionAngle * Math.PI) / 180;
      moveBranch(n, v.x + length * portable.cos(angle) - branch.x, v.y + (side * length * portable.sin(angle)) / g.rowOverRank - branch.y);
    }
    for (const e of lines) {
      if (e.bend !== undefined && !e.bendIsAutomatic) continue;
      // each half runs left to right over the top when travelled from the left foot to the right
      const runsForward = (e.from === left.id && e.to === v.id) || (e.from === v.id && e.to === right.id);
      e.bend = (runsForward ? 1 : -1) * (side < 0 ? 1 : -1) * DEGREES_OF_QUARTER_CIRCLE;
    }
  }
}

/** One rung of a ladder: a line from a vertex on a rail to a vertex on a second fermion line. */
interface Rung { rail: number; on: string; off: string }

/**
 * Ladders, as in a box diagram drawn on a quark line: a second fermion line joined to a
 * rail by two or more rungs. Returns the rungs of every ladder.
 */
function findLadderRungs(g: Graph): Rung[] {
  const onRail = railPositions(g);
  const candidates: Rung[] = [];
  for (const e of g.diagram.edges) {
    if (e.style.line === "plain" || e.style.line === "none") continue;
    for (const [on, off] of [[e.from, e.to], [e.to, e.from]]) {
      if (onRail.has(on) && !onRail.has(off) && g.neighbours.has(off) && !isLeg(g, off)) {
        candidates.push({ rail: onRail.get(on)!.rail, on, off });
      }
    }
  }
  const joinedByFermionLine = (a: string, b: string) =>
    g.diagram.edges.some((e) => e.style.line === "plain" && ((e.from === a && e.to === b) || (e.from === b && e.to === a)));
  // keep the rungs whose far ends are joined to one another along the second line
  return candidates.filter((rung) => candidates.some((other) =>
    other !== rung && other.rail === rung.rail && other.off !== rung.off && joinedByFermionLine(rung.off, other.off)));
}

/**
 * Square a ladder up: each vertex of the second line sits straight across from the rail
 * vertex its rung comes from, so the rungs are vertical and the box is a rectangle.
 */
export function squareUpLadders(g: Graph, rank: Ranks, moveBranch: (id: string, dx: number, dy: number) => void): void {
  const rungs = findLadderRungs(g).sort((a, b) => rank.get(a.off)! - rank.get(b.off)!);
  const side = loopSide(g);
  for (const rung of rungs) {
    const on = g.diagram.vertices.get(rung.on)!, off = g.diagram.vertices.get(rung.off)!;
    moveBranch(rung.off, on.x - off.x, on.y + side * g.rules.boxMinHeight - off.y);
  }
}

/**
 * Give every loop on a rail room for its labels: the two points where a loop or a box
 * meets the rail are kept at least a house distance apart, by sliding the later one, and
 * everything after it, along the rail.
 */
export function giveLoopsRoom(g: Graph, moveBranch: (id: string, dx: number, dy: number) => void): void {
  const onRail = railPositions(g);
  const spans: { first: string; second: string; least: number }[] = [];
  const addSpan = (a: string, b: string, least: number) => {
    const [first, second] = onRail.get(a)!.index < onRail.get(b)!.index ? [a, b] : [b, a];
    spans.push({ first, second, least });
  };
  for (const e of g.diagram.edges) {
    const a = onRail.get(e.from), b = onRail.get(e.to);
    if (a && b && a.rail === b.rail && a.index !== b.index && e.style.line !== "plain") addSpan(e.from, e.to, 2 * g.rules.loopMinRadius);
  }
  for (const v of g.vertices) {
    if (isLeg(g, v.id) || onRail.has(v.id)) continue;
    const feet = neighboursOf(g, v.id).filter((n) => onRail.has(n));
    if (feet.length === 2 && onRail.get(feet[0])!.rail === onRail.get(feet[1])!.rail) addSpan(feet[0], feet[1], 2 * g.rules.loopMinRadius);
  }
  const rungs = findLadderRungs(g);
  for (const rung of rungs) {
    for (const other of rungs) {
      if (other.rail === rung.rail && onRail.get(other.on)!.index > onRail.get(rung.on)!.index) addSpan(rung.on, other.on, g.rules.boxMinWidth);
    }
  }
  spans.sort((a, b) => onRail.get(a.second)!.index - onRail.get(b.second)!.index);
  for (const span of spans) {
    const first = g.diagram.vertices.get(span.first)!, second = g.diagram.vertices.get(span.second)!;
    const shortfall = span.least - (second.x - first.x);
    if (shortfall > 0) moveBranch(span.second, shortfall, 0);
  }
}

/**
 * A rail that carries a loop is drawn dead level and runs out to the right-hand edge of
 * the diagram, so the loop hangs from a straight line as in the reference diagrams.
 */
export function straightenRailsWithLoops(
  g: Graph, moveBranch: (id: string, dx: number, dy: number) => void, branchOf: (id: string) => string[],
): void {
  const onRail = railPositions(g);
  const railsWithLoops = new Set<number>();
  for (const e of g.diagram.edges) {
    const a = onRail.get(e.from), b = onRail.get(e.to);
    if (a && b && a.rail === b.rail && e.style.line !== "plain") railsWithLoops.add(a.rail);
  }
  for (const v of g.vertices) {
    if (isLeg(g, v.id) || onRail.has(v.id)) continue;
    const feet = neighboursOf(g, v.id).filter((n) => onRail.has(n));
    if (feet.length === 2 && onRail.get(feet[0])!.rail === onRail.get(feet[1])!.rail) railsWithLoops.add(onRail.get(feet[0])!.rail);
  }
  for (const rung of findLadderRungs(g)) railsWithLoops.add(rung.rail);
  // In a hadron-level diagram (spectator lines, named hadrons) every quark line is drawn
  // this way, loop or not.
  const hasSpectator = [...g.diagram.vertices.values()].some((v) =>
    g.legs.has(v.id) && v.role === "in" && g.legs.has(neighboursOf(g, v.id)[0]));
  if (hasSpectator || g.diagram.hadrons.length > 0) g.railPaths.forEach((_, rail) => railsWithLoops.add(rail));
  const rightEdge = Math.max(...g.vertices.map((v) => v.x));
  for (const rail of railsWithLoops) {
    // a rail runs from its incoming end, whichever way its arrows point
    const written = g.railPaths[rail].map((id) => g.diagram.vertices.get(id)!);
    const path = written[written.length - 1].role === "in" && written[0].role !== "in" ? written.slice().reverse() : written;
    const level = path[1].y;
    for (const v of path.slice(2)) if (!isLeg(g, v.id)) moveBranch(v.id, 0, level - v.y);
    path[0].y = level;
    const end = path[path.length - 1];
    if (isLeg(g, end.id)) { end.y = level; end.x = Math.max(end.x, rightEdge); }
    sendEmissionsToLoopSide(g, path.map((v) => v.id), level, branchOf);
  }
}

/**
 * What a rail with a loop emits leaves on the same side as the loop, away from any
 * spectator line: a branch found on the other side is mirrored across the rail.
 */
function sendEmissionsToLoopSide(g: Graph, railIds: string[], level: number, branchOf: (id: string) => string[]): void {
  const onThisRail = new Set(railIds);
  const loopOnTop = loopSide(g);
  // spans along the rail covered by a loop over it
  const spans = g.diagram.edges.filter((e) => e.style.line !== "plain" && onThisRail.has(e.from) && onThisRail.has(e.to))
    .map((e) => [Math.min(g.diagram.vertices.get(e.from)!.x, g.diagram.vertices.get(e.to)!.x), Math.max(g.diagram.vertices.get(e.from)!.x, g.diagram.vertices.get(e.to)!.x)]);
  for (const id of railIds) {
    if (isLeg(g, id)) continue;
    // what leaves a rail vertex under a loop goes away from it, to keep out of the loop; what
    // leaves anywhere else goes the way the loop does
    const x = g.diagram.vertices.get(id)!.x;
    const side = spans.some(([from, to]) => x > from + 1e-6 && x < to - 1e-6) ? -loopOnTop : loopOnTop;
    for (const n of neighboursOf(g, id)) {
      if (onThisRail.has(n)) continue; // (an emitted leg is mirrored like any other branch)
      const root = g.diagram.vertices.get(n)!;
      if (Math.sign(root.y - level) !== -side) continue;
      for (const member of branchOf(n)) {
        const v = g.diagram.vertices.get(member)!;
        v.y = 2 * level - v.y;
      }
    }
    for (const n of neighboursOf(g, id)) {
      // a line across to another quark line (a W exchanged between them) is not a fork to aim
      const onAnotherRail = g.railPaths.some((path) => path.includes(n));
      if (!onThisRail.has(n) && !isLeg(g, n) && !onAnotherRail) aimForkAlongItsLine(g, id, n);
    }
  }
}

/**
 * Turn the fork of legs at a vertex to point the way its line arrived, so that what a
 * quark line emits carries on away from the line instead of opening back towards it.
 */
function aimForkAlongItsLine(g: Graph, fromId: string, vertexId: string): void {
  const from = g.diagram.vertices.get(fromId)!, vertex = g.diagram.vertices.get(vertexId)!;
  const legs = neighboursOf(g, vertexId).filter((n) => isLeg(g, n)).map((n) => g.diagram.vertices.get(n)!);
  if (legs.length < 2) return;
  const angleOf = (dx: number, dy: number) => portable.atan2(dy * g.rowOverRank, dx);
  const arriving = angleOf(vertex.x - from.x, vertex.y - from.y);
  const angles = legs.map((leg) => angleOf(leg.x - vertex.x, leg.y - vertex.y));
  const turn = arriving - angles.reduce((sum, a) => sum + a, 0) / angles.length;
  legs.forEach((leg, i) => {
    const length = portable.hypot(leg.x - vertex.x, (leg.y - vertex.y) * g.rowOverRank);
    leg.x = vertex.x + length * portable.cos(angles[i] + turn);
    leg.y = vertex.y + (length * portable.sin(angles[i] + turn)) / g.rowOverRank;
  });
}

/**
 * Spectator lines: a line that runs from an incoming leg straight to an outgoing leg
 * without taking part. It is drawn level across the full width of the diagram, above
 * the process if its incoming leg was listed first, otherwise below.
 */
export function placeSpectatorLines(g: Graph): void {
  const all = [...g.diagram.vertices.values()];
  const spectators = all.filter((v) => g.legs.has(v.id) && v.role === "in" && g.legs.has(neighboursOf(g, v.id)[0]));
  if (spectators.length === 0) return;
  const spectatorIds = new Set(spectators.flatMap((v) => [v.id, neighboursOf(g, v.id)[0]]));
  const others = all.filter((v) => !spectatorIds.has(v.id));
  if (others.length === 0) return;
  const left = Math.min(...others.map((v) => v.x)), right = Math.max(...others.map((v) => v.x));
  const otherIncoming = others.filter((v) => g.legs.has(v.id) && v.role === "in");
  const firstOtherListed = Math.min(...otherIncoming.map((v) => v.declaredOrder ?? Infinity));
  let top = Math.min(...otherIncoming.map((v) => v.y), Infinity);
  let bottom = Math.max(...otherIncoming.map((v) => v.y), -Infinity);
  if (!isFinite(top)) { top = Math.min(...others.map((v) => v.y)); bottom = Math.max(...others.map((v) => v.y)); }
  // stay clear of any loop that bulges towards the spectator
  for (const e of g.diagram.edges) {
    if (!e.bend) continue;
    const from = g.diagram.vertices.get(e.from)!, to = g.diagram.vertices.get(e.to)!;
    const chord = Math.abs(to.x - from.x);
    const bulge = ((chord / 2) * portable.tan((Math.abs(e.bend) * Math.PI) / 360)) / g.rowOverRank;
    const bulgesUp = (e.bend > 0) === (to.x >= from.x);
    const middle = (from.y + to.y) / 2;
    if (bulgesUp) top = Math.min(top, middle - bulge); else bottom = Math.max(bottom, middle + bulge);
  }
  for (const incoming of spectators) {
    const outgoing = g.diagram.vertices.get(neighboursOf(g, incoming.id)[0])!;
    const goesAbove = (incoming.declaredOrder ?? -1) < firstOtherListed;
    const row = goesAbove ? (top -= g.rules.spectatorGap) : (bottom += g.rules.spectatorGap);
    incoming.x = left; incoming.y = row;
    outgoing.x = right; outgoing.y = row;
  }
}
