import { fmt } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * A nucleus drawn as an atom's core is drawn in textbooks: A small spheres packed in a disc,
 * Z of them protons (brick red), the rest neutrons (slate), mixed through it. Its size
 * grows as A to the third, as a nucleus's radius does.
 */

/** Common nuclei by symbol: [Z, A] (the isotope colliders and textbooks use). */
export const ELEMENTS: Record<string, [number, number]> = {
  p: [1, 1], n: [0, 1], H: [1, 1], d: [1, 2], D: [1, 2], He: [2, 4], Li: [3, 7], Be: [4, 9], C: [6, 12],
  N: [7, 14], O: [8, 16], Ne: [10, 20], Al: [13, 27], Si: [14, 28], Ar: [18, 40], Ca: [20, 40],
  Fe: [26, 56], Cu: [29, 63], Kr: [36, 84], Zr: [40, 96], Ru: [44, 96], Ag: [47, 108], Xe: [54, 129],
  W: [74, 184], Au: [79, 197], Pb: [82, 208], U: [92, 238],
};

/**
 * Every element up to plutonium, in order of Z, each with its most common isotope's A (or its
 * longest lived, where none is stable): the ones above, which colliders use, keep theirs.
 */
const PERIODIC = ("H1 He4 Li7 Be9 B11 C12 N14 O16 F19 Ne20 Na23 Mg24 Al27 Si28 P31 S32 Cl35 Ar40 K39 Ca40 Sc45 Ti48 V51 Cr52 "
  + "Mn55 Fe56 Co59 Ni58 Cu63 Zn64 Ga69 Ge74 As75 Se80 Br79 Kr84 Rb85 Sr88 Y89 Zr90 Nb93 Mo98 Tc98 Ru102 Rh103 Pd106 Ag107 "
  + "Cd114 In115 Sn120 Sb121 Te130 I127 Xe132 Cs133 Ba138 La139 Ce140 Pr141 Nd142 Pm145 Sm152 Eu153 Gd158 Tb159 Dy164 Ho165 "
  + "Er166 Tm169 Yb174 Lu175 Hf180 Ta181 W184 Re187 Os192 Ir193 Pt195 Au197 Hg202 Tl205 Pb208 Bi209 Po209 At210 Rn222 Fr223 "
  + "Ra226 Ac227 Th232 Pa231 U238 Np237 Pu239").split(" ").map((s) => /^([A-Z][a-z]?)(\d+)$/.exec(s)!);
PERIODIC.forEach(([, symbol, A], k) => { if (!(symbol in ELEMENTS)) ELEMENTS[symbol] = [k + 1, Number(A)]; });

/**
 * The protons and neutrons written in a nucleus's brackets, `2p 2n` (`He(2p 2n)`, `X(3p 4n)`):
 * only counts of `p` and `n`, in any order; undefined for anything else (a hadron's quarks or state).
 */
export function nucleonCount(text: string): { Z: number; N: number } | undefined {
  const tokens = text.trim().split(/\s+/);
  if (!tokens.every((t) => /^\d+[pn]$/.test(t))) return undefined;
  const sum = (kind: string) => tokens.filter((t) => t.endsWith(kind)).reduce((s, t) => s + Number(t.slice(0, -1)), 0);
  return { Z: sum("p"), N: sum("n") };
}

/** An element's symbol from its Z (`Pb` for 82; `n` for none, a lone neutron). */
export function elementSymbol(Z: number): string {
  return Z === 0 ? "n" : PERIODIC[Z - 1]?.[1] ?? `Z${Z}`;
}

/**
 * An element written as a leg's name, `Xe`, `208Pb`, `4He`, `Xe*`, set upright as element symbols
 * are: `\mathrm{Xe}`, `^{208}\mathrm{Pb}`. Undefined for anything else (a lone capital, which so
 * often names a particle, `X`, `Y`, `K`, stays as it is unless it carries a mass number).
 */
export function uprightElement(text: string): string | undefined {
  const m = /^(\d+)?([A-Z][a-z]?)(\*)?$/.exec(text.trim());
  if (!m || !Object.prototype.hasOwnProperty.call(ELEMENTS, m[2]) || (m[2].length === 1 && !m[1])) return undefined;
  return `${m[1] ? `^{${m[1]}}` : ""}\\mathrm{${m[2]}}${m[3] ? "^*" : ""}`;
}

/** How a nucleus is written in a label: its mass number up front, `^{4}\mathrm{He}`; a lone proton or neutron, a deuteron, by its letter. */
export function isotopeLabel(A: number, symbol: string): string {
  if ((symbol === "p" || symbol === "n") && A === 1) return `\\mathrm{${symbol}}`;
  if (symbol === "d" || symbol === "D") return `\\mathrm{${symbol}}`;
  return `^{${A}}\\mathrm{${symbol}}`;
}

/**
 * A nucleus from how it is written: a symbol (`Pb`), a mass number and a symbol (`208Pb`,
 * `^{208}Pb`), or nothing (then `A` and `Z` must be given).
 */
export function nucleusFrom(text: string): { A: number; Z: number } | undefined {
  // (a star after it, Xe*, is the nucleus excited: the same nucleus)
  const m = /^\s*(?:\^?\{?(\d+)\}?)?\s*([A-Za-z]{1,2})\s*(?:\^?\{?\*\}?)?\s*$/.exec(text.replace(/\\mathrm\{(\w+)\}/, "$1"));
  if (!m || !(m[2] in ELEMENTS)) return undefined;
  const [Z, A] = ELEMENTS[m[2]];
  return { Z, A: m[1] ? Number(m[1]) : A };
}

/**
 * Where a nucleus's A nucleons sit, seen from the front, with how near each is: inside a ball of
 * the nucleus's genuine radius, 1.2 fm A^(1/3) to a nucleon's 0.85 fm (so lead is about eight
 * nucleons across, not thirteen as a flat packing would make it), pushed apart until each has
 * its room, the same every time. Every nucleon is the same size, so the whole grows as A to the
 * third, as a nucleus does: lead is about 3.7 times helium across.
 */
function nucleonPlaces(A: number, unit: number): { places: (Pt & { z: number })[]; r: number } {
  const r = unit * 0.5, R = Math.max(r, ((1.2 / 0.85) * portable.cbrt(A)) * r), inside = Math.max(0, R - r);
  type P3 = { x: number; y: number; z: number };
  let pts: P3[];
  // (the lightest by hand: a touching pair, a triangle, a tetrahedron turned a little)
  if (A === 1) pts = [{ x: 0, y: 0, z: 0 }];
  else if (A === 2) pts = [{ x: -r * 0.9, y: 0, z: 0 }, { x: r * 0.9, y: 0, z: 0 }];
  else if (A === 3) pts = [0, 1, 2].map((k) => ({ x: r * 1.04 * portable.cos(-Math.PI / 2 + (2 * Math.PI * k) / 3), y: r * 1.04 * portable.sin(-Math.PI / 2 + (2 * Math.PI * k) / 3), z: 0 }));
  else {
    // (spread through the ball, a golden angle apart, then pushed apart where they crowd)
    const golden = Math.PI * (3 - Math.sqrt(5));
    pts = Array.from({ length: A }, (_, k) => {
      const rho = inside * portable.cbrt((k + 0.5) / A), cosT = 1 - (2 * (k + 0.5)) / A, sinT = Math.sqrt(1 - cosT * cosT), phi = k * golden;
      return { x: rho * sinT * portable.cos(phi), y: rho * sinT * portable.sin(phi), z: rho * cosT };
    });
    const apart = 2 * r * 0.92;
    for (let round = 0; round < 60; round++) {
      for (let i = 0; i < A; i++) for (let j = i + 1; j < A; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y, dz = pts[j].z - pts[i].z, d = portable.hypot(dx, dy, dz) || 1e-6;
        if (d >= apart) continue;
        const push = (apart - d) / 2 / d;
        pts[i] = { x: pts[i].x - dx * push, y: pts[i].y - dy * push, z: pts[i].z - dz * push };
        pts[j] = { x: pts[j].x + dx * push, y: pts[j].y + dy * push, z: pts[j].z + dz * push };
      }
      // (and kept inside the ball)
      pts = pts.map((q) => { const d = portable.hypot(q.x, q.y, q.z); return d > inside && d > 0 ? { x: (q.x * inside) / d, y: (q.y * inside) / d, z: (q.z * inside) / d } : q; });
    }
  }
  // (seen a little from above and the side, so no two sit exactly behind one another)
  const tilt = 0.5, turn = 0.4;
  return {
    places: pts.map((q) => {
      const x1 = q.x * portable.cos(turn) + q.z * portable.sin(turn), z1 = -q.x * portable.sin(turn) + q.z * portable.cos(turn);
      return { x: x1, y: q.y * portable.cos(tilt) - z1 * portable.sin(tilt), z: q.y * portable.sin(tilt) + z1 * portable.cos(tilt) };
    }),
    r,
  };
}

/** A small generator of numbers in [0, 1), fixed by `seed`. */
function seeded(seed: number): () => number {
  let h = seed >>> 0 || 1;
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}

/** How far the nucleus reaches from its middle, in px. */
export function nucleusRadius(A: number, unit: number): number {
  const { places, r } = nucleonPlaces(A, unit);
  return Math.max(...places.map((q) => portable.hypot(q.x, q.y))) + r;
}

/** The SVG of a nucleus of `A` nucleons, `Z` of them protons, at `p`. */
export function nucleusSvg(p: Pt, A: number, Z: number, unit: number, colours: { proton: string; neutron: string; edge: string; protonEdge?: string; neutronEdge?: string }): string {
  const { places: offsets, r } = nucleonPlaces(A, unit);
  const places = offsets.map((q) => ({ x: p.x + q.x, y: p.y + q.y, z: q.z }));
  // (which are protons: Z of them, spread evenly from the middle out, so a small nucleus alternates
  // protons and neutrons; mixed a little in a large one, the same every time for the same nucleus)
  const evenly = places.map((_, k) => Math.floor(((k + 1) * Z) / A) > Math.floor((k * Z) / A));
  const order = A > 20 ? shuffled(A, A * 1000 + Z) : places.map((_, k) => k);
  const protons = new Set(order.filter((_, k) => evenly[k]).map((k) => k));
  // (flat colours, each nucleon edged in a dark shade of its own, so ones that overlap still read
  // as several; the far ones first, so the near ones sit over them)
  const spheres = places.map((q, k) => ({ q, k })).sort((a, b) => a.q.z - b.q.z).map(({ q, k }) => {
    const fill = protons.has(k) ? colours.proton : colours.neutron;
    // (each kind may have its own edge, or none)
    const edge = (protons.has(k) ? colours.protonEdge : colours.neutronEdge) ?? colours.edge;
    const stroke = edge === "none" ? "" : ` stroke="${edge}" stroke-width="${fmt(Math.min(0.6, r * 0.12))}"`;
    return `<circle cx="${fmt(q.x)}" cy="${fmt(q.y)}" r="${fmt(r)}" fill="${fill}"${stroke}/>`;
  }).join("");
  return `<g class="feynjs-nucleus">${spheres}</g>`;
}

/** Where a nucleus hit at `p` is drawn, recoiling toward `dir`: moved on by two thirds of its radius. */
export function recoiledTo(p: Pt, dir: Pt, R: number): Pt {
  return { x: p.x + dir.x * R * 0.64, y: p.y + dir.y * R * 0.64 };
}

/**
 * The rings a recoiling nucleus leaves, as a moving source leaves its waves (the Doppler picture):
 * each centred where the nucleus was a moment earlier, the older ones further back and wider, so
 * they bunch ahead of it and spread out behind. `at` is where it is drawn, moved on.
 */
export function recoilRings(at: Pt, dir: Pt, R: number): { c: Pt; r: number; opacity: number }[] {
  return [1, 2, 3].map((k) => ({
    c: { x: at.x - dir.x * R * 0.34 * k, y: at.y - dir.y * R * 0.34 * k },
    r: R * (1 + 0.42 * k),
    opacity: 0.5 - 0.12 * k,
  }));
}

/**
 * A nucleus recoiling: drawn moved on from where it was hit at `p`, toward `dir`, inside the
 * rings of its motion (see recoilRings), thin lines in the ink's colour, fainter the older they
 * are. `one` draws the nucleus at a point.
 */
export function recoilSvg(p: Pt, dir: Pt, R: number, one: (at: Pt) => string, stroke: number): string {
  const at = recoiledTo(p, dir, R);
  const rings = recoilRings(at, dir, R).map(({ c, r, opacity }) =>
    `<circle cx="${fmt(c.x)}" cy="${fmt(c.y)}" r="${fmt(r)}" fill="none" stroke="currentColor" stroke-opacity="${fmt(opacity)}" stroke-width="${fmt(stroke * 0.6)}"/>`).join("");
  return `<g class="feynjs-recoil">${rings}${one(at)}</g>`;
}

/** The numbers 0 ... n-1 in an order fixed by `seed`. */
function shuffled(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, k) => k);
  let h = seed >>> 0 || 1;
  const next = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  for (let k = n - 1; k > 0; k--) {
    const j = Math.floor(next() * (k + 1));
    [order[k], order[j]] = [order[j], order[k]];
  }
  return order;
}
