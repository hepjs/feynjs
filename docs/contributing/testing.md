# Testing

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
