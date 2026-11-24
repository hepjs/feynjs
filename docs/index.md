---
hide:
  - navigation
  - toc
  - tags
tags:
  - Feynman diagram
  - JavaScript
  - SVG
  - TikZ-Feynman
  - MadGraph
  - particle physics
  - HEP
---

# feynjs { .feynjs-hidden }

<div class="feynjs-hero-stage" markdown>

<div class="feynjs-hero-logo" markdown>
![feynjs](brand/logo/logo-ink-red.svg){ .feynjs-hero .feynjs-hero--light width="460" }
![feynjs](brand/logo/logo-ink-red-dark.svg){ .feynjs-hero .feynjs-hero--dark width="460" }

Feynman diagrams, meet *Markdown*{ .feynjs-accent }. *Oh, and the web.*{ .feynjs-aside }
{ .feynjs-punch }

[Getting started](get-started/index.md){ .md-button .md-button--primary }
[Learn more](features.md){ .md-button }

</div>

<div class="feynjs-hero-showcase" markdown>

<div class="feynjs-hero-tile" markdown>

```feynman
i1 [p] -- pp [blob, pulse] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [neutralino2] e1
e1 -- f3 [Z]
e1 -- f4 [neutralino1]
d2 -- [neutralino2] e2
e2 -- f5 [neutralino1]
e2 -- f6 [Z]
d2 -- f7 [q]
d2 -- f8 [q]
```

[Full suite of line types](guide/lines.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
colour flow: on
i1 [g] -- a -- i2 [g]
a -- [gluon] b
f1 [t] -- b -- f2 [tbar]
```

[Colour flow](guide/colour-flow.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [LRJ 1b W(2j)] j1 [J]
pp -- [Z'] z
z -- [SVJ] f1 [\text{SVJ}]
z -- [EMG] f2 [\text{EJ}]
```

[Detector objects](guide/objects.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
view: kinematic
i1 [p] -- pp [blob] -- i2 [p]
pp -- [t] t1
pp -- [tbar] t2
t1 -- b1 [b]
t1 -- [W+] w1
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

[Kinematic view](guide/views.md)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
layout: grid
in: i1 i2
out: b1 l1 n1 q1 q2 b2
i1 [g] -- a
i2 [g] -- a
a -- [g] c
c -- [t] t1
c -- [tbar] t2
t1 -- [W+] w1
t1 -- b1 [b]
w1 -- l1 [e+]
w1 -- n1 [nu_e]
t2 -- [W-] w2
t2 -- b2 [bbar]
w2 -- q1 [d]
w2 -- q2 [ubar]
```

[Grid layout](guide/layout.md#the-grid)

</div>

<div class="feynjs-hero-tile" markdown>

```feynman
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b
hadron: K^{*0} = d2 s
```

[Hadrons](guide/loops-hadrons.md)

</div>

</div>

</div>
