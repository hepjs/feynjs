# Views

```feynman
--- diagram
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
--- view: kinematic
view: kinematic
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```

```text
view: kinematic
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```

A view draws a source another way. Without the first line, the source above draws the diagram on
the left; with it, the event as the detector sees it, looking along the beam.

- `view: kinematic` draws each final state as a line out of the collision, in the direction it
  goes, as the detector records it.
- `view: lattice` draws space-time cut into sites and links, as lattice QCD does. It needs no
  diagram, only its own switches.
- `view: reaction`, the picture a nuclear process line is drawn as unless `view: diagram` asks
  for its diagram, draws a nuclear reaction as textbooks do: the nuclei coming in, a burst, and
  what it makes flying out; or a decay chain, step by step.

## The kinematic view

`view: kinematic` gives every final state a direction, a pseudorapidity η and an azimuth φ:

- what the collision makes goes central, its branches spread evenly round in φ (two of them back
  to back, like the top pair above);
- what a particle decays to stays near its direction: the top's b and W near the top, the W's
  lepton and neutrino near the W;
- a spectator quark of a t-channel exchange (a beam quark that gives off a boson and leaves) goes
  far forward or backward, along its own beam.

Each final state is drawn as what it is reconstructed as: quarks and gluons as jets, b quarks as
b-jets, electrons and muons as tracks, a tau as a tau jet, neutrinos and invisible SUSY particles
as missing energy. `reconstruct: off` draws the particles instead. A leg already drawn as a
[detector object](objects.md) keeps it.

### Along the beam and across it

`projection: transverse`, the default, looks along the beam. The rings are the detector's layers
round the beam, and a leg is shorter the further forward it goes. `projection: longitudinal`
looks across the beam: the beam is the horizontal line, the box the outline of the barrel, and a
forward leg leans toward the beam.

In vector-boson fusion the two quarks that give off the W bosons leave as forward jets. Along the
beam they are short stubs; across it they are the two long jets either side, with the Higgs boson's
b-jets between them.

```feynman
--- diagram
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b]
h -- h2 [bbar]
--- transverse
view: kinematic
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b]
h -- h2 [bbar]
--- longitudinal
view: kinematic
projection: longitudinal
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b]
h -- h2 [bbar]
```

```text
view: kinematic
projection: longitudinal
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b]
h -- h2 [bbar]
```

`rotate:` turns the whole event by that many degrees: in φ in the transverse view, about the
collision point in the longitudinal view (the beam and the detector stay put). It is 30 by
default, so that no branch lies along an axis.

### Moving a leg

The directions are a guess. To set one, give the leg's end `eta=` and `phi=` (in degrees), or
nudge it with `deta=` and `dphi=`. Here the forward jets are brought in to |η| = 1.5 and the two
b-jets are turned apart:

```feynman
--- as placed
view: kinematic
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b]
h -- h2 [bbar]
--- moved
view: kinematic
in: i1 i2
out: f1 h1 h2 f2
i1 [q] -- a -- f1 [q, eta=1.5]
i2 [q] -- b -- f2 [q, eta=-1.5]
a -- [W] c
b -- [W] c
c -- [H] h
h -- h1 [b, dphi=-60]
h -- h2 [bbar, phi=210]
```

```text
i1 [q] -- a -- f1 [q, eta=1.5]
i2 [q] -- b -- f2 [q, eta=-1.5]
h -- h1 [b, dphi=-60]
h -- h2 [bbar, phi=210]
```

### Labels

Labels are free text. A tag-and-probe picture of a Z boson decaying to two muons, one tagged and
one probed, with the labels written as `label={\mu^-\,\text{tag}}` (the braces keep the comma in
`\,` part of the label):

```feynman
--- diagram
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

```text
view: kinematic
in: q1 q2
out: t p
q1 [q] -- a
q2 [qbar] -- a
a -- [Z] z
z -- [fermion] t [label={\mu^-\,\text{tag}}]
p [label={\mu^+\,\text{probe}}] -- [fermion] z
```

### The particles that decay

`show intermediate: true` also draws the particles that decay on the way out (tops, W bosons),
faint, with their products starting from their ends.

Tag and probe in top pairs, the way large-R jets are calibrated: the leptonic top tags the event
(a muon, missing energy, a b-jet), and the hadronic top is the probe. The diagram draws every
particle. The views draw the probe as the detector sees it, one large-R jet holding its b and the
two quarks of its W (`[largejet 1b W(2j)]`, see
[Inside a large-R jet](objects.md#inside-a-large-r-jet)).

```feynman
--- diagram
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
c -- [largejet 1b W(2j), no label] J [label={\text{large-}R\text{ jet (probe)}}]
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
c -- [largejet 1b W(2j), no label] J [label={\text{large-}R\text{ jet (probe)}}]
t1 -- [W+] w1
t1 -- b1 [b, label={b\text{-jet (tag)}}]
w1 -- l1 [mu+, label={\mu^+\,\text{(tag)}}]
w1 -- n1 [nu_mu, label={E_\mathrm{T}^\mathrm{miss}}]
```

```text
view: kinematic
show intermediate: true
in: i1 i2
out: b1 l1 n1 J
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [largejet 1b W(2j), no label] J [label={\text{large-}R\text{ jet (probe)}}]
t1 -- [W+] w1
t1 -- b1 [b, label={b\text{-jet (tag)}}]
w1 -- l1 [mu+, label={\mu^+\,\text{(tag)}}]
w1 -- n1 [nu_mu, label={E_\mathrm{T}^\mathrm{miss}}]
```

## The lattice view

`view: lattice` draws space-time cut into a grid of sites joined by links, with what lives on it
marked over the grid: a Wilson loop braced R by T, a plaquette, a single link, a Polyakov loop
round the periodic time direction, and a marked site.

```feynman
view: lattice
lattice: 8x6
boundary: periodic
wilson loop: (1,1) to (4,4)
plaquette: (5,1)
link: (5,4) to (6,4)
polyakov loop: 7
site: (0,4) [label=\psi(x)]
```

```text
view: lattice
lattice: 8x6
boundary: periodic
wilson loop: (1,1) to (4,4)
plaquette: (5,1)
link: (5,4) to (6,4)
polyakov loop: 7
site: (0,4) [label=\psi(x)]
```

A site is written `(x,t)`: x across (space), t up (time), both counted from 0 at the bottom left.

| Switch | Draws |
|---|---|
| `lattice: 8x6` | the grid, sites across by up (2 to 40 each way; 6 by 5 if not given) |
| `wilson loop: (1,1) to (4,4)` | a rectangular loop of links between two opposite corners, arrows running anticlockwise, braced R across and T up, named W(R,T) |
| `plaquette: (5,1)` | the smallest loop, one shaded square of links, with this site at its bottom left, named U<sub>μν</sub>(x) |
| `link: (5,4) to (6,4)` | one link between two neighbouring sites, named U<sub>μ</sub>(x) across or U<sub>ν</sub>(x) up |
| `polyakov loop: 7` | a line of links all the way round in time, at this x, named P(**x**) |
| `site: (0,4) [label=\psi(x)]` | a site marked with a dot: a source or sink, a quark field |
| `boundary: periodic` | short dashed links past every edge, to show the lattice joined round |
| `axes: off` | no x and t arrows in the corner |

Each of the loops, links and sites may be written as often as wanted, one per line, and each takes
`[label=...]` (a TeX label in place of its own name) and `[color=...]`:

```feynman
view: lattice
lattice: 6x4
axes: off
plaquette: (0,1)
plaquette: (3,1) [color=orange, label=U_{\mu\nu}(y)]
link: (5,0) to (5,1)
site: (1,3) [color=blue, label=\psi(x)]
```

```text
view: lattice
lattice: 6x4
axes: off
plaquette: (0,1)
plaquette: (3,1) [color=orange, label=U_{\mu\nu}(y)]
link: (5,0) to (5,1)
site: (1,3) [color=blue, label=\psi(x)]
```

## The reaction picture

A [nuclear process line](vertices.md#nuclei-in-a-process) is drawn as the textbook cartoon of a
reaction (`view: reaction` names it; `view: diagram` draws the diagram instead): what comes in on
the left, each nucleus with an arrow into the middle; a burst there; and what is made fanned out
on the right, each with an arrow away from the burst, a lepton's plain, every one named on its
outer side. A photon among what is made comes out of the nucleus that gives it off.

```feynman
2H 3H > 4He n
---
235U n > 141Ba 92Kr n n n
```

```text
2H 3H > 4He n
---
235U n > 141Ba 92Kr n n n
```

The nuclei are drawn at their true sizes, one nucleon as large in all of them. Every arrow is the
same length, the legs on both sides the same angle apart, the picture even about the burst; the
arrows grow only as much as large neighbours, and their names, need to clear each other.

```feynman
2H p > 3He gamma
---
p p > 2H e+ ve
---
4He 4He 4He > 12C
```

```text
2H p > 3He gamma
---
p p > 2H e+ ve
---
4He 4He 4He > 12C
```

Three kinds of process have pictures of their own:

- a photon breaking a nucleus up (`gamma 2H > p n`, `gamma 16O > 15N p`): no burst, the photon
  reaching into the nucleus, the fragments flying out of it;
- an elastic scattering, the same in as out (`chi Xe > chi Xe`, `n 12C > n 12C`): what comes in
  meets the nucleus and leaves deflected, and the nucleus recoils, ringed as a moving source is
  in the Doppler picture (rings bunched ahead of it, spread out behind); `signal: on` adds what a detector sees, a few photons of scintillation
  light and the electrons of ionisation;
- an excited nucleus giving off a photon (`12C* > 12C gamma`): the nucleus glowing, the photon
  radiating out of it.

```feynman
gamma 2H > p n
---
n 12C > n 12C
---
12C* > 12C gamma
```

```text
gamma 2H > p n
---
n 12C > n 12C
---
12C* > 12C gamma
```

### Decay chains

A nuclear process that decays on, by later `>` lines or after commas, is drawn as a decay chain:
each nucleus in turn, joined by arrows, and what each step gives off (the alpha as a small helium
nucleus, the beta as its electron and antineutrino) branching off its arrow, small and to one side.
Each arrow is named with its mode, α, β⁻, β⁺ or γ, where what it gives off tells it.

```feynman
238U > 234Th 4He
234Th > 234Pa e- ve~
234Pa > 234U e- ve~
```

```text
238U > 234Th 4He
234Th > 234Pa e- ve~
234Pa > 234U e- ve~
```

| Switch | Draws |
|---|---|
| `chain: straight` | the chain left to right (the default) |
| `chain: curve` | the chain along a gentle arc, so a long one fits |
| `modes: off` | no α, β⁻, β⁺, γ over the arrows |

```feynman
chain: curve
238U > 234Th 4He, 234Th > 234Pa e- ve~, 234Pa > 234U e- ve~
note: 238U--234Th "alpha decay"
note: 234Pa "short-lived" below
```

```text
chain: curve
238U > 234Th 4He, 234Th > 234Pa e- ve~, 234Pa > 234U e- ve~
note: 238U--234Th "alpha decay"
note: 234Pa "short-lived" below
```

### Notes

`note:` lines work in these pictures as in any diagram, pointing at a nucleus or particle by name
(`4He`, `n`, `e-`; the first where there are several), at the burst (`burst`), or at an arrow
between two (`238U--234Th`, `2H--burst`).

```feynman
2H 3H > 4He n
note: burst "fusion"
note: n "14.1 MeV" below
```

```text
2H 3H > 4He n
note: burst "fusion"
note: n "14.1 MeV" below
```
