---
hide:
  - navigation
  - toc
  - tags
tags:
  - Feynman diagram
  - JavaScript
  - SVG
  - TikZ-Feynman
  - MadGraph
  - particle physics
  - HEP
---

# feynjs { .feynjs-hidden }

<div class="feynjs-hero-stage" markdown>

<div class="feynjs-hero-logo" markdown>
![feynjs](brand/logo/logo-ink-red.svg){ .feynjs-hero .feynjs-hero--light width="460" }
![feynjs](brand/logo/logo-ink-red-dark.svg){ .feynjs-hero .feynjs-hero--dark width="460" }
</div>

<div class="feynjs-hero-showcase" markdown>

<div class="feynjs-hero-tile" markdown>

```feynman
i1 [p] -- pp [blob, pulse] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [neutralino2] e1
e1 -- f3 [Z]
e1 -- f4 [neutralino1]
d2 -- [neutralino2] e2
e2 -- f5 [neutralino1]
e2 -- f6 [Z]
d2 -- f7 [q]
d2 -- f8 [q]
```

[Full suite of line types](guide/lines.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
colour flow: on
i1 [g] -- a -- i2 [g]
a -- [gluon] b
f1 [t] -- b -- f2 [tbar]
```

[Colour flow](guide/colour-flow.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [LRJ 1b W(2j)] j1 [J]
pp -- [Z'] z
z -- [SVJ] f1 [\text{SVJ}]
z -- [EMG] f2 [\text{EJ}]
```

[Detector objects](guide/objects.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
view: kinematic
i1 [p] -- pp [blob] -- i2 [p]
pp -- [t] t1
pp -- [tbar] t2
t1 -- b1 [b]
t1 -- [W+] w1
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

[Kinematic view](guide/views.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
layout: grid
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

[Grid layout](guide/layout.md#the-grid)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b
hadron: K^{*0} = d2 s
```

[Hadrons](guide/loops-hadrons.md)

</div>

</div>

</div>

Feynman diagrams, meet *Markdown*{ .feynjs-accent }. *Oh, and the web.*{ .feynjs-aside }
{ .feynjs-punch }

[Get started](get-started/index.md){ .md-button .md-button--primary }
[Try the playground](playground.md){ .md-button }
[See examples](examples/index.md){ .md-button }

## Two ways to write a diagram

<div class="grid cards" markdown>

-   **[Edges, as in TikZ-Feynman](guide/syntax.md)**: every line written out.

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [gamma] b
    f1 [mu-] -- b -- f2 [mu+]
    ```

    ````tex
    ```feynman
    i1 [e-] -- a -- i2 [e+] % (1)!
    a -- [gamma] b % (2)!
    f1 [mu-] -- b -- f2 [mu+] % (3)!
    ```
    ````

    1.  An electron and a positron come in and meet at the point `a`. Points are any names you
        like; a leg's particle goes in brackets after it.
    2.  A photon from `a` to `b`. The particle in the brackets sets the line's style, arrow and
        label.
    3.  The muon pair goes out from `b`. Time runs left to right; no coordinates are needed.

-   **[A process, as in MadGraph](guide/processes.md)**: feynjs makes the lines.

    ```feynman
    p p > gluino gluino
    gluino > q q neutralino2
    neutralino2 > Z neutralino1
    ```

    ````tex
    ```feynman
    p p > gluino gluino % (1)!
    gluino > q q neutralino2 % (2)!
    neutralino2 > Z neutralino1 % (3)!
    ```
    ````

    1.  The process: two protons make a pair of gluinos, drawn in the SUSY style.
    2.  How each gluino decays. A decay line applies to every particle of that name.
    3.  The neutralino's own decay, joined on: a cascade in three lines.

</div>

Either goes in a `feynman` block in your Markdown. Click a number in the code to see what each line
does.

## Everything it does

<div class="grid cards feynjs-features" markdown>

-   **Write**

    - [Lines and particles](guide/lines.md): every TikZ-Feynman style, 105 particle names
    - [Vertices, blobs and nuclei](guide/vertices.md), [labels and notes](guide/labels.md)
    - [Loops, boxes and hadrons](guide/loops-hadrons.md), found for you
    - [Colour flow](guide/colour-flow.md) and [detector objects](guide/objects.md)
    - [Panels](guide/panels.md): diagrams side by side, joined by +, = or a cut

-   **Lay out and style**

    - [Layout engines](guide/layout.md): forces, a grid, or points pinned by hand
    - [`debug: on`](guide/layout.md#why-a-line-is-where-it-is): why each line lies where it does
    - [Views](guide/views.md): the event in the detector, or a lattice
    - [Styling and export](guide/styling.md): sizes, dark mode, black and white; SVG, PNG, TikZ
    - [Theme settings](reference/theme.md): every length, angle and colour

-   **Use it in**

    - [Zensical or MkDocs](get-started/zensical.md): a `feynman` block in your Markdown
    - [Obsidian](get-started/obsidian.md): the same block, in your notes
    - [Any web page](developers/index.md): one script tag
    - [LaTeX](compatibility/latex.md): papers, on Overleaf and arXiv too
    - [JavaScript](reference/api.md) and the [command line](reference/cli.md)

-   **Tools**

    - [The playground](playground.md): type, drag and draw, then take the diagram away
    - [TikZ-Feynman](compatibility/tikz-feynman.md): its keys in, its code out
    - [MadGraph](compatibility/madgraph.md): draw every diagram a process generates
    - [Checking diagrams](guide/tools.md): lint, describe in words, score a layout
    - [Data in and out](developers/interchange.md): every part named, for programs and AI

</div>
