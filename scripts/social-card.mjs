// The social card (the picture shown when the repository or the site is shared): the home page in
// one image. The logo (its scatter even, outgoing lines as long as incoming) and the line on the
// left; chargino-neutralino production, drawn by feynjs, on the right, its collision level with
// the logo and ripples spreading from it.
// Writes docs/brand/logo/social-card.svg and .png. Run after `npm run build`:
//   node scripts/social-card.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { render } from "../dist/feynjs.mjs";

const W = 1200, H = 630;
const INK = "#e6e8eb", RED = "#e05a4c", BG = "#1e2129", BAR = "#c0392b";
const here = (path) => new URL(`../${path}`, import.meta.url).pathname;

// the logo: the static scatter logo, light on dark, its outer <svg> placed and sized
const logoSource = readFileSync(here("docs/brand/logo/logo-scatter-even-dark.svg"), "utf8");
const logoBox = { x: 80, width: 500 };
const [lx, ly, lw, lh] = /viewBox="([^"]+)"/.exec(logoSource)[1].split(/\s+/).map(Number);
logoBox.height = (logoBox.width * lh) / lw;
// (the logo and the two lines under it, as one block, centred top to bottom below the red bar)
const block = logoBox.height + 70 + 46 + 12;
logoBox.y = 8 + (H - 8 - block) / 2;
const logo = logoSource.replace(/<svg [^>]*>/, `<svg x="${logoBox.x}" y="${logoBox.y}" width="${logoBox.width}" height="${logoBox.height.toFixed(1)}" viewBox="${lx} ${ly} ${lw} ${lh}">`);
const logoMiddle = logoBox.y + logoBox.height / 2;

// the diagram, as the home page draws it, recoloured for a dark card
const diagramSource = "arrows: none\np p > chargino neutralino2\nchargino > W neutralino1\nneutralino2 > Z neutralino1\nW > l nu\nZ > l l";
let diagram = render(diagramSource, { standalone: true, idPrefix: "card" })
  .replace('color="#000000"', `color="${INK}"`).replace(/<rect x="-100000"[^>]*\/>/, "").replace(/#c0392b/gi, RED);
const [dx, dy, dw, dh] = /viewBox="([^"]+)"/.exec(diagram)[1].split(/\s+/).map(Number);
const blob = /<circle class="feynjs-collision" cx="([-\d.]+)" cy="([-\d.]+)"/.exec(diagram);
const diagramWidth = 440, scale = diagramWidth / dw, diagramHeight = dh * scale;
// (placed so its collision is level with the middle of the logo)
const diagramX = 690, diagramY = logoMiddle - (Number(blob[2]) - dy) * scale;
diagram = diagram.replace(/<svg [^>]*?>/, (open) => open.replace(/ width="[^"]*"/, ` x="${diagramX}" y="${diagramY.toFixed(1)}" width="${diagramWidth}"`).replace(/ height="[^"]*"/, ` height="${diagramHeight.toFixed(1)}"`));
const collision = { x: diagramX + (Number(blob[1]) - dx) * scale, y: logoMiddle };

// ripples from the collision, fading as they spread
const ripples = [70, 150, 250, 370, 510].map((r, k) => `<circle cx="${collision.x.toFixed(1)}" cy="${collision.y.toFixed(1)}" r="${r}" fill="none" stroke="${RED}" stroke-width="1.5" stroke-opacity="${(0.32 - k * 0.06).toFixed(2)}"/>`).join("");

// the line, under the logo, in two lines as the home page sets it
const lineY = logoBox.y + logoBox.height + 70;
const line = `<text x="${logoBox.x}" y="${lineY}" font-family="Inter" font-weight="600" font-size="36" fill="${INK}">A JavaScript display engine</text>`
  + `<text x="${logoBox.x}" y="${lineY + 46}" font-family="Inter" font-weight="600" font-size="36" fill="${INK}">for <tspan fill="${RED}">Feynman diagrams</tspan></text>`;

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<defs><radialGradient id="glow" cx="${(collision.x / W).toFixed(3)}" cy="${(collision.y / H).toFixed(3)}" r="0.55"><stop offset="0" stop-color="${RED}" stop-opacity="0.10"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient><clipPath id="card"><rect width="${W}" height="${H}"/></clipPath></defs>`
  + `<rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`
  + `<g clip-path="url(#card)">${ripples}</g>`
  + `<rect width="${W}" height="8" fill="${BAR}"/>`
  + logo + line + diagram + `</svg>`;

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
