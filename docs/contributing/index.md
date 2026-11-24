---
tags:
  - pull request
  - bug report
  - development
  - conventions
  - code style
  - open source
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
:   A model's particles are one line each in the registry. See [Extending feynjs](extending.md#add-a-particle).

**Improve the layout.**
:   Pick a diagram from the corpus follow-up list and make it match the reference. See
    [Architecture](architecture.md) and [Testing](testing.md).

**Improve these docs.**
:   Every page is markdown in `docs/`; diagrams are ```` ```feynman ```` blocks. See [The docs site](docs.md).

**Grow the corpus.**
:   Reproduce a published diagram in TikZ-Feynman with hand-placed vertices. It becomes part of the
    reference the defaults are fitted to. See [Testing](testing.md#the-validation-set-and-the-approved-layouts).

## How a change goes in

1. **Set up** the repository: [Development setup](setup.md).
2. **Make the change** on a branch, following the conventions below.
3. **Check it**: `npm test && npm run typecheck`, and for anything visual, the preview sheet before
   and after ([Testing](testing.md)).
4. **Open a pull request** that says what changed and why, with the before-and-after sheet for a
   layout or style change, and the corpus diagrams or papers that show the convention you followed.

## Conventions

- **Name functions for what they do** (`labelExternalLeg`, `spreadKeepingOrder`). A module's
  top-level function reads as a list of named steps.
- **No magic numbers.** A size, gap, angle or colour belongs in `src/theme.ts`, with a comment
  saying what it controls, so users can override it and the [theme reference](../reference/theme.md)
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
