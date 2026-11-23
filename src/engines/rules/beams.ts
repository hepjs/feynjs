/**
 * Everything that happens on a beam line: fermion lines running through the diagram
 * (rails), lines exchanged between two beams, and radiation given off before the hard
 * process. These are the three ways a beam can pass through a vertex, and they are
 * decided together because each rules out the others.
 */
import type { Diagram } from "../../model.ts";
import type { LayoutRules } from "../../theme.ts";
import { attachmentOf, edgeJoining, edgeKey, isIncomingLeg, isLeg, isOutgoingLeg, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";

/** True when a fermion line joins two vertices directly (there may be other lines between them too). */
export function hasFermionLine(g: Graph, a: string, b: string): boolean {
  const direct = g.diagram.edges.some((e) =>
    ((e.from === a && e.to === b) || (e.from === b && e.to === a)) && e.style.line === "plain");
  return direct || g.joinedLines.get(edgeKey(a, b))?.style.line === "plain";
}

/**
 * Rails: fermion lines that run on through a vertex. Where exactly two fermion lines
 * meet, they are one line passing through, and whatever else is attached there was
 * emitted or exchanged by it.
 *
 * Only the rails that carry an incoming particle are found: the scattering lines of
 * the process. The layout keeps those straight and puts what they emit on the inner
 * side, between them. A fermion line inside a decay is left to the decay-chain rules.
 *
 * Each rail is returned as the vertices it passes, starting from its incoming leg.
 */
export function findBeamRails(g: Graph): string[][] {
  const fermionLinesAt = (id: string) => neighboursOf(g, id).filter((n) => hasFermionLine(g, id, n));
  const paths: string[][] = [];
  const seen = new Set<string>();
  for (const leg of g.vertices) {
    if (!isIncomingLeg(g, leg.id)) continue;
    // follow the line from the incoming leg for as long as it passes straight through
    const path = [leg.id];
    let from = leg.id, at = attachmentOf(g, leg.id);
    while (!isLeg(g, at) && !seen.has(edgeKey(from, at))) {
      const lines = fermionLinesAt(at);
      if (lines.length !== 2 || !lines.includes(from)) break;
      // two incoming legs meeting is an annihilation, not a line passing through
      if (lines.every((n) => isIncomingLeg(g, n))) break;
      seen.add(edgeKey(from, at));
      path.push(at);
      const onward = lines.find((n) => n !== from)!;
      from = at;
      at = onward;
    }
    if (path.length > 1) { path.push(at); paths.push(path); }
  }
  return paths;
}

/**
 * Exchange lines: a fermion line that runs from the vertex of one incoming particle to
 * the vertex of another (a t-channel quark between two gluons, say). Everything on it
 * happens at the first instant, so it is drawn as one vertical line, and what it emits
 * leaves to the right. Returns the ids of every vertex on such a line. Lines that are
 * better read as radiation off an incoming leg are left to the radiation rule.
 */
export function findExchangeVertices(g: Graph, radiationEmitters: Set<string>): Set<string> {
  const hasIncomingLeg = (id: string) => neighboursOf(g, id).some((n) => isIncomingLeg(g, n));
  const fermionVertices = (id: string) => neighboursOf(g, id).filter((n) => !isLeg(g, n) && hasFermionLine(g, id, n));
  const found = new Set<string>();
  for (const start of g.vertices) {
    if (isLeg(g, start.id) || !hasIncomingLeg(start.id) || radiationEmitters.has(start.id)) continue;
    // a vertex with two fermion lines running on into the diagram is on a loop, not an exchange
    if (fermionVertices(start.id).length !== 1) continue;
    for (const first of fermionVertices(start.id)) {
      // walk the line until it reaches another incoming particle's vertex, or branches, or ends
      const path = [start.id];
      let from = start.id, at = first;
      while (!hasIncomingLeg(at) && !path.includes(at)) {
        path.push(at);
        const onward = fermionVertices(at).filter((n) => n !== from);
        if (onward.length !== 1) break;
        from = at;
        at = onward[0];
      }
      // the far end may carry the line on (the quark scatters on out of the diagram), but
      // not back round to where it started (a loop)
      const carriesOnFromEnd = fermionVertices(at).filter((n) => !path.includes(n));
      // a boson joining the start to the line beyond the far end is a loop over it (a vertex
      // correction), and the line is then a level run, not an exchange
      const beyond = new Set<string>();
      for (let frontier = [at], step = 0; step < 3; step++) {
        frontier = frontier.flatMap((id) => fermionVertices(id).filter((n) => !path.includes(n) && !beyond.has(n) && n !== at));
        frontier.forEach((n) => beyond.add(n));
      }
      const loopsOverIt = g.diagram.edges.some((e) => e.style.line !== "plain"
        && ((e.from === start.id && beyond.has(e.to)) || (e.to === start.id && beyond.has(e.from))));
      if (loopsOverIt) continue;
      const endsAtAnotherBeam = at !== start.id && hasIncomingLeg(at) && !path.includes(at)
        && carriesOnFromEnd.length <= 1 && !radiationEmitters.has(at);
      if (endsAtAnotherBeam && !path.some((id) => radiationEmitters.has(id))) for (const id of [...path, at]) found.add(id);
    }
  }
  return found;
}

/** The edge keys of every line segment on the given rails. */
export function railEdgeKeys(paths: string[][]): Set<string> {
  const keys = new Set<string>();
  for (const path of paths) for (let i = 1; i < path.length; i++) keys.add(edgeKey(path[i - 1], path[i]));
  return keys;
}

export const isRailEdge = (g: Graph, a: string, b: string) => g.rails.has(edgeKey(a, b));


/** A vertex on an incoming leg that only emits radiation before the hard process. */
export interface Radiation {
  emitter: string;
  incomingLeg: string;
  hardVertex: string;
  radiated: string[];
}

function lineKindBetween(g: Graph, a: string, b: string): string | undefined {
  return edgeJoining(g, a, b)?.style.line;
}

/**
 * Radiation off an incoming leg: the line continues unchanged into the vertex where it
 * meets the other incoming particle, and that vertex carries the process on.
 */
export function findInitialStateRadiation(g: Graph): Radiation[] {
  const found: Radiation[] = [];
  for (const emitter of g.vertices) {
    if (isLeg(g, emitter.id) || g.exchangeVertices.has(emitter.id)) continue;
    const around = neighboursOf(g, emitter.id);
    const incoming = around.filter((n) => isIncomingLeg(g, n));
    const inner = around.filter((n) => !isLeg(g, n));
    const radiated = around.filter((n) => isOutgoingLeg(g, n));
    if (incoming.length !== 1 || inner.length !== 1 || radiated.length === 0) continue;
    const hard = inner[0];
    const hardGoesOn = neighboursOf(g, hard).some((n) => n !== emitter.id && !isLeg(g, n));
    // a fermion line radiates without bending; a boson that emits something does bend
    const incomingKind = lineKindBetween(g, emitter.id, incoming[0]);
    const lineContinues = incomingKind === "plain" && lineKindBetween(g, emitter.id, hard) === incomingKind;
    // The line must then annihilate with the other incoming particle straight away.
    // If the other beam joins further along, the line is exchanged between them instead.
    const hardMeetsOtherBeam = neighboursOf(g, hard).some((n) => n !== emitter.id && isIncomingLeg(g, n));
    if (hardGoesOn && lineContinues && hardMeetsOtherBeam) {
      found.push({ emitter: emitter.id, incomingLeg: incoming[0], hardVertex: hard, radiated });
    }
  }
  return found;
}

/**
 * Take initial-state radiation out of the graph so it cannot distort the main process.
 * The incoming leg is re-attached straight to the hard vertex.
 */
export function detachInitialStateRadiation(g: Graph): Radiation[] {
  const found = findInitialStateRadiation(g);
  for (const r of found) {
    const removed = new Set([r.emitter, ...r.radiated]);
    g.vertices = g.vertices.filter((v) => !removed.has(v.id));
    for (const id of removed) { g.neighbours.delete(id); g.legs.delete(id); }
    g.neighbours.set(r.incomingLeg, [r.hardVertex]);
    g.neighbours.set(r.hardVertex, neighboursOf(g, r.hardVertex).map((n) => (n === r.emitter ? r.incomingLeg : n)));
  }
  return found;
}

/**
 * Put each emitter part-way along its incoming leg, which stays straight, with the
 * radiation leaving on the outer side of the diagram.
 */
export function placeRadiation(d: Diagram, radiation: Radiation[], rules: LayoutRules): void {
  for (const r of radiation) {
    const leg = d.vertices.get(r.incomingLeg)!, hard = d.vertices.get(r.hardVertex)!;
    const emitter = d.vertices.get(r.emitter)!;
    emitter.x = leg.x + (hard.x - leg.x) * rules.radiationAt;
    emitter.y = leg.y + (hard.y - leg.y) * rules.radiationAt;
    const outward = leg.y <= hard.y ? -1 : 1;
    r.radiated.forEach((id, i) => {
      const v = d.vertices.get(id)!;
      v.x = hard.x + rules.radiationOvershoot;
      v.y = emitter.y + outward * (rules.radiationRise + i * rules.rowGap);
    });
  }
}
