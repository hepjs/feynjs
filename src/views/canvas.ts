import { Curve, fmt } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import { layoutLabel } from "../label/label.ts";
import type { LabelBox } from "../label/label.ts";
import type { Diagram } from "../model.ts";
import { nucleusNamed } from "../parse/chains.ts";
import { lookupParticle } from "../particles/registry.ts";
import { drawViewNotes } from "../render/notes.ts";
import { nucleusSvg, recoilRings, recoilSvg, recoiledTo } from "../render/nucleus.ts";
import { energyColour, energyGlow, energyLevel } from "../render/vertices.ts";
import { Scene } from "../render/scene.ts";
import type { Theme } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * Where the nuclear views draw (the reaction, the decay chain, the grid of nuclei): what is drawn,
 * the box round it, and every nucleus, particle and arrow by the names a note may point at them by.
 */
export class Canvas {
  parts: string[] = [];
  labels: string[] = [];
  private x0 = Infinity; private y0 = Infinity; private x1 = -Infinity; private y1 = -Infinity;
  /** what a note may point at: its names, where it is, how far it reaches, and (an arrow) the two it joins */
  private targets: { id: number; names: string[]; point: Pt; reach: number; ends?: [number, number] }[] = [];
  private discs: { p: Pt; r: number }[] = [];
  private lines: { a: Pt; b: Pt }[] = [];
  private boxes: { left: number; top: number; right: number; bottom: number }[] = [];
  readonly theme: Theme;
  constructor(theme: Theme) { this.theme = theme; }

  grow(x: number, y: number): void { this.x0 = Math.min(this.x0, x); this.x1 = Math.max(this.x1, x); this.y0 = Math.min(this.y0, y); this.y1 = Math.max(this.y1, y); }

  /** A nucleus at `p`, its nucleons in the theme's colours; known by `names` to notes. Returns its id. */
  nucleus(p: Pt, A: number, Z: number, radius: number, names: string[]): number {
    const v = this.theme.vertex;
    this.parts.push(nucleusSvg(p, A, Z, v.nucleusUnit, { proton: v.proton, neutron: v.neutron, edge: v.nucleonEdge, protonEdge: v.protonEdge, neutronEdge: v.neutronEdge }));
    this.grow(p.x - radius, p.y - radius); this.grow(p.x + radius, p.y + radius);
    this.discs.push({ p, r: radius });
    return this.target([...names, `${A}/${Z}`], p, radius);
  }

  /** A nucleus hit at `p`, recoiling toward `dir`: drawn moved on, inside the rings of its motion (see recoilSvg); known to notes where it is drawn. Returns its id. */
  recoiling(p: Pt, dir: Pt, A: number, Z: number, radius: number, names: string[]): number {
    const v = this.theme.vertex, colours = { proton: v.proton, neutron: v.neutron, edge: v.nucleonEdge, protonEdge: v.protonEdge, neutronEdge: v.neutronEdge };
    this.parts.push(recoilSvg(p, dir, radius, (at) => nucleusSvg(at, A, Z, v.nucleusUnit, colours), this.theme.line.stroke));
    const moved = recoiledTo(p, dir, radius);
    for (const q of [p, moved]) { this.grow(q.x - radius, q.y - radius); this.grow(q.x + radius, q.y + radius); this.discs.push({ p: q, r: radius }); }
    for (const ring of recoilRings(moved, dir, radius)) { this.grow(ring.c.x - ring.r, ring.c.y - ring.r); this.grow(ring.c.x + ring.r, ring.c.y + ring.r); }
    return this.target([...names, `${A}/${Z}`, "recoil"], moved, radius);
  }

  /** A nucleus's energy round `p`, behind everything: a still glow and faint rings (see energyGlow). */
  glow(p: Pt, radius: number, written: string): void {
    const { svg, reach } = energyGlow(p, radius, energyColour(written), energyLevel(written), this.theme.line.stroke);
    this.parts.unshift(svg);
    this.grow(p.x - reach, p.y - reach); this.grow(p.x + reach, p.y + reach);
  }

  /** Something a note may point at, by any of `names`. Returns its id. */
  target(names: string[], point: Pt, reach: number, ends?: [number, number]): number {
    const id = this.targets.length;
    this.targets.push({ id, names, point, reach, ends });
    return id;
  }

  /** An arrow (or any line) drawn already, from `a` to `b`: kept clear by notes, and pointed at between the two it joins. */
  line(a: Pt, b: Pt, ends?: [number, number]): void {
    this.lines.push({ a, b });
    this.grow(a.x, a.y); this.grow(b.x, b.y);
    if (ends) this.target([], { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 2, ends);
  }

  /** A label set at `x`, its baseline at `baseline`. */
  text(box: LabelBox, x: number, baseline: number): void {
    this.labels.push(`<g transform="translate(${fmt(x)} ${fmt(baseline)})" fill="currentColor">${box.svg}</g>`);
    this.boxes.push({ left: x, top: baseline - box.ascent, right: x + box.width, bottom: baseline + box.descent });
    this.grow(x, baseline - box.ascent); this.grow(x + box.width, baseline + box.descent);
  }

  /** A label beside `p`, set off toward `u` by its own half size and `gap`, so it clears what it names. */
  textToward(tex: string, size: number, p: Pt, u: Pt, gap: number): void {
    const box = layoutLabel(tex, size, 1);
    const x = p.x + u.x * (gap + box.width / 2) - box.width / 2;
    const baseline = p.y + u.y * (gap + (box.ascent + box.descent) / 2) + (box.ascent - box.descent) / 2;
    this.text(box, x, baseline);
  }

  /** What a note's target names: a thing by any of its names (`4He`, `He`, `e-`, `burst`), or an arrow between two (`238U--234Th`). */
  find(target: string): { point: Pt; reach: number } | undefined {
    const ids = (name: string) => {
      const n = nucleusNamed(name.trim()), keys = [name.trim(), ...(n ? [`${n.A}/${n.Z}`] : [])];
      return this.targets.filter((t) => t.names.some((k) => keys.includes(k)) || (lookupParticle(name.trim()) && t.names.includes(`particle:${name.trim()}`))).map((t) => t.id);
    };
    const one = ids(target);
    if (one.length) return this.targets[one[0]];
    const sides = target.split(/\s*--\s*/);
    if (sides.length !== 2) return undefined;
    const [a, b] = sides.map(ids);
    return this.targets.find((t) => t.ends && ((a.includes(t.ends[0]) && b.includes(t.ends[1])) || (a.includes(t.ends[1]) && b.includes(t.ends[0]))));
  }

  /**
   * The finished drawing: its notes (`note:` lines) placed where it leaves room, clear of every
   * nucleus, line and label, and the box round all of it; as wide either side of x = 0 with `even`.
   */
  svg(d: Diagram, cls: string, aria: string, middle: Pt, even = false, idPrefix = "feyn"): string {
    const theme = this.theme;
    if (d.directives.note) {
      const scene = new Scene(d, theme, idPrefix);
      scene.core = middle;
      for (const { p, r } of this.discs) scene.addObstaclePoint(p, r);
      for (const { a, b } of this.lines) scene.addObstacleCurve(Curve.line(a, b), theme.line.stroke);
      for (const box of this.boxes) scene.addLabelBox(box);
      drawViewNotes(scene, d.directives.note, (target) => this.find(target));
      this.labels.push(...scene.labels);
      if (Number.isFinite(scene.bounds.left)) { this.grow(scene.bounds.left, scene.bounds.top); this.grow(scene.bounds.right, scene.bounds.bottom); }
    }
    if (!Number.isFinite(this.x0)) { this.grow(0, 0); }
    const across = Math.max(-this.x0, this.x1);
    const [left, right] = even ? [-across, across] : [this.x0, this.x1];
    const pad = theme.padding, w = right - left + 2 * pad, h = this.y1 - this.y0 + 2 * pad, scale = theme.drawingScale;
    return `<svg xmlns="http://www.w3.org/2000/svg" class="feynjs ${cls}" role="img" aria-label="${aria}" viewBox="${fmt(left - pad)} ${fmt(this.y0 - pad)} ${fmt(w)} ${fmt(h)}" width="${fmt(w * scale)}" height="${fmt(h * scale)}" font-family="${theme.fontFamily}">`
      + `${this.parts.join("")}${this.labels.join("")}</svg>`;
  }
}

/** The way out from the middle at `degrees` (anticlockwise from the right; y runs down). */
export function unitAt(degrees: number): Pt {
  const a = (degrees * Math.PI) / 180;
  return { x: portable.cos(a), y: -portable.sin(a) };
}

export const scaled = (u: Pt, r: number): Pt => ({ x: u.x * r, y: u.y * r });
export const along = (p: Pt, u: Pt, r: number): Pt => ({ x: p.x + u.x * r, y: p.y + u.y * r });
