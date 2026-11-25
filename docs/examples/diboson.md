---
tags:
  - WW
  - WZ
  - ZZ
  - vector-boson scattering
  - triboson
---

# Diboson

Two or three weak bosons: made in pairs from quarks, from photons and from gluons, and scattered off each other between two forward jets.

## Textbook

<div class="grid cards" markdown>

-   **e⁺e⁻ → W⁺W⁻, s channel**

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [photon, label={\gamma, Z}] b
    b -- f1 [W-]
    b -- f2 [W+]
    ```

    Through the γWW and ZWW vertices...

    ??? example "Source"

        ```text
        i1 [e-] -- a -- i2 [e+]
        a -- [photon, label={\gamma, Z}] b
        b -- f1 [W-]
        b -- f2 [W+]
        ```

-   **e⁺e⁻ → W⁺W⁻, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [W-]
    i2 [e+] -- b -- f2 [W+]
    a -- [fermion, label=\nu_e] b
    ```

    ...and through a neutrino exchanged. The two cancel at high energy, keeping the
    cross-section from growing, as LEP2 measured.

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [e-] -- a -- f1 [W-]
        i2 [e+] -- b -- f2 [W+]
        a -- [fermion, label=\nu_e] b
        ```

-   **qq̄ → ZZ**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [Z]
    i2 [qbar] -- b -- f2 [Z]
    a -- [fermion, label=q] b
    ```

    A quark exchanged in the t channel, with its u-channel partner. There is no s-channel
    diagram: the Standard Model has no ZZZ or ZZγ vertex.

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [q] -- a -- f1 [Z]
        i2 [qbar] -- b -- f2 [Z]
        a -- [fermion, label=q] b
        ```

-   **W W scattering**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f2 [q]
    a -- [W+] c
    b -- [W+] c
    c -- [Z] d
    d -- f3 [l+]
    d -- f4 [l-]
    ```

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2 f3 f4
        i1 [q] -- a -- f1 [q]
        i2 [q] -- b -- f2 [q]
        a -- [W+] c
        b -- [W+] c
        c -- [Z] d
        d -- f3 [l+]
        d -- f4 [l-]
        ```

-   **Photon fusion with a proton remnant**

    ```feynman
    i1 [p] -- a [dot] -- f1 [p*]
    i2 [p] -- b -- f3 [p]
    a -- [gamma] c -- [gamma] b
    c -- [scalar, label=a] d
    d -- f2 [gamma]
    d -- f4 [gamma]
    ```

    ??? example "Source"

        ```text
        i1 [p] -- a [dot] -- f1 [p*]
        i2 [p] -- b -- f3 [p]
        a -- [gamma] c -- [gamma] b
        c -- [scalar, label=a] d
        d -- f2 [gamma]
        d -- f4 [gamma]
        ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **WW from quarks · a**

    ```feynman
    in: qb qi
    out: w1 w2
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [boson, label'={Z/\gamma}] t
    t [dot, color=red, label=\text{TGC vertex}]
    t -- [boson] w1 [W]
    t -- [boson] w2 [W]
    ```

    <small>ATLAS, [STDM-2012-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-01/), figure 1a</small>

    ??? example "Source"

        ```text
        in: qb qi
        out: w1 w2
        qi [q] -- [fermion] a -- [fermion] qb [qbar]
        a -- [boson, label'={Z/\gamma}] t
        t [dot, color=red, label=\text{TGC vertex}]
        t -- [boson] w1 [W]
        t -- [boson] w2 [W]
        ```

-   **WW from quarks · b**

    ```feynman
    in: qp qi
    out: w1 w2
    qi -- [fermion, label'=q] a -- [fermion, label'=q''] b -- [fermion, label'=q'] qp
    b -- [boson] w1 [W]
    a -- [boson] w2 [W]
    ```

    <small>ATLAS, [STDM-2012-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-01/), figure 1b</small>

    ??? example "Source"

        ```text
        in: qp qi
        out: w1 w2
        qi -- [fermion, label'=q] a -- [fermion, label'=q''] b -- [fermion, label'=q'] qp
        b -- [boson] w1 [W]
        a -- [boson] w2 [W]
        ```

-   **WZ from quarks · a**

    ```feynman
    in: q qb
    out: w z
    q [q] -- [fermion] a -- [fermion] qb [\bar q']
    a -- [boson, label'=W] t
    t [slashed dot, label=TGC, label side=right]
    t -- [boson] w [W]
    t -- [boson] z [Z]
    ```

    <small>ATLAS, [STDM-2012-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-09/), figure 1a</small>

    ??? example "Source"

        ```text
        in: q qb
        out: w z
        q [q] -- [fermion] a -- [fermion] qb [\bar q']
        a -- [boson, label'=W] t
        t [slashed dot, label=TGC, label side=right]
        t -- [boson] w [W]
        t -- [boson] z [Z]
        ```

-   **WZ from quarks · b**

    ```feynman
    in: q qb
    out: w z
    q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [\bar q']
    a -- [boson] w [W]
    b -- [boson] z [Z]
    ```

    <small>ATLAS, [STDM-2012-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-09/), figure 1b</small>

    ??? example "Source"

        ```text
        in: q qb
        out: w z
        q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [\bar q']
        a -- [boson] w [W]
        b -- [boson] z [Z]
        ```

-   **WZ from quarks · c**

    ```feynman
    in: q qb
    out: w z
    q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [\bar q']
    a -- [boson] z [Z]
    b -- [boson] w [W]
    ```

    <small>ATLAS, [STDM-2012-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-09/), figure 1c</small>

    ??? example "Source"

        ```text
        in: q qb
        out: w z
        q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [\bar q']
        a -- [boson] z [Z]
        b -- [boson] w [W]
        ```

-   **ZZ from quarks and from gluons · a**

    ```feynman
    in: qi qb
    out: z1 z2
    qi [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
    a -- [boson] z1 [Z]
    b -- [boson] z2 [Z]
    ```

    <small>ATLAS, [STDM-2012-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-02/), figure 1a</small>

    ??? example "Source"

        ```text
        in: qi qb
        out: z1 z2
        qi [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
        a -- [boson] z1 [Z]
        b -- [boson] z2 [Z]
        ```

-   **ZZ from quarks and from gluons · b**

    ```feynman
    in: qi qb
    out: z1 z2
    qi [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
    a -- [boson] z2 [Z]
    b -- [boson] z1 [Z]
    ```

    <small>ATLAS, [STDM-2012-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-02/), figure 1b</small>

    ??? example "Source"

        ```text
        in: qi qb
        out: z1 z2
        qi [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
        a -- [boson] z2 [Z]
        b -- [boson] z1 [Z]
        ```

-   **ZZ from quarks and from gluons · c**

    ```feynman
    in: qi qb
    out: z1 z2
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [boson, label'={Z/\gamma}] t
    t [dot, color=red]
    t -- [boson] z1 [Z]
    t -- [boson] z2 [Z]
    ```

    <small>ATLAS, [STDM-2012-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-02/), figure 1c</small>

    ??? example "Source"

        ```text
        in: qi qb
        out: z1 z2
        qi [q] -- [fermion] a -- [fermion] qb [qbar]
        a -- [boson, label'={Z/\gamma}] t
        t [dot, color=red]
        t -- [boson] z1 [Z]
        t -- [boson] z2 [Z]
        ```

-   **ZZ from quarks and from gluons · d**

    ```feynman
    in: g1 g2
    out: z1 z2
    g1 [g] -- [gluon] a
    g2 [g] -- [gluon] d
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [boson] z1 [Z]
    c -- [boson] z2 [Z]
    ```

    <small>ATLAS, [STDM-2012-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-02/), figure 1d</small>

    ??? example "Source"

        ```text
        in: g1 g2
        out: z1 z2
        g1 [g] -- [gluon] a
        g2 [g] -- [gluon] d
        a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
        b -- [boson] z1 [Z]
        c -- [boson] z2 [Z]
        ```

-   **Wγ and Zγ · a**

    ```feynman
    in: qb q
    out: g l nb
    q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
    b -- [photon] g [gamma]
    a -- [scalar, label=W(Z)] w
    w -- [fermion] l [\mathit{l}]
    nb [\bar\nu(\bar l)] -- [fermion] w
    ```

    <small>ATLAS, [STDM-2011-17](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-17/), figure 1a</small>

    ??? example "Source"

        ```text
        in: qb q
        out: g l nb
        q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
        b -- [photon] g [gamma]
        a -- [scalar, label=W(Z)] w
        w -- [fermion] l [\mathit{l}]
        nb [\bar\nu(\bar l)] -- [fermion] w
        ```

-   **Wγ and Zγ · b**

    ```feynman
    in: qb q
    out: nb l g
    q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
    a -- [photon] g [gamma]
    b -- [scalar, label'=W(Z)] w
    w -- [fermion] l [\mathit{l}]
    nb [\bar\nu(\bar l)] -- [fermion] w
    ```

    <small>ATLAS, [STDM-2011-17](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-17/), figure 1b</small>

    ??? example "Source"

        ```text
        in: qb q
        out: nb l g
        q [q] -- [fermion] a -- [fermion] b -- [fermion] qb [qbar]
        a -- [photon] g [gamma]
        b -- [scalar, label'=W(Z)] w
        w -- [fermion] l [\mathit{l}]
        nb [\bar\nu(\bar l)] -- [fermion] w
        ```

-   **Wγ and Zγ · c**

    ```feynman
    in: qb q
    out: g l nb
    q [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [scalar, label'=W(Z)] w
    w -- [fermion] r -- [fermion] l [\mathit{l}]
    r -- [photon] g [gamma]
    nb [\bar\nu(\bar l)] -- [fermion] w
    ```

    <small>ATLAS, [STDM-2011-17](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-17/), figure 1c</small>

    ??? example "Source"

        ```text
        in: qb q
        out: g l nb
        q [q] -- [fermion] a -- [fermion] qb [qbar]
        a -- [scalar, label'=W(Z)] w
        w -- [fermion] r -- [fermion] l [\mathit{l}]
        r -- [photon] g [gamma]
        nb [\bar\nu(\bar l)] -- [fermion] w
        ```

-   **Exclusive γγ → WW**

    ```feynman
    in: p2i p1i
    out: p2o wm wp x2a x2 x2b
    p2i [particle={p_2}]
    p2o [particle={p_2}]
    p1i [particle={p_1}]
    v2 [dot]
    b [hatched blob]
    wm [particle={W^-}]
    x2 [particle={X}]
    p2i -- [fermion] v1
    v1 -- [fermion] p2o
    p1i -- [fermion] v2
    v2 -- [plain] x2a
    v2 -- [plain] x2
    v2 -- [plain] x2b
    v1 -- [photon, label'={\gamma}] b
    v2 -- [photon, label={\gamma}] b
    b -- [photon] wm
    b -- [photon, label={W^+}] wp
    ```

    <small>ATLAS, [STDM-2017-21](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2017-21/), auxiliary figure 1b</small>

    ??? example "Source"

        ```text
        in: p2i p1i
        out: p2o wm wp x2a x2 x2b
        p2i [particle={p_2}]
        p2o [particle={p_2}]
        p1i [particle={p_1}]
        v2 [dot]
        b [hatched blob]
        wm [particle={W^-}]
        x2 [particle={X}]
        p2i -- [fermion] v1
        v1 -- [fermion] p2o
        p1i -- [fermion] v2
        v2 -- [plain] x2a
        v2 -- [plain] x2
        v2 -- [plain] x2b
        v1 -- [photon, label'={\gamma}] b
        v2 -- [photon, label={\gamma}] b
        b -- [photon] wm
        b -- [photon, label={W^+}] wp
        ```

-   **Three massive bosons**

    ```feynman
    in: i1 i2
    out: v1 v2 v3
    v1 [particle={V_1}]
    v2 [particle={V_2}]
    v3 [particle={V_3}]
    i1 -- [fermion, label={q}] a
    a -- [fermion, label={\bar{q}'}] i2
    a -- [photon, label'={V^*}] b
    b -- [photon] v1
    b -- [scalar, label'={H}] c
    c -- [photon] v2
    c -- [photon] v3
    ```

    <small>ATLAS, [STDM-2017-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2017-22/), figure 1c</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: v1 v2 v3
        v1 [particle={V_1}]
        v2 [particle={V_2}]
        v3 [particle={V_3}]
        i1 -- [fermion, label={q}] a
        a -- [fermion, label={\bar{q}'}] i2
        a -- [photon, label'={V^*}] b
        b -- [photon] v1
        b -- [scalar, label'={H}] c
        c -- [photon] v2
        c -- [photon] v3
        ```

-   **Wγγ**

    ```feynman
    in: qb q
    out: l nu g1 g2
    qb [particle={\overline{q}'}]
    q [particle={q}]
    l [particle={\ell}]
    nu [particle={\overline{\nu}}]
    g1 [particle={\gamma}]
    g2 [particle={\gamma}]
    q -- [fermion] a
    a -- [fermion] qb
    a -- [photon, label'={W}] b
    b -- [photon, label'={W}] c
    c -- [fermion] l
    nu -- [fermion] c
    b -- [photon] g1
    b -- [photon] g2
    ```

    <small>ATLAS, [STDM-2018-33](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2018-33/), figure 1a</small>

    ??? example "Source"

        ```text
        in: qb q
        out: l nu g1 g2
        qb [particle={\overline{q}'}]
        q [particle={q}]
        l [particle={\ell}]
        nu [particle={\overline{\nu}}]
        g1 [particle={\gamma}]
        g2 [particle={\gamma}]
        q -- [fermion] a
        a -- [fermion] qb
        a -- [photon, label'={W}] b
        b -- [photon, label'={W}] c
        c -- [fermion] l
        nu -- [fermion] c
        b -- [photon] g1
        b -- [photon] g2
        ```

-   **WZγ**

    ```feynman
    in: qb qp
    out: lm lp ga lq nu
    qb [particle={\bar{q}}]
    qp [particle={q'}]
    lm [particle={\ell^-}]
    lp [particle={\ell^+}]
    ga [particle={\gamma}]
    lq [particle={\ell'}]
    nu [particle={\bar{\nu}}]
    qp -- [fermion] v2
    v2 -- [fermion] v1
    v1 -- [fermion] qb
    v1 -- [photon, label={Z/\gamma^*}] vz
    v2 -- [photon, label={W}] vw
    lp -- [fermion] vz
    vz -- [fermion] lm
    nu -- [fermion] vw
    vw -- [fermion] vf
    vf -- [fermion] lq
    vf -- [photon] ga
    ```

    <small>ATLAS, [STDM-2019-17](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2019-17/), figure 1e</small>

    ??? example "Source"

        ```text
        in: qb qp
        out: lm lp ga lq nu
        qb [particle={\bar{q}}]
        qp [particle={q'}]
        lm [particle={\ell^-}]
        lp [particle={\ell^+}]
        ga [particle={\gamma}]
        lq [particle={\ell'}]
        nu [particle={\bar{\nu}}]
        qp -- [fermion] v2
        v2 -- [fermion] v1
        v1 -- [fermion] qb
        v1 -- [photon, label={Z/\gamma^*}] vz
        v2 -- [photon, label={W}] vw
        lp -- [fermion] vz
        vz -- [fermion] lm
        nu -- [fermion] vw
        vw -- [fermion] vf
        vf -- [fermion] lq
        vf -- [photon] ga
        ```

-   **Electroweak WWjj**

    ```feynman
    in: i1 i2
    out: o1 n1 e1 n2 e2 o2
    i1 [particle={q}]
    i2 [particle={q}]
    o1 [particle={q}]
    o2 [particle={q}]
    n1 [particle={\nu}]
    e1 [particle={l^+}]
    n2 [particle={\bar{\nu}}]
    e2 [particle={l^-}]
    i1 -- [fermion] v1
    v1 -- [fermion] o1
    i2 -- [fermion] v2
    v2 -- [fermion] o2
    v1 -- [photon, label={W^+}] x
    v2 -- [photon, label={W^-}] x
    x -- [photon, label={W^+}] d1
    x -- [photon, label={W^-}] d2
    e1 -- [fermion] d1
    d1 -- [fermion] n1
    e2 -- [fermion] d2
    d2 -- [fermion] n2
    ```

    <small>ATLAS, [STDM-2022-06](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2022-06/), figure 1a</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: o1 n1 e1 n2 e2 o2
        i1 [particle={q}]
        i2 [particle={q}]
        o1 [particle={q}]
        o2 [particle={q}]
        n1 [particle={\nu}]
        e1 [particle={l^+}]
        n2 [particle={\bar{\nu}}]
        e2 [particle={l^-}]
        i1 -- [fermion] v1
        v1 -- [fermion] o1
        i2 -- [fermion] v2
        v2 -- [fermion] o2
        v1 -- [photon, label={W^+}] x
        v2 -- [photon, label={W^-}] x
        x -- [photon, label={W^+}] d1
        x -- [photon, label={W^-}] d2
        e1 -- [fermion] d1
        d1 -- [fermion] n1
        e2 -- [fermion] d2
        d2 -- [fermion] n2
        ```

-   **Loop-induced and resonant diboson · a**

    ```feynman
    in: g1 g2
    out: v1 v2
    g1 [particle={g}]
    g2 [particle={g}]
    v1 [particle={V}]
    v2 [particle={V}]
    g1 -- [gluon] a
    g2 -- [gluon] d
    a -- [fermion] b
    b -- [fermion] c
    c -- [fermion] d
    d -- [fermion] a
    b -- [photon] v1
    c -- [photon] v2
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2017-005](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2017-005/), figure 18a</small>

    ??? example "Source"

        ```text
        in: g1 g2
        out: v1 v2
        g1 [particle={g}]
        g2 [particle={g}]
        v1 [particle={V}]
        v2 [particle={V}]
        g1 -- [gluon] a
        g2 -- [gluon] d
        a -- [fermion] b
        b -- [fermion] c
        c -- [fermion] d
        d -- [fermion] a
        b -- [photon] v1
        c -- [photon] v2
        ```

-   **Loop-induced and resonant diboson · b**

    ```feynman
    in: g1 g2
    out: v1 v2
    g1 [g] -- [gluon] a
    g2 [g] -- [gluon] b
    b -- [fermion] a -- [fermion] c -- [fermion] b
    c -- [scalar, label=H^{(*)}] x
    x -- v1 [V]
    x -- v2 [V]
    ```

    <small>ATLAS, [ATL-PHYS-PUB-2017-005](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PUBNOTES/ATL-PHYS-PUB-2017-005/), figure 18b</small>

    ??? example "Source"

        ```text
        in: g1 g2
        out: v1 v2
        g1 [g] -- [gluon] a
        g2 [g] -- [gluon] b
        b -- [fermion] a -- [fermion] c -- [fermion] b
        c -- [scalar, label=H^{(*)}] x
        x -- v1 [V]
        x -- v2 [V]
        ```

</div>
