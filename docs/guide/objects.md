---
tags:
  - semi-Feynman
  - jet
  - large-R jet
  - b-jet
  - missing energy
  - MET
  - hadronic tau
  - long-lived particles
---

# Detector objects

***Draw each final state as the detector sees it: jets, large-R and b-tagged jets, hadronic taus, missing energy and the signatures of long-lived particles.***

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [H] h
z -- [W] w
w -- f1 [J]
h -- f2 [bjet]
h -- f3 [bjet]
pp -- f4 [j]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [H] h
z -- [W] w
w -- f1 [J]
h -- f2 [bjet]
h -- f3 [bjet]
pp -- f4 [j]
```

Searches are often drawn as *semi-Feynman* diagrams: the process as usual, but each final state
drawn as what the detector sees. Name a leg after the object, and feynjs draws it at the end of the
leg, on a leg long enough to show what is inside.

| Name | Style | Drawn as |
|---|---|---|
| `j` | `jet` | a jet: a cone of colour around the line |
| `J` | `large jet` | a large-R jet: a wide cone in which the particle splits into two subjets (a boosted W, Z, Higgs or top) |
| `tauh` | `tau jet` | a hadronic tau: a narrow cone of three prongs |
| `svj` | `semi-visible jet` | a semi-visible jet: some tracks seen (solid), some dark hadrons not (dashed), a dashed rim |
| `ej` | `emerging jet` | an emerging jet: the dark quark unseen (dashed), tracks emerging from displaced vertices |
| `dj` | `displaced jet` | a displaced jet: a long-lived particle's flight (dotted) to a displaced vertex where the jet starts |
| `ljet` | `lepton jet` | a lepton-jet: two collimated leptons in a narrow cone |
| `met` | `missing energy` | missing transverse momentum: a dotted arrow out of the diagram |
| `Jt` | `top jet` | a top-tagged large-R jet: three subjets (the b and the W's two quarks) |
| `bjet` | `b jet` | a b-jet: a jet with a displaced secondary vertex and its tracks |
| `dt` | `disappearing track` | a disappearing track: a charged track that stops, its soft decay dotted |
| `dl` | `displaced lepton` | a displaced lepton: a dotted flight to a displaced vertex, then the lepton |
| `hscp` | `heavy charged` | a heavy stable charged particle (an R-hadron, a long-lived stau): a thick, highly ionising track |

Use the name on a leg (`f1 [J]`, which also labels it) or the style on a line
(`a -- [large jet, label=H\to b\bar b] f1`).

## Writing an object

On a line, an object is written like a line style: adjectives, then the object, then what is drawn
inside it, as counts. `[LRJ 2j 1e]` is a large-R jet holding two jets and an electron;
`[DIS J]` is a displaced jet. Long and short names are the same: `[large R jet 2j 1e]` and
`[LRJ(2j, 1e)]` draw the same thing. See [Syntax at a glance](../reference/index.md#detector-objects)
for every name.

```feynman
--- what a large-R jet holds
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [LRJ 2j 1e] f1 [label={\text{LRJ 2j 1e}}]
z -- [large R jet] f2 [label={\text{large R jet}}]
--- displaced and dark
i1 [p] -- pp [blob] -- i2 [p]
pp -- [DIS J] f1 [label={\text{DIS J}}]
pp -- [SVJ] f2 [label={\text{SVJ}}]
pp -- [DIS track] f3 [label={\text{DIS track}}]
pp -- [EMG] f4 [label={\text{EMG}}]
```

```text
--- what a large-R jet holds
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [LRJ 2j 1e] f1 [label={\text{LRJ 2j 1e}}]
z -- [large R jet] f2 [label={\text{large R jet}}]
--- displaced and dark
i1 [p] -- pp [blob] -- i2 [p]
pp -- [DIS J] f1 [label={\text{DIS J}}]
pp -- [SVJ] f2 [label={\text{SVJ}}]
pp -- [DIS track] f3 [label={\text{DIS track}}]
pp -- [EMG] f4 [label={\text{EMG}}]
```

## Boosted resonances

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [J]
z -- f2 [J]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [J]
z -- f2 [J]
```

### Inside a large-R jet

A large-R jet can hold what it is made of: a b-tagged subjet (with its secondary vertex) and a W
that decays inside it. Write the particle that decays with what it decays to in parentheses: to
two jets (`[LRJ 1b W(2j)]`, a hadronic top) or to a muon and a neutrino (`[LRJ 1b W(1mu 1nu)]`,
a semileptonic one). `Z(...)`, `H(...)` and `t(...)` work the same way. The third panel is the
[kinematic view](views.md) of a top pair, one top of each kind.

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

```text
--- LRJ 1b W(2j)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [LRJ 1b W(2j)] f1 [J]
pp -- f2 [q]
--- LRJ 1b W(1mu 1nu)
...
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

## Dark showers

```feynman
--- semi-visible jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [svj]
b -- f2 [svj]
--- emerging jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [ej]
b -- f2 [ej]
```

```text
--- semi-visible jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [svj]
b -- f2 [svj]
--- emerging jets
...
```

## Taus, lepton-jets and missing energy

```feynman
--- hadronic taus
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [tauh]
b -- f2 [tauh]
--- a lepton-jet and missing energy
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [ljet]
b -- f2 [met]
```

```text
--- hadronic taus
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [tauh]
b -- f2 [tauh]
--- a lepton-jet and missing energy
...
```

## Tops, b-jets and long-lived particles

```feynman
--- a boosted top and a b-jet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [Jt]
z -- f2 [bjet]
--- a disappearing track and a heavy charged particle
i1 [p] -- pp [blob] -- i2 [p]
pp -- f1 [dt]
pp -- f2 [hscp]
```

```text
--- a boosted top and a b-jet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [Jt]
z -- f2 [bjet]
--- a disappearing track and a heavy charged particle
i1 [p] -- pp [blob] -- i2 [p]
pp -- f1 [dt]
pp -- f2 [hscp]
```

### Displaced jets

```feynman
i1 [g] -- a
i2 [g] -- a
a -- [H] b
b -- [S] s1
b -- [S] s2
s1 -- f1 [dj]
s1 -- f2 [dj]
s2 -- f3 [dj]
s2 -- f4 [dj]
```

```text
i1 [g] -- a
i2 [g] -- a
a -- [H] b
b -- [S] s1
b -- [S] s2
s1 -- f1 [dj]
s1 -- f2 [dj]
s2 -- f3 [dj]
s2 -- f4 [dj]
```

## Jets marked with a cone

Many papers mark the partons that become jets with a small cone, set in a column of its own to
the right of the diagram, a second final plane. `cone` on a leg puts one there, level with the
leg's end and spaced clear of the others, with the leg's name beyond it (`jet` instead shades a
cone round the line itself):

```feynman
i1 [g] -- [gluon] a
i2 [g] -- [gluon] b
f3 [\bar b] -- [fermion] vb -- [fermion, label=\bar t] a -- [fermion] b -- [fermion, label=t] vt -- [fermion] f4 [b, cone]
vb -- [boson, label=W^-] w
f2 [\bar\nu] -- [fermion] w -- [fermion] f1 [\ell^-]
vt -- [boson, label=W^+] wp
f6 [\bar q, cone] -- [fermion] wp -- [fermion] f5 [q, cone]
```

```text
f4 [b, cone]          a b quark that becomes a jet
```

## Tuning

`line.largeJetScale`, `line.narrowJetScale`, `line.trackWidth` and `line.objectLegStretch` in the
[theme](../reference/theme.md#lines-line) set the sizes; `line.jetColor` the colour of every cone.
Hover over an object's label to see what it is.
