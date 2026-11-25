---
tags:
  - Drell-Yan
  - W+jets
  - Z+jets
  - Z+b
---

# V + jets

A W or a Z with quarks and gluons beside it: Drell–Yan, the boson recoiling against a jet, and the Z with b-quarks.

## Textbook

<div class="grid cards" markdown>

-   **Drell–Yan, qq̄ → γ\*/Z → ℓ⁺ℓ⁻**

    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [photon, label={\gamma^*, Z}] b
    f1 [l-] -- b -- f2 [l+]
    ```

    ```text
    i1 [q] -- a -- i2 [qbar]
    a -- [photon, label={\gamma^*, Z}] b
    f1 [l-] -- b -- f2 [l+]
    ```

    A photon or a Z in the s channel. One label names both, in braces because it holds a comma.

-   **W production and decay, ud̄ → W⁺ → e⁺ν<sub>e</sub>**

    ```feynman
    u dbar > W+ > e+ nu_e
    ```

    ```text
    u dbar > W+ > e+ nu_e
    ```

    The charged current: a u quark and a d̄ antiquark make a W⁺, which decays to a positron and
    a neutrino.

-   **Z + jet, qg → Zq**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a
    i2 [g] -- a
    a -- [q] b
    b -- f1 [Z]
    b -- f2 [q]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a
    i2 [g] -- a
    a -- [q] b
    b -- f1 [Z]
    b -- f2 [q]
    ```

    The gluon turns the quark into a Z and a quark: the commonest way a Z is seen recoiling against a jet.

-   **Z + jet, qq̄ → Zg**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f2 [g]
    i2 [qbar] -- b -- f1 [Z]
    a -- [q] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f2 [g]
    i2 [qbar] -- b -- f1 [Z]
    a -- [q] b
    ```

    The same final state from a quark and an antiquark, the gluon radiated.

-   **Z → bb̄**

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [Z] b
    f1 [b] -- b -- f2 [bbar]
    b -- [gluon] c
    c -- f3 [g]
    ```

    ```text
    i1 [e-] -- a -- i2 [e+]
    a -- [Z] b
    f1 [b] -- b -- f2 [bbar]
    b -- [gluon] c
    c -- f3 [g]
    ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **W + 2 jets · a**

    ```feynman
    dots: all
    in: qi gi
    out: nu lb qo go
    qi [q] -- [fermion] a -- [fermion] b -- [fermion] qo [q]
    a -- [W+] w
    w -- [fermion] nu [nu]
    lb [\bar\ell] -- [fermion] w
    gi [g] -- [gluon] s
    s -- [gluon] b
    s -- [gluon] go [g]
    ```

    ```text
    dots: all
    in: qi gi
    out: nu lb qo go
    qi [q] -- [fermion] a -- [fermion] b -- [fermion] qo [q]
    a -- [W+] w
    w -- [fermion] nu [nu]
    lb [\bar\ell] -- [fermion] w
    gi [g] -- [gluon] s
    s -- [gluon] b
    s -- [gluon] go [g]
    ```

    <small>ATLAS, [STDM-2011-29](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-29/), figure 1a</small>

-   **W + 2 jets · b**

    ```feynman
    in: qi qb g1 g2
    out: nu lb g3 g4
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a [dot] -- [W+] w [dot]
    w -- [fermion] nu [nu]
    lb [\bar\ell] -- [fermion] w
    g1 -- [gluon] c [dot] -- [gluon] g3
    g2 -- [gluon] d [dot] -- [gluon] g4
    c -- [gluon] d
    ```

    ```text
    in: qi qb g1 g2
    out: nu lb g3 g4
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a [dot] -- [W+] w [dot]
    w -- [fermion] nu [nu]
    lb [\bar\ell] -- [fermion] w
    g1 -- [gluon] c [dot] -- [gluon] g3
    g2 -- [gluon] d [dot] -- [gluon] g4
    c -- [gluon] d
    ```

    <small>ATLAS, [STDM-2011-29](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-29/), figure 1b</small>

-   **Z + b-jets · a**

    ```feynman
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a
    gi [g] -- [gluon] a
    a -- [fermion] c
    c -- [boson] z [Z]
    c -- [fermion] bo [b]
    ```

    ```text
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a
    gi [g] -- [gluon] a
    a -- [fermion] c
    c -- [boson] z [Z]
    c -- [fermion] bo [b]
    ```

    <small>ATLAS, [STDM-2011-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-22/), figure 1a</small>

-   **Z + b-jets · b**

    ```feynman
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a -- [fermion] c -- [fermion] bo [b]
    a -- [boson] z [Z]
    gi [g] -- [gluon] c
    ```

    ```text
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a -- [fermion] c -- [fermion] bo [b]
    a -- [boson] z [Z]
    gi [g] -- [gluon] c
    ```

    <small>ATLAS, [STDM-2011-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-22/), figure 1b</small>

-   **Z + b-jets · c**

    ```feynman
    in: qi qb
    out: bo z bb
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [gluon] c
    c -- [fermion] r -- [fermion] bo [b]
    r -- [boson] z [Z]
    bb [bbar] -- [fermion] c
    ```

    ```text
    in: qi qb
    out: bo z bb
    qi [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [gluon] c
    c -- [fermion] r -- [fermion] bo [b]
    r -- [boson] z [Z]
    bb [bbar] -- [fermion] c
    ```

    <small>ATLAS, [STDM-2011-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-22/), figure 1c</small>

-   **Z + b-jets · d**

    ```feynman
    in: qi qb
    out: z bo bb
    qi [q] -- [fermion] a -- [fermion] c -- [fermion] qb [qbar]
    a -- [boson] z [Z]
    c -- [gluon] d
    d -- [fermion] bo [b]
    bb [bbar] -- [fermion] d
    ```

    ```text
    in: qi qb
    out: z bo bb
    qi [q] -- [fermion] a -- [fermion] c -- [fermion] qb [qbar]
    a -- [boson] z [Z]
    c -- [gluon] d
    d -- [fermion] bo [b]
    bb [bbar] -- [fermion] d
    ```

    <small>ATLAS, [STDM-2011-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-22/), figure 1d</small>

-   **Z + b-jets · a**

    ```feynman
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a -- [fermion] c -- [fermion] bo [b]
    a -- [boson] z [Z]
    gi [g] -- [gluon] c
    ```

    ```text
    in: bi gi
    out: z bo
    bi [b] -- [fermion] a -- [fermion] c -- [fermion] bo [b]
    a -- [boson] z [Z]
    gi [g] -- [gluon] c
    ```

    <small>ATLAS, [STDM-2012-15](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-15/), figure 1a</small>

-   **Z + b-jets · b**

    ```feynman
    in: q qb
    out: b z bb
    q [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [gluon] c
    c -- [fermion] r -- [fermion] b [b]
    r -- [boson] z [Z]
    bb [bbar] -- [fermion] c
    ```

    ```text
    in: q qb
    out: b z bb
    q [q] -- [fermion] a -- [fermion] qb [qbar]
    a -- [gluon] c
    c -- [fermion] r -- [fermion] b [b]
    r -- [boson] z [Z]
    bb [bbar] -- [fermion] c
    ```

    <small>ATLAS, [STDM-2012-15](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-15/), figure 1b</small>

-   **Z + b-jets · c**

    ```feynman
    in: q qb
    out: z b bb
    q [q] -- [fermion] a -- [fermion] c -- [fermion] qb [qbar]
    a -- [boson] z [Z]
    c -- [gluon] d
    d -- [fermion] b [b]
    bb [bbar] -- [fermion] d
    ```

    ```text
    in: q qb
    out: z b bb
    q [q] -- [fermion] a -- [fermion] c -- [fermion] qb [qbar]
    a -- [boson] z [Z]
    c -- [gluon] d
    d -- [fermion] b [b]
    bb [bbar] -- [fermion] d
    ```

    <small>ATLAS, [STDM-2012-15](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2012-15/), figure 1c</small>

-   **Electroweak Zjj · a**

    ```feynman
    in: q1 q2
    out: o1 lm lp o2
    q1 [q] -- [fermion] a -- [fermion] o1 [q']
    q2 [q] -- [fermion] b -- [fermion] o2 [q']
    a -- [boson, label=W^+] v
    b -- [boson, label=W^-] v
    v -- [boson, label=Z] z
    z -- [fermion] lm [{\mu^-, e^-}]
    lp [{\mu^+, e^+}] -- [fermion] z
    ```

    ```text
    in: q1 q2
    out: o1 lm lp o2
    q1 [q] -- [fermion] a -- [fermion] o1 [q']
    q2 [q] -- [fermion] b -- [fermion] o2 [q']
    a -- [boson, label=W^+] v
    b -- [boson, label=W^-] v
    v -- [boson, label=Z] z
    z -- [fermion] lm [{\mu^-, e^-}]
    lp [{\mu^+, e^+}] -- [fermion] z
    ```

    <small>ATLAS, [STDM-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2013-02/), figure 1a</small>

-   **Electroweak Zjj · b**

    ```feynman
    in: q1 q2
    out: lm lp o1 o2
    q1 [q] -- [fermion] a -- [fermion] c -- [fermion] o1 [q']
    q2 [q] -- [fermion] b -- [fermion] o2 [q']
    a -- [boson, label=Z] z
    c -- [boson, label=W^\pm] b
    z -- [fermion] lm [{\mu^-, e^-}]
    lp [{\mu^+, e^+}] -- [fermion] z
    ```

    ```text
    in: q1 q2
    out: lm lp o1 o2
    q1 [q] -- [fermion] a -- [fermion] c -- [fermion] o1 [q']
    q2 [q] -- [fermion] b -- [fermion] o2 [q']
    a -- [boson, label=Z] z
    c -- [boson, label=W^\pm] b
    z -- [fermion] lm [{\mu^-, e^-}]
    lp [{\mu^+, e^+}] -- [fermion] z
    ```

    <small>ATLAS, [STDM-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2013-02/), figure 1b</small>

-   **Electroweak Zjj · c**

    ```feynman
    in: q1 q2
    out: o1 lm lp o2
    q1 [q] -- [fermion] a -- [fermion] o1 [q]
    q2 [q] -- [fermion] b -- [fermion] o2 [q]
    a -- [boson, label'=Z] c
    b -- [boson, label'=Z] d
    lp [{\mu^+, e^+}] -- [fermion] d -- [fermion] c -- [fermion] lm [{\mu^-, e^-}]
    ```

    ```text
    in: q1 q2
    out: o1 lm lp o2
    q1 [q] -- [fermion] a -- [fermion] o1 [q]
    q2 [q] -- [fermion] b -- [fermion] o2 [q]
    a -- [boson, label'=Z] c
    b -- [boson, label'=Z] d
    lp [{\mu^+, e^+}] -- [fermion] d -- [fermion] c -- [fermion] lm [{\mu^-, e^-}]
    ```

    <small>ATLAS, [STDM-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2013-02/), figure 1c</small>

-   **Electroweak Wjj**

    ```feynman
    in: q1 q2
    out: q3 v1 v2 q4
    q1 [particle={q}]
    q2 [particle={q''}]
    q3 [particle={q'}]
    q4 [particle={q'''}]
    v1 [particle={W/Z/\gamma}]
    v2 [particle={W/Z/\gamma}]
    q1 -- [fermion] a
    a -- [fermion] b
    b -- [fermion] q3
    q2 -- [fermion] c
    c -- [fermion] e
    e -- [fermion] q4
    a -- [photon] c
    b -- [photon] v1
    e -- [photon] v2
    ```

    ```text
    in: q1 q2
    out: q3 v1 v2 q4
    q1 [particle={q}]
    q2 [particle={q''}]
    q3 [particle={q'}]
    q4 [particle={q'''}]
    v1 [particle={W/Z/\gamma}]
    v2 [particle={W/Z/\gamma}]
    q1 -- [fermion] a
    a -- [fermion] b
    b -- [fermion] q3
    q2 -- [fermion] c
    c -- [fermion] e
    e -- [fermion] q4
    a -- [photon] c
    b -- [photon] v1
    e -- [photon] v2
    ```

    <small>ATLAS, [STDM-2017-26](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2017-26/), figure 1a</small>

</div>
