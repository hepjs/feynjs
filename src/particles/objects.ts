import type { EdgeStyle, JetObject, ObjectContent } from "../model.ts";

/**
 * Detector objects, each with one name: lowercase, one word, said as people say it (`largejet`,
 * `bjet`, `emergingjet`), in any case (`largeJet`). The same name is a leg in a process, a
 * line's style, and holds contents:
 *
 *     p p > Zp > largejet(2j 1e)       a large-R jet holding two jets and an electron
 *     v -- [largejet 2j 1e] f1         the same, on a line
 *     v -- [largejet(2j, 1e)] f1       the same
 *
 * `old` are the names it had before: they still draw, and check() says what to write instead.
 */
export interface DetectorObject {
  name: string;
  object: JetObject;
  /** the leg's label, as a particle's */
  label: string;
  old: string[];
}

export const OBJECTS: DetectorObject[] = [
  { name: "lightjet", object: "jet", label: "j", old: ["jet", "small r jet", "small-r jet", "SRJ"] },
  { name: "bjet", object: "btag", label: "b", old: ["b jet", "b-jet", "BJ"] },
  { name: "cjet", object: "ctag", label: "c", old: [] },
  { name: "taujet", object: "tau", label: "\\tau_{\\mathrm{had}}", old: ["tauh", "tau jet", "hadronic tau", "TAU"] },
  { name: "largejet", object: "large", label: "J", old: ["J", "LRJ", "large r jet", "large-r jet", "large jet", "fat jet"] },
  { name: "topjet", object: "top", label: "J_t", old: ["Jt", "top jet", "TOP"] },
  { name: "emergingjet", object: "emerging", label: "\\text{EJ}", old: ["ej", "emerging jet", "EMG"] },
  { name: "semivisiblejet", object: "semivisible", label: "\\text{SVJ}", old: ["svj", "semi-visible jet", "semivisible jet", "SVJ"] },
  { name: "displacedjet", object: "displaced", label: "\\text{DJ}", old: ["dj", "displaced jet", "DIS J"] },
  { name: "leptonjet", object: "leptonjet", label: "\\text{LJ}", old: ["ljet", "lepton jet", "lepton-jet", "LJ"] },
  { name: "met", object: "met", label: "E_{\\mathrm{T}}^{\\mathrm{miss}}", old: ["missing energy", "MET"] },
  // (a track goes unlabelled, as papers draw one)
  { name: "track", object: "track", label: "", old: ["TRK"] },
  { name: "disappearingtrack", object: "disappearing", label: "\\text{DT}", old: ["dt", "disappearing track", "DT"] },
  { name: "displacedlepton", object: "displacedlepton", label: "\\ell_{\\mathrm{d}}", old: ["dislep", "displaced lepton", "DL"] },
  { name: "hscp", object: "heavycharged", label: "\\text{HSCP}", old: ["heavy charged"] },
  { name: "remnant", object: "remnant", label: "p^*", old: ["proton remnant", "dissociated proton", "broken proton", "PR"] },
];

/** Adjectives, long and short, that change how an object is drawn. */
export const OBJECT_ADJECTIVES: { names: string[]; adjective: string; short: string }[] = [
  { names: ["displaced"], adjective: "displaced", short: "DIS" },
];

/** What can be drawn inside an object, by its short name in a count (`2j 1e`). */
export const CONTENT_KINDS: Record<string, string> = {
  j: "jet", b: "bjet", c: "cjet", e: "electron", mu: "muon", l: "lepton", tau: "tau", g: "photon", y: "photon", q: "quark",
  nu: "neutrino", v: "neutrino",
};

/** Particles that may hold contents of their own inside an object: `W(2j)`, `Z(2l)`, `t(1b W(2j))`. */
export const CONTENT_GROUPS: Record<string, string> = { W: "W", Z: "Z", H: "H", t: "top", a: "a" };

/** Split words at spaces and commas outside parentheses: `1b W(1l, 1nu)` is two words. */
function words(text: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (depth === 0 && /[\s,]/.test(ch)) { if (cur) out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** Read contents: counts with short names, and groups such as `W(2j)`; undefined if any word is not one. */
function parseContents(list: string[]): ObjectContent[] | undefined {
  const out: ObjectContent[] = [];
  for (const word of list) {
    const group = /^(\d*)([A-Za-z]+)\((.*)\)$/.exec(word);
    if (group && CONTENT_GROUPS[group[2]]) {
      const inner = parseContents(words(group[3]));
      if (!inner) return undefined;
      out.push({ kind: CONTENT_GROUPS[group[2]], count: group[1] ? Number(group[1]) : 1, contents: inner });
      continue;
    }
    const c = /^(\d*)([a-z]+)$/i.exec(word);
    const kind = c && CONTENT_KINDS[c[2].toLowerCase()];
    if (!c || !kind) return undefined;
    out.push({ kind, count: c[1] ? Number(c[1]) : 1 });
  }
  return out;
}

// (a name in any case, largeJet; an old short name in any case too, lrj, except where the word is
// a particle: `tau`, `top`, `j` and `dl` (MadGraph's left down squark) stay particles)
const PARTICLE_WORDS = new Set(["tau", "top", "j", "dl"]);
const oldMatches = (old: string, word: string) => old === word || (!PARTICLE_WORDS.has(word) && old.toLowerCase() === word.toLowerCase());
/** The object a word or words name, by its name or an old one. */
export function objectNamed(words: string): DetectorObject | undefined {
  const lower = words.toLowerCase();
  return OBJECTS.find((o) => o.name === lower) ?? OBJECTS.find((o) => o.old.some((old) => oldMatches(old, words)));
}
/** The name to write for an old one (`LRJ` → `largejet`), or undefined if the word is not an old name. */
export function renamedObject(words: string): string | undefined {
  const o = OBJECTS.find((x) => x.name !== words.toLowerCase() && x.old.some((old) => oldMatches(old, words)));
  return o?.name;
}
/** Every word that names an object, new and old (for suggestions). */
export const objectWords = (): string[] => OBJECTS.flatMap((o) => [o.name, ...o.old]);
const lookupAdjective = (word: string) => OBJECT_ADJECTIVES.find((a) => a.short === word || a.names.includes(word.toLowerCase()));

/**
 * Read an object written as words; undefined when the words are not an object. Throws (with
 * the reason) when they start like one but cannot be read.
 */
export function parseObject(text: string): EdgeStyle | undefined {
  return readObject(text)?.style;
}

/** An object written as words, and its name (`largejet` for `LRJ 2j`). */
export function readObject(text: string): { name: string; style: EdgeStyle } | undefined {
  // (contents may follow the object's name in parentheses, `largejet(2j, 1e)`, or as words after it)
  const all = words(text.trim());
  const named = all.length ? /^([A-Za-z][\w-]*)\((.*)\)$/.exec(all[all.length - 1]) : null;
  const head = named && !CONTENT_GROUPS[named[1]] ? [...all.slice(0, -1), named[1]] : all;
  const contentWords: string[] = named && !CONTENT_GROUPS[named[1]] ? words(named[2]) : [];
  // (the longest run of words that names an object, adjectives and all, DIS J; else adjectives
  // first, then the object, then counts)
  const longest = (from: number) => {
    for (let n = Math.min(head.length, from + 4); n > from; n--) { const found = objectNamed(head.slice(from, n).join(" ")); if (found) return { found, end: n }; }
    return undefined;
  };
  const adjectives: string[] = [];
  let k = 0, hit = longest(0);
  if (!hit) {
    while (k < head.length && lookupAdjective(head[k])) adjectives.push(lookupAdjective(head[k])!.adjective), k++;
    hit = k ? longest(k) : undefined;
  }
  if (!hit) return undefined;
  const contents = parseContents([...head.slice(hit.end), ...contentWords]);
  if (!contents) return undefined;
  // (a displaced jet has a look of its own)
  if (adjectives.includes("displaced") && hit.found.object === "jet") return { name: "displacedjet", style: { line: "jet", arrow: 0, object: "displaced" } };
  return { name: hit.found.name, style: { line: "jet", arrow: 0, object: hit.found.object, ...(adjectives.length ? { adjectives } : {}), ...(contents.length ? { contents } : {}) } };
}
