---
tags:
  - components
  - user guide
  - how-to
  - TikZ-Feynman
  - MadGraph
  - syntax
---

# Components

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

How to write each part of a diagram, one topic per page. Each page shows diagrams with the
source that drew them, so you can copy any of them as a starting point.

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
| [Processes](processes.md) | `p p > ...` processes, decays, loops, production modes, the same particle decaying two ways |
| [Lines and particles](lines.md) | every line style, and the particles that pick them |
| [All particles](particles.md) | every particle name, with its line and label |
| [Vertices, blobs and nuclei](vertices.md) | dots, blobs, proton beams, jets, marks on a line, nuclei, hadrons with their quarks |
| [Labels and notes](lines.md#labels) | TeX labels, which side they sit on, momenta, coupling labels, notes |
| [Loops, boxes and hadrons](vertices.md#loops-boxes-and-hadrons) | loops over a line, penguins, boxes, mesons and baryons, spectators |
| [Colour flow](colour-flow.md) | colour lines beside quarks and gluons, in double-line notation |
| [Detector objects](objects.md) | large-R jets, hadronic taus, semi-visible, emerging and displaced jets, lepton-jets, missing energy |
| [Panels and switches](syntax.md#panels-and-switches) | several diagrams side by side; diagram-wide switches |
| [Syntax at a glance](syntax-at-a-glance.md) | the whole syntax on one page |

## Elsewhere

| Topic | Pages |
|---|---|
| **Layout and styling** | [Engines](engines.md), [Views](views.md), [Styling and export](styling.md), [Theme settings](theme.md): where vertices go, the detector and lattice views, colours, sizes, SVG, PNG and TikZ |
| **From code** | [Setup](../get-started/setup.md#setup-javascript--command-line), the [JavaScript API](api.md), the [command line](cli.md), [Checking diagrams](styling.md#checking-diagrams) |
| **Other tools** | [TikZ-Feynman](tikz-feynman.md) and [MadGraph](madgraph.md): what carries over from each |
