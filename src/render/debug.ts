import { fmt } from "../geometry/curve.ts";
import type { Diagram, Edge } from "../model.ts";
import type { LineReason } from "../engines/forces/why.ts";
import { FAMILIES } from "../engines/forces/families.ts";
import type { Family } from "../engines/forces/families.ts";
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
 * `debug: on`: each point's name beside it, and on each line the family of rules that shapes it
 * (a letter on a disc of the family's colour: D for decays, M for mass...), so a diagram shows a
 * handful of reasons, not one per line. The family is the strongest of those that do not act on
 * every line; spacing or time only where nothing else holds the line. Under the diagram, each
 * family once, with what it does and the lines it marks, then the steps after the forces.
 * Hovering a mark shows that line's length, direction and every family that holds it, measured.
 */
export function drawDebug(scene: Scene, d: Diagram, info: DebugInfo): void {
  const t = scene.theme, small = t.fontSize * 0.42, line = t.unitX * t.forces.lineLength;
  const out: string[] = [];
  // (the point names in one accent blue, plain on light pages and dark)
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
      // mark is on the side toward it)
      const side = (scene.core.x - p.x) * -uy + (scene.core.y - p.y) * ux > 0 ? -1 : 1;
      x = p.x + ux * small * 2.2 - uy * side * small * 1.1;
      y = p.y + uy * small * 2.2 + ux * side * small * 1.1 + small * 0.35;
      anchor = "middle";
    }
    out.push(`<text x="${fmt(x)}" y="${fmt(y)}" font-size="${fmt(small)}" fill="${accent}" text-anchor="${anchor}">${escape(v.id)}</text>`);
  }
  // (a step that moved most of the diagram, turning it over to follow the out: list, is said
  // once under the diagram; one that moved a few points, with the lines it moved)
  const total = lines.size;
  const whole = (s: DebugInfo["steps"][number]) => s.moved.size > total / 2;
  const disc = (x: number, y: number, family: Family | undefined, r: number) =>
    `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(r)}" fill="${family?.colour ?? "#9aa1ad"}"/>`
    + `<text x="${fmt(x)}" y="${fmt(y + r * 0.42)}" font-size="${fmt(r * 1.25)}" font-weight="700" text-anchor="middle" fill="#fff" fill-opacity="1">${family?.letter ?? "·"}</text>`;
  // each line's mark beside its middle, on the side toward the diagram's middle (its label faces
  // away), with everything known about it as a tooltip
  const marked = new Map<Family | undefined, string[]>();
  d.edges.forEach((e) => {
    if (e.style.line === "none" && !e.style.guide) return;
    const a = scene.position(d.vertices.get(e.from)!), b = scene.position(d.vertices.get(e.to)!);
    const curve = scene.edgeCurves.get(e);
    const mid = curve ? curve.at(curve.length / 2) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const length = Math.hypot(b.x - a.x, b.y - a.y) / line, angle = (Math.atan2(a.y - b.y, b.x - a.x) * 180) / Math.PI;
    const reasons = info.why?.get(e) ?? [];
    // (the strongest family that does not act on every line, where it moves the line at all;
    // else the strongest of all)
    // (near ties, within 0.03, go to the family first in order: mirror-image lines are marked alike)
    const familyOf = (r: LineReason) => FAMILIES.find((f) => f.name === r.family)!;
    const strongest = (list: LineReason[]) => list.length ? list.filter((r) => r.amount >= list[0].amount - 0.03).sort((x, y) => FAMILIES.indexOf(familyOf(x)) - FAMILIES.indexOf(familyOf(y)))[0] : undefined;
    const pick = strongest(reasons.filter((r) => !familyOf(r).everywhere && r.amount >= 0.1)) ?? strongest(reasons);
    const family = pick && FAMILIES.find((f) => f.name === pick.family);
    if (info.why) marked.set(family, [...(marked.get(family) ?? []), `${e.from}–${e.to}`]);
    const later = info.steps.filter((s) => !whole(s) && (s.moved.has(e.from) || s.moved.has(e.to))).map((s) => s.step);
    const held = reasons.length ? `held by ${reasons.map((r) => `${r.family} (${r.amount.toFixed(2)})`).join(", ")}` : info.why ? "no one family moves it much: it sits where the others leave room" : "";
    const then = later.length ? `then ${later.join(", then ")}` : "";
    const why = [held, then].filter(Boolean).join("; ");
    const text = `${e.from}–${e.to}, ${nameOf(d, e)}: ${length.toFixed(2)} lines at ${Math.round(angle)}°${why ? `; ${why}` : ""}.`;
    if (!info.why) return;
    const ln = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / ln, ny = (b.x - a.x) / ln;
    const side = (scene.core.x - mid.x) * nx + (scene.core.y - mid.y) * ny >= 0 ? 1 : -1;
    const off = small * 1.05 + (e.style.line === "wave" || e.style.line === "coil" ? t.line.waveAmplitude : 0);
    out.push(`<g class="feynjs-debug-line" data-edge="${escape(scene.edgeIds.get(e) ?? `${e.from}--${e.to}`)}" data-family="${family?.name ?? ""}" data-why="${escape(text)}"><title>${escape(text)}</title>`
      + disc(mid.x + nx * side * off, mid.y + ny * side * off, family, small * 0.62) + `</g>`);
  });
  // the key under the diagram, wrapped to its width (or a readable width, if it is narrow): each
  // family that marks a line, once
  const left = scene.bounds.left, width = Math.max(scene.bounds.right - scene.bounds.left, 360);
  const perLine = Math.max(40, Math.floor(width / (small * 0.52)));
  const wrap = (text: string, indent = "   "): string[] => {
    const words = text.split(" "), rows: string[] = [];
    let now = "";
    for (const w of words) { if (now && (now + " " + w).length > perLine) { rows.push(now); now = indent + w; } else now = now ? `${now} ${w}` : w; }
    if (now) rows.push(now);
    return rows;
  };
  const head = info.why
    ? `What shapes each line (${info.engine} engine): the family of rules that holds it most, measured by settling the diagram again without it. Hover a mark for every family that holds its line.`
    : `The ${info.engine} engine's rules are not measured: the default engine marks each line with the family of rules that shapes it.`;
  const steps = info.steps.length ? `After the forces: ${info.steps.map((s) => `${s.step} (${whole(s) ? "most of the diagram" : [...s.moved.keys()].join(", ")})`).join("; ")}.` : "";
  const gap = small * 1.45, indent = small * 1.9;
  let y = scene.bounds.bottom + t.fontSize * 1.1;
  const rows: string[] = [];
  const text = (s: string, x: number, bold = false) => `<text x="${fmt(x)}" y="${fmt(y)}" font-size="${fmt(small)}"${bold ? ` font-weight="600"` : ""} xml:space="preserve">${escape(s)}</text>`;
  let widest = 0;
  const write = (s: string, x = left, bold = false) => { rows.push(text(s, x, bold)); widest = Math.max(widest, x - left + s.length * small * 0.52); y += gap; };
  wrap(head).forEach((r, k) => write(r, left, k === 0));
  // (in the families' own order, those that do not act everywhere first)
  const order = [...marked.keys()].sort((a, b) => (a?.everywhere ? 1 : 0) - (b?.everywhere ? 1 : 0) || FAMILIES.indexOf(a!) - FAMILIES.indexOf(b!));
  for (const family of order) {
    const named = marked.get(family)!;
    const words = family ? `${family.name}: ${family.about}. Lines ${named.join(", ")}.` : `nothing in particular: where the others leave room. Lines ${named.join(", ")}.`;
    rows.push(disc(left + small * 0.62, y - small * 0.35, family, small * 0.62));
    wrap(words, "").forEach((r) => write(r, left + indent));
  }
  if (steps) wrap(steps).forEach((r) => write(r));
  scene.labels.push(`<g class="feynjs-debug" fill="currentColor" fill-opacity="0.72" font-family="${SANS}">${out.join("")}<g class="feynjs-debug-key">${rows.join("")}</g></g>`);
  scene.bounds.include(left, y, 2);
  scene.bounds.include(left + Math.min(width, widest), y, 2);
}
