import type { Diagram, Edge, Vertex } from "../../model.ts";
import type { LayoutRules } from "../../theme.ts";

/** The diagram as an undirected graph, with external legs identified. */
export interface Graph {
  diagram: Diagram;
  rules: LayoutRules;
  /** height of a row relative to the width of a rank, as drawn */
  rowOverRank: number;
  /** how far, in rows, the drawn mark of a vertex (blob, dot) reaches from its centre */
  markRadius: (v: Vertex) => number;
  /** vertices taking part in the main layout, in the order they were written */
  vertices: Vertex[];
  declaredIndex: Map<string, number>;
  neighbours: Map<string, string[]>;
  /** ids of the external legs */
  legs: Set<string>;
  /** lines the layout treats as one after a mark between them was taken out, by edge key */
  joinedLines: Map<string, Edge>;
  /** how many marks sit on the line between two vertices, by edge key (set once marks are detached) */
  marksOnLine: Map<string, number>;
  /** edge keys of the incoming fermion lines that run straight on through their vertices */
  rails: Set<string>;
  /** each of those lines as the vertices it passes, from its incoming leg */
  railPaths: string[][];
  /** vertices on a fermion line exchanged between two incoming particles */
  exchangeVertices: Set<string>;
}

/** Order-independent key for the line between two vertices. */
export const edgeKey = (a: string, b: string) => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`);

/** The line between two vertices as the layout sees it, or undefined if they are not joined. */
export function edgeJoining(g: Graph, a: string, b: string): Edge | undefined {
  return g.diagram.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a))
    ?? g.joinedLines.get(edgeKey(a, b));
}

export function buildNeighbours(d: Diagram): Map<string, string[]> {
  const neighbours = new Map<string, string[]>();
  for (const v of d.vertices.values()) neighbours.set(v.id, []);
  for (const e of d.edges) {
    if (e.from === e.to) continue;
    if (!neighbours.get(e.from)!.includes(e.to)) neighbours.get(e.from)!.push(e.to);
    if (!neighbours.get(e.to)!.includes(e.from)) neighbours.get(e.to)!.push(e.from);
  }
  return neighbours;
}

/** An external leg: one connection, and not drawn as a blob. */
export function isExternalLeg(v: Vertex, neighbours: Map<string, string[]>): boolean {
  return neighbours.get(v.id)!.length === 1 && v.shape !== "blob" && v.shape !== "hatched";
}

export function buildGraph(d: Diagram, rules: LayoutRules, rowOverRank: number, markRadius: (v: Vertex) => number = () => 0): Graph {
  const vertices = [...d.vertices.values()];
  const neighbours = buildNeighbours(d);
  return {
    diagram: d,
    rules,
    rowOverRank,
    markRadius,
    vertices,
    declaredIndex: new Map(vertices.map((v, i) => [v.id, i])),
    neighbours,
    legs: new Set(vertices.filter((v) => isExternalLeg(v, neighbours)).map((v) => v.id)),
    joinedLines: new Map(),
    marksOnLine: new Map(),
    rails: new Set(),
    railPaths: [],
    exchangeVertices: new Set(),
  };
}

export const neighboursOf = (g: Graph, id: string) => g.neighbours.get(id)!;
export const isLeg = (g: Graph, id: string) => g.legs.has(id);
export const isIncomingLeg = (g: Graph, id: string) => g.legs.has(id) && g.diagram.vertices.get(id)!.role === "in";
export const isOutgoingLeg = (g: Graph, id: string) => g.legs.has(id) && g.diagram.vertices.get(id)!.role === "out";
/** The vertex an external leg is attached to. */
export const attachmentOf = (g: Graph, legId: string) => g.neighbours.get(legId)![0];
export const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

/** A vertex where a beam passes through and gives off one particle. */
export interface PassThrough { incoming: string; outgoing: string; other: string }

/**
 * The beam passing through a vertex, if there is one: exactly one incoming leg, one
 * outgoing leg, and one other line (a quark line emitting a W, an ion drawn as a blob
 * emitting a photon, a gluon turning into a quark). The one place this is decided.
 */
export function passThroughAt(g: Graph, vertexId: string): PassThrough | undefined {
  const around = g.neighbours.get(vertexId);
  if (!around || g.legs.has(vertexId)) return undefined;
  const incoming = around.filter((n) => isIncomingLeg(g, n));
  const outgoing = around.filter((n) => isOutgoingLeg(g, n));
  const other = around.filter((n) => !g.legs.has(n));
  if (incoming.length !== 1 || outgoing.length !== 1 || other.length !== 1) return undefined;
  return { incoming: incoming[0], outgoing: outgoing[0], other: other[0] };
}
