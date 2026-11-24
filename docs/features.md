---
tags:
  - features
  - overview
  - TikZ-Feynman
  - MadGraph
  - Markdown
---

# What feynjs does

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
