# Edges, as in TikZ-Feynman

The edge syntax writes a diagram line by line: name the points, join them, say what each line
is. It follows TikZ-Feynman's `\diagram*` notation, so `a -- [photon] b` means what it means there.

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

## Chains

A **chain** joins vertices with `--`. A vertex is any name you choose: `a`, `v1`, `top`. A chain
can be as long as you like, and a vertex can appear in as many chains as you like:

```text
i1 -- a -- b -- f1        one chain, three lines
a -- c                    a fourth line from a
```

Statements end at a new line; a semicolon or a comma also ends one, as in TikZ-Feynman. `%`,
`#` and `//` start a comment.

## Vertices

Options for a vertex go in square brackets right after its name.

| Write | Meaning |
|---|---|
| `i1 [e-]` | an external leg, labelled as an electron; its line takes the electron's style |
| `f1 [\tilde\chi^0_1]` | an external leg with any TeX label |
| `v [dot]` | a vertex drawn as a dot; see [Vertices and blobs](vertices.md) for the other shapes |
| `v [dot, label=\kappa_\lambda]` | a coupling label beside the vertex |
| `v at (2, 1)` | fix a vertex in place by hand (in propagator lengths, y up); see [Layout](layout.md) |

## Lines

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

## What comes in, what goes out

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

## Two lines between the same points

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

## Coming from TikZ-Feynman

The keys TikZ-Feynman users reach for work here too: `momentum'` and `reversed momentum`,
`insertion=0.33`, `with arrow=0.3`, `out=` and `in=` with `looseness`, points placed from others
(`b [right=of a]`), `horizontal: a to b` and `vertical: a to b` to turn the diagram, `inline: a`
for a diagram in a line of text, and `every photon: ...` defaults.

```feynman
every photon: color=blue
vertical: a to b
i1 [e-] -- [fermion, momentum=p_1] a -- [fermion, momentum'=p_2] i2 [e+]
a -- [photon, reversed momentum=k, insertion=0.5] b
f1 [mu-] -- [fermion, with arrow=0.25, with arrow=0.75, no arrow] b -- f2 [mu+]
```

## Next

- [Lines and particles](lines.md): every line style and particle name.
- [Labels](labels.md): TeX labels, sides, momenta, couplings.
- [Processes, as in MadGraph](processes.md): the shorter way to write cascades.
