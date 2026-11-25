import { FeynError } from "../model.ts";
import type { ChainNucleus, DecayStep } from "../model.ts";
import { lookupParticle, particleNames } from "../particles/registry.ts";
import { parseObject } from "../particles/objects.ts";
import { ELEMENTS, elementSymbol, isotopeLabel, nucleonCount } from "../render/nucleus.ts";

/**
 * Decay chains: a shorthand for cascades, written with `>` and expanded into ordinary lines
 * before the diagram is read, so it mixes freely with them.
 *
 *     p p > gluino gluino            the process: two protons (a blob) make two gluinos
 *     gluino > q q neutralino2       every gluino decays this way...
 *     neutralino2 > Z neutralino1    ...and every neutralino2 this way
 *
 * The first `>` line is the process. Its left side is what comes in: `p p` draws the beams
 * into a blob, other particles meet at a point, and a single particle is a decay. A particle
 * between two `>` is a line the process passes through (`d dbar > g > t tbar`). Later `>` lines
 * say how a particle decays, wherever it appears; where one particle has several, they are
 * taken in turn (the first gluino decays the first way, the second the second way, the last
 * way repeating). `W+(> e+ nu)` decays one particle on the spot instead. Whatever does not
 * decay leaves the diagram.
 *
 * MadGraph's way of writing the decays goes too, on the process line after commas:
 * `p p > t t~, (t > b w+, w+ > e+ ve), t~ > b~ w-` (a decay in brackets coming with the decays of
 * what it makes), and `>` with no spaces round it, `p p>t t~`. A name may carry brackets that do
 * not start with `>`, a hadron's state: `psi(2S) > J/psi pi+ pi-`.
 *
 * A loop is a segment of its own, in braces, the particle that runs round it named inside:
 * `g g > {t} > H` passes through a top loop. Everything that meets the loop, coming in or going
 * on, meets it at a corner of its own, so that is the top triangle; `g g > {t} > H H` is a box,
 * `g g > {t} > H > H H` the triangle with its Higgs splitting, and a decay can go through one too
 * (`H > {W+} > a a`). A process pasted from MadGraph with `[noborn=QCD]` goes through a top loop.
 *
 * A production mode may stand for what comes in: `ggF > H` is `g g > {t} > H`; `VBF > H` (or
 * `VBS > W+ W+`) two quark lines each giving off a boson and going on forward, the two bosons
 * meeting where what is made comes out (`VBF(W)`, `VBF(Z)` name the bosons; V by default). Three
 * or more made (`VBS(W) > W+ H W-`) come off a boson exchanged between the two, top to bottom;
 * `VBS(W, H)` names what is exchanged (a Higgs: the middle vertex is then the Higgs self-coupling).
 *
 * A process with a name that can only be a nucleus, an isotope (`4He`, `235U`) or an element no
 * particle is called (`He`, `Fe`), is a nuclear one: `2H 3H > 4He n`. In it every element's
 * symbol is a nucleus (`H` is hydrogen there, not the Higgs) and `p` and `n` are one proton and
 * one neutron; each leg ends in its nucleus, a plain line with no arrow, and they meet at a blob.
 * (`found.nuclear` says whether the process was one: it is drawn as a reaction unless asked not to.)
 */
export function expandChains(source: string, found: { nuclear?: boolean; decayChain?: DecayStep[] } = {}): string {
  const lines = source.split("\n");
  const isChain = (line: string) => (/(^|\s)>(\s|$)/.test(stripComment(line)) || hasCloseArrow(line)) && !/--/.test(line);
  if (!lines.some(isChain)) return source;

  let made = 0;
  const fresh = (prefix: string) => `${prefix}${++made}`;
  const out: string[] = [];
  // the ways each particle decays, taken in turn by its instances (the last one repeating)
  const rules = new Map<string, Rule[]>();
  const taken = new Map<string, number>();
  let process: { line: number; segments: Item[][]; nuclear: boolean } | undefined;
  lines.forEach((line, n) => {
    if (!isChain(line)) return;
    // (MadGraph's decays after commas, p p > t t~, t > b w+, are read as lines of their own)
    const statements = madGraphDecays(stripComment(line), n + 1).map((statement, k) => withMadGraphLoop(productionMode(statement, !process && k === 0), n + 1));
    // (a line with a name that can only be a nucleus is nuclear: its element symbols are nuclei)
    const nuclear = markNuclei(statements, n + 1);
    for (const segments of statements) {
      if (!process) { process = { line: n + 1, segments, nuclear }; continue; }
      // a decay: "particle > products", or through a loop, "particle > {t} > products"
      const loop = segments.length === 3 && isLoop(segments[1]) ? loopName(segments[1]) : undefined;
      if (!(segments.length === 2 || loop) || segments[0].length !== 1 || segments[0][0].decay || isLoop(segments[0])) throw new FeynError(`a decay reads "particle > products" (or "particle > {t} > products" through a loop)`, n + 1);
      const name = segments[0][0].name;
      rules.set(name, [...(rules.get(name) ?? []), { products: segments[segments.length - 1], loop }]);
    }
  });

  const nextDecay = (name: string): Rule | undefined => {
    const ways = rules.get(name);
    if (!ways) return undefined;
    const k = taken.get(name) ?? 0;
    taken.set(name, k + 1);
    return ways[Math.min(k, ways.length - 1)];
  };
  const edgeStyle = (item: Item) => (item.nucleus ? `ion, label={${item.nucleus.label}}` : lookupParticle(item.name) ? item.name : `label={${item.name}}`);
  // (in a nuclear process, where things meet is a blob)
  const nuclear = process!.nuclear;
  const asBlob = (at: string) => { if (nuclear) out.push(`${at} [blob]`); };
  /** A closed loop of `name` through `count` new corners, named once; the corners in order round it. */
  const drawLoop = (name: string, count: number, line: number): string[] => {
    if (count < 2) throw new FeynError(`a loop needs at least two lines meeting it`, line);
    const corners = Array.from({ length: count }, () => fresh("v"));
    const side = (k: number) => (lookupParticle(name) ? `${name}${k === 0 ? "" : ", no label"}` : k === 0 ? `fermion, label={${name}}` : "fermion");
    corners.forEach((c, k) => out.push(`${c} -- [${side(k)}] ${corners[(k + 1) % count]}`));
    return corners;
  };
  // a particle made at `from`: a line on to where it decays (or to the loop it decays through),
  // or a leg out of the diagram
  const emit = (from: string, item: Item, seen: string[]): void => {
    const rule: Rule | undefined = item.decay ? { products: item.decay } : seen.includes(item.name) ? undefined : nextDecay(item.name);
    // (a detector object, LRJ or SVJ, is drawn as one: the leg takes the object's style; a name
    // that is a particle as written, tau, stays the particle)
    if (!rule && item.nucleus) { out.push(`${from} -- [ion] ${fresh("out")} [${nucleusOptions(item.nucleus)}, out]`); return; }
    if (!rule && !particleNames().includes(item.name) && parseObject(item.name)) { out.push(`${from} -- [${item.name}] ${fresh("out")} [out]`); return; }
    if (!rule) { out.push(`${from} -- ${fresh("out")} [${item.name}, out]`); return; }
    if (rule.loop) {
      const corners = drawLoop(rule.loop, 1 + rule.products.length, process!.line);
      out.push(`${from} -- [${edgeStyle(item)}] ${corners[0]}`);
      const leaving = corners.slice(1).reverse();
      rule.products.forEach((product, k) => emit(leaving[k], product, [...seen, item.name]));
      return;
    }
    const at = fresh("v");
    out.push(`${from} -- [${edgeStyle(item)}] ${at}`);
    asBlob(at);
    for (const product of rule.products) emit(at, product, [...seen, item.name]);
  };

  const { segments, line } = process!;
  // (said back, so a nuclear process is drawn as the reaction it is, or the decay chain)
  found.nuclear = nuclear;
  if (nuclear) found.decayChain = decayChainOf(segments, rules);
  if (segments.length < 2) throw new FeynError(`a process reads "incoming > outgoing"`, line);
  // what has arrived so far: one point where things already meet (the beams' blob), or the ends
  // of lines still to be joined to whatever comes next
  let meeting: string | undefined;
  let ends: ((to: string) => void)[] = [];
  const [incoming] = segments;
  if (isLoop(incoming)) throw new FeynError(`a loop goes between what comes in and what goes on, such as "g g > {t} > H"`, line);
  const fusion = incoming.length === 1 ? /^\u0001fusion:(\w+)(?::(\S+))?$/.exec(incoming[0].name) : null;
  if (fusion) {
    // vector boson fusion or scattering: each quark gives off a boson and goes on forward; the
    // bosons meet where what is made comes out
    const [a, b] = [fresh("v"), fresh("v")];
    meeting = fresh("v");
    const boson = fusion[1] === "V" ? "boson, label=V" : fusion[1] === "W" ? "boson, label=W" : fusion[1];
    out.push(`${fresh("in")} [q, in] -- ${a} -- ${fresh("out")} [q, out]`, `${fresh("in")} [q, in] -- ${b} -- ${fresh("out")} [q, out]`);
    // (three or more made: not one point, which no physics has, but along a boson exchanged between
    // the two, top to bottom: the first and last go on from the two bosons, the rest between)
    if (segments.length === 2 && segments[1].length >= 3) {
      const products = segments[1], rungs = products.map(() => fresh("v"));
      // (what the two exchange: the same boson, or as named, VBS(W, H): a Higgs, so the middle
      // vertex of W+ H W- is the Higgs self-coupling)
      const named = fusion[2];
      const exchanged = named ? (lookupParticle(named) ? `${named}, no label` : `boson, label={${named}}`) : fusion[1] === "V" || fusion[1] === "W" ? "boson" : `${fusion[1]}, no label`;
      out.push(`${a} -- [${boson}] ${rungs[0]}`, `${b} -- [${boson}] ${rungs[rungs.length - 1]}`);
      rungs.slice(1).forEach((r, i) => out.push(`${rungs[i]} -- [${exchanged}] ${r}`));
      products.forEach((product, i) => emit(rungs[i], product, []));
      const first = lines.findIndex(isChain);
      return [...lines.slice(0, first).filter((l) => !isChain(l)), ...out, ...lines.slice(first + 1).filter((l) => !isChain(l))].join("\n");
    }
    out.push(`${a} -- [${boson}] ${meeting}`, `${b} -- [${boson}] ${meeting}`);
  } else if (nuclear) {
    // (each nucleus coming in on a plain line, its nucleus at the end; any particle as it is)
    ends = incoming.map((p) => (to: string) => { out.push(p.nucleus ? `${fresh("in")} [${nucleusOptions(p.nucleus)}, in] -- [ion] ${to}` : `${fresh("in")} [${p.name}, in] -- ${to}`); });
  } else if (incoming.length === 2 && incoming.every((p) => p.name === "p")) {
    meeting = fresh("pp");
    out.push(`${fresh("in")} [p, in] -- ${meeting} [blob] -- ${fresh("in")} [p, in]`);
  } else ends = incoming.map((p) => (to: string) => { out.push(`${fresh("in")} [${p.name}, in] -- ${to}`); });
  const joinHere = () => {
    const at = meeting ?? fresh("v");
    ends.forEach((join) => join(at));
    if (!meeting) asBlob(at);
    ends = []; meeting = undefined;
    return at;
  };

  for (let k = 1; k < segments.length; k++) {
    const segment = segments[k], last = k === segments.length - 1;
    if (isLoop(segment)) {
      if (meeting) throw new FeynError(`write the partons that meet the loop, such as "g g > {t} > H"`, line);
      if (last) throw new FeynError(`a loop needs something after it, such as "g g > {t} > H"`, line);
      if (isLoop(segments[k + 1])) throw new FeynError(`two loops in a row: put what passes between them in the middle`, line);
      // (the corners round the loop: what arrives, in order, then what goes on, the other way round)
      const next = segments[k + 1], nextIsLast = k + 1 === segments.length - 1;
      if (!nextIsLast && next.length !== 1) throw new FeynError(`between two ">" goes one particle`, line);
      const corners = drawLoop(loopName(segment), ends.length + next.length, line);
      ends.forEach((join, i) => join(corners[i]));
      const leaving = corners.slice(ends.length).reverse();
      ends = [];
      if (nextIsLast) { next.forEach((product, i) => emit(leaving[i], product, [])); break; }
      const through = next[0], from = leaving[0];
      ends = [(to: string) => { out.push(`${from} -- [${edgeStyle(through)}] ${to}`); }];
      k++;
      continue;
    }
    if (last) { const at = joinHere(); for (const product of segment) emit(at, product, []); break; }
    // a line the process passes through, from where things met to where the next meet
    if (segment.length !== 1) throw new FeynError(`between two ">" goes one particle`, line);
    const from = joinHere(), through = segment[0];
    ends = [(to: string) => { out.push(`${from} -- [${edgeStyle(through)}] ${to}`); }];
  }

  // the expansion takes the place of the first chain line; the others are dropped
  const first = lines.findIndex(isChain);
  return [...lines.slice(0, first).filter((l) => !isChain(l)), ...out, ...lines.slice(first + 1).filter((l) => !isChain(l))].join("\n");
}

/**
 * A production mode at the start of the process line, written as what it stands for: `ggF >` as
 * `g g > {t} >`, `VBF >` / `VBS >` (and `VBF(W) >`, `VBF(Z) >`) as a mark the expansion draws as
 * two quark lines and their bosons.
 */
function productionMode(text: string, isProcess: boolean): string {
  if (!isProcess) return text;
  const m = /^\s*(ggf|vbf|vbs)(?:\(\s*([WZV])\s*(?:,\s*([^)\s]+)\s*)?\))?\s*>/i.exec(text);
  if (!m) return text;
  const rest = text.slice(m[0].length);
  if (m[1].toLowerCase() === "ggf") return `g g > {t} >${rest}`;
  return `\u0001fusion:${(m[2] ?? "V").toUpperCase()}${m[3] ? `:${m[3]}` : ""} >${rest}`;
}

/** How a particle decays: what it decays to, and the loop it decays through, if any. */
interface Rule { products: Item[]; loop?: string }

const isLoop = (segment: Item[] | undefined) => !!segment && segment.length === 1 && /^\{.+\}$/.test(segment[0].name) && !segment[0].decay;
const loopName = (segment: Item[]) => segment[0].name.slice(1, -1).trim();

/**
 * A chain line's segments, with a MadGraph loop order read as a loop: `a b > c d [noborn=QCD]`
 * (loop-induced) goes through a top loop. `[QCD]` and `[virt=QCD]` (higher orders, in MadGraph)
 * draw the tree as it is.
 */
function withMadGraphLoop(text: string, line: number): Item[][] {
  const bracket = /\[\s*([^\]]*)\]\s*$/.exec(text);
  const segments = splitSegments(bracket ? text.slice(0, bracket.index) : text, line);
  if (!bracket) return segments;
  if (/^noborn\s*=\s*\w+$/i.test(bracket[1].trim())) {
    if (segments.length !== 2) throw new FeynError(`[noborn=QCD] goes on "incoming > outgoing" alone; or write the loop where it goes, "g g > {t} > H"`, line);
    return [segments[0], [{ name: "{t}" }], segments[1]];
  }
  if (/^(virt\s*=\s*)?(QCD|QED)$/i.test(bracket[1].trim())) return segments;
  throw new FeynError(`write a loop in braces where it goes, such as "g g > {t} > H"`, line);
}

interface Item { name: string; decay?: Item[]; nucleus?: NucleusItem }

/** A nucleus named in a process: its numbers, its symbol, and how its label is written. */
interface NucleusItem { A: number; Z: number; symbol: string; label: string; nucleons?: boolean; excited?: boolean }

/**
 * The nucleus a name in a nuclear process stands for: an isotope, a mass number then an element's
 * symbol (`2H`, `4He`, `235U`), or the symbol alone, as its most common isotope (`He`, `Fe`, `H`);
 * `p` and `n` are one proton and one neutron, `D` a deuteron. Any name may carry its nucleons in
 * brackets, `C(6p 8n)`, `X(3p 4n)`: an element is then that isotope (carbon-14), and any other
 * name is a nucleus of its own, labelled as written. Undefined for any other name.
 */
export function nucleusNamed(name: string): NucleusItem | undefined {
  const bracket = /^([A-Za-z0-9_']+)\(([^()]*)\)$/.exec(name), nucleons = bracket ? nucleonCount(bracket[2]) : undefined;
  if (bracket && nucleons) {
    const A = nucleons.Z + nucleons.N, element = nucleusNamed(bracket[1]);
    const symbol = element ? element.symbol : bracket[1];
    return { A, Z: nucleons.Z, symbol, label: element ? isotopeLabel(A, element.symbol === "p" || element.symbol === "n" ? elementSymbol(nucleons.Z) : symbol) : `\\mathrm{${symbol}}`, nucleons: true };
  }
  // (a star after it, 12C*, is the nucleus excited)
  const m = /^(\d+)?([A-Z][a-z]?|[pn])(\*)?$/.exec(name);
  if (!m || !Object.prototype.hasOwnProperty.call(ELEMENTS, m[2])) return undefined;
  // (a proton or a neutron is one nucleon: `2p` is no nucleus)
  if (m[1] && /^[pn]$/.test(m[2]) && m[1] !== "1") return undefined;
  const [Z, common] = ELEMENTS[m[2]];
  const A = m[1] ? Number(m[1]) : common;
  return { A, Z, symbol: m[2], label: isotopeLabel(A, m[2]) + (m[3] ? "^*" : ""), ...(m[3] ? { excited: true } : {}) };
}

/**
 * A name that can only be a nucleus: an isotope, or an element's symbol that names no particle
 * (`He`, not `H`, the Higgs). `Y` is not one by itself: a new particle often takes that name.
 */
export function onlyNucleus(name: string): boolean {
  const nucleus = nucleusNamed(name);
  return !!nucleus && (/^\d/.test(name) || !!nucleus.nucleons || (!lookupParticle(name) && name !== "Y"));
}

/**
 * What is wrong with a nucleus written with its nucleons, if anything: protons that make another
 * element (`He(3p 2n)` is lithium), or nucleons that add up to another mass number than the one
 * written (`4He(2p 3n)`). Undefined when it is right, or names no element.
 */
export function nucleonMismatch(name: string): string | undefined {
  const bracket = /^(\d*)([A-Za-z]{1,2})\(([^()]*)\)$/.exec(name), nucleons = bracket ? nucleonCount(bracket[3]) : undefined;
  if (!bracket || !nucleons || !/^[A-Z][a-z]?$/.test(bracket[2]) || !Object.prototype.hasOwnProperty.call(ELEMENTS, bracket[2])) return undefined;
  const [Z] = ELEMENTS[bracket[2]], A = nucleons.Z + nucleons.N;
  if (nucleons.Z !== Z) return `"${name}" has ${nucleons.Z} proton${nucleons.Z === 1 ? "" : "s"}, but ${bracket[2]} has ${Z}: ${nucleons.Z} protons make ${elementSymbol(nucleons.Z)}`;
  if (bracket[1] && Number(bracket[1]) !== A) return `"${name}" has ${A} nucleons, not ${bracket[1]}: write ${A}${bracket[2]}`;
  return undefined;
}

/**
 * Whether the statements of one process line are nuclear (a name in them can only be a nucleus),
 * and if they are, each name that is a nucleus there marked as one.
 */
function markNuclei(statements: Item[][][], line: number): boolean {
  const every = (items: Item[]): Item[] => items.flatMap((item) => [item, ...every(item.decay ?? [])]);
  const items = statements.flatMap((segments) => segments.flatMap(every));
  if (!items.some((item) => onlyNucleus(item.name))) return false;
  for (const item of items) {
    const nucleus = nucleusNamed(item.name);
    if (!nucleus) continue;
    if (nucleus.A < nucleus.Z || nucleus.A > 300) throw new FeynError(`"${item.name}" has ${nucleus.Z} protons in ${nucleus.A} nucleons: write its mass number, the protons and neutrons together, such as ${nucleus.symbol === "n" || nucleus.symbol === "p" ? "4He" : `${2 * nucleus.Z}${nucleus.symbol}`}`, line);
    item.nucleus = nucleus;
  }
  return true;
}

/**
 * A nuclear process as a decay chain, when it is one: one nucleus that decays (`238U > 234Th
 * 4He`), and what it leaves decaying on by later lines (`234Th > 234Pa e- ve~`), step by step.
 * What each step leaves is the nucleus that decays on, else the heaviest; the rest it gives off.
 * Undefined for a single reaction, which is drawn as one.
 */
function decayChainOf(segments: Item[][], rules: Map<string, Rule[]>): DecayStep[] | undefined {
  if (segments.length !== 2 || segments[0].length !== 1 || !segments[0][0].nucleus) return undefined;
  const chain = (item: Item): ChainNucleus => ({ A: item.nucleus!.A, Z: item.nucleus!.Z, label: item.nucleus!.label, name: item.name });
  const steps: DecayStep[] = [], seen = new Set<string>();
  let parent = segments[0][0], products: Item[] | undefined = segments[1];
  while (products && !seen.has(parent.name)) {
    seen.add(parent.name);
    const nuclei: Item[] = products.filter((p) => p.nucleus && !p.decay);
    const daughter: Item | undefined = nuclei.find((p) => rules.get(p.name)?.some((r) => !r.loop)) ?? [...nuclei].sort((a, b) => b.nucleus!.A - a.nucleus!.A)[0];
    if (!daughter) break;
    const given = products.filter((p) => p !== daughter).map((p) => (p.nucleus ? { nucleus: chain(p), label: p.nucleus.label } : { particle: p.name, label: lookupParticle(p.name)?.label ?? p.name }));
    steps.push({ parent: chain(parent), daughter: chain(daughter), given });
    parent = daughter;
    products = rules.get(daughter.name)?.find((r) => !r.loop)?.products;
  }
  return steps.length > 1 ? steps : undefined;
}

/** A nucleus's options at the end of its leg: what it is, and its label. */
const nucleusOptions = (n: NucleusItem) => `nucleus, A=${n.A}, Z=${n.Z}, ${n.label}${n.excited ? ", excited" : ""}`;


const stripComment = (line: string) => line.replace(/%.*$/, "").trim();

/**
 * A ">" written without spaces, as MadGraph allows (p p>t t~): one outside square brackets, and
 * not the end of an arrow, "->", on a line that is not a switch (title: a>b stays a title). A
 * "-" straight after a name is its charge, not an arrow's: e+ e->z, w->e- ve~.
 */
function hasCloseArrow(line: string): boolean {
  const text = line.replace(/(^|\s)(%|\/\/|#).*$/, "");
  if (/^\s*[A-Za-z]+(?: [A-Za-z]+)?'?\s*:/.test(text)) return false;
  let depth = 0;
  for (let k = 0; k < text.length; k++) {
    if (text[k] === "[") depth++;
    else if (text[k] === "]") depth--;
    else if (text[k] === ">" && depth === 0 && !isArrowEnd(text, k)) return true;
  }
  return false;
}

/** The ">" at k ends an arrow, "->", unless its "-" is a name's charge (e-, w-: a letter or digit before it). */
function isArrowEnd(text: string, k: number): boolean {
  return text[k - 1] === "-" && !/[A-Za-z0-9~]/.test(text[k - 2] ?? "");
}

/** Split at each top-level comma, one not inside brackets of any kind (VBS(W, H), [a, b], {t}). */
function splitAtTopCommas(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let k = 0; k < text.length; k++) {
    if ("([{".includes(text[k])) depth++;
    else if (")]}".includes(text[k])) depth--;
    else if (text[k] === "," && depth === 0) { parts.push(text.slice(start, k).trim()); start = k + 1; }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/** Where the bracket opened at `open` closes, brackets inside it counted (LRJ(1b W(2j))). */
function closingBracket(text: string, open: number, line: number): number {
  let depth = 0;
  for (let k = open; k < text.length; k++) {
    if (text[k] === "(") depth++;
    else if (text[k] === ")" && --depth === 0) return k;
  }
  throw new FeynError(`a "(" is not closed`, line);
}

/**
 * MadGraph's decay chain on one line, written as feynjs's own lines: the production, then each
 * decay after a comma as a line of its own (`p p > t t~, t > b w+` is `p p > t t~` and
 * `t > b w+`). A decay in brackets comes with the decays under it, which decay what it makes,
 * on the spot: `(t > b w+, w+ > e+ ve)` is `t > b w+(> e+ ve)`, and so on down, bracket by bracket.
 * A line with no comma comes back as it is.
 */
function madGraphDecays(text: string, line: number): string[] {
  const [production, ...decays] = splitAtTopCommas(text);
  if (decays.length === 0) return [text];
  return [production, ...decays.map((decay) => (isBracketed(decay, line) ? written(decayWithItsDecays(decay.slice(1, -1), line)) : decay))];
}

/** A whole part in one pair of brackets, `(t > b w+, w+ > e+ ve)`. */
const isBracketed = (part: string, line: number) => part.startsWith("(") && closingBracket(part, 0, line) === part.length - 1;

/**
 * A decay and the decays under it, `t > b w+, w+ > e+ ve`, as one decay, each under-decay written
 * on the spot on what it decays (`t > b w+(> e+ ve)`). Where the decay makes several of one name,
 * they take the decays of that name in turn, the last repeating, as decay lines are taken.
 */
function decayWithItsDecays(text: string, line: number): Item[][] {
  const [head, ...under] = splitAtTopCommas(text);
  const segments = splitSegments(head, line);
  const isDecay = (s: Item[][]) => s.length === 2 && s[0].length === 1 && !s[0][0].decay && !isLoop(s[0]);
  if (!isDecay(segments)) throw new FeynError(`a decay in brackets reads "(particle > products, ...)"`, line);
  const products = segments[1];
  // the decays under it, by the name they decay
  const ways = new Map<string, Item[][]>();
  for (const part of under) {
    const decay = isBracketed(part, line) ? decayWithItsDecays(part.slice(1, -1), line) : splitSegments(part, line);
    if (!isDecay(decay)) throw new FeynError(`a decay reads "particle > products" (a decay through a loop goes on a line of its own)`, line);
    const name = decay[0][0].name;
    ways.set(name, [...(ways.get(name) ?? []), decay[1]]);
  }
  for (const [name, decaysOf] of ways) {
    const made = products.filter((p) => p.name === name && !p.decay);
    if (made.length === 0) throw new FeynError(`"${head}" makes no ${name} to decay (a decay of what that makes goes in brackets of its own)`, line);
    made.forEach((p, k) => { p.decay = decaysOf[Math.min(k, decaysOf.length - 1)]; });
  }
  return segments;
}

/** A chain line's segments written back as text, each decay on the spot: `t > b w+(> e+ ve)`. */
const written = (segments: Item[][]): string => segments.map(writtenItems).join(" > ");
const writtenItems = (items: Item[]): string => items.map((p) => (p.decay ? `${p.name}(> ${writtenItems(p.decay)})` : p.name)).join(" ");

/** Split "a b > c d(> e f)" at its top-level ">" into lists of particles. */
function splitSegments(text: string, line: number): Item[][] {
  const segments: Item[][] = [[]];
  let k = 0;
  // a name runs to a space, a bracket or a ">" (not an arrow's, "->"; a name's own "-", e->z, is
  // its charge); brackets that do not open a
  // decay are part of it, a hadron's state or an object's contents: psi(2S), X(3872), LRJ(1b W(2j))
  // (spaces inside are an object's alone: Z(e+ e-) is a decay with its ">" left out)
  const opensDecay = (at: number) => /^\(\s*>/.test(text.slice(at));
  const readName = () => {
    const start = k;
    for (;;) {
      while (k < text.length && !/[\s()]/.test(text[k]) && !(text[k] === ">" && !isArrowEnd(text, k))) k++;
      if (text[k] !== "(" || k === start || opensDecay(k)) return text.slice(start, k);
      const open = k;
      k = closingBracket(text, open, line) + 1;
      if (/\s/.test(text.slice(open, k)) && !parseObject(text.slice(start, k)) && !nucleonCount(text.slice(open + 1, k - 1))) throw new FeynError(`write a decay as "${text.slice(start, open)}(> products)", or an object's contents as "LRJ(2j)"`, line);
    }
  };
  const readItems = (inside: boolean): Item[] => {
    const items: Item[] = [];
    for (;;) {
      while (k < text.length && /\s/.test(text[k])) k++;
      if (k >= text.length) { if (inside) throw new FeynError(`a "(" is not closed`, line); return items; }
      if (text[k] === ")") { if (!inside) throw new FeynError(`a ")" has no "("`, line); k++; return items; }
      if (text[k] === ">" && !inside) return items;
      const name = readName();
      if (!name) throw new FeynError(`cannot read "${text}"`, line);
      const item: Item = { name };
      if (text[k] === "(") {
        // (a decay on the spot, W+(> e+ nu): any other bracket is the name's own, read with it)
        k++;
        while (k < text.length && /\s/.test(text[k])) k++;
        k++; // the ">"
        item.decay = readItems(true);
      }
      items.push(item);
    }
  };
  for (;;) {
    segments[segments.length - 1].push(...readItems(false));
    if (k >= text.length) break;
    k++; // the ">"
    segments.push([]);
  }
  if (segments.some((s) => s.length === 0)) throw new FeynError(`each side of ">" needs a particle`, line);
  return segments;
}
