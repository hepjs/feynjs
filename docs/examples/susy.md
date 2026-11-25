---
tags:
  - SUSY
  - squark
  - gluino
  - chargino
  - neutralino
  - slepton
  - RPV
---

# Supersymmetry

Superpartners made in pairs and decaying in cascades to the lightest neutralino. [Stop production, step by step](stop.md) builds one family of these diagrams from the start.

## Textbook

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

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [q] -- a -- f1 [squark]
        i2 [g] -- b
        a -- [gluino] b
        b -- f2 [gluino]
        ```

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

    ??? example "Source"

        ```text
        i1 [q] -- a -- i2 [qbar]
        a -- [gamma] b
        b -- [slepton] c
        b -- [slepton] d
        c -- f1 [l]
        c -- f2 [neutralino]
        d -- f3 [l]
        d -- f4 [neutralino]
        ```

-   **SUSY cascade**

    ```feynman
    i1 [p] -- pp [blob] -- i2 [p]
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

    ??? example "Source"

        ```text
        i1 [p] -- pp [blob] -- i2 [p]
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

    ??? example "Source"

        ```text
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

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **Gluinos through a virtual squark**

    ```feynman
    in: p1 p2
    out: q1 q2 n1 n2 q3 q4
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    q1 [particle={q}]
    q4 [particle={q}]
    q2 [particle={q}]
    q3 [particle={q}]
    n1 [particle={\tilde{\chi}^0_1}]
    n2 [particle={\tilde{\chi}^0_1}]
    p1 -- [proton] pp
    pp -- [proton] p2
    pp -- [susy gluon, label={\tilde{g}}] d1
    pp -- [susy gluon, label'={\tilde{g}}] d2
    d1 -- [plain] q1
    d2 -- [plain] q4
    d1 -- [susy, label'={\tilde{q}^*}] s1
    d2 -- [susy, label={\tilde{q}^*}] s2
    s1 -- [plain] q2
    s2 -- [plain] q3
    s1 -- [susy fermion] n1
    s2 -- [susy fermion] n2
    ```

    <small>ATLAS, [SUSY-2016-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2016-08/), figure 1</small>

    ??? example "Source"

        ```text
        in: p1 p2
        out: q1 q2 n1 n2 q3 q4
        pp [blob]
        p1 [particle={p}]
        p2 [particle={p}]
        q1 [particle={q}]
        q4 [particle={q}]
        q2 [particle={q}]
        q3 [particle={q}]
        n1 [particle={\tilde{\chi}^0_1}]
        n2 [particle={\tilde{\chi}^0_1}]
        p1 -- [proton] pp
        pp -- [proton] p2
        pp -- [susy gluon, label={\tilde{g}}] d1
        pp -- [susy gluon, label'={\tilde{g}}] d2
        d1 -- [plain] q1
        d2 -- [plain] q4
        d1 -- [susy, label'={\tilde{q}^*}] s1
        d2 -- [susy, label={\tilde{q}^*}] s2
        s1 -- [plain] q2
        s2 -- [plain] q3
        s1 -- [susy fermion] n1
        s2 -- [susy fermion] n2
        ```

-   **Gluinos to tops and bottoms**

    ```feynman
    arrows: none
    in: p1 p2
    out: t1 b1 fp1 f1 n1 n2 f2 fp2 b2 t2
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [gluino] g1 [dot, color=gray]
    pp -- [gluino] g2 [dot, color=gray]
    g1 -- t1 [t]
    g1 -- b1 [b]
    g1 -- [chargino, label=\tilde\chi^\pm] c1 [dot, color=gray]
    c1 -- fp1 [f']
    c1 -- f1 [f]
    c1 -- n1 [neutralino1]
    g2 -- [chargino, label=\tilde\chi^\pm] c2 [dot, color=gray]
    c2 -- n2 [neutralino1]
    c2 -- f2 [f]
    c2 -- fp2 [f']
    g2 -- b2 [b]
    g2 -- t2 [t]
    ```

    <small>ATLAS, [SUSY-2013-18](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2013-18/), figure 2c</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: t1 b1 fp1 f1 n1 n2 f2 fp2 b2 t2
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [gluino] g1 [dot, color=gray]
        pp -- [gluino] g2 [dot, color=gray]
        g1 -- t1 [t]
        g1 -- b1 [b]
        g1 -- [chargino, label=\tilde\chi^\pm] c1 [dot, color=gray]
        c1 -- fp1 [f']
        c1 -- f1 [f]
        c1 -- n1 [neutralino1]
        g2 -- [chargino, label=\tilde\chi^\pm] c2 [dot, color=gray]
        c2 -- n2 [neutralino1]
        c2 -- f2 [f]
        c2 -- fp2 [f']
        g2 -- b2 [b]
        g2 -- t2 [t]
        ```

-   **Stop pairs**

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

    <small>ATLAS, [SUSY-2023-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2023-22/), figure 1d</small>

    ??? example "Source"

        ```text
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

-   **Sbottom pairs**

    ```feynman
    in: p1 p2
    out: q1 w1 n1 n2 q2
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    q1 [particle={t/b}]
    q2 [particle={b/t}]
    w1 [particle={W}]
    n1 [particle={\tilde{\chi}^0_1}]
    n2 [particle={\tilde{\chi}^0_1}]
    p1 -- [proton] pp
    pp -- [proton] p2
    pp -- [susy, label={\tilde{b}/\tilde{t}}] d1
    pp -- [susy, label'={\tilde{b}/\tilde{t}}] d2
    d1 -- [plain] q1
    d2 -- [plain] q2
    d1 -- [susy fermion, label'={\tilde{\chi}^\pm_1}] c1
    c1 -- [photon] w1
    c1 -- [susy fermion] n1
    d2 -- [susy fermion] n2
    ```

    <small>ATLAS, [SUSY-2016-28](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2016-28/), figure 1b</small>

    ??? example "Source"

        ```text
        in: p1 p2
        out: q1 w1 n1 n2 q2
        pp [blob]
        p1 [particle={p}]
        p2 [particle={p}]
        q1 [particle={t/b}]
        q2 [particle={b/t}]
        w1 [particle={W}]
        n1 [particle={\tilde{\chi}^0_1}]
        n2 [particle={\tilde{\chi}^0_1}]
        p1 -- [proton] pp
        pp -- [proton] p2
        pp -- [susy, label={\tilde{b}/\tilde{t}}] d1
        pp -- [susy, label'={\tilde{b}/\tilde{t}}] d2
        d1 -- [plain] q1
        d2 -- [plain] q2
        d1 -- [susy fermion, label'={\tilde{\chi}^\pm_1}] c1
        c1 -- [photon] w1
        c1 -- [susy fermion] n1
        d2 -- [susy fermion] n2
        ```

-   **Charginos and neutralinos**

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

    <small>ATLAS, [SUSY-2018-36](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2018-36/), figure 1a</small>

    ??? example "Source"

        ```text
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

-   **Electroweakinos with a Higgs**

    ```feynman
    in: p1 p2
    out: g1 l1 l2 g2 lm lp
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    l1 [particle={\mathrm{LSP}}]
    l2 [particle={\mathrm{LSP}}]
    g1 [particle={\gamma}]
    g2 [particle={\gamma}]
    lm [particle={\ell^-}]
    lp [particle={\ell^+}]
    p1 -- [proton] pp
    p2 -- [proton] pp
    pp -- [scalar, label={H}] h
    pp -- [photon, label'={Z}] z
    h -- [susy fermion, label={\mathrm{NLSP}}] n1
    h -- [susy fermion, label'={\mathrm{NLSP}}] n2
    n1 -- [susy fermion] l1
    n2 -- [susy fermion] l2
    n1 -- [photon] g1
    n2 -- [photon] g2
    z -- [plain] lm
    z -- [plain] lp
    ```

    <small>ATLAS, [SUSY-2019-14](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2019-14/), figure 1</small>

    ??? example "Source"

        ```text
        in: p1 p2
        out: g1 l1 l2 g2 lm lp
        pp [blob]
        p1 [particle={p}]
        p2 [particle={p}]
        l1 [particle={\mathrm{LSP}}]
        l2 [particle={\mathrm{LSP}}]
        g1 [particle={\gamma}]
        g2 [particle={\gamma}]
        lm [particle={\ell^-}]
        lp [particle={\ell^+}]
        p1 -- [proton] pp
        p2 -- [proton] pp
        pp -- [scalar, label={H}] h
        pp -- [photon, label'={Z}] z
        h -- [susy fermion, label={\mathrm{NLSP}}] n1
        h -- [susy fermion, label'={\mathrm{NLSP}}] n2
        n1 -- [susy fermion] l1
        n2 -- [susy fermion] l2
        n1 -- [photon] g1
        n2 -- [photon] g2
        z -- [plain] lm
        z -- [plain] lp
        ```

-   **Staus and electroweakinos · a**

    ```feynman
    arrows: none
    in: p1 p2
    out: t1 n1 n2 t2
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [stau] s1
    pp -- [stau] s2
    s1 -- t1 [\tau]
    s1 -- n1 [neutralino1]
    s2 -- n2 [neutralino1]
    s2 -- t2 [\tau]
    ```

    <small>ATLAS, [SUSY-2014-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2014-05/), figure 2a</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: t1 n1 n2 t2
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [stau] s1
        pp -- [stau] s2
        s1 -- t1 [\tau]
        s1 -- n1 [neutralino1]
        s2 -- n2 [neutralino1]
        s2 -- t2 [\tau]
        ```

-   **Staus and electroweakinos · b**

    ```feynman
    arrows: none
    in: p1 p2
    out: a1 a2 n1 n2 b2 b1
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [chargino] c1
    pp -- [chargino, label=\tilde\chi^\mp_1] c2
    c1 -- a1 [\nu/\ell]
    c1 -- [slepton, label=\tilde\ell/\tilde\nu] l1
    l1 -- a2 [\ell/\nu]
    l1 -- n1 [neutralino1]
    c2 -- [slepton, label=\tilde\ell/\tilde\nu] l2
    l2 -- n2 [neutralino1]
    l2 -- b2 [\ell/\nu]
    c2 -- b1 [\nu/\ell]
    ```

    <small>ATLAS, [SUSY-2014-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2014-05/), figure 2b</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: a1 a2 n1 n2 b2 b1
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [chargino] c1
        pp -- [chargino, label=\tilde\chi^\mp_1] c2
        c1 -- a1 [\nu/\ell]
        c1 -- [slepton, label=\tilde\ell/\tilde\nu] l1
        l1 -- a2 [\ell/\nu]
        l1 -- n1 [neutralino1]
        c2 -- [slepton, label=\tilde\ell/\tilde\nu] l2
        l2 -- n2 [neutralino1]
        l2 -- b2 [\ell/\nu]
        c2 -- b1 [\nu/\ell]
        ```

-   **Staus and electroweakinos · c**

    ```feynman
    arrows: none
    in: p1 p2
    out: a1 a2 n1 n2 b2 b1
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [neutralino2] x2
    pp -- [neutralino3] x3
    x2 -- a1 [\ell]
    x2 -- [slepton] s1
    s1 -- a2 [\ell]
    s1 -- n1 [neutralino1]
    x3 -- [slepton] s2
    s2 -- n2 [neutralino1]
    s2 -- b2 [\ell]
    x3 -- b1 [\ell]
    ```

    <small>ATLAS, [SUSY-2014-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2014-05/), figure 2d</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: a1 a2 n1 n2 b2 b1
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [neutralino2] x2
        pp -- [neutralino3] x3
        x2 -- a1 [\ell]
        x2 -- [slepton] s1
        s1 -- a2 [\ell]
        s1 -- n1 [neutralino1]
        x3 -- [slepton] s2
        s2 -- n2 [neutralino1]
        s2 -- b2 [\ell]
        x3 -- b1 [\ell]
        ```

-   **Staus and electroweakinos · d**

    ```feynman
    arrows: none
    in: q1 q2
    out: qo1 a1 a2 n1 n2 b2 b1 qo2
    q1 [q] -- v1 -- qo1 [q]
    q2 [q] -- v2 -- qo2 [q]
    v1 -- [W, label=W^\pm] c1
    v2 -- [W, label=W^\pm] c2
    c1 -- [neutralino2] c2
    c1 -- [chargino] x1
    c2 -- [chargino] x2
    x1 -- a1 [\nu/\ell^\pm]
    x1 -- [slepton, label=\tilde\ell^\pm/\tilde\nu] s1
    s1 -- a2 [\ell^\pm/\nu]
    s1 -- n1 [neutralino1]
    x2 -- [slepton, label=\tilde\ell^\pm/\tilde\nu] s2
    s2 -- n2 [neutralino1]
    s2 -- b2 [\ell^\pm/\nu]
    x2 -- b1 [\nu/\ell^\pm]
    ```

    <small>ATLAS, [SUSY-2014-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2014-05/), figure 2e</small>

    ??? example "Source"

        ```text
        arrows: none
        in: q1 q2
        out: qo1 a1 a2 n1 n2 b2 b1 qo2
        q1 [q] -- v1 -- qo1 [q]
        q2 [q] -- v2 -- qo2 [q]
        v1 -- [W, label=W^\pm] c1
        v2 -- [W, label=W^\pm] c2
        c1 -- [neutralino2] c2
        c1 -- [chargino] x1
        c2 -- [chargino] x2
        x1 -- a1 [\nu/\ell^\pm]
        x1 -- [slepton, label=\tilde\ell^\pm/\tilde\nu] s1
        s1 -- a2 [\ell^\pm/\nu]
        s1 -- n1 [neutralino1]
        x2 -- [slepton, label=\tilde\ell^\pm/\tilde\nu] s2
        s2 -- n2 [neutralino1]
        s2 -- b2 [\ell^\pm/\nu]
        x2 -- b1 [\nu/\ell^\pm]
        ```

-   **Electroweak and strong production**

    ```feynman
    in: p1 p2
    out: j n1 n2 pi
    pp [blob]
    p1 [particle={p}]
    p2 [particle={p}]
    j [particle={j}]
    n1 [particle={\tilde{\chi}^0_1}]
    d1 [small blob]
    n2 [particle={\tilde{\chi}^0_1}]
    pi [particle={\pi^\pm}]
    p1 -- [proton] pp
    p2 -- [proton] pp
    pp -- [plain] j
    pp -- [susy fermion] n1
    pp -- [susy fermion, label'={\tilde{\chi}^\pm_1}] d1
    d1 -- [susy fermion] n2
    d1 -- [scalar] pi
    ```

    <small>ATLAS, [SUSY-2018-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2018-19/), figure 1a</small>

    ??? example "Source"

        ```text
        in: p1 p2
        out: j n1 n2 pi
        pp [blob]
        p1 [particle={p}]
        p2 [particle={p}]
        j [particle={j}]
        n1 [particle={\tilde{\chi}^0_1}]
        d1 [small blob]
        n2 [particle={\tilde{\chi}^0_1}]
        pi [particle={\pi^\pm}]
        p1 -- [proton] pp
        p2 -- [proton] pp
        pp -- [plain] j
        pp -- [susy fermion] n1
        pp -- [susy fermion, label'={\tilde{\chi}^\pm_1}] d1
        d1 -- [susy fermion] n2
        d1 -- [scalar] pi
        ```

-   **R-parity violation · a**

    ```feynman
    arrows: none
    in: p1 p2
    out: w1 a1 a2 a3 b1 b2 b3 w2
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [chargino] c1
    pp -- [chargino, label=\tilde\chi^\mp_1] c2
    c1 -- w1 [W]
    c1 -- [neutralino1] n1 [dot, color=#2457f5, size=1.3, label=\lambda]
    n1 -- a1 [\ell]
    n1 -- a2 [\ell]
    n1 -- a3 [\nu]
    c2 -- [neutralino1] n2 [dot, color=#2457f5, size=1.3, label=\lambda]
    n2 -- b1 [\nu]
    n2 -- b2 [\ell]
    n2 -- b3 [\ell]
    c2 -- w2 [W]
    ```

    <small>ATLAS, [SUSY-2013-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2013-13/), figure 1a</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: w1 a1 a2 a3 b1 b2 b3 w2
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [chargino] c1
        pp -- [chargino, label=\tilde\chi^\mp_1] c2
        c1 -- w1 [W]
        c1 -- [neutralino1] n1 [dot, color=#2457f5, size=1.3, label=\lambda]
        n1 -- a1 [\ell]
        n1 -- a2 [\ell]
        n1 -- a3 [\nu]
        c2 -- [neutralino1] n2 [dot, color=#2457f5, size=1.3, label=\lambda]
        n2 -- b1 [\nu]
        n2 -- b2 [\ell]
        n2 -- b3 [\ell]
        c2 -- w2 [W]
        ```

-   **R-parity violation · b**

    ```feynman
    arrows: none
    in: p1 p2
    out: l1 a1 a2 a3 b1 b2 b3 l2
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [slepton] s1
    pp -- [slepton] s2
    s1 -- l1 [\ell]
    s1 -- [neutralino1] n1 [empty dot, color=blue, label=\lambda]
    n1 -- a1 [\ell]
    n1 -- a2 [\ell]
    n1 -- a3 [\nu]
    s2 -- [neutralino1] n2 [empty dot, color=blue, label=\lambda]
    n2 -- b1 [\nu]
    n2 -- b2 [\ell]
    n2 -- b3 [\ell]
    s2 -- l2 [\ell]
    ```

    <small>ATLAS, [SUSY-2013-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2013-13/), figure 1b</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: l1 a1 a2 a3 b1 b2 b3 l2
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [slepton] s1
        pp -- [slepton] s2
        s1 -- l1 [\ell]
        s1 -- [neutralino1] n1 [empty dot, color=blue, label=\lambda]
        n1 -- a1 [\ell]
        n1 -- a2 [\ell]
        n1 -- a3 [\nu]
        s2 -- [neutralino1] n2 [empty dot, color=blue, label=\lambda]
        n2 -- b1 [\nu]
        n2 -- b2 [\ell]
        n2 -- b3 [\ell]
        s2 -- l2 [\ell]
        ```

-   **R-parity violation · c**

    ```feynman
    arrows: none
    in: p1 p2
    out: a1 a2 n1 n2 b2 b1
    p1 [p] -- pp [blob]
    p2 [p] -- pp
    pp -- [neutralino2] x2
    pp -- [neutralino3] x3
    x2 -- a1 [\ell]
    x2 -- [slepton] s1
    s1 -- a2 [\ell]
    s1 -- n1 [neutralino1]
    x3 -- [slepton] s2
    s2 -- n2 [neutralino1]
    s2 -- b2 [\ell]
    x3 -- b1 [\ell]
    ```

    <small>ATLAS, [SUSY-2013-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2013-13/), figure 2a</small>

    ??? example "Source"

        ```text
        arrows: none
        in: p1 p2
        out: a1 a2 n1 n2 b2 b1
        p1 [p] -- pp [blob]
        p2 [p] -- pp
        pp -- [neutralino2] x2
        pp -- [neutralino3] x3
        x2 -- a1 [\ell]
        x2 -- [slepton] s1
        s1 -- a2 [\ell]
        s1 -- n1 [neutralino1]
        x3 -- [slepton] s2
        s2 -- n2 [neutralino1]
        s2 -- b2 [\ell]
        x3 -- b1 [\ell]
        ```

-   **A sneutrino in the t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [d] -- a [label=\lambda'_{131}] -- f1 [e-]
    a -- [stop] b
    i2 [dbar] -- b [label=\lambda'_{231}] -- f2 [mu+]
    ```

    <small>ATLAS, [SUSY-2011-28](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/SUSY-2011-28/), figure 1</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [d] -- a [label=\lambda'_{131}] -- f1 [e-]
        a -- [stop] b
        i2 [dbar] -- b [label=\lambda'_{231}] -- f2 [mu+]
        ```

-   **Simplified models · a**

    ```feynman
    arrows: none
    p p > stop stop
    stop > t neutralino1
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2013-011](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2013-011/), figure 2</small>

    ??? example "Source"

        ```text
        arrows: none
        p p > stop stop
        stop > t neutralino1
        ```

-   **Simplified models · b**

    ```feynman
    arrows: none
    p p > chargino neutralino2
    chargino > W neutralino1
    neutralino2 > Z neutralino1
    W > l nu
    Z > l l
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2013-011](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2013-011/), figure 6</small>

    ??? example "Source"

        ```text
        arrows: none
        p p > chargino neutralino2
        chargino > W neutralino1
        neutralino2 > Z neutralino1
        W > l nu
        Z > l l
        ```

</div>
