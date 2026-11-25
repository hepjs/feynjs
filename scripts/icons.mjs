// The icon (the mark): a scattering diagram in a rounded square. Two fermion lines come in toward
// the middle and leave outward, as feynjs draws scattering, and a photon is exchanged between them.
// Writes, in docs/brand/logo/: mark.svg (dark), mark-red.svg (the site's header), mark-light.svg,
// mark-mono.svg, mark-mono-white.svg, favicon.svg (heavier strokes, to read at 16 px),
// apple-touch-icon.png (180 px) and icon-512.png. Run: node scripts/icons.mjs
import { writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const here = (path) => new URL(`../${path}`, import.meta.url).pathname;
const f = (n) => n.toFixed(2);
const poly = (pts) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L");

// the diagram, in a 100 by 100 square
const TOP = [50, 33], BOTTOM = [50, 67];
const lines = [[[-4, 22], TOP], [TOP, [104, 22]], [[-4, 78], BOTTOM], [BOTTOM, [104, 78]]];
// (the fermion runs left to right along the top, the antifermion right to left along the bottom)
const arrows = [[[-4, 22], TOP], [TOP, [104, 22]], [BOTTOM, [-4, 78]], [[104, 78], BOTTOM]];

const wave = (p, q, waves = 2, amp = 5.5, n = 160) => {
  const [x1, y1] = p, [x2, y2] = q, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), px = -dy / L, py = dx / L;
  return poly(Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, s = amp * Math.sin(2 * Math.PI * waves * t);
    return [x1 + dx * t + px * s, y1 + dy * t + py * s];
  }));
};
const arrow = ([x1, y1], [x2, y2], size) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
  return poly([
    [mx + ux * size * 0.55, my + uy * size * 0.55],
    [mx - ux * size * 0.45 + px * size * 0.42, my - uy * size * 0.45 + py * size * 0.42],
    [mx - ux * size * 0.2, my - uy * size * 0.2],
    [mx - ux * size * 0.45 - px * size * 0.42, my - uy * size * 0.45 - py * size * 0.42],
  ]) + "Z";
};

const icon = ({ ground, ink, photon, line = 4.4, wavy = 4.8, dot = 5.2, head = 12, id }) => {
  const square = ground
    ? `<defs><clipPath id="${id}"><rect width="100" height="100" rx="22.5"/></clipPath></defs><g clip-path="url(#${id})"><rect width="100" height="100" fill="${ground}"/>`
    : `<defs><clipPath id="${id}"><rect width="100" height="100" rx="22.5"/></clipPath></defs><g clip-path="url(#${id})">`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="feynjs">${square}`
    + lines.map(([p, q]) => `<path d="${poly([p, q])}" stroke="${ink}" stroke-width="${line}" stroke-linecap="round" fill="none"/>`).join("")
    + `<path d="${arrows.map(([p, q]) => arrow(p, q, head)).join(" ")}" fill="${ink}"/>`
    + `<path d="${wave(TOP, BOTTOM)}" fill="none" stroke="${photon}" stroke-width="${wavy}" stroke-linecap="round" stroke-linejoin="round"/>`
    + [TOP, BOTTOM].map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${dot}" fill="${ink}"/>`).join("")
    + `</g></svg>`;
};

const RED = "#c0392b", NIGHT = "#1e2129", INK = "#1b1f24", LIGHT_INK = "#e6e8eb", WHITE = "#ffffff";
const variants = {
  "mark.svg": { ground: NIGHT, ink: LIGHT_INK, photon: "#e05a4c" },
  "mark-red.svg": { ground: RED, ink: WHITE, photon: WHITE },
  "mark-light.svg": { ground: WHITE, ink: INK, photon: RED },
  "mark-mono.svg": { ground: null, ink: INK, photon: INK },
  "mark-mono-white.svg": { ground: null, ink: WHITE, photon: WHITE },
  // (heavier, to read at 16 px)
  "favicon.svg": { ground: RED, ink: WHITE, photon: WHITE, line: 7, wavy: 8, dot: 7.2, head: 17 },
};
let k = 0;
for (const [name, v] of Object.entries(variants)) {
  writeFileSync(here(`docs/brand/logo/${name}`), icon({ ...v, id: `m${k++}` }));
}
const red = icon({ ...variants["mark-red.svg"], id: "png" });
for (const [name, size] of [["apple-touch-icon.png", 180], ["icon-512.png", 512]]) {
  writeFileSync(here(`docs/brand/logo/${name}`), new Resvg(red, { fitTo: { mode: "width", value: size } }).render().asPng());
}
console.log(`wrote ${Object.keys(variants).length} icons and 2 PNGs in docs/brand/logo/`);
