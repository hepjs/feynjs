# Vertices and blobs

Where lines meet, feynjs draws nothing by default, as most papers do. Mark a vertex with a shape
in its options: `v [dot]`.

## Shapes

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

`dots: all` puts a dot on every vertex in the diagram (see [Panels and switches](panels.md)).

## Proton beams

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

## Jets

`[j]` on an outgoing leg is a jet, and `[p*]` or `[jet]` draws it as a shaded cone.

## Marks on a line

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

## Colour and labels

`color=` and `label=` work on vertices as on lines. `rim=` gives a dot a rim of another
colour, and `size=1.5` draws it half as large again: `a [dot, color=blue, rim=black, size=1.5]`. A labelled or coloured dot is drawn a little
larger, so the colour reads. See [coupling labels](labels.md#coupling-labels).

## Nuclei

`nucleus=Pb` draws a nucleus as its protons (dull red) and neutrons (dull black) packed together,
growing as A to the third. Name it by symbol (`Pb`, `Au`, `Xe`, `O`...), as an isotope (`208Pb`),
or give any numbers with `A=` and `Z=`. The nucleons sit in a ball of the nucleus's genuine
radius, seen in 3D. `nucleon edges: tinted` edges them in a darker red and a lighter grey instead
of ink; `nucleon edges: none` draws them without edges.

```feynman
i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]
i2 [Pb] -- b2 [nucleus=Pb] -- o2 [Pb]
b1 -- [photon] a
b2 -- [photon] d
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g1 [gamma]
c -- [photon] g2 [gamma]
```

## Hadrons with their quarks

`bag=proton` draws a hadron with its valence quarks and the colour flux tubes that bind them, as
lattice QCD shows them: a straight tube between a meson's quark and antiquark, a Y meeting at a
junction for a baryon, linked junctions for a tetraquark (diquark to antidiquark) and a
pentaquark. Each quark is a dot in its colour charge, red, green or blue, each antiquark in an
anticolour, so the whole is colourless. Name it (`proton`, `neutron`, `pi+`, `K+`, `J/psi`, `B0`,
`Zc`, `X3872`, `Tcc`, `Pc`...) or write its quarks out (`uud`, `u dbar`, `c cbar u dbar`,
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
