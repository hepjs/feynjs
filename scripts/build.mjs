import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
// (charset ascii: every non-ASCII character escaped, so the bundle works whatever charset the page
// that loads it declares, or none)
const common = { entryPoints: ["src/index.ts"], bundle: true, target: "es2020", logLevel: "info", charset: "ascii" };
const outputs = ["dist/feynjs.mjs", "dist/feynjs.min.js", "docs/javascripts/feynjs.min.js"];
await build({ ...common, format: "esm", outfile: outputs[0] });
// (the browser file is what a page needs to draw diagrams, and toTikz for its download menu: the
// other tools, which only programs use, are in feynjs-full.min.js; npm's feynjs.mjs keeps everything)
const browser = { ...common, entryPoints: ["src/browser.ts"] };
await build({ ...browser, format: "iife", globalName: "feynjs", minify: true, outfile: outputs[1] });
await build({ ...browser, format: "iife", globalName: "feynjs", minify: true, outfile: outputs[2] });
// (the TikZ-Feynman reader, feynjs/tikz, built on its own: a page drawing diagrams does not load it;
// the playground and a program that converts pictures load it when they need it)
const tikz = { ...common, entryPoints: ["src/tikz.ts"] };
outputs.push("dist/feynjs-tikz.mjs", "dist/feynjs-tikz.min.js");
await build({ ...tikz, format: "esm", outfile: outputs[3] });
await build({ ...tikz, format: "iife", globalName: "feynjsTikz", minify: true, outfile: outputs[4] });
// (the full file, feynjs-full.min.js: everything, the tools included, on the same global, for a
// page that wants check, measure, describe or toTikz, such as the playground, which loads it in
// place of feynjs.min.js when asked for TikZ; the tools need the whole engine, so a file of the
// tools alone would be as large)
outputs.push("dist/feynjs-full.min.js");
await build({ ...common, format: "iife", globalName: "feynjs", minify: true, outfile: outputs[5] });
// (esbuild leaves the letters inside regular expressions as they are: escaped here too, \uXXXX
// meaning the same in a regular expression as in a string)
for (const file of outputs) {
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`));
}
