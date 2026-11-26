import { fmt } from "../geometry/curve.ts";
import type { RenderOptions } from "../render/render.ts";
import type { Scene } from "../render/scene.ts";
import { diagramModel, svgDocument } from "../render/svg.ts";
import type { Pt } from "../geometry/curve.ts";
import { layoutLabel } from "../label/label.ts";
import { FeynError } from "../model.ts";
import type { Diagram } from "../model.ts";
import type { Theme } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * The lattice view (`view: lattice`): space-time cut into a grid of sites joined by links, as
 * lattice QCD draws it, with what lives on it marked over the grid:
 *
 *   lattice: 7x5                          sites across (space) by up (time)
 *   wilson loop: (1,1) to (4,3)           a rectangular loop of links, R by T, braced
 *   plaquette: (5,2)                      the smallest loop: one square of links
 *   link: (1,4) to (2,4)                  one link, U_mu(x)
 *   polyakov loop: 6                      a line of links all the way round in time
 *   site: (3,0) [label=\psi(x)]           a site marked, with a name
 *   boundary: periodic                    the edges marked as joined round
 *   axes: off                             no x and t arrows in the corner
 *
 * Any of them takes `[label=...]`, and `[color=...]`; there may be as many of each as wanted.
 */
export function drawLattice(d: Diagram, theme: Theme, scene: Scene, options: RenderOptions = {}): string {
  const dirs = d.directives;
  const [nx, nt] = latticeSize(dirs.lattice);
  const a = theme.unitX * 0.42, stroke = theme.line.stroke;
  const at = (x: number, t: number): Pt => ({ x: x * a, y: -t * a });
  const parts: string[] = [], over: string[] = [], labels: string[] = [];
  let x0 = -a * 0.5, x1 = (nx - 1) * a + a * 0.5, y0 = -(nt - 1) * a - a * 0.5, y1 = a * 0.5;
  const grow = (x: number, y: number) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  const label = (text: string, p: Pt, ux: number, uy: number, size = theme.fontSize) => {
    const box = layoutLabel(text, size, theme.wordLabelScale);
    const gap = size * 0.35;
    // (set off from `p` toward (ux, uy) by its own half size, so it clears whatever it names)
    const lx = p.x + ux * (gap + box.width / 2) - box.width / 2;
    const ly = p.y + uy * (gap + (box.ascent + box.descent) / 2) + (box.ascent - box.descent) / 2;
    labels.push(`<g transform="translate(${fmt(lx)} ${fmt(ly)})" fill="currentColor">${box.svg}</g>`);
    grow(lx, ly - box.ascent); grow(lx + box.width, ly + box.descent);
  };

  // the grid: faint links between neighbouring sites, a small dot at each site
  const grid: string[] = [];
  for (let t = 0; t < nt; t++) grid.push(`M${pt(at(0, t))}L${pt(at(nx - 1, t))}`);
  for (let x = 0; x < nx; x++) grid.push(`M${pt(at(x, 0))}L${pt(at(x, nt - 1))}`);
  parts.push(`<path class="feynjs-lattice-links" d="${grid.join("")}" fill="none" stroke="currentColor" stroke-opacity="${GRID}" stroke-width="${fmt(stroke * 0.7)}"/>`);
  const sites: string[] = [];
  for (let x = 0; x < nx; x++) for (let t = 0; t < nt; t++) { const p = at(x, t); sites.push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(stroke * 1.2)}"/>`); }
  parts.push(`<g class="feynjs-lattice-sites" fill="currentColor" fill-opacity="${SITE}">${sites.join("")}</g>`);

  // (joined round: short dashed links past every edge)
  if (/^periodic/i.test((dirs.boundary ?? "").trim())) {
    const stub = a * 0.45, dashes: string[] = [];
    for (let t = 0; t < nt; t++) dashes.push(`M${pt(at(-0.45, t))}L${pt(at(0, t))}M${pt(at(nx - 1, t))}L${pt(at(nx - 1 + 0.45, t))}`);
    for (let x = 0; x < nx; x++) dashes.push(`M${pt(at(x, -0.45))}L${pt(at(x, 0))}M${pt(at(x, nt - 1))}L${pt(at(x, nt - 1 + 0.45))}`);
    parts.push(`<path d="${dashes.join("")}" fill="none" stroke="currentColor" stroke-opacity="${GRID}" stroke-width="${fmt(stroke * 0.7)}" stroke-dasharray="2 2.5"/>`);
    grow(-stub - 2, 0); grow((nx - 1) * a + stub + 2, -(nt - 1) * a - stub - 2);
  }

  // (a little quieter than the palette's own, beside the light grid)
  const colour = (opts: Record<string, string>, fallback: string) => muted(theme.colors[opts.color] ?? opts.color ?? fallback);
  // a loop of links round a rectangle, arrows running anticlockwise, braced R across and T up
  for (const item of items(dirs["wilson loop"])) {
    const [p, q] = twoSites(item.text, "wilson loop", nx, nt);
    const c = colour(item.opts, theme.colors.red ?? "#e0241b");
    const [xa, xb, ta, tb] = [Math.min(p[0], q[0]), Math.max(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[1], q[1])];
    if (xa === xb || ta === tb) throw new FeynError(`a wilson loop needs two corners apart in both x and t, such as (1,1) to (4,3)`);
    const corners = [at(xa, ta), at(xb, ta), at(xb, tb), at(xa, tb)];
    over.push(loopPath(corners, c, stroke * 1.6, `${xa}-${ta}`, true));
    over.push(brace(at(xa, ta), at(xb, ta), { x: 0, y: 1 }, a * 0.28, stroke));
    label(`R = ${xb - xa}`.replace(/ /g, "\\,"), { x: (at(xa, ta).x + at(xb, ta).x) / 2, y: at(xa, ta).y + a * 0.28 + 4 }, 0, 1, theme.fontSize * 0.8);
    over.push(brace(at(xa, ta), at(xa, tb), { x: -1, y: 0 }, a * 0.28, stroke));
    label(`T = ${tb - ta}`.replace(/ /g, "\\,"), { x: at(xa, ta).x - a * 0.28 - 4, y: (at(xa, ta).y + at(xa, tb).y) / 2 }, -1, 0, theme.fontSize * 0.8);
    label(item.opts.label ?? `W(R,T)`, { x: (corners[0].x + corners[1].x) / 2, y: (corners[1].y + corners[2].y) / 2 }, 0, 0);
  }
  // the smallest loop: one square, shaded, its arrows round it
  for (const item of items(dirs.plaquette)) {
    const [x, t] = oneSite(item.text, "plaquette", nx - 1, nt - 1);
    const c = colour(item.opts, theme.colors.blue ?? "#3f90da");
    const corners = [at(x, t), at(x + 1, t), at(x + 1, t + 1), at(x, t + 1)];
    parts.push(`<path d="M${corners.map(pt).join("L")}Z" fill="${c}" fill-opacity="0.16"/>`);
    over.push(loopPath(corners, c, stroke * 1.4, `${x}-${t}`, false));
    label(item.opts.label ?? "U_{\\mu\\nu}(x)", { x: (corners[0].x + corners[1].x) / 2, y: corners[0].y }, 0, 1, theme.fontSize * 0.85);
  }
  // one link: a gauge field on the line between two neighbouring sites
  for (const item of items(dirs.link)) {
    const [p, q] = twoSites(item.text, "link", nx, nt);
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) !== 1) throw new FeynError(`a link joins two neighbouring sites, such as (1,4) to (2,4)`);
    const c = colour(item.opts, theme.colors.green ?? "#2e8b57");
    const from = at(p[0], p[1]), to = at(q[0], q[1]);
    over.push(`<path d="M${pt(from)}L${pt(to)}" stroke="${c}" stroke-width="${fmt(stroke * 1.8)}" stroke-linecap="round"/>${arrowAt(from, to, c, stroke)}`);
    const across = q[1] === p[1] ? { x: 0, y: -1 } : { x: 1, y: 0 };
    label(item.opts.label ?? (q[1] === p[1] ? "U_\\mu(x)" : "U_\\nu(x)"), { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, across.x, across.y, theme.fontSize * 0.85);
  }
  // a line of links all the way round in time (closed by the periodic boundary)
  for (const item of items(dirs["polyakov loop"])) {
    const x = Number(item.text.trim());
    if (!(Number.isInteger(x) && x >= 0 && x < nx)) throw new FeynError(`a polyakov loop is one site across, from 0 to ${nx - 1}, such as "polyakov loop: 3"`);
    const c = colour(item.opts, theme.colors.purple ?? "#832db6");
    const bottom = at(x, -0.45), top = at(x, nt - 1 + 0.45);
    over.push(`<path d="M${pt(bottom)}L${pt(top)}" stroke="${c}" stroke-width="${fmt(stroke * 1.6)}" stroke-linecap="round"/>${arrowAt(at(x, 0), at(x, nt - 1), c, stroke * 1.4)}`);
    // (its ends marked as one point, joined round)
    for (const end of [bottom, top]) over.push(`<path d="M${fmt(end.x - 4)} ${fmt(end.y)}H${fmt(end.x + 4)}" stroke="${c}" stroke-width="${fmt(stroke)}"/>`);
    grow(top.x, top.y - 4); grow(bottom.x, bottom.y + 4);
    label(item.opts.label ?? "P(\\mathbf{x})", top, 0, -1, theme.fontSize * 0.85);
  }
  // sites marked: sources and sinks, quark fields
  for (const item of items(dirs.site)) {
    const [x, t] = oneSite(item.text, "site", nx, nt);
    const c = colour(item.opts, "currentColor"), p = at(x, t);
    over.push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(stroke * 2.6)}" fill="${c}"/>`);
    // (below and to the left, clear of a loop or brace it may start)
    if (item.opts.label) label(item.opts.label, p, -0.7, 0.7, theme.fontSize * 0.85);
  }
  // the directions, in the corner: x across, t up
  if (!/^(off|no|false)$/i.test((dirs.axes ?? "").trim())) {
    const o = { x: x0 - a * 0.2, y: y1 + a * 0.35 }, len = a * 0.8;
    const ax = { x: o.x + len, y: o.y }, at2 = { x: o.x, y: o.y - len };
    over.push(`<path d="M${pt(o)}L${pt(ax)}M${pt(o)}L${pt(at2)}" stroke="currentColor" stroke-width="${fmt(stroke * 0.8)}" fill="none"/>${arrowAt(o, ax, "currentColor", stroke * 0.8, 1)}${arrowAt(o, at2, "currentColor", stroke * 0.8, 1)}`);
    grow(o.x, o.y);
    label("x", ax, 1, 0, theme.fontSize * 0.85);
    label("t", at2, 0, -1, theme.fontSize * 0.85);
  }

  const pad = theme.padding;
  return svgDocument({ cls: "feynjs-lattice", label: `a lattice, ${nx} by ${nt} sites`, title: d.directives.title, model: options.model ? diagramModel(d, scene) : "", box: { left: x0 - pad, top: y0 - pad, width: x1 - x0 + 2 * pad, height: y1 - y0 + 2 * pad }, scale: theme.drawingScale, idPrefix: scene.idPrefix, theme,
    body: `${parts.join("")}<g fill="none">${over.join("")}</g>${labels.join("")}` });
}

const pt = (p: Pt) => `${fmt(p.x)} ${fmt(p.y)}`;

/** The grid's links and sites, beneath what is marked on it: the drawing's own colour, thinned,
 * so they stay quiet on dark pages as on light. */
const GRID = 0.16, SITE = 0.28;

/** A colour a little less vivid: a fifth of the way to a mid grey (a hex colour; any other as it is). */
function muted(colour: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(colour);
  if (!m) return colour;
  const n = parseInt(m[1], 16), mix = (c: number) => Math.round(c * 0.8 + 128 * 0.2).toString(16).padStart(2, "0");
  return `#${mix(n >> 16)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

/** `7x5` (sites across by up): 6 by 5 when not said. */
function latticeSize(text: string | undefined): [number, number] {
  if (!text) return [6, 5];
  const m = /^\s*(\d+)\s*[x×]\s*(\d+)\s*$/.exec(text);
  if (!m || Number(m[1]) < 2 || Number(m[2]) < 2 || Number(m[1]) > 40 || Number(m[2]) > 40) throw new FeynError(`write the lattice's size as sites across by up, such as "lattice: 7x5" (2 to 40 each way)`);
  return [Number(m[1]), Number(m[2])];
}

/** Each of the items a directive lists (one per line it was written on), with its `[options]`. */
function items(text: string | undefined): { text: string; opts: Record<string, string> }[] {
  if (!text) return [];
  return text.split("\n").filter((s) => s.trim()).map((s) => {
    const m = /^(.*?)\s*(?:\[(.*)\])?\s*$/.exec(s)!;
    const opts: Record<string, string> = {};
    for (const part of (m[2] ?? "").split(/,(?![^{]*\})/)) {
      const eq = part.indexOf("=");
      if (eq > 0) opts[part.slice(0, eq).trim()] = part.slice(eq + 1).trim().replace(/^\{(.*)\}$/, "$1");
    }
    return { text: m[1], opts };
  });
}

/** One site, `(x,t)`, inside a lattice of `nx` by `nt`. */
function oneSite(text: string, what: string, nx: number, nt: number): [number, number] {
  const m = /^\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/.exec(text);
  if (!m || Number(m[1]) >= nx || Number(m[2]) >= nt) throw new FeynError(`a ${what} is at a site (x,t) on the lattice, such as (2,1)`);
  return [Number(m[1]), Number(m[2])];
}

/** Two sites, `(x,t) to (x,t)`. */
function twoSites(text: string, what: string, nx: number, nt: number): [[number, number], [number, number]] {
  const [p, q] = text.split(/\s+to\s+/);
  if (!q) throw new FeynError(`write a ${what} as "(x,t) to (x,t)"`);
  return [oneSite(p, what, nx, nt), oneSite(q, what, nx, nt)];
}

/** A closed loop of links through `corners`, an arrow on every link along it, running anticlockwise. */
function loopPath(corners: Pt[], colour: string, width: number, _key: string, everyLink: boolean): string {
  const out = [`<path d="M${corners.map(pt).join("L")}Z" stroke="${colour}" stroke-width="${fmt(width)}" stroke-linejoin="round"/>`];
  for (let k = 0; k < corners.length; k++) {
    const from = corners[k], to = corners[(k + 1) % corners.length];
    if (everyLink) out.push(arrowAt(from, to, colour, width / 1.6));
    else out.push(arrowAt(from, to, colour, width / 1.4));
  }
  return out.join("");
}

/** An arrowhead half way (or at `at`, a fraction of the way) from `from` to `to`. */
function arrowAt(from: Pt, to: Pt, colour: string, stroke: number, along = 0.5): string {
  const len = portable.hypot(to.x - from.x, to.y - from.y) || 1, ux = (to.x - from.x) / len, uy = (to.y - from.y) / len;
  const size = stroke * 3.6, m = { x: from.x + (to.x - from.x) * along, y: from.y + (to.y - from.y) * along };
  const tip = along === 1 ? m : { x: m.x + ux * size * 0.5, y: m.y + uy * size * 0.5 };
  const back = { x: tip.x - ux * size, y: tip.y - uy * size };
  return `<path d="M${pt(tip)}L${fmt(back.x - uy * size * 0.45)} ${fmt(back.y + ux * size * 0.45)}L${fmt(back.x + uy * size * 0.45)} ${fmt(back.y - ux * size * 0.45)}Z" fill="${colour}" stroke="none"/>`;
}

/** A curly brace beside the segment `p`–`q`, `gap` toward `side`, its point a little further. */
function brace(p: Pt, q: Pt, side: Pt, gap: number, stroke: number): string {
  const len = portable.hypot(q.x - p.x, q.y - p.y), u = { x: (q.x - p.x) / len, y: (q.y - p.y) / len }, depth = 5;
  const at = (s: number, h: number) => `${fmt(p.x + u.x * s + side.x * (gap + h))} ${fmt(p.y + u.y * s + side.y * (gap + h))}`;
  const curl = Math.min(depth * 0.6, len / 4), mid = len / 2, half = depth / 2;
  return `<path d="M${at(0, 0)}Q${at(0, half)} ${at(curl, half)}L${at(mid - curl, half)}Q${at(mid, half)} ${at(mid, depth)}Q${at(mid, half)} ${at(mid + curl, half)}L${at(len - curl, half)}Q${at(len, half)} ${at(len, 0)}" stroke="currentColor" stroke-width="${fmt(stroke * 0.8)}" stroke-linecap="round"/>`;
}
