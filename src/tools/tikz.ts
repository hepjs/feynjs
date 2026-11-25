import type { Diagram, Edge, Vertex } from "../model.ts";
import { parse } from "../parse/parse.ts";
import { drawDiagram, MATH_AXIS_EM } from "../render/render.ts";
import type { Scene } from "../render/scene.ts";
import type { Theme, ThemeOverrides } from "../theme.ts";
import { splitPanels } from "../render/panels.ts";
import { colourAsRgb } from "../render/greyscale.ts";
import type { Panel } from "../render/panels.ts";
import { CM_PER_LINE_LENGTH } from "../parse/lengths.ts";

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

/** Colours TikZ knows by name (xcolor's base set); any other is written as its RGB value. */
const TIKZ_COLOURS = new Set(["red", "green", "blue", "cyan", "magenta", "yellow", "black", "gray", "white", "darkgray",
  "lightgray", "brown", "lime", "olive", "orange", "pink", "purple", "teal", "violet"]);

/**
 * A colour as TikZ reads it. feynjs's own named colours become the shade feynjs draws; CSS names,
 * #hex and rgb() become an exact RGB value ("#" would end a TikZ option); TikZ's own names stay.
 */
function tikzColour(value: string, theme: Theme): string {
  const v = value.trim().toLowerCase();
  if (theme.colors[v] && theme.colors[v].toLowerCase() !== v) return tikzColour(theme.colors[v], theme);
  if (TIKZ_COLOURS.has(v)) return v;
  const rgb = colourAsRgb(v);
  return rgb ? `color={rgb,255:red,${rgb[0]};green,${rgb[1]};blue,${rgb[2]}}` : "black";
}

/** The TikZ-Feynman key for a line; how it looks is set once per picture (websiteLook). */
function tikzLineStyle(e: Edge, theme: Theme, look: Look): string {
  const { line, arrow, cls, heavy } = e.style;
  const charged = arrow === 1 ? "" : arrow === -1 ? "anti " : undefined;
  let key: string;
  switch (line) {
    case "plain": key = arrow === 2 ? (e.style.arrowsApart ? "anti majorana" : "majorana") : charged === undefined ? "plain" : `${charged}fermion`; break;
    case "wave": key = charged === undefined ? "photon" : `${charged}charged boson`; break;
    case "coil": key = "gluon"; break;
    case "dash": key = charged === undefined ? "scalar" : `${charged}charged scalar`; break;
    case "dot": key = "ghost"; break;
    case "double": key = "double"; break;
    case "triple": key = `double, double distance=${look.pt(theme.line.tripleSeparation * 2)}`; break;
    case "none": key = "draw=none"; break;
    default: key = "plain";
  }
  const colour = cls === "susy" ? tikzColour(theme.susyColor, theme) : e.style.color ? tikzColour(e.style.color, theme) : undefined;
  const width = cls === "susy" ? `line width=${look.pt(theme.line.susy)}` : heavy ? `line width=${look.pt(theme.line.heavy)}` : undefined;
  return [key, colour, width].filter(Boolean).join(", ");
}

/** Sizes from the website's look (in px against a propagator of unitX px) as TeX lengths. */
interface Look { pt: (px: number) => string }

function lookAt(theme: Theme, unitCm: number): Look {
  const ptPerPx = (unitCm * 28.4528) / theme.unitX;
  return { pt: (px: number) => `${(Math.round(px * ptPerPx * 100) / 100).toFixed(2)}pt` };
}

/**
 * The website's look as options for one picture, so a PDF looks like the page: line widths,
 * arrowheads, waves, coils, dashes, dots, blobs and label sizes from the theme, scaled to this
 * picture's propagator length. TikZ-Feynman's line styles are redrawn with standard TikZ
 * decorations (a coil at zero aspect is a sine wave), which draw at any length and which LaTeXML,
 * arXiv's HTML converter, draws too; its arrow is feynjs's notched one.
 */
function websiteLook(theme: Theme, look: Look): string[] {
  const { line, vertex } = theme, pt = look.pt;
  const arrow = (dir: 1 | -1) => {
    const L = line.arrowLength, W = line.arrowWidth / 2, x = (f: number) => pt(dir * f * L);
    return `{markings, mark=at position 0.5 with {\\fill (${x(0.5)},0pt) -- (${x(-0.5)},${pt(W)}) -- (${x(-0.28)},0pt) -- (${x(-0.5)},${pt(-W)}) -- cycle;}}`;
  };
  const wave = `{/tikz/draw=none, /tikz/decoration={name=none}, /tikz/postaction={/tikz/draw, /tikz/decoration={coil, aspect=0, amplitude=${pt(line.waveAmplitude)}, segment length=${pt(line.waveLength)}}, /tikz/decorate=true}}`;
  const font = `\\fontsize{${pt(theme.fontSize)}}{${pt(theme.fontSize * 1.2)}}\\selectfont`;
  return [
    `line width=${pt(line.stroke)}`,
    `font=${font}`,
    `/tikzfeynman/with arrow/.style={/tikz/decoration=${arrow(1)}, /tikz/postaction={/tikz/decorate=true}}`,
    `/tikzfeynman/with reversed arrow/.style={/tikz/decoration=${arrow(-1)}, /tikz/postaction={/tikz/decorate=true}}`,
    `/tikzfeynman/every photon@@/.style=${wave}`,
    `/tikzfeynman/every boson@@/.style=${wave}`,
    `/tikzfeynman/every gluon@@/.style={/tikz/draw=none, /tikz/decoration={name=none}, /tikz/postaction={/tikz/draw, /tikz/decoration={coil, aspect=${line.coilAspect}, mirror, amplitude=${pt(line.coilRadius)}, segment length=${pt(line.coilPitch)}}, /tikz/decorate=true}}`,
    `/tikzfeynman/every scalar@@/.style={/tikz/draw=none, /tikz/decoration={name=none}, /tikz/postaction={/tikz/draw, /tikz/dash pattern=on ${pt(line.dash)} off ${pt(line.dashGap)}}}`,
    `/tikzfeynman/every ghost@@/.style={/tikz/draw=none, /tikz/decoration={name=none}, /tikz/postaction={/tikz/draw, /tikz/line cap=round, /tikz/dash pattern=on 0pt off ${pt(line.dotGap)}}}`,
    `/tikzfeynman/every dot/.style={/tikz/minimum size=${pt(vertex.dot * 2)}}`,
    `/tikzfeynman/every crossed dot/.style={/tikz/minimum size=${pt(vertex.crossedDot * 2)}}`,
    `/tikzfeynman/every blob/.style={/tikz/minimum size=${pt(vertex.blob * 2)}}`,
    `every label/.style={inner sep=${pt(theme.labelGap)}}`,
    `/tikz/double distance=${pt(line.doubleSeparation)}`,
  ];
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

interface Point { x: number; y: number }

/** One vertex, at its place: its shape only (its label is one of the scene's, placed as the page places it). */
function vertexLine(v: Vertex, at: Point): string {
  const shape = v.shape !== "none" ? `[${VERTEX_SHAPES[v.shape]}]` : "";
  return `  \\vertex${shape} (${tikzName(v.id)}) at (${cm(at.x)}, ${cm(at.y)})${v.shape !== "none" ? " {}" : ""};`;
}

/**
 * The hadrons as the web page draws them: a brace beside the quark lines (each curl the page's
 * quadratic curve, written as TikZ's cubic), or a shaded ellipse or cap over their ends.
 */
function hadronShapes(scene: Scene, unit: number, theme: Theme, look: Look): string[] {
  const cmPerPx = unit / theme.unitX;
  const at = (x: number, y: number) => `(${cm(x * cmPerPx)}, ${cm(-y * cmPerPx)})`;
  return scene.shapes.map((shape) => {
    if (shape.kind === "brace") {
      const { x, top, bottom, depth } = shape, middle = (top + bottom) / 2, spine = x + depth / 2, tip = x + depth;
      const curl = Math.min(Math.abs(depth) * 0.6, (bottom - top) / 4);
      const curve = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) =>
        ` .. controls ${at(x0 + (2 / 3) * (cx - x0), y0 + (2 / 3) * (cy - y0))} and ${at(x1 + (2 / 3) * (cx - x1), y1 + (2 / 3) * (cy - y1))} .. ${at(x1, y1)}`;
      const path = at(x, top) + curve(x, top, spine, top, spine, top + curl) + ` -- ${at(spine, middle - curl)}`
        + curve(spine, middle - curl, spine, middle, tip, middle) + curve(tip, middle, spine, middle, spine, middle + curl)
        + ` -- ${at(spine, bottom - curl)}` + curve(spine, bottom - curl, spine, bottom, x, bottom);
      return `  \\draw[${tikzColour(shape.color, theme)}, line width=${look.pt(shape.width)}, line cap=round] ${path};`;
    }
    const fill = shape.hatched ? "pattern=north west lines" : fillWithOpacity(shape.fill, theme);
    return `  \\draw[${fill}, line width=${look.pt(shape.width)}, rotate around={${(-shape.angle).toFixed(1)}:${at(shape.cx, shape.cy)}}] ${at(shape.cx, shape.cy)} ellipse [x radius=${cm(shape.rx * cmPerPx)}, y radius=${cm(shape.ry * cmPerPx)}];`;
  });
}

/** A fill colour as TikZ options, with its transparency kept (rgba(..., 0.2) -> fill opacity=0.2). */
function fillWithOpacity(value: string, theme: Theme): string {
  const alpha = /^rgba\([^)]*,\s*([\d.]+)\s*\)$/.exec(value.trim());
  const colour = tikzColour(value, theme).replace(/^color=/, "");
  return `fill=${colour}${alpha ? `, fill opacity=${alpha[1]}` : ""}`;
}

/**
 * Every label exactly where the web page puts it: the scene's placements (leg names, line labels,
 * couplings, momenta, hadron names), each a node on its baseline, at the page's size.
 */
function labelNodes(scene: Scene, unit: number, theme: Theme, look: Look): string[] {
  const cmPerPx = unit / theme.unitX;
  return scene.placedLabels.map((l) => {
    const colour = l.color ? `, ${tikzColour(l.color, theme)}` : "";
    const font = `\\fontsize{${look.pt(l.size)}}{${look.pt(l.size * 1.2)}}\\selectfont`;
    return `  \\node[anchor=base west, inner sep=0pt, font=${font}${colour}] at (${cm(l.x * cmPerPx)}, ${cm(-l.baseline * cmPerPx)}) {\\(${l.tex}\\)};`;
  });
}

/** Every vertex's place on the page, in cm, y up. */
function placesInCm(d: Diagram, unit: number, rowOverRank: number): Map<string, Point> {
  return new Map([...d.vertices.values()].map((v) => [v.id, { x: v.x * unit, y: -v.y * rowOverRank * unit }]));
}

/** One line; its label, if any, is among the scene's labels. A momentum keeps its arrow here. */
function edgeLine(e: Edge, theme: Theme, look: Look): string {
  const options = [tikzLineStyle(e, theme, look), tikzBend(e.bend),
    e.momentum ? `momentum${e.momentumOtherSide ? "'" : ""}={}` : undefined].filter(Boolean);
  return `    (${tikzName(e.from)}) -- [${options.join(", ")}] (${tikzName(e.to)}),`;
}

/** A laid-out diagram as one TikZ-Feynman picture, with every vertex at the place feynjs chose. */
function pictureOf(d: Diagram, scene: Scene, unit: number): string {
  const theme = scene.theme, look = lookAt(theme, unit);
  const places = placesInCm(d, unit, theme.unitY / theme.unitX);
  const vertices = [...d.vertices.values()].map((v) => vertexLine(v, places.get(v.id)!));
  const edges = d.edges.map((e) => edgeLine(e, theme, look));
  const options = [...inlineBaseline(d), ...websiteLook(theme, look)].map((o) => `  ${o},`);
  return ["\\begin{tikzpicture}[", ...options, "]", "\\begin{feynman}", ...vertices, "  \\diagram*{", ...edges, "  };",
    ...hadronShapes(scene, unit, theme, look), ...labelNodes(scene, unit, theme, look), "\\end{feynman}", "\\end{tikzpicture}"].join("\n");
}

/**
 * `inline: a` puts point a on the math axis of the line of text, where an equation's middle sits,
 * as the web page does: the picture's baseline is that far below a.
 */
function inlineBaseline(d: Diagram): string[] {
  const id = d.directives.inline?.trim().replace(/^\((.*)\)$/, "$1");
  return id && d.vertices.has(id) ? [`baseline={([yshift=-${MATH_AXIS_EM}em]${tikzName(id)}.base)}`] : [];
}

/** One panel's source, laid out and labelled exactly as render() draws it, then written as a picture. */
function panelPicture(source: string, overrides: ThemeOverrides, unit: number): string {
  const d = parse(source);
  const { scene } = drawDiagram(d, { theme: overrides });
  return pictureOf(d, scene, unit);
}

/** Several panels (`--- (b) caption`) side by side, each captioned beneath, joiners between. */
function panelsSideBySide(panels: Panel[], overrides: ThemeOverrides, unit: number): string {
  return panels.map((panel) => {
    const joiner = panel.joiner ? `\\raisebox{1.5em}{${latexText(panel.joiner)}}\n\\quad\n` : "";
    const caption = panel.caption ? `\\\\[2pt]\n${latexText(panel.caption)}` : "";
    return `${joiner}\\begin{tabular}[b]{@{}c@{}}\n${panelPicture(panel.source, overrides, unit)}${caption}\n\\end{tabular}`;
  }).join("\n\\quad\n");
}

/** Caption text, with the characters LaTeX treats specially escaped. */
function latexText(text: string): string {
  return text.replace(/[\\{}]/g, (c) => `\\${c === "\\" ? "textbackslash{}" : c}`).replace(/[%&#_$]/g, (c) => `\\${c}`);
}

function standaloneDocument(body: string): string {
  return ["\\documentclass[border=3pt]{standalone}", "\\usepackage{amsmath}", "\\usepackage{tikz-feynman}", "\\tikzfeynmanset{compat=1.1.0}",
    "\\begin{document}", body, "\\end{document}", ""].join("\n");
}

/**
 * Diagram source -> TikZ-Feynman, laid out by feynjs. The result compiles with pdflatex.
 * It looks like the web page: the theme's line widths and shapes, labels where the page puts
 * them, hadron braces and ellipses. Jets and overlaid SUSY lines are approximated. Panels are
 * set side by side.
 */
export function toTikz(source: string, options: TikzOptions = {}): string {
  const overrides = options.theme ?? {}, unit = options.unit ?? CM_PER_LINE_LENGTH;
  const panels = splitPanels(source);
  const body = panels.length <= 1 ? panelPicture(source, overrides, unit) : panelsSideBySide(panels, overrides, unit);
  return options.standalone ?? true ? standaloneDocument(body) : body;
}
