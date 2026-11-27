import { Curve, fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import type { ObjectContent, EdgeStyle } from "../model.ts";
import type { LineLook } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/** A wave of sin(sin x), scaled back to the full amplitude: fuller crests and steeper crossings
 * than a plain sine. A whole number of periods, so both ends meet the vertex on-axis. */
function wavePoints(c: Curve, look: LineLook): Pt[] {
  const n = Math.max(1, Math.round(c.length / look.waveLength));
  const steps = n * 16;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(c.offset(t * c.length, -look.waveAmplitude * portable.sin(portable.sin(2 * Math.PI * n * t)) / portable.sin(1)));
  }
  return pts;
}

/** Coil with a whole number of loops; starts and ends on the axis with no straight tail. */
function coilPoints(c: Curve, look: LineLook): Pt[] {
  const R = look.coilRadius, k = look.coilAspect * R;
  const usable = c.length - 2 * k;
  const n = Math.max(1, Math.round(usable / look.coilPitch));
  const pitch = usable / n;
  // half-loop lead-in and lead-out: theta runs from -pi to 2*pi*n (ends where it began, on axis)
  const t0 = -Math.PI, t1 = 2 * Math.PI * n;
  const steps = Math.ceil(((t1 - t0) / (2 * Math.PI)) * 28);
  const pts: Pt[] = [];
  // x(theta) = k + pitch*theta/2pi + k*cos(theta) shifted so x(t0)=0 and x(t1)=length
  const span = (pitch * (t1 - t0)) / (2 * Math.PI) + k * (portable.cos(t1) - portable.cos(t0));
  const scale = c.length / span;
  for (let i = 0; i <= steps; i++) {
    const th = t0 + ((t1 - t0) * i) / steps;
    const x = ((pitch * (th - t0)) / (2 * Math.PI) + k * (portable.cos(th) - portable.cos(t0))) * scale;
    pts.push(c.offset(x, -R * portable.sin(th)));
  }
  return pts;
}

function parallelPoints(c: Curve, off: number): Pt[] {
  if (c.straight) return [c.offset(0, off), c.offset(c.length, off)];
  return c.pts.map((_, i) => c.offset(c.cum[i], off));
}

/**
 * A jet or hadronic remnant: the particle's line, inside a soft cone of colour that
 * fades as it opens, so it reads as a spray of particles around one direction. The cone
 * starts `from` px along the line and opens at `scale` times an ordinary jet's angle.
 */
function jetCone(c: Curve, look: LineLook, o: { from?: number; scale?: number; shade?: number; rim?: "solid" | "dashed"; tracks?: number } = {}): string {
  const from = o.from ?? 0, scale = o.scale ?? 1, shade = o.shade ?? look.jetShade;
  const start = c.at(from), end = c.at(c.length);
  const halfWidth = coneHalfWidth(c.length - from, look, scale);
  const left = c.offset(c.length, -halfWidth), right = c.offset(c.length, halfWidth);
  const bulge = { x: end.x + end.tx * halfWidth * MOUTH_BULGE, y: end.y + end.ty * halfWidth * MOUTH_BULGE };
  // (a jet drawn on its own ends in an open mouth: an ellipse, its far half the cone's end, drawn
  // as true arcs so it stays smooth; in a diagram, one gentle curve)
  const minor = halfWidth * MOUTH_DEPTH, deg = (portable.atan2(-end.tx, end.ty) * 180) / Math.PI;
  const far = { x: end.x + end.tx * minor, y: end.y + end.ty * minor };
  const sweep = (far.x - left.x) * (right.y - far.y) - (far.y - left.y) * (right.x - far.x) > 0 ? 1 : 0;
  const arc = `A${fmt(halfWidth)} ${fmt(minor)} ${fmt(deg)} 0 ${sweep} ${fmt(right.x)} ${fmt(right.y)}`;
  const cone = look.jetMouth
    ? `M${fmt(start.x)} ${fmt(start.y)}L${fmt(left.x)} ${fmt(left.y)}${arc}Z`
    : `M${fmt(start.x)} ${fmt(start.y)}L${fmt(left.x)} ${fmt(left.y)}Q${fmt(bulge.x)} ${fmt(bulge.y)} ${fmt(right.x)} ${fmt(right.y)}Z`;
  const mouth = look.jetMouth ? `<ellipse class="feynjs-jet-mouth" cx="${fmt(end.x)}" cy="${fmt(end.y)}" rx="${fmt(halfWidth)}" ry="${fmt(minor)}" transform="rotate(${fmt(deg)} ${fmt(end.x)} ${fmt(end.y)})" fill="${look.jetColor}" fill-opacity="${fmt(shade * 0.5)}"${o.rim ? ` stroke="${look.jetColor}" stroke-width="${fmt(look.trackWidth)}"` : ""}/>` : "";
  // the gradient runs along the jet; its id is built from what it draws, so equal ids mean equal gradients
  // (and its colour: two cones alike but for their colour must not share one gradient)
  const id = `feynjs-jet-${[start.x, start.y, end.x, end.y, shade * 100].map((n) => Math.round(n)).join("_")}${look.jetColor.replace(/[^0-9a-z]/gi, "").slice(0, 12)}${look.jetMouth ? "m" : ""}`.replace(/-(?=\d)/g, "m");
  const gradient = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(start.x)}" y1="${fmt(start.y)}" x2="${fmt(bulge.x)}" y2="${fmt(bulge.y)}">`
    + `<stop class="feynjs-jet-stop" offset="0" stop-color="${look.jetColor}" stop-opacity="${fmt(shade * (look.jetMouth ? MOUTH_SHADE : 1))}"/>`
    + `<stop class="feynjs-jet-stop" offset="1" stop-color="${look.jetColor}" stop-opacity="${fmt(shade * (look.jetMouth ? MOUTH_SHADE * MOUTH_FADE / 0.5 : look.jetFade))}"/></linearGradient>`;
  const rim = o.rim ? `<path class="feynjs-jet-rim" d="${cone}" fill="none" stroke="${look.jetColor}" stroke-width="${fmt(look.trackWidth)}" stroke-linejoin="round"${o.rim === "dashed" ? ` stroke-dasharray="3 2.5"` : ""}/>` : "";
  return `${gradient}<path class="feynjs-jet" d="${cone}" fill="url(#${id})" stroke="none"/>${o.tracks ? jetTracks(c, from, halfWidth, o.tracks, look) : ""}${rim}${mouth}`;
}

/**
 * The rest of a jet: faint grey tracks fanning out from where the cone starts, each bent a little,
 * under the lines that matter. Their spread and bend are fixed, so a jet draws the same each time.
 */
function jetTracks(c: Curve, from: number, half: number, count: number, look: LineLook): string {
  const SPREAD = [-0.78, 0.62, -0.32, 0.18, 0.86, -0.58, 0.4, -0.08], BEND = [0.42, -0.38, 0.34, -0.44, -0.36, 0.3, -0.4, -0.34];
  const start = c.at(from);
  let d = "";
  for (let k = 0; k < Math.min(count, SPREAD.length); k++) {
    // (the bend kept inside the cone: a track leaves the apex no wider than the cone opens)
    const mid = c.offset(from + (c.length - from) * 0.5, Math.max(-0.45, Math.min(0.45, SPREAD[k] * 0.5 + BEND[k])) * half), end = c.offset(c.length * 0.97, SPREAD[k] * half);
    d += `M${fmt(start.x)} ${fmt(start.y)}Q${fmt(mid.x)} ${fmt(mid.y)} ${fmt(end.x)} ${fmt(end.y)}`;
  }
  return `<path class="feynjs-jet-tracks" d="${d}" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="${fmt(look.trackWidth * 0.7)}" stroke-linecap="round"/>`;
}

/** How far a decay's two tracks run together before bending apart, as a share of the way out: a Υ's stem. */
const UPSILON_STEM = 0.5;

/** A B hadron's decay vertex and flight (blue), and a D's (teal): the tagger's two kinds of displaced vertex. */
const B_COLOUR = "#2f74c0", D_COLOUR = "#00a099";

/** What a particle drawn on its own leaves in the detector: by what it is. */
/**
 * A hadronic tau, drawn on its own: a jet, as the other jets are (a cone with its open mouth, the
 * faint tracks of its particles), narrow, its 1 or 3 charged prongs plain grey tracks bending gently
 * apart. The cone is the jet picture; a detector's signatures are for particles drawn without one.
 */
function tauDetector(c: Curve, look: LineLook, prongs: 1 | 3): string {
  const L = c.length, P = c.at(0), half = coneHalfWidth(L, look, look.narrowJetScale);
  let svg = jetCone(c, look, { scale: look.narrowJetScale, rim: "solid", tracks: 3 });
  for (const [k, bow] of (prongs === 3 ? [[-0.6, 0.06], [0, 0], [0.6, -0.06]] : [[0, 0.04]]) as [number, number][]) {
    const E = c.offset(L * 0.95, k * half), ctrl = { x: (P.x + E.x) / 2 - (E.y - P.y) * bow, y: (P.y + E.y) / 2 + (E.x - P.x) * bow };
    svg += `<path class="feynjs-prong" d="M${fmt(P.x)} ${fmt(P.y)}Q${fmt(ctrl.x)} ${fmt(ctrl.y)} ${fmt(E.x)} ${fmt(E.y)}" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="${fmt(look.trackWidth * 1.3)}" stroke-linecap="round"/>`;
  }
  return svg;
}

/** A jet inside a detector object, or the object itself, where a note may point: its kind (bjet), middle and decay vertices. */
export interface ObjectPart { kind: string; middle: Pt; B?: Pt; D?: Pt; d0?: Pt; z0?: Pt }

/** How steeply depth (into the page) is drawn, degrees above level: an isometric view's slant. */
const DEPTH_SLANT = 35;

/** The impact parameters' colour: a magenta, apart from the jet's blue, the decays' blue and teal, and the notes' red. */
export const IMPACT_COLOUR = "#c0509a";

/**
 * A jet's impact parameters, as flavour-tagging figures draw them: the beam (dashed, level) through
 * where the jet starts, `P`; z0 along it from `P`, and d0 from there up into the page, how far
 * one of the jet's tracks, traced back, misses `P`. `c` runs from the vertex out; `beamReach`
 * is how far the beam runs either side.
 */
export function impactParameters(c: Curve, object: string | undefined, look: LineLook, beamReach: number): { svg: string; labels: { tex: string; at: Pt; direction: Pt }[]; d0: Pt; z0: Pt; segments: [Pt, Pt][] } {
  const P = c.at(0), w = look.trackWidth;
  const stroke = (pts: Pt[], o: { dash?: string; width?: number; colour?: string } = {}) =>
    `<path d="${pathFrom(pts)}" fill="none" stroke="${o.colour ?? IMPACT_COLOUR}" stroke-width="${fmt(o.width ?? w)}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  // (a short two-headed arrow between two points)
  const span = (a: Pt, b: Pt) => {
    const dx = b.x - a.x, dy = b.y - a.y, n = portable.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, h = w * 3.2, s = w * 1.8;
    const head = (p: Pt, sx: number, sy: number) => `M${fmt(p.x + sx * h - uy * s)} ${fmt(p.y + sy * h + ux * s)}L${fmt(p.x)} ${fmt(p.y)}L${fmt(p.x + sx * h + uy * s)} ${fmt(p.y + sy * h - ux * s)}`;
    return stroke([a, b], { width: w * 0.9 }) + `<path d="${head(a, ux, uy)}${head(b, -ux, -uy)}" fill="none" stroke="${IMPACT_COLOUR}" stroke-width="${fmt(w * 0.9)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  let svg = `<path class="feynjs-beam" d="M${fmt(P.x - beamReach)} ${fmt(P.y)}H${fmt(P.x + beamReach)}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="${fmt(w * 1.2)}" stroke-dasharray="5 4"/>`;
  const labels: { tex: string; at: Pt; direction: Pt }[] = [];
  let d0: Pt = P, z0: Pt = P;
  const segments: [Pt, Pt][] = [];
  // (z0 along the beam from P, d0 up from there into the page, drawn slanting as depth is in an
  // isometric view)
  const z = beamReach * 0.42, depth = beamReach * 0.3, slant = (DEPTH_SLANT * Math.PI) / 180;
  // (to the right of P: notes usually sit to the left, and the jet leans right, over them)
  const Q = { x: P.x + z, y: P.y }, A = { x: Q.x + depth * portable.cos(slant), y: Q.y - depth * portable.sin(slant) };
  const below = w * 5;
  // (the track is one of the jet's own: only the two distances are drawn, z0 along the beam and d0 into the page)
  svg += span({ x: P.x, y: P.y + below }, { x: Q.x, y: Q.y + below }) + span(Q, A);
  labels.push({ tex: "z_0", at: { x: (P.x + Q.x) / 2, y: P.y + below }, direction: { x: 0, y: 1 } });
  labels.push({ tex: "d_0", at: { x: (Q.x + A.x) / 2, y: (Q.y + A.y) / 2 }, direction: { x: -portable.sin(slant), y: -portable.cos(slant) } });
  segments.push([{ x: P.x, y: P.y + below }, { x: Q.x, y: Q.y + below }], [Q, A]);
  d0 = { x: (Q.x + A.x) / 2, y: (Q.y + A.y) / 2 };
  z0 = { x: (P.x + Q.x) / 2, y: P.y + below };
  return { svg, labels, d0, z0, segments };
}

/** Where a b-jet's B and D hadrons decay, or a c-jet's D: along `c`, from the vertex out. */
export function flavourVertices(c: Curve, object: string | undefined, look: LineLook, scale = 1): { B?: Pt; D?: Pt } {
  const L = c.length, half = coneHalfWidth(L, look, scale);
  if (object === "btag") return { B: c.offset(L * 0.36, half * 0.14), D: c.offset(L * 0.6, half * 0.34) };
  if (object === "ctag") return { D: c.offset(L * 0.4, half * 0.18) };
  return {};
}

/** Where a detector object's cone reaches, for the drawing's bounds: its mouth's two corners and its bulge. */
export function coneReach(c: Curve, style: EdgeStyle, look: LineLook): Pt[] {
  const o = style.object;
  const scale = o === "large" ? look.largeJetScale : o === "top" ? look.largeJetScale * 1.1 : o === "semivisible" || o === "emerging" ? 1.9 : o === "displaced" ? 1.5 : o === "tau" || o === "leptonjet" ? look.narrowJetScale : 1;
  const half = coneHalfWidth(c.length, look, scale), end = c.at(c.length);
  return [c.offset(c.length, -half), c.offset(c.length, half), { x: end.x + end.tx * half * MOUTH_BULGE, y: end.y + end.ty * half * MOUTH_BULGE }];
}

/** How far a cone's mouth bulges past its end, as a share of its half-width: one smooth curve. */
const MOUTH_BULGE = 0.6;
/** How much of its colour a lone jet keeps out to its mouth: a solid cone, not a fading spray. */
const MOUTH_FADE = 0.3;
/** How solid a lone jet is where it starts: lighter than a jet in a diagram, so the cone stays see-through. */
const MOUTH_SHADE = 0.5;
/** How deep a lone jet's open mouth looks, as a share of its width: the ellipse a cone seen from the side ends in. */
const MOUTH_DEPTH = 0.3;

/** How far a jet cone of the given length opens either side of its line, px. */
function coneHalfWidth(length: number, look: LineLook, scale = 1): number {
  return Math.min(look.jetMaxHalfWidth * scale, length * portable.tan((look.jetHalfAngle * scale * Math.PI) / 180));
}

/**
 * A detector object at the end of a leg, for semi-Feynman diagrams. `c` runs from the vertex
 * out to the end of the leg. Tracks are thin lines; what is not seen (a dark quark, invisible
 * dark hadrons, missing energy) is dashed or dotted.
 */
function detectorObject(c: Curve, style: EdgeStyle, look: LineLook, sw: number, parts?: ObjectPart[]): string {
  const L = c.length, tw = look.trackWidth;
  const line = (pts: Pt[], o: { width?: number; dash?: string; colour?: string } = {}) =>
    `<path d="${pathFrom(pts)}" fill="none" stroke="${o.colour ?? "currentColor"}" stroke-width="${fmt(o.width ?? sw)}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  // a straight track from s0 along the line, ending `spread` of the cone's half-width to one side
  const track = (s0: number, spread: number, half: number, o: { width?: number; dash?: string; s1?: number } = {}) =>
    line([c.offset(s0, 0), c.offset(o.s1 ?? L, spread * half)], { width: o.width ?? tw, dash: o.dash });
  // (a heavy-flavour decay vertex: an open ring, its border coloured by the hadron, a B blue, a D teal)
  const ring = (p: Pt, hadron: "B" | "D", r = tw * 2.5) => `<circle class="feynjs-sv-${hadron === "B" ? "b" : "c"}" cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(r)}" fill="var(--feynjs-bg, #fff)" stroke="${hadron === "B" ? B_COLOUR : D_COLOUR}" stroke-width="${fmt(tw * 1.3)}"/>`;
  const flight = (a: Pt, b: Pt, hadron: "B" | "D") => line([a, b], { width: tw * 1.6, dash: "2.6 2.2", colour: hadron === "B" ? B_COLOUR : D_COLOUR });
  // (two charged tracks of opposite charge from a vertex `v` to `e1` and `e2`: both leave along
  // the line between them, then bend apart, each its own way, a Υ)
  const pair = (v: Pt, e1: Pt, e2: Pt, colour: string) => {
    const mid = { x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2 };
    const ctrl = { x: v.x + (mid.x - v.x) * UPSILON_STEM, y: v.y + (mid.y - v.y) * UPSILON_STEM };
    return [e1, e2].map((e) => `<path d="M${fmt(v.x)} ${fmt(v.y)}Q${fmt(ctrl.x)} ${fmt(ctrl.y)} ${fmt(e.x)} ${fmt(e.y)}" fill="none" stroke="${colour}" stroke-width="${fmt(tw * 1.6)}" stroke-linecap="round"/>`).join("");
  };
  // (a b- or c-jet, at any size: its cone and tracks, the B's flight and decay then the D's, or the D's alone)
  const heavy = (j: Curve, object: "btag" | "ctag", scale: number, tracks: number, r = tw * 2.5, colour?: string) => {
    const J = j.length, half = coneHalfWidth(J, look, scale), v = flavourVertices(j, object, look, scale), D = v.D!;
    let out = jetCone(j, colour ? { ...look, jetColor: colour } : look, { scale, tracks, rim: "solid" });
    // (what each decays to: two charged tracks of opposite charge, a vertex's least, leaving together
    // and bending apart in the field, a Υ: at the B, beside the D it makes flying on (B → D π π);
    // at the D, its kaon and pion (D → K π))
    out += v.B ? flight(j.at(0), v.B, "B") + flight(v.B, D, "D") + pair(v.B, j.offset(J * 0.97, -0.8 * half), j.offset(J * 0.97, -0.15 * half), B_COLOUR) : flight(j.at(0), D, "D");
    out += pair(D, j.offset(J * 0.97, (v.B ? 0.3 : 0.1) * half), j.offset(J * 0.97, 0.9 * half), D_COLOUR);
    return out + (v.B ? ring(v.B, "B", r) : "") + ring(D, "D", r);
  };
  const dot = (p: Pt, r: number, fill = "currentColor") => `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(r)}" fill="${fill}" stroke="currentColor" stroke-width="${fmt(tw)}"/>`;
  // (displaced: the object begins at a displaced vertex, after a dotted flight)
  if (style.adjectives?.includes("displaced") && style.object !== "displaced" && style.object !== "displacedlepton") {
    const at = L * 0.3, rest = Curve.line(c.at(at), c.at(L));
    return line([c.at(0), c.at(at)], { width: sw, dash: `0 ${fmt(look.dotGap)}` })
      + detectorObject(rest, { ...style, adjectives: style.adjectives.filter((a) => a !== "displaced") }, look, sw) + dot(c.at(at), sw * 1.4, "var(--feynjs-bg, #fff)");
  }
  // (what is drawn inside an object, `[LRJ 1b W(2j)]`: its contents fanned out across the cone
  // from a split a little way in: jets with cones of their own, a b-tagged jet with its secondary
  // vertex, leptons and quarks as lines, photons dashed, neutrinos dotted; a particle that decays
  // inside it, a W, as a short wave that fans into what it decays to)
  if (style.contents?.length && style.object !== "met" && style.object !== "track") {
    const wide = style.object === "large" || style.object === "top";
    const scale = wide ? look.largeJetScale * (style.object === "top" ? 1.1 : 1) : 1.5;
    // (a W, Z, Higgs or top decays almost where it is made: what it holds starts near the apex)
    const half = coneHalfWidth(L, look, scale), split = L * 0.12;
    type Item = { kind: string; contents?: ObjectContent[] };
    const flat = (list: ObjectContent[]): Item[] => list.flatMap(({ kind, count, contents }) => Array.from({ length: count }, () => ({ kind, contents })));
    const smallWave = { ...look, waveAmplitude: look.waveAmplitude * 0.55, waveLength: look.waveLength * 0.6 };
    const drawItem = (sub: Curve, item: Item, room: number, many: boolean): string => {
      const ends = line([sub.at(0), sub.at(sub.length)]);
      if (item.contents?.length) {
        // (what it decays to starts early and fans wide, so b-jets inside are big enough to read)
        const knee = sub.at(sub.length * 0.1);
        const kids = flat(item.contents);
        let out = drawLine(Curve.line(sub.at(0), knee), { line: "wave", arrow: 0 }, smallWave);
        kids.forEach((kid, i) => {
          // (toward the middle of the cone rather than out past its edge)
          const off = kids.length === 1 ? 0 : -1 + (2 * i) / (kids.length - 1);
          out += drawItem(Curve.line(knee, sub.offset(sub.length, off * room * 1.6)), kid, room * 0.4, true);
        });
        return out;
      }
      const cone = (k: number) => jetCone(sub, look, { scale: k });
      const k = many ? 0.75 : 1;
      if (item.kind === "jet") { parts?.push({ kind: "lightjet", middle: sub.at(sub.length * 0.6) }); return jetCone(sub, { ...look, jetColor: look.lightJetColor }, { scale: k, tracks: 3, rim: "solid" }); }
      if (item.kind === "bjet" || item.kind === "cjet") {
        const object = item.kind === "bjet" ? "btag" : "ctag";
        parts?.push({ kind: item.kind, middle: sub.at(sub.length * 0.6), ...flavourVertices(sub, object, look, Math.max(k, 1.1)) });
        return heavy(sub, object, Math.max(k, 1.1), 3, tw * 1.9, object === "btag" ? look.bJetColor : look.cJetColor);
      }
      if (item.kind === "photon") return line([sub.at(0), sub.at(sub.length)], { width: tw, dash: "3 2" });
      if (item.kind === "neutrino") return line([sub.at(0), sub.at(sub.length)], { width: tw * 1.2, dash: `0 ${fmt(look.dotGap)}` });
      return line([sub.at(0), sub.at(sub.length)], { width: tw * 1.4 });
    };
    const items = flat(style.contents);
    let out = jetCone(c, wide ? { ...look, jetColor: look.largeJetColor } : look, { scale, shade: look.jetShade * 0.55, rim: wide ? "solid" : undefined }) + line([c.at(0), c.at(split)]);
    items.forEach((item, k) => {
      const side = items.length === 1 ? 0 : -0.7 + (1.4 * k) / (items.length - 1);
      // (what a W inside decays to keeps within the cone: its fan narrows toward the cone's edge)
      const room = half * Math.min(0.3, Math.max(0.12, (1 - Math.abs(side)) * 0.45));
      out += drawItem(Curve.line(c.at(split), c.offset(L, side * half)), item, room, items.length > 2);
    });
    return out;
  }
  switch (style.object) {
    case "remnant": {
      // a proton that broke up (p*): a gluon flanked by two lines, fanned out of one point
      // (the gluon tightly coiled, small loops close together, so it sits between the two lines)
      const tight = { ...look, coilRadius: look.coilRadius * 0.45, coilPitch: look.coilPitch * 0.4 };
      // (tight: the fragments of one proton go on together, narrowly)
      const half = Math.max(coneHalfWidth(L, look, 1.1), tight.coilRadius * 2.2);
      let out = "";
      for (const k of [-1, 0, 1]) {
        const sub = Curve.line(c.at(0), c.offset(L, k * half));
        out += k === 0 ? drawLine(sub, { line: "coil", arrow: 0 }, tight) : line([sub.at(0), sub.at(sub.length)]);
      }
      return out;
    }
    case "track": {
      // a charged track: a thin straight line
      return line(c.straight ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts, { width: sw * 0.8 });
    }
    case "large": {
      // a wide cone; the particle inside splits into two subjets, each a jet of its own
      const half = coneHalfWidth(L, look, look.largeJetScale), split = L * 0.18;
      let out = jetCone(c, { ...look, jetColor: look.largeJetColor }, { scale: look.largeJetScale, shade: look.jetShade * 0.55, rim: "solid", tracks: 7 }) + line([c.at(0), c.at(split)], { width: tw });
      for (const side of [-0.55, 0.55]) {
        const sub = Curve.line(c.at(split), c.offset(L, side * half));
        out += jetCone(sub, look, { scale: 0.8, tracks: 4 });
      }
      return out;
    }
    case "top": {
      // a top-tagged large-R jet: the top splits into three subjets (b and the W's two quarks)
      const half = coneHalfWidth(L, look, look.largeJetScale * 1.1), split = L * 0.18;
      let out = jetCone(c, { ...look, jetColor: look.largeJetColor }, { scale: look.largeJetScale * 1.1, shade: look.jetShade * 0.55, rim: "solid", tracks: 7 }) + line([c.at(0), c.at(split)], { width: tw });
      for (const side of [-0.62, 0, 0.62]) {
        const sub = Curve.line(c.at(split), c.offset(L, side * half));
        out += jetCone(sub, look, { scale: 0.65, tracks: 3 });
      }
      return out;
    }
    // a b-jet: the B hadron flies (dashed) to a secondary vertex and decays, a track leaving it;
    // the D it makes flies on to a tertiary vertex and decays to two more tracks; a c-jet: the D
    // flies to one displaced vertex, two tracks leaving it
    case "btag": return heavy(c, "btag", 1, 5);
    case "ctag": return heavy(c, "ctag", 1, 5);
    case "disappearing": {
      // a track that stops: the charged particle decays to something too soft to see
      const end = L * 0.62, p = c.at(end), w = look.arrowWidth * 0.6;
      return line([c.at(0), p], { width: sw * 1.3 })
        + line([{ x: p.x - p.ty * w, y: p.y + p.tx * w }, { x: p.x + p.ty * w, y: p.y - p.tx * w }], { width: sw * 1.3 })
        + line([p, c.at(L)], { width: tw, dash: `0 ${fmt(look.dotGap)}` });
    }
    case "displacedlepton": {
      // a long-lived particle's flight (dotted) to a displaced vertex, then the lepton
      const at = L * 0.4;
      return line([c.at(0), c.at(at)], { width: sw, dash: `0 ${fmt(look.dotGap)}` }) + line([c.at(at), c.at(L)]) + dot(c.at(at), sw * 1.4, "var(--feynjs-bg, #fff)");
    }
    case "heavycharged": {
      // a heavy, slow, highly ionising track: drawn thick
      return line(c.straight ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts, { width: look.heavy * 1.25 });
    }
    case "tau": {
      // (on its own: a narrow jet with its open mouth, its 1 or 3 prongs grey tracks)
      if (look.jetMouth) return tauDetector(c, look, style.prongs ?? 1);
      // a narrow cone of three prongs
      const half = coneHalfWidth(L, look, look.narrowJetScale);
      return jetCone(c, look, { scale: look.narrowJetScale }) + [-0.6, 0, 0.6].map((k) => track(L * 0.18, k, half)).join("") + line([c.at(0), c.at(L * 0.18)]);
    }
    case "leptonjet": {
      // a very narrow cone holding two collimated leptons
      const half = coneHalfWidth(L, look, look.narrowJetScale * 0.8);
      return jetCone(c, look, { scale: look.narrowJetScale * 0.8, shade: look.jetShade * 0.7 }) + [-0.55, 0.55].map((k) => track(L * 0.3, k, half, { width: sw * 0.8 })).join("") + line([c.at(0), c.at(L * 0.3)]);
    }
    case "semivisible": {
      // a dark shower: some of it decays to visible tracks (solid), some stays invisible (dashed)
      const half = coneHalfWidth(L, look, 1.9);
      return jetCone(c, look, { scale: 1.9, shade: look.jetShade * 0.6, rim: "dashed" })
        + [0.15, 0.5, 0.85].map((k) => track(0, k, half)).join("")
        + [-0.35, -0.75].map((k) => track(0, k, half, { dash: "2.5 2" })).join("")
        + line([c.at(0), c.at(L * 0.25)]);
    }
    case "emerging": {
      // a dark quark flies on unseen (dashed); its dark hadrons decay further out, so the
      // tracks emerge at displaced points, each marked by a small vertex
      const half = coneHalfWidth(L, look, 1.9);
      let out = jetCone(c, look, { scale: 1.9, shade: look.jetShade * 0.45 }) + line([c.at(0), c.at(L)], { width: tw, dash: "3 2.5" });
      for (const [s0, k] of [[0.38, -0.55], [0.5, 0.35], [0.6, -0.15], [0.7, 0.8], [0.8, 0.05]] as const) {
        const from = c.offset(L * s0, k * half * s0 * 0.6);
        out += line([from, c.offset(L, k * half)], { width: tw }) + dot(from, tw * 1.1);
      }
      return out;
    }
    case "displaced": {
      // a long-lived particle's flight (dotted) to a displaced vertex, where a jet begins
      const at = L * 0.3;
      return line([c.at(0), c.at(at)], { width: sw, dash: `0 ${fmt(look.dotGap)}` }) + jetCone(c, look, { from: at, scale: 1.5, tracks: 6, rim: "solid" }) + dot(c.at(at), sw * 1.4, "var(--feynjs-bg, #fff)");
    }
    case "met": {
      // missing energy: a dotted arrow out of the diagram
      const tip = c.at(L), back = c.at(L - look.arrowLength), w = look.arrowWidth / 2;
      const head = pathFrom([tip, { x: back.x - back.ty * w, y: back.y + back.tx * w }, { x: back.x + back.ty * w, y: back.y - back.tx * w }], true);
      return line([c.at(0), back], { dash: `0 ${fmt(look.dotGap)}`, width: sw * 1.4 }) + `<path d="${head}" fill="currentColor"/>`;
    }
    default:
      // (the cone and its tracks are the jet: no line through it)
      return jetCone(c, look, { tracks: 6, rim: "solid" });
  }
}

function arrowHead(c: Curve, s: number, dir: 1 | -1, look: LineLook): string {
  const L = look.arrowLength, W = look.arrowWidth / 2;
  const p = c.at(s);
  const tx = p.tx * dir, ty = p.ty * dir;
  const tip = { x: p.x + tx * L * 0.5, y: p.y + ty * L * 0.5 };
  const bx = p.x - tx * L * 0.5, by = p.y - ty * L * 0.5;
  const notch = { x: p.x - tx * L * 0.28, y: p.y - ty * L * 0.28 };
  const d = pathFrom([tip, { x: bx - ty * W, y: by + tx * W }, notch, { x: bx + ty * W, y: by - tx * W }], true);
  return `<path d="${d}" fill="currentColor" stroke="none"/>`;
}

/** SVG for one propagator along curve `c`. */
export function drawLine(c: Curve, style: EdgeStyle, look: LineLook, parts?: ObjectPart[]): string {
  if (style.line === "none") return "";
  // drawn twice, side by side (the arrow once, in the middle): a graviton, a double dashed line
  if (style.doubled) {
    // (two waves or coils sit close, in step, like a thick double stroke, as a graviton is drawn; straight lines a gap apart)
    const apart = style.line === "wave" || style.line === "coil" ? look.doubleSeparation * 0.5 : Math.max(look.doubleSeparation, halfWidth({ ...style, doubled: false, arrow: 0 }, look) * 0.9);
    const once = { ...style, doubled: false };
    const side = (off: number) => drawLine(new Curve(parallelPoints(c, off), c.straight), { ...once, arrow: 0 }, look);
    return side(apart) + side(-apart) + arrowOnly(c, style, look);
  }
  // a photon that converts (`[photon, converted]`): the photon, then the electron and positron it
  // makes, apart a little, their arrows as fermion lines have them
  if (style.converted && style.line === "wave") return converted(c, style, look);
  // a parton that ends in a jet: the cone round its line
  if (style.jetCone && style.line !== "jet") return jetCone(c, look) + drawLine(c, { ...style, jetCone: false }, look);
  const sw = style.heavy ? look.heavy : style.cls === "susy" ? look.susy : look.stroke;
  const out: string[] = [];
  const solid = (pts: Pt[], o: { dash?: string; cap?: string; width?: number } = {}) =>
    out.push(`<path d="${pathFrom(pts)}" fill="none" stroke="currentColor" stroke-width="${fmt(o.width ?? sw)}" stroke-linecap="${o.cap ?? "round"}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`);
  const centre = () => (c.straight ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts);

  switch (style.line) {
    case "plain": solid(centre()); break;
    case "wave": solid(wavePoints(c, look)); break;
    case "coil": solid(coilPoints(c, look)); break;
    case "dash": {
      // fit so the line starts and ends on a full dash
      const n = Math.max(1, Math.round((c.length + look.dashGap) / (look.dash + look.dashGap)));
      const unit = c.length / (n * look.dash + (n - 1) * look.dashGap);
      solid(centre(), { dash: `${fmt(look.dash * unit)} ${fmt(look.dashGap * unit)}`, cap: "butt" });
      break;
    }
    case "dot": {
      const n = Math.max(1, Math.round(c.length / look.dotGap));
      solid(centre(), { dash: `0 ${fmt(c.length / n)}`, width: sw * 1.5 });
      break;
    }
    case "jet": out.push(detectorObject(c, style, look, sw, parts)); break;
    case "ellipsis": {
      // three dots toward the far end, where the leg would reach
      for (const f of [0.6, 0.74, 0.88]) { const p = c.at(c.length * f); out.push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(sw * 0.95)}" fill="currentColor"/>`); }
      return out.join("");
    }
    case "double":
      solid(parallelPoints(c, look.doubleSeparation / 2)); solid(parallelPoints(c, -look.doubleSeparation / 2)); break;
    case "triple":
      solid(parallelPoints(c, look.tripleSeparation)); solid(centre()); solid(parallelPoints(c, -look.tripleSeparation)); break;
  }
  if (style.overlay) solid(centre());

  const mid = c.length / 2;
  // an arrow on a heavy line grows with it, or the stroke would swallow it
  const arrowLook = style.heavy ? { ...look, arrowLength: look.arrowLength * 1.45, arrowWidth: look.arrowWidth * 1.6 } : look;
  if (style.arrow === 1 || style.arrow === -1) out.push(arrowHead(c, mid, style.arrow, arrowLook));
  else if (style.arrow === 2 && style.line === "plain" && c.length > 4 * look.arrowLength) {
    // Majorana: two arrows pointing at each other (or apart, an anti Majorana line)
    const inward = style.arrowsApart ? -1 : 1;
    out.push(arrowHead(c, mid - c.length * 0.2, inward, look), arrowHead(c, mid + c.length * 0.2, -inward as 1 | -1, look));
  }
  // arrows at chosen places too (`with arrow=0.3`)
  for (const a of style.arrowsAt ?? []) out.push(arrowHead(c, Math.min(c.length - look.arrowLength / 2, Math.max(look.arrowLength / 2, c.length * a.at)), a.dir, arrowLook));
  return out.join("");
}

/** Where along a converted photon it converts, a share of its length, and how far apart its pair ends. */
const CONVERT_AT = 0.45, CONVERT_SPREAD = 0.24;

/** A converted photon's pair: where it converts, and where its electron (`side` 1) and positron (-1) end. */
export function conversionPair(c: Curve): { vertex: Pt; electron: Pt; positron: Pt } {
  const L = c.length;
  return { vertex: c.at(L * CONVERT_AT), electron: c.offset(L, L * CONVERT_SPREAD), positron: c.offset(L, -L * CONVERT_SPREAD) };
}

function converted(c: Curve, style: EdgeStyle, look: LineLook): string {
  // (past the conversion it is no longer a Feynman line but what the detector sees, drawn as the
  // jets are: blue tracks, leaving together along the photon's way and curling apart, one each way
  // as opposite charges do in the field, a ring where the photon converted)
  const { vertex: V, electron, positron } = conversionPair(c), L = c.length, sw = look.stroke, tw = look.trackWidth;
  const colour = style.color ?? look.jetColor;
  let svg = drawLine(c.slice(0, L * CONVERT_AT), { ...style, converted: false }, look);
  const ctrl = c.at(L * (CONVERT_AT + (1 - CONVERT_AT) * 0.55));
  for (const end of [electron, positron]) {
    const pts: Pt[] = [];
    for (let k = 0; k <= 16; k++) { const t = k / 16; pts.push({ x: (1 - t) * (1 - t) * V.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x, y: (1 - t) * (1 - t) * V.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y }); }
    const track = new Curve(pts, false);
    svg += `<path class="feynjs-conversion-track" d="M${fmt(V.x)} ${fmt(V.y)}Q${fmt(ctrl.x)} ${fmt(ctrl.y)} ${fmt(end.x)} ${fmt(end.y)}" fill="none" stroke="${colour}" stroke-width="${fmt(sw * 1.1)}" stroke-linecap="round"/>`;
    // (both arrows outward: each is a particle leaving the conversion)
    svg += `<g fill="${colour}">${arrowHead(track, track.length * 0.62, 1, look).replace('fill="currentColor"', `fill="${colour}"`)}</g>`;
  }
  svg += `<circle class="feynjs-conversion-vertex" cx="${fmt(V.x)}" cy="${fmt(V.y)}" r="${fmt(tw * 2.6)}" fill="var(--feynjs-bg, #fff)" stroke="${colour}" stroke-width="${fmt(tw * 1.4)}"/>`;
  return `<g class="feynjs-conversion">${svg}</g>`;
}

/** Half-width a line style occupies either side of its axis (for label clearance). */
export function halfWidth(style: EdgeStyle, look: LineLook): number {
  if (style.doubled) return halfWidth({ ...style, doubled: false }, look) * 1.9 + look.doubleSeparation;
  switch (style.line) {
    case "wave": return look.waveAmplitude;
    case "coil": return look.coilRadius;
    case "triple": return look.tripleSeparation;
    case "double": return look.doubleSeparation / 2;
    case "jet": return style.object === "large" ? look.jetMaxHalfWidth * look.largeJetScale * 0.8 : style.object === "met" ? look.arrowWidth / 2 : 7;
    default: return style.arrow ? look.arrowWidth / 2 : 0;
  }
}

/** Just the arrowhead of a line (for a doubled line, whose arrow sits once, in the middle). */
function arrowOnly(c: Curve, style: EdgeStyle, look: LineLook): string {
  return style.arrow === 1 || style.arrow === -1 ? arrowHead(c, c.length / 2, style.arrow, look) : "";
}
