// The diagrams the platform checks draw: every .feyn file under version control (in a git
// checkout; else every one in the examples, the corpus and the review set), in a fixed order,
// with forward slashes on every system, so every machine draws the same set. Shared by
// scripts/platform-hashes.mjs and scripts/platform-hashes-browsers.mjs.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export function diagramSources() {
  return (trackedFeynFiles() ?? ["examples", "corpus", "review"].flatMap((dir) => feynFilesUnder(dir))).sort();
}

function trackedFeynFiles() {
  try { return execFileSync("git", ["ls-files", "*.feyn"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim().split("\n"); }
  catch { return undefined; }
}

function feynFilesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".") || name.startsWith("_")) return [];
    const path = join(dir, name).split("\\").join("/");
    return statSync(path).isDirectory() ? feynFilesUnder(path) : path.endsWith(".feyn") ? [path] : [];
  });
}

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** One drawing's hash, or its error: the same form whichever engine drew it. */
export function hashOfSvg(svgOrError) {
  return svgOrError.startsWith("error: ") ? svgOrError : sha256(svgOrError).slice(0, 16);
}

/** A run's record: every diagram's hash, and one digest of them all. */
export function hashRecord(engine, platform, hashes) {
  return { engine, platform, digest: sha256(JSON.stringify(hashes)), count: Object.keys(hashes).length, hashes };
}
