---
tags:
  - TikZ-Feynman
  - LaTeX
  - "momentum'"
  - edge label
  - TikZ export
  - migration
---

# TikZ-Feynman

<div class="grid" markdown>

```latex title="TikZ-Feynman"
\feynmandiagram [horizontal=a to b] {
  i1 [particle=\(e^-\)] -- [fermion] a,
  a -- [fermion] i2 [particle=\(e^+\)],
  a -- [photon, edge label=\(\gamma\)] b,
  f1 [particle=\(\mu^+\)] -- [fermion] b,
  b -- [fermion] f2 [particle=\(\mu^-\)],
};
```

```text title="feynjs"
horizontal: a to b
i1 [particle=\(e^-\)] -- [fermion] a
a -- [fermion] i2 [particle=\(e^+\)]
a -- [photon, edge label=\(\gamma\)] b
f1 [particle=\(\mu^+\)] -- [fermion] b
b -- [fermion] f2 [particle=\(\mu^-\)]
```

</div>

```feynman
horizontal: a to b
i1 [particle=\(e^-\)] -- [fermion] a
a -- [fermion] i2 [particle=\(e^+\)]
a -- [photon, edge label=\(\gamma\)] b
f1 [particle=\(\mu^+\)] -- [fermion] b
b -- [fermion] f2 [particle=\(\mu^-\)]
```

Three changes: the `\feynmandiagram` wrapper goes, `[horizontal=a to b]` becomes a line of its
own, and a new line ends a statement, so a chain is written on one line. Commas still end
statements too. Labels keep their `\(...\)`. feynjs lays the diagram out itself, as TikZ-Feynman's automatic layout does.

With feynjs's particle names, the same diagram is shorter. A name sets the line, the arrow and
the label:

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

## The keys feynjs takes

| TikZ-Feynman | feynjs | Notes |
|---|---|---|
| `\feynmandiagram [...] { ... };`, `\diagram* { ... }` | the body alone, in a `feynman` block | options become lines: see below |
| `a -- [fermion] b` and every other line style | the same | `fermion`, `anti fermion`, `photon`, `boson`, `charged boson`, `gluon`, `scalar`, `charged scalar`, `ghost`, `majorana`, `plain` and the `anti` forms; see [Lines and particles](../guide/lines.md) |
| `[particle=\(e^-\)]` | the same, or `[e-]` | a feynjs particle name also styles the leg's line |
| `edge label=`, `edge label'=` | the same, or `label=`, `label'=` | `'` puts the label on the right of the line's direction |
| `momentum=`, `momentum'=`, `reversed momentum=`, `reversed momentum'=` | the same; `rmomentum` too | see [Labels and notes](../guide/labels.md) |
| `insertion=0.5` | the same | as many as wanted on one line |
| `with arrow=0.3`, `with reversed arrow=0.7` | the same | besides any arrow the line has |
| `half left`, `quarter right`, `bend left`, `bend right` | the same | |
| `bend left=40`, `bend right=40` | `bend=40`, `bend=-40` | |
| `out=-45, in=180, looseness=1.5` | the same | degrees counter-clockwise from the right |
| `[dot]`, `[empty dot]`, `[square dot]`, `[crossed dot]`, `[blob]` | the same | more shapes in [Vertices, blobs and nuclei](../guide/vertices.md) |
| `\vertex [right=of a] (b);` | `b [right=of a]` | also `above left=1.5 of a`, `above right=1 and 2 of a` |
| `\vertex (a) at (0, 0);` | `a at (0, 0)` | in propagator lengths, y up, not cm; with `layout: manual` it stays exactly there ([by hand](../guide/layout.md#placing-points-by-hand)) |
| `horizontal=a to b`, `vertical=a to b`, `horizontal'=a to b`, `vertical'=a to b` | `horizontal: a to b`, `vertical: a to b`, `horizontal': a to b`, `vertical': a to b` | a line of its own; the primed forms mirror the diagram too |
| `every photon/.style={blue}` | `every photon: color=blue` | also `every fermion:`, `every dot:`, `every edge:`, `every vertex:` |
| `baseline=(a.base)` | `inline: a` | a diagram in a line of text |
| `[photon, red]` | the same, for `red`, `blue`, `green`, `gray` | any other colour as `color=...` |
| `%` comment | the same; `#` and `//` too | |

The full list of options is in [Syntax at a glance](../reference/index.md). Several of these keys
in one diagram:

```feynman
every photon: color=blue
vertical: a to b
i1 [e-] -- [fermion, momentum=p_1] a -- [fermion, momentum'=p_2] i2 [e+]
a -- [photon, reversed momentum=k, insertion=0.5] b
f1 [mu-] -- [fermion, with arrow=0.25, with arrow=0.75, no arrow] b -- f2 [mu+]
```

```text
every photon: color=blue
vertical: a to b
i1 [e-] -- [fermion, momentum=p_1] a -- [fermion, momentum'=p_2] i2 [e+]
a -- [photon, reversed momentum=k, insertion=0.5] b
f1 [mu-] -- [fermion, with arrow=0.25, with arrow=0.75, no arrow] b -- f2 [mu+]
```

## What feynjs doesn't take

- **The LaTeX around the diagram:** `\feynmandiagram`, `\begin{feynman}`, `\diagram*`,
  `\vertex`. Write the body alone.
- **Groups of vertices,** `{i1, i2} -- a`. Write one chain for each.
- **Other TikZ keys** on a line, such as `thick`, `->` or `opacity`. feynjs stops with an error
  naming the key. Use `heavy` for a thick line and `color=` for a colour.
- **TikZ-Feynman's layout keys** (`spring layout`, `layered layout` and the rest). feynjs has
  [layout engines](../guide/layout.md) of its own: the force layout, a grid, and manual placement.

## Back to TikZ-Feynman

feynjs writes any diagram out as TikZ-Feynman code, with every vertex placed where feynjs put it,
ready for `pdflatex` or `lualatex`:

```sh
feynjs tikz diagram.feyn > diagram.tex && pdflatex diagram.tex
```

From JavaScript it is `toTikz(source)`. The diagram at the top of this page comes out as this
`feynman` environment, inside a complete document:

```latex
\begin{feynman}
  \vertex (i1) at (0.44, 1.10) {\(e^-\)};
  \vertex (a) at (1.60, 0.00);
  \vertex (i2) at (0.44, -1.10) {\(e^+\)};
  \vertex (b) at (3.20, 0.00);
  \vertex (f1) at (4.36, 1.10) {\(\mu^+\)};
  \vertex (f2) at (4.36, -1.10) {\(\mu^-\)};
  \diagram*{
    (i1) -- [fermion] (a),
    (a) -- [fermion] (i2),
    (a) -- [photon, edge label={\(\gamma\)}] (b),
    (f1) -- [fermion] (b),
    (b) -- [fermion] (f2),
  };
\end{feynman}
```

Plain TikZ-Feynman has no jets, hadron braces or SUSY lines drawn over a wave, so those come out
as the nearest TikZ-Feynman lines. The options, standalone documents and the propagator length
are in [Exporting](../guide/styling.md#exporting) and [toTikz](../reference/api.md#totikz).
