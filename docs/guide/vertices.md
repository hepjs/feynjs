---
tags:
  - dot
  - blob
  - insertion
  - counterterm
  - effective vertex
  - proton beam
  - nucleus
  - flux tube
  - loop
  - box
  - penguin
  - self-energy
  - meson
  - baryon
  - spectator
  - B physics
---

# Vertices, loops and hadrons

## Vertices and blobs

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z [dot]
z -- [W+] w1 [small blob]
z -- [W-] w2 [small blob]
w1 -- f1 [e+]
w1 -- f2 [nu_e]
w2 -- f3 [q]
w2 -- f4 [qbar]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z [dot]
z -- [W+] w1 [small blob]
z -- [W-] w2 [small blob]
w1 -- f1 [e+]
w1 -- f2 [nu_e]
w2 -- f3 [q]
w2 -- f4 [qbar]
```

Where lines meet, feynjs draws nothing by default, as most papers do. Mark a vertex with a shape
in its options: `v [dot]`.

### Shapes

```feynman
--- dot
i1 -- [fermion] v [dot] -- [photon] f1
--- empty dot
i1 -- [fermion] v [empty dot] -- [photon] f1
--- square dot
i1 -- [fermion] v [square dot] -- [photon] f1
--- crossed dot
i1 -- [fermion] v [crossed dot] -- [photon] f1
--- blob
i1 -- [fermion] v [blob] -- [photon] f1
--- hatched blob
i1 -- [fermion] v [hatched blob] -- [photon] f1
```

| Write | Drawn as | Typical use |
|---|---|---|
| `dot` | a filled dot | an interaction vertex you want to stress |
| `empty dot` | an open circle | a vertex of another kind |
| `square dot` | a filled square | a counterterm |
| `crossed dot` | a circle with a cross | an effective (contact) vertex |
| `slashed dot` | a circle struck through once | a mixing (the ε of kinetic mixing) |
| `blob` | a shaded disc | a collision, or a process not drawn in detail |
| `hatched blob` | a hatched disc | a form factor or unknown amplitude |
| `small blob` | a small shaded disc | a decay vertex in a production diagram |
| `small hatched blob` | a small hatched disc | an effective coupling (a form factor) |
| `insertion` | a cross on the line | a mass or mixing insertion |

`dots: all` puts a dot on every vertex in the diagram (see [Panels and switches](syntax.md#panels-and-switches)).

### Proton beams

`[p]` on an incoming leg draws a proton: three parallel lines. Two of them into a `blob` is the
usual picture of a collision at the LHC:

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- f3 [neutralino]
d2 -- f4 [neutralino]
d2 -- f5 [q]
d2 -- f6 [q]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
...
```

In the [process syntax](processes.md), `p p > ...` draws the same beams and blob for you.

### Jets

`[j]` on an outgoing leg is a jet, and `[p*]` or `[jet]` draws it as a shaded cone.

### Marks on a line

A vertex with exactly two lines is a **mark** on a line: a mixing insertion, a change of name. It
sits on the line and doesn't bend it. Several marks on one line are spaced evenly, and the line is
drawn longer to carry them:

```feynman
in: w
out: mu1 e nue mu2
w [W+] -- [boson] v1
mu1 [mu+] -- [fermion] v1
v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
v2 -- [boson, label=W^{+*}] v3
v2 -- [fermion] mu2 [mu-]
e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
```

```text
in: w
out: mu1 e nue mu2
w [W+] -- [boson] v1
mu1 [mu+] -- [fermion] v1
v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
v2 -- [boson, label=W^{+*}] v3
v2 -- [fermion] mu2 [mu-]
e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
```

### Colour and labels

`color=` and `label=` work on vertices as on lines. `rim=` gives a dot a rim of another
colour, and `size=1.5` draws it half as large again: `a [dot, color=blue, rim=black, size=1.5]`. A labelled or coloured dot is drawn a little
larger, so the colour reads. See [coupling labels](lines.md#coupling-labels).

### Nuclei

`nucleus=Pb` draws a nucleus as its protons (brick red) and neutrons (slate) packed together,
every nucleon the same size, so a nucleus grows as A to the third. Name it by symbol (`Pb`, `Au`,
`Xe`, `O`...), as an isotope (`208Pb`), or give any numbers with `A=` and `Z=`. The nucleons sit
in a ball of the nucleus's genuine radius, seen in 3D, each edged in a dark shade of its own
colour; `nucleon edges: ink` edges them in ink, `nucleon edges: none` not at all.

```feynman
i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]
i2 [Pb] -- b2 [nucleus=Pb] -- o2 [Pb]
b1 -- [photon] a
b2 -- [photon] d
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g1 [gamma]
c -- [photon] g2 [gamma]
```

```text
i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]
i2 [Pb] -- b2 [nucleus=Pb] -- o2 [Pb]
b1 -- [photon] a
b2 -- [photon] d
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g1 [gamma]
c -- [photon] g2 [gamma]
```

### Hadrons with their quarks

`bag=proton` draws a hadron with its valence quarks and the colour flux tubes that bind them, as
lattice QCD shows them: a straight tube between a meson's quark and antiquark, a Y meeting at a
junction for a baryon, linked junctions for a tetraquark (diquark to antidiquark) and a
pentaquark. Each quark is a dot in its colour charge, red, green or blue, each antiquark in an
anticolour, so the whole is colourless. Name it (`proton`, `neutron`, `pi+`, `K+`, `J/psi`, `B0`,
`Zc`, `X3872`, `Tcc`, `Pc`, or any [hadron's particle name](../reference/particles.md#hadrons-and-beams),
`Sigma+`, `K*0`, `Lambda_b`, `X(ucd)`...) or write its quarks out (`uud`, `u dbar`, `c cbar u dbar`,
`uudc cbar`). With `motion`, the flux tubes breathe slowly. A pentaquark can be drawn as a
molecule instead, a baryon beside a meson, each colourless with its own flux tubes: add
`molecule` (the P_c as a Sigma_c and an anti-D), or write the two parts with a plus,
`bag=uud + c cbar`.

```feynman
i [bag=Pc] -- a -- f [J/\psi]
a -- n [p]
---
i [bag=Pc, molecule] -- a -- f [J/\psi]
a -- n [p]
```

## Loops, boxes and hadrons

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

### Loops

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

### A boson over a line

A boson that leaves a fermion line and rejoins it is drawn as an arc over the line: a vertex
correction, a self-energy. A vertex on the boson sits at the top of the arc, so a photon or Z can
leave from there, as in the **penguin** at the top of this page.

### Hadrons

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

### Spectators

A line that runs from an incoming leg straight to an outgoing leg without taking part is a
**spectator**. It is drawn level across the diagram, clear of the loops beside it: the `d` quark
in the penguin above.

### Lines that aren't drawn

`a -- [hidden] b` joins two vertices for the layout and draws nothing. Use it to hold a part of a
diagram in place, or to leave room where a line will be added later.

More loops, penguins, boxes and hadron decays are in [Examples](../examples/index.md), under
*Flavour (B physics and hadrons)*.
