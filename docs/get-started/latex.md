# LaTeX

Write a diagram in feynjs's syntax inside a LaTeX document, and get a TikZ-Feynman drawing with
every vertex placed by feynjs. It compiles anywhere TikZ-Feynman does: pdfLaTeX, LuaLaTeX,
XeLaTeX, Tectonic, Overleaf, arXiv (PDF and HTML) and journal production.

```feynman
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```

```latex
\usepackage{feynjs}
...
\begin{feynjs}
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
\end{feynjs}

\feynjsset{unit=1.0}          % shorter propagators (cm) for the diagrams that follow
\feynjsfile{diagrams/vbf.feyn}  % or a diagram kept in a file of its own
```

## Setting it up

1. Copy [`feynjs.sty`](https://github.com/hepjs/feynjs/blob/main/integrations/latex/feynjs.sty)
   next to your document, or into your TeX tree.
2. Install the `feynjs` command: `npm install -g feynjs`.

## How it works

TeX cannot run JavaScript, and does not need to. Laying out the diagrams is a separate step, as
`bibtex` is for citations:

1. **LaTeX** writes each diagram's source beside the document (`paper-feynjs-1.feyn`, ...), and
   leaves a box in its place saying what to run.
2. **`feynjs cache`** draws each one as TikZ-Feynman code with every vertex placed
   (`paper-feynjs-1.tex`, ...). Diagrams that have not changed are left alone.
3. **LaTeX** again reads the drawings in.

```sh
pdflatex paper
feynjs cache .
pdflatex paper
```

With `--shell-escape` and `feynjs` installed, LaTeX does the middle step itself, in one run.

Each drawing records the checksum of the source it was drawn from, so an edited diagram is noticed
(a warning, and the box again) until it is drawn again.

## In Beamer slides

The package works in Beamer as in any document. A frame that holds a `feynjs` environment takes
`[fragile]`, as for any verbatim text; `\feynjsfile` is not verbatim, so it works in a plain frame
and inside overlay commands, which is how a slide is built up step by step:

```latex
\begin{frame}[fragile]{Drell--Yan}
  \centering
  \begin{feynjs}
  q qbar > Z > mu- mu+
  \end{feynjs}
\end{frame}

\begin{frame}{Higgs production, step by step}
  \centering
  \only<1>{\feynjsfile{higgs-1.feyn}}%   g g > {t} > H
  \only<2>{\feynjsfile{higgs-2.feyn}}%   ... H > Z Z
  \only<3>{\feynjsfile{higgs-3.feyn}}%   ... Z > l+ l-
\end{frame}
```

`\feynjsset{unit=1.1}` draws the diagrams that follow smaller, to sit two to a slide in
`columns`. A whole talk, with its build steps, is in the repository:
[integrations/latex/examples/beamer](https://github.com/hepjs/feynjs/tree/main/integrations/latex/examples/beamer).

## Overleaf, arXiv and journals

These run neither Node.js nor shell escape. Run `feynjs cache` once on your own machine and upload
the `*-feynjs-*.tex` files with your document: they need only TikZ-Feynman. On arXiv they compile
with pdfLaTeX, and LaTeXML turns them into the HTML version with the waves of photons, W and Z
kept (the package swaps TikZ-Feynman's own wave, which LaTeXML cannot draw, for one it can).

The drawings are the same on every machine: feynjs lays a diagram out bit for bit alike on every
processor and in every JavaScript engine, so a coauthor's `feynjs cache` gives the same paper.

## Without the package

`feynjs tikz diagram.feyn` (or [`toTikz`](api.md) from code) writes one diagram as
TikZ-Feynman code to paste in by hand. See [TikZ-Feynman](../compatibility/tikz-feynman.md) for what carries over.
