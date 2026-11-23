<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/logo/logo-ink-red-dark.svg">
    <img src="docs/brand/logo/logo-ink-red.svg" alt="feynjs" width="420">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/joliverHEP/feynjs/actions/workflows/ci.yml"><img src="https://github.com/joliverHEP/feynjs/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/feynjs"><img src="https://img.shields.io/npm/v/feynjs?color=c0392b" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/feynjs"><img src="https://img.shields.io/npm/dm/feynjs" alt="npm downloads"></a>
  <a href="https://www.jsdelivr.com/package/npm/feynjs"><img src="https://data.jsdelivr.com/v1/package/npm/feynjs/badge" alt="jsDelivr"></a>
  <a href="https://joliverhep.github.io/feynjs/"><img src="https://img.shields.io/badge/docs-joliverhep.github.io%2Ffeynjs-c0392b" alt="docs"></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/licence-MIT-blue" alt="MIT licence"></a>
  <!-- DOI: once the first release is archived on Zenodo, add its badge here:
  <a href="https://doi.org/10.5281/zenodo.XXXXXXX"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg" alt="DOI"></a> -->
</p>

# feynjs

Feynman diagrams for the web, written as text and laid out automatically.

Write every line, as in TikZ-Feynman:

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

or name the process and its decays, as in MadGraph:

```feynman
p p > t t~
t > b W+(> e+ ve)
t~ > b~ W-(> d u~)
```

or a production mode, with its loops:

```feynman
ggF > H
H > {W+} > a a
```

feynjs chooses the line styles, arrows, labels and positions, following the conventions of
published diagrams, and draws dependency-free SVG that follows a page's light or dark theme.

**Documentation and live examples: <https://joliverhep.github.io/feynjs/>**

## Use it

On any web page, one script tag. Every ```` ```feynman ```` code block and every
`<div class="feynman">` is drawn once the page has loaded:

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>
```

From JavaScript (`npm install feynjs`):

```js
import { render } from "feynjs";
const svg = render("g g > {t} > H");
```

From a shell: `npx feynjs render diagram.feyn > diagram.svg` (also `check`, `describe`,
`explain`, `measure`, `tikz`).

On a Zensical or MkDocs site, add the script to `extra_javascript`; ```` ```feynman ```` blocks
are then drawn as they are:

```toml
extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"]
```

In notes: an Obsidian plugin is in `integrations/obsidian/`.

## What it draws

- **Diagrams** from lines or processes: loops (`{t}`), production modes (`ggF`, `VBF`, `VBS`),
  decays in place (`W+(> e+ ve)`), panels side by side.
- **Particles** by name, TikZ-Feynman and MadGraph alike (`t~`, `ve`, `w+`): line style, arrow,
  label and properties follow; SUSY lines in colour.
- **Hadrons** as ellipses, braces or caps; **quarks inside a hadron** with their colour flux tubes;
  **nuclei** from hydrogen to lead.
- **Colour flow** in red, green and blue; **charge colour**; **detector objects** (jets, large-R
  jets with their contents, taus, missing energy, dark-sector jets).
- **Lifetimes**, **pulses** to draw the eye, **notes** with hand-drawn arrows.
- **Views:** the kinematic (event) view, transverse or longitudinal, and the lattice view.
- **Layouts:** the force layout by default, a grid layout, and manual placement, TikZ style.
- **Export:** SVG, PNG, and TikZ-Feynman code with every vertex placed.

## Layout, and how it is held

The default layout is a balance of forces, reviewed figure by figure against Feynman diagrams
from ATLAS public results (`validation/`). Every approved layout is recorded
(`validation/layout-baseline.json`), and `npm test` fails if one moves without being approved
again.

## Develop

```bash
npm ci
npm run typecheck && npm run build && npm test
npm run docs     # the docs site into site/ (needs `pip install zensical`)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how the code is organised and how to change it.

## Cite

If feynjs helps your work, please cite it: see [CITATION.cff](CITATION.cff). A paper describing it
is in preparation.

## Licence and thanks

MIT, see [LICENSE.md](LICENSE.md); fonts and icons it carries are listed in
[THIRD-PARTY.md](THIRD-PARTY.md).

The edge syntax follows [TikZ-Feynman](https://github.com/JP-Ellis/tikz-feynman) and the
process syntax [MadGraph5_aMC@NLO](https://launchpad.net/mg5amcnlo); feynjs is an independent
implementation and owes both its notation.
