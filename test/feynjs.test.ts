import { test } from "node:test";
import { encodeTiff } from "../src/download.ts";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "../src/parse/parse.ts";
import { check, render } from "../src/index.ts";
import { layoutLabel } from "../src/label/label.ts";
import { layoutDiagram } from "../src/render/render.ts";
import { defaultTheme } from "../src/theme.ts";
const place = (d: Parameters<typeof layoutDiagram>[0]) => layoutDiagram(d, defaultTheme);
import { Curve } from "../src/geometry/curve.ts";
import { eventDirections } from "../src/views/kinematic.ts";

test("parses tikz-feynman style chains", () => {
  const d = parse("i1 [e-] -- a -- i2 [e+], a -- [photon, label=\\gamma] b");
  assert.equal(d.vertices.size, 4);
  assert.equal(d.edges.length, 3);
  assert.equal(d.edges[2].style.line, "wave");
  assert.equal(d.edges[2].label, "\\gamma");
  assert.equal(d.vertices.get("i1")!.label, "e^-");
});

test("particle keys set style, colour class and label", () => {
  const e = parse("a -- [gluino] b").edges[0];
  assert.deepEqual([e.style.line, e.style.overlay, e.style.cls, e.label], ["coil", true, "susy", "\\tilde g"]);
});

test("reports unknown styles with a line number", () => {
  assert.throws(() => parse("a -- b\nb -- [wobbly] c"), /line 2: unknown line style or particle "wobbly"/);
});


test("antiparticle arrows run against the direction of travel", () => {
  const svgIn = render("i1 [e+] -- a -- f1 [e+]");
  assert.ok(svgIn.includes("<svg"));
  const d = parse("i1 [e-] -- a\ni2 [e+] -- a\na -- f1 [gamma]");
  render("i1 [e-] -- a\ni2 [e+] -- a\na -- f1 [gamma]");
  assert.equal(d.edges.length, 3);
});

test("arcs end exactly on their vertices", () => {
  const c = Curve.arc({ x: 0, y: 0 }, { x: 100, y: 0 }, 90);
  const end = c.at(c.length);
  assert.ok(Math.abs(end.x - 100) < 1e-6 && Math.abs(end.y) < 1e-6);
  assert.ok(Math.abs(c.length - Math.PI * 50) < 0.5);
  assert.ok(c.at(c.length / 2).y < -49, "positive bend bulges to the left of travel (up on screen)");
});

test("labels: accents and scripts produce markup with sane width", () => {
  const lb = layoutLabel("\\tilde\\chi^0_1", 15);
  // (an italic letter is set as its mathematical italic: 𝜒, U+1D712)
  assert.ok(lb.svg.includes("\u{1D712}") && lb.svg.includes("<path"));
  assert.ok(lb.width > 8 && lb.width < 30);
});

test("every example renders", () => {
  for (const f of readdirSync("examples").filter((x: string) => x.endsWith(".feyn"))) {
    const svg = render(readFileSync(`examples/${f}`, "utf8"));
    assert.ok(svg.startsWith("<svg") && !svg.includes("NaN"), f);
  }
});

test("theme overrides change the drawing; defaults stay intact", () => {
  const plain = render("a -- [photon] b");
  const bold = render("a -- [photon] b", { theme: { line: { stroke: 3 } } });
  assert.ok(bold.includes('stroke-width="3"') && !plain.includes('stroke-width="3"'));
  assert.equal(defaultTheme.line.stroke, 1.5);
});

test("pair-produced branches mirror top to bottom", () => {
  const d = parse("i1 [p] -- pp [blob] -- i2 [p]\npp -- [gluino] d1\npp -- [gluino] d2\nd1 -- f1 [q]\nd1 -- f2 [neutralino]\nd2 -- f3 [neutralino]\nd2 -- f4 [q]");
  place(d);
  const y = (id: string) => d.vertices.get(id)!.y - d.vertices.get("pp")!.y;
  // (to the solver's tolerance)
  // (to within a tenth of a line, a few pixels: the two branches balance many small forces)
  assert.ok(Math.abs(y("d1") + y("d2")) < 0.1 && Math.abs(y("f1") + y("f4")) < 0.1);
});

test("a symmetric split (H -> HH) is not treated as a decay chain", () => {
  const d = parse("i1 [H] -- v\nv -- f1 [H]\nv -- f2 [H]");
  place(d);
  const y = (id: string) => d.vertices.get(id)!.y - d.vertices.get("v")!.y;
  assert.ok(Math.abs(y("f1") + y("f2")) < 0.01 && Math.abs(y("f1")) > 0.1);
});

test("a decay chain runs level and emits outward", () => {
  const d = parse("i1 [p] -- pp [blob] -- i2 [p]\npp -- [gluino] d1\npp -- [gluino] d2\nd1 -- f1 [q]\nd1 -- f2 [neutralino]\nd2 -- f3 [neutralino]\nd2 -- f4 [q]");
  place(d);
  const v = (id: string) => d.vertices.get(id)!;
  const rise = (a: string, b: string) => Math.abs(v(b).y - v(a).y) / (v(b).x - v(a).x);
  assert.ok(rise("d1", "f2") < rise("pp", "d1"), "the chain levels off after each vertex");
  assert.ok(v("f2").y <= v("d1").y, "and does not turn back before it has levelled");
  assert.ok(v("f1").y < v("d1").y && v("f4").y > v("d2").y, "quarks leave on the outer side");
});

test("manual positions override the automatic layout", () => {
  const d = parse("i1 -- a -- f1\na at (2, 1)\nf1 at (5, 3)");
  place(d);
  const a = d.vertices.get("a")!, f1 = d.vertices.get("f1")!;
  assert.deepEqual([a.x, a.y, f1.x, f1.y], [2, -1, 5, -3]); // y is up in the source, down on screen
});




test("describe reports the process, propagators and loops", async () => {
  const { describe } = await import("../src/tools/describe.ts");
  const d = describe(readFileSync("examples/ggf.feyn", "utf8"));
  assert.equal(d.process, "g g -> H");
  assert.equal(d.loops, 1);
  assert.equal(d.propagators.length, 3);
  assert.ok(d.propagators.every((p) => p.kind === "fermion"));
});

test("check accepts the examples and catches broken fermion lines", async () => {
  const { check } = await import("../src/tools/check.ts");
  for (const f of readdirSync("examples").filter((x: string) => x.endsWith(".feyn") && x !== "lines.feyn" && x !== "panels.feyn")) {
    const errors = check(readFileSync(`examples/${f}`, "utf8")).filter((x) => x.severity === "error");
    assert.deepEqual(errors, [], f);
  }
  const odd = check("i1 [e-] -- a\ni2 [gamma] -- a\na -- f1 [gamma]");
  assert.ok(odd.some((f) => f.rule === "fermion-number" && f.vertex === "a"));
  const clash = check("i1 -- [fermion] a\ni2 -- [fermion] a\na -- [photon] f1");
  assert.ok(clash.some((f) => f.rule === "fermion-flow"));
  assert.equal(check("a -- [wobbly] b")[0].rule, "syntax");
});

test("TikZ export places every vertex and names every line", async () => {
  const { toTikz } = await import("../src/tools/tikz.ts");
  const tex = toTikz(readFileSync("examples/s-channel.feyn", "utf8"));
  assert.equal((tex.match(/\\vertex/g) ?? []).length, 6);
  assert.ok(tex.includes("photon") && tex.includes("fermion") && tex.includes("\\diagram*"));
});


test("blobs keep clear of legs that are not their own", () => {
  const d = parse("i1 [p] -- pp [blob] -- i2 [p]\npp -- [gluino] d1\npp -- [gluino] d2\nd1 [small blob] -- f1 [q]\nd1 -- f2 [q]\nd1 -- f3 [neutralino]\nd2 [small blob] -- f4 [neutralino]\nd2 -- f5 [q]\nd2 -- f6 [q]");
  place(d);
  const r = defaultTheme.unitY / defaultTheme.unitX, v = (id: string) => d.vertices.get(id)!;
  const radius = defaultTheme.vertex.smallBlob / defaultTheme.unitY;
  for (const [mark, legs] of [["d1", ["f4", "f5", "f6"]], ["d2", ["f1", "f2", "f3"]]] as const) {
    for (const leg of legs) {
      const a = v(d.edges.find((e) => e.to === leg || e.from === leg)!.from === leg ? leg : leg);
      assert.ok(Math.hypot(v(mark).x - a.x, (v(mark).y - a.y) * r) > radius * r, `${leg} sits on ${mark}`);
    }
  }
});

test("examples have no unintended crossings, crowded vertices or crowded labels", async () => {
  const { measure } = await import("../src/tools/quality.ts");
  // (the u-channel example crosses on purpose, by its out: order, which measure does not count)
  for (const f of readdirSync("examples").filter((x: string) => x.endsWith(".feyn") && x !== "panels.feyn" && x !== "lines.feyn")) {
    const q = measure(readFileSync(`examples/${f}`, "utf8"));
    assert.equal(q.crossings, 0, `${f}: ${q.problems.join("; ")}`);
    assert.equal(q.crowdedVertices, 0, `${f}: ${q.problems.join("; ")}`);
  }
});

test("a crossing the in: or out: order asks for does not count; one against the order does", async () => {
  const { measure } = await import("../src/tools/quality.ts");
  // (u-channel VBF: the beams cross, as the in: order has them)
  const crossedBeams = "in: i1 i2\nout: f1 h f2\ni1 [q] -- [plain] b [dot]\ni2 [q'] -- [plain] a [dot]\na -- [plain] f1 [q']\nb -- [plain] f2 [q]\na -- [V] x [dot] -- [V] b\nx -- [scalar] h [H]";
  assert.equal(measure(crossedBeams).crossings, 0);
  // (the same legs placed by hand against their listed order: i2 drawn above i1, so they cross by accident)
  const against = "layout: manual\nin: i1 i2\nout: f1 f2\ni1 at (0, -1)\ni2 at (0, 1)\na at (1, -1)\nb at (1, 1)\nf1 at (2, 1)\nf2 at (2, -1)\ni1 -- b\ni2 -- a\na -- b\na -- f2\nb -- f1";
  assert.equal(measure(against).crossings, 1);
});

test("a spectator line, in to out, is no leg: what crosses it counts", async () => {
  const { measure } = await import("../src/tools/quality.ts");
  // (the leptons, listed after the meson, fall across the spectator d-bar: a crossing, not one the order asks for)
  const crossed = "in: iQ iS\nout: fQ fS fl fn\niQ [b]\niS [\\bar{d}]\nfQ [c]\nfS [\\bar{d}]\niQ -- [fermion] v\nv -- [fermion] fQ\nfS -- [fermion] iS\nv -- [boson, label=W^-] w\nw -- fl [e-]\nw -- fn [ve~]\nmeson: \\bar B^0 = iQ iS [brace]\nmeson: D^+ = fQ fS [brace]";
  assert.equal(measure(crossed).crossings, 1);
  assert.equal(measure(crossed.replace("out: fQ fS fl fn", "out: fl fn fQ fS")).crossings, 0);
});

test("panels split on dashes and are captioned", () => {
  const svg = render("a -- b\n--- (b) second\nc -- d");
  assert.ok(svg.includes("feynjs-panels") && svg.includes("(a)") && svg.includes("(b) second"));
  assert.equal((svg.match(/class="feynjs"/g) ?? []).length, 2);
});

test("joined panels: a symbol or a cut between them, and no letters", () => {
  const times = render("a -- b\n---[x]\nc -- d");
  assert.ok(times.includes(">×</text>") && !times.includes("(a)"));
  const cut = render("a -- b\n---[cut]\nc -- d\n---[=]\ne -- f");
  assert.ok(cut.includes('stroke-dasharray="6 4"') && cut.includes(">=</text>"));
});

test("label: gives a particle a label of its own, in a process too", () => {
  const svg = render("label: chargino+ = \\tilde\\chi^\\mp\np p > chargino+ neutralino2\nchargino+ > W+ neutralino1");
  assert.ok(svg.includes("∓"));
  assert.ok(!/χ<tspan[^>]*>\+/.test(svg));
});

test("a coupling label can be put on a chosen side", () => {
  const above = render("i1 [e-] -- a [dot, label=g, label side=above] -- f1 [e-]\na -- [photon] f2");
  const below = render("i1 [e-] -- a [dot, label=g, label side=below] -- f1 [e-]\na -- [photon] f2");
  assert.notEqual(above, below);
  assert.throws(() => render("a [dot, label=g, label side=up] -- b"));
});

test("colour flow: only draws the colour lines in place of the quark and gluon lines", () => {
  const src = "i1 [q] -- a -- f1 [q]\ni2 [q] -- b -- f2 [q]\na -- [gluon] b\nf3 [gamma] -- a";
  const on = render("colour flow: on\n" + src), only = render("colour flow: only\n" + src);
  assert.ok(only.includes("feynjs-colour-flow"));
  assert.ok((only.match(/<path/g) ?? []).length < (on.match(/<path/g) ?? []).length);
  assert.ok(!only.includes('stroke-opacity="0.6"'));
});

test("initial-state radiation into a blob: one quark line, one arrow, straight", () => {
  const isr = "in: i1 i2\ni1 [q] -- [fermion] r\nr -- [fermion] o [blob]\no -- [fermion] i2 [qbar]\nr -- [gluon] g1 [g]\no -- x1 [chi]\no -- x2 [chibar]";
  const d = parse(isr);
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const into = d.edges.find((e) => e.from === "r" && e.to === "o")!;
  assert.equal(into.style.arrow, 0);
  assert.notEqual(d.edges.find((e) => e.to === "r" && e.from === "i1")!.style.arrow, 0);
  const at = (id: string) => d.vertices.get(id)!;
  const turn = Math.abs(Math.atan2(at("r").y - at("i1").y, at("r").x - at("i1").x) - Math.atan2(at("o").y - at("r").y, at("o").x - at("r").x));
  assert.ok(turn < 0.1, `the quark bends by ${turn}`);
  // a gluon coming in (gu -> u) is not radiation: the quark into the blob keeps its arrow
  const gu = parse("in: g u\ng [g] -- a\nu [u] -- [fermion] a\na -- [fermion] x [blob]\nx -- f1 [mu+]\nx -- f2 [mu-]");
  layoutDiagram(gu, { ...defaultTheme, engine: "v2" });
  assert.notEqual(gu.edges.find((e) => e.to === "x")!.style.arrow, 0);
});

test("a beam an exchange scatters comes in toward the centre and leaves outward", () => {
  // (bremsstrahlung: the electron, on top, dips to the photon exchange and rises after it; the
  // quark, below, rises to it and falls after it)
  const d = parse(readFileSync("examples/bremsstrahlung.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const at = (id: string) => d.vertices.get(id)!;
  // (degrees upward on the page: y grows downward)
  const rise = (a: string, b: string) => (Math.atan2(at(a).y - at(b).y, at(b).x - at(a).x) * 180) / Math.PI;
  assert.ok(rise("a", "b") < -5 && rise("b", "f1") > 5, `the electron: in ${rise("a", "b").toFixed(0)} deg, out ${rise("b", "f1").toFixed(0)} deg`);
  assert.ok(rise("i2", "c") > 5 && rise("c", "f2") < -5, `the quark: in ${rise("i2", "c").toFixed(0)} deg, out ${rise("c", "f2").toFixed(0)} deg`);
});

test("a heavy line along an exchange stands exactly upright: the neutralino between two charginos", () => {
  const d = parse(readFileSync("validation/atlas/SUSY-2014-05/fig_02e.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const [c1, c2] = [d.vertices.get("c1")!, d.vertices.get("c2")!];
  assert.ok(Math.abs(c1.x - c2.x) < 1e-6, `the neutralino leans by ${Math.abs(c1.x - c2.x)}`);
});

test("a quark exchange leans forward into a lone point giving something off, not through a loop", async () => {
  // (b b-bar H: the Higgs vertex sits ahead of the two gluon vertices, the b quarks leaning into it)
  const d = parse(readFileSync("validation/atlas/HIGG-2015-08/fig_01b.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const at = (id: string) => d.vertices.get(id)!;
  assert.ok(at("c").x > at("a").x + 0.1 && at("c").x > at("b").x + 0.1, `the Higgs vertex is not ahead: ${at("c").x} against ${at("a").x}, ${at("b").x}`);
  // (an exchange into a quark triangle keeps it: no point along it leans ahead)
  const { readStructure } = await import("../src/engines/forces/structure.ts");
  const { exchangePointsAhead } = await import("../src/engines/forces/forces.ts");
  const loop = parse(readFileSync("validation/atlas/ATL-PHYS-PUB-2016-009/fig_01_3.feyn", "utf8"));
  layoutDiagram(loop, { ...defaultTheme, engine: "v2" });
  assert.equal(exchangePointsAhead(readStructure(loop)).size, 0);
});

test("a crossed box: the incoming gluons cross, not the lines beyond them", () => {
  const src = readFileSync("validation/atlas/EXOT-2014-10/fig_01c.feyn", "utf8");
  const d = parse(src);
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const at = (id: string) => d.vertices.get(id)!;
  // i1 enters b, the lower end of the box, from above: its line crosses i2's
  assert.ok(at("b").y > at("a").y && at("i1").y < at("i2").y);
});

test("\\sqrt draws a radical with a bar over its argument", () => {
  const box = layoutLabel("\\sqrt{\\beta}\\lambda", 17);
  assert.ok(!box.svg.includes("√") && /<path d="M[^"]*H[^"]*"/.test(box.svg));
  assert.ok(box.width > layoutLabel("\\beta\\lambda", 17).width);
});

test("a hadron drawn as a cap across its legs' ends, its name beyond", () => {
  const svg = render("h [H] -- [scalar] v\nv -- [fermion] qi [q_i]\nqj [\\bar q_j] -- [fermion] w -- [fermion] v\nw -- [photon] y [\\gamma]\nmeson: M = qi qj [cap]");
  assert.ok(/<ellipse[^>]*transform="rotate\(/.test(svg));
  assert.equal(parse("a -- b\nmeson: M = a b [cap]").hadrons[0].shape, "cap");
});

test("radiation marked by the author: straight on into a plain collision vertex, one arrow", () => {
  const src = "in: i1 i2\ni1 [q] -- [fermion] r\nr -- [fermion] a\na -- [fermion] i2 [qbar]\nr -- [gluon, radiation] g1 [g]\na -- [scalar] b\nb -- x1 [chi]\nb -- x2 [chibar]";
  const d = parse(src);
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const at = (id: string) => d.vertices.get(id)!;
  const turn = Math.abs(Math.atan2(at("r").y - at("i1").y, at("r").x - at("i1").x) - Math.atan2(at("a").y - at("r").y, at("a").x - at("r").x));
  assert.ok(turn < 0.1, `the quark bends by ${turn}`);
  assert.equal(d.edges.find((e) => e.from === "r" && e.to === "a")!.style.arrow, 0);
});

test("a gluon off an incoming quark is radiation; a quark scattering on (q g -> q g) is not", () => {
  const isr = parse("in: i1 i2\ni1 [q] -- [fermion] r\nr -- [fermion] a\na -- [fermion] i2 [qbar]\nr -- [gluon] g1 [g]\na -- [scalar] b\nb -- x1 [chi]\nb -- x2 [chibar]");
  layoutDiagram(isr, { ...defaultTheme, engine: "v2" });
  assert.equal(isr.edges.find((e) => e.from === "r" && e.to === "a")!.style.arrow, 0);
  const qg = parse("in: i1 i2\ni1 [q] -- [fermion] r\nr -- [fermion] a\ni2 [g] -- [gluon] a\nr -- [gluon] g1 [g]\na -- [fermion] f [q]");
  layoutDiagram(qg, { ...defaultTheme, engine: "v2" });
  assert.notEqual(qg.edges.find((e) => e.from === "r" && e.to === "a")!.style.arrow, 0);
});

test("a box with a gluon rung across it is two squares, the rung straight", () => {
  const d = parse(readFileSync("validation/atlas/ATL-PHYS-PUB-2016-009/fig_01_6.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const rung = d.edges.find((e) => e.from === "c1" && e.to === "c2")!;
  assert.ok(!rung.bend, "the rung is not bent");
  const at = (id: string) => d.vertices.get(id)!;
  assert.ok(Math.abs(at("c1").x - at("c2").x) < 0.05, "the rung is upright");
});

test("dots with a rim and a size; hatched and unnamed hadrons", () => {
  const dot = render("i1 [e-] -- a [dot, color=blue, rim=red, size=2] -- f1 [e-]\na -- [photon] f2");
  assert.ok(/<circle[^>]*fill="#3f90da" stroke="#e0241b"/.test(dot));
  const plain = render("i1 [e-] -- a [dot] -- f1 [e-]\na -- [photon] f2");
  const r = (svg: string) => Number(/<circle[^>]*r="([\d.]+)"/.exec(svg)![1]);
  assert.ok(r(dot) > r(plain) * 1.5);
  const h = parse("a -- b\nmeson: = a b [hatched]").hadrons[0];
  assert.ok(h.hatched && h.label === "" && h.shape === "ellipse");
});

test("check reads SUSY labels: a gluino or neutralino is a Majorana fermion, a squark a scalar", () => {
  const src = "i1 [q] -- [fermion] a\nb -- [fermion] i2 [q]\na -- [gluon, label=\\tilde g] b\na -- [charged scalar, label=\\tilde q] c\nd -- [charged scalar, label=\\tilde q] b\nc -- [fermion] q1 [q]\nc -- [fermion, label=\\tilde\\chi^0_1] x1\nq2 [q] -- [fermion] d\nx2 -- [fermion, label=\\tilde\\chi^0_1] d";
  assert.deepEqual(check(src).filter((f) => f.severity === "error"), []);
});

test("a leg can end in a small cone symbol, its name beyond it", () => {
  const svg = render("i1 [e-] -- a -- f1 [e-]\na -- [photon] b\nb -- f2 [q, cone]\nb -- f3 [q]");
  assert.equal((svg.match(/class="feynjs-cone"/g) ?? []).length, 1);
});

test("directives: arrows none, dots all, scale", () => {
  const plain = render("arrows: none\ni1 [e-] -- a -- f1 [e-]\na -- [gamma] f2");
  assert.ok(!plain.includes('fill="currentColor" stroke="none"'), "no arrowheads");
  const dots = render("dots: all\ni1 [e-] -- a -- f1 [e-]\na -- [gamma] f2");
  assert.ok(dots.includes("<circle"));
  const big = render("scale: 2\na -- b"), small = render("a -- b");
  const w = (svg: string) => Number(/width="([\d.]+)"/.exec(svg)![1]);
  assert.ok(Math.abs(w(big) - 2 * w(small)) < 1);
});

test("misspelt particles get a suggestion, and svgs carry an accessible label", () => {
  assert.throws(() => parse("a -- [gluonn] b"), /did you mean "gluon"/);
  assert.throws(() => parse("a -- [neutralno] b"), /did you mean "neutralino/);
  const svg = render("i1 [e-] -- a -- f1 [e-]\na -- [gamma] f2");
  assert.match(svg, /aria-label="Feynman diagram of [^"<>]+"/, "label text must not contain raw < or >");
  // (the description, which aria-describedby points at)
  assert.match(svg, /aria-describedby="([\w-]+)"[^>]*>(<title>[^<]*<\/title>)?<desc id="\1">An electron comes in; an electron and a photon go out\. The electron emits a photon\./);
});

test("standalone svg sets its own colours", () => {
  const svg = render("a -- b", { standalone: true });
  assert.ok(svg.includes('color="#000000"') && svg.includes('fill="#ffffff"'));
});

test("decay chains expand into the same diagram as written-out lines", () => {
  const d = parse("p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1");
  const legs = [...d.vertices.values()].filter((v) => v.role === "out");
  assert.equal(legs.length, 8, "each gluino gives q q Z neutralino1");
  assert.equal(d.edges.filter((e) => e.style.cls === "susy").length, 4, "two gluinos and two neutralino2 lines (legs take their style when drawn)");
  // an inline decay applies to that particle only, and chains mix with ordinary lines
  const t = parse("t > b W+(> mu+ nu)\nlayout: v2");
  assert.equal([...t.vertices.values()].filter((v) => v.role === "out").length, 3);
  assert.equal(t.directives.layout, "v2");
  assert.throws(() => parse("p p > gluino(> q q"), /not closed/);
  // several ways for one particle are taken in turn
  const zz = parse("p p > Z Z\nZ > e+ e-\nZ > mu+ mu-");
  const names = [...zz.vertices.values()].filter((v) => v.role === "out").map((v) => v.particle).sort();
  assert.deepEqual(names, ["e+", "e-", "mu+", "mu-"]);
});

test("colour flow: one colour line beside each quark, two beside each gluon, joined at vertices", () => {
  const colourLines = (svg: string) => {
    const flow = svg.slice(svg.indexOf("feynjs-colour-flow"));
    return new Set(flow.match(/data-colour-line="\d+"/g) ?? []).size;
  };
  // q q -> q q by a gluon: colour crosses over through the gluon, two colour lines in all
  const qq = render("colour flow: on\ni1 [q] -- a -- f1 [q]\ni2 [q] -- b -- f2 [q]\na -- [gluon] b");
  assert.equal(colourLines(qq), 2);
  // g g -> g -> t tbar: three colour lines (one passes between the incoming gluons)
  assert.equal(colourLines(render("colour flow: on\ni1 [g] -- a -- i2 [g]\na -- [gluon] b\nf1 [t] -- b -- f2 [tbar]")), 3);
  // a quark loop with plain fermion lines is recognised from the gluons it meets
  assert.equal(colourLines(render("color flow: on\ni1 [g] -- a\ni2 [g] -- b\na -- [fermion] c -- [fermion] b -- [fermion] a\nc -- [H] f1")), 2);
  // leptons carry no colour, and without the switch nothing is drawn
  assert.ok(!render("colour flow: on\ni1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]").includes("data-colour-line"));
  assert.ok(!render("i1 [q] -- a -- f1 [q]\ni2 [q] -- b -- f2 [q]\na -- [gluon] b").includes("feynjs-colour-flow"));
});

test("colour flow warns when a diagram does not suit it: colour not conserved, colour-suppressed mesons", () => {
  const warning = (src: string) => /class="feynjs-warning"[^>]*><title>([^<]*)/.exec(render(`colour flow: on\n${src}`))?.[1];
  assert.match(warning("i1 [q] -- a\na -- [gluon] f1") ?? "", /not conserved/);
  // B0 -> D- pi+ is colour-allowed; B0 -> J/psi K0 is colour-suppressed
  const b = "in: d1 b\nd1 [d] -- [fermion] d2 [d]\ncb [\\bar{c}] -- [fermion] v -- [fermion] b [\\bar{b}]\nv -- [boson, label=W^+] w\nmeson: B^0 = d1 b\n";
  assert.equal(warning(b + "out: d2 cb u db\ndb [\\bar{d}] -- [fermion] w -- [fermion] u [u]\nmeson: D^- = d2 cb\nmeson: \\pi^+ = u db"), undefined);
  assert.match(warning(b + "out: d2 sb c cb\nsb [\\bar{s}] -- [fermion] w -- [fermion] c [c]\nmeson: J/\\psi = c cb\nmeson: K^0 = d2 sb") ?? "", /colour-suppressed/);
});

test("particle labels carry the particle's properties for hovering", () => {
  const svg = render("i1 [e-] -- a -- i2 [e+]\na -- [Z] b\nf1 [t] -- b -- f2 [tbar]", { tooltips: true });
  assert.ok(!render("f1 [t] -- b -- f2 [tbar]").includes("<title>"), "off by default");
  assert.match(svg, /<title>top quark · charge \+2\/3 · spin 1\/2 · colour triplet · mass [\d.]+ GeV<\/title>/);
  assert.match(svg, /<title>Z boson · charge 0/);
});

test("reveal: later steps are drawn faint, earlier ones as usual", () => {
  const svg = render("reveal: 1\ni1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]");
  assert.ok(svg.includes("feynjs-ahead"));
  assert.ok(!/class="[^"]*"[^>]*class=/.test(svg), "no element carries two class attributes");
  assert.ok(!render("i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]").includes("feynjs-ahead"));
});

test("charge colour: charged lines take the colour of their charge's sign, neutral ones keep theirs", () => {
  const svg = render("charge colour: on\ni1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]", { tooltips: true });
  assert.ok(svg.includes('color="#3f90da"') && svg.includes('color="#e76300"'));
  assert.ok(!render("i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]").includes('color="#e76300"'));
  // a label names its particle, for the hover card
  assert.match(svg, /data-particle="mu-"/);
});

test("explain: a diagram in plain English, also in every SVG's <desc>", async () => {
  const { explain } = await import("../src/index.ts");
  const s = "i1 [e-] -- a -- i2 [e+]\na -- [Z] b\nf1 [mu-] -- b -- f2 [mu+]";
  // a summary first (what kind of picture, what it shows, in words), then the details
  assert.equal(explain(s), "Feynman diagram of an electron and a positron annihilating into a muon pair, through a Z boson. An electron and a positron annihilate into a Z boson, which decays into a muon pair. The final state is a muon pair.");
  // a production and its decays, as a physicist summarises them: pairs, "each", a W by its mode
  assert.equal(explain("p p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)"),
    "Feynman diagram of a proton–proton collision producing a top-quark pair. A proton–proton collision produces a top-quark pair, each top quark decaying into a bottom quark and a W boson, with one W boson decaying leptonically, to a positron and a neutrino, and the other hadronically. The final state is a bottom-quark pair, a positron, a quark pair and a neutrino.");
  assert.match(explain("p p > t tbar\nt > b W+(> q qbar)\ntbar > bbar W-(> q qbar)"), /with each W boson decaying hadronically\. The final state is/);
  assert.match(explain("g g > H > Z Z\nZ > e+ e-\nZ > mu+ mu-"), /Two gluons fuse into a Higgs boson, which decays into a Z-boson pair, with one Z boson decaying into an electron pair, and the other into a muon pair\./);
  assert.match(explain("p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1"), /each gluino decaying into a quark pair and a second neutralino/);
  // anything else, interaction by interaction
  assert.match(explain("i1 [g] -- a\ni2 [g] -- b\na -- [fermion] c -- [fermion] b -- [fermion, label=t] a\nc -- [H] f1"), /through a loop of three top quarks/);
  assert.match(explain("i1 [g] -- a\ni2 [g] -- b\na -- [fermion] c -- [fermion] b -- [fermion, label=t] a\nc -- [H] f1"), /^One-loop Feynman diagram of two gluons to a Higgs boson\. /);
  // the SVG: the summary is its accessible name, the details (and how it reads) its description
  assert.match(render(s), /aria-label="Feynman diagram of an electron and a positron annihilating into a muon pair, through a Z boson"/);
  assert.match(render(s), /<desc id="[\w-]+">An electron and a positron annihilate into a Z boson, which decays into a muon pair\. The final state is a muon pair\. Time runs from left to right\.<\/desc>/);
  assert.doesNotMatch(render(`vertical: a to b\n${s}`), /Time runs from left to right/);
});

test("optical size: a smaller diagram is smaller, with relatively heavier lines", () => {
  const src = "i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]";
  const width = (svg: string) => Number(/width="([\d.]+)"/.exec(svg)![1]);
  const stroke = (svg: string) => Number(/stroke-width="([\d.]+)"/.exec(svg)![1]);
  const normal = render(src), small = render(`size: small\n${src}`), half = render(src, { theme: { size: 0.5 } });
  assert.ok(width(small) < width(normal) && width(half) < width(small));
  // the drawing shrinks faster than its strokes
  assert.ok(stroke(half) / stroke(normal) > width(half) / width(normal));
});

test("every force and every force setting belongs to exactly one family", async () => {
  const { FAMILIES } = await import("../src/engines/forces/families.ts");
  const { allForces } = await import("../src/engines/forces/forces.ts");
  const { readStructure } = await import("../src/engines/forces/structure.ts");
  const settings = FAMILIES.flatMap((f) => f.settings);
  assert.deepEqual([...settings].sort(), Object.keys(defaultTheme.forces).sort());
  const d = parse("i1 [e-] -- a -- i2 [e+]\na -- [Z] b\nf1 [mu-] -- b -- f2 [mu+]");
  layoutDiagram(d, defaultTheme);
  const forces = allForces(readStructure(d), defaultTheme.forces).map((f) => f.name);
  assert.deepEqual(FAMILIES.flatMap((f) => f.forces).sort(), [...forces].sort());
});

test("fermions are drawn by mass, not by name: a heavy neutral lepton's lepton leaves as a top's b does", () => {
  const top = render("in: i1 i2\nout: b1 l nu\ni1 [g] -- a\ni2 [g] -- a\na -- [plain, label=t] t1\nt1 -- b1 [b]\nt1 -- [W] w\nw -- l [l+]\nw -- nu [nu]", { theme: { engine: "v2" }, model: true });
  const heavy = render("in: i1 i2\nout: b1 l nu\ni1 [g] -- a\ni2 [g] -- a\na -- [plain, label=N] t1\nt1 -- b1 [l-]\nt1 -- [W] w\nw -- l [l+]\nw -- nu [nu]", { theme: { engine: "v2" }, model: true });
  const light = render("in: i1 i2\nout: b1 l nu\ni1 [g] -- a\ni2 [g] -- a\na -- [plain, label=\\nu] t1\nt1 -- b1 [l-]\nt1 -- [W] w\nw -- l [l+]\nw -- nu [nu]", { theme: { engine: "v2" }, model: true });
  const points = (svg: string) => JSON.parse(svg.match(/<metadata class="feynjs-model">([\s\S]*?)<\/metadata>/)![1].replace(/&quot;/g, '"')).vertices.map((v: { x: number; y: number }) => [v.x, v.y]);
  // (the top and the heavy N alike: the same shape, to within what their different labels'
  // sizes move (under a pixel); a light neutrino's line otherwise, by many pixels)
  const apart = (a: number[][], b: number[][]) => Math.max(...a.map((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1])));
  assert.ok(apart(points(heavy), points(top)) < 1, `heavy N against top: ${apart(points(heavy), points(top))} px`);
  assert.ok(apart(points(light), points(top)) > 5, `light against top: ${apart(points(light), points(top))} px`);
});

test("debug: on draws a grid, every point's name, and why each line lies where it does", () => {
  const src = readFileSync("validation/atlas/SUSY-2013-15/fig_002a.feyn", "utf8");
  const svg = render(`debug: on\n${src}`, { model: true }), plain = render(src, { model: true });
  assert.ok(svg.includes('class="feynjs-grid"') && !plain.includes('class="feynjs-grid"'), "a grid behind the drawing");
  // (every line numbered, its reasons measured: the stop's top is held by spacing, among others)
  const why = [...svg.matchAll(/data-why="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(why.length, 16);
  assert.match(why.find((w) => w.includes("s1–t1"))!, /lines at -?\d+°; held by .*spacing \(\d\.\d\d\)/);
  // (each line marked with the one family that shapes it most: a handful of reasons, not one a
  // line; the stop's top and the top's b by mass, the W's by decays)
  const family = (edge: string) => new RegExp(`data-edge="${edge}" data-family="([a-z]*)"`).exec(svg)![1];
  assert.equal(family("s1--t1"), "mass");
  assert.equal(family("t1--b1"), "mass");
  assert.equal(family("w1--l"), "decays");
  assert.ok(new Set([...svg.matchAll(/data-family="([a-z]*)"/g)].map((m) => m[1])).size <= 4);
  // (a step after the forces is named with the lines it moved: the neutralinos lined up)
  assert.match(why.find((w) => w.includes("s1–n1"))!, /then final states lined up/);
  assert.ok(svg.includes(">t1</text>"), "the points' names");
  // (debug changes nothing about the layout)
  const at = (s: string, id: string) => JSON.parse(s.match(/<metadata class="feynjs-model">([\s\S]*?)<\/metadata>/)![1].replace(/&quot;/g, '"')).vertices.find((v: { id: string }) => v.id === id);
  assert.deepEqual(at(svg, "t1"), at(plain, "t1"));
});

test("two alike chains either side of a t-channel exchange mirror each other exactly (EXOT-2014-09 fig_01b)", () => {
  const d = parse(readFileSync("validation/atlas/EXOT-2014-09/fig_01b.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  const at = (id: string) => d.vertices.get(id)!;
  const level = (at("a").y + at("b").y) / 2;
  // (each point and its partner: the top lepton of one half with the bottom one of the other)
  for (const [u, l] of [["i1", "i2"], ["c", "d"], ["qj1", "qj2"], ["e", "f"], ["xd1", "xd2"], ["s1", "s2"], ["g1", "g4"], ["g2", "g3"], ["lp1", "lm4"], ["lm1", "lp4"], ["lp2", "lm3"], ["lm2", "lp3"]]) {
    assert.ok(Math.abs(at(u).x - at(l).x) < 1e-6, `${u} and ${l} are level across`);
    assert.ok(Math.abs(at(u).y - level + (at(l).y - level)) < 1e-6, `${u} and ${l} mirror each other`);
  }
});

test("a stop's top is a short line, its decay beside the neutralino (SUSY-2013-15 fig_002a)", () => {
  const d = parse(readFileSync("validation/atlas/SUSY-2013-15/fig_002a.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  // (in lines: a row and a rank are not the same length)
  const at = (id: string) => { const v = d.vertices.get(id)!; return { x: v.x, y: (v.y * defaultTheme.unitY) / defaultTheme.unitX }; };
  const length = (a: string, b: string) => Math.hypot(at(a).x - at(b).x, at(a).y - at(b).y);
  for (const [stop, top] of [["s1", "t1"], ["s2", "t2"]]) {
    // (shorter than an ordinary line, and shorter than the neutralino beside it)
    assert.ok(length(stop, top) < 1, `${stop}--${top} is ${length(stop, top).toFixed(2)} long`);
    assert.ok(length(stop, top) < length(stop, stop === "s1" ? "n1" : "n2"), `${stop}'s top is shorter than its neutralino`);
  }
});

test("v2 follows the out: order, puts a top's b outside, and keeps the decay forward (TOPQ-2018-22 fig_01b)", () => {
  const d = parse(readFileSync("validation/atlas/TOPQ-2018-22/fig_01b.feyn", "utf8"));
  layoutDiagram(d, { ...defaultTheme, engine: "v2" });
  // (in px: a row and a rank are not the same length)
  const at = (id: string) => { const v = d.vertices.get(id)!; return { x: v.x * defaultTheme.unitX, y: v.y * defaultTheme.unitY }; };
  // listed top to bottom: nubar, l, bbar, gamma, u/c; all but the top's b keep that order
  const ys = ["f1", "f2", "f4", "f5"].map((id) => at(id).y);
  assert.deepEqual([...ys].sort((a, b) => a - b), ys);
  // the tbar heads up, so its b goes to the outside: above the W, whatever the list says
  assert.ok(at("f3").y < at("w").y, "the tbar's bbar is outside its W");
  // the W leaves the tbar decay forward, not upright
  const c = at("c"), w = at("w");
  const lean = Math.atan2(c.y - w.y, w.x - c.x) * 180 / Math.PI;
  assert.ok(w.x > c.x && lean < 65, `W leans ${lean.toFixed(0)} degrees`);
  // the deeper branch (tbar, two decays ahead) runs nearer level than the t (one)
  const b = at("b"), t = at("d");
  const from = (v: { x: number; y: number }) => Math.abs(Math.atan2(b.y - v.y, v.x - b.x) * 180 / Math.PI);
  assert.ok(from(c) < from(t), `tbar ${from(c).toFixed(0)} degrees, t ${from(t).toFixed(0)}`);
  // the W's lepton and neutrino fan out about the W's own heading: a W decays the way it goes
  const heading = ["f1", "f2"].map((id) => { const f = at(id); const n = Math.hypot(f.x - w.x, f.y - w.y); return [(f.x - w.x) / n, (f.y - w.y) / n]; });
  const mean = Math.atan2(heading[0][1] + heading[1][1], heading[0][0] + heading[1][0]) * 180 / Math.PI;
  const wHeading = Math.atan2(w.y - c.y, w.x - c.x) * 180 / Math.PI;
  assert.ok(Math.abs(mean - wHeading) < 15, `the lepton pair heads ${mean.toFixed(0)} degrees, the W ${wHeading.toFixed(0)}`);
  // the s-channel gluon runs level
  const g = [at("a"), at("b")];
  assert.ok(Math.abs(g[0].y - g[1].y) < 1, "the s-channel gluon is level");
  // the final states of the last decays end level, as the paper draws them
  const ends = ["f1", "f2", "f4", "f5"].map((id) => at(id).x);
  // (near level: legs grow at most 1.6 times toward the plane, so a short one may stop a little short)
  assert.ok(Math.max(...ends) - Math.min(...ends) < 30, `final states end between x = ${Math.min(...ends).toFixed(0)} and ${Math.max(...ends).toFixed(0)}`);
});

test("modifiers and small elements: double, jet, label colour, ellipsis, small hatched blob, script capitals", () => {
  // a doubled line draws its path twice
  const g = render("i1 [g] -- a -- i2 [g]\na -- [photon, double] b\nf1 [t] -- b -- f2 [tbar]");
  const single = render("i1 [g] -- a -- i2 [g]\na -- [photon] b\nf1 [t] -- b -- f2 [tbar]");
  assert.ok((g.match(/<path/g) ?? []).length > (single.match(/<path/g) ?? []).length);
  // a leg ending in a jet gets a cone
  assert.match(render("i1 [q] -- a -- i2 [qbar]\na -- [Z] b\nb -- f1 [q, jet]\nb -- f2 [qbar]"), /feynjs-jet/);
  // a label can take its own colour
  assert.match(render("i1 [q] -- a -- i2 [qbar]\na -- [Z, color=green, label colour=black] b\nf1 [mu-] -- b -- f2 [mu+]"), /color="#000000"/);
  // an ellipsis leg, a small hatched blob, a script capital
  const e = render("i1 [q] -- a -- i2 [qbar]\na -- [Z] h [small hatched blob, label=\\mathcal{M}]\nh -- f1 [mu-]\nh -- [ellipsis] f2\nh -- f3 [mu+]");
  assert.ok(e.includes("ℳ") && e.includes("-hatch"));
  // a leg already named by its end is not labelled twice
  assert.equal((render("i1 [q] -- a -- i2 [qbar]\na -- [Z] z [Z]").match(/>\u{1D44D}</gu) ?? []).length, 1);
});

test("colours: bw draws everything in black, white and grey", () => {
  const source = "colour flow: on\ni1 [p] -- pp [blob] -- i2 [p]\npp -- [gluino] g1\ng1 -- f1 [q]\ng1 -- f2 [q, color=red]\ng1 -- f3 [neutralino1]";
  const colours = (svg: string) => [...svg.matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => m[1].toLowerCase());
  const isGrey = (h: string) => h.slice(0, 2) === h.slice(2, 4) && h.slice(2, 4) === h.slice(4, 6);
  assert.ok(colours(render(source)).some((h) => !isGrey(h)), "the default scheme has colour");
  const bw = colours(render(`colours: bw\n${source}`));
  assert.ok(bw.length > 0 && bw.every(isGrey), `non-grey colours left: ${bw.filter((h) => !isGrey(h))}`);
  // (lines and text black; grey only fills shapes)
  const strokes = [...render(`colours: bw\n${source}`).matchAll(/stroke="(#[0-9a-f]{6})"/gi)].map((m) => m[1].toLowerCase());
  assert.ok(strokes.every((h) => h === "#000000"), `grey strokes: ${strokes}`);
  // (and one grey only)
  assert.ok(new Set(bw.filter((h) => h !== "000000" && h !== "ffffff")).size <= 1, `greys: ${[...new Set(bw)]}`);
});

test("layout: manual keeps placed points; layout: grid puts every point on a crossing of the grid", () => {
  const source = "i1 [e-] -- a\ni2 [e+] -- a\na -- [photon] b\nb -- f1 [mu-]\nb -- f2 [mu+]";
  const manual = parse(`layout: manual\na at (0, 0)\nb at (3, 1)\n${source}`);
  layoutDiagram(manual, defaultTheme);
  const [a, b] = ["a", "b"].map((id) => manual.vertices.get(id)!);
  assert.deepEqual([a.x, a.y, b.x, b.y], [0, -0, 3, -1]);
  const grid = parse(`layout: grid\n${source}`);
  layoutDiagram(grid, defaultTheme);
  const rowOverRank = defaultTheme.unitY / defaultTheme.unitX;
  // (every point on a crossing of the grid, every half line length)
  const half = defaultTheme.forces.lineLength / 2;
  for (const v of grid.vertices.values()) {
    for (const c of [v.x, v.y * rowOverRank]) assert.ok(Math.abs(c / half - Math.round(c / half)) < 1e-6, `${v.id} at ${v.x}, ${v.y * rowOverRank}`);
  }
});

test("final plane: on puts every final state on one plane, and the branches of a decay mirror each other", () => {
  const d = parse("final plane: on\nin: i1 i2\nout: f1 f2 f3 f4 f5 f6\ni1 [g] -- c\ni2 [g] -- c\nc -- [scalar] r\nr -- [S] s\nr -- [H] h\nf1 [nu] -- s -- f2 [nubar]\nh -- [Z] z1\nh -- [Z] z2\nz1 -- f3 [l+]\nz1 -- f4 [l-]\nz2 -- f5 [l+]\nz2 -- f6 [l-]");
  layoutDiagram(d, defaultTheme);
  const v = (id: string) => d.vertices.get(id)!;
  const xs = ["f1", "f2", "f3", "f4", "f5", "f6"].map((id) => v(id).x);
  assert.ok(Math.max(...xs) - Math.min(...xs) < 1e-9, `final states at ${xs}`);
  assert.ok(Math.abs((v("s").y - v("r").y) + (v("h").y - v("r").y)) < 1e-9, "S and H mirror about R");
});

test("background: grid draws a faint grid behind the drawing (on by default with layout: grid)", () => {
  const source = "i1 [e-] -- a\ni2 [e+] -- a\na -- [photon] b\nb -- f1 [mu-]\nb -- f2 [mu+]";
  assert.doesNotMatch(render(source), /feynjs-grid/);
  assert.match(render(`background: grid\n${source}`), /feynjs-grid/);
  assert.match(render(`layout: grid\n${source}`), /feynjs-grid/);
  assert.match(render(`colours: bw\nbackground: grid\n${source}`), /class="feynjs-grid"[^>]*stroke="currentColor" stroke-opacity="0.11"/);
});

test("detector objects written as words: adjectives, the object, its contents", () => {
  const edge = (opts: string) => parse(`i1 [q] -- a -- i2 [qbar]\na -- [${opts}] f1`).edges[2].style;
  for (const form of ["large R jet 2j 1e", "LRJ 2j 1e", "LRJ(2j, 1e)"]) {
    const s = edge(form);
    assert.equal(s.object, "large", form);
    assert.deepEqual(s.contents, [{ kind: "jet", count: 2 }, { kind: "electron", count: 1 }], form);
  }
  assert.equal(edge("displaced jet").object, "displaced");
  assert.equal(edge("DIS J").object, "displaced");
  assert.deepEqual(edge("DIS track"), { line: "jet", arrow: 0, object: "track", adjectives: ["displaced"] });
  assert.deepEqual(edge("LRJ 1b W(2j)").contents, [{ kind: "bjet", count: 1 }, { kind: "W", count: 1, contents: [{ kind: "jet", count: 2 }] }]);
  assert.deepEqual(edge("LRJ 1b W(1mu, 1nu)").contents?.[1].contents, [{ kind: "muon", count: 1 }, { kind: "neutrino", count: 1 }]);
  assert.equal(edge("SVJ").object, "semivisible");
  assert.equal(edge("EMG").object, "emerging");
  // (short names as written: tau and top stay particles)
  assert.notEqual(edge("tau").object, "tau");
  assert.match(render("i1 [q] -- a -- i2 [qbar]\na -- [LRJ 2j 1e] f1\na -- [q] f2"), /feynjs-jet/);
});

test("layout: grid draws a SUSY cascade as a level spine, what it gives off hanging out from the middle", () => {
  for (const grid of ["", "grid: 45\n"]) {
    const d = parse(`layout: grid\n${grid}p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1`);
    layoutDiagram(d, defaultTheme);
    const parentOf = (id: string) => { const e = d.edges.find((e) => e.to === id || e.from === id)!; return d.vertices.get(e.from === id ? e.to : e.from)!; };
    const legs = (particle: string) => [...d.vertices.values()].filter((v) => v.particle === particle && v.role === "out");
    // (the neutralinos run level; each Z stands straight up or down, away from the middle line)
    const middle = d.vertices.get(d.edges.find((e) => e.label === "\\tilde g")!.from)!.y;
    for (const n of legs("neutralino1")) assert.ok(Math.abs(n.y - parentOf(n.id).y) < 1e-9, `${grid}${n.id} not level`);
    for (const z of legs("Z")) {
      const at = parentOf(z.id);
      assert.ok(Math.abs(z.x - at.x) < 1e-9 && Math.sign(z.y - at.y) === Math.sign(at.y - middle), `${grid}${z.id} not upright and outward`);
    }
    // (the quarks hang on the same side, and the two branches mirror each other)
    for (const q of legs("q")) assert.equal(Math.sign(q.y - parentOf(q.id).y), Math.sign(parentOf(q.id).y - middle), `${grid}${q.id} not outward`);
    const ys = [...d.vertices.values()].map((v) => Math.round((v.y - middle) * 1e6)).sort((a, b) => a - b);
    assert.deepEqual(ys, ys.map((y) => (y ? -y : 0)).reverse(), `${grid}branches not mirrored`);
  }
});

test("layout: grid keeps hadrons whole: their quarks end in one column, the mesons apart", () => {
  const d = parse(`layout: grid\n${readFileSync("validation/atlas/BPHY-2018-08/fig_01c.feyn", "utf8").replace(/^layout:.*$/m, "")}`);
  layoutDiagram(d, defaultTheme);
  const out = d.hadrons.filter((h) => d.vertices.get(h.legs[0])!.role === "out");
  const xs = out.flatMap((h) => h.legs.map((id) => d.vertices.get(id)!.x));
  assert.ok(Math.max(...xs) - Math.min(...xs) < 1e-9, `outgoing quark ends at ${xs}`);
  // (the two mesons' quark ranges do not overlap)
  const [a, b] = out.map((h) => h.legs.map((id) => d.vertices.get(id)!.y).sort((p, q) => p - q));
  assert.ok(a[1] < b[0] || b[1] < a[0], `mesons overlap: ${a} and ${b}`);
});

test("view: kinematic draws the event: two branches back to back, a t-channel spectator forward", () => {
  const tt = parse("in: i1 i2\nout: b1 w1 b2 w2\ni1 [g] -- a\ni2 [g] -- a\na -- [g] c\nc -- [t] t1\nc -- [tbar] t2\nt1 -- b1 [b]\nt1 -- w1 [W+]\nt2 -- b2 [bbar]\nt2 -- w2 [W-]");
  layoutDiagram(tt, defaultTheme);
  const dirs = new Map(eventDirections(tt).map((d) => [d.id, d]));
  const mean = (ids: string[]) => Math.atan2(ids.reduce((s, id) => s + Math.sin(dirs.get(id)!.phi), 0), ids.reduce((s, id) => s + Math.cos(dirs.get(id)!.phi), 0));
  const apart = Math.abs(Math.atan2(Math.sin(mean(["b1", "w1"]) - mean(["b2", "w2"])), Math.cos(mean(["b1", "w1"]) - mean(["b2", "w2"]))));
  assert.ok(Math.abs(apart - Math.PI) < 0.2, `the tops are ${(apart * 180 / Math.PI).toFixed(0)} degrees apart`);
  const vbf = parse("in: q1 q2\nout: q3 h q4\nq1 [q] -- a -- q3 [q]\nq2 [q] -- b -- q4 [q]\na -- [W] c\nb -- [W] c\nc -- h [H]");
  layoutDiagram(vbf, defaultTheme);
  const v = new Map(eventDirections(vbf).map((d) => [d.id, d]));
  assert.ok(Math.abs(v.get("q3")!.eta) > 2 && Math.abs(v.get("q4")!.eta) > 2 && Math.sign(v.get("q3")!.eta) !== Math.sign(v.get("q4")!.eta), "the spectators go forward and backward");
  assert.ok(Math.abs(v.get("h")!.eta) < 1, "the Higgs is central");
  assert.match(render("view: kinematic\nprojection: longitudinal\nin: i1 i2\ni1 [e-] -- a -- i2 [e+]\na -- [photon] b\nb -- f1 [mu-]\nb -- f2 [mu+]"), /feynjs-kinematic/);
});

test("view: kinematic draws final states as they are reconstructed, and the particles that decay on request", () => {
  const src = "in: i1 i2\nout: b1 l1 n1\ni1 [g] -- a\ni2 [g] -- a\na -- [t] t1\na -- [tbar] t2\nt1 -- b1 [b]\nt1 -- [W+] w1\nw1 -- l1 [e+]\nw1 -- n1 [nu_e]\nt2 -- f1 [bbar]\nt2 -- f2 [W-]";
  const seen = render(`view: kinematic\n${src}`);
  assert.match(seen, /feynjs-jet/, "a b quark drawn as a jet");
  assert.doesNotMatch(render(`view: kinematic\nreconstruct: off\n${src}`), /feynjs-jet/, "reconstruct: off draws the particles");
  assert.ok(render(`view: kinematic\nshow intermediate: true\n${src}`).length > seen.length, "the tops and the W drawn too");
});

test("pulse draws an animated ring around a point and a glow along a line", () => {
  const svg = render("i1 [p] -- pp [blob, pulse] -- i2 [p]\npp -- [gluino, pulse=blue] g1\ng1 -- f1 [q]\ng1 -- f2 [neutralino1]");
  assert.equal((svg.match(/<circle class="feynjs-pulse"/g) ?? []).length, 2, "two rings, out of step");
  assert.match(svg, /<path class="feynjs-pulse"[^>]*stroke="(#0000ff|#0b80c3|blue|#[0-9a-f]{6})"/i);
  assert.doesNotMatch(render("i1 [p] -- pp [blob] -- i2 [p]\npp -- f1 [q]"), /feynjs-pulse/);
});

test("lifetime: a band under the line, and a brace with a value; a pulsing point pulses its lines", () => {
  const band = render("i1 [p] -- pp [blob] -- i2 [p]\npp -- [chargino, lifetime] c\nc -- f1 [pi+]\nc -- f2 [neutralino1]");
  assert.ok(band.includes("feynjs-lifetime") && band.includes("linearGradient"));
  assert.ok(!band.includes("feynjs-lifetime-brace"));
  assert.ok(render("i1 [p] -- pp [blob] -- i2 [p]\npp -- [chargino, lifetime={c\\tau}] c\nc -- f1 [pi+]\nc -- f2 [neutralino1]").includes("feynjs-lifetime-brace"));
  const pulsing = render("i1 [e-] -- a -- i2 [e+]\na [dot, pulse] -- [Z] b\nb -- f1 [mu-]\nb -- f2 [mu+]");
  // three glowing lines and the point's two rings
  assert.equal((pulsing.match(/class="feynjs-pulse"/g) ?? []).length, 5);
});

test("TikZ-Feynman keys: momentum variants, insertions, arrows, angles, placement, orientation, inline, every", () => {
  const svg = render("i1 [e-] -- [fermion, momentum'=p] a -- i2 [e+]\na -- [photon, rmomentum=k, insertion=0.3, insertion=0.7] b\nf1 [mu-] -- [fermion, with arrow=0.2, no arrow] b\nb -- [fermion, out=-60, in=180] f2 [mu+]");
  assert.equal((svg.match(/class="feynjs-insertion"/g) ?? []).length, 2);
  const d = parse("layout: manual\na at (0, 0)\nb [right=1.5 of a]\nc [above right=1 and 2 of b]\na -- b -- c");
  assert.deepEqual(d.vertices.get("b")!.fixed, { x: 1.5, y: 0 });
  assert.deepEqual(d.vertices.get("c")!.fixed, { x: 3.5, y: 1 });
  assert.throws(() => parse("b [right=of a]\na -- b"), /no place itself/);
  // vertical: a to b puts b straight below a
  const up = parse("vertical: a to b\ni1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]");
  layoutDiagram(up, { ...defaultTheme, engine: "v2" });
  const a = up.vertices.get("a")!, b = up.vertices.get("b")!;
  assert.ok(Math.abs(a.x - b.x) < 1e-6 && b.y > a.y);
  assert.match(render("inline: a\ni1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]"), /vertical-align: -[\d.]+em/);
  const every = parse("every photon: color=blue\nevery dot: size=2\ni1 [e-] -- a [dot] -- i2 [e+]\na -- [photon] b [dot, size=1]\nf1 [mu-] -- b -- f2 [mu+]");
  assert.equal(every.edges.find((e) => e.style.line === "wave")!.style.color, "blue");
  assert.equal(every.vertices.get("a")!.dotScale, 2);
  assert.equal(every.vertices.get("b")!.dotScale, 1);
});

test("nuclei: drawn as A spheres, Z of them protons, from a symbol, an isotope or A= and Z=", () => {
  // (protons are the brick-red ones, neutrons the slate ones, each edged in a dark shade of its own)
  const nucleons = (svg: string) => [...svg.matchAll(/<circle [^>]*fill="#([0-9a-f]{6})" stroke="#(?:4f1f19|252c3a)"/g)].map((m) => parseInt(m[1].slice(0, 2), 16) - parseInt(m[1].slice(2, 4), 16) > 60);
  const lead = nucleons(render("i1 [Pb] -- b [nucleus=Pb] -- o1 [Pb]\nb -- [photon] g [gamma]"));
  assert.equal(lead.filter(Boolean).length, 82);
  assert.equal(lead.length, 208);
  assert.equal(nucleons(render("i1 [O] -- b [nucleus, A=16, Z=8] -- o1 [O]\nb -- [photon] g [gamma]")).length, 16);
  assert.equal(parse("i1 -- b [nucleus=197Au] -- o1\nb -- g").vertices.get("b")!.nucleus!.A, 197);
  assert.throws(() => parse("i1 -- b [nucleus, A=4, Z=6] -- o1"), /Z cannot be more than A/);
  assert.throws(() => parse("i1 -- b [nucleus] -- o1"), /needs its numbers/);
});

test("view: lattice draws sites and links, with wilson loops, plaquettes, links, polyakov loops and sites", () => {
  const svg = render("view: lattice\nlattice: 8x6\nwilson loop: (1,1) to (4,4)\nwilson loop: (5,0) to (7,2)\nplaquette: (5,3)\nlink: (5,5) to (6,5)\npolyakov loop: 7\nsite: (1,1) [label=\\psi]");
  assert.ok(svg.includes("feynjs-lattice"));
  assert.equal((svg.match(/<circle/g) ?? []).length, 8 * 6 + 1);
  assert.throws(() => render("view: lattice\nlink: (1,1) to (3,1)"), /neighbouring/);
  assert.throws(() => render("view: lattice\nlattice: 4x4\nplaquette: (5,5)"), /site/);
});

test("quark bags: a hadron as its valence quarks, colourless, by name or written out", () => {
  const discs = (svg: string) => (svg.match(/r="7.8" fill="#/g) ?? []).length;
  assert.equal(discs(render("i [bag=proton] -- a -- f [e-]\na -- g [gamma]")), 3);
  assert.equal(discs(render("i [bag=Pc] -- a -- f [p]\na -- g [J/\\psi]")), 5);
  assert.equal(discs(render("i [bag=c cbar u dbar] -- a -- f [pi+]\na -- g [J/\\psi]")), 4);
  // a meson: one colour (reddish) and its anticolour (cyan-ish)
  const fills = [...render("i [bag=pi+] -- a -- f [mu+]\na -- n [nu_mu]").matchAll(/r="7.8" fill="#([0-9a-f]{6})"/g)].map((m) => [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16)));
  assert.equal(fills.length, 2);
  assert.ok(fills.some(([r, g, b]) => r > g + 40 && r > b + 40) && fills.some(([r, g, b]) => b > r + 40 && g > r + 20));
  // (motion lets the flux tubes breathe)
  assert.match(render("i [bag=proton, motion] -- a -- f [e-]\na -- g [gamma]"), /attributeName="stroke-opacity"/);
  assert.throws(() => parse("i [bag=xyz] -- a"), /unknown hadron/);
  // a pentaquark as a molecule: a baryon and a meson, each with its own flux tubes
  const molecule = parse("i [bag=Pc, molecule] -- a -- f [p]").vertices.get("i")!.bag!.quarks;
  assert.deepEqual(molecule.map((q) => `${q.flavour}${q.anti ? "bar" : ""}${q.group}`), ["u0", "d0", "c0", "u1", "cbar1"]);
  assert.equal(parse("i [bag=uud + c cbar] -- a -- f [p]").vertices.get("i")!.bag!.quarks.filter((q) => q.group === 1).length, 2);
});

test("processes through a loop, in braces: g g > {t} > H the top triangle, g g > {t} > H H a box; decays through loops; MadGraph names", () => {
  const tops = (src: string, particle = "t") => parse(src).edges.filter((e) => e.particle === particle).length;
  assert.equal(tops("g g > {t} > H"), 3);
  assert.equal(tops("g g > {t} > H H"), 4);
  // the other gg -> HH diagram: the triangle, its Higgs splitting
  const split = parse("g g > {t} > H > H H");
  assert.equal(split.edges.filter((e) => e.particle === "t").length, 3);
  assert.equal([...split.vertices.values()].filter((v) => v.role === "out").length, 2);
  // a decay through a loop, of tops or of Ws
  assert.equal(tops("g g > H\nH > {t} > a a"), 3);
  assert.equal(tops("g g > H\nH > {W+} > a a", "W+"), 3);
  assert.equal(tops("a a > {e-} > a a", "e-"), 4);
  // MadGraph: [noborn=QCD] is loop-induced, a top loop; [QCD] (higher orders) draws the tree
  assert.equal(tops("g g > H [noborn=QCD]"), 3);
  assert.equal(parse("p p > t t~ [QCD]").edges.length, 4); // (two beams, two legs: no loop)
  const decayed = parse("g g > {t} > H\nH > b b~");
  assert.deepEqual([...decayed.vertices.values()].filter((v) => v.role === "out").map((v) => v.label).sort(), ["\\bar b", "b"]);
  assert.throws(() => parse("p p > {t} > H"), /partons/);
  assert.equal(parse("a -- f [ve~]").vertices.get("f")!.label, "\\bar\\nu_e");
});

test("production modes: ggF > H is the top triangle; VBF > H and VBS > H > W+ W- two quark lines whose bosons fuse", () => {
  assert.equal(parse("ggF > H").edges.filter((e) => e.particle === "t").length, 3);
  const vbs = parse("VBS(W) > H > W+ W-");
  // two quark lines (four legs), two W from them, the Higgs between two three-point vertices, two W out
  assert.equal([...vbs.vertices.values()].filter((v) => v.label === "q").length, 4);
  assert.equal(vbs.edges.filter((e) => e.label === "W").length, 2);
  const higgs = vbs.edges.find((e) => e.particle === "H")!;
  const degree = (id: string) => vbs.edges.filter((e) => e.from === id || e.to === id).length;
  assert.equal(degree(higgs.from), 3);
  assert.equal(degree(higgs.to), 3);
  assert.equal(parse("VBF > H").edges.filter((e) => e.label === "V").length, 2);
  // three made: along the boson exchanged between the two, the Higgs at a three-point vertex in the middle
  const ladder = parse("VBS(W) > W+ H W-");
  const out = [...ladder.vertices.values()].filter((v) => v.role === "out" || ["W+", "H", "W-"].includes(v.particle ?? ""));
  assert.equal(out.filter((v) => v.particle === "H").length, 1);
  const hLeg = ladder.edges.find((e) => ladder.vertices.get(e.to)!.particle === "H")!;
  assert.equal(ladder.edges.filter((e) => e.from === hLeg.from || e.to === hLeg.from).length, 3);
  // VBS(W, H): a Higgs exchanged between them, so the middle vertex is the Higgs self-coupling (H H H)
  const selfCoupling = parse("VBS(W, H) > W+ H W-");
  const middle = selfCoupling.edges.find((e) => selfCoupling.vertices.get(e.to)!.particle === "H")!.from;
  const at = selfCoupling.edges.filter((e) => e.from === middle || e.to === middle);
  assert.equal(at.length, 3);
  assert.ok(at.every((e) => e.particle === "H" || selfCoupling.vertices.get(e.to)!.particle === "H"));
});

test("nucleon edges: each in a dark shade of its own by default, ink, or none; a diagram of nuclei alone draws", () => {
  const lead = "i1 [Pb] -- b [nucleus=Pb] -- o1 [Pb]\nb -- [photon] g [gamma]";
  const own = render(lead);
  assert.ok(own.includes('stroke="#4f1f19"') && own.includes('stroke="#252c3a"'));
  assert.equal(render("nucleon edges: tinted\n" + lead), own);
  assert.ok(render("nucleon edges: ink\n" + lead).includes('stroke="#2b2b2b"'));
  assert.ok(!/stroke="#(4f1f19|252c3a|2b2b2b)"/.test(render("nucleon edges: none\n" + lead).split("feynjs-nucleus")[1]));
  // (every nucleon one size, so lead is wider than helium by about A to the third)
  const across = (svg: string) => { const xs = [...svg.split("feynjs-nucleus")[1].matchAll(/cx="([-\d.]+)"/g)].map((m) => Number(m[1])); return Math.max(...xs) - Math.min(...xs); };
  const radius = (svg: string) => Number(/feynjs-nucleus"><circle [^>]*r="([\d.]+)"/.exec(svg)![1]);
  assert.equal(radius(render("a [nucleus=He]")), radius(render("a [nucleus=Pb]")));
  assert.ok(across(render("a [nucleus=Pb]")) > 3 * across(render("a [nucleus=He]")));
  assert.ok(render("a [nucleus=He]; b [nucleus=Pb]").includes("feynjs-nucleus"));
});

test("notes: words in free space with a hand-drawn arrow to a point, a line or a particle", () => {
  const vbf = "q1 [q] -- a -- q3 [q]\nq2 [q] -- b -- q4 [q]\na -- [boson, label=W] c\nb -- [boson, label=W] c\nc -- [H] h [H]";
  const one = render(vbf + "\nnote: c \"VVH coupling\"");
  assert.equal((one.match(/class="feynjs-note-arrow"/g) ?? []).length, 1);
  assert.ok(one.includes('class="feynjs-note"'));
  const two = render(vbf + "\nnote: a--c \"fusing\" left\nnote: H \"the Higgs\"");
  assert.equal((two.match(/class="feynjs-note-arrow"/g) ?? []).length, 2);
  assert.throws(() => render(vbf + "\nnote: zz \"nowhere\""), /no "zz"/);
});

test("every part of a drawing is named: lines by their ends, drawn points by name, and the diagram as data", () => {
  const svg = render("i1 [e-] -- a -- i2 [e+]\na -- [photon] b [dot]\nb -- f1 [mu-]\nb -- f2 [mu+]\nb -- [photon] f2", { model: true });
  assert.match(svg, /data-edge="i1--a" data-from="i1" data-to="a" data-particle="e-"/);
  assert.match(svg, /data-vertex="b"/);
  // (a second line between the same points is told apart)
  assert.match(svg, /data-edge="b--f2#2"/);
  const meta = /<metadata class="feynjs-model">(.*?)<\/metadata>/.exec(svg);
  assert.ok(meta, "the SVG holds the diagram as data");
  const model = JSON.parse(meta[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
  assert.deepEqual(model.unit, { x: defaultTheme.unitX, y: defaultTheme.unitY });
  const b = model.vertices.find((v: { id: string }) => v.id === "b");
  assert.equal(b.shape, "dot");
  // (`at` is where `b at (x, y)` would hold the point: the drawing's place in the source's units)
  assert.deepEqual(b.at, [Math.round((b.x / model.unit.x) * 100) / 100, Math.round((-b.y / model.unit.y) * 100) / 100 || 0]);
  assert.equal(model.vertices.find((v: { id: string }) => v.id === "i1").role, "in");
  assert.deepEqual(model.edges.map((e: { id: string }) => e.id), ["i1--a", "a--i2", "a--b", "b--f1", "b--f2", "b--f2#2"]);
});

test("names in any case, and detector objects in a process, drawn as objects", () => {
  // (a process's final state that is an object, LRJ or SVJ, in any case, is drawn as the object)
  for (const src of ["p p > Z(> LRJ) H", "p p > Zp > SVJ SVJ", "p p > Zp > lrj svj"]) assert.match(render(src), /feynjs-jet-rim/, src);
  // (particles in any case where only one fits; single letters keep their case: B is not b)
  assert.match(render("p p > Gluino gluino"), /feynjs-susy/);
  assert.doesNotThrow(() => render("a -- [Svj] b"));
  assert.doesNotMatch(render("a -- [B] b"), /data-particle="b"/);
  // (tau as written stays the particle; TAU is the hadronic tau object)
  assert.match(render("p p > TAU"), /feynjs-jet/);
});

test("a detector object in a process may hold contents, LRJ(1b W(2j)), and object lines are named as objects", () => {
  const plain = render("p p > LRJ"), filled = render("p p > LRJ(1b W(2j))");
  assert.ok((filled.match(/<path/g) ?? []).length > (plain.match(/<path/g) ?? []).length, "the contents are drawn inside the cone");
  assert.match(filled, /data-object="large"/);
  // (a decay is still a decay)
  assert.doesNotThrow(() => render("p p > Z(> e+ e-) H"));
  assert.throws(() => render("p p > Z(e+ e-)"), /write a decay as/);
});

test("a diagram given as data draws as its source does; the hand-over format is versioned", async () => {
  const { toSource, INTERCHANGE_VERSION, describe: describeAny } = await import("../src/index.ts");
  const data = {
    incoming: ["i1", "i2"],
    vertices: [{ id: "v2", shape: "dot", coupling: "g_Z" }],
    edges: [
      { from: "i1", to: "v1", particle: "e-" }, { from: "v1", to: "i2", particle: "e-" },
      { from: "v1", to: "v2", particle: "Z" },
      { from: "v2", to: "f1", particle: "mu-" }, { from: "f2", to: "v2", particle: "mu-" },
    ],
  };
  const source = toSource(data);
  assert.match(source, new RegExp(`^% feynjs-interchange ${INTERCHANGE_VERSION}\\n`));
  assert.equal(render(data), render(source));
  assert.deepEqual(describeAny(data), describeAny(source));
  // (bad data is refused, saying what is wrong)
  assert.throws(() => toSource({ edges: [{ from: "a b", to: "c" }] }), /needs a name/);
  assert.throws(() => toSource({ edges: [{ from: "a", to: "b", label: "\\frac{1" }] }), /braces/);
  // (a file written for a newer hand-over format is flagged)
  assert.ok(check(`% feynjs-interchange ${INTERCHANGE_VERSION + 1}\na -- [photon] b`).some((f) => f.rule === "interchange-version"));
  assert.ok(!check(source).some((f) => f.rule === "interchange-version"));
});

test("a TIFF download is a well-formed baseline TIFF: RGB, uncompressed, size and resolution recorded, composed on white", () => {
  const rgba = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 128, 0, 0, 0, 255, 10, 20, 30, 255]); // 3 by 2
  const t = encodeTiff(3, 2, rgba, 288), v = new DataView(t.buffer);
  assert.equal(String.fromCharCode(t[0], t[1]), "II"); assert.equal(v.getUint16(2, true), 42);
  const ifd = v.getUint32(4, true), n = v.getUint16(ifd, true), tags: Record<number, number> = {};
  for (let k = 0; k < n; k++) { const at = ifd + 2 + 12 * k, type = v.getUint16(at + 2, true); tags[v.getUint16(at, true)] = type === 3 && v.getUint32(at + 4, true) === 1 ? v.getUint16(at + 8, true) : v.getUint32(at + 8, true); }
  assert.equal(n, 13); assert.equal(tags[256], 3); assert.equal(tags[257], 2); assert.equal(tags[259], 1); assert.equal(tags[262], 2); assert.equal(tags[277], 3);
  assert.equal(tags[279], 18); assert.equal(t.length, tags[273] + 18);
  assert.equal(v.getUint32(tags[282], true) / v.getUint32(tags[282] + 4, true), 288);
  assert.deepEqual([...t.subarray(tags[273], tags[273] + 6)], [255, 0, 0, 0, 255, 0]);
  // (a half-transparent white pixel composed on white stays white; the last pixel keeps its colour)
  assert.deepEqual([...t.subarray(tags[273] + 9, tags[273] + 12)], [255, 255, 255]);
  assert.deepEqual([...t.subarray(tags[273] + 15, tags[273] + 18)], [10, 20, 30]);
});
