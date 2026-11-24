// A feynjs diagram handed back to TikZ-Feynman to lay out itself, for the paper's comparison
// (scripts/paper-tex-bench.mjs) and the showcase.
import { toTikz } from "../../dist/feynjs.mjs";
import { parse } from "../../src/parse/parse.ts";

/**
 * The same diagram for TikZ-Feynman to lay out itself, with \feynmandiagram and its default
 * (spring) layout: the same points, shapes and particle names, the same lines with their styles
 * and labels, and no coordinates. Line styles come from feynjs's export, written in TikZ-Feynman's
 * own keys; names and labels from the parsed diagram.
 */
export function automaticLayoutOf(source) {
  const d = parse(source);
  const picture = toTikz(source, { standalone: false });
  const shapes = new Map([...picture.matchAll(/\\vertex(?:\[([^\]]*)\])? \((\w+)\) at/g)].map(([, shape = "", name]) => [name, shape]));
  const lines = [...picture.matchAll(/^\s*\((\w+)\) -- \[(.*)\] \((\w+)\),$/gm)];
  const seen = new Set();
  const node = (id) => {
    const name = id.replace(/[^A-Za-z0-9]/g, "x");
    if (seen.has(name)) return name;
    seen.add(name);
    const label = d.vertices.get(id)?.label;
    const options = [shapes.get(name), label ? `particle=\\(${label}\\)` : ""].filter(Boolean).join(", ");
    return options ? `${name} [${options}]` : name;
  };
  const edges = d.edges.map((e, i) => {
    const style = keysOnly(lines[i]?.[2] ?? "plain");
    const label = e.label ? `, edge label${e.labelSide === -1 ? "'" : ""}={\\(${e.label}\\)}` : "";
    return `  ${node(e.from)} -- [${style}${label}] ${node(e.to)},`;
  });
  return ["\\feynmandiagram {", ...edges, "};"].join("\n");
}

/** The export's line keys without feynjs's look (line widths, colours stay TikZ-Feynman's defaults). */
function keysOnly(options) {
  return options.replace(/color=\{[^}]*\}/g, "").split(/,\s*/).filter((o) => !/^(line width|color=|momentum)/.test(o) && !/^\{?rgb/.test(o) && !/^(red|green|blue|black|gray)$/.test(o)).join(", ") || "plain";
}
