# Contributing to feynjs

Thank you for helping. The full guide is on the docs site, under Contributing
(`docs/contributing/`). This is the short version.

## How a diagram is made

```
source text ──parse──▶ Diagram ──layout──▶ positions ──render──▶ SVG
```

| Folder | What it does | Start here |
|---|---|---|
| `src/parse/` | Text to a `Diagram`: vertices, lines, options; the process syntax (`p p > t t~`), loops (`{t}`) and production modes (`ggF`, `VBF`) | `parse.ts`, `chains.ts` |
| `src/particles/` | Names to line styles, labels and properties (`e-`, `W+`, `gluino`, `t~`) | `registry.ts` |
| `src/engines/forces/` | The default layout: forces balanced by a solver; the grid engine snaps its result | `layout.ts`, `forces.ts` |
| `src/engines/rules/` | The older rule-based layout (v1), frozen | `layout.ts` |
| `src/render/` | Positions to SVG: lines, vertices, labels, hadrons, nuclei, colour flow, notes | `render.ts` |
| `src/views/` | Other ways to see a diagram: the kinematic (event) view, the lattice view | `kinematic.ts` |
| `src/label/` | The TeX-subset label renderer | `label.ts` |
| `src/tools/` | `check`, `describe`, `explain` and the TikZ export | `prepare.ts` |
| `src/theme.ts` | **Every default number and colour** | |
| `src/model.ts` | The data types shared by all of the above | |

## Making a change

1. Write the smallest diagram that shows the problem or the feature, and keep it: it becomes a
   test, or an example in `examples/`.
2. Fix it with a general rule, not a case for one figure. A rule that helps one diagram usually
   moves others: `npm test` lists every layout that moved.
3. Look at what moved, against the papers the diagrams come from, one diagram at a time. If the
   change is meant, approve the new layouts (`npm run build && npm run approve-layouts`) and say
   in the pull request which moved and why.
4. Describe new syntax in `docs/guide/` and `docs/reference/`, and add a line to `CHANGELOG.md`.

```bash
npm ci
npm run typecheck && npm run build && npm test
npm run docs          # the site, into site/ (needs `pip install zensical`)
```

## Conventions

- Names say what things are; comments say why, in plain words.
- Numbers belong in `src/theme.ts`, not in the code that uses them.
- A diagram that draws badly is a bug: open an issue with its source and, if you can, the figure
  it should look like.
