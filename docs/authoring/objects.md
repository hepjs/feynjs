# Detector objects

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [H] h
z -- [W] w
w -- f1 [largejet]
h -- f2 [bjet]
h -- f3 [bjet]
pp -- f4 [j]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [H] h
z -- [W] w
w -- f1 [largejet]
h -- f2 [bjet]
h -- f3 [bjet]
pp -- f4 [j]
```

Searches are often drawn as *semi-Feynman* diagrams: the process as usual, but each final state
drawn as what the detector sees. Name a leg after the object, and feynjs draws it at the end of the
leg, on a leg long enough to show what is inside.

| Name | Drawn as |
|---|---|
| `lightjet` | a jet from a light quark or a gluon: a cone of colour around the line (`j`, MadGraph's jet, is the same) |
| `bjet` | a b-jet: the B hadron's flight to its decay vertex (blue), then the D's to its own (teal), each with its tracks |
| `cjet` | a c-jet: the D hadron's flight to one decay vertex (teal) and its tracks |
| `taujet` | a hadronic tau: a narrow cone of three prongs |
| `largejet` | a large-R jet: a wide cone in which the particle splits into two subjets (a boosted W, Z, Higgs or top) |
| `topjet` | a top-tagged large-R jet: three subjets (the b and the W's two quarks) |
| `semivisiblejet` | a semi-visible jet: some tracks seen (solid), some dark hadrons not (dashed), a dashed rim |
| `emergingjet` | an emerging jet: the dark quark unseen (dashed), tracks emerging from displaced vertices |
| `displacedjet` | a displaced jet: a long-lived particle's flight (dotted) to a displaced vertex where the jet starts |
| `leptonjet` | a lepton-jet: two collimated leptons in a narrow cone |
| `met` | missing transverse momentum: a dotted arrow out of the diagram |
| `track` | a charged track: a thin line, unlabelled |
| `disappearingtrack` | a disappearing track: a charged track that stops, its soft decay dotted |
| `displacedlepton` | a displaced lepton: a dotted flight to a displaced vertex, then the lepton |
| `hscp` | a heavy stable charged particle (an R-hadron, a long-lived stau): a thick, highly ionising track |
| `remnant` | what is left of a proton that breaks up |

A name works in any case (`largeJet`), and the same everywhere: on a leg (`f1 [largejet]`), on a
line (`a -- [largejet] f1`), and in a [process](processes.md#detector-objects-in-a-process)
(`p p > Zp > largejet largejet`). Like a particle's, it labels what it names; `label=` on the line,
or a [`label:` line](processes.md), gives it a label of your own.

Older names (`J`, `LRJ`, `tauh`, `SVJ`, `b jet` and the like) still draw, and
[`check`](../get-started/api.md#check) says what to write instead.

## Writing an object

An object can hold what it is made of, written as counts after its name: `[largejet 2j 1e]` is a
large-R jet holding two jets and an electron, and `[largejet(2j, 1e)]` is the same. `displaced`
before a name moves where it starts (`[displaced track]`). See
[Syntax at a glance](syntax-at-a-glance.md#detector-objects) for every name.

```feynman
--- largejet 2j 1e, and largejet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [largejet 2j 1e] f1
z -- [largejet] f2
--- displacedjet, semivisiblejet, displaced track, emergingjet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [displacedjet] f1
pp -- [semivisiblejet] f2
pp -- [displaced track] f3
pp -- [emergingjet] f4
```

```text
--- largejet 2j 1e, and largejet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- [largejet 2j 1e] f1
z -- [largejet] f2
--- displacedjet, semivisiblejet, displaced track, emergingjet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [displacedjet] f1
pp -- [semivisiblejet] f2
pp -- [displaced track] f3
pp -- [emergingjet] f4
```

## Boosted resonances

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [largejet]
z -- f2 [largejet]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [largejet]
z -- f2 [largejet]
```

### Inside a large-R jet

A large-R jet can hold what it is made of: a b-tagged subjet (with its secondary vertex) and a W
that decays inside it. Write the particle that decays with what it decays to in parentheses: to
two jets (`[largejet 1b W(2j)]`, a hadronic top) or to a muon and a neutrino (`[largejet 1b W(1mu 1nu)]`,
a semileptonic one). `Z(...)`, `H(...)` and `t(...)` work the same way. The third panel is the
[kinematic view](views.md) of a top pair, one top of each kind.

```feynman
--- largejet 1b W(2j)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [largejet 1b W(2j)] f1
pp -- f2 [q]
--- largejet 1b W(1mu 1nu)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [largejet 1b W(1mu 1nu)] f1
pp -- f2 [q]
--- both, in the event view
view: kinematic
in: i1 i2
out: f1 f2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [largejet 1b W(2j)] f1 [label={t\to bq\bar q}]
c -- [largejet 1b W(1mu 1nu)] f2 [label={t\to b\mu\nu}]
```

```text
--- largejet 1b W(2j)
i1 [p] -- pp [blob] -- i2 [p]
pp -- [largejet 1b W(2j)] f1
pp -- f2 [q]
--- largejet 1b W(1mu 1nu)
...
--- both, in the event view
view: kinematic
in: i1 i2
out: f1 f2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [largejet 1b W(2j)] f1 [label={t\to bq\bar q}]
c -- [largejet 1b W(1mu 1nu)] f2 [label={t\to b\mu\nu}]
```

## Dark showers

```feynman
--- semi-visible jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [semivisiblejet]
b -- f2 [semivisiblejet]
--- emerging jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [emergingjet]
b -- f2 [emergingjet]
```

```text
--- semi-visible jets
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [semivisiblejet]
b -- f2 [semivisiblejet]
--- emerging jets
...
```

## Taus, lepton-jets and missing energy

```feynman
--- hadronic taus
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [taujet]
b -- f2 [taujet]
--- a lepton-jet and missing energy
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [leptonjet]
b -- f2 [met]
```

```text
--- hadronic taus
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
b -- f1 [taujet]
b -- f2 [taujet]
--- a lepton-jet and missing energy
...
```

## Tops, b-jets and long-lived particles

```feynman
--- a boosted top and a b-jet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [topjet]
z -- f2 [bjet]
--- a disappearing track and a heavy charged particle
i1 [p] -- pp [blob] -- i2 [p]
pp -- f1 [disappearingtrack]
pp -- f2 [hscp]
```

```text
--- a boosted top and a b-jet
i1 [p] -- pp [blob] -- i2 [p]
pp -- [Z'] z
z -- f1 [topjet]
z -- f2 [bjet]
--- a disappearing track and a heavy charged particle
i1 [p] -- pp [blob] -- i2 [p]
pp -- f1 [disappearingtrack]
pp -- f2 [hscp]
```

### Displaced jets

```feynman
i1 [g] -- a
i2 [g] -- a
a -- [H] b
b -- [S] s1
b -- [S] s2
s1 -- f1 [displacedjet]
s1 -- f2 [displacedjet]
s2 -- f3 [displacedjet]
s2 -- f4 [displacedjet]
```

```text
i1 [g] -- a
i2 [g] -- a
a -- [H] b
b -- [S] s1
b -- [S] s2
s1 -- f1 [displacedjet]
s1 -- f2 [displacedjet]
s2 -- f3 [displacedjet]
s2 -- f4 [displacedjet]
```

## A jet's flavour, where it starts

`circle=` on a point draws a circle there with a label inside: the flavour of the jet that starts
from it, as flavour-tagging figures draw it. A b-jet shows the B hadron's flight to its decay
vertex (blue) and the D's on to its own (teal); a c-jet the D's alone; every jet the faint tracks
of the rest of its particles. `color=` on the point colours the circle and its label. A jet drawn on
its own from a circle stands up, leaning a little right, and opens wider; `rotate: 15` turns any
drawing by so many degrees, counterclockwise.

```feynman
--- b
a [circle=b] -- [bjet, no label] f
--- c
a [circle=c] -- [cjet, no label] f
--- light
a [circle=l] -- [lightjet, no label] f
```

```text
a [circle=b] -- [bjet, no label] f
```

`impact` on a jet draws its impact parameters, as a flavour tagger sees them: the beam (dashed,
level) through where the jet starts, `z0` along the beam and `d0` up from there into the page,
slanting as depth does in an isometric view: how far a track, traced back, misses the vertex. `a [circle=b] -- [bjet, no label, impact] f`. Notes reach them
(`note: d0 "impact parameter"`).

Notes point inside an object: `note: B "B meson"` and `note: D "D meson"` at a b-jet's decay
vertices (`f.B` for the jet ending at `f`), and `note: bjet "tagged"` at an object by its name, a leg
or a line inside the diagram.

```feynman
a [circle=b] -- [bjet, no label] f
note: B "B meson" left
note: D "D meson" right
note: a "primary vertex" left
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
[theme](../setup/theme.md#lines-line) set the sizes; `line.jetColor` the colour of every cone. On one
jet, `color=` colours its cone and rim (`v -- [jet, color=teal] f1`); the line and its label stay in the ink.
Hover over an object's label to see what it is.
