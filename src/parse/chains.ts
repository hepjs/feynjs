import { FeynError } from "../model.ts";
import { lookupParticle, particleNames } from "../particles/registry.ts";
import { parseObject } from "../particles/objects.ts";

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
 */
export function expandChains(source: string): string {
  const lines = source.split("\n");
  const isChain = (line: string) => /(^|\s)>(\s|$)/.test(stripComment(line)) && !/--/.test(line);
  if (!lines.some(isChain)) return source;

  let made = 0;
  const fresh = (prefix: string) => `${prefix}${++made}`;
  const out: string[] = [];
  // the ways each particle decays, taken in turn by its instances (the last one repeating)
  const rules = new Map<string, Rule[]>();
  const taken = new Map<string, number>();
  let process: { line: number; segments: Item[][] } | undefined;
  lines.forEach((line, n) => {
    if (!isChain(line)) return;
    const segments = withMadGraphLoop(productionMode(stripComment(line), !process), n + 1);
    if (!process) { process = { line: n + 1, segments }; return; }
    // a decay: "particle > products", or through a loop, "particle > {t} > products"
    const loop = segments.length === 3 && isLoop(segments[1]) ? loopName(segments[1]) : undefined;
    if (!(segments.length === 2 || loop) || segments[0].length !== 1 || segments[0][0].decay || isLoop(segments[0])) throw new FeynError(`a decay reads "particle > products" (or "particle > {t} > products" through a loop)`, n + 1);
    const name = segments[0][0].name;
    rules.set(name, [...(rules.get(name) ?? []), { products: segments[segments.length - 1], loop }]);
  });

  const nextDecay = (name: string): Rule | undefined => {
    const ways = rules.get(name);
    if (!ways) return undefined;
    const k = taken.get(name) ?? 0;
    taken.set(name, k + 1);
    return ways[Math.min(k, ways.length - 1)];
  };
  const edgeStyle = (name: string) => (lookupParticle(name) ? name : `label={${name}}`);
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
    if (!rule && !particleNames().includes(item.name) && parseObject(item.name)) { out.push(`${from} -- [${item.name}] ${fresh("out")} [out]`); return; }
    if (!rule) { out.push(`${from} -- ${fresh("out")} [${item.name}, out]`); return; }
    if (rule.loop) {
      const corners = drawLoop(rule.loop, 1 + rule.products.length, process!.line);
      out.push(`${from} -- [${edgeStyle(item.name)}] ${corners[0]}`);
      const leaving = corners.slice(1).reverse();
      rule.products.forEach((product, k) => emit(leaving[k], product, [...seen, item.name]));
      return;
    }
    const at = fresh("v");
    out.push(`${from} -- [${edgeStyle(item.name)}] ${at}`);
    for (const product of rule.products) emit(at, product, [...seen, item.name]);
  };

  const { segments, line } = process!;
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
  } else if (incoming.length === 2 && incoming.every((p) => p.name === "p")) {
    meeting = fresh("pp");
    out.push(`${fresh("in")} [p, in] -- ${meeting} [blob] -- ${fresh("in")} [p, in]`);
  } else ends = incoming.map((p) => (to: string) => { out.push(`${fresh("in")} [${p.name}, in] -- ${to}`); });
  const joinHere = () => { const at = meeting ?? fresh("v"); ends.forEach((join) => join(at)); ends = []; meeting = undefined; return at; };

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
      ends = [(to: string) => { out.push(`${from} -- [${edgeStyle(through.name)}] ${to}`); }];
      k++;
      continue;
    }
    if (last) { const at = joinHere(); for (const product of segment) emit(at, product, []); break; }
    // a line the process passes through, from where things met to where the next meet
    if (segment.length !== 1) throw new FeynError(`between two ">" goes one particle`, line);
    const from = joinHere(), through = segment[0];
    ends = [(to: string) => { out.push(`${from} -- [${edgeStyle(through.name)}] ${to}`); }];
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

interface Item { name: string; decay?: Item[] }


const stripComment = (line: string) => line.replace(/%.*$/, "").trim();

/** Split "a b > c d(> e f)" at its top-level ">" into lists of particles. */
function splitSegments(text: string, line: number): Item[][] {
  const segments: Item[][] = [[]];
  let k = 0;
  const readName = () => {
    const start = k;
    while (k < text.length && !/[\s()]/.test(text[k])) k++;
    return text.slice(start, k);
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
        k++;
        while (k < text.length && /\s/.test(text[k])) k++;
        if (text[k] !== ">") throw new FeynError(`write a decay as "${name}(> products)"`, line);
        k++;
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
