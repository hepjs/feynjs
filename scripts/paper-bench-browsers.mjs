// Render times in real browsers (Chromium, Firefox, WebKit), timed inside the page with the
// page bundle, as scripts/paper-bench.mjs times them in Node, Deno and Bun.
//
//   npm install --no-save playwright && npx playwright install chromium firefox webkit
//   node scripts/paper-bench-browsers.mjs [--out-dir dir]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join } from "node:path";
import { chromium, firefox, webkit } from "playwright";

const REPEATS = 7;
const outDir = process.argv[2] === "--out-dir" ? process.argv[3] : undefined;
const files = execFileSync("git", ["ls-files", "*.feyn"]).toString().trim().split("\n").sort();
const sets = {
  all: files.map((f) => readFileSync(f, "utf8")),
  atlas: files.filter((f) => f.startsWith("validation/atlas/")).map((f) => readFileSync(f, "utf8")),
};

for (const [name, browserType] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage();
    await page.addScriptTag({ path: "dist/feynjs.min.js" });
    const record = { engine: `${name} ${browser.version()}`, platform: `${process.platform}-${process.arch}`, cpu: cpus()[0]?.model ?? "unknown" };
    for (const [set, sources] of Object.entries(sets)) record[set] = await page.evaluate(timeEachInPage, { sources, repeats: REPEATS });
    if (outDir) writeFileSync(join(outDir, `${name}.json`), JSON.stringify(record, null, 1));
    console.log(JSON.stringify(record));
  } finally {
    await browser.close();
  }
}

/** Runs inside the page: each diagram drawn `repeats` times after a warm-up, its median kept. */
function timeEachInPage({ sources, repeats }) {
  const draw = (source, k) => globalThis.feynjs.render(source, { idPrefix: `bench${k}` });
  const drawn = sources.filter((s) => { try { draw(s, "warm"); return true; } catch { return false; } });
  const median = (v) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
  const perDiagram = drawn.map((source) => {
    const times = [];
    for (let k = 0; k < repeats; k++) { const t = performance.now(); draw(source, k); times.push(performance.now() - t); }
    return median(times);
  }).sort((a, b) => a - b);
  const quantile = (q) => perDiagram[Math.min(perDiagram.length - 1, Math.floor(q * perDiagram.length))];
  const round = (ms) => Math.round(ms * 100) / 100;
  return {
    diagrams: drawn.length, medianMs: round(quantile(0.5)), meanMs: round(perDiagram.reduce((t, x) => t + x, 0) / perDiagram.length),
    p95Ms: round(quantile(0.95)), maxMs: round(perDiagram[perDiagram.length - 1]), totalMs: round(perDiagram.reduce((t, x) => t + x, 0)),
  };
}
