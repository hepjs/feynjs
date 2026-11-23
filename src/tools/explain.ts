import type { Diagram, Edge } from "../model.ts";
import { particleOfEdge, quarkFromLabel } from "../particles/identify.ts";
import { PROPERTIES } from "../particles/properties.ts";
import { lookupParticle } from "../particles/registry.ts";
import { isExternal, kindOfLine, linesByVertex, readDiagram } from "./prepare.ts";

/**
 * A diagram in plain English, for screen readers, alt text and anyone who cannot see it:
 * what comes in and goes out, then each interaction in time order, then loops and hadrons.
 *
 *     explain("i1 [e-] -- a -- i2 [e+]\na -- [Z] b\nf1 [mu-] -- b -- f2 [mu+]")
 *     // "An electron and a positron come in; a muon and an antimuon go out. The electron and
 *     //  the positron meet, making a Z boson. The Z boson decays into a muon and an antimuon."
 *
 * Every SVG feynjs draws carries this description in its <desc>.
 */
export function explain(source: string): string {
  return explainParsed(readDiagram(source));
}

/** Explain a diagram that has already been parsed, with its legs classified. */
export function explainParsed(d: Diagram): string {
  const lines = linesByVertex(d);
  const external = new Set([...d.vertices.keys()].filter((id) => isExternal(d, id, lines)));
  const legName = (id: string) => nameOf(d, lines.get(id)![0]);
  const incoming = [...external].filter((id) => d.vertices.get(id)!.role === "in").map(legName);
  const outgoing = [...external].filter((id) => d.vertices.get(id)!.role === "out").map(legName);
  const sentences: string[] = [];
  if (incoming.length || outgoing.length) {
    sentences.push(`${capital(listOf(incoming, "a"))} ${incoming.length > 1 ? "come" : "comes"} in; ${listOf(outgoing, "a")} ${outgoing.length > 1 ? "go" : "goes"} out.`);
  }
  sentences.push(...interactions(d, lines, external));
  for (const h of d.hadrons) {
    const legs = h.legs.filter((id) => lines.get(id)?.length).map(legName);
    if (legs.length) sentences.push(`${capital(listOf(legs, "the"))} ${legs.length > 1 ? "are" : "is"} bound in the ${plainText(h.label)}.`);
  }
  const couplings = [...d.vertices.values()].filter((v) => v.coupling).map((v) => plainText(v.coupling!));
  if (couplings.length) sentences.push(`Couplings marked: ${listOf(couplings.map((c) => ({ singular: c, plural: c })), "")}.`);
  return sentences.join(" ");
}

// ---- the story, interaction by interaction ------------------------------------------------

interface Name { singular: string; plural: string }

/**
 * One sentence per interaction, in time order. A loop counts as one interaction, so a triangle
 * of top quarks reads "...through a loop of three top quarks", not as three vertices.
 */
function interactions(d: Diagram, lines: Map<string, Edge[]>, external: Set<string>): string[] {
  const step = stepsInTime(d);
  const loopOf = loopGroups(d);
  // nodes: each interaction vertex, with the vertices of a loop merged into one
  const nodeOf = (id: string) => loopOf.get(id) ?? id;
  const nodes = new Map<string, { ids: string[]; step: number }>();
  for (const id of d.vertices.keys()) {
    if (external.has(id)) continue;
    const n = nodeOf(id), entry = nodes.get(n) ?? { ids: [], step: Infinity };
    entry.ids.push(id);
    entry.step = Math.min(entry.step, step.get(id) ?? 0);
    nodes.set(n, entry);
  }
  const fermionNames = nameFermionLines(d, lines);
  const sentences: string[] = [];
  const told = new Set<Edge>();
  for (const [node, { ids, step: at }] of [...nodes].sort((a, b) => a[1].step - b[1].step)) {
    const before: Edge[] = [], after: Edge[] = [], across: Edge[] = [], inside: Edge[] = [];
    for (const id of ids) for (const e of lines.get(id)!) {
      const other = e.from === id ? e.to : e.from;
      if (nodeOf(other) === node && !external.has(other)) { if (!inside.includes(e)) inside.push(e); continue; }
      if (e.style.line === "none") continue;
      const v = d.vertices.get(other)!;
      const when = external.has(other) ? (v.role === "in" ? -1 : Infinity) : (nodes.get(nodeOf(other))?.step ?? 0);
      (when < at ? before : when > at ? after : across).push(e);
    }
    const names = (list: Edge[]) => list.map((e) => nameOf(d, e, fermionNames));
    const blob = ids.some((id) => ["blob", "hatched"].includes(d.vertices.get(id)!.shape));
    // a loop's unnamed fermion lines are the same particle as its named ones (a top-quark triangle)
    const loopNames = names(inside), known = loopNames.find((n, k) => inside[k].style.line === "plain" && n.singular !== "fermion");
    const loopLines = loopNames.map((n, k) => (known && inside[k].style.line === "plain" && n.singular === "fermion" ? known : n));
    const through = inside.length && ids.length > 1 ? ` through a loop of ${listOf(loopLines, "")}` : "";
    // a line between two moments at the same step (a t-channel exchange) is told once: it
    // leaves the first vertex told and arrives at the second
    const leaving = across.filter((e) => !told.has(e)), arriving = across.filter((e) => told.has(e));
    leaving.forEach((e) => told.add(e));
    const E = sortNames(names([...before, ...arriving])), L = sortNames(names([...after, ...leaving]));
    const fermionIn = [...before, ...arriving].length === 1 && [...before, ...arriving][0].style.line === "plain";
    let s: string;
    if (blob) s = `${capital(listOf(E, "the"))} collide${E.length > 1 ? "" : "s"}, producing ${listOf(L, "a")}`;
    else if (E.length >= 2 && L.length === 1) s = `${capital(listOf(E, "the"))} meet, making ${listOf(L, "a")}`;
    else if (E.length >= 2 && L.length >= 2) s = `${capital(listOf(E, "the"))} interact, giving ${listOf(L, "a")}`;
    else if (E.length === 1 && L.length >= 1) {
      const carriesOn = L.findIndex((n) => n.singular === E[0].singular);
      if (carriesOn >= 0 && L.length > 1 && fermionIn) s = `${capital(listOf(E, "the"))} emits ${listOf(L.filter((_, k) => k !== carriesOn), "a")}`;
      else s = `${capital(listOf(E, "the"))} ${L.length === 1 ? "becomes" : "decays into"} ${listOf(L, "a")}`;
    } else if (E.length >= 1) s = `${capital(listOf(E, "the"))} ${E.length > 1 ? "meet" : "ends"}`;
    else if (L.length) s = `${capital(listOf(L, "a"))} ${L.length > 1 ? "are" : "is"} made`;
    else continue;
    sentences.push(`${s}${through}.`);
  }
  // the same decay told twice ("The gluino decays into...") is told once, for each
  const merged: string[] = [];
  for (const s of sentences) {
    const repeats = sentences.filter((t) => t === s).length;
    if (merged.includes(s) || merged.includes(s.replace(/^The /, "Each "))) continue;
    merged.push(repeats > 1 && s.startsWith("The ") ? s.replace(/^The /, "Each ") : s);
  }
  return merged;
}

/** A fixed order for a list of products, so the same decay always reads the same way. */
function sortNames(names: Name[]): Name[] {
  // (a particle before its antiparticle: "a muon and an antimuon")
  const key = (n: Name) => `${n.singular.replace(/anti/, "")}${/anti/.test(n.singular) ? "~" : ""}`;
  return [...names].sort((a, b) => key(a).localeCompare(key(b)));
}

/**
 * Names for fermion lines that name no particle: a plain line meeting exactly one other plain
 * line at a vertex is the same fermion carrying on (the quark between an emission and the hard
 * process), so it takes that line's name.
 */
function nameFermionLines(d: Diagram, lines: Map<string, Edge[]>): Map<Edge, Name> {
  const known = new Map<Edge, Name>();
  for (const e of d.edges) {
    if (e.style.line !== "plain") continue;
    const n = nameOf(d, e);
    if (n.singular !== "fermion") known.set(e, n);
  }
  for (let changed = true; changed;) {
    changed = false;
    for (const list of lines.values()) {
      const plain = list.filter((e) => e.style.line === "plain");
      if (plain.length !== 2) continue;
      const [a, b] = plain;
      if (known.has(a) && !known.has(b)) { known.set(b, known.get(a)!); changed = true; }
      else if (known.has(b) && !known.has(a)) { known.set(a, known.get(b)!); changed = true; }
    }
  }
  return known;
}

/** Each vertex's step in time: incoming legs are 0, everything else one more than its nearest earlier neighbour. */
function stepsInTime(d: Diagram): Map<string, number> {
  const around = new Map<string, string[]>();
  for (const e of d.edges) {
    (around.get(e.from) ?? around.set(e.from, []).get(e.from)!).push(e.to);
    (around.get(e.to) ?? around.set(e.to, []).get(e.to)!).push(e.from);
  }
  const step = new Map<string, number>();
  let frontier = [...d.vertices.values()].filter((v) => v.role === "in").map((v) => v.id);
  if (frontier.length === 0) frontier = [...around.keys()].slice(0, 1);
  for (const id of frontier) step.set(id, 0);
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) for (const n of around.get(id) ?? []) if (!step.has(n)) { step.set(n, step.get(id)! + 1); next.push(n); }
    frontier = next;
  }
  return step;
}

/** The vertices of each loop, grouped: lines that are not bridges lie on a cycle. */
function loopGroups(d: Diagram): Map<string, string> {
  const edges = d.edges.filter((e) => e.from !== e.to && e.style.line !== "none");
  const around = new Map<string, { to: string; k: number }[]>();
  edges.forEach((e, k) => {
    (around.get(e.from) ?? around.set(e.from, []).get(e.from)!).push({ to: e.to, k });
    (around.get(e.to) ?? around.set(e.to, []).get(e.to)!).push({ to: e.from, k });
  });
  // bridges, by Tarjan's low-link (edges are told apart by index, so doubled lines make a loop)
  const order = new Map<string, number>(), low = new Map<string, number>(), bridge = new Set<number>();
  let time = 0;
  const visit = (v: string, via: number) => {
    order.set(v, time); low.set(v, time); time++;
    for (const { to, k } of around.get(v) ?? []) {
      if (k === via) continue;
      if (!order.has(to)) {
        visit(to, k);
        low.set(v, Math.min(low.get(v)!, low.get(to)!));
        if (low.get(to)! > order.get(v)!) bridge.add(k);
      } else low.set(v, Math.min(low.get(v)!, order.get(to)!));
    }
  };
  for (const v of around.keys()) if (!order.has(v)) visit(v, -1);
  const parent = new Map<string, string>();
  const find = (v: string): string => { while (parent.get(v) !== undefined && parent.get(v) !== v) v = parent.get(v)!; return v; };
  edges.forEach((e, k) => {
    if (bridge.has(k)) return;
    for (const v of [e.from, e.to]) if (!parent.has(v)) parent.set(v, v);
    parent.set(find(e.from), find(e.to));
  });
  const group = new Map<string, string>();
  for (const v of parent.keys()) group.set(v, `loop:${find(v)}`);
  return group;
}

// ---- names --------------------------------------------------------------------------------

/** What a line is, in words: its particle's name, else its label, else the kind of line. */
function nameOf(d: Diagram, e: Edge, fermions?: Map<Edge, Name>): Name {
  const label = e.label ?? [e.from, e.to].map((id) => d.vertices.get(id)!).find((v) => v.role && v.label)?.label;
  const particle = particleOfEdge(d, e) ?? quarkFromLabel(e.label) ?? particleWithLabel(label);
  const named = particle ? PROPERTIES[particle]?.name : undefined;
  if (!named && fermions?.has(e)) return fermions.get(e)!;
  if (named) return { singular: named, plural: plural(named) };
  // (a label that is a symbol, not a word, names its line: "a t, b line", "three t, b lines")
  if (label) {
    const text = plainText(label);
    return /^[A-Za-z][a-z' -]+$/.test(text) && text.length > 3 ? { singular: text, plural: plural(text) } : { singular: `${text} line`, plural: `${text} lines` };
  }
  return { singular: kindOfLine(e), plural: plural(kindOfLine(e)) };
}

function plural(name: string): string {
  if (/momentum$|^anything$/.test(name)) return name;
  if (/\b(?:jet|quark|boson|lepton|particle|track)\b/.test(name) && !/s$/.test(name)) return name.replace(/\b(jet|quark|boson|lepton|particle|track)\b(?!.*\b(?:jet|quark|boson|lepton|particle|track)\b)/, "$1s");
  return /(?:s|x|ch|sh)$/.test(name) ? `${name}es` : /[^aeiou]y$/.test(name) ? `${name.slice(0, -1)}ies` : `${name}s`;
}

/** The particle whose own label this is (`\\mu^-` is the mu-), so a TeX label reads as a name. */
function particleWithLabel(label: string | undefined): string | undefined {
  if (!label) return undefined;
  const squash = (t: string) => t.replace(/[\s{}]/g, "");
  return Object.keys(PROPERTIES).find((name) => { const p = lookupParticle(name); return p && squash(p.label) === squash(label); });
}

const NUMBERS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const article = (word: string) => (/^(?:[aeiou]|hon|\d*[18]\b)/i.test(word) && !/^(?:uni|one|eu)/i.test(word) ? "an" : "a");

/** "a muon and an antimuon", "two gluons", "the electron, the positron and a photon". */
function listOf(names: Name[], determiner: "a" | "the" | ""): string {
  const counts = new Map<string, { name: Name; n: number }>();
  for (const name of names) {
    const c = counts.get(name.singular) ?? { name, n: 0 };
    c.n++;
    counts.set(name.singular, c);
  }
  const parts = [...counts.values()].map(({ name, n }) => {
    if (n === 1) return determiner === "a" ? `${article(name.singular)} ${name.singular}` : determiner === "the" ? `the ${name.singular}` : name.singular;
    const many = `${NUMBERS[n] ?? n} ${name.plural}`;
    return determiner === "the" ? `the ${many}` : many;
  });
  return parts.length <= 1 ? (parts[0] ?? "nothing") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GREEK = new Set(["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "kappa", "lambda", "mu", "nu", "xi", "pi", "rho", "sigma", "tau", "phi", "chi", "psi", "omega", "Gamma", "Delta", "Lambda", "Sigma", "Phi", "Psi", "Omega", "Upsilon", "ell"]);

/** A TeX label read aloud: `\tilde\chi^0_1` -> "chi-tilde 0 1", `J/\psi` -> "J/psi", `B^0` -> "B 0". */
export function plainText(tex: string): string {
  return tex
    .replace(/\\(?:mathrm|text|textrm|mathit)\s*\{([^}]*)\}/g, "$1")
    .replace(/\\(?:tilde|widetilde)\s*\{?\\?(\w+)\}?/g, "$1-tilde")
    .replace(/\\(?:bar|overline)\s*\{?\\?(\w+)\}?/g, "$1-bar")
    .replace(/\\([A-Za-z]+)/g, (m, w) => (GREEK.has(w) ? w : w === "pm" ? "±" : w === "to" ? "to" : ""))
    .replace(/[{}]/g, "")
    .replace(/[\^_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
