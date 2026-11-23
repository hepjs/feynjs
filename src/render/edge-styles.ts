import type { Diagram, Edge, EdgeStyle } from "../model.ts";
import { lookupParticle } from "../particles/registry.ts";
import { radiationTarget } from "../engines/forces/structure.ts";

/**
 * Give each unstyled edge the style of the particle named on its external end, and
 * point fermion arrows the right way: particles travel forward in time, antiparticles
 * backward. Needs the in/out roles of the external legs.
 */
export function inheritStylesFromExternalParticles(d: Diagram): void {
  for (const e of d.edges) {
    if (e.styled) continue;
    for (const end of [e.from, e.to]) {
      const v = d.vertices.get(end)!;
      const particle = v.particle ? lookupParticle(v.particle) : undefined;
      if (!particle || !v.role) continue;
      const style: EdgeStyle = { ...particle.style, color: e.style.color, ...(e.styleDefaults ?? {}) };
      if (particle.style.arrow === 1) {
        const flowsAwayFromLeg = (v.role === "in") !== !!particle.anti;
        style.arrow = (e.from === end) === flowsAwayFromLeg ? 1 : -1;
      }
      e.style = style;
      e.particle = v.particle;
      break;
    }
  }
  propagateFermionFlow(d);
}

/**
 * Carry the direction of a fermion line through vertices where it passes straight on: a
 * plain line with no arrow takes its arrow from the arrowed fermion line that meets it.
 */
function propagateFermionFlow(d: Diagram): void {
  const isBare = (e: Edge) => e.style.line === "plain" && e.style.arrow === 0 && !e.styled && !e.style.cls;
  const isArrowed = (e: Edge) => e.style.line === "plain" && (e.style.arrow === 1 || e.style.arrow === -1);
  for (let changed = true, rounds = 0; changed && rounds < 20; rounds++) {
    changed = false;
    for (const id of d.vertices.keys()) {
      const fermions = d.edges.filter((e) => e.style.line === "plain" && e.style.arrow !== 2 && (e.from === id || e.to === id));
      if (fermions.length !== 2) continue;
      const [first, second] = fermions;
      for (const [known, bare] of [[first, second], [second, first]]) {
        if (!isArrowed(known) || !isBare(bare)) continue;
        const arrives = (known.to === id) === (known.style.arrow === 1);
        // flow through the vertex: if it arrives here along `known`, it leaves along `bare`
        const bareLeavesFromHere = bare.from === id;
        bare.style = { ...bare.style, arrow: arrives === bareLeavesFromHere ? 1 : -1 };
        changed = true;
      }
    }
  }
}

/** Parallel edges between the same two vertices bow apart into a loop. */
export function bowParallelEdges(d: Diagram): void {
  const byPair = new Map<string, Edge[]>();
  for (const e of d.edges) {
    if (e.from === e.to) continue;
    const pair = [e.from, e.to].sort().join("\u0000");
    if (!byPair.has(pair)) byPair.set(pair, []);
    byPair.get(pair)!.push(e);
  }
  for (const edges of byPair.values()) {
    if (edges.length < 2 || edges.some((e) => e.bend !== undefined)) continue;
    const fermionLines = edges.filter((e) => e.style.line === "plain");
    if (edges.length === 2 && fermionLines.length === 1) {
      // a boson leaving a fermion line and rejoining it: the line stays straight, the boson arcs over it
      const boson = edges.find((e) => e !== fermionLines[0])!;
      boson.bend = 90;
      boson.bendIsAutomatic = true;
      continue;
    }
    const bends = edges.length === 2 ? [90, -90] : edges.map((_, i) => 90 - (180 * i) / (edges.length - 1));
    edges.forEach((e, i) => { e.bend = (e.from === edges[0].from ? 1 : -1) * bends[i]; });
  }
}

/**
 * Diagram-wide switches written as `name: value` lines:
 *   arrows: none   draw no fermion arrows (the convention of many SUSY diagrams)
 *   dots: all      put a dot on every vertex where lines meet
 */
export function applyDiagramDirectives(d: Diagram): void {
  const degree = new Map<string, number>();
  for (const e of d.edges) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);
  if (d.directives.arrows === "none" || d.directives.arrows === "off") {
    for (const e of d.edges) e.style = { ...e.style, arrow: 0 };
  }
  if (d.directives.dots === "all") {
    for (const v of d.vertices.values()) {
      if (v.shape === "none" && (degree.get(v.id) ?? 0) >= 3) v.shape = "dot";
    }
  }
}

/**
 * A quark that gives off a gluon (or any boson) on its way into the collision, a blob, is one
 * line with the gluon coming off it, as initial-state radiation is drawn: one arrow, on the
 * leg, and none on the short stretch from the gluon into the blob.
 */
export function oneArrowIntoBlob(d: Diagram): void {
  const at = new Map<string, Edge[]>();
  for (const e of d.edges) for (const id of [e.from, e.to]) (at.get(id) ?? at.set(id, []).get(id)!).push(e);
  const far = (e: Edge, id: string) => d.vertices.get(e.from === id ? e.to : e.from)!;
  const arrowed = (e: Edge) => e.style.line === "plain" && e.style.arrow !== 0;
  for (const [id, lines] of at) {
    const v = d.vertices.get(id)!;
    if (v.role || v.shape !== "none" || lines.length !== 3) continue;
    const leg = lines.find((e) => arrowed(e) && far(e, id).role === "in");
    // (into a blob, or on into the collision when the author marked what it gives off as radiation)
    const target = radiationTarget(d, id);
    const intoBlob = lines.find((e) => e !== leg && arrowed(e) && (["blob", "hatched"].includes(far(e, id).shape) || far(e, id).id === target));
    const emitted = lines.find((e) => e !== leg && e !== intoBlob);
    // (given off: a gluon coming in, gu -> u, is a collision of its own, and keeps the arrow)
    if (leg && intoBlob && emitted && !arrowed(emitted) && far(emitted, id).role !== "in") intoBlob.style = { ...intoBlob.style, arrow: 0 };
  }
}
