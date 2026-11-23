#!/usr/bin/env node
// feynjs <render|check|describe|explain|measure|tikz> [file]   (reads standard input when no file is given)
import { readFileSync } from "node:fs";
import { check, describe, explain, measure, render, toTikz } from "../dist/feynjs.mjs";

const [command, file] = process.argv.slice(2);
const commands = {
  render: (source) => render(source),
  tikz: (source) => toTikz(source),
  measure: (source) => JSON.stringify(measure(source), null, 2),
  describe: (source) => JSON.stringify(describe(source), null, 2),
  explain: (source) => explain(source),
  check: (source) => {
    const findings = check(source);
    if (findings.some((f) => f.severity === "error")) process.exitCode = 1;
    return findings.length ? findings.map((f) => `${f.severity}: ${f.message}  [${f.rule}]`).join("\n") : "no problems found";
  },
};
if (!commands[command]) {
  console.error("usage: feynjs <render|check|describe|explain|measure|tikz> [file]");
  process.exit(2);
}
try {
  console.log(commands[command](readFileSync(file ?? 0, "utf8")));
} catch (error) {
  console.error(`feynjs: ${error.message}`);
  process.exit(1);
}
