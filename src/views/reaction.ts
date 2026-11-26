import { Curve, fmt } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import { layoutLabel } from "../label/label.ts";
import type { LabelBox } from "../label/label.ts";
import { FeynError } from "../model.ts";
import type { Diagram, Edge, EdgeStyle, Vertex } from "../model.ts";
import { drawLine } from "../render/lines.ts";
import { lookupParticle } from "../particles/registry.ts";
import { elementSymbol, isotopeLabel, nucleusRadius, nucleusSvg, recoilRings, recoilSvg, recoiledTo } from "../render/nucleus.ts";
import type { Theme } from "../theme.ts";
import { Scene } from "../render/scene.ts";
import { drawViewNotes } from "../render/notes.ts";
import { energyColour, energyGlow, energyLevel } from "../render/vertices.ts";
import { diagramModel, svgDocument } from "../render/svg.ts";
import { explainParsed } from "../tools/explain.ts";
import type { RenderOptions } from "../render/render.ts";
import { drawDecayChain } from "./chain.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * The reaction view: a nuclear reaction as textbooks draw it, from its process line. It is how a
 * nuclear process is drawn unless `view: diagram` asks for its diagram (`view: reaction` names
 * it), in one of four pictures, whichever the process is:
 *
 *   2H 3H > 4He n            a reaction: what comes in on the left, each nucleus with an arrow
 *                            into a burst, and what is made fanned out on the right
 *   gamma 2H > p n           a breakup: the photon, wavy, reaches into the nucleus, and the
 *                            fragments fly out of it
 *   chi Xe > chi Xe          an elastic scattering (the same in as out): what comes in meets the
 *                            nucleus and leaves deflected, the nucleus recoiling on a short thick
 *                            arrow (with `signal: on`, the light and charge a detector sees)
 *   238U > 234Th 4He, ...    a decay chain, step by step (see chain.ts)
 *
 * Every nucleus is drawn at its true size, one nucleon as large in all of them, and named on its
 * outer side; every arrow is the same length, the legs on each side the same angle apart, and
 * the arrows only as long as neighbours, and their names, need to clear each other.
 */
export function drawReaction(d: Diagram, theme: Theme, idPrefix = "feyn", options: RenderOptions = {}): { svg: string; scene: Scene } {
  if (d.decayChain) return drawDecayChain(d, d.decayChain, theme, idPrefix, options);
  const { incoming, outgoing } = reactionLegs(d, theme);
  if (incoming.length === 0 || outgoing.length === 0) throw new FeynError(`the reaction view draws a process with something coming in and something made, such as "2H 3H > 4He n"`);
  const look = sizesFor(theme);
  const scene = new Scene(d, theme, idPrefix);
  if (isElastic(incoming, outgoing)) drawRecoil(scene, d, incoming, outgoing, look);
  else if (isDeexcitation(incoming, outgoing)) drawDeexcitation(scene, incoming[0], outgoing, look);
  else {
    // (a photon breaking a nucleus up reaches into it, and the fragments fly out of it; anything
    // else meets in a burst)
    const target = incoming.length === 2 && incoming.some((l) => l.nucleus) && incoming.some((l) => !l.nucleus && l.line === "wave") ? incoming.find((l) => l.nucleus)! : undefined;
    const middle = target ? target.radius : Math.max(theme.unitX * 0.27, Math.max(0, ...[...incoming, ...outgoing].map((leg) => leg.radius)) * 0.8);
    const centre = target ? nucleusAt(scene, { x: 0, y: 0 }, target.nucleus!.A, target.nucleus!.Z, target.radius, target.names) : scene.target(["burst"], { x: 0, y: 0 }, middle * 0.8);
    if (!target) scene.edges.push(burstSvg(middle, theme.line.stroke));
    scene.bounds.include(-middle, -middle); scene.bounds.include(middle, middle);
    // (a photon among what is made comes out of the heaviest nucleus made, as it does: that nucleus
    // gives it off, not the burst)
    const emitter = [...outgoing].filter((l) => l.nucleus).sort((a, b) => b.radius - a.radius)[0];
    const photons = emitter ? outgoing.filter((l) => !l.nucleus && l.line === "wave") : [];
    const made = outgoing.filter((l) => !photons.includes(l));
    const sides: [Leg[], boolean][] = target ? [[incoming.filter((l) => l !== target), true], [made, false]] : [[incoming, true], [made, false]];
    const placed = fanLegs(scene, sides, middle, centre, look, !!target);
    if (emitter && photons.length) radiate(scene, placed.get(emitter)!, emitter.radius, photons, look);
    if (target) {
      const box = layoutLabel(target.label, look.size, 1);
      textAt(scene, box, -box.width / 2, target.radius + look.labelGap + box.ascent);
    }
  }
  return { svg: viewSvg(scene, d, "feynjs-reaction", `a reaction: ${incoming.length} in, ${outgoing.length} out`, { x: 0, y: 0 }, !isElastic(incoming, outgoing), options), scene };
}

/** The sizes every reaction picture shares: its names' size, the gaps, a line's length and an arrow's width. */
export function sizesFor(theme: Theme) {
  return { size: theme.fontSize * 0.75, gap: theme.unitX * 0.11, labelGap: theme.fontSize * 0.75 * 0.3, length: theme.unitX * 0.75, stroke: theme.line.stroke * 0.75, theme };
}
type Sizes = ReturnType<typeof sizesFor>;

/** One leg of a reaction: what it carries (a nucleus, or a particle's line), how far that reaches, its name, and what notes call it. */
export interface Leg { nucleus?: { A: number; Z: number }; radius: number; line: EdgeStyle["line"]; label: string; key: string; names: string[] }

/** What comes in and what goes out: the diagram's legs, each from its end point and its line, in the order written. */
function reactionLegs(d: Diagram, theme: Theme): { incoming: Leg[]; outgoing: Leg[] } {
  const linesAt = new Map<string, Edge[]>();
  for (const e of d.edges) for (const id of new Set([e.from, e.to])) linesAt.set(id, [...(linesAt.get(id) ?? []), e]);
  const ends = [...d.vertices.values()].filter((v) => (linesAt.get(v.id) ?? []).length === 1 && v.shape !== "blob" && v.shape !== "hatched");
  const leg = (v: Vertex): Leg => {
    const e = linesAt.get(v.id)![0];
    // (a photon's or a gluon's line as it is, a dashed one dashed; anything else a plain arrow;
    // a leg that takes its style from its particle, `[gamma, out]`, takes it here too)
    const style = (!e.styled && v.particle ? lookupParticle(v.particle)?.style : undefined) ?? e.style;
    const line = ["wave", "coil", "dash", "dot"].includes(style.line) ? style.line : "plain";
    const names = [v.id, ...(v.label ? [v.label] : []), ...(v.particle ? [v.particle] : [])];
    if (v.shape === "nucleus" && v.nucleus?.A !== undefined) {
      const { A, Z = 0 } = v.nucleus;
      return { nucleus: { A, Z }, radius: nucleusRadius(A, theme.vertex.nucleusUnit), line: "plain", label: v.label ?? isotopeLabel(A, elementSymbol(Z)), key: `${A}/${Z}`, names };
    }
    return { radius: 0, line, label: v.label ?? e.label ?? "", key: v.particle ?? v.label ?? e.label ?? "", names };
  };
  return { incoming: ends.filter((v) => v.role === "in").map(leg), outgoing: ends.filter((v) => v.role !== "in").map(leg) };
}

/** The same in as out (`chi Xe > chi Xe`, `n 12C > n 12C`): two things, one a nucleus, that scatter and stay what they were. */
function isElastic(incoming: Leg[], outgoing: Leg[]): boolean {
  const keys = (legs: Leg[]) => legs.map((l) => l.key).sort().join(" ");
  return incoming.length === 2 && incoming.some((l) => l.nucleus) && keys(incoming) === keys(outgoing);
}

/**
 * The legs of a burst, or of a nucleus broken up, fanned out from the middle: what comes in on the
 * left, what goes out on the right, one angle apart on both sides so the picture is even; each an
 * arrow a gap from the middle (or, for a photon breaking a nucleus up, reaching into it), then a
 * gap, then what it carries, named on its outer side.
 */
function fanLegs(scene: Scene, sides: [Leg[], boolean][], middle: number, centre: number, look: Sizes, intoNucleus: boolean): Map<Leg, { at: Pt; u: Pt; id: number }> {
  const placed = new Map<Leg, { at: Pt; u: Pt; id: number }>();
  const counts = sides.map(([legs]) => legs.length);
  const step = Math.min(44, 136 / Math.max(1, ...counts.map((n) => n - 1)));
  const fans = sides.map(([legs, into]) => fanAngles(legs.length, step).map((a) => (into ? 180 - a : a)));
  const boxes = new Map(sides.flatMap(([legs]) => legs).map((leg) => [leg.label, layoutLabel(leg.label, look.size, 1)]));
  const geometry: Geometry = { start: middle + look.gap, gap: look.gap, labelGap: look.labelGap, boxes };
  const length = arrowLength(geometry, sides.map(([legs], k) => [legs, fans[k]]), look.length);
  const over: string[] = [];
  sides.forEach(([legs, into], s) => legs.forEach((leg, k) => {
    const u = unitAt(fans[s][k]), far = scaled(u, middle + look.gap + length);
    // (a photon breaking a nucleus up reaches a third of the way into it, drawn over its nucleons)
    const near = into && intoNucleus ? scaled(u, middle * 0.7) : scaled(u, middle + look.gap);
    const [from, to] = into ? [far, near] : [near, far];
    const { centre: at, box } = legPlace(leg, u, length, geometry);
    const id = leg.nucleus ? nucleusAt(scene, at, leg.nucleus.A, leg.nucleus.Z, leg.radius, leg.names) : scene.target(leg.names, far, 3);
    placed.set(leg, { at, u, id });
    const svg = `<g class="feynjs-reaction-arrow" data-line="${leg.line}">${arrowLine(from, to, leg.line, look.stroke, look.theme)}</g>`;
    if (into && intoNucleus) over.push(svg); else scene.edges.push(svg);
    lineAt(scene, from, to, [id, centre]);
    textAt(scene, boxes.get(leg.label)!, box.x, box.baseline);
  }));
  scene.edges.push(...over);
  return placed;
}

/**
 * Photons given off by a nucleus: each a wavy arrow from inside it, over its nucleons, out away
 * from the middle (turned off the nucleus's own way out, up for one above the middle and down for
 * one below), ending in its name.
 */
function radiate(scene: Scene, from: { at: Pt; u: Pt; id: number }, R: number, photons: Leg[], look: Sizes): void {
  const side = from.u.y <= 0 ? 1 : -1;
  photons.forEach((leg, k) => {
    const turn = (side * (40 + 30 * k) * Math.PI) / 180;
    // (turned on the page: up, anticlockwise, for a positive turn, y running down)
    const w = { x: from.u.x * portable.cos(turn) + from.u.y * portable.sin(turn), y: -from.u.x * portable.sin(turn) + from.u.y * portable.cos(turn) };
    const start = along(from.at, w, R * 0.6), end = along(from.at, w, R + look.length * 0.8);
    scene.edges.push(`<g class="feynjs-reaction-arrow" data-line="wave">${arrowLine(start, end, "wave", look.stroke, look.theme)}</g>`);
    lineAt(scene, start, end, [scene.target(leg.names, end, 3), from.id]);
    textToward(scene, leg.label, look.size, end, w, look.labelGap);
  });
}

/** A nucleus giving off only photons and staying itself (`12C* > 12C gamma`): its excited state decaying. */
function isDeexcitation(incoming: Leg[], outgoing: Leg[]): boolean {
  const nucleus = incoming[0];
  return incoming.length === 1 && !!nucleus.nucleus && outgoing.filter((l) => l.nucleus).length === 1 && outgoing.find((l) => l.nucleus)!.key === nucleus.key && outgoing.some((l) => l.line === "wave") && outgoing.every((l) => l.nucleus || l.line === "wave");
}

/** An excited nucleus decaying: the nucleus, glowing, named under it, and its photons radiating out of it. */
function drawDeexcitation(scene: Scene, nucleus: Leg, outgoing: Leg[], look: Sizes): void {
  const at = { x: 0, y: 0 }, R = nucleus.radius;
  glowAt(scene, at, R, "");
  const id = nucleusAt(scene, at, nucleus.nucleus!.A, nucleus.nucleus!.Z, R, [...nucleus.names, ...outgoing.filter((l) => l.nucleus).flatMap((l) => l.names)]);
  const photons = outgoing.filter((l) => !l.nucleus);
  radiate(scene, { at, u: unitAt(photons.length > 1 ? 20 : 5), id }, R, photons, look);
  textToward(scene, nucleus.label, look.size, { x: 0, y: R * 1.3 + 4 }, { x: 0, y: 1 }, look.labelGap);
}

/**
 * An elastic scattering, as direct-detection papers draw it: what comes in meets the nucleus from
 * the left and leaves deflected up and to the right, and the nucleus recoils down and to the right
 * on a short thick arrow. With `signal: on`, what a detector sees too: a few photons of scintillation
 * light (wavy) and the electrons of ionisation (small dots).
 */
function drawRecoil(scene: Scene, d: Diagram, incoming: Leg[], outgoing: Leg[], look: Sizes): void {
  const target = [...incoming].filter((l) => l.nucleus).sort((a, b) => b.radius - a.radius)[0];
  const projectile = incoming.find((l) => l !== target)!, leaving = outgoing.find((l) => l.key === projectile.key) ?? outgoing[0];
  const R = target.radius, theme = look.theme;
  // (the nucleus recoils down and to the right, as momentum has it, ringed as a moving source is)
  const recoil = unitAt(-40);
  const centre = recoilingAt(scene, { x: 0, y: 0 }, recoil, target.nucleus!.A, target.nucleus!.Z, R, [...target.names, ...outgoing.filter((l) => l.key === target.key).flatMap((l) => l.names)]);
  const boxes = new Map([projectile, leaving].map((leg) => [leg.label, layoutLabel(leg.label, look.size, 1)]));
  const geometry: Geometry = { start: R + look.gap, gap: look.gap, labelGap: look.labelGap, boxes };
  const length = look.length * 1.1;
  // (in from the left, out at 35 degrees above the way it came)
  for (const [leg, degrees, into] of [[projectile, 180, true], [leaving, 35, false]] as [Leg, number, boolean][]) {
    const u = unitAt(degrees), near = scaled(u, R + look.gap), far = scaled(u, R + look.gap + length);
    const [from, to] = into ? [far, near] : [near, far];
    const { centre: at, box } = legPlace(leg, u, length, geometry);
    const id = leg.nucleus ? nucleusAt(scene, at, leg.nucleus.A, leg.nucleus.Z, leg.radius, leg.names) : scene.target(leg.names, far, 3);
    scene.edges.push(`<g class="feynjs-reaction-arrow" data-line="${leg.line}">${arrowLine(from, to, leg.line, look.stroke, theme)}</g>`);
    lineAt(scene, from, to, [id, centre]);
    textAt(scene, boxes.get(leg.label)!, box.x, box.baseline);
  }
  // (named under where it went)
  const moved = along({ x: 0, y: 0 }, recoil, R * 0.64);
  textToward(scene, target.label, look.size, along(moved, { x: 0, y: 1 }, R), { x: 0, y: 1 }, look.labelGap);
  if (!/^(on|yes|true)$/i.test((d.directives.signal ?? "").trim())) return;
  // (scintillation: three small photons up and to the left; ionisation: three electrons down and to the left)
  const small = look.length * 0.42;
  // (clear of the streaks behind the recoil)
  for (const degrees of [100, 125, 150]) {
    const u = unitAt(degrees), a = scaled(u, R * 1.6 + look.gap), b = scaled(u, R * 1.6 + look.gap + small);
    scene.edges.push(`<g class="feynjs-signal" data-line="wave">${arrowLine(a, b, "wave", look.stroke * 0.8, { ...theme, line: { ...theme.line, waveAmplitude: theme.line.waveAmplitude * 0.6, waveLength: theme.line.waveLength * 0.6 } })}</g>`);
    lineAt(scene, a, b);
  }
  scene.target(["light", "scintillation"], scaled(unitAt(125), R * 1.6 + look.gap + small), 3);
  const dots = [200, 216, 232].map((degrees) => scaled(unitAt(degrees), R * 1.35 + look.gap + small * 0.5));
  scene.edges.push(`<g class="feynjs-signal" data-mark="electron" fill="currentColor">${dots.map((p) => `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(look.stroke * 1.5)}"/>`).join("")}</g>`);
  dots.forEach((p) => scene.bounds.include(p.x - 2, p.y + 2));
  scene.target(["charge", "ionisation", "ionization"], dots[1], 3);
  textToward(scene, "e^-", look.size * 0.8, dots[0], { x: -1, y: 0 }, look.labelGap);
}

/** The sizes a leg's place is worked out from: where its arrow starts, the gaps, and each name's box. */
interface Geometry { start: number; gap: number; labelGap: number; boxes: Map<string, LabelBox> }

/**
 * Where a leg's nucleus sits, a gap past its arrow's end, and its name: level with it on the outer
 * side (left of what comes in, right of what goes out), clear of every arrow; a particle's name
 * just past the end of its line.
 */
function legPlace(leg: Leg, u: Pt, length: number, g: Geometry): { centre: Pt; box: { x: number; baseline: number; top: number; bottom: number; width: number } } {
  const end = g.start + length;
  const centre = leg.nucleus ? scaled(u, end + g.gap + leg.radius) : scaled(u, end);
  const label = g.boxes.get(leg.label)!, side = u.x < 0 ? -1 : 1;
  const edge = centre.x + side * (leg.radius + g.labelGap);
  const x = side < 0 ? edge - label.width : edge;
  // (its middle level with the nucleus's, or the line's end)
  const baseline = centre.y + (label.ascent - label.descent) / 2;
  return { centre, box: { x, baseline, top: baseline - label.ascent, bottom: baseline + label.descent, width: label.width } };
}

/** The angles of `n` legs fanned about 0 (in degrees, the first on top), `step` apart. */
function fanAngles(n: number, step: number): number[] {
  return Array.from({ length: n }, (_, k) => ((n - 1) / 2 - k) * step);
}

/**
 * How long every arrow is: `shortest`, or as much longer as neighbours on one side need to clear
 * each other, nucleus and name (a nucleus sits beyond its arrow's end, so a longer arrow fans
 * them wider).
 */
function arrowLength(g: Geometry, sides: [Leg[], number[]][], shortest: number): number {
  const margin = g.labelGap * 1.5;
  // (what a leg takes up: its nucleus, a disc, and its name, a box)
  const taken = (leg: Leg, degrees: number, length: number) => {
    const { centre, box } = legPlace(leg, unitAt(degrees), length, g);
    return { centre, radius: leg.radius, box: { left: box.x, right: box.x + box.width, top: box.top, bottom: box.bottom } };
  };
  type Box = { left: number; right: number; top: number; bottom: number };
  const boxesMeet = (a: Box, b: Box) => a.left < b.right + margin && b.left < a.right + margin && a.top < b.bottom + margin && b.top < a.bottom + margin;
  const discMeetsBox = (c: Pt, r: number, b: Box) => r > 0 && portable.hypot(c.x - Math.max(b.left, Math.min(c.x, b.right)), c.y - Math.max(b.top, Math.min(c.y, b.bottom))) < r + margin;
  const clear = (length: number) => sides.every(([legs, angles]) => legs.every((leg, k) => {
    if (k === 0) return true;
    const a = taken(legs[k - 1], angles[k - 1], length), b = taken(leg, angles[k], length);
    const discs = a.radius > 0 && b.radius > 0 && portable.hypot(a.centre.x - b.centre.x, a.centre.y - b.centre.y) < a.radius + b.radius + margin;
    return !discs && !boxesMeet(a.box, b.box) && !discMeetsBox(a.centre, a.radius, b.box) && !discMeetsBox(b.centre, b.radius, a.box);
  }));
  let length = shortest;
  while (!clear(length) && length < shortest * 8) length += 2;
  return length;
}

/**
 * An arrow from `from` to `to`, slim, its head a neat dart at `to`; a wavy (or curly, or dashed)
 * one stops short of its head, so the head points true.
 */
export function arrowLine(from: Pt, to: Pt, line: EdgeStyle["line"], stroke: number, theme: Theme): string {
  const length = portable.hypot(to.x - from.x, to.y - from.y) || 1, u = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  const head = Math.min(stroke * 6.2, Math.max(4.5, stroke * 3.2)), half = head * 0.42;
  // (the line ends inside the head, at its notch, so its round end never shows past the point)
  const stop = along(to, u, -head * 0.7);
  const look = { ...theme.line, stroke };
  const shaft = line === "plain" ? `<path d="M${fmt(from.x)} ${fmt(from.y)}L${fmt(stop.x)} ${fmt(stop.y)}" fill="none" stroke="currentColor" stroke-width="${fmt(stroke)}" stroke-linecap="round"/>`
    : drawLine(Curve.line(from, along(to, u, -head)), { line, arrow: 0 }, look)
      + `<path d="M${pt(along(to, u, -head))}L${pt(stop)}" fill="none" stroke="currentColor" stroke-width="${fmt(stroke)}"/>`;
  return shaft + dart(to, u, head, half);
}

const pt = (p: Pt) => `${fmt(p.x)} ${fmt(p.y)}`;

/** A dart's head with its point at `tip`, facing `u`: sides drawn in a little, and a notch at the back. */
function dart(tip: Pt, u: Pt, length: number, half: number): string {
  const n = { x: -u.y, y: u.x };
  const at = (back: number, side: number) => `${fmt(tip.x - u.x * back + n.x * side)} ${fmt(tip.y - u.y * back + n.y * side)}`;
  return `<path d="M${at(0, 0)}Q${at(length * 0.55, half * 0.42)} ${at(length, half)}L${at(length * 0.72, 0)}L${at(length, -half)}Q${at(length * 0.55, -half * 0.42)} ${at(0, 0)}Z" fill="currentColor" stroke="none"/>`;
}

/** The burst's colours: a pale halo, an orange outer star edged in a darker amber, a lighter inner star, and a pale core. */
export const BURST = { halo: "#fbe6c3", outer: "#e9973d", edge: "#a35f26", inner: "#f3b964", core: "#fff6dc" };

/** How far out each point reaches, as a share of the burst's radius: uneven, the same every time. */
const REACH = [1, 0.74, 0.9, 0.66, 0.97, 0.79, 0.86, 0.7, 0.95, 0.77, 0.89, 0.68, 0.83];
/** A little turn of each point off its even place, as a share of half the way to the next. */
const TURNS = [0, 0.24, -0.16, 0.3, -0.26, 0.12, -0.3, 0.18, 0.06, -0.22, 0.28, -0.1, 0.2];

/**
 * The burst in the middle, in four layers: a soft halo; an outer star of thirteen uneven points in
 * orange, thinly edged; a smaller inner star of eleven, lighter, turned against the outer; and a
 * small pale core.
 */
function burstSvg(radius: number, stroke: number): string {
  // (`count` points, each reaching `reach` of r, from the table at `from` on; valleys at `valley` of r)
  const star = (r: number, count: number, from: number, valley: number, turn: number) => {
    const pts: string[] = [];
    for (let k = 0; k < count; k++) {
      const j = (k + from) % REACH.length;
      const a = ((k + turn + TURNS[j] * 0.5) * 2 * Math.PI) / count, b = ((k + turn + 0.5) * 2 * Math.PI) / count;
      const tip = r * REACH[j], dip = r * valley * (0.92 + 0.16 * REACH[(j + 5) % REACH.length]);
      pts.push(`${fmt(tip * portable.cos(a))} ${fmt(-tip * portable.sin(a))}`, `${fmt(dip * portable.cos(b))} ${fmt(-dip * portable.sin(b))}`);
    }
    return `M${pts.join("L")}Z`;
  };
  return `<g class="feynjs-burst">`
    + `<circle cx="0" cy="0" r="${fmt(radius * 0.95)}" fill="${BURST.halo}" opacity="0.7"/>`
    + `<path d="${star(radius * 0.9, 13, 0, 0.52, 0.1)}" fill="${BURST.outer}" stroke="${BURST.edge}" stroke-width="${fmt(stroke * 0.3)}" stroke-linejoin="round"/>`
    + `<path d="${star(radius * 0.52, 11, 4, 0.56, 0.45)}" fill="${BURST.inner}" stroke="none"/>`
    + `<circle cx="0" cy="0" r="${fmt(radius * 0.22)}" fill="${BURST.core}"/></g>`;
}

// ---- what the nuclear views put into the scene, and the frame round it

const nucleonColours = (theme: Theme) => { const v = theme.vertex; return { proton: v.proton, neutron: v.neutron, edge: v.nucleonEdge, protonEdge: v.protonEdge, neutronEdge: v.neutronEdge }; };

/** A nucleus at `p`, its nucleons in the theme's colours; known by `names` to notes. Returns its id. */
export function nucleusAt(scene: Scene, p: Pt, A: number, Z: number, radius: number, names: string[]): number {
  scene.edges.push(nucleusSvg(p, A, Z, scene.theme.vertex.nucleusUnit, nucleonColours(scene.theme)));
  scene.bounds.include(p.x - radius, p.y - radius); scene.bounds.include(p.x + radius, p.y + radius);
  scene.addObstaclePoint(p, radius);
  return scene.target([...names, `${A}/${Z}`], p, radius);
}

/** A nucleus hit at `p`, recoiling toward `dir`: drawn moved on, inside the rings of its motion (see recoilSvg); known to notes where it is drawn. Returns its id. */
function recoilingAt(scene: Scene, p: Pt, dir: Pt, A: number, Z: number, radius: number, names: string[]): number {
  const colours = nucleonColours(scene.theme), unit = scene.theme.vertex.nucleusUnit;
  scene.edges.push(recoilSvg(p, dir, radius, (at) => nucleusSvg(at, A, Z, unit, colours), scene.theme.line.stroke));
  const moved = recoiledTo(p, dir, radius);
  for (const q of [p, moved]) { scene.bounds.include(q.x - radius, q.y - radius); scene.bounds.include(q.x + radius, q.y + radius); scene.addObstaclePoint(q, radius); }
  for (const ring of recoilRings(moved, dir, radius)) { scene.bounds.include(ring.c.x - ring.r, ring.c.y - ring.r); scene.bounds.include(ring.c.x + ring.r, ring.c.y + ring.r); }
  return scene.target([...names, `${A}/${Z}`, "recoil"], moved, radius);
}

/** A nucleus's energy round `p`, behind everything: a still glow and faint rings (see energyGlow). */
function glowAt(scene: Scene, p: Pt, radius: number, written: string): void {
  const { svg, reach } = energyGlow(p, radius, energyColour(written), energyLevel(written), scene.theme.line.stroke);
  scene.edges.unshift(svg);
  scene.bounds.include(p.x - reach, p.y - reach); scene.bounds.include(p.x + reach, p.y + reach);
}

/** An arrow (or any line) drawn already, from `a` to `b`: kept clear by notes, and pointed at between the two it joins. */
export function lineAt(scene: Scene, a: Pt, b: Pt, ends?: [number, number]): void {
  scene.addObstacleCurve(Curve.line(a, b), scene.theme.line.stroke);
  scene.bounds.include(a.x, a.y); scene.bounds.include(b.x, b.y);
  if (ends) scene.target([], { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 2, ends);
}

/** A label set at `x`, its baseline at `baseline`. */
function textAt(scene: Scene, box: LabelBox, x: number, baseline: number): void {
  scene.labels.push(`<g transform="translate(${fmt(x)} ${fmt(baseline)})" fill="currentColor">${box.svg}</g>`);
  scene.addLabelBox({ left: x, top: baseline - box.ascent, right: x + box.width, bottom: baseline + box.descent });
  scene.bounds.include(x, baseline - box.ascent); scene.bounds.include(x + box.width, baseline + box.descent);
}

/** A label beside `p`, set off toward `u` by its own half size and `gap`, so it clears what it names. */
export function textToward(scene: Scene, tex: string, size: number, p: Pt, u: Pt, gap: number): void {
  const box = layoutLabel(tex, size, 1);
  const x = p.x + u.x * (gap + box.width / 2) - box.width / 2;
  const baseline = p.y + u.y * (gap + (box.ascent + box.descent) / 2) + (box.ascent - box.descent) / 2;
  textAt(scene, box, x, baseline);
}

/**
 * The finished view: its notes (`note:` lines) placed where it leaves room, clear of every nucleus,
 * line and label, then the frame round all of it (as wide either side of x = 0 with `even`), with
 * the name, description, title and data a diagram's frame carries.
 */
export function viewSvg(scene: Scene, d: Diagram, cls: string, label: string, middle: Pt, even: boolean, options: RenderOptions): string {
  if (d.directives.note) { scene.core = middle; drawViewNotes(scene, d.directives.note, (target) => scene.findTarget(target)); }
  const b = scene.bounds, theme = scene.theme;
  if (!Number.isFinite(b.left)) b.include(0, 0);
  const across = Math.max(-b.left, b.right), [left, right] = even ? [-across, across] : [b.left, b.right];
  const pad = theme.padding;
  const description = (() => { try { return explainParsed(d); } catch { return ""; } })();
  return svgDocument({ cls, label, title: d.directives.title, description, model: options.model ? diagramModel(d, scene) : "", box: { left: left - pad, top: b.top - pad, width: right - left + 2 * pad, height: b.bottom - b.top + 2 * pad }, scale: theme.drawingScale, idPrefix: scene.idPrefix, theme, body: scene.edges.join("") + scene.labels.join("") });
}

/** The way out from the middle at `degrees` (anticlockwise from the right; y runs down). */
export function unitAt(degrees: number): Pt {
  const a = (degrees * Math.PI) / 180;
  return { x: portable.cos(a), y: -portable.sin(a) };
}

export const scaled = (u: Pt, r: number): Pt => ({ x: u.x * r, y: u.y * r });
export const along = (p: Pt, u: Pt, r: number): Pt => ({ x: p.x + u.x * r, y: p.y + u.y * r });
