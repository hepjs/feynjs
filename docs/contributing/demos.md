# Feature demonstrations

Live examples of the features added from November 2026, drawn by the current build. Each
example shows the same diagram with a feature off and on, side by side.

## Colour schemes

`colours: bw` draws the diagram in black. Dots, blobs, hadrons and jet cones are filled in one
grey. The default keeps SUSY lines and the colours an author gives.

```feynman
--- default
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] g1 [dot, color=red]
g1 -- f1 [q, jet]
g1 -- f2 [q, color=blue]
g1 -- f3 [neutralino1]
--- colours: bw
colours: bw
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] g1 [dot, color=red]
g1 -- f1 [q, jet]
g1 -- f2 [q, color=blue]
g1 -- f3 [neutralino1]
```

## Engines

`layout: default` is the force layout. `layout: manual` keeps every point given `at (x, y)` and
lets the forces place the rest. `layout: grid` runs lines level, or upright, and parts them on
22.5 degree diagonals only where two or more leave a point the same way; it draws a light grey
grid behind the diagram (`background: grid` draws it for any layout).

```feynman
--- layout: default
in: q1 q2
out: q3 h1 h2 q4
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
--- layout: grid
layout: grid
in: q1 q2
out: q3 h1 h2 q4
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
--- layout: manual
layout: manual
in: q1 q2
out: q3 h1 h2 q4
a at (0, 1.5)
b at (0, -1.5)
c at (0, 0)
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
```

A simpler case for the grid, no more than three lines at any point: top-quark pair production
with one top decaying to a lepton, the other to quarks. On the grid every point sits on a crossing, and the final states
of each last decay meet at a right angle: one runs level to the final plane, the other
straight up or down (with `grid forks: diagonal`, both to the plane, symmetric about level).

```feynman
--- layout: default
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
--- layout: grid
layout: grid
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
--- grid forks: diagonal
layout: grid
grid forks: diagonal
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

The grid comes square or isometric (`grid: iso`, a triangular lattice): on the square grid a
decay turns right angles, on the isometric one it forks forward at plus and minus 60 degrees.
Loops are round on both.

```feynman
--- layout: grid
layout: grid
% HDBS-2019-08 fig_01a: gg -> R via a quark triangle, R -> SH, S -> invisible, H -> ZZ -> 4l
in: i1 i2
out: f1 f2 f3 f4 f5 f6
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
t3 -- [scalar, label=R] r
r -- [S] s
r -- [H, label'=H] h
f1 [\text{inv}] -- [fermion] s -- [fermion] f2 [\text{inv}]
h -- [Z] z1
h -- [Z] z2
z1 -- f3 [l+]
z1 -- f4 [l-]
z2 -- f5 [l+]
z2 -- f6 [l-]
--- grid: iso
grid: iso
layout: grid
% HDBS-2019-08 fig_01a: gg -> R via a quark triangle, R -> SH, S -> invisible, H -> ZZ -> 4l
in: i1 i2
out: f1 f2 f3 f4 f5 f6
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
t3 -- [scalar, label=R] r
r -- [S] s
r -- [H, label'=H] h
f1 [\text{inv}] -- [fermion] s -- [fermion] f2 [\text{inv}]
h -- [Z] z1
h -- [Z] z2
z1 -- f3 [l+]
z1 -- f4 [l-]
z2 -- f5 [l+]
z2 -- f6 [l-]
```

## Decays and the final plane

By default every boson decays along its own heading, the two branches of a decay mirror each
other about their parent's line, and two of the same particle from one decay are one length.
`final plane: on` lays the decays out as a tree instead: every final state on one vertical
plane, every decay forking about level, the branches of a decay given equal room.

```feynman
--- default
background: grid
in: i1 i2
out: f1 f2 f3 f4 f5 f6
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
t3 -- [scalar, label=R] r
r -- [S] s
r -- [H, label'=H] h
f1 [\text{inv}] -- [fermion] s -- [fermion] f2 [\text{inv}]
h -- [Z] z1
h -- [Z] z2
z1 -- f3 [l+]
z1 -- f4 [l-]
z2 -- f5 [l+]
z2 -- f6 [l-]
--- final plane: on
final plane: on
background: grid
in: i1 i2
out: f1 f2 f3 f4 f5 f6
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
t3 -- [scalar, label=R] r
r -- [S] s
r -- [H, label'=H] h
f1 [\text{inv}] -- [fermion] s -- [fermion] f2 [\text{inv}]
h -- [Z] z1
h -- [Z] z2
z1 -- f3 [l+]
z1 -- f4 [l-]
z2 -- f5 [l+]
z2 -- f6 [l-]
```

A leg thrown off before the last decay grows only as long as the line that brought its parent
in (the second χ here), not to the final plane.

```feynman
in: i1 i2
out: f1 f2 f3 f4 x1 x2
i2 -- [fermion, label={q}] a
a -- [fermion, label={\overline{q}}] i1
a -- [photon, label={Z'}] b
x2 -- [fermion, label={\chi}] b
b -- [fermion] c
c -- [fermion, label={\chi}] x1
c -- [scalar, label={s}] d
d -- [photon, label={W,Z}] e1
d -- [photon, label'={W,Z}] e2
f2 -- [fermion, label={\overline{q}}] e1
e1 -- [fermion, label={q}] f1
f4 -- [fermion, label={\overline{q}}] e2
e2 -- [fermion, label={q}] f3
```

## Detector objects

Objects are written like line styles: adjectives, the object, then what is drawn inside it.
See the [reference](../reference/index.md#detector-objects) for every name.

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [LRJ 2j 1e] f1
z -- [large R jet] f2
pp -- [DIS J] f3
pp -- [SVJ] f4
pp -- [DIS track] f5
pp -- [EMG] f6
```

## Engines across kinds of diagram

The same figures from the ATLAS corpus drawn three ways: the force layout (default), the grid,
and the force layout with `final plane: on`. The manual engine needs positions written in, so
it is shown above; the older rule-based engine (`v1`) is frozen and no longer compared.

### B physics: B_c to J/psi D_s (BPHY-2018-08 fig_01c)

```feynman
--- default
in: b1 c1
out: s1 c2 cb c3
w1 -- [fermion] b1 [\bar b]
c1 [c] -- [fermion] w1
w1 -- [boson, label=W] w2
s1 [\bar s] -- [fermion] w2 -- [fermion] c3 [c]
cb [\bar c] -- [fermion] vc -- [fermion] c2 [c]
meson: B_c^+ = b1 c1
meson: D_s^{(*)+} = s1 c2
meson: J/\psi = cb c3
--- grid
layout: grid
in: b1 c1
out: s1 c2 cb c3
w1 -- [fermion] b1 [\bar b]
c1 [c] -- [fermion] w1
w1 -- [boson, label=W] w2
s1 [\bar s] -- [fermion] w2 -- [fermion] c3 [c]
cb [\bar c] -- [fermion] vc -- [fermion] c2 [c]
meson: B_c^+ = b1 c1
meson: D_s^{(*)+} = s1 c2
meson: J/\psi = cb c3
--- final plane: on
final plane: on
in: b1 c1
out: s1 c2 cb c3
w1 -- [fermion] b1 [\bar b]
c1 [c] -- [fermion] w1
w1 -- [boson, label=W] w2
s1 [\bar s] -- [fermion] w2 -- [fermion] c3 [c]
cb [\bar c] -- [fermion] vc -- [fermion] c2 [c]
meson: B_c^+ = b1 c1
meson: D_s^{(*)+} = s1 c2
meson: J/\psi = cb c3
```

### SUSY: gluino pair with Z and gravitinos (SUSY-2013-13 fig_03b)

```feynman
--- default
arrows: none
in: p1 p2
out: q1 q2 l1 l2 G1 G2 l3 l4 q3 q4
p1 [p] -- pp [blob]
p2 [p] -- pp
pp -- [gluino] g1 [dot, color=gray]
pp -- [gluino] g2 [dot, color=gray]
g1 -- q1 [q]
g1 -- q2 [q]
g1 -- [neutralino1] n1
n1 -- [Z] z1
z1 -- l1 [\ell]
z1 -- l2 [\ell]
n1 -- G1 [gravitino]
g2 -- [neutralino1] n2
n2 -- G2 [gravitino]
n2 -- [Z] z2
z2 -- l3 [\ell]
z2 -- l4 [\ell]
g2 -- q3 [q]
g2 -- q4 [q]
--- grid
layout: grid
arrows: none
in: p1 p2
out: q1 q2 l1 l2 G1 G2 l3 l4 q3 q4
p1 [p] -- pp [blob]
p2 [p] -- pp
pp -- [gluino] g1 [dot, color=gray]
pp -- [gluino] g2 [dot, color=gray]
g1 -- q1 [q]
g1 -- q2 [q]
g1 -- [neutralino1] n1
n1 -- [Z] z1
z1 -- l1 [\ell]
z1 -- l2 [\ell]
n1 -- G1 [gravitino]
g2 -- [neutralino1] n2
n2 -- G2 [gravitino]
n2 -- [Z] z2
z2 -- l3 [\ell]
z2 -- l4 [\ell]
g2 -- q3 [q]
g2 -- q4 [q]
--- final plane: on
final plane: on
arrows: none
in: p1 p2
out: q1 q2 l1 l2 G1 G2 l3 l4 q3 q4
p1 [p] -- pp [blob]
p2 [p] -- pp
pp -- [gluino] g1 [dot, color=gray]
pp -- [gluino] g2 [dot, color=gray]
g1 -- q1 [q]
g1 -- q2 [q]
g1 -- [neutralino1] n1
n1 -- [Z] z1
z1 -- l1 [\ell]
z1 -- l2 [\ell]
n1 -- G1 [gravitino]
g2 -- [neutralino1] n2
n2 -- G2 [gravitino]
n2 -- [Z] z2
z2 -- l3 [\ell]
z2 -- l4 [\ell]
g2 -- q3 [q]
g2 -- q4 [q]
```

### Heavy ions: Delbrueck scattering in a Coulomb field (HION-2016-05 fig_01a_1)

```feynman
--- default
in: g1 c1
out: g2 c2
c1 [crossed dot]
c2 [crossed dot]
g1 -- [photon] a
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g2
c1 -- [photon] d
c2 -- [photon] c
--- grid
layout: grid
in: g1 c1
out: g2 c2
c1 [crossed dot]
c2 [crossed dot]
g1 -- [photon] a
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g2
c1 -- [photon] d
c2 -- [photon] c
--- final plane: on
final plane: on
in: g1 c1
out: g2 c2
c1 [crossed dot]
c2 [crossed dot]
g1 -- [photon] a
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g2
c1 -- [photon] d
c2 -- [photon] c
```

### Higgs: vector-boson fusion to HH (HDBS-2018-40 figaux_01a)

```feynman
--- default
in: q1 q2
out: q3 h1 h2 q4
q1 [particle={q}]
q2 [particle={q}]
q3 [particle={q}]
q4 [particle={q}]
l [dot, color=#ee325a]
h1 [particle={H}]
h2 [particle={H}]
q1 -- [fermion] a
a -- [fermion] q3
q2 -- [fermion] b
b -- [fermion] q4
a -- [boson, label'={V}] c
b -- [boson, label={V}] c
c -- [scalar, label'={H}] l
l -- [scalar, label={\lambda_{HHH}}] h1
l -- [scalar] h2
--- grid
layout: grid
in: q1 q2
out: q3 h1 h2 q4
q1 [particle={q}]
q2 [particle={q}]
q3 [particle={q}]
q4 [particle={q}]
l [dot, color=#ee325a]
h1 [particle={H}]
h2 [particle={H}]
q1 -- [fermion] a
a -- [fermion] q3
q2 -- [fermion] b
b -- [fermion] q4
a -- [boson, label'={V}] c
b -- [boson, label={V}] c
c -- [scalar, label'={H}] l
l -- [scalar, label={\lambda_{HHH}}] h1
l -- [scalar] h2
--- final plane: on
final plane: on
in: q1 q2
out: q3 h1 h2 q4
q1 [particle={q}]
q2 [particle={q}]
q3 [particle={q}]
q4 [particle={q}]
l [dot, color=#ee325a]
h1 [particle={H}]
h2 [particle={H}]
q1 -- [fermion] a
a -- [fermion] q3
q2 -- [fermion] b
b -- [fermion] q4
a -- [boson, label'={V}] c
b -- [boson, label={V}] c
c -- [scalar, label'={H}] l
l -- [scalar, label={\lambda_{HHH}}] h1
l -- [scalar] h2
```

## Kinematic view

`view: kinematic` draws the event as a detector sees it. `projection: transverse` looks along
the beam; `projection: longitudinal` looks across it. Move a leg with `eta=`, `phi=`, `deta=`, `dphi=`.

```feynman
--- diagram
% the kinematic view of a top pair: the two tops back to back, their products near them
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
--- view: kinematic (transverse)
view: kinematic
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
--- projection: longitudinal
view: kinematic
projection: longitudinal
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

Labels are free text. A tag-and-probe picture of Z to two muons, one tagged and one probed,
with the labels written as `label={\mu^-\,\text{tag}}` (braces keep the comma in `\,` part of
the label):

```feynman
--- diagram
% tag and probe: Z to two muons, one tagged (tight), one probed (loose); labels are free text
in: q1 q2
out: t p
q1 [q] -- a
q2 [qbar] -- a
a -- [Z] z
z -- [fermion] t [label={\mu^-\,\text{tag}}]
p [label={\mu^+\,\text{probe}}] -- [fermion] z
--- transverse
view: kinematic
in: q1 q2
out: t p
q1 [q] -- a
q2 [qbar] -- a
a -- [Z] z
z -- [fermion] t [label={\mu^-\,\text{tag}}]
p [label={\mu^+\,\text{probe}}] -- [fermion] z
--- longitudinal
view: kinematic
projection: longitudinal
in: q1 q2
out: t p
q1 [q] -- a
q2 [qbar] -- a
a -- [Z] z
z -- [fermion] t [label={\mu^-\,\text{tag}}]
p [label={\mu^+\,\text{probe}}] -- [fermion] z
```

Tag and probe in top pairs, the way large-R jets are calibrated: the leptonic top tags the
event (a muon, missing energy, a b-jet), and the hadronic top is the probe. The diagram draws every
particle; the event views draw the probe as the detector sees it, one large-R jet holding its b
and the two quarks of its W (`[LRJ 1b W(2j)]`: a b-tagged subjet and the W's two jets).

```feynman
--- diagram
% tag and probe in top pairs, to measure large-R jets: the leptonic top tags the event (muon, missing energy, b-jet); the hadronic top is the probe, one large-R jet holding its b and the two quarks of its W
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar, label'={\bar t\,\text{(probe)}}] t2
t1 -- [W+] w1
t1 -- b1 [label={b\,\text{(tag)}}]
w1 -- l1 [label={\mu^+\,\text{(tag)}}]
w1 -- n1 [nu_mu]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
--- transverse
view: kinematic
show intermediate: true
in: i1 i2
out: b1 l1 n1 J
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [LRJ 1b W(2j)] J [label={\text{large-}R\text{ jet (probe)}}]
t1 -- [W+] w1
t1 -- b1 [b, label={b\text{-jet (tag)}}]
w1 -- l1 [mu+, label={\mu^+\,\text{(tag)}}]
w1 -- n1 [nu_mu, label={E_\mathrm{T}^\mathrm{miss}}]
--- longitudinal
view: kinematic
projection: longitudinal
show intermediate: true
in: i1 i2
out: b1 l1 n1 J
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [LRJ 1b W(2j)] J [label={\text{large-}R\text{ jet (probe)}}]
t1 -- [W+] w1
t1 -- b1 [b, label={b\text{-jet (tag)}}]
w1 -- l1 [mu+, label={\mu^+\,\text{(tag)}}]
w1 -- n1 [nu_mu, label={E_\mathrm{T}^\mathrm{miss}}]
```

## Inside a large-R jet

A large-R jet can hold what it is made of: a b-tagged subjet (with its secondary vertex) and a
W that decays inside it, to two jets (`[LRJ 1b W(2j)]`, a hadronic top) or to a muon and a
neutrino (`[LRJ 1b W(1mu 1nu)]`, a semileptonic one).

```feynman
--- LRJ 1b W(2j)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [LRJ 1b W(2j)] f1 [J]
pp -- f2 [q]
--- LRJ 1b W(1mu 1nu)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [LRJ 1b W(1mu 1nu)] f1 [J]
pp -- f2 [q]
--- both, in the event view
view: kinematic
in: i1 i2
out: f1 f2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [LRJ 1b W(2j)] f1 [label={t\to bq\bar q}]
c -- [LRJ 1b W(1mu 1nu)] f2 [label={t\to b\mu\nu}]
```

## Lattice view

`view: lattice` draws space-time cut into sites and links, with a Wilson loop (braced R by T), a
plaquette, a single link, a Polyakov loop round the periodic time direction, and a marked site.

```feynman
view: lattice
lattice: 8x6
boundary: periodic
wilson loop: (1,1) to (4,4)
plaquette: (5,1)
link: (5,4) to (6,4)
polyakov loop: 7
site: (1,1) [label=\bar\psi(0)]
```

## Nuclei

`nucleus=Pb` (or any `A=` and `Z=`) draws the nucleus as its protons and neutrons.

```feynman
i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]
i2 [Pb] -- b2 [nucleus=Pb] -- o2 [Pb]
b1 -- [photon] a
b2 -- [photon] d
a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
b -- [photon] g1 [gamma]
c -- [photon] g2 [gamma]
```

## Drawing the eye: pulse

`pulse` on a point or a line animates a ring or a glow around it, to point a reader at one part
of a diagram: the collision, a coupling, the line a measurement is about.

```feynman
--- pulse on the collision
i1 [p] -- pp [blob, pulse] -- i2 [p]
pp -- [gluino] g1
pp -- [gluino] g2
g1 -- f1 [q]
g1 -- f2 [q]
g1 -- f3 [neutralino1]
g2 -- f4 [q]
g2 -- f5 [q]
g2 -- f6 [neutralino1]
--- pulse on a coupling and a line
i1 [q] -- a
i2 [q] -- b
a -- f1 [q]
b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H, pulse=blue] l [dot, pulse]
l -- h1 [H]
l -- h2 [H]
```
