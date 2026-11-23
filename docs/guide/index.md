---
tags:
  - user guide
  - manual
  - how-to
  - TikZ-Feynman
  - MadGraph
  - syntax
---

# Guide

***Find the page for each topic: the two ways to write a diagram, then lines, labels, loops, colour flow, layout, styling and checks.***

```feynman
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```

````markdown
```feynman
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> q qbar)
```
````

Everything feynjs can draw, one topic per page. Each page shows diagrams with the source that
drew them, so you can copy any of them as a starting point.

## Two ways to write

feynjs reads two notations, and both give the same drawing.

| | Edges, as in TikZ-Feynman | Processes, as in MadGraph |
|---|---|---|
| You write | every line: `a -- [gamma] b` | the process and decays: `p p > t tbar`, `t > b W+` |
| Good for | loops, boxes, hadrons, couplings, exact control | production and decay, long cascades |
| Read | [Edges](syntax.md) | [Processes](processes.md) |

## Topics

| Page | What it covers |
|---|---|
| [Edges](syntax.md) | chains, vertices, lines, which legs come in and go out |
| [Processes](processes.md) | `p p > ...` processes, decays, the same particle decaying two ways |
| [Lines and particles](lines.md) | every line style, and the particles that pick them |
| [Labels](labels.md) | TeX labels, which side they sit on, momenta, coupling labels |
| [Vertices and blobs](vertices.md) | dots, blobs, proton beams, jets, insertions on a line |
| [Loops, boxes and hadrons](loops-hadrons.md) | loops over a line, penguins, boxes, mesons and baryons, spectators |
| [Detector objects](objects.md) | large-R jets, hadronic taus, semi-visible, emerging and displaced jets, lepton-jets, missing energy |
| [Colour flow](colour-flow.md) | colour lines beside quarks and gluons, in double-line notation |
| [Panels and switches](panels.md) | several diagrams side by side; diagram-wide switches |
| [Layout](layout.md) | how positions are chosen, the two engines, steering by hand |
| [Styling and export](styling.md) | the theme, dark mode, colours, standalone SVG and TikZ |
| [Checking diagrams](tools.md) | `check`, `describe`, `measure` |
