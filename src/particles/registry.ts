import type { EdgeStyle } from "../model.ts";
import type { ParticleProperties } from "./properties.ts";
import { hadronNamed, namedHadrons } from "./hadrons.ts";

export interface Particle {
  style: EdgeStyle;
  /** TeX-subset label */
  label: string;
  /** antiparticle: fermion flow runs against the particle's direction of travel */
  anti?: boolean;
}

const f = (label: string, anti = false): Particle =>
  ({ style: { line: "plain", arrow: 1 }, label, anti });
const wave = (label: string, arrow: 0 | 1 = 0): Particle =>
  ({ style: { line: "wave", arrow }, label });
const dash = (label: string, arrow: 0 | 1 = 0, anti = false): Particle =>
  ({ style: { line: "dash", arrow }, label, anti });
const susy = (line: EdgeStyle["line"], label: string, overlay = false): Particle =>
  ({ style: { line, arrow: 0, overlay, cls: "susy" }, label });

/** Generic line styles, named as in tikz-feynman. */
export const STYLES: Record<string, EdgeStyle> = {
  "plain": { line: "plain", arrow: 0 },
  "fermion": { line: "plain", arrow: 1 },
  "anti fermion": { line: "plain", arrow: -1 },
  "majorana": { line: "plain", arrow: 2 },
  "anti majorana": { line: "plain", arrow: 2, arrowsApart: true },
  "scalar": { line: "dash", arrow: 0 },
  "dashed": { line: "dash", arrow: 0 },
  "charged scalar": { line: "dash", arrow: 1 },
  "anti charged scalar": { line: "dash", arrow: -1 },
  "ghost": { line: "dot", arrow: 0 },
  "dotted": { line: "dot", arrow: 0 },
  "photon": { line: "wave", arrow: 0 },
  "boson": { line: "wave", arrow: 0 },
  "charged boson": { line: "wave", arrow: 1 },
  "anti charged boson": { line: "wave", arrow: -1 },
  "gluon": { line: "coil", arrow: 0 },
  "double": { line: "double", arrow: 0 },
  "heavy": { line: "plain", arrow: 1, heavy: true },
  "proton": { line: "triple", arrow: 0 },
  // a nucleus's path: a plain line with no arrow, which is no fermion's
  "ion": { line: "plain", arrow: 0, cls: "ion" },
  "jet": { line: "jet", arrow: 0 },
  // three dots where a leg would be: "and more" (h -> l l + X)
  "ellipsis": { line: "ellipsis", arrow: 0 },
  // detector objects at the end of a leg (semi-Feynman diagrams)
  "large jet": { line: "jet", arrow: 0, object: "large" },
  "tau jet": { line: "jet", arrow: 0, object: "tau" },
  "semi-visible jet": { line: "jet", arrow: 0, object: "semivisible" },
  "emerging jet": { line: "jet", arrow: 0, object: "emerging" },
  "displaced jet": { line: "jet", arrow: 0, object: "displaced" },
  "lepton jet": { line: "jet", arrow: 0, object: "leptonjet" },
  "missing energy": { line: "jet", arrow: 0, object: "met" },
  "top jet": { line: "jet", arrow: 0, object: "top" },
  "b jet": { line: "jet", arrow: 0, object: "btag" },
  "disappearing track": { line: "jet", arrow: 0, object: "disappearing" },
  "displaced lepton": { line: "jet", arrow: 0, object: "displacedlepton" },
  "heavy charged": { line: "jet", arrow: 0, object: "heavycharged" },
  // takes part in the layout but is not drawn: use it to hold two vertices together or apart
  "hidden": { line: "none", arrow: 0 },
  "invisible": { line: "none", arrow: 0, guide: true },
  "susy": { line: "dash", arrow: 0, cls: "susy" },
  "susy fermion": { line: "wave", arrow: 0, overlay: true, cls: "susy" },
  "susy gluon": { line: "coil", arrow: 0, overlay: true, cls: "susy" },
};

const P: Record<string, Particle> = {
  // leptons
  "e-": f("e^-"), "e+": f("e^+", true), "e": f("e"),
  "mu-": f("\\mu^-"), "mu+": f("\\mu^+", true), "mu": f("\\mu"),
  "tau-": f("\\tau^-"), "tau+": f("\\tau^+", true), "tau": f("\\tau"),
  "l-": f("\\ell^-"), "l+": f("\\ell^+", true), "l": f("\\ell"),
  "nu": f("\\nu"), "nubar": f("\\bar\\nu", true),
  "nu_e": f("\\nu_e"), "nu_mu": f("\\nu_\\mu"), "nu_tau": f("\\nu_\\tau"), "nu_l": f("\\nu_\\ell"),
  // quarks
  "q": f("q"), "qbar": f("\\bar q", true), "q'": f("q'"), "qbar'": f("\\bar q'", true),
  "j": { style: { line: "jet", arrow: 0 }, label: "j" },
  "bjet": { style: { line: "jet", arrow: 0, object: "btag" }, label: "b" },
  // what is left of a proton that breaks up
  "p*": { style: { line: "triple", arrow: 0 }, label: "p^*" }, "X": { style: { line: "jet", arrow: 0 }, label: "X" },
  // detector objects: a large-R jet, a hadronic tau, dark-sector jets, a lepton-jet, missing energy
  "J": { style: { line: "jet", arrow: 0, object: "large" }, label: "J" },
  "tauh": { style: { line: "jet", arrow: 0, object: "tau" }, label: "\\tau_{\\mathrm{had}}" },
  "svj": { style: { line: "jet", arrow: 0, object: "semivisible" }, label: "\\text{SVJ}" },
  "ej": { style: { line: "jet", arrow: 0, object: "emerging" }, label: "\\text{EJ}" },
  "dj": { style: { line: "jet", arrow: 0, object: "displaced" }, label: "\\text{DJ}" },
  "ljet": { style: { line: "jet", arrow: 0, object: "leptonjet" }, label: "\\text{LJ}" },
  "met": { style: { line: "jet", arrow: 0, object: "met" }, label: "E_{\\mathrm{T}}^{\\mathrm{miss}}" },
  "Jt": { style: { line: "jet", arrow: 0, object: "top" }, label: "J_t" },
  "dt": { style: { line: "jet", arrow: 0, object: "disappearing" }, label: "\\text{DT}" },
  // (a displaced lepton: `dl` is MadGraph's left down squark)
  "dislep": { style: { line: "jet", arrow: 0, object: "displacedlepton" }, label: "\\ell_{\\mathrm{d}}" },
  "hscp": { style: { line: "jet", arrow: 0, object: "heavycharged" }, label: "\\text{HSCP}" },
  // gauge bosons
  "g": { style: { line: "coil", arrow: 0 }, label: "g" },
  "gamma": wave("\\gamma"), "a": wave("\\gamma"),
  "Z": wave("Z"), "W": wave("W"), "W+": wave("W^+"), "W-": wave("W^-"), "V": wave("V"),
  "Z'": wave("Z'"), "W'": wave("W'"), "G": { style: { line: "wave", arrow: 0, doubled: true }, label: "G" }, "gamma*": wave("\\gamma^*"),
  "Z*": wave("Z^*"), "W*": wave("W^*"),
  // scalars
  "H": dash("H"), "h": dash("h"), "A": dash("A"), "S": dash("S"), "phi": dash("\\phi"),
  "H+": dash("H^+", 1), "H-": dash("H^-", 1, true), "H++": dash("H^{++}", 1), "H--": dash("H^{--}", 1, true),
  "LQ": dash("\\mathrm{LQ}"), "pi+": dash("\\pi^+"), "pi-": dash("\\pi^-"), "pi0": dash("\\pi^0"),
  // dark matter, heavy leptons, vector-like quarks
  "chi": f("\\chi"), "chibar": f("\\bar\\chi", true),
  "N": { style: { line: "plain", arrow: 2 }, label: "N" },
  "T": { style: { line: "plain", arrow: 1, heavy: true }, label: "T" },
  "B": { style: { line: "plain", arrow: 1, heavy: true }, label: "B" },
  // hadrons
  "p": { style: { line: "triple", arrow: 0 }, label: "p" },
  "Pb": { style: { line: "double", arrow: 0 }, label: "\\mathrm{Pb}" },
  // supersymmetry (drawn red)
  "gluino": susy("coil", "\\tilde g", true),
  "squark": susy("dash", "\\tilde q"), "stop": susy("dash", "\\tilde t"), "sbottom": susy("dash", "\\tilde b"),
  "slepton": susy("dash", "\\tilde\\ell"), "stau": susy("dash", "\\tilde\\tau"),
  "selectron": susy("dash", "\\tilde e"), "smuon": susy("dash", "\\tilde\\mu"),
  "sneutrino": susy("dash", "\\tilde\\nu"),
  "neutralino": susy("wave", "\\tilde\\chi^0", true), "neutralino1": susy("wave", "\\tilde\\chi^0_1", true),
  "neutralino2": susy("wave", "\\tilde\\chi^0_2", true), "neutralino3": susy("wave", "\\tilde\\chi^0_3", true),
  "neutralino4": susy("wave", "\\tilde\\chi^0_4", true),
  "chargino": susy("wave", "\\tilde\\chi^\\pm_1", true), "chargino+": susy("wave", "\\tilde\\chi^+_1", true),
  "chargino-": susy("wave", "\\tilde\\chi^-_1", true), "chargino1": susy("wave", "\\tilde\\chi^\\pm_1", true),
  "chargino2": susy("wave", "\\tilde\\chi^\\pm_2", true),
  "chargino1+": susy("wave", "\\tilde\\chi^+_1", true), "chargino1-": susy("wave", "\\tilde\\chi^-_1", true),
  "chargino2+": susy("wave", "\\tilde\\chi^+_2", true), "chargino2-": susy("wave", "\\tilde\\chi^-_2", true),
  "gravitino": susy("wave", "\\tilde G", true), "LSP": susy("wave", "\\tilde\\chi^0_1", true), "NLSP": susy("wave", "\\mathrm{NLSP}", true),
  "higgsino": susy("wave", "\\tilde H", true), "bino": susy("wave", "\\tilde B", true), "wino": susy("wave", "\\tilde W", true),
  "higgsino0": susy("wave", "\\tilde H^0", true), "higgsino+": susy("wave", "\\tilde H^+", true), "higgsino-": susy("wave", "\\tilde H^-", true),
  "higgsino1": susy("wave", "\\tilde H^0_1", true), "higgsino2": susy("wave", "\\tilde H^0_2", true),
  "wino0": susy("wave", "\\tilde W^0", true), "wino+": susy("wave", "\\tilde W^+", true), "wino-": susy("wave", "\\tilde W^-", true),
  "stop1": susy("dash", "\\tilde t_1"), "stop2": susy("dash", "\\tilde t_2"), "sbottom1": susy("dash", "\\tilde b_1"), "sbottom2": susy("dash", "\\tilde b_2"),
  "stau1": susy("dash", "\\tilde\\tau_1"), "stau2": susy("dash", "\\tilde\\tau_2"),
  "selectronL": susy("dash", "\\tilde e_L"), "selectronR": susy("dash", "\\tilde e_R"),
  "smuonL": susy("dash", "\\tilde\\mu_L"), "smuonR": susy("dash", "\\tilde\\mu_R"),
};
for (const q of ["u", "d", "s", "c", "b", "t"]) {
  P[q] = f(q);
  P[q + "bar"] = f(`\\bar ${q}`, true);
}
// (hadrons: mesons dashed, as the pion is, and baryons in three lines, as the proton is)
const HADRON_NAMES = new Set<string>();
for (const [name, hadron] of Object.entries(namedHadrons())) {
  P[name] = hadron.particle;
  HADRON_NAMES.add(name);
}

/**
 * MadGraph's MSSM names (as its models name them after renaming) for particles feynjs has no
 * name of its own for: the squarks by flavour and hand, the sleptons by hand and charge, the
 * sneutrinos, the heavy Higgs. Matched only as written, in this case: `dl` is a squark, `DL` the
 * displaced lepton.
 */
const MSSM: Record<string, Particle> = {
  "h2": dash("H"),
  "sve": susy("dash", "\\tilde\\nu_{e}"), "svm": susy("dash", "\\tilde\\nu_{\\mu}"), "svt": susy("dash", "\\tilde\\nu_{\\tau}"),
};
for (const q of ["u", "d", "c", "s"]) for (const hand of ["l", "r"]) MSSM[q + hand] = susy("dash", `\\tilde ${q}_{${hand.toUpperCase()}}`);
for (const [lepton, tex] of [["e", "e"], ["mu", "\\mu"]]) {
  for (const hand of ["l", "r"]) for (const sign of ["-", "+"]) MSSM[`${lepton}${hand}${sign}`] = susy("dash", `\\tilde{${tex}}^${sign}_${hand.toUpperCase()}`);
}
for (const k of ["1", "2"]) for (const sign of ["-", "+"]) MSSM[`ta${k}${sign}`] = susy("dash", `\\tilde\\tau^${sign}_${k}`);

/**
 * Other names for particles feynjs knows, matched only as written: MadGraph's (bosons in lower
 * case, z, w+, w-; neutrinos ve, vm, vt, vl; taus ta-, ta+; the MSSM's go, n1, x1+, t1, h1...).
 */
const ALIASES: Record<string, string> = {
  z: "Z", h: "H", "w+": "W+", "w-": "W-", ve: "nu_e", vm: "nu_mu", vt: "nu_tau", vl: "nu_l", "ta-": "tau-", "ta+": "tau+",
  go: "gluino", n1: "neutralino1", n2: "neutralino2", n3: "neutralino3", n4: "neutralino4",
  "x1+": "chargino1+", "x1-": "chargino1-", "x2+": "chargino2+", "x2-": "chargino2-",
  t1: "stop1", t2: "stop2", b1: "sbottom1", b2: "sbottom2",
  h1: "h", h3: "A", "h+": "H+", "h-": "H-",
  // (the displaced lepton's short name, on a point as on a line)
  DL: "dislep",
};

/** Where a name leads: the particle, and what it is filed under for its properties. */
export interface ResolvedParticle {
  particle: Particle;
  /** the name its properties are kept under (`W+` for `w+`, `tbar` for `t~`) */
  key?: string;
  /** an antiparticle made with a tilde, of the particle so named (`ve` for `ve~`) */
  antiOf?: string;
  /** a hadron named by its parts (`K*+`, `X(ucd)`): its properties, worked out */
  properties?: ParticleProperties;
}

const own = (table: Record<string, Particle>, name: string) => Object.prototype.hasOwnProperty.call(table, name);

/** A name as written: in the table, MadGraph's, or a hadron. */
function resolveAsWritten(name: string): ResolvedParticle | undefined {
  if (own(P, name)) return { particle: P[name], key: name };
  if (own(MSSM, name)) return { particle: MSSM[name], key: name };
  const alias = Object.prototype.hasOwnProperty.call(ALIASES, name) ? ALIASES[name] : undefined;
  if (alias && own(P, alias)) return { particle: P[alias], key: alias };
  const hadron = hadronNamed(name);
  if (hadron) return { particle: hadron.particle, properties: hadron.properties };
  return undefined;
}

/**
 * An antiparticle's label, from its particle's: a bar over a symbol with a subscript, not over
 * the subscript (`\bar\nu_e`), as papers write it; over the whole of anything else (`\bar{\chi}`,
 * and a sfermion, `\bar{\tilde u_{L}}`, as the MadGraph plugin writes it).
 */
function antiLabel(label: string): string {
  const m = /^(\\[A-Za-z]+|[A-Za-z])(_.+)$/.exec(label);
  if (m && !/\\tilde|\\widetilde/.test(label)) return `\\bar${m[1].startsWith("\\") ? "" : " "}${m[1]}${m[2]}`;
  return `\\bar{${label}}`;
}

/** What a name stands for, or undefined if it names no particle. */
export function resolveParticle(name: string): ResolvedParticle | undefined {
  const written = resolveAsWritten(name);
  if (written) return written;
  // (an antiparticle with a tilde, t~, b~, ve~: a charged one is its partner of the other charge,
  // pi+~ the pi-; else the "bar" name if there is one, else the particle with its arrow turned
  // and a bar over its label)
  if (name.length > 1 && name.endsWith("~")) {
    const base = name.slice(0, -1);
    const charge = /(\+\+|--|\+|-)$/.exec(base);
    const partner = charge && resolveAsWritten(base.slice(0, charge.index) + { "+": "-", "-": "+", "++": "--", "--": "++" }[charge[1]]);
    if (partner) return partner;
    if (own(P, `${base}bar`)) return { particle: P[`${base}bar`], key: `${base}bar` };
    const hadron = hadronNamed(`${base}bar`);
    if (hadron) return { particle: hadron.particle, properties: hadron.properties };
    const particle = lookupParticle(base);
    if (particle) return { particle: { ...particle, label: antiLabel(particle.label), anti: !particle.anti }, antiOf: base };
  }
  // (and in any case, Gluino, NEUTRALINO1, Svj, where only one name fits; not single letters,
  // where case tells particles apart: b and B, t and T; nor hadrons, where it tells Ω from ω)
  if (name.length > 1) {
    const lower = name.toLowerCase(), fits = Object.keys(P).filter((k) => k.toLowerCase() === lower && !HADRON_NAMES.has(k));
    if (fits.length === 1) return { particle: P[fits[0]], key: fits[0] };
  }
  return undefined;
}

export function lookupParticle(name: string): Particle | undefined {
  return resolveParticle(name)?.particle;
}

/** Bumped whenever a particle or line style is registered (drawings made before may differ). */
export const registry = { version: 0 };

/** Add a particle, or replace a built-in one: `registerParticle("ALP", { style: STYLES.scalar, label: "a" })`. */
export function registerParticle(name: string, particle: Particle): void {
  P[name] = particle;
  registry.version++;
}

/** Add a generic line style usable as `a -- [name] b`. */
export function registerLineStyle(name: string, style: EdgeStyle): void {
  STYLES[name] = style;
  registry.version++;
}

export const particleNames = (): string[] => [...Object.keys(P), ...Object.keys(MSSM).filter((name) => !own(P, name))];
