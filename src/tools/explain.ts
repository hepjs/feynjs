import type { Diagram, Edge } from "../model.ts";
import { particleOfEdge, quarkFromLabel } from "../particles/identify.ts";
import { OBJECTS } from "../particles/objects.ts";
import { PROPERTIES, propertiesOf } from "../particles/properties.ts";
import { lookupParticle, registry } from "../particles/registry.ts";
import { isExternal, kindOfLine, linesByVertex, readDiagram } from "./prepare.ts";

/**
 * A diagram in plain English, for screen readers, alt text and anyone who cannot see it, told as
 * a physicist would summarise it. A production followed by decays is one sentence: what is made,
 * pairs named as pairs, decays that happen alike told once ("each"), and a W or Z that decays
 * differently on two branches told by its mode:
 *
 *     explain("p p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)")
 *     // "A proton–proton collision produces a top-quark pair, each top quark decaying into a
 *     //  bottom quark and a W boson, with one W boson decaying leptonically, to a positron and
 *     //  a neutrino, and the other hadronically."
 *
 * Any other diagram (a loop, an exchange, radiation) is told interaction by interaction, in time
 * order, after what comes in and goes out. Hadrons and marked couplings follow. Every SVG feynjs
 * draws carries this description in its <desc>.
 */
export function explain(source: string): string {
  const d = readDiagram(source);
  return `${summaryParsed(d)}. ${explainParsed(d)}`;
}

/**
 * The diagram in a phrase: what kind of picture it is and what it shows, in words, for the SVG's
 * accessible name (its aria-label) and the start of alt text. A high-level summary that details
 * follow, as accessible-figure guidance asks (ACM DIS 2023: "a high-level summary, then
 * details"); never the source's own symbols, which a screen reader spells out.
 *
 *     "Feynman diagram of a proton–proton collision producing a top-quark pair"
 *     "Feynman diagram of an electron and a positron annihilating into a muon pair, through a photon"
 *     "One-loop Feynman diagram of two gluons to a Higgs boson"
 */
export function summaryParsed(d: Diagram): string {
  const lines = linesByVertex(d);
  const external = new Set([...d.vertices.keys()].filter((id) => isExternal(d, id, lines)));
  const story = decayStory(d, lines, external);
  if (story) return `Feynman diagram of ${story.summary}`;
  const legName = (id: string) => nameOf(d, lines.get(id)![0]);
  const incoming = [...external].filter((id) => d.vertices.get(id)!.role === "in").map(legName);
  const outgoing = [...external].filter((id) => d.vertices.get(id)!.role === "out").map(legName);
  const loops = loopCount(d);
  const kind = `${loops ? `${capital(NUMBERS[loops] ?? String(loops))}-loop Feynman` : "Feynman"} diagram`;
  if (!incoming.length && !outgoing.length) return kind;
  return `${kind} of ${listOf(incoming, "a")} to ${listOf(outgoing, "a")}`;
}

/** Independent loops among the drawn lines: lines, less points, plus separate pieces. */
function loopCount(d: Diagram): number {
  const drawn = d.edges.filter((e) => e.style.line !== "none");
  const parent = new Map<string, string>();
  const find = (v: string): string => { while (parent.get(v) !== v) v = parent.get(v)!; return v; };
  for (const e of drawn) for (const v of [e.from, e.to]) if (!parent.has(v)) parent.set(v, v);
  for (const e of drawn) parent.set(find(e.from), find(e.to));
  const pieces = new Set([...parent.keys()].map(find)).size;
  return Math.max(0, drawn.length - parent.size + pieces);
}

/** Explain a diagram that has already been parsed, with its legs classified. */
export function explainParsed(d: Diagram): string {
  const lines = linesByVertex(d);
  const external = new Set([...d.vertices.keys()].filter((id) => isExternal(d, id, lines)));
  const legName = (id: string) => nameOf(d, lines.get(id)![0]);
  const incoming = [...external].filter((id) => d.vertices.get(id)!.role === "in").map(legName);
  const outgoing = [...external].filter((id) => d.vertices.get(id)!.role === "out").map(legName);
  const sentences: string[] = [];
  const story = decayStory(d, lines, external);
  if (story) {
    sentences.push(story.text);
    const outgoingLegs = [...external].filter((id) => d.vertices.get(id)!.role === "out").map((id) => lines.get(id)![0]);
    if (outgoingLegs.length) sentences.push(`The final state is ${listWithPairs(outgoingLegs, (e) => nameOf(d, e, nameFermionLines(d, lines)))}.`);
  } else {
    if (incoming.length || outgoing.length) {
      sentences.push(`${capital(listOf(incoming, "a"))} ${incoming.length > 1 ? "come" : "comes"} in; ${listOf(outgoing, "a")} ${outgoing.length > 1 ? "go" : "goes"} out.`);
    }
    sentences.push(...interactions(d, lines, external));
  }
  for (const h of d.hadrons) {
    const legs = h.legs.filter((id) => lines.get(id)?.length).map(legName);
    if (legs.length) sentences.push(`${capital(listOf(legs, "the"))} ${legs.length > 1 ? "are" : "is"} bound in the ${plainText(h.label)}.`);
  }
  const couplings = [...d.vertices.values()].filter((v) => v.coupling).map((v) => plainText(v.coupling!));
  if (couplings.length) sentences.push(`Couplings marked: ${listOf(couplings.map((c) => ({ singular: c, plural: c })), "")}.`);
  return sentences.join(" ");
}

// ---- the story of a production and its decays --------------------------------------------

/**
 * A production followed by decays, in one sentence, or undefined when the diagram is not one:
 * every incoming leg meets at one point (a collision, an annihilation or a decay), and from there
 * every line either leaves the diagram or ends in a decay into two or more others. A loop, an
 * exchange between two points, a line that only carries on, or radiation (a quark decaying into
 * a quark and a gluon) is told interaction by interaction instead.
 */
function decayStory(d: Diagram, lines: Map<string, Edge[]>, external: Set<string>): { text: string; summary: string } | undefined {
  const drawn = (id: string) => (lines.get(id) ?? []).filter((e) => e.style.line !== "none" && e.from !== e.to);
  if (loopGroups(d).size) return undefined;
  if (d.edges.some((e) => e.style.line !== "none" && external.has(e.from) && external.has(e.to))) return undefined;
  const incomingLegs = [...external].filter((id) => d.vertices.get(id)!.role === "in");
  if (!incomingLegs.length) return undefined;
  const other = (e: Edge, id: string) => (e.from === id ? e.to : e.from);
  const hardPoints = new Set(incomingLegs.flatMap((id) => drawn(id).map((e) => other(e, id))));
  if (hardPoints.size !== 1) return undefined;
  const hard = [...hardPoints][0];
  if (external.has(hard)) return undefined;
  const fermionNames = nameFermionLines(d, lines);
  const name = (e: Edge) => nameOf(d, e, fermionNames);
  const charge = (e: Edge) => propertiesOf(particleOfEdge(d, e))?.charge;

  // the decay tree, from the hard point outward: each line's far point and what leaves it
  const decay = new Map<Edge, Edge[]>();
  const visited = new Set([hard]);
  const grow = (from: string, line: Edge | undefined): boolean => {
    for (const e of drawn(from)) {
      if (e === line) continue;
      const to = other(e, from);
      if (external.has(to)) { if (d.vertices.get(to)!.role === "in") { if (from !== hard) return false; continue; } else continue; }
      if (visited.has(to)) return false;
      visited.add(to);
      const products = drawn(to).filter((f) => f !== e);
      if (products.length < 2) return false;
      // (radiation, not a decay: the particle carries on beside what it gives off)
      if (products.some((f) => name(f).singular === name(e).singular)) return false;
      decay.set(e, products);
      if (!grow(to, e)) return false;
    }
    return true;
  };
  if (!grow(hard, undefined)) return undefined;
  if ([...d.vertices.keys()].some((id) => !external.has(id) && !visited.has(id) && drawn(id).length)) return undefined;

  const incoming = drawn(hard).filter((e) => incomingLegs.includes(other(e, hard)));
  const made = drawn(hard).filter((e) => !incoming.includes(e));
  if (!made.length) return undefined;
  const blob = ["blob", "hatched"].includes(d.vertices.get(hard)!.shape);
  const inNames = incoming.map(name);
  // (one particle that carries on beside what it gives off radiates; it does not decay)
  if (inNames.length === 1 && made.some((e) => name(e).singular === inNames[0].singular)) return undefined;

  // what happens first: as a sentence's start, and as the summary's phrase (participles)
  let opening: string, phrase: string;
  const annihilate = inNames.length === 2 && baseOf(inNames[0]) === baseOf(inNames[1]) && inNames[0].singular !== inNames[1].singular;
  if (inNames.length === 1) { opening = `${capital(listOf(inNames, "a"))} decays into`; phrase = `${listOf(inNames, "a")} decaying into`; }
  else if (blob && inNames.length === 2) {
    const collision = `${article(baseOf(inNames[0]))} ${baseOf(inNames[0])}–${baseOf(inNames[1])} collision`;
    opening = `${capital(collision)} produces`; phrase = `${collision} producing`;
  } else if (inNames.length === 2 && made.length === 1) {
    opening = `${capital(listOf(inNames, "a"))} ${annihilate ? "annihilate" : "fuse"} into`; phrase = `${listOf(inNames, "a")} ${annihilate ? "annihilating" : "fusing"} into`;
  } else { opening = `${capital(listOf(inNames, "a"))} collide, producing`; phrase = `${listOf(inNames, "a")} colliding, producing`; }
  // (one force carrier made and decaying, a photon or a Z between the beams and the products,
  // is what the process goes through; the summary names what it makes)
  const carrier = made.length === 1 && decay.has(made[0]) && /^(?:(?:virtual|off-shell) )?(?:photon|gluon|Z boson|W boson)$/.test(name(made[0]).singular);
  const summary = carrier ? `${phrase} ${listWithPairs(decay.get(made[0])!, name)}, through ${listOf([name(made[0])], "a")}` : `${phrase} ${listWithPairs(made, name)}`;

  const clauses: string[] = [];
  const groups = groupsOf(made, name);
  const single = made.length === 1;
  for (const g of groups) clauses.push(...tellGroup(g, decay, name, charge, single));
  if (!clauses.length) return { text: `${opening} ${listWithPairs(made, name)}.`, summary };
  // (two clauses read as one sentence; a longer chain goes on in sentences of its own)
  const [first, second, ...rest] = clauses;
  const joined = single ? `${listWithPairs(made, name)}, which ${first}` : `${listWithPairs(made, name)}, ${first}`;
  const onwards = rest.map((c) => `${capital(c.replace(/ decaying\b/, " decays"))}.`);
  return { text: [`${opening} ${joined}${second ? `, with ${second}` : ""}.`, ...onwards].join(" "), summary };
}

/** A name without "anti", the positron an electron: the particle a pair is named after. */
function baseOf(n: Name): string {
  return n.singular === "positron" ? "electron" : n.singular.replace(/\banti-?(?=\w)/, "").replace(/ anti-?(?=\w)/, " ");
}

/** Lines of the same particle, or a particle and its antiparticle, together: the branches told alike. */
function groupsOf(edges: Edge[], name: (e: Edge) => Name): Edge[][] {
  const groups = new Map<string, Edge[]>();
  for (const e of edges) { const k = baseOf(name(e)); (groups.get(k) ?? groups.set(k, []).get(k)!).push(e); }
  return [...groups.values()];
}

/** "a top-quark pair and a gluon": two lines of one particle, or of it and its antiparticle, are a pair. */
function listWithPairs(edges: Edge[], name: (e: Edge) => Name): string {
  const parts: Name[] = [];
  for (const g of groupsOf(edges, name)) {
    if (g.length === 2) { const pair = `${baseOf(name(g[0])).replace(/ /g, "-")} pair`; parts.push({ singular: pair, plural: `${pair}s` }); }
    else parts.push(...g.map(name));
  }
  return listOf(sortNames(parts).sort((a, b) => Number(/neutrino/.test(a.singular)) - Number(/neutrino/.test(b.singular))), "a");
}

/** How a W or Z decays, when its products say: "leptonically", "hadronically" or "invisibly". */
function modeOf(parent: Name, products: Name[]): string | undefined {
  if (!/^(?:off-shell )?[WZ] boson$/.test(parent.singular)) return undefined;
  const kinds = products.map((n) => baseOf(n)).map((b) => (/neutrino/.test(b) ? "nu" : /\b(?:electron|muon|tau|lepton)\b/.test(b) ? "l" : /\bquark\b|\bjet\b/.test(b) ? "q" : "?"));
  if (kinds.every((k) => k === "nu")) return "invisibly";
  if (kinds.every((k) => k === "nu" || k === "l")) return "leptonically";
  if (kinds.every((k) => k === "q")) return "hadronically";
  return undefined;
}

/**
 * The decays of one group of branches (a particle and its antiparticle, say), as clauses:
 * told once with "each" when they decay alike, then what they make, group by group; or "one ...
 * and the other ..." when they do not, a W or Z by its mode.
 */
function tellGroup(group: Edge[], decay: Map<Edge, Edge[]>, name: (e: Edge) => Name, charge: (e: Edge) => string | undefined, which: boolean): string[] {
  const decaying = group.filter((e) => decay.has(e));
  if (!decaying.length) return [];
  const base = baseOf(name(group[0]));
  const keyOf = (products: Edge[]) => products.map((f) => baseOf(name(f))).sort().join("|");
  const into = (products: Edge[]) => listWithPairs(products, name);
  const verb = which ? "decays" : "decaying";
  if (decaying.length === group.length && new Set(decaying.map((e) => keyOf(decay.get(e)!))).size === 1) {
    const products = decay.get(group[0])!;
    const subject = which ? "" : group.length > 1 ? `each ${base} ` : `the ${name(group[0]).singular} `;
    // (a W or Z told by its mode where the mode says it all: hadronically, invisibly)
    const mode = modeOf(name(group[0]), products.map(name));
    const clause = mode && mode !== "leptonically" ? `${subject}${verb} ${mode}` : `${subject}${verb} into ${into(products)}`;
    // the products of every branch, matched by particle, are the next groups
    const next = new Map<string, Edge[]>();
    for (const e of group) for (const f of decay.get(e)!) { const k = baseOf(name(f)); (next.get(k) ?? next.set(k, []).get(k)!).push(f); }
    return [clause, ...[...next.values()].flatMap((g) => tellGroup(g, decay, name, charge, false))];
  }
  if (group.length === 2) {
    const [a, b] = group, pa = decay.get(a), pb = decay.get(b);
    const ma = pa && modeOf(name(a), pa.map(name)), mb = pb && modeOf(name(b), pb.map(name));
    const how = (products: Edge[] | undefined, mode: string | undefined, otherMode: string | undefined) =>
      !products ? "not at all" : mode && mode !== otherMode ? (mode === "leptonically" ? `${mode}, to ${into(products)}` : mode) : `into ${into(products)}`;
    const first = pa ? a : b, second = pa ? b : a;
    const [p1, p2, m1, m2] = pa ? [pa, pb, ma, mb] : [pb, pa, mb, ma];
    const clause = p2 ? `one ${base} ${verb} ${how(p1, m1, m2)}, and the other ${how(p2, m2, m1)}` : `one ${base} ${verb} ${how(p1, m1, undefined)}`;
    const deeper = [first, second].filter((e) => decay.has(e)).flatMap((e) => decay.get(e)!.flatMap((f) => tellGroup([f], decay, name, charge, false)));
    return [clause, ...deeper];
  }
  return decaying.flatMap((e) => [`${article(name(e).singular)} ${name(e).singular} ${verb} into ${into(decay.get(e)!)}`, ...decay.get(e)!.flatMap((f) => tellGroup([f], decay, name, charge, false))]);
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
  return [...names].sort((a, b) => alphabetical(key(a), key(b)));
}

/**
 * Alphabetical regardless of case, then by character: the same in every engine and locale
 * (a locale-aware comparison follows the reader's language, and engines without ICU compare raw codes).
 */
function alphabetical(a: string, b: string): number {
  const x = a.toLowerCase(), y = b.toLowerCase();
  if (x !== y) return x < y ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
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
  // (a detector object drawn as a line's style, [largejet 2j], is named as the object)
  const object = e.style.object && OBJECTS.find((o) => o.object === e.style.object)?.name;
  const particle = particleOfEdge(d, e) ?? quarkFromLabel(e.label) ?? object ?? particleWithLabel(label);
  const named = propertiesOf(particle)?.name;
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
  // (every particle's label, squashed, to its name: built once, again only when a particle is
  // added; the first name with a label wins, as a search in order would find it)
  if (!labelIndex || labelIndexVersion !== registry.version) {
    labelIndex = new Map();
    labelIndexVersion = registry.version;
    for (const name of Object.keys(PROPERTIES)) {
      const p = lookupParticle(name);
      if (p) { const k = squashLabel(p.label); if (!labelIndex.has(k)) labelIndex.set(k, name); }
    }
  }
  return labelIndex.get(squashLabel(label));
}
const squashLabel = (t: string) => t.replace(/[\s{}]/g, "");
let labelIndex: Map<string, string> | undefined, labelIndexVersion = -1;

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
