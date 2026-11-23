import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
// (charset ascii: every non-ASCII character escaped, so the bundle works whatever charset the page
// that loads it declares, or none)
const common = { entryPoints: ["src/index.ts"], bundle: true, target: "es2020", logLevel: "info", charset: "ascii" };
const outputs = ["dist/feynjs.mjs", "dist/feynjs.min.js", "docs/javascripts/feynjs.min.js"];
await build({ ...common, format: "esm", outfile: outputs[0] });
await build({ ...common, format: "iife", globalName: "feynjs", minify: true, outfile: outputs[1] });
await build({ ...common, format: "iife", globalName: "feynjs", minify: true, outfile: outputs[2] });
// (esbuild leaves the letters inside regular expressions as they are: escaped here too, \uXXXX
// meaning the same in a regular expression as in a string)
for (const file of outputs) {
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`));
}
