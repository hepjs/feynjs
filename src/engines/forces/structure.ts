import type { Diagram } from "../../model.ts";
import { particleOfEdge } from "../../particles/identify.ts";
import { PROPERTIES } from "../../particles/properties.ts";

/**
 * What layout v2 knows about a diagram before any geometry: who is joined to whom, which
 * points are external, and when each point happens. Time is the only structural decision;
 * everything else is left to the forces.
 */
export interface Structure {
  ids: string[];
  /** index of each point in `ids` */
  index: Map<string, number>;
  lines: Line[];
  /** the lines at each point, as indices into `lines` */
  linesAt: number[][];
  external: boolean[];
  /** a step count from the incoming legs: incoming legs are 0, outgoing legs are latest */
  time: number[];
  /** each exchange between two incoming particles, as its vertices in order from one to the other */
  spines: number[][];
  /** how far each point's drawn element reaches from it: a vertex dot, or a leg end's label */
  pad: number[];
  /** how far each line's label reaches from the line's middle (0 for no label) */
  linePad: number[];
  /** -1 where the author put a line's label on its other side (label'), else 1 */
  labelFlip: number[];
  /** true for a line that is not drawn (a vacuum pair's invisible line in) */
  hidden: boolean[];
  /** true for a point drawn as a blob (the pp collision, a shaded vertex) */
  blob: boolean[];
  /**
   * for a point on an incoming quark that gives off radiation on its way to annihilate with
   * the other incoming quark (q -> q g, then q qbar -> Z'), the point where they annihilate,
   * the collision; otherwise -1
   */
  radiatesInto: number[];
  /** an external field (a leg ending in a crossed dot, the Coulomb field of a nucleus): it
   * stands outside time, its line upright from below */
  field: boolean[];
  /** radius of a blob, in line lengths */
  blobRadius: number;
  /** how far what is drawn at each point reaches, in ranks: a blob's radius, a nucleus's, 0 for a plain point */
  markRadius: number[];
  /** hadrons: the legs (points) whose ends one hadron covers, in the order written */
  hadrons: { legs: number[]; outgoing: boolean; ellipse: boolean; cap: boolean }[];
  /** what a hadron's ellipse adds beyond its legs' spread, and its least half-height */
  hadronPad: number;
  hadronMin: number;
  /** quark pairs from the vacuum, with the lines that run beside them (see `vacuumPairs`) */
  pairs: VacuumPair[];
  /** closed loops, each as its points and lines in order round it (see `findLoops`) */
  loops: Loop[];
  /** the particle at each external point (its own, or its line's), where one is named */
  particle: (string | undefined)[];
  /** the label at each external point, if any */
  label: (string | undefined)[];
  /** each line's label or particle, to tell twin branches (two Z, two gamma_d) */
  lineLabel: (string | undefined)[];
  /** each leg's place in the author's `in:` / `out:` list (top to bottom), or -1 */
  order: number[];
}

/**
 * A closed loop of lines. Where the loop is a stretch of one fermion line (that goes on
 * beyond the loop at both ends) closed by bosons alone, it is an arc over that line: `run`
 * is the stretch, from one end to the other, and `path` the arc's points from the run's last
 * point back to its first. Any other loop (a fermion loop, a box between lines) has neither.
 */
export interface Loop {
  points: number[];
  lines: number[];
  run?: number[];
  path?: number[];
  pathLines?: number[];
}

/**
 * A quark and antiquark made from the vacuum: a point whose only lines are a quark and an
 * antiquark (and perhaps the gluon that makes them), each ending in an outgoing hadron (two hadrons, or one meson made wholly from
 * the vacuum). The other quark of each of those
 * hadrons (a partner) runs beside the pair, outside it.
 */
export interface VacuumPair {
  at: number;
  ends: [number, number];
  lines: [number, number];
  partners: { line: number; from: number; leg: number }[];
  /** true when the author drew the pair curved: the pair and its partners are then arcs */
  curved: boolean;
}

/** Sizes of what is drawn at each point and on each line, in propagator lengths. */
export interface Sizes {
  /** radius of the label at a leg's end, by vertex id */
  legLabel: Map<string, number>;
  /** radius of the label on each edge, in the order of `d.edges` */
  edgeLabel: number[];
  /** what a hadron's ellipse adds beyond its legs' spread, and its least half-height */
  hadronPad?: number;
  hadronMin?: number;
  /** radius of a blob, in line lengths: a line leaving one is seen only from its rim */
  blobRadius?: number;
  /** each point drawn larger than a blob (a nucleus, a hadron with its quarks): its radius, in ranks */
  markRadius?: Map<string, number>;
}

export interface Line {
  a: number;
  b: number;
  /** true when one end is an external leg */
  leg: boolean;
  /** true for a fermion line (solid, with or without arrows) */
  fermion: boolean;
  /** true for a supersymmetric (or other heavy new) particle, drawn in the SUSY style */
  heavy: boolean;
  /** true for a wavy or coiled line, which is wide */
  wavy: boolean;
  /** true for a dashed line that is not SUSY (a scalar: H, a, h0) */
  dashed?: boolean;
  /** the bend the author gave the line, if any (positive bulges left of travel from a to b) */
  bend?: number;
  /**
   * a fermion's mass, as the layout treats it: `light` (every lepton and quark but the top: all
   * drawn alike), `massive` (the top: heavy enough to decay to a fermion and a W or Z), or
   * undefined where the particle is not known (an unnamed line): treated as light
   */
  mass?: "light" | "massive";
  /** true for a particle marked off-shell, `W*`, `(W_R)^*`, `\\gamma^*` (not `W^{(*)}`, perhaps off-shell) */
  offShell?: boolean;
}

/** Fermions with no mass in the table that are light all the same: a quark, a lepton, written generically. */
const GENERIC_LIGHT = new Set(["q", "qbar", "q'", "qbar'", "l", "l-", "l+", "f", "fbar", "f'", "j"]);

/**
 * How heavy a fermion is, for the layout, from its particle key or its label (`t`, `\bar t`,
 * `t^*`, `\ell`, `\nu_\mu`): `massive` from 50 GeV up (the top), else `light` (every other
 * lepton and quark); undefined for a particle the table does not know. A superpartner (`\tilde`)
 * is not an ordinary fermion: undefined.
 */
export function massOf(name: string | undefined): "light" | "massive" | undefined {
  if (!name || /\\tilde|\\widetilde/.test(name)) return undefined;
  const key = name.trim().replace(/\\(?:bar|overline)\s*\{([^}]*)\}/, "$1bar").replace(/\\(?:bar|overline)\s*([A-Za-z]+)/, "$1bar")
    .replace(/\^\s*(\{[^}]*\}|\S)/g, "").replace(/_\s*(\{[^}]*\}|\\?[A-Za-z]+|\S)/g, "").replace(/\\ell/, "l").replace(/\\([A-Za-z]+)/g, "$1").replace(/[{}$\s]/g, "").replace(/~$/, "bar");
  const known = PROPERTIES[key] ?? PROPERTIES[key.replace(/bar$/, "")];
  if (!known) return GENERIC_LIGHT.has(key) || GENERIC_LIGHT.has(key.replace(/bar$/, "")) ? "light" : undefined;
  if (known.spin !== "1/2") return undefined;
  const m = /([\d.]+)\s*(eV|keV|MeV|GeV|TeV)/.exec(known.mass ?? "");
  // (a hypothetical fermion, a heavy neutral lepton or a top partner, is massive)
  if (!m) return known.note?.includes("hypothetical") ? "massive" : "light";
  const gev = Number(m[1]) * { eV: 1e-9, keV: 1e-6, MeV: 1e-3, GeV: 1, TeV: 1e3 }[m[2] as "GeV"];
  return gev >= 50 ? "massive" : "light";
}

/** Read the points, lines and time order of a diagram. */
export function readStructure(d: Diagram, sizes?: Sizes, vertexPad = 0.08): Structure {
  const ids = [...d.vertices.keys()].filter((id) => d.edges.some((e) => e.from === id || e.to === id));
  const index = new Map(ids.map((id, i) => [id, i]));
  const linesAt: number[][] = ids.map(() => []);
  const lines: Line[] = [];
  for (const e of d.edges) {
    const a = index.get(e.from)!, b = index.get(e.to)!;
    linesAt[a].push(lines.length);
    linesAt[b].push(lines.length);
    lines.push({ a, b, leg: false, fermion: e.style.line === "plain" && e.style.cls !== "susy", heavy: e.style.cls === "susy", wavy: e.style.line === "wave" || e.style.line === "coil", dashed: e.style.line === "dash" && e.style.cls !== "susy", bend: e.bend !== undefined && !e.bendIsAutomatic ? e.bend : undefined });
  }
  const external = ids.map((_, i) => linesAt[i].length === 1);
  for (const line of lines) line.leg = external[line.a] || external[line.b];
  d.edges.forEach((e, l) => { const name = `${e.particle ?? ""} ${e.label ?? ""}`; if (name.includes("*") && !name.includes("(*)")) lines[l].offShell = true; });
  d.edges.forEach((e, l) => { if (lines[l].fermion) lines[l].mass = massOf(lines[l].leg ? particleOfEdge(d, e) ?? e.label : e.particle ?? e.label); });
  const field = ids.map((id, i) => external[i] && d.vertices.get(id)!.shape === "crossed");
  const first = orderInTime(d, ids, lines, linesAt, external, new Map(), field);
  const hadrons = d.hadrons.map((h) => ({
    legs: h.legs.map((id) => index.get(id)).filter((i): i is number => i !== undefined),
    outgoing: d.vertices.get(h.legs[0])?.role === "out",
    ellipse: h.shape === "ellipse",
    cap: h.shape === "cap",
  })).filter((h) => h.legs.length > 0);
  // a quark's label inside a hadron is drawn short of the hadron: it is not an element of its own
  const inHadron = new Set(hadrons.flatMap((h) => h.legs));
  const pad = ids.map((id, i) => (external[i] && !inHadron.has(i) ? sizes?.legLabel.get(id) ?? vertexPad : vertexPad));
  const linePad = d.edges.map((_, k) => sizes?.edgeLabel[k] ?? 0);
  const labelFlip = d.edges.map((e) => (e.labelSide === -1 ? -1 : 1));
  // (a nucleus is a blob too: an ion passes through it and gives off what collides)
  const blob = ids.map((id) => ["blob", "hatched", "nucleus"].includes(d.vertices.get(id)!.shape));
  const markRadius = ids.map((id, i) => sizes?.markRadius?.get(id) ?? (blob[i] ? sizes?.blobRadius ?? 0 : 0));
  const radiatesInto = ids.map((id) => {
    const w = radiationTarget(d, id);
    return w === undefined ? -1 : ids.indexOf(w);
  });
  const hidden = d.edges.map((e) => e.style.line === "none");
  const particle = ids.map((id, i) => (external[i] ? d.vertices.get(id)!.particle ?? particleOfEdge(d, d.edges[linesAt[i][0]]) : undefined));
  const s: Structure = { ids, index, lines, linesAt, external, time: first, spines: [], pad, linePad, labelFlip, blob, radiatesInto, blobRadius: sizes?.blobRadius ?? 0, markRadius, hidden,
    hadrons, hadronPad: sizes?.hadronPad ?? 0.15, hadronMin: sizes?.hadronMin ?? 0.3, pairs: [], loops: [], particle, label: ids.map((id, i) => (external[i] ? d.vertices.get(id)!.label ?? d.edges[linesAt[i][0]].label : undefined)),
    lineLabel: d.edges.map((e) => e.particle ?? e.label), field,
    order: ids.map((id) => d.vertices.get(id)!.declaredOrder ?? -1) };
  s.pairs = vacuumPairs(s, d);
  s.loops = findLoops(s);
  // the vertices on the exchange between two incoming particles happen together
  // (but not an exchange that runs through a loop between the beams: two photons from two ions
  // fusing in a box are a collision there, drawn ahead of the ions, not an upright exchange)
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  // (nor two photons from the beams fusing at one point: they meet there, ahead of the beams)
  const photon = d.edges.map((e) => e.particle === "gamma" || e.particle === "photon" || /^\\gamma(\^\*)?$/.test((e.label ?? "").trim()));
  const lineBetween = (a: number, b: number) => linesAt[a].find((l) => lines[l].a === b || lines[l].b === b)!;
  const fusing = (path: number[]) => path.length === 3 && [lineBetween(path[0], path[1]), lineBetween(path[1], path[2])].every((l) => photon[l]);
  s.spines = exchangePaths(s).filter((path) => !(s.blob[path[0]] && s.blob[path[path.length - 1]] && path.slice(1, -1).some((i) => onLoop.has(i))) && !fusing(path));
  // ...at the moment the latest of them would otherwise happen
  const spine = new Set(s.spines.flat());
  const moment = Math.max(0, ...[...spine].map((i) => first[i]));
  if (spine.size) s.time = orderInTime(d, ids, lines, linesAt, external, new Map([...spine].map((i) => [i, moment])), field);
  return s;
}

type Bare = Pick<Structure, "ids" | "lines" | "linesAt" | "external" | "time"> & { blob?: boolean[]; radiatesInto?: number[] };

/**
 * The exchange between each pair of incoming particles: the shortest path through internal
 * vertices between their own lines, as its vertices in order. An incoming fermion's own line
 * runs on through the vertices where it only gives something off, up to where another
 * particle comes in. So in a t-channel scatter the exchange is the whole gluon (or quark)
 * between the beams, in VBF both W's and the Higgs vertex between them, and in
 * bremsstrahlung only the photon: the electron's propagator is still the electron.
 */
export function exchangePaths(s: Bare): number[][] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  const entryOf = (leg: number) => other(s.linesAt[leg][0], leg);
  const entries = new Set(incoming.map(entryOf).filter((v) => !s.external[v]));
  const ownLine = (leg: number): number[] => {
    const line = [entryOf(leg)];
    if (s.external[line[0]] || !s.lines[s.linesAt[leg][0]].fermion) return line;
    let from = leg, at = line[0];
    for (;;) {
      const onward = s.linesAt[at].filter((l) => s.lines[l].fermion && other(l, at) !== from);
      if (onward.length !== 1) break;
      const next = other(onward[0], at);
      // a fermion line that runs on to where the other particle comes in joins the two
      // beams: then all of it is the exchange, and the particle's own line is just its entry
      // (unless it runs into a blob: the blob is the collision, and what the line gave off on
      // the way is radiation from the incoming particle, as initial-state radiation is drawn)
      // (or where the author marked what it gave off as radiation)
      if (entries.has(next)) return s.blob?.[next] || s.radiatesInto?.[at] === next ? [...line, next] : [line[0]];
      if (s.external[next] || line.includes(next)) break;
      line.push(next); from = at; at = next;
    }
    return line;
  };
  const lines = incoming.filter((leg) => !s.external[entryOf(leg)]).map(ownLine);
  const paths: number[][] = [];
  for (let m = 0; m < lines.length; m++) for (let n = m + 1; n < lines.length; n++) {
    const [from, to] = [new Set(lines[m]), new Set(lines[n])];
    if ([...from].some((v) => to.has(v))) continue;
    // breadth-first from the whole of one line to the nearest point of the other
    const via = new Map<number, number>([...from].map((v) => [v, -1]));
    let frontier = [...from], reached = -1;
    while (frontier.length && reached < 0) {
      const next: number[] = [];
      for (const i of frontier) for (const l of s.linesAt[i]) {
        const j = other(l, i);
        if (s.external[j] || via.has(j)) continue;
        via.set(j, l); next.push(j);
        if (to.has(j)) { reached = j; break; }
      }
      frontier = next;
    }
    if (reached < 0) continue;
    const path = [reached];
    for (let i = reached; via.get(i)! >= 0; ) { i = other(via.get(i)!, i); path.push(i); }
    paths.push(path.reverse());
  }
  return paths;
}

/** The lines of every exchange path. */
export function exchangeSpine(s: Structure): number[] {
  const lineBetween = (a: number, b: number) => s.linesAt[a].find((l) => s.lines[l].a === b || s.lines[l].b === b)!;
  return [...new Set(s.spines.flatMap((path) => path.slice(1).map((v, k) => lineBetween(path[k], v))))];
}

/**
 * Steps from the incoming legs. Incoming legs are 0; every other point is one step after
 * the nearest earlier point; outgoing legs come one step after their vertex.
 */
function orderInTime(d: Diagram, ids: string[], lines: Line[], linesAt: number[][], external: boolean[], fixed = new Map<number, number>(), field: boolean[] = []): number[] {
  const role = (i: number) => d.vertices.get(ids[i])!.role;
  const other = (line: number, i: number) => (lines[line].a === i ? lines[line].b : lines[line].a);
  const time = ids.map(() => Infinity);
  // the legs marked incoming, when any are (a leg left loose, a stop whose end is joined only
  // by a hidden line, goes out); otherwise every leg not marked outgoing
  // (an external field is neither: it happens when the point it acts at does)
  const marked = ids.map((_, i) => i).filter((i) => external[i] && role(i) === "in" && !field[i]);
  let frontier = marked.length ? marked : ids.map((_, i) => i).filter((i) => external[i] && role(i) !== "out" && !field[i]);
  // with no incoming legs declared (a decay written loosely), start from the first leg
  if (frontier.length === 0) frontier = [ids.findIndex((_, i) => external[i])];
  for (const i of frontier) time[i] = 0;
  for (const [i, t] of fixed) time[i] = t;
  // step outwards one moment at a time; points given a time are reached when their moment comes
  for (let now = 0; frontier.length || [...fixed.values()].some((t) => t > now); now++) {
    const next: number[] = [...fixed].filter(([, t]) => t === now + 1).map(([i]) => i);
    for (const i of frontier) for (const line of linesAt[i]) {
      const j = other(line, i);
      if (time[j] !== Infinity) continue;
      if ((external[j] && role(j) === "in") || field[j]) continue;
      time[j] = time[i] + 1;
      next.push(j);
    }
    frontier = next;
  }
  // what the incoming legs never reach (a quark pair from the vacuum) happens at the end:
  // its outgoing legs last, the rest a moment before
  const latest = Math.max(1, ...time.filter((t) => t !== Infinity));
  const done = time.map((t, i) => (t !== Infinity ? t : field[i] ? Infinity : external[i] && role(i) === "out" ? latest : latest - 1));
  return done.map((t, i) => (field[i] ? done[other(linesAt[i][0], i)] : t));
}

/** The points reached through a line, walking away from point `from` without coming back. */
export function beyond(s: Structure, line: number, from: number): number[] {
  const start = s.lines[line].a === from ? s.lines[line].b : s.lines[line].a;
  const seen = new Set([from, start]);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    for (const l of s.linesAt[i]) {
      const j = s.lines[l].a === i ? s.lines[l].b : s.lines[l].a;
      if (!seen.has(j)) { seen.add(j); stack.push(j); }
    }
  }
  seen.delete(from);
  return [...seen];
}

/** The quark pairs made from the vacuum, and the partner quark beside each half of a pair. */
function vacuumPairs(s: Structure, d: Diagram): VacuumPair[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const hadronOf = new Map<number, Structure["hadrons"][number]>();
  for (const h of s.hadrons) if (h.outgoing) for (const leg of h.legs) hadronOf.set(leg, h);
  const pairs: VacuumPair[] = [];
  s.ids.forEach((_, v) => {
    // the pair's two quark lines, and at most one line (a gluon) that makes it
    const ls = s.linesAt[v].filter((l) => s.lines[l].fermion);
    const makers = s.linesAt[v].filter((l) => !s.lines[l].fermion);
    if (s.external[v] || ls.length !== 2 || makers.length > 1 || makers.some((l) => d.edges[l].style.line !== "coil")) return;
    const ends = ls.map((l) => other(l, v)) as [number, number];
    const [h1, h2] = ends.map((e) => hadronOf.get(e));
    if (!h1 || !h2) return;
    // a whole meson from the vacuum has no partners beside it
    const partners = h1 === h2 ? [] : ends.flatMap((e, k) => {
      const h = [h1, h2][k];
      if (h.legs.length !== 2) return [];
      const leg = h.legs.find((i) => i !== e)!;
      const line = s.linesAt[leg][0];
      return line === undefined ? [] : [{ line, from: other(line, leg), leg }];
    });
    pairs.push({ at: v, ends, lines: [ls[0], ls[1]], partners, curved: ls.some((l) => !!d.edges[l].bend) });
  });
  return pairs;
}

/**
 * The closed loops: one for each line that closes a ring (a line between two points already
 * joined some other way), found as that line plus the path joining its ends.
 */
function findLoops(s: Structure): Loop[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  // a tree through every point, walked out from each unvisited point
  const via = s.ids.map(() => -1), depth = s.ids.map(() => -1), inTree = new Set<number>();
  for (let root = 0; root < s.ids.length; root++) {
    if (depth[root] >= 0) continue;
    depth[root] = 0;
    const queue = [root];
    while (queue.length) {
      const i = queue.shift()!;
      for (const l of s.linesAt[i]) {
        const j = other(l, i);
        if (depth[j] >= 0) continue;
        depth[j] = depth[i] + 1; via[j] = l; inTree.add(l); queue.push(j);
      }
    }
  }
  const loops: Loop[] = [];
  s.lines.forEach((line, closing) => {
    if (inTree.has(closing) || line.a === line.b) return;
    // climb from both ends to where their tree paths meet
    let a = line.a, b = line.b;
    const fromA: number[] = [a], fromB: number[] = [b], linesA: number[] = [], linesB: number[] = [];
    while (a !== b) {
      if (depth[a] >= depth[b]) { linesA.push(via[a]); a = other(via[a], a); fromA.push(a); }
      else { linesB.push(via[b]); b = other(via[b], b); fromB.push(b); }
    }
    let points = [...fromA, ...fromB.slice(0, -1).reverse()];
    let lines = [...linesA, ...linesB.reverse(), closing];
    // (the shortest loop through the closing line, if shorter and not one already found: a box
    // with a rung across it is two squares, not a hexagon and a square)
    const shortest = shortestLoopThrough(s, closing);
    const key = (ls: number[]) => [...ls].sort((x, y) => x - y).join(" ");
    if (shortest && shortest.lines.length < lines.length && !loops.some((loop) => key(loop.lines) === key(shortest.lines))) ({ points, lines } = shortest);
    loops.push(arcOver(s, { points, lines }));
  });
  // (a loop that shares a line with another, a rung across a box or a box against a triangle,
  // is a polygon, not an arc over a line)
  return loops.map((loop) => (loop.run && loop.lines.some((l) => loops.some((o) => o !== loop && o.lines.includes(l))) ? { points: loop.points, lines: loop.lines } : loop));
}

/** The shortest loop through one line: the shortest path between its ends that does not use it. */
function shortestLoopThrough(s: Structure, closing: number): { points: number[]; lines: number[] } | undefined {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const { a, b } = s.lines[closing];
  const via = new Map<number, number>([[a, -1]]);
  const queue = [a];
  while (queue.length && !via.has(b)) {
    const i = queue.shift()!;
    for (const l of s.linesAt[i]) {
      if (l === closing) continue;
      const j = other(l, i);
      if (via.has(j)) continue;
      via.set(j, l); queue.push(j);
    }
  }
  if (!via.has(b)) return undefined;
  const points = [b], lines: number[] = [];
  for (let i = b; via.get(i)! >= 0; ) { const l = via.get(i)!; lines.push(l); i = other(l, i); points.push(i); }
  // points run from b back to a; the closing line joins a to b
  points.reverse(); lines.reverse();
  return { points, lines: [...lines, closing] };
}

/** Name the run and the arc of a loop that is a stretch of fermion line closed by bosons. */
function arcOver(s: Structure, loop: Loop): Loop {
  const n = loop.lines.length;
  const fermion = loop.lines.map((l) => s.lines[l].fermion);
  // exactly one unbroken block of fermion lines round the loop, and at least one boson
  const starts = fermion.map((f, k) => f && !fermion[(k + n - 1) % n]).filter(Boolean).length;
  if (starts !== 1 || fermion.every(Boolean)) return loop;
  // turn the loop so the fermion block comes first: lines[k] joins points[k] and points[k+1]
  const first = fermion.findIndex((f, k) => f && !fermion[(k + n - 1) % n]);
  const points = loop.points.map((_, k) => loop.points[(k + first) % n]);
  const lines = loop.lines.map((_, k) => loop.lines[(k + first) % n]);
  const length = fermion.filter(Boolean).length;
  const run = points.slice(0, length + 1);
  // the fermion line goes on beyond the loop at both ends of the run
  const goesOn = (i: number) => s.linesAt[i].some((l) => s.lines[l].fermion && !lines.includes(l));
  if (!goesOn(run[0]) || !goesOn(run[run.length - 1])) return loop;
  return { points, lines, run, path: [...points.slice(length), points[0]], pathLines: lines.slice(length) };
}

/**
 * A line given off as radiation: one the author marked so, or an outgoing gluon leg (a gluon
 * off a quark is drawn as radiation; a W, Z or photon off it as an exchange, as papers do).
 */
export function isRadiation(d: Diagram, e: Diagram["edges"][number]): boolean {
  if (e.radiation) return true;
  if (e.style.line !== "coil") return false;
  const ends = [d.vertices.get(e.from)!, d.vertices.get(e.to)!];
  const degree = (id: string) => d.edges.filter((x) => x.from === id || x.to === id).length;
  return ends.some((v) => degree(v.id) === 1 && v.role !== "in");
}

/**
 * Where a point's radiation runs on to: the point gives off radiation from an incoming quark
 * (three lines: the quark coming in, the radiation, the quark going on), and the quark going
 * on annihilates at the next point with the other incoming quark into one boson that decays. Otherwise
 * nothing: a quark that scatters on out of the diagram (q g -> q g) is an exchange.
 */
export function radiationTarget(d: Diagram, id: string): string | undefined {
  const at = (v: string) => d.edges.filter((e) => e.from === v || e.to === v);
  const far = (e: Diagram["edges"][number], v: string) => (e.from === v ? e.to : e.from);
  const fermion = (e: Diagram["edges"][number]) => e.style.line === "plain" && e.style.cls !== "susy";
  const incomingLeg = (e: Diagram["edges"][number], v: string) => d.vertices.get(far(e, v))!.role === "in" && at(far(e, v)).length === 1 && fermion(e);
  const here = at(id);
  if (here.length !== 3 || !here.some((e) => isRadiation(d, e))) return undefined;
  const leg = here.find((e) => incomingLeg(e, id));
  const on = here.find((e) => e !== leg && fermion(e) && !isRadiation(d, e) && at(far(e, id)).length > 1);
  if (!leg || !on) return undefined;
  const w = far(on, id), there = at(w);
  // (the boson they make goes on to decay: it is the hard process, q qbar -> Z' -> chi chibar,
  // not a second gluon of q qbar -> g g)
  if (there.length !== 3 || !there.some((e) => e !== on && incomingLeg(e, w)) || !there.some((e) => !fermion(e) && at(far(e, w)).length > 1)) return undefined;
  return w;
}
