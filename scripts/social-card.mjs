// The social card (the picture shown when the repository or the site is shared): the wordmark with
// its photon, feyn | js, centred; circles spreading from the photon like ripples; the line under it.
// Writes docs/brand/logo/social-card.svg and .png. Run: node scripts/social-card.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const W = 1200, H = 630;
const INK = "#e6e8eb", RED = "#e05a4c", BG = "#1e2129", BAR = "#c0392b";
const here = (path) => new URL(`../${path}`, import.meta.url).pathname;

// the mark: the words and the photon between them, light on dark
const markSource = readFileSync(here("docs/brand/logo/logo-photon-dark.svg"), "utf8");
const [mx, my, mw, mh] = /viewBox="([^"]+)"/.exec(markSource)[1].split(/\s+/).map(Number);
const markWidth = 560, markHeight = (markWidth * mh) / mw;
// (the mark and the line under it, one block, centred below the red bar)
const gap = 92, lineSize = 40;
const top = 8 + (H - 8 - (markHeight + gap + 10)) / 2;
const markX = (W - markWidth) / 2;
const mark = markSource.replace(/<svg [^>]*>/, `<svg x="${markX}" y="${top.toFixed(1)}" width="${markWidth}" height="${markHeight.toFixed(1)}" viewBox="${mx} ${my} ${mw} ${mh}">`);
// (the middle of the photon: it runs upright at x 202.2, from y -84 to 39, in the mark's own units)
const photon = { x: markX + ((202.2 - mx) / mw) * markWidth, y: top + ((-22.5 - my) / mh) * markHeight };

// circles spreading from the photon, fading as they go
const circles = [70, 135, 210, 295, 390, 495, 610].map((r, k) => `<circle cx="${photon.x.toFixed(1)}" cy="${photon.y.toFixed(1)}" r="${r}" fill="none" stroke="${RED}" stroke-width="1.5" stroke-opacity="${Math.max(0.04, 0.34 - k * 0.05).toFixed(3)}"/>`).join("");

const line = `<text x="${W / 2}" y="${(top + markHeight + gap).toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="${lineSize}" fill="${INK}">A JavaScript display engine for <tspan fill="${RED}">Feynman diagrams</tspan></text>`;

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<defs><radialGradient id="glow" cx="${(photon.x / W).toFixed(3)}" cy="${(photon.y / H).toFixed(3)}" r="0.5"><stop offset="0" stop-color="${RED}" stop-opacity="0.11"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient><clipPath id="card"><rect width="${W}" height="${H}"/></clipPath></defs>`
  + `<rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`
  + `<g clip-path="url(#card)">${circles}</g>`
  + `<rect width="${W}" height="8" fill="${BAR}"/>`
  + mark + line + `</svg>`;

writeFileSync(here("docs/brand/logo/social-card.svg"), card);
const fonts = ["docs/fonts/Inter-Regular.otf", "docs/fonts/Inter-SemiBold.otf"].map(here);
const png = new Resvg(card, { fitTo: { mode: "width", value: W }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Inter" } }).render().asPng();
writeFileSync(here("docs/brand/logo/social-card.png"), png);
console.log("wrote docs/brand/logo/social-card.svg and .png");
