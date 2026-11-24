// Render times for the paper: every tracked diagram drawn to SVG, timed, in whichever engine runs
// this (node, deno run -A, bun). Each diagram is drawn REPEATS times after a warm-up pass; its
// time is the median. Each drawing gets its own idPrefix, so render()'s memory of recent drawings
// never answers instead of the layout. Prints one JSON line of statistics across diagrams.
//
//   node scripts/paper-bench.mjs [--out file.json]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";

const REPEATS = 7;

const { render } = await import("../dist/feynjs.mjs");
const files = trackedDiagrams();
const draw = (source, k) => render(source, { idPrefix: `bench${k}` });
const sourcesOf = (list) => list.map((file) => readFileSync(file, "utf8"));
const record = {
  engine: engineName(), platform: `${process.platform}-${process.arch}`, cpu: cpus()[0]?.model ?? "unknown",
  // every tracked diagram, and the published ones alone (the ATLAS reproductions)
  all: timeEach(sourcesOf(files), draw),
  atlas: timeEach(sourcesOf(files.filter((f) => f.startsWith("validation/atlas/"))), draw),
};
const out = process.argv[2] === "--out" ? process.argv[3] : undefined;
if (out) writeFileSync(out, JSON.stringify(record, null, 1));
console.log(JSON.stringify(record));

/** The diagrams under version control, so every machine times the same set. */
export function trackedDiagrams() {
  return execFileSync("git", ["ls-files", "*.feyn"]).toString().trim().split("\n").sort();
}

function timeEach(sources, draw) {
  const drawn = sources.filter((s) => { try { draw(s, "warm"); return true; } catch { return false; } }); // warm-up, and drop sources that do not parse
  const perDiagram = drawn.map((source) => {
    const times = [];
    for (let k = 0; k < REPEATS; k++) { const t = performance.now(); draw(source, k); times.push(performance.now() - t); }
    return median(times);
  }).sort((a, b) => a - b);
  const quantile = (q) => perDiagram[Math.min(perDiagram.length - 1, Math.floor(q * perDiagram.length))];
  return {
    diagrams: drawn.length,
    medianMs: round(quantile(0.5)), meanMs: round(perDiagram.reduce((t, x) => t + x, 0) / perDiagram.length),
    p95Ms: round(quantile(0.95)), maxMs: round(perDiagram[perDiagram.length - 1]),
    totalMs: round(perDiagram.reduce((t, x) => t + x, 0)),
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function round(ms) {
  return Math.round(ms * 100) / 100;
}

function engineName() {
  if (globalThis.Deno) return `Deno ${globalThis.Deno.version.deno}`;
  if (globalThis.Bun) return `Bun ${globalThis.Bun.version}`;
  return `Node ${process.version}`;
}
