import { greyscaleSvg } from "./greyscale.ts";
import { nucleusRadius } from "./nucleus.ts";
import { bagRadius } from "./bag.ts";
import { drawKinematic } from "../views/kinematic.ts";
import { drawLattice } from "../views/lattice.ts";
import { snapToGrid } from "../engines/forces/grid.ts";
import { fmt } from "../geometry/curve.ts";
import { layout } from "../engines/rules/layout.ts";
import { assignRoles } from "../engines/rules/roles.ts";
import { FeynError } from "../model.ts";
import type { Diagram, Edge, Vertex } from "../model.ts";
import { sizedTheme, sizeFromSwitch, themeWith } from "../theme.ts";
import type { Theme, ThemeOverrides } from "../theme.ts";
import { applyDiagramDirectives, bowParallelEdges, inheritStylesFromExternalParticles, oneArrowIntoBlob } from "./edge-styles.ts";
import { describeParsed } from "../tools/describe.ts";
import { explainParsed } from "../tools/explain.ts";
import { drawColourFlow } from "./colour-flow.ts";
import { drawEdge } from "./edges.ts";
import { particleOfEdge } from "../particles/identify.ts";
import { drawNotes } from "./notes.ts";
import { drawHadronGroup } from "./hadrons.ts";
import { layoutWithForces } from "../engines/forces/layout.ts";
import type { LayoutTrace } from "../engines/forces/layout.ts";
import { whyLines } from "../engines/forces/why.ts";
import { drawDebug } from "./debug.ts";
import type { DebugInfo } from "./debug.ts";
import type { Sizes } from "../engines/forces/structure.ts";
import { layoutLabel } from "../label/label.ts";
import { Scene } from "./scene.ts";
import { drawVertexShape, labelCoupling, labelExternalLeg, vertexRadius } from "./vertices.ts";
import * as portable from "../geometry/portable-math.ts";

export interface RenderOptions {
  /** overrides for any part of the default theme: sizes, colours, layout rules */
  theme?: ThemeOverrides;
  /** id prefix so several diagrams can share a page */
  idPrefix?: string;
  /** diagrams per row when the source holds several panels (default 3) */
  panelsPerRow?: number;
  /** give the SVG its own colours (black on white) so it displays correctly outside a web page */
  standalone?: boolean;
  /** background colour used when standalone (default white) */
  background?: string;
  /**
   * Tag every line, vertex and label with its step in time (data-level: steps from the
   * incoming particles), so a page can reveal the diagram one step at a time.
   */
  levels?: boolean;
  /**
   * Progressive reveal: draw the first `reveal` steps in time as usual and everything later
   * faint and grey, so the whole diagram's outline shows from the start. The `reveal: n`
   * switch in the source does the same.
   */
  reveal?: number;
  /** a particle's properties when the pointer rests on its label: a plain title in the SVG, and a card on a page drawn by run() (off by default) */
  tooltips?: boolean;
}

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Height of the math axis above the baseline, in em (TeX's \\fontdimen22 of Computer Modern). */
export const MATH_AXIS_EM = 0.25;

function assembleSvg(scene: Scene, title: string | undefined, ariaLabel: string, scale: number, description: string, grid = 0, origin = { x: 0, y: 0 }, iso = false, inlineAt?: number, model = "", gridArea?: { left: number; top: number; right: number; bottom: number }): string {
  const b = scene.bounds, pad = scene.theme.padding;
  const width = b.right - b.left + 2 * pad, height = b.bottom - b.top + 2 * pad;
  // (`inline: a`: in a line of text, the point `a` sits on the math axis, where an equation's
  // middle sits (a quarter em above the baseline, the height of a minus sign): the drawing's foot
  // lowered that far below the baseline, less the axis)
  // (sized to the text around it, in em: its labels a little smaller than the text)
  const em = 0.62 / scene.theme.fontSize;
  const inline = inlineAt === undefined ? "" : ` style="vertical-align: ${fmt(-(b.bottom + pad - inlineAt) * em + MATH_AXIS_EM)}em"`;
  // (a faint grid behind the drawing, `background: grid`: lines every `grid` px, through the
  // layout's own origin, so the points of a grid layout sit on its crossings; in the drawing's
  // own colour, thinned, so it stays faint on dark pages as on light)
  let gridLines = "";
  if (grid > 0) {
    // (over the diagram only: not under what `debug: on` writes below it)
    const area = gridArea ?? b;
    const [x0, y0, x1, y1] = [area.left - pad, area.top - pad, area.right + pad, area.bottom + pad];
    const path: string[] = [];
    if (iso) {
      // (isometric: rows sqrt(3)/2 of a step apart, and lines at 60 and 120 degrees through the
      // lattice's points)
      const row = (grid * Math.sqrt(3)) / 2, k = 1 / Math.sqrt(3);
      for (let y = origin.y + Math.ceil((y0 - origin.y) / row) * row; y <= y1; y += row) path.push(`M${fmt(x0)} ${fmt(y)}H${fmt(x1)}`);
      const reach = (y1 - y0) * k;
      for (let x = origin.x + Math.floor((x0 - reach - origin.x) / grid) * grid; x <= x1 + reach; x += grid) {
        path.push(`M${fmt(x + (y0 - origin.y) * k)} ${fmt(y0)}L${fmt(x + (y1 - origin.y) * k)} ${fmt(y1)}`);
        path.push(`M${fmt(x - (y0 - origin.y) * k)} ${fmt(y0)}L${fmt(x - (y1 - origin.y) * k)} ${fmt(y1)}`);
      }
    } else {
      for (let x = origin.x + Math.ceil((x0 - origin.x) / grid) * grid; x <= x1; x += grid) path.push(`M${fmt(x)} ${fmt(y0)}V${fmt(y1)}`);
      for (let y = origin.y + Math.ceil((y0 - origin.y) / grid) * grid; y <= y1; y += grid) path.push(`M${fmt(x0)} ${fmt(y)}H${fmt(x1)}`);
    }
    gridLines = `<path class="feynjs-grid" d="${path.join("")}" fill="none" stroke="currentColor" stroke-opacity="0.11" stroke-width="0.6"/>`;
  }
  const hatching = (scene.usesHatching
    ? `<defs><pattern id="${scene.idPrefix}-hatch" width="${fmt(scene.theme.vertex.hatchSpacing)}" height="${fmt(scene.theme.vertex.hatchSpacing)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V${fmt(scene.theme.vertex.hatchSpacing)}" stroke="currentColor" stroke-width="0.9"/></pattern></defs>`
    : "");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="feynjs" role="img" aria-label="${escapeText(ariaLabel)}" viewBox="${fmt(b.left - pad)} ${fmt(b.top - pad)} ${fmt(width)} ${fmt(height)}" width="${inline ? `${fmt(width * em)}em` : fmt(width * scale)}" height="${inline ? `${fmt(height * em)}em` : fmt(height * scale)}" font-family="${scene.theme.fontFamily}"${inline}>`
    + (title ? `<title>${escapeText(title)}</title>` : "") + (description ? `<desc>${escapeText(description)}</desc>` : "") + (model ? `<metadata class="feynjs-model">${escapeText(model)}</metadata>` : "") + hatching + gridLines
    + `<g class="feynjs-edges">${scene.edges.join("")}</g>`
    + `<g class="feynjs-vertices">${scene.vertices.join("")}</g>`
    + `<g class="feynjs-labels">${scene.labels.join("")}</g></svg>`;
}

/**
 * The diagram as data, written into the SVG (`<metadata class="feynjs-model">`): every point by
 * its name, where it is drawn and where `at (x, y)` would put it, and every line by its name,
 * ends and particle. The names are the ones the drawing's groups carry (`data-vertex`,
 * `data-edge`), so a program, or a model reading the SVG, can refer to any part and change the
 * source by name.
 */
function diagramModel(d: Diagram, scene: Scene): string {
  const { unitX, unitY } = scene.theme;
  const round = (n: number) => Math.round(n * 100) / 100;
  const vertices = [...d.vertices.values()].map((v) => {
    const p = scene.position(v);
    return { id: v.id, ...(v.role ? { role: v.role } : {}), x: round(p.x), y: round(p.y), at: [round(p.x / unitX), round(-p.y / unitY) || 0],
      ...(v.label ? { label: v.label } : {}), ...(v.particle ? { particle: v.particle } : {}), ...(v.shape && v.shape !== "none" ? { shape: v.shape } : {}) };
  });
  const edges = d.edges.map((e) => {
    const particle = particleOfEdge(d, e);
    return { id: scene.edgeIds.get(e), from: e.from, to: e.to, ...(particle ? { particle } : {}), line: e.style.line, ...(e.style.object ? { object: e.style.object } : {}), ...(e.label ? { label: e.label } : {}) };
  });
  return JSON.stringify({ feynjs: 1, unit: { x: unitX, y: unitY }, vertices, edges });
}

/** How far, in px, the mark drawn at a vertex reaches from its centre. */
function markRadiusPx(v: Vertex, theme: Theme): number {
  const look = theme.vertex;
  switch (v.shape) {
    case "blob": case "hatched": return look.blob;
    case "smallblob": return look.smallBlob;
    case "crossed": return look.crossedDot;
    case "bag": return bagRadius(v.bag?.quarks ?? []);
    case "nucleus": return nucleusRadius(v.nucleus?.A ?? 1, look.nucleusUnit);
    case "dot": case "empty": case "square": return (v.dotScale ?? 1) * (v.coupling || v.color ? look.couplingDot : look.dot);
    default: return 0;
  }
}

/**
 * Everything that happens before drawing: decide which legs enter and leave, settle
 * each line's style, then place the vertices. The layout reads line styles (to follow
 * decay chains and radiation), so styles are resolved first.
 */
export function layoutDiagram(d: Diagram, theme: Theme, debug?: DebugInfo): void {
  assignRoles(d);
  inheritStylesFromExternalParticles(d);
  applyDiagramDirectives(d);
  oneArrowIntoBlob(d);
  bowParallelEdges(d);
  // the engines: `default` (the forces, v2), `manual` (points given `at (x,y)` stay put, the
  // forces place the rest), `grid` (the forces, then every line on a direction of the grid);
  // `v1` (the older rules) and `v2` are kept as names
  const asked = (d.directives.layout ?? "").trim().toLowerCase();
  const engine = (["v1", "v2", "manual", "grid"].includes(asked) ? asked : asked === "default" ? "v2" : theme.engine) as Theme["engine"];
  if (engine === "v1") layout(d, theme.layout, theme.unitY / theme.unitX, (v) => markRadiusPx(v, theme) / theme.unitY);
  else {
    // (`final plane: on`: the final states end on one plane first, whatever else wants them
    // elsewhere, each last decay forking about level)
    // (not in a hadron diagram: its hadrons' columns are its final plane already)
    const planeFirst = /^(on|yes|true)$/i.test((d.directives["final plane"] ?? "").trim()) && d.hadrons.length === 0;
    const forces = planeFirst ? { ...theme.forces, planeFirst: 1, alignSteepest: 89, alignLevel: 89, alignStretch: 4, finalPlane: theme.forces.finalPlane * 5 } : theme.forces;
    const trace: LayoutTrace | undefined = debug ? { steps: [] } : undefined;
    const sizes = labelSizes(d, theme);
    layoutWithForces(d, forces, theme.unitY / theme.unitX, sizes, true, trace);
    // (`debug: on`: why each line lies where it does, measured by settling again without each force)
    if (debug) { debug.steps.push(...trace!.steps); debug.why = whyLines(d, forces, theme.unitY / theme.unitX, sizes); }
  }
  if (debug) debug.engine = engine === "v2" ? "default" : engine;
  // (each step after the engine, noted for `debug: on` with the points it moved)
  const noted = (step: string, run: () => void) => {
    const before = debug && new Map([...d.vertices.values()].map((v) => [v.id, [v.x, v.y * (theme.unitY / theme.unitX)]]));
    run();
    if (!debug || !before) return;
    const moved = new Map<string, number>();
    for (const v of d.vertices.values()) { const [x, y] = before.get(v.id)!; const far = portable.hypot(v.x - x, v.y * (theme.unitY / theme.unitX) - y); if (far > 0.02) moved.set(v.id, far); }
    if (moved.size) debug.steps.push({ step, moved });
  };
  const isoGrid = /^iso/i.test((d.directives.grid ?? "").trim());
  if (engine === "grid") noted("turned onto the grid's directions", () => snapToGrid(d, isoGrid ? 60 : Number(d.directives.grid) === 45 ? 45 : 22.5, theme.forces.lineLength, theme.unitY / theme.unitX, /^(true|on|yes|diagonal)/i.test((d.directives["grid forks"] ?? "").trim()) ? "diagonal" : "corner"));
  noted("drawn longer to hold its detector object", () => stretchObjectLegs(d, theme.line.objectLegStretch));
  noted("turned with the whole diagram, as horizontal: or vertical: asks", () => orientDiagram(d, theme.unitY / theme.unitX));
}

/**
 * `horizontal: a to b` turns the whole diagram so `b` sits level to the right of `a`;
 * `vertical: a to b`, so `b` sits straight below `a`, as TikZ-Feynman's keys do. A prime
 * (`horizontal': a to b`) mirrors it across that line as well.
 */
function orientDiagram(d: Diagram, rowOverRank: number): void {
  for (const key of ["horizontal", "horizontal'", "vertical", "vertical'"]) {
    const asked = d.directives[key];
    if (asked === undefined) continue;
    const m = /^\s*([\w']+)\s+to\s+([\w']+)\s*$/.exec(asked);
    const a = m && d.vertices.get(m[1]), b = m && d.vertices.get(m[2]);
    if (!a || !b) throw new FeynError(`write "${key}: a to b", naming two points of the diagram`);
    // (turned about `a`, in true proportions: a row is not as long as a rank)
    const angle = portable.atan2((b.y - a.y) * rowOverRank, b.x - a.x);
    const turn = (key.startsWith("vertical") ? Math.PI / 2 : 0) - angle, cos = portable.cos(turn), sin = portable.sin(turn);
    const mirrored = key.endsWith("'");
    for (const v of d.vertices.values()) {
      const x = v.x - a.x, y = (v.y - a.y) * rowOverRank;
      let nx = x * cos - y * sin, ny = x * sin + y * cos;
      if (mirrored && key.startsWith("horizontal")) ny = -ny;
      if (mirrored && key.startsWith("vertical")) nx = -nx;
      v.x = a.x + nx;
      v.y = a.y + ny / rowOverRank;
    }
    // (a mirror turns every bend the other way, and every given angle with it)
    if (mirrored) for (const e of d.edges) {
      if (e.bend) e.bend = -e.bend;
      if (e.angles) {
        const flip = (t?: number) => (t === undefined ? t : key.startsWith("horizontal") ? -t : 180 - t);
        e.angles = { ...e.angles, out: flip(e.angles.out), in: flip(e.angles.in) };
      }
    }
    return;
  }
}

/**
 * A leg that ends in a detector object (a large-R jet, a tau, a dark-sector jet...) is drawn
 * longer, straight out the way it already points, so there is room to show what is inside it.
 */
function stretchObjectLegs(d: Diagram, stretch: number): void {
  const degree = new Map<string, number>();
  for (const e of d.edges) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);
  for (const e of d.edges) {
    if (e.style.line !== "jet" || !e.style.object || e.style.object === "jet") continue;
    const [inner, outer] = degree.get(e.to) === 1 ? [e.from, e.to] : degree.get(e.from) === 1 ? [e.to, e.from] : [];
    if (!inner || !outer) continue;
    const a = d.vertices.get(inner)!, b = d.vertices.get(outer)!;
    if (b.fixed) continue;
    b.x = a.x + (b.x - a.x) * stretch;
    b.y = a.y + (b.y - a.y) * stretch;
  }
}

/**
 * How far each label reaches, in propagator lengths, for the force layout to keep clear:
 * half the label's diagonal plus the gap the renderer leaves between a label and its line.
 */
function labelSizes(d: Diagram, theme: Theme): Sizes {
  const reach = (tex: string | undefined, scale: number) => {
    if (!tex) return 0;
    const box = layoutLabel(tex, theme.fontSize * scale, theme.wordLabelScale);
    // (and half the margin labels keep between them, so two labels side by side stay a margin apart)
    return (portable.hypot(box.width, box.ascent + box.descent) / 2 + theme.labelGap + theme.labelMargin / 3) / theme.unitX;
  };
  const legLabel = new Map<string, number>();
  for (const v of d.vertices.values()) if (v.label) legLabel.set(v.id, reach(v.label, 1));
  return { legLabel, edgeLabel: d.edges.map((e) => reach(e.label, 0.9)),
    hadronPad: (theme.fontSize * 0.55) / theme.unitX, hadronMin: (theme.fontSize * 1.1) / theme.unitX,
    blobRadius: theme.vertex.blob / theme.unitX,
    markRadius: new Map([...d.vertices.values()].filter((v) => v.shape === "nucleus" || v.shape === "bag").map((v) => [v.id, vertexRadius(v, theme.vertex) / theme.unitX])) };
}

/**
 * Each point's step in time: incoming legs are 0, and every other point is one step after the
 * nearest earlier one (breadth first from the incoming legs).
 */
function stepsInTime(d: Diagram): Map<string, number> {
  const around = new Map<string, string[]>();
  for (const e of d.edges) {
    (around.get(e.from) ?? around.set(e.from, []).get(e.from)!).push(e.to);
    (around.get(e.to) ?? around.set(e.to, []).get(e.to)!).push(e.from);
  }
  const step = new Map<string, number>();
  let frontier = [...d.vertices.values()].filter((v) => v.role === "in").map((v) => v.id);
  if (frontier.length === 0) frontier = [...around.keys()].filter((id) => around.get(id)!.length === 1).slice(0, 1);
  for (const id of frontier) step.set(id, 0);
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) for (const n of around.get(id) ?? []) {
      if (step.has(n)) continue;
      step.set(n, step.get(id)! + 1);
      next.push(n);
    }
    frontier = next;
  }
  return step;
}

/** Lay out a parsed diagram and draw it as SVG markup. */
export function renderDiagram(d: Diagram, options: RenderOptions = {}): string {
  return drawDiagram(d, options).svg;
}

/** Draw a diagram and also return the scene it was drawn into, for measuring. */
export function drawDiagram(d: Diagram, options: RenderOptions = {}): { svg: string; scene: Scene } {
  const base = themeWith(options.theme);
  const sized = sizedTheme(base, sizeFromSwitch(d.directives.size) ?? base.size);
  // (drawn smaller with scale:, its lines thin less than everything else, so they still read)
  const zoom = Number(d.directives.scale) || 1;
  const thicker = zoom < 1 ? portable.power(zoom, -0.5) : 1;
  const thinned = thicker === 1 ? sized : { ...sized, line: { ...sized.line, stroke: sized.line.stroke * thicker, heavy: sized.line.heavy * thicker, susy: sized.line.susy * thicker } };
  // (nucleon edges: ink, none, or tinted, a darker red round protons and a lighter grey round neutrons)
  const edges = (d.directives["nucleon edges"] ?? "").trim().toLowerCase();
  const theme = edges === "none" ? { ...thinned, vertex: { ...thinned.vertex, protonEdge: "none", neutronEdge: "none" } }
    : edges === "tinted" ? { ...thinned, vertex: { ...thinned.vertex, protonEdge: "#8e1f10", neutronEdge: "#aab3c3" } } : thinned;
  // (the lattice view draws space-time cut into sites and links, not the diagram)
  if (/^lattice$/i.test((d.directives.view ?? "").trim())) return { svg: drawLattice(d, theme), scene: new Scene(d, theme, options.idPrefix ?? "feyn") };
  // (`debug: on`: a faint grid, each point's name, and why each line lies where it does)
  const debug: DebugInfo | undefined = /^(on|yes|true)$/i.test((d.directives.debug ?? "").trim()) ? { engine: "", steps: [] } : undefined;
  layoutDiagram(d, theme, debug);

  const scene = new Scene(d, theme, options.idPrefix ?? "feyn");
  for (const [e, ids] of smallestLoops(d)) {
    const pts = ids.map((id) => scene.position(d.vertices.get(id)!));
    scene.loopMiddle.set(e, { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length });
  }
  const degree = new Map<string, number>();
  for (const e of d.edges) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);

  const revealed = options.reveal ?? (d.directives.reveal !== undefined ? Number(d.directives.reveal) : undefined);
  const reveal = revealed !== undefined && Number.isFinite(revealed) ? revealed : undefined;
  const level = options.levels || reveal !== undefined ? stepsInTime(d) : undefined;
  scene.reveal = reveal;
  scene.tooltips = options.tooltips ?? false;
  scene.chargeColour = /^(on|yes|true)$/i.test(d.directives["charge colour"] ?? d.directives["charge color"] ?? "");
  // a pulsing point pulses the lines that meet there too
  for (const e of d.edges) if (e.pulse === undefined) e.pulse = d.vertices.get(e.from)?.pulse ?? d.vertices.get(e.to)?.pulse;
  // wrap what one call adds to a list of SVG pieces in a group carrying its step in time
  const tagged = (list: string[], step: number | undefined, draw: () => void) => {
    const start = list.length;
    scene.level = step;
    draw();
    if (step !== undefined) for (let k = start; k < list.length; k++) list[k] = `<g data-level="${step}"${scene.aheadAttributes(step)}>${list[k]}</g>`;
    scene.level = undefined;
  };
  const colourFlow = (d.directives["colour flow"] ?? d.directives["color flow"] ?? "").trim().toLowerCase();
  scene.colourOnly = colourFlow === "only";
  // (every line a name of its own, from its ends)
  const seen = new Map<string, number>();
  for (const e of d.edges) {
    const base = `${e.from}--${e.to}`, n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    scene.edgeIds.set(e, n === 1 ? base : `${base}#${n}`);
  }
  const drawn = new Map<Edge, [number, number]>();
  for (const e of d.edges) {
    const step = level && Math.max(level.get(e.from) ?? 0, level.get(e.to) ?? 0);
    const start = scene.edges.length;
    tagged(scene.edges, step, () => drawEdge(scene, d, e, degree));
    drawn.set(e, [start, scene.edges.length]);
  }
  const flow = /^(on|yes|true|only)$/.test(colourFlow) ? drawColourFlow(scene, d) : undefined;
  const warnings = flow?.warnings ?? [];
  // colour lines on their own: the quark and gluon lines they stand in for are not drawn
  if (scene.colourOnly && flow) for (const e of flow.coloured) { const [a, b] = drawn.get(e)!; for (let k = a; k < b; k++) scene.edges[k] = ""; }
  // colour lines beneath the diagram's lines
  if (flow && scene.edges[scene.edges.length - 1]?.startsWith(`<g class="feynjs-colour-flow"`)) scene.edges.unshift(scene.edges.pop()!);
  // the cone symbols of jets stand in one column of their own, past the furthest leg's end
  const cones = [...d.vertices.values()].filter((v) => v.coneMark);
  if (cones.length) {
    scene.conePlane = Math.max(...cones.map((v) => scene.position(v).x)) + theme.fontSize * 0.6;
    // (in order down the page, at least a line and a half apart, centred where the legs end)
    const order = cones.map((v) => ({ id: v.id, y: scene.position(v).y })).sort((a, b) => a.y - b.y);
    const gap = theme.fontSize * 1.5, placed: number[] = [];
    order.forEach((c, k) => placed.push(k === 0 ? c.y : Math.max(c.y, placed[k - 1] + gap)));
    const shift = (order.reduce((s, c) => s + c.y, 0) - placed.reduce((s, y) => s + y, 0)) / order.length;
    order.forEach((c, k) => scene.coneY.set(c.id, placed[k] + shift));
  }
  for (const v of d.vertices.values()) {
    tagged(scene.vertices, level?.get(v.id), () => {
      drawVertexShape(scene, v);
      labelExternalLeg(scene, v);
      labelCoupling(scene, v);
    });
  }
  for (const group of d.hadrons) {
    const step = level && Math.max(...group.legs.map((id) => level.get(id) ?? 0));
    tagged(scene.vertices, step, () => tagged(scene.edges, step, () => drawHadronGroup(scene, d, group)));
  }
  scene.placeLabels();
  // notes last, where the diagram and its labels leave room
  drawNotes(scene, d);
  const drawnArea = { left: scene.bounds.left, top: scene.bounds.top, right: scene.bounds.right, bottom: scene.bounds.bottom };
  if (debug) drawDebug(scene, d, debug);
  if (warnings.length) drawWarning(scene, warnings);
  const label = `Feynman diagram: ${describeParsed(d).process}`;
  // (the background grid: asked for, or with the grid layout; at half a line length)
  const background = (d.directives.background ?? (debug || /^grid$/i.test((d.directives.layout ?? "").trim()) ? "grid" : "")).trim().toLowerCase();
  const gridStep = background === "grid" ? (theme.forces.lineLength * theme.unitX) / 2 : 0;
  // (through the beam axis: a horizontal grid line through the middle of the incoming legs,
  // a vertical one through the first of them; a grid layout keeps its own crossings)
  // (and a vertical one through the first vertex the incoming lines reach, so a loop's upright
  // side or an exchange stands on a grid line)
  const incoming = [...d.vertices.values()].filter((v) => v.role === "in").map((v) => scene.position(v));
  const linesAt = new Map<string, number>();
  for (const e of d.edges) for (const id of [e.from, e.to]) linesAt.set(id, (linesAt.get(id) ?? 0) + 1);
  const inner = [...d.vertices.values()].filter((v) => (linesAt.get(v.id) ?? 0) > 1).map((v) => scene.position(v).x);
  const origin = gridStep && incoming.length && !/^grid$/i.test((d.directives.layout ?? "").trim())
    ? { x: inner.length ? Math.min(...inner) : Math.min(...incoming.map((q) => q.x)), y: incoming.reduce((sum, q) => sum + q.y, 0) / incoming.length } : { x: 0, y: 0 };
  const inlineId = d.directives.inline?.trim().replace(/^\((.*)\)$/, "$1");
  const inlineVertex = inlineId ? d.vertices.get(inlineId) : undefined;
  if (inlineId && !inlineVertex) throw new FeynError(`inline: names a point of the diagram, such as "inline: a"`);
  const svg = assembleSvg(scene, d.directives.title, label, (Number(d.directives.scale) || 1) * theme.drawingScale, explainParsed(d), gridStep, origin, /^iso/i.test((d.directives.grid ?? "").trim()), inlineVertex && scene.position(inlineVertex).y, diagramModel(d, scene), debug ? drawnArea : undefined);
  // (the black-and-white scheme: every colour the drawing uses, made grey)
  // (the kinematic view draws the event instead of the diagram)
  const view = (d.directives.view ?? "").trim().toLowerCase();
  const yes = (key: string) => /^(on|yes|true)$/i.test((d.directives[key] ?? "").trim()), no = (key: string) => /^(off|no|false)$/i.test((d.directives[key] ?? "").trim());
  const shown = view === "kinematic" ? drawKinematic(d, theme, /^long/i.test((d.directives.projection ?? "").trim()) ? "longitudinal" : "transverse", { reconstruct: !no("reconstruct"), intermediates: yes("show intermediate") || yes("show intermediates"), rotate: d.directives.rotate !== undefined && Number.isFinite(Number(d.directives.rotate)) ? Number(d.directives.rotate) : 30 }) : svg;
  const scheme = (d.directives.colours ?? d.directives.colors ?? theme.colourScheme).trim().toLowerCase();
  return { svg: scheme === "bw" ? greyscaleSvg(shown) : shown, scene };
}

/**
 * A quiet warning in the diagram's top corner: a small triangle whose tooltip says what is
 * wrong (a colour flow the diagram does not suit, say). It sits above the drawing, clear of it.
 */
function drawWarning(scene: Scene, warnings: string[]): void {
  const size = scene.theme.fontSize * 0.75, x = scene.bounds.left, y = scene.bounds.top - size - 4;
  const text = warnings.map((w) => w.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")).join("\n");
  // the Lucide "triangle-alert" icon (ISC licence, lucide.dev)
  scene.labels.push(`<g class="feynjs-warning" transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(size / 24)})" color="#c77700" opacity="0.75" style="cursor: help"><title>${text}</title>`
    + `<rect width="24" height="24" fill="transparent"/><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g>`);
  scene.bounds.include(x, y, 1);
  scene.bounds.include(x + size, y + size, 1);
}

/**
 * For each line on a closed loop of at most six lines (a triangle, a box, a bubble), the
 * points of the smallest such loop: the shortest way round from one end back to the other.
 */
function smallestLoops(d: Diagram): Map<object, string[]> {
  const around = new Map<string, { to: string; e: object }[]>();
  for (const e of d.edges) {
    if (e.from === e.to || e.style.line === "none") continue;
    (around.get(e.from) ?? around.set(e.from, []).get(e.from)!).push({ to: e.to, e });
    (around.get(e.to) ?? around.set(e.to, []).get(e.to)!).push({ to: e.from, e });
  }
  const loops = new Map<object, string[]>();
  for (const e of d.edges) {
    if (e.from === e.to || e.style.line === "none") continue;
    // breadth first from e.to back to e.from without using e
    const back = new Map<string, string>([[e.to, ""]]);
    let frontier = [e.to];
    for (let depth = 0; depth < 5 && frontier.length && !back.has(e.from); depth++) {
      const next: string[] = [];
      for (const v of frontier) for (const { to, e: f } of around.get(v) ?? []) {
        if (f === e || back.has(to)) continue;
        back.set(to, v);
        next.push(to);
      }
      frontier = next;
    }
    if (!back.has(e.from)) continue;
    const ids: string[] = [];
    for (let v: string | undefined = e.from; v; v = back.get(v) || undefined) ids.push(v);
    if (ids.length >= 2) loops.set(e, ids);
  }
  return loops;
}
