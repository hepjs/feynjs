import { Curve, fmt, pathFrom } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import type { ObjectContent, EdgeStyle } from "../model.ts";
import type { LineLook } from "../theme.ts";

/** Sine wave with a whole number of periods, so both ends meet the vertex on-axis. */
function wavePoints(c: Curve, look: LineLook): Pt[] {
  const n = Math.max(1, Math.round(c.length / look.waveLength));
  const steps = n * 16;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(c.offset(t * c.length, -look.waveAmplitude * Math.sin(2 * Math.PI * n * t)));
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
  const span = (pitch * (t1 - t0)) / (2 * Math.PI) + k * (Math.cos(t1) - Math.cos(t0));
  const scale = c.length / span;
  for (let i = 0; i <= steps; i++) {
    const th = t0 + ((t1 - t0) * i) / steps;
    const x = ((pitch * (th - t0)) / (2 * Math.PI) + k * (Math.cos(th) - Math.cos(t0))) * scale;
    pts.push(c.offset(x, -R * Math.sin(th)));
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
function jetCone(c: Curve, look: LineLook, o: { from?: number; scale?: number; shade?: number; rim?: "solid" | "dashed" } = {}): string {
  const from = o.from ?? 0, scale = o.scale ?? 1, shade = o.shade ?? look.jetShade;
  const start = c.at(from), end = c.at(c.length);
  const halfWidth = coneHalfWidth(c.length - from, look, scale);
  const left = c.offset(c.length, -halfWidth), right = c.offset(c.length, halfWidth);
  const bulge = { x: end.x + end.tx * halfWidth * 0.6, y: end.y + end.ty * halfWidth * 0.6 };
  const cone = `M${fmt(start.x)} ${fmt(start.y)}L${fmt(left.x)} ${fmt(left.y)}Q${fmt(bulge.x)} ${fmt(bulge.y)} ${fmt(right.x)} ${fmt(right.y)}Z`;
  // the gradient runs along the jet; its id is built from what it draws, so equal ids mean equal gradients
  const id = `feynjs-jet-${[start.x, start.y, end.x, end.y, shade * 100].map((n) => Math.round(n)).join("_")}`.replace(/-(?=\d)/g, "m");
  const gradient = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(start.x)}" y1="${fmt(start.y)}" x2="${fmt(bulge.x)}" y2="${fmt(bulge.y)}">`
    + `<stop class="feynjs-jet-stop" offset="0" stop-color="${look.jetColor}" stop-opacity="${fmt(shade)}"/>`
    + `<stop class="feynjs-jet-stop" offset="1" stop-color="${look.jetColor}" stop-opacity="${fmt(shade * look.jetFade)}"/></linearGradient>`;
  const rim = o.rim ? `<path class="feynjs-jet-rim" d="${cone}" fill="none" stroke="${look.jetColor}" stroke-width="${fmt(look.trackWidth)}" stroke-linejoin="round"${o.rim === "dashed" ? ` stroke-dasharray="3 2.5"` : ""}/>` : "";
  return `${gradient}<path class="feynjs-jet" d="${cone}" fill="url(#${id})" stroke="none"/>${rim}`;
}

/** How far a jet cone of the given length opens either side of its line, px. */
function coneHalfWidth(length: number, look: LineLook, scale = 1): number {
  return Math.min(look.jetMaxHalfWidth * scale, length * Math.tan((look.jetHalfAngle * scale * Math.PI) / 180));
}

/**
 * A detector object at the end of a leg, for semi-Feynman diagrams. `c` runs from the vertex
 * out to the end of the leg. Tracks are thin lines; what is not seen (a dark quark, invisible
 * dark hadrons, missing energy) is dashed or dotted.
 */
function detectorObject(c: Curve, style: EdgeStyle, look: LineLook, sw: number): string {
  const L = c.length, tw = look.trackWidth;
  const line = (pts: Pt[], o: { width?: number; dash?: string; colour?: string } = {}) =>
    `<path d="${pathFrom(pts)}" fill="none" stroke="${o.colour ?? "currentColor"}" stroke-width="${fmt(o.width ?? sw)}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  // a straight track from s0 along the line, ending `spread` of the cone's half-width to one side
  const track = (s0: number, spread: number, half: number, o: { width?: number; dash?: string; s1?: number } = {}) =>
    line([c.offset(s0, 0), c.offset(o.s1 ?? L, spread * half)], { width: o.width ?? tw, dash: o.dash });
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
    const half = coneHalfWidth(L, look, scale), split = L * 0.32;
    type Item = { kind: string; contents?: ObjectContent[] };
    const flat = (list: ObjectContent[]): Item[] => list.flatMap(({ kind, count, contents }) => Array.from({ length: count }, () => ({ kind, contents })));
    const smallWave = { ...look, waveAmplitude: look.waveAmplitude * 0.55, waveLength: look.waveLength * 0.6 };
    const drawItem = (sub: Curve, item: Item, room: number, many: boolean): string => {
      const ends = line([sub.at(0), sub.at(sub.length)]);
      if (item.contents?.length) {
        const knee = sub.at(sub.length * 0.45);
        const kids = flat(item.contents);
        let out = drawLine(Curve.line(sub.at(0), knee), { line: "wave", arrow: 0 }, smallWave);
        kids.forEach((kid, i) => {
          // (toward the middle of the cone rather than out past its edge)
          const off = kids.length === 1 ? 0 : -1 + (2 * i) / (kids.length - 1);
          out += drawItem(Curve.line(knee, sub.offset(sub.length, off * room)), kid, room * 0.4, true);
        });
        return out;
      }
      const cone = (k: number) => jetCone(sub, look, { scale: k });
      if (item.kind === "jet") return cone(many ? 0.55 : 0.8) + ends;
      if (item.kind === "bjet") {
        const sv = sub.at(sub.length * 0.45);
        return cone(many ? 0.55 : 0.8) + ends + dot(sv, tw * 2.6, "var(--feynjs-bg, #fff)");
      }
      if (item.kind === "photon") return line([sub.at(0), sub.at(sub.length)], { width: tw, dash: "3 2" });
      if (item.kind === "neutrino") return line([sub.at(0), sub.at(sub.length)], { width: tw * 1.2, dash: `0 ${fmt(look.dotGap)}` });
      return line([sub.at(0), sub.at(sub.length)], { width: tw * 1.4 });
    };
    const items = flat(style.contents);
    let out = jetCone(c, look, { scale, shade: look.jetShade * 0.55, rim: wide ? "solid" : undefined }) + line([c.at(0), c.at(split)]);
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
      const half = coneHalfWidth(L, look, look.largeJetScale), split = L * 0.42;
      let out = jetCone(c, look, { scale: look.largeJetScale, shade: look.jetShade * 0.55, rim: "solid" }) + line([c.at(0), c.at(split)]);
      for (const side of [-0.55, 0.55]) {
        const sub = Curve.line(c.at(split), c.offset(L, side * half));
        out += jetCone(sub, look, { scale: 0.8 }) + line([sub.at(0), sub.at(sub.length)]);
      }
      return out;
    }
    case "top": {
      // a top-tagged large-R jet: the top splits into three subjets (b and the W's two quarks)
      const half = coneHalfWidth(L, look, look.largeJetScale * 1.1), split = L * 0.38;
      let out = jetCone(c, look, { scale: look.largeJetScale * 1.1, shade: look.jetShade * 0.55, rim: "solid" }) + line([c.at(0), c.at(split)]);
      for (const side of [-0.62, 0, 0.62]) {
        const sub = Curve.line(c.at(split), c.offset(L, side * half));
        out += jetCone(sub, look, { scale: 0.65 }) + line([sub.at(0), sub.at(sub.length)]);
      }
      return out;
    }
    case "btag": {
      // a b-jet: a jet with a secondary vertex a little way in, its two tracks leaving it
      const half = coneHalfWidth(L, look), sv = c.offset(L * 0.45, half * 0.12);
      return jetCone(c, look) + line(c.straight ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts)
        + [0.45, 0.75].map((k) => line([sv, c.offset(L * 0.95, k * half)], { width: tw })).join("") + dot(sv, tw * 2.6, "var(--feynjs-bg, #fff)");
    }
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
      return line([c.at(0), c.at(at)], { width: sw, dash: `0 ${fmt(look.dotGap)}` }) + jetCone(c, look, { from: at, scale: 1.5 }) + line([c.at(at), c.at(L)]) + dot(c.at(at), sw * 1.4, "var(--feynjs-bg, #fff)");
    }
    case "met": {
      // missing energy: a dotted arrow out of the diagram
      const tip = c.at(L), back = c.at(L - look.arrowLength), w = look.arrowWidth / 2;
      const head = pathFrom([tip, { x: back.x - back.ty * w, y: back.y + back.tx * w }, { x: back.x + back.ty * w, y: back.y - back.tx * w }], true);
      return line([c.at(0), back], { dash: `0 ${fmt(look.dotGap)}`, width: sw * 1.4 }) + `<path d="${head}" fill="currentColor"/>`;
    }
    default:
      return jetCone(c, look) + line(c.straight ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts);
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
export function drawLine(c: Curve, style: EdgeStyle, look: LineLook): string {
  if (style.line === "none") return "";
  // drawn twice, side by side (the arrow once, in the middle): a graviton, a double dashed line
  if (style.doubled) {
    // (two waves or coils sit close, in step, like a thick double stroke, as a graviton is drawn; straight lines a gap apart)
    const apart = style.line === "wave" || style.line === "coil" ? look.doubleSeparation * 0.5 : Math.max(look.doubleSeparation, halfWidth({ ...style, doubled: false, arrow: 0 }, look) * 0.9);
    const once = { ...style, doubled: false };
    const side = (off: number) => drawLine(new Curve(parallelPoints(c, off), c.straight), { ...once, arrow: 0 }, look);
    return side(apart) + side(-apart) + arrowOnly(c, style, look);
  }
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
    case "jet": out.push(detectorObject(c, style, look, sw)); break;
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
    // Majorana: two arrows pointing at each other
    out.push(arrowHead(c, mid - c.length * 0.2, 1, look), arrowHead(c, mid + c.length * 0.2, -1, look));
  }
  // arrows at chosen places too (`with arrow=0.3`)
  for (const a of style.arrowsAt ?? []) out.push(arrowHead(c, Math.min(c.length - look.arrowLength / 2, Math.max(look.arrowLength / 2, c.length * a.at)), a.dir, arrowLook));
  return out.join("");
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
