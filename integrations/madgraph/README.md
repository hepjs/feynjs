# feynjs for MadGraph5_aMC@NLO

Every diagram MadGraph generates, drawn by feynjs: in any model MadGraph can load.

```text
cp -r integrations/madgraph/feynjs <MG5>/PLUGIN/
<MG5>/bin/mg5_aMC --mode=feynjs
MG5_aMC> generate p p > t t~
MG5_aMC> feynjs ttbar_diagrams
```

`feynjs DIR` writes each diagram as feynjs source (`DIR/<process>_<n>.feyn`) and a page,
`DIR/index.html`, that draws them all. `feynjs DIR --svg` also writes SVGs, with Node's `npx`.

MadGraph's own drawing module reads each diagram and settles which way its fermion lines run; the
plugin writes those lines as feynjs edges, and feynjs lays the diagram out. Standard Model
particles are written by their MadGraph names, which feynjs knows (`e-`, `t~`, `ve`, `W+`, `a`);
any other particle is drawn by the line type its model gives it (dashed, wavy, curly, ...) and
labelled with its TeX name.
