# Changelog

All notable changes, newest first. Versions follow [semantic versioning](https://semver.org): a
layout that moves is a change, recorded here.

## 0.9.1 — 2026-11-24

- **Zensical and MkDocs:** diagrams are drawn again after each instant page change, so the script
  and the `feynman` fence are all a site needs (no init script).
- **Releases** carry the Obsidian plugin as `feynjs-obsidian.zip`.

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
