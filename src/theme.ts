import * as portable from "./geometry/portable-math.ts";
/**
 * Every number and colour that decides how a diagram looks lives here.
 * Pass a partial theme to `render` to override any of it; the rest keeps its default.
 */

/** How lines are drawn, in px. */
export interface LineLook {
  /** (set while drawing, not a theme value) a jet drawn on its own: its cone ends in an open mouth, an ellipse */
  jetMouth?: boolean;
  /** stroke width of ordinary lines */
  stroke: number;
  /** stroke width of `heavy` lines */
  heavy: number;
  /** stroke width of SUSY lines (a little bolder than ordinary ones) */
  susy: number;
  /** height of a boson's wave either side of its line */
  waveAmplitude: number;
  /** length of one period of a boson's wave; a line holds a whole number of them */
  waveLength: number;
  /** radius of a gluon's loops */
  coilRadius: number;
  /** distance along the line between successive gluon loops */
  coilPitch: number;
  /** how far each loop leans back over the previous one, as a fraction of its radius */
  coilAspect: number;
  /** length of a dash in a scalar line */
  dash: number;
  /** gap between dashes */
  dashGap: number;
  /** gap between the dots of a ghost line */
  dotGap: number;
  /** distance between the two strokes of a double line */
  doubleSeparation: number;
  /** distance between neighbouring strokes of a proton's three lines */
  tripleSeparation: number;
  /** length of a fermion arrowhead */
  arrowLength: number;
  /** width of a fermion arrowhead */
  arrowWidth: number;
  /** half opening angle of a jet cone, degrees */
  jetHalfAngle: number;
  /** widest a jet cone gets either side of its axis, px */
  jetMaxHalfWidth: number;
  /** colour of the jet cone */
  jetColor: string;
  /** each flavour of jet in a colour of its own: a b-jet blue, a c-jet green, a light jet orange */
  bJetColor: string;
  /** a hadronic tau's cone */
  tauJetColor: string;
  cJetColor: string;
  lightJetColor: string;
  /** colour of a large-R or top jet's own cone, round the jets it holds (a neutral grey, so they read as jets) */
  largeJetColor: string;
  /** how solid the cone is where it leaves the vertex, 0 to 1 */
  jetShade: number;
  /** how much of that shade is left at the far end (1 = no fade) */
  jetFade: number;
  /** a large-R jet's cone, as a multiple of an ordinary jet's */
  largeJetScale: number;
  /** a hadronic tau's or a lepton-jet's cone, as a multiple of an ordinary jet's */
  narrowJetScale: number;
  /** stroke width of the tracks drawn inside detector objects */
  trackWidth: number;
  /** a leg ending in a detector object (other than a plain jet) is drawn this many times longer, to show what is inside */
  objectLegStretch: number;
}

/** How vertices are drawn: radii in px. */
export interface VertexLook {
  /** a plain vertex dot */
  dot: number;
  /** dots that carry a coupling label or a colour are drawn larger */
  couplingDot: number;
  /** a crossed dot (an effective vertex) */
  crossedDot: number;
  /** a blob: a collision or an unresolved process */
  blob: number;
  /** the small shaded circle that marks a decay vertex */
  smallBlob: number;
  /** half the size of the cross of an insertion (a mass or mixing insertion on a line) */
  insertion: number;
  /** a nucleon's size, in px (each 0.5 of it across): a nucleus grows as the cube root of A; protons and neutrons are these colours */
  nucleusUnit: number;
  proton: string;
  neutron: string;
  nucleonEdge: string;
  /** a proton's and a neutron's own edge, a dark shade of its colour (`nucleonEdge`, ink, with `nucleon edges: ink`); "none" draws nucleons without edges */
  protonEdge?: string;
  neutronEdge?: string;
  /** fill of blobs and hadron ellipses (a page's stylesheet can override it) */
  blobFill: string;
  /** fill of a small blob, the grey of a decay vertex (a page's stylesheet can override it through .feynjs-smallblob) */
  smallBlobFill: string;
  /** distance between the lines of a hatched blob, px */
  hatchSpacing: number;
}

/** Colour flow (`colour flow: on`): thin lines beside quarks (one) and gluons (two), in px. */
export interface ColourFlowLook {
  /** clear space between a line and the colour lines beside it */
  gap: number;
  /** stroke width of a colour line */
  width: number;
  /** how solid a colour line is, 0 to 1: it lies over the diagram without hiding it */
  opacity: number;
  /** length of the small arrow on each colour line */
  arrowLength: number;
  /** width of that arrow */
  arrowWidth: number;
  /** how far from a vertex the colour lines leave their line to turn into the next */
  turn: number;
  /** the colours a colour line carries, in turn (red, green, blue): names from `colors` or any CSS colour */
  palette: string[];
  /** their anticolours, drawn where a colour line runs back in time (anti-red, anti-green, anti-blue) */
  anti: string[];
}


/**
 * Layout v2: the weights of the few forces it balances. Lengths are in propagator lengths.
 */
export interface ForceRules {
  /** natural length of a propagator */
  lineLength: number;
  /** natural length of an external leg */
  legLength: number;
  /** how strongly lines keep their natural length */
  length: number;
  /** how stiff an outgoing leg's length is, as a share of a propagator's: legs give way first */
  legGive: number;
  /** end the final states of a decay level: outgoing legs grow to reach the furthest (1 on, 0 off) */
  alignFinalStates: number;
  /** the most an outgoing leg grows to reach that plane, as a multiple of its length */
  alignStretch: number;
  /** legs of a branch's last decay leaving steeper than this, degrees from level, keep their length */
  alignSteepest: number;
  /** legs of an earlier decay reach the plane only if they leave within this many degrees of level */
  alignLevel: number;
  /** a growing leg stops this far (in line lengths) from another leg's end */
  alignGap: number;
  /** how strongly the lines at a vertex split the turn evenly */
  evenAngles: number;
  /** a particle–antiparticle pair from a contact vertex leaving together: how hard, and the angle between them (degrees) */
  pairTogether: number;
  pairOpening: number;
  /** the least angle between the two legs of a two-body decay into final states (degrees) */
  decayOpening: number;
  /** how strongly lines point the way time runs, left to right, in a short diagram */
  timeFlow: number;
  /** penalty for a line running backwards in time */
  timeOrder: number;
  /** how strongly a loop keeps its shape: an arc a half circle over a straight stretch, any other a regular polygon */
  loop: number;
  /** a leg into a loop's corner, as a share of an ordinary leg's length */
  loopLeg: number;
  /** how firmly a loop stands upright: a box's sides level and upright, a triangle with one side upright */
  loopUpright: number;
  /** how strongly a heavy particle decaying to another heavy one keeps to a small turn */
  heavyCarriesOn: number;
  /** the furthest the light product of a heavy-to-heavy decay may lean from the way time runs, degrees */
  wideLean: number;
  /** the furthest a light fermion from a heavy-to-heavy decay (a tau from a chargino) may lean, degrees */
  lightFermionLean: number;
  /** the small turn toward level, degrees, a heavy particle's line makes at each decay to another heavy one */
  heavyTurn: number;
  /** how strongly a hadron's legs end together, evenly spaced, and hadrons line up */
  hadron: number;
  /** how strongly a quark rail between hadrons runs straight through its vertices */
  rail: number;
  /** how long a beam into a blob is, relative to a leg */
  blobBeamLength: number;
  /** how much of the time-flow pull a beam into a blob feels */
  blobBeamFlow: number;
  /** the least space between two hadrons' ellipses, in line lengths */
  mesonGap: number;
  /** the spacing between the ends of one hadron's quark legs, in line lengths */
  hadronSpacing: number;
  /** how strongly two outgoing legs from different vertices are kept from heading toward each other */
  noConverging: number;
  /** degrees, per decay generation, that legs of different branches may lean toward each other */
  convergeLeeway: number;
  /** how far toward level a SUSY chain moves by its last particle (1: all the way) */
  settle: number;
  /** how near (top to bottom) two outgoing legs must run for that to matter */
  convergeReach: number;
  /** how fast that pull falls with the number of heavy decays still ahead (pull / ahead^ease) */
  depthEase: number;
  /** how much of the time-flow pull a heavy (SUSY) particle feels before its chain ends */
  heavyFlow: number;
  /** how much of the time-flow pull an intermediate (likely off-shell) boson feels */
  offShellFlow: number;
  /** how much of it a boson emitted in a moving particle's decay feels (the W of t -> b W) */
  emittedFlow: number;
  /** time-flow weight of the fermion a decay gives off beside a boson that decays on (the b of t -> b W): none, so it leans out to the side */
  givenOffFlow: number;
  /** that fermion's length, as a fraction of a leg: short, as papers draw the b */
  givenOffLength: number;
  /** how far, in degrees, a top's b turns from the top's heading, to the outside (the W is left as it lies) */
  givenOffTurn: number;
  /** how firmly it does */
  givenOffSide: number;
  /** the length, in lines, of the ordinary particle a SUSY particle gives off that decays on (the stop's top) */
  susyProductLength: number;
  /** how much more firmly that length is held than an ordinary line's */
  susyProductHold: number;
  /** the least angle, in degrees, between a SUSY particle's partner and the ordinary particle it decays to when that decays on (stop -> t neutralino): wide, so the top can be short */
  susyOpening: number;
  /** how firmly two incoming particles entering at different points come in mirrored: converging, or level, never parallel and slanting */
  beamsMirror: number;
  /** how firmly a resonance the incoming pair makes at rest (an s-channel gluon or photon) runs level */
  restLevel: number;
  /** how firmly the outgoing legs of one decay keep the same length */
  equalProducts: number;
  /** how much more of the time-flow pull the deeper of two branches made together feels, keeping it nearer level */
  deeperFlow: number;
  /** how strongly a moving particle's last decay fans out about the way it travels (the products' mean heading level) */
  forwardFork: number;
  /** how much shorter each generation of decay is drawn than the one before */
  stageShrink: number;
  /** the shortest a deep decay's outgoing legs get, relative to the first stage */
  smallestLegStage: number;
  /** how strongly light lines keep to the outside: heavy (SUSY) innermost, then bosons, fermions outermost */
  lightOutside: number;
  /** how strongly the final-state particles end level with each other (and a decay's products line up upright) */
  finalPlane: number;
  /** `final plane: on`: every final state ends on the plane and each last decay's bisector is level (1), or the usual rules (0) */
  planeFirst: number;
  /** how strongly the incoming particles start level with each other, at mirrored angles */
  beams: number;
  /** how much of the even split is kept where a fermion line passes straight through */
  passThroughEvenness: number;
  /** how strongly same-shaped branches from one vertex mirror each other */
  mirror: number;
  /** how strongly a line exchanged between two simultaneous vertices stands upright (0: off) */
  uprightExchange: number;
  /** how firmly a beam scattered by an exchange reads as scattering: in toward the centre, out away from it (0: off) */
  beamsScatter: number;
  /** the least angle, in degrees, a scattered beam comes in toward the centre and leaves away from it */
  scatterAngle: number;
  /** how strongly points not joined by a line keep apart */
  clearance: number;
  /** the clear space every drawn element keeps from elements and lines it is not joined to */
  margin: number;
  /** how far a vertex dot reaches from its point */
  vertexPad: number;
  /** the least angle between two lines leaving one vertex, degrees */
  minAngle: number;
  /** the furthest a line between two moments may lean from the way time runs, degrees */
  maxLean: number;
}

export interface Theme {
  /** px per rank: the length of a propagator */
  unitX: number;
  /** px per row */
  unitY: number;
  /** size of particle labels, px */
  fontSize: number;
  /** face of every label: the reader's own math font (CSS `math`), then named math fonts */
  fontFamily: string;
  /** the face of a panel's caption, "(a) with a loop": words, not mathematics, so a text face */
  captionFontFamily: string;
  /** blank margin around the diagram, px */
  padding: number;
  /** size of coupling labels beside vertices, relative to particle labels */
  couplingLabelScale: number;
  /** how far the point of a hadron brace reaches, px */
  hadronBraceDepth: number;
  /** colour of a hadron brace (a page's stylesheet can override it through .feynjs-brace) */
  hadronBraceColor: string;
  /** width of a hadron ellipse relative to its height */
  hadronEllipseAspect: number;
  /** the least clear space a label keeps from every line and vertex, px */
  labelMargin: number;
  /** a label with no clear place beside its line is set this much smaller, close in, rather than far from its line */
  crowdedLabelScale: number;
  /** size of labels written as upright words (LSP, NLSP, HLSP), relative to particle labels */
  wordLabelScale: number;
  /** gap between a line and its label, px */
  labelGap: number;
  /** how solid the parts not yet revealed are, with `reveal` (0 to 1) */
  revealOpacity: number;
  line: LineLook;
  vertex: VertexLook;
  colourFlow: ColourFlowLook;
  /** which layout engine: the balance of forces (v2, the default), manual (placed points stay,
   * the forces place the rest), or grid (lines on 22.5 or 45 degree directions) */
  engine: "v2" | "manual" | "grid";
  forces: ForceRules;
  /** named colours usable as `color=name` */
  colors: Record<string, string>;
  /** colour of supersymmetric particles */
  susyColor: string;
  /** `default` draws SUSY lines and the colours an author gives; `bw` makes everything black, white and grey (`colours: bw`) */
  colourScheme: "default" | "bw";
  /** how large a finished drawing is shown: its width and height are multiplied by this (`scale:` multiplies it again) */
  drawingScale: number;
  /** the colour of a pulse (`[blob, pulse]`) unless one is given, and how long one beat lasts, in seconds */
  pulseColor: string;
  pulseSeconds: number;
  /** the colour of a note's hand-drawn arrow (`note: c "words"`); its words take the diagram's colour */
  noteColor: string;
  /** a long-lived particle's band (`[lifetime]`): its width, how solid it ends, its colour, and its brace's depth */
  lifetime: { width: number; opacity: number; color: string; braceDepth: number };
  /**
   * Optical size: 1 is normal, smaller is a smaller diagram drawn for its size. Lengths follow
   * it exactly; strokes, dots, arrows and labels shrink less, so a small diagram stays legible.
   * The `size:` switch sets it per diagram (a number, or small, tiny, large).
   */
  size: number;
  /** with `charge colour: on`, the colour of positively and negatively charged particles, and of a ±charge */
  chargeColors: { positive: string; negative: string; either: string };
}

export const defaultTheme: Theme = {
  unitX: 52,
  unitY: 34,
  fontSize: 17,
  // New Computer Modern: the current standard TeX face, matching what papers are typeset in.
  // Pages should load it (see docs/stylesheets/feynjs.css); the rest are fallbacks.
  fontFamily: `math,'STIX Two Math','Cambria Math','New Computer Modern Math','Latin Modern Math',serif`,
  captionFontFamily: `system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`,
  padding: 6,
  labelGap: 4,
  revealOpacity: 0.16,
  wordLabelScale: 0.78,
  labelMargin: 3, crowdedLabelScale: 0.85,
  hadronBraceDepth: 10,
  hadronBraceColor: "#c0392b",
  hadronEllipseAspect: 0.45,
  couplingLabelScale: 0.82,
  line: {
    stroke: 1.5, heavy: 2.0, susy: 2.1,
    waveAmplitude: 4.2, waveLength: 13.5,
    coilRadius: 5.6, coilPitch: 10, coilAspect: 0.8,
    dash: 6, dashGap: 4, dotGap: 3.6,
    doubleSeparation: 3.2, tripleSeparation: 3.6,
    arrowLength: 9.5, arrowWidth: 7.5,
    jetHalfAngle: 11, jetMaxHalfWidth: 13, jetColor: "#3f90da", largeJetColor: "#8a919c", bJetColor: "#3f90da", tauJetColor: "#a472ca", cJetColor: "#23a46d", lightJetColor: "#e07b39", jetShade: 0.6, jetFade: 0.2,
    largeJetScale: 2.4, narrowJetScale: 0.8, trackWidth: 0.9, objectLegStretch: 1.6,
  },
  vertex: { dot: 3.6, couplingDot: 4.6, crossedDot: 6.5, blob: 11, smallBlob: 4.6, insertion: 4.5, nucleusUnit: 7, proton: "#b8493b", neutron: "#5d6b85", nucleonEdge: "#2b2b2b", protonEdge: "#4f1f19", neutronEdge: "#252c3a", blobFill: "rgba(100, 120, 150, 0.2)", smallBlobFill: "#9aa1ab", hatchSpacing: 2.8 },
  colourFlow: { gap: 3.4, width: 2.6, opacity: 0.6, arrowLength: 7, arrowWidth: 6.2, turn: 14, palette: ["#e0241b", "#1f9e4a", "#2f6fdf"], anti: ["#00a7c4", "#c8379f", "#f0b000"] },
  engine: "v2",
  // fitted to the hand-placed reference diagrams by scripts/fit/tune.ts (2026-11-22)
  forces: { lineLength: 1, legLength: 1.0, length: 20, legGive: 1, alignFinalStates: 1, alignStretch: 1.6, alignSteepest: 60, alignLevel: 20, alignGap: 0.35, evenAngles: 1, timeFlow: 2, timeOrder: 50, maxLean: 43, clearance: 20, margin: 0.3, vertexPad: 0.08, minAngle: 25, uprightExchange: 0.6, beamsScatter: 40, scatterAngle: 10, mirror: 2, passThroughEvenness: 0.3, beams: 4, finalPlane: 2, planeFirst: 0, stageShrink: 0.7, smallestLegStage: 0.7, lightOutside: 200, heavyCarriesOn: 20, heavyTurn: 12, wideLean: 60, lightFermionLean: 45, offShellFlow: 0.4, emittedFlow: 0.4, givenOffFlow: 0, givenOffLength: 0.75, givenOffTurn: 40, givenOffSide: 6, beamsMirror: 30, susyOpening: 50, susyProductLength: 0.8, susyProductHold: 4, restLevel: 100, equalProducts: 3, deeperFlow: 8, forwardFork: 25, heavyFlow: 22, depthEase: 0.5, noConverging: 20, hadron: 20, hadronSpacing: 0.6, mesonGap: 0.25, rail: 40, blobBeamLength: 0.75, blobBeamFlow: 0.2, convergeReach: 1.8, convergeLeeway: 4, settle: 0.8, loop: 20, loopLeg: 1, loopUpright: 6, pairTogether: 20, pairOpening: 16, decayOpening: 40 },
  // The Petroff accessible colour cycle (2021), the scheme now recommended for HEP figures
  // and shipped in mplhep: distinguishable under colour-vision deficiency and in greyscale.
  // green, pink, teal and gold are not in that cycle; they are chosen to sit beside it.
  colors: {
    blue: "#3f90da", orange: "#e76300", red: "#e0241b", gray: "#94a4a2", grey: "#94a4a2",
    purple: "#832db6", brown: "#a96b59", yellow: "#ffa90e", tan: "#b9ac70", ash: "#717581", cyan: "#92dadd",
    green: "#2e8b57", pink: "#d6468f", teal: "#1a9a9d", gold: "#c99700", black: "#000000",
  },
  susyColor: "#c0392b",
  colourScheme: "default",
  drawingScale: 1.3,
  pulseColor: "#c0392b",
  pulseSeconds: 2.4,
  noteColor: "#d0393f",
  lifetime: { width: 12, opacity: 0.3, color: "#3f90da", braceDepth: 6 },
  chargeColors: { positive: "#e76300", negative: "#3f90da", either: "#832db6" },
  size: 1,
};

export type ThemeOverrides = { [K in keyof Theme]?: Theme[K] extends object ? Partial<Theme[K]> : Theme[K] };

/** The default theme with the given overrides applied, one level deep. */
export function themeWith(overrides: ThemeOverrides = {}): Theme {
  const theme: any = { ...defaultTheme };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    theme[key] = typeof value === "object" && value !== null ? { ...(defaultTheme as any)[key], ...value } : value;
  }
  return theme as Theme;
}

/** Named optical sizes for the `size:` switch. */
// (medium is TikZ-Feynman's name for its usual size)
export const NAMED_SIZES: Record<string, number> = { tiny: 0.55, small: 0.72, normal: 1, medium: 1, large: 1.3 };

/**
 * How each measure follows the optical size: a measure scales by size^power. Lengths of lines
 * scale fully (1); strokes least (a small diagram's lines are relatively heavier, as a small
 * typeface's are); waves, coils, dots, arrows and labels in between.
 */
const SIZE_POWER: { [K in keyof Theme]?: number | Record<string, number> } = {
  unitX: 1, unitY: 1, padding: 0.5, fontSize: 0.55, labelGap: 0.6, labelMargin: 0.6, hadronBraceDepth: 0.7,
  line: { stroke: 0.2, heavy: 0.2, susy: 0.2, trackWidth: 0.4, waveAmplitude: 0.75, waveLength: 0.75, coilRadius: 0.75, coilPitch: 0.75,
    dash: 0.6, dashGap: 0.6, dotGap: 0.6, doubleSeparation: 0.5, tripleSeparation: 0.5, arrowLength: 0.55, arrowWidth: 0.55, jetMaxHalfWidth: 0.8 },
  vertex: { dot: 0.55, couplingDot: 0.55, crossedDot: 0.6, blob: 0.75, smallBlob: 0.6, insertion: 0.6, hatchSpacing: 0.6 },
  colourFlow: { gap: 0.6, width: 0.4, arrowLength: 0.55, arrowWidth: 0.55, turn: 0.8 },
};

/** The theme drawn at an optical size (see `Theme.size`). */
export function sizedTheme(theme: Theme, size = theme.size): Theme {
  if (!(size > 0) || size === 1) return theme;
  const out: any = { ...theme, size };
  for (const [key, power] of Object.entries(SIZE_POWER)) {
    if (typeof power === "number") out[key] = (theme as any)[key] * portable.power(size, power);
    else {
      out[key] = { ...(theme as any)[key] };
      for (const [k, p] of Object.entries(power)) if (typeof out[key][k] === "number") out[key][k] *= portable.power(size, p);
    }
  }
  return out as Theme;
}

/** The optical size a `size:` switch asks for: a number, or a name. */
export function sizeFromSwitch(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const named = NAMED_SIZES[value.trim().toLowerCase()];
  const n = named ?? Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
