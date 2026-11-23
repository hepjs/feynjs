// A diagram's layout as the position of every point (panel by panel, in line lengths), the form
// the approved layouts are kept in. Positions, not SVG, so restyling leaves them alone.
import { parse } from "../../src/parse/parse.ts";
import { layoutDiagram } from "../../src/render/render.ts";
import { splitPanels } from "../../src/render/panels.ts";
import { themeWith } from "../../src/theme.ts";

export function layoutPoints(source) {
  const theme = themeWith({ engine: "v2" });
  const points = {};
  splitPanels(source).forEach((panel, k) => {
    const d = parse(panel.source);
    layoutDiagram(d, theme);
    for (const v of d.vertices.values()) points[`${k}:${v.id}`] = [Math.round((v.x ?? 0) * 1000) / 1000, Math.round((v.y ?? 0) * 1000) / 1000];
  });
  return points;
}
