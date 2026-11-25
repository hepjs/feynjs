# About

<div class="feynjs-person" markdown>

![Jason Oliver](jason-oliver.jpg){ .feynjs-portrait width="160" height="160" }

<div markdown>

I'm **Jason Oliver**, an experimental particle physicist at Adelaide University, Australia, working
on the ATLAS experiment at CERN's Large Hadron Collider. My research has ranged from searches for
supersymmetry and studies of the Higgs boson to the trigger and tracking systems that choose,
in real time, which collisions to keep, most recently with FPGA accelerators for the
High-Luminosity LHC. Before returning to Adelaide I was a research scholar at the University of
California, Irvine; my PhD is from the University of Adelaide.

I care about how physics is shown and told: in talks, in design, and in the tools we write with.
feynjs grew out of that.

[ORCID](https://orcid.org/0000-0002-0713-6627){ .md-button }
[GitHub](https://github.com/hepjs){ .md-button }

</div>
</div>

## Why feynjs

Feynman diagrams are how particle physicists think and explain. Yet drawing one still means TeX: a
toolchain built for the printed page, a compile step, and a picture that cannot leave the PDF.
Physics now lives on the web as much as on paper, in documentation, notes, notebooks and talks,
and with arXiv's move to HTML, in the papers themselves.

feynjs's aim is to make a Feynman diagram as easy to write as a sentence, wherever physicists
write: in the syntax they already know, TikZ-Feynman's and MadGraph's; laid out as published
diagrams are drawn, with no coordinates; and drawn the same in a web page, a Markdown site, a
notebook, a note or a LaTeX paper.

## Who makes it

feynjs is written by Jason Oliver and Pengxuan Zhu, at Adelaide University, as part of
[hepjs](https://github.com/hepjs), JavaScript tools for high-energy physics. Ideas, bug reports
and diagrams that come out wrong are welcome on
[GitHub](https://github.com/hepjs/feynjs/issues); see [Contributing](guides/contributing.md).

## How to cite

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
