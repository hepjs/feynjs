// The README's diagrams as images, since GitHub cannot draw a ```feynman block: each example
// drawn by feynjs itself, as a PNG for light pages and one for dark, into .github/readme/.
// Run after `npm run build`: node scripts/readme-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { render } from "../dist/feynjs.mjs";

const EXAMPLES = {
  edges: "i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]",
  process: "p p > t t~\nt > b W+(> e+ ve)\nt~ > b~ W-(> d u~)",
  higgs: "i1 [p] -- pp [blob] -- i2 [p]\npp -- [H] h\nh -- [Z] z1\nh -- [Z] z2\nz1 -- l1 [mu+]\nz1 -- l2 [mu-]\nz2 -- l3 [e+]\nz2 -- l4 [e-]",
};
// (GitHub's own text colours, light and dark, and the SUSY red lifted on dark as the docs do)
const SCHEMES = { light: { ink: "#1f2328", susy: "#c0392b" }, dark: { ink: "#e6edf3", susy: "#e05a4c" } };
const fonts = ["NewCM10-Book.otf", "NewCM10-BookItalic.otf"].map((f) => new URL(`../docs/fonts/${f}`, import.meta.url).pathname);
const out = new URL("../.github/readme/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

for (const [name, source] of Object.entries(EXAMPLES)) {
  const svg = render(source, { standalone: true, idPrefix: name });
  for (const [scheme, { ink, susy }] of Object.entries(SCHEMES)) {
    // (transparent, so the page shows through; the ink and SUSY red in the scheme's colours)
    const coloured = svg.replace('color="#000000"', `color="${ink}"`).replace(/<rect x="-100000"[^>]*\/>/, "").replace(/#c0392b/gi, susy);
    const png = new Resvg(coloured, { fitTo: { mode: "zoom", value: 2.5 }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "NewComputerModern10" } }).render().asPng();
    writeFileSync(`${out}${name}-${scheme}.png`, png);
  }
}
console.log(`wrote ${Object.keys(EXAMPLES).length * 2} images into .github/readme/`);
