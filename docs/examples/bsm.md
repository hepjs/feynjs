---
tags:
  - exotics
  - dark matter
  - Z'
  - leptoquark
  - dark photon
  - vector-like quark
  - heavy neutrino
---

# Beyond the Standard Model

New particles searched for at the LHC: dark matter and its mediators, new gauge bosons, leptoquarks, heavy and excited fermions, dark photons. Supersymmetry and extra dimensions have pages of their own.

## Textbook

<div class="grid cards" markdown>

-   **Mono-X with initial-state radiation**

    ```feynman
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```

    ??? example "Source"

        ```text
        i1 [q] -- g1 -- a -- i2 [qbar]
        g1 -- f0 [g]
        a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
        b -- f1 [chi]
        b -- f2 [chibar]
        ```

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

    ??? example "Source"

        ```text
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

-   **Lepton-flavour violation**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [mu-] -- a -- f1 [e-]
    a -- [Z'] b
    i2 [e-] -- b -- f2 [mu-]
    ```

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [mu-] -- a -- f1 [e-]
        a -- [Z'] b
        i2 [e-] -- b -- f2 [mu-]
        ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **Dark matter through a Z' · a**

    ```feynman
    arrows: none
    dots: all
    in: i1 i2
    out: h x1 x2
    i1 [qbar] -- a -- i2 [q]
    a -- [Z', label'=Z'] b
    b -- [scalar] h [h]
    b -- [Z', label'=Z'] c
    x1 [chibar] -- c -- x2 [chi]
    ```

    <small>ATLAS, [EXOT-2015-23](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-23/), figure 1a</small>

    ??? example "Source"

        ```text
        arrows: none
        dots: all
        in: i1 i2
        out: h x1 x2
        i1 [qbar] -- a -- i2 [q]
        a -- [Z', label'=Z'] b
        b -- [scalar] h [h]
        b -- [Z', label'=Z'] c
        x1 [chibar] -- c -- x2 [chi]
        ```

-   **Dark matter through a Z' · b**

    ```feynman
    arrows: none
    dots: all
    in: i1 i2
    out: h x1 x2
    i1 [qbar] -- a -- i2 [q]
    a -- [Z'] b
    b -- [scalar] h [h]
    b -- [dotted, label'=A] c
    x1 [chibar] -- c -- x2 [chi]
    ```

    <small>ATLAS, [EXOT-2015-23](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-23/), figure 1b</small>

    ??? example "Source"

        ```text
        arrows: none
        dots: all
        in: i1 i2
        out: h x1 x2
        i1 [qbar] -- a -- i2 [q]
        a -- [Z'] b
        b -- [scalar] h [h]
        b -- [dotted, label'=A] c
        x1 [chibar] -- c -- x2 [chi]
        ```

-   **Dark matter in 2HDM+a**

    ```feynman
    in: qb b
    out: qbp chi chb t
    qb [particle={\bar{q}}]
    qbp [particle={\bar{q}'}]
    b [particle={b}]
    t [particle={t}]
    chi [particle={\chi}]
    chb [particle={\bar{\chi}}]
    v1 [dot]
    v2 [dot]
    v3 [dot]
    v4 [dot]
    qbp -- [fermion] v1
    v1 -- [fermion] qb
    v1 -- [photon, label={W}] v2
    b -- [fermion] v2
    v2 -- [fermion] v3
    v3 -- [fermion] t
    v3 -- [scalar, label={a}] v4
    v4 -- [fermion] chi
    chb -- [fermion] v4
    ```

    <small>ATLAS, [EXOT-2018-43](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2018-43/), figure 1a</small>

    ??? example "Source"

        ```text
        in: qb b
        out: qbp chi chb t
        qb [particle={\bar{q}}]
        qbp [particle={\bar{q}'}]
        b [particle={b}]
        t [particle={t}]
        chi [particle={\chi}]
        chb [particle={\bar{\chi}}]
        v1 [dot]
        v2 [dot]
        v3 [dot]
        v4 [dot]
        qbp -- [fermion] v1
        v1 -- [fermion] qb
        v1 -- [photon, label={W}] v2
        b -- [fermion] v2
        v2 -- [fermion] v3
        v3 -- [fermion] t
        v3 -- [scalar, label={a}] v4
        v4 -- [fermion] chi
        chb -- [fermion] v4
        ```

-   **Dark matter with b-quarks · a**

    ```feynman
    in: i1 i2
    out: f1 x1 x2
    i2 [b] -- [fermion] c [dot]
    c -- [fermion] a
    i1 [g] -- a
    a -- [fermion] f1 [b]
    c -- [fermion] x1 [chi]
    x2 [chibar] -- [fermion] c
    ```

    <small>ATLAS, [EXOT-2014-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-01/), figure 1a</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 x1 x2
        i2 [b] -- [fermion] c [dot]
        c -- [fermion] a
        i1 [g] -- a
        a -- [fermion] f1 [b]
        c -- [fermion] x1 [chi]
        x2 [chibar] -- [fermion] c
        ```

-   **Dark matter with b-quarks · b**

    ```feynman
    in: i1 i2
    out: f1 x1 x2 f2
    i1 [g] -- a
    i2 [g] -- b
    f2 [{\bar b, \bar t}] -- [fermion] b
    b -- [fermion] c [dot]
    c -- [fermion] a
    a -- [fermion] f1 [{b, t}]
    c -- [fermion] x1 [chi]
    x2 [chibar] -- [fermion] c
    ```

    <small>ATLAS, [EXOT-2014-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-01/), figure 1b</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 x1 x2 f2
        i1 [g] -- a
        i2 [g] -- b
        f2 [{\bar b, \bar t}] -- [fermion] b
        b -- [fermion] c [dot]
        c -- [fermion] a
        a -- [fermion] f1 [{b, t}]
        c -- [fermion] x1 [chi]
        x2 [chibar] -- [fermion] c
        ```

-   **A W'**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- [fermion] a
    a -- [fermion] i2 [qbar']
    a -- [W'] b
    b -- f1 [W]
    b -- f2 [Z]
    ```

    <small>ATLAS, [EXOT-2013-07](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2013-07/), auxiliary figure 1</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 [q] -- [fermion] a
        a -- [fermion] i2 [qbar']
        a -- [W'] b
        b -- f1 [W]
        b -- f2 [Z]
        ```

-   **A heavy resonance**

    ```feynman
    in: g1 g2
    out: v1 v2
    g1 [particle={g}]
    g2 [particle={g}]
    v1 [particle={V}]
    v2 [particle={V}]
    g1 -- [gluon] a
    a -- [gluon] g2
    a -- [photon, label'={G_{KK}}] b
    b -- [photon] v1
    b -- [photon] v2
    ```

    <small>ATLAS, [EXOT-2017-31](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2017-31/), figure 1d</small>

    ??? example "Source"

        ```text
        in: g1 g2
        out: v1 v2
        g1 [particle={g}]
        g2 [particle={g}]
        v1 [particle={V}]
        v2 [particle={V}]
        g1 -- [gluon] a
        a -- [gluon] g2
        a -- [photon, label'={G_{KK}}] b
        b -- [photon] v1
        b -- [photon] v2
        ```

-   **Leptoquarks · a**

    ```feynman
    in: lq
    out: l q
    lq -- [charged scalar, label={LQ}] v [label=\sqrt{\beta}\lambda]
    v -- [fermion, label'={l}] l
    q -- [fermion, label'={q}] v
    ```

    <small>ATLAS, [EXOT-2015-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-19/), figure 1</small>

    ??? example "Source"

        ```text
        in: lq
        out: l q
        lq -- [charged scalar, label={LQ}] v [label=\sqrt{\beta}\lambda]
        v -- [fermion, label'={l}] l
        q -- [fermion, label'={q}] v
        ```

-   **Leptoquarks · b**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 -- [gluon] a
    i2 -- [gluon] a
    a -- [gluon] b
    b -- [charged scalar] f1
    f2 -- [charged scalar] b
    ```

    <small>ATLAS, [EXOT-2015-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-19/), figure 2, part 1</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 f2
        i1 -- [gluon] a
        i2 -- [gluon] a
        a -- [gluon] b
        b -- [charged scalar] f1
        f2 -- [charged scalar] b
        ```

-   **A single vector-like T**

    ```feynman
    in: q g
    out: qp hz t bb
    q [particle={q}]
    qp [particle={q'}]
    hz [particle={H/Z}]
    t [particle={t}]
    g [particle={g}]
    bb [particle={\bar{b}/\bar{t}}]
    q -- [fermion] v1
    v1 -- [fermion] qp
    v1 -- [photon, label'={W/Z}] v2
    v4 -- [fermion, label={b/t}] v2
    v2 -- [fermion, label={T}, color=red] v3
    v3 -- [photon] hz
    v3 -- [fermion] t
    g -- [gluon] v4
    bb -- [fermion] v4
    ```

    <small>ATLAS, [EXOT-2018-52](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2018-52/), figure 1a</small>

    ??? example "Source"

        ```text
        in: q g
        out: qp hz t bb
        q [particle={q}]
        qp [particle={q'}]
        hz [particle={H/Z}]
        t [particle={t}]
        g [particle={g}]
        bb [particle={\bar{b}/\bar{t}}]
        q -- [fermion] v1
        v1 -- [fermion] qp
        v1 -- [photon, label'={W/Z}] v2
        v4 -- [fermion, label={b/t}] v2
        v2 -- [fermion, label={T}, color=red] v3
        v3 -- [photon] hz
        v3 -- [fermion] t
        g -- [gluon] v4
        bb -- [fermion] v4
        ```

-   **Vector-like B · a**

    ```feynman
    in: i1 i2
    out: f1 t w
    i1 [q] -- [fermion] a -- [fermion] f1 [q]
    a -- [scalar, label=Z] b
    i2 [b] -- [fermion] b [label=\lambda]
    b -- [B, color=red] c
    c -- [fermion] t [t]
    c -- [boson] w [W]
    ```

    <small>ATLAS, [EXOT-2014-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-13/), figure 1a</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: f1 t w
        i1 [q] -- [fermion] a -- [fermion] f1 [q]
        a -- [scalar, label=Z] b
        i2 [b] -- [fermion] b [label=\lambda]
        b -- [B, color=red] c
        c -- [fermion] t [t]
        c -- [boson] w [W]
        ```

-   **Vector-like B · b**

    ```feynman
    in: i1 i2
    out: t w
    i1 [g] -- a [label=f_g]
    i2 [b] -- [fermion] a
    a -- [B, color=blue, label=b^*] c
    c -- [fermion] t [t]
    c -- [boson] w [W]
    ```

    <small>ATLAS, [EXOT-2014-13](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-13/), figure 1b</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: t w
        i1 [g] -- a [label=f_g]
        i2 [b] -- [fermion] a
        a -- [B, color=blue, label=b^*] c
        c -- [fermion] t [t]
        c -- [boson] w [W]
        ```

-   **A heavy Majorana neutrino**

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

    <small>ATLAS, [EXOT-2012-24](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2012-24/), figure 1</small>

    ??? example "Source"

        ```text
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

-   **Type-III seesaw**

    ```feynman
    in: q qb
    out: nu1 l1 l2 l3 nu3 nu2
    q [particle={q}]
    qb [particle={\bar{q}'}]
    nu1 [particle={\nu}]
    l1 [particle={\ell^\pm}]
    l2 [particle={\ell^\mp}]
    l3 [particle={\ell'^\pm}]
    nu3 [particle={\nu}]
    q -- [plain] a
    a -- [plain] qb
    a -- [photon, label={W^*}] b
    b -- [plain, label={N^0}, color=#2896dc] c
    b -- [plain, label'={L^\pm}, color=#e61e5a] d
    c -- [scalar] nu1
    c -- [photon, label={Z}] e
    e -- [plain] l1
    e -- [plain] l2
    d -- [scalar, label={\nu}] nu2
    d -- [photon, label={W^\pm}] f
    f -- [plain] l3
    f -- [scalar] nu3
    ```

    <small>ATLAS, [EXOT-2020-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2020-02/), figure 1a</small>

    ??? example "Source"

        ```text
        in: q qb
        out: nu1 l1 l2 l3 nu3 nu2
        q [particle={q}]
        qb [particle={\bar{q}'}]
        nu1 [particle={\nu}]
        l1 [particle={\ell^\pm}]
        l2 [particle={\ell^\mp}]
        l3 [particle={\ell'^\pm}]
        nu3 [particle={\nu}]
        q -- [plain] a
        a -- [plain] qb
        a -- [photon, label={W^*}] b
        b -- [plain, label={N^0}, color=#2896dc] c
        b -- [plain, label'={L^\pm}, color=#e61e5a] d
        c -- [scalar] nu1
        c -- [photon, label={Z}] e
        e -- [plain] l1
        e -- [plain] l2
        d -- [scalar, label={\nu}] nu2
        d -- [photon, label={W^\pm}] f
        f -- [plain] l3
        f -- [scalar] nu3
        ```

-   **An excited muon**

    ```feynman
    in: i1 i2
    out: mu1 mu2 q2 qb2
    i1 [q] -- [fermion] a [blob]
    a -- [fermion] i2 [qbar]
    a -- [fermion] mu1 [mu-]
    b [blob] -- [fermion, label=\mu^{*+}] a
    mu2 [mu+] -- [fermion] b
    b -- [fermion] q2 [q]
    qb2 [qbar] -- [fermion] b
    ```

    <small>ATLAS, [EXOT-2015-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2015-01/), figure 1</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: mu1 mu2 q2 qb2
        i1 [q] -- [fermion] a [blob]
        a -- [fermion] i2 [qbar]
        a -- [fermion] mu1 [mu-]
        b [blob] -- [fermion, label=\mu^{*+}] a
        mu2 [mu+] -- [fermion] b
        b -- [fermion] q2 [q]
        qb2 [qbar] -- [fermion] b
        ```

-   **Dark photons · a**

    ```feynman
    in: i1 i2
    out: qj1 xd1 lp1 lm1 lp2 lm2 xd2 qj2
    i1 [q] -- [fermion] a
    b -- [fermion] i2 [q]
    a -- [gluon, label=\tilde g] b
    a -- [charged scalar, label=\tilde q_i] c
    d -- [charged scalar, label'=\tilde q_i] b
    c -- [fermion] qj1 [q_j]
    c -- [fermion, label'=\tilde\chi^0_1] e
    e -- [fermion] xd1 [\tilde\chi_d]
    e -- [photon, label'=\gamma_d] g1
    lp1 [l+] -- [fermion] g1
    g1 -- [fermion] lm1 [l-]
    qj2 [q_j] -- [fermion] d
    f -- [fermion, label'=\tilde\chi^0_1] d
    xd2 [\tilde\chi_d] -- [fermion] f
    f -- [photon, label=\gamma_d] g2
    lp2 [l+] -- [fermion] g2
    g2 -- [fermion] lm2 [l-]
    ```

    <small>ATLAS, [EXOT-2014-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-09/), figure 1a</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: qj1 xd1 lp1 lm1 lp2 lm2 xd2 qj2
        i1 [q] -- [fermion] a
        b -- [fermion] i2 [q]
        a -- [gluon, label=\tilde g] b
        a -- [charged scalar, label=\tilde q_i] c
        d -- [charged scalar, label'=\tilde q_i] b
        c -- [fermion] qj1 [q_j]
        c -- [fermion, label'=\tilde\chi^0_1] e
        e -- [fermion] xd1 [\tilde\chi_d]
        e -- [photon, label'=\gamma_d] g1
        lp1 [l+] -- [fermion] g1
        g1 -- [fermion] lm1 [l-]
        qj2 [q_j] -- [fermion] d
        f -- [fermion, label'=\tilde\chi^0_1] d
        xd2 [\tilde\chi_d] -- [fermion] f
        f -- [photon, label=\gamma_d] g2
        lp2 [l+] -- [fermion] g2
        g2 -- [fermion] lm2 [l-]
        ```

-   **Dark photons · b**

    ```feynman
    in: i1 i2
    out: qj1 xd1 lp1 lm1 lp2 lm2 lp3 lm3 lp4 lm4 xd2 qj2
    i1 [q] -- [fermion] a
    b -- [fermion] i2 [q]
    a -- [gluino, label=\tilde g] b
    a -- [squark, label=\tilde q_i] c
    d -- [squark, label'=\tilde q_i] b
    c -- [fermion] qj1 [q_j]
    c -- [neutralino, label'=\tilde\chi^0_1] e
    e -- [neutralino, no label] xd1 [\tilde\chi_d]
    e -- [charged scalar, label'=s_d] s1
    s1 -- [photon, label=\gamma_d] g1
    s1 -- [photon, label'=\gamma_d] g2
    lp1 [l+] -- [fermion] g1
    g1 -- [fermion] lm1 [l-]
    lp2 [l+] -- [fermion] g2
    g2 -- [fermion] lm2 [l-]
    qj2 [q_j] -- [fermion] d
    f -- [neutralino, label'=\tilde\chi^0_1] d
    f -- [neutralino, no label] xd2 [\tilde\chi_d]
    s2 -- [charged scalar, label'=s_d] f
    s2 -- [photon, label=\gamma_d] g3
    s2 -- [photon, label'=\gamma_d] g4
    lp3 [l+] -- [fermion] g3
    g3 -- [fermion] lm3 [l-]
    lp4 [l+] -- [fermion] g4
    g4 -- [fermion] lm4 [l-]
    ```

    <small>ATLAS, [EXOT-2014-09](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2014-09/), figure 1b</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: qj1 xd1 lp1 lm1 lp2 lm2 lp3 lm3 lp4 lm4 xd2 qj2
        i1 [q] -- [fermion] a
        b -- [fermion] i2 [q]
        a -- [gluino, label=\tilde g] b
        a -- [squark, label=\tilde q_i] c
        d -- [squark, label'=\tilde q_i] b
        c -- [fermion] qj1 [q_j]
        c -- [neutralino, label'=\tilde\chi^0_1] e
        e -- [neutralino, no label] xd1 [\tilde\chi_d]
        e -- [charged scalar, label'=s_d] s1
        s1 -- [photon, label=\gamma_d] g1
        s1 -- [photon, label'=\gamma_d] g2
        lp1 [l+] -- [fermion] g1
        g1 -- [fermion] lm1 [l-]
        lp2 [l+] -- [fermion] g2
        g2 -- [fermion] lm2 [l-]
        qj2 [q_j] -- [fermion] d
        f -- [neutralino, label'=\tilde\chi^0_1] d
        f -- [neutralino, no label] xd2 [\tilde\chi_d]
        s2 -- [charged scalar, label'=s_d] f
        s2 -- [photon, label=\gamma_d] g3
        s2 -- [photon, label'=\gamma_d] g4
        lp3 [l+] -- [fermion] g3
        g3 -- [fermion] lm3 [l-]
        lp4 [l+] -- [fermion] g4
        g4 -- [fermion] lm4 [l-]
        ```

-   **An axion-like particle**

    ```feynman
    in: g1 g2
    out: uc al w bb
    g1 [particle={g}]
    g2 [particle={g}]
    uc [particle={u/c}]
    bb [particle={\bar{b}}]
    al [\mathit{a}]
    w [particle={W}]
    g1 -- [gluon] a
    a -- [gluon] g2
    a -- [gluon, label'={g}] b
    b -- [fermion, label'={t}] t1
    t1 -- [fermion] uc
    bb -- [fermion] t2
    t2 -- [fermion, label={\bar{t}}] b
    t1 -- [scalar] al
    t2 -- [photon] w
    ```

    <small>ATLAS, [EXOT-2021-32](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2021-32/), figure 3c</small>

    ??? example "Source"

        ```text
        in: g1 g2
        out: uc al w bb
        g1 [particle={g}]
        g2 [particle={g}]
        uc [particle={u/c}]
        bb [particle={\bar{b}}]
        al [\mathit{a}]
        w [particle={W}]
        g1 -- [gluon] a
        a -- [gluon] g2
        a -- [gluon, label'={g}] b
        b -- [fermion, label'={t}] t1
        t1 -- [fermion] uc
        bb -- [fermion] t2
        t2 -- [fermion, label={\bar{t}}] b
        t1 -- [scalar] al
        t2 -- [photon] w
        ```

-   **Same-sign leptons from WW scattering**

    ```feynman
    in: u1 u2
    out: d1 l1 l2 d2
    u1 [particle={\mathrm{u}}]
    u2 [particle={\mathrm{u}}]
    d1 [particle={\mathrm{d}}]
    d2 [particle={\mathrm{d}}]
    o [dot]
    l1 [particle={\ell'^+}]
    l2 [particle={\ell^+}]
    u1 -- [fermion] a
    a -- [fermion] d1
    u2 -- [fermion] b
    b -- [fermion] d2
    a -- [boson, label'={W^+}] c
    b -- [boson, label={W^+}] e
    l1 -- [fermion] c
    l2 -- [fermion] e
    c -- [fermion, label={\nu^c_{\ell'}}] o
    e -- [fermion, label'={\nu_\ell}] o
    ```

    <small>ATLAS, [EXOT-2023-16](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/EXOT-2023-16/), figure 1b</small>

    ??? example "Source"

        ```text
        in: u1 u2
        out: d1 l1 l2 d2
        u1 [particle={\mathrm{u}}]
        u2 [particle={\mathrm{u}}]
        d1 [particle={\mathrm{d}}]
        d2 [particle={\mathrm{d}}]
        o [dot]
        l1 [particle={\ell'^+}]
        l2 [particle={\ell^+}]
        u1 -- [fermion] a
        a -- [fermion] d1
        u2 -- [fermion] b
        b -- [fermion] d2
        a -- [boson, label'={W^+}] c
        b -- [boson, label={W^+}] e
        l1 -- [fermion] c
        l2 -- [fermion] e
        c -- [fermion, label={\nu^c_{\ell'}}] o
        e -- [fermion, label'={\nu_\ell}] o
        ```

</div>
