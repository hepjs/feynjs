import { test } from "node:test";
import assert from "node:assert/strict";
import { check, parse, render, toTikz } from "../src/index.ts";
import { fromTikzPicture } from "../src/parse/tikz-picture.ts";
import { layoutDiagram } from "../src/render/render.ts";
import { themeWith } from "../src/theme.ts";
import { layoutLabel } from "../src/label/label.ts";

// TikZ-Feynman's own syntax, read as it is written in papers: a picture pasted whole, and the
// keys feynjs takes on its own lines.

// (a pasted picture's places are written to a ten-thousandth of a cm)
const near = (a: number, b: number, why?: string) => assert.ok(Math.abs(a - b) < 1e-4, `${why ?? ""} ${a} is not ${b}`);
const edge = (source: string, k = 0) => parse(source).edges[k];
const places = (source: string) => {
  const d = parse(source);
  layoutDiagram(d, themeWith({ engine: "v2" }));
  return Object.fromEntries([...d.vertices.values()].map((v) => [v.id, [v.x, v.y]]));
};

const BHABHA = String.raw`\feynmandiagram [horizontal=a to b] {
  i1 [particle=\(e^-\)] -- [fermion] a -- [fermion] i2 [particle=\(e^+\)],
  a -- [photon] b,
  f1 [particle=\(\mu^+\)] -- [fermion] b -- [fermion] f2 [particle=\(\mu^-\)],
};`;

test("a \\feynmandiagram pasted whole draws as the same diagram written in feynjs's lines", () => {
  const own = String.raw`horizontal: a to b
i1 [particle=\(e^-\)] -- [fermion] a -- [fermion] i2 [particle=\(e^+\)]
a -- [photon] b
f1 [particle=\(\mu^+\)] -- [fermion] b -- [fermion] f2 [particle=\(\mu^-\)]`;
  assert.deepEqual(places(BHABHA), places(own));
  const d = parse(BHABHA);
  assert.equal(d.vertices.get("i1")!.label, "{e^-}", "the particle text, as TikZ sets it");
  assert.equal(d.directives.horizontal, "a to b");
  assert.deepEqual(check(BHABHA), []);
  assert.match(render(BHABHA), /<svg/);
});

test("a feynman environment: \\vertex places points in cm, the first with no place at the origin", () => {
  const d = parse(String.raw`\begin{tikzpicture}
  \begin{feynman}
    \vertex (a);
    \vertex [right=of a] (b);
    \vertex [above left=of a] (i1) {\(e^-\)};
    \vertex (f) at (3, 1) {\(\mu^-\)};
    \vertex [dot] (g) at (30:2) {};
    \diagram* {
      (i1) -- [fermion] (a) -- [photon] (b),
      (b) -- [fermion] (f), (b) -- (g),
    };
  \end{feynman}
\end{tikzpicture}`);
  const at = (id: string) => d.vertices.get(id)!.fixed!;
  assert.deepEqual(at("a"), { x: 0, y: 0 });
  // (TikZ-Feynman's node distance, 1.5cm, at 1.6cm a line; on a diagonal, that far along it)
  near(at("b").x, 1.5 / 1.6, "right=of a");
  near(at("i1").x, (-1.5 * 0.707106781) / 1.6);
  near(at("i1").y, (1.5 * 0.707106781) / 1.6);
  near(at("f").x, 3 / 1.6, "a bare number is cm, as TikZ reads it");
  near(at("g").y, 1 / 1.6, "(30:2) is 2cm at 30 degrees");
  assert.equal(d.vertices.get("g")!.shape, "dot");
  assert.equal(d.vertices.get("i1")!.label, "{e^-}");
  assert.equal(d.edges.length, 4);
});

test("a chain runs over several lines; groups join every point in them", () => {
  const d = parse(String.raw`\feynmandiagram [small] {
  a -- [fermion]
    b -- {c, d},
  {e, f} -- [gluon] a,
};`);
  assert.deepEqual(d.edges.map((e) => `${e.from}-${e.to}`), ["a-b", "b-c", "b-d", "e-a", "f-a"]);
  assert.equal(d.edges[3].style.line, "coil");
  assert.equal(d.directives.size, "small");
});

test("an error in a pasted picture names the line it is on", () => {
  assert.throws(() => parse("\\begin{feynman}\n\\vertex (a);\n\\draw (a) -- (b);\n\\end{feynman}"), /line 3: .*not \\draw/);
  assert.throws(() => parse("\\feynmandiagram {\n  a -- b,\n  b -- [thick] c,\n};"), /line 3: .*"thick"/);
});

test("feynjs's own lines are not read as TikZ (no picture, nothing rewritten)", () => {
  const own = "i1 [e-] -- a -- i2 [e+]\na -- [gamma] b";
  assert.equal(fromTikzPicture(own), own);
});

test("the picture's options: horizontal, sizes, inline, TikZ layouts; the rest named by check()", () => {
  const d = parse(String.raw`\begin{tikzpicture}[baseline=(a.base), thick]
\feynmandiagram [vertical'=a to b, large, spring layout] { a -- [photon] b };
\end{tikzpicture}`);
  assert.equal(d.directives["vertical'"], "a to b");
  assert.equal(d.directives.size, "large");
  assert.equal(d.directives.inline, "a");
  assert.equal(d.directives.layout, "spring layout");
  const findings = check(String.raw`\feynmandiagram [layered layout, scale=2] { i [particle=\(e\)] -- [photon] f [particle=\(e\)] };`);
  assert.ok(findings.some((f) => f.severity === "info" && /layered layout.*feynjs's own/.test(f.message)));
  assert.ok(findings.some((f) => f.rule === "tikz-option" && /scale=2/.test(f.message)));
  // ([horizontal=a to b] on a line of its own is the same, in feynjs's lines)
  const own = parse("[horizontal=a to b, small, tree layout]\na -- b -- c");
  assert.deepEqual([own.directives.horizontal, own.directives.size, own.directives.layout], ["a to b", "small", "tree layout"]);
  assert.equal(parse("[inline=(a)]\na -- b").directives.inline, "a");
  assert.match(render("size: medium\na -- b"), /<svg/);
});

test("\\tikzfeynmanset's every ... /.style is a default for every line of a kind", () => {
  const d = parse("\\tikzfeynmanset{every photon/.style={blue}}\n\\feynmandiagram { a -- [photon] b -- [fermion] c };");
  assert.equal(d.edges[0].style.color, "blue");
  assert.equal(d.edges[1].style.color, undefined);
});

test("placing: units, polar places, anchors, options before at", () => {
  const d = parse("a [dot] at (1.6cm, 8mm)\nb at (90:2)\nc [right=1.6cm of a.east]\nd [above right=1 and 2 of (a)]\ne at (a)\na -- b -- c -- d -- e");
  const at = (id: string) => d.vertices.get(id)!.fixed!;
  near(at("a").x, 1); near(at("a").y, 0.5);
  assert.equal(d.vertices.get("a")!.shape, "dot");
  near(at("b").x, 0); near(at("b").y, 2, "(90:2) is 2 line lengths straight up");
  near(at("c").x, 2); near(at("c").y, 0.5);
  near(at("d").x, 3); near(at("d").y, 1.5);
  assert.deepEqual(at("e"), at("a"));
  assert.throws(() => parse("a at (1furlong, 0)\na -- b"), /not a length/);
});

test("names written as TikZ writes them, (a) and a.east, are the point a", () => {
  const d = parse("(a) -- [fermion] (b.east)\nb.west -- c");
  assert.deepEqual(d.edges.map((e) => `${e.from}-${e.to}`), ["a-b", "b-c"]);
});

test("bend left=60, bend right=60", () => {
  assert.equal(edge("a -- [bend left=60] b").bend, 60);
  assert.equal(edge("a -- [bend right=60] b").bend, -60);
});

test("a looseness with a bend draws the curve TikZ draws, not the circle", () => {
  const circle = render("a at (0,0)\nb at (2,0)\na -- [half left] b");
  const loose = render("a at (0,0)\nb at (2,0)\na -- [half left, looseness=1.8] b");
  assert.notEqual(circle, loose);
  assert.deepEqual(edge("a -- [half left, looseness=1.8] b").angles, { looseness: 1.8 });
});

test("a loop: out and in turn it, min distance sets how far it reaches", () => {
  const e = edge("x -- a -- y\na -- [scalar, loop, min distance=2cm, out=135, in=45] a", 2);
  assert.deepEqual(e.angles, { out: 135, in: 45 });
  near(e.loopReach!, 2 / 1.6);
  const round = render("x -- a -- y\na -- [scalar] a");
  assert.notEqual(render("x -- a -- y\na -- [scalar, out=135, in=45] a"), round);
  assert.notEqual(render("x -- a -- y\na -- [scalar, out=-45, in=-135] a"), render("x -- a -- y\na -- [scalar, out=135, in=45] a"));
  assert.equal(render("x -- a -- y\na -- [scalar, loop] a"), round, "a bare loop is feynjs's own");
});

test("draw=none is an invisible line", () => {
  assert.deepEqual(edge("a -- [draw=none] b").style, edge("a -- [invisible] b").style);
  assert.throws(() => parse("a -- [draw=red] b"), /unknown edge option "draw"/);
});

test("[plain, gluon] and [boson, plain]: the straight line over the coil or wave, feynjs's overlay", () => {
  assert.deepEqual(edge("a -- [plain, gluon] b").style, { line: "coil", arrow: 0, overlay: true });
  assert.deepEqual(edge("a -- [boson, plain] b").style, { line: "wave", arrow: 0, overlay: true });
  assert.deepEqual(edge("a -- [gluon, overlay] b").style, edge("a -- [plain, gluon] b").style);
  assert.deepEqual(edge("a -- [plain, fermion] b").style, { line: "plain", arrow: 1 }, "two straight lines are one");
});

test("anti majorana's arrows point apart, majorana's at each other", () => {
  assert.equal(edge("a -- [anti majorana] b").style.arrowsApart, true);
  const svg = (style: string) => render(`a at (0,0)\nb at (3,0)\na -- [${style}] b`);
  assert.notEqual(svg("anti majorana"), svg("majorana"));
  assert.match(toTikz("a -- [anti majorana] b", { standalone: false }), /\[anti majorana\]/);
});

test("momentum={[arrow shorten=0.3]q}: TikZ-Feynman's own options dropped, q kept", () => {
  assert.equal(edge(String.raw`a -- [photon, momentum={[arrow shorten=0.3]\(q\)}] b`).momentum, "q");
});

test("bare insertion and with arrow sit halfway; insertion={[size=5pt]0.3} keeps 0.3", () => {
  assert.deepEqual(edge("a -- [scalar, insertion, insertion={[size=5pt]0.3}] b").insertions, [0.5, 0.3]);
  assert.deepEqual(edge("a -- [with arrow, with reversed arrow] b").style.arrowsAt, [{ at: 0.5, dir: 1 }, { at: 0.5, dir: -1 }]);
});

test("a vertex's label=above:\\(g\\): the side, then the text", () => {
  const d = parse(String.raw`a [label=above:\(g\)] -- b [label=below left:\(g_s\)] -- c [label=0:x]`);
  const v = (id: string) => d.vertices.get(id)!;
  assert.equal(v("a").coupling, "g");
  assert.deepEqual(v("a").couplingSide, { x: 0, y: -1 });
  assert.equal(v("b").coupling, "g_s");
  near(v("b").couplingSide!.x, -Math.SQRT1_2); near(v("b").couplingSide!.y, Math.SQRT1_2);
  assert.equal(v("c").coupling, "x");
  near(v("c").couplingSide!.x, 1);
  assert.equal(parse("a [label=g, label side=above] -- b").vertices.get("a")!.coupling, "g", "feynjs's own form, unchanged");
});

test(`the quotes on a line: "\\(\\gamma\\)" is edge label, "..."' edge label'`, () => {
  const d = parse(String.raw`a -- [photon, "\(\gamma\)"] b -- [photon, "\(Z, W\)"'] c`);
  assert.deepEqual([d.edges[0].label, d.edges[0].labelSide], ["\\gamma", 1]);
  assert.deepEqual([d.edges[1].label, d.edges[1].labelSide], ["Z, W", -1]);
});

test("a pasted picture's edge labels sit on the left of the line, as TikZ puts them", () => {
  // (the label's baseline, and the line's height, in the SVG)
  const labelBelowLine = (svg: string) => Number(/feynjs-labels"><g transform="translate\([-\d.]+ ([-\d.]+)\)/.exec(svg)![1]) > 0;
  const pasted = (from: string, to: string) => `\\begin{feynman}\n\\vertex (a) at (0,0);\n\\vertex (b) at (3.2,0);\n\\diagram* { (${from}) -- [photon, edge label=x] (${to}) };\n\\end{feynman}`;
  assert.equal(parse(pasted("a", "b")).directives["edge labels"], "left");
  // (a to b runs rightward, its left above; b to a leftward, its left below, where feynjs alone puts it above)
  assert.equal(labelBelowLine(render(pasted("a", "b"))), false);
  assert.equal(labelBelowLine(render(pasted("b", "a"))), true);
  assert.equal(labelBelowLine(render("a at (0,0)\nb at (2,0)\nb -- [photon, edge label=x] a")), false);
  assert.equal(labelBelowLine(render("edge labels: left\na at (0,0)\nb at (2,0)\nb -- [photon, edge label=x] a")), true);
});

test("\\slashed{p} is drawn as a slashed p, as wide as p", () => {
  const slashed = layoutLabel("\\slashed{p}", 20), p = layoutLabel("p", 20);
  assert.equal(slashed.width, p.width);
  assert.match(slashed.svg, /<path/);
});

test("check() names switches, layouts and label commands feynjs passes over", () => {
  const rules = (source: string) => check(source).map((f) => f.rule);
  assert.ok(rules("layout: banana\ni [e-] -- [photon] f [e-]").includes("unknown-layout"));
  assert.ok(rules("node distance: 2\ni [e-] -- [photon] f [e-]").includes("unknown-switch"));
  assert.ok(rules("i [e-] -- [photon, label=\\frac{1}{2}] f [e-]").includes("label-command"));
  assert.ok(!rules("i [e-] -- [photon, label=\\slashed{k}] f [e-]").includes("label-command"));
  assert.deepEqual(check("layout: grid\nscale: 1.2\ni [e-] -- [photon, label=\\tilde{\\gamma}] f [e-]").filter((f) => f.rule !== "no-incoming"), []);
});
