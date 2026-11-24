import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toTikz } from "../src/tools/tikz.ts";

// toTikz output must compile with plain pdflatex and TikZ-Feynman, at any size.

const SUSY = readFileSync("examples/susy.feyn", "utf8");

test("the PDF looks like the web page: the theme's line widths, waves, coils, arrows and label sizes", () => {
  const tikz = toTikz(SUSY, { unit: 1.4, standalone: false });
  assert.match(tikz, /line width=1\.15pt/, "a line is as thick, for its length, as on the page (1.5 px of 52)");
  assert.match(tikz, /every photon@@\/\.style=\{[^\n]*coil, aspect=0/, "waves are TikZ coils at zero aspect: any length compiles, and LaTeXML draws them");
  assert.match(tikz, /every gluon@@\/\.style=\{[^\n]*coil, aspect=0\.8/);
  assert.match(tikz, /with arrow\/\.style=\{[^\n]*\\fill/, "feynjs's notched arrowhead");
  assert.doesNotMatch(tikz, /complete sines/);
});

test("labels are where the web page puts them: one node per label, none left to TikZ", () => {
  const tikz = toTikz("i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]", { standalone: false });
  assert.equal(tikz.match(/\\node\[anchor=base west/g)?.length, 5, "e-, e+, mu-, mu+ and the photon's gamma");
  assert.doesNotMatch(tikz, /label=|edge label/);
});

test("hadrons are drawn as on the page: a brace beside the quarks, a shaded ellipse over their ends", () => {
  const braced = toTikz("in: u1 d1\nout: u2 d2\nu1 [u] -- [fermion] u2 [u]\nd1 [d] -- [fermion] d2 [d]\nmeson: \\pi = u1 d1 [brace]\nmeson: \\pi = u2 d2 [brace]", { standalone: false });
  assert.equal(braced.match(/\\draw\[color=\{rgb,255:red,192;green,57;blue,43\}[^\n]*\.\. controls/g)?.length, 2, "two braces in the page's hadron red");
  const shaded = toTikz("in: u1 d1\nout: u2 d2\nu1 [u] -- [fermion] u2 [u]\nd1 [d] -- [fermion] d2 [d]\nmeson: \\pi = u1 d1\nmeson: \\pi = u2 d2", { standalone: false });
  assert.equal(shaded.match(/ellipse \[x radius=/g)?.length, 2);
  assert.match(shaded, /fill opacity=0\.2/);
});

test("inline: a puts point a on the math axis of the text, as on the web page", () => {
  assert.match(toTikz("inline: a\ni1 [e-] -- a -- i2 [e+]\na -- [gamma] f [\\gamma]", { standalone: false }), /baseline=\{\(\[yshift=-0\.25em\]a\.base\)\}/);
});

test("panels are written side by side, each with its caption", () => {
  const tikz = toTikz(readFileSync("examples/panels.feyn", "utf8"), { standalone: false });
  assert.equal(tikz.match(/\\begin\{tikzpicture\}/g)?.length, 3);
  assert.match(tikz, /\(b\) with a Z/);
});

const TEX = texCompiler();

test("every example compiles with TeX (pdflatex, or tectonic from pixi), at tiny, small and full size", { skip: !TEX && "no pdflatex or tectonic" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "feynjs-tikz-"));
  const failures: string[] = [];
  for (const file of readdirSync("examples").filter((f) => f.endsWith(".feyn"))) {
    for (const unit of [0.3, 0.6, 1.6]) {
      const name = `${file.replace(/\W/g, "_")}_${String(unit).replace(".", "_")}`;
      writeFileSync(join(dir, `${name}.tex`), toTikz(readFileSync(join("examples", file), "utf8"), { unit }));
      try { execFileSync(TEX!.command, [...TEX!.args, `${name}.tex`], { cwd: dir, stdio: "ignore" }); }
      catch { failures.push(`${file} at ${unit} cm: ${firstError(join(dir, `${name}.log`))}`); }
    }
  }
  assert.deepEqual(failures, []);
});

test("every published diagram in the corpus compiles (40 to a document: pdfTeX's memory is fixed)", { skip: !TEX && "no pdflatex or tectonic" }, () => {
  // (the corpus carries what the examples do not: CSS and #hex colours, \text and \boldsymbol labels)
  const files = execFileSync("git", ["ls-files", "validation/atlas/*.feyn"]).toString().trim().split("\n");
  const pictures = files.map((file) => toTikz(readFileSync(file, "utf8"), { standalone: false })).filter((p) => !p.includes("\\begin{tabular}"));
  const dir = mkdtempSync(join(tmpdir(), "feynjs-corpus-"));
  const failures: string[] = [];
  for (let start = 0; start < pictures.length; start += 40) {
    const name = `corpus${start}`;
    writeFileSync(join(dir, `${name}.tex`), ["\\documentclass{article}", "\\usepackage{amsmath}", "\\usepackage{tikz-feynman}",
      "\\tikzfeynmanset{compat=1.1.0}", "\\begin{document}", ...pictures.slice(start, start + 40), "\\end{document}", ""].join("\n"));
    try { execFileSync(TEX!.command, [...TEX!.args, `${name}.tex`], { cwd: dir, stdio: "ignore", timeout: 300000 }); }
    catch { failures.push(`diagrams ${start}-${start + 39}: ${firstError(join(dir, `${name}.log`))}`); }
  }
  assert.deepEqual(failures, []);
});

/** pdflatex where TeX Live is installed, else tectonic (pixi's TeX, on every platform). */
function texCompiler(): { command: string; args: string[] } | undefined {
  const runs = (command: string) => { try { execFileSync(command, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } };
  if (runs("pdflatex")) return { command: "pdflatex", args: ["-interaction=nonstopmode", "-halt-on-error"] };
  if (runs("tectonic")) return { command: "tectonic", args: ["--keep-logs", "--chatter", "minimal"] };
  return undefined;
}

function firstError(log: string): string {
  try { return readFileSync(log, "utf8").split("\n").find((line) => line.startsWith("!")) ?? "no error line"; } catch { return "no log"; }
}
