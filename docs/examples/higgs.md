---
tags:
  - Higgs boson
  - gluon fusion
  - VBF
  - VH
  - ttH
  - di-Higgs
---

# Higgs

How the LHC makes a Higgs boson, how it decays, pairs of them, and the extended Higgs sectors searched for beyond.

```feynman
--- (a) gluon fusion
ggF > H
--- (b) vector-boson fusion
VBF > H
--- (c) with a W or Z
label: W* = V^*
label: W = V
q qbar' > W* > W H
--- (d) with a top pair
i1 [g] -- a
i2 [g] -- b
f3 [tbar] -- [fermion] b
b -- [fermion, label=t] c -- [fermion, label=t] a
a -- [fermion] f1 [t]
c -- f2 [H]
--- (e) with a single top
i1 [q] -- a -- f1 [q']
i2 [b] -- b -- f3 [t]
a -- [W] c -- [W] b
c -- f2 [H]
--- (f) ZH from gluons
g g > {t} > Z H
```

```text
--- (a) gluon fusion
ggF > H
--- (b) vector-boson fusion
VBF > H
--- (c) with a W or Z
label: W* = V^*
label: W = V
q qbar' > W* > W H
--- (d) with a top pair
i1 [g] -- a
i2 [g] -- b
f3 [tbar] -- [fermion] b
b -- [fermion, label=t] c -- [fermion, label=t] a
a -- [fermion] f1 [t]
c -- f2 [H]
--- (e) with a single top
i1 [q] -- a -- f1 [q']
i2 [b] -- b -- f3 [t]
a -- [W] c -- [W] b
c -- f2 [H]
--- (f) ZH from gluons
g g > {t} > Z H
```

Six ways the LHC makes a Higgs boson; gluon fusion alone makes nearly nine in ten. `ggF` and `VBF` stand for
the gluon-fusion loop and the two forward quark lines; `label:` renames a particle wherever it
appears, so the W of the third panel is drawn as a V. Every diagram on this page is drawn in your browser
from the source beneath it; copy one as a starting point.


## Production and decay

<div class="grid cards" markdown>

-   **Gluon fusion, the loop written out**

    ```feynman
    g g > {t} > H
    ```

    ```text
    g g > {t} > H
    ```

    `ggF > H` is short for this. A particle in braces is a loop of that particle: here the top
    triangle.

-   **H → bb̄**

    ```feynman
    H > b bbar
    ```

    ```text
    H > b bbar
    ```

    The largest branching fraction, about 58%.

-   **H → γγ, W loop**

    ```feynman
    H > {W} > a a
    ```

    ```text
    H > {W} > a a
    ```

    The photons (`a`, as MadGraph writes them) couple to the Higgs only through a loop. The W
    loop dominates...

-   **H → γγ, top loop**

    ```feynman
    H > {t} > a a
    ```

    ```text
    H > {t} > a a
    ```

    ...and the top loop interferes with it destructively.

-   **H → ZZ\* → 4ℓ**

    ```feynman
    H > Z Z*
    Z > l+ l-
    Z* > l+ l-
    ```

    ```text
    H > Z Z*
    Z > l+ l-
    Z* > l+ l-
    ```

    One Z on shell and one off it (Z\*), since the Higgs is lighter than two Z bosons.

-   **H → WW\* → ℓνℓν**

    ```feynman
    label: nubar = \bar\nu_\ell
    H > W+ W-
    W+ > l+ nu_l
    W- > l- nubar
    ```

    ```text
    label: nubar = \bar\nu_\ell
    H > W+ W-
    W+ > l+ nu_l
    W- > l- nubar
    ```

    Likewise one W is off shell. The two neutrinos leave the detector unseen.

-   **Di-Higgs, gg → HH, triangle**

    ```feynman
    ggF > H > H H
    ```

    ```text
    ggF > H > H H
    ```

    Only the triangle carries the Higgs self-coupling...

-   **Di-Higgs, gg → HH, box**

    ```feynman
    g g > {t} > H H
    ```

    ```text
    g g > {t} > H H
    ```

    ...the box does not, and the two interfere destructively.

-   **Higgs-strahlung**

    ```feynman
    i1 [q] -- a -- i2 [qbar']
    a -- [W*] b
    b -- [W] c
    b -- [H] d
    c -- f1 [l]
    c -- f2 [nubar]
    d -- f3 [b]
    d -- f4 [bbar]
    ```

    ```text
    i1 [q] -- a -- i2 [qbar']
    a -- [W*] b
    b -- [W] c
    b -- [H] d
    c -- f1 [l]
    c -- f2 [nubar]
    d -- f3 [b]
    d -- f4 [bbar]
    ```

-   **Di-Higgs with coupling labels**

    ```feynman
    i1 [g] -- a
    i2 [g] -- b
    a -- [fermion] c -- [fermion] b -- [fermion] a
    c [dot, label=\kappa_t, color=teal] -- [H] v [dot, label=\kappa_\lambda, color=pink]
    v -- f1 [H]
    v -- f2 [H]
    ```

    ```text
    i1 [g] -- a
    i2 [g] -- b
    a -- [fermion] c -- [fermion] b -- [fermion] a
    c [dot, label=\kappa_t, color=teal] -- [H] v [dot, label=\kappa_\lambda, color=pink]
    v -- f1 [H]
    v -- f2 [H]
    ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **Gluon fusion**

    ```feynman
    in: g1 g2
    out: h
    g1 [g] -- [gluon] a
    g2 [g] -- [gluon] b
    a -- [plain] c -- [plain] b -- [plain, label=t] a
    c -- [dotted] h [H]
    ```

    ```text
    in: g1 g2
    out: h
    g1 [g] -- [gluon] a
    g2 [g] -- [gluon] b
    a -- [plain] c -- [plain] b -- [plain, label=t] a
    c -- [dotted] h [H]
    ```

    <small>ATLAS, [HIGG-2012-28](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2012-28/), figure 3</small>

-   **Vector-boson fusion · a**

    ```feynman
    in: i1 i2
    out: f1 h f2
    i1 [q] -- [plain] a -- [plain] f1 [q]
    i2 [q'] -- [plain] b -- [plain] f2 [q']
    a -- [V] x -- [V] b
    x -- [charged scalar, label=H] h
    ```

    ```text
    in: i1 i2
    out: f1 h f2
    i1 [q] -- [plain] a -- [plain] f1 [q]
    i2 [q'] -- [plain] b -- [plain] f2 [q']
    a -- [V] x -- [V] b
    x -- [charged scalar, label=H] h
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2016-008](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2016-008/), figure 1a</small>

-   **Vector-boson fusion · b**

    ```feynman
    in: i1 i2
    out: f1 h f2
    i1 [q] -- [plain] b [dot]
    i2 [q'] -- [plain] a [dot]
    a -- [plain] f1 [q']
    b -- [plain] f2 [q]
    a -- [V] x [dot] -- [V] b
    x -- [scalar] h [H]
    ```

    ```text
    in: i1 i2
    out: f1 h f2
    i1 [q] -- [plain] b [dot]
    i2 [q'] -- [plain] a [dot]
    a -- [plain] f1 [q']
    b -- [plain] f2 [q]
    a -- [V] x [dot] -- [V] b
    x -- [scalar] h [H]
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2016-008](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2016-008/), figure 1b</small>

-   **Vector-boson fusion · c**

    ```feynman
    in: i1 i2
    out: h f1 f2
    i1 [q] -- [plain] a
    i2 [q] -- [plain] a
    a -- [V] x [dot]
    x -- [V] b
    x -- [scalar] h [H]
    b -- [plain] f1 [q']
    b -- [plain] f2 [q']
    ```

    ```text
    in: i1 i2
    out: h f1 f2
    i1 [q] -- [plain] a
    i2 [q] -- [plain] a
    a -- [V] x [dot]
    x -- [V] b
    x -- [scalar] h [H]
    b -- [plain] f1 [q']
    b -- [plain] f2 [q']
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2016-008](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2016-008/), figure 1c</small>

-   **VH, H → WW* · a**

    ```feynman
    in: qb q
    out: l3 l2 n1 l1 n0 l0
    q [q] -- [fermion] a -- [fermion] qb [\bar q]
    a -- [boson, label=Z^0] b
    b -- [boson, label=Z^0] z
    b -- [scalar, label'=H^0] h
    l3 [\ell_3^\pm] -- [fermion] z -- [fermion] l2 [\ell_2^\mp]
    h -- [boson, label=W^\pm] w1
    h -- [boson, label'=W^\mp] w2
    l1 [\ell_1^\pm] -- [fermion] w1 -- [fermion] n1 [\bar\nu]
    n0 [\bar\nu] -- [fermion] w2 -- [fermion] l0 [\ell_0^\mp]
    ```

    ```text
    in: qb q
    out: l3 l2 n1 l1 n0 l0
    q [q] -- [fermion] a -- [fermion] qb [\bar q]
    a -- [boson, label=Z^0] b
    b -- [boson, label=Z^0] z
    b -- [scalar, label'=H^0] h
    l3 [\ell_3^\pm] -- [fermion] z -- [fermion] l2 [\ell_2^\mp]
    h -- [boson, label=W^\pm] w1
    h -- [boson, label'=W^\mp] w2
    l1 [\ell_1^\pm] -- [fermion] w1 -- [fermion] n1 [\bar\nu]
    n0 [\bar\nu] -- [fermion] w2 -- [fermion] l0 [\ell_0^\mp]
    ```

    <small>ATLAS, [HIGG-2013-15](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-15/), figure 1a</small>

-   **VH, H → WW* · b**

    ```feynman
    in: qb q
    out: n2 l2 n1 l1 n0 l0
    q [q] -- [fermion] a -- [fermion] qb [\bar q]
    a -- [boson, label=W^\pm] b
    b -- [boson, label=W^\pm] z
    b -- [scalar, label'=H^0] h
    l2 [\ell_2^\pm] -- [fermion] z -- [fermion] n2 [\bar\nu]
    h -- [boson, label=W^\pm] w1
    h -- [boson, label'=W^\mp] w2
    l1 [\ell_1^\pm] -- [fermion] w1 -- [fermion] n1 [\bar\nu]
    n0 [\bar\nu] -- [fermion] w2 -- [fermion] l0 [\ell_0^\mp]
    ```

    ```text
    in: qb q
    out: n2 l2 n1 l1 n0 l0
    q [q] -- [fermion] a -- [fermion] qb [\bar q]
    a -- [boson, label=W^\pm] b
    b -- [boson, label=W^\pm] z
    b -- [scalar, label'=H^0] h
    l2 [\ell_2^\pm] -- [fermion] z -- [fermion] n2 [\bar\nu]
    h -- [boson, label=W^\pm] w1
    h -- [boson, label'=W^\mp] w2
    l1 [\ell_1^\pm] -- [fermion] w1 -- [fermion] n1 [\bar\nu]
    n0 [\bar\nu] -- [fermion] w2 -- [fermion] l0 [\ell_0^\mp]
    ```

    <small>ATLAS, [HIGG-2013-15](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-15/), figure 1b</small>

-   **tt̄H**

    ```feynman
    in: g1 g2
    out: t1 b1 b2 t2
    g1 [particle={g}]
    g2 [particle={g}]
    t1 [particle={t}]
    t2 [particle={\bar{t}}]
    b1 [particle={b}]
    b2 [particle={\bar{b}}]
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    t2 -- [fermion] v2
    v2 -- [fermion] h
    h -- [fermion] v1
    v1 -- [fermion] t1
    h -- [charged scalar, label={H}] d
    d -- [fermion] b1
    b2 -- [fermion] d
    ```

    ```text
    in: g1 g2
    out: t1 b1 b2 t2
    g1 [particle={g}]
    g2 [particle={g}]
    t1 [particle={t}]
    t2 [particle={\bar{t}}]
    b1 [particle={b}]
    b2 [particle={\bar{b}}]
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    t2 -- [fermion] v2
    v2 -- [fermion] h
    h -- [fermion] v1
    v1 -- [fermion] t1
    h -- [charged scalar, label={H}] d
    d -- [fermion] b1
    b2 -- [fermion] d
    ```

    <small>ATLAS, [HIGG-2013-27](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-27/), figure 1a</small>

-   **tHq and WtH · a**

    ```feynman
    in: q g
    out: qp h t bb
    q [q] -- [fermion] a -- [fermion] qp [q']
    a -- [boson] c
    g [g] -- [gluon] d
    bb [b] -- [fermion] d -- [fermion] c -- [fermion] e -- [fermion] t [t]
    e -- [charged scalar] h [H]
    ```

    ```text
    in: q g
    out: qp h t bb
    q [q] -- [fermion] a -- [fermion] qp [q']
    a -- [boson] c
    g [g] -- [gluon] d
    bb [b] -- [fermion] d -- [fermion] c -- [fermion] e -- [fermion] t [t]
    e -- [charged scalar] h [H]
    ```

    <small>ATLAS, [HIGG-2013-25](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-25/), figure 1a</small>

-   **tHq and WtH · b**

    ```feynman
    in: q g
    out: qp h t bb
    q [q] -- [fermion] a -- [fermion] qp [q']
    a -- [boson] w -- [boson] c
    w -- [charged scalar] h [H]
    g [g] -- [gluon] d
    bb [b] -- [fermion] d -- [fermion] c -- [fermion] t [t]
    ```

    ```text
    in: q g
    out: qp h t bb
    q [q] -- [fermion] a -- [fermion] qp [q']
    a -- [boson] w -- [boson] c
    w -- [charged scalar] h [H]
    g [g] -- [gluon] d
    bb [b] -- [fermion] d -- [fermion] c -- [fermion] t [t]
    ```

    <small>ATLAS, [HIGG-2013-25](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-25/), figure 1b</small>

-   **HH from gluons · a**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- t1
    i2 [g] -- t2
    k1 [dot, color=#36b0c0, label=\kappa_t]
    k2 [dot, color=#36b0c0, label=\kappa_t]
    t2 -- [fermion] t1 -- [fermion] k1 -- [fermion] k2 -- [fermion] t2
    k1 -- f1 [H]
    k2 -- f2 [H]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- t1
    i2 [g] -- t2
    k1 [dot, color=#36b0c0, label=\kappa_t]
    k2 [dot, color=#36b0c0, label=\kappa_t]
    t2 -- [fermion] t1 -- [fermion] k1 -- [fermion] k2 -- [fermion] t2
    k1 -- f1 [H]
    k2 -- f2 [H]
    ```

    <small>ATLAS, [HDBS-2019-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2019-04/), figure 1a</small>

-   **HH from gluons · b**

    ```feynman
    in: i1 i2
    out: f1 h1 h2 f2
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f2 [q]
    k [dot, color=#22c022, label=\kappa_{2V}]
    a -- [V, label'=V] k
    b -- [V, label'=V] k
    k -- h1 [H]
    k -- h2 [H]
    ```

    ```text
    in: i1 i2
    out: f1 h1 h2 f2
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f2 [q]
    k [dot, color=#22c022, label=\kappa_{2V}]
    a -- [V, label'=V] k
    b -- [V, label'=V] k
    k -- h1 [H]
    k -- h2 [H]
    ```

    <small>ATLAS, [HDBS-2019-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2019-04/), figure 2a</small>

-   **HH by vector-boson fusion · a**

    ```feynman
    in: i1 i2
    out: f1 h1 h2 f2
    i1 [q] -- [plain] a -- [plain] f1 [q]
    i2 [q] -- [plain] b -- [plain] f2 [q]
    k1 [dot, color=#f39c34, label=\kappa_V]
    k2 [dot, color=#f39c34, label=\kappa_V]
    a -- [boson] k1
    b -- [boson] k2
    k1 -- [boson] k2
    k1 -- [scalar] h1 [H]
    k2 -- [scalar] h2 [H]
    ```

    ```text
    in: i1 i2
    out: f1 h1 h2 f2
    i1 [q] -- [plain] a -- [plain] f1 [q]
    i2 [q] -- [plain] b -- [plain] f2 [q]
    k1 [dot, color=#f39c34, label=\kappa_V]
    k2 [dot, color=#f39c34, label=\kappa_V]
    a -- [boson] k1
    b -- [boson] k2
    k1 -- [boson] k2
    k1 -- [scalar] h1 [H]
    k2 -- [scalar] h2 [H]
    ```

    <small>ATLAS, [HDBS-2018-18](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-18/), figure 1b</small>

-   **HH by vector-boson fusion · b**

    ```feynman
    in: i1 i2
    out: o1 h1 h2 o2
    i1 [particle={q}]
    i2 [particle={q}]
    o1 [particle={q}]
    o2 [particle={q}]
    h [dot, color=#009688]
    h1 [particle={H}]
    h2 [particle={H}]
    i1 -- [plain] v1
    v1 -- [plain] o1
    i2 -- [plain] v2
    v2 -- [plain] o2
    v1 -- [photon] h
    v2 -- [photon] h
    h -- [scalar] h1
    h -- [scalar, label={\kappa_{2V}}] h2
    ```

    ```text
    in: i1 i2
    out: o1 h1 h2 o2
    i1 [particle={q}]
    i2 [particle={q}]
    o1 [particle={q}]
    o2 [particle={q}]
    h [dot, color=#009688]
    h1 [particle={H}]
    h2 [particle={H}]
    i1 -- [plain] v1
    v1 -- [plain] o1
    i2 -- [plain] v2
    v2 -- [plain] o2
    v1 -- [photon] h
    v2 -- [photon] h
    h -- [scalar] h1
    h -- [scalar, label={\kappa_{2V}}] h2
    ```

    <small>ATLAS, [HDBS-2018-18](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-18/), figure 1c</small>

-   **The Higgs self-coupling in a loop**

    ```feynman
    in: i
    out: o
    i [particle={\textsf{\textit{H}}}]
    o [particle={\textsf{\textit{H}}}]
    a [dot, label={\kappa_\lambda}, color=#ec345c]
    b [dot, label={\kappa_\lambda}, color=#ec345c]
    i -- [scalar, color=#ec345c] a
    b -- [scalar, color=#ec345c] o
    a -- [scalar, half left, color=#ec345c] b
    b -- [scalar, half left, color=#ec345c] a
    ```

    ```text
    in: i
    out: o
    i [particle={\textsf{\textit{H}}}]
    o [particle={\textsf{\textit{H}}}]
    a [dot, label={\kappa_\lambda}, color=#ec345c]
    b [dot, label={\kappa_\lambda}, color=#ec345c]
    i -- [scalar, color=#ec345c] a
    b -- [scalar, color=#ec345c] o
    a -- [scalar, half left, color=#ec345c] b
    b -- [scalar, half left, color=#ec345c] a
    ```

    <small>ATLAS, [HIGG-2023-11](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2023-11/), figure 33a</small>

-   **H → Zγ · a**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- t1
    i2 [g] -- t2
    t3 -- [fermion] t1 -- [fermion] t2 -- [fermion] t3
    t3 -- [H] h
    h -- [Z] z
    h -- [scalar, label'=a] a
    z -- f1 [l+]
    z -- f2 [l-]
    a -- f3 [gamma]
    a -- f4 [gamma]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- t1
    i2 [g] -- t2
    t3 -- [fermion] t1 -- [fermion] t2 -- [fermion] t3
    t3 -- [H] h
    h -- [Z] z
    h -- [scalar, label'=a] a
    z -- f1 [l+]
    z -- f2 [l-]
    a -- f3 [gamma]
    a -- f4 [gamma]
    ```

    <small>ATLAS, [HDBS-2019-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2019-09/), auxiliary figure 1a</small>

-   **H → Zγ · b**

    ```feynman
    in: i1 i2
    out: o1 f1 f2 f3 f4 o2
    i1 [q] -- a -- o1 [q']
    i2 [q] -- b -- o2 [q']
    a -- [W] v
    b -- [W] v
    v -- [H, label'=H] h
    h -- [Z] z
    h -- [scalar, label'=a] x
    z -- f1 [l+]
    z -- f2 [l-]
    x -- f3 [gamma]
    x -- f4 [gamma]
    ```

    ```text
    in: i1 i2
    out: o1 f1 f2 f3 f4 o2
    i1 [q] -- a -- o1 [q']
    i2 [q] -- b -- o2 [q']
    a -- [W] v
    b -- [W] v
    v -- [H, label'=H] h
    h -- [Z] z
    h -- [scalar, label'=a] x
    z -- f1 [l+]
    z -- f2 [l-]
    x -- f3 [gamma]
    x -- f4 [gamma]
    ```

    <small>ATLAS, [HDBS-2019-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2019-09/), auxiliary figure 1b</small>

-   **Doubly charged Higgs**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [q] -- a
    i2 [qbar] -- a
    a -- [boson, label=\gamma^*/Z^*] b
    b -- [scalar, label'=H^{- -}] hm
    b -- [scalar, label=H^{++}] hp
    hm -- f1 [W-]
    hm -- f2 [W-]
    hp -- f3 [W+]
    hp -- f4 [W+]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [q] -- a
    i2 [qbar] -- a
    a -- [boson, label=\gamma^*/Z^*] b
    b -- [scalar, label'=H^{- -}] hm
    b -- [scalar, label=H^{++}] hp
    hm -- f1 [W-]
    hm -- f2 [W-]
    hp -- f3 [W+]
    hp -- f4 [W+]
    ```

    <small>ATLAS, [HDBS-2019-06](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2019-06/), figure 1a</small>

-   **A → ZH · a**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- t1
    i2 [g] -- t2
    t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
    t3 -- [A, label'=A] a
    a -- [Z] z
    a -- [H] h
    z -- f1 [l-]
    z -- f2 [l+]
    h -- f3 [bbar]
    h -- f4 [b]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- t1
    i2 [g] -- t2
    t2 -- [fermion] t1 -- [fermion] t3 -- [fermion] t2
    t3 -- [A, label'=A] a
    a -- [Z] z
    a -- [H] h
    z -- f1 [l-]
    z -- f2 [l+]
    h -- f3 [bbar]
    h -- f4 [b]
    ```

    <small>ATLAS, [HDBS-2018-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-13/), figure 1a</small>

-   **A → ZH · b**

    ```feynman
    in: g1 g2
    out: bb lm lp bb2 b2 bq
    lm [particle={\ell^-}]
    lp [particle={\ell^+}]
    bb2 [particle={\bar{b}}]
    b2 [particle={b}]
    g1 -- [gluon, label'={g}] a
    g2 -- [gluon, label={g}] b
    bb -- [fermion, label={\bar{b}}] a
    a -- [fermion] c
    c -- [fermion] b
    b -- [fermion, label'={b}] bq
    c -- [scalar, label'={A}] d
    d -- [photon, label={Z}] z
    d -- [scalar, label'={H}] h
    z -- [fermion] lm
    lp -- [fermion] z
    bb2 -- [fermion] h
    h -- [fermion] b2
    ```

    ```text
    in: g1 g2
    out: bb lm lp bb2 b2 bq
    lm [particle={\ell^-}]
    lp [particle={\ell^+}]
    bb2 [particle={\bar{b}}]
    b2 [particle={b}]
    g1 -- [gluon, label'={g}] a
    g2 -- [gluon, label={g}] b
    bb -- [fermion, label={\bar{b}}] a
    a -- [fermion] c
    c -- [fermion] b
    b -- [fermion, label'={b}] bq
    c -- [scalar, label'={A}] d
    d -- [photon, label={Z}] z
    d -- [scalar, label'={H}] h
    z -- [fermion] lm
    lp -- [fermion] z
    bb2 -- [fermion] h
    h -- [fermion] b2
    ```

    <small>ATLAS, [HDBS-2018-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-13/), figure 1b</small>

-   **A Higgs cascade**

    ```feynman
    in: g1 g2
    out: w1 w2 b1 b2
    l [empty dot]
    g1 [particle={g}]
    g2 [particle={g}]
    w1 [particle={W}]
    w2 [particle={W}]
    b1 [particle={b}]
    b2 [particle={b}]
    g1 -- [gluon] l
    g2 -- [gluon] l
    l -- [charged scalar, label'={H^0}] a
    a -- [photon] w1
    a -- [charged scalar, label'={H^{\pm}}] b
    b -- [photon] w2
    b -- [charged scalar, label'={h^0}] c
    b1 -- [fermion] c
    c -- [fermion] b2
    ```

    ```text
    in: g1 g2
    out: w1 w2 b1 b2
    l [empty dot]
    g1 [particle={g}]
    g2 [particle={g}]
    w1 [particle={W}]
    w2 [particle={W}]
    b1 [particle={b}]
    b2 [particle={b}]
    g1 -- [gluon] l
    g2 -- [gluon] l
    l -- [charged scalar, label'={H^0}] a
    a -- [photon] w1
    a -- [charged scalar, label'={H^{\pm}}] b
    b -- [photon] w2
    b -- [charged scalar, label'={h^0}] c
    b1 -- [fermion] c
    c -- [fermion] b2
    ```

    <small>ATLAS, [HIGG-2013-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HIGG-2013-04/), figure 1</small>

</div>
