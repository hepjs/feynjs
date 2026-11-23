---
tags:
  - npm test
  - unit tests
  - regression
  - layout baseline
  - approve layouts
  - validation
  - typecheck
---

# Testing

***How feynjs is tested: the unit tests, the approved layouts that fail a test when a diagram
moves, and how to approve a layout change on purpose.***

One of the layouts the test holds in place: the gluon-fusion triangle to HH from HDBS-2018-40
(Fig. 1a), as `validation/atlas/HDBS-2018-40/fig_01a.feyn`.

```feynman
% HDBS-2018-40 fig_01a: ggF HH triangle diagram with the trilinear coupling lambda_HHH marked
layout: v2
in: i1 i2
out: f1 f2
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
k [dot, color=#ee325a, label=\lambda_{HHH}]
t3 -- [H, label'=H] k
k -- f1 [H]
k -- f2 [H]
```

```text
% HDBS-2018-40 fig_01a: ggF HH triangle diagram with the trilinear coupling lambda_HHH marked
layout: v2
in: i1 i2
out: f1 f2
i1 [g] -- t1
i2 [g] -- t2
t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
k [dot, color=#ee325a, label=\lambda_{HHH}]
t3 -- [H, label'=H] k
k -- f1 [H]
k -- f2 [H]
```

If a change moves any of its points by more than a twentieth of a line length, `npm test` fails
and names it.

```bash
npm run typecheck     # TypeScript, no output
npm run build         # dist/feynjs.mjs, dist/feynjs.min.js, docs/javascripts/feynjs.min.js
npm test              # every test, including the approved layouts
```

## The tests

`test/feynjs.test.ts` checks the language and the drawing: each switch and option parses, each
example draws without errors, colour flow, hadrons, nuclei, loops, production modes, notes, and
the TikZ export. A new feature comes with a test beside the others.

## The validation set and the approved layouts

`validation/atlas/` holds Feynman diagrams from ATLAS public results, transcribed as feynjs
source (no images), with `validation/manifest.jsonl` naming the paper and figure of each. With
`examples/`, they are the layouts feynjs is held to.

`validation/layout-baseline.json` records each of them as laid out at the last approval: where
each of its points lies. `test/layout-baseline.test.ts` fails if any moves, listing which. When a
change to the layout is meant, look at the diagrams it moved (against their papers, one at a
time), then approve the new layouts:

```bash
npm run build && npm run approve-layouts
```

and say in the pull request which moved and why.
