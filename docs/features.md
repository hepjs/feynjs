---
hide:
  - navigation
  - toc
tags:
  - features
  - overview
  - how it works
  - examples
  - TikZ-Feynman
  - MadGraph
---

# What feynjs does

feynjs reads a diagram written as text, places every vertex itself, and draws it: in a web page, in
a Markdown note, or in a LaTeX paper. This is what it draws, and how.

## What it draws

Every diagram on this page is drawn live, by your browser, as the page loads.

<div class="grid cards feynjs-gallery" markdown>

-   **[e⁺e⁻ → μ⁺μ⁻](guide/syntax.md)**: QED, written as lines

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [photon] b
    f1 [mu-] -- b -- f2 [mu+]
    ```

-   **[Top pairs](guide/processes.md)**: a process with its decays

    ```feynman
    p p > t t~
    t > b W+(> e+ ve)
    t~ > b~ W-(> d u~)
    ```

-   **[Gluon fusion](guide/vertices.md#loops-boxes-and-hadrons)**: a loop, in braces

    ```feynman
    g g > {t} > H
    ```

-   **[H → ZZ → 4ℓ](guide/processes.md)**: decays, in time order

    ```feynman
    p p > H
    H > Z Z
    Z > l+ l-
    ```

-   **[Vector-boson fusion](guide/processes.md)**: a production mode by name

    ```feynman
    VBF > H
    ```

-   **[Charginos and neutralinos](guide/lines.md)**: superpartners in their colour

    ```feynman
    arrows: none
    p p > chargino neutralino2
    chargino > W neutralino1
    neutralino2 > Z neutralino1
    W > l nu
    Z > l l
    ```

-   **[B⁰ → K*⁰μμ](guide/vertices.md#loops-boxes-and-hadrons)**: a penguin, with its hadrons

    ```feynman
    % B0 -> K*0 mu mu: a W loop over the quark line, with the photon leaving the loop
    in: d1 b
    out: d2 s mu1 mu2
    d1 [d] -- [fermion] d2 [d]
    s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
    l1 -- [boson, label=W^+] x -- [boson] l2
    x -- [photon, label={\gamma, Z^0}] v
    v -- [fermion] mu1 [\mu^-]
    mu2 [\mu^+] -- [fermion] v
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

-   **[Colour flow](guide/colour-flow.md)**: beside every quark and gluon

    ```feynman
    colour flow: on
    i1 [g] -- a -- i2 [g]
    a -- [gluon] b
    f1 [t] -- b -- f2 [tbar]
    ```

-   **[Detector objects](guide/objects.md)**: jets, large-R, semi-visible, emerging

    ```feynman
    i1 [p] -- pp [blob] -- i2 [p]
    pp -- [LRJ 1b W(2j)] j1 [J]
    pp -- [Z'] z
    z -- [SVJ] f1 [\text{SVJ}]
    z -- [EMG] f2 [\text{EJ}]
    ```

-   **[Light-by-light](guide/vertices.md)**: nuclei, here lead

    ```feynman
    i1 [Pb] -- b1 [nucleus=Pb] -- o1 [Pb]
    i2 [Pb] -- b2 [nucleus=Pb] -- o2 [Pb]
    b1 -- [photon] a
    b2 -- [photon] d
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [photon] g1 [gamma]
    c -- [photon] g2 [gamma]
    ```

-   **[The event](guide/views.md)**: as the detector sees it

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

-   **[The lattice](guide/views.md)**: Wilson loops and plaquettes

    ```feynman
    view: lattice
    lattice: 8x6
    wilson loop: (1,1) to (4,4)
    plaquette: (5,1)
    ```

</div>

## How it works

<div class="feynjs-row" markdown>
<div class="feynjs-row-text" markdown>

### 1 · Read

The text names the points and the lines between them, as TikZ-Feynman does; or it names the
process, as MadGraph does, and feynjs makes the points and lines. Each particle's name brings its
line style, arrow, label and colour.

</div>
<div class="feynjs-row-diagram feynjs-row-code" markdown>

````markdown
```feynman
p p > H
H > Z Z
Z > l+ l-
```
````

</div>
</div>

<div class="feynjs-row feynjs-row--steps" markdown>
<div class="feynjs-row-text" markdown>

### 2 · Order in time

Every point gets its moment: the collision first, then each decay, in order. Time runs left to
right, so a diagram reads as a paper draws it, and nothing runs backwards.

</div>
<div class="feynjs-row-diagram" markdown>

```feynman
p p > H
H > Z Z
Z > l+ l-
```

</div>
</div>

<div class="feynjs-row" markdown>
<div class="feynjs-row-text" markdown>

### 3 · Settle

Forces pull on the points until the diagram balances: lines keep their length, angles spread
evenly, decays fan forward, heavy particles carry on, and everything keeps clear of everything
else. The rules come in seven families; `debug: on` marks each line with the family that holds it
most. Or set `layout: grid`, or pin points by hand, as in TikZ.

</div>
<div class="feynjs-row-diagram feynjs-row-debug" markdown>

```feynman
debug: on
p p > H
H > Z Z
Z > l+ l-
```

</div>
</div>

<div class="feynjs-row" markdown>
<div class="feynjs-row-text" markdown>

### 4 · Draw

Labels are set in the TeX face, clear of the lines, and the diagram is drawn as SVG in the page's
own colours, light or dark, or written as TikZ-Feynman code for a paper. Every machine and every
browser draws it bit for bit the same.

</div>
<div class="feynjs-row-diagram" markdown>

```feynman
p p > H
H > Z Z
Z > l+ l-
```

</div>
</div>

## Every feature, by page

<div class="grid cards feynjs-features" markdown>

-   **Write**

    - [Lines and particles](guide/lines.md): every TikZ-Feynman style, 105 particle names
    - [Vertices, blobs and nuclei](guide/vertices.md), [labels and notes](guide/lines.md#labels)
    - [Loops, boxes and hadrons](guide/vertices.md#loops-boxes-and-hadrons), found for you
    - [Colour flow](guide/colour-flow.md) and [detector objects](guide/objects.md)
    - [Panels](guide/syntax.md#panels-and-switches): diagrams side by side, joined by +, = or a cut

-   **Lay out and style**

    - [Engines](guide/engines.md): forces, a grid, or points pinned by hand
    - [`debug: on`](guide/engines.md#why-a-line-is-where-it-is): why each line lies where it does
    - [Views](guide/views.md): the event in the detector, or a lattice
    - [Styling and export](guide/styling.md): sizes, dark mode, black and white; SVG, PNG, TikZ
    - [Theme settings](guide/theme.md): every length, angle and colour

-   **Use it in**

    - [Zensical or MkDocs](get-started/setup.md#setup-zensical--mkdocs): a `feynman` block in your Markdown
    - [Obsidian](get-started/setup.md#setup-obsidian): the same block, in your notes
    - [Any web page](get-started/setup.md#setup-web-page): one script tag
    - [LaTeX](get-started/setup.md#setup-latex): papers, on Overleaf and arXiv too
    - [JavaScript](guide/api.md) and the [command line](guide/cli.md)

-   **Tools**

    - [The playground](playground.md): type, drag and draw, then take the diagram away
    - [TikZ-Feynman](guide/tikz-feynman.md): its keys in, its code out
    - [MadGraph](guide/madgraph.md): draw every diagram a process generates
    - [Checking diagrams](guide/styling.md#checking-diagrams): lint, describe in words, score a layout
    - [Data in and out](guide/interchange.md): every part named, for programs and AI

</div>
