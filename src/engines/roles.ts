import type { Diagram, Vertex } from "../model.ts";

/**
 * Decide which external legs enter and which leave. Legs named i1, i2... enter and
 * f1, f2... leave; otherwise a leg written first in a chain enters and one written
 * last leaves. Must run before edge styles are resolved.
 */
export function assignRoles(d: Diagram): void {
  const neighbours = buildNeighbours(d);
  const legs = [...d.vertices.values()].filter((v) => isExternalLeg(v, neighbours));
  // (a nucleus at the end of a line, written neither in nor out, is what the line acts on: a target)
  for (const v of legs) if (v.shape === "nucleus" && !v.role && !/^(i|in|p|f|o|out)\d*$/i.test(v.id)) v.target = true;
  for (const v of legs) {
    if (v.role) continue;
    if (/^(i|in|p)\d*$/i.test(v.id)) v.role = "in";
    else if (/^(f|o|out)\d*$/i.test(v.id)) v.role = "out";
  }
  for (const v of legs) {
    if (v.role) continue;
    const edge = d.edges.find((e) => e.from === v.id || e.to === v.id)!;
    v.role = edge.from === v.id ? "in" : "out";
  }
  if (legs.length && !legs.some((v) => v.role === "in")) legs[0].role = "in";
}

/** Each vertex's neighbours, each counted once (a loop on itself is not a neighbour). */
function buildNeighbours(d: Diagram): Map<string, string[]> {
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
function isExternalLeg(v: Vertex, neighbours: Map<string, string[]>): boolean {
  return neighbours.get(v.id)!.length === 1 && v.shape !== "blob" && v.shape !== "hatched";
}
