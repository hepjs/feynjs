import { asMolecule, quarksOf } from "../render/bag.ts";
import { elementSymbol, nucleusFrom, uprightElement } from "../render/nucleus.ts";
import { OBJECT_NAMES, parseObject } from "../particles/objects.ts";
import { expandChains } from "./chains.ts";
import { lengthInLines } from "./lengths.ts";
import { FeynError } from "../model.ts";
import type { DecayStep, Diagram, Edge, EdgeStyle, HadronGroup, Vertex, VertexShape } from "../model.ts";
import { STYLES, lookupParticle, particleNames } from "../particles/registry.ts";
import * as portable from "../geometry/portable-math.ts";

const SHAPES: Record<string, VertexShape> = {
  "dot": "dot", "empty dot": "empty", "square dot": "square", "crossed dot": "crossed", "slashed dot": "slashed", "small hatched blob": "smallhatched",
  "blob": "blob", "small blob": "smallblob", "hatched blob": "hatched", "insertion": "insertion", "none": "none",
};
const BENDS: Record<string, number> = {
  "half left": 90, "half right": -90, "quarter left": 45, "quarter right": -45,
  "bend left": 30, "bend right": -30,
};

interface Opt { key: string; value?: string }

/** Split on a separator at bracket/brace depth zero (and, if asked, outside "quotes"). */
function splitTop(s: string, seps: string, quotes = false): string[] {
  const out: string[] = [];
  let depth = 0, cur = "", quoted = false;
  for (const ch of s) {
    if (quotes && ch === '"') quoted = !quoted;
    if (quoted) { cur += ch; continue; }
    if (ch === "[" || ch === "{" || ch === "(") depth++;
    else if (ch === "]" || ch === "}" || ch === ")") depth--;
    if (depth === 0 && seps.includes(ch)) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseOpts(body: string): Opt[] {
  return splitTop(body, ",", true).map((raw) => raw.trim()).filter(Boolean).map((raw) => {
    // "\(\gamma\)" and "\(\gamma\)"': TikZ's quotes for a label on the left, or (primed) the right
    const quoted = /^"([^"]*)"\s*('?)$/.exec(raw);
    if (quoted) return { key: quoted[2] ? "edge label'" : "edge label", value: stripMath(quoted[1].trim()) };
    const eq = splitTop(raw, "=");
    if (eq.length === 1) return { key: raw.replace(/\s+/g, " ") };
    let value = raw.slice(eq[0].length + 1).trim();
    if (value.startsWith("{") && value.endsWith("}")) value = value.slice(1, -1);
    // (TikZ-Feynman's own options for an arrow or a cross go first, in brackets:
    // momentum={[arrow shorten=0.3]q}, insertion={[size=5pt]0.3}; feynjs has its own look)
    if (value.startsWith("[")) value = value.slice(closingBracket(value) + 1).trim();
    value = value.replace(/^\$|\$$/g, "").replace(/^\\\(|\\\)$/g, "");
    return { key: eq[0].trim().replace(/\s+/g, " "), value };
  });
}

/** Where the bracket that opens `s` closes (the end, if it never does). */
function closingBracket(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "[") depth++;
    else if (s[i] === "]" && --depth === 0) return i;
  }
  return s.length - 1;
}

/** Edit distance between two short strings. */
function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** The closest known name to a misspelt one, if any is close enough to be a likely intent. */
export function closestName(word: string, known: string[]): string | undefined {
  const lower = word.toLowerCase();
  let best: string | undefined, bestDistance = Infinity;
  for (const name of known) {
    const distance = editDistance(lower, name.toLowerCase());
    // typing the start of a name counts as close, but only for names long enough to mean it
    const prefix = Math.min(lower.length, name.length) >= 4 && (name.toLowerCase().startsWith(lower) || lower.startsWith(name.toLowerCase()));
    const score = prefix ? Math.min(distance, 1) : distance;
    if (score < bestDistance) { best = name; bestDistance = score; }
  }
  return bestDistance <= Math.max(1, Math.floor(word.length / 3)) ? best : undefined;
}

/**
 * `right=of a`, `above left=1.5 of a`, `above right=1 and 2 of a` (up 1, across 2), as TikZ
 * writes them: an offset from point `a`, in line lengths (y up, as `at` is), or in cm
 * (`right=1.5cm of a`). An anchor is the point itself: `of a.east` is `of a`.
 */
function relativePlace(key: string, value: string, line: number): { anchor: string; dx: number; dy: number } {
  const m = /^\s*(?:(-?[\d.]+\s*[a-z]*)(?:\s+and\s+(-?[\d.]+\s*[a-z]*))?\s+)?of\s+\(?\s*([\w']+)(?:\.[a-z ]+)?\s*\)?\s*$/.exec(value);
  if (!m) throw new FeynError(`write "${key}=of a" or "${key}=1.5 of a"`, line);
  const first = m[1] !== undefined ? lengthInLines(m[1], line) : 1, second = m[2] !== undefined ? lengthInLines(m[2], line) : first;
  const up = /above/.test(key) ? 1 : /below/.test(key) ? -1 : 0, across = /right/.test(key) ? 1 : /left/.test(key) ? -1 : 0;
  // (with two lengths, the first is up or down and the second across)
  return { anchor: m[3], dx: across * (up ? second : first), dy: up * first };
}

/** Fix every point placed from another, once that one is fixed (by `at`, or by being placed itself). */
function placeFromOthers(vertices: Map<string, Vertex>, placedFrom: Map<string, { anchor: string; dx: number; dy: number; line: number }>): void {
  for (let left = placedFrom.size, last = -1; left && left !== last;) {
    last = left;
    for (const [id, p] of placedFrom) {
      const anchor = vertices.get(p.anchor);
      if (!anchor) throw new FeynError(`no point "${p.anchor}" to place ${id} from`, p.line);
      if (!anchor.fixed) continue;
      vertices.get(id)!.fixed = { x: anchor.fixed.x + p.dx, y: anchor.fixed.y + p.dy };
      placedFrom.delete(id);
      left--;
    }
  }
  for (const [id, p] of placedFrom) throw new FeynError(`${id} is placed from ${p.anchor}, which has no place itself: give it one with "${p.anchor} at (x, y)"`, p.line);
}

/**
 * The kinds a line is, for `every ...` defaults: every line ("edge"), the style and particle words
 * written on it, and what it is drawn as (a wave is a boson and a photon, a coil a gluon, a dashed
 * line a scalar, a dotted one a ghost, an arrowed solid line a fermion).
 */
function edgeKinds(e: Edge, opts: Opt[]): string[] {
  const drawnAs: Record<string, string[]> = { wave: ["boson", "photon"], coil: ["gluon"], dash: ["scalar"], dot: ["ghost"], plain: e.style.arrow ? ["fermion"] : [] };
  return [...new Set(["edge", ...(drawnAs[e.style.line] ?? []), ...opts.filter((o) => o.value === undefined).map((o) => o.key.toLowerCase())])];
}

/** A nucleus with both its numbers: from `A=` and `Z=`, else its symbol, else the leg's name (`[Pb, nucleus]`). */
function wholeNucleus(v: Vertex): void {
  const named = v.label ? nucleusFrom(v.label) : undefined;
  // (`N=`, its neutrons, with its protons makes its mass number: [nucleus=C, N=8] is carbon-14)
  const Z = v.nucleus?.Z ?? named?.Z, N = v.nucleus?.N;
  // (a bare symbol's usual mass number gives way to the neutrons written: nucleus=C is carbon-12
  // until N=8 says otherwise)
  const usual = Z !== undefined ? nucleusFrom(elementSymbol(Z))?.A : undefined;
  const A = N !== undefined && Z !== undefined && (v.nucleus?.A === undefined || v.nucleus.A === usual) ? Z + N : v.nucleus?.A ?? named?.A;
  if (N !== undefined && A !== undefined && Z !== undefined && A !== Z + N) throw new FeynError(`the nucleus at ${v.id} has Z=${Z} and N=${N}, which make A=${Z + N}, not ${A}`);
  if (A === undefined || Z === undefined) throw new FeynError(`the nucleus at ${v.id} needs its numbers: write nucleus=Pb (or 208Pb), or A= and Z=`);
  if (Z > A || A < 1) throw new FeynError(`the nucleus at ${v.id} has Z=${Z} protons in A=${A} nucleons: Z cannot be more than A`);
  v.nucleus = { A, Z };
}

/** Switches that may be written many times, each adding one more (a lattice's loops and links). */
const LISTED = new Set(["wilson loop", "plaquette", "link", "polyakov loop", "site", "note"]);

/** A place along a line, as a fraction of its length between 0 and 1. */
function fraction(value: string, key: string, line: number): number {
  const k = Number(value);
  if (!(k >= 0 && k <= 1)) throw new FeynError(`${key} is a place along the line, from 0 to 1 (such as 0.3)`, line);
  return k;
}

function stripMath(s: string): string {
  return s.replace(/^\$|\$$/g, "").replace(/^\\\(|\\\)$/g, "");
}

/**
 * A TikZ-Feynman picture (\feynmandiagram, \begin{feynman}, \vertex, \diagram*) pasted where
 * feynjs's own lines go: an error that says how to convert it, once, into feynjs's lines.
 */
function refuseTikzPicture(source: string): void {
  const m = /\\(feynmandiagram|begin\s*\{\s*(?:feynman|tikzpicture)\s*\}|vertex\b|diagram\*?\s*[{[])/.exec(source);
  if (!m) return;
  const line = source.slice(0, m.index).split("\n").length;
  throw new FeynError("this is a TikZ-Feynman picture: convert it to feynjs's lines once, with fromTikz() from \"feynjs/tikz\" or \"feynjs import file.tex\", and draw those", line);
}

export function parse(source: string): Diagram {
  // (a TikZ-Feynman picture is converted once, not read here: a feynman fence holds feynjs's lines)
  refuseTikzPicture(source);
  // decay chains ("p p > gluino gluino") are written out as ordinary lines first
  const found: { nuclear?: boolean; decayChain?: DecayStep[] } = {};
  source = expandChains(source, found);
  const vertices = new Map<string, Vertex>();
  const edges: Edge[] = [];
  const directives: Record<string, string> = {};
  const hadrons: HadronGroup[] = [];
  // label: chargino+ = \tilde\chi^\mp   (draw a particle with a label of your own, wherever it is)
  const relabel = new Map<string, string>();
  // b [right=of a]: points placed from others, as TikZ places nodes (found once every `at` is known)
  const placedFrom = new Map<string, { anchor: string; dx: number; dy: number; line: number }>();

  const vertex = (id: string): Vertex => {
    let v = vertices.get(id);
    if (!v) { v = { id, shape: "none", x: 0, y: 0 }; vertices.set(id, v); }
    return v;
  };

  const applyVertexOpts = (v: Vertex, opts: Opt[], line: number) => {
    for (const o of opts) {
      if (o.value === undefined) {
        if (o.key in SHAPES) v.shape = SHAPES[o.key];
        else if (o.key === "in" || o.key === "out") v.role = o.key;
        else if (o.key === "jet") v.jetCone = true;
        else if (o.key === "cone") v.coneMark = true;
        else if (o.key === "pulse") v.pulse = "";
        else if (o.key === "nucleus") { v.shape = "nucleus"; v.nucleus = { ...(v.nucleus ?? {}) }; }
        else if (o.key === "recoil") v.recoil = "";
        // (an excited nucleus: its glow, as `pulse` alone gives it)
        else if (o.key === "excited") v.pulse = "";
        else if (o.key === "motion") v.bag = { quarks: v.bag?.quarks ?? [], motion: true, molecule: v.bag?.molecule };
        else if (o.key === "molecule") v.bag = { quarks: v.bag?.quarks ? asMolecule(v.bag.quarks) : [], motion: v.bag?.motion, molecule: true };
        else {
          const p = lookupParticle(o.key);
          if (p) { v.particle = o.key; v.label = p.label; }
          else v.label = uprightElement(o.key) ?? stripMath(o.key); // free-form TeX label (an element's symbol upright)
        }
      } else if (o.key === "particle") {
        const p = lookupParticle(o.value);
        if (p) { v.particle = o.value; v.label = p.label; } else v.label = o.value;
      } else if (o.key === "label") {
        // (TikZ's label=above:\(g\) gives the side first; feynjs's own is label side=above)
        const sided = /^\s*((?:above|below)(?: left| right)?|left|right|-?\d+(?:\.\d+)?)\s*:(.*)$/s.exec(o.value);
        v.coupling = sided ? stripMath(sided[2].trim()) : o.value;
        if (sided) v.couplingSide = /\d/.test(sided[1]) ? sideAtAngle(Number(sided[1])) : sideOf(sided[1], line);
      }
      else if (o.key === "label side") v.couplingSide = sideOf(o.value, line);
      else if (o.key === "rim") v.rim = o.value;
      else if (o.key === "size") {
        const k = Number(o.value);
        if (!(k > 0)) throw new FeynError(`a dot's size is a number, such as 1.5`, line);
        v.dotScale = k;
      }
      else if (o.key === "color" || o.key === "colour") v.color = o.value;
      else if (o.key === "shape" && o.value in SHAPES) v.shape = SHAPES[o.value];
      else if (o.key === "pulse" || o.key === "excited") v.pulse = o.value;
      else if (o.key === "recoil") v.recoil = o.value;
      else if (o.key === "emits") v.emits = o.value;
      else if (o.key === "nucleus") {
        const n = nucleusFrom(o.value);
        if (!n) throw new FeynError(`unknown nucleus "${o.value}": write a symbol such as Pb, Au or 208Pb, or give A= and Z=`, line);
        v.shape = "nucleus";
        // (a star, Xe*, is an excited nucleus: it glows)
        if (/\*\s*$/.test(o.value) && v.pulse === undefined) v.pulse = "";
        v.nucleus = { ...n, ...Object.fromEntries(Object.entries(v.nucleus ?? {}).filter(([, k]) => k !== undefined)) };
      }
      else if (o.key === "bag") {
        const quarks = quarksOf(o.value);
        if (!quarks) throw new FeynError(`unknown hadron "${o.value}": name one (proton, pi+, J/psi, Zc, Pc...) or write its quarks, such as uud or c cbar u dbar (up to six)`, line);
        v.shape = "bag";
        v.bag = { quarks: v.bag?.molecule ? asMolecule(quarks) : quarks, motion: v.bag?.motion, molecule: v.bag?.molecule };
      }
      else if (o.key === "A" || o.key === "Z" || o.key === "N") {
        const k = Number(o.value);
        if (!(Number.isInteger(k) && k >= 0 && k <= 300)) throw new FeynError(`${o.key} is a whole number up to 300`, line);
        v.shape = "nucleus";
        v.nucleus = { ...(v.nucleus ?? {}), [o.key]: k };
      }
      else if (/^(above|below)?\s*(left|right)?$/.test(o.key) && o.key) placedFrom.set(v.id, { ...relativePlace(o.key, o.value, line), line });
      else if (o.key === "eta" || o.key === "phi" || o.key === "deta" || o.key === "dphi") {
        const k = Number(o.value);
        if (!Number.isFinite(k)) throw new FeynError(`${o.key} is a number (phi in degrees)`, line);
        v.kinematics = { ...(v.kinematics ?? {}), [o.key]: k };
      }
      else throw new FeynError(`unknown vertex option "${o.key}"`, line);
    }
  };

  // every photon: color=blue, heavy   (defaults for every line or point of a kind, as TikZ's
  // `every photon/.style` sets them; found first, so they hold wherever they are written)
  const every = new Map<string, Opt[]>();
  for (const raw of source.split(/\r?\n/)) {
    const m = /^\s*every\s+([^:]+?)\s*:\s*(.*)$/.exec(raw.replace(/(^|\s)(%|\/\/|#).*$/, ""));
    if (m) every.set(m[1].toLowerCase(), [...(every.get(m[1].toLowerCase()) ?? []), ...parseOpts(m[2].replace(/^\[(.*)\]$/, "$1"))]);
  }
  const ownVertexOpts = new Map<string, Opt[]>();

  const written = new Map<Edge, { opts: Opt[]; line: number }>();
  const makeEdge = (from: string, to: string, opts: Opt[], line: number): Edge => {
    const e = makeOneEdge(from, to, opts, line);
    written.set(e, { opts, line });
    return e;
  };

  /**
   * A line again, with the defaults for its kinds: its own style and particle words first, then
   * the defaults, then its own settings. (A line that takes its style from its leg's particle,
   * later, keeps the defaults that change a style, heavy or dashed, to put on it then.)
   */
  const withDefaults = (e: Edge): Edge => {
    const { opts, line } = written.get(e)!;
    const leg = e.styled ? undefined : [e.from, e.to].map((id) => vertices.get(id)!).find((v) => v.particle && lookupParticle(v.particle));
    const legParticle = leg ? lookupParticle(leg.particle!)! : undefined;
    const kinds = edgeKinds(legParticle ? { ...e, style: legParticle.style } : e, opts);
    if (leg) kinds.push(leg.particle!.toLowerCase());
    const rules = kinds.flatMap((kind) => every.get(kind) ?? []);
    if (!rules.length) return e;
    const modifiers = new Set(["heavy", "dashed", "dotted", "double", "jet"]);
    const later = legParticle ? rules.filter((o) => o.value === undefined && modifiers.has(o.key)) : [];
    const now = rules.filter((o) => !later.includes(o));
    const made = makeOneEdge(e.from, e.to, [...opts.filter((o) => o.value === undefined), ...now, ...opts.filter((o) => o.value !== undefined)], line);
    if (later.length) made.styleDefaults = Object.assign({}, ...later.map((o) => (o.key === "heavy" ? { heavy: true } : o.key === "double" ? { doubled: true } : o.key === "jet" ? { jetCone: true } : { line: STYLES[o.key].line })));
    return made;
  };

  const makeOneEdge = (from: string, to: string, opts: Opt[], line: number): Edge => {
    let style: EdgeStyle = { line: "plain", arrow: 0 };
    const e: Edge = { from, to, style, styled: false };
    let autoLabel: string | undefined;
    // (a straight line and a wave or coil together, [plain, gluon] or [boson, plain], is TikZ's
    // way to draw a SUSY partner: the straight line over the wave, feynjs's overlay)
    const keys = new Set(opts.filter((o) => o.value === undefined).map((o) => o.key));
    const overlaid = keys.has("plain") && [...keys].some((k) => k !== "plain" && k in STYLES && (STYLES[k].line === "wave" || STYLES[k].line === "coil"));
    for (const o of opts) {
      if (o.value === undefined) {
        // after a style or particle, heavy / dashed / dotted modify it instead of replacing it:
        // [fermion, heavy] is a thick arrowed line, [W, heavy] a thick wave, [fermion, dashed] a dashed one
        if (e.styled && o.key === "heavy") style = { ...style, heavy: true };
        // ...and double draws it twice side by side ([photon, double] a graviton), jet puts a jet cone round it
        else if (e.styled && o.key === "double") style = { ...style, doubled: true };
        else if (e.styled && o.key === "jet") style = { ...style, jetCone: true };
        else if (e.styled && (o.key === "dashed" || o.key === "dotted")) style = { ...style, line: STYLES[o.key].line };
        else if (overlaid && o.key === "plain") style = { ...style, overlay: true };
        else if (o.key in STYLES) { style = { ...style, ...STYLES[o.key], ...(overlaid ? { overlay: true } : {}) }; e.styled = true; }
        else if (o.key in BENDS) e.bend = BENDS[o.key];
        // (bare, TikZ-Feynman's cross and arrow sit halfway along)
        else if (o.key === "insertion") e.insertions = [...(e.insertions ?? []), 0.5];
        else if (o.key === "with arrow" || o.key === "with reversed arrow") style = { ...style, arrowsAt: [...(style.arrowsAt ?? []), { at: 0.5, dir: o.key === "with arrow" ? 1 : -1 }] };
        // (TikZ's loop: a line from a point back to itself is one already)
        else if (o.key === "loop") continue;
        else if (o.key === "red" || o.key === "blue" || o.key === "green" || o.key === "gray") style.color = o.key;
        else if (o.key === "overlay") style.overlay = true;
        else if (o.key === "radiation" || o.key === "isr" || o.key === "fsr") e.radiation = true;
        else if (o.key === "no arrow") style.arrow = 0;
        else if (o.key === "no label") autoLabel = "";
        else if (o.key === "pulse") e.pulse = "";
        else if (o.key === "lifetime") e.lifetime = "";
        else if (parseObject(o.key)) { style = { ...style, ...parseObject(o.key)! }; e.styled = true; }
        else {
          const p = lookupParticle(o.key);
          if (!p) {
            const guess = closestName(o.key, [...Object.keys(STYLES), ...particleNames(), ...Object.keys(BENDS), ...Object.keys(SHAPES), ...OBJECT_NAMES.flatMap((n) => [n.short, ...n.names])]);
            throw new FeynError(`unknown line style or particle "${o.key}"${guess ? ` (did you mean "${guess}"?)` : ""}`, line);
          }
          style = { ...style, ...p.style, arrow: p.anti ? (-p.style.arrow as 0 | 1 | -1) : p.style.arrow };
          e.styled = true;
          e.particle = o.key;
          if (autoLabel === undefined) autoLabel = p.label;
        }
      } else if (o.key === "label" || o.key === "edge label") { e.label = o.value; e.labelSide = 1; }
      else if (o.key === "label'" || o.key === "edge label'") { e.label = o.value; e.labelSide = -1; }
      else if (/^(reversed momentum|rmomentum|momentum)'?$/.test(o.key)) {
        e.momentum = o.value;
        e.momentumOtherSide = o.key.endsWith("'");
        e.momentumReversed = !o.key.startsWith("momentum");
      }
      else if (o.key === "insertion") e.insertions = [...(e.insertions ?? []), fraction(o.value, o.key, line)];
      else if (o.key === "with arrow" || o.key === "with reversed arrow") {
        style = { ...style, arrowsAt: [...(style.arrowsAt ?? []), { at: fraction(o.value, o.key, line), dir: o.key === "with arrow" ? 1 : -1 }] };
      }
      else if (o.key === "out" || o.key === "in" || o.key === "looseness") {
        const k = Number(o.value);
        if (!Number.isFinite(k)) throw new FeynError(`${o.key} is a number${o.key === "looseness" ? "" : " of degrees"}`, line);
        e.angles = { ...(e.angles ?? {}), [o.key]: k };
      }
      else if (o.key === "color" || o.key === "colour") style.color = o.value;
      else if (o.key === "label color" || o.key === "label colour") e.labelColor = o.value;
      else if (o.key === "bend") e.bend = Number(o.value);
      else if (o.key === "bend left" || o.key === "bend right") {
        const k = Number(o.value);
        if (!Number.isFinite(k)) throw new FeynError(`${o.key} is a number of degrees, such as 60`, line);
        e.bend = o.key === "bend left" ? k : -k;
      }
      // (how far a loop reaches out from its point: TikZ's min distance)
      else if (o.key === "min distance") e.loopReach = lengthInLines(o.value, line);
      // (draw=none: there, holding its points, but not drawn, as feynjs's invisible line)
      else if (o.key === "draw" && o.value.trim() === "none") { style = { ...style, ...STYLES.invisible }; e.styled = true; }
      else if (o.key === "pulse") e.pulse = o.value;
      else if (o.key === "lifetime") e.lifetime = o.value;
      // (a line's own length, a share of the usual one or a length in cm: `length=1.5`, `length=2cm`)
      else if (o.key === "length") {
        const k = lengthInLines(o.value, line);
        if (!(k > 0)) throw new FeynError(`a line's length is more than nothing, such as length=1.5 or length=2cm`, line);
        e.length = k;
      }
      else throw new FeynError(`unknown edge option "${o.key}"`, line);
    }
    if (e.label === undefined && autoLabel) e.label = autoLabel;
    e.style = style;
    return e;
  };

  // statements: newline or ';' separated, plus ',' at depth zero (tikz-feynman style)
  const lines = source.split(/\r?\n/);
  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const noComment = rawLine.replace(/(^|\s)(%|\/\/|#).*$/, "");
    if (/^\s*every\s+[^:]+:/.test(noComment)) return; // (defaults, read already)
    for (const stmtRaw of splitTop(noComment, ";,")) {
      const stmt = stmtRaw.trim();
      if (!stmt) continue;

      // (a key may be two words: `colour flow: on`)
      // (and may end in a prime: `horizontal': a to b`)
      const dir = /^([A-Za-z]+(?: [A-Za-z]+)?'?)\s*:\s*(.*)$/.exec(stmt);
      // (a note may point at a line, a--b, and is still a switch)
      if (dir && (!stmt.includes("--") || /^note$/i.test(dir[1]))) {
        const key = dir[1].toLowerCase().replace(/^color /, "colour ").replace(/ color$/, " colour");
        if (key === "in" || key === "out") {
          dir[2].split(/\s+/).filter(Boolean).forEach((id, position) => {
            vertex(id).role = key;
            vertex(id).declaredOrder = position;
          });
        } else if (key === "hadron" || key === "meson" || key === "baryon") {
          // hadron: B^0 = d1 bbar
          // hadron: J/\psi = c1 c2           (a shaded ellipse over the ends of the legs)
          // meson:  B^0 = d1 bbar [brace]     (a brace beside the legs instead)
          // meson:  M = qi qj [cap]           (a thin cap across the legs' ends, the name beyond it)
          // meson:  = c1 c2 [hatched]         (hatched, and with no name)
          const shape = /\[\s*brace\s*\]\s*$/.test(dir[2]) ? "brace" : /\[\s*cap\s*\]\s*$/.test(dir[2]) ? "cap" : "ellipse";
          const hatched = /\[\s*hatched\s*\]\s*$/.test(dir[2]);
          const [label, members] = dir[2].replace(/\[\s*(ellipse|brace|cap|hatched)\s*\]\s*$/, "").split("=");
          if (!members) throw new FeynError(`write "${key}: name = leg leg"`, lineNo);
          hadrons.push({
            label: stripMath(label.trim()),
            legs: members.split(/\s+/).filter(Boolean),
            shape,
            ...(hatched ? { hatched } : {}),
          });
        } else if (key === "label") {
          const eq = dir[2].indexOf("=");
          if (eq < 0) throw new FeynError(`write "label: particle = text"`, lineNo);
          relabel.set(dir[2].slice(0, eq).trim(), stripMath(dir[2].slice(eq + 1).trim()));
        } else if (LISTED.has(key)) directives[key] = directives[key] === undefined ? dir[2].trim() : `${directives[key]}\n${dir[2].trim()}`;
        else directives[key] = dir[2].trim();
        continue;
      }
      // a at (1, 0), a [dot] at (1cm, 2cm), a at (30:1) (an angle and a distance), a at (b)
      const at = /^([\w']+)(\s*\[.*\])?\s+at\s*\(([^()]*)\)$/s.exec(stmt);
      if (at) {
        const v = vertex(at[1]);
        if (at[2]) {
          const opts = parseOpts(at[2].trim().slice(1, -1));
          applyVertexOpts(v, opts, lineNo);
          ownVertexOpts.set(v.id, [...(ownVertexOpts.get(v.id) ?? []), ...opts]);
        }
        const other = /^\s*([A-Za-z_][\w']*)(?:\.[a-z ]+)?\s*$/.exec(at[3]);
        if (other) placedFrom.set(v.id, { anchor: other[1], dx: 0, dy: 0, line: lineNo });
        else v.fixed = placeAt(at[3], lineNo);
        continue;
      }

      // chain: node (-- [opts]? node)*
      // (a -- inside brackets or braces belongs to a name or label, H^{--} or [H--]: put it back)
      const parts = splitTop(stmt.replace(/--/g, "\u0001"), "\u0001").map((part) => part.replace(/\u0001/g, "--"));
      let prev: string | undefined;
      for (const partRaw of parts) {
        let part = partRaw.trim();
        let edgeOpts: Opt[] = [];
        if (prev !== undefined && part.startsWith("[")) {
          const close = matchBracket(part, 0, lineNo);
          edgeOpts = parseOpts(part.slice(1, close));
          part = part.slice(close + 1).trim();
        }
        // (a name may be written as TikZ writes it, (a), and with an anchor, a.east, which is a itself)
        const m = /^(?:\(\s*([A-Za-z_][\w']*)(?:\.[a-z ]+)?\s*\)|([A-Za-z_][\w']*)(?:\.[a-z]+)?)\s*(\[.*\])?$/s.exec(part);
        if (!m) throw new FeynError(`cannot read "${partRaw.trim() || stmt}"`, lineNo);
        const v = vertex(m[1] ?? m[2]);
        if (m[3]) {
          const opts = parseOpts(m[3].slice(1, -1));
          applyVertexOpts(v, opts, lineNo);
          ownVertexOpts.set(v.id, [...(ownVertexOpts.get(v.id) ?? []), ...opts]);
        }
        if (prev !== undefined) edges.push(makeEdge(prev, v.id, edgeOpts, lineNo));
        prev = v.id;
      }
    }
  });

  // (a lattice is drawn from its switches alone)
  if (vertices.size === 0 && !/^lattice$/i.test((directives.view ?? "").trim())) throw new FeynError("empty diagram");
  if (every.size) edges.forEach((e, k) => { edges[k] = withDefaults(e); });
  // (a point's defaults, then its own settings again on top of them)
  if (every.size) for (const v of vertices.values()) {
    const kinds = ["vertex", ...Object.keys(SHAPES).filter((k) => SHAPES[k] === v.shape), ...(v.particle ? [v.particle.toLowerCase()] : [])];
    const rules = kinds.flatMap((kind) => every.get(kind) ?? []);
    if (rules.length) applyVertexOpts(v, [...rules, ...(ownVertexOpts.get(v.id) ?? [])], 0);
  }
  placeFromOthers(vertices, placedFrom);
  for (const v of vertices.values()) if (v.shape === "nucleus") wholeNucleus(v);
  if (relabel.size) relabelParticles(vertices, edges, relabel);
  return { vertices, edges, hadrons, directives, ...(found.nuclear ? { nuclear: true } : {}), ...(found.decayChain ? { decayChain: found.decayChain } : {}) };
}

function matchBracket(s: string, start: number, line: number): number {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "[") depth++;
    else if (s[i] === "]" && --depth === 0) return i;
  }
  throw new FeynError("unclosed [", line);
}

const SIDES: Record<string, [number, number]> = { above: [0, -1], below: [0, 1], left: [-1, 0], right: [1, 0] };

/** A place written `at (x, y)` or `at (angle:distance)`, in line lengths (or cm, `1.5cm`), y up. */
function placeAt(inside: string, line: number): { x: number; y: number } {
  const polar = /^\s*(-?[\d.]+)\s*:\s*(.+?)\s*$/.exec(inside);
  if (polar) {
    const angle = (Number(polar[1]) * Math.PI) / 180, distance = lengthInLines(polar[2], line);
    if (!Number.isFinite(angle)) throw new FeynError(`write "at (30:1)": an angle in degrees and a distance`, line);
    return { x: distance * portable.cos(angle), y: distance * portable.sin(angle) };
  }
  const xy = inside.split(",");
  if (xy.length !== 2) throw new FeynError(`write "at (x, y)", "at (1cm, 2cm)" or "at (30:1)"`, line);
  return { x: lengthInLines(xy[0], line), y: lengthInLines(xy[1], line) };
}

/** A side at an angle, in degrees counter-clockwise from the right (TikZ's label=45:...), as a unit vector (y down). */
function sideAtAngle(degrees: number): { x: number; y: number } {
  const angle = (degrees * Math.PI) / 180;
  return { x: portable.cos(angle), y: -portable.sin(angle) };
}

/** `above`, `below left`, ... as a unit vector (y down). */
function sideOf(text: string, line: number): { x: number; y: number } {
  let x = 0, y = 0;
  for (const word of text.trim().split(/\s+/)) {
    const d = SIDES[word];
    if (!d) throw new FeynError(`a label side is above, below, left or right, or two of them`, line);
    x += d[0]; y += d[1];
  }
  const n = portable.hypot(x, y) || 1;
  return { x: x / n, y: y / n };
}

/** Give a particle's lines and legs a label of their own, where they carry its usual one. */
function relabelParticles(vertices: Map<string, Vertex>, edges: Edge[], relabel: Map<string, string>): void {
  for (const e of edges) {
    const text = e.particle && relabel.get(e.particle);
    if (text && e.label === lookupParticle(e.particle!)?.label) e.label = text;
  }
  for (const v of vertices.values()) {
    const text = v.particle && relabel.get(v.particle);
    if (text) v.label = text;
  }
}
