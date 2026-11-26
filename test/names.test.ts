import { test } from "node:test";
import assert from "node:assert/strict";
import { check, lookupParticle, parse, particleInfo, render } from "../src/index.ts";
import { propertiesOf } from "../src/particles/properties.ts";
import { quarksOf } from "../src/render/bag.ts";

const label = (name: string) => lookupParticle(name)?.label;

test("MadGraph's MSSM names draw as the conventional names do, with the plugin's labels", () => {
  assert.equal(label("go"), "\\tilde g");
  assert.equal(lookupParticle("go")?.style.line, "coil");
  for (const [name, tex] of [["n1", "\\tilde\\chi^0_1"], ["n4", "\\tilde\\chi^0_4"], ["x1+", "\\tilde\\chi^+_1"], ["x2-", "\\tilde\\chi^-_2"]]) {
    assert.equal(label(name), tex, name);
    assert.deepEqual(lookupParticle(name)?.style, { line: "wave", arrow: 0, overlay: true, cls: "susy" }, name);
  }
  for (const [name, tex] of [["ul", "\\tilde u_{L}"], ["dr", "\\tilde d_{R}"], ["sl", "\\tilde s_{L}"], ["t1", "\\tilde t_1"], ["b2", "\\tilde b_2"],
    ["el-", "\\tilde{e}^-_L"], ["mur+", "\\tilde{\\mu}^+_R"], ["ta1-", "\\tilde\\tau^-_1"], ["sve", "\\tilde\\nu_{e}"], ["svt", "\\tilde\\nu_{\\tau}"]]) {
    assert.equal(label(name), tex, name);
    assert.deepEqual(lookupParticle(name)?.style, { line: "dash", arrow: 0, overlay: false, cls: "susy" }, name);
  }
  // (antisquarks and anti-sneutrinos keep their bar)
  assert.equal(label("ul~"), "\\bar{\\tilde u_{L}}");
  assert.equal(label("sve~"), "\\bar{\\tilde\\nu_{e}}");
  assert.deepEqual(["h1", "h2", "h3", "h+", "h-"].map(label), ["h", "H", "A", "H^+", "H^-"]);
  assert.equal(label("vl"), "\\nu_\\ell");
  assert.equal(label("vl~"), "\\bar\\nu_\\ell");
  assert.match(render("a [in] -- [ul] b [out]"), /feynjs-susy/);
  assert.equal(propertiesOf("ul")?.colour, "triplet");
});

test("dl is the left down squark; the displaced lepton is dislep, displaced lepton or DL", () => {
  assert.equal(label("dl"), "\\tilde d_{L}");
  assert.equal(lookupParticle("dl")?.style.cls, "susy");
  for (const style of ["dislep", "displaced lepton", "DL"]) {
    assert.equal(parse(`a -- [${style}] b`).edges[0].style.object, "displacedlepton", style);
  }
  assert.equal(parse("a -- [dl] b").edges[0].style.object, undefined);
  assert.equal(parse("a [in] -- b [dislep, out]").vertices.get("b")?.label, "\\ell_{\\mathrm{d}}");
  assert.match(particleInfo("dislep")!, /displaced lepton/);
});

test("SUSY names, generic and numbered", () => {
  assert.equal(label("neutralino"), "\\tilde\\chi^0");
  // (the generic chargino keeps its old label: changing it would move approved layouts)
  assert.equal(label("chargino"), "\\tilde\\chi^\\pm_1");
  assert.equal(label("higgsino"), "\\tilde H");
  assert.equal(label("wino"), "\\tilde W");
  assert.deepEqual(["neutralino1", "neutralino4", "chargino1", "chargino2", "chargino1+", "chargino2-"].map(label),
    ["\\tilde\\chi^0_1", "\\tilde\\chi^0_4", "\\tilde\\chi^\\pm_1", "\\tilde\\chi^\\pm_2", "\\tilde\\chi^+_1", "\\tilde\\chi^-_2"]);
  assert.deepEqual(["higgsino0", "higgsino+", "higgsino-", "higgsino1", "higgsino2", "wino0", "wino+", "wino-", "bino"].map(label),
    ["\\tilde H^0", "\\tilde H^+", "\\tilde H^-", "\\tilde H^0_1", "\\tilde H^0_2", "\\tilde W^0", "\\tilde W^+", "\\tilde W^-", "\\tilde B"]);
  assert.deepEqual(["stop1", "stop2", "sbottom1", "sbottom2", "stau1", "stau2", "selectronL", "selectronR", "smuonL", "smuonR"].map(label),
    ["\\tilde t_1", "\\tilde t_2", "\\tilde b_1", "\\tilde b_2", "\\tilde\\tau_1", "\\tilde\\tau_2", "\\tilde e_L", "\\tilde e_R", "\\tilde\\mu_L", "\\tilde\\mu_R"]);
  assert.equal(lookupParticle("NLSP")?.style.cls, "susy");
  // (names that worked before still do)
  for (const name of ["gluino", "squark", "stop", "sbottom", "slepton", "stau", "selectron", "smuon", "sneutrino", "neutralino2", "neutralino3",
    "chargino+", "chargino-", "gravitino", "LSP", "Gluino", "NEUTRALINO1"]) assert.ok(lookupParticle(name), name);
});

test("hadrons by their English names: mesons dashed, baryons in three lines, each with its quarks", () => {
  assert.deepEqual(["pion", "pi+", "pi0", "kaon", "K+", "K0", "K0bar", "KS", "KL", "eta", "eta'", "rho+", "rho0", "omega", "jpsi", "J/psi", "psi2S", "upsilon"].map(label),
    ["\\pi", "\\pi^+", "\\pi^0", "K", "K^+", "K^0", "\\bar K^0", "K^0_S", "K^0_L", "\\eta", "\\eta'", "\\rho^+", "\\rho^0", "\\omega", "J/\\psi", "J/\\psi", "\\psi(2S)", "\\Upsilon"]);
  assert.deepEqual(["D0", "D+", "Ds", "B0", "B-", "Bs", "Bc"].map(label), ["D^0", "D^+", "D_s", "B^0", "B^-", "B_s", "B_c"]);
  assert.deepEqual(["Lambda", "Lambda_b", "Lambda_c", "Sigma", "Xi", "Omega", "Delta", "n", "neutron", "pbar", "antiproton"].map(label),
    ["\\Lambda", "\\Lambda_b", "\\Lambda_c", "\\Sigma", "\\Xi", "\\Omega", "\\Delta", "n", "n", "\\bar p", "\\bar p"]);
  assert.equal(lookupParticle("K+")?.style.line, "dash");
  assert.equal(lookupParticle("Sigma")?.style.line, "triple");
  // (case tells the Omega baryon from the omega meson, and Sigma from a sigma)
  assert.equal(lookupParticle("Omega-")?.style.line, "triple");
  assert.equal(lookupParticle("omega")?.style.line, "dash");
  assert.equal(lookupParticle("sigma"), undefined);
  // (B alone is still the heavy bottom partner, phi the hypothetical scalar)
  assert.equal(propertiesOf("B")?.name, "vector-like bottom partner");
  assert.equal(propertiesOf("phi")?.name, "scalar");
  assert.equal(label("phi1020"), "\\phi(1020)");
  assert.equal(label("phi(1020)"), "\\phi(1020)");
  const kaon = propertiesOf("K+")!;
  assert.deepEqual([kaon.quarks, kaon.charge, kaon.mass], ["us̄", "+1", "493.7 MeV"]);
  assert.match(particleInfo("Lambda_b")!, /quarks udb · charge 0 · spin 1\/2 · mass 5619.6 MeV/);
});

test("excited hadrons take a star, and any hadron a charge", () => {
  assert.deepEqual(["K*", "K*0", "K*+", "K*-", "D*", "D*0", "D*+", "B*", "rho*", "Sigma*+"].map(label),
    ["K^*", "K^{*0}", "K^{*+}", "K^{*-}", "D^*", "D^{*0}", "D^{*+}", "B^*", "\\rho^*", "\\Sigma^{*+}"]);
  assert.equal(propertiesOf("K*0")?.spin, "1");
  assert.deepEqual(["kaon+", "pion0", "Sigma-", "Xi0", "Omega-", "Delta++", "Lambda_b0", "Bs0"].map(label),
    ["K^+", "\\pi^0", "\\Sigma^-", "\\Xi^0", "\\Omega^-", "\\Delta^{++}", "\\Lambda_b^0", "B_s^0"]);
  assert.equal(propertiesOf("Delta++")?.charge, "+2");
});

test("a hadron written with its content in parentheses", () => {
  const baryon = propertiesOf("X(ucd)")!;
  assert.equal(label("X(ucd)"), "X");
  assert.deepEqual([baryon.quarks, baryon.charge], ["ucd", "+1"]);
  assert.equal(lookupParticle("X(ucd)")?.style.line, "triple");
  assert.equal(lookupParticle("X(cc~)")?.style.line, "dash");
  assert.equal(propertiesOf("X(cc~)")?.quarks, "cc̄");
  assert.equal(label("Pc(uudcc~)"), "P_c");
  assert.equal(propertiesOf("Pc(uudcc~)")?.name, "pentaquark");
  // (anything else in the parentheses is part of the label)
  assert.equal(label("psi(2S)"), "\\psi(2S)");
  assert.equal(label("X(3872)"), "X(3872)");
  // (on a line)
  const e = parse("a [in] -- [X(ucd)] b [out]").edges[0];
  assert.equal(e.particle, "X(ucd)");
  assert.equal(e.style.line, "triple");
  assert.match(render("a [in] -- [X(ucd)] b [out]", { tooltips: true }), /quarks ucd/);
  // (a bag of a hadron named so)
  assert.equal(quarksOf("Sigma+")?.length, 3);
  assert.equal(quarksOf("K*0")?.length, 2);
});

test("aliases keep their tooltip and charge colour", () => {
  for (const [alias, name] of [["w+", "W+"], ["t~", "tbar"], ["ta+", "tau+"], ["n1", "neutralino1"], ["go", "gluino"], ["ve", "nu_e"]]) {
    assert.equal(particleInfo(alias), particleInfo(name), alias);
  }
  const svg = render("charge colour: on\na [in] -- [w+] b\nb -- [ta+] c [out]", { tooltips: true });
  assert.ok((svg.match(/#e76300/g) ?? []).length >= 2, "w+ and ta+ drawn in the positive charge's colour");
  assert.match(svg, /W boson · charge \+1/);
});

test("antiparticles with a tilde: a charge turned round, a neutrino's bar on its symbol", () => {
  assert.equal(label("pi+~"), "\\pi^-");
  assert.equal(propertiesOf("pi+~")?.charge, "-1");
  assert.deepEqual(["ve~", "vm~", "vt~", "nu_e~"].map(label), ["\\bar\\nu_e", "\\bar\\nu_\\mu", "\\bar\\nu_\\tau", "\\bar\\nu_e"]);
  assert.equal(propertiesOf("ve~")?.name, "electron antineutrino");
  assert.equal(label("K0~"), "\\bar K^0");
  assert.equal(label("D0~"), "\\bar D^0");
  assert.equal(label("N~"), "\\bar{N}");
});

test("check warns of a name a process does not know", () => {
  const findings = check("e+ e- > glunio Y");
  const unknown = findings.filter((f) => f.rule === "unknown-particle");
  assert.equal(unknown.length, 2);
  assert.match(unknown[0].message, /"glunio".*did you mean "gluino"/);
  assert.equal(check("p p > go go\ngo > t1 t~\nt1 > t n1").filter((f) => f.rule === "unknown-particle").length, 0);
  assert.equal(check("g g > {t} > H\np p > W+(> e+ ve) LRJ(2j)").filter((f) => f.rule === "unknown-particle").length, 0);
  // (edges name their labels freely: no warning)
  assert.equal(check("a [in] -- b [Y, out]").filter((f) => f.rule === "unknown-particle").length, 0);
});

test("detector objects have one name each, the same on a leg, on a line and in a process", () => {
  const names: [string, string][] = [["lightjet", "jet"], ["bjet", "btag"], ["cjet", "ctag"], ["taujet", "tau"], ["largejet", "large"], ["topjet", "top"],
    ["semivisiblejet", "semivisible"], ["emergingjet", "emerging"], ["displacedjet", "displaced"], ["leptonjet", "leptonjet"], ["met", "met"],
    ["track", "track"], ["disappearingtrack", "disappearing"], ["displacedlepton", "displacedlepton"], ["hscp", "heavycharged"], ["remnant", "remnant"]];
  for (const [name, object] of names) {
    assert.equal(lookupParticle(name)?.style.object, object, name);
    assert.equal(parse(`a -- [${name}] b`).edges[0].style.object, object, `${name} on a line`);
    assert.match(render(`p p > Zp > ${name} ${name}`), /feynjs-jet|<path/, `${name} in a process`);
    assert.deepEqual(check(`p p > Zp > ${name} j`).filter((f) => f.rule === "renamed-object"), [], name);
  }
  // (in any case)
  assert.equal(lookupParticle("largeJet")?.style.object, "large");
  assert.equal(parse("a -- [semiVisibleJet] b").edges[0].style.object, "semivisible");
  // (J is a large-R jet everywhere now: on a line as on a leg)
  assert.equal(parse("a -- [J] b").edges[0].style.object, "large");
  assert.equal(parse("a -- b [J]").vertices.get("b")?.particle, "J");
  // (contents after the name, as words or in parentheses)
  assert.deepEqual(parse("a -- [largejet 2j 1e] b").edges[0].style.contents, [{ kind: "jet", count: 2 }, { kind: "electron", count: 1 }]);
  assert.deepEqual(parse("a -- [largejet(2j, 1e)] b").edges[0].style.contents, [{ kind: "jet", count: 2 }, { kind: "electron", count: 1 }]);
});

test("older object names still draw, and check gives the name to write", () => {
  for (const [old, now] of [["LRJ", "largejet"], ["tauh", "taujet"], ["SVJ", "semivisiblejet"], ["EMG", "emergingjet"], ["Jt", "topjet"], ["dislep", "displacedlepton"], ["J", "largejet"]]) {
    assert.equal(parse(`a -- [${old}] b`).edges[0].style.object, lookupParticle(now)?.style.object, old);
    const found = check(`i [p] -- a\na -- [${old}] f [e-]`).find((f) => f.rule === "renamed-object");
    assert.match(found?.message ?? "", new RegExp(`"${now}"`), old);
  }
  for (const [old, now] of [["b jet", "bjet"], ["DIS J", "displacedjet"], ["large R jet 2j", "largejet"]]) {
    assert.match(check(`i [p] -- a\na -- [${old}] f [e-]`).find((f) => f.rule === "renamed-object")?.message ?? "", new RegExp(`"${now}"`), old);
  }
  assert.match(check("p p > Zp > LRJ(2j) SVJ").map((f) => f.message).join("\n"), /"largejet"[\s\S]*"semivisiblejet"/);
  // (old diagrams draw as they did: an old word on a line is unlabelled, as before)
  assert.equal(parse("a -- [LRJ 2j] b").edges[0].label, undefined);
  // (a line style is not an old name: [jet] is the cone style)
  assert.deepEqual(check("i [p] -- a\na -- [jet] f [j]").filter((f) => f.rule === "renamed-object"), []);
});

test("an object in a process takes a label line, is named in the description, and check finds no unlabelled leg", () => {
  const src = "p p > t tbar\nt > bjet W+(> largejet)\ntbar > bbar W-(> e- nu~)";
  const relabelled = render(`label: largejet = \\text{large-}R\\text{ jet}\n${src}`);
  assert.notEqual(render(src), relabelled);
  assert.match(relabelled, /large-/);
  // (an old name in the label line labels the object too)
  assert.notEqual(render("p p > Zp > largejet largejet"), render("label: LRJ = X\np p > Zp > largejet largejet"));
  assert.match(render(src), /a large-R jet/);
  assert.deepEqual(check(src), []);
  // (with contents, the leg is still named and labelled)
  assert.equal(parse("p p > Zp > largejet(1b W(2j)) j").vertices.get([...parse("p p > Zp > largejet(1b W(2j)) j").vertices.keys()].find((k) => k.startsWith("out"))!)?.particle, "largejet");
});

test("natural names: proton, neutrino, antineutrino", () => {
  assert.equal(label("proton"), "p");
  assert.equal(label("neutrino"), "\\nu");
  assert.equal(label("antineutrino"), "\\bar\\nu");
  assert.deepEqual(check("proton proton > W+ > e+ neutrino").filter((f) => f.rule === "unknown-particle"), []);
});

test("a c-jet draws its secondary vertex nearer the collision than a b-jet does", () => {
  const b = render("a -- [bjet] f"), c = render("a -- [cjet] f");
  assert.notEqual(b, c);
  assert.match(c, /data-object="ctag"/);
});

test("a circle with a label inside marks where a jet starts; b- and c-jets show their decay vertices", () => {
  const d = parse("a [circle=b] -- [bjet, no label] f");
  assert.equal(d.vertices.get("a")?.shape, "circle");
  assert.equal(d.vertices.get("a")?.circleLabel, "b");
  const svg = render("a [circle=b] -- [bjet, no label] f");
  assert.match(svg, /class="feynjs-circle"/);
  // (a b-jet: the B's vertex and the D's; a c-jet: the D's alone; both with the jet's faint tracks)
  assert.match(svg, /feynjs-sv-b[\s\S]*feynjs-sv-c/);
  const c = render("a -- [cjet] f");
  assert.doesNotMatch(c, /feynjs-sv-b/);
  assert.match(c, /feynjs-sv-c/);
  assert.match(render("a -- [lightjet] f"), /feynjs-jet-tracks/);
  // (a track is unlabelled)
  assert.equal(parse("a -- [track] f").edges[0].label, undefined);
});

test("rotate: turns a drawing; a lone jet from a flavour circle stands up, leaning right", async () => {
  const { layoutDiagram } = await import("../src/render/render.ts");
  const { defaultTheme } = await import("../src/theme.ts");
  const at = (src: string) => { const d = parse(src); layoutDiagram(d, defaultTheme); const a = d.vertices.get("a")!, f = d.vertices.get("f")!; return (Math.atan2(-(f.y - a.y) * (defaultTheme.unitY / defaultTheme.unitX), f.x - a.x) * 180) / Math.PI; };
  assert.ok(Math.abs(at("a [circle=b] -- [bjet] f") - 78) < 0.5, "12° right of straight up");
  assert.ok(Math.abs(at("rotate: 30\na [circle=b] -- [bjet] f") - 108) < 0.5, "turned counterclockwise");
  const flat = at("a -- [bjet] f"), turned = at("rotate: 15\na -- [bjet] f");
  assert.ok(Math.abs(turned - flat - 15) < 0.5);
});

test("notes point at objects by name, inside a diagram, and at a b-jet's B and D vertices", () => {
  assert.doesNotThrow(() => render("a [circle=b] -- [bjet, no label] f\nnote: B \"B meson\"\nnote: D \"D meson\"\nnote: f.B \"the same B\""));
  assert.doesNotThrow(() => render("p p > Z H\nH > bjet bjet\nnote: bjet \"b-tagged\""));
  assert.doesNotThrow(() => render("i -- a\na -- [largejet 2j] b\nb -- f1\nb -- f2\nnote: largejet \"inside\""));
  assert.throws(() => render("p p > Z H\nH > b b~\nnote: D \"none here\""), /B or D vertex/);
});
