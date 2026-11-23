import type { Diagram } from "../../model.ts";
import { edgeJoining, edgeKey, isLeg, neighboursOf } from "./graph.ts";
import type { Graph } from "./graph.ts";

/**
 * A mark on a line: a vertex with exactly two lines, such as a mixing insertion or the
 * point where a propagator changes name. Nothing interacts there, so it must not bend
 * the line or lengthen it. It is taken out before the layout and put back on the line.
 */
export interface LineMark {
  vertex: string;
  between: [string, string];
}

function numberOfLinesAt(d: Diagram, vertexId: string): number {
  return d.edges.reduce((count, e) => count + (e.from === vertexId ? 1 : 0) + (e.to === vertexId ? 1 : 0), 0);
}

/** Remove every mark from the graph, joining its two neighbours directly. */
export function detachMarksOnLines(g: Graph): LineMark[] {
  const marks: LineMark[] = [];
  for (let found = true; found;) {
    found = false;
    for (const v of g.vertices) {
      if (isLeg(g, v.id) || numberOfLinesAt(g.diagram, v.id) !== 2) continue;
      const around = neighboursOf(g, v.id);
      if (around.length !== 2) continue;
      const [a, b] = around;
      if (neighboursOf(g, a).includes(b)) continue; // joining them would double an existing line
      // two particles leaving one point (a quark pair from the vacuum) is a vertex, not a mark
      if (isLeg(g, a) && isLeg(g, b)) continue;
      // the joined line is drawn like its first half, as far as the layout is concerned
      g.joinedLines.set(edgeKey(a, b), edgeJoining(g, a, v.id)!);
      // only a mark that is drawn (a cross, a dot) makes its line longer and slants it; a point
      // where a propagator merely changes its name (Z* into rho_T) leaves the line as it was
      const drawn = v.shape === "none" ? 0 : 1;
      const carried = (g.marksOnLine.get(edgeKey(a, v.id)) ?? 0) + (g.marksOnLine.get(edgeKey(v.id, b)) ?? 0);
      if (drawn + carried > 0) g.marksOnLine.set(edgeKey(a, b), drawn + carried);
      g.neighbours.set(a, neighboursOf(g, a).map((n) => (n === v.id ? b : n)));
      g.neighbours.set(b, neighboursOf(g, b).map((n) => (n === v.id ? a : n)));
      g.neighbours.delete(v.id);
      g.vertices = g.vertices.filter((other) => other.id !== v.id);
      marks.push({ vertex: v.id, between: [a, b] });
      found = true;
      break;
    }
  }
  return marks;
}

/**
 * Put every mark back on its line, evenly spaced: one mark sits halfway, two at a third
 * and two thirds, and so on.
 */
export function placeMarksOnLines(d: Diagram, marks: LineMark[]): void {
  if (marks.length === 0) return;
  const isMark = new Set(marks.map((m) => m.vertex));
  const lines = new Map<string, string[]>();
  for (const e of d.edges) {
    for (const [from, to] of [[e.from, e.to], [e.to, e.from]]) {
      if (!lines.has(from)) lines.set(from, []);
      lines.get(from)!.push(to);
    }
  }
  const placed = new Set<string>();
  for (const start of d.vertices.keys()) {
    if (isMark.has(start)) continue;
    for (const first of lines.get(start) ?? []) {
      if (!isMark.has(first) || placed.has(first)) continue;
      // follow the chain of marks to the vertex that ends it
      const chain: string[] = [];
      let previous = start, at = first;
      while (isMark.has(at) && !chain.includes(at)) {
        chain.push(at);
        const next = (lines.get(at) ?? []).find((n) => n !== previous);
        if (next === undefined) break;
        previous = at;
        at = next;
      }
      if (isMark.has(at)) continue;
      const from = d.vertices.get(start)!, to = d.vertices.get(at)!;
      chain.forEach((id, i) => {
        const v = d.vertices.get(id)!;
        const t = (i + 1) / (chain.length + 1);
        v.x = from.x + (to.x - from.x) * t;
        v.y = from.y + (to.y - from.y) * t;
        placed.add(id);
      });
    }
  }
}
