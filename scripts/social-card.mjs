// The social card (the picture shown when the repository or the site is shared): the logo in the
// middle, ripples spreading from its two interaction points, and the line under it.
// Writes docs/brand/logo/social-card.svg and .png. Run after `npm run build`:
//   node scripts/social-card.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const W = 1200, H = 630;
const INK = "#e6e8eb", RED = "#e05a4c", BG = "#1e2129", BAR = "#c0392b";
const here = (path) => new URL(`../${path}`, import.meta.url).pathname;

// the logo, centred: the static scatter logo, light on dark, its outer <svg> placed and sized
const logoSource = readFileSync(here("docs/brand/logo/logo-scatter-dark.svg"), "utf8");
const [lx, ly, lw, lh] = /viewBox="([^"]+)"/.exec(logoSource)[1].split(/\s+/).map(Number);
const logoBox = { width: 560 };
logoBox.height = (logoBox.width * lh) / lw;
logoBox.x = (W - logoBox.width) / 2;
logoBox.y = 112;
const logo = logoSource.replace(/<svg [^>]*>/, `<svg x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height.toFixed(1)}" viewBox="${lx} ${ly} ${lw} ${lh}">`);
// (where the photon meets the two quark lines, in the card's own coordinates)
const toCard = (x, y) => ({ x: logoBox.x + ((x - lx) / lw) * logoBox.width, y: logoBox.y + ((y - ly) / lh) * logoBox.height });
const points = [...logoSource.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)"/g)].map((m) => toCard(Number(m[1]), Number(m[2])));

// ripples spreading from both interaction points, fading as they go, beneath the logo
const ripples = points.flatMap((p) => [34, 80, 140, 215, 305].map((r, k) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="none" stroke="${RED}" stroke-width="1.4" stroke-opacity="${(0.34 - k * 0.065).toFixed(3)}"/>`)).join("");
const middle = { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length };

// the line, centred under the logo, on one line
const lineY = logoBox.y + logoBox.height + 78;
const line = `<text x="${W / 2}" y="${lineY}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="40" fill="${INK}">A JavaScript display engine for <tspan fill="${RED}">Feynman diagrams</tspan></text>`;

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<defs><radialGradient id="glow" cx="${(middle.x / W).toFixed(3)}" cy="${(middle.y / H).toFixed(3)}" r="0.5"><stop offset="0" stop-color="${RED}" stop-opacity="0.10"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient><clipPath id="card"><rect width="${W}" height="${H}"/></clipPath></defs>`
  + `<rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`
  + `<g clip-path="url(#card)">${ripples}</g>`
  + `<rect width="${W}" height="8" fill="${BAR}"/>`
  + logo + line + `</svg>`;

writeFileSync(here("docs/brand/logo/social-card.svg"), card);
// (Computer Modern has no italic script l: a browser takes the next serif in feynjs's list, STIX on
// macOS; this renderer would take any font at all, so the PNG names STIX for those labels itself)
const STIX = "/System/Library/Fonts/Supplemental/STIXGeneralItalic.otf";
const fonts = ["docs/fonts/NewCM10-Book.otf", "docs/fonts/NewCM10-BookItalic.otf", "docs/fonts/Inter-Regular.otf", "docs/fonts/Inter-SemiBold.otf"].map(here);
if (existsSync(STIX)) fonts.push(STIX);
const forPng = card.replace(/font-style="italic">ℓ</g, 'font-style="italic" font-family="STIXGeneral">ℓ<');
const png = new Resvg(forPng, { fitTo: { mode: "width", value: W }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "NewComputerModern10" } }).render().asPng();
writeFileSync(here("docs/brand/logo/social-card.png"), png);
console.log("wrote docs/brand/logo/social-card.svg and .png");
