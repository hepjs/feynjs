import { fmt } from "../geometry/curve.ts";
import type { Pt } from "../geometry/curve.ts";
import { layoutLabel } from "../label/label.ts";
import type { Theme } from "../theme.ts";
import * as portable from "../geometry/portable-math.ts";

/**
 * A hadron drawn with its valence quarks (`[bag=proton]`, `[bag=c cbar u dbar]`) and the colour
 * flux tubes that bind them, as lattice QCD shows them: a straight tube between a meson's quark
 * and antiquark, a Y meeting at a junction for a baryon's three, linked junctions for a
 * tetraquark (diquark to antidiquark) and a pentaquark. Each quark a small dot in its colour
 * charge (antiquarks in anticolours: the whole is colourless), its flavour beside it.
 */
export interface Quark { flavour: string; anti: boolean; /** which colourless cluster it is in, in a molecule (`uud + c cbar`) */ group?: number }

/** Hadrons by name, as their valence quarks. */
const NAMED: Record<string, string> = {
  proton: "uud", p: "uud", neutron: "udd", n: "udd", antiproton: "ubar ubar dbar", lambda: "uds",
  "pi+": "u dbar", "pi-": "d ubar", pi0: "u ubar", "K+": "u sbar", "K-": "s ubar", K0: "d sbar",
  "J/psi": "c cbar", jpsi: "c cbar", upsilon: "b bbar", B0: "d bbar", "B+": "u bbar", D0: "c ubar", "D+": "c dbar", Bs: "s bbar",
  // (exotics: a charged charmonium-like tetraquark, a hidden-charm pentaquark, the doubly-charmed T_cc)
  Zc: "c cbar u dbar", "Zc+": "c cbar u dbar", X3872: "c cbar u ubar", Tcc: "c c ubar dbar", Pc: "u u d c cbar",
};

/**
 * The quarks of a hadron, by name or written out (`uud`, `u dbar`, `c c~ u d~`); a molecule of
 * two colourless clusters, a baryon and a meson say, written with a plus (`udc + u cbar`).
 */
export function quarksOf(text: string): Quark[] | undefined {
  const named = NAMED[text.trim()] ?? NAMED[text.trim().replace(/[\\{}^_]/g, "")];
  const quarks: Quark[] = [];
  (named ?? text).split("+").forEach((part, group, parts) => {
    const src = part.replace(/\s+/g, "");
    const re = /([udscbt])(bar|~)?/y;
    let read = 0;
    for (let m: RegExpExecArray | null; (m = re.exec(src)); read = re.lastIndex) quarks.push({ flavour: m[1], anti: !!m[2], ...(parts.length > 1 ? { group } : {}) });
    if (read !== src.length) quarks.length = 0, quarks.push({ flavour: "?", anti: false });
  });
  if (!quarks.length || quarks.some((q) => q.flavour === "?") || quarks.length > 6) return undefined;
  return quarks;
}

/**
 * A pentaquark as a molecule: a meson of its antiquark and a light quark of another flavour, and
 * a baryon of the rest (the hidden-charm P_c as a Sigma_c and an anti-D). Anything else as it is.
 */
export function asMolecule(quarks: Quark[]): Quark[] {
  const anti = quarks.filter((q) => q.anti), plain = quarks.filter((q) => !q.anti);
  const [lone, many] = anti.length === 1 && plain.length === 4 ? [anti[0], plain] : plain.length === 1 && anti.length === 4 ? [plain[0], anti] : [undefined, []];
  if (!lone) return quarks;
  const partner = many.find((q) => q.flavour !== lone.flavour && "ud".includes(q.flavour)) ?? many.find((q) => q.flavour !== lone.flavour) ?? many[0];
  return [...many.filter((q) => q !== partner).map((q) => ({ ...q, group: 0 })), { ...partner, group: 1 }, { ...lone, group: 1 }];
}

/**
 * Where a hadron's quarks sit (in units of the quark spacing, y down), and its flux tubes; the
 * clusters of a molecule each arranged on their own, side by side, a little apart.
 */
function arrangement(quarks: Quark[]): { at: Pt[]; tubes: Pt[][] } {
  const groups = [...new Set(quarks.map((q) => q.group ?? 0))];
  if (groups.length < 2) return oneCluster(quarks);
  const parts = groups.map((g) => ({ members: quarks.map((q, k) => ({ q, k })).filter(({ q }) => (q.group ?? 0) === g), ...oneCluster(quarks.filter((q) => (q.group ?? 0) === g)) }));
  const at: Pt[] = new Array(quarks.length), tubes: Pt[][] = [];
  let x = 0;
  const placed = parts.map((part) => {
    const left = Math.min(...part.at.map((p) => p.x)) - 0.6, right = Math.max(...part.at.map((p) => p.x)) + 0.6;
    const shift = x - left;
    x += right - left + 0.5;
    return { part, shift };
  });
  const middle = (x - 0.5) / 2;
  for (const { part, shift } of placed) {
    const move = (p: Pt) => ({ x: p.x + shift - middle, y: p.y });
    part.members.forEach(({ k }, i) => { at[k] = move(part.at[i]); });
    tubes.push(...part.tubes.map((t) => t.map(move)));
  }
  return { at, tubes };
}

/** One colourless cluster's quarks and flux tubes. */
function oneCluster(quarks: Quark[]): { at: Pt[]; tubes: Pt[][] } {
  const n = quarks.length, q = quarks.filter((x) => !x.anti).length, anti = n - q;
  const P = (x: number, y: number): Pt => ({ x, y });
  // (slots for the quarks, then for the antiquarks, filled in the order written)
  const place = (qSlots: Pt[], aSlots: Pt[]) => {
    let i = 0, j = 0;
    return quarks.map((x) => (x.anti ? aSlots[j++] : qSlots[i++]));
  };
  const arm = (from: Pt, angle: number, length = 1) => P(from.x + length * portable.cos(angle), from.y + length * portable.sin(angle));
  if (n === 2 && q === 1) {
    const at = place([P(-1.1, 0)], [P(1.1, 0)]);
    return { at, tubes: [at] };
  }
  if (n === 3 && (q === 3 || anti === 3)) {
    const o = P(0, 0), at = [0, 1, 2].map((k) => arm(o, -Math.PI / 2 + (2 * Math.PI * k) / 3, 1.15));
    return { at, tubes: at.map((x) => [x, o]) };
  }
  if (n === 4 && q === 2) {
    const j1 = P(-0.55, 0), j2 = P(0.55, 0);
    const qs = [arm(j1, (-120 * Math.PI) / 180), arm(j1, (120 * Math.PI) / 180)], as = [arm(j2, (-60 * Math.PI) / 180), arm(j2, (60 * Math.PI) / 180)];
    return { at: place(qs, as), tubes: [[qs[0], j1, qs[1]], [j1, j2], [as[0], j2, as[1]]] };
  }
  if (n === 5 && (q === 4 || anti === 4)) {
    const j3 = P(0.45, 0), j1 = P(-0.3, -0.9), j2 = P(-0.3, 0.9), lone = P(1.65, 0);
    const four = [arm(j1, Math.PI, 1.2), arm(j1, (-70 * Math.PI) / 180, 1.2), arm(j2, Math.PI, 1.2), arm(j2, (70 * Math.PI) / 180, 1.2)];
    const at = q === 4 ? place(four, [lone]) : place([lone], four);
    return { at, tubes: [[four[0], j1, four[1]], [four[2], j2, four[3]], [j1, j3, j2], [j3, lone]] };
  }
  // (anything else: round a ring, each tied to the middle)
  const o = P(0, 0), at = quarks.map((_, k) => arm(o, -Math.PI / 2 + (2 * Math.PI * k) / n, n === 1 ? 0 : 1.2));
  return { at, tubes: n > 1 ? at.map((x) => [x, o]) : [] };
}

/** px for one unit of the arrangement, and a quark's radius. */
const SPACING = 13.5, DOT = 7.8;

/** How far the hadron's outline reaches from its middle, in px. */
export function bagRadius(quarks: Quark[]): number {
  const { rx, ry } = bagOutline(quarks);
  return Math.max(rx, ry);
}

/**
 * The hadron's outline, close round its quarks: a circle, or for a wide one (a meson, a
 * molecule) an ellipse, so no room is left empty above and below.
 */
export function bagOutline(quarks: Quark[]): { rx: number; ry: number } {
  const { at } = arrangement(quarks);
  const round = Math.max(...at.map((p) => portable.hypot(p.x, p.y))) * SPACING + DOT + 3.5;
  const rx = Math.max(...at.map((p) => Math.abs(p.x))) * SPACING + DOT + 3.5, ry = Math.max(...at.map((p) => Math.abs(p.y))) * SPACING + DOT + 3.5;
  if (rx < ry * 1.3) return { rx: round, ry: round };
  // (an ellipse through the outermost quarks' rims, a little beyond)
  const fit = Math.max(...at.map((p) => portable.hypot((p.x * SPACING) / (rx - DOT - 3.5 || 1), (p.y * SPACING) / (ry + DOT) || 0)));
  return { rx: rx * Math.max(1, fit), ry: (ry + DOT) * Math.max(1, fit) };
}

/** How far the outline reaches from the middle toward (dx, dy). */
export function bagReach(quarks: Quark[], dx: number, dy: number): number {
  const { rx, ry } = bagOutline(quarks), n = portable.hypot(dx, dy) || 1;
  return 1 / Math.sqrt(portable.square(dx / n / rx) + portable.square(dy / n / ry));
}

/**
 * Colour charges that leave the hadron colourless: the quarks red, green, blue in turn, and each
 * antiquark the anticolour of a quark not yet paired (a meson red and anti-red; a pentaquark's
 * extra pair red and anti-red beside its red, green and blue).
 */
function colourCharges(quarks: Quark[], palette: string[], anti: string[]): string[] {
  const colours: string[] = [];
  let made = 0, unpaired: number[] = [];
  for (const q of quarks) if (!q.anti) { colours.push(palette[made % 3]); unpaired.push(made % 3); made++; } else colours.push("");
  // (three quarks make a colourless baryon of their own: an antiquark pairs with what is left over)
  if (unpaired.length > 3) unpaired = unpaired.slice(3);
  let k = 0;
  return quarks.map((q, i) => (q.anti ? anti[(unpaired.length ? unpaired[k++ % unpaired.length] : k++ % 3)] : colours[i]));
}

/** Colour charges for each colourless cluster of a hadron on its own. */
function chargesByCluster(quarks: Quark[], palette: string[], anti: string[]): string[] {
  const out: string[] = new Array(quarks.length);
  for (const g of new Set(quarks.map((q) => q.group ?? 0))) {
    const members = quarks.map((q, k) => ({ q, k })).filter(({ q }) => (q.group ?? 0) === g);
    const colours = colourCharges(members.map(({ q }) => q), palette, anti);
    members.forEach(({ k }, i) => { out[k] = colours[i]; });
  }
  return out;
}

/** The SVG of a hadron and its quarks at `p`. */
export function bagSvg(p: Pt, quarks: Quark[], theme: Theme, motion: boolean): string {
  const { at: units, tubes } = arrangement(quarks);
  const to = (u: Pt): Pt => ({ x: p.x + u.x * SPACING, y: p.y + u.y * SPACING });
  const at = units.map(to), { rx, ry } = bagOutline(quarks), dot = DOT;
  const quiet = (c: string) => mixHex(theme.colors[c] ?? c, "#8a8f98", 0.22);
  const colours = chargesByCluster(quarks, theme.colourFlow.palette.map(quiet), theme.colourFlow.anti.map(quiet));
  // the flux tubes: a soft grey band, a little darker along its middle
  const d = tubes.map((t) => `M${t.map(to).map((q) => `${fmt(q.x)} ${fmt(q.y)}`).join("L")}`).join("");
  const breathe = motion ? `<animate attributeName="stroke-opacity" values="0.22;0.36;0.22" dur="3.2s" repeatCount="indefinite"/>` : "";
  const tube = `<path d="${d}" fill="none" stroke="#8a919c" stroke-opacity="0.28" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${breathe}</path>`
    + `<path d="${d}" fill="none" stroke="#8a919c" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  // the quarks, each with its flavour on it
  const marks = quarks.map((q, k) => {
    const c = at[k], box = layoutLabel(q.anti ? `\\bar{${q.flavour}}` : q.flavour, dot * 1.45);
    const lx = c.x - box.width / 2, ly = c.y + (box.ascent - box.descent) / 2 - (q.anti ? 0 : 0.4);
    return `<circle cx="${fmt(c.x)}" cy="${fmt(c.y)}" r="${dot}" fill="${colours[k]}" stroke="#2b2b2b" stroke-width="0.6"/>`
      + `<g transform="translate(${fmt(lx)} ${fmt(ly)})" fill="#fff">${box.svg}</g>`;
  }).join("");
  const shape = `cx="${fmt(p.x)}" cy="${fmt(p.y)}" rx="${fmt(rx)}" ry="${fmt(ry)}"`;
  return `<g class="feynjs-bag"><ellipse class="feynjs-bg" ${shape} fill="#fff"/>`
    + `<ellipse ${shape} fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="${fmt(theme.line.stroke * 0.7)}"/>`
    + `${tube}${marks}</g>`;
}

/** Between two hex colours, `t` of the way from the first. */
function mixHex(a: string, b: string, t: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(a)) return a;
  const [x, y] = [a, b].map((c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
  return `#${x.map((c, k) => Math.round(c + (y[k] - c) * t).toString(16).padStart(2, "0")).join("")}`;
}
