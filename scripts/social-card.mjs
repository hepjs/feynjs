// The social card (the picture shown when the repository or the site is shared): the wordmark,
// feyn | js, with its photon between the words, large and centred, the line under it; circles spread
// from the js across the card: the JavaScript engine at work.
// Writes docs/brand/logo/social-card.svg and .png. Run: node scripts/social-card.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const W = 1200, H = 630;
const INK = "#e6e8eb", RED = "#e05a4c", BG = "#1e2129", BAR = "#c0392b";
const here = (path) => new URL(`../${path}`, import.meta.url).pathname;

// the mark: the words and the photon between them, light on dark
const markSource = readFileSync(here("docs/brand/logo/logo-photon-dark.svg"), "utf8");
const [mx, my, mw, mh] = /viewBox="([^"]+)"/.exec(markSource)[1].split(/\s+/).map(Number);
const markWidth = 620, markHeight = (markWidth * mh) / mw, markX = (W - markWidth) / 2;
// (the mark and the line under it, one block, centred top to bottom below the red bar)
const markTop = 8 + (H - 8 - (markHeight + 84 + 10)) / 2;
const mark = markSource.replace(/<svg [^>]*>/, `<svg x="${markX}" y="${markTop.toFixed(1)}" width="${markWidth}" height="${markHeight.toFixed(1)}" viewBox="${mx} ${my} ${mw} ${mh}">`);
// (the middle of the red js, in the mark's own units: where the circles start)
const js = { x: markX + ((262.05 - mx) / mw) * markWidth, y: markTop + ((-22.45 - my) / mh) * markHeight };

const lineY = markTop + markHeight + 84;
const words = `<text x="${W / 2}" y="${lineY.toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="40" fill="${INK}">A JavaScript display engine for <tspan fill="${RED}">Feynman diagrams</tspan></text>`;

// circles spreading from the js, fading as they go
const circles = [46, 105, 180, 270, 375, 495, 630, 780].map((r, k) => `<circle cx="${js.x.toFixed(1)}" cy="${js.y.toFixed(1)}" r="${r}" fill="none" stroke="${RED}" stroke-width="1.5" stroke-opacity="${Math.max(0.04, 0.36 - k * 0.042).toFixed(3)}"/>`).join("");

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<defs><radialGradient id="glow" cx="${(js.x / W).toFixed(3)}" cy="${(js.y / H).toFixed(3)}" r="0.45"><stop offset="0" stop-color="${RED}" stop-opacity="0.11"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient><clipPath id="card"><rect width="${W}" height="${H}"/></clipPath></defs>`
  + `<rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`
  + `<g clip-path="url(#card)">${circles}</g>`
  + `<rect width="${W}" height="8" fill="${BAR}"/>`
  + mark + words + `</svg>`;

writeFileSync(here("docs/brand/logo/social-card.svg"), card);
const fonts = ["docs/fonts/Inter-Regular.otf", "docs/fonts/Inter-SemiBold.otf"].map(here);
const png = new Resvg(card, { fitTo: { mode: "width", value: W }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Inter" } }).render().asPng();
writeFileSync(here("docs/brand/logo/social-card.png"), png);
console.log("wrote docs/brand/logo/social-card.svg and .png");
