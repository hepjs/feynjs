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
  /** anything else worth a line: "Majorana", "hypothetical", "detector object" */
  note?: string;
}

const lepton = (name: string, charge: string, mass: string): ParticleProperties => ({ name, charge, spin: "1/2", mass });
const quark = (name: string, charge: string, mass: string): ParticleProperties => ({ name, charge, spin: "1/2", colour: "triplet", mass });
const anti = (p: ParticleProperties, name: string): ParticleProperties => ({ ...p, name, charge: p.charge === "0" ? "0" : p.charge?.startsWith("-") ? `+${p.charge.slice(1)}` : `-${p.charge?.replace("+", "")}` });
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
  "chargino": hypothetical({ name: "chargino", charge: "±1", spin: "1/2" }), "chargino+": hypothetical({ name: "chargino", charge: "+1", spin: "1/2" }),
  "chargino-": hypothetical({ name: "chargino", charge: "-1", spin: "1/2" }), "chargino2": hypothetical({ name: "heavier chargino", charge: "±1", spin: "1/2" }),
  "gravitino": hypothetical({ name: "gravitino", charge: "0", spin: "3/2" }), "LSP": hypothetical({ name: "lightest supersymmetric particle" }),
  "higgsino": hypothetical({ name: "higgsino", spin: "1/2" }), "bino": hypothetical({ name: "bino", charge: "0", spin: "1/2" }),
  "wino": hypothetical({ name: "wino", spin: "1/2" }),
  "J": object("large-R jet", "a wide jet holding a boosted W, Z, Higgs or top"),
  "tauh": object("hadronic tau", "a narrow jet of one or three charged hadrons"),
  "svj": object("semi-visible jet", "a dark shower, partly invisible"),
  "ej": object("emerging jet", "tracks from displaced dark-hadron decays"),
  "dj": object("displaced jet", "a jet from a long-lived particle's decay"),
  "ljet": object("lepton-jet", "collimated leptons, as from a light dark photon"),
  "met": object("missing transverse momentum", "what escaped unseen"),
  "Jt": object("top-tagged large-R jet", "a boosted top quark: three subjets in one wide jet"),
  "dt": object("disappearing track", "a charged particle that decays inside the tracker"),
  "dl": object("displaced lepton", "a lepton from a long-lived particle's decay"),
  "hscp": object("heavy stable charged particle", "a slow, highly ionising track (an R-hadron, a long-lived stau)"),
};

/** One line for a tooltip: "W boson · charge +1 · spin 1 · mass 80.37 GeV". */
export function particleInfo(name: string): string | undefined {
  const p = PROPERTIES[name];
  if (!p) return undefined;
  const charge = p.charge?.replace(/^-/, "−");
  return [p.name, charge && `charge ${charge}`, p.spin && `spin ${p.spin}`, p.colour && `colour ${p.colour}`, p.mass && `mass ${p.mass}`, p.note]
    .filter(Boolean).join(" · ");
}
