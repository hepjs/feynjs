// A diagram's layout v2 as a fingerprint: every vertex's position rounded to 0.01 of a line
// length, panel by panel, hashed. Positions, not SVG, so restyling (colours, strokes, labels)
// leaves it alone; only a change in where v2 puts things changes it. Shared by
// scripts/review.mjs (which approves a baseline) and test/v2-baseline.test.ts (which holds to it).
import { createHash } from "node:crypto";
import { parse } from "../../src/parse/parse.ts";
import { layoutDiagram } from "../../src/render/render.ts";
import { splitPanels } from "../../src/render/panels.ts";
import { themeWith } from "../../src/theme.ts";

export function layoutText(source) {
  const theme = themeWith({ engine: "v2" });
  return splitPanels(source).map((panel) => {
    const d = parse(panel.source);
    layoutDiagram(d, theme);
    return [...d.vertices.values()].map((v) => `${v.id}:${(v.x ?? 0).toFixed(2)},${(v.y ?? 0).toFixed(2)}`).sort().join(" ");
  }).join(" | ");
}

export function fingerprint(source) {
  try { return createHash("sha1").update(layoutText(source)).digest("hex").slice(0, 12); }
  catch (e) { return `error: ${e.message}`; }
}
