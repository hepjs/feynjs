import { Curve, fmt } from "../geometry/curve.ts";
import type { RenderOptions } from "../render/render.ts";
import type { Scene } from "../render/scene.ts";
import { diagramModel, svgDocument } from "../render/svg.ts";
import { explainParsed } from "../tools/explain.ts";
import { layoutLabel } from "../label/label.ts";
import type { Diagram, EdgeStyle } from "../model.ts";
import { drawLine } from "../render/lines.ts";
import type { Theme } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/** Where a final state goes in the lab: its pseudorapidity and azimuth (radians). */
export interface Direction { id: string; eta: number; phi: number; branch?: number }

/**
 * The kinematic view (`view: kinematic`): the event as a detector sees it rather than as a
 * diagram. Every final state gets a direction. A spectator quark of a t-channel exchange (a
 * beam quark that gives off a boson and leaves) goes far forward or backward, along its own
 * beam; what the collision makes goes central, its branches spread evenly round in azimuth
 * (two of them back to back), and what a particle decays to stays near its direction. A leg
 * can be moved with `eta=`, `phi=` (degrees), or nudged with `deta=`, `dphi=`.
 */
export function eventDirections(d: Diagram, nodes?: Map<string, Direction>, rotate = 30): Direction[] {
  const near = new Map<string, string[]>();
  for (const e of d.edges) {
    if (e.style.line === "none") continue;
    near.set(e.from, [...(near.get(e.from) ?? []), e.to]);
    near.set(e.to, [...(near.get(e.to) ?? []), e.from]);
  }
  const vertex = (id: string) => d.vertices.get(id)!;
  const isLeg = (id: string) => (near.get(id) ?? []).length === 1;
  const incoming = [...near.keys()].filter((id) => isLeg(id) && vertex(id).role === "in").sort((a, b) => (vertex(a).declaredOrder ?? 0) - (vertex(b).declaredOrder ?? 0));
  const outgoing = [...near.keys()].filter((id) => isLeg(id) && vertex(id).role !== "in").sort((a, b) => (vertex(a).declaredOrder ?? 0) - (vertex(b).declaredOrder ?? 0));
  // moments, outward from the incoming legs
  const time = new Map(incoming.map((id) => [id, 0]));
  for (let queue = [...incoming]; queue.length;) {
    const id = queue.shift()!;
    for (const j of near.get(id) ?? []) if (!time.has(j)) { time.set(j, time.get(id)! + 1); queue.push(j); }
  }
  const earlier = (id: string) => (near.get(id) ?? []).filter((j) => (time.get(j) ?? 0) < (time.get(id) ?? 0));
  // a spectator: a leg out of a point a beam came into, where one other line leaves
  const spectatorOf = new Map<string, string>();
  for (const leg of outgoing) {
    const at = near.get(leg)![0], beam = (near.get(at) ?? []).find((j) => incoming.includes(j));
    if (beam && (near.get(at) ?? []).length === 3) spectatorOf.set(leg, beam);
  }
  // the branch each final state belongs to: what the collision made that it came from
  // (walking back to the beams, the first point from the beams' side where the event splits:
  // what leaves it toward this final state is its branch, t or tbar, not the gluon before them)
  const later = (id: string) => (near.get(id) ?? []).filter((j) => (time.get(j) ?? 0) > (time.get(id) ?? 0));
  const branchOf = (leg: string) => {
    const chain = [leg];
    for (let at = near.get(leg)![0]; at !== undefined && !incoming.includes(at); at = earlier(at)[0]) chain.push(at);
    for (let k = chain.length - 1; k > 0; k--) if (later(chain[k]).length >= 2) return chain[k - 1];
    return leg;
  };
  const branches = new Map<string, string[]>();
  for (const leg of outgoing) if (!spectatorOf.has(leg)) { const b = branchOf(leg); branches.set(b, [...(branches.get(b) ?? []), leg]); }
  // each branch goes its own way, evenly round the azimuth (two back to back); at each decay
  // its products fan out about their parent's direction, a little less at every generation, so
  // a top's b and W stay near the top and the W's lepton and neutrino near the W (the next
  // branch's fans mirrored, so the event is as near rotationally symmetric as it can be)
  const out: Direction[] = [];
  const roots = [...branches.keys()];
  const fan = (at: string, phi: number, eta: number, depth: number, mirror: boolean) => {
    if (outgoing.includes(at)) { out.push({ id: at, eta, phi, branch: current }); return; }
    // (and each particle that decays keeps the direction it was given: the two tops back to back)
    nodes?.set(at, { id: at, eta, phi, branch: current });
    const kids = later(at).slice();
    if (mirror) kids.reverse();
    const spread = 0.8 * portable.power(0.75, depth);
    kids.forEach((j, i) => fan(j, phi + (i - (kids.length - 1) / 2) * spread, eta + (i - (kids.length - 1) / 2) * 0.35 * portable.power(0.7, depth), depth + 1, mirror));
  };
  let current = 0;
  // (the whole event turned by `rotate:` degrees, 30 by default, so no branch lies on the axes)
  const turn = (rotate * Math.PI) / 180;
  roots.forEach((root, k) => { current = k; fan(root, turn + (2 * Math.PI * k) / Math.max(1, roots.length), 0, 0, k % 2 === 1); });
  for (const [id, beam] of spectatorOf) {
    const first = incoming.indexOf(beam) === 0;
    out.push({ id, eta: first ? 3 : -3, phi: first ? Math.PI / 2 : -Math.PI / 2 });
  }
  // the author's say
  for (const dir of out) {
    const k = vertex(dir.id).kinematics;
    if (!k) continue;
    if (k.eta !== undefined) dir.eta = k.eta;
    if (k.phi !== undefined) dir.phi = (k.phi * Math.PI) / 180;
    if (k.deta !== undefined) dir.eta += k.deta;
    if (k.dphi !== undefined) dir.phi += (k.dphi * Math.PI) / 180;
  }
  return out;
}

/**
 * What a final state is reconstructed as in the detector: quarks and gluons as jets, b quarks
 * as b-tagged jets, electrons and muons as tracks, a tau as a tau jet, neutrinos and invisible
 * SUSY particles as missing energy. Undefined where the particle is drawn as it is.
 */
export function reconstructedAs(name: string | undefined): EdgeStyle | undefined {
  if (!name) return undefined;
  const n = name.replace(/[\\{}$]/g, "").toLowerCase();
  const object = (o: EdgeStyle["object"]): EdgeStyle => ({ line: "jet", arrow: 0, object: o });
  if (/^(b|bbar|b~|overline ?b|bar ?b)$/.test(n)) return object("btag");
  if (/^(q|qbar|q~|u|d|s|c|ubar|dbar|sbar|cbar|u~|d~|s~|c~|g|gluon|bar ?q|overline ?q)$/.test(n)) return object("jet");
  if (/^(e|e[+-]|mu|mu[+-]|l|l[+-]|ell|lepton|positron|electron|muon)/.test(n)) return object("track");
  if (/^(ta|tau)/.test(n)) return object("tau");
  if (/^(nu|v[emt]?~?$|ve|vm|vt|neutrino)|neutralino|gravitino|lsp|chi|text ?inv/.test(n)) return object("met");
  return undefined;
}

/** Draw the kinematic view: `transverse` looks along the beam, `longitudinal` across it. */
export function drawKinematic(d: Diagram, theme: Theme, projection: "transverse" | "longitudinal", options: { reconstruct?: boolean; intermediates?: boolean; rotate?: number } = {}, scene?: Scene, frame: RenderOptions = {}): string {
  const nodes = new Map<string, Direction>();
  const dirs = eventDirections(d, nodes, options.rotate ?? 30);
  const reconstruct = options.reconstruct ?? true;
  const reach = 2.2 * theme.unitX * theme.forces.lineLength;
  const parts: string[] = [];
  const grey = `stroke="currentColor" stroke-opacity="0.25" fill="none" stroke-width="${fmt(theme.line.stroke * 0.7)}"`;
  // the detector: rings round the beam, or the beam pipe and the barrel's outline
  if (projection === "transverse") {
    for (const r of [0.35, 0.75, 1.05]) parts.push(`<circle cx="0" cy="0" r="${fmt(reach * r)}" ${grey}/>`);
    parts.push(`<circle class="feynjs-ip" cx="0" cy="0" r="3" fill="currentColor"/>`);
  } else {
    parts.push(`<path d="M${fmt(-reach * 1.3)} 0H${fmt(reach * 1.3)}" ${grey}/>`);
    // (a square, as wide as it is tall, beside the circle the transverse view draws)
    parts.push(`<rect x="${fmt(-reach * 1.05)}" y="${fmt(-reach * 1.05)}" width="${fmt(reach * 2.1)}" height="${fmt(reach * 2.1)}" rx="4" ${grey}/>`);
  }
  const labels: string[] = [];
  let x0 = -reach * 1.3, x1 = reach * 1.3, y0 = -reach * 1.1, y1 = reach * 1.1;
  if (projection === "longitudinal") { y0 = -reach * 1.1; y1 = reach * 1.1; }
  // (transverse: how far out a leg reaches falls with how forward it is)
  // (longitudinal: the event turned about the collision by the same angle, the beam and the
  // detector staying put, so what goes straight up and down leans one way forward, one back)
  const tilt = ((options.rotate ?? 30) * Math.PI) / 180;
  const unit = ({ eta, phi }: { eta: number; phi: number }) => {
    if (projection === "transverse") return [portable.cos(phi) / portable.cosh(eta), -portable.sin(phi) / portable.cosh(eta)];
    const [x, y] = [portable.tanh(eta), -portable.cos(phi) / portable.cosh(eta)];
    return [x * portable.cos(tilt) - y * portable.sin(tilt), x * portable.sin(tilt) + y * portable.cos(tilt)];
  };
  const edgeBetween = (a: string, b: string) => d.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
  // (each label clear of the lines and of the labels placed before it: tried at its line's end,
  // then a little further out or to either side, until it touches none; placed once every line
  // is drawn)
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
  const segments: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
  const pending: (() => void)[] = [];
  const label = (text: string | undefined, end: { x: number; y: number }, ux: number, uy: number, faint = false) => { if (text) pending.push(() => place(text, end, ux, uy, faint)); };
  const crosses = (bx0: number, by0: number, bx1: number, by1: number) => segments.some(({ a, b }) => {
    const steps = Math.max(2, Math.ceil(portable.hypot(b.x - a.x, b.y - a.y) / 3));
    for (let k = 0; k <= steps; k++) { const x = a.x + ((b.x - a.x) * k) / steps, y = a.y + ((b.y - a.y) * k) / steps; if (x > bx0 && x < bx1 && y > by0 && y < by1) return true; }
    return false;
  });
  const place = (text: string, end: { x: number; y: number }, ux: number, uy: number, faint: boolean) => {
    const box = layoutLabel(text, theme.fontSize * (faint ? 0.85 : 1), theme.wordLabelScale);
    const n = portable.hypot(ux, uy) || 1, gap = theme.fontSize * 0.9;
    const at = (out: number, side: number) => {
      const cx = end.x + (ux / n) * out - (uy / n) * side, cy = end.y + (uy / n) * out + (ux / n) * side;
      return { lx: cx - box.width / 2, ly: cy + (box.ascent - box.descent) / 2 };
    };
    const room = theme.fontSize * 0.45;
    const clear = ({ lx, ly }: { lx: number; ly: number }) => placed.every((b) => lx + box.width < b.x0 - room || lx > b.x1 + room || ly + box.descent < b.y0 - room || ly - box.ascent > b.y1 + room)
      && !crosses(lx - 2, ly - box.ascent - 2, lx + box.width + 2, ly + box.descent + 2);
    const tries = [0, 1, -1, 2, -2, 3, -3].flatMap((side) => [1, 1.6, 2.3].map((out) => at(gap * out, side * theme.fontSize * 0.8)));
    const { lx, ly } = tries.find(clear) ?? tries[0];
    placed.push({ x0: lx, y0: ly - box.ascent, x1: lx + box.width, y1: ly + box.descent });
    labels.push(`<g transform="translate(${fmt(lx)} ${fmt(ly)})" fill="currentColor"${faint ? ' opacity="0.6"' : ""}>${box.svg}</g>`);
    x0 = Math.min(x0, lx); x1 = Math.max(x1, lx + box.width); y0 = Math.min(y0, ly - box.ascent); y1 = Math.max(y1, ly + box.descent);
  };
  // where each final state starts: the collision point, or (with intermediates shown) the end of
  // the particle it came from, each particle that decays drawn pointing where its products go
  const start = new Map<string, { x: number; y: number }>();
  if (options.intermediates) {
    const near = new Map<string, string[]>();
    for (const e of d.edges) { near.set(e.from, [...(near.get(e.from) ?? []), e.to]); near.set(e.to, [...(near.get(e.to) ?? []), e.from]); }
    const dirOf = new Map(dirs.map((x) => [x.id, unit(x)]));
    const parentOf = new Map<string, string>();
    for (const { id } of dirs) parentOf.set(id, near.get(id)![0]);
    // walk each final state back to the collision: the particles that decay on its way
    const chains = dirs.map(({ id }) => {
      const chain: string[] = [];
      for (let at = parentOf.get(id)!, from = id; at && (near.get(at) ?? []).length === 3; ) {
        const back = (near.get(at) ?? []).filter((j) => j !== from && !dirOf.has(j));
        if (back.length !== 1 || (near.get(back[0]) ?? []).length !== 3 || (near.get(back[0]) ?? []).some((j) => d.vertices.get(j)!.role === "in")) { chain.unshift(at); break; }
        chain.unshift(at); from = at; at = back[0];
      }
      return { id, chain };
    });
    // each decaying particle: pointing the mean way of what it ends in, a step out per generation
    const ends = new Map<string, number[][]>();
    for (const { id, chain } of chains) for (const p of chain) ends.set(p, [...(ends.get(p) ?? []), dirOf.get(id)!]);
    // (a particle made at rest, whose products' directions cancel, has no direction: not drawn)
    const meanOf = (p: string): [number, number] => { const vs = ends.get(p)!; return [vs.reduce((t, v) => t + v[0], 0) / vs.length, vs.reduce((t, v) => t + v[1], 0) / vs.length]; };
    // (nor anything whose final states lie in more than one branch: the gluon before a top pair)
    const branchOf = new Map(dirs.map((x) => [x.id, x.branch]));
    const branchesUnder = new Map<string, Set<number | undefined>>();
    for (const { id, chain } of chains) for (const p of chain) branchesUnder.set(p, new Set([...(branchesUnder.get(p) ?? []), branchOf.get(id)]));
    for (const c of chains) c.chain = c.chain.filter((p) => portable.hypot(...meanOf(p)) > 0.3 && branchesUnder.get(p)!.size === 1);
    const at = new Map<string, { x: number; y: number }>();
    for (const { chain } of chains) chain.forEach((p, k) => {
      if (at.has(p)) return;
      // (along the direction the decays gave it, else the mean of what it ends in)
      const given = nodes.get(p);
      const [mx, my] = given ? unit(given) : meanOf(p);
      const n = portable.hypot(mx, my) || 1, r = reach * 0.3 * (k + 1);
      at.set(p, { x: (mx / n) * r, y: (my / n) * r });
    });
    for (const { id, chain } of chains) {
      chain.forEach((p, k) => {
        const from = k ? at.get(chain[k - 1])! : { x: 0, y: 0 }, to = at.get(p)!;
        const e = k ? edgeBetween(chain[k - 1], p) : d.edges.find((x) => (x.from === p || x.to === p) && !chain.includes(x.from === p ? x.to : x.from) && !dirOf.has(x.from === p ? x.to : x.from));
        const key = `${k ? chain[k - 1] : "o"}>${p}`;
        if (e && !start.has(key)) {
          start.set(key, to);
          parts.push(`<g opacity="0.55">${drawLine(Curve.line(from, to), { ...e.style, arrow: 0 }, theme.line)}</g>`);
          segments.push({ a: from, b: to });
          // (named beside its middle, on the side away from the collision, clear of what it makes at its end)
          const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, ax = -(to.y - from.y), ay = to.x - from.x;
          const away = ax * mid.x + ay * mid.y >= 0 ? 1 : -1;
          label(e.label, mid, ax * away, ay * away, true);
        }
      });
      if (chain.length) start.set(id, at.get(chain[chain.length - 1])!);
    }
  }
  for (const { id, eta, phi } of dirs) {
    const v = d.vertices.get(id)!;
    const e = d.edges.find((edge) => edge.from === id || edge.to === id);
    if (!e) continue;
    const [ux, uy] = unit({ eta, phi });
    const from = start.get(id) ?? { x: 0, y: 0 };
    const end = { x: ux * reach, y: uy * reach };
    const line = Curve.line(from, end);
    // (drawn as the leg is drawn in the diagram, outward: arrows and objects alike; by default as
    // the object it is reconstructed as, a quark as a jet, a neutrino as missing energy)
    const outward = e.from === id ? { ...e.style, arrow: (-e.style.arrow) as 0 | 1 | -1 } : e.style;
    const asSeen = reconstruct && outward.line !== "jet" ? reconstructedAs(v.particle ?? e.particle ?? v.label ?? v.coupling) : undefined;
    parts.push(drawLine(line, asSeen ?? outward, theme.line));
    segments.push({ a: from, b: end });
    // (a jet's shaded cone, too: its two edges, opening from where it starts to its full width)
    const drawnAs = asSeen ?? outward;
    if (drawnAs.line === "jet") {
      const len = portable.hypot(end.x - from.x, end.y - from.y) || 1, nx = -(end.y - from.y) / len, ny = (end.x - from.x) / len;
      const half = Math.min(theme.line.jetMaxHalfWidth * (drawnAs.object === "large" ? 1.6 : 1), len * portable.tan((theme.line.jetHalfAngle * Math.PI) / 180) * 1.6);
      for (const side of [1, -1]) segments.push({ a: from, b: { x: end.x + nx * half * side, y: end.y + ny * half * side } });
    }
    // (any label the author gave: a name, or free text, "tag" and "probe")
    label(v.coupling ?? v.label ?? e.label, end, ux, uy);
  }
  for (const placeOne of pending) placeOne();
  const pad = theme.padding;
  const description = (() => { try { return explainParsed(d); } catch { return ""; } })();
  return svgDocument({ cls: "feynjs-kinematic", label: `event view, ${projection}`, title: d.directives.title, description, model: frame.model && scene ? diagramModel(d, scene) : "", box: { left: x0 - pad, top: y0 - pad, width: x1 - x0 + 2 * pad, height: y1 - y0 + 2 * pad }, scale: theme.drawingScale, idPrefix: scene?.idPrefix ?? "feyn", theme,
    body: `<g class="feynjs-edges">${parts.join("")}</g><g class="feynjs-labels">${labels.join("")}</g>` });
}
