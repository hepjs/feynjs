# Changelog

All notable changes, newest first. Versions follow [semantic versioning](https://semver.org): a
layout that moves is a change, recorded here.

## 0.9.3 — 2026-11-24

- **Every part of a drawing is named** in the SVG: each line's group carries `data-edge="a--b"`
  with its ends and particle, each drawn point `data-vertex="b"`, and the SVG holds the whole
  diagram as JSON (`<metadata class="feynjs-model">`): what a program or a language model needs to
  refer to a part of the diagram and change the source by name.
- **The playground**, a page of the docs: write source, see the diagram as you type; point at a
  part to see its name and source line; drag a point to write its `at (x, y)`; switches, share
  links, SVG, PNG and TikZ.
- **Dark pages:** the grid behind a grid layout, and the lattice view's grid and sites, are drawn in
  the diagram's own colour, thinned, so they stay faint on dark pages as on light.
- **Releases** carry the Obsidian plugin as `feynjs-obsidian.zip`.
- **Names in any case:** `Gluino`, `Svj`, `lrj` (where only one name fits; single letters keep
  their case, so B and T stay the heavy quarks). **Detector objects in a process** (`p p > Z(> LRJ) H`,
  `Zp > SVJ SVJ`) are drawn as the objects, not as plain lines.
- **Playground:** examples in menus by field (Standard Model, SUSY, Flavour physics, Heavy ion, Views
  and engines), and autocomplete in the editor (switches, particles, line styles, objects, options,
  point names).
- **Top decays** (default engine): the b of t -> b W leaves to the outside of the diagram, turned
  40 degrees from the top's heading and a little short, while the W and what follows lie as
  before; a b that settles inside its W is turned over to the outside. A top level with the beams
  keeps the listed order. 17 approved layouts moved, all with tops.
- **Cascades on the grid:** with `layout: grid`, a decay along a cascade is drawn as a level
  spine with what it gives off hanging from it. The particle that carries the cascade on (the
  superpartner, else the one product that decays further) runs level; the final states it throws
  off stand out from the spine away from the middle of the diagram, up on the upper branch and down
  on the lower, so the branches mirror each other. A gluino's two quarks part about the upright and
  its neutralino's Z stands straight up, where before the quarks could take the Z's place and push
  it inward.

## 0.9.1 — 2026-11-24

- **Zensical and MkDocs:** diagrams are drawn again after each instant page change, so the script
  and the `feynman` fence are all a site needs (no init script).

## 0.9.0 — 2026-11-23

The first public release.

- **Writing diagrams:** TikZ-Feynman-style lines; MadGraph-style processes and decays, with
  MadGraph's particle names; loops as `{t}`; production modes `ggF`, `VBF`, `VBS`; points placed
  from others (`right=of a`); `every ...` defaults; panels.
- **Drawing:** every TikZ-Feynman line style and option (momentum variants, insertions, arrows
  anywhere, `out=`/`in=`); hadrons (ellipse, brace, cap) and hadrons with their quarks and flux
  tubes (mesons to pentaquarks, molecules); nuclei; colour flow; charge colour; detector objects;
  lifetimes; pulses; notes with hand-drawn arrows; black-and-white scheme.
- **Layout:** the force layout (default), a grid layout, manual placement; held to the approved
  layouts of the ATLAS validation set.
- **Views:** the kinematic view (transverse, longitudinal) and the lattice view.
- **Use:** a script tag draws a page's diagrams (Markdown code blocks included); npm package; CLI;
  TikZ export; an Obsidian plugin.
