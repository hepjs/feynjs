export type LineKind = "plain" | "wave" | "coil" | "dash" | "dot" | "double" | "triple" | "jet" | "ellipsis" | "none";

/** arrow: 1 along the edge as written, -1 against it, 2 clashing (Majorana), 0 none. */
export interface EdgeStyle {
  line: LineKind;
  arrow: 0 | 1 | -1 | 2;
  /** a Majorana line's two arrows pointing apart, away from its middle (`anti majorana`) */
  arrowsApart?: boolean;
  /** straight line drawn over a wave/coil (gauginos, gluino) */
  overlay?: boolean;
  /** colour class: "susy" lines are red */
  cls?: string;
  color?: string;
  heavy?: boolean;
  /** arrows at chosen places along the line, as fractions of its length (`with arrow=0.3`, `with reversed arrow=0.7`) */
  arrowsAt?: { at: number; dir: 1 | -1 }[];
  /** drawn twice, side by side: a graviton's double wave, a double dashed line */
  doubled?: boolean;
  /** a jet cone drawn around the line: a parton that ends in a jet */
  jetCone?: boolean;
  /**
   * For `jet` lines, which detector object the leg ends in: a jet (the default), a large-R jet,
   * a hadronic tau, a semi-visible, emerging or displaced jet, a lepton-jet, or missing energy.
   */
  object?: JetObject;
  /** a jet's impact parameters drawn (`[bjet, impact]`): the beam through where it starts, z0 along it and d0 into the page */
  impact?: boolean;
  /** a photon that converts (`[photon, converted]`): the photon, then the e+e- pair it makes */
  converted?: boolean;
  /** a hadronic tau's charged tracks, 1 or 3 (`[taujet, 3prong]`) */
  prongs?: 1 | 3;
  /** a line that is not drawn but still holds the layout together (`[invisible]`) */
  guide?: boolean;
  /** words that change how an object is drawn (`[displaced track]`) */
  adjectives?: string[];
  /** what is drawn inside an object (`[LRJ 2j 1e]`: two jets and an electron; `W(2j)` a W and what it decays to) */
  contents?: ObjectContent[];
}

/** One thing drawn inside a detector object: a jet, a lepton..., or a particle and what it decays to. */
export interface ObjectContent { kind: string; count: number; contents?: ObjectContent[] }

export type JetObject = "jet" | "large" | "top" | "btag" | "ctag" | "tau" | "semivisible" | "emerging" | "displaced" | "leptonjet" | "met"
  | "disappearing" | "displacedlepton" | "heavycharged" | "track" | "remnant";

export type VertexShape =
  | "none" | "dot" | "empty" | "square" | "crossed" | "blob" | "smallblob" | "hatched" | "smallhatched" | "slashed" | "insertion" | "nucleus" | "bag" | "circle";

export interface Vertex {
  id: string;
  /** particle label shown at an external end */
  label?: string;
  /** coupling label shown beside an internal vertex */
  coupling?: string;
  /** a dot's rim colour, apart from its fill (`[dot, color=blue, rim=black]`) */
  rim?: string;
  /** how much larger (or smaller) than usual a dot is drawn (`[dot, size=1.5]`) */
  dotScale?: number;
  /** which way the coupling label sits from the vertex (a unit vector, y down); by default the widest gap */
  couplingSide?: { x: number; y: number };
  shape: VertexShape;
  color?: string;
  role?: "in" | "out";
  /** position in an `in:` or `out:` list: fixes the top-to-bottom order of the legs */
  declaredOrder?: number;
  fixed?: { x: number; y: number };
  /** a nucleus drawn as packed protons and neutrons (`[nucleus=Pb]`, `[nucleus, A=208, Z=82]`) */
  nucleus?: { A?: number; Z?: number; N?: number };
  /** a nucleus recoiling (`[nucleus=Xe, recoil]`, `recoil=down`, `recoil=30`): drawn moved on, faint copies trailing back; "" away from what hits it */
  recoil?: string;
  /** a nucleus at the end of a line, neither coming in nor going out: what the line acts on, laid out as a field is */
  target?: boolean;
  /** what a nucleus gives off on its own (`[nucleus=Xe*, emits=gamma]`): a short line out of it, away from what hits it */
  emits?: string;
  /** a hadron drawn as a bag of its valence quarks (`[bag=proton]`, `[bag=c cbar u dbar]`), turning slowly with `motion` */
  bag?: { quarks: { flavour: string; anti: boolean; group?: number }[]; motion?: boolean; molecule?: boolean };
  /** what is written inside a circle drawn at the point (`[circle=b]`): where a jet starts, its flavour */
  circleLabel?: string;
  /** particle key given on the vertex, used to style the attached edge */
  particle?: string;
  /** a leg that ends in a jet: its line gets a jet cone (`f1 [q, jet]`) */
  jetCone?: boolean;
  /** a leg that ends in a small cone symbol, a jet marked as papers mark it (`f1 [b_1, cone]`) */
  coneMark?: boolean;
  /** an animated pulse around the point, to draw the eye to it (`[blob, pulse]`, `[dot, pulse=blue]`); "" for the default colour */
  pulse?: string;
  /** where a final state goes in the kinematic view: `eta=`, `phi=` (degrees), or nudged by `deta=`, `dphi=` */
  kinematics?: { eta?: number; phi?: number; deta?: number; dphi?: number };
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
  style: EdgeStyle;
  /** true when the author gave an explicit style or particle key */
  styled: boolean;
  /** the particle the line is, when a particle key named it (on the line or its external leg) */
  particle?: string;
  label?: string;
  labelSide?: 1 | -1;
  /** a colour for the label alone (by default it takes the line's) */
  labelColor?: string;
  momentum?: string;
  /** the momentum arrow on the other side of the line (`momentum'`) */
  momentumOtherSide?: boolean;
  /** the momentum arrow pointing against the line (`reversed momentum`, `rmomentum`) */
  momentumReversed?: boolean;
  /** `every ...` defaults that change a style (heavy, dashed), kept for a line that takes its style from its leg's particle */
  styleDefaults?: Partial<EdgeStyle>;
  /** crosses on the line at these fractions of its length (`insertion=0.33`): mass or mixing insertions */
  insertions?: number[];
  /**
   * the line leaves its start at `out` degrees and arrives at its end from `in` degrees (counter-
   * clockwise from the right, as in TikZ), bowing out further with `looseness`
   */
  angles?: { out?: number; in?: number; looseness?: number };
  /** how far a loop from a point back to itself reaches out, in line lengths (TikZ's `min distance`) */
  loopReach?: number;
  /** signed bend angle in degrees; positive bends to the left of travel */
  bend?: number;
  /** true when the bend was chosen by feynjs, so the layout may still change it */
  bendIsAutomatic?: boolean;
  /**
   * radiation (`[photon, radiation]`): given off a line that runs on into the collision. An
   * outgoing gluon leg is radiation without saying so; a W, Z or photon is not, unless marked.
   */
  radiation?: boolean;
  /** an animated glow along the line, to draw the eye to it (`[gluino, pulse]`); "" for the default colour */
  pulse?: string;
  /** how long the line is, as a share of the usual length (`length=1.5`, `length=2cm`): the layout honours it */
  length?: number;
  /**
   * a particle that lives a while (`[lifetime]`): a band under the line, fading in along it; with
   * a value (`lifetime={c\tau}`), a brace beside it carrying that label
   */
  lifetime?: string;
}

/** External legs that belong to one hadron, drawn with a brace and the hadron's name. */
export interface HadronGroup {
  label: string;
  legs: string[];
  /** a brace beside the legs, or a shaded ellipse over their ends with the name inside */
  shape: "brace" | "ellipse" | "cap";
  /** an ellipse hatched rather than shaded (`[hatched]`), as some papers draw a colour octet */
  hatched?: boolean;
}

export interface Diagram {
  vertices: Map<string, Vertex>;
  edges: Edge[];
  hadrons: HadronGroup[];
  directives: Record<string, string>;
  /** drawn from a nuclear process line (`2H 3H > 4He n`): drawn as the reaction, unless `view: diagram` */
  nuclear?: boolean;
  /** a nuclear process that decays on, step by step (`238U > 234Th 4He`, `234Th > 234Pa e- ve~`): drawn as a decay chain */
  decayChain?: DecayStep[];
}

/** A nucleus as a decay chain draws it: its numbers, its label, and the name it was written by. */
export interface ChainNucleus { A: number; Z: number; label: string; name: string }

/** One step of a decay chain: the nucleus that decays, the one it leaves, and what it gives off (a nucleus, or a particle by name). */
export interface DecayStep { parent: ChainNucleus; daughter: ChainNucleus; given: { nucleus?: ChainNucleus; particle?: string; label: string }[] }

export class FeynError extends Error {
  line?: number;
  constructor(message: string, line?: number) {
    super(line ? `line ${line}: ${message}` : message);
    this.line = line;
  }
}
