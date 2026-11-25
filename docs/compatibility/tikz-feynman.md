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

Or paste the picture as it is. feynjs reads `\feynmandiagram [...] { ... };` and the
`\begin{feynman}` environment (in a `tikzpicture` or not), with its `\vertex` and `\diagram*`
statements, and draws what the TikZ means:

```feynman
\begin{feynman}
  \vertex (a);
  \vertex [right=of a] (b);
  \vertex [above left=of a] (i1) {\(e^-\)};
  \vertex [below left=of a] (i2) {\(e^+\)};
  \vertex [above right=of b] (f1) {\(\mu^-\)};
  \vertex [below right=of b] (f2) {\(\mu^+\)};
  \diagram* {
    (i1) -- [fermion] (a) -- [fermion] (i2),
    (a) -- [photon, edge label=\(\gamma\)] (b),
    (f2) -- [fermion] (b) -- [fermion] (f1),
  };
\end{feynman}
```

A pasted picture is read as TikZ reads it:

- **Places are in cm.** `at (1, 2)` is 1cm across and 2cm up, `at (30:2)` 2cm at 30 degrees,
  and a line is 1.6cm (the length feynjs writes TikZ code at). `right=of a` is TikZ-Feynman's
  node distance away: 1.5cm, 1cm with `small`, 2cm with `large`, or `node distance=`; on a
  diagonal, `above left=of a`, that far along the diagonal.
- **The first `\vertex` with no place sits at the origin**, as in TikZ (when the picture places
  points at all); feynjs lays out any other.
- **The braced text is the point's label,** `\vertex (b) {\(e^-\)};`, set as written: `{\(q\)}`
  is the letter q, not feynjs's quark, so a line with no style stays plain, as in TikZ.
- **A chain may run over several lines,** up to its comma, and a group joins every point in
  it: `a -- {b, c}` is two lines, `{a, b} -- c` two more.
- **Edge labels sit on the left of the line's direction,** `edge label'` on the right, as TikZ
  puts them. (feynjs's own lines choose the side; `edge labels: left` asks for TikZ's.)
- **The picture's options** become switches: `horizontal=a to b` and the rest, `small`,
  `medium`, `large`, `inline=(a)`, `baseline=(a.base)`, `every photon/.style={blue}` (and in
  `\tikzfeynmanset{...}`). TikZ-Feynman's layouts, `layered layout`, `spring layout`,
  `spring electrical layout` and `tree layout`, are all drawn by feynjs's own; `check()` says
  so. Other TikZ options (`thick`, `scale=2`) are passed over, and `check()` names them.

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
| `\feynmandiagram [...] { ... };`, `\begin{feynman} ... \end{feynman}`, `\vertex`, `\diagram* { ... }` | the same, pasted whole; or the body alone | read as above |
| `(a) -- [fermion] (b)`, `a.east` | the same | a name in parentheses is the name; an anchor is the point itself |
| `a -- {b, c}`, `{a, b} -- c` | the same | every point of the group is joined |
| `a -- [fermion] b` and every other line style | the same | `fermion`, `anti fermion`, `photon`, `boson`, `charged boson`, `gluon`, `scalar`, `charged scalar`, `ghost`, `majorana`, `plain` and the `anti` forms; see [Lines and particles](../guide/lines.md) |
| `[particle=\(e^-\)]` | the same, or `[e-]` | a feynjs particle name also styles the leg's line |
| `edge label=`, `edge label'=` | the same, or `label=`, `label'=` | `'` puts the label on the right of the line's direction |
| `"\(\gamma\)"`, `"\(\gamma\)"'` (the quotes library) | the same | `edge label=`, `edge label'=` |
| `momentum=`, `momentum'=`, `reversed momentum=`, `reversed momentum'=` | the same; `rmomentum` too | see [Labels and notes](../guide/labels.md); TikZ-Feynman's own options in front, `momentum={[arrow shorten=0.3]\(q\)}`, are passed over |
| `insertion=0.5`, `insertion` | the same | as many as wanted on one line; bare, halfway; `insertion={[size=5pt]0.3}` keeps 0.3 |
| `with arrow=0.3`, `with reversed arrow=0.7`, `with arrow` | the same | besides any arrow the line has; bare, halfway |
| `majorana`, `anti majorana` | the same | arrows pointing at each other, or apart |
| `[plain, gluon]`, `[plain, boson]` | the same, or `[gluon, overlay]` | a straight line over the coil or wave, for a SUSY partner |
| `draw=none` | the same, or `invisible` | the line holds its points but is not drawn |
| `half left`, `quarter right`, `bend left`, `bend right` | the same | with `looseness=`, drawn as TikZ draws it |
| `bend left=40`, `bend right=40` | the same, or `bend=40`, `bend=-40` | |
| `out=-45, in=180, looseness=1.5` | the same | degrees counter-clockwise from the right |
| `(a) -- [loop, min distance=2cm, out=135, in=45] (a)` | the same | a loop from a point back to itself, turned and sized as in TikZ; without them, feynjs's round one |
| `[dot]`, `[empty dot]`, `[square dot]`, `[crossed dot]`, `[blob]` | the same | more shapes in [Vertices, blobs and nuclei](../guide/vertices.md) |
| `label=above:\(g\)`, `label=45:\(g\)` (on a vertex) | the same, or `label=g, label side=above` | |
| `\vertex [right=of a] (b);` | `b [right=of a]` | also `above left=1.5 of a`, `above right=1 and 2 of a`, `right=1.5cm of a` |
| `\vertex (a) at (0, 0);` | `a at (0, 0)` | in propagator lengths, y up, not cm, unless a unit is given: `a at (1cm, 2cm)`; also `a at (30:1)`, `a [dot] at (0, 0)`; with `layout: manual` it stays exactly there ([by hand](../guide/layout.md#placing-points-by-hand)) |
| `horizontal=a to b`, `vertical=a to b`, `horizontal'=a to b`, `vertical'=a to b` | `horizontal: a to b`, `vertical: a to b`, `horizontal': a to b`, `vertical': a to b`, or `[horizontal=a to b]` | a line of its own; the primed forms mirror the diagram too |
| `small`, `medium`, `large` | `size: small`, or `[small]` | |
| `every photon/.style={blue}` | `every photon: color=blue` | also `every fermion:`, `every dot:`, `every edge:`, `every vertex:` |
| `baseline=(a.base)`, `inline=(a)` | `inline: a`, or `[inline=(a)]` | a diagram in a line of text (`inline` is small too) |
| `layered layout`, `spring layout`, `spring electrical layout`, `tree layout` | `layout: spring layout`, or `[spring layout]` | all drawn by feynjs's force layout; `check()` says so |
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

- **Other TikZ commands in a picture:** `\draw`, `\path`, `\node`, `\coordinate`. feynjs stops
  with an error naming the command; write the lines in `\diagram*`.
- **Other TikZ keys** on a line or a point, such as `thick`, `->`, `opacity`, `draw=red` or
  `xshift`. feynjs stops with an error naming the key. Use `heavy` for a thick line and
  `color=` for a colour. On the picture, they are passed over, and `check()` names them.
- **TikZ's other ways to write a place:** `++(1, 0)`, `($(a)!0.5!(b)$)`, and points named with
  anything but letters, digits, `_` and `'`.
- **Options for a group,** `{[same layer] b, c}`: they guide TikZ's own layouts, and are passed over.
- **Labels feynjs does not set:** `\frac` and other commands it does not know are drawn as their
  letters; `check()` warns of them. `\slashed{p}` is drawn.

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
