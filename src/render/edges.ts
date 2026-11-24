import { Curve, fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import type { Diagram, Edge, Vertex } from "../model.ts";
import { particleOfEdge } from "../particles/identify.ts";
import { drawLifetime } from "./lifetime.ts";
import { drawLine, halfWidth } from "./lines.ts";
import type { LabelSpot, Scene } from "./scene.ts";
import { crossPath, reachToward, vertexRadius } from "./vertices.ts";

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

type PointOnCurve = { x: number; y: number; tx: number; ty: number };

/** The path an edge follows: straight, a circular arc, or a tadpole loop. */
function edgeCurve(scene: Scene, e: Edge, from: Vertex, to: Vertex): Curve {
  const a = scene.position(from), b = scene.position(to);
  if (from !== to && e.angles && (e.angles.out !== undefined || e.angles.in !== undefined)) return leavingAndArriving(a, b, e.angles);
  if (from !== to) return e.bend ? Curve.arc(a, b, e.bend) : Curve.line(a, b);
  // tadpole: loop away from the middle of the diagram
  let dx = a.x - scene.centre.x, dy = a.y - scene.centre.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) { dx = 0; dy = -1; } else { dx /= distance; dy /= distance; }
  return Curve.loop(a, dx, dy, scene.theme.unitX * 0.32);
}

/**
 * A line that leaves `a` at `out` degrees and arrives at `b` from `in` degrees, as TikZ draws
 * `out=..., in=...`: a cubic through two controls, each a fraction of the way (0.3915, TikZ's
 * own, times `looseness`) out along its angle. An angle not given is the straight line's.
 */
function leavingAndArriving(a: Pt, b: Pt, angles: { out?: number; in?: number; looseness?: number }): Curve {
  const straight = Math.atan2(-(b.y - a.y), b.x - a.x);
  const out = angles.out !== undefined ? (angles.out * Math.PI) / 180 : straight;
  const into = angles.in !== undefined ? (angles.in * Math.PI) / 180 : straight + Math.PI;
  const reach = Math.hypot(b.x - a.x, b.y - a.y) * 0.3915 * (angles.looseness ?? 1);
  // (degrees count counter-clockwise with y up; the page's y runs down)
  const c1 = { x: a.x + Math.cos(out) * reach, y: a.y - Math.sin(out) * reach };
  const c2 = { x: b.x + Math.cos(into) * reach, y: b.y - Math.sin(into) * reach };
  const pts: Pt[] = [];
  for (let k = 0; k <= 48; k++) {
    const t = k / 48, u = 1 - t;
    pts.push({ x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x, y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y });
  }
  return new Curve(pts);
}

/**
 * Which side of an edge its label goes on, as a unit vector: above a level line in the
 * middle, inside a level line off the middle, outside a curve, and otherwise away from
 * the middle of the diagram.
 */
function labelSideOf(scene: Scene, e: Edge, middle: PointOnCurve): Pt {
  const rightOfTravel = { x: -middle.ty, y: middle.tx };
  let sign: number;
  const loop = scene.loopMiddle.get(e);
  // a line on a closed loop is labelled outside the loop
  if (loop && !e.bend) sign = (middle.x - loop.x) * rightOfTravel.x + (middle.y - loop.y) * rightOfTravel.y >= 0 ? 1 : -1;
  else if (e.bend) sign = e.bend > 0 ? -1 : 1;
  else if (Math.abs(middle.ty) < 0.35) {
    // a level line is labelled above when it runs along the middle of the diagram; off the
    // middle (a decay chain) it is labelled on the inner side, clear of what it emits outward
    const offMiddle = middle.y - scene.centre.y;
    const pointsUp = Math.abs(offMiddle) < scene.theme.unitY * 0.25 || offMiddle > 0;
    sign = (rightOfTravel.y < 0) === pointsUp ? 1 : -1;
  }
  else {
    // a slanting line is labelled on its outer side: away from the diagram's midline (above
    // an upper branch, below a lower one); a near-upright line, away from the middle across
    const upright = Math.abs(middle.ty) > 0.94;
    const outward = upright ? (middle.x - scene.core.x) * rightOfTravel.x : (middle.y - scene.core.y) * rightOfTravel.y;
    sign = outward >= 0 ? 1 : -1;
  }
  // the author's label' puts it on the right of travel, as TikZ-Feynman does
  if (e.labelSide === -1) sign = 1;
  return { x: rightOfTravel.x * sign, y: rightOfTravel.y * sign };
}

/**
 * Places an edge label may go, best first: the middle of the line on its preferred side,
 * then the other side, then a little way along the line either way.
 */
function edgeLabelSpots(curve: Curve, preferredSide: Pt): LabelSpot[] {
  const otherSide = { x: -preferredSide.x, y: -preferredSide.y };
  const along = (fraction: number) => curve.at(curve.length * fraction);
  // (the preferred side is tried along the line before the label crosses to the other)
  return [
    { anchor: along(0.5), direction: preferredSide },
    { anchor: along(0.36), direction: preferredSide },
    { anchor: along(0.64), direction: preferredSide },
    { anchor: along(0.5), direction: otherSide },
    { anchor: along(0.36), direction: otherSide },
    { anchor: along(0.64), direction: otherSide },
    { anchor: along(0.25), direction: preferredSide },
    { anchor: along(0.75), direction: preferredSide },
    { anchor: along(0.25), direction: otherSide },
    { anchor: along(0.75), direction: otherSide },
  ];
}

/** A short arrow beside the edge showing momentum flow (against the line, if `reversed`), with its label. */
function drawMomentumArrow(scene: Scene, text: string, curve: Curve, side: Pt, clearance: number, reversed = false): void {
  const [startAt, endAt] = reversed ? [0.7, 0.3] : [0.3, 0.7];
  const start = curve.at(curve.length * startAt), end = curve.at(curve.length * endAt);
  if (reversed) { end.tx = -end.tx; end.ty = -end.ty; }
  const tail = { x: start.x + side.x * clearance, y: start.y + side.y * clearance };
  const tip = { x: end.x + side.x * clearance, y: end.y + side.y * clearance };
  const size = 5;
  const head = pathFrom([
    tip,
    { x: tip.x - end.tx * size - end.ty * size * 0.5, y: tip.y - end.ty * size + end.tx * size * 0.5 },
    { x: tip.x - end.tx * size + end.ty * size * 0.5, y: tip.y - end.ty * size - end.tx * size * 0.5 },
  ], true);
  scene.edges.push(`<path d="${pathFrom([tail, tip])}" fill="none" stroke="currentColor" stroke-width="0.9"/><path d="${head}" fill="currentColor"/>`);
  scene.addLabel(text, { x: (tail.x + tip.x) / 2, y: (tail.y + tip.y) / 2 }, side, scene.theme.labelGap, undefined, 0.9);
}

/** Remember which way the edge leaves each end: used to place leg and coupling labels. */
function recordEndDirections(scene: Scene, curve: Curve, from: Vertex, to: Vertex, degree: Map<string, number>): void {
  const leaving = curve.at(0), arriving = curve.at(curve.length);
  scene.recordLineAngle(from.id, Math.atan2(leaving.ty, leaving.tx));
  scene.recordLineAngle(to.id, Math.atan2(-arriving.ty, -arriving.tx));
  if (degree.get(from.id) === 1) scene.legDirection.set(from.id, { x: -leaving.tx, y: -leaving.ty });
  if (degree.get(to.id) === 1) scene.legDirection.set(to.id, { x: arriving.tx, y: arriving.ty });
}

/** Draw one edge: its line, then its label and momentum arrow if it has them. */
export function drawEdge(scene: Scene, d: Diagram, e: Edge, degree: Map<string, number>): void {
  const { theme } = scene;
  const from = d.vertices.get(e.from)!, to = d.vertices.get(e.to)!;
  const full = edgeCurve(scene, e, from, to);
  scene.edgeCurves.set(e, full);
  recordEndDirections(scene, full, from, to, degree);

  // lines stop at the rim of blobs
  // (to the rim of what is drawn there, in the direction the line meets it)
  const leaving = full.at(0), arriving = full.at(full.length);
  const curve = full.slice(reachToward(from, theme.vertex, leaving.tx, leaving.ty), full.length - reachToward(to, theme.vertex, -arriving.tx, -arriving.ty));
  // a leg marked as ending in a jet (`f1 [q, jet]`) gets a jet cone round its line
  if ((from.jetCone || to.jetCone) && !e.style.jetCone) e.style = { ...e.style, jetCone: true };
  // a jet or other detector object opens away from its vertex, whichever way the line was written
  const drawn = (e.style.line === "jet" || e.style.jetCone) && degree.get(e.from) === 1 && degree.get(e.to)! > 1 ? new Curve([...curve.pts].reverse(), curve.straight) : curve;
  const color = scene.resolveColor(e.style.color) ?? scene.colourForCharge(particleOfEdge(d, e)) ?? (e.style.cls === "susy" ? theme.susyColor : undefined);
  const cssClass = e.style.cls ? ` class="feynjs-${e.style.cls}"` : "";
  // a pulse along the line: a glow that widens and fades, behind it
  if (e.pulse !== undefined) {
    const colour = scene.resolveColor(e.pulse || undefined) ?? theme.pulseColor, beat = theme.pulseSeconds, w = theme.line.stroke;
    scene.edges.unshift(`<path class="feynjs-pulse" d="${pathFrom(drawn.pts)}" fill="none" stroke="${colour}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${fmt(w * 2)}" opacity="0">`
      + `<animate attributeName="stroke-width" values="${fmt(w * 2)};${fmt(w * 9)}" dur="${beat}s" repeatCount="indefinite"/>`
      + `<animate attributeName="opacity" values="0.6;0" dur="${beat}s" repeatCount="indefinite"/></path>`);
  }
  // (named, with its ends and its particle, so a program or a reader of the SVG can find it)
  const particle = particleOfEdge(d, e);
  const names = ` data-edge="${attr(scene.edgeIds.get(e) ?? `${e.from}--${e.to}`)}" data-from="${attr(e.from)}" data-to="${attr(e.to)}"${particle ? ` data-particle="${attr(particle)}"` : ""}${e.style.object ? ` data-object="${attr(e.style.object)}"` : ""}`;
  scene.edges.push(`<g${cssClass}${names}${color ? ` color="${color}"` : ""}>${drawLine(drawn, e.style, theme.line)}</g>`);
  // a long-lived particle's band (and brace, on the side away from its label)
  if (e.lifetime !== undefined) {
    const side = labelSideOf(scene, e, curve.at(curve.length / 2));
    drawLifetime(scene, e, curve, color, { x: -side.x, y: -side.y });
  }
  // insertions on the line (mass or mixing): a cross in a small ring, on a solid ground so the
  // line does not run through it
  for (const at of e.insertions ?? []) {
    const p = curve.at(curve.length * at), ring = theme.vertex.insertion * 1.25;
    scene.vertices.push(`<g class="feynjs-insertion"${color ? ` color="${color}"` : ""}><circle class="feynjs-bg" cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(ring)}" fill="#fff" stroke="currentColor" stroke-width="${fmt(theme.line.stroke)}"/>`
      + `<path d="${crossPath(p, ring * 0.62)}" fill="none" stroke="currentColor" stroke-width="${fmt(theme.line.stroke)}" stroke-linecap="round"/></g>`);
    scene.addObstaclePoint(p, ring + 1);
  }
  const lineHalfWidth = halfWidth(e.style, theme.line);
  for (const p of curve.pts) scene.bounds.include(p.x, p.y, lineHalfWidth + theme.line.stroke);
  const inkHalfWidth = ["plain", "dash", "dot"].includes(e.style.line) ? theme.line.stroke / 2 : lineHalfWidth + theme.line.stroke / 2;
  if (e.style.line !== "none") scene.addObstacleCurve(curve, inkHalfWidth);

  if (!e.label && !e.momentum) return;
  const middle = curve.at(curve.length / 2);
  const labelSide = labelSideOf(scene, e, middle);
  const labelClearance = lineHalfWidth + theme.line.stroke + Math.max(theme.labelGap, theme.labelMargin + 1);
  // (a label is coloured like its line, and a SUSY line's label shares its class for styling)
  // (a leg whose end already names its particle is not labelled twice)
  const legName = [from, to].find((v) => degree.get(v.id) === 1 && v.label)?.label;
  const labelColor = e.labelColor ? scene.resolveColor(e.labelColor) : color;
  if (e.label && e.label !== legName) scene.requestLabel(e.label, edgeLabelSpots(curve, labelSide), labelClearance, labelColor, 1, false, e.style.cls ? `feynjs-${e.style.cls}` : undefined, e.particle);
  if (e.momentum) {
    // (away from the label; `momentum'` on the label's side)
    const side = e.momentumOtherSide ? labelSide : { x: -labelSide.x, y: -labelSide.y };
    drawMomentumArrow(scene, e.momentum, curve, side, lineHalfWidth + theme.labelGap + 3, e.momentumReversed);
  }
}
