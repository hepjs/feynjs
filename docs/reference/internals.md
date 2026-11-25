---
tags:
  - pipeline
  - parser
  - renderer
  - layout engine
  - force layout
  - source code
  - design
  - new particle
  - registry
  - line style
  - vertex shape
  - switch
  - force
  - customise
  - v1
  - "layout: v1"
  - rule engine
  - older layout
  - layout settings
  - branchAngle
  - cascades
---

# Internals

How the code is laid out, how to extend it, and the rules of the first layout engine.

## Architecture

```text
source text      p p > t tbar, a -- [photon] b
   │  expand processes          src/parse/chains.ts
   │  parse                     src/parse/parse.ts
   ▼
Diagram          vertices, edges, styles  ──▶  check, describe, toTikz   src/tools/
   │  layout, v1 rules          src/engines/rules/
   │       or v2 forces         src/engines/forces/
   ▼
positions        a point for every vertex
   │  render                    src/render/
   ▼
SVG
```

### 1. Reading: `src/parse/`

- **`chains.ts`**, `expandChains`: turns process lines (`p p > t tbar`, `t > b W+`) into ordinary
  edges before anything else sees them. Everything downstream knows only edges.
- **`parse.ts`**, `parse`: a hand-written reader of the edge syntax into a `Diagram`
  (`src/model.ts`): vertices, edges with their `EdgeStyle`, hadron groups and switches. It knows
  nothing about drawing.
- **`src/particles/registry.ts`**: names to styles and labels. `registry.version` changes whenever
  a particle or style is added, which clears the render cache.

### 2. Layout v1: `src/engines/rules/`

`layout.ts` is a list of named steps, each in its own file:

| File | Steps |
|---|---|
| `roles.ts` | which legs enter and leave |
| `columns.ts` | rank each vertex by time; order each column |
| `rows.ts` | settle heights (weighted isotonic regression), mirror, deflect scattered lines |
| `beams.ts` | rails (fermion lines that run through), exchanges, initial-state radiation |
| `cascade.ts` | decay chains: arcs, emissions, stage lengths |
| `arcs.ts` | loops over a line, ladders and boxes, spectators |
| `marks.ts` | marks on a line, spaced evenly |
| `hadrons.ts` | hadrons lined up; vacuum pairs between them |
| `spacing.ts` | clearance: minimum angles, legs clear of other lines |

Every rule and its setting is in [Layout rules](#layout-rules).

### 3. Layout v2: `src/engines/forces/`

The force engine has three parts:

- **`structure.ts`**, `readStructure`: reads off what the forces need, once. That means the order
  in time, decay generations, heavy and light lines, rails, loops, vacuum pairs, hadrons and
  exchanges.
- **`forces.ts`**: the forces. Each is a list of terms (`{ points, energy }`), weighted by
  `theme.forces`. `allForces` lists them: line length, even angles, time flow, time order,
  clearance, upright exchange, mirrored branches, beams starting together, the final plane, light
  lines outside, heavy lines carrying on, no converging, hadrons, vacuum arcs and loop shapes.
- **`solve.ts`**, `balance`: minimises the total energy with Barzilai-Borwein gradient steps and
  central differences. Clearance terms are skipped while their points are far apart and haven't
  moved enough to matter (exact culling), which keeps it fast.

`engines/forces/layout.ts`, `layoutWithForces`, puts it together: starting positions, balance, then exact
shapes snapped in afterwards (`settlePairs`, `bendAlongCircles`, `bendLoopArcs`).

To add a force: write a function in `forces.ts` returning a `Force`, give it a weight in
`ForceRules` (`src/theme.ts`), add it to `allForces`, and refit the weights if needed
(`scripts/fit/`).

### 4. Drawing: `src/render/`

| File | What it does |
|---|---|
| `render.ts` | `renderDiagram`: layout, then a `Scene`, then the SVG |
| `scene.ts` | the scene being built: bounds, label requests, ids |
| `edge-styles.ts` | final styles: particle styles, arrows, `arrows: none`, `dots: all` |
| `edges.ts` | each line with its arrow, momentum and label |
| `lines.ts` | the line shapes: waves and coils fitted to whole periods, dashes, doubles, cones |
| `vertices.ts` | dots, blobs, insertions |
| `hadrons.ts` | hadron ellipses and braces |
| `panels.ts` | several diagrams side by side |

Labels are placed last: each tries a list of positions and takes the first clear of everything
already drawn. `src/label/label.ts` typesets the TeX subset into SVG text, with widths from a
built-in metrics table, so nothing is measured in the browser. `src/geometry/curve.ts` gives every
line style arc-length lookup along straight and curved paths.

### 5. Tools: `src/tools/`

`check`, `describe` and `toTikz` read the parsed diagram (`prepare.ts`); `measure` lays the diagram
out and scores the result. None of them draws anything.

### The cache

`render` in `src/index.ts` keeps the last 256 results, keyed by the registry version, the options
and the source.

## Extending feynjs

A particle is one line in the registry, `"sneutrino": susy("dash", "\\tilde\\nu")`. From then on
`[sneutrino]` draws a dashed SUSY line labelled ν̃:

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
b -- f1 [sneutrino]
b -- f2 [sneutrino]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
b -- f1 [sneutrino]
b -- f2 [sneutrino]
```

The common changes, step by step. Each ends with `npm test && npm run typecheck` and, for anything
visible, a look at the preview sheet ([Testing](contributing.md#testing)).

### Add a particle

One line in `src/particles/registry.ts`, using the helpers there:

```ts
"Zd": wave("Z_d"),                // a dark photon: a wave labelled Z_d
"sneutrino": susy("dash", "\\tilde\\nu"),
```

Then add it to the [Particles](particles.md) page, which is kept by hand. A particle needed by one page only can be added
at run time with [`registerParticle`](api.md#registerparticle) instead.

### Add a line style

1. Add the kind to `LineKind` in `src/model.ts`.
2. Draw it in `src/render/lines.ts` (`drawLine`), and give it a clearance in `halfWidth`.
3. Put its sizes in `LineLook` in `src/theme.ts`, each with a comment.
4. Name it in `STYLES` in `src/particles/registry.ts`.
5. Add it to `examples/lines.feyn` and to [Lines and particles](../guide/lines.md).

### Add a vertex shape

1. Add it to `VertexShape` in `src/model.ts`.
2. Add its keyword to `SHAPES` in `src/parse/parse.ts`.
3. Draw it in `src/render/vertices.ts`, with its size in `VertexLook`.
4. Add it to [Vertices and blobs](../guide/vertices.md).

### Add a switch

A `name: value` line is stored in `diagram.directives` by the parser. Read it where it matters
(drawing switches in `src/render/edge-styles.ts`, layout switches in `src/render/render.ts`), and
add it to [Panels and switches](../guide/syntax.md#panels-and-switches) and [Syntax at a glance](index.md).

### Change the layout

**v1:** add a named step in `src/engines/rules/` and call it from `layout.ts`. Put its numbers in
`LayoutRules`, and add the rule to the [Layout rules](#layout-rules) section.

**v2:** add a force in `src/engines/forces/forces.ts` and a weight in `ForceRules`. Prefer a few
general forces to many special cases.

Either way, add a diagram that shows the change to `examples/` and a test to `test/`.

### Extend the process syntax

`src/parse/chains.ts` turns process lines into edges. A change there needs a test in
`test/feynjs.test.ts`, and an example in [Processes](../guide/processes.md).

## Layout rules

```feynman
layout: v1
e- e+ > Z H
Z > mu- mu+
H > b bbar
```

```text
layout: v1
e- e+ > Z H
Z > mu- mu+
H > b bbar
```

Every rule the layout applies, grouped by what it is for, with the setting that tunes it (all in `src/theme.ts`,
under `layout`). The last section is the complete function inventory.

### A. Where things go in time (columns)

| # | Rule | Setting |
|---|---|---|
| 1 | Incoming legs enter from the left; names `i*`, `in:` or position in a chain decide which legs enter | |
| 2 | A vertex's column is its distance from the incoming legs | |
| 3 | Time moves forward along a fermion line, even where a loop gives a shorter way round | |
| 4 | Vertices on a fermion line exchanged between two beams share the first column (one vertical line) | |
| 5 | Outgoing legs sit one column after their vertex | |
| 6 | Within a column, vertices follow the order of what they hang from; legs follow the author's `out:` list, even if lines cross | |

### B. Beam lines: what happens along a line that came in

| # | Rule | Setting |
|---|---|---|
| 7 | A fermion line that passes straight through vertices is a *rail*; it stays straight | `railWeight` |
| 8 | A line exchanged between two beams is vertical, and what it emits goes right | |
| 9 | Radiation off an incoming leg sits on the leg before the hard process; the leg stays straight | `radiationAt`, `radiationRise`, `radiationOvershoot` |
| 10 | A mark on a line (mixing cross, name change) is taken out, then spaced evenly along its line | `markLineStretch` |
| 11 | A line carrying drawn marks leaves the horizontal and its first vertex opens symmetrically | `markedLineAngle` |

### C. Rows: vertical positions

| # | Rule | Setting |
|---|---|---|
| 12 | Each vertex is pulled toward the vertices it joins; rails and single propagators are pulled hardest | `spineWeight`, `railWeight`, `vertexInertia` |
| 13 | Minimum gaps: between legs, between unrelated vertices, a t-channel line, two chains produced together | `legSpread`, `rowGap`, `tChannelGap`, `branchAngle`, `legBesideVertexGap` |
| 14 | Room for blobs, dots and hadrons in a column | `markMargin`, `hadronGap` |
| 15 | Mirror the diagram top to bottom when its structure allows | `mirrorTopBottom` |
| 16 | A scattering beam (including a blob, or a gluon turning into a quark) leans away from the exchange, symmetrically in and out | `scatterDeflection` |
| 17 | A beam that scatters and goes on into a decay is deflected, but less | `heldBackFraction` |
| 18 | A beam entering an exchanged line leans away from it | `scatterDeflection` |
| 19 | A particle leaving an exchanged line leans away from its partner | `exchangeLegLean` |
| 20 | A beam stays a set drop from what it gave off | `emissionDrop` |
| 21 | The line out of a fusion of two exchanged particles runs level | `fusionAdvance`, `fusionResonanceLength` |

### D. Cascades

| # | Rule | Setting |
|---|---|---|
| 22 | A chain is the line that stays the same kind of particle; failing that, the one that decays further. A split into two decaying particles is symmetric, not a chain | |
| 23 | SUSY chains arc: they turn a little toward the middle at each vertex | `chainTurn`, `chainFloor` |
| 24 | A level line recoils when it emits (Higgs-strahlung), on the side the author's `out:` order gives | `recoilAngle`, `levelTolerance` |
| 25 | A level line off the middle runs level and emits outward | |
| 26 | A boson radiated from a final-state fermion goes forward, level, between the fermions; the fermion turns outward | `fermionBendOut`, `levelEmissionSpread` |
| 27 | Emitted particles leave on the outer side at fixed angles (single, or a fan) | `singleEmissionAngle`, `emissionFan` |
| 28 | Later stages are shorter | `stageShrink`, `shortestStage`, `shrinkFromDepth` |
| 29 | A stable fermion emitted early in a non-SUSY cascade is drawn long | `earlyEmissionShortfall`, `earlyEmissionMaxStretch` |
| 30 | Lines leaving a vertex where four or more meet are longer | `busyVertexStretch` |

### E. Forks and legs

| # | Rule | Setting |
|---|---|---|
| 31 | Where beams meet, and in a 2 to 2 final state, legs open wide | `beamForkAngle` |
| 32 | In a decay (one incoming particle) and in later decays, forks are narrower | `decayForkAngle` |
| 33 | A fork opens wider only as it gains lines | `forkAnglePerExtraLine`, `maxForkAngle` |
| 34 | Colliding beams are short and steep into a blob | `beamAngle`, `beamLength` |
| 35 | The outgoing half of a scattered line has a longest reach | `scatteredLegReach` |
| 36 | Leg length; a leg's label sits beyond its end | `legLength`, `labelGap` |

### F. Loops, boxes, spectators

| # | Rule | Setting |
|---|---|---|
| 37 | A boson leaving a fermion line and rejoining it is an arc over the line, on the loop side | `loopMinRadius` |
| 38 | A vertex on that arc sits at its top; what leaves it goes out at a fixed angle | `loopEmissionAngle` |
| 39 | What a rail vertex under a loop emits goes away from the loop; elsewhere it goes the way the loop does | |
| 40 | A rail with a loop, or a ladder, is drawn level and full width | |
| 41 | A box on a line is square: rungs vertical, a minimum size | `boxMinWidth`, `boxMinHeight` |
| 42 | A line straight from an incoming to an outgoing leg is a spectator, level, clear of loops | `spectatorGap` |

### G. Hadrons

| # | Rule | Setting |
|---|---|---|
| 43 | Legs of one hadron are spaced alike, in the author's order; ellipses are one size | `legSpread`, `hadronBraceDepth` |
| 44 | Outgoing hadrons line up in one column, a gap apart | `hadronGap` |
| 45 | The vertex producing a hadron's quarks moves alongside it; a vacuum pair sits between two hadrons | `hadronEmissionLead` |
| 46 | A hadron-level diagram has a minimum width | `hadronDiagramWidth` |

### H. Clearance (applied last)

| # | Rule | Setting |
|---|---|---|
| 47 | No two lines leave a vertex closer than a minimum angle | `minLineAngle` |
| 48 | An emitted branch leaves a scattering line at a minimum angle | `minEmissionAngle` |
| 49 | A leg keeps a margin from every line and blob that is not its own; swung, then shortened | `lineMargin`, `markMargin` |
| 50 | A final-state particle does not converge on an outgoing beam | `convergenceTolerance` |

### I. At drawing time

| # | Rule | Setting |
|---|---|---|
| 51 | Labels try the preferred side, the other side, then along the line, then further out; never closer than a margin | `labelMargin` (theme) |
| 52 | Coupling labels sit in the widest gap; word labels (LSP) are smaller | `couplingLabelScale`, `wordLabelScale` (theme) |
| 53 | Sizes, line weights and colours | everything else in the theme |

### How they group

These fall into seven kinds of operation. Rules within a kind share a mechanism and are candidates to merge:

1. **Place** (A, parts of B): decide a column or a row. One pass could assign both from a small table of structure kinds.
2. **Hold level or straight** (7, 12, 21, 25, 37, 40, 42): all say "this line should be horizontal". They differ only in which line they pick and how hard they hold it. A single `levelLines` set with weights would replace five mechanisms.
3. **Deflect or lean** (16, 17, 18, 19, 20): all say "this leg or line leans away from that exchange by this much". One function taking (what leans, away from what, how far) covers them.
4. **Open a fork** (22 to 27, 31 to 33, 38): all say "these lines leave this vertex at these angles". They should be one table keyed by vertex situation (beam collision, 2 to 2 final state, decay, cascade stage, loop apex, fermion emission).
5. **Lengthen or shorten** (3, 10, 28, 29, 30, 35, 41, 46): all scale a line's length by a factor. One length model, one place.
6. **Group** (43 to 45, hadrons; marks): treat several things as one object.
7. **Keep clear** (47 to 50, 51): constraints applied after placement. These already share one loop in part (`keepLegsClear`); the rest could join it.

A table of "situation: angle, length, side" for kinds 4 and 5 would replace most of the code in `cascade.ts`, the fork code in
`layout.ts`, and the angle logic in `arcs.ts`.

### Complete inventory (generated)

| File | Function | What it does |
|---|---|---|
| `arcs.ts` | `loopSide` | Which side of their line loops are drawn on: -1 above, 1 below. |
| `arcs.ts` | `bendTowards` (internal) | Bend that makes an edge bulge to the given side on screen, whichever way it was written. |
| `arcs.ts` | `railPositions` (internal) | Position of each vertex along the rail it is on. |
| `arcs.ts` | `arcLinesThatRejoinTheirRail` | Arc every line that leaves a rail and rejoins the same rail. |
| `arcs.ts` | `placeVerticesOnArcs` | A vertex joined to two points of one rail by the same kind of line is the top of a loop over that rail. |
| `arcs.ts` | `findLadderRungs` (internal) | Ladders, as in a box diagram drawn on a quark line: a second fermion line joined to a rail by two or more rungs. |
| `arcs.ts` | `squareUpLadders` | Square a ladder up: each vertex of the second line sits straight across from the rail vertex its rung comes from, so the rungs are vertical and the box is a rectangle. |
| `arcs.ts` | `giveLoopsRoom` | Give every loop on a rail room for its labels: the two points where a loop or a box meets the rail are kept at least a house distance apart, by sliding the later one, and everything after it, along the rail. |
| `arcs.ts` | `straightenRailsWithLoops` | A rail that carries a loop is drawn dead level and runs out to the right-hand edge of the diagram, so the loop hangs from a straight line as in the reference diagrams. |
| `arcs.ts` | `sendEmissionsToLoopSide` (internal) | What a rail with a loop emits leaves on the same side as the loop, away from any spectator line: a branch found on the other side is mirrored across the rail. |
| `arcs.ts` | `aimForkAlongItsLine` (internal) | Turn the fork of legs at a vertex to point the way its line arrived, so that what a quark line emits carries on away from the line instead of opening back towards it. |
| `arcs.ts` | `placeSpectatorLines` | Spectator lines: a line that runs from an incoming leg straight to an outgoing leg without taking part. |
| `beams.ts` | `hasFermionLine` | True when a fermion line joins two vertices directly (there may be other lines between them too). |
| `beams.ts` | `findBeamRails` | Rails: fermion lines that run on through a vertex. |
| `beams.ts` | `findExchangeVertices` | Exchange lines: a fermion line that runs from the vertex of one incoming particle to the vertex of another (a t-channel quark between two gluons, say). |
| `beams.ts` | `railEdgeKeys` | The edge keys of every line segment on the given rails. |
| `beams.ts` | `lineKindBetween` (internal) |  |
| `beams.ts` | `findInitialStateRadiation` | Radiation off an incoming leg: the line continues unchanged into the vertex where it meets the other incoming particle, and that vertex carries the process on. |
| `beams.ts` | `detachInitialStateRadiation` | Take initial-state radiation out of the graph so it cannot distort the main process. |
| `beams.ts` | `placeRadiation` | Put each emitter part-way along its incoming leg, which stays straight, with the radiation leaving on the outer side of the diagram. |
| `cascade.ts` | `edgeBetweenVertices` (internal) | The drawn edge between two vertices, found in the diagram itself (a detached leg is no longer in the graph). |
| `cascade.ts` | `isSameKindOfLine` (internal) | True when two edges belong to one chain: the same family of particle (both supersymmetric, say, as in gluino -> neutralino), or simply drawn the same way. |
| `cascade.ts` | `chainLinksAt` (internal) | The chain links of a vertex, or undefined if it is not part of a decay chain. |
| `cascade.ts` | `findDecayChains` | The chain links of every chain vertex. |
| `cascade.ts` | `detachEmittedLegs` | Take emitted legs out of the graph, so the chains settle without them. |
| `cascade.ts` | `listedOutcome` | Earliest position, in the author's `out:` list, of any leg a branch ends in. |
| `cascade.ts` | `reattachEmittedLegs` | Put the emitted legs back into the graph once they have been placed, so that every later step (moving a branch, keeping lines apart) sees the whole diagram again. |
| `cascade.ts` | `branchOf` | A vertex and everything that follows from it: the ids of its whole branch. |
| `cascade.ts` | `moveBranch` | Move a vertex and everything that follows from it by the same amount. |
| `cascade.ts` | `moveBranchTo` (internal) | Put a vertex, with its branch, at a given point. |
| `cascade.ts` | `arcDecayChains` | Bend every decay chain into an arc. |
| `cascade.ts` | `emissionAngles` (internal) | Angles, in degrees from the chain, for n things emitted at one vertex: steepest first. |
| `cascade.ts` | `placeDecayEmissions` | Place what each chain vertex emits, fanning away from the midline of the diagram. |
| `cascade.ts` | `extendEarlyEmissions` | In a cascade that is not supersymmetric, a stable particle emitted early on (a dark matter chi) is drawn long, reaching most of the way to the last particles of the cascade, so the eye can follow it out to the final state alongside them. |
| `columns.ts` | `rankByDistanceFromIncoming` | Rank every vertex by its distance from the incoming legs. |
| `columns.ts` | `lastBeamVertexOn` (internal) | Index of the last vertex along a rail that sits on an exchange line: time starts after it. |
| `columns.ts` | `advanceAlongRails` (internal) | Time moves forward along a rail: each vertex of a scattering line comes after the one before it, even where a loop gives a shorter way round. |
| `columns.ts` | `rankExternalLegs` (internal) | Incoming legs share the first column; an outgoing leg sits one column after its vertex. |
| `columns.ts` | `compareListedLegs` (internal) | Legs the author listed in `in:` or `out:` keep that order, top to bottom, even when it makes lines cross: that is how a u-channel diagram swaps its final states. |
| `columns.ts` | `groupIntoColumns` (internal) |  |
| `columns.ts` | `orderColumns` | Order each column top to bottom so lines do not cross: a vertex follows the vertices it hangs from. |
| `graph.ts` | `edgeJoining` | The line between two vertices as the layout sees it, or undefined if they are not joined. |
| `graph.ts` | `buildNeighbours` |  |
| `graph.ts` | `isExternalLeg` | An external leg: one connection, and not drawn as a blob. |
| `graph.ts` | `buildGraph` |  |
| `graph.ts` | `passThroughAt` | The beam passing through a vertex, if there is one: exactly one incoming leg, one outgoing leg, and one other line (a quark line emitting a W, an ion drawn as a blob emitting a photon, a gluon turning into a quark). |
| `hadrons.ts` | `lineUpOutgoingHadrons` | Hadrons in the final state line up: the quark lines of every outgoing hadron end at the same distance across the diagram, so the hadrons stack in one column (J/psi above D_s, say), each a clear gap below the one before. |
| `hadrons.ts` | `placePairsBetweenHadrons` (internal) | A quark pair made from nothing, one quark into each of two hadrons, starts from a point just before the hadrons, level with the gap between its two quarks. |
| `hadrons.ts` | `bringProducerAlongside` (internal) | When every quark of a hadron comes from one vertex that is not on a beam line (the W decaying into the D_s quarks), that vertex moves out to sit just before the hadron, so its quark lines are the usual length and the line feeding it grows instead. |
| `layout.ts` | `layout` | Time-ordered layout: time runs left to right, as in every published diagram. |
| `layout.ts` | `stageScale` (internal) | Length of each stage of the diagram relative to the first. |
| `layout.ts` | `placeEmittedLeg` (internal) | Give an emitted leg a fixed drawn length along the direction the rows gave it. |
| `layout.ts` | `isFusionOfExchangedParticles` (internal) | True when the second column is where particles exchanged by two separate scattering lines meet (vector-boson fusion, photon fusion). |
| `layout.ts` | `entersBlobAsPair` (internal) | True for the two beams of a collision drawn as a blob. |
| `layout.ts` | `placeLegIntoBlob` (internal) | Colliding beams are short and steep, as in the reference diagrams. |
| `layout.ts` | `assignCoordinates` (internal) | Turn ranks and rows into coordinates. |
| `layout.ts` | `openForks` (internal) | Legs that meet at one vertex open as a symmetric fork at a house angle: wide where the beams meet and in a simple 2 -> 2 process, narrower for the decays that follow. |
| `layout.ts` | `marksBetweenColumns` (internal) | The most marks on any one line that runs into column r from the one before it. |
| `layout.ts` | `busyVertexStretch` (internal) | Lines leaving a vertex where four or more meet are drawn longer, so they are not crowded. |
| `layout.ts` | `fanLegs` (internal) | Spread two or more legs evenly across a fork, keeping their order. |
| `layout.ts` | `applyManualPositions` (internal) | Manual `at (x, y)` positions win. |
| `marks.ts` | `numberOfLinesAt` (internal) |  |
| `marks.ts` | `detachMarksOnLines` | Remove every mark from the graph, joining its two neighbours directly. |
| `marks.ts` | `placeMarksOnLines` | Put every mark back on its line, evenly spaced: one mark sits halfway, two at a third and two thirds, and so on. |
| `roles.ts` | `assignRoles` | Decide which external legs enter and which leave. |
| `rows.ts` | `spreadKeepingOrder` | Positions that keep the given order and minimum gaps while staying as close as possible to where each item wants to be (weighted isotonic regression). |
| `rows.ts` | `areBothProduced` (internal) | True when both vertices come after the first interaction: products of a decay or a pair production. |
| `rows.ts` | `branchGap` (internal) | Vertical gap between two decay chains. |
| `rows.ts` | `forkHalfHeight` (internal) | How far, in rows, the fork of outgoing legs at a vertex reaches above and below it. |
| `rows.ts` | `minimumGap` (internal) | Smallest vertical distance allowed between two neighbours in a column. |
| `rows.ts` | `roomForMarks` (internal) | Extra room where the vertices carry something drawn: a blob or dot needs its own size plus a margin clear of its neighbour, and legs of two different hadrons need room for both hadrons. |
| `rows.ts` | `spacingFor` (internal) |  |
| `rows.ts` | `relaxRows` | Settle the vertical positions. |
| `rows.ts` | `mirrorTopBottom` | Make the diagram symmetric about its horizontal midline when every column reads the same from the top as from the bottom (legs matching legs, vertices matching vertices). |
| `rows.ts` | `deflectScatteredLines` | A line that scatters off an exchanged particle (VBF quarks, t-channel) bends a little at the vertex: its incoming and outgoing halves both lean away from the exchange, symmetrically, instead of running flat. |
| `rows.ts` | `leanLegsAwayFromExchangedLines` (internal) | A particle leaving a vertex on an exchanged line (the middle of a t-channel) leans away from the line it shares the column with, so the pair of them opens as a fork instead of running level like the rungs of a box. |
| `rows.ts` | `leanBeamsAwayFromExchangedLines` (internal) | A beam entering a vertex on an exchanged line (the quark exchanged between a quark and a gluon, say) leans away from the exchange, as the quarks of a qq scattering do, whatever it turns into: a gluon that becomes a quark scatters the same way. |
| `rows.ts` | `levelFusionLines` | When two particles given off by separate scattering lines fuse into one (the two W of a vector-boson fusion into a Higgs), the line that comes out of the fusion runs level: its far end is brought to the height of the fusion vertex, with everything that follows. |
| `rows.ts` | `slantMarkedLines` | A line that carries marks (a mixing line with its crosses) leaves the horizontal: it slants away from whatever else leaves its first vertex, so it is not mistaken for a level propagator. |
| `rows.ts` | `deflectBeamsThatDecayOnward` (internal) | A beam can scatter and carry on into a decay (b W b, then b -> t a): its line does not end at the scattering vertex, so no leg leaves there. |
| `spacing.ts` | `keepLinesApartAtVertices` | No two lines leave a vertex closer together than the house minimum angle. |
| `spacing.ts` | `keepEmissionsOffTheirLine` | What a scattering line emits leaves it at a clear angle. |
| `spacing.ts` | `forkHalfAngle` | How wide a fork opens, as the angle of its outermost line from the direction the fork points. |
| `spacing.ts` | `distanceToSegment` (internal) | Distance from point p to the segment a-b, all in drawn proportions. |
| `spacing.ts` | `segmentGap` (internal) | Shortest distance between segments a-b and c-d (zero when they cross). |
| `spacing.ts` | `keepLegsClear` | External legs keep a margin from everything that is not theirs: the lines they are not joined to, and the blobs and dots that are not at their own vertex. |
| `spacing.ts` | `keepFinalStatesOffBeams` | A particle in the final state does not head in towards an outgoing beam beside it. |
| `spacing.ts` | `crossesOnPurpose` (internal) | True when two legs cross because the author's `out:` order is the reverse of the order of their vertices. |
