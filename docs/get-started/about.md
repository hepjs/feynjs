# About

Upgrading to a new release, the browsers and Node versions feynjs runs in, and its licence.

## Upgrading

| Where you use feynjs | To upgrade |
|---|---|
| npm | `npm install feynjs@latest` |
| jsDelivr link, `feynjs@0.10` | nothing for a 0.10.x release; change the link for 0.11 |
| Obsidian | replace the plugin folder with the one from the new release |

Versions follow [semantic versioning](https://semver.org). Before 1.0, a new minor version (0.9
to 0.10) may change how a diagram is written. A layout that moves counts as a change too. Each
one is in the [changelog](#changelog) below.

### npm

```sh
npm install feynjs@latest
```

This updates `package.json` and the `feynjs` command too. Check with `npx feynjs check FILE` on a
few of your diagrams.

### The jsDelivr link

A link to `feynjs@0.10` picks up each 0.10.x release on its own:

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>
```

jsDelivr can cache the version a range points to for up to about 12 hours, so a page may draw
with the previous release for that long after a new one is out.

A new minor version needs a new link. For 0.11, change `@0.10` to `@0.11` wherever the script is
loaded: `extra_javascript` in `zensical.toml` or `mkdocs.yml`, or the `<script>` tag. To stay on
one exact release, write it in full, such as `feynjs@0.10.0`. Pages still linking `feynjs@0.9`
keep drawing with 0.9.5, the last 0.9 release.

### Obsidian

1.  Download `feynjs-obsidian.zip` from the
    [latest release](https://github.com/hepjs/feynjs/releases/latest) and unzip it.
2.  Replace the `feynjs` folder in `<vault>/.obsidian/plugins/` with the new one.
3.  In *Settings → Community plugins*, switch **feynjs** off and on again, or restart Obsidian.

The plugin keeps no settings of its own, so nothing is lost when its folder is replaced.

### Changelog

The full list is in
[CHANGELOG.md](https://github.com/hepjs/feynjs/blob/main/CHANGELOG.md). In short:

**0.9.3** (2026-11-24)
:   Every part of a drawing is named in the SVG (`data-edge`, `data-vertex`) and the diagram is
    written into it as JSON. The [playground](../playground.md). The grid and the lattice view
    stay faint on dark pages. Releases carry the Obsidian plugin as `feynjs-obsidian.zip`.
    Cascades on the grid layout are drawn as a level spine with what they give off hanging from it.

**0.9.1** (2026-11-24)
:   In Zensical and MkDocs, diagrams are drawn again after each instant page change, so the
    script and the `feynman` fence are all a site needs.

**0.9.0** (2026-11-23)
:   The first public release: the edge and process syntaxes, every TikZ-Feynman line style, the
    force, grid and manual layouts, the kinematic and lattice views, the npm package, the command
    line, TikZ export and the Obsidian plugin.

## Licence

feynjs is under the [MIT licence](https://github.com/hepjs/feynjs/blob/main/LICENSE.md),
copyright 2026 Jason Oliver.

### What the MIT licence allows

- **Use it anywhere:** in papers, theses, slides, websites, notes and programs, free or paid.
- **Change it** and share your changed version.
- **Bundle it** with your own code, under your own licence.

The one condition: keep the copyright notice and the licence text with any copy of the code, or
any substantial part of it. The licence comes with no warranty.

### Third-party material

The repository and its packages carry a few things under their own licences, listed in
[THIRD-PARTY.md](https://github.com/hepjs/feynjs/blob/main/THIRD-PARTY.md):

| What | Licence |
|---|---|
| New Computer Modern fonts, this site's name and page titles (in `docs/fonts/`) | GUST Font License (LPPL-based) |
| Inter fonts, this site's text face (in `docs/fonts/`) | SIL Open Font License 1.1 |
| Two Lucide icons, download and triangle-alert, drawn inline | ISC |

The edge syntax follows TikZ-Feynman and the process syntax follows MadGraph5_aMC@NLO. feynjs is
an independent implementation and contains no code from either.

### How to cite

If you use feynjs in your work, please cite it. Every release is archived on Zenodo with a DOI of
its own; [10.5281/zenodo.24497761](https://doi.org/10.5281/zenodo.24497761) always resolves to the
latest. Cite the version you used:

```bibtex
@software{feynjs,
  author  = {Oliver, Jason and Zhu, Pengxuan},
  title   = {feynjs: a JavaScript engine for Feynman diagrams},
  version = {0.10.0},
  year    = {2026},
  doi     = {10.5281/zenodo.24497762},
  url     = {https://github.com/hepjs/feynjs},
  license = {MIT}
}
```

The repository's [CITATION.cff](https://github.com/hepjs/feynjs/blob/main/CITATION.cff) has the
same details, and GitHub's *Cite this repository* button turns it into BibTeX or APA.

The two tools whose syntax feynjs follows have papers of their own: TikZ-Feynman (J. Ellis,
Comput. Phys. Commun. 210 (2017) 103) and MadGraph5_aMC@NLO (J. Alwall et al., JHEP 07 (2014) 079).
