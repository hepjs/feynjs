import { Curve, fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import type { Edge } from "../model.ts";
import type { Scene } from "./scene.ts";

let gradients = 0;

/**
 * A particle that lives a while (`[lifetime]`): a soft band under its line, from clear where it
 * is made to most of its colour where it decays, so the eye reads the distance it travels. With a
 * label (`lifetime={c\tau}`), a brace beside the line carries it.
 */
export function drawLifetime(scene: Scene, e: Edge, curve: Curve, lineColour: string | undefined, side: Pt): void {
  const look = scene.theme.lifetime;
  const colour = lineColour ?? look.color;
  drawLifetimeBand(scene, curve, colour, look.width / 2, look.opacity, e.style.cls);
  if (e.lifetime) drawLifetimeBrace(scene, e.lifetime, curve, side, look.width / 2 + 3, look.braceDepth);
}

/** The band: as wide as `half` either side of the line, filled with a gradient along it. */
function drawLifetimeBand(scene: Scene, curve: Curve, colour: string, half: number, opacity: number, cls?: string): void {
  const steps = Math.max(2, Math.ceil(curve.length / 4));
  const left: Pt[] = [], right: Pt[] = [];
  for (let k = 0; k <= steps; k++) {
    const at = (curve.length * k) / steps;
    left.push(curve.offset(at, -half));
    right.push(curve.offset(at, half));
  }
  const start = curve.at(0), end = curve.at(curve.length);
  const id = `${scene.idPrefix}-life${gradients++}`;
  // (beneath every line: it lies under the one it belongs to)
  // (in the line's colour, through `color`, so a page that recolours the line, a SUSY line on a
  // dark page, recolours its band too)
  scene.edges.unshift(`<g class="feynjs-lifetime${cls ? ` feynjs-${cls}` : ""}" color="${colour}"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(start.x)}" y1="${fmt(start.y)}" x2="${fmt(end.x)}" y2="${fmt(end.y)}">`
    + `<stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset="1" stop-color="currentColor" stop-opacity="${fmt(opacity)}"/></linearGradient></defs>`
    + `<path d="${pathFrom([...left, ...right.reverse()], true)}" fill="url(#${id})" stroke="none"/></g>`);
  for (const p of [...left, ...right]) scene.bounds.include(p.x, p.y, 1);
  scene.addObstacleCurve(curve, half);
}

/**
 * A curly brace beside the line, `gap` from it on the side `side`, from where the particle is
 * made to where it decays, its point `depth` further out, with the label beyond the point.
 */
function drawLifetimeBrace(scene: Scene, label: string, curve: Curve, side: Pt, gap: number, depth: number): void {
  const a0 = curve.at(0), b0 = curve.at(curve.length);
  const length = Math.hypot(b0.x - a0.x, b0.y - a0.y);
  if (length < depth * 4) return;
  const u = { x: (b0.x - a0.x) / length, y: (b0.y - a0.y) / length };
  // (outward: across the line, toward `side`)
  const across = { x: -u.y, y: u.x }, sign = across.x * side.x + across.y * side.y >= 0 ? 1 : -1;
  const n = { x: across.x * sign, y: across.y * sign };
  const inset = Math.min(length * 0.06, 4);
  const at = (s: number, h: number): Pt => ({ x: a0.x + u.x * s + n.x * (gap + h), y: a0.y + u.y * s + n.y * (gap + h) });
  const from = inset, to = length - inset, middle = length / 2, spine = depth / 2;
  const curl = Math.min(depth * 0.6, (to - from) / 4);
  const p = (s: number, h: number) => { const q = at(s, h); return `${fmt(q.x)} ${fmt(q.y)}`; };
  const d = `M${p(from, 0)}Q${p(from, spine)} ${p(from + curl, spine)}L${p(middle - curl, spine)}Q${p(middle, spine)} ${p(middle, depth)}`
    + `Q${p(middle, spine)} ${p(middle + curl, spine)}L${p(to - curl, spine)}Q${p(to, spine)} ${p(to, 0)}`;
  scene.edges.push(`<path class="feynjs-lifetime-brace" d="${d}" fill="none" stroke="currentColor" stroke-width="${fmt(scene.theme.line.stroke * 0.8)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (const q of [at(from, 0), at(to, 0), at(middle, depth)]) scene.bounds.include(q.x, q.y, 1);
  scene.addObstacleCurve(Curve.line(at(from, spine), at(to, spine)), spine + 1);
  scene.addLabel(label, at(middle, depth), n, scene.theme.labelGap);
}
