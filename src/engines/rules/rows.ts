import type { Vertex } from "../../model.ts";
import type { Columns, Ranks } from "./columns.ts";
import { attachmentOf, isIncomingLeg, isLeg, mean, neighboursOf, passThroughAt } from "./graph.ts";
import type { PassThrough } from "./graph.ts";
import type { Graph } from "./graph.ts";
import { listedOutcome } from "./cascade.ts";
import { hasFermionLine, isRailEdge } from "./beams.ts";

/** Vertical position of every vertex, in rows (down is positive). */
export type Rows = Map<string, number>;

/**
 * Positions that keep the given order and minimum gaps while staying as close as possible
 * to where each item wants to be (weighted isotonic regression). A heavy item gives way
 * less than a light one: vertices are heavy and legs light, so a crowded column moves its
 * legs aside and leaves the vertices where the rest of the diagram put them.
 */
export function spreadKeepingOrder(wanted: number[], minGaps: number[], weights?: number[]): number[] {
  const offset = [0];
  for (let i = 1; i < wanted.length; i++) offset.push(offset[i - 1] + minGaps[i - 1]);
  const blocks: { weightedSum: number; weight: number; count: number }[] = [];
  for (let i = 0; i < wanted.length; i++) {
    const w = weights?.[i] ?? 1;
    blocks.push({ weightedSum: w * (wanted[i] - offset[i]), weight: w, count: 1 });
    while (blocks.length > 1) {
      const last = blocks[blocks.length - 1], before = blocks[blocks.length - 2];
      if (before.weightedSum / before.weight <= last.weightedSum / last.weight) break;
      before.weightedSum += last.weightedSum; before.weight += last.weight; before.count += last.count;
      blocks.pop();
    }
  }
  const placed: number[] = [];
  for (const b of blocks) for (let k = 0; k < b.count; k++) placed.push(b.weightedSum / b.weight + offset[placed.length]);
  return placed;
}

/** True when both vertices come after the first interaction: products of a decay or a pair production. */
function areBothProduced(rank: Ranks, a: Vertex, b: Vertex): boolean {
  return rank.get(a.id)! > 1 && rank.get(b.id)! > 1;
}

/**
 * Vertical gap between two decay chains. It makes the pair open at the house branch
 * angle over the first propagator; after that the chains run parallel.
 */
function branchGap(g: Graph): number {
  return (2 * Math.tan((g.rules.branchAngle * Math.PI) / 180)) / g.rowOverRank;
}

/** How far, in rows, the fork of outgoing legs at a vertex reaches above and below it. */
function forkHalfHeight(g: Graph, v: Vertex): number {
  const outgoingLegs = neighboursOf(g, v.id).filter((n) => isLeg(g, n) && !isIncomingLeg(g, n));
  if (outgoingLegs.length < 2) return 0;
  const reach = g.rules.legLength * Math.sin((g.rules.decayForkAngle * Math.PI) / 180);
  return reach / g.rowOverRank;
}

/** Smallest vertical distance allowed between two neighbours in a column. */
function minimumGap(g: Graph, rank: Ranks, upper: Vertex, lower: Vertex): number {
  return spacingFor(g, rank, upper, lower) + roomForMarks(g, upper, lower);
}

/**
 * Extra room where the vertices carry something drawn: a blob or dot needs its own size
 * plus a margin clear of its neighbour, and legs of two different hadrons need room for
 * both hadrons. Lines joined to each other are left alone: a blob need not keep clear of
 * its own lines.
 */
function roomForMarks(g: Graph, upper: Vertex, lower: Vertex): number {
  const joined = neighboursOf(g, upper.id).includes(lower.id);
  const marks = g.markRadius(upper) + g.markRadius(lower);
  const blobLike = (v: Vertex) => v.shape === "blob" || v.shape === "hatched" || v.shape === "smallblob";
  let extra = joined ? 0 : marks + (blobLike(upper) || blobLike(lower) ? g.rules.markMargin : 0);
  const hadronOf = (v: Vertex) => g.diagram.hadrons.findIndex((h) => h.legs.includes(v.id));
  const a = hadronOf(upper), b = hadronOf(lower);
  if (a >= 0 && b >= 0 && a !== b) extra = Math.max(extra, g.rules.hadronGap);
  return extra;
}

function spacingFor(g: Graph, rank: Ranks, upper: Vertex, lower: Vertex): number {
  const upperIsLeg = isLeg(g, upper.id), lowerIsLeg = isLeg(g, lower.id);
  if (!upperIsLeg && !lowerIsLeg) {
    if (neighboursOf(g, upper.id).includes(lower.id)) return g.rules.tChannelGap;
    // separate decay chains stay close, so they open gently from where they were produced
    if (!areBothProduced(rank, upper, lower)) return g.rules.rowGap * 2;
    // and far enough apart that the forks hanging off them do not overlap
    return Math.max(branchGap(g), forkHalfHeight(g, upper) + forkHalfHeight(g, lower) + g.rules.rowGap * 0.4);
  }
  if (upperIsLeg && lowerIsLeg) {
    const upperFrom = attachmentOf(g, upper.id), lowerFrom = attachmentOf(g, lower.id);
    if (upperFrom === lowerFrom) return g.rules.legSpread;
    // the ends of two decay chains stay as far apart as the chains themselves
    const areSeparateChains = !neighboursOf(g, upperFrom).includes(lowerFrom);
    if (areSeparateChains && rank.get(upperFrom)! > 1 && rank.get(lowerFrom)! > 1) return branchGap(g);
    return g.rules.rowGap;
  }
  // what a scattering line emits must leave it at a clear angle, so it sits a full step
  // away from the end of that line
  const leg = upperIsLeg ? upper : lower;
  if (upperIsLeg !== lowerIsLeg && isRailEdge(g, leg.id, attachmentOf(g, leg.id))) return g.rules.rowGap * 1.2;
  // a leg beside a vertex it does not belong to needs less room than two legs do
  return g.rules.rowGap * g.rules.legBesideVertexGap;
}

/**
 * Settle the vertical positions. Each vertex is pulled towards the vertices it connects
 * to, most strongly along propagators so that decay chains run straight, while the
 * column order and minimum gaps are kept.
 */
export function relaxRows(g: Graph, rank: Ranks, columns: Columns): Rows {
  const ranks = [...columns.keys()].sort((a, b) => a - b);
  const y: Rows = new Map();
  const placeInColumn = new Map<string, number>();
  for (const column of columns.values()) {
    column.forEach((v, i) => {
      y.set(v.id, (i - (column.length - 1) / 2) * g.rules.legSpread);
      placeInColumn.set(v.id, i);
    });
  }
  const isOnRail = (id: string) => neighboursOf(g, id).some((n) => isRailEdge(g, id, n));
  const innerNeighbours = (id: string, later: boolean) =>
    neighboursOf(g, id).filter((n) => !isLeg(g, n) && (later ? rank.get(n)! > rank.get(id)! : rank.get(n)! < rank.get(id)!));
  /** A trunk: the single propagator between two stages of the process. It is drawn level. */
  const isTrunk = (a: string, b: string): boolean => {
    const [earlier, later] = rank.get(a)! < rank.get(b)! ? [a, b] : [b, a];
    if (isLeg(g, earlier) || isLeg(g, later)) return false;
    if (isOnRail(earlier)) return false; // what a scattering line emits leaves it at an angle
    return innerNeighbours(earlier, true).length === 1 && innerNeighbours(later, false).length === 1;
  };
  const wantedRow = (v: Vertex, r: number): number => {
    let sum = 0, weight = 0;
    for (const n of neighboursOf(g, v.id)) {
      if (rank.get(n) === r) {
        // same column: keep the propagator between them at its natural length
        // an exchanged line between two vertices of one column keeps its length firmly
        const isBelow = placeInColumn.get(n)! > placeInColumn.get(v.id)!;
        const w = isLeg(g, n) || isLeg(g, v.id) ? 1 : g.rules.railWeight;
        sum += w * (y.get(n)! + (isBelow ? -g.rules.tChannelGap : g.rules.tChannelGap));
        weight += w;
      } else {
        // a vertex on a rail follows the rail; what it emits has little say in where it sits
        // rails hold their vertices level; legs follow their vertex and never lead it
        const holdsLevel = !isLeg(g, v.id) && !isLeg(g, n) && (isRailEdge(g, v.id, n) || isTrunk(v.id, n));
        const w = holdsLevel ? g.rules.railWeight
          : isLeg(g, n) || isLeg(g, v.id) || isOnRail(v.id) ? 1 : g.rules.spineWeight;
        sum += w * y.get(n)!;
        weight += w;
      }
    }
    return weight ? sum / weight : y.get(v.id)!;
  };
  for (let sweep = 0; sweep < 80; sweep++) {
    for (const r of sweep % 2 === 0 ? ranks : [...ranks].reverse()) {
      const column = columns.get(r)!;
      const wanted = column.map((v) => wantedRow(v, r));
      const gaps = column.slice(1).map((v, i) => minimumGap(g, rank, column[i], v));
      const weights = column.map((v) => (isLeg(g, v.id) ? 1 : g.rules.vertexInertia));
      spreadKeepingOrder(wanted, gaps, weights).forEach((row, i) => y.set(column[i].id, row));
    }
  }
  return y;
}

/**
 * Make the diagram symmetric about its horizontal midline when every column reads the
 * same from the top as from the bottom (legs matching legs, vertices matching vertices).
 */
export function mirrorTopBottom(g: Graph, columns: Columns, y: Rows): void {
  const isMirrorable = [...columns.values()].every((column) =>
    column.every((v, i) => isLeg(g, v.id) === isLeg(g, column[column.length - 1 - i].id)));
  if (!isMirrorable) return;
  const firstColumn = columns.get(Math.min(...columns.keys()))!;
  const midline = mean(firstColumn.map((v) => y.get(v.id)!));
  for (const column of columns.values()) {
    for (let i = 0; i < column.length / 2; i++) {
      const top = column[i], bottom = column[column.length - 1 - i];
      const halfSpan = (y.get(bottom.id)! - y.get(top.id)!) / 2;
      y.set(top.id, midline - halfSpan);
      y.set(bottom.id, midline + halfSpan);
    }
  }
}

/**
 * A line that scatters off an exchanged particle (VBF quarks, t-channel) bends a little
 * at the vertex: its incoming and outgoing halves both lean away from the exchange,
 * symmetrically, instead of running flat.
 */
export function deflectScatteredLines(g: Graph, rank: Ranks, y: Rows, shiftBranch: (id: string, dy: number) => void): void {
  if (g.rules.scatterDeflection === 0) return;
  leanLegsAwayFromExchangedLines(g, rank, y);
  leanBeamsAwayFromExchangedLines(g, y);
  deflectBeamsThatDecayOnward(g, rank, y, shiftBranch);
  deflectWhatScatteringBeamsTurnInto(g, rank, y, shiftBranch);
  interface Scattering { vertex: string; incoming: string; outgoing: string; exchangedWith: string }
  const scatterings: Scattering[] = [];
  // Every vertex where a beam passes through and gives off one particle: a quark line
  // emitting a W, or an ion (drawn as a blob) emitting a photon. Blobs count as vertices.
  const passThrough = new Map<string, PassThrough>();
  for (const v of g.vertices) {
    const found = passThroughAt(g, v.id);
    if (found) passThrough.set(v.id, found);
  }
  /** True when what a beam gives off reaches another beam within a few steps: a scattering. */
  const reachesAnotherBeam = (start: string, from: string): boolean => {
    let frontier = [start];
    const seen = new Set([from, start]);
    for (let step = 0; step < 3; step++) {
      if (frontier.some((id) => id !== from && (passThrough.has(id) || neighboursOf(g, id).some((n) => n !== from && isIncomingLeg(g, n))))) return true;
      frontier = frontier.flatMap((id) => neighboursOf(g, id).filter((n) => !isLeg(g, n) && !seen.has(n)));
      frontier.forEach((id) => seen.add(id));
    }
    return frontier.some((id) => passThrough.has(id));
  };
  for (const [vertexId, { incoming: inLeg, outgoing: outLeg, other }] of passThrough) {
    const v = g.diagram.vertices.get(vertexId)!;
    const incoming = [inLeg], outgoing = [outLeg];
    // Only a line that scatters off another beam bends. One that merely emits something
    // (a quark line in a meson decay) runs straight.
    const meetsAnotherBeam = reachesAnotherBeam(other, v.id);
    // A beam that scatters stays far enough from what it gave off for that to hang clear of it.
    const below = Math.sign(y.get(other)! - y.get(v.id)!) || 1;
    if (meetsAnotherBeam && rank.get(other)! > rank.get(v.id)! && Math.abs(y.get(other)! - y.get(v.id)!) < g.rules.emissionDrop) {
      y.set(v.id, y.get(other)! - below * g.rules.emissionDrop);
    }
    if (!meetsAnotherBeam) {
      // a beam that only emits something stays level
      y.set(incoming[0], y.get(v.id)!);
      y.set(outgoing[0], y.get(v.id)!);
      continue;
    }
    scatterings.push({ vertex: v.id, incoming: incoming[0], outgoing: outgoing[0], exchangedWith: other });
  }
  const listedPosition = (legId: string) => g.diagram.vertices.get(legId)!.declaredOrder;
  /** True when the author listed the two outgoing legs in the opposite order to their vertices: a u-channel. */
  const isSwappedWithPartner = (s: Scattering): boolean => {
    const partner = scatterings.find((other) => other.vertex === s.exchangedWith && other.exchangedWith === s.vertex);
    const mine = listedPosition(s.outgoing), theirs = partner && listedPosition(partner.outgoing);
    if (!partner || mine === undefined || theirs === undefined) return false;
    return (y.get(s.vertex)! < y.get(partner.vertex)!) !== (mine < theirs);
  };
  const rowOf = new Map(scatterings.map((s) => [s.vertex, y.get(s.vertex)!]));
  const swapped = new Map(scatterings.map((s) => [s.vertex, isSwappedWithPartner(s)]));
  for (const s of scatterings) {
    const exchangeGoes = Math.sign(y.get(s.exchangedWith)! - rowOf.get(s.vertex)!);
    if (exchangeGoes === 0) continue;
    const leansAway = rowOf.get(s.vertex)! - exchangeGoes * g.rules.scatterDeflection;
    y.set(s.incoming, leansAway);
    // a swapped outgoing leg ends where its partner's would have: beyond the far end of the exchange
    const crossesTo = y.get(s.exchangedWith)! + exchangeGoes * g.rules.scatterDeflection;
    y.set(s.outgoing, swapped.get(s.vertex) ? crossesTo : leansAway);
  }
}

/**
 * A particle leaving a vertex on an exchanged line (the middle of a t-channel) leans
 * away from the line it shares the column with, so the pair of them opens as a fork
 * instead of running level like the rungs of a box.
 */
function leanLegsAwayFromExchangedLines(g: Graph, rank: Ranks, y: Rows): void {
  for (const v of g.vertices) {
    if (isLeg(g, v.id)) continue;
    const around = neighboursOf(g, v.id);
    const partners = around.filter((n) => !isLeg(g, n) && rank.get(n) === rank.get(v.id));
    const legsOut = around.filter((n) => isLeg(g, n) && !isIncomingLeg(g, n));
    const legsIn = around.filter((n) => isIncomingLeg(g, n));
    if (partners.length !== 1 || legsOut.length !== 1 || legsIn.length !== 0 || around.length !== 3) continue;
    // only where the leg carries the exchanged fermion line on out of the diagram; what a
    // loop gives off (the Higgs of a box) leaves level
    if (!hasFermionLine(g, v.id, partners[0]) || !hasFermionLine(g, v.id, legsOut[0])) continue;
    const away = -Math.sign(y.get(partners[0])! - y.get(v.id)!);
    if (away === 0) continue;
    y.set(legsOut[0], y.get(v.id)! + away * g.rules.exchangeLegLean);
  }
}

/**
 * A beam entering a vertex on an exchanged line (the quark exchanged between a quark and a
 * gluon, say) leans away from the exchange, as the quarks of a qq scattering do, whatever
 * it turns into: a gluon that becomes a quark scatters the same way.
 */
function leanBeamsAwayFromExchangedLines(g: Graph, y: Rows): void {
  for (const id of g.exchangeVertices) {
    const around = neighboursOf(g, id);
    const beams = around.filter((n) => isIncomingLeg(g, n));
    const partners = around.filter((n) => g.exchangeVertices.has(n));
    if (beams.length !== 1 || partners.length !== 1) continue;
    const away = -Math.sign(y.get(partners[0])! - y.get(id)!);
    if (away === 0) continue;
    y.set(beams[0], y.get(id)! + away * g.rules.scatterDeflection * 2);
  }
}

/**
 * When two particles given off by separate scattering lines fuse into one (the two W of a
 * vector-boson fusion into a Higgs), the line that comes out of the fusion runs level:
 * its far end is brought to the height of the fusion vertex, with everything that follows.
 */
export function levelFusionLines(g: Graph, rank: Ranks, y: Rows, moveBranch: (id: string, dy: number) => void): void {
  for (const v of g.vertices) {
    if (isLeg(g, v.id)) continue;
    const around = neighboursOf(g, v.id);
    const before = around.filter((n) => !isLeg(g, n) && rank.get(n)! < rank.get(v.id)!);
    const after = around.filter((n) => !isLeg(g, n) && rank.get(n)! > rank.get(v.id)!);
    if (before.length !== 2 || after.length !== 1) continue;
    const separate = !neighboursOf(g, before[0]).includes(before[1]);
    const next = after[0];
    const onlyFromHere = neighboursOf(g, next).filter((n) => !isLeg(g, n) && rank.get(n)! < rank.get(next)!).length === 1;
    if (!separate || !onlyFromHere) continue;
    const dy = y.get(v.id)! - y.get(next)!;
    if (Math.abs(dy) > 1e-6) moveBranch(next, dy);
  }
}

/**
 * A line that carries marks (a mixing line with its crosses) leaves the horizontal: it
 * slants away from whatever else leaves its first vertex, so it is not mistaken for a
 * level propagator. Everything that follows it moves with it.
 */
export function slantMarkedLines(g: Graph, rank: Ranks, y: Rows, moveBranch: (id: string, dy: number) => void): void {
  const slope = Math.tan((g.rules.markedLineAngle * Math.PI) / 180);
  for (const key of g.marksOnLine.keys()) {
    const [p, q] = key.split("\u0000");
    if (!g.neighbours.has(p) || !g.neighbours.has(q)) continue;
    const [from, to] = rank.get(p)! <= rank.get(q)! ? [p, q] : [q, p];
    if (isLeg(g, from) || isLeg(g, to)) continue;
    const marks = g.marksOnLine.get(key)!;
    const run = 1 + g.rules.markLineStretch * marks;
    const others = neighboursOf(g, from).filter((n) => n !== to && !isIncomingLeg(g, n));
    // It slants away from what else leaves the vertex. Which side that is follows the order
    // the author listed the outgoing legs in; failing that, where the other lines already are.
    const farOutcome = listedOutcome(g, rank, to);
    const otherOutcome = Math.min(...others.map((n) => listedOutcome(g, rank, n) ?? Infinity));
    const meanOther = others.length ? others.reduce((sum, n) => sum + y.get(n)!, 0) / others.length : y.get(from)! - 1;
    const side = farOutcome !== undefined && isFinite(otherOutcome) ? (farOutcome < otherOutcome ? -1 : 1)
      : meanOther < y.get(from)! ? 1 : -1;
    const dy = y.get(from)! + (side * run * slope) / g.rowOverRank - y.get(to)!;
    moveBranch(to, dy);
    // The vertex is a split, not an emission: what else leaves it goes the other way at the
    // same angle, so the two lines open symmetrically about the line that came in.
    for (const n of others) {
      if (isLeg(g, n)) y.set(n, y.get(from)! - (side * g.rules.legLength * slope) / g.rowOverRank);
    }
  }
}

/**
 * A beam can scatter and carry on into a decay (b W b, then b -> t a): its line does not
 * end at the scattering vertex, so no leg leaves there. It still scatters: the beam leans
 * away from the exchange, and the line that carries on leans too, but less, since what it
 * goes on to do holds it back.
 */
function deflectBeamsThatDecayOnward(g: Graph, rank: Ranks, y: Rows, shiftBranch: (id: string, dy: number) => void): void {
  for (const path of g.railPaths) {
    if (path.length < 4) continue; // leg, vertex, vertex, ..., leg: the line must pass through two vertices
    const [legId, first, next] = path;
    if (!g.neighbours.has(legId) || !g.neighbours.has(first) || !g.neighbours.has(next)) continue;
    if (!isIncomingLeg(g, legId) || isLeg(g, next) || passThroughAt(g, first)) continue;
    if (g.exchangeVertices.has(first) || g.exchangeVertices.has(next)) continue; // a line exchanged between beams is vertical
    const exchanged = neighboursOf(g, first).filter((n) => !isLeg(g, n) && n !== next);
    if (exchanged.length !== 1) continue;
    const dir = Math.sign(y.get(exchanged[0])! - y.get(first)!);
    if (dir === 0) continue;
    y.set(legId, y.get(first)! - dir * g.rules.scatterDeflection * 2);
    shiftBranch(next, y.get(first)! - dir * g.rules.scatterDeflection * g.rules.heldBackFraction - y.get(next)!);
  }
}

/**
 * A beam that turns into something else where it scatters (a d-bar that becomes a W as it
 * exchanges a u with the other beam) is still a scattered line: what it turns into leaves
 * deflected away from the exchange, mirroring the outgoing half of the beam opposite.
 */
function deflectWhatScatteringBeamsTurnInto(g: Graph, rank: Ranks, y: Rows, shiftBranch: (id: string, dy: number) => void): void {
  for (const path of g.railPaths) {
    if (path.length < 4) continue;
    const [legId, first, next] = path;
    if (!g.neighbours.has(legId) || !g.neighbours.has(first) || !g.neighbours.has(next)) continue;
    if (!isIncomingLeg(g, legId) || isLeg(g, next) || !g.exchangeVertices.has(first)) continue;
    const onward = neighboursOf(g, first).filter((n) => !isLeg(g, n) && n !== next && rank.get(n)! > rank.get(first)!);
    if (onward.length !== 1 || neighboursOf(g, first).length !== 3) continue;
    const dir = Math.sign(y.get(next)! - y.get(first)!);
    if (dir === 0) continue;
    const target = y.get(first)! - dir * g.rules.scatterDeflection * (rank.get(onward[0])! - rank.get(first)!);
    shiftBranch(onward[0], target - y.get(onward[0])!);
  }
}
