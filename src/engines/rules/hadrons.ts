import type { Vertex } from "../../model.ts";
import { edgeJoining, edgeKey, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";

/**
 * Hadrons in the final state line up: the quark lines of every outgoing hadron end at
 * the same distance across the diagram, so the hadrons stack in one column (J/psi above
 * D_s, say), each a clear gap below the one before.
 */
export function lineUpOutgoingHadrons(g: Graph): void {
  const groups = g.diagram.hadrons
    .map((h) => h.legs.map((id) => g.diagram.vertices.get(id)).filter((v): v is Vertex => v !== undefined && g.legs.has(v.id)))
    .filter((legs) => legs.length > 0 && legs.every((v) => v.role === "out"));
  if (groups.length < 2) return;
  seatVacuumPairs(g, groups);
  // a hadron-level diagram is at least a set width, from the incoming hadron to the outgoing ones
  const incomingEnds = g.diagram.hadrons.flatMap((h) => h.legs).map((id) => g.diagram.vertices.get(id))
    .filter((v): v is Vertex => v !== undefined && v.role === "in").map((v) => v.x);
  const leftEdge = incomingEnds.length ? Math.min(...incomingEnds) : -Infinity;
  const rightEdge = Math.max(...groups.flat().map((v) => v.x), leftEdge + g.rules.hadronDiagramWidth);
  for (const legs of groups) for (const v of legs) v.x = rightEdge;
  const span = (legs: Vertex[]) => ({ top: Math.min(...legs.map((v) => v.y)), bottom: Math.max(...legs.map((v) => v.y)) });
  // A hadron whose quarks all come from one vertex (a W's decay products) can move; one
  // made from quark lines that run through the diagram stays where those lines put it.
  const producedTogether = (legs: Vertex[]) => new Set(legs.map((v) => neighboursOf(g, v.id)[0])).size === 1;
  // Hadrons that stay put still keep a gap between them, unless one is the end of a quark
  // line running straight through the diagram (a spectator), which must stay level.
  const runsThrough = (legs: Vertex[]) => legs.some((v) => {
    const from = neighboursOf(g, v.id)[0];
    return g.legs.has(from) || g.rails.has(edgeKey(from, v.id));
  });
  const fixed = groups.filter((legs) => !producedTogether(legs));
  const movable = groups.filter(producedTogether);
  // Quark lines within a hadron are spaced alike in every hadron, so the hadrons match,
  // and run top to bottom in the order the author listed them. Spectator ends stay level.
  const fromVacuum = new Set(vacuumPairs(g, groups).flatMap((pair) => pair.legs.map((v) => v.id)));
  for (const legs of groups) {
    if (runsThrough(legs) || legs.some((v) => fromVacuum.has(v.id))) continue;
    const middle = legs.reduce((sum, v) => sum + v.y, 0) / legs.length;
    legs.forEach((v, k) => { v.y = middle + (k - (legs.length - 1) / 2) * g.rules.legSpread; });
  }
  for (const legs of movable) {
    // and it keeps a clear gap from every hadron that stays put
    for (const other of fixed) {
      const here = span(legs), there = span(other);
      const above = (here.top + here.bottom) / 2 < (there.top + there.bottom) / 2;
      const shift = above ? Math.min(0, there.top - g.rules.hadronGap - here.bottom) : Math.max(0, there.bottom + g.rules.hadronGap - here.top);
      for (const v of legs) v.y += shift;
    }
  }
  {
    const ordered = groups.filter((legs) => !producedTogether(legs) && !runsThrough(legs) || fixed.length === 0)
      .slice().sort((a, b) => span(a).top - span(b).top);
    for (let i = 1; i < ordered.length; i++) {
      const shortfall = span(ordered[i - 1]).bottom + g.rules.hadronGap - span(ordered[i]).top;
      if (shortfall > 0) for (const v of ordered[i]) v.y += shortfall;
    }
  }
  for (const legs of movable) bringProducerAlongside(g, legs, rightEdge);
  placePairsBetweenHadrons(g, groups, rightEdge);
}

/**
 * A quark pair made from nothing, one quark into each of two hadrons, starts from a point
 * just before the hadrons, level with the gap between its two quarks.
 */
function placePairsBetweenHadrons(g: Graph, groups: Vertex[][], rightEdge: number): void {
  for (const { vertex, legs, vacuum } of vacuumPairs(g, groups)) {
    // it sits level with the gap between the two hadrons, opposite their facing quarks
    const facing = legs.slice().sort((p, q) => p.y - q.y);
    vertex.x = rightEdge - g.rules.legLength * 1.2;
    vertex.y = (facing[0].y + facing[1].y) / 2;
    // the invisible line it hangs from runs straight back to the left
    if (vacuum) { vacuum.x = vertex.x - g.rules.legLength; vacuum.y = vertex.y; }
  }
}

interface VacuumPair { vertex: Vertex; legs: Vertex[]; vacuum?: Vertex }

/**
 * Quark pairs made from the vacuum: a vertex whose only lines are two outgoing quarks
 * that end in different hadrons, plus (optionally) an invisible line from nowhere.
 */
function vacuumPairs(g: Graph, groups: Vertex[][]): VacuumPair[] {
  const at = (id: string) => g.diagram.vertices.get(id)!;
  const groupOf = (id: string) => groups.findIndex((legs) => legs.some((v) => v.id === id));
  const hidden = (a: string, b: string) => edgeJoining(g, a, b)?.style.line === "none";
  const pairs: VacuumPair[] = [];
  for (const v of g.diagram.vertices.values()) {
    if (!g.neighbours.has(v.id) || g.legs.has(v.id)) continue;
    const around = neighboursOf(g, v.id);
    if (!around.every((n) => g.legs.has(n))) continue;
    const vacuum = around.filter((n) => hidden(v.id, n));
    const quarks = around.filter((n) => !hidden(v.id, n));
    if (quarks.length !== 2 || vacuum.length > 1) continue;
    const [a, b] = quarks.map(groupOf);
    if (a < 0 || b < 0 || a === b) continue;
    pairs.push({ vertex: v, legs: quarks.map(at), vacuum: vacuum.length ? at(vacuum[0]) : undefined });
  }
  return pairs;
}

/**
 * Each quark of a vacuum pair sits beside the quark it binds with, and the hadrons it joins
 * are pushed apart, if need be, to leave room for the pair between them.
 */
function seatVacuumPairs(g: Graph, groups: Vertex[][]): void {
  const spread = g.rules.legSpread, gap = g.rules.hadronGap;
  for (const { legs } of vacuumPairs(g, groups)) {
    const partnerRow = (leg: Vertex) => {
      const others = groups.find((group) => group.includes(leg))!.filter((v) => v !== leg);
      return others.reduce((sum, v) => sum + v.y, 0) / Math.max(1, others.length);
    };
    const seats = legs.map((leg) => ({ leg, partner: partnerRow(leg) })).sort((p, q) => p.partner - q.partner);
    const [upper, lower] = seats;
    const shortfall = upper.partner + 2 * spread + gap - lower.partner;
    if (shortfall > 0) {
      const middle = (upper.partner + lower.partner) / 2;
      const pairIds = new Set(legs.map((v) => v.id));
      for (const v of g.diagram.vertices.values()) {
        if (pairIds.has(v.id) || !g.neighbours.has(v.id)) continue;
        if (v.y > middle) v.y += shortfall;
      }
      lower.partner += shortfall;
    }
    upper.leg.y = upper.partner + spread;
    lower.leg.y = lower.partner - spread;
  }
}

/**
 * When every quark of a hadron comes from one vertex that is not on a beam line (the W
 * decaying into the D_s quarks), that vertex moves out to sit just before the hadron, so
 * its quark lines are the usual length and the line feeding it grows instead.
 */
function bringProducerAlongside(g: Graph, legs: Vertex[], rightEdge: number): void {
  const producers = new Set(legs.map((v) => neighboursOf(g, v.id)[0]));
  if (producers.size !== 1) return;
  const producer = g.diagram.vertices.get([...producers][0])!;
  const onBeam = neighboursOf(g, producer.id).some((n) => g.rails.has(edgeKey(n, producer.id)));
  if (onBeam || neighboursOf(g, producer.id).length !== legs.length + 1) return;
  producer.x = rightEdge - g.rules.legLength;
  producer.y = legs.reduce((sum, v) => sum + v.y, 0) / legs.length;
  // and the point on the quark line where that W was given off moves along the line to
  // sit before it, so the W is short and steep, not a long slant across the diagram
  const source = neighboursOf(g, producer.id).find((n) => !legs.some((v) => v.id === n));
  if (!source) return;
  const emitter = g.diagram.vertices.get(source)!;
  const onLine = neighboursOf(g, emitter.id).filter((n) => n !== producer.id).map((n) => g.diagram.vertices.get(n)!);
  if (onLine.length !== 2) return;
  const [left, right] = onLine.sort((a, b) => a.x - b.x);
  const wanted = producer.x - g.rules.legLength * g.rules.hadronEmissionLead;
  emitter.x = Math.max(left.x + g.rules.legLength * 0.5, Math.min(right.x - g.rules.legLength * 0.5, wanted));
}
