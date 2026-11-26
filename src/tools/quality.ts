import type { Diagram, Edge } from "../model.ts";
import { parse } from "../parse/parse.ts";
import { drawDiagram } from "../render/render.ts";
import { splitPanels } from "../render/panels.ts";
import { themeWith } from "../theme.ts";
import type { ThemeOverrides } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/** Measurements of how readable a laid-out diagram is. Zero everywhere means nothing to fix. */
export interface Quality {
  /** pairs of lines that cross where neither shares a vertex with the other */
  crossings: number;
  /** pairs of vertices drawn closer together than a label is tall */
  crowdedVertices: number;
  /** smallest angle, in degrees, between two lines leaving one vertex (180 if none) */
  smallestAngle: number;
  /** labels that sit on a line or on another label */
  crowdedLabels: number;
  /** lines drawn shorter than a quarter of a propagator */
  stubs: number;
  /** drawn width over height */
  aspect: number;
  /** one line per problem, for reading */
  problems: string[];
}

type Point = { x: number; y: number };

function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const side = (p: Point, q: Point, r: Point) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
}

function sharesVertex(e: Edge, f: Edge): boolean {
  return e.from === f.from || e.from === f.to || e.to === f.from || e.to === f.to;
}

/**
 * Lay a diagram out with the default theme and measure it. Curved lines are measured by their
 * chords. Several panels are measured one by one and added up (the smallest angle is the least
 * of them; the aspect is the widest panel's).
 */
export function measure(source: string, theme: ThemeOverrides = {}): Quality {
  const panels = splitPanels(source);
  if (panels.length <= 1) return measureOne(panels[0]?.source ?? source, theme);
  const each = panels.map((p) => ({ caption: p.caption, q: measureOne(p.source, theme) }));
  const sum = (k: "crossings" | "crowdedVertices" | "crowdedLabels" | "stubs") => each.reduce((n, { q }) => n + q[k], 0);
  return {
    crossings: sum("crossings"), crowdedVertices: sum("crowdedVertices"), crowdedLabels: sum("crowdedLabels"), stubs: sum("stubs"),
    smallestAngle: Math.min(...each.map(({ q }) => q.smallestAngle)),
    aspect: Math.max(...each.map(({ q }) => q.aspect)),
    problems: each.flatMap(({ caption, q }) => q.problems.map((p) => `${caption}: ${p}`)),
  };
}

function measureOne(source: string, theme: ThemeOverrides = {}): Quality {
  const t = themeWith(theme);
  const d: Diagram = parse(source);
  // (a view that draws something other than the laid-out diagram, a reaction (as a nuclear
  // process is drawn unless asked otherwise), a lattice or the kinematics, has no layout to
  // score: its points are never placed, and a nucleus there is one drawing, not its nucleons)
  const view = (d.directives.view ?? "").trim().toLowerCase();
  if (view === "lattice" || view === "kinematic" || view === "reaction" || (d.nuclear && !view)) {
    return { crossings: 0, crowdedVertices: 0, crowdedLabels: 0, smallestAngle: 180, stubs: 0, aspect: 1, problems: [] };
  }
  const { scene } = drawDiagram(d, { theme });
  const at = (id: string): Point => ({ x: d.vertices.get(id)!.x * t.unitX, y: d.vertices.get(id)!.y * t.unitY });
  const problems: string[] = [];
  const straight = d.edges.filter((e) => e.from !== e.to && e.style.line !== "none");

  // (two legs whose order the author listed in `in:` or `out:` cross on purpose: a u-channel's
  // final states, or its beams. The crossing is the one asked for when the drawing keeps the
  // listed order, the first listed above; otherwise the two crossed by accident, and it counts)
  // (a leg: one end listed in `in:` or `out:`, the other a point inside the diagram; a line from an
  // incoming leg straight to an outgoing one, a spectator quark, is no leg, and its crossings count)
  const external = (id: string) => { const r = d.vertices.get(id)!.role; return r === "in" || r === "out"; };
  const listedLeg = (g: Edge) => (external(g.from) && external(g.to) ? undefined : [g.from, g.to].map((id) => d.vertices.get(id)!).find((v) => v.declaredOrder !== undefined && (v.role === "in" || v.role === "out")));
  const askedFor = (e: Edge, f: Edge) => {
    const a = listedLeg(e), b = listedLeg(f);
    return !!a && !!b && a.role === b.role && (a.declaredOrder! - b.declaredOrder!) * (at(a.id).y - at(b.id).y) > 0;
  };
  let crossings = 0;
  for (let i = 0; i < straight.length; i++) {
    for (let j = i + 1; j < straight.length; j++) {
      const e = straight[i], f = straight[j];
      if (e.bend || f.bend || sharesVertex(e, f) || askedFor(e, f)) continue;
      if (segmentsCross(at(e.from), at(e.to), at(f.from), at(f.to))) {
        crossings++;
        problems.push(`${e.from}-${e.to} crosses ${f.from}-${f.to}`);
      }
    }
  }

  const ids = [...d.vertices.keys()];
  let crowdedVertices = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = at(ids[i]), b = at(ids[j]);
      if (portable.hypot(a.x - b.x, a.y - b.y) < t.fontSize * 0.9) {
        crowdedVertices++;
        problems.push(`${ids[i]} and ${ids[j]} are almost on top of each other`);
      }
    }
  }

  let smallestAngle = 180;
  for (const id of ids) {
    const p = at(id);
    const angles = straight.filter((e) => !e.bend && (e.from === id || e.to === id))
      .map((e) => at(e.from === id ? e.to : e.from)).map((q) => portable.atan2(q.y - p.y, q.x - p.x));
    for (let i = 0; i < angles.length; i++) {
      for (let j = i + 1; j < angles.length; j++) {
        const gap = Math.abs(((angles[i] - angles[j] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * 180 / Math.PI;
        if (gap < smallestAngle) smallestAngle = gap;
        if (gap < 12) problems.push(`two lines leave ${id} only ${gap.toFixed(0)} degrees apart`);
      }
    }
  }

  let stubs = 0;
  for (const e of straight) {
    const a = at(e.from), b = at(e.to);
    if (portable.hypot(a.x - b.x, a.y - b.y) < t.unitX * 0.25) {
      stubs++;
      problems.push(`${e.from}-${e.to} is a stub`);
    }
  }

  for (const label of scene.crowdedLabels) problems.push(`label "${label}" is crowded`);
  const xs = ids.map((id) => at(id).x), ys = ids.map((id) => at(id).y);
  const aspect = (Math.max(...xs) - Math.min(...xs) + 1) / (Math.max(...ys) - Math.min(...ys) + 1);
  return { crossings, crowdedVertices, crowdedLabels: scene.crowdedLabels.length, smallestAngle, stubs, aspect, problems };
}
