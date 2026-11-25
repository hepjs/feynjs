---
tags:
  - Kaluza-Klein
  - Randall-Sundrum
  - graviton
  - KK gluon
---

# Extra dimensions

Extra dimensions show up as towers of heavier copies of known particles, the Kaluza–Klein excitations. A label names each: `label=G_{\mathrm{KK}}`.

## Textbook

<div class="grid cards" markdown>

-   **A Kaluza–Klein graviton to two photons**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [photon, double, label=G_{\mathrm{KK}}] b
    b -- f1 [gamma]
    b -- f2 [gamma]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [photon, double, label=G_{\mathrm{KK}}] b
    b -- f1 [gamma]
    b -- f2 [gamma]
    ```

    In the Randall–Sundrum model the graviton's excitations are heavy and couple to everything; a resonance in two photons is its cleanest sign.

-   **A Kaluza–Klein gluon to top quarks**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    The gluon's first excitation couples most strongly to the top quark.

-   **Kaluza–Klein photon pair, universal extra dimensions**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon] b
    b -- [heavy, label=q^{(1)}] c
    b -- [heavy, label=\bar q^{(1)}] d
    c -- f1 [q]
    c -- [photon, heavy, label=\gamma^{(1)}] f2
    d -- [photon, heavy, label=\gamma^{(1)}] f3
    d -- f4 [qbar]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon] b
    b -- [heavy, label=q^{(1)}] c
    b -- [heavy, label=\bar q^{(1)}] d
    c -- f1 [q]
    c -- [photon, heavy, label=\gamma^{(1)}] f2
    d -- [photon, heavy, label=\gamma^{(1)}] f3
    d -- f4 [qbar]
    ```

    Every particle has a tower of heavier copies; the lightest, the first photon excitation, could be dark matter.

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **Z', KK gluon and KK graviton to tops · a**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [Z', color=red] b
    f1 [tbar] -- b -- f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [Z', color=red] b
    f1 [tbar] -- b -- f2 [t]
    ```

    <small>ATLAS, [EXOT-2015-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-04/), figure 1a</small>

-   **Z', KK gluon and KK graviton to tops · b**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a -- i2 [g]
    a -- [G, color=red, label=G_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- a -- i2 [g]
    a -- [G, color=red, label=G_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    <small>ATLAS, [EXOT-2015-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-04/), figure 1b</small>

-   **Z', KK gluon and KK graviton to tops · c**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, color=red, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, color=red, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    <small>ATLAS, [EXOT-2015-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-04/), figure 1c</small>

-   **A graviton to W pairs · a**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [scalar, label=G^*] b
    b -- f1 [W+]
    b -- f2 [W-]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [scalar, label=G^*] b
    b -- f1 [W+]
    b -- f2 [W-]
    ```

    <small>ATLAS, [EXOT-2013-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2013-01/), auxiliary figure 1a</small>

-   **A graviton to W pairs · b**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- [fermion] a
    a -- [fermion] i2 [qbar']
    a -- [scalar, label=W'] b
    b -- f1 [W]
    b -- f2 [Z]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- [fermion] a
    a -- [fermion] i2 [qbar']
    a -- [scalar, label=W'] b
    b -- f1 [W]
    b -- f2 [Z]
    ```

    <small>ATLAS, [EXOT-2013-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2013-01/), auxiliary figure 1b</small>

-   **A graviton to Higgs pairs**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [G, label'=G^*_{KK}] b
    b -- f1 [H]
    b -- f2 [H]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [G, label'=G^*_{KK}] b
    b -- f1 [H]
    b -- f2 [H]
    ```

    <small>ATLAS, [HDBS-2018-41](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-41/), figure 1b</small>

-   **A heavy gluon to a vector-like quark**

    ```feynman
    in: i1 i2
    out: b1 b2 b3 b4
    i1 [q] -- [fermion] a
    a -- [fermion] i2 [\overline{q}]
    a -- [gluon, color=red, label=G^*] g
    g -- [B, color=red, label=B_{\mathrm{H}}] c
    b4 [\overline{b}] -- [fermion] g
    c -- [fermion] b1 [b]
    c -- [scalar, label=H] h
    h -- [fermion] b2 [b]
    b3 [\overline{b}] -- [fermion] h
    ```

    ```text
    in: i1 i2
    out: b1 b2 b3 b4
    i1 [q] -- [fermion] a
    a -- [fermion] i2 [\overline{q}]
    a -- [gluon, color=red, label=G^*] g
    g -- [B, color=red, label=B_{\mathrm{H}}] c
    b4 [\overline{b}] -- [fermion] g
    c -- [fermion] b1 [b]
    c -- [scalar, label=H] h
    h -- [fermion] b2 [b]
    b3 [\overline{b}] -- [fermion] h
    ```

    <small>ATLAS, [EXOT-2014-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-19/), figure 1</small>

</div>
