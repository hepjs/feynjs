---
tags:
  - licence
  - MIT
  - open source
  - fonts
  - citation
  - CITATION.cff
---

# Licence

feynjs is under the [MIT licence](https://github.com/hepjs/feynjs/blob/main/LICENSE.md),
copyright 2026 Jason Oliver.

## What the MIT licence allows

- **Use it anywhere:** in papers, theses, slides, websites, notes and programs, free or paid.
- **Change it** and share your changed version.
- **Bundle it** with your own code, under your own licence.

The one condition: keep the copyright notice and the licence text with any copy of the code, or
any substantial part of it. The licence comes with no warranty.

## Third-party material

The repository and its packages carry a few things under their own licences, listed in
[THIRD-PARTY.md](https://github.com/hepjs/feynjs/blob/main/THIRD-PARTY.md):

| What | Licence |
|---|---|
| New Computer Modern fonts, this site's name and page titles (in `docs/fonts/`) | GUST Font License (LPPL-based) |
| Inter fonts, this site's text face (in `docs/fonts/`) | SIL Open Font License 1.1 |
| Two Lucide icons, download and triangle-alert, drawn inline | ISC |

The edge syntax follows TikZ-Feynman and the process syntax follows MadGraph5_aMC@NLO. feynjs is
an independent implementation and contains no code from either.

## How to cite

If you use feynjs in your work, please cite it. Every release is archived on Zenodo with a DOI of
its own; [10.5281/zenodo.24497761](https://doi.org/10.5281/zenodo.24497761) always resolves to the
latest. Cite the version you used:

```bibtex
@software{feynjs,
  author  = {Oliver, Jason and Zhu, Pengxuan},
  title   = {feynjs: a JavaScript engine for Feynman diagrams},
  version = {0.9.4},
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
