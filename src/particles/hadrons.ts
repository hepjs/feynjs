import type { EdgeStyle } from "../model.ts";
import type { ParticleProperties } from "./properties.ts";

/**
 * Hadrons by name: mesons (drawn dashed, as the pion always was) and baryons (drawn as the
 * proton is, three lines), each with its label, quark content, charge, spin and mass (PDG 2024,
 * rounded). A name is a hadron's symbol or word (`K`, `kaon`, `Sigma`), then a star for an
 * excited state (`K*`), then a charge (`+`, `-`, `0`, `++`), then `bar` for the antiparticle:
 * `K*0`, `Sigma+`, `D0bar`, `kaon+`. A hadron written with what it is made of in parentheses,
 * `X(ucd)`, `Pc(uudcc~)`, has that quark content; anything else in the parentheses is part of
 * its name and label: `psi(2S)`, `X(3872)`.
 */

/** Hadrons by name, as their valence quarks (what `[bag=...]` draws). */
export const QUARKS_BY_NAME: Record<string, string> = {
  proton: "uud", p: "uud", neutron: "udd", n: "udd", antiproton: "ubar ubar dbar", lambda: "uds",
  "pi+": "u dbar", "pi-": "d ubar", pi0: "u ubar", "K+": "u sbar", "K-": "s ubar", K0: "d sbar",
  "J/psi": "c cbar", jpsi: "c cbar", upsilon: "b bbar", B0: "d bbar", "B+": "u bbar", D0: "c ubar", "D+": "c dbar", Bs: "s bbar",
  // (exotics: a charged charmonium-like tetraquark, a hidden-charm pentaquark, the doubly-charmed T_cc)
  Zc: "c cbar u dbar", "Zc+": "c cbar u dbar", X3872: "c cbar u ubar", Tcc: "c c ubar dbar", Pc: "u u d c cbar",
};

export interface Hadron { particle: { style: EdgeStyle; label: string }; properties: ParticleProperties }

/** One charge state of a family: its quarks (as `[bag=...]` writes them), and its mass. */
interface State { quarks: string; mass?: string; /** what the tooltip shows, where the quarks are a mixture */ shown?: string }

interface Family {
  /** the symbol, which takes a star and a charge: `K`, `K*0`, `Sigma+` */
  symbol: string;
  /** other spellings, which may stand alone: `kaon`, `J/psi` */
  words?: string[];
  /** the symbol alone names the hadron (`Lambda`, `eta`; not `K`, `D` or `B`, where `B` is a heavy quark) */
  bare?: boolean;
  label: string;
  noun: string;
  baryon?: boolean;
  spin: string;
  states: Record<string, State>;
  /** the excited state, `K*`: its name and mass */
  star?: { noun: string; mass?: Record<string, string> };
}

const MESON: EdgeStyle = { line: "dash", arrow: 0 };
const BARYON: EdgeStyle = { line: "triple", arrow: 0 };

const FAMILIES: Family[] = [
  { symbol: "pi", words: ["pion"], label: "\\pi", noun: "pion", spin: "0",
    states: { "+": { quarks: "u dbar", mass: "139.6 MeV" }, "-": { quarks: "d ubar", mass: "139.6 MeV" }, "0": { quarks: "u ubar", mass: "135.0 MeV", shown: "uū, dd̄" } } },
  { symbol: "K", words: ["kaon"], label: "K", noun: "kaon", spin: "0",
    states: { "+": { quarks: "u sbar", mass: "493.7 MeV" }, "-": { quarks: "s ubar", mass: "493.7 MeV" }, "0": { quarks: "d sbar", mass: "497.6 MeV" } },
    star: { noun: "K*(892) meson", mass: { "+": "891.7 MeV", "-": "891.7 MeV", "0": "895.6 MeV" } } },
  { symbol: "eta", bare: true, label: "\\eta", noun: "η meson", spin: "0", states: { "0": { quarks: "u ubar", mass: "547.9 MeV", shown: "uū, dd̄, ss̄" } } },
  { symbol: "eta'", bare: true, label: "\\eta'", noun: "η′ meson", spin: "0", states: { "0": { quarks: "s sbar", mass: "957.8 MeV", shown: "uū, dd̄, ss̄" } } },
  { symbol: "rho", bare: true, label: "\\rho", noun: "ρ meson", spin: "1",
    states: { "+": { quarks: "u dbar", mass: "775.1 MeV" }, "-": { quarks: "d ubar", mass: "775.1 MeV" }, "0": { quarks: "u ubar", mass: "775.3 MeV", shown: "uū, dd̄" } },
    star: { noun: "excited ρ meson" } },
  { symbol: "omega", bare: true, label: "\\omega", noun: "ω meson", spin: "1", states: { "0": { quarks: "u ubar", mass: "782.7 MeV", shown: "uū, dd̄" } } },
  // (the φ(1020); a plain `phi` stays the hypothetical scalar)
  { symbol: "phi1020", words: ["phi(1020)"], bare: true, label: "\\phi(1020)", noun: "φ(1020) meson", spin: "1", states: { "0": { quarks: "s sbar", mass: "1019.5 MeV" } } },
  { symbol: "jpsi", words: ["J/psi"], bare: true, label: "J/\\psi", noun: "J/ψ meson", spin: "1", states: { "0": { quarks: "c cbar", mass: "3096.9 MeV" } } },
  { symbol: "psi2S", words: ["psi(2S)"], bare: true, label: "\\psi(2S)", noun: "ψ(2S) meson", spin: "1", states: { "0": { quarks: "c cbar", mass: "3686.1 MeV" } } },
  { symbol: "upsilon", words: ["Upsilon"], bare: true, label: "\\Upsilon", noun: "ϒ meson", spin: "1", states: { "0": { quarks: "b bbar", mass: "9460.4 MeV" } } },
  { symbol: "D", label: "D", noun: "D meson", spin: "0",
    states: { "+": { quarks: "c dbar", mass: "1869.7 MeV" }, "-": { quarks: "d cbar", mass: "1869.7 MeV" }, "0": { quarks: "c ubar", mass: "1864.8 MeV" } },
    star: { noun: "D* meson", mass: { "+": "2010.3 MeV", "-": "2010.3 MeV", "0": "2006.9 MeV" } } },
  { symbol: "Ds", bare: true, label: "D_s", noun: "D_s meson", spin: "0",
    states: { "+": { quarks: "c sbar", mass: "1968.4 MeV" }, "-": { quarks: "s cbar", mass: "1968.4 MeV" } },
    star: { noun: "D_s* meson", mass: { "+": "2112.2 MeV", "-": "2112.2 MeV" } } },
  { symbol: "B", label: "B", noun: "B meson", spin: "0",
    states: { "+": { quarks: "u bbar", mass: "5279.3 MeV" }, "-": { quarks: "b ubar", mass: "5279.3 MeV" }, "0": { quarks: "d bbar", mass: "5279.7 MeV" } },
    star: { noun: "B* meson", mass: { "+": "5324.7 MeV", "-": "5324.7 MeV", "0": "5324.7 MeV" } } },
  { symbol: "Bs", bare: true, label: "B_s", noun: "B_s meson", spin: "0", states: { "0": { quarks: "s bbar", mass: "5366.9 MeV" } }, star: { noun: "B_s* meson", mass: { "0": "5415.4 MeV" } } },
  { symbol: "Bc", bare: true, label: "B_c", noun: "B_c meson", spin: "0", states: { "+": { quarks: "c bbar", mass: "6274.5 MeV" }, "-": { quarks: "b cbar", mass: "6274.5 MeV" } } },
  { symbol: "Lambda", bare: true, label: "\\Lambda", noun: "Λ baryon", baryon: true, spin: "1/2", states: { "0": { quarks: "uds", mass: "1115.7 MeV" } } },
  { symbol: "Lambda_b", bare: true, label: "\\Lambda_b", noun: "Λ_b baryon", baryon: true, spin: "1/2", states: { "0": { quarks: "udb", mass: "5619.6 MeV" } } },
  { symbol: "Lambda_c", bare: true, label: "\\Lambda_c", noun: "Λ_c baryon", baryon: true, spin: "1/2", states: { "+": { quarks: "udc", mass: "2286.5 MeV" } } },
  { symbol: "Sigma", bare: true, label: "\\Sigma", noun: "Σ baryon", baryon: true, spin: "1/2",
    states: { "+": { quarks: "uus", mass: "1189.4 MeV" }, "0": { quarks: "uds", mass: "1192.6 MeV" }, "-": { quarks: "dds", mass: "1197.4 MeV" } },
    star: { noun: "Σ(1385) baryon", mass: { "+": "1382.8 MeV", "0": "1383.7 MeV", "-": "1387.2 MeV" } } },
  { symbol: "Xi", bare: true, label: "\\Xi", noun: "Ξ baryon", baryon: true, spin: "1/2",
    states: { "0": { quarks: "uss", mass: "1314.9 MeV" }, "-": { quarks: "dss", mass: "1321.7 MeV" } },
    star: { noun: "Ξ(1530) baryon", mass: { "0": "1531.8 MeV", "-": "1535.0 MeV" } } },
  // (Omega, the baryon, and omega, the meson: case tells them apart)
  { symbol: "Omega", bare: true, label: "\\Omega", noun: "Ω baryon", baryon: true, spin: "3/2", states: { "-": { quarks: "sss", mass: "1672.5 MeV" } } },
  { symbol: "Delta", bare: true, label: "\\Delta", noun: "Δ baryon", baryon: true, spin: "3/2",
    states: { "++": { quarks: "uuu", mass: "1232 MeV" }, "+": { quarks: "uud", mass: "1232 MeV" }, "0": { quarks: "udd", mass: "1232 MeV" }, "-": { quarks: "ddd", mass: "1232 MeV" } } },
];

/** Hadrons that are not a family's charge state: the nucleons, and the neutral kaons by lifetime. */
const SINGLES: Record<string, { label: string; baryon?: boolean; properties: ParticleProperties }> = {
  n: { label: "n", baryon: true, properties: { name: "neutron", charge: "0", spin: "1/2", mass: "939.6 MeV", quarks: "udd" } },
  neutron: { label: "n", baryon: true, properties: { name: "neutron", charge: "0", spin: "1/2", mass: "939.6 MeV", quarks: "udd" } },
  pbar: { label: "\\bar p", baryon: true, properties: { name: "antiproton", charge: "-1", spin: "1/2", mass: "938.3 MeV", quarks: "ūūd̄" } },
  antiproton: { label: "\\bar p", baryon: true, properties: { name: "antiproton", charge: "-1", spin: "1/2", mass: "938.3 MeV", quarks: "ūūd̄" } },
  KS: { label: "K^0_S", properties: { name: "K-short", charge: "0", spin: "0", mass: "497.6 MeV", quarks: "ds̄, sd̄" } },
  KL: { label: "K^0_L", properties: { name: "K-long", charge: "0", spin: "0", mass: "497.6 MeV", quarks: "ds̄, sd̄" } },
};

const CHARGES: Record<string, string> = { "+": "+1", "-": "-1", "0": "0", "++": "+2", "--": "-2" };
const FLIPPED: Record<string, string> = { "+": "-", "-": "+", "0": "0", "++": "--", "--": "++" };

/** Quarks as `[bag=...]` writes them (`u dbar`, `uud`, `c c~`), each with whether it is an antiquark. */
function readQuarks(text: string): { flavour: string; anti: boolean }[] | undefined {
  const src = text.replace(/\s+/g, ""), re = /([udscbt])(bar|~)?/y, out: { flavour: string; anti: boolean }[] = [];
  let read = 0;
  for (let m: RegExpExecArray | null; (m = re.exec(src)); read = re.lastIndex) out.push({ flavour: m[1], anti: !!m[2] });
  return read === src.length && out.length ? out : undefined;
}

/** Quarks as a reader sees them: `ud̄` (a bar over an antiquark). */
const shownQuarks = (quarks: { flavour: string; anti: boolean }[]) => quarks.map((q) => (q.anti ? `${q.flavour}̄` : q.flavour)).join("");

/** The quarks the other way round: each quark its antiquark. */
const conjugate = (quarks: { flavour: string; anti: boolean }[]) => quarks.map((q) => ({ ...q, anti: !q.anti }));

/** The electric charge of some quarks, as written: "+1", "0", "+2/3". */
function chargeOfQuarks(quarks: { flavour: string; anti: boolean }[]): string {
  const thirds = quarks.reduce((sum, q) => sum + ("uct".includes(q.flavour) ? 2 : -1) * (q.anti ? -1 : 1), 0);
  const whole = thirds % 3 === 0, value = whole ? `${Math.abs(thirds / 3)}` : `${Math.abs(thirds)}/3`;
  return thirds === 0 ? "0" : `${thirds > 0 ? "+" : "-"}${value}`;
}

/** A label with a superscript added: `K` and `*0` make `K^{*0}`. */
const withSuperscript = (label: string, sup: string) => (!sup ? label : sup.length === 1 ? `${label}^${sup}` : `${label}^{${sup}}`);

/** A label with a bar over its symbol, not its subscript: `\bar\Lambda_b`, `\bar D`. */
function barred(label: string): string {
  const m = /^(\\[A-Za-z]+|[A-Za-z])(.*)$/.exec(label);
  return m ? `\\bar${m[1].startsWith("\\") ? "" : " "}${m[1]}${m[2]}` : `\\bar{${label}}`;
}

/** "kaon" to "antikaon", "D meson" to "anti-D meson". */
const antiNoun = (noun: string) => (/^[a-z]/.test(noun) ? `anti${noun}` : `anti-${noun}`);

/** One hadron of a family: generic (no charge), or a charge state, excited or not, or its antiparticle. */
function familyMember(f: Family, star: boolean, charge: string | undefined, anti: boolean): Hadron {
  // (an antiparticle's charge is turned round; a neutral one, or a family named without its
  // charge, takes a bar instead)
  const flips = anti && charge !== undefined && charge !== "0";
  const shownCharge = flips ? FLIPPED[charge] : charge;
  const base = anti && !flips ? barred(f.label) : f.label;
  const label = withSuperscript(base, `${star ? "*" : ""}${shownCharge ?? ""}`);
  const states = Object.keys(f.states);
  // (a family with one state is that state, named or not: Lambda is the neutral Λ)
  const state = charge !== undefined ? f.states[charge] : states.length === 1 ? f.states[states[0]] : undefined;
  const stateCharge = charge ?? (states.length === 1 ? states[0] : undefined);
  const quarks = state ? readQuarks(state.quarks) : undefined;
  const noun = star ? f.star?.noun ?? `excited ${f.noun}` : f.noun;
  const which = charge === undefined || states.length === 1 ? "" : charge === "0" ? "neutral " : charge.length === 2 ? "doubly charged " : "charged ";
  const name = `${which}${anti ? antiNoun(noun) : noun}`;
  const mass = star ? (stateCharge !== undefined ? f.star?.mass?.[stateCharge] : undefined) : state?.mass;
  const finalCharge = stateCharge === undefined ? undefined : CHARGES[anti ? FLIPPED[stateCharge] : stateCharge];
  const shown = quarks ? (anti ? shownQuarks(conjugate(quarks)) : state?.shown ?? shownQuarks(quarks)) : undefined;
  const properties: ParticleProperties = {
    name, ...(finalCharge !== undefined ? { charge: finalCharge } : {}), spin: star ? (f.baryon ? "3/2" : "1") : f.spin,
    ...(mass ? { mass } : {}), ...(shown ? { quarks: shown } : {}),
  };
  return { particle: { style: f.baryon ? BARYON : MESON, label }, properties };
}

/** A name read as a family's: which family, and the star, charge and `bar` after its symbol or word. */
function readFamilyName(name: string): { f: Family; star: boolean; charge?: string; anti: boolean } | undefined {
  let best: { f: Family; spelling: string } | undefined;
  for (const f of FAMILIES) {
    for (const spelling of [f.symbol, ...(f.words ?? [])]) {
      if (name.startsWith(spelling) && (!best || spelling.length > best.spelling.length)) best = { f, spelling };
    }
  }
  if (!best) return undefined;
  const { f, spelling } = best, rest = name.slice(spelling.length);
  const m = /^(\*)?(\+\+|--|\+|-|0)?(bar)?$/.exec(rest);
  if (!m) return undefined;
  // (a symbol alone names a hadron only where it is not a particle of its own: K, D and B need a
  // charge or a star, and B alone is the heavy quark)
  if (!m[1] && !m[2] && spelling === f.symbol && !f.bare) return undefined;
  return { f, star: !!m[1], charge: m[2], anti: !!m[3] };
}

/** A family member by name: symbol or word, star, charge, `bar`. */
function byFamily(name: string): Hadron | undefined {
  const read = readFamilyName(name);
  return read && familyMember(read.f, read.star, read.charge, read.anti);
}

const GREEK = new Set(["eta", "rho", "omega", "phi", "psi", "chi", "pi", "kappa", "sigma", "upsilon",
  "Lambda", "Sigma", "Xi", "Omega", "Delta", "Upsilon", "Theta", "Psi", "Phi", "Pi"]);

/** The label for a hadron's own name, before its parentheses: `X`, `P_c`, `\chi_{c1}`, `\Lambda`. */
function labelOfBase(base: string): string | undefined {
  const family = byFamily(base);
  if (family) return family.particle.label;
  const greek = /^([A-Za-z]+)(?:_([A-Za-z0-9]+))?$/.exec(base);
  if (greek && GREEK.has(greek[1])) return `\\${greek[1]}${greek[2] ? (greek[2].length === 1 ? `_${greek[2]}` : `_{${greek[2]}}`) : ""}`;
  // (an exotic's letter: X, Y, or a capital and the flavours it holds, Zc, Pc, Tcc)
  if (base === "X" || base === "Y") return base;
  const exotic = /^([A-Z])_?([a-z0-9]+)$/.exec(base);
  if (exotic) return `${exotic[1]}${exotic[2].length === 1 ? `_${exotic[2]}` : `_{${exotic[2]}}`}`;
  return undefined;
}

/** What a hadron of these quarks is called: a meson, a baryon, a tetraquark... */
function kindOfHadron(quarks: { anti: boolean }[]): string {
  const baryons = Math.abs(quarks.filter((q) => !q.anti).length - quarks.filter((q) => q.anti).length) / 3, n = quarks.length;
  if (baryons === 0) return n === 2 ? "meson" : n === 4 ? "tetraquark" : n === 6 ? "hexaquark" : "hadron";
  if (baryons === 1) return n === 3 ? "baryon" : n === 5 ? "pentaquark" : "hadron";
  return n === 6 && baryons === 2 ? "dibaryon" : "hadron";
}

/**
 * A hadron written with parentheses: `X(ucd)`, `X(cc~)`, `Pc(uudcc~)` made of those quarks
 * (labelled by the name before them); `psi(2S)`, `X(3872)`, the parentheses part of the label.
 */
function withParentheses(name: string): Hadron | undefined {
  const m = /^([A-Za-z][A-Za-z0-9_']*)\((.+)\)$/.exec(name);
  if (!m) return undefined;
  const [, base, inside] = m;
  const label = labelOfBase(base);
  if (!label) return undefined;
  const family = byFamily(base);
  const quarks = /^(?:[udscbt](?:~|bar)?\s*)+$/.test(inside) ? readQuarks(inside) : undefined;
  if (quarks) {
    const meson = quarks.filter((q) => !q.anti).length === quarks.filter((q) => q.anti).length;
    return { particle: { style: meson ? MESON : BARYON, label },
      properties: { name: family?.properties.name ?? kindOfHadron(quarks), charge: chargeOfQuarks(quarks), quarks: shownQuarks(quarks) } };
  }
  // (a state named by its mass or level, X(3872), psi(2S): its quarks if they are known)
  const known = QUARKS_BY_NAME[`${base}${inside}`], content = known ? readQuarks(known) : undefined;
  const style = family?.particle.style ?? (content && content.filter((q) => !q.anti).length !== content.filter((q) => q.anti).length ? BARYON : MESON);
  return { particle: { style, label: `${label}(${inside})` },
    properties: { name: family ? `${family.properties.name} (${inside})` : `hadron ${base}(${inside})`, ...(family?.properties.spin ? { spin: family.properties.spin } : {}),
      ...(content ? { charge: chargeOfQuarks(content), quarks: shownQuarks(content) } : {}) } };
}

/** A hadron by name, or undefined. */
export function hadronNamed(name: string): Hadron | undefined {
  const single = SINGLES[name];
  if (single) return { particle: { style: single.baryon ? BARYON : MESON, label: single.label }, properties: single.properties };
  return byFamily(name) ?? withParentheses(name);
}

/** The hadrons with names of their own in the particle table: each family alone and in each charge state, and the rest. */
export function namedHadrons(): Record<string, Hadron> {
  const names: string[] = [...Object.keys(SINGLES), "K0bar"];
  for (const f of FAMILIES) {
    if (f.bare) names.push(f.symbol);
    names.push(...(f.words ?? []));
    // (each charge state, but not a lone neutral one, eta0: Lambda0 is still read, just not listed)
    const states = Object.keys(f.states);
    for (const charge of states) if (states.length > 1 || charge !== "0") names.push(`${f.symbol}${charge}`);
  }
  return Object.fromEntries(names.map((name) => [name, hadronNamed(name)!]));
}

/** The quarks of a hadron named as a particle (`kaon+`, `Sigma-`, `X(ucd)`), as `[bag=...]` writes them. */
export function quarksOfHadron(name: string): string | undefined {
  if (SINGLES[name]) return QUARKS_BY_NAME[name];
  const paren = /^([A-Za-z][A-Za-z0-9_']*)\((.+)\)$/.exec(name);
  if (paren) return labelOfBase(paren[1]) && /^(?:[udscbt](?:~|bar)?\s*)+$/.test(paren[2]) ? paren[2] : undefined;
  const read = readFamilyName(name);
  if (!read) return undefined;
  const states = Object.keys(read.f.states), charge = read.charge ?? (states.length === 1 ? states[0] : undefined);
  const state = charge !== undefined ? read.f.states[charge] : undefined;
  if (!state) return undefined;
  return read.anti ? conjugate(readQuarks(state.quarks)!).map((q) => `${q.flavour}${q.anti ? "bar" : ""}`).join(" ") : state.quarks;
}
