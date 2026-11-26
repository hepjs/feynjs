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
[from a shell](../get-started/cli.md) too.

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

The diagram in plain English, as a physicist would summarise it, for alt text: a summary first
(what kind of picture it is and what it shows), then the details, as guidance on accessible
figures asks ([ACM DIS 2023](https://dis.acm.org/2023/creating-accessible-figures-and-tables/)).
Every SVG feynjs draws, a view as much as a diagram, carries the summary as its accessible name
(`aria-label`) and the details in its `<desc>`, which `aria-describedby` points at, so a screen
reader announces the one and reads the other on request; on this site the download menu has
*Copy description*.

```js
feynjs.explain(`
  p p > t tbar
  t > b W+(> e+ nu)
  tbar > bbar W-(> q qbar)
`);
```

> Feynman diagram of a proton–proton collision producing a top-quark pair. A proton–proton
> collision produces a top-quark pair, each top quark decaying into a bottom quark and a W boson,
> with one W boson decaying leptonically, to a positron and a neutrino, and the other hadronically.
> The final state is a bottom-quark pair, a positron, a quark pair and a neutrino.

The summary names the picture and the process in words, never in the source's symbols, which a
screen reader would spell out ("e minus e plus dash greater than..."); a diagram with loops says
so ("One-loop Feynman diagram of two gluons to a Higgs boson"). In the SVG, the details end with
how the drawing reads: "Time runs from left to right." Line styles and colours are not described,
but what they stand for, the particles, is.

A production followed by decays is one sentence: a particle and its antiparticle are a pair,
decays that happen alike are told once ("each"), and a W or Z that decays differently on two
branches is told by its mode (leptonically, hadronically, invisibly). Any other diagram, with a
loop, an exchange or radiation, is told step by step: what comes in and goes out, then each
interaction in time order, a loop as one step ("...making a Higgs boson through a loop of three top
quarks"). Hadrons and marked couplings follow.

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

Use it to index a collection of diagrams by process. For alt text, use [explain](#explain): every
diagram's `aria-label` and `<desc>` come from it.

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
