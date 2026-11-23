import type { Vertex } from "../../model.ts";
import { attachmentOf, isIncomingLeg, isLeg, mean, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";
import { isRailEdge } from "./beams.ts";

/** Column number of every vertex: time runs from low rank to high. */
export type Ranks = Map<string, number>;
/** Columns keyed by rank, each ordered top to bottom. */
export type Columns = Map<number, Vertex[]>;

/** Rank every vertex by its distance from the incoming legs. */
export function rankByDistanceFromIncoming(g: Graph): Ranks {
  const rank: Ranks = new Map();
  const queue: string[] = [];
  const startAt = (id: string) => { if (!rank.has(id)) { rank.set(id, 1); queue.push(id); } };
  const spreadOutward = () => {
    while (queue.length) {
      const id = queue.shift()!;
      for (const n of neighboursOf(g, id)) {
        if (isLeg(g, n) || rank.has(n)) continue;
        rank.set(n, rank.get(id)! + 1);
        queue.push(n);
      }
    }
  };
  const internal = g.vertices.filter((v) => !isLeg(g, v.id));
  for (const v of g.vertices) {
    if (isIncomingLeg(g, v.id) && !isLeg(g, attachmentOf(g, v.id))) startAt(attachmentOf(g, v.id));
  }
  for (const id of g.exchangeVertices) startAt(id);
  if (queue.length === 0 && internal.length) startAt(internal[0].id);
  spreadOutward();
  for (const v of internal) if (!rank.has(v.id)) { startAt(v.id); spreadOutward(); } // disconnected pieces

  advanceAlongRails(g, rank);
  rankExternalLegs(g, rank);
  return rank;
}

/** Index of the last vertex along a rail that sits on an exchange line: time starts after it. */
function lastBeamVertexOn(g: Graph, railVertices: string[]): number {
  let last = 0;
  railVertices.forEach((id, i) => { if (g.exchangeVertices.has(id)) last = i; });
  return last;
}

/**
 * Time moves forward along a rail: each vertex of a scattering line comes after the one
 * before it, even where a loop gives a shorter way round.
 */
function advanceAlongRails(g: Graph, rank: Ranks): void {
  for (const path of g.railPaths) {
    const vertices = path.filter((id) => !isLeg(g, id) && g.neighbours.has(id));
    for (let i = lastBeamVertexOn(g, vertices) + 1; i < vertices.length; i++) {
      if (i === 0) continue;
      const earliest = rank.get(vertices[i - 1])! + 1;
      if ((rank.get(vertices[i]) ?? 0) < earliest) rank.set(vertices[i], earliest);
    }
  }
}

/** Incoming legs share the first column; an outgoing leg sits one column after its vertex. */
function rankExternalLegs(g: Graph, rank: Ranks): void {
  for (const v of g.vertices) {
    if (!isLeg(g, v.id)) continue;
    const attachedRank = rank.get(attachmentOf(g, v.id)) ?? 0;
    rank.set(v.id, v.role === "in" ? 0 : attachedRank + 1);
  }
}

/**
 * Legs the author listed in `in:` or `out:` keep that order, top to bottom, even when
 * it makes lines cross: that is how a u-channel diagram swaps its final states.
 */
function compareListedLegs(a: Vertex, b: Vertex): number {
  if (a.role !== b.role || a.declaredOrder === undefined || b.declaredOrder === undefined) return 0;
  return a.declaredOrder - b.declaredOrder;
}

function groupIntoColumns(g: Graph, rank: Ranks): Columns {
  const columns: Columns = new Map();
  for (const v of g.vertices) {
    const r = rank.get(v.id) ?? 0;
    if (!columns.has(r)) columns.set(r, []);
    columns.get(r)!.push(v);
  }
  return columns;
}

/**
 * Order each column top to bottom so lines do not cross: a vertex follows the vertices
 * it hangs from. Among the products of one decay, the chain that decays further is kept
 * towards the middle and the emitted particles fan outwards, mirrored between the upper
 * and lower halves.
 */
export function orderColumns(g: Graph, rank: Ranks): Columns {
  const columns = groupIntoColumns(g, rank);
  const ranks = [...columns.keys()].sort((a, b) => a - b);
  /** vertical position within its column, from 0 (top) to 1 (bottom) */
  const height = new Map<string, number>();
  /** which half of the diagram a vertex belongs to: -1 upper, 1 lower, 0 the midline */
  const side = new Map<string, number>();
  const recordHeights = (column: Vertex[]) =>
    column.forEach((v, i) => {
      height.set(v.id, (i + 0.5) / column.length);
      const ownSide = Math.sign((i + 0.5) / column.length - 0.5);
      // alone in its column, a vertex belongs to the half it was reached from
      const inherited = Math.sign(neighboursOf(g, v.id).reduce((sum, n) => sum + (side.get(n) ?? 0), 0));
      side.set(v.id, Math.abs((i + 0.5) / column.length - 0.5) > 1e-3 ? ownSide : inherited);
    });
  const declared = (v: Vertex) => g.declaredIndex.get(v.id)!;

  /** Earliest position, in the author's `out:` list, of any leg a vertex leads to. */
  const listedOutcome = new Map<string, number | undefined>();
  const outcomeOf = (id: string): number | undefined => {
    if (listedOutcome.has(id)) return listedOutcome.get(id);
    listedOutcome.set(id, undefined); // guards against loops
    const own = g.diagram.vertices.get(id)!;
    let earliest = isLeg(g, id) && own.role === "out" ? own.declaredOrder : undefined;
    for (const n of neighboursOf(g, id)) {
      if ((rank.get(n) ?? 0) <= (rank.get(id) ?? 0)) continue;
      const below = outcomeOf(n);
      if (below !== undefined && (earliest === undefined || below < earliest)) earliest = below;
    }
    listedOutcome.set(id, earliest);
    return earliest;
  };
  /** Branches follow the order in which the author listed the legs they end in. */
  const compareByListedOutcome = (a: Vertex, b: Vertex): number => {
    const first = outcomeOf(a.id), second = outcomeOf(b.id);
    return first === undefined || second === undefined ? 0 : first - second;
  };

  for (const r of ranks.filter((x) => x >= 1)) {
    const column = columns.get(r)!;
    const sortKey = new Map<string, [number, number]>();
    for (const v of column) {
      const earlier = neighboursOf(g, v.id).filter((n) => (rank.get(n) ?? 0) < r && height.has(n));
      if (earlier.length) {
        const parentHeight = mean(earlier.map((n) => height.get(n)!));
        // a rail carries on along the outside; what it emits, and decay chains, go inside
        const continuesRail = earlier.length === 1 && isRailEdge(g, earlier[0], v.id);
        const inwardness = continuesRail ? -1 : isLeg(g, v.id) ? 0 : 1;
        const parentSide = Math.sign(earlier.reduce((sum, n) => sum + (side.get(n) ?? 0), 0));
        const towardsMiddle = -parentSide * inwardness;
        sortKey.set(v.id, [parentHeight, towardsMiddle]);
      } else {
        // first column of vertices: follow the order the incoming legs were written in
        const legs = neighboursOf(g, v.id).filter((n) => isIncomingLeg(g, n));
        const legOrder = (n: string) => g.diagram.vertices.get(n)!.declaredOrder ?? g.declaredIndex.get(n)!;
        if (legs.length) sortKey.set(v.id, [Math.min(...legs.map(legOrder)) / g.declaredIndex.size, 0]);
      }
    }
    // a vertex with nothing before it and no incoming leg of its own sits among the
    // vertices it is joined to in this column (the middle of an exchanged line)
    for (let pass = 0; pass < column.length; pass++) {
      for (const v of column) {
        if (sortKey.has(v.id)) continue;
        const placed = neighboursOf(g, v.id).filter((n) => rank.get(n) === r && sortKey.has(n));
        if (placed.length >= 2 || (placed.length === 1 && pass > 0)) {
          sortKey.set(v.id, [mean(placed.map((n) => sortKey.get(n)![0])) + (placed.length === 1 ? 1e-6 : 0), 0]);
        }
      }
    }
    for (const v of column) if (!sortKey.has(v.id)) sortKey.set(v.id, [declared(v) / g.declaredIndex.size, 0]);
    column.sort((a, b) => {
      const listed = compareListedLegs(a, b);
      if (listed !== 0) return listed;
      const ka = sortKey.get(a.id)!, kb = sortKey.get(b.id)!;
      return ka[0] - kb[0] || compareByListedOutcome(a, b) || ka[1] - kb[1] || declared(a) - declared(b);
    });
    recordHeights(column);
  }
  // incoming legs follow the vertices they attach to
  for (const r of ranks.filter((x) => x < 1).reverse()) {
    const column = columns.get(r)!;
    const attachedHeight = new Map(column.map((v) => {
      const later = neighboursOf(g, v.id).filter((n) => height.has(n));
      return [v.id, later.length ? mean(later.map((n) => height.get(n)!)) : 0.5] as [string, number];
    }));
    column.sort((a, b) =>
      compareListedLegs(a, b) || attachedHeight.get(a.id)! - attachedHeight.get(b.id)! || declared(a) - declared(b));
    recordHeights(column);
  }
  return columns;
}
