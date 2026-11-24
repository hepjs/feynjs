import type { EdgeStyle, JetObject, ObjectContent } from "../model.ts";

/**
 * Detector objects written as words, like a line style: adjectives, then the object, then what
 * is drawn inside it, as counts with short names. Long and short names are the same thing.
 *
 *     v -- [large R jet 2j 1e] f1      a large-R jet holding two jets and an electron
 *     v -- [LRJ 2j 1e] f1              the same
 *     v -- [LRJ(2j, 1e)] f1            the same
 *     v -- [displaced jet] f2          (or [DIS J])
 *     v -- [SVJ] f3, [EMG] f4, [track] f5
 */
export const OBJECT_NAMES: { names: string[]; object: JetObject; short: string }[] = [
  { names: ["jet", "small r jet", "small-r jet"], object: "jet", short: "J" },
  { names: ["large r jet", "large-r jet", "large jet", "fat jet"], object: "large", short: "LRJ" },
  { names: ["small r jet"], object: "jet", short: "SRJ" },
  { names: ["track"], object: "track", short: "TRK" },
  { names: ["semi-visible jet", "semivisible jet"], object: "semivisible", short: "SVJ" },
  { names: ["emerging jet"], object: "emerging", short: "EMG" },
  { names: ["tau jet", "hadronic tau"], object: "tau", short: "TAU" },
  { names: ["missing energy"], object: "met", short: "MET" },
  { names: ["lepton jet", "lepton-jet"], object: "leptonjet", short: "LJ" },
  { names: ["top jet"], object: "top", short: "TOP" },
  { names: ["b jet", "b-jet"], object: "btag", short: "BJ" },
  { names: ["disappearing track"], object: "disappearing", short: "DT" },
  { names: ["displaced lepton"], object: "displacedlepton", short: "DL" },
  { names: ["proton remnant", "dissociated proton", "broken proton"], object: "remnant", short: "PR" },
];

/** Adjectives, long and short, that change how an object is drawn. */
export const OBJECT_ADJECTIVES: { names: string[]; adjective: string; short: string }[] = [
  { names: ["displaced"], adjective: "displaced", short: "DIS" },
];

/** What can be drawn inside an object, by its short name in a count (`2j 1e`). */
export const CONTENT_KINDS: Record<string, string> = {
  j: "jet", b: "bjet", e: "electron", mu: "muon", l: "lepton", tau: "tau", g: "photon", y: "photon", q: "quark",
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

// (short names in any case, lrj or LRJ, except where the word is a particle too: `tau`, `top` and
// `j` stay particles, TAU, TOP and J are the objects; long names in any case)
const PARTICLE_WORDS = new Set(["tau", "top", "j"]);
const sameShort = (short: string, word: string) => short === word || (!PARTICLE_WORDS.has(word) && short.toLowerCase() === word.toLowerCase());
const lookupObject = (word: string) => OBJECT_NAMES.find((o) => sameShort(o.short, word) || o.names.includes(word.toLowerCase()));
const lookupAdjective = (word: string) => OBJECT_ADJECTIVES.find((a) => a.short === word || a.names.includes(word.toLowerCase()));

/**
 * Read an object written as words; undefined when the words are not an object. Throws (with
 * the reason) when they start like one but cannot be read.
 */
export function parseObject(text: string): EdgeStyle | undefined {
  // (contents may follow the object's name in parentheses, `LRJ(2j, 1e)`, or as words after it)
  const all = words(text.trim());
  const named = all.length ? /^([A-Za-z][\w-]*)\((.*)\)$/.exec(all[all.length - 1]) : null;
  const head = named && !CONTENT_GROUPS[named[1]] ? [...all.slice(0, -1), named[1]] : all;
  const contentWords: string[] = named && !CONTENT_GROUPS[named[1]] ? words(named[2]) : [];
  const words_ = head;
  // adjectives first, then the longest run of words that names an object, then counts
  const adjectives: string[] = [];
  let k = 0;
  while (k < words_.length && lookupAdjective(words_[k])) adjectives.push(lookupAdjective(words_[k])!.adjective), k++;
  let object: JetObject | undefined, end = k;
  for (let n = Math.min(words_.length, k + 4); n > k; n--) {
    const found = lookupObject(words_.slice(k, n).join(" "));
    if (found) { object = found.object; end = n; break; }
  }
  if (!object) return undefined;
  const contents = parseContents([...words_.slice(end), ...contentWords]);
  if (!contents) return undefined;
  // (a displaced jet or lepton has a look of its own)
  if (adjectives.includes("displaced") && object === "jet") return { line: "jet", arrow: 0, object: "displaced" };
  return { line: "jet", arrow: 0, object, ...(adjectives.length ? { adjectives } : {}), ...(contents.length ? { contents } : {}) };
}
