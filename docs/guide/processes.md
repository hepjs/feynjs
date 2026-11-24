---
hide:
  - toc
tags:
  - decay chain
  - SUSY cascade
  - production and decay
  - MG5_aMC
  - loop-induced
  - VBF
  - VBS
---

# Processes, as in MadGraph

***Write `p p > t tbar` and `t > b W+` as in MadGraph: decays, loops, production modes and particles that decay two ways, drawn as one diagram.***

```feynman
d dbar > g > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> e- nubar)
```

````markdown
```feynman
d dbar > g > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> e- nubar)
```
````

Instead of writing every line, name the process: what comes in, what it goes through, what comes
out. Then say how each particle decays. feynjs makes the vertices and lines and lays them out.

```feynman
e- e+ > gamma > mu- mu+
```

````markdown
```feynman
e- e+ > gamma > mu- mu+
```
````

## The rules

- **The first line with `>` is the process.** Its left side is what comes in:
    - `p p` draws two proton beams into a blob;
    - other particles meet at a point;
    - a single particle is a decay.
- **A particle between two `>`** is a line the process passes through: `d dbar > g > t tbar`
  draws the gluon between the quarks and the tops. Without it, everything meets at one point.
- **Each later `>` line says how a particle decays**, wherever that particle appears:
  `t > b W+`.
- **If one particle has several decay lines, they are used in turn.** The first gluino decays the
  first way, the second the second way. If there are more particles than ways, the last way repeats.
- **`W+(> e+ nu)` decays one particle on the spot**, without a rule for every `W+`.
- **Whatever does not decay leaves the diagram.**

Particle names are feynjs's own, listed in [Particles](../reference/particles.md). MadGraph's
Standard Model names work too (`t~`, `w+`, `ve`, `ta+`; see [MadGraph](../compatibility/madgraph.md#particle-names)),
but its SUSY names don't: write `gluino`, not `go`. A name feynjs doesn't know is drawn as a plain
line carrying that name as its label.

To draw a particle with a label of your own, while keeping its line style and properties, add a
`label:` line. This works in both syntaxes:

```feynman
label: chargino+ = \tilde\chi^\mp_1
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > Z neutralino1
```

```text
label: chargino+ = \tilde\chi^\mp_1
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > Z neutralino1
```

## How it differs from MadGraph

What feynjs takes from MadGraph, and what it doesn't, is on [MadGraph](../compatibility/madgraph.md).

## Through a loop

A loop is a segment of its own, in braces, with the particle that runs round it inside:
`g g > {t} > H` passes through a top loop. Everything that meets the loop, coming in or going on,
meets it at a corner of its own, so this is the top triangle. Loops go wherever a line can: in
the process, before a line it passes on (`g g > {t} > H > H H`, the triangle with its Higgs
splitting) and in a decay (`H > {W+} > a a`). A process pasted from MadGraph with
`[noborn=QCD]` (loop-induced) goes through a top loop; `[QCD]` (higher orders, in MadGraph)
draws the tree as it is.

```feynman
g g > {t} > H
H > b b~
---
g g > {t} > H H
---
g g > {t} > H > H H
```

```feynman
g g > H
H > {W+} > a a
---
a a > {e-} > a a
```

## Production modes

A production mode can stand for what comes in. `ggF > H` is `g g > {t} > H`, the top triangle.
`VBF > H` is vector boson fusion: two quark lines each give off a boson and go on forward, and
the two bosons meet where the Higgs comes out. `VBS` is the same with bosons coming out instead,
through the quartic vertex (`VBS > W+ W+`) or through a Higgs between two three-point vertices
(`VBS > H > W+ W-`). `VBF(W)` and `VBF(Z)` name the bosons; they are `V` otherwise. With three or more made, they
come off a boson exchanged between the two, top to bottom: `VBS(W) > W+ H W-` is the two bosons
scattering, going on as W+ and W-, with a Higgs given off at a three-point vertex between them.
Name what the two exchange after the boson: `VBS(W, H) > W+ H W-` exchanges a Higgs, so the
Higgs given off in the middle comes from the Higgs self-coupling. What a scattering makes goes on
forward, fanning a little. Everything
after the mode is the usual syntax: lines passed through, loops, decays.

```feynman
VBS(W) > H > W+ W-
---
VBS(W) > W+ H W-
---
VBS(W, H) > W+ H W-
---
VBF > H
H > b b~
```

## Examples

### Gluino pair

```feynman
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```

````markdown
```feynman
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```
````

### Higgs to four muons

```feynman
p p > H
H > Z Z
Z > mu+ mu-
```

````markdown
```feynman
p p > H
H > Z Z
Z > mu+ mu-
```
````

### Chargino and neutralino

```feynman
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > Z neutralino1
```

````markdown
```feynman
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > Z neutralino1
```
````

### Stop pair

```feynman
p p > stop stop
stop > t neutralino1
t > b W+
```

````markdown
```feynman
p p > stop stop
stop > t neutralino1
t > b W+
```
````

### Top decay

```feynman
t > b W+(> mu+ nu)
```

````markdown
```feynman
t > b W+(> mu+ nu)
```
````

## Decaying only some of them

A decay line, `gluino > q q neutralino1`, decays **every** particle of that name. To decay just
one, write its decay in brackets right after it; the others stay undecayed lines:

```feynman
p p > gluino(> q q neutralino1) gluino
```

````markdown
```feynman
p p > gluino(> q q neutralino1) gluino
```
````

Particles of other names are left alone: with `p p > t tbar`, the line `t > b W+` decays the top
and not the antitop.

## Detector objects in a process

Detector objects are particle names like any other, so they go straight into a process: `bjet`,
`j`, `LRJ` (a large-R jet), `MET` and the rest of [Detector objects](objects.md). Write the
object where the particle would be, or as what a particle decays to:

```feynman
p p > t tbar
t > bjet W+(> LRJ)
tbar > bbar W-(> e- nu~)
```

````markdown
```feynman
p p > t tbar
t > bjet W+(> LRJ)
tbar > bbar W-(> e- nu~)
```
````

## When the same particle decays differently

### Gluinos decaying differently

```feynman
p p > gluino gluino
gluino > q q neutralino2
gluino > q q chargino+
neutralino2 > Z neutralino1
chargino+ > W+ neutralino1
```

````markdown
```feynman
p p > gluino gluino
gluino > q q neutralino2
gluino > q q chargino+
neutralino2 > Z neutralino1
chargino+ > W+ neutralino1
```
````

### ZZ to two electrons and two muons

```feynman
p p > Z Z
Z > e+ e-
Z > mu+ mu-
```

````markdown
```feynman
p p > Z Z
Z > e+ e-
Z > mu+ mu-
```
````

### Top pair, one W to leptons, one to quarks

```feynman
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```

````markdown
```feynman
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```
````

### Neutralinos to Z and to H

```feynman
p p > neutralino2 neutralino2
neutralino2 > Z neutralino1
neutralino2 > H neutralino1
```

````markdown
```feynman
p p > neutralino2 neutralino2
neutralino2 > Z neutralino1
neutralino2 > H neutralino1
```
````

### Each gluino decayed on the spot

```feynman
p p > gluino(> q q neutralino1) gluino(> t tbar neutralino1)
```

````markdown
```feynman
p p > gluino(> q q neutralino1) gluino(> t tbar neutralino1)
```
````

### Stops decaying differently

```feynman
p p > stop stop
stop > t neutralino1
stop > b chargino+(> W+ neutralino1)
t > b W+
```

````markdown
```feynman
p p > stop stop
stop > t neutralino1
stop > b chargino+(> W+ neutralino1)
t > b W+
```
````
