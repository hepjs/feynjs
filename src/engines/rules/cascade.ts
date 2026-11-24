import type { Edge } from "../../model.ts";
import type { LayoutRules } from "../../theme.ts";
import type { Ranks } from "./columns.ts";
import { edgeJoining, isLeg, isOutgoingLeg, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";
import { isRailEdge } from "./beams.ts";
import * as portable from "../../geometry/portable-math.ts";

/**
 * Decay cascades, drawn as in the reference diagrams of the ATLAS SUSY group: the
 * decaying chain bends a little at every vertex, so it reads as one arc levelling off,
 * and what it emits leaves on the outer side of the diagram at fixed angles.
 */

/** The drawn edge between two vertices, found in the diagram itself (a detached leg is no longer in the graph). */
function edgeBetweenVertices(g: Graph, a: string, b: string): Edge | undefined {
  return g.diagram.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

/** How a chain vertex is connected: where the chain came from, where it carries on, what it emits. */
export interface ChainLinks {
  vertex: string;
  /** column of the vertex */
  rank: number;
  parent: string;
  /** the next decay vertex, or the leg of the stable particle at the end of the chain */
  carriesOn: string;
  /** everything else leaving the vertex, in the order it was written: legs and whole decaying branches */
  emitted: string[];
}

/**
 * True when two edges belong to one chain: the same family of particle (both
 * supersymmetric, say, as in gluino -> neutralino), or simply drawn the same way.
 */
function isSameKindOfLine(a: Edge | undefined, b: Edge | undefined): boolean {
  if (!a || !b) return false;
  if (a.style.cls || b.style.cls) return a.style.cls === b.style.cls;
  return a.style.line === b.style.line && !!a.style.overlay === !!b.style.overlay;
}

/** Particle name with bars and TeX stripped, so b, \\bar{b} and bbar compare equal. */
const bareName = (label: string | undefined) => (label ?? "").replace(/\\bar|bar|[\\{}\s]/g, "");

/** True when a fermion line splits into a different fermion and a wave-drawn boson. */
export function changesFlavourEmitting(g: Graph, incoming: Edge | undefined, onward: string[], vertexId: string): boolean {
  if (!incoming || incoming.style.line !== "plain" || !onward.every((n) => isLeg(g, n))) return false;
  const lines = onward.map((n) => ({ edge: edgeJoining(g, vertexId, n), leg: g.diagram.vertices.get(n)! }));
  const boson = lines.find((l) => l.edge?.style.line === "wave");
  const fermion = lines.find((l) => l.edge?.style.line === "plain");
  if (!boson || !fermion || !incoming.label || !fermion.leg.label) return false;
  return bareName(incoming.label) !== bareName(fermion.leg.label);
}

/**
 * The chain links of a vertex, or undefined if it is not part of a decay chain.
 *
 * A chain vertex has one parent and exactly one thing that carries the chain on. The
 * line that stays the same kind of particle is the chain; failing that, the only branch
 * that decays further is. Several alike (H -> HH) is a symmetric split, not a chain.
 */
function chainLinksAt(g: Graph, rank: Ranks, vertexId: string): ChainLinks | undefined {
  const vertexRank = rank.get(vertexId)!;
  if (vertexRank < 2) return undefined;
  const around = neighboursOf(g, vertexId);
  // an incoming fermion line passing through is a rail, and the rail rules place it
  if (around.some((n) => isRailEdge(g, vertexId, n))) return undefined;
  const parents = around.filter((n) => !isLeg(g, n) && rank.get(n)! < vertexRank);
  if (parents.length !== 1 || around.some((n) => !isLeg(g, n) && rank.get(n) === vertexRank)) return undefined;

  const furtherDecays = around.filter((n) => !isLeg(g, n) && rank.get(n)! > vertexRank);
  // A particle that splits into two that both go on to decay (T -> Z t) opens symmetrically
  // about its own direction: neither branch is the chain, so nothing is singled out.
  if (furtherDecays.length >= 2) return undefined;
  const onward = around.filter((n) => isOutgoingLeg(g, n) || furtherDecays.includes(n));
  const incoming = edgeJoining(g, parents[0], vertexId);
  if (furtherDecays.length === 0 && onward.length === 2 && changesFlavourEmitting(g, incoming, onward, vertexId)) return undefined;
  // A fermion that turns into a different fermion plus a vector boson (b -> t W) is a decay,
  // not radiation: the two products open symmetrically about the line instead of one carrying on.
  const alike = onward.filter((n) => isSameKindOfLine(edgeJoining(g, vertexId, n), incoming));
  // Several alike (a W radiating photons, both drawn wavy): the chain is the one that
  // goes on to decay. Several alike that all decay further (H -> HH) is a split, not a chain.
  const alikeAndDecaying = alike.filter((n) => furtherDecays.includes(n));
  // Where the line alike is a final-state leg but something else decays further, the
  // cascade carries on into that decay and the leg is what is emitted: a chi that leaves
  // each stage in turn, or a dark fermion leaving a line that goes on to a dark photon.
  if (alike.length === 1 && !furtherDecays.includes(alike[0]) && furtherDecays.length === 1) {
    return { vertex: vertexId, rank: vertexRank, parent: parents[0], carriesOn: furtherDecays[0],
      emitted: onward.filter((n) => n !== furtherDecays[0]) };
  }
  const carriesOn = alike.length === 1 ? alike[0]
    : alike.length > 1 && alikeAndDecaying.length === 1 ? alikeAndDecaying[0]
    : alike.length === 0 && furtherDecays.length === 1 ? furtherDecays[0]
    : undefined;
  if (!carriesOn) return undefined;
  return { vertex: vertexId, rank: vertexRank, parent: parents[0], carriesOn, emitted: onward.filter((n) => n !== carriesOn) };
}

/** The chain links of every chain vertex. Must be read before any leg is detached. */
export function findDecayChains(g: Graph, rank: Ranks): Map<string, ChainLinks> {
  const chains = new Map<string, ChainLinks>();
  for (const v of g.vertices) {
    if (isLeg(g, v.id)) continue;
    const links = chainLinksAt(g, rank, v.id);
    if (links) chains.set(v.id, links);
  }
  return chains;
}

/**
 * Take emitted legs out of the graph, so the chains settle without them. Emitted
 * branches that decay further stay in: they are moved into place afterwards.
 */
export function detachEmittedLegs(g: Graph, rank: Ranks, chains: Map<string, ChainLinks>): void {
  for (const links of chains.values()) {
    const removed = new Set(links.emitted.filter((n) => isLeg(g, n)));
    if (removed.size === 0) continue;
    g.vertices = g.vertices.filter((v) => !removed.has(v.id));
    g.neighbours.set(links.vertex, neighboursOf(g, links.vertex).filter((n) => !removed.has(n)));
    for (const leg of removed) { g.neighbours.delete(leg); g.legs.delete(leg); rank.delete(leg); }
  }
}

/** Earliest position, in the author's `out:` list, of any leg a branch ends in. */
export function listedOutcome(g: Graph, rank: Ranks, rootId: string): number | undefined {
  let earliest: number | undefined;
  const seen = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    const v = g.diagram.vertices.get(id)!;
    if (v.role === "out" && v.declaredOrder !== undefined && (earliest === undefined || v.declaredOrder < earliest)) {
      earliest = v.declaredOrder;
    }
    for (const n of g.neighbours.get(id) ?? []) {
      if (seen.has(n) || (rank.get(n) ?? -Infinity) <= (rank.get(id) ?? Infinity)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return earliest;
}

/**
 * Put the emitted legs back into the graph once they have been placed, so that every
 * later step (moving a branch, keeping lines apart) sees the whole diagram again.
 */
export function reattachEmittedLegs(g: Graph, rank: Ranks, chains: Map<string, ChainLinks>): void {
  for (const links of chains.values()) {
    for (const id of links.emitted) {
      if (g.neighbours.has(id)) continue;
      g.neighbours.set(id, [links.vertex]);
      g.neighbours.get(links.vertex)!.push(id);
      g.legs.add(id);
      g.vertices.push(g.diagram.vertices.get(id)!);
      rank.set(id, links.rank + 1);
    }
  }
}

/** A vertex and everything that follows from it: the ids of its whole branch. */
export function branchOf(g: Graph, rank: Ranks, rootId: string): string[] {
  const seen = new Set<string>([rootId]);
  const queue = [rootId];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    for (const n of g.neighbours.get(id) ?? []) {
      if (seen.has(n) || (rank.get(n) ?? -Infinity) <= rank.get(id)!) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return queue;
}

/** Move a vertex and everything that follows from it by the same amount. */
export function moveBranch(g: Graph, rank: Ranks, rootId: string, dx: number, dy: number): void {
  for (const id of branchOf(g, rank, rootId)) {
    const v = g.diagram.vertices.get(id)!;
    v.x += dx;
    v.y += dy;
  }
}

/** Put a vertex, with its branch, at a given point. */
function moveBranchTo(g: Graph, rank: Ranks, rootId: string, x: number, y: number): void {
  const root = g.diagram.vertices.get(rootId)!;
  moveBranch(g, rank, rootId, x - root.x, y - root.y);
}

/**
 * Direction a chain leaves each of its vertices: degrees away from level, on `side`
 * (-1 up, 1 down), with what it emits there leaving on `emitSide`.
 */
export type ChainDirections = Map<string, { angle: number; side: number; emitSide: number; staysLevel?: boolean; arcs?: boolean; emitLevel?: boolean }>;

/**
 * Bend every decay chain into an arc. The chain keeps the direction it was produced in,
 * then turns by a fixed amount towards the midline at each vertex, so it levels off and
 * finally dips back a little, as in the reference diagrams. A chain produced level is
 * the exception: on the midline it recoils when it emits, and off it, it stays level.
 * `lengthOf` gives the drawn length of the line arriving at a vertex.
 */
export function arcDecayChains(
  g: Graph, rank: Ranks, chains: Map<string, ChainLinks>, midline: number, lengthOf: (vertexId: string) => number,
): ChainDirections {
  const leaving: ChainDirections = new Map();
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const inOrder = [...chains.values()].sort((a, b) => a.rank - b.rank);
  for (const links of inOrder) {
    const v = at(links.vertex);
    let arriving = leaving.get(links.parent);
    if (!arriving) {
      // head of a chain: it arrives in the direction the layout produced it
      const parent = at(links.parent);
      const rise = (v.y - parent.y) * g.rowOverRank, run = v.x - parent.x;
      const isProducedLevel = (portable.atan2(Math.abs(rise), run) * 180) / Math.PI < g.rules.levelTolerance;
      if (isProducedLevel) {
        // A level line that emits something recoils: it carries on slightly upward and
        // the emitted particle leaves downward (Higgs-strahlung). With nothing emitted
        // it simply stays straight.
        if (links.emitted.length === 0) continue;
        // within a quarter of a row of the middle counts as on it
        const offMidline = Math.abs(v.y - midline) < 0.25 ? 0 : Math.sign(v.y - midline);
        if (offMidline !== 0) {
          // One of two level rails, above or below the middle: it runs on level, and
          // what it emits leaves on the outer side.
          leaving.set(v.id, { angle: 0, side: offMidline, emitSide: offMidline, staysLevel: true });
          moveBranch(g, rank, links.vertex, 0, parent.y - v.y); // take out the residual tilt
          moveBranchTo(g, rank, links.carriesOn, v.x + lengthOf(links.carriesOn), v.y);
          continue;
        }
        // The author's `out:` list can put the emitted particle on top instead.
        const carriedOutcome = listedOutcome(g, rank, links.carriesOn);
        const emittedOutcome = Math.min(...links.emitted.map((id) => listedOutcome(g, rank, id) ?? Infinity));
        const side = carriedOutcome !== undefined && emittedOutcome < carriedOutcome ? 1 : -1;
        const recoiled = { angle: g.rules.recoilAngle, side, emitSide: -side };
        leaving.set(v.id, recoiled);
        const length = lengthOf(links.carriesOn), radians = (recoiled.angle * Math.PI) / 180;
        moveBranchTo(g, rank, links.carriesOn,
          v.x + length * portable.cos(radians), v.y + (side * length * portable.sin(radians)) / g.rowOverRank);
        continue;
      }
      const side = Math.sign(rise);
      arriving = { angle: (portable.atan2(Math.abs(rise), run) * 180) / Math.PI, side, emitSide: side };
    }
    // Only supersymmetric cascades arc. Any other line that radiates on its way out
    // (a W emitting a photon) carries straight on.
    const incoming = edgeJoining(g, links.parent, links.vertex);
    const arcs = !arriving.staysLevel && incoming?.style.cls === "susy";
    // A boson radiated from a final-state fermion line goes forward, level, between the two
    // fermions; the fermion carries on turned outward. (The inverse of a cascade, where the
    // chain runs straight and what it emits leaves at an angle.)
    const radiatesLevel = !arriving.staysLevel && !arcs && incoming?.style.line === "plain" && !incoming.style.cls
      && links.emitted.length > 0 && links.emitted.every((id) => !g.neighbours.has(id) && edgeBetweenVertices(g, links.vertex, id)?.style.line !== "plain");
    const turned = arcs ? { ...arriving, arcs, angle: Math.max(g.rules.chainFloor, arriving.angle - g.rules.chainTurn) }
      : radiatesLevel ? { ...arriving, arcs, angle: arriving.angle + g.rules.fermionBendOut, emitLevel: true }
      : { ...arriving, arcs };
    leaving.set(v.id, turned);
    const radians = (turned.angle * Math.PI) / 180, length = lengthOf(links.carriesOn);
    moveBranchTo(g, rank, links.carriesOn,
      v.x + length * portable.cos(radians),
      v.y + (turned.side * length * portable.sin(radians)) / g.rowOverRank);
  }
  return leaving;
}

/** Angles, in degrees from the chain, for n things emitted at one vertex: steepest first. */
function emissionAngles(rules: LayoutRules, count: number): number[] {
  if (count === 1) return [rules.singleEmissionAngle];
  const [steepest, shallowest] = rules.emissionFan;
  return Array.from({ length: count }, (_, i) => steepest + ((shallowest - steepest) * i) / (count - 1));
}

/**
 * Place what each chain vertex emits, fanning away from the midline of the diagram.
 * A leg is put at the end of its line; a branch that decays further is moved whole.
 * `legLengthAt` gives the leg length for a vertex in a column, `lineLengthInto` the
 * length of the line arriving at a vertex.
 */
export function placeDecayEmissions(
  g: Graph, rank: Ranks, chains: Map<string, ChainLinks>, midline: number,
  legLengthAt: (rank: number) => number, lineLengthInto: (vertexId: string) => number, directions: ChainDirections,
): void {
  const inOrder = [...chains.values()].sort((a, b) => a.rank - b.rank);
  for (const links of inOrder) {
    if (links.emitted.length === 0) continue;
    const vertex = g.diagram.vertices.get(links.vertex)!;
    const chain = directions.get(links.vertex);
    const awayFromMidline = chain ? chain.emitSide : vertex.y > midline + 1e-6 ? 1 : -1;
    // Lean the fan with the chain when both go the same way: by half the chain's tilt in
    // an arcing SUSY cascade, by all of it where the line runs straight on (a W that
    // radiates on its way out emits at the same angle to itself wherever it points).
    const sameWay = chain && chain.emitSide === chain.side && !chain.staysLevel;
    const tilt = !sameWay ? 0 : chain.arcs === false ? chain.angle : chain.angle / 2;
    const angles = chain?.emitLevel
      ? links.emitted.map((_, i) => (i - (links.emitted.length - 1) / 2) * g.rules.levelEmissionSpread)
      : emissionAngles(g.rules, links.emitted.length);
    links.emitted.forEach((id, i) => {
      // a leg is short; a branch that decays further gets a full line to its next vertex
      const busy = 1 + g.rules.busyVertexStretch * Math.max(0, g.diagram.edges.filter((e) => e.from === links.vertex || e.to === links.vertex).length - 3);
      const length = (g.neighbours.has(id) ? lineLengthInto(id) : legLengthAt(links.rank)) * busy;
      const angle = (Math.min(88, angles[i] + (chain?.emitLevel ? 0 : tilt)) * Math.PI) / 180;
      const x = vertex.x + length * portable.cos(angle);
      const y = vertex.y + (awayFromMidline * length * portable.sin(angle)) / g.rowOverRank;
      if (g.neighbours.has(id)) moveBranchTo(g, rank, id, x, y);
      else { const leg = g.diagram.vertices.get(id)!; leg.x = x; leg.y = y; }
    });
  }
}

/**
 * In a cascade that is not supersymmetric, a stable particle emitted early on (a dark
 * matter chi) is drawn long, reaching most of the way to the last particles of the
 * cascade, so the eye can follow it out to the final state alongside them.
 */
export function extendEarlyEmissions(g: Graph, chains: Map<string, ChainLinks>): void {
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const outgoingEnds = [...g.legs].map(at).filter((v) => v.role === "out").map((v) => v.x);
  if (outgoingEnds.length === 0) return;
  const finalColumn = Math.max(...outgoingEnds);
  for (const links of chains.values()) {
    const incoming = edgeJoining(g, links.parent, links.vertex);
    if (incoming?.style.cls === "susy") continue;
    const vertex = at(links.vertex);
    for (const id of links.emitted) {
      if (!g.legs.has(id) && g.neighbours.has(id)) continue; // a branch, not a leg
      const leg = at(id);
      const dx = leg.x - vertex.x, dy = leg.y - vertex.y;
      // only a stable fermion heading on through the diagram (not radiated bosons, and not
      // a leg dropping steeply away)
      const line = edgeJoining(g, links.vertex, id);
      if (line?.style.line !== "plain" || dx <= 0 || Math.abs(dy) * g.rowOverRank > dx * 1.2) continue;
      const reach = finalColumn - g.rules.legLength * g.rules.earlyEmissionShortfall - vertex.x;
      const scale = Math.min(g.rules.earlyEmissionMaxStretch, reach / dx);
      if (scale <= 1) continue;
      leg.x = vertex.x + dx * scale;
      leg.y = vertex.y + dy * scale;
    }
  }
}
