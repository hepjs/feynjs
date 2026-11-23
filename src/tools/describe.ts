import type { Diagram, Edge } from "../model.ts";
import { isExternal, kindOfLine, linesByVertex, readDiagram } from "./prepare.ts";

/** What a diagram says, as data: for checking a diagram without looking at it. */
export interface Description {
  incoming: string[];
  outgoing: string[];
  /** internal lines: propagators and loop lines */
  propagators: { between: [string, string]; kind: string; label?: string }[];
  /** interaction vertices and the kinds of line meeting at each */
  vertices: { id: string; lines: string[]; marker?: string; coupling?: string }[];
  /** number of independent loops */
  loops: number;
  /** number of separate pieces: more than one usually means a spectator line */
  pieces: number;
  hadrons: { name: string; legs: string[] }[];
  /** one line, for example "g g -> t tbar H" */
  process: string;
}

function countPieces(d: Diagram): number {
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    while (parent.get(id) !== id) { parent.set(id, parent.get(parent.get(id)!)!); id = parent.get(id)!; }
    return id;
  };
  for (const id of d.vertices.keys()) parent.set(id, id);
  for (const e of d.edges) parent.set(find(e.from), find(e.to));
  return new Set([...d.vertices.keys()].map(find)).size;
}

/** The name to report for an external leg: its label, or failing that the kind of its line. */
function nameOfLeg(d: Diagram, id: string, line: Edge): string {
  const v = d.vertices.get(id)!;
  return v.particle ?? v.label ?? line.label ?? kindOfLine(line);
}

/** Summarise a diagram's physics content as plain data. */
export function describe(source: string): Description {
  return describeParsed(readDiagram(source));
}

/** Describe a diagram that has already been parsed, with its legs classified and its lines styled. */
export function describeParsed(d: Diagram): Description {
  const lines = linesByVertex(d);
  const external = new Set([...d.vertices.keys()].filter((id) => isExternal(d, id, lines)));
  const byListedOrder = (a: string, b: string) =>
    (d.vertices.get(a)!.declaredOrder ?? Infinity) - (d.vertices.get(b)!.declaredOrder ?? Infinity);
  const legsWithRole = (role: "in" | "out") =>
    [...external].filter((id) => d.vertices.get(id)!.role === role).sort(byListedOrder)
      .map((id) => nameOfLeg(d, id, lines.get(id)![0]));

  const incoming = legsWithRole("in"), outgoing = legsWithRole("out");
  const pieces = countPieces(d);
  return {
    incoming,
    outgoing,
    propagators: d.edges.filter((e) => !external.has(e.from) && !external.has(e.to))
      .map((e) => ({ between: [e.from, e.to], kind: kindOfLine(e), ...(e.label ? { label: e.label } : {}) })),
    vertices: [...d.vertices.values()].filter((v) => !external.has(v.id)).map((v) => ({
      id: v.id,
      lines: lines.get(v.id)!.map(kindOfLine),
      ...(v.shape !== "none" ? { marker: v.shape } : {}),
      ...(v.coupling ? { coupling: v.coupling } : {}),
    })),
    loops: d.edges.length - d.vertices.size + pieces,
    pieces,
    hadrons: d.hadrons.map((h) => ({ name: h.label, legs: h.legs })),
    process: `${incoming.join(" ")} -> ${outgoing.join(" ")}`,
  };
}
