import type { ForceRules } from "../../theme.ts";

/**
 * The force layout's rules in seven families, by what they look at: how far apart things are,
 * which way time runs, how the incoming lines meet, how a decay fans out, how heavy each particle
 * is, hadrons, and loops. No rule looks at a particle's name: a W and a Z are drawn alike, and
 * every fermion alike but by its mass (the top, and new heavy fermions, are massive; every
 * lepton and every other quark light).
 *
 * Each force and each setting belongs to exactly one family (a test keeps it so). `debug: on`
 * says which families hold each line; the theme reference lists the settings family by family.
 */
export interface Family {
  name: string;
  /** its mark in `debug: on`: a letter on a disc of its colour (a colour that reads on light pages and dark) */
  letter: string;
  colour: string;
  /** a family that acts on every line (spacing, time): a line is marked with it only when no other holds it */
  everywhere?: boolean;
  /** what the family does, in a few words */
  about: string;
  /** the forces in it, by their names */
  forces: string[];
  /** the settings that tune it */
  settings: (keyof ForceRules)[];
  /**
   * its settings that act through another family's forces (the b's length, through the line
   * lengths), and the values that leave them doing nothing: the family left out, for `debug: on`
   */
  neutral?: Partial<ForceRules>;
}

export const FAMILIES: Family[] = [
  {
    name: "spacing", letter: "S", colour: "#7b8494", everywhere: true,
    about: "lines their length, shorter deeper in a cascade; angles even at each point; everything clear of everything else",
    forces: ["length", "even angles", "clearance"],
    settings: ["lineLength", "legLength", "length", "legGive", "stageShrink", "smallestLegStage", "evenAngles", "passThroughEvenness", "clearance", "margin", "vertexPad", "minAngle"],
  },
  {
    name: "time", letter: "T", colour: "#3b7be0", everywhere: true,
    about: "time runs left to right: lines lean the way it runs, and nothing runs back",
    forces: ["time flow", "time order"],
    settings: ["timeFlow", "timeOrder", "maxLean", "offShellFlow", "emittedFlow", "deeperFlow"],
  },
  {
    name: "incoming", letter: "I", colour: "#0e9f8e",
    about: "the incoming lines come in mirrored, converging or level; a beam an exchange scatters comes in toward the centre and leaves outward; an exchange between them stands upright, exactly so where it is heavy; a resonance they make at rest runs level; a line scattered off a nucleus comes in toward it and leaves away",
    forces: ["beams start together", "straight into blob", "rest level", "upright exchange", "beams scatter", "exchange fan", "nucleus scatter"],
    settings: ["beams", "beamsMirror", "blobBeamLength", "blobBeamFlow", "restLevel", "uprightExchange", "beamsScatter", "scatterAngle"],
  },
  {
    name: "decays", letter: "D", colour: "#d97706",
    about: "a decay fans forward about its parent, its products alike in length and opening wide; twin branches mirror each other; final states end level, and do not run back together",
    forces: ["forward forks", "equal products", "final plane", "no converging", "mirror branches", "shower fan", "pairs together"],
    neutral: { decayOpening: 0 },
    settings: ["forwardFork", "equalProducts", "decayOpening", "finalPlane", "planeFirst", "alignFinalStates", "alignStretch", "alignSteepest", "alignLevel", "alignGap", "noConverging", "convergeLeeway", "convergeReach", "mirror", "pairTogether", "pairOpening"],
  },
  {
    name: "mass", letter: "M", colour: "#9b51e0",
    about: "heavier particles run inside and carry on; a massive particle's light product (the b of a top, the top of a stop) is short and leaves to the outside",
    forces: ["given off sideways", "heavy carries on", "light outside"],
    neutral: { givenOffLength: 1, givenOffFlow: 1, susyProductLength: 1, susyProductHold: 1, susyOpening: 0 },
    settings: ["lightOutside", "heavyCarriesOn", "heavyTurn", "wideLean", "lightFermionLean", "heavyFlow", "depthEase", "settle", "givenOffFlow", "givenOffLength", "givenOffTurn", "givenOffSide", "susyProductLength", "susyProductHold", "susyOpening"],
  },
  {
    name: "hadrons", letter: "H", colour: "#2f9e44",
    about: "a hadron's quarks run side by side, evenly spaced; a vacuum pair's quarks arc away together",
    forces: ["hadrons", "vacuumArcs"],
    settings: ["hadron", "rail", "mesonGap", "hadronSpacing"],
  },
  {
    name: "loops", letter: "L", colour: "#d6336c",
    about: "a loop keeps its shape: a half circle over a line, or a regular polygon, upright",
    forces: ["loops"],
    settings: ["loop", "loopLeg", "loopUpright"],
  },
];
