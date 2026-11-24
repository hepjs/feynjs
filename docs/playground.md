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

## What you can do here

- **Type**, or pick an **example** (or **Surprise me**): the drawing follows within a moment, and
  a mistake shows beneath the editor with what feynjs expected.
- **Move**: drag a point. Dropping it writes `b at (x, y)` into the source, and the layout
  settles round it. Click a part to select the source line that made it.
- **Draw**: pick a line from the palette, then click empty space for a point, or drag from one
  point to another (or out into space, which makes a point there). Each writes
  `v1 -- [gluon] v2` into the source. Drop a palette line on a drawn line, or click it while
  drawing, to change its style.
- **Erase**: click a point or a line to remove it.
- **Engine**, **Styling** and **Size** write their line into the source (`layout: grid`,
  `colour flow: on`); with the grid engine, **Square** and **Iso** choose its grid.
- **Undo** and **Redo** step back and forth through every change; **Share link** copies an
  address that holds the source. **SVG**, **PNG** and **TikZ** take the diagram away.

The pointer changes only lines written on their own (`a -- [gluon] b`); a chain or a process is
changed in the source, and the page says so.

## Every part has a name

feynjs names every part of a drawing, in the SVG itself: each line's group carries
`data-edge="a--b"` with its ends and particle, each drawn point `data-vertex="b"`, and the whole
diagram is written as data in `<metadata class="feynjs-model">`: every point with where it is
drawn and the `at (x, y)` that would hold it there, every line with its ends and particle. The
panel *What a program sees*, under the editor, shows it for the diagram above.

That is what this page is built on, and what a program, or a language model, can use: asked to
"make the line from `b` to `f1` dashed" or "move `b` to the left", it finds the part by name and
changes the source, rather than guessing from a picture.
