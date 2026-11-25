---
tags:
  - beyond the Standard Model
---

# Beyond the Standard Model

New particles searched for at the LHC: dark matter, leptoquarks and heavy neutrinos,
supersymmetry, and extra dimensions.

## New particles

<div class="grid cards" markdown>

-   **Mono-X with initial-state radiation**

    ```feynman
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```

    ````markdown
    ```feynman
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```
    ````

-   **Dark-photon cascade**

    ```feynman
    % ATLAS-CONF-2011-076 Fig. 1, written with defaults only
    q1 [q] -- a -- [squark] c
    q2 [qbar] -- b -- [squark] d
    a -- [gluino] b
    c -- qt [q]
    c -- [plain, label=\tilde{N}_1] e
    e -- fd1 [f_d]
    e -- [photon, label=\gamma_d] g
    g -- l1 [l+]
    g -- l2 [l-]
    d -- [plain, label=\tilde{N}_1] f
    f -- [photon, label=\gamma_d] h
    h -- l3 [l+]
    h -- l4 [l-]
    f -- fd2 [f_d]
    d -- qb [q]
    ```

    ````markdown
    ```feynman
    % ATLAS-CONF-2011-076 Fig. 1, written with defaults only
    q1 [q] -- a -- [squark] c
    q2 [qbar] -- b -- [squark] d
    a -- [gluino] b
    c -- qt [q]
    c -- [plain, label=\tilde{N}_1] e
    e -- fd1 [f_d]
    e -- [photon, label=\gamma_d] g
    g -- l1 [l+]
    g -- l2 [l-]
    d -- [plain, label=\tilde{N}_1] f
    f -- [photon, label=\gamma_d] h
    h -- l3 [l+]
    h -- l4 [l-]
    f -- fd2 [f_d]
    d -- qb [q]
    ```
    ````

-   **A leptoquark, from ATLAS**

    ```feynman
    in: lq
    out: l q
    lq -- [charged scalar, label={LQ}] v [label=\sqrt{\beta}\lambda]
    v -- [fermion, label'={l}] l
    q -- [fermion, label'={q}] v
    ```

    ````markdown
    ```feynman
    in: lq
    out: l q
    lq -- [charged scalar, label={LQ}] v [label=\sqrt{\beta}\lambda]
    v -- [fermion, label'={l}] l
    q -- [fermion, label'={q}] v
    ```
    ````

    <small>ATLAS, [EXOT-2015-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-19/), figure 1</small>

-   **A heavy Majorana neutrino, from ATLAS**

    ```feynman
    in: i1 i2
    out: la lb qc qd
    i1 [q_a] -- [fermion] a
    a -- [fermion] i2 [\bar q_b]
    a -- [boson, label=(W^\pm)^*] b
    b -- [fermion] la [l^\pm_\alpha]
    b -- [heavy, no arrow, color=red, label=N] c
    c -- [fermion] lb [l^\pm_\beta]
    c -- [boson, label'=W^\mp] w
    w -- [fermion] qc [q_c]
    qd [\bar q_d] -- [fermion] w
    ```

    ````markdown
    ```feynman
    in: i1 i2
    out: la lb qc qd
    i1 [q_a] -- [fermion] a
    a -- [fermion] i2 [\bar q_b]
    a -- [boson, label=(W^\pm)^*] b
    b -- [fermion] la [l^\pm_\alpha]
    b -- [heavy, no arrow, color=red, label=N] c
    c -- [fermion] lb [l^\pm_\beta]
    c -- [boson, label'=W^\mp] w
    w -- [fermion] qc [q_c]
    qd [\bar q_d] -- [fermion] w
    ```
    ````

    <small>ATLAS, [EXOT-2012-24](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2012-24/), figure 1</small>

</div>

## Supersymmetry

<div class="grid cards" markdown>

-   **Squark and gluino**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [squark]
    i2 [g] -- b
    a -- [gluino] b
    b -- f2 [gluino]
    ```

    ````markdown
    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [squark]
    i2 [g] -- b
    a -- [gluino] b
    b -- f2 [gluino]
    ```
    ````

-   **Slepton pair**

    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [gamma] b
    b -- [slepton] c
    b -- [slepton] d
    c -- f1 [l]
    c -- f2 [neutralino]
    d -- f3 [l]
    d -- f4 [neutralino]
    ```

    ````markdown
    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [gamma] b
    b -- [slepton] c
    b -- [slepton] d
    c -- f1 [l]
    c -- f2 [neutralino]
    d -- f3 [l]
    d -- f4 [neutralino]
    ```
    ````

-   **Four-stage SUSY cascade**

    ```feynman
    i1 [p] -- pp [blob] -- i2 [p]
    pp -- [gluino] d1
    pp -- [gluino] d2
    d1 -- f1 [q]
    d1 -- f2 [q]
    d1 -- [chargino] e1
    e1 -- f3 [W]
    e1 -- [neutralino2] g1
    g1 -- f4 [Z]
    g1 -- f5 [neutralino1]
    d2 -- [chargino] e2
    e2 -- [neutralino2] g2
    e2 -- f6 [W]
    g2 -- f7 [neutralino1]
    g2 -- f8 [Z]
    d2 -- f9 [q]
    d2 -- f10 [q]
    ```

    ````markdown
    ```feynman
    i1 [p] -- pp [blob] -- i2 [p]
    pp -- [gluino] d1
    pp -- [gluino] d2
    d1 -- f1 [q]
    d1 -- f2 [q]
    d1 -- [chargino] e1
    e1 -- f3 [W]
    e1 -- [neutralino2] g1
    g1 -- f4 [Z]
    g1 -- f5 [neutralino1]
    d2 -- [chargino] e2
    e2 -- [neutralino2] g2
    e2 -- f6 [W]
    g2 -- f7 [neutralino1]
    g2 -- f8 [Z]
    d2 -- f9 [q]
    d2 -- f10 [q]
    ```
    ````

-   **Stop pairs, from ATLAS**

    ```feynman
    in: g1 g2
    out: t1 n1 n2 t2
    x [blob]
    g1 [particle={g}]
    g2 [particle={g}]
    t1 [particle={t}]
    t2 [particle={\bar{t}}]
    n1 [particle={\nu}]
    n2 [particle={\bar{\nu}}]
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    t2 -- [fermion] v2
    v2 -- [fermion] x
    x -- [fermion] v1
    v1 -- [fermion] t1
    x -- [fermion] n1
    n2 -- [fermion] x
    ```

    ````markdown
    ```feynman
    in: g1 g2
    out: t1 n1 n2 t2
    x [blob]
    g1 [particle={g}]
    g2 [particle={g}]
    t1 [particle={t}]
    t2 [particle={\bar{t}}]
    n1 [particle={\nu}]
    n2 [particle={\bar{\nu}}]
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    t2 -- [fermion] v2
    v2 -- [fermion] x
    x -- [fermion] v1
    v1 -- [fermion] t1
    x -- [fermion] n1
    n2 -- [fermion] x
    ```
    ````

    <small>ATLAS, [SUSY-2023-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2023-22/), figure 1d</small>

-   **Charginos and neutralinos, from ATLAS**

    ```feynman
    in: p1 p2
    out: l1 la lb bo l2
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    d1 [dot, label={\epsilon_i}, color=blue]
    d2 [dot, label={\epsilon_i}, color=blue]
    l1 [particle={\ell^\pm}]
    la [particle={\ell^\pm}]
    lb [particle={\ell^\mp}]
    bo [particle={Z/H/W^\mp}]
    l2 [particle={\ell^\mp/\ell^\mp/\nu}]
    p1 -- [proton] pp
    pp -- [proton] p2
    pp -- [susy fermion, label={\tilde{\chi}^\pm_1}] d1
    pp -- [susy fermion, label'={\tilde{\chi}^\mp_1}] d2
    d1 -- [plain] l1
    d2 -- [plain] l2
    d1 -- [photon, label'={Z}] zv
    zv -- [plain] la
    zv -- [plain] lb
    d2 -- [photon] bo
    ```

    ````markdown
    ```feynman
    in: p1 p2
    out: l1 la lb bo l2
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    d1 [dot, label={\epsilon_i}, color=blue]
    d2 [dot, label={\epsilon_i}, color=blue]
    l1 [particle={\ell^\pm}]
    la [particle={\ell^\pm}]
    lb [particle={\ell^\mp}]
    bo [particle={Z/H/W^\mp}]
    l2 [particle={\ell^\mp/\ell^\mp/\nu}]
    p1 -- [proton] pp
    pp -- [proton] p2
    pp -- [susy fermion, label={\tilde{\chi}^\pm_1}] d1
    pp -- [susy fermion, label'={\tilde{\chi}^\mp_1}] d2
    d1 -- [plain] l1
    d2 -- [plain] l2
    d1 -- [photon, label'={Z}] zv
    zv -- [plain] la
    zv -- [plain] lb
    d2 -- [photon] bo
    ```
    ````

    <small>ATLAS, [SUSY-2018-36](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2018-36/), figure 1a</small>

</div>

## Extra dimensions

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

    ````markdown
    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [photon, double, label=G_{\mathrm{KK}}] b
    b -- f1 [gamma]
    b -- f2 [gamma]
    ```
    ````

    In the Randall–Sundrum model the graviton's excitations are heavy and couple to everything; a resonance in two photons is its cleanest sign.

-   **A Kaluza–Klein gluon to top quarks**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    ````markdown
    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```
    ````

    The gluon's first excitation couples most strongly to the top quark.

-   **A graviton to W pairs, from ATLAS**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [scalar, label=G^*] b
    b -- f1 [W+]
    b -- f2 [W-]
    ```

    ````markdown
    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- a
    a -- [scalar, label=G^*] b
    b -- f1 [W+]
    b -- f2 [W-]
    ```
    ````

    <small>ATLAS, [EXOT-2013-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2013-01/), auxiliary figure 1a</small>

</div>
