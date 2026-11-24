#!/usr/bin/env node
// feynjs <render|check|describe|explain|measure|tikz> [file] [--unit cm] [--picture]
//   reads standard input when no file is given; a .json file, or JSON on standard input, is a
//   diagram given as data (see toSource). tikz: --unit is a propagator's length in cm,
//   --picture writes the tikzpicture alone, without a standalone document round it.
// feynjs cache [dir]
//   the LaTeX package's step (as bibtex is for citations): every <job>-feynjs-<n>.feyn the
//   feynjs package wrote becomes <job>-feynjs-<n>.tex, TikZ-Feynman with every vertex placed
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { check, describe, explain, measure, render, toTikz } from "../dist/feynjs.mjs";

const USAGE = "usage: feynjs <render|check|describe|explain|measure|tikz> [file] [--unit cm] [--picture]\n       feynjs cache [dir]";
const args = process.argv.slice(2);
const command = args[0];
const flags = readFlags(args.slice(1));

const commands = {
  render: (input) => render(input),
  tikz: (input) => toTikz(input, { unit: flags.unit, standalone: !flags.picture }),
  measure: (input) => JSON.stringify(measure(input), null, 2),
  describe: (input) => JSON.stringify(describe(input), null, 2),
  explain: (input) => explain(input),
  check: (input) => {
    const findings = check(input);
    if (findings.some((f) => f.severity === "error")) process.exitCode = 1;
    return findings.length ? findings.map((f) => `${f.severity}: ${f.message}  [${f.rule}]`).join("\n") : "no problems found";
  },
};

try {
  if (command === "cache") fillCache(flags.file ?? ".");
  else if (commands[command]) console.log(commands[command](readInput(flags.file)));
  else { console.error(USAGE); process.exit(2); }
} catch (error) {
  console.error(`feynjs: ${error.message}`);
  process.exit(1);
}

function readFlags(rest) {
  const flags = { unit: undefined, picture: false, file: undefined };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--unit") flags.unit = Number(rest[++i]);
    else if (rest[i] === "--picture") flags.picture = true;
    else flags.file = rest[i];
  }
  return flags;
}

/** The diagram: text, or data when it is a .json file or JSON on standard input. */
function readInput(file) {
  const text = readFileSync(file ?? 0, "utf8");
  return (file ?? "").endsWith(".json") || /^\s*\{/.test(text) ? JSON.parse(text) : text;
}

/**
 * Draw every diagram the LaTeX package wrote out. Each <job>-feynjs-<n>.feyn becomes
 * <job>-feynjs-<n>.tex. Its first line records the MD5 of the source it was drawn from (upper
 * case, as pdfTeX prints it), so the package knows when the source has changed; its second line
 * names the engine that drew it, so a newer feynjs redraws it too. One up to date on both counts
 * is left alone. Other .feyn files in the folder are not touched.
 */
function fillCache(dir) {
  if (!existsSync(dir)) throw new Error(`no folder ${dir}`);
  const engine = `engine ${engineFingerprint()}`;
  let drawn = 0, current = 0;
  for (const name of readdirSync(dir).filter((f) => /-feynjs-\d+\.feyn$/.test(f)).sort()) {
    const bytes = readFileSync(join(dir, name)), md5 = createHash("md5").update(bytes).digest("hex").toUpperCase();
    const target = join(dir, name.replace(/\.feyn$/, ".tex")), firstLine = `% feynjs ${md5}`;
    const [line1, line2 = ""] = existsSync(target) ? readFileSync(target, "utf8").split("\n") : [];
    if (line1 === firstLine && line2.includes(engine)) { current++; continue; }
    const { source, unit } = splitPackageHeader(bytes.toString("utf8"));
    writeFileSync(target, `${firstLine}\n% Drawn by feynjs (${engine}) from ${name}: every vertex placed, so it needs only TikZ-Feynman.\n${toTikz(source, { unit, standalone: false })}\n`);
    drawn++;
  }
  console.log(`feynjs: ${drawn} diagram${drawn === 1 ? "" : "s"} drawn, ${current} already up to date`);
}

/** A short fingerprint of the drawing engine (the bundle this command runs), or "unknown". */
function engineFingerprint() {
  try { return createHash("md5").update(readFileSync(new URL("../dist/feynjs.mjs", import.meta.url))).digest("hex").slice(0, 10); }
  catch { return "unknown"; }
}

/** The package writes its options on a first line, "%feynjs unit=1.4"; the rest is the diagram. */
function splitPackageHeader(text) {
  const lines = text.split(/\r?\n/);
  const header = /^%feynjs\b(.*)$/.exec(lines[0] ?? "");
  const unit = header && /unit=([\d.]+)/.exec(header[1]);
  return { source: (header ? lines.slice(1) : lines).join("\n"), unit: unit ? Number(unit[1]) : undefined };
}
