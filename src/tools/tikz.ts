import type { Diagram, Edge, Vertex } from "../model.ts";
import { parse } from "../parse/parse.ts";
import { layoutDiagram } from "../render/render.ts";
import { themeWith } from "../theme.ts";
import type { ThemeOverrides } from "../theme.ts";

export interface TikzOptions {
  theme?: ThemeOverrides;
  /** length of one propagator in cm */
  unit?: number;
  /** wrap in a standalone document, ready to compile */
  standalone?: boolean;
}

const VERTEX_SHAPES: Record<string, string> = {
  dot: "dot", empty: "empty dot", square: "square dot", crossed: "crossed dot",
  blob: "blob", hatched: "blob", smallblob: "dot", insertion: "crossed dot", slashed: "empty dot",
};

/** The TikZ-Feynman key for a line, as close as plain TikZ-Feynman gets. */
function tikzLineStyle(e: Edge): string {
  const { line, arrow, cls, heavy } = e.style;
  const charged = arrow === 1 ? "" : arrow === -1 ? "anti " : undefined;
  let key: string;
  switch (line) {
    case "plain": key = arrow === 2 ? "majorana" : charged === undefined ? "plain" : `${charged}fermion`; break;
    case "wave": key = charged === undefined ? "photon" : `${charged}charged boson`; break;
    case "coil": key = "gluon"; break;
    case "dash": key = charged === undefined ? "scalar" : `${charged}charged scalar`; break;
    case "dot": key = "ghost"; break;
    case "double": key = "double"; break;
    case "triple": key = "double, double distance=2pt"; break;
    case "none": key = "draw=none"; break;
    default: key = "plain";
  }
  const extras = [cls === "susy" ? "red" : e.style.color, heavy ? "very thick" : undefined].filter(Boolean);
  return [key, ...extras].join(", ");
}

function tikzBend(bend: number | undefined): string | undefined {
  if (!bend) return undefined;
  const side = bend > 0 ? "left" : "right", size = Math.abs(bend);
  if (size === 90) return `half ${side}`;
  if (size === 45) return `quarter ${side}`;
  return `bend ${side}=${Math.round(size)}`;
}

const cm = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const tikzName = (id: string) => id.replace(/[^A-Za-z0-9]/g, "x");
/** Math-mode label, braced so commas inside it do not end the TikZ option. */
const math = (label: string) => `{\\(${label}\\)}`;

function vertexLine(v: Vertex, isLeg: boolean, x: number, y: number): string {
  const options: string[] = [];
  if (v.shape !== "none") options.push(VERTEX_SHAPES[v.shape]);
  if (v.coupling) options.push(`label=above:${math(v.coupling)}`);
  const text = v.label && (isLeg || !v.coupling) ? ` ${math(v.label)}` : v.shape !== "none" ? " {}" : "";
  return `  \\vertex${options.length ? `[${options.join(", ")}]` : ""} (${tikzName(v.id)}) at (${cm(x)}, ${cm(y)})${text};`;
}

/** Write a laid-out diagram as TikZ-Feynman, with every vertex at the place feynjs chose. */
function writeTikz(d: Diagram, unit: number, rowOverRank: number, standalone: boolean): string {
  const degree = new Map<string, number>();
  for (const e of d.edges) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);
  const vertices = [...d.vertices.values()].map((v) =>
    vertexLine(v, degree.get(v.id) === 1, v.x * unit, -v.y * rowOverRank * unit));
  const edges = d.edges.map((e) => {
    const options = [tikzLineStyle(e), tikzBend(e.bend), e.label ? `edge label${e.labelSide === -1 ? "'" : ""}=${math(e.label)}` : undefined,
      e.momentum ? `momentum=${math(e.momentum)}` : undefined].filter(Boolean);
    return `    (${tikzName(e.from)}) -- [${options.join(", ")}] (${tikzName(e.to)}),`;
  });
  const picture = ["\\begin{tikzpicture}", "\\begin{feynman}", ...vertices, "  \\diagram*{", ...edges, "  };",
    "\\end{feynman}", "\\end{tikzpicture}"].join("\n");
  if (!standalone) return picture;
  return ["\\documentclass[tikz,border=3pt]{standalone}", "\\usepackage{tikz-feynman}", "\\tikzfeynmanset{compat=1.1.0}",
    "\\begin{document}", picture, "\\end{document}", ""].join("\n");
}

/**
 * Diagram source -> TikZ-Feynman, laid out by feynjs. The result compiles with pdflatex.
 * Plain TikZ-Feynman has no jets, hadron braces, or overlaid SUSY lines, so those are
 * approximated: SUSY lines become red gluons, photons and scalars.
 */
export function toTikz(source: string, options: TikzOptions = {}): string {
  const theme = themeWith(options.theme);
  const d = parse(source);
  layoutDiagram(d, theme);
  return writeTikz(d, options.unit ?? 1.6, theme.unitY / theme.unitX, options.standalone ?? true);
}
