---
hide:
  - navigation
  - toc
tags:
  - live editor
  - try it
  - sandbox
  - share a diagram
  - drag vertices
  - AI
---

# Playground { .feynjs-hidden }

<div data-feynjs-playground></div>

??? tip "How to use it"

    - **Type** in the editor, or pick from **Examples** (or **Random**): the drawing follows as
      you type, and a mistake shows under the editor with what feynjs expected.
    - **Move**: drag a point; dropping it writes `b at (x, y)` into the source. Click a part to
      select the source line that made it.
    - **Draw**: pick a line from the palette, then click empty space for a point, or drag from one
      point to another. Drop a palette line on a drawn line to change its style.
    - **Erase**: click a point or a line to remove it.
    - **Layout**, **Size** and **Styling** write their switch into the source (`layout: grid`,
      `colour flow: on`). **Why?** writes `debug: on`: each line marked with the
      [family of rules](guide/layout.md#why-a-line-is-where-it-is) that shapes it.
    - **Undo** and **Redo** step through every change; **Share** copies a link that holds the source; **SVG**,
      **PNG** and **TikZ** take the diagram away.

    The pointer changes only lines written on their own (`a -- [gluon] b`); a chain or a process
    is changed in the source.

??? info "Every part has a name"

    Each line's group in the SVG carries `data-edge="a--b"` with its ends and particle, each drawn
    point `data-vertex="b"`, and the whole diagram is written as data in
    `<metadata class="feynjs-model">`: every point with where it is drawn, every line with its
    ends and particle. The panel under the playground shows it. A program, or a language model,
    asked to "make the line from `b` to `f1` dashed" finds the part by name and changes the source,
    rather than guessing from a picture.
