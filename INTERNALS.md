# Internals

How the code is laid out, and how to extend it.

## Architecture

```text
source text      p p > t tbar, a -- [photon] b
   │  expand processes          src/parse/chains.ts
   │  parse                     src/parse/parse.ts
   ▼
Diagram          vertices, edges, styles  ──▶  check, describe, toTikz   src/tools/
   │  layout, the forces        src/engines/forces/
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

### 2. Layout: `src/engines/forces/`

The force engine has three parts:

- **`structure.ts`**, `readStructure`: reads off what the forces need, once. That means the order
  in time, decay generations, heavy and light lines, rails, loops, vacuum pairs, hadrons and
  exchanges.
- **`forces.ts`**: the forces. Each is a list of terms (`{ points, energy }`), weighted by
  `theme.forces`. `allForces` lists them: line length, even angles, time flow, time order,
  clearance, upright exchange, scattered beams, mirrored branches, beams starting together, the final plane, light
  lines outside, heavy lines carrying on, no converging, hadrons, vacuum arcs and loop shapes.
- **`solve.ts`**, `balance`: minimises the total energy with Barzilai-Borwein gradient steps,
  stopping once a step gains less than 3e-6 of the energy. A term's slope comes from its own
  `grad` where it has one (line length, time flow, the final plane), else from one small step
  forward per coordinate. Clearance terms are skipped while their points are far apart and
  haven't moved enough to matter (exact culling); a solve of 2,500 terms or more finds the ones
  that can matter through a grid of where things are (each clearance term's `tag` names the
  two things it keeps apart and its reach) and sums only those, in the same order, so the
  result is the same to the last bit. The engine's own maths is never used (portable-math.ts).

`layoutWithForces` adds two things to every settle: a very weak `tilt` toward the preferred
order (the author's `in:` / `out:` order, else the order of names), so arrangements the forces
hold almost equal come out the same way every time; and, when the settled layout has a fault
(`faultsOf`: a crossing, a line turning back, a stub, points on top of each other, listed legs
out of order, a loop out of shape, a hadron's lines out of step), two more settles from starts
lifted and lowered by a fixed amount per point (`hashOf` its name), keeping one only if it has
fewer faults.

`engines/forces/layout.ts`, `layoutWithForces`, puts it together: starting positions, balance, then exact
shapes snapped in afterwards (`settlePairs`, `bendAlongCircles`, `bendLoopArcs`).

To add a force: write a function in `forces.ts` returning a `Force`, give it a weight in
`ForceRules` (`src/theme.ts`), add it to `allForces`, and refit the weights if needed
(`scripts/fit/`).

### 3. Drawing: `src/render/`

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

### 4. Tools: `src/tools/`

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
visible, a look at the preview sheet ([Testing](https://hepjs.github.io/feynjs/about/contributing/#testing)).

### Add a particle

One line in `src/particles/registry.ts`, using the helpers there:

```ts
"Zd": wave("Z_d"),                // a dark photon: a wave labelled Z_d
"sneutrino": susy("dash", "\\tilde\\nu"),
```

Then add it to the [Particles](https://hepjs.github.io/feynjs/authoring/particles/) page, which is kept by hand. A particle needed by one page only can be added
at run time with [`registerParticle`](https://hepjs.github.io/feynjs/get-started/api/#registerparticle) instead.

### Add a line style

1. Add the kind to `LineKind` in `src/model.ts`.
2. Draw it in `src/render/lines.ts` (`drawLine`), and give it a clearance in `halfWidth`.
3. Put its sizes in `LineLook` in `src/theme.ts`, each with a comment.
4. Name it in `STYLES` in `src/particles/registry.ts`.
5. Add it to `examples/lines.feyn` and to [Lines and particles](https://hepjs.github.io/feynjs/authoring/lines/).

### Add a vertex shape

1. Add it to `VertexShape` in `src/model.ts`.
2. Add its keyword to `SHAPES` in `src/parse/parse.ts`.
3. Draw it in `src/render/vertices.ts`, with its size in `VertexLook`.
4. Add it to [Vertices and blobs](https://hepjs.github.io/feynjs/authoring/vertices/).

### Add a switch

A `name: value` line is stored in `diagram.directives` by the parser. Read it where it matters
(drawing switches in `src/render/edge-styles.ts`, layout switches in `src/render/render.ts`), and
add it to [Panels and switches](https://hepjs.github.io/feynjs/authoring/syntax/#panels-and-switches) and [Syntax at a glance](https://hepjs.github.io/feynjs/authoring/syntax-at-a-glance/).

### Change the layout

Add a force in `src/engines/forces/forces.ts` and a weight in `ForceRules`. Prefer a few
general forces to many special cases.

Add a diagram that shows the change to `examples/` and a test to `test/`.

### Extend the process syntax

`src/parse/chains.ts` turns process lines into edges. A change there needs a test in
`test/feynjs.test.ts`, and an example in [Processes](https://hepjs.github.io/feynjs/authoring/processes/).

