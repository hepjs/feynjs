import { layoutLabel } from "../label/label.ts";
import { fmt } from "../geometry/curve.ts";
import type { Diagram, HadronGroup } from "../model.ts";
import type { Scene } from "./scene.ts";
import * as portable from "../geometry/portable-math.ts";

/** A curly brace from (x, top) to (x, bottom) whose point reaches `depth` px sideways (negative = leftwards). */
function bracePath(x: number, top: number, bottom: number, depth: number): string {
  const middle = (top + bottom) / 2, spine = x + depth / 2, tip = x + depth;
  const curl = Math.min(Math.abs(depth) * 0.6, (bottom - top) / 4);
  return `M${fmt(x)} ${fmt(top)}Q${fmt(spine)} ${fmt(top)} ${fmt(spine)} ${fmt(top + curl)}`
    + `L${fmt(spine)} ${fmt(middle - curl)}Q${fmt(spine)} ${fmt(middle)} ${fmt(tip)} ${fmt(middle)}`
    + `Q${fmt(spine)} ${fmt(middle)} ${fmt(spine)} ${fmt(middle + curl)}`
    + `L${fmt(spine)} ${fmt(bottom - curl)}Q${fmt(spine)} ${fmt(bottom)} ${fmt(x)} ${fmt(bottom)}`;
}

/** Brace the legs of one hadron together and name it: on the left for incoming legs, the right for outgoing. */
function drawHadronBrace(scene: Scene, d: Diagram, group: HadronGroup): void {
  const legs = group.legs.map((id) => d.vertices.get(id)).filter((v) => v !== undefined);
  if (legs.length === 0) return;
  const points = legs.map((v) => scene.position(v));
  const outward = legs[0].role === "out" ? 1 : -1;
  // clear of the quark labels at the ends of the legs
  const labelAllowance = scene.theme.fontSize * 1.5;
  const x = (outward > 0 ? Math.max(...points.map((p) => p.x)) : Math.min(...points.map((p) => p.x))) + outward * labelAllowance;
  const top = Math.min(...points.map((p) => p.y)) - scene.theme.fontSize * 0.5;
  const bottom = Math.max(...points.map((p) => p.y)) + scene.theme.fontSize * 0.5;
  const depth = outward * scene.theme.hadronBraceDepth;
  scene.edges.push(`<path class="feynjs-brace" d="${bracePath(x, top, bottom, depth)}" fill="none" stroke="${scene.theme.hadronBraceColor}" stroke-width="${fmt(scene.theme.line.stroke * 0.8)}" stroke-linecap="round"/>`);
  scene.shapes.push({ kind: "brace", x, top, bottom, depth, color: scene.theme.hadronBraceColor, width: scene.theme.line.stroke * 0.8 });
  scene.bounds.include(x + depth, top);
  scene.bounds.include(x + depth, bottom);
  if (group.label) scene.addLabel(group.label, { x: x + depth, y: (top + bottom) / 2 }, { x: outward, y: 0 }, scene.theme.labelGap);
}

/** A shaded ellipse over the ends of a hadron's legs, with the hadron's name inside. */
function drawHadronEllipse(scene: Scene, d: Diagram, group: HadronGroup): void {
  const legs = group.legs.map((id) => d.vertices.get(id)).filter((v) => v !== undefined);
  if (legs.length === 0) return;
  const points = legs.map((v) => scene.position(v));
  const outward = legs[0].role === "out" ? 1 : -1;
  const top = Math.min(...points.map((p) => p.y)), bottom = Math.max(...points.map((p) => p.y));
  // every hadron ellipse in a diagram is drawn the same size: that of the widest
  // (among the hadrons on the same side: incoming ones are not sized to outgoing ones)
  const sameSide = (h: HadronGroup) => d.vertices.get(h.legs[0])?.role === legs[0].role;
  const widest = Math.max(...d.hadrons.filter((h) => h.shape === "ellipse" && sameSide(h)).map((h) => {
    const ys = h.legs.map((id) => d.vertices.get(id)).filter((v) => v !== undefined).map((v) => scene.position(v).y);
    return ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
  }));
  // (with no name to hold, it is a circle just over the legs' ends)
  // (and wide enough for the longest name among them, its name inside with a little room: a
  // D_s^(*)+ does not spill out of an ellipse sized for its two quarks)
  const name = longestName(scene, d, group);
  let radiusY = group.label
    ? Math.max(Math.max(bottom - top, widest) / 2 + scene.theme.fontSize * 0.55, scene.theme.fontSize * 1.1)
    : Math.max((bottom - top) / 2 + scene.theme.fontSize * 0.1, scene.theme.fontSize * 0.6);
  let radiusX = group.label ? Math.max(radiusY * scene.theme.hadronEllipseAspect, scene.theme.fontSize * 1.2) : radiusY;
  if (group.label && name) {
    // (a box of half-width w and half-height h fits an ellipse of radii w*sqrt2, h*sqrt2)
    radiusX = Math.max(radiusX, (name.width / 2) * Math.SQRT2 + scene.theme.fontSize * 0.15);
    radiusY = Math.max(radiusY, (name.height / 2) * Math.SQRT2 + scene.theme.fontSize * 0.1);
  }
  const edgeX = outward > 0 ? Math.min(...points.map((p) => p.x)) : Math.max(...points.map((p) => p.x));
  // the legs just reach into the ellipse
  const cx = edgeX + outward * radiusX * (group.label ? 0.8 : 0.35), cy = (top + bottom) / 2;
  if (group.hatched) scene.usesHatching = true;
  const fill = group.hatched ? `url(#${scene.idPrefix}-hatch)` : scene.theme.vertex.blobFill;
  const background = group.hatched ? `<ellipse class="feynjs-bg" cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(radiusX)}" ry="${fmt(radiusY)}" fill="#fff"/>` : "";
  scene.vertices.push(`${background}<ellipse class="feynjs-blob" cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(radiusX)}" ry="${fmt(radiusY)}" fill="${fill}" stroke="currentColor" stroke-width="${fmt(scene.theme.line.stroke * 0.8)}"/>`);
  scene.shapes.push({ kind: "ellipse", cx, cy, rx: radiusX, ry: radiusY, angle: 0, fill: scene.theme.vertex.blobFill, hatched: !!group.hatched, width: scene.theme.line.stroke * 0.8 });
  scene.bounds.include(cx - radiusX, cy - radiusY, 2);
  scene.bounds.include(cx + radiusX, cy + radiusY, 2);
  ellipseObstacle(scene, cx, cy, radiusX, radiusY);
  if (group.label) scene.addLabel(group.label, { x: cx, y: cy }, { x: 0, y: 0 }, 0, undefined, 1, "feynjs-blob-label", "hadron");
}

/** The widest name among the ellipse hadrons on `group`'s side, measured as drawn. */
function longestName(scene: Scene, d: Diagram, group: HadronGroup): { width: number; height: number } | undefined {
  const side = d.vertices.get(group.legs[0])?.role;
  const names = d.hadrons.filter((h) => h.shape === "ellipse" && h.label && d.vertices.get(h.legs[0])?.role === side).map((h) => layoutLabel(h.label, scene.theme.fontSize, scene.theme.wordLabelScale));
  if (!names.length) return undefined;
  const widest = names.reduce((a, b) => (b.width > a.width ? b : a));
  return { width: widest.width, height: widest.ascent + widest.descent };
}

/**
 * A thin shaded cap across the ends of a hadron's legs, at right angles to the way they run,
 * with the hadron's name beyond it: a meson made at the end of two quark lines.
 */
function drawHadronCap(scene: Scene, d: Diagram, group: HadronGroup): void {
  const legs = group.legs.map((id) => d.vertices.get(id)).filter((v) => v !== undefined);
  if (legs.length === 0) return;
  const ends = legs.map((v) => scene.position(v));
  // the way the legs run, from where each starts to its end
  let ux = 0, uy = 0;
  for (const v of legs) {
    const e = d.edges.find((x) => x.from === v.id || x.to === v.id);
    if (!e) continue;
    const from = scene.position(d.vertices.get(e.from === v.id ? e.to : e.from)!), to = scene.position(v);
    const n = portable.hypot(to.x - from.x, to.y - from.y) || 1;
    ux += (to.x - from.x) / n; uy += (to.y - from.y) / n;
  }
  const un = portable.hypot(ux, uy) || 1;
  ux /= un; uy /= un;
  const mx = ends.reduce((s, p) => s + p.x, 0) / ends.length, my = ends.reduce((s, p) => s + p.y, 0) / ends.length;
  // across the legs: as wide as their spread, and a little more
  const spread = Math.max(...ends.map((p) => Math.abs((p.x - mx) * -uy + (p.y - my) * ux)));
  const rx = spread + scene.theme.fontSize * 0.7, ry = scene.theme.fontSize * 0.6;
  const cx = mx + ux * ry * 0.6, cy = my + uy * ry * 0.6;
  const angle = (portable.atan2(uy, ux) * 180) / Math.PI + 90;
  // (an opaque backing first: a page may draw the cap's fill see-through, and the quark lines it
  // covers must not show through it)
  const shape = `cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" transform="rotate(${fmt(angle)} ${fmt(cx)} ${fmt(cy)})"`;
  scene.vertices.push(`<ellipse class="feynjs-bg" ${shape} fill="#fff"/><ellipse class="feynjs-blob" ${shape} fill="${scene.theme.vertex.smallBlobFill}" stroke="currentColor" stroke-width="${fmt(scene.theme.line.stroke * 0.8)}"/>`);
  scene.shapes.push({ kind: "ellipse", cx, cy, rx, ry, angle, fill: scene.theme.vertex.smallBlobFill, hatched: false, width: scene.theme.line.stroke * 0.8 });
  ellipseObstacle(scene, cx, cy, rx, ry, angle);
  scene.bounds.include(cx - rx, cy - rx, 2);
  scene.bounds.include(cx + rx, cy + rx, 2);
  if (group.label) scene.addLabel(group.label, { x: cx + ux * ry, y: cy + uy * ry }, { x: ux, y: uy }, scene.theme.labelGap + scene.theme.line.stroke * 2, undefined, 1, undefined, "hadron");
}

/**
 * A hadron's ellipse kept clear of labels: covered by a row of circles along its long axis, each
 * as wide as the ellipse is across.
 */
function ellipseObstacle(scene: Scene, cx: number, cy: number, rx: number, ry: number, angle = 0): void {
  const [long, short] = rx >= ry ? [rx, ry] : [ry, rx];
  const t = (angle * Math.PI) / 180, along = rx >= ry ? { x: portable.cos(t), y: portable.sin(t) } : { x: -portable.sin(t), y: portable.cos(t) };
  const n = Math.max(1, Math.ceil((long - short) / (short * 0.6)));
  for (let k = 0; k <= n; k++) {
    const off = -(long - short) + (2 * (long - short) * k) / n;
    scene.addObstaclePoint({ x: cx + along.x * off, y: cy + along.y * off }, short, "hadron");
  }
}

/** Draw one hadron group: a shaded ellipse, a cap or a brace, as the group asks. */
export function drawHadronGroup(scene: Scene, d: Diagram, group: HadronGroup): void {
  if (group.shape === "ellipse") drawHadronEllipse(scene, d, group);
  else if (group.shape === "cap") drawHadronCap(scene, d, group);
  else drawHadronBrace(scene, d, group);
}
