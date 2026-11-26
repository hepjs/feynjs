import { assignRoles } from "../engines/roles.ts";
import type { Diagram, Edge } from "../model.ts";
import { parse } from "../parse/parse.ts";
import { inheritStylesFromExternalParticles } from "../render/edge-styles.ts";

/** A parsed diagram with its legs classified and every line's style settled, but not laid out. */
export function readDiagram(source: string): Diagram {
  const d = parse(source);
  assignRoles(d);
  inheritStylesFromExternalParticles(d);
  return d;
}

/** The lines meeting at each vertex. */
export function linesByVertex(d: Diagram): Map<string, Edge[]> {
  const lines = new Map<string, Edge[]>();
  for (const id of d.vertices.keys()) lines.set(id, []);
  for (const e of d.edges) {
    lines.get(e.from)!.push(e);
    if (e.to !== e.from) lines.get(e.to)!.push(e);
  }
  return lines;
}

/** True for an external leg: a vertex with one line that is not a blob. */
export function isExternal(d: Diagram, id: string, lines: Map<string, Edge[]>): boolean {
  const v = d.vertices.get(id)!;
  return lines.get(id)!.length === 1 && v.shape !== "blob" && v.shape !== "hatched";
}

/** A short name for the kind of particle a line is drawn as. */
export function kindOfLine(e: Edge): string {
  const { line, arrow, overlay, cls } = e.style;
  if (cls === "susy") return line === "coil" ? "gluino" : line === "dash" ? "sfermion" : "gaugino";
  if (cls === "ion") return "nucleus";
  if (line === "plain") return arrow === 2 ? "majorana fermion" : "fermion";
  if (line === "wave") return arrow ? "charged boson" : "boson";
  if (line === "coil") return overlay ? "gluino" : "gluon";
  if (line === "dash") return arrow ? "charged scalar" : "scalar";
  if (line === "dot") return "ghost";
  if (line === "triple") return "proton";
  return line;
}
