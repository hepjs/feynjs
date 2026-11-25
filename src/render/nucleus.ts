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
 * A nucleus from how it is written: a symbol (`Pb`), a mass number and a symbol (`208Pb`,
 * `^{208}Pb`), or nothing (then `A` and `Z` must be given).
 */
export function nucleusFrom(text: string): { A: number; Z: number } | undefined {
  const m = /^\s*(?:\^?\{?(\d+)\}?)?\s*([A-Za-z]{1,2})\s*$/.exec(text.replace(/\\mathrm\{(\w+)\}/, "$1"));
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
