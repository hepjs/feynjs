# feynjs for LaTeX

Write Feynman diagrams in a LaTeX document in feynjs's syntax; get TikZ-Feynman drawings laid out by
feynjs, that compile anywhere TikZ-Feynman does: pdfLaTeX, LuaLaTeX, XeLaTeX, Tectonic, Overleaf,
arXiv (PDF and HTML) and journal production.

```latex
\usepackage{feynjs}
...
\begin{feynjs}
p p > t tbar
t > b W+(> e+ nu)
\end{feynjs}

\feynjsset{unit=1.0}        % shorter propagators (cm) for the diagrams that follow
\feynjsfile{diagrams/vbf.feyn}
```

## How it works

TeX cannot run JavaScript, and does not need to. Layout is a separate step, as `bibtex` is for
citations:

1. **LaTeX** writes each diagram's source beside the document: `paper-feynjs-1.feyn`, ...
   (and leaves a box saying what to run).
2. **`feynjs cache`** draws each one as TikZ-Feynman code with every vertex placed:
   `paper-feynjs-1.tex`, ... Diagrams that have not changed are left alone.
3. **LaTeX** again reads the drawings in.

With `--shell-escape` and `feynjs` installed, LaTeX does step 2 itself, in one run.

With Tectonic, add `--keep-intermediates` (and `--keep-logs`): Tectonic otherwise keeps the files
a document writes in memory, so the diagram sources never reach the disk for `feynjs cache`.

Each drawing records the MD5 checksum of the source it was drawn from, so an edited diagram is
noticed (a warning, and the box again) until it is redrawn.

## Overleaf, arXiv and journals

These run neither Node.js nor shell escape. Upload the `*-feynjs-*.tex` files with your
document: they need only TikZ-Feynman. On arXiv they compile with pdfLaTeX, and LaTeXML turns them
into the HTML version, with the waves of photons and W, Z bosons kept (the package swaps
TikZ-Feynman's own wave, which LaTeXML cannot draw, for one it can).

## Installing the `feynjs` command

- with Node.js: `npm install -g feynjs`
- with pixi, from a clone of the repository: `pixi run build`, then `pixi run node bin/feynjs.mjs cache .`
- or as one self-contained program, no Node.js needed: `deno compile --allow-read --allow-write
  --output feynjs bin/feynjs.mjs`

## Tested

`test/latex-package.test.ts` runs the whole cycle (write, draw, read; edit one diagram; check it is
noticed and redrawn) with pdfLaTeX or Tectonic. By hand, also with LuaLaTeX, XeLaTeX and
LaTeXML 0.8.8 (`--includestyles`, as arXiv runs it).
