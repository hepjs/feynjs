// LaTeX's side of the paper's comparison, over the published diagrams (the ATLAS reproductions):
//   - feynjs: the diagram exported by toTikz (every vertex placed), compiled with pdfLaTeX;
//   - TikZ-Feynman: the same graph, labels and line styles, laid out by TikZ-Feynman's own
//     automatic layout (\feynmandiagram), which needs LuaLaTeX.
// Each document holds one diagram; each is compiled from a clean folder, and timed. A second pair
// of documents holds every diagram at once, to separate LaTeX's start-up from each diagram's cost.
//
//   node scripts/paper-tex-bench.mjs [--out file.json] [--limit n]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toTikz } from "../dist/feynjs.mjs";
import { automaticLayoutOf } from "./lib/automatic-layout.mjs";

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const limit = Number(option("--limit") ?? Infinity);

const failedAlone = new Set(); // automatic layouts LuaLaTeX could not compile on their own
const diagrams = publishedDiagrams().slice(0, limit);
const feynjsPictures = diagrams.map(({ source }) => toTikz(source, { standalone: false }));
const automaticPictures = diagrams.map(({ source }) => automaticLayoutOf(source));

const result = {
  diagrams: diagrams.length,
  feynjsPdflatex: compileEach(feynjsPictures, "pdflatex"),
  tikzFeynmanLualatex: compileEach(automaticPictures, "lualatex"),
  oneDocument: {
    feynjsPdflatex: compileTogether(feynjsPictures, "pdflatex"),
    tikzFeynmanLualatex: compileTogether(automaticPictures.filter((p, i) => !failedAlone.has(i)), "lualatex"),
  },
};
if (option("--out")) writeFileSync(option("--out"), JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));

function publishedDiagrams() {
  const files = execFileSync("git", ["ls-files", "validation/atlas/*.feyn"]).toString().trim().split("\n").sort();
  return files.map((file) => ({ file, source: readFileSync(file, "utf8") }))
    .filter(({ source }) => { try { return !toTikz(source, { standalone: false }).includes("\\begin{tabular}"); } catch { return false; } });
}

/** One document per diagram, compiled from a clean folder: seconds per document, and failures. */
function compileEach(pictures, engine) {
  const seconds = [];
  let failures = 0;
  pictures.forEach((picture, i) => {
    const time = compileDocument(picture, engine);
    if (time === undefined) { failures++; if (engine === "lualatex") failedAlone.add(i); }
    else seconds.push(time);
  });
  seconds.sort((a, b) => a - b);
  return { engine, compiled: seconds.length, failed: failures, medianSeconds: round(seconds[Math.floor(seconds.length / 2)]), meanSeconds: round(seconds.reduce((t, x) => t + x, 0) / seconds.length) };
}

/**
 * The cost of one more diagram, with LaTeX's start-up taken out: the diagrams compiled 25 to a
 * document (pdfTeX's fixed memory holds a few hundred TikZ-Feynman pictures at most), less the
 * time of the same number of empty documents.
 */
function compileTogether(pictures, engine) {
  const BATCH = 25, batches = [];
  for (let start = 0; start < pictures.length; start += BATCH) batches.push(pictures.slice(start, start + BATCH));
  const times = batches.map((batch) => compileDocument(batch.join("\n\n"), engine));
  if (times.some((t) => t === undefined)) return { engine, diagrams: pictures.length, failedBatches: times.filter((t) => t === undefined).length };
  const startUp = median([1, 2, 3].map(() => compileDocument("", engine)));
  const total = times.reduce((t, x) => t + x, 0);
  return { engine, diagrams: pictures.length, batches: batches.length, seconds: round(total), startUpSeconds: round(startUp),
    perDiagramSeconds: round((total - batches.length * startUp) / pictures.length) };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function compileDocument(body, engine) {
  const dir = mkdtempSync(join(tmpdir(), "feynjs-texbench-"));
  writeFileSync(join(dir, "d.tex"), ["\\documentclass{article}", "\\usepackage{amsmath}", "\\usepackage{tikz-feynman}", "\\tikzfeynmanset{compat=1.1.0}",
    "\\begin{document}", body, "\\end{document}", ""].join("\n"));
  const start = performance.now();
  try { execFileSync(engine, ["-interaction=nonstopmode", "-halt-on-error", "d.tex"], { cwd: dir, stdio: "ignore", timeout: 120000 }); }
  catch { return undefined; }
  return (performance.now() - start) / 1000;
}

function round(x) {
  return x === undefined || Number.isNaN(x) ? undefined : Math.round(x * 1000) / 1000;
}
