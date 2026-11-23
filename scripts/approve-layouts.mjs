// Approve the current layouts: record where every point of every validation and example diagram
// lies now, with the layout settings, in validation/layout-baseline.json. The test then fails if
// any of them moves, so a change to the layout is seen and approved on purpose.
//   npm run build && npm run approve-layouts
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defaultTheme } from "../dist/feynjs.mjs";
import { layoutPoints } from "./lib/layout-points.mjs";

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".feyn") ? [p] : []; });
const items = {}, files = {};
for (const file of [...walk("validation"), ...walk("examples")].sort()) {
  const id = file.replace(/\.feyn$/, "");
  try { items[id] = layoutPoints(readFileSync(file, "utf8").trim()); files[id] = file; } catch { /* a diagram that does not draw is not part of the baseline */ }
}
writeFileSync("validation/layout-baseline.json", JSON.stringify({ approved: new Date().toISOString().slice(0, 10), settings: { forces: defaultTheme.forces }, items, files }, null, 1) + "\n");
console.log(`approved ${Object.keys(items).length} layouts`);
