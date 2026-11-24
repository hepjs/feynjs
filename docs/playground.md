---
hide:
  - toc
tags:
  - live editor
  - try it
  - sandbox
  - share a diagram
  - drag vertices
  - AI
---

# Playground

***Write a diagram below and see it drawn above as you type. Point at any part to see its name and
the line that made it; drag a point to move it.***

<div data-feynjs-playground></div>

## What you can do here

- **Type**, or pick an **example**: the drawing follows within a moment, and a mistake shows
  beneath the editor with what feynjs expected.
- **Switches** set the engine, colour flow, black and white and size. Each writes its line into
  the source (`layout: grid`, say), so what you see is what the source says.
- **Point** at a line or a point: its name shows above the drawing with the source line that
  made it. **Click** it to select that line in the editor.
- **Drag** a point: dropping it writes `b at (x, y)` into the source, and the layout settles
  round it.
- **Share link** copies an address that holds the source, so the diagram opens as you see it.
  **SVG**, **PNG** and **TikZ** take the diagram away.

## Every part has a name

feynjs names every part of a drawing, in the SVG itself: each line's group carries
`data-edge="a--b"` with its ends and particle, each drawn point `data-vertex="b"`, and the whole
diagram is written as data in `<metadata class="feynjs-model">`: every point with where it is
drawn and the `at (x, y)` that would hold it there, every line with its ends and particle. The
panel *What a program sees*, under the editor, shows it for the diagram above.

That is what this page is built on, and what a program, or a language model, can use: asked to
"make the line from `b` to `f1` dashed" or "move `b` to the left", it finds the part by name and
changes the source, rather than guessing from a picture.
