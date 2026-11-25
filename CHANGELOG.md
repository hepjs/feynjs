# Changelog

All notable changes, newest first. Versions follow [semantic versioning](https://semver.org): a
layout that moves is a change, recorded here.

## Unreleased

- **A scattered beam reads as scattering.** Where an exchange between the beams scatters a line
  (one point before, one after), the line comes in toward the centre and leaves outward, each by
  at least 10° (new settings `forces.beamsScatter` and `forces.scatterAngle`). Before, a beam could
  bend the other way, coming in away from the other beam and leaving toward it, as if attracted:
  the quark in the bremsstrahlung example did. **28 approved layouts moved**, each reviewed
  against its original: 12 that broke the rule (the bremsstrahlung example, ATL-PHYS-PUB-2016-009
  fig. 1(4), EXOT-2010-10 fig. 8, EXOT-2016-03 fig. 1b, EXOT-2018-52 fig. 1a, HDBS-2018-40 fig. aux
  1a, HIGG-2013-25 fig. 1a, STDM-2011-29 fig. 1a, STDM-2013-02 fig. 1c, TOPQ-2013-12 fig. 1a,
  TOPQ-2014-17 fig. 1, TOPQ-2016-14 fig. 1b) and 16 that settled again around it, TOPQ-2014-14
  fig. 2c by 0.92 of a line length, SUSY-2014-05 fig. 2e by 0.5, the rest by less. A u-channel's
  crossed lines keep their crossing.
- **A quark exchange leans forward into what it gives off,** as a boson exchange already did:
  where one point alone along a quark exchange gives something off, the Higgs between two b quarks
  in b b-bar H, it sits ahead, the quark lines leaning into it (as in HIGG-2015-08 fig. 1b). Not
  through a loop: an exchange into a quark triangle or box keeps the loop's shape. **21 more
  approved layouts moved**, each reviewed against its original: HIGG-2015-08 fig. 1b, TOPQ-2014-14
  fig. 2c by 0.74 of a line length, EXOT-2018-52 fig. 1a by 0.48, the rest by 0.3 or less.
- **A heavy line along an exchange stands exactly upright:** the neutralino between two charginos
  in SUSY vector-boson fusion, a gluino between two squarks. A light exchange may still lean.

- **`measure` counts only accidental crossings.** Two legs that cross because the `in:` or `out:`
  order asks for it (a u-channel's beams, as well as its final states) no longer count, as long
  as the drawing keeps that order; two legs crossing against it still do. Every approved diagram
  now measures no crossings: the two that did (ATL-PHYS-PUB-2016-008 fig. 1b, EXOT-2014-10 fig. 1c)
  cross their beams as the originals do. No layout moves.
- **MadGraph plugin:** MSSM sleptons and sneutrinos (`el-`, `mur+`, `ta1-`, `sve`) are drawn as
  superpartners, labelled as papers write them.

## 0.9.4 — 2026-11-24

0.9.3 was not published: its changes are here, after this release's own.

- **The same diagram on every machine.** The layout's maths no longer uses the engine's own
  `Math.sin`, `cos`, `atan2`, `exp`, `log` and `pow`, whose last bit differs between processors
  (V8 on ARM64 and x86-64) and engines (Safari, Firefox, Bun). It uses portable fdlibm ports written
  with `+ - * /` and `sqrt` alone, which every engine rounds alike. Every diagram now draws the
  same bits in Node (ARM64 and x86-64), Deno, Bun, Chromium, Firefox, WebKit and QuickJS
  (WebAssembly). Before, 170 to 301 of 382 diagrams differed between them. Text descriptions no
  longer depend on the reader's locale. 24 approved layouts moved, each to the layout x86 machines
  already drew: EXOT-2013-22 fig. 1b by 0.73 of a line length, SUSY-2019-14 fig. 1 by 0.68, the
  rest by less.
- **`toTikz` looks like the web page:** the theme's line widths, arrowheads, waves, coils and label
  sizes; every label where the page puts it; hadron braces and ellipses; colours from CSS names and
  `#hex`. Waves are TikZ's standard coil, which draws at any length and which arXiv's HTML converter
  (LaTeXML) draws too. Every example and every validation diagram compiles with pdfLaTeX.
- **Feynman diagrams in LaTeX:** `integrations/latex/feynjs.sty`, a `feynjs` environment and
  `\feynjsfile`, with `feynjs cache` to draw the diagrams (as bibtex does citations). The drawings
  need only TikZ-Feynman, so Overleaf, arXiv and journals compile them without Node.js. The CLI's
  `tikz` takes `--unit` and `--picture`.
- **`inline: a`** puts point a on the math axis of the text, where an equation's middle sits, on the
  page and in TikZ.
- **One environment on every platform:** `pixi.toml` (Node, TeX through tectonic, LaTeXML, Bun,
  Deno), and a Platforms workflow that hashes every diagram on Linux, Windows and macOS, x86 and
  ARM, in three browsers, and fails if any differ.
- **A skill for agents** (`skills/feynjs/SKILL.md`): writing, checking and rendering diagrams.


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
- **Objects' contents in a process:** `p p > Zp > LRJ(1b W(2j)) j`. Each object's line carries
  `data-object` in the SVG. In the playground, click a large-R jet to choose what it holds.
- **A MadGraph plugin** (`integrations/madgraph`): `mg5_aMC --mode=feynjs`, then `feynjs DIR`
  draws every diagram MadGraph generated, decay chains joined into whole diagrams.
- **Labels in crowded places:** a label with no clear spot beside its line searches all round
  its line's points, a little further out each time, instead of overlapping another (MadGraph's
  2->6 diagrams: 25 crowded labels to none).
- **Waves** (photons, W, Z) follow sin(sin x), scaled to the same height: rounder, fuller crests
  and steeper crossings than a plain sine.
- **The MadGraph plugin is a download:** each release carries `feynjs-madgraph.zip`.
- **A hand-over format, versioned:** files that start `% feynjs-interchange 1` (the MadGraph
  plugin writes them); `check` warns about a newer version. **A diagram as data:** `render`, `check`,
  `describe`, `explain`, `measure` and `toTikz` take `{ incoming, edges, ... }` as well as text, and
  `toSource` writes it as source; the command line reads `.json`.
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
- **Incoming lines converge or run level** (default engine), never parallel and slanting; quarks
  that scatter, as in vector-boson fusion, keep their own deflection.
- **A stop's top is short** (default engine): the quark a superpartner gives off that decays on
  (stop -> t neutralino) is held at 0.8 of a line, and opens at least 50 degrees from the
  neutralino, so its decay lies beside the neutralino.
- **Mirror-image diagrams are drawn exactly so:** two alike chains either side of a t-channel
  exchange (squarks either side of a gluino) mirror each other point for point, at least a line
  apart. 23 approved layouts moved in all.
- **`debug: on`:** a faint grid behind the drawing, each point's name, and each line marked with
  the family of rules that shapes it most (a letter on a disc of the family's colour), measured by
  settling the diagram again without each family; under the drawing, each family once, with the
  lines it holds, and the steps after the forces. A mark's tooltip and `data-why` give its line's
  every family, with how much.
- **The force layout's rules in seven families** (spacing, time, incoming, decays, mass, hadrons,
  loops), each force and setting in one; the theme reference lists the settings family by family,
  written from the code.
- **Particles by kind and mass, never by name:** a W and a Z are drawn alike, and every fermion
  alike but by its mass. A massive fermion (the top, or a new heavy one: N, T, B, Q) gives off its
  light partner short and to the outside, as a top gives off its b, when the boson it decays to is
  real; a light one (every lepton, every other quark) never does. 6 approved layouts moved: heavy
  neutral leptons and vector-like quarks.
- **Dark pages:** the background grid is a lighter grey (docs site and Obsidian), where the text
  colour thinned had come out near black.

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
