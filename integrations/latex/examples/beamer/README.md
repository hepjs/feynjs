# feynjs in a Beamer talk

`talk.tex` is a short Beamer talk with Feynman diagrams written in feynjs's syntax:

- a diagram written in a slide (the frame takes `[fragile]`, as for any verbatim text);
- two diagrams side by side in `columns`, smaller with `\feynjsset{unit=1.1}`;
- a slide built up step by step with `\only<n>{\feynjsfile{...}}`, each step's diagram in a
  `.feyn` file of its own (`\feynjsfile` is not verbatim, so it works inside overlay commands).

Build it from this folder, with `feynjs.sty` on TeX's path (here, two folders up):

```sh
TEXINPUTS=../..: pdflatex talk      # writes each diagram's source: talk-feynjs-1.feyn, ...
feynjs cache .                      # draws each one as TikZ-Feynman: talk-feynjs-1.tex, ...
TEXINPUTS=../..: pdflatex talk      # reads the drawings in
```

or in one run with `pdflatex --shell-escape talk` when the `feynjs` command is installed
(`npm install -g feynjs`). For Overleaf, upload the `talk-feynjs-*.tex` files with the talk.
