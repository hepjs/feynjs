# Writing diagrams

A diagram is written as edges, line by line. Several diagrams can share one block as panels, and
switches set options for a whole diagram.

## Edges, as in TikZ-Feynman

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

The edge syntax writes a diagram line by line: name the points, join them, say what each line
is. It follows TikZ-Feynman's `\diagram*` notation, so `a -- [photon] b` means what it means there.

### Chains

A **chain** joins vertices with `--`. A vertex is any name you choose: `a`, `v1`, `top`. A chain
can be as long as you like, and a vertex can appear in as many chains as you like:

```text
i1 -- a -- b -- f1        one chain, three lines
a -- c                    a fourth line from a
```

Statements end at a new line; a semicolon or a comma also ends one, as in TikZ-Feynman. `%`,
`#` and `//` start a comment.

### Vertices

Options for a vertex go in square brackets right after its name.

| Write | Meaning |
|---|---|
| `i1 [e-]` | an external leg, labelled as an electron; its line takes the electron's style |
| `f1 [\tilde\chi^0_1]` | an external leg with any TeX label |
| `v [dot]` | a vertex drawn as a dot; see [Vertices and blobs](vertices.md) for the other shapes |
| `v [dot, label=\kappa_\lambda]` | a coupling label beside the vertex |
| `v at (2, 1)` | fix a vertex in place by hand (in propagator lengths, y up); see [Placing points by hand](engines.md#placing-points-by-hand) |

### Lines

Options for a line go in square brackets right after its `--`.

| Write | Meaning |
|---|---|
| `a -- b` | a plain line, or the style of the labelled external leg at its end |
| `a -- [fermion] b` | a generic style, named as in TikZ-Feynman; see [Lines and particles](lines.md) |
| `a -- [W+] b` | a particle: sets the style, the arrow and the label |
| `a -- [photon, label=\gamma^*] b` | your own label; `label'=` puts it on the right of the line's direction, as in TikZ |
| `a -- [fermion, momentum=p] b` | a momentum arrow beside the line |
| `a -- [gluon, half left] b` | a curved line: `half left/right`, `quarter left/right`, `bend left/right`, `bend=30` |
| `a -- [scalar, color=blue] b` | a colour, by name or any CSS colour |
| `a -- [hidden] b` | joins two vertices for the layout without drawing anything |

A misspelt name stops with a suggestion:
`line 1: unknown line style or particle "glunio" (did you mean "gluino"?)`.

Arrows follow the order you write: `a -- [fermion] b` points from `a` to `b`. For an external
particle you rarely need to think about it: `i2 [e+]` already knows a positron's arrow runs
against its direction of travel.

### What comes in, what goes out

feynjs decides which legs enter (on the left) and which leave (on the right):

- Names starting with `i` (`i1`, `i2`, ...) enter; names starting with `f` leave.
- For other names, a leg written at the start of a chain enters and one at the end leaves.
- `in: a b` and `out: c d` say it outright, and fix the order of the legs from top to bottom.

```feynman
in: i1 i2
out: f2 f1
i1 [qbar'] -- a -- f1 [Z]
i2 [q] -- b -- f2 [W]
b -- [fermion, label=q'] a
```

```text
in: i1 i2
out: f2 f1
i1 [qbar'] -- a -- f1 [Z]
i2 [q] -- b -- f2 [W]
b -- [fermion, label=q'] a
```

The order in `out:` is kept even when lines cross. That is how a u-channel diagram swaps its
final states, as above.

### Two lines between the same points

Two lines between the same pair of vertices bow apart into a loop by themselves:

```feynman
i1 -- [photon, momentum=q] a
a -- [fermion] b
b -- [fermion] a
b -- [photon] f1
```

```text
i1 -- [photon, momentum=q] a
a -- [fermion] b
b -- [fermion] a
b -- [photon] f1
```

### Coming from TikZ-Feynman

The TikZ-Feynman keys feynjs takes, side by side with TikZ-Feynman, are on [TikZ-Feynman](../compatibility/tikz-feynman.md).

## Panels and switches

```feynman
--- (a) a photon
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
--- (b) a Z
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
--- (a) a photon
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
--- (b) a Z
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [mu-] -- b -- f2 [mu+]
```

### Several diagrams side by side

A line of three or more dashes starts a new panel. Text after the dashes is that panel's
caption. Without it, panels are lettered (a), (b), (c). Panels sit three to a row; the
`panelsPerRow` option of `render` changes that.

Each panel is a diagram of its own: vertex names can repeat, and panels can use either syntax.

#### Joining panels

A joiner in brackets after the dashes stands between that panel and the one before. Joined
panels make one figure, so they sit in one row and are not lettered.

| Write | Between the panels |
|---|---|
| `---[x]` | × (two scatterings at once, double parton scattering) |
| `---[otimes]` | ⊗ |
| `---[+]`, `---[=]`, `---[to]` | +, =, → (a sum of diagrams, an identity) |
| `---[cut]` | a dashed cut line: an amplitude beside its conjugate |

```feynman
i1 [g] -- a
i2 [g] -- a
a -- [H] f1
---[cut]
f1 [H] -- a
a -- i1 [g]
a -- i2 [g]
```

```text
i1 [g] -- a
i2 [g] -- a
a -- [H] f1
---[cut]
f1 [H] -- a
a -- i1 [g]
a -- i2 [g]
```

### Switches

A line `name: value` sets something for the whole diagram (or panel).

| Write | Effect |
|---|---|
| `in: i1 i2` / `out: f2 f1` | which legs enter and leave, in order top to bottom ([Edges](#what-comes-in-what-goes-out)) |
| `arrows: none` | no fermion arrows, as many SUSY papers draw them |
| `dots: all` | a dot on every vertex where lines meet |
| `scale: 1.5` | the whole diagram 1.5 times larger, as a zoom |
| `size: small` | an optical size: `small`, `tiny`, `large` or any number (1 is normal); see [Styling](../setup/styling.md#size) |
| `title: ...` | a title, shown as a tooltip and read by screen readers |
| `layout: v1` | lay out with the older rule engine instead of the force engine ([Engines](engines.md#the-rule-engine-v1)) |
| `colour flow: on` | draw the colour lines beside quarks and gluons ([Colour flow](colour-flow.md)) |
| `charge colour: on` | colour charged lines by the sign of their charge ([Styling](../setup/styling.md#colour-by-charge)) |
| `reveal: 2` | draw the first two steps in time as usual and the rest faint and grey ([Step by step](#step-by-step)) |
| `meson:`, `baryon:`, `hadron:` | group legs into a hadron ([Hadrons](vertices.md#hadrons)) |

Every diagram already carries a description for screen readers, built from its process:
`aria-label="Feynman diagram: e- e+ -> mu- mu+"`. `title:` adds a title of your own as well.

### Step by step

`reveal: n` draws the first `n` steps in time as usual and everything after them faint and grey,
so a reader sees where the diagram is going. Put the same diagram in a row of panels with
`reveal: 1`, `reveal: 2`, ... to build it up one step at a time, in a talk or a lesson:

```feynman
--- step 1
reveal: 1
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
--- step 2
reveal: 2
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
--- step 3
reveal: 3
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```

```text
--- step 1
reveal: 1
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
--- step 2
reveal: 2
...
```

A step is how far a part is from the incoming particles. The parts still to come carry the class
`feynjs-ahead`, so a page can restyle them, or fade them in. `render(source, { reveal: 2 })` does
the same from JavaScript, and `levels: true` tags every part with its step without fading
anything.

## Next

- [Lines and particles](lines.md): every line style and particle name.
- [Labels](lines.md#labels): TeX labels, sides, momenta, couplings.
- [Processes, as in MadGraph](processes.md): the shorter way to write cascades.
