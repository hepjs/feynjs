import { namedHadrons } from "./hadrons.ts";
import { resolveParticle } from "./registry.ts";

/**
 * What each built-in particle is, for the reader: its name, electric charge, spin, colour and
 * mass (PDG 2024 values, rounded). Shown when the pointer rests on a particle's label, and
 * available as `particleInfo`. Hypothetical particles have no mass given.
 */
export interface ParticleProperties {
  name: string;
  /** electric charge in units of e, as written: "+2/3", "-1", "0" */
  charge?: string;
  spin?: string;
  /** "triplet" (quarks, squarks), "octet" (gluons, gluinos), or none */
  colour?: "triplet" | "octet";
  mass?: string;
  /** a hadron's valence quarks, as a reader writes them: "ud̄", "uds" */
  quarks?: string;
  /** anything else worth a line: "Majorana", "hypothetical", "detector object" */
  note?: string;
}

const lepton = (name: string, charge: string, mass: string): ParticleProperties => ({ name, charge, spin: "1/2", mass });
const quark = (name: string, charge: string, mass: string): ParticleProperties => ({ name, charge, spin: "1/2", colour: "triplet", mass });
const anti = (p: ParticleProperties, name: string): ParticleProperties => ({ ...p, name, charge: flipCharge(p.charge) });
/** The charge of the antiparticle: "+2/3" to "-2/3"; "0", "±1" and none stay as they are. */
function flipCharge(charge: string | undefined): string | undefined {
  if (!charge || charge === "0" || charge.startsWith("±")) return charge;
  return charge.startsWith("-") ? `+${charge.slice(1)}` : `-${charge.replace("+", "")}`;
}
const hypothetical = (p: ParticleProperties): ParticleProperties => ({ ...p, note: p.note ? `${p.note}; hypothetical` : "hypothetical" });
const object = (name: string, note: string): ParticleProperties => ({ name, note });

const u = quark("up quark", "+2/3", "2.16 MeV"), d = quark("down quark", "-1/3", "4.70 MeV"), s = quark("strange quark", "-1/3", "93.5 MeV");
const c = quark("charm quark", "+2/3", "1.273 GeV"), b = quark("bottom quark", "-1/3", "4.18 GeV"), t = quark("top quark", "+2/3", "172.6 GeV");
const q = { name: "quark", spin: "1/2", colour: "triplet" as const };

export const PROPERTIES: Record<string, ParticleProperties> = {
  "e-": lepton("electron", "-1", "0.511 MeV"), "e+": lepton("positron", "+1", "0.511 MeV"), "e": lepton("electron", "±1", "0.511 MeV"),
  "mu-": lepton("muon", "-1", "105.7 MeV"), "mu+": lepton("antimuon", "+1", "105.7 MeV"), "mu": lepton("muon", "±1", "105.7 MeV"),
  "tau-": lepton("tau lepton", "-1", "1.777 GeV"), "tau+": lepton("antitau", "+1", "1.777 GeV"), "tau": lepton("tau lepton", "±1", "1.777 GeV"),
  "l-": { name: "charged lepton", charge: "-1", spin: "1/2" }, "l+": { name: "charged antilepton", charge: "+1", spin: "1/2" }, "l": { name: "charged lepton", charge: "±1", spin: "1/2" },
  "nu": lepton("neutrino", "0", "< 0.8 eV"), "nubar": lepton("antineutrino", "0", "< 0.8 eV"),
  "nu_e": lepton("electron neutrino", "0", "< 0.8 eV"), "nu_mu": lepton("muon neutrino", "0", "< 0.8 eV"),
  "nu_tau": lepton("tau neutrino", "0", "< 0.8 eV"), "nu_l": lepton("neutrino", "0", "< 0.8 eV"),
  "u": u, "ubar": anti(u, "up antiquark"), "d": d, "dbar": anti(d, "down antiquark"), "s": s, "sbar": anti(s, "strange antiquark"),
  "c": c, "cbar": anti(c, "charm antiquark"), "b": b, "bbar": anti(b, "bottom antiquark"), "t": t, "tbar": anti(t, "top antiquark"),
  "q": q, "qbar": { ...q, name: "antiquark" }, "q'": q, "qbar'": { ...q, name: "antiquark" },
  "j": object("jet", "a spray of hadrons from a quark or gluon"), "bjet": object("b-jet", "a jet from a bottom quark, tagged by its displaced secondary vertex"),
  "p*": { name: "proton remnant", note: "what is left of a proton that breaks up" }, "X": object("anything", "the rest of the event"),
  "g": { name: "gluon", charge: "0", spin: "1", colour: "octet", mass: "0" },
  "gamma": { name: "photon", charge: "0", spin: "1", mass: "0" }, "a": { name: "photon", charge: "0", spin: "1", mass: "0" },
  "gamma*": { name: "virtual photon", charge: "0", spin: "1" },
  "Z": { name: "Z boson", charge: "0", spin: "1", mass: "91.19 GeV" }, "Z*": { name: "off-shell Z boson", charge: "0", spin: "1" },
  "W": { name: "W boson", charge: "±1", spin: "1", mass: "80.37 GeV" }, "W+": { name: "W boson", charge: "+1", spin: "1", mass: "80.37 GeV" },
  "W-": { name: "W boson", charge: "-1", spin: "1", mass: "80.37 GeV" }, "W*": { name: "off-shell W boson", charge: "±1", spin: "1" },
  "V": { name: "vector boson (W, Z or γ)", spin: "1" },
  "Z'": hypothetical({ name: "Z′ boson", charge: "0", spin: "1" }), "W'": hypothetical({ name: "W′ boson", charge: "±1", spin: "1" }),
  "G": hypothetical({ name: "graviton", charge: "0", spin: "2" }),
  "H": { name: "Higgs boson", charge: "0", spin: "0", mass: "125.2 GeV" }, "h": { name: "Higgs boson", charge: "0", spin: "0", mass: "125.2 GeV" },
  "A": hypothetical({ name: "CP-odd Higgs boson", charge: "0", spin: "0" }), "S": hypothetical({ name: "scalar", charge: "0", spin: "0" }),
  "phi": hypothetical({ name: "scalar", spin: "0" }),
  "H+": hypothetical({ name: "charged Higgs boson", charge: "+1", spin: "0" }), "H-": hypothetical({ name: "charged Higgs boson", charge: "-1", spin: "0" }),
  "H++": hypothetical({ name: "doubly charged Higgs boson", charge: "+2", spin: "0" }), "H--": hypothetical({ name: "doubly charged Higgs boson", charge: "-2", spin: "0" }),
  "LQ": hypothetical({ name: "leptoquark", spin: "0 or 1", colour: "triplet" }),
  "pi+": { name: "charged pion", charge: "+1", spin: "0", mass: "139.6 MeV" }, "pi-": { name: "charged pion", charge: "-1", spin: "0", mass: "139.6 MeV" },
  "pi0": { name: "neutral pion", charge: "0", spin: "0", mass: "135.0 MeV" },
  "chi": hypothetical({ name: "dark-matter particle", charge: "0" }), "chibar": hypothetical({ name: "dark-matter antiparticle", charge: "0" }),
  "N": hypothetical({ name: "heavy neutral lepton", charge: "0", spin: "1/2", note: "Majorana" }),
  "T": hypothetical({ name: "vector-like top partner", charge: "+2/3", spin: "1/2", colour: "triplet" }),
  "B": hypothetical({ name: "vector-like bottom partner", charge: "-1/3", spin: "1/2", colour: "triplet" }),
  "p": { name: "proton", charge: "+1", spin: "1/2", mass: "938.3 MeV" }, "Pb": { name: "lead nucleus", charge: "+82", mass: "193.7 GeV" },
  "gluino": hypothetical({ name: "gluino", charge: "0", spin: "1/2", colour: "octet", note: "Majorana" }),
  "squark": hypothetical({ name: "squark", spin: "0", colour: "triplet" }), "stop": hypothetical({ name: "top squark", charge: "+2/3", spin: "0", colour: "triplet" }),
  "sbottom": hypothetical({ name: "bottom squark", charge: "-1/3", spin: "0", colour: "triplet" }),
  "slepton": hypothetical({ name: "slepton", charge: "±1", spin: "0" }), "stau": hypothetical({ name: "tau slepton", charge: "±1", spin: "0" }),
  "selectron": hypothetical({ name: "selectron", charge: "±1", spin: "0" }), "smuon": hypothetical({ name: "smuon", charge: "±1", spin: "0" }),
  "sneutrino": hypothetical({ name: "sneutrino", charge: "0", spin: "0" }),
  "neutralino": hypothetical({ name: "neutralino", charge: "0", spin: "1/2", note: "Majorana" }),
  "neutralino1": hypothetical({ name: "lightest neutralino", charge: "0", spin: "1/2", note: "Majorana; often the LSP" }),
  "neutralino2": hypothetical({ name: "second neutralino", charge: "0", spin: "1/2", note: "Majorana" }),
  "neutralino3": hypothetical({ name: "third neutralino", charge: "0", spin: "1/2", note: "Majorana" }),
  "neutralino4": hypothetical({ name: "heaviest neutralino", charge: "0", spin: "1/2", note: "Majorana" }),
  "chargino": hypothetical({ name: "chargino", charge: "±1", spin: "1/2" }), "chargino+": hypothetical({ name: "chargino", charge: "+1", spin: "1/2" }),
  "chargino-": hypothetical({ name: "chargino", charge: "-1", spin: "1/2" }), "chargino1": hypothetical({ name: "lighter chargino", charge: "±1", spin: "1/2" }),
  "chargino2": hypothetical({ name: "heavier chargino", charge: "±1", spin: "1/2" }),
  "chargino1+": hypothetical({ name: "lighter chargino", charge: "+1", spin: "1/2" }), "chargino1-": hypothetical({ name: "lighter chargino", charge: "-1", spin: "1/2" }),
  "chargino2+": hypothetical({ name: "heavier chargino", charge: "+1", spin: "1/2" }), "chargino2-": hypothetical({ name: "heavier chargino", charge: "-1", spin: "1/2" }),
  "gravitino": hypothetical({ name: "gravitino", charge: "0", spin: "3/2" }), "LSP": hypothetical({ name: "lightest supersymmetric particle" }),
  "NLSP": hypothetical({ name: "next-to-lightest supersymmetric particle" }),
  "higgsino": hypothetical({ name: "higgsino", spin: "1/2" }), "bino": hypothetical({ name: "bino", charge: "0", spin: "1/2" }),
  "wino": hypothetical({ name: "wino", spin: "1/2" }),
  "higgsino0": hypothetical({ name: "neutral higgsino", charge: "0", spin: "1/2" }),
  "higgsino+": hypothetical({ name: "charged higgsino", charge: "+1", spin: "1/2" }), "higgsino-": hypothetical({ name: "charged higgsino", charge: "-1", spin: "1/2" }),
  "higgsino1": hypothetical({ name: "first neutral higgsino", charge: "0", spin: "1/2" }), "higgsino2": hypothetical({ name: "second neutral higgsino", charge: "0", spin: "1/2" }),
  "wino0": hypothetical({ name: "neutral wino", charge: "0", spin: "1/2" }),
  "wino+": hypothetical({ name: "charged wino", charge: "+1", spin: "1/2" }), "wino-": hypothetical({ name: "charged wino", charge: "-1", spin: "1/2" }),
  "stop1": hypothetical({ name: "lighter top squark", charge: "+2/3", spin: "0", colour: "triplet" }),
  "stop2": hypothetical({ name: "heavier top squark", charge: "+2/3", spin: "0", colour: "triplet" }),
  "sbottom1": hypothetical({ name: "lighter bottom squark", charge: "-1/3", spin: "0", colour: "triplet" }),
  "sbottom2": hypothetical({ name: "heavier bottom squark", charge: "-1/3", spin: "0", colour: "triplet" }),
  "stau1": hypothetical({ name: "lighter tau slepton", charge: "±1", spin: "0" }), "stau2": hypothetical({ name: "heavier tau slepton", charge: "±1", spin: "0" }),
  "selectronL": hypothetical({ name: "left-handed selectron", charge: "±1", spin: "0" }), "selectronR": hypothetical({ name: "right-handed selectron", charge: "±1", spin: "0" }),
  "smuonL": hypothetical({ name: "left-handed smuon", charge: "±1", spin: "0" }), "smuonR": hypothetical({ name: "right-handed smuon", charge: "±1", spin: "0" }),
  // (MadGraph's MSSM names, where feynjs has none of its own)
  "h2": hypothetical({ name: "heavy CP-even Higgs boson", charge: "0", spin: "0" }),
  "sve": hypothetical({ name: "electron sneutrino", charge: "0", spin: "0" }), "svm": hypothetical({ name: "muon sneutrino", charge: "0", spin: "0" }),
  "svt": hypothetical({ name: "tau sneutrino", charge: "0", spin: "0" }),
  ...mssmSfermions(),
  "J": object("large-R jet", "a wide jet holding a boosted W, Z, Higgs or top"),
  "tauh": object("hadronic tau", "a narrow jet of one or three charged hadrons"),
  "svj": object("semi-visible jet", "a dark shower, partly invisible"),
  "ej": object("emerging jet", "tracks from displaced dark-hadron decays"),
  "dj": object("displaced jet", "a jet from a long-lived particle's decay"),
  "ljet": object("lepton-jet", "collimated leptons, as from a light dark photon"),
  "met": object("missing transverse momentum", "what escaped unseen"),
  "Jt": object("top-tagged large-R jet", "a boosted top quark: three subjets in one wide jet"),
  "dt": object("disappearing track", "a charged particle that decays inside the tracker"),
  "dislep": object("displaced lepton", "a lepton from a long-lived particle's decay"),
  "hscp": object("heavy stable charged particle", "a slow, highly ionising track (an R-hadron, a long-lived stau)"),
  ...Object.fromEntries(Object.entries(namedHadrons()).map(([name, hadron]) => [name, hadron.properties])),
};

/** MadGraph's MSSM squarks by flavour and hand (`ul`, `dr`), and sleptons by hand and charge (`el-`, `mur+`, `ta1-`). */
function mssmSfermions(): Record<string, ParticleProperties> {
  const out: Record<string, ParticleProperties> = {};
  const squarks: [string, string, string][] = [["u", "up", "+2/3"], ["d", "down", "-1/3"], ["c", "charm", "+2/3"], ["s", "strange", "-1/3"]];
  for (const [q, flavour, charge] of squarks) {
    out[`${q}l`] = hypothetical({ name: `left-handed ${flavour} squark`, charge, spin: "0", colour: "triplet" });
    out[`${q}r`] = hypothetical({ name: `right-handed ${flavour} squark`, charge, spin: "0", colour: "triplet" });
  }
  for (const [l, name] of [["e", "selectron"], ["mu", "smuon"]]) {
    for (const [hand, word] of [["l", "left"], ["r", "right"]]) for (const sign of ["-", "+"]) {
      out[`${l}${hand}${sign}`] = hypothetical({ name: `${word}-handed ${sign === "+" ? `anti${name}` : name}`, charge: `${sign}1`, spin: "0" });
    }
  }
  for (const [k, word] of [["1", "lighter"], ["2", "heavier"]]) for (const sign of ["-", "+"]) {
    out[`ta${k}${sign}`] = hypothetical({ name: `${word} tau slepton`, charge: `${sign}1`, spin: "0" });
  }
  return out;
}

/** "electron neutrino" to "electron antineutrino", "W boson" stays "W boson" (its antiparticle is named the same). */
function antiName(name: string): string {
  const m = /^(.*?)([a-z]+)$/.exec(name);
  if (!m || /^anti/.test(m[2]) || /boson$/.test(name)) return name;
  return `${m[1]}anti${m[2]}`;
}

/** A hadron's quarks the other way round: each quark its antiquark ("ud̄" to "ūd"). */
const conjugateQuarks = (quarks: string) => quarks.replace(/([udscbt])(\u0304?)/g, (_, q: string, bar: string) => (bar ? q : `${q}\u0304`));

/**
 * What a particle is, by any of its names: its own, MadGraph's (`w+` is the W+, `t~` the tbar,
 * `n1` the neutralino1), an antiparticle with a tilde (`ve~`), a hadron by its parts (`K*+`,
 * `X(ucd)`).
 */
export function propertiesOf(name: string | undefined): ParticleProperties | undefined {
  if (!name) return undefined;
  if (Object.prototype.hasOwnProperty.call(PROPERTIES, name)) return PROPERTIES[name];
  const found = resolveParticle(name);
  if (!found) return undefined;
  if (found.properties) return found.properties;
  if (found.key) return PROPERTIES[found.key];
  const of = found.antiOf !== undefined ? propertiesOf(found.antiOf) : undefined;
  if (!of) return undefined;
  return { ...anti(of, antiName(of.name)), ...(of.quarks ? { quarks: conjugateQuarks(of.quarks) } : {}) };
}

/** One line for a tooltip: "W boson · charge +1 · spin 1 · mass 80.37 GeV". */
export function particleInfo(name: string): string | undefined {
  const p = propertiesOf(name);
  if (!p) return undefined;
  const charge = p.charge?.replace(/^-/, "−");
  return [p.name, p.quarks && `quarks ${p.quarks}`, charge && `charge ${charge}`, p.spin && `spin ${p.spin}`, p.colour && `colour ${p.colour}`, p.mass && `mass ${p.mass}`, p.note]
    .filter(Boolean).join(" · ");
}
