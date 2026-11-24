import { fmt } from "../geometry/curve.ts";
import type { Diagram, Edge } from "../model.ts";
import type { LineReason } from "../engines/forces/why.ts";
import type { Scene } from "./scene.ts";

/** What `debug: on` shows: the engine, what each step after the forces moved, and why each line lies where it does. */
export interface DebugInfo {
  engine: string;
  /** the steps after the forces, in order, each with the points it moved */
  steps: { step: string; moved: Map<string, number> }[];
  /** for each line, the forces without which it moves most (the force engines only) */
  why?: Map<Edge, LineReason[]>;
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const SANS = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";

/** A line's name in words: its particle, or its leg's, or its label without the TeX, or its style. */
function nameOf(d: Diagram, e: Edge): string {
  const leg = [e.from, e.to].map((id) => d.vertices.get(id)!).find((v) => v.particle || v.label);
  const plain = (tex: string) => tex.replace(/\\(tilde|bar|overline)\s*/g, "$1 ").replace(/\\([A-Za-z]+)/g, "$1").replace(/[{}$^_]/g, "").trim();
  return e.particle ?? (e.label ? plain(e.label) : undefined) ?? leg?.particle ?? (leg?.label ? plain(leg.label) : undefined) ?? e.style.line;
}

/**
 * `debug: on`: each point's name beside it, each line numbered at its middle, and under the
 * diagram, line by line, its length and direction and why it lies there: the rules without which
 * it would move most, then any step after the forces that moved it. In the drawing's own colour,
 * faint, so the diagram still reads first. Hovering a line's number shows its reasons too.
 */
export function drawDebug(scene: Scene, d: Diagram, info: DebugInfo): void {
  const t = scene.theme, small = t.fontSize * 0.42, line = t.unitX * t.forces.lineLength;
  const out: string[] = [];
  // (the marks in one accent blue, plain on light pages and dark: a line's number white on it)
  const accent = "#3b7be0";
  const lines = new Map<string, Edge[]>();
  for (const e of d.edges) for (const id of [e.from, e.to]) lines.set(id, [...(lines.get(id) ?? []), e]);
  // each point's name: an inner point's just above and right of it; a leg end's a little way in
  // along its leg, clear of the leg's own label
  for (const v of d.vertices.values()) {
    const at = lines.get(v.id);
    if (!at) continue;
    const p = scene.position(v);
    let x = p.x + 3, y = p.y - 3, anchor = "start";
    if (at.length === 1) {
      const o = scene.position(d.vertices.get(at[0].from === v.id ? at[0].to : at[0].from)!);
      const n = Math.hypot(o.x - p.x, o.y - p.y) || 1, ux = (o.x - p.x) / n, uy = (o.y - p.y) / n;
      // (in along the leg, then off it on the side away from the diagram's middle: the line's
      // number is on the side toward it)
      const side = (scene.core.x - p.x) * -uy + (scene.core.y - p.y) * ux > 0 ? -1 : 1;
      x = p.x + ux * small * 2.2 - uy * side * small * 1.1;
      y = p.y + uy * small * 2.2 + ux * side * small * 1.1 + small * 0.35;
      anchor = "middle";
    }
    out.push(`<text x="${fmt(x)}" y="${fmt(y)}" font-size="${fmt(small)}" fill="${accent}" text-anchor="${anchor}">${escape(v.id)}</text>`);
  }
  // each line's number beside its middle, on the side toward the diagram's middle (its label
  // faces away), with its reasons as a tooltip
  const rows: string[] = [];
  // (a step that moved most of the diagram, turning it over to follow the out: list, is said
  // once above the lines; one that moved a few points, with the lines it moved)
  const total = lines.size;
  const whole = (s: DebugInfo["steps"][number]) => s.moved.size > total / 2;
  d.edges.forEach((e) => {
    if (e.style.line === "none" && !e.style.guide) return;
    const n = rows.length + 1;
    const a = scene.position(d.vertices.get(e.from)!), b = scene.position(d.vertices.get(e.to)!);
    const curve = scene.edgeCurves.get(e);
    const mid = curve ? curve.at(curve.length / 2) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const length = Math.hypot(b.x - a.x, b.y - a.y) / line, angle = (Math.atan2(a.y - b.y, b.x - a.x) * 180) / Math.PI;
    const reasons = info.why?.get(e) ?? [];
    const later = info.steps.filter((s) => !whole(s) && (s.moved.has(e.from) || s.moved.has(e.to))).map((s) => s.step);
    const held = reasons.length ? `held by ${reasons.map((r) => `${r.reason} (${r.amount.toFixed(2)})`).join(", ")}` : info.why ? "no one rule moves it much: it sits where the others leave room" : "";
    const then = later.length ? `then ${later.join(", then ")}` : "";
    const why = [held, then].filter(Boolean).join("; ");
    const text = `${n}. ${e.from}–${e.to}, ${nameOf(d, e)}: ${length.toFixed(2)} lines at ${Math.round(angle)}°${why ? `; ${why}` : ""}.`;
    rows.push(text);
    const ln = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / ln, ny = (b.x - a.x) / ln;
    const side = (scene.core.x - mid.x) * nx + (scene.core.y - mid.y) * ny >= 0 ? 1 : -1;
    const off = small * 1.05 + (e.style.line === "wave" || e.style.line === "coil" ? t.line.waveAmplitude : 0);
    const c = { x: mid.x + nx * side * off, y: mid.y + ny * side * off }, r = small * 0.62;
    out.push(`<g class="feynjs-debug-line" data-edge="${escape(scene.edgeIds.get(e) ?? `${e.from}--${e.to}`)}" data-why="${escape(text)}"><title>${escape(text)}</title>`
      + `<circle cx="${fmt(c.x)}" cy="${fmt(c.y)}" r="${fmt(r)}" fill="${accent}"/>`
      + `<text x="${fmt(c.x)}" y="${fmt(c.y + small * 0.27)}" font-size="${fmt(small * 0.78)}" font-weight="600" text-anchor="middle" fill="#fff">${n}</text></g>`);
  });
  // the key under the diagram, wrapped to its width (or a readable width, if it is narrow)
  const left = scene.bounds.left, width = Math.max(scene.bounds.right - scene.bounds.left, 360);
  const perLine = Math.max(40, Math.floor(width / (small * 0.52)));
  const wrap = (text: string): string[] => {
    const words = text.split(" "), lines: string[] = [];
    let now = "";
    for (const w of words) { if (now && (now + " " + w).length > perLine) { lines.push(now); now = "   " + w; } else now = now ? `${now} ${w}` : w; }
    if (now) lines.push(now);
    return lines;
  };
  const head = info.why
    ? `Why each line lies where it does (${info.engine} engine). In brackets: how far the line moves, in line lengths, without that rule.`
    : `Lines and their places (${info.engine} engine: its rules are not measured; the default engine says why each line lies where it does).`;
  const steps = info.steps.length ? `After the forces: ${info.steps.map((s) => `${s.step} (${whole(s) ? "most of the diagram" : [...s.moved.keys()].join(", ")})`).join("; ")}.` : "";
  const key = [...wrap(head), ...(steps ? wrap(steps) : []), ...rows.flatMap(wrap)];
  const gap = small * 1.45;
  let y = scene.bounds.bottom + t.fontSize * 1.1;
  const keyRows = key.map((text, k) => { const row = `<text x="${fmt(left)}" y="${fmt(y)}" font-size="${fmt(small)}"${k === 0 ? ` font-weight="600"` : ""} xml:space="preserve">${escape(text)}</text>`; y += gap; return row; });
  scene.labels.push(`<g class="feynjs-debug" fill="currentColor" fill-opacity="0.72" stroke-opacity="0.55" font-family="${SANS}">${out.join("")}<g class="feynjs-debug-key">${keyRows.join("")}</g></g>`);
  scene.bounds.include(left, y, 2);
  scene.bounds.include(left + Math.min(width, Math.max(...key.map((r) => r.length)) * small * 0.52), y, 2);
}
