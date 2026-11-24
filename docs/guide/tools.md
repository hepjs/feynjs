---
tags:
  - check
  - lint
  - validation
  - fermion flow
  - explain
  - describe
  - measure
  - alt text
---

# Checking diagrams

```feynman
i1 [e-] -- a -- i2 [e-]
a -- [gamma] b
f1 [mu-] -- b -- f2
```

```text
i1 [e-] -- a -- i2 [e-]
a -- [gamma] b
f1 [mu-] -- b -- f2
```

```console
$ feynjs check wrong.feyn
error: fermion arrows do not flow through "a": 2 arrive and 0 leave  [fermion-flow]
warning: external leg "f2" has no particle label  [unlabelled-leg]
```

A drawing can look right and still be wrong. feynjs reads a diagram as well as drawing it, and
three tools report what it finds. Each takes the same source as `render`, and each runs
[from a shell](../reference/cli.md) too.

## check

A fast structural lint, well under a millisecond per diagram. It reports:

- fermion lines that don't pair up at a vertex;
- fermion arrows that don't flow through a vertex;
- vertices joined to nothing;
- external legs with no particle name.

```js
feynjs.check(`
  i1 [e-] -- a -- i2 [e-]
  a -- [gamma] b
  f1 [mu-] -- b -- f2
`);
```

```json
[
  { "severity": "error", "rule": "fermion-flow", "vertex": "a",
    "message": "fermion arrows do not flow through \"a\": 2 arrive and 0 leave" },
  { "severity": "warning", "rule": "unlabelled-leg", "vertex": "f2",
    "message": "external leg \"f2\" has no particle label" }
]
```

Two electrons can't annihilate into a photon; `check` notices. It doesn't know charges or which
vertices a model allows: it checks the structure, not the physics. `feynjs check diagram.feyn`
exits with status 1 when it finds an error, so it can guard a build.

## explain

The diagram in plain English: what comes in and goes out, each interaction in time order, loops,
hadrons and marked couplings. Every SVG feynjs draws carries it in its `<desc>`, so screen readers
read it, and on this site the download menu has *Copy description*, for alt text.

```js
feynjs.explain(`
  p p > gluino gluino
  gluino > q q neutralino2
  neutralino2 > Z neutralino1
`);
```

> Two protons come in; four quarks, two Z bosons and two lightest neutralinos go out. The two
> protons collide, producing two gluinos. Each gluino decays into two quarks and a second
> neutralino. Each second neutralino decays into a lightest neutralino and a Z boson.

A loop is told as one step ("...making a Higgs boson through a loop of three top quarks"), and the
same decay told twice is told once, for each.

## describe

The diagram read back as data: what comes in and goes out, the propagators, the vertices and the
lines meeting at each, the number of loops, and the process in one line.

```js
feynjs.describe(`
  i1 [g] -- a
  i2 [g] -- b
  a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
  c -- [H] f1
`);
```

```json
{
  "process": "g g -> H",
  "incoming": ["g", "g"],
  "outgoing": ["H"],
  "propagators": [
    { "between": ["a", "c"], "kind": "fermion" },
    { "between": ["c", "b"], "kind": "fermion" },
    { "between": ["b", "a"], "kind": "fermion", "label": "t" }
  ],
  "vertices": [
    { "id": "a", "lines": ["gluon", "fermion", "fermion"] },
    { "id": "b", "lines": ["gluon", "fermion", "fermion"] },
    { "id": "c", "lines": ["fermion", "fermion", "scalar"] }
  ],
  "loops": 1,
  "pieces": 1,
  "hadrons": []
}
```

Use it to index a collection of diagrams by process, or to write alt text. Every diagram's
`aria-label` already comes from it.

## measure

A score for the layout, so a layout can be checked without looking at it:

| Field | Meaning |
|---|---|
| `crossings` | pairs of lines that cross where neither shares a vertex with the other |
| `crowdedVertices` | pairs of vertices closer than a label is tall |
| `crowdedLabels` | labels sitting on a line or on another label |
| `smallestAngle` | the smallest angle between two lines at one vertex, in degrees |
| `stubs` | lines shorter than a quarter of a propagator |
| `aspect` | width over height |
| `problems` | one readable line per problem |

```js
feynjs.measure(source);
// { crossings: 0, crowdedVertices: 0, crowdedLabels: 0, smallestAngle: 52.4, stubs: 0,
//   aspect: 2.6, problems: [] }
```

`measure` takes theme overrides as a second argument, so you can see how a setting changes the
score.
