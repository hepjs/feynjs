import type { Diagram, Vertex } from "../../model.ts";
import type { LayoutRules } from "../../theme.ts";
import { orderColumns, rankByDistanceFromIncoming } from "./columns.ts";
import type { Ranks } from "./columns.ts";
import { arcLinesThatRejoinTheirRail, giveLoopsRoom, placeSpectatorLines, placeVerticesOnArcs, squareUpLadders, straightenRailsWithLoops } from "./arcs.ts";
import { arcDecayChains, branchOf, changesFlavourEmitting, detachEmittedLegs, extendEarlyEmissions, findDecayChains, moveBranch, placeDecayEmissions, reattachEmittedLegs } from "./cascade.ts";
import { attachmentOf, buildGraph, edgeKey, isIncomingLeg, isLeg, passThroughAt } from "./graph.ts";
import type { Graph } from "./graph.ts";
import { lineUpOutgoingHadrons } from "./hadrons.ts";
import { detachMarksOnLines, placeMarksOnLines } from "./marks.ts";
import { detachInitialStateRadiation, findBeamRails, findExchangeVertices, findInitialStateRadiation, placeRadiation, railEdgeKeys } from "./beams.ts";
import { deflectScatteredLines, levelFusionLines, mirrorTopBottom, relaxRows, slantMarkedLines } from "./rows.ts";
import type { Rows } from "./rows.ts";
import { forkHalfAngle, keepEmissionsOffTheirLine, keepFinalStatesOffBeams, keepLegsClear, keepLinesApartAtVertices } from "./spacing.ts";

/**
 * Time-ordered layout: time runs left to right, as in every published diagram.
 *
 * Internal vertices are ranked by their distance from the incoming legs, which yields
 * the standard shapes without naming them: an s-channel propagator is horizontal, a
 * t-channel propagator vertical, ggF is a triangle, a 2->2 loop is a box, and decay
 * cascades fan out to the right.
 *
 * Coordinates are in ranks (x) and rows (y, down); the renderer scales them to px.
 */
export function layout(d: Diagram, rules: LayoutRules, rowOverRank: number, markRadius: (v: Vertex) => number = () => 0): void {
  const graph = buildGraph(d, rules, rowOverRank, markRadius);
  const marks = detachMarksOnLines(graph);
  graph.railPaths = findBeamRails(graph);
  graph.rails = railEdgeKeys(graph.railPaths);
  const radiationEmitters = new Set(findInitialStateRadiation(graph).map((r) => r.emitter));
  graph.exchangeVertices = findExchangeVertices(graph, radiationEmitters);
  const radiation = detachInitialStateRadiation(graph);
  const rank = rankByDistanceFromIncoming(graph);
  const deepestRank = Math.max(1, ...graph.vertices.filter((v) => !isLeg(graph, v.id)).map((v) => rank.get(v.id)!));
  const chains = findDecayChains(graph, rank);
  detachEmittedLegs(graph, rank, chains);
  const columns = orderColumns(graph, rank);
  const rows = relaxRows(graph, rank, columns);
  if (rules.mirrorTopBottom) mirrorTopBottom(graph, columns, rows);
  const shiftBranch = (id: string, dy: number) => { for (const member of branchOf(graph, rank, id)) rows.set(member, (rows.get(member) ?? 0) + dy); };
  deflectScatteredLines(graph, rank, rows, shiftBranch);
  levelFusionLines(graph, rank, rows, shiftBranch);
  slantMarkedLines(graph, rank, rows, shiftBranch);
  assignCoordinates(graph, rank, rows, deepestRank);
  const firstVertices = graph.vertices.filter((v) => rank.get(v.id) === 1);
  const midline = firstVertices.reduce((sum, v) => sum + v.y, 0) / Math.max(1, firstVertices.length);
  const legLengthAt = (r: number) => rules.legLength * stageScale(graph, r + 1, deepestRank);
  const lineLengthInto = (id: string) =>
    isLeg(graph, id) ? legLengthAt(rank.get(attachmentOf(graph, id))!) : stageScale(graph, rank.get(id)!, deepestRank);
  const chainDirections = arcDecayChains(graph, rank, chains, midline, lineLengthInto);
  placeDecayEmissions(graph, rank, chains, midline, legLengthAt, lineLengthInto, chainDirections);
  reattachEmittedLegs(graph, rank, chains);
  extendEarlyEmissions(graph, chains);
  giveLoopsRoom(graph, (id, dx, dy) => moveBranch(graph, rank, id, dx, dy));
  straightenRailsWithLoops(graph, (id, dx, dy) => moveBranch(graph, rank, id, dx, dy), (id) => branchOf(graph, rank, id));
  squareUpLadders(graph, rank, (id, dx, dy) => moveBranch(graph, rank, id, dx, dy));
  arcLinesThatRejoinTheirRail(graph);
  placeVerticesOnArcs(graph, rank, (id, dx, dy) => moveBranch(graph, rank, id, dx, dy));
  placeSpectatorLines(graph);
  keepEmissionsOffTheirLine(graph, (id, x, y) => {
    const root = d.vertices.get(id)!;
    moveBranch(graph, rank, id, x - root.x, y - root.y);
  });
  keepLinesApartAtVertices(graph);
  lineUpOutgoingHadrons(graph);
  keepFinalStatesOffBeams(graph);
  keepLegsClear(graph);
  placeRadiation(d, radiation, rules);
  placeMarksOnLines(d, marks);
  spreadLegsOfLoneVertex(d, graph.rowOverRank);
  applyManualPositions(d);
}

/**
 * Length of each stage of the diagram relative to the first. Deep cascades are drawn
 * with every decay stage a little shorter than the one before, as in the reference diagrams.
 */
function stageScale(g: Graph, rank: number, deepestRank: number): number {
  if (deepestRank < g.rules.shrinkFromDepth || rank <= 2) return 1;
  return Math.max(g.rules.shortestStage, Math.pow(g.rules.stageShrink, rank - 2));
}

/** Give an emitted leg a fixed drawn length along the direction the rows gave it. */
function placeEmittedLeg(g: Graph, leg: Vertex, attachedTo: Vertex, row: number, length: number): void {
  const run = length, rise = (row - attachedTo.y) * g.rowOverRank;
  const shrink = length / Math.hypot(run, rise);
  leg.x = attachedTo.x + run * shrink;
  leg.y = attachedTo.y + (rise * shrink) / g.rowOverRank;
}

/**
 * True when the second column is where particles exchanged by two separate scattering
 * lines meet (vector-boson fusion, photon fusion). The exchanged particles are then
 * drawn short and steep, so the fusion point sits close behind the lines.
 */
function isFusionOfExchangedParticles(g: Graph, rank: Ranks): boolean {
  const second = g.vertices.filter((v) => !isLeg(g, v.id) && rank.get(v.id) === 2);
  if (second.length === 0) return false;
  const fusesTwoLines = second.every((v) => {
    const sources = g.neighbours.get(v.id)!.filter((n) => rank.get(n) === 1);
    const sourcesAreSeparate = sources.every((a) => sources.every((b) => !g.neighbours.get(a)!.includes(b)));
    return sources.length >= 2 && sourcesAreSeparate;
  });
  // or each was emitted by a beam that carries on through its vertex, and there are two
  // such beams (photons off two ions meeting a line exchanged between them)
  const allSources = new Set(second.flatMap((v) => g.neighbours.get(v.id)!.filter((n) => rank.get(n) === 1)));
  const emittedByPassingBeams = allSources.size >= 2 && second.every((v) => {
    const sources = g.neighbours.get(v.id)!.filter((n) => rank.get(n) === 1);
    return sources.length >= 1 && sources.every((n) => isScatteringVertex(g, g.diagram.vertices.get(n)!));
  });
  return fusesTwoLines || emittedByPassingBeams;
}

const isScatteringVertex = (g: Graph, vertex: Vertex): boolean => passThroughAt(g, vertex.id) !== undefined;

/** True for the two beams of a collision drawn as a blob. */
function entersBlobAsPair(g: Graph, attachedTo: Vertex): boolean {
  const isBlob = attachedTo.shape === "blob" || attachedTo.shape === "hatched";
  const incoming = g.neighbours.get(attachedTo.id)!.filter((n) => isLeg(g, n) && g.diagram.vertices.get(n)!.role === "in");
  return isBlob && incoming.length === 2;
}

/** Colliding beams are short and steep, as in the reference diagrams. */
function placeLegIntoBlob(g: Graph, leg: Vertex, blob: Vertex, row: number): void {
  const angle = (g.rules.beamAngle * Math.PI) / 180;
  const side = row < blob.y ? -1 : 1;
  leg.x = blob.x - g.rules.beamLength * Math.cos(angle);
  leg.y = blob.y + (side * g.rules.beamLength * Math.sin(angle)) / g.rowOverRank;
}

/** Turn ranks and rows into coordinates. */
function assignCoordinates(g: Graph, rank: Ranks, y: Rows, deepestRank: number): void {
  const internal = g.vertices.filter((v) => !isLeg(g, v.id));
  const columnX = [0, 1];
  for (let r = 2; r <= deepestRank; r++) {
    const fusion = isFusionOfExchangedParticles(g, rank);
    // what the fusion produces is drawn short too: a resonance, not a long propagator
    const length = fusion && r === 2 ? g.rules.fusionAdvance
      : fusion && r === 3 ? g.rules.fusionResonanceLength
      : stageScale(g, r, deepestRank);
    columnX.push(columnX[r - 1] + length * (1 + g.rules.markLineStretch * marksBetweenColumns(g, rank, r)));
  }
  for (const v of internal) { v.x = columnX[rank.get(v.id)!]; v.y = y.get(v.id) ?? 0; }

  const rightEdge = Math.max(0, ...internal.map((v) => v.x));
  const incomingLegs = g.vertices.filter((v) => isLeg(g, v.id) && v.role === "in");
  const leftEdge = Math.min(...incomingLegs.map((v) => g.diagram.vertices.get(attachmentOf(g, v.id))!.x), Infinity);

  for (const v of g.vertices) {
    if (!isLeg(g, v.id)) continue;
    const row = y.get(v.id) ?? 0;
    const attachedTo = g.diagram.vertices.get(attachmentOf(g, v.id))!;
    v.y = row;
    if (isLeg(g, attachedTo.id)) {
      // a bare line between two external points
      v.x = v.role === "in" ? 0 : 1 + g.rules.legLength;
    } else if (v.role === "in" && entersBlobAsPair(g, attachedTo)) {
      placeLegIntoBlob(g, v, attachedTo, row);
    } else if (v.role === "in") {
      v.x = leftEdge - g.rules.legLength;
    } else if (isScatteringVertex(g, attachedTo)) {
      // the outgoing half of a scattered line runs on past its vertex, towards the
      // right-hand edge but no further than the house reach
      const toRightEdge = rightEdge + g.rules.legLength - attachedTo.x;
      v.x = attachedTo.x + Math.max(g.rules.legLength, Math.min(toRightEdge, g.rules.scatteredLegReach));
    } else {
      const length = g.rules.legLength * stageScale(g, rank.get(attachedTo.id)! + 1, deepestRank);
      placeEmittedLeg(g, v, attachedTo, row, length);
    }
  }
  openForks(g, rank, deepestRank);
}

/**
 * Legs that meet at one vertex open as a symmetric fork at a house angle: wide where
 * the beams meet and in a simple 2 -> 2 process, narrower for the decays that follow.
 */
function openForks(g: Graph, rank: Ranks, deepestRank: number): void {
  for (const v of g.vertices) {
    if (isLeg(g, v.id) || v.shape === "blob" || v.shape === "hatched") continue;
    const vertexRank = rank.get(v.id)!;
    const legsHere = g.neighbours.get(v.id)!.filter((n) => isLeg(g, n)).map((n) => g.diagram.vertices.get(n)!);
    const incoming = legsHere.filter((leg) => leg.role === "in");
    const outgoing = legsHere.filter((leg) => leg.role === "out" && rank.get(leg.id) === vertexRank + 1);
    const endsTheProcess = !g.neighbours.get(v.id)!.some((n) => !isLeg(g, n) && rank.get(n)! > vertexRank);
    const isAloneInColumn = !g.vertices.some((other) => other !== v && !isLeg(g, other.id) && rank.get(other.id) === vertexRank);
    // what two exchanged particles fuse into stays between the scattering lines: a narrow fork
    const earlierVertices = g.neighbours.get(v.id)!.filter((n) => !isLeg(g, n) && rank.get(n)! < vertexRank);
    // a decay (one incoming particle) has no collision to open wide from
    const isDecayProcess = [...g.legs].filter((id) => isIncomingLeg(g, id)).length === 1;
    const isSimpleFinalState = vertexRank <= 2 && endsTheProcess && incoming.length === 0 && isAloneInColumn
      && earlierVertices.length <= 1 && !isDecayProcess;
    fanLegs(g, v, incoming, -1, g.rules.beamForkAngle, g.rules.legLength);
    // a decay opens symmetrically about the line that brought the particle in
    const parent = earlierVertices.length === 1 && incoming.length === 0 ? g.diagram.vertices.get(earlierVertices[0])! : undefined;
    const lean = parent && v.x > parent.x ? (Math.atan2((v.y - parent.y) * g.rowOverRank, v.x - parent.x) * 180) / Math.PI : 0;
    const flavourDecay = decaysIntoOtherFlavour(g, v, parent, outgoing);
    fanLegs(g, v, outgoing, 1, isSimpleFinalState ? g.rules.beamForkAngle : g.rules.decayForkAngle,
      g.rules.legLength * stageScale(g, vertexRank + 1, deepestRank) * busyVertexStretch(g, v.id) * (flavourDecay ? 1.5 : 1), flavourDecay ? Math.max(-30, Math.min(30, lean)) : 0);
  }
}

/** The most marks on any one line that runs into column r from the one before it. */
function marksBetweenColumns(g: Graph, rank: Ranks, r: number): number {
  let most = 0;
  for (const v of g.vertices) {
    if (rank.get(v.id) !== r) continue;
    for (const n of g.neighbours.get(v.id)!) {
      if (rank.get(n)! >= r) continue;
      most = Math.max(most, g.marksOnLine.get(edgeKey(n, v.id)) ?? 0);
    }
  }
  return most;
}

/** Lines leaving a vertex where four or more meet are drawn longer, so they are not crowded. */
function busyVertexStretch(g: Graph, vertexId: string): number {
  const lines = g.diagram.edges.filter((e) => e.from === vertexId || e.to === vertexId).length;
  return 1 + g.rules.busyVertexStretch * Math.max(0, lines - 3);
}

/**
 * Spread two or more legs evenly across a fork, keeping their order. `halfAngle` is how
 * far a fork of two opens; more legs open it wider (see forkHalfAngle).
 */
function fanLegs(g: Graph, vertex: Vertex, legs: Vertex[], direction: 1 | -1, halfAngle: number, length: number, axis = 0): void {
  if (legs.length < 2) return;
  const ordered = legs.slice().sort((a, b) => a.y - b.y);
  const outermost = forkHalfAngle(g, ordered.length, halfAngle);
  ordered.forEach((leg, i) => {
    const degrees = -outermost + (2 * outermost * i) / (ordered.length - 1);
    const angle = ((degrees + axis) * Math.PI) / 180;
    leg.x = vertex.x + direction * length * Math.cos(angle);
    leg.y = vertex.y + (length * Math.sin(angle)) / g.rowOverRank;
  });
}

/** Manual `at (x, y)` positions win. They use the TikZ convention (y up). */
function applyManualPositions(d: Diagram): void {
  const vertices = [...d.vertices.values()];
  const anchor = vertices.find((v) => v.fixed);
  if (!anchor) return;
  const dx = anchor.fixed!.x - anchor.x, dy = -anchor.fixed!.y - anchor.y;
  for (const v of vertices) {
    if (v.fixed) { v.x = v.fixed.x; v.y = -v.fixed.y; }
    else { v.x += dx; v.y += dy; }
  }
}

/**
 * A single vertex with nothing but external legs (a Feynman rule drawn on its own): every
 * leg is the same length, incoming legs sit on the left and outgoing on the right, and each
 * side fans out at equal angles - a four-point vertex is an X, not two legs pointing forward.
 */
function spreadLegsOfLoneVertex(d: Diagram, rowOverRank: number): void {
  const edges = d.edges;
  const ids = new Set(edges.flatMap((e) => [e.from, e.to]));
  const touching = (id: string) => edges.filter((e) => e.from === id || e.to === id);
  const centres = [...ids].filter((id) => touching(id).length > 1);
  if (centres.length !== 1 || ids.size !== touching(centres[0]).length + 1) return;
  const centre = d.vertices.get(centres[0])!;
  const legs = [...ids].filter((id) => id !== centre.id).map((id) => d.vertices.get(id)!);
  // a lone vertex drawn as a Feynman rule has two or more particles coming in; a 1 -> 2 decay is left alone
  if (legs.length < 3 || legs.filter((l) => l.role === "in").length < 2 && legs.length < 4) return;
  const toLeft = legs.filter((l) => l.x < centre.x - 1e-6 || (Math.abs(l.x - centre.x) < 1e-6 && l.role === "in"));
  const toRight = legs.filter((l) => !toLeft.includes(l));
  const length = Math.max(...legs.map((l) => Math.hypot(l.x - centre.x, (l.y - centre.y) * rowOverRank)));
  const place = (side: Vertex[], direction: 1 | -1) => {
    const ordered = side.slice().sort((a, b) => a.y - b.y);
    const half = ordered.length === 1 ? 0 : ordered.length === 2 ? 45 : 60;
    ordered.forEach((leg, i) => {
      const degrees = ordered.length === 1 ? 0 : -half + (2 * half * i) / (ordered.length - 1);
      const angle = (degrees * Math.PI) / 180;
      leg.x = centre.x + direction * length * Math.cos(angle);
      leg.y = centre.y + (length * Math.sin(angle)) / rowOverRank;
    });
  };
  place(toLeft, -1);
  place(toRight, 1);
}

/** True for a fermion turning into another flavour plus a vector boson (b -> t W): it opens about its own line. */
function decaysIntoOtherFlavour(g: Graph, v: Vertex, parent: Vertex | undefined, outgoing: Vertex[]): boolean {
  if (!parent || outgoing.length !== 2) return false;
  const incoming = g.diagram.edges.find((e) => (e.from === parent.id && e.to === v.id) || (e.to === parent.id && e.from === v.id));
  return changesFlavourEmitting(g, incoming, outgoing.map((l) => l.id), v.id);
}
