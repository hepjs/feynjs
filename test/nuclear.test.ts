import { test } from "node:test";
import assert from "node:assert/strict";
import { check, parse, render } from "../src/index.ts";
import type { Diagram } from "../src/index.ts";
import { renderDiagram } from "../src/render/render.ts";

/** The reactions every nuclear feature is tried on: fusion, the pp chain's first step, triple alpha, fission. */
const REACTIONS = ["H H > He", "2H 3H > 4He n", "2H 2H > 3He n", "p p > 2H e+ ve", "4He 4He 4He > 12C", "235U n > 141Ba 92Kr n n n"];
const URANIUM = "238U > 234Th 4He\n234Th > 234Pa e- ve~\n234Pa > 234U e- ve~";
const DARK_MATTER = "i1 [chi] -- a -- f1 [chi]\na -- [scalar, label=\\phi, length=1.5] n [nucleus=Xe, recoil]";

/** The legs of a parsed diagram, in and out, each as its nucleus (A, Z) or its particle. */
function legs(d: Diagram, role: "in" | "out"): string[] {
  return [...d.vertices.values()].filter((v) => v.role === role).map((v) => (v.shape === "nucleus" ? `${v.nucleus!.A},${v.nucleus!.Z}` : v.particle ?? v.label ?? ""));
}

const count = (svg: string, what: string) => svg.split(what).length - 1;

/** A diagram laid out, its points where the layout put them. */
function laidOut(source: string): Diagram {
  const d = parse(source);
  renderDiagram(d);
  return d;
}

test("in a nuclear process line, element symbols and isotopes are nuclei, and H is hydrogen", () => {
  const fusion = parse("H H > He");
  assert.equal(fusion.nuclear, true);
  assert.deepEqual(legs(fusion, "in"), ["1,1", "1,1"]);
  assert.deepEqual(legs(fusion, "out"), ["4,2"]);
  // (where they meet is a blob, and the legs are a nucleus's plain lines, with no arrow)
  assert.equal([...fusion.vertices.values()].filter((v) => v.shape === "blob").length, 1);
  assert.ok(fusion.edges.every((e) => e.style.cls === "ion" && e.style.arrow === 0));
  assert.deepEqual(legs(parse("2H 3H > 4He n"), "out"), ["4,2", "1,0"]);
  assert.deepEqual(legs(parse("235U n > 141Ba 92Kr n n n"), "out"), ["141,56", "92,36", "1,0", "1,0", "1,0"]);
  // (what is no nucleus stays a particle)
  assert.deepEqual(legs(parse("p p > 2H e+ ve"), "out"), ["2,1", "e+", "ve"]);
  // (labelled with the isotope, upright; a bare symbol as its most common one)
  const labels = [...parse("2H 3H > 4He n").vertices.values()].map((v) => v.label).filter(Boolean);
  assert.deepEqual(labels, ["^{2}\\mathrm{H}", "^{3}\\mathrm{H}", "^{4}\\mathrm{He}", "\\mathrm{n}"]);
  assert.equal([...parse("H H > He").vertices.values()].find((v) => v.role === "in")!.label, "^{1}\\mathrm{H}");
});

test("process lines with no nucleus in them are read as before: H is the Higgs", () => {
  assert.deepEqual(legs(parse("g g > H"), "out"), ["H"]);
  assert.deepEqual(legs(parse("H > b b~"), "in"), ["H"]);
  assert.deepEqual(legs(parse("p p > t t~"), "in"), ["p", "p"]);
  assert.deepEqual(legs(parse("e+ e- > mu+ mu-"), "out"), ["mu+", "mu-"]);
  for (const source of ["g g > H", "H > b b~", "p p > t t~", "e+ e- > mu+ mu-", "psi(2S) > J/psi pi+ pi-", "p p > X(ucd) j"]) {
    const d = parse(source);
    assert.ok([...d.vertices.values()].every((v) => v.shape !== "nucleus") && !d.nuclear, source);
    assert.ok(!render(source).includes("feynjs-reaction"), source);
  }
  // (Y, a name new particles often take, makes no line nuclear by itself)
  assert.ok(!parse("e+ e- > Y").nuclear);
});

test("a nuclear process draws as the reaction picture, and as its diagram with view: diagram; check() finds nothing", () => {
  for (const source of REACTIONS) {
    assert.deepEqual(check(source), [], source);
    assert.ok(render(source).includes("feynjs-reaction"), source);
    assert.equal(count(render(`view: diagram\n${source}`), "feynjs-reaction"), 0, source);
    assert.ok(render(`view: diagram\n${source}`).includes("feynjs-nucleus"), source);
  }
  assert.equal(count(render("view: diagram\n235U n > 141Ba 92Kr n n n"), 'class="feynjs-nucleus"'), 7);
  // (a mass number smaller than the protons is no nucleus)
  assert.match(check("2Li > 4He")[0].message, /protons/);
});

test("the reaction picture: one burst, its nuclei, an arrow for each leg, a photon out of the nucleus that gives it off", () => {
  const dt = render("2H 3H > 4He n");
  assert.equal(count(dt, 'class="feynjs-burst"'), 1);
  assert.equal(count(dt, 'class="feynjs-nucleus"'), 4);
  assert.equal(count(dt, 'class="feynjs-reaction-arrow"'), 4);
  assert.equal(count(dt, 'data-line="wave"'), 0);
  const capture = render("2H p > 3He gamma");
  assert.equal(count(capture, 'class="feynjs-nucleus"'), 3);
  assert.equal(count(capture, 'class="feynjs-reaction-arrow"'), 4);
  assert.equal(count(capture, 'data-line="wave"'), 1);
  const fission = render("235U n > 141Ba 92Kr n n n");
  assert.equal(count(fission, 'class="feynjs-nucleus"'), 7);
  assert.equal(count(fission, 'class="feynjs-reaction-arrow"'), 7);
  // (the burst: a halo, two stars and a core, and no gradient)
  assert.ok(!fission.includes("Gradient"));
  const burst = fission.slice(fission.indexOf("feynjs-burst"), fission.indexOf("</g>", fission.indexOf("feynjs-burst")));
  assert.equal(count(burst, "<path"), 2);
  assert.equal(count(burst, "<circle"), 2);
  assert.ok(burst.includes("#e9973d") && burst.includes("#f3b964") && !burst.includes("#f6c445"));
  // (leptons plain arrows, ending in their labels)
  assert.equal(count(render("p p > 2H e+ ve"), 'data-line="plain"'), 5);
  assert.equal(count(render("view: reaction\n2H 3H > 4He n"), 'class="feynjs-burst"'), 1);
});

test("breakup by a photon, elastic scattering and an excited nucleus each have a picture of their own", () => {
  for (const source of ["gamma 2H > p n", "gamma 16O > 15N p"]) {
    const svg = render(source);
    assert.equal(count(svg, "feynjs-burst"), 0, source);
    assert.equal(count(svg, 'data-line="wave"'), 1, source);
    assert.equal(count(svg, 'class="feynjs-nucleus"'), 3, source);
  }
  for (const source of ["chi Xe > chi Xe", "n 12C > n 12C"]) {
    const svg = render(source);
    assert.equal(count(svg, "feynjs-burst"), 0, source);
    assert.equal(count(svg, 'class="feynjs-recoil"'), 1, source);
    assert.equal(count(svg, 'class="feynjs-reaction-arrow"'), 2, source);
    assert.deepEqual(check(source), [], source);
  }
  assert.equal(count(render("chi Xe > chi Xe"), "feynjs-signal"), 0);
  assert.equal(count(render("chi Xe > chi Xe\nsignal: on"), 'class="feynjs-signal" data-line="wave"'), 3);
  const glow = render("12C* > 12C gamma");
  assert.equal(count(glow, "feynjs-energy"), 1);
  assert.equal(count(glow, 'data-line="wave"'), 1);
  assert.equal(count(glow, "feynjs-burst"), 0);
});

test("nucleons in brackets: He(2p 2n), C(6p 8n), X(3p 4n); a hadron's state or quarks stay as they were", () => {
  const d = parse("He(2p 2n) > X(3p 4n) gamma");
  assert.ok(d.nuclear);
  assert.deepEqual(legs(d, "in"), ["4,2"]);
  assert.deepEqual(legs(d, "out"), ["7,3", "gamma"]);
  assert.equal([...d.vertices.values()].find((v) => v.nucleus?.A === 7)!.label, "\\mathrm{X}");
  assert.deepEqual(legs(parse("C(6p 8n) > 14N e- ve~"), "in"), ["14,6"]);
  // (check() says when the protons are another element's)
  const wrong = check("He(3p 2n) > p 4He");
  assert.ok(wrong.some((f) => f.rule === "nucleus-nucleons" && /Li/.test(f.message)));
  assert.deepEqual(check("He(2p 2n) > X(3p 4n) gamma"), []);
  // (and as a point's options, N= with Z= or a symbol)
  const carbon = parse("a [nucleus=C, N=8]").vertices.get("a")!;
  assert.deepEqual(carbon.nucleus, { A: 14, Z: 6 });
  assert.equal(parse("a [nucleus, Z=6, N=6]").vertices.get("a")!.nucleus!.A, 12);
});

test("a nuclear process that decays on draws as a decay chain, straight or along an arc, its modes named", () => {
  for (const source of [URANIUM, "238U > 234Th 4He, 234Th > 234Pa e- ve~, 234Pa > 234U e- ve~"]) {
    const d = parse(source);
    assert.equal(d.decayChain!.length, 3);
    assert.deepEqual(d.decayChain!.map((s) => s.daughter.Z), [90, 91, 92]);
    const svg = render(source);
    assert.equal(count(svg, 'class="feynjs-nucleus"'), 5);
    assert.equal(count(svg, "feynjs-chain-arrow"), 3);
    assert.equal(count(svg, "feynjs-chain-given"), 5);
    assert.deepEqual(check(source), []);
  }
  // (a single reaction is no chain: it bursts)
  assert.equal(parse("238U > 234Th 4He").decayChain, undefined);
  assert.equal(count(render("238U > 234Th 4He"), "feynjs-burst"), 1);
  // (a curve: the same pieces; modes: off drops the arrows' names)
  assert.equal(count(render(`chain: curve\n${URANIUM}`), "feynjs-chain-arrow"), 3);
  assert.ok(count(render(`modes: off\n${URANIUM}`), "<g transform") < count(render(URANIUM), "<g transform"));
});

test("notes point at a nucleus, an arrow or the burst in the reaction picture and the decay chain", () => {
  assert.equal(count(render('2H 3H > 4He n\nnote: burst "fusion"\nnote: 4He "alpha"'), "feynjs-note-arrow"), 2);
  assert.equal(count(render(`${URANIUM}\nnote: 238U--234Th "alpha decay"\nnote: 234Pa "short-lived" below`), "feynjs-note-arrow"), 2);
  assert.equal(count(render('chi Xe > chi Xe\nnote: Xe "recoil"'), "feynjs-note-arrow"), 1);
  assert.throws(() => render('2H 3H > 4He n\nnote: 12C "no"'), /note points at/);
});

test("a boson meeting a nucleus reaches into it, over its nucleons; element names are upright", () => {
  const lead = render("i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]\nb1 -- [photon] a\na -- [fermion] g1 [e^-]\na -- [fermion] g2 [e^+]");
  const over = lead.slice(lead.indexOf('class="feynjs-over"'));
  assert.ok(over.includes('data-edge="b1--a"'));
  assert.ok(render(DARK_MATTER).includes('class="feynjs-over"'));
  // (and a line that is no boson stays under it)
  assert.ok(!over.includes('data-edge="i1--b1"'));
  assert.equal(parse("i2 [Xe] -- b").vertices.get("i2")!.label, "\\mathrm{Xe}");
  assert.equal(parse("i2 [208Pb] -- b").vertices.get("i2")!.label, "^{208}\\mathrm{Pb}");
  assert.equal(parse("i2 [Y] -- b").vertices.get("i2")!.label, "Y");
});

test("a line scattered off a nucleus comes in toward it and leaves away from it", () => {
  const d = laidOut(DARK_MATTER), at = (id: string) => d.vertices.get(id)!;
  const [i1, a, f1, n] = ["i1", "a", "f1", "n"].map(at);
  // (the nucleus below the corner; in running down toward it, out running up, away)
  assert.ok(n.y > a.y);
  const degrees = (p: { x: number; y: number }, q: { x: number; y: number }) => (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
  assert.ok(degrees(i1, a) > 5, `in at ${degrees(i1, a)}`);
  assert.ok(degrees(a, f1) < -5, `out at ${degrees(a, f1)}`);
});

test("length= makes a line longer, in line lengths or in cm", () => {
  const plain = laidOut("i1 [chi] -- a -- f1 [chi]\na -- [scalar] n [nucleus=Xe]"), long = laidOut(DARK_MATTER);
  const span = (d: Diagram) => Math.hypot(d.vertices.get("n")!.x - d.vertices.get("a")!.x, d.vertices.get("n")!.y - d.vertices.get("a")!.y);
  assert.ok(span(long) > span(plain) * 1.25, `${span(long)} against ${span(plain)}`);
  assert.equal(parse("a -- [length=2cm] b").edges[0].length, 1.25);
  assert.throws(() => parse("a -- [length=0] b"), /length/);
});

test("a nucleus's recoil, its energy and what it gives off", () => {
  const recoil = render(DARK_MATTER);
  assert.equal(count(recoil, 'class="feynjs-recoil"'), 1);
  assert.equal(count(recoil, 'class="feynjs-nucleus"'), 3);
  assert.ok(render("a [nucleus=Xe, recoil=down] -- b").includes("feynjs-recoil"));
  // (energy: still, no animation; warmer with more; a colour as written; excited and a star alike)
  const low = render("a -- n [nucleus=Xe, pulse=low]"), high = render("a -- n [nucleus=Xe, pulse=high]");
  for (const svg of [low, high]) { assert.equal(count(svg, "feynjs-energy"), 1); assert.ok(!svg.includes("<animate")); }
  assert.notEqual(/feynjs-energy"><circle[^>]*fill="(#[0-9a-f]+)"/.exec(low)![1], /feynjs-energy"><circle[^>]*fill="(#[0-9a-f]+)"/.exec(high)![1]);
  assert.ok(render("a -- n [nucleus=Xe, pulse=#ff0000]").includes('fill="#ff0000"'));
  assert.equal(count(render("a -- n [nucleus=Xe, excited]"), "feynjs-energy"), 1);
  assert.equal(count(render("a -- n [nucleus=Xe*]"), "feynjs-energy"), 1);
  // (a photon given off: written as a line from it, or as emits=)
  const emits = render("i [chi] -- a -- f [chi]\na -- [scalar] n [nucleus=Xe*, emits=gamma]");
  assert.equal(count(emits, "feynjs-emitted"), 1);
  const line = render("i [chi] -- a -- f [chi]\na -- [scalar] n [nucleus=Xe*]\nn -- [photon] g [gamma]");
  assert.ok(line.slice(line.indexOf('class="feynjs-over"')).includes('data-edge="n--g"'));
  assert.deepEqual(check("i [chi] -- a -- f [chi]\na -- [scalar] n [nucleus=Xe*, emits=gamma]").filter((f) => f.severity === "error"), []);
});
