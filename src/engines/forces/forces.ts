import type { ForceRules } from "../../theme.ts";
import { beyond, exchangeSpine } from "./structure.ts";
import type { Tie } from "./solve.ts";
import type { Loop, Structure } from "./structure.ts";
import * as portable from "../../geometry/portable-math.ts";

/**
 * The forces of layout v2. Each is a sum of small terms, every term an energy over a few
 * points of the positions `p` (x0, y0, x1, y1, ...), smallest when the diagram looks right.
 * The layout is the balance of all of them. Keeping terms small lets the solver re-evaluate
 * only the terms that touch a point when it moves that point.
 */
export interface Term {
  /** the points this term depends on */
  points: number[];
  energy: (p: Float64Array) => number;
  /** zero until a limit is crossed (a margin, an angle): while it is zero it pulls on nothing */
  oneSided?: boolean;
  /**
   * For a one-sided term: how far it is from its limit at least, as a distance its points
   * must close between them (each point moving d closes it by at most 2d). While that is
   * positive the term is zero, so the solver need not measure it until things move that far.
   */
  clear?: (p: Float64Array) => number;
}

export interface Force {
  name: string;
  terms: Term[];
}

const term = (points: number[], energy: (p: Float64Array) => number): Term => ({ points: [...new Set(points)], energy });
/** A term that is zero until a limit is crossed, so the solver can skip it while it is zero. */
const limit = (points: number[], energy: (p: Float64Array) => number, clear?: (p: Float64Array) => number): Term => ({ points: [...new Set(points)], energy, oneSided: true, clear });

const dx = (p: Float64Array, a: number, b: number) => p[2 * b] - p[2 * a];
const dy = (p: Float64Array, a: number, b: number) => p[2 * b + 1] - p[2 * a + 1];

/**
 * Every line pulls towards its natural length: legs one length, propagators another. A
 * point where just two lines meet (a mass insertion, the dot where two neutrino lines join)
 * splits one line in two, so each half is half as long.
 */
export function lineLength(s: Structure, rules: ForceRules): Force {
  const splitsALine = (i: number) => !s.external[i] && s.linesAt[i].length === 2;
  // (a quark radiating on its way into the collision is one leg, the gluon sprouting part way
  // along: the stretches either side of the gluon share the leg's length)
  const radiating = radiationIntoBlob(s);
  const radiationHalves = (line: Structure["lines"][number]) =>
    radiating.filter(([a, v, b]) => (line.a === v && (line.b === a || line.b === b)) || (line.b === v && (line.a === a || line.a === b))).length;
  const generation = decayGenerations(s);
  const onPolygon = new Set(s.loops.filter((loop) => !loop.run).flatMap((loop) => loop.points));
  const leavesLoopForPlane = (line: Structure["lines"][number]) =>
    [line.a, line.b].some((i) => s.external[i] && s.time[i] > 0) && [line.a, line.b].some((i) => onPolygon.has(i));
  // a polygon loop is one thing, not a cascade: it is drawn full size wherever it comes (two
  // triangles in one diagram match)
  // (but a loop a SUSY particle decays through, the triangle of stop -> c neutralino, shrinks
  // with its stage as the decays round it do; the two triangles of gg -> H -> gamma gamma
  // still match, full size)
  const loopStage = new Map<number, number>();
  for (const loop of s.loops) if (!loop.run) {
    const fedByHeavy = loop.points.some((i) => s.linesAt[i].some((l) => s.lines[l].heavy && !loop.lines.includes(l)));
    // (one stage deeper than the particle that feeds it: the stop's own line is full length)
    const stage = fedByHeavy ? Math.min(...loop.points.map((i) => generation[i])) + 1 : 0;
    for (const l of loop.lines) loopStage.set(l, stage);
  }
  const capped = new Set(s.hadrons.filter((h) => h.cap && h.legs.length === 2).flatMap((h) => h.legs));
  // (between two points along one boson exchange that each give something off forward, the
  // bosons scattering with a Higgs between them, the stretch is short: the fan carries the room)
  const ahead = exchangePointsAhead(s);
  const between = (line: Structure["lines"][number]) => ahead.has(line.a) && ahead.has(line.b) && !line.heavy;
  // (and when several give something off, the bosons into the run from the beams are shorter too)
  // (not along a heavy exchange: a SUSY cascade keeps its spine full length)
  const runs = s.spines.map((path) => path.filter((v) => ahead.has(v))).filter((pts) => pts.length >= 2 && !heavyRun(s, pts));
  // (what a shower makes is long-lived and fans wide: drawn full length and more, not shrunk as a
  // later generation)
  const showerLines = new Set(showerPoints(s).flatMap(({ at, made }) => made.map((j) => s.linesAt[at].find((l) => s.lines[l].a === j || s.lines[l].b === j)!)));
  const inRun = new Set(runs.flat());
  const intoRun = (line: Structure["lines"][number]) => !line.leg && !between(line) && (inRun.has(line.a) || inRun.has(line.b));
  return {
    name: "length",
    // (a line straight from an incoming leg to an outgoing one, a spectator quark, takes its
    // length from what is either side of it)
    // (nor, in a hadron diagram, does a final state leaving a loop: it reaches the final plane
    // from wherever the loop's shape puts it)
    // (but a line on its own, a key of line styles, is one standard length)
    terms: s.lines.filter((line) => !(s.external[line.a] && s.external[line.b] && s.hadrons.length > 0) && !(s.hadrons.length > 0 && leavesLoopForPlane(line))).map((line) => {
      const halves = (splitsALine(line.a) ? 1 : 0) + (splitsALine(line.b) ? 1 : 0) + radiationHalves(line);
      // each generation of decay is drawn a little smaller than the one before
      const start = s.time[line.a] <= s.time[line.b] ? line.a : line.b;
      // (an outgoing leg stops shrinking sooner than a propagator: a decay's products need room
      // for their labels, while the particle that decays can be short)
      // (a SUSY propagator shrinks more slowly: the neutralino between two decays stays a
      // little longer, as papers draw a cascade's spine)
      const depth = loopStage.get(s.lines.indexOf(line)) ?? generation[start];
      const shower = showerLines.has(s.lines.indexOf(line));
      const stage = shower ? 1.35 : Math.max(line.leg ? rules.smallestLegStage : rules.smallestStage, portable.power(rules.stageShrink, line.heavy && !line.leg ? depth * 0.75 : depth));
      // a beam into a blob (the pp collision) is drawn short
      // (quarks into a contact blob are ordinary legs: only beams, protons or ions, are short)
      const beam = (i: number) => !s.particle[i] || !s.lines[s.linesAt[i][0]].fermion;
      const intoBlob = line.leg && (s.blob[line.a] || s.blob[line.b]) && [line.a, line.b].some((i) => s.time[i] === 0 && s.external[i] && beam(i));
      // (a leg into a loop's corner is short: the loop is what the diagram shows)
      const intoLoop = line.leg && (onPolygon.has(line.a) || onPolygon.has(line.b));
      // (a line leaving a blob shows only from the blob's rim, so it is drawn that much longer)
      // (and longer still by however much more than a blob is drawn there: a nucleus)
      const rim = intoBlob
        ? [line.a, line.b].reduce((sum, i) => sum + Math.max(0, s.markRadius[i] - s.blobRadius), 0)
        : s.markRadius[line.a] + s.markRadius[line.b];
      // (the fermion a decay gives off beside a boson that decays on, the b of t -> b W, is short)
      const givenOff = line.leg && line.fermion && !line.heavy && givesOffFermion(s, start);
      // (and the fermion a SUSY particle gives off that decays on, the stop's top, is a short line,
      // held firmly: its decay goes beside the neutralino, not far out along it)
      // (a massive fermion only: a gaugino's W or Z, a dark scalar, keep their lengths)
      const fromSusy = !line.leg && !line.heavy && line.fermion && line.mass === "massive" && s.linesAt[start].some((l) => s.lines[l].heavy && s.time[s.lines[l].a === start ? s.lines[l].b : s.lines[l].a] < s.time[start])
        && s.linesAt[start].some((l) => l !== s.lines.indexOf(line) && s.lines[l].heavy && s.time[s.lines[l].a === start ? s.lines[l].b : s.lines[l].a] > s.time[start]);
      // (a line given its own length, `length=1.5`, is that much longer than it would be)
      const want = (line.stretch ?? 1) * (line.leg ? rules.legLength * (intoLoop ? rules.loopLeg : 1) * (givenOff ? rules.givenOffLength : 1) : rules.lineLength * (fromSusy ? rules.susyProductLength : 1)) * (halves ? 0.5 : 1) * stage * (intoBlob ? rules.blobBeamLength : 1) * (between(line) ? 0.5 : intoRun(line) ? 0.7 : 1) + rim;
      // (an outgoing leg gives way first: when the final states end level, the leg with less
      // far to go grows to meet them, not the propagator that brought it)
      const stiffness = rules.length * (line.leg && !intoBlob ? rules.legGive : 1) * (fromSusy ? rules.susyProductHold : 1);
      // (a quark line under a cap is as long as running beside the cap's other quark makes
      // it: only not shorter than usual)
      if (line.leg && (capped.has(line.a) || capped.has(line.b))) {
        return limit([line.a, line.b], (p) => { const short = want - portable.hypot(dx(p, line.a, line.b), dy(p, line.a, line.b)); return short > 0 ? stiffness * portable.square(short) : 0; });
      }
      return term([line.a, line.b], (p) => stiffness * portable.square(portable.hypot(dx(p, line.a, line.b), dy(p, line.a, line.b)) - want));
    }),
  };
}

/**
 * How many decays deep each point is: 0 at the collision, one more at each vertex where a
 * single particle falls apart (a top, then its W, then ...).
 */
export function decayGenerations(s: Structure): number[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const order = s.ids.map((_, i) => i).sort((a, b) => s.time[a] - s.time[b]);
  const generation = s.ids.map(() => 0);
  for (const i of order) {
    const before = s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
    if (before.length === 0) continue;
    const parent = Math.max(...before.map((j) => generation[j]));
    // (a resonance made where incoming particles meet, the G of g g -> G -> t tbar, falls apart
    // at the collision: its products are drawn as long as what came in, an s-channel X)
    const madeByIncoming = (j: number) => s.linesAt[j].map((l) => other(l, j)).filter((k) => s.time[k] < s.time[j]).every((k) => s.external[k]) && s.time[j] === 1;
    const isDecay = !s.external[i] && before.length === 1 && !s.external[before[0]] && !madeByIncoming(before[0]);
    generation[i] = parent + (isDecay ? 1 : 0);
  }
  return generation;
}

/**
 * The lines at a vertex split the turn evenly between them, except where a moving particle
 * decays: its products travel on together, so there the other forces decide.
 */
export function evenAngles(s: Structure, rules: ForceRules): Force {
  // (where a heavy particle decays to another heavy one, the even split stays: its light
  // product leaves at a wide angle)
  const heavyDecay = (v: number) => s.linesAt[v].filter((l) => s.lines[l].heavy).length >= 2;
  // (but where its light product is a fermion, a tau or a quark, it goes forward instead)
  const lightFermion = (v: number) => s.linesAt[v].some((l) => !s.lines[l].heavy && s.lines[l].fermion);
  const boosted = new Set(movingDecays(s).map((decay) => decay.at).filter((v) => !heavyDecay(v) || lightFermion(v)));
  // (nor where a SUSY particle ends its chain in ordinary particles alone: they go its way)
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const near = s.linesAt[v].map((l) => [l, s.lines[l].a === v ? s.lines[l].b : s.lines[l].a] as const);
    const into = near.filter(([, j]) => s.time[j] < s.time[v]), made = near.filter(([, j]) => s.time[j] > s.time[v]);
    if (into.length === 1 && s.lines[into[0][0]].heavy && made.length >= 2 && made.every(([l]) => !s.lines[l].heavy)) boosted.add(v);
  });
  // (a loop's shape sets the angles at its own points)
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  // (nor a point whose two lines both end outside, a quark pair from the vacuum: that is a V, not a line)
  const vacuumV = (i: number) => s.linesAt[i].length === 2 && s.linesAt[i].every((l) => s.external[s.lines[l].a === i ? s.lines[l].b : s.lines[l].a]);
  const vertices = s.ids.map((_, i) => i).filter((i) => s.linesAt[i].length >= 2 && !boosted.has(i) && !onLoop.has(i) && !vacuumV(i));
  // where a fermion line passes straight through, the even split gives way to it
  const passing = new Set(passThroughs(s).map(([, v]) => v));
  // (a pair that leaves a contact vertex together counts as one line: the rest split round it)
  const bundled = new Map(pairsLeavingTogether(s).map(({ at, legs }) => [at, legs]));
  return {
    name: "even angles",
    terms: vertices.map((v) => {
      // (and the line it leaves from runs on straight through, as a pass-through does)
      const pair = bundled.get(v);
      const ends = s.linesAt[v].map((l) => (s.lines[l].a === v ? s.lines[l].b : s.lines[l].a)).filter((j) => !pair?.includes(j));
      const weight = rules.evenAngles * (passing.has(v) || pair ? rules.passThroughEvenness : 1);
      // (worked in place: this term is measured very often)
      const n = ends.length + (pair ? 1 : 0), angle = new Float64Array(n);
      const even = (2 * Math.PI) / n;
      const direction = (p: Float64Array, i: number) => {
        if (i < ends.length) return portable.atan2(dy(p, v, ends[i]), dx(p, v, ends[i]));
        let mx = 0, my = 0;
        for (const j of pair!) { const n = portable.hypot(dx(p, v, j), dy(p, v, j)) || 1; mx += dx(p, v, j) / n; my += dy(p, v, j) / n; }
        return portable.atan2(my, mx);
      };
      return term([v, ...ends, ...(pair ?? [])], (p) => {
        // the lines' directions, sorted round the vertex
        for (let i = 0; i < n; i++) {
          const a = direction(p, i);
          let j = i;
          while (j > 0 && angle[j - 1] > a) { angle[j] = angle[j - 1]; j--; }
          angle[j] = a;
        }
        let e = 0;
        for (let i = 0; i < n; i++) {
          const gap = i + 1 < n ? angle[i + 1] - angle[i] : angle[0] + 2 * Math.PI - angle[i];
          e += portable.square(gap - even);
        }
        return weight * e;
      });
    }),
  };
}

/**
 * Lines run with time, left to right: a line between two moments prefers to point forward.
 * The pull is strong in a short diagram, so a scatter reads cleanly, and fades in a long
 * one, so a cascade is free to arc.
 */
export function timeFlow(s: Structure, rules: ForceRules): Force {
  const outsideTime = loopLinesOutsideTime(s);
  const timed = s.lines.filter((line, l) => s.time[line.a] !== s.time[line.b] && !outsideTime.has(l));
  const weight = flowWeight(s, rules);
  const heavyAhead = heavyDecaysAhead(s);
  // a boson given off in the decay of a moving particle (the W of t -> b W) is emitted to the
  // side of the fermion that carries on: it feels part of the pull (emittedFlow)
  const movingDecay = new Set(movingDecays(s).map((decay) => decay.at));
  const deeper = deeperBranches(s);
  return {
    name: "time flow",
    terms: timed.map((line) => {
      const [early, late] = s.time[line.a] < s.time[line.b] ? [line.a, line.b] : [line.b, line.a];
      // an intermediate boson that decays is likely off-shell: freer to swing wide
      // (the fermion given off beside it, the b of t -> b W, feels none: givenOffSideways sets its way)
      const emitted = !line.leg && !line.fermion && !line.heavy && !s.external[late] && movingDecay.has(early);
      const givenOff = line.leg && line.fermion && !line.heavy && movingDecay.has(early) && givesOffFermion(s, early);
      const offShell = !line.leg && !line.fermion && !line.heavy && !s.external[late] && !emitted;
      // a heavy particle keeps the heading it was made with (it deflects less), so time does not level it
      // a heavy particle mostly keeps its heading (only a little of the pull), except the last
      // of a chain, which settles level
      // (a heavy line with more of its cascade still ahead feels less of the pull: a deep
      // cascade opens wider at the collision, a short one stays forward)
      // (beams into a blob feel little of it, so they open wide)
      const intoBlob = s.time[early] === 0 && s.blob[late];
      const w = weight * (line.heavy && !line.leg ? rules.heavyFlow / portable.power(Math.max(1, heavyAhead[late]), rules.depthEase) : offShell ? rules.offShellFlow : emitted ? rules.emittedFlow : givenOff ? rules.givenOffFlow : intoBlob ? rules.blobBeamFlow : 1)
        // of two branches made together, the one with more decays ahead keeps nearer level,
        // giving its longer cascade the room (the tbar of tbar -> W bbar, W -> l nu beside a t -> gamma q)
        * (deeper.has(late) ? rules.deeperFlow : 1);
      return term([early, late], (p) => {
        const x = dx(p, early, late), y = dy(p, early, late);
        return w * (1 - x / (portable.hypot(x, y) || 1));
      });
    }),
  };
}

/**
 * A decay into one outgoing fermion and one boson that decays on (t -> b W, then W -> l nu):
 * the boson carries the decay on, and the fermion is given off to the side, as papers draw the
 * b of a top.
 */
export function givesOffFermion(s: Structure, at: number): boolean {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  // (only a fermion made in the collision that decays to another flavour, t -> b: in a hadron
  // diagram the quarks run with their hadrons, and a loop's corners are the loop's to set)
  if (s.hadrons.length || s.loops.some((loop) => loop.points.includes(at))) return false;
  const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
  if (into.length !== 1 || !s.lines[into[0]].fermion || s.lines[into[0]].heavy || s.external[other(into[0], at)]) return false;
  const made = s.linesAt[at].filter((l) => s.time[other(l, at)] > s.time[at]);
  if (made.length !== 2) return false;
  if (made.some((l) => s.lines[l].fermion && s.lineLabel[l] !== undefined && s.lineLabel[l] === s.lineLabel[into[0]])) return false;
  // (a massive fermion only, the top or a new heavy one (N, T): a light fermion's line, nu -> mu W*,
  // gives off a virtual boson and keeps its own run; whichever fermion it gives off, b or lepton)
  if (s.lines[into[0]].mass !== "massive") return false;
  const fermion = made.find((l) => s.lines[l].leg && s.lines[l].fermion && !s.lines[l].heavy);
  const boson = made.find((l) => !s.lines[l].leg && !s.lines[l].fermion && !s.lines[l].heavy && !s.external[other(l, at)]);
  // (the boson real, the fermion heavier than it: it carries the decay on. An off-shell boson
  // from a real fermion, N -> l W*, leaves the fermion to carry on instead; where the fermion is
  // off-shell too, t* -> b W*, the whole chain is virtual and drawn as a top's)
  if (boson !== undefined && s.lines[boson].offShell && !s.lines[into[0]].offShell) return false;
  return fermion !== undefined && boson !== undefined;
}

/**
 * Which way is outside for a top decaying at `at` (in the drawing's y, -1 up, +1 down), or 0
 * where it has none: the way the top heads, up or down; a top running level, the side of the
 * beams it lies on (0 when level with them, a single top that is the diagram's middle).
 */
export function topOutside(s: Structure, p: Float64Array, from: number, at: number): number {
  const hx = p[2 * at] - p[2 * from], hy = p[2 * at + 1] - p[2 * from + 1];
  if (Math.abs(hy) > 0.15 * portable.hypot(hx, hy)) return Math.sign(hy);
  const beams = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  if (!beams.length) return 0;
  const middle = beams.reduce((sum, i) => sum + p[2 * i + 1], 0) / beams.length;
  const off = p[2 * at + 1] - middle;
  return Math.abs(off) < 0.25 ? 0 : Math.sign(off);
}

/**
 * Points that begin the deeper of the branches leaving one vertex: more decays still ahead of
 * them than of any branch made alongside them.
 */
export function deeperBranches(s: Structure): Set<number> {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const later = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] > s.time[i]);
  // the longest run of decays ahead of each point (0 for an outgoing leg)
  const ahead = s.ids.map(() => 0);
  for (const i of s.ids.map((_, k) => k).sort((a, b) => s.time[b] - s.time[a])) {
    if (s.external[i]) continue;
    ahead[i] = 1 + Math.max(0, ...later(i).map((j) => ahead[j]));
  }
  const deeper = new Set<number>();
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const branches = later(v);
    if (branches.length < 2) return;
    const most = Math.max(...branches.map((j) => ahead[j]));
    const holders = branches.filter((j) => ahead[j] === most);
    if (holders.length === 1 && most > 0) deeper.add(holders[0]);
  });
  return deeper;
}

/**
 * For each point, how many decays of a heavy particle into another heavy one lie ahead of it
 * along its chain, counting a decay at the point itself (0 off any chain).
 */
export function heavyDecaysAhead(s: Structure): number[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const ahead = s.ids.map(() => 0);
  const order = s.ids.map((_, i) => i).sort((a, b) => s.time[b] - s.time[a]);
  for (const v of order) {
    if (s.external[v]) continue;
    const before = s.linesAt[v].filter((l) => s.time[other(l, v)] < s.time[v]);
    const after = s.linesAt[v].filter((l) => s.time[other(l, v)] > s.time[v] && s.lines[l].heavy);
    if (before.length === 1 && s.lines[before[0]].heavy && after.length === 1) ahead[v] = 1 + ahead[other(after[0], v)];
  }
  return ahead;
}

/** The time-flow weight for a diagram of this length: full up to a short diagram, then fading. */
export function flowWeight(s: Structure, rules: ForceRules): number {
  const steps = Math.max(...s.time);
  const extra = Math.max(0, steps - rules.shortDiagram);
  return Math.max(rules.longFlow, rules.timeFlow * portable.power(rules.flowFade, extra));
}

/**
 * What happens later is drawn further right, and no line leans further than a set angle
 * from the way time runs: a firm penalty past that angle (and for any line running backwards).
 */
export function timeOrder(s: Structure, rules: ForceRules): Force {
  const outsideTime = loopLinesOutsideTime(s);
  const timed = s.lines.filter((line, l) => s.time[line.a] !== s.time[line.b] && !outsideTime.has(l));
  const least = portable.cos((rules.maxLean * Math.PI) / 180);
  // the light product of a heavy particle decaying to another heavy one may lean further
  const heavyDecay = (v: number) => !s.external[v] && s.linesAt[v].filter((l) => s.lines[l].heavy).length >= 2;
  const wide = portable.cos((rules.wideLean * Math.PI) / 180);
  const fermionLean = portable.cos((rules.lightFermionLean * Math.PI) / 180);
  const upright = portable.cos((88 * Math.PI) / 180);
  // (what a shower makes, four or more that each decay, fans wide: see showerFan)
  const showers = new Map(showerPoints(s).map(({ at, made }) => [at, portable.cos(((showerSpread(made.length) + 12) * Math.PI) / 180)]));
  return {
    name: "time order",
    terms: timed.map((line) => {
      const [early, late] = s.time[line.a] < s.time[line.b] ? [line.a, line.b] : [line.b, line.a];
      return limit([early, late], (p) => {
        const x = dx(p, early, late), y = dy(p, early, late);
        // (a light fermion from a heavy decay goes forward, a light boson may swing wide)
        // (and the fermion a decay gives off beside a boson that decays on, the b of t -> b W, as wide)
        const allowed = showers.get(early) ?? (heavyDecay(early) && !line.heavy ? (line.fermion ? fermionLean : wide)
          : line.leg && line.fermion && givesOffFermion(s, early) ? upright : least);
        const shortfall = allowed - x / (portable.hypot(x, y) || 1);
        return shortfall > 0 ? rules.timeOrder * portable.square(shortfall) : 0;
      });
    }),
  };
}

const cross = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx;

/** True when segment a-b crosses segment c-d. */
export function segmentsCross(p: Float64Array, a: number, b: number, c: number, d: number): boolean {
  const side = (o: number, u: number, w: number) => cross(p[2 * u] - p[2 * o], p[2 * u + 1] - p[2 * o + 1], p[2 * w] - p[2 * o], p[2 * w + 1] - p[2 * o + 1]);
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
}

/** Distance from point q to segment a-b. */
function pointToSegment(p: Float64Array, q: number, a: number, b: number): number {
  const vx = p[2 * b] - p[2 * a], vy = p[2 * b + 1] - p[2 * a + 1];
  const wx = p[2 * q] - p[2 * a], wy = p[2 * q + 1] - p[2 * a + 1];
  const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / ((vx * vx + vy * vy) || 1)));
  return portable.hypot(wx - t * vx, wy - t * vy);
}

/**
 * Padding: every drawn element (a vertex dot, a leg's label, a line's label) keeps a margin
 * from every element and line it is not joined to; lines leave a vertex at a clear angle; and
 * lines do not cross.
 */
export function clearance(s: Structure, rules: ForceRules): Force {
  const inHadron = new Set(s.hadrons.flatMap((h) => h.legs));
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const joined = new Set(s.lines.map((line) => `${Math.min(line.a, line.b)} ${Math.max(line.a, line.b)}`));
  // (a line drawn as an arc over a loop's straight stretch is not where its chord is: the
  // straight line between its ends says nothing about what it is clear of)
  const curved = new Set(s.loops.flatMap((loop) => loop.pathLines ?? []));
  const straight = s.lines.map((_, l) => l).filter((l) => !curved.has(l));
  // (points along the straight stretch under an arc lie on its pieces by design)
  const runOf = new Map<number, number>();
  s.loops.forEach((loop, k) => loop.run?.forEach((i) => runOf.set(i, k)));
  const alongOneRun = (i: number, l: number) => runOf.has(i) && runOf.get(i) === runOf.get(s.lines[l].a) && runOf.get(i) === runOf.get(s.lines[l].b);
  // the element at a point: a vertex dot at the point, or a leg's label just beyond its end
  const attachedTo = s.ids.map((_, i) => (s.external[i] && s.linesAt[i].length === 1 ? other(s.linesAt[i][0], i) : -1));
  // (these write into the buffer given rather than return a new pair: they run very often)
  const elementAt = (p: Float64Array, i: number, out: Float64Array): Float64Array => {
    const from = attachedTo[i];
    if (from < 0 || s.pad[i] <= rules.vertexPad) { out[0] = p[2 * i]; out[1] = p[2 * i + 1]; return out; }
    const x = dx(p, from, i), y = dy(p, from, i), l = portable.hypot(x, y) || 1;
    out[0] = p[2 * i] + (x / l) * s.pad[i]; out[1] = p[2 * i + 1] + (y / l) * s.pad[i];
    return out;
  };
  const first = new Float64Array(2), second = new Float64Array(2);
  const reach = (i: number) => [i, ...(attachedTo[i] >= 0 ? [attachedTo[i]] : [])];
  const pairs: [number, number][] = [];
  for (let a = 0; a < s.ids.length; a++) for (let b = a + 1; b < s.ids.length; b++) if (!joined.has(`${a} ${b}`)) pairs.push([a, b]);
  // pairs of lines that share no point, which must not cross
  const apart: [number, number][] = [];
  s.lines.forEach((m, i) => s.lines.forEach((n, j) => {
    if (j > i && m.a !== n.a && m.a !== n.b && m.b !== n.a && m.b !== n.b && !curved.has(i) && !curved.has(j)) apart.push([i, j]);
  }));
  const distanceToLine = (q: Float64Array, p: Float64Array, a: number, b: number) => {
    const vx = p[2 * b] - p[2 * a], vy = p[2 * b + 1] - p[2 * a + 1], wx = q[0] - p[2 * a], wy = q[1] - p[2 * a + 1];
    const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / ((vx * vx + vy * vy) || 1)));
    return portable.hypot(wx - t * vx, wy - t * vy);
  };
  // a line's label sits beside it on the side the renderer will choose: a nearly level line
  // on the side facing the middle of the diagram (above, if it runs along the middle), a
  // slanting one on the side facing away from the centre; the author's label' flips it
  const internal = s.ids.map((_, i) => i).filter((i) => !s.external[i]);
  const loopOf = new Map<number, number[]>();
  for (const loop of s.loops) if (!loop.run) for (const l of loop.lines) loopOf.set(l, loop.points);
  const labelOf = (p: Float64Array, l: number, out: Float64Array): Float64Array => {
    const { a, b } = s.lines[l];
    const mx = (p[2 * a] + p[2 * b]) / 2, my = (p[2 * a + 1] + p[2 * b + 1]) / 2;
    const x = dx(p, a, b), y = dy(p, a, b), len = portable.hypot(x, y) || 1;
    let nx = -y / len, ny = x / len;
    let cx = 0, cy = 0;
    for (const i of internal) { cx += p[2 * i]; cy += p[2 * i + 1]; }
    cx /= Math.max(1, internal.length); cy /= Math.max(1, internal.length);
    let facing: number;
    const loop = loopOf.get(l);
    if (loop) {
      // a line on a closed loop is labelled outside it
      let lx = 0, ly = 0;
      for (const i of loop) { lx += p[2 * i]; ly += p[2 * i + 1]; }
      facing = (mx - lx / loop.length) * nx + (my - ly / loop.length) * ny;
    } else if (Math.abs(y / len) < 0.35) {
      const off = my - cy;
      facing = Math.abs(off) < 0.25 ? -ny : -off * ny; // above along the middle, else toward it
    } else facing = Math.abs(y / len) > 0.94 ? (mx - cx) * nx : (my - cy) * ny; // outside: away from the midline (across, if upright)
    // (the author's label' is the right of travel, as in TikZ)
    if ((s.labelFlip[l] === 1 && facing < 0) || s.labelFlip[l] === 2) { nx = -nx; ny = -ny; }
    out[0] = mx + nx * s.linePad[l]; out[1] = my + ny * s.linePad[l];
    return out;
  };
  const push = (shortfall: number) => (shortfall > 0 ? rules.clearance * portable.square(shortfall) : 0);
  const labelled = straight.filter((l) => s.linePad[l] > 0);
  // how clear a term is at least, from the points alone: an element lies within its pad of
  // its point, a line's label within its pad of the line's middle
  const apartBy = (ax: number, ay: number, bx: number, by: number) => portable.hypot(bx - ax, by - ay);
  const mid = (p: Float64Array, l: number, axis: 0 | 1) => (p[2 * s.lines[l].a + axis] + p[2 * s.lines[l].b + axis]) / 2;
  const centre = new Float64Array(2);
  const middleOf = (p: Float64Array, l: number) => { centre[0] = mid(p, l, 0); centre[1] = mid(p, l, 1); return centre; };
  const pointAt = (p: Float64Array, i: number) => { centre[0] = p[2 * i]; centre[1] = p[2 * i + 1]; return centre; };
  return {
    name: "clearance",
    terms: [
      // every element keeps the margin from every other it is not joined to
      ...pairs.map(([a, b]) => limit([...reach(a), ...reach(b)], (p) => {
        const u = elementAt(p, a, first), w = elementAt(p, b, second);
        return push(rules.margin + s.pad[a] + s.pad[b] - portable.hypot(w[0] - u[0], w[1] - u[1]));
      }, (p) => apartBy(p[2 * a], p[2 * a + 1], p[2 * b], p[2 * b + 1]) - rules.margin - 2 * s.pad[a] - 2 * s.pad[b])),
      // ...and from every line it does not touch
      ...s.ids.flatMap((_, i) => straight.map((l) => [i, l] as const).filter(([, l]) => !alongOneRun(i, l) && s.lines[l].a !== i && s.lines[l].b !== i && attachedTo[i] !== s.lines[l].a && attachedTo[i] !== s.lines[l].b))
        .map(([i, l]) => limit([...reach(i), s.lines[l].a, s.lines[l].b], (p) => push(rules.margin + s.pad[i] - distanceToLine(elementAt(p, i, first), p, s.lines[l].a, s.lines[l].b)),
          (p) => distanceToLine(pointAt(p, i), p, s.lines[l].a, s.lines[l].b) - rules.margin - 2 * s.pad[i])),
      // a line's label keeps the margin from elements and lines that are not its own
      // ...and from every other line's label
      ...labelled.flatMap((l, n) => labelled.slice(n + 1).map((k) => limit([s.lines[l].a, s.lines[l].b, s.lines[k].a, s.lines[k].b, ...internal], (p) => {
        const u = labelOf(p, l, first), w = labelOf(p, k, second);
        return push(rules.margin + s.linePad[l] + s.linePad[k] - portable.hypot(w[0] - u[0], w[1] - u[1]));
      }, (p) => apartBy(mid(p, l, 0), mid(p, l, 1), mid(p, k, 0), mid(p, k, 1)) - rules.margin - 2 * s.linePad[l] - 2 * s.linePad[k]))),
      ...labelled.flatMap((l) => [
        ...s.ids.map((_, i) => i).filter((i) => i !== s.lines[l].a && i !== s.lines[l].b).map((i) => limit([s.lines[l].a, s.lines[l].b, ...reach(i), ...internal], (p) => {
          const m = labelOf(p, l, first), e = elementAt(p, i, second);
          return push(rules.margin + s.linePad[l] + s.pad[i] - portable.hypot(e[0] - m[0], e[1] - m[1]));
        }, (p) => apartBy(mid(p, l, 0), mid(p, l, 1), p[2 * i], p[2 * i + 1]) - rules.margin - 2 * s.linePad[l] - 2 * s.pad[i])),
        ...straight.filter((k) => k !== l && ![s.lines[k].a, s.lines[k].b].some((e) => e === s.lines[l].a || e === s.lines[l].b))
          .map((k) => limit([s.lines[l].a, s.lines[l].b, s.lines[k].a, s.lines[k].b, ...internal], (p) => push(rules.margin + s.linePad[l] - distanceToLine(labelOf(p, l, first), p, s.lines[k].a, s.lines[k].b)),
            (p) => distanceToLine(middleOf(p, l), p, s.lines[k].a, s.lines[k].b) - rules.margin - 2 * s.linePad[l])),
      ]),
      // no two lines leave a vertex closer than the least angle (an arc leaves square to its stretch)
      ...s.ids.map((_, v) => v).filter((v) => s.linesAt[v].filter((l) => !curved.has(l)).length >= 2).map((v) => {
        const at = s.linesAt[v].filter((l) => !curved.has(l));
        const ends = at.map((l) => other(l, v));
        // (a wavy or coiled line is wide: beside one, the least angle is larger)
        const width = at.map((l) => (s.lines[l].wavy ? (rules.minAngle * 0.3 * Math.PI) / 180 : 0));
        // (a two-body decay into two final states, a W to l nu, a photon to f fbar, opens wider
        // than lines merely meeting: at least decayOpening between its two legs)
        // (whichever its products are: T -> Z t opens as wide as W -> l nu)
        // (not the decay of a SUSY particle: its chain carries on along its line, and the other
        // rules set where its light product leaves)
        const outLegs = ends.filter((j) => s.time[j] > s.time[v]);
        const parentHeavy = at.some((l) => s.time[other(l, v)] < s.time[v] && s.lines[l].heavy);
        // (nor where a product ends in a hadron: its quarks go where the hadron is)
        const twoBody = outLegs.length === 2 && ends.length === 3 && !parentHeavy && !outLegs.some((j) => inHadron.has(j));
        // (a SUSY particle's decay into its partner and a fermion that decays on, the stop's top and
        // neutralino, opens wide: the top's own decay then clears the neutralino with a short top,
        // where a narrow fork makes room only with a long one)
        const products = at.filter((l) => s.time[other(l, v)] > s.time[v]);
        const susyFork = !twoBody && parentHeavy && products.length === 2 && products.some((l) => s.lines[l].heavy)
          && products.some((l) => !s.lines[l].heavy && s.lines[l].fermion && s.lines[l].mass === "massive" && !s.external[other(l, v)]);
        const susyOpening = (rules.susyOpening * Math.PI) / 180;
        // (a particle made at rest, a resonance from the incoming particles, decays back to
        // back: papers draw a wide X, three quarters again as wide)
        const parentAtRest = twoBody && at.some((l) => { const j = other(l, v); return s.time[j] < s.time[v] && !s.external[j] && isAtRest(s, j); });
        // (and where both products decay on, R -> S H, half as wide again: their own decays need room)
        const bothDecay = twoBody && outLegs.every((j) => !s.external[j]);
        const least = (rules.minAngle * Math.PI) / 180, opening = ((parentAtRest ? 1.75 : bothDecay ? 1.5 : 1) * rules.decayOpening * Math.PI) / 180;
        return limit([v, ...ends], (p) => {
          const angles = ends.map((to, k) => [portable.atan2(dy(p, v, to), dx(p, v, to)), width[k]]).sort((a, b) => a[0] - b[0]);
          let e = 0;
          angles.forEach(([a, wa], i) => {
            const [b, wb] = angles[(i + 1) % angles.length];
            const gap = i + 1 < angles.length ? b - a : b + 2 * Math.PI - a;
            const need = least + wa + wb;
            if (gap < need) e += portable.square(need - gap);
          });
          if (susyFork) {
            const [j, k] = products.map((l) => other(l, v));
            const a = portable.atan2(dy(p, v, j), dx(p, v, j)), b = portable.atan2(dy(p, v, k), dx(p, v, k));
            let gap = Math.abs(a - b); if (gap > Math.PI) gap = 2 * Math.PI - gap;
            if (gap < susyOpening) e += portable.square(susyOpening - gap);
          }
          if (twoBody) {
            const [j, k] = outLegs;
            const a = portable.atan2(dy(p, v, j), dx(p, v, j)), b = portable.atan2(dy(p, v, k), dx(p, v, k));
            let gap = Math.abs(a - b); if (gap > Math.PI) gap = 2 * Math.PI - gap;
            if (gap < opening) e += portable.square(opening - gap);
          }
          // (firm: a few degrees short must cost more than the forces that push lines together)
          return rules.clearance * 4 * e;
        });
      }),
      // a crossing costs the distance its nearest end would have to move to undo it
      ...apart.map(([i, j]) => {
        const m = s.lines[i], n = s.lines[j];
        const nearest = (p: Float64Array) => Math.min(pointToSegment(p, m.a, n.a, n.b), pointToSegment(p, m.b, n.a, n.b),
          pointToSegment(p, n.a, m.a, m.b), pointToSegment(p, n.b, m.a, m.b));
        return limit([m.a, m.b, n.a, n.b], (p) => {
          if (!segmentsCross(p, m.a, m.b, n.a, n.b)) return 0;
          // grows smoothly from nothing, so the solver can always take a step
          return rules.clearance * portable.square(nearest(p));
        }, (p) => (segmentsCross(p, m.a, m.b, n.a, n.b) ? 0 : nearest(p)));
      }),
    ],
  };
}

/**
 * The exchange between two incoming particles stands upright: every line on the path from
 * the vertex where one enters to the vertex where the other enters (one gluon in a t-channel
 * scatter, both W's and the Higgs vertex between them in VBF). Off unless the theme gives
 * it a weight.
 */
/**
 * Points along a boson exchange between the beams that make something going on forward (the
 * H of vector-boson fusion): they sit a little ahead, the bosons into them leaning forward. A
 * quark line along an exchange stays straight.
 */
export function exchangePointsAhead(s: Structure): Set<number> {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  return new Set(s.spines.flatMap((path) => path.slice(1, -1).filter((v) => {
    const along = s.linesAt[v].filter((l) => path.includes(other(l, v)));
    return along.every((l) => !s.lines[l].fermion) && s.linesAt[v].some((l) => !path.includes(other(l, v)) && s.time[other(l, v)] > s.time[v]);
  })));
}

export function uprightExchange(s: Structure, rules: ForceRules): Force {
  const spine = exchangeSpine(s);
  // (a point that makes something going on forward sits a little ahead: the two lines into it
  // lean forward, 15 degrees, as the bosons carry some of the quarks' forward momentum)
  const ahead = exchangePointsAhead(s);
  const lean = portable.sin((15 * Math.PI) / 180);
  return {
    name: "upright exchange",
    terms: spine.map((l) => {
      const { a, b } = s.lines[l];
      const [end, middle] = ahead.has(b) && !ahead.has(a) ? [a, b] : ahead.has(a) && !ahead.has(b) ? [b, a] : [-1, -1];
      if (end >= 0) return term([end, middle], (p) => {
        const x = dx(p, end, middle), y = dy(p, end, middle);
        return rules.uprightExchange * 30 * portable.square(x / (portable.hypot(x, y) || 1) - lean);
      });
      return term([a, b], (p) => {
        const x = dx(p, a, b), y = dy(p, a, b);
        return rules.uprightExchange * portable.square(x / (portable.hypot(x, y) || 1));
      });
    }),
  };
}

/**
 * Several points along one exchange, each giving something off forward (bosons scattering, a
 * Higgs between them, a lepton pair from two photons): what they give off fans forward, the top one leaning up
 * and the bottom one down, evenly between, as the outer quarks do; so the points can sit close.
 */
export function exchangeFan(s: Structure, rules: ForceRules): Force {
  const ahead = exchangePointsAhead(s);
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const terms: Term[] = [];
  // (modest: what a scattering makes goes on forward, with the beams' momentum)
  const widest = (20 * Math.PI) / 180;
  for (const path of s.spines) {
    // (every point along the exchange that gives something off forward: a boson exchange's, or
    // a lepton pair's off a photon exchange, the mu+ mu- of two photons meeting)
    const forward = (v: number) => !s.blob[v] && s.linesAt[v].some((l) => !path.includes(other(l, v)) && s.time[other(l, v)] > s.time[v]);
    const points = path.slice(1, -1).filter((v) => ahead.has(v) || forward(v));
    // (not a heavy exchange, a SUSY cascade's neutralino between two charginos: it stands
    // upright and full length, its products going on as the cascade's spine)
    if (points.length < 2 || heavyRun(s, points)) continue;
    const first = points[0], last = points[points.length - 1];
    points.forEach((v, k) => {
      const given = s.linesAt[v].map((l) => other(l, v)).find((w) => !path.includes(w) && s.time[w] > s.time[v]);
      if (given === undefined) return;
      // (from -1 at one end of the run to +1 at the other; which end is the top is read from where they are)
      const rank = (k / (points.length - 1)) * 2 - 1;
      terms.push(term([v, given, first, last], (p) => {
        const down = p[2 * last + 1] >= p[2 * first + 1] ? 1 : -1;
        const angle = rank * down * widest;
        const x = dx(p, v, given), y = dy(p, v, given), n = portable.hypot(x, y) || 1;
        return rules.uprightExchange * 250 * (portable.square(x / n - portable.cos(angle)) + portable.square(y / n - portable.sin(angle)));
      }));
    });
  }
  return { name: "exchange fan", terms };
}

/** True when a run of points along an exchange touches a heavy line: a SUSY cascade's spine. */
function heavyRun(s: Structure, points: number[]): boolean {
  return points.some((v) => s.linesAt[v].some((l) => s.lines[l].heavy));
}

/** Points that make four or more particles that each decay on (a hidden valley's shower of pions). */
export function showerPoints(s: Structure): { at: number; from: number; made: number[] }[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  return s.ids.map((_, at) => at).filter((at) => !s.external[at]).flatMap((at) => {
    const into = s.linesAt[at].map((l) => other(l, at)).filter((j) => s.time[j] < s.time[at]);
    const made = s.linesAt[at].map((l) => other(l, at)).filter((j) => s.time[j] > s.time[at]);
    return into.length === 1 && made.length >= 4 && made.every((j) => !s.external[j]) ? [{ at, from: into[0], made }] : [];
  });
}

/** How far either side of its heading a shower of `n` spreads, in degrees: 15 for each beyond the first, at most 60. */
const showerSpread = (n: number) => Math.min(60, 15 * (n - 1));

/**
 * A shower: four or more particles from one point that each decay on spread evenly across a
 * wide fan about the way the shower was going, as papers draw a hidden valley's pions, so their
 * decays have room.
 */
export function showerFan(s: Structure, rules: ForceRules): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  // (and what each of them decays to goes on tightly bundled about its heading, ten degrees
  // either side, as a fast particle's decay products do)
  const bundles = showerPoints(s).flatMap(({ at, made }) => made.map((j) => ({ at, j, products: s.linesAt[j].map((l) => other(l, j)).filter((k) => s.time[k] > s.time[j]) }))).filter((b) => b.products.length >= 2);
  const half = (10 * Math.PI) / 180;
  const tight = bundles.map(({ at, j, products }) => term([at, j, ...products], (p) => {
    const heading = portable.atan2(dy(p, at, j), dx(p, at, j));
    const angles = products.map((k) => portable.atan2(dy(p, j, k), dx(p, j, k))).sort((a, b) => a - b);
    let sum = 0;
    angles.forEach((a, k) => { const want = heading - half + (2 * half * k) / (products.length - 1); sum += portable.square(a - want); });
    return rules.forwardFork * 40 * sum;
  }));
  return {
    name: "shower fan",
    terms: [...tight, ...showerPoints(s).map(({ at, from, made }) => term([from, at, ...made], (p) => {
      const heading = portable.atan2(dy(p, from, at), dx(p, from, at)), spread = (showerSpread(made.length) * Math.PI) / 180;
      // (in the order they lie, top to bottom, each to its share of the fan)
      const angles = made.map((j) => portable.atan2(dy(p, at, j), dx(p, at, j))).sort((a, b) => a - b);
      let sum = 0;
      angles.forEach((a, k) => {
        const want = heading - spread + (2 * spread * k) / (made.length - 1);
        sum += portable.square(a - want);
      });
      // (and all as long as each other: a fan, not a ragged edge)
      const lengths = made.map((j) => portable.hypot(dx(p, at, j), dy(p, at, j))), mean = lengths.reduce((t, x) => t + x, 0) / lengths.length;
      const ragged = lengths.reduce((t, x) => t + portable.square(x - mean), 0);
      return rules.forwardFork * 12 * sum + rules.length * 4 * ragged;
    }))],
  };
}

interface Decay { from: number; at: number; products: number[] }

/**
 * True when the particle made at vertex `maker` is at rest: it is the one thing the incoming
 * particles made (an s-channel resonance). Anything else recoils against something and moves.
 */
export function isAtRest(s: Structure, maker: number): boolean {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const around = s.linesAt[maker].map((l) => other(l, maker));
  // (only the incoming particles of the maker's own process: a diagram may stack two, as a
  // double parton scattering does, and the other's beams have no say)
  const reached = new Set([maker]);
  for (const queue = [maker]; queue.length;) { const i = queue.pop()!; for (const l of s.linesAt[i]) { const j = other(l, i); if (!reached.has(j)) { reached.add(j); queue.push(j); } } }
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0 && reached.has(i));
  // (where a quark that radiated annihilates, what it makes is at rest too: the radiation took
  // nothing that matters to the picture)
  if (s.radiatesInto.includes(maker)) return true;
  // (a mixing or insertion, one particle turning into another on its way, keeps it at rest
  // if the particle was: Phi -> Phi_hs made in the collision is still at rest)
  const before = around.filter((j) => s.time[j] < s.time[maker]), after = around.filter((j) => s.time[j] > s.time[maker]);
  // (and so does a point where it gives off a boson and goes on as itself: u -> u H)
  if (carriesOnTo(s, maker) >= 0 && before.length === 1 && !s.external[before[0]]) return isAtRest(s, before[0]);
  return after.length === 1 && incoming.every((i) => around.includes(i));
}

/** Vertices where a moving particle decays: one line in from earlier, made alongside something else. */
export function movingDecays(s: Structure): Decay[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const later = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] > s.time[i]);
  const decays: Decay[] = [];
  s.ids.forEach((_, at) => {
    if (s.external[at]) return;
    const before = earlier(at), products = later(at);
    if (before.length !== 1 || products.length < 2 || s.external[before[0]]) return;
    if (!isAtRest(s, before[0])) decays.push({ from: before[0], at, products });
  });
  return decays;
}

/** Fermion lines passing through a vertex, one end before it and one after: [before, vertex, after]. */
export function passThroughs(s: Structure): [number, number, number][] {
  const passes: [number, number, number][] = [];
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const fermions = s.linesAt[v].filter((l) => s.lines[l].fermion);
    if (fermions.length !== 2) return;
    const ends = fermions.map((l) => (s.lines[l].a === v ? s.lines[l].b : s.lines[l].a));
    // (a line from an incoming leg on into a blob, the collision, passes through too: what it
    // gave off on the way is initial-state radiation)
    const intoBlob = ends.some((j) => (s.blob[j] || s.radiatesInto[v] === j) && s.time[j] === s.time[v]) && ends.some((j) => s.time[j] < s.time[v]) && !s.loops.some((loop) => loop.points.includes(v));
    if ((s.time[ends[0]] - s.time[v]) * (s.time[ends[1]] - s.time[v]) >= 0 && !intoBlob) return;
    // the fermion gives something off: nothing else arrives at the vertex with it...
    const before = s.linesAt[v].map((l) => (s.lines[l].a === v ? s.lines[l].b : s.lines[l].a)).filter((j) => s.time[j] < s.time[v]);
    if (before.length !== 1) return;
    // ...and it is not a particle at rest falling apart (the s-channel electron in Compton scattering)
    if (!s.external[before[0]] && isAtRest(s, before[0])) return;
    passes.push([ends[0], v, ends[1]]);
  });
  return passes;
}

/**
 * Branches of the same shape that leave one vertex mirror each other about the line that
 * brought their parent in (the two tops of tt-bar and their decays, the two Z of H -> ZZ).
 */
export function mirrorBranches(s: Structure, rules: ForceRules): Force {
  const pairs = mirroredPairs(s);
  return {
    name: "mirror branches",
    // (the roots of the two branches, their first points, are held to the mirror firmly: the
    // two Z of H -> ZZ are the same length; what hangs off them is held more softly)
    // (and two branches that begin with the same particle, the two Z of H -> ZZ, the two
    // gamma_d of an s_d, are held to the mirror all the way down: their decays match)
    terms: pairs.flatMap(({ axisFrom, at, at2, matches, twins }) => matches.map(([m, n], k) => term([at, m, n, ...(axisFrom >= 0 ? [axisFrom] : []), ...(at2 !== undefined ? [at2] : [])], (p) => {
      const weight = rules.mirror * (k === 0 || twins ? 10 : 1);
      // the mirror line runs through the branching vertex along its parent's direction (or,
      // for branches off the two ends of an exchange, level through the exchange's middle)
      let ux = 1, uy = 0;
      if (axisFrom >= 0) {
        const l = portable.hypot(dx(p, axisFrom, at), dy(p, axisFrom, at)) || 1;
        ux = dx(p, axisFrom, at) / l; uy = dy(p, axisFrom, at) / l;
      }
      const ox = at2 === undefined ? p[2 * at] : (p[2 * at] + p[2 * at2]) / 2, oy = at2 === undefined ? p[2 * at + 1] : (p[2 * at + 1] + p[2 * at2 + 1]) / 2;
      const rx = p[2 * n] - ox, ry = p[2 * n + 1] - oy;
      const along = rx * ux + ry * uy;
      // reflect n across the mirror line and compare with m
      const fx = ox + 2 * along * ux - rx, fy = oy + 2 * along * uy - ry;
      return weight * (portable.square(p[2 * m] - fx) + portable.square(p[2 * m + 1] - fy));
    }))),
  };
}

interface MirrorPair { axisFrom: number; at: number; at2?: number; matches: [number, number][]; twins?: boolean }

/** Pairs of same-shaped branches at each vertex, with their points matched one to one. */
export function mirroredPairs(s: Structure): MirrorPair[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const later = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] > s.time[i]);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const shape = (i: number): string => `(${later(i).map(shape).sort().join("")})`;
  // (alike products are matched as a mirror matches them: the top one of one branch with the
  // bottom one of the other, in the order the author listed the legs)
  const listed = (i: number): number => s.order[i] >= 0 ? s.order[i] : Math.min(Infinity, ...later(i).map(listed));
  // (shapes compared character by character, not by the reader's locale: the same on every machine)
  const byShape = (a: number, b: number) => { const x = shape(a), y = shape(b); return x < y ? -1 : x > y ? 1 : 0; };
  const points = (i: number, flip = 1): number[] => [i, ...later(i).sort((a, b) => byShape(a, b) || flip * (listed(a) - listed(b))).flatMap((j) => points(j, flip))];
  const pairs: MirrorPair[] = [];
  // (a shower fans its branches evenly instead: see showerFan)
  const showers = new Set(showerPoints(s).map(({ at }) => at));
  s.ids.forEach((_, at) => {
    if (s.external[at] || showers.has(at)) return;
    const branches = later(at).filter((j) => !s.external[j]);
    const before = earlier(at);
    for (let m = 0; m < branches.length; m++) for (let n = m + 1; n < branches.length; n++) {
      if (shape(branches[m]) !== shape(branches[n])) continue;
      const a = points(branches[m]), b = points(branches[n], -1);
      // (branches that meet again, round a loop, are one thing, not a mirrored pair)
      if (a.some((x) => b.includes(x))) continue;
      const lineTo = (j: number) => s.linesAt[at].find((l) => other(l, at) === j)!;
      const twins = s.lineLabel[lineTo(branches[m])] !== undefined && s.lineLabel[lineTo(branches[m])] === s.lineLabel[lineTo(branches[n])];
      pairs.push({ axisFrom: before.length === 1 ? before[0] : -1, at, matches: a.map((x, k) => [x, b[k]]), twins });
    }
  });
  // branches of the same shape off the two ends of an exchange between the beams (two squarks
  // from a t-channel gluino) mirror each other top to bottom about the exchange's middle
  for (const path of s.spines) {
    const [va, vb] = [path[0], path[path.length - 1]];
    if (va === vb) continue;
    // (and the legs that leave them, when each end gives one leg of the same particle: the
    // two quarks of vector-boson fusion deflect alike)
    const name = (j: number) => s.label[j] ?? s.particle[j];
    const off = (v: number) => later(v).filter((j) => !path.includes(j));
    const legs = (v: number) => off(v).filter((j) => s.external[j]);
    for (const m of off(va)) for (const n of off(vb)) {
      if (shape(m) !== shape(n) || s.external[m] !== s.external[n]) continue;
      if (s.external[m] && (legs(va).length !== 1 || legs(vb).length !== 1 || name(m) === undefined || name(m) !== name(n))) continue;
      const a = points(m), b = points(n, -1);
      if (a.some((x) => b.includes(x))) continue;
      pairs.push({ axisFrom: -1, at: va, at2: vb, matches: a.map((x, k) => [x, b[k]]) });
    }
  }
  return pairs;
}

/**
 * The incoming particles start together: their legs begin level with each other across the
 * page, and two of them come in at mirrored angles (the electron and the quark in
 * bremsstrahlung, the two beams of a scatter). A single incoming particle comes in level.
 */
export function beamsStartTogether(s: Structure, rules: ForceRules): Force {
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  const entry = (leg: number) => (s.lines[s.linesAt[leg][0]].a === leg ? s.lines[s.linesAt[leg][0]].b : s.lines[s.linesAt[leg][0]].a);
  const terms: Term[] = [];
  for (let m = 0; m < incoming.length; m++) for (let n = m + 1; n < incoming.length; n++) {
    const [a, b] = [incoming[m], incoming[n]];
    terms.push(term([a, b], (p) => rules.beams * portable.square(p[2 * a] - p[2 * b])));
  }
  // a single incoming particle (a decay) comes in level, firmly: its decay forks about it
  if (incoming.length === 1) {
    const [a] = incoming, ea = entry(a);
    terms.push(term([a, ea], (p) => rules.restLevel * portable.square(dy(p, a, ea) / (portable.hypot(dx(p, a, ea), dy(p, a, ea)) || 1))));
  }
  if (incoming.length === 2) {
    const [a, b] = incoming, [ea, eb] = incoming.map(entry);
    // (firmly only where neither comes in as a quark that scatters and carries on, VBF's quarks:
    // those bend away from what they exchange, and the firm pull would bend them toward it)
    const scatters = new Set(passThroughs(s).flatMap(([x, v, y]) => (s.time[x] === 0 ? [x] : s.time[y] === 0 ? [y] : [])));
    const mirror = rules.beams + (scatters.has(a) || scatters.has(b) ? 0 : rules.beamsMirror);
    if (ea !== eb) terms.push(term([a, b, ea, eb], (p) => {
      // mirrored: the slopes of the two legs are equal and opposite (firmly: two beams slanting
      // the same way, parallel and diagonal, read as a mistake; they converge, or run level)
      const sa = dy(p, a, ea) / (portable.hypot(dx(p, a, ea), dy(p, a, ea)) || 1);
      const sb = dy(p, b, eb) / (portable.hypot(dx(p, b, eb), dy(p, b, eb)) || 1);
      return mirror * portable.square(sa + sb);
    }));
    // ...and never spread apart on their way in: two beams run parallel or close in
    if (ea !== eb) terms.push(limit([a, b, ea, eb], (p) => {
      const start = Math.abs(p[2 * b + 1] - p[2 * a + 1]), end = Math.abs(p[2 * eb + 1] - p[2 * ea + 1]);
      return end > start ? rules.clearance * portable.square(end - start) : 0;
    }));
  }
  return { name: "beams start together", terms };
}

/**
 * The final-state particles of one decay end together: outgoing legs that descend from a
 * common decaying particle end level across the page, so a W's lepton and neutrino finish in
 * the same plane as the b from the same top. Where one vertex gives several final-state
 * particles, the line through their ends lies parallel to that plane (upright). Particles
 * from different incoming particles (the u-bar beside a decaying top) are left alone.
 */
export function finalPlane(s: Structure, rules: ForceRules): Force {
  const outgoing = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] > 0 && s.linesAt[i].length === 1 && !s.field[i]);
  const from = (leg: number) => (s.lines[s.linesAt[leg][0]].a === leg ? s.lines[s.linesAt[leg][0]].b : s.lines[s.linesAt[leg][0]].a);
  // the vertices each point came out of, back through time
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const ancestry = new Map<number, Set<number>>();
  const ancestors = (i: number): Set<number> => {
    if (!ancestry.has(i)) ancestry.set(i, new Set(earlier(i).flatMap((j) => [j, ...ancestors(j)])));
    return ancestry.get(i)!;
  };
  // a decay: a vertex with one particle coming in
  const isDecay = (v: number) => !s.external[v] && earlier(v).length === 1;
  const sameDecay = (a: number, b: number) => [...ancestors(a)].some((v) => isDecay(v) && ancestors(b).has(v));
  const terms: Term[] = [];
  // (the ends under a cap lie across their quark lines, not on the plane)
  const capped = new Set(s.hadrons.filter((h) => h.cap && h.legs.length === 2).flatMap((h) => h.legs));
  for (let m = 0; m < outgoing.length; m++) for (let n = m + 1; n < outgoing.length; n++) {
    const [a, b] = [outgoing[m], outgoing[n]];
    if (!sameDecay(a, b) || capped.has(a) || capped.has(b)) continue;
    if (from(a) === from(b)) {
      // products of one decay: the line through their ends stands upright
      terms.push(term([a, b], (p) => {
        const x = dx(p, a, b), y = dy(p, a, b);
        return rules.finalPlane * portable.square(x / (portable.hypot(x, y) || 1));
      }));
    } else terms.push(term([a, b], (p) => (rules.finalPlane / outgoing.length) * portable.square(p[2 * a] - p[2 * b])));
  }
  // final states from different decays end apart: at least 0.6 of a line between their ends,
  // so the inv of an S and the lepton of a Z beside it do not crowd
  for (let m = 0; m < outgoing.length; m++) for (let n = m + 1; n < outgoing.length; n++) {
    const [a, b] = [outgoing[m], outgoing[n]];
    if (from(a) === from(b) || capped.has(a) || capped.has(b)) continue;
    terms.push(limit([a, b], (p) => {
      const short = 0.6 * rules.lineLength - portable.hypot(dx(p, a, b), dy(p, a, b));
      return short > 0 ? rules.clearance * portable.square(short) : 0;
    }));
  }
  return { name: "final plane", terms };
}

/**
 * Light lines keep to the outside of the diagram and heavy ones to the inside: a line heading
 * into the exchange between the beams innermost, then heavy (SUSY) particles, then bosons,
 * then fermions outermost. Where two lines of
 * different kinds leave the same vertex, the outer kind points further outward (away from the
 * middle of the diagram, top to bottom) than the inner kind: an ordering of directions, so a
 * long SUSY chain can still head outward with its quarks on its outer side. So in a SUSY cascade the gauginos run near the middle and the quarks they
 * give off go outside; where a quark emits a W, the quark stays outside. Gentle: it settles
 * which way round the lines go, not their angles.
 */
export function lightOutside(s: Structure, rules: ForceRules): Force {
  // (a convention of pair production: light particles outside the two chains. A lone decay
  // chain, one particle coming in, bends away from that particle's line, and its light
  // products go to the inside of the bend, so the chain stays gentle)
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  const lone = incoming.length === 1 ? (s.lines[s.linesAt[incoming[0]][0]].a === incoming[0] ? s.lines[s.linesAt[incoming[0]][0]].b : s.lines[s.linesAt[incoming[0]][0]].a) : -1;
  const internal = s.ids.map((_, i) => i).filter((i) => !s.external[i]);
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  // a line carrying the exchange between the beams is innermost, whatever its kind
  const onExchange = new Set(s.spines.flat());
  // (at a two-product vertex, the line that carries the chain on is inner and the leg that ends
  // it is outer, chi_d out and s_d on; with three or more products the heavy one takes the
  // parent's line and the light ones fan off it: stop -> b W chi, chi on)
  // (...and only when what carries on decays at least twice more, s_d -> gamma_d gamma_d -> l l,
  // and so needs the central lane; a Z -> l l goes outside and the gravitino keeps the line)
  const generation = decayGenerations(s);
  const deepBeyond = (l: number, v: number) => {
    const j = other(l, v);
    return !s.external[j] && beyond(s, l, v).some((k) => generation[k] > generation[j]);
  };
  const rank = (l: number, two: boolean, v: number) => (onExchange.has(s.lines[l].a) && onExchange.has(s.lines[l].b) || onExchange.has(s.lines[l].a) !== onExchange.has(s.lines[l].b) && !s.external[s.lines[l].a] && !s.external[s.lines[l].b] && [s.lines[l].a, s.lines[l].b].some((i) => onExchange.has(i) && s.linesAt[i].length > 0) ? -1
    : two && s.lines[l].leg ? (s.lines[l].heavy ? 1.5 : s.lines[l].fermion ? 2 : 1.8) : s.lines[l].heavy ? 0 : s.lines[l].fermion ? 2 : 1);
  const pairs: [number, number, number][] = [];
  const onRail = new Set(quarkRails(s).flatMap((r) => r.path));
  const arcs = arcLines(s);
  for (const v of internal.filter((i) => !onRail.has(i))) {
    const later = s.linesAt[v].filter((l) => s.time[other(l, v)] > s.time[v]);
    const two = later.length === 2 && later.some((l) => deepBeyond(l, v));
    for (const outer of later) for (const inner of later) if (rank(outer, two, v) > rank(inner, two, v)) pairs.push([other(outer, v), other(inner, v), v]);
  }
  return {
    name: "light outside",
    terms: pairs.map(([outer, inner, v]) => limit([outer, inner, v], (p) => {
      // which way is outward from this vertex: away from the middle of the diagram (which
      // only picks the side, so the term does not depend on the other points)
      let middle = 0;
      if (lone >= 0) middle = p[2 * lone + 1];
      else { for (const i of internal) middle += p[2 * i + 1]; middle /= internal.length; }
      // (smoothly: a vertex on the middle line has no outside, and a step there would jam the
      // solver on a jump in the energy)
      const out = (lone >= 0 ? -1 : 1) * Math.max(-1, Math.min(1, (p[2 * v + 1] - middle) / 0.4));
      if (out === 0) return 0;
      // the outer line must point at least as far outward as the inner one
      const lean = (k: number) => dy(p, v, k) / (portable.hypot(dx(p, v, k), dy(p, v, k)) || 1);
      const wrong = (lean(inner) - lean(outer)) * out;
      return wrong > 0 ? rules.lightOutside * portable.square(wrong) : 0;
    })),
  };
}

/**
 * A heavy particle that decays to another heavy one (a gluino to a chargino, then to a
 * neutralino) bends a little at each decay, always toward the middle line of the diagram:
 * the light particles it gives off leave at a wide angle, the heavy one bends by a small
 * angle (or by an equal share of what is left to bring the chain level by its last particle,
 * if that is more), so a SUSY cascade arcs evenly over all its decays and settles level.
 */
export function heavyCarriesOn(s: Structure, rules: ForceRules): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const chains: [number, number, number][] = [];
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const before = s.linesAt[v].filter((l) => s.time[other(l, v)] < s.time[v]);
    const after = s.linesAt[v].filter((l) => s.time[other(l, v)] > s.time[v] && s.lines[l].heavy);
    if (before.length === 1 && s.lines[before[0]].heavy && after.length === 1) chains.push([other(before[0], v), v, other(after[0], v)]);
  });
  const turn = (rules.heavyTurn * Math.PI) / 180;
  const internal = s.ids.map((_, i) => i).filter((i) => !s.external[i]);
  // how many heavy-to-heavy decays a chain still has to come, counting this one
  const nextOnChain = new Map(chains.map(([, v, b]) => [v, b]));
  const decaysLeft = new Map(chains.map(([, v]) => { let k = 1, at = nextOnChain.get(v)!; while (nextOnChain.has(at)) { k++; at = nextOnChain.get(at)!; } return [v, k]; }));
  return {
    name: "heavy carries on",
    terms: chains.map(([a, v, b]) => term([a, v, b], (p) => {
      // the heading coming in, and the heading going out
      const inAngle = portable.atan2(dy(p, a, v), dx(p, a, v)), outAngle = portable.atan2(dy(p, v, b), dx(p, v, b));
      // bend toward the middle line of the diagram, the same way at every decay: by the house
      // angle, or by an equal share of the way toward level (not all the way) by its last
      // particle, whichever is more (a short cascade bends more at each decay)
      // (the middle only picks the way to bend, so the term does not depend on the other points)
      let middle = 0;
      for (const i of internal) middle += p[2 * i + 1];
      middle /= internal.length;
      const toward = Math.sign(middle - p[2 * v + 1]);
      const share = (rules.settle * Math.max(0, toward * -inAngle)) / decaysLeft.get(v)!;
      const wanted = inAngle + toward * Math.max(turn, share);
      let miss = outAngle - wanted;
      miss = portable.atan2(portable.sin(miss), portable.cos(miss));
      return rules.heavyCarriesOn * portable.square(miss);
    })),
  };
}

/**
 * Final-state particles do not head toward each other: two outgoing legs from different
 * vertices, where they run side by side, keep a gap that stays level or widens toward the
 * right (the quarks a gluino gives off run at most parallel to the W and Z given off further
 * along its chain). Legs of different branches may lean toward each other a little, by an
 * angle that grows with how deep in a cascade they come out.
 */
/**
 * A line scattered off a nucleus reads as scattering: where a line passes through a point (one
 * point before, one after) whose other line leads to a nucleus, the line comes in running toward
 * the nucleus and leaves running away from it, each by at least `scatterAngle` degrees, and as
 * much the one way as the other: a V with its corner pointing at the nucleus. Free while that holds; a push only when it does not. (Only a
 * diagram with a nucleus in it has any; its strength and least angle are fixed here, not theme
 * settings, while the approved layouts' settings are frozen.)
 */
const SCATTER = 2000, SCATTER_ANGLE = 15;
export function nucleusScatter(s: Structure): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const least = portable.sin((SCATTER_ANGLE * Math.PI) / 180);
  const terms: Term[] = [];
  s.ids.forEach((_, n) => {
    if (!s.nucleus?.[n] || s.linesAt[n].length !== 1) return;
    const v = other(s.linesAt[n][0], n);
    const off = s.linesAt[v].map((l) => other(l, v)).filter((w) => w !== n);
    if (off.length !== 2 || s.linesAt[v].length !== 3) return;
    const [a, b] = [...off].sort((x, y) => s.time[x] - s.time[y]);
    if (s.time[a] === s.time[b]) return;
    // (how far along the way toward the nucleus a step runs, as a share of its length)
    const toward = (p: Float64Array, from: number, to: number) => {
      const ux = dx(p, v, n), uy = dy(p, v, n), un = portable.hypot(ux, uy) || 1, len = portable.hypot(dx(p, from, to), dy(p, from, to)) || 1;
      return (dx(p, from, to) * ux + dy(p, from, to) * uy) / (un * len);
    };
    terms.push(limit([a, v, n], (p) => { const short = least - toward(p, a, v); return short > 0 ? SCATTER * portable.square(short) : 0; }));
    terms.push(limit([v, b, n], (p) => { const short = least + toward(p, v, b); return short > 0 ? SCATTER * portable.square(short) : 0; }));
    // (and as much toward it coming in as away from it leaving: the V even about the nucleus, its
    // corner pointing at it, not leaning one way)
    terms.push(limit([a, v, b, n], (p) => { const lean = Math.abs(toward(p, a, v) + toward(p, v, b)) - 0.1; return lean > 0 ? SCATTER * portable.square(lean) : 0; }));
  });
  return { name: "nucleus scatter", terms };
}

export function noConverging(s: Structure, rules: ForceRules): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const legs = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] > 0 && s.linesAt[i].length === 1 && !s.field[i])
    .map((end) => ({ end, from: other(s.linesAt[end][0], end) })).filter(({ from }) => !s.external[from]);
  // which branch of the collision each point grew from, and how many decays deep it is
  const generation = decayGenerations(s);
  const earlier = (i: number) => s.linesAt[i].map((l) => other(l, i)).filter((j) => s.time[j] < s.time[i]);
  const branchOf = (i: number): number => {
    let at = i;
    for (;;) { const up = earlier(at); if (up.length !== 1 || s.external[up[0]] || earlier(up[0]).length !== 1) return at; at = up[0]; }
  };
  const terms: Term[] = [];
  for (let m = 0; m < legs.length; m++) for (let n = m + 1; n < legs.length; n++) {
    const a = legs[m], b = legs[n];
    if (a.from === b.from) continue;
    // legs of different branches may lean toward each other a little, more the deeper they are
    const sameBranch = branchOf(a.from) === branchOf(b.from);
    const leeway = sameBranch ? 0 : portable.tan((rules.convergeLeeway * Math.max(generation[a.from], generation[b.from]) * Math.PI) / 180);
    terms.push(limit([a.end, a.from, b.end, b.from], (p) => {
      const x0 = Math.max(p[2 * a.from], p[2 * b.from]), x1 = Math.min(p[2 * a.end], p[2 * b.end]);
      if (x1 <= x0) return 0;
      // the height of each leg's line at a given x across the page
      const heightAt = (leg: typeof a, x: number) => {
        const fx = p[2 * leg.from], fy = p[2 * leg.from + 1], ex = p[2 * leg.end], ey = p[2 * leg.end + 1];
        return fy + ((ey - fy) * (x - fx)) / ((ex - fx) || 1e-9);
      };
      const g0 = heightAt(b, x0) - heightAt(a, x0), g1 = heightAt(b, x1) - heightAt(a, x1);
      // only legs that run near each other matter (fading out smoothly as they get further
      // apart: a step here would jam the solver on a jump in the energy)
      const near = Math.max(0, Math.min(1, (rules.convergeReach - Math.abs(g0)) / 0.3));
      if (near === 0) return 0;
      const closing = Math.sign(g0) * (g0 - g1) - leeway * (x1 - x0);
      return closing > 0 ? near * rules.noConverging * portable.square(closing) : 0;
    }));
  }
  return { name: "no converging", terms };
}

/**
 * Hadrons: the quark legs of one hadron end together, one above the other at a set spacing in
 * whichever order they lie, and the hadrons on each side line up in one column. The ellipse drawn
 * over a hadron's leg ends is an element like any other: it keeps the margin from every point,
 * line and hadron that is not its own, and hadrons keep a minimum gap from each other (one
 * for mesons, a larger one for baryons). A quark running from an incoming hadron to an outgoing
 * one is a rail: it passes straight through every vertex, whatever it gives off.
 */
export function hadrons(s: Structure, rules: ForceRules): Force {
  const terms: Term[] = [];
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const lineUp = (a: number, b: number) => term([a, b], (p) => rules.hadron * portable.square(p[2 * a] - p[2 * b]));
  // (an incoming hadron whose rail gives off something toward its other quarks, the W of a
  // colour-suppressed decay, holds them apart by room for the quarks that makes between them)
  const room = new Map<(typeof s.hadrons)[number], number>();
  const railPaths = quarkRails(s), onAnyRail = new Set(railPaths.flatMap((r) => r.path));
  for (const { path, start } of railPaths) for (let k = 1; k + 1 < path.length; k++) {
    const v = path[k];
    for (const l of s.linesAt[v]) {
      const e = other(l, v);
      // (a line to another rail links the two; it is not given off)
      if (e === path[k - 1] || e === path[k + 1] || onAnyRail.has(e) || !givenOffToward(s, l, v, path[path.length - 1], path)) continue;
      const made = new Set(beyond(s, l, v));
      const between = s.hadrons.filter((g) => g.outgoing).flatMap((g) => g.legs).filter((j) => made.has(j)).length;
      const h = s.hadrons.find((g) => !g.outgoing && g.legs.includes(start))!;
      room.set(h, Math.max(room.get(h) ?? 0, (between + 1) * rules.hadronSpacing + rules.mesonGap));
    }
  }
  for (const h of s.hadrons) {
    // (a cap sits square across its two quark lines, wherever they run: see below)
    if (h.cap && h.legs.length === 2) continue;
    h.legs.forEach((a, k) => { if (k > 0) terms.push(lineUp(h.legs[0], a)); });
    // (a hadron drawn with a brace beside it keeps its quarks further apart: the brace and the
    // two quark names need the room an ellipse would have taken)
    // (and where a boson arc sits on one of its quark lines, a penguin's W, room for the arc and
    // its label between them)
    const arcOnRail = railPaths.some((r) => h.legs.includes(r.start) || h.legs.includes(r.path[r.path.length - 1]) ? s.loops.some((loop) => loop.run && loop.run.some((v) => r.path.includes(v))) : false);
    const apart = room.get(h) ?? rules.hadronSpacing * (arcOnRail ? 2.2 : !h.ellipse && !h.cap ? 1.6 : 1);
    // one above the other at a set spacing, in whichever order they lie
    if (h.legs.length > 1) terms.push(term(h.legs, (p) => {
      const ys = h.legs.map((i) => p[2 * i + 1]).sort((a, b) => a - b);
      let sum = 0;
      for (let k = 1; k < ys.length; k++) sum += portable.square(ys[k] - ys[k - 1] - apart);
      return rules.hadron * sum;
    }));
  }
  // a hadron's quarks keep the order top to bottom of the points their lines come from, so no
  // quark line crosses another of the same hadron (the s-bar a W makes above the spectator c it
  // joins in a D_s: BPHY-2018-08 fig_01b)
  const paired = new Set(s.pairs.flatMap((pair) => pair.ends));
  for (const h of s.hadrons) {
    if (h.legs.length < 2) continue;
    const from = (i: number) => other(s.linesAt[i][0], i);
    for (const a of h.legs) for (const b of h.legs) {
      // (a quark pair from the vacuum comes from the other hadron, not a point: it orders itself)
      const outgoingLeg = (i: number) => s.external[i] && s.time[i] > 0;
      if (a === b || from(a) === from(b) || outgoingLeg(from(a)) || outgoingLeg(from(b)) || paired.has(a) || paired.has(b)) continue;
      terms.push(limit([a, b, from(a), from(b)], (p) => {
        if (p[2 * from(a) + 1] >= p[2 * from(b) + 1] - 1e-6) return 0;
        const over = p[2 * a + 1] - (p[2 * b + 1] - rules.hadronSpacing * 0.5);
        return over > 0 ? 10 * rules.hadron * portable.square(over) : 0;
      }));
    }
  }
  // a hadron whose quarks all meet at one point (a B_c annihilating into a W) has that point
  // level with its middle: its quarks mirror each other about the level line the W goes on
  for (const h of s.hadrons) {
    if (h.legs.length < 2) continue;
    const meets = h.legs.map((i) => other(s.linesAt[i][0], i));
    if (!meets.every((v) => v === meets[0]) || s.external[meets[0]]) continue;
    const v = meets[0];
    terms.push(term([v, ...h.legs], (p) => {
      let mean = 0;
      for (const i of h.legs) mean += p[2 * i + 1];
      return 5 * rules.hadron * portable.square(p[2 * v + 1] - mean / h.legs.length);
    }));
  }
  // the hadrons on each side share a column, and in a hadron diagram every other final state
  // (leptons, neutrinos, photons) ends on that same plane
  for (const side of [true, false]) {
    const firsts = s.hadrons.filter((h) => h.outgoing === side).map((h) => h.legs[0]);
    firsts.forEach((a, k) => { if (k > 0) terms.push(lineUp(firsts[0], a)); });
    if (!side || firsts.length === 0) continue;
    const inHadron = new Set(s.hadrons.flatMap((h) => h.legs));
    const others = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] > 0 && !inHadron.has(i) && !s.field[i]
      && s.linesAt[i].length === 1 && !s.hidden[s.linesAt[i][0]]);
    for (const i of others) terms.push(lineUp(firsts[0], i));
  }
  // each ellipse as an element: centre and size the way the renderer draws it (a brace with
  // its name beside it takes about the room an ellipse would, and is taken as one)
  const ellipses = s.hadrons;
  // the renderer draws every ellipse on one side the size of the widest there
  // (worked with plain loops: these are measured very often)
  const span = (h: (typeof ellipses)[number], p: Float64Array) => {
    let top = Infinity, bottom = -Infinity;
    for (const i of h.legs) { top = Math.min(top, p[2 * i + 1]); bottom = Math.max(bottom, p[2 * i + 1]); }
    return bottom - top;
  };
  const sameSide = new Map(ellipses.map((h) => [h, ellipses.filter((g) => g.outgoing === h.outgoing)]));
  const sizeOf = (h: (typeof ellipses)[number], p: Float64Array) => {
    let widest = -Infinity;
    for (const g of sameSide.get(h)!) widest = Math.max(widest, span(g, p));
    const ry = Math.max(widest / 2 + s.hadronPad, s.hadronMin);
    const rx = Math.max(ry * 0.6, s.hadronMin);
    let edge = h.outgoing ? Infinity : -Infinity, sum = 0;
    for (const i of h.legs) {
      edge = h.outgoing ? Math.min(edge, p[2 * i]) : Math.max(edge, p[2 * i]);
      sum += p[2 * i + 1];
    }
    const cx = edge + (h.outgoing ? 1 : -1) * rx * 0.8, cy = sum / h.legs.length;
    return { cx, cy, rx, ry, r: (rx + ry) / 2 };
  };
  // the space kept between two hadrons: one gap for mesons, a larger one for baryons
  const gapOf = (h: (typeof ellipses)[number]) => (h.legs.length >= 3 ? rules.baryonGap : rules.mesonGap);
  const push = (shortfall: number) => (shortfall > 0 ? rules.clearance * portable.square(shortfall) : 0);
  for (const [n, h] of ellipses.entries()) {
    const own = new Set(h.legs), ownLines = new Set(h.legs.flatMap((i) => s.linesAt[i]));
    for (let i = 0; i < s.ids.length; i++) {
      if (own.has(i)) continue;
      terms.push(limit([...h.legs, i], (p) => {
        const { cx, cy, r } = sizeOf(h, p);
        return push(r + s.pad[i] + rules.margin - portable.hypot(p[2 * i] - cx, p[2 * i + 1] - cy));
      }));
    }
    s.lines.forEach((line, l) => {
      if (ownLines.has(l)) return;
      terms.push(limit([...h.legs, line.a, line.b], (p) => {
        const { cx, cy, r } = sizeOf(h, p);
        const vx = p[2 * line.b] - p[2 * line.a], vy = p[2 * line.b + 1] - p[2 * line.a + 1];
        const wx = cx - p[2 * line.a], wy = cy - p[2 * line.a + 1];
        const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / ((vx * vx + vy * vy) || 1)));
        return push(r + rules.margin - portable.hypot(wx - t * vx, wy - t * vy));
      }));
    });
    for (const g of ellipses.slice(n + 1)) {
      // (two hadrons a labelled quark pair from the vacuum feeds keep room for its labels between them)
      const fed = s.pairs.some((pair) => pair.ends.some((e) => h.legs.includes(e)) && pair.ends.some((e) => g.legs.includes(e)) && pair.lines.some((l) => s.linePad[l] > 0));
      const gap = Math.max(gapOf(h), gapOf(g), fed ? rules.mesonGap * 3 : 0);
      const sameSide = ellipses.filter((e) => e.outgoing === h.outgoing).flatMap((e) => e.legs);
      terms.push(limit([...new Set([...h.legs, ...g.legs, ...sameSide])], (p) => {
        const a = sizeOf(h, p), b = sizeOf(g, p);
        // stacked in one column: their edges keep the gap (a margin, either way round);
        // otherwise as circles
        const short = h.outgoing === g.outgoing ? a.ry + b.ry + gap - Math.abs(a.cy - b.cy)
          : a.r + b.r + gap - portable.hypot(a.cx - b.cx, a.cy - b.cy);
        // (firmly: two hadrons touching read as one; less so for two a vacuum pair joins, whose
        // lines between them must not be pulled across each other)
        return short > 0 ? (fed ? 10 : 50) * rules.hadron * portable.square(short) : 0;
      }));
    }
  }
  // a hadron made wholly from the vacuum (nothing joins it to the incoming side) rests against
  // its nearest neighbour in the column, the gap away
  const joined = reachedFromIncoming(s);
  for (const h of ellipses) {
    if (!h.outgoing || h.legs.some((i) => joined[i])) continue;
    const column = ellipses.filter((g) => g !== h && g.outgoing === h.outgoing);
    if (column.length === 0) continue;
    const pts = [...new Set([...h.legs, ...column.flatMap((g) => g.legs)])];
    // (only a pull: the gap itself is kept by the push between hadrons)
    const reach = Math.max(gapOf(h), ...column.map(gapOf)) + rules.margin;
    terms.push(limit(pts, (p) => {
      const a = sizeOf(h, p);
      const nearest = Math.min(...column.map((g) => { const b = sizeOf(g, p); return Math.abs(a.cy - b.cy) - a.ry - b.ry; }));
      return nearest > reach ? rules.hadron * portable.square(nearest - reach) : 0;
    }));
  }
  // rails: a quark running from an incoming hadron to an outgoing one passes straight
  // through every vertex on its way; what it gives off never deflects it, and leaves on the
  // side away from its hadron's other quarks
  const rails = quarkRails(s);
  const onRail = new Set(rails.flatMap((r) => r.path));
  for (const { path, start, others } of rails) {
    for (let k = 1; k + 1 < path.length; k++) {
      const [a, v, b] = [path[k - 1], path[k], path[k + 1]];
      terms.push(term([a, v, b], (p) => {
        const ax = dx(p, v, a), ay = dy(p, v, a), bx = dx(p, v, b), by = dy(p, v, b);
        return rules.rail * (1 + (ax * bx + ay * by) / ((portable.hypot(ax, ay) * portable.hypot(bx, by)) || 1));
      }));
      for (const l of s.linesAt[v]) {
        const e = other(l, v);
        // (a line to another rail links the two; it is not given off)
        if (e === a || e === b || others.length === 0 || onRail.has(e)) continue;
        // (but what makes quarks that join hadrons with another line's quarks, the W of a
        // colour-suppressed decay whose c and sbar pair off with the spectator and the rail's
        // end, goes toward the other quarks: between the lines)
        const toward = givenOffToward(s, l, v, path[path.length - 1], path);
        terms.push(limit([v, e, start, ...others], (p) => {
          const bundle = others.reduce((sum, i) => sum + p[2 * i + 1], 0) / others.length;
          const away = (toward ? -1 : 1) * (Math.sign(p[2 * start + 1] - bundle) || 1);
          const lean = (p[2 * e + 1] - p[2 * v + 1]) * away;
          return lean < rules.margin ? rules.rail * portable.square(rules.margin - lean) : 0;
        }));
      }
    }
  }
  // a cap hadron's quark lines run parallel into it, and the cap sits square across them:
  // its two ends lie side by side across the way the lines run, the usual spacing apart
  for (const h of s.hadrons) {
    if (!h.cap || h.legs.length !== 2) continue;
    const dir = h.legs.map((leg) => { const l = s.linesAt[leg][0]; return [other(l, leg), leg] as const; });
    terms.push(term([...dir.flat()], (p) => {
      const [[a0, a1], [b0, b1]] = dir;
      const ax = dx(p, a0, a1), ay = dy(p, a0, a1), bx = dx(p, b0, b1), by = dy(p, b0, b1);
      const la = portable.hypot(ax, ay) || 1, lb = portable.hypot(bx, by) || 1;
      // (firmly: the cap is the picture of two quarks running together)
      const parallel = 5 * rules.hadron * portable.square((ax * by - ay * bx) / (la * lb));
      // the mean heading of the two lines; the ends keep no distance along it and the
      // spacing across it
      let mx = ax / la + bx / lb, my = ay / la + by / lb;
      const m = portable.hypot(mx, my) || 1;
      mx /= m; my /= m;
      const ex = dx(p, a1, b1), ey = dy(p, a1, b1);
      const along = ex * mx + ey * my, across = Math.abs(ex * my - ey * mx);
      return parallel + rules.hadron * (portable.square(along) + portable.square(across - rules.hadronSpacing));
    }));
  }
  return { name: "hadrons", terms };
}


/**
 * Whether what a quark rail gives off at `v` along line `l` heads toward the hadron's other
 * quarks rather than away from them: when the quarks it makes join hadrons with another line's
 * quarks (not only the rail's own end, `railEnd`), as the W of a colour-suppressed decay does.
 */
export function givenOffToward(s: Structure, l: number, v: number, railEnd: number, rail: number[] = []): boolean {
  const made = new Set(beyond(s, l, v));
  // (not a loop hanging from the rail: it comes back to it)
  if (rail.some((i) => i !== v && made.has(i))) return false;
  return s.hadrons.some((h) => h.outgoing && h.legs.some((j) => made.has(j)) && h.legs.some((j) => !made.has(j) && j !== railEnd));
}

/**
 * Points that must share a coordinate in a hadron diagram. Every quark line runs level (only
 * bosons slant, and the quarks a boson gives, which fork out from where it ends), so the ends
 * of each such line share one height; and the quark legs of the hadrons on each side end in
 * one column, so the hadrons' ellipses line up. The solver keeps each tie exactly.
 */
export function levelTies(s: Structure): Tie[] {
  // (outside hadron diagrams: what a collision makes at rest runs exactly level, R out of a
  // gluon loop, an s-channel Z, through any mixing on its way)
  if (s.hadrons.length === 0) {
    const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
    const lines = madeAtRestLines(s).filter(([a, b]) => !s.blob[a] && !s.blob[b]);
    // (and the one line out of a loop that two or more lines come into: H or R from a gluon loop)
    for (const loop of s.loops) {
      const inLoop = new Set(loop.points);
      const outside = loop.points.flatMap((i) => s.linesAt[i].filter((l) => !inLoop.has(other(l, i))).map((l) => ({ at: i, to: other(l, i) })));
      const into = outside.filter(({ at, to }) => s.time[to] < s.time[at]), leaving = outside.filter(({ at, to }) => s.time[to] > s.time[at]);
      if (into.length >= 2 && leaving.length === 1 && !s.external[leaving[0].to]) lines.push([leaving[0].at, leaving[0].to]);
    }
    // (and what leaves the middle of an exchange between the beams alone, the Higgs of vector-
    // boson fusion: exactly level)
    // (one alone: several along one exchange fan forward instead)
    const onLoopPts = new Set(s.loops.flatMap((loop) => loop.points));
    for (const path of s.spines) {
      const giving = path.slice(1, -1).filter((v) => !onLoopPts.has(v) && !s.blob[v]).map((v) => ({ v, off: s.linesAt[v].map((l) => other(l, v)).filter((j) => !path.includes(j) && s.time[j] > s.time[v]) })).filter(({ off }) => off.length > 0);
      if (giving.length === 1 && giving[0].off.length === 1) lines.push([giving[0].v, giving[0].off[0]]);
      // (a heavy exchange, a SUSY cascade's spine, keeps each of what it gives off level)
      else if (heavyRun(s, giving.map(({ v }) => v))) for (const { v, off } of giving) if (off.length === 1) lines.push([v, off[0]]);
    }
    const ties: Tie[] = lines.map(([a, b]) => ({ axis: 1 as const, points: [a, b] }));
    // (a triangle two incoming lines feed stands on its side: the two corners they come into
    // exactly one above the other, so with its point on the level line out of it, one side and
    // the bisector run along the grid)
    for (const loop of s.loops) {
      if (loop.points.length !== 3 || loop.run) continue;
      const fed = loop.points.filter((i) => s.linesAt[i].some((l) => s.external[other(l, i)] && s.time[other(l, i)] < s.time[i]));
      if (fed.length === 2) ties.push({ axis: 0 as const, points: fed });
    }
    return ties;
  }
  const parent = s.ids.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const onRail = new Set(quarkRails(s).flatMap((r) => r.path));
  const arcs = arcLines(s);
  const bosonEnds = new Set(s.lines.filter((l) => !l.fermion && !l.heavy).flatMap((l) => [l.a, l.b]));
  for (const [l, line] of s.lines.entries()) {
    if (!line.fermion || arcs.has(l)) continue;
    const early = s.time[line.a] <= s.time[line.b] ? line.a : line.b;
    if (bosonEnds.has(early) && !onRail.has(early)) continue;
    // a quark and antiquark that meet at one point (annihilation) cannot both be level
    const late = early === line.a ? line.b : line.a;
    const meeting = s.linesAt[late].filter((l) => s.lines[l].fermion && s.time[s.lines[l].a === late ? s.lines[l].b : s.lines[l].a] < s.time[late]).length >= 2;
    if (meeting) continue;
    parent[find(line.a)] = find(line.b);
  }
  const groups = new Map<number, number[]>();
  s.ids.forEach((_, i) => (groups.get(find(i)) ?? groups.set(find(i), []).get(find(i))!).push(i));
  const ties: Tie[] = [...groups.values()].filter((g) => g.length > 1).map((points) => ({ axis: 1 as const, points }));
  // the hadrons on each side end (or start) exactly in one column, so their ellipses line up
  // (a cap sits square across its quark lines, wherever they run: its ends are not tied)
  for (const side of [true, false]) {
    const points = s.hadrons.filter((h) => h.outgoing === side && !(h.cap && h.legs.length === 2)).flatMap((h) => h.legs);
    if (points.length > 1) ties.push({ axis: 0, points, start: side ? "max" : "min" });
  }
  return ties;
}

/**
 * Quark rails: each quark that runs from an incoming hadron, through one or more vertices, to
 * an outgoing hadron, with the hadron's other incoming quarks beside it.
 */
export function quarkRails(s: Structure): { path: number[]; start: number; others: number[] }[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const outgoingQuark = new Set(s.hadrons.filter((h) => h.outgoing).flatMap((h) => h.legs));
  const rails: { path: number[]; start: number; others: number[] }[] = [];
  for (const h of s.hadrons.filter((g) => !g.outgoing)) for (const start of h.legs) {
    const path = [start];
    let from = -1, at = start;
    for (;;) {
      const onward = s.linesAt[at].filter((l) => s.lines[l].fermion && other(l, at) !== from);
      if (onward.length !== 1) break;
      const next = other(onward[0], at);
      if (path.includes(next)) break;
      path.push(next); from = at; at = next;
      if (s.external[next]) break;
    }
    const beside = new Set(s.pairs.flatMap((pair) => [...pair.ends, ...pair.partners.map((q) => q.leg)]));
    if (outgoingQuark.has(path[path.length - 1]) && !beside.has(path[path.length - 1]) && path.length >= 3) rails.push({ path, start, others: h.legs.filter((i) => i !== start) });
  }
  return rails;
}

/** Which points the incoming legs reach along drawn lines. */
export function reachedFromIncoming(s: Structure): boolean[] {
  const reached = s.ids.map((_, i) => s.external[i] && s.time[i] === 0);
  const queue = reached.flatMap((r, i) => (r ? [i] : []));
  while (queue.length) {
    const i = queue.pop()!;
    for (const l of s.linesAt[i]) {
      const j = s.lines[l].a === i ? s.lines[l].b : s.lines[l].a;
      if (!reached[j]) { reached[j] = true; queue.push(j); }
    }
  }
  return reached;
}

/** The lines of each vacuum pair and of the partner quarks beside it. */
export function arcLines(s: Structure): Set<number> {
  return new Set(s.pairs.flatMap((pair) => [...pair.lines, ...pair.partners.map((q) => q.line)]));
}

/**
 * Vacuum pairs: a quark pair made from the vacuum opens like a C toward the two hadrons it
 * ends in, its point level with the gap between them and set back by half their spread (so
 * drawn as arcs it is a half circle). The partner quarks of those hadrons run beside it,
 * outside, on a wider circle about the same centre: the curves are parallel. The pair's
 * quarks are the facing legs of their hadrons.
 */
export function vacuumArcs(s: Structure, rules: ForceRules): Force {
  const terms: Term[] = [];
  for (const pair of s.pairs) {
    const [e1, e2] = pair.ends;
    const centre = (p: Float64Array) => ({ x: (p[2 * e1] + p[2 * e2]) / 2, y: (p[2 * e1 + 1] + p[2 * e2 + 1]) / 2 });
    const inner = (p: Float64Array) => Math.abs(p[2 * e1 + 1] - p[2 * e2 + 1]) / 2;
    const v = pair.at;
    terms.push(term([v, e1, e2], (p) => {
      const c = centre(p);
      return rules.hadron * (portable.square(p[2 * v] - (c.x - inner(p))) + portable.square(p[2 * v + 1] - c.y));
    }));
    const legs = pair.partners.map((q) => q.leg);
    const outer = (p: Float64Array) => (legs.length === 2 ? Math.abs(p[2 * legs[0] + 1] - p[2 * legs[1] + 1]) / 2
      : Math.abs(p[2 * legs[0] + 1] - centre(p).y));
    for (const { from } of pair.partners) {
      if (s.external[from]) continue;
      // the partner starts on the wider circle, on the side the pair opens from
      terms.push(term([from, e1, e2, ...legs], (p) => {
        const c = centre(p);
        return rules.hadron * portable.square(portable.hypot(p[2 * from] - c.x, p[2 * from + 1] - c.y) - outer(p));
      }));
      terms.push(limit([from, e1, e2], (p) => {
        const short = p[2 * from] - (centre(p).x - rules.margin);
        return short > 0 ? rules.hadron * portable.square(short) : 0;
      }));
    }
    // the C is symmetric about the gap: its partners start, on average, level with it
    const starts = pair.partners.map((q) => q.from).filter((i) => !s.external[i]);
    if (starts.length) terms.push(term([...starts, e1, e2], (p) => {
      const mean = starts.reduce((sum, i) => sum + p[2 * i + 1], 0) / starts.length;
      return rules.hadron * portable.square(mean - centre(p).y);
    }));
    // in each hadron the pair's quark faces the gap, its partner lies outside it
    for (const { leg } of pair.partners) {
      const e = pair.ends.find((end) => s.hadrons.some((h) => h.legs.includes(end) && h.legs.includes(leg)))!;
      terms.push(limit([e, leg, e1, e2], (p) => {
        const c = centre(p);
        const short = Math.abs(p[2 * e + 1] - c.y) + rules.hadronSpacing * 0.9 - Math.abs(p[2 * leg + 1] - c.y);
        return short > 0 ? rules.hadron * portable.square(short) : 0;
      }));
    }
  }
  return { name: "vacuumArcs", terms };
}

/**
 * The lines of a loop that time does not direct: every line of a loop, except the straight
 * stretch an arc stands on (which is part of a fermion line running on through).
 */
export function loopLinesOutsideTime(s: Structure): Set<number> {
  return new Set(s.loops.flatMap((loop) => (loop.pathLines ?? loop.lines)));
}

/**
 * Loops. A loop that is a stretch of fermion line closed by bosons (a vertex correction, a
 * penguin) is an arc over that line: the stretch runs straight and level, and the arc is a half circle
 * with the stretch as its diameter, any vertex on it (where the penguin's photon leaves)
 * spaced evenly round it. Any other loop (a fermion triangle, a box) is a regular polygon:
 * each corner takes the polygon's angle.
 */
export function loopShapes(s: Structure, rules: ForceRules): Force {
  const terms: Term[] = [];
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  for (const loop of s.loops) {
    if (loop.run && loop.path) {
      // the stretch runs straight through each of its points
      for (const v of loop.run) {
        const ends = s.linesAt[v].filter((l) => s.lines[l].fermion).map((l) => other(l, v));
        if (ends.length !== 2) continue;
        const [a, b] = ends;
        terms.push(term([a, v, b], (p) => {
          const ax = dx(p, v, a), ay = dy(p, v, a), bx = dx(p, v, b), by = dy(p, v, b);
          return rules.loop * (1 + (ax * bx + ay * by) / ((portable.hypot(ax, ay) * portable.hypot(bx, by)) || 1));
        }));
      }
      // ...and level: a loop hangs from a level line
      const ends = [loop.run[0], loop.run[loop.run.length - 1]], inner = loop.path.slice(1, -1);
      const [r0, r1] = ends;
      terms.push(term([r0, r1], (p) => rules.loop * portable.square(dy(p, r0, r1) / (portable.hypot(dx(p, r0, r1), dy(p, r0, r1)) || 1))));
      // an arc with no point of its own keeps its top clear of everything else
      if (inner.length === 0) { terms.push(...arcTopClear(s, rules, loop)); continue; }
      // the arc's own points on the half circle over it, evenly spaced, on the side they are on
      const [first, last] = [loop.path[0], loop.path[loop.path.length - 1]];
      terms.push(term([...ends, ...inner], (p) => {
        const mx = (p[2 * first] + p[2 * last]) / 2, my = (p[2 * first + 1] + p[2 * last + 1]) / 2;
        const ux = (p[2 * first] - mx), uy = (p[2 * first + 1] - my), r = portable.hypot(ux, uy) || 1;
        // the side of the stretch the arc is on: where its points are, on the whole
        let lean = 0;
        for (const x of inner) lean += ux * (p[2 * x + 1] - my) - uy * (p[2 * x] - mx);
        const side = lean < 0 ? -1 : 1;
        let e = 0;
        inner.forEach((x, j) => {
          const turn = (Math.PI * (j + 1)) / (inner.length + 1);
          const tx = mx + portable.cos(turn) * ux - side * portable.sin(turn) * uy, ty = my + portable.cos(turn) * uy + side * portable.sin(turn) * ux;
          e += portable.square(p[2 * x] - tx) + portable.square(p[2 * x + 1] - ty);
        });
        // (firmly: the arc is a half circle, whatever pulls on the point the boson leaves from)
        return (20 * rules.loop * e) / r;
      }));
      continue;
    }
    // a regular polygon: each corner the same angle
    const n = loop.points.length;
    if (n < 3) continue;
    const corner = (Math.PI * (n - 2)) / n;
    loop.points.forEach((v, k) => {
      const a = loop.points[(k + n - 1) % n], b = loop.points[(k + 1) % n];
      terms.push(term([a, v, b], (p) => {
        const ax = dx(p, v, a), ay = dy(p, v, a), bx = dx(p, v, b), by = dy(p, v, b);
        const angle = portable.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / ((portable.hypot(ax, ay) * portable.hypot(bx, by)) || 1))));
        // (a box held square more firmly: what pulls on its corners must not skew it)
        return (n === 4 ? 3 : 1) * rules.loop * portable.square(angle - corner);
      }));
    });
    // ...standing upright: a box with its sides level and upright, a triangle (or any other
    // polygon) with one side upright, facing what comes in
    const sides = loop.points.map((v, k) => [v, loop.points[(k + 1) % n]] as const);
    terms.push(term(loop.points, (p) => {
      const turns = sides.map(([a, b]) => portable.atan2(dy(p, a, b), dx(p, a, b)));
      if (n === 4) return 3 * rules.loopUpright * turns.reduce((e, t) => e + portable.square(portable.sin(2 * t)), 0);
      return rules.loopUpright * Math.min(...turns.map((t) => portable.square(portable.cos(t))));
    }));
  }
  return { name: "loops", terms };
}

/**
 * Where an arc with no point of its own reaches furthest from its stretch: its top, a radius
 * out from the stretch's middle, on the side the author bent it or else away from the rest of
 * the diagram (from the hadron's other quarks, on a rail). It and its label keep the margin
 * from every point and line off the loop.
 */
function arcTopClear(s: Structure, rules: ForceRules, loop: Loop): Term[] {
  const [a, b] = [loop.run![0], loop.run![loop.run!.length - 1]];
  const line = loop.pathLines![0], { a: from, bend } = s.lines[line];
  const rail = quarkRails(s).find((r) => r.path.includes(a) && r.path.includes(b) && r.others.length);
  const rest = rail ? rail.others : s.ids.map((_, i) => i).filter((i) => !loop.points.includes(i));
  const reach = s.linePad[line];
  const top = new Float64Array(2);
  const topOf = (p: Float64Array) => {
    const mx = (p[2 * a] + p[2 * b]) / 2, my = (p[2 * a + 1] + p[2 * b + 1]) / 2;
    const ux = (p[2 * b] - p[2 * a]) / 2, uy = (p[2 * b + 1] - p[2 * a + 1]) / 2;
    // square to the stretch, on the arc's side
    let nx = uy, ny = -ux;
    if (bend !== undefined) {
      // (the author's bend bulges left of travel from the line's first point, on screen (y down))
      const forward = from === a ? 1 : -1;
      if (Math.sign(bend) * forward < 0) { nx = -nx; ny = -ny; }
    } else {
      let rx = 0, ry = 0;
      for (const i of rest) { rx += p[2 * i] - mx; ry += p[2 * i + 1] - my; }
      if (rx * nx + ry * ny > 0) { nx = -nx; ny = -ny; }
    }
    top[0] = mx + nx; top[1] = my + ny;
    return top;
  };
  const push = (shortfall: number) => (shortfall > 0 ? rules.clearance * portable.square(shortfall) : 0);
  const near = [a, b, ...(rail ? [] : rest)];
  const terms: Term[] = [];
  s.ids.forEach((_, i) => {
    if (loop.points.includes(i)) return;
    terms.push(limit([...near, i], (p) => { const t = topOf(p); return push(rules.margin + reach + s.pad[i] - portable.hypot(p[2 * i] - t[0], p[2 * i + 1] - t[1])); }));
  });
  s.lines.forEach((l, k) => {
    if (loop.lines.includes(k)) return;
    terms.push(limit([...near, l.a, l.b], (p) => {
      const t = topOf(p);
      const vx = p[2 * l.b] - p[2 * l.a], vy = p[2 * l.b + 1] - p[2 * l.a + 1], wx = t[0] - p[2 * l.a], wy = t[1] - p[2 * l.a + 1];
      const u = Math.max(0, Math.min(1, (vx * wx + vy * wy) / ((vx * vx + vy * vy) || 1)));
      return push(rules.margin + reach - portable.hypot(wx - u * vx, wy - u * vy));
    }));
  });
  return terms;
}

/** The forces layout v2 balances, in the order they are described in the docs. */
/**
 * A moving particle's last decay fans out about the way it travels: the products' mean
 * heading points forward, so the lepton and neutrino of a W leave either side of level, not
 * both upward. (Not where a heavy particle carries on: it keeps its heading and the light one
 * leaves to the side.)
 */
export function forwardForks(s: Structure, rules: ForceRules): Force {
  const terms: Term[] = [];
  // (in a SUSY cascade a boson decays along its own heading: its products fan out about the
  // way it was going, not about level)
  const cascade = s.lines.some((l) => l.heavy);
  const loopCorners = new Set(s.loops.flatMap((loop) => loop.points));
  for (const { from, at, products } of movingDecays(s)) {
    if (!products.every((j) => s.external[j])) continue;
    if (s.linesAt[at].some((l) => s.lines[l].heavy)) continue;
    // (every boson decays along its own heading: its products go the way it was going; in a
    // hadron diagram the quarks go where their hadrons are, and with the final plane first
    // every last decay forks about level)
    // (nor at a loop's corner: the loop's shape sets the angles there)
    // (a boson, a W, Z, photon or scalar; a fermion's decay, t -> b W, has its own rules)
    const incoming = s.linesAt[at].find((l) => s.lines[l].a === from || s.lines[l].b === from);
    const boson = incoming !== undefined && !s.lines[incoming].fermion;
    const alongParent = !rules.planeFirst && (cascade || (boson && s.hadrons.length === 0 && !loopCorners.has(at) && !loopCorners.has(from)));
    // (outside a cascade the boson's heading is taken as given: the term turns its products,
    // not the boson, so a W's decay cannot tilt the diagram behind it)
    terms.push(term(cascade && !rules.planeFirst ? [from, at, ...products] : [at, ...products], (p) => {
      let mx = 0, my = 0;
      for (const j of products) {
        const x = dx(p, at, j), y = dy(p, at, j), n = portable.hypot(x, y) || 1;
        mx += x / n; my += y / n;
      }
      const n = portable.hypot(mx, my) || 1;
      if (!alongParent) return rules.forwardFork * portable.square(my / n);
      const px = dx(p, from, at), py = dy(p, from, at), pn = portable.hypot(px, py) || 1;
      return rules.forwardFork * portable.square((mx * py - my * px) / (n * pn));
    }));
  }
  // a SUSY particle that ends its chain by falling into ordinary particles alone (an R-parity
  // violating chargino -> l Z): they fan out about the way it was going
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  s.ids.forEach((_, at) => {
    if (s.external[at]) return;
    const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
    const made = s.linesAt[at].filter((l) => s.time[other(l, at)] > s.time[at]);
    if (into.length !== 1 || !s.lines[into[0]].heavy || made.length < 2 || made.some((l) => s.lines[l].heavy)) return;
    const from = other(into[0], at), products = made.map((l) => other(l, at));
    terms.push(term([from, at, ...products], (p) => {
      let mx = 0, my = 0;
      for (const j of products) { const x = dx(p, at, j), y = dy(p, at, j), n = portable.hypot(x, y) || 1; mx += x / n; my += y / n; }
      const n = portable.hypot(mx, my) || 1;
      const px = dx(p, from, at), py = dy(p, from, at), pn = portable.hypot(px, py) || 1;
      // (and each keeps within a narrow cone about that way: they go on with it)
      let wide = 0;
      for (const j of products) {
        const x = dx(p, at, j), y = dy(p, at, j), c = (x * px + y * py) / ((portable.hypot(x, y) || 1) * pn);
        const off = portable.acos(Math.max(-1, Math.min(1, c))) - (20 * Math.PI) / 180;
        if (off > 0) wide += off * off;
      }
      return rules.forwardFork * (portable.square((mx * py - my * px) / (n * pn)) + wide);
    }));
  });
  // a particle made at rest (a resonance from the incoming particles, W* -> H W) decays back
  // to back: its two products fork symmetrically about its own line
  s.ids.forEach((_, at) => {
    if (s.external[at]) return;
    const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
    const made = s.linesAt[at].map((l) => other(l, at)).filter((j) => s.time[j] > s.time[at]);
    if (into.length !== 1 || made.length !== 2) return;
    const from = other(into[0], at);
    if (s.external[from] || !isAtRest(s, from)) return;
    // (the particle's own line is held level; the term turns what it decays to, not it; in a
    // hadron diagram, where the line is free to settle between the hadrons, both)
    terms.push(term(s.hadrons.length ? [from, at, ...made] : [at, ...made], (p) => {
      let mx = 0, my = 0;
      for (const j of made) { const x = dx(p, at, j), y = dy(p, at, j), n = portable.hypot(x, y) || 1; mx += x / n; my += y / n; }
      const n = portable.hypot(mx, my) || 1;
      const px = dx(p, from, at), py = dy(p, from, at), pn = portable.hypot(px, py) || 1;
      return 4 * rules.forwardFork * portable.square((mx * py - my * px) / (n * pn));
    }));
  });
  // a boson that decays to two particles has them mirrored about its own line, whatever they
  // decay to in turn (R -> S H): equal angles either side, equal lengths; the products turn,
  // not the boson (in a cascade, a hadron diagram or at a loop the other rules decide)
  if (!rules.planeFirst && !cascade && !s.hadrons.length) s.ids.forEach((_, at) => {
    if (s.external[at] || loopCorners.has(at)) return;
    const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
    const made = s.linesAt[at].map((l) => other(l, at)).filter((j) => s.time[j] > s.time[at]);
    if (into.length !== 1 || made.length !== 2 || s.lines[into[0]].fermion || made.every((j) => s.external[j])) return;
    const from = other(into[0], at);
    if (s.external[from]) return;
    const [j, k] = made;
    terms.push(term([at, j, k], (p) => {
      const px = dx(p, from, at), py = dy(p, from, at), pn = portable.hypot(px, py) || 1;
      const ux = px / pn, uy = py / pn;
      const ax = dx(p, at, j), ay = dy(p, at, j), bx = dx(p, at, k), by = dy(p, at, k);
      // k reflected across the parent's line lands on j
      const along = bx * ux + by * uy, rx = 2 * along * ux - bx, ry = 2 * along * uy - by;
      return rules.mirror * 10 * (portable.square(ax - rx) + portable.square(ay - ry));
    }));
  });
  // with the final plane first, every decay forks symmetrically about level, the ones that
  // decay on as well as the last (R -> S H, H -> Z Z): its products, not the particle, turn
  if (rules.planeFirst) s.ids.forEach((_, at) => {
    if (s.external[at] || loopCorners.has(at)) return;
    // (a point a beam comes into is not a decay: a spectator quark keeps its own angle)
    if (s.linesAt[at].some((l) => s.external[other(l, at)] && s.time[other(l, at)] === 0)) return;
    const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
    const made = s.linesAt[at].map((l) => other(l, at)).filter((j) => s.time[j] > s.time[at]);
    if (into.length !== 1 || made.length < 2) return;
    terms.push(term([at, ...made], (p) => {
      let mx = 0, my = 0;
      for (const j of made) { const x = dx(p, at, j), y = dy(p, at, j), n = portable.hypot(x, y) || 1; mx += x / n; my += y / n; }
      return 4 * rules.forwardFork * portable.square(my / (portable.hypot(mx, my) || 1));
    }));
  });
  // a lone particle coming in (a stop decaying on its own) comes in level, and what it decays
  // to forks symmetrically about its line: equal and opposite angles for two products
  const incoming = s.ids.map((_, i) => i).filter((i) => s.external[i] && s.time[i] === 0);
  // (not where it enters a loop: the loop's shape sets its corners)
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  if (incoming.length === 1 && !onLoop.has(other(s.linesAt[incoming[0]][0], incoming[0]))) {
    const leg = incoming[0], entry = other(s.linesAt[leg][0], leg);
    const products = s.linesAt[entry].map((l) => other(l, entry)).filter((j) => j !== leg && s.time[j] > s.time[entry]);
    // (about level, which the incoming line is held to: so the term moves the products, not the line)
    if (products.length >= 2) terms.push(term([entry, ...products], (p) => {
      let mx = 0, my = 0;
      for (const j of products) { const x = dx(p, entry, j), y = dy(p, entry, j), n = portable.hypot(x, y) || 1; mx += x / n; my += y / n; }
      const n = portable.hypot(mx, my) || 1;
      return 4 * rules.forwardFork * portable.square(my / n);
    }));
  }
  return { name: "forward forks", terms };
}

/**
 * Where a particle passes a point and carries on as itself: the point after it, or -1. A
 * mixing or insertion (one line in, one out), or a point where it gives off a boson that
 * leaves the diagram and goes on as the same particle (u -> u H).
 */
export function carriesOnTo(s: Structure, at: number): number {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  if (s.external[at]) return -1;
  const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
  const out = s.linesAt[at].filter((l) => s.time[other(l, at)] > s.time[at]);
  if (into.length !== 1) return -1;
  if (out.length === 1 && s.linesAt[at].length === 2) return other(out[0], at);
  const name = s.lineLabel[into[0]];
  const same = out.filter((l) => s.lines[l].fermion && name !== undefined && s.lineLabel[l] === name && !s.external[other(l, at)]);
  const rest = out.filter((l) => !same.includes(l));
  if (same.length !== 1 || rest.length !== 1 || s.lines[rest[0]].fermion || !s.external[other(rest[0], at)]) return -1;
  return other(same[0], at);
}

/**
 * The lines a particle made at rest runs along: out of a meeting of two or more earlier lines,
 * on through any mixing or insertion (one particle turning into another on its way).
 */
export function madeAtRestLines(s: Structure): [number, number][] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  const runs: [number, number][] = [];
  s.ids.forEach((_, v) => {
    if (s.external[v] || onLoop.has(v)) return;
    const earlier = s.linesAt[v].filter((l) => s.time[other(l, v)] < s.time[v]);
    const later = s.linesAt[v].filter((l) => s.time[other(l, v)] > s.time[v]);
    if (earlier.length < 2 || later.length !== 1) return;
    runs.push([v, other(later[0], v)]);
    for (let at = other(later[0], v), seen = 0; seen < 8; seen++) {
      const next = carriesOnTo(s, at);
      if (next < 0 || onLoop.has(at) || s.external[next]) break;
      runs.push([at, next]);
      at = next;
    }
  });
  return runs;
}

/**
 * What two or more particles make where they meet runs dead level: the H of vector-boson
 * fusion, an H or A out of a gluon loop, an s-channel photon, Z or W. Two particles meeting
 * never deflect what they make. (A loop counts as one meeting point: its single product leaves
 * it level.)
 */
export function restLevel(s: Structure, rules: ForceRules): Force {
  const lone = s.lines.filter((line) => s.external[line.a] && s.external[line.b]);
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const onLoop = new Map<number, number>();
  s.loops.forEach((loop, k) => loop.points.forEach((i) => onLoop.set(i, k)));
  const terms: Term[] = [];
  const level = (from: number, to: number) => terms.push(term([from, to], (p) => { const x = dx(p, from, to), y = dy(p, from, to); return rules.restLevel * portable.square(y / (portable.hypot(x, y) || 1)); }));
  // a line on its own (a key of line styles) lies level
  for (const line of lone) level(line.a, line.b);
  // an external field's line stands upright, the field below the point it acts at
  s.field.forEach((isField, i) => {
    if (!isField) return;
    const v = other(s.linesAt[i][0], i);
    terms.push(term([v, i], (p) => { const x = dx(p, v, i), y = dy(p, v, i); return rules.restLevel * (1 - y / (portable.hypot(x, y) || 1)); }));
  });
  // a vertex where two or more earlier lines meet and one line leaves (on through a mixing or
  // insertion: Phi -> Phi_hs stays level)
  for (const [a, b] of madeAtRestLines(s)) level(a, b);
  // where an incoming quark that radiated annihilates (q qbar -> Z' after q -> q g): the boson
  // it makes runs level, as at any meeting
  s.radiatesInto.forEach((w) => {
    if (w < 0) return;
    const boson = s.linesAt[w].find((l) => !s.lines[l].fermion && !s.external[other(l, w)]);
    if (boson !== undefined) level(w, other(boson, w));
  });
  // a point on an exchange between the incoming particles (the WW of vector-boson fusion,
  // drawn upright) whose one product leaves the exchange
  for (const path of s.spines) for (const v of path.slice(1, -1)) {
    if (onLoop.has(v)) continue;
    const off = s.linesAt[v].map((l) => other(l, v)).filter((j) => !path.includes(j) && s.time[j] > s.time[v]);
    if (off.length === 1) level(v, off[0]);
  }
  // a loop that two or more lines come into and one line leaves
  s.loops.forEach((loop) => {
    const inLoop = new Set(loop.points);
    const outside = loop.points.flatMap((i) => s.linesAt[i].filter((l) => !inLoop.has(other(l, i))).map((l) => ({ at: i, to: other(l, i) })));
    const into = outside.filter(({ at, to }) => s.time[to] < s.time[at]), leaving = outside.filter(({ at, to }) => s.time[to] > s.time[at]);
    if (into.length >= 2 && leaving.length === 1) level(leaving[0].at, leaving[0].to);
  });
  return { name: "rest level", terms };
}

/** The outgoing legs of one decay are the same length (a W's lepton and neutrino, a Z's quarks). */
export function equalProducts(s: Structure, rules: ForceRules): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const terms: Term[] = [];
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const legs = s.linesAt[v].map((l) => other(l, v)).filter((j) => s.external[j] && s.time[j] > s.time[v]);
    for (let m = 1; m < legs.length; m++) {
      const [a, b] = [legs[m - 1], legs[m]];
      // (two of the same particle, the two invisibles of an S, are held to one length firmly)
      const name = (i: number) => s.label[i] ?? s.particle[i];
      const twins = name(a) !== undefined && name(a) === name(b);
      terms.push(term([v, a, b], (p) => (twins ? rules.mirror * 10 : rules.equalProducts) * portable.square(portable.hypot(dx(p, v, a), dy(p, v, a)) - portable.hypot(dx(p, v, b), dy(p, v, b)))));
    }
  });
  return { name: "equal products", terms };
}

/** Two names for a particle and its antiparticle: chi and chibar, e+ and e-, W+ and W-. */
function conjugates(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b || a === b) return false;
  const base = (n: string) => n.replace(/(bar|[+-])$/, "");
  const signs = [a, b].map((n) => n.slice(base(n).length)).sort().join(" ");
  return base(a) === base(b) && (signs === " bar" || signs === "+ -");
}

/**
 * A particle and its antiparticle made together at a contact vertex (one where four or more
 * lines meet, as an effective interaction draws it): the dark-matter pair of a mono-X search.
 * Papers draw them leaving together, close and forward, as one thing.
 */
export function pairsLeavingTogether(s: Structure): { at: number; legs: number[] }[] {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const out: { at: number; legs: number[] }[] = [];
  s.ids.forEach((_, v) => {
    if (s.external[v]) return;
    const outgoing = s.linesAt[v].filter((l) => s.external[other(l, v)] && s.time[other(l, v)] > s.time[v]);
    // a bundle: three or more plain legs of one kind, at most one of them named (the fragments
    // of a proton that broke up, p*)
    const plain = outgoing.filter((l) => s.lines[l].fermion);
    if (plain.length >= 3 && plain.filter((l) => s.label[other(l, v)] || s.particle[other(l, v)]).length <= 1) { out.push({ at: v, legs: plain.map((l) => other(l, v)) }); return; }
    // (a vertex that is all legs, a 2 -> 2 contact, is an X instead)
    if (s.linesAt[v].length < 4 || s.linesAt[v].every((l) => s.lines[l].leg)) return;
    // (fermions, or anything out of a blob: a quartic gauge vertex's W+ W- is a vertex of the
    // theory, drawn evenly, but the W+ W- of photons fusing in a blob leave together)
    const legs = outgoing.filter((l) => s.lines[l].fermion || s.blob[v]).map((l) => other(l, v));
    for (let m = 0; m < legs.length; m++) for (let k = m + 1; k < legs.length; k++) {
      const [x, y] = [legs[m], legs[k]];
      if ((conjugates(s.particle[x], s.particle[y]) || conjugateLabels(s.label[x], s.label[y])) && !out.some((o) => o.at === v)) out.push({ at: v, legs: [x, y] });
    }
  });
  return out;
}

/** Two TeX labels for a particle and its antiparticle: W^+ and W^-, \ell^\pm and \ell^\mp, b and \bar b. */
function conjugateLabels(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b || a === b) return false;
  const norm = (t: string) => t.replace(/\s+/g, "").replace(/\^\{?(\+|-|\\pm|\\mp)\}?/g, "^*").replace(/\\(bar|overline)\{?([A-Za-z])\}?/g, "$2");
  return norm(a) === norm(b);
}

/** Such a pair leaves at a narrow angle between them, heading forward. */
export function pairsTogether(s: Structure, rules: ForceRules): Force {
  const opening = (rules.pairOpening * Math.PI) / 180;
  return {
    name: "pairs together",
    terms: pairsLeavingTogether(s).map(({ at, legs }) => term([at, ...legs], (p) => {
      // (each neighbouring two at the opening, the whole heading forward)
      const angles = legs.map((j) => portable.atan2(dy(p, at, j), dx(p, at, j))).sort((x, y) => x - y);
      let e = 0, mx = 0, my = 0;
      for (let k = 0; k < angles.length; k++) {
        mx += portable.cos(angles[k]); my += portable.sin(angles[k]);
        if (k > 0) e += portable.square(angles[k] - angles[k - 1] - opening);
      }
      return rules.pairTogether * (e + portable.square(portable.atan2(my, mx)));
    })),
  };
}

/**
 * An incoming quark that gives off a gluon on its way into the collision (a blob) runs on
 * straight: the gluon sprouts from it, initial-state radiation, rather than bending it.
 */
export function radiationIntoBlob(s: Structure): [number, number, number][] {
  return passThroughs(s).filter(([a, v, b]) => [a, b].some((j) => (s.blob[j] || s.radiatesInto[v] === j) && s.time[j] === s.time[v]));
}

export function straightIntoBlob(s: Structure, rules: ForceRules): Force {
  // (and a point where just two lines meet, a mixing or a mass insertion, is one line that
  // changes on the way: it runs straight through, Z0* into rho_T, nu into N)
  const onLoop = new Set(s.loops.flatMap((loop) => loop.points));
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  // (not a point whose two lines both end outside, a quark pair from the vacuum: that is a V)
  const twoLine = s.ids.map((_, v) => v).filter((v) => !s.external[v] && s.linesAt[v].length === 2 && !onLoop.has(v) && !s.blob[v] && !s.linesAt[v].every((l) => s.external[other(l, v)]))
    .map((v) => [other(s.linesAt[v][0], v), v, other(s.linesAt[v][1], v)] as [number, number, number]);
  // (a scalar that gives off a boson and carries on, H+- -> W h0, runs straight on as a quark would)
  const scalarOn = s.ids.map((_, v) => v).filter((v) => !s.external[v] && s.linesAt[v].length === 3 && !onLoop.has(v)).flatMap((v) => {
    const near = s.linesAt[v].map((l) => [l, other(l, v)] as const);
    const scalars = near.filter(([l]) => s.lines[l].dashed);
    if (scalars.length !== 2) return [];
    const [[, a], [, b]] = scalars;
    if ((s.time[a] - s.time[v]) * (s.time[b] - s.time[v]) >= 0) return [];
    const rest = near.find(([l]) => !s.lines[l].dashed);
    return rest && !s.external[a] && !s.external[b] ? [[a, v, b] as [number, number, number]] : [];
  });
  // (and an exchange between the beams, with things given off along it, runs straight)
  // (except where the exchange leans forward into a point that makes something going on)
  const aheadPoints = exchangePointsAhead(s);
  const spineRuns = s.spines.flatMap((path) => path.slice(1, -1).map((v, k) => [path[k], v, path[k + 2]] as [number, number, number])).filter(([, v]) => !aheadPoints.has(v));
  const fermionThrough = (a: number, v: number, b: number) => [a, b].every((j) => s.linesAt[v].some((l) => other(l, v) === j && s.lines[l].fermion));
  // (a spectator: a quark from a beam that gives off one boson into the exchange and leaves,
  // u -> d W in t-channel single top, runs straight through, as papers draw it)
  // (in a short diagram, two decays deep at most: under a long cascade, b W -> T -> Z t -> ...,
  // the spectator scatters away instead, to give the cascade room)
  const deepest = Math.max(0, ...decayGenerations(s));
  const spineEnds = new Set(s.spines.flatMap((path) => [path[0], path[path.length - 1]]));
  // (and only a lone spectator: where both beams' quarks give off the bosons that meet, vector-
  // boson fusion, the two quarks angle into the exchange and out of it)
  const vbfTerms: Term[] = [];
  const passing = passThroughs(s).filter(([a, v, b]) => spineEnds.has(v) && s.external[a] && s.external[b]);
  // (a spectator scatters: it leaves at the angle it came in, mirrored, as papers draw a quark
  // that gives off a boson into the exchange; not held straight)
  const spectators: [number, number, number][] = [];
  // (where both are spectators each quark leaves its vertex at the angle it came in, mirrored
  // across the level line: into the exchange and out of it alike)
  if (passing.length >= 1) for (const [a0, v, b0] of passing) {
    const [a, b] = s.time[a0] < s.time[b0] ? [a0, b0] : [b0, a0];
    vbfTerms.push(term([a, v, b], (p) => {
      const ux = dx(p, a, v), uy = dy(p, a, v), wx = dx(p, v, b), wy = dy(p, v, b);
      const nu = portable.hypot(ux, uy) || 1, nw = portable.hypot(wx, wy) || 1;
      // (and only a little: a turn of about 25 degrees in all, 12 in and 12 out; more by hand)
      const turn = portable.acos(Math.max(-1, Math.min(1, (ux * wx + uy * wy) / (nu * nw))));
      return rules.mirror * 10 * (portable.square(wx / nw - ux / nu) + portable.square(wy / nw + uy / nu)) + rules.mirror * 10 * portable.square(turn - (25 * Math.PI) / 180);
    }));
  }
  // (final-state radiation: a line that gives off one boson and then leaves the diagram runs
  // straight on, the boson sprouting from it, as a lepton radiating a photon is drawn)
  // (radiation, not a decay: the line is the same particle before and after, or unnamed
  // before it, l -> l gamma, not t -> b W)
  const lineBetween = (a: number, b: number) => s.linesAt[a].find((l) => s.lines[l].a === b || s.lines[l].b === b)!;
  // (not a quark that ends under a cap: it turns to run beside the cap's other quark)
  const capped = new Set(s.hadrons.filter((h) => h.cap && h.legs.length === 2).flatMap((h) => h.legs));
  const fsr = passThroughs(s).filter(([a, v, b]) => {
    const [early, late] = s.time[a] < s.time[b] ? [a, b] : [b, a];
    if (capped.has(late)) return false;
    const given = s.linesAt[v].map((l) => other(l, v)).find((j) => j !== a && j !== b);
    if (!(s.external[late] && !s.external[early] && given !== undefined && s.time[given] > s.time[v] && !s.lines[s.linesAt[v].find((l) => other(l, v) === given)!].fermion)) return false;
    const before = s.lineLabel[lineBetween(early, v)], after = s.lineLabel[lineBetween(v, late)] ?? s.label[late] ?? s.particle[late];
    return before === undefined || before === after;
  });
  // (a mixing or insertion is held straight harder: it is one line, and any bend shows)
  // (and a beam that passes through a blob, an ion giving off a photon, runs straight on through it)
  const throughBlob = passThroughs(s).filter(([a, v, b]) => s.blob[v] && s.external[a] && s.external[b]);
  const runs: [number, number, number, number][] = [...radiationIntoBlob(s).map(([a, v, b]) => [a, v, b, 1] as [number, number, number, number]), ...twoLine.map(([a, v, b]) => [a, v, b, 5] as [number, number, number, number]),
    ...throughBlob.map(([a, v, b]) => [a, v, b, 1] as [number, number, number, number]),
    ...scalarOn.map(([a, v, b]) => [a, v, b, 0.5] as [number, number, number, number]),
    // (a quark line along the exchange, a fermion carried through, is held straight firmly)
    ...spineRuns.map(([a, v, b]) => [a, v, b, fermionThrough(a, v, b) ? 2 : 0.5] as [number, number, number, number]),
    ...spectators.map(([a, v, b]) => [a, v, b, 0.5] as [number, number, number, number]),
    ...fsr.map(([a, v, b]) => [a, v, b, 0.5] as [number, number, number, number])];
  return {
    name: "straight into blob",
    terms: [...runs.map(([a, v, b, k]) => term([a, v, b], (p) => {
      const ax = dx(p, v, a), ay = dy(p, v, a), bx = dx(p, v, b), by = dy(p, v, b);
      return k * rules.rail * (1 + (ax * bx + ay * by) / ((portable.hypot(ax, ay) || 1) * (portable.hypot(bx, by) || 1)));
    })), ...vbfTerms],
  };
}

/**
 * The b of a top's decay (t -> b W, the W decaying on) leaves to the outside: turned
 * `givenOffTurn` from the top's heading, the way the top is heading (up or down), so the quark
 * sits on the outside of the diagram and the W carries the decay on. Only the b turns: the W and
 * everything after it lie as they would without this.
 */
export function givenOffSideways(s: Structure, rules: ForceRules): Force {
  const other = (l: number, i: number) => (s.lines[l].a === i ? s.lines[l].b : s.lines[l].a);
  const turn = (rules.givenOffTurn * Math.PI) / 180;
  const terms: Term[] = [];
  s.ids.forEach((_, at) => {
    if (s.external[at] || !givesOffFermion(s, at)) return;
    const into = s.linesAt[at].filter((l) => s.time[other(l, at)] < s.time[at]);
    const from = other(into[0], at);
    const fermion = s.linesAt[at].find((l) => s.time[other(l, at)] > s.time[at] && s.lines[l].fermion)!;
    const leg = other(fermion, at);
    // (the term turns the b alone: the top's heading is the top's to set)
    terms.push(term([at, leg], (p) => {
      // (outside: see topOutside; where a top has none, its b turns the way it already leans)
      const heading = portable.atan2(dy(p, from, at), dx(p, from, at));
      const away = topOutside(s, p, from, at) || Math.sign(dx(p, from, at) * dy(p, at, leg) - dy(p, from, at) * dx(p, at, leg)) || -1;
      let miss = portable.atan2(dy(p, at, leg), dx(p, at, leg)) - (heading + away * turn);
      miss = portable.atan2(portable.sin(miss), portable.cos(miss));
      return rules.givenOffSide * portable.square(miss);
    }));
  });
  return { name: "given off sideways", terms };
}

export function allForces(s: Structure, rules: ForceRules): Force[] {
  return [straightIntoBlob(s, rules), pairsTogether(s, rules), restLevel(s, rules), equalProducts(s, rules), forwardForks(s, rules), lineLength(s, rules), evenAngles(s, rules), timeFlow(s, rules), timeOrder(s, rules), clearance(s, rules), uprightExchange(s, rules), exchangeFan(s, rules), showerFan(s, rules), mirrorBranches(s, rules), beamsStartTogether(s, rules), finalPlane(s, rules), lightOutside(s, rules), heavyCarriesOn(s, rules), givenOffSideways(s, rules), noConverging(s, rules), hadrons(s, rules), vacuumArcs(s, rules), loopShapes(s, rules), nucleusScatter(s)];
}
