import { fmt } from "../geometry/curve.ts";
import type { Diagram } from "../model.ts";
import { particleOfEdge } from "../particles/identify.ts";
import type { Theme } from "../theme.ts";
import type { Scene } from "./scene.ts";

export const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Height of the math axis above the baseline, in em (TeX's \\fontdimen22 of Computer Modern). */
export const MATH_AXIS_EM = 0.25;

/**
 * The frame round a drawing: the one `<svg>` element every drawing of feynjs is written into,
 * a diagram, a reaction, a decay chain, a lattice or an event, so each carries the same things
 * for a reader and a program: its accessible name (`aria-label`, the drawing in a phrase), its
 * description (`<desc>`, which `aria-describedby` points at, read on request), its `title:`,
 * and the diagram as data when asked for.
 */
export interface SvgFrame {
  /** the drawing's own class after `feynjs` (`feynjs-reaction`) */
  cls?: string;
  /** `img` (the default) for one drawing, `group` for panels side by side */
  role?: "img" | "group";
  /** the accessible name */
  label?: string;
  title?: string;
  /** the details, for a screen reader to read on request */
  description?: string;
  /** the diagram as data, JSON */
  model?: string;
  /** the box drawn, in px, padding included */
  box: { left: number; top: number; width: number; height: number };
  /** how large the drawing is on the page: a multiple of its px */
  scale: number;
  /** in a line of text instead: sized in em per px, and lowered so a point of it sits on the math axis */
  inline?: { em: number; align: number };
  /** the drawing's id prefix: its description's id is made from it */
  idPrefix: string;
  theme: Theme;
  /** everything inside the frame */
  body: string;
}

/** The drawing as an SVG document. */
export function svgDocument(f: SvgFrame): string {
  const { box: b, inline } = f;
  const descId = f.description ? `${f.idPrefix}-desc` : "";
  const width = inline ? `${fmt(b.width * inline.em)}em` : fmt(b.width * f.scale);
  const height = inline ? `${fmt(b.height * inline.em)}em` : fmt(b.height * f.scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="feynjs${f.cls ? ` ${f.cls}` : ""}" role="${f.role ?? "img"}"`
    + (f.label !== undefined ? ` aria-label="${escapeText(f.label)}"` : "") + (descId ? ` aria-describedby="${descId}"` : "")
    + ` viewBox="${fmt(b.left)} ${fmt(b.top)} ${fmt(b.width)} ${fmt(b.height)}" width="${width}" height="${height}" font-family="${f.theme.fontFamily}"${inline ? ` style="vertical-align: ${fmt(inline.align)}em"` : ""}>`
    + (f.title ? `<title>${escapeText(f.title)}</title>` : "") + (f.description ? `<desc id="${descId}">${escapeText(f.description)}</desc>` : "") + (f.model ? `<metadata class="feynjs-model">${escapeText(f.model)}</metadata>` : "")
    + f.body + `</svg>`;
}

/**
 * The diagram as data, written into the SVG (`<metadata class="feynjs-model">`): every point by
 * its name, where it is drawn and where `at (x, y)` would put it (a view that places nothing by
 * the layout leaves those out), and every line by its name, ends and particle. The names are the
 * ones the drawing's groups carry (`data-vertex`, `data-edge`), so a program, or a model reading
 * the SVG, can refer to any part and change the source by name.
 */
export function diagramModel(d: Diagram, scene: Scene): string {
  const { unitX, unitY } = scene.theme;
  const round = (n: number) => Math.round(n * 100) / 100;
  const vertices = [...d.vertices.values()].map((v) => {
    const p = scene.position(v), placed = Number.isFinite(p.x) && Number.isFinite(p.y);
    return { id: v.id, ...(v.role ? { role: v.role } : {}), ...(placed ? { x: round(p.x), y: round(p.y), at: [round(p.x / unitX), round(-p.y / unitY) || 0] } : {}),
      ...(v.label ? { label: v.label } : {}), ...(v.particle ? { particle: v.particle } : {}), ...(v.shape && v.shape !== "none" ? { shape: v.shape } : {}) };
  });
  const edges = d.edges.map((e) => {
    const particle = particleOfEdge(d, e);
    return { id: scene.edgeIds.get(e), from: e.from, to: e.to, ...(particle ? { particle } : {}), line: e.style.line, ...(e.style.object ? { object: e.style.object } : {}), ...(e.label ? { label: e.label } : {}) };
  });
  return JSON.stringify({ feynjs: 1, unit: { x: unitX, y: unitY }, vertices, edges });
}
