---
tags:
  - pull request
  - bug report
  - development
  - conventions
  - code style
  - open source
  - install
  - clone
  - npm
  - Node
  - esbuild
  - Zensical
  - repository
  - npm test
  - unit tests
  - regression
  - layout baseline
  - approve layouts
  - validation
  - typecheck
  - documentation
  - markdown
  - feynman block
  - writing pages
  - preview
  - logo
---

# Contributing

A diagram from a paper, written as source and drawn by feynjs. A report of one that draws badly
needs the same two things, and the figure from the paper.

```feynman
% ATLAS-CONF-2011-076 Fig. 1, written with defaults only
q1 [q] -- a -- [squark] c
q2 [qbar] -- b -- [squark] d
a -- [gluino] b
c -- qt [q]
c -- [plain, label=\tilde{N}_1] e
e -- fd1 [f_d]
e -- [photon, label=\gamma_d] g
g -- l1 [l+]
g -- l2 [l-]
d -- [plain, label=\tilde{N}_1] f
f -- [photon, label=\gamma_d] h
h -- l3 [l+]
h -- l4 [l-]
f -- fd2 [f_d]
d -- qb [q]
```

```text
% ATLAS-CONF-2011-076 Fig. 1, written with defaults only
q1 [q] -- a -- [squark] c
q2 [qbar] -- b -- [squark] d
a -- [gluino] b
c -- qt [q]
c -- [plain, label=\tilde{N}_1] e
e -- fd1 [f_d]
e -- [photon, label=\gamma_d] g
g -- l1 [l+]
g -- l2 [l-]
d -- [plain, label=\tilde{N}_1] f
f -- [photon, label=\gamma_d] h
h -- l3 [l+]
h -- l4 [l-]
f -- fd2 [f_d]
d -- qb [q]
```

feynjs is MIT-licensed and welcomes help from physicists and programmers alike. You don't need to
know the layout code to make a difference: a diagram that draws badly, with a picture of how
papers draw it, is one of the most useful things you can send.

## Ways to help

**Report a diagram that draws badly.**
:   Include the source, a screenshot, and a figure from a paper showing how it should look. Every
    such report becomes a regression case.

**Add particles.**
:   A model's particles are one line each in the registry. See [Extending feynjs](internals.md#add-a-particle).

**Improve the layout.**
:   Pick a diagram from the corpus follow-up list and make it match the reference. See
    [Architecture](internals.md#architecture) and [Testing](#testing).

**Improve these docs.**
:   Every page is markdown in `docs/`; diagrams are ```` ```feynman ```` blocks. See [The docs site](#the-docs-site).

**Grow the corpus.**
:   Reproduce a published diagram in TikZ-Feynman with hand-placed vertices. It becomes part of the
    reference the defaults are fitted to. See [Testing](#the-validation-set-and-the-approved-layouts).

## How a change goes in

1. **Set up** the repository: [Development setup](#development-setup).
2. **Make the change** on a branch, following the conventions below.
3. **Check it**: `npm test && npm run typecheck`, and for anything visual, the preview sheet before
   and after ([Testing](#testing)).
4. **Open a pull request** that says what changed and why, with the before-and-after sheet for a
   layout or style change, and the corpus diagrams or papers that show the convention you followed.

## Conventions

- **Name functions for what they do** (`labelExternalLeg`, `spreadKeepingOrder`). A module's
  top-level function reads as a list of named steps.
- **No magic numbers.** A size, gap, angle or colour belongs in `src/theme.ts`, with a comment
  saying what it controls, so users can override it and the [theme reference](theme.md)
  documents it.
- **Defaults come from practice.** A layout or style default should match how the diagram is
  drawn in published papers. Point to the examples.
- **No runtime dependencies.** The output is plain SVG that works on its own.
- **Write for physicists.** Error messages and docs use the words of the field and plain English.

## Where to start

| If you want to... | Start in |
|---|---|
| change how the source is read | `src/parse/parse.ts`, `src/parse/chains.ts` |
| add or rename particles | `src/particles/registry.ts` |
| change where things go | `src/engines/rules/layout.ts` (v1) or `src/engines/forces/forces.ts` (v2) |
| change how things look | `src/render/`, `src/theme.ts` |
| change labels | `src/label/label.ts` |
| change `check`, `describe`, `toTikz` | `src/tools/` |

## Development setup

```sh
git clone https://github.com/hepjs/feynjs.git && cd feynjs
npm install
npm test
```

To see that the checkout draws, build the library and render an example from the command line:

```sh
npm run build
node bin/feynjs.mjs render examples/s-channel.feyn > s-channel.svg
```

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

You need Node (24 is used in development) and npm. The docs site also needs
[Zensical](https://zensical.org) (`pip install zensical`). The corpus tools need Python 3 and a
TeX installation with TikZ-Feynman.

### Commands

| Command | What it does |
|---|---|
| `npm test` | the unit tests (`node --test`, TypeScript run directly) |
| `npm run typecheck` | `tsc --noEmit` over everything |
| `npm run build` | `dist/feynjs.mjs`, `dist/feynjs.min.js` and the docs' copy, with esbuild |
| `node bin/feynjs.mjs render x.feyn` | the command line, from the checkout |
| `npm run docs` | build the library, then the docs site into `site/` |
| `zensical serve` | the docs site with live reload, at <http://127.0.0.1:8000> |

### Layout of the repository

| Path | What is there |
|---|---|
| `src/` | the library ([Architecture](internals.md#architecture)) |
| `test/` | unit tests |
| `examples/` | example diagrams, `.feyn` files: the gallery and the preview sheet |
| `validation/` | diagrams from ATLAS papers transcribed as feynjs source, and the approved layouts |
| `scripts/` | the build, and approving the layout baseline |
| `docs/` | this site |
| `bin/` | the command line |
| `integrations/` | the Obsidian plugin |

TikZ-Feynman is GPL-licensed. Its numbers and conventions are a reference; don't copy its code.

## Testing

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

### The tests

`test/feynjs.test.ts` checks the language and the drawing: each switch and option parses, each
example draws without errors, colour flow, hadrons, nuclei, loops, production modes, notes, and
the TikZ export. A new feature comes with a test beside the others.

### The validation set and the approved layouts

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

## The docs site

A page draws a diagram from a fenced block. This is what you write:

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```
````

and this is what the page shows:

```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```

This site is built with [Zensical](https://zensical.org) from the markdown in `docs/`, configured
in `zensical.toml`.

```sh
npm run build     # the library, including docs/javascripts/feynjs.min.js
zensical serve    # live preview at http://127.0.0.1:8000
zensical build    # the static site, into site/
```

The site draws its diagrams with the released library from jsDelivr (`extra_javascript` in
`zensical.toml`), so it shows what users of the release get. To preview a change to the library
before it is released, point that line at `javascripts/feynjs.min.js`, the copy `npm run build`
writes, and switch it back before committing. That copy is also published with the site, at
`https://hepjs.github.io/feynjs/javascripts/feynjs.min.js`.

### Writing pages

- **Markdown only.** Pages use markdown and the extensions configured in `zensical.toml`
  (admonitions, tabs, definition lists, tables). No raw HTML.
- **Diagrams are ```` ```feynman ```` blocks**, drawn in the browser by the library itself. Show
  the source with every diagram, in a ```` ```text ```` block, or a ```` ````markdown ```` block
  with the fence included when the point is how to write it in a page.
- **Each example should work when copied.** Don't rely on anything the reader can't see.
- **Write plainly.** Short sentences, the words physicists use, no marketing.

### Pages kept by hand

Three pages list what is in the code. For now they are kept by hand in this repository:

| Page | Lists |
|---|---|
| `examples/gallery.md` | the diagrams in `examples/*.feyn` |
| `reference/particles.md` | the particles in `src/particles/registry.ts` |
| `reference/theme.md` | the settings in `src/theme.ts` |

Adding a particle or a theme setting means updating its page too. So does adding an example to
`examples/`.

### How diagrams get drawn

`zensical.toml` registers a custom fence, so a `feynman` block becomes `<div class="feynman">`.
`docs/javascripts/feynjs-init.js` calls `feynjs.run` after every page load (including instant
navigation). It also puts the site's name in the header in its brand colours. `docs/stylesheets/feynjs.css` loads the label font and sets the diagram
colours for light and dark. `docs/stylesheets/theme.css` is the site's look.

### The brand

The logo files are in `docs/brand/logo/`: the mark, the wordmark and the lockups, each for light
and dark backgrounds, with the favicon and the social card. The site uses `mark-red.svg` as its
logo and `favicon.svg` as its favicon, both set in `zensical.toml`.
