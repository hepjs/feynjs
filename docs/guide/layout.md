---
tags:
  - force layout
  - layout engine
  - vertex placement
  - positioning
  - pin a vertex
  - v1
  - v2
  - TikZ-Feynman
---

# Layout

***How feynjs places every vertex, which of its two layout engines to use, and how to steer a diagram by ordering legs, bending lines or pinning vertices.***

```feynman
p p > stop stop~
stop > t neutralino1
stop~ > t~ neutralino1
t > b W+
t~ > b~ W-
```

```text
p p > stop stop~
stop > t neutralino1
stop~ > t~ neutralino1
t > b W+
t~ > b~ W-
```

feynjs places every vertex itself. This page explains how it does that, and how to steer it when
you want something different.

## The conventions it follows

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

## Two engines

The syntax doesn't choose the layout: a process line is turned into ordinary edges first, so both
notations go through the same engine. The engine is chosen by a switch.

**v2, forces** (the default)
:   Treats the diagram as a small physical system. Lines want their natural length, the lines at a
    vertex want to split the turn evenly, time wants to run left to right, and unrelated parts keep
    clear of each other. It finds the balance, then snaps loops, arcs and vacuum pairs into their
    exact shapes. It was reviewed figure by figure against some 500 published diagrams and is
    frozen: its layouts change only when a change is reviewed and approved again (see
    [Testing](../contributing/testing.md#the-validation-set-and-the-approved-layouts)).

**v1, rules** (`layout: v1`)
:   Places vertices in columns by time, then settles their heights with a list of named rules:
    forks open at set angles, cascades arc, loops sit over their lines. It is fast and
    predictable, and kept as it was. Every rule is listed in [Layout rules](../reference/layout-rules.md).

The same source in each:

```feynman
--- v2 (default)
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
--- v1
layout: v1
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```

```text
layout: v1        <- add this line for the rule engine; leave it out for v2
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```

To use v1 for every diagram, set it in the theme: `render(source, { theme: { engine: "v1" } })`.

## Steering it

From lightest touch to heaviest:

1. **Order the legs.** `in:` and `out:` fix the order of the external legs from top to bottom,
   even if that makes lines cross ([Edges](syntax.md#what-comes-in-what-goes-out)).
2. **Add a hidden line.** `a -- [hidden] b` ties two vertices together without drawing anything.
3. **Bend a line.** `half left`, `quarter right`, `bend=30` curve one line without moving its ends.
4. **Pin a vertex.** `v at (2, 1)` fixes `v` in place, in propagator lengths with y up. The rest
   of the diagram is still laid out around it.
5. **Tune the rules.** Every angle, length and weight is a [theme setting](../reference/theme.md),
   so you can change one for a whole page, or for one diagram:

```js
// v1: narrower forks
feynjs.render(source, { theme: { layout: { branchAngle: 22 } } });
// v2: longer propagators
feynjs.render(source, { theme: { forces: { lineLength: 1.2 } } });
```

## Measuring a layout

`feynjs.measure(source)` scores a layout without anyone looking at it: crossings, crowded
vertices and labels, the smallest angle at a vertex, stub lines. See
[Checking diagrams](tools.md#measure).
