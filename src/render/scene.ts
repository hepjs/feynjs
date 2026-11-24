import type { Curve, Pt } from "../geometry/curve.ts";
import { fmt } from "../geometry/curve.ts";
import { layoutLabel } from "../label/label.ts";
import { PROPERTIES, particleInfo } from "../particles/properties.ts";
import type { Diagram, Edge, Vertex } from "../model.ts";
import type { Theme } from "../theme.ts";

export class BoundingBox {
  left = Infinity; top = Infinity; right = -Infinity; bottom = -Infinity;
  include(x: number, y: number, margin = 0): void {
    this.left = Math.min(this.left, x - margin); this.top = Math.min(this.top, y - margin);
    this.right = Math.max(this.right, x + margin); this.bottom = Math.max(this.bottom, y + margin);
  }
}

/** One place a label could go: its box sits beside `anchor`, extending in `direction`. */
export interface LabelSpot { anchor: Pt; direction: Pt }

interface LabelRequest {
  /** the step in time the label belongs to, when levels are tagged */
  level?: number;
  tex: string;
  /** places to try, best first */
  spots: LabelSpot[];
  clearance: number;
  color?: string;
  scale: number;
  /** a class for the label, so a stylesheet can colour it (the name inside a hadron's ellipse) */
  cls?: string;
  /** the particle the label names: its properties show when the pointer rests on it */
  particle?: string;
  /** obstacles of this kind the label may lie over (a hadron's name, on its own ellipse) */
  ignore?: string;
}

export interface Rectangle { left: number; top: number; right: number; bottom: number }

const escapeXml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Everything drawn so far, the space it takes up, and what later steps need to know. */
export class Scene {
  edges: string[] = [];
  /** each line's name in the drawing, `a--b` (`a--b#2` for a second line between the same points) */
  edgeIds = new Map<Edge, string>();
  vertices: string[] = [];
  labels: string[] = [];
  /** hadron shapes as drawn (braces, ellipses, caps), in px, for exports that redraw them (toTikz) */
  shapes: (
    | { kind: "brace"; x: number; top: number; bottom: number; depth: number; color: string; width: number }
    | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; angle: number; fill: string; hatched: boolean; width: number }
  )[] = [];
  /** every label as placed: what it says (TeX), its size and where its baseline starts, px (for toTikz) */
  placedLabels: { tex: string; size: number; x: number; baseline: number; color?: string }[] = [];
  bounds = new BoundingBox();
  usesHatching = false;
  /** direction (radians) of every line leaving each vertex */
  lineAngles = new Map<string, number[]>();
  /** direction an external leg points, away from the diagram */
  legDirection = new Map<string, Pt>();
  /** the path each line follows, vertex to vertex, for whatever is drawn along it later */
  edgeCurves = new Map<Edge, Curve>();
  /** legs whose ends are covered by a hadron ellipse: their labels go beside the line instead */
  legsInsideHadrons = new Set<string>();
  /** middle of the diagram, px */
  centre: Pt;
  /** middle of its interaction points (legs left out), px: line labels face away from it */
  core: Pt;
  /** for a line on a closed loop (a triangle, a box), the middle of that loop: its label goes outside */
  loopMiddle = new Map<object, Pt>();
  /** the step in time of what is being drawn now, tagged onto labels when levels are on */
  level?: number;
  /** progressive reveal: steps after this one are drawn faint and grey */
  reveal?: number;
  /** colour lines and labels by electric charge (`charge colour: on`) */
  chargeColour = false;
  /** where the jets' cone symbols stand: one column right of every leg that ends in one */
  conePlane?: number;
  /** each cone's height in that column, spaced so no two touch */
  coneY = new Map<string, number>();
  /** `colour flow: only`: the colour lines stand in for the quark and gluon lines */
  colourOnly = false;
  /** labels that name a particle carry its properties, for hovering */
  tooltips = false;

  /** With charge colouring on, the colour for a particle's charge: none for a neutral or unknown one. */
  colourForCharge(particle: string | undefined): string | undefined {
    if (!this.chargeColour || !particle) return undefined;
    const charge = PROPERTIES[particle]?.charge;
    if (!charge || charge === "0") return undefined;
    const { positive, negative, either } = this.theme.chargeColors;
    return charge.startsWith("±") ? either : charge.startsWith("-") ? negative : positive;
  }
  theme: Theme;
  idPrefix: string;

  constructor(d: Diagram, theme: Theme, idPrefix: string) {
    this.theme = theme;
    this.idPrefix = idPrefix;
    for (const group of d.hadrons) if (group.shape !== "brace") group.legs.forEach((id) => this.legsInsideHadrons.add(id));
    const all = [...d.vertices.values()].map((v) => this.position(v));
    this.centre = { x: all.reduce((s, p) => s + p.x, 0) / all.length, y: all.reduce((s, p) => s + p.y, 0) / all.length };
    // (the same middle layout v2 keeps label room against, so the two agree on a label's side)
    const degree = new Map<string, number>();
    for (const e of d.edges) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);
    const inner = [...d.vertices.values()].filter((v) => (degree.get(v.id) ?? 0) > 1).map((v) => this.position(v));
    const pts = inner.length ? inner : all;
    this.core = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
  }

  /** Layout coordinates (ranks, rows) to px. */
  position(v: Vertex): Pt {
    return { x: v.x * this.theme.unitX, y: v.y * this.theme.unitY };
  }

  /** A colour name from the theme, or any CSS colour passed through. */
  resolveColor(name?: string): string | undefined {
    return name ? this.theme.colors[name] ?? name : undefined;
  }

  recordLineAngle(vertexId: string, angle: number): void {
    if (!this.lineAngles.has(vertexId)) this.lineAngles.set(vertexId, []);
    this.lineAngles.get(vertexId)!.push(angle);
  }

  /** Something labels must keep clear of: a disc of ink at a point. */
  private obstacles: { x: number; y: number; radius: number; kind?: string }[] = [];
  private labelBoxes: Rectangle[] = [];
  private fixedLabels: LabelRequest[] = [];
  /** labels that could not be placed clear of every line and every other label */
  crowdedLabels: string[] = [];
  private legLabels: LabelRequest[] = [];
  private movableLabels: LabelRequest[] = [];

  /** Record a drawn line as an obstacle for labels. */
  addObstacleCurve(curve: Curve, radius: number): void {
    const step = 4;
    for (let s = 0; s <= curve.length; s += step) {
      const p = curve.at(s);
      this.obstacles.push({ x: p.x, y: p.y, radius });
    }
  }

  addObstaclePoint(p: Pt, radius: number, kind?: string): void {
    this.obstacles.push({ x: p.x, y: p.y, radius, kind });
  }

  /**
   * Ask for a label. It is drawn by `placeLabels`, once every line is known, at the first
   * of its spots that is clear of lines and other labels. A label with one spot is fixed.
   */
  requestLabel(tex: string, spots: LabelSpot[], clearance: number, color?: string, scale = 1, placeEarly = false, cls?: string, particle?: string): void {
    const queue = spots.length === 1 ? this.fixedLabels : placeEarly ? this.legLabels : this.movableLabels;
    queue.push({ tex, spots, clearance, color, scale, level: this.level, cls, particle });
  }

  /** Where a label's box lands for one spot, and its baseline origin. */
  private boxAt(spot: LabelSpot, clearance: number, width: number, ascent: number, descent: number) {
    const height = ascent + descent;
    const reach = Math.abs(spot.direction.x) * width / 2 + Math.abs(spot.direction.y) * height / 2;
    const cx = spot.anchor.x + spot.direction.x * (clearance + reach);
    const cy = spot.anchor.y + spot.direction.y * (clearance + reach);
    const box: Rectangle = { left: cx - width / 2, top: cy - height / 2, right: cx + width / 2, bottom: cy + height / 2 };
    return { box, x: box.left, baseline: cy + (ascent - descent) / 2 };
  }

  /** How badly a label box collides with what is already there: 0 is clear. */
  private crowding(box: Rectangle, ignore?: string): number {
    let cost = 0;
    const margin = this.theme.labelMargin;
    for (const o of this.obstacles) {
      if (ignore && o.kind === ignore) continue;
      const reach = o.radius + margin;
      if (o.x > box.left - reach && o.x < box.right + reach && o.y > box.top - reach && o.y < box.bottom + reach) cost += 1;
    }
    for (const other of this.labelBoxes) {
      // (two labels keep a margin between them too: touching reads as one)
      const overlapsOther = box.left < other.right + margin && box.right > other.left - margin && box.top < other.bottom + margin && box.bottom > other.top - margin;
      if (overlapsOther) cost += 40;
    }
    return cost;
  }

  /** Draw every requested label: fixed ones first, then movable ones wherever is clearest. */
  placeLabels(): void {
    for (const request of [...this.fixedLabels, ...this.legLabels, ...this.movableLabels]) {
      const label = layoutLabel(request.tex, this.theme.fontSize * request.scale, this.theme.wordLabelScale);
      let best = this.boxAt(request.spots[0], request.clearance, label.width, label.ascent, label.descent);
      let bestCost = this.crowding(best.box, request.ignore);
      // try every spot at the normal distance from its line, then again a little further out
      // (then further out again: a wide label can slide along a narrow gap)
      const distances = [request.clearance, request.clearance + this.theme.labelMargin * 2, request.clearance + this.theme.labelMargin * 5];
      for (let attempt = 0; attempt < request.spots.length * distances.length && bestCost > 0; attempt++) {
        if (attempt === 0) continue;
        const spot = request.spots[attempt % request.spots.length];
        const distance = distances[Math.floor(attempt / request.spots.length)];
        const candidate = this.boxAt(spot, distance, label.width, label.ascent, label.descent);
        const cost = this.crowding(candidate.box, request.ignore) + attempt * 0.01;
        if (cost < bestCost) { best = candidate; bestCost = cost; }
      }
      // (still crowded: look all round each spot's own point on its line, a little further out,
      // the line's own side first; then the label a little smaller, close in. It never strays far:
      // a label beside the wrong line reads worse than one a little tight by its own)
      let size = label;
      if (bestCost >= 1) {
        const ring = (look: typeof label, reaches: number[], extra: number) => {
          for (const spot of request.spots.slice(0, 4)) for (const reach of reaches) for (let k = 0; k < 16; k++) {
            const angle = (k * Math.PI) / 8, direction = { x: Math.cos(angle), y: Math.sin(angle) };
            const turn = Math.acos(Math.max(-1, Math.min(1, direction.x * spot.direction.x + direction.y * spot.direction.y)));
            const candidate = this.boxAt({ anchor: spot.anchor, direction }, request.clearance * reach, look.width, look.ascent, look.descent);
            const cost = this.crowding(candidate.box, request.ignore) + 0.05 * turn + 0.02 * reach + extra;
            if (cost < bestCost) { best = candidate; bestCost = cost; size = look; }
          }
        };
        ring(label, [1, 1.4], 0);
        if (bestCost >= 1) ring(layoutLabel(request.tex, this.theme.fontSize * request.scale * this.theme.crowdedLabelScale, this.theme.wordLabelScale), [0.7, 1], 0.1);
      }
      if (bestCost >= 1) this.crowdedLabels.push(request.tex);
      // a label that names a particle tells what it is when the pointer rests on it
      const info = this.tooltips && request.particle ? particleInfo(request.particle) : undefined;
      const classes = [request.cls, info ? "feynjs-has-info" : "", this.isAhead(request.level) ? "feynjs-ahead" : ""].filter(Boolean).join(" ");
      const colorAttr = (request.color ? ` color="${request.color}"` : "") + (classes ? ` class="${classes}"` : "");
      const levelAttr = request.level === undefined ? "" : ` data-level="${request.level}"${this.aheadAttributes(request.level, false)}`;
      // (the title is the plain tooltip of an exported file; on a page, run() shows a richer one)
      const title = info ? `<title>${escapeXml(info)}</title>` : "";
      const particleAttr = info ? ` data-particle="${escapeXml(request.particle!)}"` : "";
      this.labels.push(`<g transform="translate(${fmt(best.x)} ${fmt(best.baseline)})"${colorAttr}${levelAttr}${particleAttr} fill="currentColor">${title}${size.svg}</g>`);
      this.placedLabels.push({ tex: size.tex, size: size.size, x: best.x, baseline: best.baseline, color: request.color });
      this.labelBoxes.push(best.box);
      this.bounds.include(best.box.left, best.box.top, 2);
      this.bounds.include(best.box.right, best.box.bottom, 2);
    }
    this.fixedLabels = [];
    this.legLabels = [];
    this.movableLabels = [];
  }

  /** True for a part not yet revealed. */
  isAhead(step: number | undefined): boolean {
    return this.reveal !== undefined && step !== undefined && step > this.reveal;
  }

  /** For a part not yet revealed: faint and grey (with a class, so a page can restyle or animate it). */
  aheadAttributes(step: number, withClass = true): string {
    if (!this.isAhead(step)) return "";
    return `${withClass ? ` class="feynjs-ahead"` : ""} opacity="${fmt(this.theme.revealOpacity)}" style="filter: grayscale(1)"`;
  }

  /**
   * Place a label now, after the others, at the clearest of `spots` (each at its own clearance):
   * a note set in free space. Returns its box.
   */
  placeNow(tex: string, spots: { spot: LabelSpot; clearance: number }[], color?: string, cls?: string, pointsAt?: Pt): Rectangle {
    const label = layoutLabel(tex, this.theme.fontSize, this.theme.wordLabelScale);
    let best = this.boxAt(spots[0].spot, spots[0].clearance, label.width, label.ascent, label.descent), bestCost = Infinity;
    spots.forEach(({ spot, clearance }, k) => {
      const candidate = this.boxAt(spot, clearance, label.width, label.ascent, label.descent);
      // (a note's arrow, from its box to what it points at, should not cross another label)
      const crossesLabel = pointsAt ? this.labelBoxes.some((b) => {
        const cx = (candidate.box.left + candidate.box.right) / 2, cy = (candidate.box.top + candidate.box.bottom) / 2;
        for (let t = 0.1; t <= 0.95; t += 0.05) { const x = cx + (pointsAt.x - cx) * t, y = cy + (pointsAt.y - cy) * t; if (x > b.left && x < b.right && y > b.top && y < b.bottom) return true; }
        return false;
      }) : false;
      const cost = this.crowding(candidate.box) + (crossesLabel ? 20 : 0) + k * 0.01;
      if (cost < bestCost) { best = candidate; bestCost = cost; }
    });
    this.labels.push(`<g transform="translate(${fmt(best.x)} ${fmt(best.baseline)})"${color ? ` color="${color}"` : ""}${cls ? ` class="${cls}"` : ""} fill="currentColor">${label.svg}</g>`);
    this.placedLabels.push({ tex: label.tex, size: label.size, x: best.x, baseline: best.baseline, color });
    this.labelBoxes.push(best.box);
    this.bounds.include(best.box.left, best.box.top, 2);
    this.bounds.include(best.box.right, best.box.bottom, 2);
    return best.box;
  }

  /** Draw a label at once, at exactly this spot. */
  addLabel(tex: string, anchor: Pt, direction: Pt, clearance: number, color?: string, scale = 1, cls?: string, ignore?: string): void {
    this.fixedLabels.push({ tex, spots: [{ anchor, direction }], clearance, color, scale, level: this.level, cls, ignore });
  }
}
