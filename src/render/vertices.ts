import { bagRadius, bagReach, bagSvg } from "./bag.ts";
import { nucleusRadius, nucleusSvg, recoilRings, recoilSvg, recoiledTo } from "./nucleus.ts";
import { Curve } from "../geometry/curve.ts";
import { drawLine } from "./lines.ts";
import type { Pt } from "../geometry/curve.ts";
import { fmt } from "../geometry/curve.ts";
import type { Vertex } from "../model.ts";
import { lookupParticle } from "../particles/registry.ts";
import { quarkFromLabel } from "../particles/identify.ts";
import { layoutLabel } from "../label/label.ts";
import type { VertexLook } from "../theme.ts";
import type { LabelSpot, Scene } from "./scene.ts";
import * as portable from "../geometry/portable-math.ts";

/** A labelled circle's radius, px: one size whatever it holds (a longer label is set smaller). */
const CIRCLE_RADIUS = 9;

/** Radius a vertex shape covers; lines stop at this distance from its centre. */
/** How far what is drawn at `v` reaches toward (dx, dy): its radius, or an oval's rim that way. */
export function reachToward(v: Vertex, look: VertexLook, dx: number, dy: number): number {
  // (a nucleus's edge is bumpy: a line runs a little way under it, so it never stops short)
  if (v.shape === "nucleus") return vertexRadius(v, look) * 0.82;
  return v.shape === "bag" ? bagReach(v.bag?.quarks ?? [], dx, dy) : vertexRadius(v, look);
}

export function vertexRadius(v: Vertex, look: VertexLook): number {
  if (v.shape === "bag") return bagRadius(v.bag?.quarks ?? []);
  if (v.shape === "nucleus") return nucleusRadius(v.nucleus?.A ?? 1, look.nucleusUnit);
  if (v.shape === "blob" || v.shape === "hatched") return look.blob;
  if (v.shape === "smallhatched") return look.smallBlob * 1.6;
  if (v.shape === "slashed") return look.crossedDot * 0.7;
  if (v.shape === "crossed") return look.crossedDot;
  if (v.shape === "circle") return CIRCLE_RADIUS * (v.dotScale ?? 1);
  return 0;
}

/** Dots that carry a coupling label or a colour are drawn larger. */
function dotRadius(v: Vertex, look: VertexLook): number {
  return (v.dotScale ?? 1) * dotSize(v, look);
}
function dotSize(v: Vertex, look: VertexLook): number {
  return v.coupling || v.color ? look.couplingDot : look.dot;
}

export function crossPath(p: Pt, arm: number): string {
  return `M${fmt(p.x - arm)} ${fmt(p.y - arm)}L${fmt(p.x + arm)} ${fmt(p.y + arm)}M${fmt(p.x - arm)} ${fmt(p.y + arm)}L${fmt(p.x + arm)} ${fmt(p.y - arm)}`;
}

export function drawVertexShape(scene: Scene, v: Vertex): void {
  const look = scene.theme.vertex;
  const p = scene.position(v);
  const color = scene.resolveColor(v.color);
  const colorAttr = color ? ` color="${color}"` : "";
  const outline = `stroke="currentColor" stroke-width="${scene.theme.line.stroke}"`;
  const rimColor = scene.resolveColor(v.rim) ?? "currentColor";
  const rim = `stroke="${rimColor}" stroke-width="${fmt(scene.theme.line.stroke * 0.7)}"`;
  const at = `cx="${fmt(p.x)}" cy="${fmt(p.y)}"`;
  const r = dotRadius(v, look);
  let svg = "";
  switch (v.shape) {
    // (a coloured dot has an ink rim, as in papers, so it reads against any line or page)
    case "dot": svg = color || v.rim ? `<circle ${at} r="${fmt(r)}" fill="${color ?? "currentColor"}" ${rim}/>` : `<circle ${at} r="${fmt(r)}" fill="currentColor"/>`; break;
    case "square": svg = `<rect x="${fmt(p.x - r)}" y="${fmt(p.y - r)}" width="${r * 2}" height="${r * 2}" fill="${color ?? "currentColor"}"${color ? ` ${rim}` : ""}/>`; break;
    case "empty": svg = `<circle class="feynjs-bg" ${at} r="${r}" fill="#fff" ${outline}${colorAttr}/>`; break;
    case "crossed":
      svg = `<g${colorAttr}><circle class="feynjs-bg" ${at} r="${look.crossedDot}" fill="#fff" ${outline}/><path d="${crossPath(p, look.crossedDot * Math.SQRT1_2)}" fill="none" ${outline}/></g>`;
      break;
    // (a mixing, kinetic or otherwise: a small open circle struck through once)
    case "slashed": {
      // (smaller than a crossed source: a mixing is a mark on a line, not a source of its own)
      const radius = look.crossedDot * 0.7, arm = radius * Math.SQRT1_2;
      svg = `<g${colorAttr}><circle class="feynjs-bg" ${at} r="${fmt(radius)}" fill="#fff" ${outline}/><path d="M${fmt(p.x - arm)} ${fmt(p.y + arm)}L${fmt(p.x + arm)} ${fmt(p.y - arm)}" fill="none" ${outline}/></g>`;
      break;
    }
    case "circle": {
      // a circle with a label inside, as papers mark where a jet starts (its flavour: b, c, l);
      // its rim fine and in the jets' colour; `color=` colours the rim and the label
      const radius = CIRCLE_RADIUS * (v.dotScale ?? 1);
      let inner = "";
      if (v.circleLabel) {
        const box = layoutLabel(v.circleLabel, scene.theme.fontSize * 0.85 * (v.dotScale ?? 1), scene.theme.wordLabelScale);
        const k = Math.min(1, (radius * 1.5) / Math.max(box.width, 0.01));
        const lx = p.x - (box.width * k) / 2, ly = p.y + ((box.ascent - box.descent) * k) / 2;
        inner = `<g transform="translate(${fmt(lx)} ${fmt(ly)})${k < 1 ? ` scale(${fmt(k)})` : ""}" fill="${color ?? "currentColor"}">${box.svg}</g>`;
      }
      svg = `<g class="feynjs-circle"><circle class="feynjs-bg" ${at} r="${fmt(radius)}" fill="#fff" stroke="${color ?? scene.resolveColor(v.rim) ?? scene.theme.line.jetColor}" stroke-width="${fmt(scene.theme.line.stroke * 0.7)}"/>${inner}</g>`;
      break;
    }
    case "insertion": svg = `<path d="${crossPath(p, look.insertion)}" fill="none" ${outline}${colorAttr}/>`; break;
    case "smallblob": svg = `<circle class="feynjs-smallblob" ${at} r="${look.smallBlob}" fill="${color ?? look.smallBlobFill}" ${outline}/>`; break;
    // (the same grey as the decay vertices: one kind of point, as papers shade them)
    case "blob": svg = `<circle class="feynjs-collision" ${at} r="${look.blob}" fill="${color ?? look.smallBlobFill}" ${outline}/>`; break;
    case "bag": svg = bagSvg(p, v.bag?.quarks ?? [], scene.theme, !!v.bag?.motion); break;
    case "nucleus": svg = nucleusAt(scene, v, p); break;
    case "smallhatched":
      scene.usesHatching = true;
      svg = `<circle class="feynjs-bg" ${at} r="${look.smallBlob * 1.6}" fill="#fff"/><circle ${at} r="${look.smallBlob * 1.6}" fill="url(#${scene.idPrefix}-hatch)" ${outline}${colorAttr}/>`;
      break;
    case "hatched":
      scene.usesHatching = true;
      svg = `<circle class="feynjs-bg" ${at} r="${look.blob}" fill="#fff"/><circle ${at} r="${look.blob}" fill="url(#${scene.idPrefix}-hatch)" ${outline}${colorAttr}/>`;
      break;
  }
  if (svg) scene.vertices.push(`<g data-vertex="${v.id.replace(/"/g, "&quot;")}">${svg}</g>`);
  // a pulse: two rings, out of step, growing from the point's rim and fading, behind it
  // (on a nucleus, its energy instead: a still glow and rings, drawn with the nucleus)
  if (v.pulse !== undefined && v.shape !== "nucleus") {
    const from = Math.max(vertexRadius(v, look), r, 5), to = from * 2.8, beat = scene.theme.pulseSeconds;
    const colour = scene.resolveColor(v.pulse || undefined) ?? scene.theme.pulseColor;
    const ring = (delay: number) => `<circle class="feynjs-pulse" ${at} r="${fmt(from)}" fill="none" stroke="${colour}" stroke-width="${fmt(scene.theme.line.stroke * 1.4)}" opacity="0">`
      + `<animate attributeName="r" values="${fmt(from)};${fmt(to)}" dur="${beat}s" begin="${delay}s" repeatCount="indefinite"/>`
      + `<animate attributeName="opacity" values="0.75;0" dur="${beat}s" begin="${delay}s" repeatCount="indefinite"/></circle>`;
    scene.edges.unshift(ring(0) + ring(beat / 2));
    scene.bounds.include(p.x, p.y, to + 2);
  }
  if (v.shape !== "none") scene.addObstaclePoint(p, Math.max(vertexRadius(v, look), r));
  scene.bounds.include(p.x, p.y, Math.max(vertexRadius(v, look), v.shape === "none" ? 0 : r) + 1);
}

/**
 * A nucleus as drawn at its point, with what it may carry: its energy (`pulse`, `excited`, or a
 * star, `Xe*`), a still warm glow and faint rings round it; its recoil (`recoil`), the nucleus
 * moved on with faint copies trailing back to where it was hit; and what it gives off (`emits=gamma`),
 * a short line out of it, away from what hits it.
 */
function nucleusAt(scene: Scene, v: Vertex, p: Pt): string {
  const look = scene.theme.vertex, R = nucleusRadius(v.nucleus?.A ?? 1, look.nucleusUnit);
  const colours = { proton: look.proton, neutron: look.neutron, edge: look.nucleonEdge, protonEdge: look.protonEdge, neutronEdge: look.neutronEdge };
  const one = (at: Pt) => nucleusSvg(at, v.nucleus?.A ?? 1, v.nucleus?.Z ?? 0, look.nucleusUnit, colours);
  // (away from what hits it: against the lines that meet it, on average; up and to the right with none)
  const angles = scene.lineAngles.get(v.id) ?? [];
  const sum = angles.reduce((s, a) => ({ x: s.x - portable.cos(a), y: s.y - portable.sin(a) }), { x: 0, y: 0 }), n = portable.hypot(sum.x, sum.y);
  const away = n > 1e-6 ? { x: sum.x / n, y: sum.y / n } : { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  let svg = "";
  const dir = v.recoil !== undefined ? recoilDirection(v.recoil) ?? away : undefined;
  // (the nucleus where it is drawn: moved on, if it recoils)
  const centre = dir ? recoiledTo(p, dir, R) : p;
  if (v.pulse !== undefined) {
    const glow = energyGlow(centre, R, scene.resolveColor(energyColour(v.pulse)) ?? energyColour(v.pulse), energyLevel(v.pulse), scene.theme.line.stroke);
    scene.edges.unshift(glow.svg);
    scene.bounds.include(centre.x, centre.y, glow.reach + 1);
  }
  if (dir) {
    svg = recoilSvg(p, dir, R, one, scene.theme.line.stroke);
    scene.bounds.include(centre.x, centre.y, R + 1);
    for (const ring of recoilRings(centre, dir, R)) scene.bounds.include(ring.c.x, ring.c.y, ring.r + 1);
    scene.addObstaclePoint(centre, R);
  } else svg = one(p);
  if (v.emits) {
    // (a short line out of it, from inside, ending in its name; turned off the recoil's way when it has one)
    const turn = v.recoil !== undefined ? -0.8 : 0;
    const u = { x: away.x * portable.cos(turn) - away.y * portable.sin(turn), y: away.x * portable.sin(turn) + away.y * portable.cos(turn) };
    const particle = lookupParticle(v.emits), from = { x: p.x + u.x * R * 0.6, y: p.y + u.y * R * 0.6 }, to = { x: p.x + u.x * (R + scene.theme.unitX * 0.75), y: p.y + u.y * (R + scene.theme.unitX * 0.75) };
    scene.over.push(`<g class="feynjs-emitted" data-particle="${v.emits.replace(/"/g, "&quot;")}">${drawLine(Curve.line(from, to), { ...(particle?.style ?? { line: "wave", arrow: 0 }), arrow: 0 }, scene.theme.line)}</g>`);
    scene.addObstacleCurve(Curve.line(from, to), scene.theme.line.waveAmplitude);
    scene.bounds.include(to.x, to.y, 2);
    scene.requestLabel(particle?.label ?? v.emits, legLabelSpots(to, u), scene.theme.labelGap + 1, undefined, 1, true);
  }
  return svg;
}

/** Where a recoil goes, as written: `down`, `up`, `left`, `right`, or an angle (degrees, anticlockwise from the right); undefined, away from what hits it. */
function recoilDirection(written: string): Pt | undefined {
  const words: Record<string, Pt> = { down: { x: 0, y: 1 }, up: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  if (words[written.trim().toLowerCase()]) return words[written.trim().toLowerCase()];
  const degrees = Number(written);
  if (!written.trim() || !Number.isFinite(degrees)) return undefined;
  const a = (degrees * Math.PI) / 180;
  return { x: portable.cos(a), y: -portable.sin(a) };
}

/** How much energy `pulse=` says: 1 (low, and `pulse` alone), 2 (medium), 3 (high), or a number between. */
export function energyLevel(written: string): number {
  const word: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const n = word[written.trim().toLowerCase()] ?? Number(written);
  return Number.isFinite(n) && written.trim() ? Math.max(1, Math.min(3, n)) : 1.4;
}

/** The colour of a nucleus's energy: amber, warming toward a hot near-white yellow with more (`pulse=high`), or as written (`pulse=#ffaa00`). */
export function energyColour(written: string): string {
  const level = written.trim().toLowerCase();
  if (level && !/^(low|medium|high|[\d.]+)$/.test(level)) return written.trim();
  // (soft amber at 1, golden at 2, near-white yellow at 3)
  const stops = [[0xe6, 0x9a, 0x3c], [0xf4, 0xc4, 0x3f], [0xff, 0xf3, 0xb0]], t = energyLevel(written) - 1;
  const [lo, hi] = t < 1 ? [stops[0], stops[1]] : [stops[1], stops[2]], f = t < 1 ? t : t - 1;
  return `#${lo.map((c, k) => Math.round(c + (hi[k] - c) * f).toString(16).padStart(2, "0")).join("")}`;
}

/** A nucleus's energy, still: a soft glow behind it and two or three faint rings round it, more for more energy. */
export function energyGlow(p: Pt, R: number, colour: string, level: number, stroke: number): { svg: string; reach: number } {
  const rings = level >= 2 ? 3 : 2, gap = R * 0.22 + 2;
  const circle = (r: number, attrs: string) => `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(r)}" ${attrs}/>`;
  const svg = `<g class="feynjs-energy">${circle(R * 1.12 + 1, `fill="${colour}" fill-opacity="0.32"`)}${circle(R * 1.3 + 2, `fill="${colour}" fill-opacity="0.14"`)}`
    + Array.from({ length: rings }, (_, k) => circle(R + gap * (k + 1) + 1, `fill="none" stroke="${colour}" stroke-width="${fmt(stroke * 0.8)}" stroke-opacity="${fmt(0.6 - k * 0.17)}"`)).join("") + `</g>`;
  return { svg, reach: R + gap * rings + 2 };
}

/** Label of an external leg: continues the line outward, coloured like its particle. */
export function labelExternalLeg(scene: Scene, v: Vertex): void {
  const direction = scene.legDirection.get(v.id);
  if (!v.label || !direction) return;
  // (a label is coloured like its particle, and a SUSY particle's shares its class for styling)
  const particle = v.particle ? lookupParticle(v.particle) : undefined;
  const susy = particle?.style.cls === "susy";
  const color = scene.resolveColor(v.color) ?? scene.colourForCharge(v.particle ?? quarkFromLabel(v.label)) ?? (susy ? scene.theme.susyColor : undefined);
  const cls = susy ? "feynjs-susy" : undefined;
  if (scene.legsInsideHadrons.has(v.id)) {
    // the end of the line is inside a hadron: name the quark beside the line, short of the
    // hadron; above it if that is clear, else below, else a little further back
    const end = scene.position(v), size = scene.theme.fontSize;
    const at = (back: number) => ({ x: end.x - direction.x * back, y: end.y - direction.y * back });
    const spots = [1.6, 2.4, 3.2].flatMap((k) => [{ anchor: at(size * k), direction: { x: 0, y: -1 } }, { anchor: at(size * k), direction: { x: 0, y: 1 } }]);
    scene.requestLabel(v.label, spots, scene.theme.labelGap, color, 0.9, false, cls, v.particle);
    return;
  }
  if (v.coneMark) {
    // a small cone in the jets' own column, level with the end of the line and opening to the
    // right, and the name beyond it
    const end = scene.position(v), size = scene.theme.fontSize;
    const apex = { x: scene.conePlane ?? end.x + size * 0.6, y: scene.coneY.get(v.id) ?? end.y };
    const length = size * 1.1, half = size * 0.38;
    const base = { x: apex.x + length, y: apex.y };
    const side = { x: 0, y: half };
    scene.vertices.push(`<path class="feynjs-cone" d="M${fmt(base.x + side.x)} ${fmt(base.y + side.y)}L${fmt(apex.x)} ${fmt(apex.y)}L${fmt(base.x - side.x)} ${fmt(base.y - side.y)}Z" fill="none" stroke="${color ?? "currentColor"}" stroke-width="${fmt(scene.theme.line.stroke * 0.7)}" stroke-linejoin="round"/>`);
    scene.bounds.include(base.x + side.x, base.y + side.y, 2);
    scene.bounds.include(base.x - side.x, base.y - side.y, 2);
    scene.addObstaclePoint({ x: (apex.x + base.x) / 2, y: (apex.y + base.y) / 2 }, length / 2);
    scene.requestLabel(v.label, legLabelSpots(base, { x: 1, y: 0 }), scene.theme.labelGap + 1, color, 1, true, cls, v.particle);
    return;
  }
  // (a leg that ends in a nucleus is named clear of the nucleus, not of its middle)
  const reach = v.shape === "nucleus" ? vertexRadius(v, scene.theme.vertex) : 0;
  scene.requestLabel(v.label, legLabelSpots(scene.position(v), direction), scene.theme.labelGap + 1 + reach, color, 1, true, cls, v.particle);
}

/** Places a leg label may go, best first: straight on from the line, then swung to either side. */
function legLabelSpots(end: Pt, direction: Pt): LabelSpot[] {
  const swung = (degrees: number): Pt => {
    const a = (degrees * Math.PI) / 180;
    return { x: direction.x * portable.cos(a) - direction.y * portable.sin(a), y: direction.x * portable.sin(a) + direction.y * portable.cos(a) };
  };
  return [0, -40, 40, -75, 75].map((degrees) => ({ anchor: end, direction: swung(degrees) }));
}

/** The middles of the gaps between the lines at a vertex, widest first (upward first on ties). */
function gapDirections(angles: number[]): Pt[] {
  const sorted = angles.slice().sort((a, b) => a - b);
  const gaps = sorted.map((from, i) => {
    const to = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 2 * Math.PI;
    return { middle: (from + to) / 2, gap: to - from };
  });
  // (a forward gap, between the products, comes first when it is wide enough for a label, as
  // papers set a coupling's name; otherwise the widest gap, upward on ties)
  const forward = (g: { middle: number; gap: number }) => portable.cos(g.middle) > 0.5 && g.gap >= Math.PI / 3;
  gaps.sort((a, b) => Number(forward(b)) - Number(forward(a)) || b.gap - a.gap || portable.sin(a.middle) - portable.sin(b.middle));
  return gaps.map((g) => ({ x: portable.cos(g.middle), y: portable.sin(g.middle) }));
}

/** Direction of the widest gap between the lines at a vertex, preferring upward on ties. */
function widestGapDirection(angles: number[]): Pt {
  const sorted = angles.slice().sort((a, b) => a - b);
  let best = -Math.PI / 2, widest = -1;
  sorted.forEach((from, i) => {
    const to = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 2 * Math.PI;
    const middle = (from + to) / 2, gap = to - from;
    const isTie = Math.abs(gap - widest) < 1e-6;
    if (gap > widest + 1e-6 || (isTie && portable.sin(middle) < portable.sin(best))) { widest = gap; best = middle; }
  });
  return { x: portable.cos(best), y: portable.sin(best) };
}

/** Coupling label beside an internal vertex, in the widest gap between its lines. */
export function labelCoupling(scene: Scene, v: Vertex): void {
  const isExternal = scene.legDirection.has(v.id);
  const text = v.coupling ?? (isExternal ? undefined : v.label);
  if (!text) return;
  const look = scene.theme.vertex;
  const clearance = Math.max(vertexRadius(v, look), dotRadius(v, look)) + scene.theme.labelGap;
  // (on the side the author chose; otherwise the widest gap, or the next if another label is there)
  if (v.couplingSide) { scene.addLabel(text, scene.position(v), v.couplingSide, clearance, scene.resolveColor(v.color), scene.theme.couplingLabelScale); return; }
  const angles = scene.lineAngles.get(v.id) ?? [];
  const directions = angles.length ? gapDirections(angles) : [widestGapDirection(angles)];
  scene.requestLabel(text, directions.map((direction) => ({ anchor: scene.position(v), direction })), clearance, scene.resolveColor(v.color), scene.theme.couplingLabelScale, true);
}
