import { test } from "node:test";
import assert from "node:assert/strict";
import { describe, parse } from "../src/index.ts";
import { expandChains } from "../src/parse/chains.ts";
// @ts-ignore: a plain .mjs helper shared with scripts/approve-layouts.mjs
import { layoutPoints } from "../scripts/lib/layout-points.mjs";

// MadGraph's own way of writing a process, pasted as it is, draws the diagram written feynjs's way:
// the same lines (so the same description) and the same layout, point for point.
const drawsAs = (madgraph: string, feynjs: string) => {
  assert.equal(expandChains(madgraph), expandChains(feynjs), `${madgraph} is written out as ${feynjs} is`);
  assert.deepEqual(describe(madgraph), describe(feynjs));
  assert.deepEqual(layoutPoints(madgraph), layoutPoints(feynjs));
};
const legs = (source: string) => [...parse(source).vertices.values()].filter((v) => v.role === "out").map((v) => v.particle ?? v.label);

test("MadGraph's decays after commas are decay lines of their own", () => {
  drawsAs("p p > t t~, t > b w+, t~ > b~ w-", "p p > t t~\nt > b w+\nt~ > b~ w-");
  // (several of one name take the decays in turn, the last repeating, as decay lines do)
  drawsAs("p p > z z, z > e+ e-, z > mu+ mu-", "p p > z z\nz > e+ e-\nz > mu+ mu-");
  drawsAs("p p > z z, z > e+ e-", "p p > z z\nz > e+ e-");
  // (with lines and switches round it, and decays on lines of their own as well)
  drawsAs("layout: v2\np p > t t~, t > b w+\nt~ > b~ w-", "layout: v2\np p > t t~\nt > b w+\nt~ > b~ w-");
});

test("a decay in brackets comes with the decays of what it makes, bracket inside bracket", () => {
  drawsAs("p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)", "p p > t t~\nt > b w+\nt~ > b~ w-\nw+ > e+ ve\nw- > j j");
  drawsAs("p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)", "p p > t t~\nt > b w+(> e+ ve)\nt~ > b~ w-(> j j)");
  drawsAs("p p > t t~ h, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j), (h > b b~)", "p p > t t~ h\nt > b w+(> e+ ve)\nt~ > b~ w-(> j j)\nh > b b~");
  // nested: a heavy particle to a top, the top to a W, the W to leptons (as t1 > t n1 is written)
  drawsAs(
    "p p > zp zp~, (zp > t n, (t > b w+, w+ > e+ ve)), (zp~ > t~ n, (t~ > b~ w-, w- > j j))",
    "p p > zp zp~\nzp > t n\nzp~ > t~ n\nt > b w+\nt~ > b~ w-\nw+ > e+ ve\nw- > j j",
  );
  drawsAs("p p > h, (h > z z, z > e+ e-, z > mu+ mu-)", "p p > h\nh > z(> e+ e-) z(> mu+ mu-)");
  // (a decay in brackets decays only what its own particle makes: the other W is left alone)
  assert.deepEqual(legs("p p > t w-, (t > b w+, w+ > e+ ve)").sort(), ["b", "e+", "ve", "w-"]);
});

test("a decay chain in brackets that cannot be read says why", () => {
  assert.throws(() => parse("p p > t t~, (t > b w+, z > e+ e-)"), /makes no z/);
  assert.throws(() => parse("p p > t t~, (t > b w+, w+ > e+ ve"), /not closed/);
  assert.throws(() => parse("p p > t t~, (t > b w+, w+ > {t} > a a)"), /line of its own/);
  assert.throws(() => parse("p p > t t~, (t b w+)"), /particle > products/);
});

test("\">\" may be written without spaces; an arrow, \"->\", and lines with \"--\" are left as they were", () => {
  drawsAs("p p>t t~", "p p > t t~");
  drawsAs("p p>t t~,t>b w+", "p p > t t~\nt > b w+");
  drawsAs("p p>t t~,(t>b w+,w+>e+ ve)", "p p > t t~\nt > b w+(> e+ ve)");
  drawsAs("g g>{t}>h", "g g > {t} > h");
  drawsAs("g g>h [noborn=QCD]", "g g > h [noborn=QCD]");
  drawsAs("VBF>H", "VBF > H");
  // (not a process: an edge, a label with ">" in its brackets, a switch, an arrow)
  for (const source of ["a -- b [label=$x>0$]", "i [label=$m>0$] -- a -- f", "title: m>0\na -- b", "a -> b"]) assert.equal(expandChains(source), source);
});

test("a name with brackets that do not start with \">\" is one name: a hadron's state, psi(2S), X(3872)", () => {
  assert.deepEqual(legs("B+ > psi(2S) K+"), ["psi(2S)", "K+"]);
  assert.deepEqual(legs("p p > X(3872) j"), ["X(3872)", "j"]);
  assert.deepEqual(legs("p p > X(ucd)"), ["X(ucd)"]);
  assert.deepEqual(legs("Pc(uudcc~) > p J/psi"), ["p", "J/psi"]);
  // (the whole name reaches the registry, which reads the brackets as quark content: P_c, its quarks on hover)
  assert.equal(parse("Pc(uudcc~) > p J/psi").vertices.get("in2")!.label, "P_c");
  // (a name may go on after its brackets, and brackets may hold brackets)
  assert.deepEqual(legs("B0 > D*(2010)- pi+"), ["D*(2010)-", "pi+"]);
  // a hadron with brackets decays on a line of its own, or on the spot
  assert.deepEqual(legs("p p > psi(2S) j\npsi(2S) > J/psi pi+ pi-").sort(), ["J/psi", "j", "pi+", "pi-"]);
  assert.deepEqual(legs("p p > psi(2S)(> mu+ mu-)").sort(), ["mu+", "mu-"]);
  // the decay on the spot and an object's contents are as they were
  assert.deepEqual(legs("t > b w+(> e+ ve)"), ["b", "e+", "ve"]);
  assert.equal(expandChains("t > b w+( > e+ ve)"), expandChains("t > b w+(> e+ ve)"));
  assert.match(expandChains("p p > LRJ(1b W(2j)) j"), /\[LRJ\(1b W\(2j\)\)\]/);
  // (spaces inside are an object's alone: a decay with its ">" left out still says so)
  assert.throws(() => parse("p p > Z(e+ e-)"), /write a decay as "Z\(> products\)"/);
});
