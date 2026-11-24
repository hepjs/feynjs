---
tags:
  - color flow
  - "'t Hooft double line"
  - double-line notation
  - QCD
  - quark
  - gluon
  - colour charge
---

# Colour flow

```feynman
colour flow: on
d dbar > g > t tbar
t > b W+
tbar > bbar W-
```

```text
colour flow: on
d dbar > g > t tbar
t > b W+
tbar > bbar W-
```

`colour flow: on` (or `color flow: on`) draws how colour runs through the diagram, in 't Hooft's
double-line notation. Thin coloured lines run beside the QCD lines:

- **one beside each quark**: a quark carries a colour (an antiquark an anticolour);
- **two beside each gluon**: a gluon carries a colour and an anticolour, running opposite ways.

At each vertex the lines join the way colour passes through it. Each colour line, followed through
the whole diagram, gets a colour of its own, and a small arrow on each stretch shows which way it
runs: along the quark arrows.

```feynman
colour flow: on
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [gluon] b
```

```text
colour flow: on
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [gluon] b
```

The gluon swaps the colours of the two quarks: the colour that comes in on the top quark leaves on
the bottom one.

## Gluons meeting gluons

At a three-gluon vertex, each pair of neighbouring gluons shares a colour line:

```feynman
colour flow: on
i1 [g] -- a -- i2 [g]
a -- [gluon] b
f1 [t] -- b -- f2 [tbar]
```

```text
colour flow: on
i1 [g] -- a -- i2 [g]
a -- [gluon] b
f1 [t] -- b -- f2 [tbar]
```

## With processes and decays

The switch works with both notations and both layout engines. A W or a photon carries no colour,
so colour passes it by. A blob ends the colour lines, since what happens inside it isn't drawn.
The diagram at the top of this page is written as a process.

## Loops

A plain `fermion` line that meets a gluon is taken to be a quark, so a quark loop needs no
particle names:

```feynman
colour flow: on
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

```text
colour flow: on
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

A quark's one colour line runs on the side of the next line it joins. Where the two ends of a quark
line join lines on opposite sides, the colour line crosses over the quark line half way.

## Colour lines on their own

`colour flow: only` draws the colour lines instead of the quark and gluon lines, as in a
double-line diagram: a quark is one colour line, a gluon two side by side. Lines without colour
(photons, W, Z, H) are drawn as usual. Labels stay.

```feynman
colour flow: only
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [gluon] b
```

```text
colour flow: only
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [gluon] b
```

Beside the same diagram with `colour flow: off`, in two [panels](panels.md) joined by `---[to]`,
it shows a vertex becoming its colour lines.

## What carries colour

| Colour | Particles |
|---|---|
| a triplet: one line | quarks (`u` ... `t`, `q`, `q'` and their antiquarks), squarks (`squark`, `stop`, `sbottom`), `LQ`, `T`, `B` |
| an octet: two lines | `g` and any `gluon` line, `gluino` |
| none | everything else |

## Styling

Each colour line carries red, green or blue, in turn. Where it runs forward in time (left to
right) it is drawn in its colour; where it runs back, as beside an antiquark or along one of a
gluon's two lines, in its anticolour: anti-red (cyan), anti-green (magenta) or anti-blue (yellow).
A gluon so always shows a colour and an anticolour. Where a gluon passes colour between two quarks,
its two colour lines cross over: each quark's colour goes on to the other.

The colours come from `colourFlow.palette` and the anticolours from `colourFlow.anti` in the
[theme](../reference/theme.md#colour-flow-colourflow). The same section sets the gap beside the lines, the stroke width and the arrows. The lines
are drawn in a group with the class `feynjs-colour-flow`, so a stylesheet can fade or hide them.

```css
svg.feynjs .feynjs-colour-flow { opacity: 0.8; }
```
