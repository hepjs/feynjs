// Writes the force layout's settings into docs/reference/theme.md, family by family, from the
// code: each setting's default from the theme, its words from the comment above it in ForceRules,
// its family from src/engines/forces/families.ts. Run by `npm run docs`, so the page never drifts.
import { readFileSync, writeFileSync } from "node:fs";
import { defaultTheme } from "../src/theme.ts";
import { FAMILIES } from "../src/engines/forces/families.ts";

const theme = readFileSync(new URL("../src/theme.ts", import.meta.url), "utf8");
const block = theme.slice(theme.indexOf("export interface ForceRules"), theme.indexOf("\n}", theme.indexOf("export interface ForceRules")));
// (each setting's words: the /** ... */ just above it, or above the run of settings it shares one with)
const words = new Map();
let last = "";
for (const line of block.split("\n").slice(1)) {
  const comment = /^\s*\/\*\*\s*(.*?)\s*\*\/\s*$/.exec(line);
  if (comment) { last = comment[1]; continue; }
  const setting = /^\s*(\w+)\??:/.exec(line);
  if (setting) words.set(setting[1], last);
}
const cell = (text) => text.replace(/\|/g, "\\|");
const section = ["## Layout v2 forces: `forces`", "",
  "The weights the force layout balances (the default engine). Lengths are in propagator lengths.",
  "They come in seven families, by what they look at; no rule looks at a particle's name. A W and a",
  "Z are drawn alike, and every fermion alike but by its mass: the top (and any new heavy fermion) is",
  "massive, every lepton and every other quark light. `debug: on` shows which families hold each line.", ""];
for (const family of FAMILIES) {
  section.push(`### ${family.name[0].toUpperCase()}${family.name.slice(1)}`, "", `${family.about[0].toUpperCase()}${family.about.slice(1)}.`, "",
    "| Setting | Default | What it controls |", "|---|---|---|");
  for (const key of family.settings) section.push(`| \`forces.${key}\` | \`${defaultTheme.forces[key]}\` | ${cell(words.get(key) ?? "")} |`);
  section.push("");
}
const page = new URL("../docs/reference/theme.md", import.meta.url);
const text = readFileSync(page, "utf8");
const from = text.indexOf("## Layout v2 forces"), to = text.indexOf("## Layout v1 rules");
if (from < 0 || to < 0) throw new Error("docs/reference/theme.md: no forces section to replace");
writeFileSync(page, text.slice(0, from) + section.join("\n") + "\n" + text.slice(to));
console.log(`wrote ${FAMILIES.reduce((n, f) => n + f.settings.length, 0)} settings in ${FAMILIES.length} families`);
