---
name: feynjs
description: Write, check and render Feynman diagrams with feynjs (text in, SVG or TikZ-Feynman out). Use when asked to draw a Feynman diagram, put one in Markdown, a web page or a LaTeX document, convert a process ("p p > t tbar") into a diagram, or fix a diagram's layout.
---

# Feynman diagrams with feynjs

feynjs turns a few lines of text into a laid-out Feynman diagram: SVG for the web and Markdown,
TikZ-Feynman code for LaTeX. The same source draws the same diagram on every machine.

## Write the source

Two notations; both may be mixed in one diagram.

**A process, as in MadGraph** (shortest; feynjs makes the vertices):
```text
p p > t tbar
t > b W+(> e+ nu)        a decay rule; (> ...) decays one particle on the spot
tbar > bbar W-(> q qbar)
```
`p p` is two proton beams into a blob; a particle between two `>` is a propagator
(`d dbar > g > t tbar`). Particle names are feynjs's own: `tbar` (not `t~`), `gluino` (not `go`),
`e-`, `mu+`, `nu`, `gamma`, `Z`, `W+`, `H`, `g`, `neutralino1`, `chargino+`.

**Edges, as in TikZ-Feynman** (full control):
```text
i1 [e-] -- a -- i2 [e+]          legs: names starting i enter, f leave
a -- [gamma] b                   a line: a particle name or a style (fermion, photon, gluon, scalar, boson, ghost)
f1 [mu-] -- b -- f2 [mu+]
```
- Labels are TeX: `f1 [\tilde\chi^0_1]`, `a -- [photon, label=\gamma^*] b`; `label'=` for the other side.
- Order legs top to bottom: `in: i1 i2`, `out: f2 f1`.
- A loop is just a closed path (`a -- [fermion] c -- [fermion] b -- [fermion] a`); two lines between
  the same points bow into a bubble; `half left` / `bend left=30` curve a line.
- Shapes: `v [dot]`, `v [blob]`, `v [crossed dot]`; a coupling: `v [dot, label=\kappa_V]`.
- Hadrons: `baryon: n = u1 d1 d2`, `meson: J/\psi = c2 cbar`, `hadron: B^0 = d1 b [brace]`.

**Switches** (a line each): `layout: manual` with `v at (x, y)` pins (propagator lengths, y up);
`layout: grid` (`grid: iso` for 60 degrees); `final plane: on`; `inline: a` (point a on the text
baseline); `scale: 0.5`; `title: ...`.

## Check before showing

```sh
feynjs check diagram.feyn      # fermion lines that do not pair up or flow through
feynjs measure diagram.feyn    # crossings, crowded labels, smallest angle: "problems" should be []
feynjs describe diagram.feyn   # the process as feynjs understood it (JSON)
feynjs render diagram.feyn > diagram.svg
```
If `measure` reports problems (for example "two lines leave b only 0 degrees apart"), steer the
layout, lightest touch first: order the legs with `in:`/`out:`; add `a -- [hidden] b`; then pin one
or two vertices with `layout: manual` and `v at (x, y)`. Look at the SVG before handing it over.

## Put it where it is needed

- **Markdown / web page**: a ```` ```feynman ```` code block, with the feynjs script tag on the page
  (MkDocs, Zensical, GitHub Pages, Hugo, Jekyll; Obsidian and Notion plugins exist).
- **LaTeX** (`integrations/latex/feynjs.sty`):
  ```latex
  \usepackage{feynjs}
  \begin{feynjs}
  p p > t tbar
  \end{feynjs}
  ```
  Then run `feynjs cache .` and LaTeX again (or compile with `--shell-escape`). Upload the
  `*-feynjs-*.tex` files to Overleaf, arXiv or a journal: they need only TikZ-Feynman, compile with
  pdfLaTeX, and convert to arXiv's HTML.
- **A standalone TikZ file**: `feynjs tikz diagram.feyn > diagram.tex` (`--unit 1.4` cm per
  propagator, `--picture` for just the tikzpicture). It looks like the web page.

## Pitfalls

- A name feynjs does not know is drawn as a plain line with that label; `feynjs check` and the
  error's "did you mean ...?" catch misspellings.
- Arrows follow the written direction (`a -- [fermion] b` points a to b); antiparticle legs
  (`i2 [e+]`) already know theirs.
- A loop on a quark inside a hadron diagram may need two pins (`layout: manual`) to open up.
- Full syntax: docs/guide/syntax.md, processes.md, loops-hadrons.md, layout.md.
