import { fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import { FeynError } from "../model.ts";
import type { Diagram } from "../model.ts";
import type { Rectangle, Scene } from "./scene.ts";
import { vertexRadius } from "./vertices.ts";
import { objectNamed } from "../particles/objects.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * Notes (`note: c "Higgs self-coupling"`, `note: a--b "long-lived" below`): a few words set in
 * free space near a point or a line, with an arrow drawn to it as if by hand, a smooth, gently
 * curving stroke in red ending in an open arrowhead. Placed after every other label, where
 * the diagram leaves room, away from its middle unless a side is given.
 */
export function drawNotes(scene: Scene, d: Diagram): void {
  const notes = (d.directives.note ?? "").split("\n").filter((n) => n.trim());
  notes.forEach((text, k) => drawNote(scene, d, text, k));
}

/**
 * Notes in a view that draws on its own (a reaction, a decay chain, a grid of nuclei): the same
 * words and hand-drawn arrows, each pointing at whatever `targetOf` finds for its target, which
 * may be any name the view knows (`4He`, `e-`, `burst`, `238U--234Th`, `(2, 1)`).
 */
export function drawViewNotes(scene: Scene, notes: string | undefined, targetOf: (target: string) => { point: Pt; reach: number } | undefined): void {
  (notes ?? "").split("\n").filter((n) => n.trim()).forEach((written, index) => {
    const m = /^\s*(\([^)]*\)|[^\s"{]+?(?:\s*--\s*[^\s"{]+)?)\s+(?:"([^"]*)"|\{(.*)\})\s*(above|below|left|right)?\s*$/.exec(written);
    if (!m) throw new FeynError(`write a note as: note: 4He "words" (a nucleus or particle by name), or note: 238U--234Th "words" below (an arrow between two)`);
    const target = targetOf(m[1].trim());
    if (!target) throw new FeynError(`a note points at something drawn: a nucleus or particle by name (4He, e-), the burst, or an arrow between two (238U--234Th): no "${m[1].trim()}"`);
    placeNote(scene, target.point, target.reach, m[2] ?? m[3] ?? "", m[4], index);
  });
}

const SIDES: Record<string, Pt> = { above: { x: 0, y: -1 }, below: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

/** One note: `target "text" [side]`, the target a point or a line `a--b`, the text in quotes or braces. */
function drawNote(scene: Scene, d: Diagram, written: string, index: number): void {
  const m = /^\s*([\w']+(?:\.[BD]\d*)?(?:\s*--\s*[\w']+)?)\s+(?:"([^"]*)"|\{(.*)\})\s*(above|below|left|right)?\s*$/.exec(written);
  if (!m) throw new FeynError(`write a note as: note: a "words" (a point), or note: a--b "words" below (a line)`);
  const { point, reach } = targetOf(scene, d, m[1].replace(/\s+/g, ""));
  placeNote(scene, point, reach, m[2] ?? m[3] ?? "", m[4], index);
}

/** A note's words set near `point`, clear of what is drawn, and its arrow to it. */
function placeNote(scene: Scene, point: Pt, reach: number, words: string, side: string | undefined, index: number): void {
  // (plain words are set upright as words; anything with TeX in it as written)
  const tex = /[\\^_$]/.test(words) ? words : `\\text{${words}}`;
  // (away from the diagram's middle, unless a side is asked for)
  const away = { x: point.x - scene.core.x, y: point.y - scene.core.y }, n = portable.hypot(away.x, away.y);
  const prefer = side ? SIDES[side] : n > 1 ? { x: away.x / n, y: away.y / n } : { x: 0, y: -1 };
  const turn = (v: Pt, deg: number) => { const t = (deg * Math.PI) / 180; return { x: v.x * portable.cos(t) - v.y * portable.sin(t), y: v.x * portable.sin(t) + v.y * portable.cos(t) }; };
  const far = scene.theme.unitX * 0.75;
  const spots = [0, 25, -25, 50, -50, 80, -80].flatMap((deg) => [1, 1.35, 1.7].map((k) => ({ spot: { anchor: point, direction: turn(prefer, deg) }, clearance: reach + far * k })));
  // (the words in the diagram's own colour, the arrow in the note colour, a red clear of the blue jets)
  const box = scene.placeNow(tex, spots, undefined, "feynjs-note", point);
  drawHandArrow(scene, fromBox(box, point), point, reach + 3, scene.theme.noteColor, index);
}

/** Where a note points: a point (and how far its mark reaches), or the middle of a line between two. */
function targetOf(scene: Scene, d: Diagram, target: string): { point: Pt; reach: number } {
  // (inside a detector object: a b-jet's B or D decay vertex, B, or that of the jet ending at f, f.B)
  // (a number picks one of several, in the order drawn: B2, bjet2, inside a large jet as well)
  const part = /^(?:([\w']+)\.)?([BD])(\d*)$/.exec(target);
  if (part && !d.vertices.has(target)) {
    const which = part[2] as "B" | "D", found = scene.objectParts.filter((p) => p[which] && (!part[1] || p.edge.from === part[1] || p.edge.to === part[1]))[Number(part[3] || 1) - 1];
    if (found) return { point: found[which]!, reach: scene.theme.line.trackWidth * 3 };
  }
  // (a detector object by its name, a leg, a line inside the diagram, or a jet inside an object: bjet, bjet2, largejet)
  const named = /^([A-Za-z]+?)(\d*)$/.exec(target), object = named ? objectNamed(named[1]) : undefined;
  if (named && object && !d.vertices.has(target)) {
    const found = scene.objectParts.filter((p) => p.kind === object.name)[Number(named[2] || 1) - 1];
    if (found) return { point: found.middle, reach: scene.theme.line.jetMaxHalfWidth * 0.4 };
  }
  const [a, b] = target.split("--");
  const va = d.vertices.get(a), vb = b ? d.vertices.get(b) : undefined;
  // (or a particle by name, H or W+: the middle of its line, the first that carries it)
  if (!va && !b) {
    // (a final state first: the leg that ends in it)
    const named = d.edges.find((e) => [e.from, e.to].some((id) => d.vertices.get(id)?.particle === a || d.vertices.get(id)?.label === a)) ?? d.edges.find((e) => e.particle === a || e.label === a);
    const curve = named ? scene.edgeCurves.get(named) : undefined;
    if (curve) { const p = curve.at(curve.length / 2); return { point: { x: p.x, y: p.y }, reach: scene.theme.line.waveAmplitude }; }
  }
  if (!va || (b && !vb)) throw new FeynError(`a note points at a point (such as c), a line between two (a--b), a particle or object by name (H, bjet), or a b-jet's B or D vertex (B, f.D): no "${target}"`);
  if (!vb) return { point: scene.position(va), reach: vertexRadius(va, scene.theme.vertex) };
  const e = d.edges.find((x) => (x.from === a && x.to === b) || (x.from === b && x.to === a));
  const curve = e ? scene.edgeCurves.get(e) : undefined;
  if (curve) { const p = curve.at(curve.length / 2); return { point: { x: p.x, y: p.y }, reach: scene.theme.line.waveAmplitude }; }
  const pa = scene.position(va), pb = scene.position(vb);
  return { point: { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }, reach: 2 };
}

/** The point on a note's box, a little outside it, nearest the way to its target. */
function fromBox(box: Rectangle, target: Pt): Pt {
  const cx = (box.left + box.right) / 2, cy = (box.top + box.bottom) / 2;
  const dx = target.x - cx, dy = target.y - cy, hw = (box.right - box.left) / 2 + 3, hh = (box.bottom - box.top) / 2 + 3;
  const t = Math.min(hw / (Math.abs(dx) || 1e-6), hh / (Math.abs(dy) || 1e-6));
  return { x: cx + dx * t, y: cy + dy * t };
}

/**
 * A hand-drawn arrow from `from` toward `to`, stopping `short` of it: one smooth, gentle curve
 * and an open arrowhead of two strokes not quite alike.
 */
function drawHandArrow(scene: Scene, from: Pt, to: Pt, short: number, colour: string, seed: number): void {
  const len0 = portable.hypot(to.x - from.x, to.y - from.y) || 1;
  const end = { x: to.x - ((to.x - from.x) / len0) * short, y: to.y - ((to.y - from.y) / len0) * short };
  const len = portable.hypot(end.x - from.x, end.y - from.y) || 1, ux = (end.x - from.x) / len, uy = (end.y - from.y) / len;
  // (bowed a little to one side, the same side for the same note)
  const bow = len * 0.16 * (seed % 2 ? -1 : 1);
  const control = { x: (from.x + end.x) / 2 - uy * bow, y: (from.y + end.y) / 2 + ux * bow };
  const at = (t: number): Pt => ({ x: portable.square(1 - t) * from.x + 2 * (1 - t) * t * control.x + t * t * end.x, y: portable.square(1 - t) * from.y + 2 * (1 - t) * t * control.y + t * t * end.y });
  const pts: Pt[] = [];
  const steps = Math.max(12, Math.ceil(len / 4));
  for (let k = 0; k <= steps; k++) {
    const t = k / steps, p = at(t);
    pts.push(p);
  }
  // the head: two short strokes back from the tip, along the curve's last heading
  const last = pts[pts.length - 1], before = pts[pts.length - 3];
  const hx = last.x - before.x, hy = last.y - before.y, hn = portable.hypot(hx, hy) || 1;
  const stroke = (deg: number, length: number) => { const t = (deg * Math.PI) / 180, bx = -hx / hn, by = -hy / hn; return { x: last.x + (bx * portable.cos(t) - by * portable.sin(t)) * length, y: last.y + (bx * portable.sin(t) + by * portable.cos(t)) * length }; };
  // (one smooth stroke)
  const w = scene.theme.line.stroke * 1.3;
  const head = `M${fmt(stroke(27, 8).x)} ${fmt(stroke(27, 8).y)}L${fmt(last.x)} ${fmt(last.y)}L${fmt(stroke(-24, 7).x)} ${fmt(stroke(-24, 7).y)}`;
  scene.labels.push(`<g class="feynjs-note-arrow" fill="none" stroke="${colour}" stroke-linecap="round" stroke-linejoin="round">`
    + `<path d="${pathFrom(pts)}" stroke-width="${fmt(w)}"/><path d="${head}" stroke-width="${fmt(w)}"/></g>`);
  for (const p of pts) scene.bounds.include(p.x, p.y, 2);
}
