---
tags:
  - loop
  - box
  - penguin
  - self-energy
  - meson
  - baryon
  - spectator
  - B physics
---

# Loops, boxes and hadrons

```feynman
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```

```text
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```

feynjs recognises loops and hadrons from how the lines connect, and draws them as papers do.
You only write the connections.

## Loops

A closed path of lines is a loop. A triangle of top quarks between two gluons and a Higgs is
gluon fusion:

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

```text
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

Two lines between the same pair of vertices make a bubble. A loop of four lines is a box, drawn
square with upright rungs when it hangs on a quark line.

## A boson over a line

A boson that leaves a fermion line and rejoins it is drawn as an arc over the line: a vertex
correction, a self-energy. A vertex on the boson sits at the top of the arc, so a photon or Z can
leave from there, as in the **penguin** at the top of this page.

## Hadrons

`hadron:` (or `meson:`, `baryon:`) groups legs into one hadron:

```text
meson: J/\psi = c2 cbar          a shaded ellipse over the ends of the legs, the name inside
hadron: B^0 = d1 b [brace]       a brace beside the legs instead
meson: M = qi qj [cap]           a thin cap across the legs' ends, the name beyond it
meson: = c1 c2 [hatched]         a hatched circle with no name (a colour-octet pair)
```

The cap suits a meson made at the end of two quark lines, as in a rare decay of a Higgs or Z
boson to a meson and a photon (ATLAS HDBS-2018-52): the boson decays to a quark and an antiquark,
the antiquark gives off the photon, and the pair binds into the meson.

```feynman
in: h
out: qi qj y
h [H(Z)] -- [scalar] v
v -- [fermion] qi [q_i]
qj [\bar q_j] -- [fermion] w -- [fermion, label=\bar q_j] v
w -- [photon] y [\gamma]
meson: \mathcal{M} = qi qj [cap]
```

Outgoing hadrons line up in one column, and a quark pair made from the vacuum sits between the
two hadrons it feeds:

```feynman
in: c1 b
out: c2 cbar s c3
c1 [c] -- [fermion] c2 [c]
cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
v -- [boson, label=W] w
s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
meson: B_c^+ = c1 b
meson: J/\psi = c2 cbar
meson: D_s^+ = s c3
```

```text
in: c1 b
out: c2 cbar s c3
c1 [c] -- [fermion] c2 [c]
cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
v -- [boson, label=W] w
s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
meson: B_c^+ = c1 b
meson: J/\psi = c2 cbar
meson: D_s^+ = s c3
```

## Spectators

A line that runs from an incoming leg straight to an outgoing leg without taking part is a
**spectator**. It is drawn level across the diagram, clear of the loops beside it: the `d` quark
in the penguin above.

## Lines that aren't drawn

`a -- [hidden] b` joins two vertices for the layout and draws nothing. Use it to hold a part of a
diagram in place, or to leave room where a line will be added later.

More loops, penguins, boxes and hadron decays are in [Examples](../examples/index.md), under
*Flavour (B physics and hadrons)*.
