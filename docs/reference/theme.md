---
tags:
  - options
  - defaults
  - line width
  - stroke
  - colours
  - colors
  - font
  - size
---

# Theme settings

```feynman
--- default
p p > t tbar
t > b W+
tbar > bbar W-
--- size: small
size: small
p p > t tbar
t > b W+
tbar > bbar W-
```

```text
--- default
p p > t tbar
t > b W+
tbar > bbar W-
--- size: small
size: small
p p > t tbar
t > b W+
tbar > bbar W-
```

`size: small` in the source sets the theme's `size` for one diagram; from JavaScript it is
`render(source, { theme: { size: 0.72 } })`.

Every size, colour and layout weight feynjs uses, with its default. Pass any of them to
`render` (or `run`) under `theme`; whatever you leave out keeps its default. Groups merge one level
deep, so `{ line: { stroke: 2 } }` changes the stroke and keeps every other line setting.

```js
feynjs.render(source, { theme: { line: { stroke: 2 }, susyColor: "#8e44ad" } });
```

See [Styling and themes](../guide/styling.md) for how to use them, and the colours the site's stylesheet adds.

*Lists the settings in `src/theme.ts`.*

## Page and labels

| Setting | Default | What it controls |
|---|---|---|
| `unitX` | `52` | px per rank: the length of a propagator |
| `unitY` | `34` | px per row |
| `fontSize` | `17` | size of particle labels, px |
| `fontFamily` | `"'NewComputerModern10','New Computer M..."` | face of every label: the diagram's TeX look comes from New Computer Modern |
| `padding` | `6` | blank margin around the diagram, px |
| `labelGap` | `4` | gap between a line and its label, px |
| `revealOpacity` | `0.16` | how solid the parts not yet revealed are, with `reveal` (0 to 1) |
| `wordLabelScale` | `0.78` | size of labels written as upright words (LSP, NLSP, HLSP), relative to particle labels |
| `labelMargin` | `3` | the least clear space a label keeps from every line and vertex, px |
| `hadronBraceDepth` | `10` | how far the point of a hadron brace reaches, px |
| `hadronBraceColor` | `"#c0392b"` | colour of a hadron brace (a page's stylesheet can override it through .feynjs-brace) |
| `hadronEllipseAspect` | `0.45` | width of a hadron ellipse relative to its height |
| `couplingLabelScale` | `0.82` | size of coupling labels beside vertices, relative to particle labels |
| `engine` | `"v2"` | which layout engine: the rule-based one (v1) or the balance of forces (v2) |
| `susyColor` | `"#c0392b"` | colour of supersymmetric particles |
| `size` | `1` |  |

## Lines: `line`

Sizes in px.

| Setting | Default | What it controls |
|---|---|---|
| `line.stroke` | `1.5` | stroke width of ordinary lines |
| `line.heavy` | `2.4` | stroke width of `heavy` lines |
| `line.susy` | `2.1` | stroke width of SUSY lines (a little bolder than ordinary ones) |
| `line.waveAmplitude` | `4.2` | height of a boson's wave either side of its line |
| `line.waveLength` | `13.5` | length of one period of a boson's wave; a line holds a whole number of them |
| `line.coilRadius` | `5.6` | radius of a gluon's loops |
| `line.coilPitch` | `10` | distance along the line between successive gluon loops |
| `line.coilAspect` | `0.8` | how far each loop leans back over the previous one, as a fraction of its radius |
| `line.dash` | `6` | length of a dash in a scalar line |
| `line.dashGap` | `4` | gap between dashes |
| `line.dotGap` | `3.6` | gap between the dots of a ghost line |
| `line.doubleSeparation` | `3.2` | distance between the two strokes of a double line |
| `line.tripleSeparation` | `3.6` | distance between neighbouring strokes of a proton's three lines |
| `line.arrowLength` | `9.5` | length of a fermion arrowhead |
| `line.arrowWidth` | `7.5` | width of a fermion arrowhead |
| `line.jetHalfAngle` | `9` | half opening angle of a jet cone, degrees |
| `line.jetMaxHalfWidth` | `11` | widest a jet cone gets either side of its axis, px |
| `line.jetColor` | `"#3f90da"` | colour of the jet cone |
| `line.jetShade` | `0.6` | how solid the cone is where it leaves the vertex, 0 to 1 |
| `line.jetFade` | `0.2` | how much of that shade is left at the far end (1 = no fade) |
| `line.largeJetScale` | `2` | a large-R jet's cone, as a multiple of an ordinary jet's |
| `line.narrowJetScale` | `0.8` | a hadronic tau's or a lepton-jet's cone, as a multiple of an ordinary jet's |
| `line.trackWidth` | `0.9` | stroke width of the tracks drawn inside detector objects |
| `line.objectLegStretch` | `1.6` | a leg ending in a detector object (other than a plain jet) is drawn this many times longer, to show what is inside |

## Vertices: `vertex`

Radii in px.

| Setting | Default | What it controls |
|---|---|---|
| `vertex.dot` | `3.6` | a plain vertex dot |
| `vertex.couplingDot` | `4.6` | dots that carry a coupling label or a colour are drawn larger |
| `vertex.crossedDot` | `6.5` | a crossed dot (an effective vertex) |
| `vertex.blob` | `11` | a blob: a collision or an unresolved process |
| `vertex.smallBlob` | `4.6` | the small shaded circle that marks a decay vertex |
| `vertex.insertion` | `4.5` | half the size of the cross of an insertion (a mass or mixing insertion on a line) |
| `vertex.blobFill` | `"rgba(100, 120, 150, 0.2)"` | fill of blobs and hadron ellipses (a page's stylesheet can override it) |
| `vertex.smallBlobFill` | `"#9aa1ab"` | fill of a small blob, the grey of a decay vertex (a page's stylesheet can override it through .feynjs-smallblob) |
| `vertex.hatchSpacing` | `2.8` | distance between the lines of a hatched blob, px |

## Colour flow: `colourFlow`

The colour lines drawn with `colour flow: on`. Sizes in px.

| Setting | Default | What it controls |
|---|---|---|
| `colourFlow.gap` | `3.4` | clear space between a line and the colour lines beside it |
| `colourFlow.width` | `2.6` | stroke width of a colour line |
| `colourFlow.opacity` | `0.6` | how strong a colour line's colour is, 0 to 1: drawn solid, as the colour would look this see-through on white |
| `colourFlow.arrowLength` | `7` | length of the small arrow on each colour line |
| `colourFlow.arrowWidth` | `6.2` | width of that arrow |
| `colourFlow.turn` | `14` | how far from a vertex the colour lines leave their line to turn into the next |
| `colourFlow.palette` | `["#e0241b","#1f9e4a","#2f6fdf"]` | the colours a colour line carries, in turn (red, green, blue): names from `colors` or any CSS colour |
| `colourFlow.anti` | `["#00a7c4","#c8379f","#f0b000"]` | their anticolours (anti-red, anti-green, anti-blue), where a colour line runs back in time |

## Named colours: `colors`

Usable as `color=name` on a line or vertex. The default set is the Petroff accessible colour cycle, which stays distinguishable under colour-vision deficiency and in greyscale.

| Name | Colour |
|---|---|
| `blue` | `#3f90da` |
| `orange` | `#e76300` |
| `red` | `#e0241b` |
| `gray` | `#94a4a2` |
| `grey` | `#94a4a2` |
| `purple` | `#832db6` |
| `brown` | `#a96b59` |
| `yellow` | `#ffa90e` |
| `tan` | `#b9ac70` |
| `ash` | `#717581` |
| `cyan` | `#92dadd` |
| `green` | `#2e8b57` |
| `pink` | `#d6468f` |
| `teal` | `#1a9a9d` |
| `gold` | `#c99700` |
| `black` | `#000000` |

## Layout v2 forces: `forces`

The weights the force layout balances (the default engine). Lengths are in propagator lengths.
They come in seven families, by what they look at; no rule looks at a particle's name. A W and a
Z are drawn alike, and every fermion alike but by its mass: the top (and any new heavy fermion) is
massive, every lepton and every other quark light. `debug: on` shows which families hold each line.

### Spacing

Lines their length, shorter deeper in a cascade; angles even at each point; everything clear of everything else.

| Setting | Default | What it controls |
|---|---|---|
| `forces.lineLength` | `1` | natural length of a propagator |
| `forces.legLength` | `1` | natural length of an external leg |
| `forces.length` | `20` | how strongly lines keep their natural length |
| `forces.legGive` | `1` | how stiff an outgoing leg's length is, as a share of a propagator's: legs give way first |
| `forces.stageShrink` | `0.7` | how much shorter each generation of decay is drawn than the one before |
| `forces.smallestStage` | `0.45` | the shortest a deep decay's lines get, relative to the first stage |
| `forces.smallestLegStage` | `0.7` | the shortest a deep decay's outgoing legs get, relative to the first stage |
| `forces.evenAngles` | `1` | how strongly the lines at a vertex split the turn evenly |
| `forces.passThroughEvenness` | `0.3` | how much of the even split is kept where a fermion line passes straight through |
| `forces.clearance` | `20` | how strongly points not joined by a line keep apart |
| `forces.margin` | `0.3` | the clear space every drawn element keeps from elements and lines it is not joined to |
| `forces.vertexPad` | `0.08` | how far a vertex dot reaches from its point |
| `forces.minAngle` | `25` | the least angle between two lines leaving one vertex, degrees |

### Time

Time runs left to right: lines lean the way it runs, and nothing runs back.

| Setting | Default | What it controls |
|---|---|---|
| `forces.timeFlow` | `2` | how strongly lines point the way time runs, left to right, in a short diagram |
| `forces.shortDiagram` | `3` | the most steps in time (incoming legs to outgoing) a diagram has and still counts as short |
| `forces.flowFade` | `1` | how the time-flow pull shrinks for each step beyond a short diagram |
| `forces.longFlow` | `0.3` | the weakest the time-flow pull gets, in the longest diagrams |
| `forces.timeOrder` | `50` | penalty for a line running backwards in time |
| `forces.maxLean` | `43` | the furthest a line between two moments may lean from the way time runs, degrees |
| `forces.offShellFlow` | `0.4` | how much of the time-flow pull an intermediate (likely off-shell) boson feels |
| `forces.emittedFlow` | `0.4` | how much of it a boson emitted in a moving particle's decay feels (the W of t -> b W) |
| `forces.deeperFlow` | `8` | how much more of the time-flow pull the deeper of two branches made together feels, keeping it nearer level |

### Incoming

The incoming lines come in mirrored, converging or level; an exchange between them stands upright; a resonance they make at rest runs level.

| Setting | Default | What it controls |
|---|---|---|
| `forces.beams` | `4` | how strongly the incoming particles start level with each other, at mirrored angles |
| `forces.beamsMirror` | `30` | how firmly two incoming particles entering at different points come in mirrored: converging, or level, never parallel and slanting |
| `forces.blobBeamLength` | `0.75` | how long a beam into a blob is, relative to a leg |
| `forces.blobBeamFlow` | `0.2` | how much of the time-flow pull a beam into a blob feels |
| `forces.restLevel` | `100` | how firmly a resonance the incoming pair makes at rest (an s-channel gluon or photon) runs level |
| `forces.uprightExchange` | `0.6` | how strongly a line exchanged between two simultaneous vertices stands upright (0: off) |

### Decays

A decay fans forward about its parent, its products alike in length and opening wide; twin branches mirror each other; final states end level, and do not run back together.

| Setting | Default | What it controls |
|---|---|---|
| `forces.forwardFork` | `25` | how strongly a moving particle's last decay fans out about the way it travels (the products' mean heading level) |
| `forces.equalProducts` | `3` | how firmly the outgoing legs of one decay keep the same length |
| `forces.decayOpening` | `40` | the least angle between the two legs of a two-body decay into final states (degrees) |
| `forces.finalPlane` | `2` | how strongly the final-state particles end level with each other (and a decay's products line up upright) |
| `forces.planeFirst` | `0` | `final plane: on`: every final state ends on the plane and each last decay's bisector is level (1), or the usual rules (0) |
| `forces.alignFinalStates` | `1` | end the final states of a decay level: outgoing legs grow to reach the furthest (1 on, 0 off) |
| `forces.alignStretch` | `1.6` | the most an outgoing leg grows to reach that plane, as a multiple of its length |
| `forces.alignSteepest` | `60` | legs of a branch's last decay leaving steeper than this, degrees from level, keep their length |
| `forces.alignLevel` | `20` | legs of an earlier decay reach the plane only if they leave within this many degrees of level |
| `forces.alignGap` | `0.35` | a growing leg stops this far (in line lengths) from another leg's end |
| `forces.noConverging` | `20` | how strongly two outgoing legs from different vertices are kept from heading toward each other |
| `forces.convergeLeeway` | `4` | degrees, per decay generation, that legs of different branches may lean toward each other |
| `forces.convergeReach` | `1.8` | how near (top to bottom) two outgoing legs must run for that to matter |
| `forces.mirror` | `2` | how strongly same-shaped branches from one vertex mirror each other |
| `forces.pairTogether` | `20` | a particle–antiparticle pair from a contact vertex leaving together: how hard, and the angle between them (degrees) |
| `forces.pairOpening` | `16` | a particle–antiparticle pair from a contact vertex leaving together: how hard, and the angle between them (degrees) |

### Mass

Heavier particles run inside and carry on; a massive particle's light product (the b of a top, the top of a stop) is short and leaves to the outside.

| Setting | Default | What it controls |
|---|---|---|
| `forces.lightOutside` | `200` | how strongly light lines keep to the outside: heavy (SUSY) innermost, then bosons, fermions outermost |
| `forces.heavyCarriesOn` | `20` | how strongly a heavy particle decaying to another heavy one keeps to a small turn |
| `forces.heavyTurn` | `12` | the small turn toward level, degrees, a heavy particle's line makes at each decay to another heavy one |
| `forces.wideLean` | `60` | the furthest the light product of a heavy-to-heavy decay may lean from the way time runs, degrees |
| `forces.lightFermionLean` | `45` | the furthest a light fermion from a heavy-to-heavy decay (a tau from a chargino) may lean, degrees |
| `forces.heavyFlow` | `22` | how much of the time-flow pull a heavy (SUSY) particle feels before its chain ends |
| `forces.depthEase` | `0.5` | how fast that pull falls with the number of heavy decays still ahead (pull / ahead^ease) |
| `forces.settle` | `0.8` | how far toward level a SUSY chain moves by its last particle (1: all the way) |
| `forces.givenOffFlow` | `0` | time-flow weight of the fermion a decay gives off beside a boson that decays on (the b of t -> b W): none, so it leans out to the side |
| `forces.givenOffLength` | `0.75` | that fermion's length, as a fraction of a leg: short, as papers draw the b |
| `forces.givenOffTurn` | `40` | how far, in degrees, a top's b turns from the top's heading, to the outside (the W is left as it lies) |
| `forces.givenOffSide` | `6` | how firmly it does |
| `forces.susyProductLength` | `0.8` | the length, in lines, of the ordinary particle a SUSY particle gives off that decays on (the stop's top) |
| `forces.susyProductHold` | `4` | how much more firmly that length is held than an ordinary line's |
| `forces.susyOpening` | `50` | the least angle, in degrees, between a SUSY particle's partner and the ordinary particle it decays to when that decays on (stop -> t neutralino): wide, so the top can be short |

### Hadrons

A hadron's quarks run side by side, evenly spaced; a vacuum pair's quarks arc away together.

| Setting | Default | What it controls |
|---|---|---|
| `forces.hadron` | `20` | how strongly a hadron's legs end together, evenly spaced, and hadrons line up |
| `forces.rail` | `40` | how strongly a quark rail between hadrons runs straight through its vertices |
| `forces.mesonGap` | `0.25` | the least space between two mesons' ellipses, in line lengths |
| `forces.baryonGap` | `0.35` | the least space between two hadrons when either is a baryon, in line lengths |
| `forces.hadronSpacing` | `0.6` | the spacing between the ends of one hadron's quark legs, in line lengths |

### Loops

A loop keeps its shape: a half circle over a line, or a regular polygon, upright.

| Setting | Default | What it controls |
|---|---|---|
| `forces.loop` | `20` | how strongly a loop keeps its shape: an arc a half circle over a straight stretch, any other a regular polygon |
| `forces.loopLeg` | `1` | a leg into a loop's corner, as a share of an ordinary leg's length |
| `forces.loopUpright` | `6` | how firmly a loop stands upright: a box's sides level and upright, a triangle with one side upright |

## Layout v1 rules: `layout`

The rule-based layout, the default engine. Lengths are in ranks (across) and rows (down). Which rule uses each setting is listed in [Layout rules](internals.md#layout-rules).

| Setting | Default | What it controls |
|---|---|---|
| `layout.legSpread` | `1.25` | vertical gap between two external legs sharing a vertex |
| `layout.rowGap` | `1` | minimum vertical gap between unrelated vertices in one column |
| `layout.legBesideVertexGap` | `0.6` | gap between a leg and an unrelated vertex in one column, as a fraction of rowGap |
| `layout.tChannelGap` | `1.5` | vertical length of a same-column (t-channel) propagator |
| `layout.legLength` | `0.8` | length of an external leg relative to a propagator |
| `layout.vertexInertia` | `40` | how much harder a vertex is to push aside than a leg, when a column is crowded |
| `layout.railWeight` | `20` | how strongly the vertices of one fermion line stay level with each other |
| `layout.spineWeight` | `3` | how strongly a vertex lines up with the propagators it sits on, relative to its legs |
| `layout.branchAngle` | `27` | half-angle, in degrees, at which particles produced as a pair leave their vertex |
| `layout.chainTurn` | `16` | degrees a decay chain turns towards the midline at each vertex, making it an arc |
| `layout.chainFloor` | `-4` | the lowest angle, in degrees, a cascade may bend back towards the middle at its end |
| `layout.fermionBendOut` | `22` | degrees a final-state fermion that radiates a boson turns outward |
| `layout.levelEmissionSpread` | `16` | degrees between several bosons radiated level from one fermion line |
| `layout.levelTolerance` | `4` | a line within this many degrees of level counts as level |
| `layout.recoilAngle` | `12` | degrees a level line turns upward when it emits a particle, which leaves downward |
| `layout.singleEmissionAngle` | `40` | angle, in degrees from the chain, of a single particle emitted by a decay chain |
| `layout.emissionFan` | `[82,45]` | steepest and shallowest angle when a chain vertex emits several particles |
| `layout.beamAngle` | `52` | angle, in degrees from horizontal, of the two beams entering a collision blob |
| `layout.beamLength` | `0.7` | length of those beams, in ranks |
| `layout.markedLineAngle` | `28` | angle, in degrees from level, at which a line that carries marks leaves its vertex |
| `layout.markLineStretch` | `0.7` | a line carrying marks is this much longer for each mark on it (a mixing line with two crosses) |
| `layout.busyVertexStretch` | `0.25` | each line beyond three at a vertex makes the lines leaving it this much longer |
| `layout.earlyEmissionShortfall` | `0.5` | an early emission in a cascade stops this many leg lengths short of the last particles |
| `layout.earlyEmissionMaxStretch` | `2.5` | the most an early emission is lengthened |
| `layout.stageShrink` | `0.82` | each decay stage is drawn this much shorter than the last |
| `layout.shortestStage` | `0.6` | stages never get shorter than this fraction of the first |
| `layout.shrinkFromDepth` | `3` | number of stages from which a cascade counts as deep |
| `layout.scatteredLegReach` | `1.3` | the longest the outgoing half of a scattered line is drawn, in ranks |
| `layout.fusionAdvance` | `0.5` | how far behind two scattering lines their exchanged particles meet, in ranks |
| `layout.fusionResonanceLength` | `0.6` | length of the particle a fusion produces, in ranks |
| `layout.beamForkAngle` | `45` | half-angle, in degrees, of the fork where two beams meet, and of a simple 2 -> 2 final state |
| `layout.decayForkAngle` | `20` | half-angle of the fork of a later decay |
| `layout.radiationAt` | `0.4` | where radiation leaves an incoming leg, as a fraction of the leg |
| `layout.radiationRise` | `1.05` | how far radiation climbs away from the leg, in rows |
| `layout.radiationOvershoot` | `0.4` | how far past the hard vertex radiation ends, in ranks |
| `layout.emissionDrop` | `1.3` | least drop, in rows, from a beam to a particle it emits that meets the other beam's |
| `layout.exchangeLegLean` | `0.6` | how far, in rows, a particle leaving an exchanged line leans away from it |
| `layout.scatterDeflection` | `0.3` | how far, in rows, a scattered line leans away from the particle it exchanges |
| `layout.heldBackFraction` | `0.5` | how much of the beam's own lean a line keeps when it carries on into a decay |
| `layout.markMargin` | `0.25` | clear space, in rows, a blob keeps from lines and vertices that are not its own |
| `layout.lineMargin` | `0.3` | clear space, in rows, an external leg keeps from lines that are not its own |
| `layout.convergenceTolerance` | `4` | degrees a final-state particle may head in towards an outgoing beam beside it |
| `layout.hadronGap` | `0.9` | least distance, in rows, between the legs of two different hadrons |
| `layout.hadronDiagramWidth` | `3.2` | least width, in ranks, of a diagram drawn between hadrons |
| `layout.hadronEmissionLead` | `0.6` | how far, in leg lengths, a W is given off before the vertex where it decays into a hadron |
| `layout.minEmissionAngle` | `32` | smallest angle, in degrees, at which an emitted branch leaves a scattering line |
| `layout.forkAnglePerExtraLine` | `14` | each line beyond two opens a fork this many degrees wider |
| `layout.maxForkAngle` | `62` | the widest a fork ever opens, in degrees either side |
| `layout.minLineAngle` | `18` | smallest angle, in degrees, between two lines leaving the same vertex |
| `layout.loopMinRadius` | `0.8` | smallest radius of a loop drawn over a line, in ranks: room for its labels |
| `layout.loopEmissionAngle` | `40` | angle, in degrees below the line, at which a particle leaves the top of a loop |
| `layout.boxMinWidth` | `1.6` | smallest width of a box drawn on a line, in ranks |
| `layout.boxMinHeight` | `2.1` | height of a box drawn on a line, in rows |
| `layout.spectatorGap` | `1.3` | distance, in rows, between a spectator line and the process beside it |
| `layout.mirrorTopBottom` | `true` | make the diagram symmetric about its midline when its structure allows |
