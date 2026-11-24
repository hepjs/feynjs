// Every diagram in the repository drawn to SVG and hashed, so machines can be compared: the
// digest must be the same on every operating system, processor and JavaScript engine.
//
//   node scripts/platform-hashes.mjs [--out hashes.json]     (also: deno run -A, bun)
//   node scripts/platform-hashes.mjs --compare a.json b.json ...   which diagrams differ
//
// Run after `npm run build`. CI runs it on each platform and compares the digests.
import { readFileSync, writeFileSync } from "node:fs";
import { diagramSources, hashOfSvg, hashRecord } from "./lib/diagram-sources.mjs";

const args = process.argv.slice(2);
if (args[0] === "--compare") compareHashFiles(args.slice(1));
else await hashEveryDiagram(args[0] === "--out" ? args[1] : undefined);

async function hashEveryDiagram(outFile) {
  const { render } = await import("../dist/feynjs.mjs");
  const hashes = {};
  for (const file of diagramSources()) hashes[file] = hashOfSvg(drawOrError(render, readFileSync(file, "utf8")));
  const result = hashRecord(engineName(), `${process.platform}-${process.arch}`, hashes);
  if (outFile) writeFileSync(outFile, JSON.stringify(result, null, 1));
  console.log(`${result.engine} on ${result.platform}: ${result.count} diagrams, digest ${result.digest}`);
}

function drawOrError(render, source) {
  try { return render(source); } catch (error) { return `error: ${error.message}`; }
}

function engineName() {
  if (globalThis.Deno) return `deno ${globalThis.Deno.version.deno}`;
  if (globalThis.Bun) return `bun ${globalThis.Bun.version}`;
  return `node ${process.version}`;
}

/** Which diagrams differ between hash files from different machines; exits 1 if any do. */
function compareHashFiles(files) {
  const runs = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
  const [first, ...rest] = runs;
  let differing = 0;
  for (const run of rest) {
    const changed = Object.keys(first.hashes).filter((k) => first.hashes[k] !== run.hashes[k]);
    differing += changed.length;
    console.log(`${run.engine} on ${run.platform} vs ${first.engine} on ${first.platform}: ${changed.length ? `${changed.length} differ` : "identical"}`);
    for (const k of changed.slice(0, 20)) console.log(`  ${k}`);
  }
  if (differing) process.exit(1);
}
