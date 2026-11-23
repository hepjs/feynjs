---
title: 'feynjs: Feynman diagrams for the web, written as text and laid out automatically'
tags:
  - JavaScript
  - particle physics
  - Feynman diagrams
  - visualisation
authors:
  - name: Jason Oliver
    affiliation: 1
affiliations:
  - name: (affiliation)
    index: 1
date: 23 November 2026
bibliography: references.bib
---

<!-- A draft outline, in the form the Journal of Open Source Software asks for; the same sections
grow into a longer paper (Computer Physics Communications) as needed. -->

# Summary

<!-- What feynjs is, in a paragraph: a JavaScript library that draws Feynman diagrams from a short
text description, choosing line styles, labels and positions itself, as SVG for web pages, notes
and papers. -->

# Statement of need

<!-- Who draws Feynman diagrams and where: papers (TikZ-Feynman [@Ellis:2016jkw], feynMF
[@Ohl:1995kr], AxoDraw [@Vermaseren:1994je], JaxoDraw [@Binosi:2003yf; @Binosi:2008ig]), but
increasingly web pages, notes, teaching material and talks, where LaTeX tools do not run.
What is missing: a tool that runs in a browser, reads physics notation (TikZ-Feynman's edges,
MadGraph's processes [@Alwall:2014hca]) and lays diagrams out as published papers do. -->

# The language

<!-- Edges; processes, decays, loops, production modes; options; particles by name. -->

# Layout

<!-- The force layout: what it balances (line lengths, time flowing forward, symmetry of decays,
clearance of labels), the solver, the grid and manual engines; the rules distilled from published
diagrams. -->

# Physics in the drawing

<!-- Colour flow in double-line notation [@tHooft:1973alw]; hadrons and their quarks; nuclei;
detector objects; the kinematic and lattice views. -->

# Validation

<!-- The ATLAS validation set: how many diagrams, how each was reviewed against its paper, and
the approved layouts that hold every change to account. Timing: a typical diagram lays out and
draws in a few milliseconds. -->

# Acknowledgements

# References
