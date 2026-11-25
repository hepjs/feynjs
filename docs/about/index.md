# About

<p class="feynjs-belief">Growing the field means learning how to share and work together at greater scales.</p>

## Why feynjs exists

Particle physics is done by thousands of people, in collaborations that span continents and
decades. What lets them work together is a shared language, and Feynman diagrams are a large part
of it: how physicists think about a process, explain it to each other, and teach it to the next
generation.

Yet drawing one is still a craft of the printed page. It means TeX, a compile step and
coordinates placed by hand, and the result is locked inside a PDF. Meanwhile the field's knowledge
has moved to the web: documentation, notes, notebooks, talks, and, with arXiv's move to HTML, the
papers themselves. A diagram that cannot go where the writing goes is one that is not shared.

feynjs makes a Feynman diagram as easy to write as a sentence, wherever physicists write:

- **in the words physicists already use:** TikZ-Feynman's syntax, MadGraph's process lines, the
  names of particles;
- **laid out as published diagrams are drawn,** with no coordinates, so a diagram looks right the
  first time;
- **the same everywhere:** in a web page, a Markdown site, a notebook, a note or a LaTeX paper.

## Who makes it

<div class="feynjs-person" markdown>

![Jason Oliver](jason-oliver.jpg){ .feynjs-portrait width="160" height="160" }

<div markdown>

I'm **Jason Oliver**, an experimental particle physicist at Adelaide University, Australia, on
the ATLAS experiment at CERN. I've worked on searches for supersymmetry, on the Higgs boson, and
on the systems that select collisions as they happen. More and more of my time goes into how a
collaboration finds and shares what it knows: ATLAS's web pages, and a search built on OpenSearch
that people and AI assistants can both use. feynjs comes from the same place.

feynjs is written with Pengxuan Zhu, at Adelaide University, as part of
[hepjs](https://github.com/hepjs), JavaScript tools for high-energy physics.

[ORCID](https://orcid.org/0000-0002-0713-6627){ .md-button }
[GitHub](https://github.com/hepjs){ .md-button }

</div>
</div>

Ideas, bug reports and diagrams that come out wrong are welcome on
[GitHub](https://github.com/hepjs/feynjs/issues); see [Contributing](contributing.md).

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
