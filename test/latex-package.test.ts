import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// The LaTeX package's cycle, as an author meets it: LaTeX writes the sources, `feynjs cache`
// draws them, LaTeX reads the drawings; an edited diagram is noticed and redrawn.

const DOCUMENT = String.raw`\documentclass{article}
\usepackage{feynjs}
\begin{document}
\begin{feynjs}
p p > t tbar
t > b W+(> e+ nu)
\end{feynjs}
\feynjsset{unit=1.0}
\begin{feynjs}
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
\end{feynjs}
\end{document}
`;
const TEX = texCompiler();
const CLI = resolve("bin/feynjs.mjs");

test("the LaTeX package: write sources, draw them, read them in, notice an edit", { skip: !TEX && "no pdflatex or tectonic" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "feynjs-sty-"));
  copyFileSync("integrations/latex/feynjs.sty", join(dir, "feynjs.sty"));
  writeFileSync(join(dir, "doc.tex"), DOCUMENT);

  assert.equal(compileAndCountMissing(dir), 2, "first run: both diagrams wait to be drawn");
  assert.match(feynjsCache(dir), /2 diagrams drawn/);
  assert.equal(compileAndCountMissing(dir), 0, "second run: both drawn");
  assert.match(readFileSync(join(dir, "doc-feynjs-2.tex"), "utf8"), /^% feynjs [0-9A-F]{32}\n/);

  writeFileSync(join(dir, "doc.tex"), DOCUMENT.replace("a -- [gamma] b", "a -- [Z] b"));
  assert.equal(compileAndCountMissing(dir), 1, "an edited diagram is out of date");
  assert.match(feynjsCache(dir), /1 diagram drawn, 1 already up to date/);
  assert.equal(compileAndCountMissing(dir), 0);
});

/** Compile, and count the diagrams the package reported as new or changed (not drawn yet). */
function compileAndCountMissing(dir: string): number {
  execFileSync(TEX!.command, [...TEX!.args, "doc.tex"], { cwd: dir, stdio: "ignore" });
  return (readFileSync(join(dir, "doc.log"), "latin1").match(/Package feynjs Warning: Diagram \d+/g) ?? []).length;
}

function feynjsCache(dir: string): string {
  return execFileSync("node", [CLI, "cache", dir], { cwd: dir }).toString();
}

function texCompiler(): { command: string; args: string[] } | undefined {
  const runs = (command: string) => { try { execFileSync(command, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } };
  if (runs("pdflatex")) return { command: "pdflatex", args: ["-interaction=nonstopmode", "-halt-on-error"] };
  if (runs("tectonic")) return { command: "tectonic", args: ["--keep-logs", "--keep-intermediates", "--chatter", "minimal"] }; // (keeping what a document writes: the feynjs package's sources)
  return undefined;
}
