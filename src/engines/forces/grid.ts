import type { Diagram } from "../../model.ts";

/**
 * The grid engine: the forces lay the diagram out, then it is rebuilt outward from its first
 * incoming leg. Lines run level, or upright where they stand upright; only where two or more
 * lines leave a point the same way do they part on diagonals, their directions rounded to the
 * nearest multiple of `step` degrees (22.5 or 45). Every line is one standard length, two
 * steps of the grid, and every point sits on a crossing. A line that closes a loop
 * lands where its two ends already are. Points the author placed stay where they are.
 */
export function snapToGrid(d: Diagram, step: number, lineLength: number, rowOverRank: number, forks: "corner" | "diagonal" = "corner"): void {
  const ids = [...d.vertices.keys()].filter((id) => d.edges.some((e) => e.from === id || e.to === id));
  if (ids.length < 2) return;
  // positions on the page's own scale (rows are rowOverRank of a column), so angles are true
  const at = new Map(ids.map((id) => { const v = d.vertices.get(id)!; return [id, { x: v.x, y: v.y * rowOverRank }]; }));
  const placed = new Map<string, { x: number; y: number }>();
  const unit = (step * Math.PI) / 180, half = lineLength / 2;
  // (the isometric grid, `grid: iso`: a triangular lattice, its rows sqrt(3)/2 of a step apart,
  // every other row shifted half a step; lines along 0, 60 and 120 degrees)
  const iso = step === 60, rowH = iso ? (half * Math.sqrt(3)) / 2 : half;
  const lattice = (q: { x: number; y: number }) => {
    if (!iso) return { x: Math.round(q.x / half) * half, y: Math.round(q.y / half) * half };
    const j = Math.round(q.y / rowH), i = Math.round(q.x / half - j / 2);
    return { x: (i + j / 2) * half, y: j * rowH };
  };
  // start from a point the author placed, else the first incoming leg, else the first point
  // (from the first vertex an incoming leg reaches, so the lines that leave it together part)
  const firstIn = ids.find((id) => d.vertices.get(id)!.role === "in");
  const firstVertex = firstIn && d.edges.map((e) => (e.from === firstIn ? e.to : e.to === firstIn ? e.from : undefined)).find((id) => id !== undefined);
  const root = ids.find((id) => d.vertices.get(id)!.fixed) ?? firstVertex ?? firstIn ?? ids[0];
  // (on a crossing of the background grid, every half line length)
  const r = at.get(root)!;
  placed.set(root, d.vertices.get(root)!.fixed ? r : lattice(r));
  for (const id of ids) if (d.vertices.get(id)!.fixed) placed.set(id, at.get(id)!);
  const queue = [...placed.keys()];
  const inHadron = new Set(d.hadrons.flatMap((h) => h.legs));
  const middleY = placed.get(root)!.y;
  // the direction each point was reached along
  const arrivedAt = new Map<string, number>();
  // (a part the rest does not reach, a quark pair from the vacuum, starts from its own first
  // point, on a crossing)
  const startAgain = () => {
    const lines = (i: string) => d.edges.filter((e) => e.from === i || e.to === i).length;
    const id = ids.find((i) => !placed.has(i) && lines(i) > 1) ?? ids.find((i) => !placed.has(i));
    if (id === undefined) return false;
    // (moved as its nearest placed point moved, so it keeps its place beside it)
    const r = at.get(id)!;
    let near: string | undefined, best = Infinity;
    for (const [j] of placed) { const q = at.get(j)!, dist = Math.hypot(q.x - r.x, q.y - r.y); if (dist < best) { best = dist; near = j; } }
    const shift = near ? { x: placed.get(near)!.x - at.get(near)!.x, y: placed.get(near)!.y - at.get(near)!.y } : { x: 0, y: 0 };
    placed.set(id, { x: r.x + shift.x, y: r.y + shift.y });
    queue.push(id);
    return true;
  };
  const snapped: [number, number][] = [];
  // (rounded alike either side of level; a line that mirrors one already placed takes the
  // mirrored direction, so mirrored lines stay mirrored)
  const snap = (raw: number) => {
    const mirror = snapped.find(([r]) => Math.abs(r + raw) < 0.2 && Math.abs(raw) > 0.05);
    const k = mirror ? -mirror[1] : Math.sign(raw) * Math.round(Math.abs(raw));
    snapped.push([raw, k]);
    return k * unit;
  };
  while (queue.length || startAgain()) {
    const u = queue.shift()!;
    const a = at.get(u)!, from = placed.get(u)!;
    const next = [...new Set(d.edges.flatMap((e) => (e.from === u ? [e.to] : e.to === u ? [e.from] : [])))].filter((v) => !placed.has(v));
    const raw = new Map(next.map((v) => { const b = at.get(v)!; return [v, Math.atan2(b.y - a.y, b.x - a.x)] as const; }));
    // lines run level: a line leaves on a diagonal only where two or more leave the point the
    // same way (forward, or back), and so must part up and down; an upright line stays upright
    const forward = next.filter((v) => Math.cos(raw.get(v)!) > Math.cos((3 * Math.PI) / 8));
    const back = next.filter((v) => Math.cos(raw.get(v)!) < -Math.cos((3 * Math.PI) / 8));
    // (lines that leave the same way take distinct directions, spread evenly about the way they
    // go together: two at plus and minus one step, three at minus one, level and plus one)
    const spread = new Map<string, number>();
    for (const side of [forward, back]) {
      if (side.length < 2) continue;
      // (a line the forces made exactly level, a quark line in a hadron diagram, stays level;
      // the lines beside it take their own rounded ways)
      const levelOne = side.find((v) => Math.abs(Math.sin(raw.get(v)!)) < 1e-3 && d.edges.some((e) => ((e.from === u && e.to === v) || (e.to === u && e.from === v)) && e.style.line === "plain"));
      if (levelOne) {
        spread.set(levelOne, Math.cos(raw.get(levelOne)!) > 0 ? 0 : Math.PI);
        for (const v of side) if (v !== levelOne) spread.set(v, snap(raw.get(v)! / unit));
        continue;
      }
      const mean = Math.atan2(side.reduce((t, v) => t + Math.sin(raw.get(v)!), 0), side.reduce((t, v) => t + Math.cos(raw.get(v)!), 0));
      // (in order about the way they go together, which may straddle straight back)
      const about = (v: string) => Math.atan2(Math.sin(raw.get(v)! - mean), Math.cos(raw.get(v)! - mean));
      const sorted = side.slice().sort((p, q) => about(p) - about(q));
      // (about the way the parent arrived, where one line brought it: a t arriving at 45 degrees
      // sends its b straight up and its W level; else about the way they go together)
      const arrived = side === forward ? arrivedAt.get(u) : undefined;
      const centre = arrived !== undefined ? arrived : Math.round(mean / unit) * unit;
      const n = sorted.length;
      // (on the isometric grid a fork stays forward: its lines take n of the forward lattice ways,
      // -60, 0 and +60 degrees (mirrored for lines going back), the run of them nearest the way the
      // parent arrived, or both diagonals where it arrived level)
      if (iso && n <= 3) {
        const base = side === forward ? 0 : Math.PI, flip = side === forward ? 1 : -1;
        const ways = [-1, 0, 1].map((k) => base + flip * k * unit);
        const towards = arrived !== undefined && side === forward ? Math.round(arrived / unit) : 0;
        const pick = n === 3 ? ways : n === 2 ? (towards > 0 ? [ways[1], ways[2]] : towards < 0 ? [ways[0], ways[1]] : [ways[0], ways[2]]) : [base];
        sorted.forEach((v, i) => spread.set(v, pick[i]));
        continue;
      }
      // (in a SUSY chain the heavy line carries straight on and what it gives off turns out, 45
      // degrees away from the middle: a gravitino on along its neutralino's line, the Z off it)
      const heavy = (v: string) => d.edges.some((e) => (e.from === v && e.to === u || e.to === v && e.from === u) && e.style.cls === "susy");
      if (arrived !== undefined && n === 2 && sorted.filter(heavy).length === 1) {
        const out = Math.sign(from.y - middleY) || 1;
        for (const v of sorted) spread.set(v, heavy(v) ? arrived : arrived + out * (iso ? 1 : 2) * unit);
        continue;
      }
      // (on the grid, lines that part do so plainly: two at a right angle to each other, plus and
      // minus 45 degrees; more, 45 degrees apart; with a 45 degree grid, a step apart)
      const apart = unit < Math.PI / 4 ? 2 : 1;
      sorted.forEach((v, i) => spread.set(v, centre + (n % 2 ? i - (n - 1) / 2 : 2 * i - (n - 1)) * unit * apart));
    }
    for (const v of next) {
      const b = at.get(v)!;
      // (a quark that ends in a hadron keeps where the forces put it from its vertex: they
      // already set the hadrons' quarks level, stacked with gaps; it runs on to the column below)
      if (inHadron.has(v)) { placed.set(v, { x: from.x + (b.x - a.x), y: from.y + (b.y - a.y) }); queue.push(v); continue; }
      const side = forward.includes(v) ? forward : back.includes(v) ? back : undefined;
      const angle = spread.get(v) ?? (side && side.length === 1 ? (side === forward ? 0 : Math.PI) : snap(raw.get(v)! / unit));
      // (every line one standard length, two steps of the grid: a W's quarks as long as the W)
      const length = lineLength;
      // (on a crossing of the grid: a 45 degree step lands on one exactly, a 22.5 degree step on
      // the nearest, a little steeper; never on the point it leaves)
      let to = { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length };
      let onGrid = lattice(to);
      // (rounding outward rather than shrink: a diagonal spans two steps each way)
      if (!iso && Math.hypot(onGrid.x - from.x, onGrid.y - from.y) < 0.9 * length) {
        const away = (c: number, f: number) => f + Math.sign(c - f) * Math.ceil(Math.abs(c - f) / half - 1e-9) * half;
        onGrid = { x: away(to.x, from.x), y: away(to.y, from.y) };
      }
      if (Math.hypot(onGrid.x - from.x, onGrid.y - from.y) > half / 2) to = onGrid;
      // (never on a point already placed: turned a step at a time, either way, until it is clear)
      const taken = (q: { x: number; y: number }) => [...placed.values()].some((r) => Math.hypot(r.x - q.x, r.y - q.y) < half * 0.6);
      for (let k = 1; taken(to) && k <= 6; k++) {
        for (const turn of [k, -k]) {
          const t = angle + turn * unit;
          const q = lattice({ x: from.x + Math.cos(t) * length, y: from.y + Math.sin(t) * length });
          if (!taken(q)) { to = q; break; }
        }
      }
      placed.set(v, to);
      arrivedAt.set(v, angle);
      queue.push(v);
    }
  }
  // the final states of every last decay run on to one final plane, two steps beyond the
  // furthest such decay: by default (corner) one level and the next a step out from the middle
  // of the diagram, then the next a step beyond; with `grid forks: diagonal`, spread evenly
  // about level, a step apart. A final state thrown off earlier (the quarks of a gluino, the
  // spectators of vector-boson fusion) keeps its own short line.
  const linesAt = (id: string) => d.edges.filter((e) => e.from === id || e.to === id).map((e) => (e.from === id ? e.to : e.from));
  const outgoingLeg = (id: string) => linesAt(id).length === 1 && d.vertices.get(id)!.role !== "in" && !inHadron.has(id);
  const lastDecays = new Map<string, string[]>();
  for (const id of ids) {
    if (!outgoingLeg(id) || !placed.has(id)) continue;
    const parent = linesAt(id)[0];
    const pPos = placed.get(parent), here = placed.get(id)!;
    const onward = linesAt(parent).filter((j) => j !== id && placed.get(j) && placed.get(j)!.x > pPos!.x + 1e-9 && !outgoingLeg(j));
    if (!pPos || onward.length) continue;
    lastDecays.set(parent, [...(lastDecays.get(parent) ?? []), id]);
  }
  // (on the isometric grid the final states keep their lattice directions: no straight plane)
  if (lastDecays.size && !iso) {
    const plane = Math.max(...[...lastDecays.keys()].map((v) => placed.get(v)!.x)) + lineLength;
    const nameOf = (id: string) => d.vertices.get(id)!.label ?? d.vertices.get(id)!.particle;
    // (every level leg first, so a turned one can see all of them)
    for (const [parent, legs] of lastDecays) {
      const alike = legs.length > 1 && legs.every((id) => nameOf(id) !== undefined && nameOf(id) === nameOf(legs[0]));
      if (forks !== "diagonal" && !alike && legs.length === 2) {
        const at0 = placed.get(parent)!, o = Math.sign(at0.y - middleY) || 1;
        legs.sort((p, q) => o * (placed.get(p)!.y - placed.get(q)!.y));
        placed.set(legs[0], { x: plane, y: at0.y });
      }
    }
    for (const [parent, legs] of lastDecays) {
      const at = placed.get(parent)!;
      const out = Math.sign(at.y - middleY) || 1;
      legs.sort((p, q) => out * (placed.get(p)!.y - placed.get(q)!.y));
      // (two or more of the same particle, H -> H H, part symmetrically up and down whatever
      // the option: they are alike, and a corner would make one of them special)
      const name = (id: string) => d.vertices.get(id)!.label ?? d.vertices.get(id)!.particle;
      const twins = legs.length > 1 && legs.every((id) => name(id) !== undefined && name(id) === name(legs[0]));
      const symmetric = forks === "diagonal" || twins;
      // (by default, a last decay into two different particles turns a right angle: one runs
      // level on to the plane, the other straight up or down, away from the middle)
      if (!symmetric && legs.length === 2) {
        placed.set(legs[0], { x: plane, y: at.y });
        // (up or down, away from the middle unless that way runs into a point or across a line
        // already drawn; then the other way)
        const cross = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, e: { x: number; y: number }) => {
          const d1 = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x), d2 = (b.x - a.x) * (e.y - a.y) - (b.y - a.y) * (e.x - a.x);
          const d3 = (e.x - c.x) * (a.y - c.y) - (e.y - c.y) * (a.x - c.x), d4 = (e.x - c.x) * (b.y - c.y) - (e.y - c.y) * (b.x - c.x);
          return d1 * d2 < 0 && d3 * d4 < 0;
        };
        const near = (q: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
          const vx = b.x - a.x, vy = b.y - a.y, t = Math.max(0, Math.min(1, ((q.x - a.x) * vx + (q.y - a.y) * vy) / ((vx * vx + vy * vy) || 1)));
          return Math.hypot(q.x - a.x - t * vx, q.y - a.y - t * vy);
        };
        const blocked = (dir: number) => {
          const end = { x: at.x, y: at.y + dir * lineLength };
          if ([...placed].some(([j, r]) => !legs.includes(j) && j !== parent && Math.abs(r.x - end.x) < half * 0.6 && Math.abs(r.y - end.y) < half * 0.6)) return true;
          // (across a line already drawn, or ending on one)
          return d.edges.some((e) => {
            const [pa, pb] = [placed.get(e.from), placed.get(e.to)];
            return pa && pb && ![e.from, e.to].some((j) => legs.includes(j) || j === parent) && (cross(at, end, pa, pb) || near(end, pa, pb) < half * 0.3);
          });
        };
        const way = !blocked(out) || blocked(-out) ? out : -out;
        let y = at.y + way * lineLength;
        while ([...placed].some(([j, r]) => j !== legs[1] && Math.abs(r.x - at.x) < 1e-9 && Math.abs(r.y - y) < half * 0.6)) y += way * half;
        placed.set(legs[1], { x: at.x, y });
        continue;
      }
      legs.forEach((id, k) => {
        const offset = !symmetric ? k * out : (legs.length % 2 ? k - (legs.length - 1) / 2 : 2 * k - (legs.length - 1)) * out;
        let y = at.y + offset * half;
        // (not where another point already is)
        while ([...placed].some(([j, r]) => j !== id && Math.abs(r.x - plane) < 1e-9 && Math.abs(r.y - y) < half * 0.6)) y += out * half;
        placed.set(id, { x: plane, y });
      });
    }
    // (any other final state that runs level runs on to the plane too: on the grid a final
    // state may be long, a spectator quark of vector-boson fusion out to the final plane)
    for (const id of ids) {
      if (!outgoingLeg(id) || !placed.has(id) || [...lastDecays.values()].some((legs) => legs.includes(id))) continue;
      const here = placed.get(id)!, from = placed.get(linesAt(id)[0]);
      if (from && Math.abs(here.y - from.y) < 1e-9 && here.x > from.x && here.x < plane) placed.set(id, { x: plane, y: here.y });
    }
  }
  // room between the beams: a quark that passes through a vertex on its way (a spectator of
  // vector-boson fusion) runs two steps clear of everything the final plane holds between the
  // beams, so what hangs between them, and its labels, can be seen; its vertex and legs move out
  const planeLegs = [...lastDecays.values()].flat().map((id) => placed.get(id)!.y);
  const beams = ids.filter((id) => d.vertices.get(id)!.role === "in" && placed.has(id)).map((id) => placed.get(id)!.y);
  const beamAxis = beams.length ? beams.reduce((t, y) => t + y, 0) / beams.length : middleY;
  if (planeLegs.length) {
    const [low, high] = [Math.min(...planeLegs), Math.max(...planeLegs)];
    for (const v of ids) {
      const legs = linesAt(v).filter((j) => linesAt(j).length === 1);
      if (!legs.some((j) => d.vertices.get(j)!.role === "in") || !legs.some((j) => d.vertices.get(j)!.role !== "in") || !placed.has(v)) continue;
      const y = placed.get(v)!.y, up = y < beamAxis;
      let shift = up ? Math.min(0, low - 2 * half - y) : Math.max(0, high + 2 * half - y);
      // (on the isometric grid, by whole pairs of rows, so the points stay on the lattice)
      if (iso && shift) shift = Math.sign(shift) * Math.ceil(Math.abs(shift) / (2 * rowH)) * 2 * rowH;
      if (!shift) continue;
      for (const id of [v, ...legs]) { const q = placed.get(id)!; placed.set(id, { x: q.x, y: q.y + shift }); }
    }
  }
  // (a hadron's quark legs end together, in one column a side, as the forces draw them: each
  // leg runs on along its own direction to the column, so it keeps its grid angle)
  for (const outgoing of [true, false]) {
    const legs = d.hadrons.filter((h) => (d.vertices.get(h.legs[0])?.role === "out") === outgoing).flatMap((h) => h.legs).filter((id) => placed.has(id));
    if (!legs.length) continue;
    const column = outgoing ? Math.max(...legs.map((id) => placed.get(id)!.x)) : Math.min(...legs.map((id) => placed.get(id)!.x));
    for (const id of legs) {
      const e = d.edges.find((edge) => edge.from === id || edge.to === id);
      const from = e && placed.get(e.from === id ? e.to : e.from), end = placed.get(id)!;
      if (!from || Math.abs(end.x - from.x) < 1e-9) continue;
      const t = (column - from.x) / (end.x - from.x);
      if (t > 0) placed.set(id, { x: column, y: from.y + (end.y - from.y) * t });
    }
  }
  roundLoops(d, ids, placed);
  for (const [id, p] of placed) { const v = d.vertices.get(id)!; v.x = p.x; v.y = p.y / rowOverRank; }
}

/**
 * Loops on the grid are round: a boson arc over a quark line (a penguin's W) is a true half
 * circle, its point on the arc moved to the circle's foot with what hangs from it; a closed
 * loop (a fermion triangle or box) is drawn as the circle through its corners.
 */
function roundLoops(d: Diagram, ids: string[], placed: Map<string, { x: number; y: number }>): void {
  const near = new Map<string, string[]>();
  for (const e of d.edges) { near.set(e.from, [...(near.get(e.from) ?? []), e.to]); near.set(e.to, [...(near.get(e.to) ?? []), e.from]); }
  const edge = (a: string, b: string) => d.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
  // the smallest loops: for each line, the shortest way round back to it without it
  const loops = new Map<string, string[]>();
  for (const e of d.edges) {
    if ((near.get(e.from) ?? []).length < 2 || (near.get(e.to) ?? []).length < 2) continue;
    const back = new Map<string, string>([[e.from, ""]]);
    for (let queue = [e.from]; queue.length;) {
      const u = queue.shift()!;
      for (const w of near.get(u) ?? []) {
        if (back.has(w) || (u === e.from && w === e.to)) continue;
        back.set(w, u); queue.push(w);
      }
    }
    if (!back.has(e.to)) continue;
    const ring: string[] = [];
    for (let at = e.to; at; at = back.get(at)!) ring.push(at);
    if (ring.length > 4) continue;
    loops.set([...ring].sort().join(" "), ring);
  }
  for (const ring of loops.values()) {
    const sides = ring.map((a, k) => [a, ring[(k + 1) % ring.length]] as const);
    const arcs = sides.filter(([a, b]) => edge(a, b)?.bendIsAutomatic);
    if (arcs.length) {
      // a boson arc over a stretch of quark line: the stretch's two ends, the point between
      const ends = ring.filter((v) => arcs.filter(([a, b]) => a === v || b === v).length === 1);
      const inner = ring.filter((v) => arcs.filter(([a, b]) => a === v || b === v).length === 2);
      if (ends.length !== 2) continue;
      const [p, q] = ends.map((v) => placed.get(v)!);
      const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }, r = Math.hypot(q.x - p.x, q.y - p.y) / 2;
      if (inner.length === 1) {
        const x = inner[0], now = placed.get(x)!;
        const side = Math.sign(now.y - mid.y) || 1;
        const to = { x: mid.x, y: mid.y + side * r }, dx = to.x - now.x, dy = to.y - now.y;
        // (what hangs from it moves with it)
        const moved = new Set([x]);
        for (let queue = [x]; queue.length;) for (const w of near.get(queue.shift()!) ?? []) {
          if (moved.has(w) || ring.includes(w)) continue;
          moved.add(w); queue.push(w);
        }
        for (const id of moved) { const q2 = placed.get(id); if (q2) placed.set(id, { x: q2.x + dx, y: q2.y + dy }); }
        for (const [a, b] of arcs) { const e = edge(a, b)!; e.bend = Math.sign(e.bend ?? 1) * 45; }
      } else if (inner.length === 0) for (const [a, b] of arcs) { const e = edge(a, b)!; e.bend = Math.sign(e.bend ?? 1) * 90; }
      continue;
    }
    // a closed loop: the circle through its corners (their middle as its centre), each side
    // bent by half the angle it spans there, bulging outward
    const pts = ring.map((v) => placed.get(v)!);
    let c = { x: pts.reduce((t, q) => t + q.x, 0) / pts.length, y: pts.reduce((t, q) => t + q.y, 0) / pts.length };
    // (three corners: the true centre of the circle through them)
    if (pts.length === 3) {
      const [a, b, q] = pts, dd = 2 * (a.x * (b.y - q.y) + b.x * (q.y - a.y) + q.x * (a.y - b.y));
      if (Math.abs(dd) > 1e-9) {
        const sq = (v: { x: number; y: number }) => v.x * v.x + v.y * v.y;
        c = { x: (sq(a) * (b.y - q.y) + sq(b) * (q.y - a.y) + sq(q) * (a.y - b.y)) / dd, y: (sq(a) * (q.x - b.x) + sq(b) * (a.x - q.x) + sq(q) * (b.x - a.x)) / dd };
      }
    }
    for (const [a, b] of sides) {
      const e = edge(a, b);
      if (!e || (e.bend !== undefined && !e.bendIsAutomatic)) continue;
      const [pa, pb] = [placed.get(e.from)!, placed.get(e.to)!];
      const minor = Math.acos(Math.max(-1, Math.min(1, ((pa.x - c.x) * (pb.x - c.x) + (pa.y - c.y) * (pb.y - c.y)) / ((Math.hypot(pa.x - c.x, pa.y - c.y) * Math.hypot(pb.x - c.x, pb.y - c.y)) || 1))));
      const ux = pb.x - pa.x, uy = pb.y - pa.y, mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
      // (each side bulges away from the loop's other corners: by the short arc where the circle's
      // centre is on their side of it, the long way round where it is not, an obtuse corner)
      const rest = pts.filter((q) => q !== pa && q !== pb);
      const rx = rest.reduce((t, q) => t + q.x, 0) / rest.length - mx, ry = rest.reduce((t, q) => t + q.y, 0) / rest.length - my;
      const side = (x: number, y: number) => Math.sign(x * uy - y * ux);
      const away = -side(rx, ry) || 1;
      const spans = side(c.x - mx, c.y - my) === away ? 2 * Math.PI - minor : minor;
      // (positive bends bulge to the left of travel: on screen, y down, that is (uy, -ux))
      e.bend = away * (spans * 90) / Math.PI;
      e.bendIsAutomatic = true;
    }
  }
}
