---
tags:
  - subfigures
  - side by side
  - captions
  - sum of diagrams
  - cut diagram
  - reveal
  - options
---

# Panels and switches

***Put several diagrams side by side, lettered or joined by +, = or a cut, and set switches for a whole diagram: arrows, dots, size, colour flow and more.***

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

## Several diagrams side by side

A line of three or more dashes starts a new panel. Text after the dashes is that panel's
caption. Without it, panels are lettered (a), (b), (c). Panels sit three to a row; the
`panelsPerRow` option of `render` changes that.

Each panel is a diagram of its own: vertex names can repeat, and panels can use either syntax.

### Joining panels

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

## Switches

A line `name: value` sets something for the whole diagram (or panel).

| Write | Effect |
|---|---|
| `in: i1 i2` / `out: f2 f1` | which legs enter and leave, in order top to bottom ([Edges](syntax.md#what-comes-in-what-goes-out)) |
| `arrows: none` | no fermion arrows, as many SUSY papers draw them |
| `dots: all` | a dot on every vertex where lines meet |
| `scale: 1.5` | the whole diagram 1.5 times larger, as a zoom |
| `size: small` | an optical size: `small`, `tiny`, `large` or any number (1 is normal); see [Styling](styling.md#size) |
| `title: ...` | a title, shown as a tooltip and read by screen readers |
| `layout: v1` | lay out with the older rule engine instead of the force engine ([Layout engines](layout.md#the-rule-engine-v1)) |
| `colour flow: on` | draw the colour lines beside quarks and gluons ([Colour flow](colour-flow.md)) |
| `charge colour: on` | colour charged lines by the sign of their charge ([Styling](styling.md#colour-by-charge)) |
| `reveal: 2` | draw the first two steps in time as usual and the rest faint and grey ([Step by step](#step-by-step)) |
| `meson:`, `baryon:`, `hadron:` | group legs into a hadron ([Hadrons](loops-hadrons.md#hadrons)) |

Every diagram already carries a description for screen readers, built from its process:
`aria-label="Feynman diagram: e- e+ -> mu- mu+"`. `title:` adds a title of your own as well.

## Step by step

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
