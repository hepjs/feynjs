import { isLeg, neighboursOf } from "./graph.ts";
import type { Edge } from "../../model.ts";
import type { Graph } from "./graph.ts";
import { loopSide } from "./arcs.ts";
import { isRailEdge } from "./beams.ts";

/**
 * Breathing room, as general rules rather than per-diagram fixes. Together with the
 * minimum label margin and the minimum loop size (see the theme), this is what keeps a
 * diagram readable when its parts would otherwise crowd each other.
 */

const TWO_PI = 2 * Math.PI;
/** Signed difference between two directions, in radians, in (-pi, pi]. */
const turnBetween = (from: number, to: number) => ((((to - from) % TWO_PI) + TWO_PI + Math.PI) % TWO_PI) - Math.PI;

/**
 * No two lines leave a vertex closer together than the house minimum angle. Where an
 * external leg crowds another line it is swung away, keeping its length. Only legs
 * move: turning a propagator would drag the rest of the diagram with it.
 */
export function keepLinesApartAtVertices(g: Graph): void {
  const least = (g.rules.minLineAngle * Math.PI) / 180;
  if (least <= 0) return;
  const at = (id: string) => g.diagram.vertices.get(id)!;
  for (const vertex of g.diagram.vertices.values()) {
    if (!g.neighbours.has(vertex.id) || isLeg(g, vertex.id)) continue;
    const around = neighboursOf(g, vertex.id);
    if (around.length < 2) continue;
    const directionTo = (id: string) => Math.atan2((at(id).y - vertex.y) * g.rowOverRank, at(id).x - vertex.x);
    for (const legId of around) {
      // the end of a scattering line carries straight on: it is the other lines that leave it
      if (!isLeg(g, legId) || isRailEdge(g, vertex.id, legId)) continue;
      const own = directionTo(legId);
      // the neighbouring line it is closest to
      let nearest = Infinity;
      for (const other of around) {
        if (other === legId) continue;
        const turn = turnBetween(directionTo(other), own);
        if (Math.abs(turn) < Math.abs(nearest)) nearest = turn;
      }
      if (Math.abs(nearest) >= least) continue;
      const awayFromIt = nearest >= 0 ? 1 : -1;
      const swungTo = own + awayFromIt * (least - Math.abs(nearest));
      const leg = at(legId);
      const length = Math.hypot(leg.x - vertex.x, (leg.y - vertex.y) * g.rowOverRank);
      leg.x = vertex.x + length * Math.cos(swungTo);
      leg.y = vertex.y + (length * Math.sin(swungTo)) / g.rowOverRank;
    }
  }
}

/**
 * What a scattering line emits leaves it at a clear angle. A branch that would run
 * almost alongside the line is swung out to the house minimum, on the side it was on,
 * keeping its length and taking everything that follows with it.
 */
export function keepEmissionsOffTheirLine(g: Graph, moveBranchTo: (id: string, x: number, y: number) => void): void {
  const least = (g.rules.minEmissionAngle * Math.PI) / 180;
  const at = (id: string) => g.diagram.vertices.get(id)!;
  for (const path of g.railPaths) {
    const onThisRail = new Set(path);
    for (const id of path) {
      if (!g.neighbours.has(id) || isLeg(g, id)) continue;
      const vertex = at(id);
      for (const n of neighboursOf(g, id)) {
        if (onThisRail.has(n) || at(n).x <= vertex.x) continue;
        const run = at(n).x - vertex.x, rise = (at(n).y - vertex.y) * g.rowOverRank;
        const angle = Math.atan2(Math.abs(rise), run);
        if (angle >= least) continue;
        // a level emission leaves on the side away from any loop on the rail
        const length = Math.hypot(run, rise), side = Math.abs(rise) < 1e-9 ? -loopSide(g) : Math.sign(rise);
        moveBranchTo(n, vertex.x + length * Math.cos(least), vertex.y + (side * length * Math.sin(least)) / g.rowOverRank);
      }
    }
  }
}

/**
 * How wide a fork opens, as the angle of its outermost line from the direction the
 * fork points. Two lines stay close together; each further line earns the fork more
 * room, up to a limit. A line can only stand far out from the others when there are
 * enough of them to fill the space between.
 */
export function forkHalfAngle(g: Graph, lineCount: number, forTwoLines: number): number {
  return Math.min(g.rules.maxForkAngle, forTwoLines + g.rules.forkAnglePerExtraLine * Math.max(0, lineCount - 2));
}

/** Distance from point p to the segment a-b, all in drawn proportions. */
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Shortest distance between segments a-b and c-d (zero when they cross). */
function segmentGap(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): number {
  const cross = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  const d1 = cross(cx, cy, dx, dy, ax, ay), d2 = cross(cx, cy, dx, dy, bx, by);
  const d3 = cross(ax, ay, bx, by, cx, cy), d4 = cross(ax, ay, bx, by, dx, dy);
  if (d1 * d2 < 0 && d3 * d4 < 0) return 0;
  return Math.min(
    distanceToSegment(ax, ay, cx, cy, dx, dy), distanceToSegment(bx, by, cx, cy, dx, dy),
    distanceToSegment(cx, cy, ax, ay, bx, by), distanceToSegment(dx, dy, ax, ay, bx, by));
}

/**
 * External legs keep a margin from everything that is not theirs: the lines they are not
 * joined to, and the blobs and dots that are not at their own vertex. A leg that runs into
 * or close past one is swung away a few degrees at a time (the other way too if that does not
 * clear it), and shortened if swinging is not enough. Lines sharing a vertex with the leg
 * are its own, and a beam's own outgoing half carries straight on.
 */
export function keepLegsClear(g: Graph): void {
  const r = g.rowOverRank;
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const segments = g.diagram.edges.filter((e) => e.from !== e.to && !e.bend && g.neighbours.has(e.from) && g.neighbours.has(e.to));
  const marks = [...g.diagram.vertices.values()].filter((v) => g.markRadius(v) > 0 && g.neighbours.has(v.id));
  const step = (4 * Math.PI) / 180;
  const lineMargin = g.rules.lineMargin * r;

  for (const legId of [...g.legs]) {
    if (!g.neighbours.has(legId)) continue;
    const pivotId = neighboursOf(g, legId)[0];
    if (isRailEdge(g, pivotId, legId)) continue;
    const pivot = at(pivotId), leg = at(legId);
    const lines = segments.filter((e) => ![e.from, e.to].includes(legId) && ![e.from, e.to].includes(pivotId));
    const discs = marks.filter((m) => m.id !== pivotId && m.id !== legId);

    /** The obstacle the leg is most inside of, how far inside it is, and the point to turn away from. */
    const worst = () => {
      let best = { slack: Infinity, gap: Infinity, x: 0, y: 0, other: undefined as Edge | undefined, isLegLine: false };
      for (const e of lines) {
        const a = at(e.from), b = at(e.to);
        const gap = segmentGap(pivot.x, pivot.y * r, leg.x, leg.y * r, a.x, a.y * r, b.x, b.y * r);
        if (gap - lineMargin < best.slack) {
          best = { slack: gap - lineMargin, gap, x: (a.x + b.x) / 2, y: ((a.y + b.y) / 2) * r, other: e, isLegLine: g.legs.has(e.from) || g.legs.has(e.to) };
        }
      }
      for (const m of discs) {
        const gap = distanceToSegment(m.x, m.y * r, pivot.x, pivot.y * r, leg.x, leg.y * r);
        const margin = (g.markRadius(m) + g.rules.markMargin) * r;
        if (gap - margin < best.slack) best = { slack: gap - margin, gap, x: m.x, y: m.y * r, other: undefined, isLegLine: false };
      }
      return best;
    };

    let nearest = worst();
    if (nearest.slack >= 0) continue;
    // two final-state lines crossing because the author listed their legs in the opposite
    // order to their vertices (a u-channel) are left crossed
    if (nearest.gap === 0 && nearest.isLegLine && nearest.other && crossesOnPurpose(g, leg, nearest.other)) continue;

    const length = Math.hypot(leg.x - pivot.x, (leg.y - pivot.y) * r);
    const own = Math.atan2((leg.y - pivot.y) * r, leg.x - pivot.x);
    const toObstacle = Math.atan2(nearest.y - pivot.y * r, nearest.x - pivot.x);
    const away = Math.sin(own - toObstacle) >= 0 ? 1 : -1;
    const place = (angle: number, len: number) => {
      leg.x = pivot.x + len * Math.cos(angle);
      leg.y = pivot.y + (len * Math.sin(angle)) / r;
    };
    for (const direction of [away, -away]) {
      for (let turned = step; turned <= Math.PI / 4 && nearest.slack < 0; turned += step) {
        place(own + direction * turned, length);
        nearest = worst();
      }
      if (nearest.slack >= 0) break;
      place(own, length);
      nearest = worst();
    }
    if (nearest.slack >= 0) continue;
    // still too close: put the angle back and shorten instead
    place(own, length);
    for (let len = length * 0.9; len >= length * 0.5 && worst().slack < 0; len *= 0.9) place(own, len);
  }
}

/**
 * A particle in the final state does not head in towards an outgoing beam beside it.
 * Where a leg would converge on the beam leg next to it by more than a few degrees, it
 * is turned to run no closer to parallel than that, keeping its length.
 */
export function keepFinalStatesOffBeams(g: Graph): void {
  const r = g.rowOverRank, tolerance = (g.rules.convergenceTolerance * Math.PI) / 180;
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const isBeamLeg = (legId: string) => {
    const from = neighboursOf(g, legId)[0];
    return isRailEdge(g, from, legId) || neighboursOf(g, from).some((n) => n !== legId && g.legs.has(n) && at(n).role === "in");
  };
  const outgoing = [...g.legs].filter((id) => g.neighbours.has(id) && at(id).role === "out")
    .map((id) => ({ id, from: at(neighboursOf(g, id)[0]), end: at(id) }))
    .filter((leg) => leg.end.x > leg.from.x);
  const rise = (leg: (typeof outgoing)[number]) => Math.atan2(-(leg.end.y - leg.from.y) * r, leg.end.x - leg.from.x);
  for (const beam of outgoing.filter((leg) => isBeamLeg(leg.id))) {
    for (const leg of outgoing) {
      if (leg === beam || leg.from === beam.from || isBeamLeg(leg.id)) continue;
      // the two products of a decay open as a fork and keep their angle
      if (outgoing.some((other) => other !== leg && other.from === leg.from)) continue;
      // the beam must be the next line out from the leg, on the side the leg heads for
      // which side of the leg the beam is on: by their ends, which is what the eye compares
      const beamIsAbove = beam.end.y < leg.end.y;
      const between = outgoing.some((other) => other !== leg && other !== beam
        && (beamIsAbove ? other.end.y > beam.end.y && other.end.y < leg.end.y : other.end.y < beam.end.y && other.end.y > leg.end.y));
      if (between) continue;
      const towards = beamIsAbove ? rise(leg) - rise(beam) : rise(beam) - rise(leg);
      if (towards <= tolerance) continue;
      const target = beamIsAbove ? rise(beam) + tolerance : rise(beam) - tolerance;
      const length = Math.hypot(leg.end.x - leg.from.x, (leg.end.y - leg.from.y) * r);
      leg.end.x = leg.from.x + length * Math.cos(target);
      leg.end.y = leg.from.y - (length * Math.sin(target)) / r;
    }
  }
}

/** True when two legs cross because the author's `out:` order is the reverse of the order of their vertices. */
function crossesOnPurpose(g: Graph, leg: { id: string }, other: Edge): boolean {
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const otherLeg = g.legs.has(other.from) ? other.from : other.to;
  const mine = at(leg.id).declaredOrder, theirs = at(otherLeg).declaredOrder;
  if (mine === undefined || theirs === undefined) return false;
  const pivotMine = at(neighboursOf(g, leg.id)[0]), pivotTheirs = at(neighboursOf(g, otherLeg)[0]);
  return Math.sign(mine - theirs) !== Math.sign(pivotMine.y - pivotTheirs.y);
}
