import type { Diagram } from "../../model.ts";
import { buildNeighbours, isExternalLeg } from "./graph.ts";

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
