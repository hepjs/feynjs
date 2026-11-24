---
tags:
  - layout engine
  - force layout
  - grid layout
  - manual layout
  - pin a vertex
  - final plane
  - debug
  - v1
  - TikZ-Feynman
---

# Layout engines

***feynjs places every vertex itself. Choose how with one line: the force layout, a grid, your own
positions or the older rules. Then steer a diagram by hand.***

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

```text
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

The same diagram of vector-boson fusion to HH, drawn by three engines. Only the `layout:` line
differs, and in the third panel three points placed by hand.

## Choosing an engine

One line in the source picks the engine. Leave it out and you get the force layout.

| Write | Engine | Use it for |
|---|---|---|
| `layout: default` (or `v2`) | the [force layout](#the-force-layout) | any diagram; nothing to set |
| `layout: grid` | the force layout, then every line put on a [grid](#the-grid) | schematic drawings, with lines level or upright |
| `layout: manual` | your own positions, the force layout for the rest ([by hand](#placing-points-by-hand)) | a figure you want point by point, as in TikZ-Feynman |
| `layout: v1` | the older [rule engine](#the-rule-engine-v1) | diagrams first drawn with it |

The syntax doesn't choose the layout: a process line is turned into ordinary edges first, so both
notations go through the same engine. In a block of panels each panel takes its own `layout:`
line, as above. To use one engine for every diagram, set it in the theme:
`render(source, { theme: { engine: "grid" } })` (`"v2"`, `"grid"`, `"manual"` or `"v1"`).

## The force layout

`layout: default`, also written `layout: v2`, is the default. It treats the diagram as a small
physical system. Lines want their natural length, the lines at a vertex want to split the turn
evenly, time wants to run left to right, and unrelated parts keep clear of each other. It finds
the balance, then snaps loops, arcs and vacuum pairs into their exact shapes.

It was reviewed figure by figure against some 500 published diagrams and is frozen: its layouts
change only when a change is reviewed and approved again (see
[Testing](../contributing/testing.md#the-validation-set-and-the-approved-layouts)).

### The conventions it follows

The defaults come from practice. A corpus of hand-placed reproductions of published diagrams
(from ATLAS public results) sets the angles, lengths and spacings, and serves as the regression
suite.

- Time runs left to right: incoming particles on the left, outgoing on the right.
- A diagram is mirrored top to bottom when its structure allows.
- Fermion lines that pass through vertices stay straight.
- Decay cascades fan out symmetrically, each stage a little shorter than the one before.
- Light particles are drawn outside heavy ones, so a cascade's spine stays in the middle.
- A quark that gives off a gluon on its way into a blob (initial-state radiation) is one
  straight line, one leg long, with one arrow; the gluon comes off it. So is a gluon off an
  incoming quark that goes on to annihilate into a boson that decays (q qbar -> Z' + g). A W,
  Z or photon given off the same way is drawn as a t-channel exchange, as papers draw
  q qbar -> W gamma; mark one `[photon, radiation]` to draw it as radiation instead.
- A particle and its antiparticle made at a contact vertex (a dark-matter pair) leave together,
  close and forward.
- Labels never sit on a line or on each other.

## The grid

`layout: grid` runs the force layout, then puts every line on a direction of a grid. Lines run
level, or upright. Only where two or more leave a point the same way do they part, on
22.5 degree diagonals (45 degrees with `grid: 45`). A light grey grid is drawn behind the
diagram; `background: grid` draws it behind any layout.

On the grid every point sits on a crossing. The final states of each last decay meet at a right
angle: one runs level to the final plane, the other straight up or down. With
`grid forks: diagonal` both run to the plane, symmetric about level. A cascade is a level spine:
at each decay along it, the particle that carries it on (the superpartner, else the one product
that decays further, a top's W) runs level, and the final states it gives off stand out from the
spine away from the middle of the diagram, a gluino's two quarks parting about the upright. Here is
top-quark pair production, one top decaying to a lepton, the other to quarks:

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

```text
% the third panel; leave out "grid forks" for the second, and "layout: grid" too for the first
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

The grid comes square or isometric (`grid: iso`, a triangular lattice). On the square grid a
decay turns right angles; on the isometric one it forks forward at plus and minus 60 degrees.
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

```text
% the second panel; leave out "grid: iso" for the first
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

## Placing points by hand

`v at (x, y)` puts point `v` at (x, y), in propagator lengths with y up. With `layout: manual`
every point given a place stays exactly there, and the force layout places the rest, as in
TikZ-Feynman's manual placement. The opening figure pins three points. Pin every point that
matters and the drawing is wholly yours:

```feynman
layout: manual
in: q1 q2
out: q3 h1 h2 q4
q1 at (-1.5, 1.5)
q2 at (-1.5, -1.5)
q3 at (1.5, 1.5)
q4 at (1.5, -1.5)
a at (0, 1.5)
b at (0, -1.5)
c at (0, 0)
l at (1, 0)
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
```

```text
layout: manual
in: q1 q2
out: q3 h1 h2 q4
q1 at (-1.5, 1.5)
q2 at (-1.5, -1.5)
q3 at (1.5, 1.5)
q4 at (1.5, -1.5)
a at (0, 1.5)
b at (0, -1.5)
c at (0, 0)
l at (1, 0)
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
```

A pin holds in the default layout too, so one or two pins are also the heaviest way to
[steer](#steering-it) a diagram. `layout: manual` says in the source that the placement is yours.

## The rule engine (v1)

`layout: v1` places vertices in columns by time, then settles their heights with a list of
named rules: forks open at set angles, cascades arc, loops sit over their lines. It is fast and
predictable, and kept as it was. Every rule is listed in [Layout rules](../reference/layout-rules.md).

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
--- layout: v1
layout: v1
in: q1 q2
out: q3 h1 h2 q4
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
```

```text
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
--- layout: v1
layout: v1
in: q1 q2
out: q3 h1 h2 q4
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=V] c
b -- [boson, label=V] c
c -- [H] l [dot]
l -- h1 [H]
l -- h2 [H]
```

## The final plane

By default every boson decays along its own heading, the two branches of a decay mirror each
other about their parent's line, and two of the same particle from one decay are one length.
`final plane: on` lays the decays out as a tree instead: every final state on one vertical
plane, every decay forking about level, the branches of a decay given equal room. It works with
the force layout, the grid and manual placement; v1 ignores it. In a diagram with hadrons the
hadrons already line up the final states, and the switch changes nothing.

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

```text
% the second panel; leave out "final plane: on" for the first
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

Without the switch, a leg thrown off before the last decay grows only as long as the line that
brought its parent in (the second χ here), not out to the final states.

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

```text
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

## Engines across kinds of diagram

The same figures from the ATLAS corpus drawn three ways: the force layout, the grid, and the
force layout with `final plane: on`. Each source below draws the first panel; add
`layout: grid` or `final plane: on` for the others. Manual placement needs positions written
in, so it is shown only above; v1 is frozen and not compared.

### B physics: B_c to J/psi D_s (BPHY-2018-08 fig_01c)

The hadrons already line up the final states, so `final plane: on` changes nothing here.

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

```text
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

```text
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

```text
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

```text
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

## Steering it

From lightest touch to heaviest:

1. **Order the legs.** `in:` and `out:` fix the order of the external legs from top to bottom,
   even if that makes lines cross ([Edges](syntax.md#what-comes-in-what-goes-out)).
2. **Add a hidden line.** `a -- [hidden] b` ties two vertices together without drawing anything.
3. **Bend a line.** `half left`, `quarter right`, `bend=30` curve one line without moving its ends.
4. **Pin a vertex.** `v at (2, 1)` fixes `v` in place, in propagator lengths with y up. The rest
   of the diagram is still laid out around it ([Placing points by hand](#placing-points-by-hand)).
5. **Tune the rules.** Every angle, length and weight is a [theme setting](../reference/theme.md),
   so you can change one for a whole page, or for one diagram:

```js
// v1: narrower forks
feynjs.render(source, { theme: { layout: { branchAngle: 22 } } });
// v2: longer propagators
feynjs.render(source, { theme: { forces: { lineLength: 1.2 } } });
```

## Why a line is where it is

`debug: on` shows how the layout came out the way it did. Behind the drawing is a faint grid,
half a line apart. Each point carries its name, and each line a number. Under the drawing, line by
line, is the line's length and direction and the rules that hold it there.

```text
debug: on
in: i1 i2
out: f1 f2 f3
i1 [g] -- a
i2 [g] -- a
a -- [t] b
b -- f1 [b]
b -- [W] c
c -- f2 [l+]
c -- f3 [nu]
```

```feynman
debug: on
in: i1 i2
out: f1 f2 f3
i1 [g] -- a
i2 [g] -- a
a -- [t] b
b -- f1 [b]
b -- [W] c
c -- f2 [l+]
c -- f3 [nu]
```

The reasons are measured, not written by hand. The diagram is settled again with each rule of the
force layout left out in turn. A rule is a reason for a line when leaving it out changes that line,
and the number in brackets is by how much: how far the line moves, in line lengths. The rules a
line depends on most come first. After them come the steps that run once the forces have settled,
when they moved the line: legs turned over to follow the `out:` list, a top's b turned outside, two
halves made an exact mirror image, final states lined up.

Hover over a line's number to see its reasons beside the drawing. Every SVG carries them too, in
the `data-why` attribute of each number's group.

Use it to find which rule to [steer](#steering-it) or [tune](../reference/theme.md). A diagram with
`debug: on` takes longer to draw, about a twentieth of a second for each rule it uses, so take it
out once the layout is right. The [rule engine (v1)](#the-rule-engine-v1) is not measured: its
lines are numbered and their lengths and directions given, without reasons.

## Measuring a layout

`feynjs.measure(source)` scores a layout without anyone looking at it: crossings, crowded
vertices and labels, the smallest angle at a vertex, stub lines. See
[Checking diagrams](tools.md#measure).
