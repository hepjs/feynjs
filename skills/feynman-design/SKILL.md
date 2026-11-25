---
name: feynman-design
description: Make good Feynman diagrams with feynjs for real tasks - draw the diagram for a named process, put it in a docs page, notes or a LaTeX paper, reproduce or convert a figure from a paper, fix a layout that looks wrong, show alternatives side by side, or export for slides and journals - with the layout conventions physicists expect and the physics checks a diagram must pass. Use when asked to draw, design, improve, review, reproduce or export a Feynman diagram. For the full syntax, see the feynjs skill.
---

# Making Feynman diagrams with feynjs

Most requests are one of the tasks below. Each gives the steps and a starting source; finish with
the checks at the end. Full syntax: the `feynjs` skill and https://hepjs.github.io/feynjs/authoring/.

## Tasks

### "Draw the diagram for <process>"

1. Write it as a process line: what comes in, `>`, what goes out; a particle between two `>` is
   the propagator drawn there; decays follow, after commas or on their own lines.
   ```text
   e- e+ > Z > mu- mu+                                          a named s-channel line
   p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)   production and decays, MadGraph style
   g g > {t} > H                                                 a loop, in braces
   VBF > H                                                       a production mode by name
   q qbar > Z' > chi chibar                                      a BSM mediator
   ```
2. Use edges (`a -- [gluon] b`) only for what a process line cannot say: boxes, penguins, a
   coupling on a vertex (`a [dot, label=g_s]`), quark lines grouped into hadrons
   (`hadron: B^0 = d1 b [brace]`).
3. Pick the level the reader needs: partons for the hard process, `p p` when beams matter, hadron
   names (`B0 > K*0 mu+ mu-`) or quark lines for flavour physics, `2H 3H > 4He n` for a nuclear
   reaction, detector objects (`[LRJ 1b W(2j)]`, `MET`) for an analysis's final state.
4. Run the checks below, then show the source and the drawing.

If the request is ambiguous (which diagram of several, which decay), draw the leading one and say
which you chose.

### "Put it in my docs / notes / page / paper"

| Where | What to do |
|---|---|
| Zensical or MkDocs | add `https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js` to `extra_javascript` and the `feynman` custom fence; then a ```` ```feynman ```` block |
| Any web page | `<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>`, then ```` ```feynman ```` blocks or `<div class="feynman">` |
| Obsidian | the plugin from the release zip; then ```` ```feynman ```` blocks |
| LaTeX | `\usepackage{feynjs}` and a `feynjs` environment, compiled as TikZ-Feynman (Overleaf and arXiv too); or `feynjs tikz file.feyn --picture` for a plain `tikzpicture` |
| Your own code | `npm install feynjs`; `render(source)` gives the SVG, `toTikz(source)` the TikZ |

Setup for each is at https://hepjs.github.io/feynjs/compatibility/.

### "Reproduce this figure from a paper"

1. Read the figure: incoming and outgoing particles, every vertex, every propagator, labels.
2. Write it as a process line if it has no loops or hadrons, else as edges; name the particles so
   styles and labels come for free; copy the paper's labels with `label=` only where they differ.
3. Order the legs as the figure does with `in:` and `out:` (top to bottom).
4. Compare side by side. If a line goes the wrong way, change the structure or add a switch
   (`final plane: on`, `layout: grid`) before pinning points; pin with `layout: manual` and a few
   `v at (x, y)` only as a last resort.

### "Convert my TikZ-Feynman figures"

`npx feynjs import paper.tex > diagrams.feyn` converts every TikZ-Feynman picture in the file into
feynjs lines (from code, `fromTikz()` in `feynjs/tikz`). Convert once and keep editing the result;
a whole TikZ picture is not pasted into a `feynman` block.

### "This layout looks wrong"

1. Say what is wrong in the terms of the conventions below (a scattered line bending the wrong
   way, a cascade folding back, labels crowded).
2. `feynjs measure file.feyn` reports crossings, crowded labels and vertices, stubs and the
   smallest angle; `debug: on` shows each point's name and which rules shaped each line.
3. Fix it in this order: the source's structure (leg order with `in:`/`out:`, which particle
   decays where), a switch (`final plane: on`, `layout: grid`, `size: small`), a line's
   `length=1.5`, and only then pins.

### "Show the alternatives" / "every diagram of the process"

- Panels: `---` between diagrams, a caption after it; one block draws them side by side.
  ```text
  --- (a) through a photon
  e- e+ > gamma > mu- mu+
  --- (b) through a Z
  e- e+ > Z > mu- mu+
  ```
- Every diagram MadGraph generates: the feynjs MadGraph plugin (`mg5_aMC --mode=feynjs`, then
  `feynjs DIR`) writes each diagram's source and a page drawing them all.

### "Export it for slides or a journal"

- SVG: `feynjs render file.feyn > file.svg`, or `render(source, { standalone: true })` for colours
  of its own; on a page, each diagram's download button gives SVG or PNG.
- TikZ-Feynman: `feynjs tikz file.feyn` (a document) or `--picture` (a bare picture).
- For print in black: `colours: bw`. For a slide or a dense figure: `size: small`.

## How physicists expect it to look

The default engine follows these; check the result against them.

- **Time runs left to right**; incoming on the left, outgoing on the right; near top–bottom
  symmetry; compact (short legs, few waves and coils).
- **Scattering reads as scattering**: in a t-channel exchange each incoming line runs in toward
  the centre and each outgoing line leaves outward; what the scattering produces sits between.
- **A heavy exchange** between the beams (a neutralino, a gluino) stands upright; a light quark
  exchange may lean forward.
- **Radiation** off a fermion does not bend it; the radiated line is of moderate length.
- **Cascades** arc gently, each stage shorter, from a narrow opening angle; the stable particle
  at the end does not bend outward.
- **Decays** fan about their parent's direction; `final plane: on` lines up every final state.
- **Hadrons**: spectator quark lines straight; a quark pair from the vacuum straight or diverging
  symmetrically.
- **No crossings** except those the physics asks for (a u-channel).

## Physics checks

- **Charge** is conserved at every vertex. An internal W is labelled by the charge emitted at the
  earlier vertex: b → u gives off a W⁻, b̄ → ū a W⁺.
- **Colour**: a gluon couples only to coloured lines (in a b → s penguin the gluon leaves the
  loop's quark, not the W); a photon or Z may leave the W.
- **Fermion flow** is continuous through every vertex.
- **Only real vertices**: no ZZZ or ZZγ, no gluon on a lepton; hadron names match their quarks
  (B⁺ is u b̄).
- **`feynjs check`** finds broken fermion flow, unlabelled legs and unknown names; **`feynjs
  explain`** says the diagram back in words, which catches a wrong topology.

## Drawing the eye

One emphasis per diagram, and colour only where it means something:

- `a [dot, pulse]` on the vertex that matters; `[chargino, lifetime={c\tau}]` for a long-lived
  particle; `hadron: ... [brace]`; `note: a "new coupling"`.
- feynjs colours superpartners itself; `charge colour: on` when charge is the point.
- Particle names label themselves; label a coupling on its vertex (`v [dot, label=g_{Z'}]`);
  `label: W = V` renames a particle everywhere.

## Before you hand it over

- [ ] It says one thing; extra messages are panels with captions.
- [ ] `feynjs check` is clean; charge, colour and fermion flow are right at every vertex.
- [ ] `feynjs measure` shows no problems; nothing crosses that should not.
- [ ] It reads left to right; scattered lines go in toward the centre and out away.
- [ ] At most one emphasis; it reads at the size it will be shown.
- [ ] The source is shown with the drawing, so the user can edit it.
