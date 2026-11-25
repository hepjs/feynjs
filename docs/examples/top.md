---
tags:
  - top quark
  - ttbar
  - single top
  - tZq
  - four tops
---

# Top quarks

The heaviest quark: made in pairs by the strong force, singly by the weak, with a boson beside it, and four at a time; and its decay to a b quark and a W.

## Textbook

<div class="grid cards" markdown>

-   **qq̄ → tt̄**

    ```feynman
    q qbar > g > t tbar
    ```

    ```text
    q qbar > g > t tbar
    ```

    Annihilation through a gluon in the s channel: most top pairs at the Tevatron were made this
    way.

-   **gg → tt̄, s channel**

    ```feynman
    i1 [g] -- a -- i2 [g]
    a -- [gluon] b
    f1 [t] -- b -- f2 [tbar]
    ```

    ```text
    i1 [g] -- a -- i2 [g]
    a -- [gluon] b
    f1 [t] -- b -- f2 [tbar]
    ```

    Gluon fusion makes about 90% of top pairs at the LHC, through three diagrams. The first goes
    through the three-gluon vertex.

-   **gg → tt̄, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- b
    f2 [tbar] -- b
    b -- [fermion, label=t] a
    a -- f1 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- a
    i2 [g] -- b
    f2 [tbar] -- b
    b -- [fermion, label=t] a
    a -- f1 [t]
    ```

    A top quark exchanged between the gluons.

-   **gg → tt̄, u channel**

    ```feynman
    in: i1 i2
    out: f2 f1
    i1 [g] -- a
    i2 [g] -- b
    f1 [t]
    f2 [t~]
    f2 -- [t~, no arrow, with arrow=.2] b
    b -- [fermion, label=t] a
    a -- [t, no arrow, with arrow=.8] f1
    ```

    ```text
    in: i1 i2
    out: f2 f1
    i1 [g] -- a
    i2 [g] -- b
    f1 [t]
    f2 [t~]
    f2 -- [t~, no arrow, with arrow=.2] b
    b -- [fermion, label=t] a
    a -- [t, no arrow, with arrow=.8] f1
    ```

    The same with the outgoing top and antitop swapped, the arrows moved
    clear of the crossing. `t~`, MadGraph's name, is the same as `tbar`.

-   **Top decay, t → bW⁺**

    ```feynman
    t > b W+(> l+ nu_l)
    ```

    ```text
    t > b W+(> l+ nu_l)
    ```

    The top decays almost always to a b quark and a W. `W+(> l+ nu_l)` decays the W on the
    spot, here to a lepton and its neutrino.

-   **Single top with a W**

    ```feynman
    in: i1 i2
    out: f2 f1
    i1 [g] -- a
    i2 [b] -- b -- [fermion, label=t] a
    b -- [boson] f1 [W-]
    a -- f2 [t]
    ```

    ```text
    in: i1 i2
    out: f2 f1
    i1 [g] -- a
    i2 [b] -- b -- [fermion, label=t] a
    b -- [boson] f1 [W-]
    a -- f2 [t]
    ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **tt̄ production**

    ```feynman
    in: q1 q2
    out: t tb
    q1 [particle={q}]
    q2 [particle={\bar{q}}]
    t [particle={t}]
    tb [particle={\bar{t}}]
    q1 -- [fermion] a
    a -- [fermion] q2
    a -- [gluon] b
    b -- [fermion] t
    tb -- [fermion] b
    ```

    ```text
    in: q1 q2
    out: t tb
    q1 [particle={q}]
    q2 [particle={\bar{q}}]
    t [particle={t}]
    tb [particle={\bar{t}}]
    q1 -- [fermion] a
    a -- [fermion] q2
    a -- [gluon] b
    b -- [fermion] t
    tb -- [fermion] b
    ```

    <small>ATLAS, [TOPQ-2023-19](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2023-19/), figure 1c</small>

-   **tt̄, decayed**

    ```feynman
    in: g1 g2
    out: bo lp nu lm nb bb
    g1 -- [gluon] a
    g2 -- [gluon] a
    a -- [gluon] c
    c -- [fermion, label=t] t -- [fermion] bo [b]
    bb [bbar] -- [fermion] tb -- [fermion, label=\bar t] c
    t -- [W+] w1
    tb -- [W-] w2
    w1 -- [fermion] nu [\nu_l]
    lp [l^+] -- [fermion] w1
    w2 -- [fermion] lm [l^-]
    nb [\bar\nu_l] -- [fermion] w2
    ```

    ```text
    in: g1 g2
    out: bo lp nu lm nb bb
    g1 -- [gluon] a
    g2 -- [gluon] a
    a -- [gluon] c
    c -- [fermion, label=t] t -- [fermion] bo [b]
    bb [bbar] -- [fermion] tb -- [fermion, label=\bar t] c
    t -- [W+] w1
    tb -- [W-] w2
    w1 -- [fermion] nu [\nu_l]
    lp [l^+] -- [fermion] w1
    w2 -- [fermion] lm [l^-]
    nb [\bar\nu_l] -- [fermion] w2
    ```

    <small>ATLAS, [STDM-2011-48](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2011-48/), figure 1a</small>

-   **Single top · a**

    ```feynman
    in: q b
    out: qp t
    q [particle={q}]
    qp [particle={q'}]
    b [particle={b}]
    t [particle={t}]
    q -- [fermion] v1
    v1 -- [fermion] qp
    v1 -- [photon, label={W}] v2
    b -- [fermion] v2
    v2 -- [fermion, color=#00e63c] t
    ```

    ```text
    in: q b
    out: qp t
    q [particle={q}]
    qp [particle={q'}]
    b [particle={b}]
    t [particle={t}]
    q -- [fermion] v1
    v1 -- [fermion] qp
    v1 -- [photon, label={W}] v2
    b -- [fermion] v2
    v2 -- [fermion, color=#00e63c] t
    ```

    <small>ATLAS, [TOPQ-2017-16](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2017-16/), figure 1a</small>

-   **Single top · b**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [g] -- [gluon] v1
    i2 [b] -- [fermion] v1 -- [fermion, label=b] v2 -- [fermion, color=#00e63c] f2 [t]
    v2 -- [boson] f1 [W]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [g] -- [gluon] v1
    i2 [b] -- [fermion] v1 -- [fermion, label=b] v2 -- [fermion, color=#00e63c] f2 [t]
    v2 -- [boson] f1 [W]
    ```

    <small>ATLAS, [TOPQ-2017-16](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2017-16/), figure 1b</small>

-   **Single top · c**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- [fermion] v1 -- [fermion] i2 [\bar q']
    v1 -- [boson, label=W] v2
    f1 [\bar b] -- [fermion] v2 -- [fermion, color=#00e63c] f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- [fermion] v1 -- [fermion] i2 [\bar q']
    v1 -- [boson, label=W] v2
    f1 [\bar b] -- [fermion] v2 -- [fermion, color=#00e63c] f2 [t]
    ```

    <small>ATLAS, [TOPQ-2017-16](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2017-16/), figure 1c</small>

-   **Single top, s channel**

    ```feynman
    in: q1 q2
    out: t bb
    q1 [particle={q}]
    q2 [particle={\overline{q}'}]
    a [dot]
    b [dot]
    t [particle={t}]
    bb [particle={\overline{b}}]
    q1 -- [fermion, color=#0000ff] a
    a -- [fermion, color=#0000ff] q2
    a -- [boson, label={W}, color=#228b22] b
    b -- [fermion, color=#cd5c5c] t
    bb -- [fermion, color=#cd5c5c] b
    ```

    ```text
    in: q1 q2
    out: t bb
    q1 [particle={q}]
    q2 [particle={\overline{q}'}]
    a [dot]
    b [dot]
    t [particle={t}]
    bb [particle={\overline{b}}]
    q1 -- [fermion, color=#0000ff] a
    a -- [fermion, color=#0000ff] q2
    a -- [boson, label={W}, color=#228b22] b
    b -- [fermion, color=#cd5c5c] t
    bb -- [fermion, color=#cd5c5c] b
    ```

    <small>ATLAS, [TOPQ-2018-04](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-04/), figure 1</small>

-   **Single top, t channel**

    ```feynman
    in: o1 i2
    out: i1 o2
    o1 [particle={\bar{d}}]
    i1 [particle={\bar{u}}]
    i2 [particle={b}]
    o2 [particle={t}]
    i1 -- [fermion] a
    a -- [fermion] o1
    i2 -- [fermion] b
    b -- [fermion] o2
    a -- [photon, label={W^+}] b
    ```

    ```text
    in: o1 i2
    out: i1 o2
    o1 [particle={\bar{d}}]
    i1 [particle={\bar{u}}]
    i2 [particle={b}]
    o2 [particle={t}]
    i1 -- [fermion] a
    a -- [fermion] o1
    i2 -- [fermion] b
    b -- [fermion] o2
    a -- [photon, label={W^+}] b
    ```

    <small>ATLAS, [TOPQ-2018-10](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-10/), figure 1b</small>

-   **tt̄W · a**

    ```feynman
    in: i1 i2
    out: f1 f2 f3
    i2 [q'] -- [fermion] v1 -- [fermion, label=q] v2 -- [fermion] i1 [\bar q]
    v1 -- [boson] f3 [W]
    v2 -- [gluon] v3
    f1 [\bar t] -- [fermion] v3 -- [fermion] f2 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3
    i2 [q'] -- [fermion] v1 -- [fermion, label=q] v2 -- [fermion] i1 [\bar q]
    v1 -- [boson] f3 [W]
    v2 -- [gluon] v3
    f1 [\bar t] -- [fermion] v3 -- [fermion] f2 [t]
    ```

    <small>ATLAS, [TOPQ-2013-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2013-05/), figure 1a</small>

-   **tt̄W · b**

    ```feynman
    in: i1 i2
    out: f1 f2 f3
    i1 [g] -- [gluon] v1
    i2 [g] -- [gluon] v1
    v1 -- [gluon] v2
    f2 -- [fermion] vz -- [fermion, label=\bar t] v2 -- [fermion] f3 [t]
    vz -- [boson] f1 [Z]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3
    i1 [g] -- [gluon] v1
    i2 [g] -- [gluon] v1
    v1 -- [gluon] v2
    f2 -- [fermion] vz -- [fermion, label=\bar t] v2 -- [fermion] f3 [t]
    vz -- [boson] f1 [Z]
    ```

    <small>ATLAS, [TOPQ-2013-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2013-05/), figure 1b</small>

-   **tZq · a**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] v2 [dot]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] vt [dot] -- [fermion] f4 [t]
    vt -- [boson, label=Z/\gamma^*] vz [dot]
    f2 [\ell^+] -- [fermion] vz -- [fermion] f3 [\ell^-]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] v2 [dot]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] vt [dot] -- [fermion] f4 [t]
    vt -- [boson, label=Z/\gamma^*] vz [dot]
    f2 [\ell^+] -- [fermion] vz -- [fermion] f3 [\ell^-]
    ```

    <small>ATLAS, [TOPQ-2018-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-01/), figure 1a</small>

-   **tZq · b**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] vw [dot] -- [boson, label=W] v2 [dot]
    vw -- [boson, label=Z/\gamma^*] vz [dot]
    f2 [\ell^+] -- [fermion] vz -- [fermion] f3 [\ell^-]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] f4 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] vw [dot] -- [boson, label=W] v2 [dot]
    vw -- [boson, label=Z/\gamma^*] vz [dot]
    f2 [\ell^+] -- [fermion] vz -- [fermion] f3 [\ell^-]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] f4 [t]
    ```

    <small>ATLAS, [TOPQ-2018-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-01/), figure 1b</small>

-   **tZq · c**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] va [dot]
    f2 [\ell^+] -- [fermion] va -- [fermion] vb [dot] -- [fermion] f3 [\ell^-]
    vb -- [boson, label=W] v2 [dot]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] f4 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [u] -- [fermion] v1 [dot] -- [fermion] f1 [d]
    v1 -- [boson, label=W] va [dot]
    f2 [\ell^+] -- [fermion] va -- [fermion] vb [dot] -- [fermion] f3 [\ell^-]
    vb -- [boson, label=W] v2 [dot]
    i2 -- [gluon] vg [dot]
    f5 [\bar b] -- [fermion] vg -- [fermion, label=b] v2 -- [fermion] f4 [t]
    ```

    <small>ATLAS, [TOPQ-2018-01](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-01/), figure 1c</small>

-   **tt̄γ**

    ```feynman
    in: g1 g2
    out: l gam nu bb bq u dq
    g1 [particle={g}]
    g2 [particle={g}]
    bb [particle={\bar{b}}]
    l [particle={\ell^-}]
    gam [particle={\gamma}]
    nu [particle={\bar{\nu}}]
    bq [particle={b}]
    u [particle={u}]
    dq [particle={\bar{d}}]
    g1 -- [gluon] a
    g2 -- [gluon] a
    a -- [gluon, label={g}] b
    c -- [fermion, label'={\bar{t}}] b
    b -- [fermion, label'={t}] d
    c -- [photon, label={W^-}, color=red] e
    bb -- [fermion] c
    e -- [fermion] r
    r -- [plain] l
    r -- [photon, color=blue] gam
    nu -- [fermion] e
    d -- [fermion] bq
    d -- [photon, label'={W^+}, color=red] f
    f -- [fermion] u
    dq -- [fermion] f
    ```

    ```text
    in: g1 g2
    out: l gam nu bb bq u dq
    g1 [particle={g}]
    g2 [particle={g}]
    bb [particle={\bar{b}}]
    l [particle={\ell^-}]
    gam [particle={\gamma}]
    nu [particle={\bar{\nu}}]
    bq [particle={b}]
    u [particle={u}]
    dq [particle={\bar{d}}]
    g1 -- [gluon] a
    g2 -- [gluon] a
    a -- [gluon, label={g}] b
    c -- [fermion, label'={\bar{t}}] b
    b -- [fermion, label'={t}] d
    c -- [photon, label={W^-}, color=red] e
    bb -- [fermion] c
    e -- [fermion] r
    r -- [plain] l
    r -- [photon, color=blue] gam
    nu -- [fermion] e
    d -- [fermion] bq
    d -- [photon, label'={W^+}, color=red] f
    f -- [fermion] u
    dq -- [fermion] f
    ```

    <small>ATLAS, [TOPQ-2018-24](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-24/), figure 1b</small>

-   **Four tops · a**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] d
    f2 [\bar t] -- [fermion, color=blue] b -- [fermion, color=blue] a -- [fermion, color=blue] f1 [t]
    f4 [\bar t] -- [fermion, color=blue] d -- [fermion, color=blue] c -- [fermion, color=blue] f3 [t]
    b -- [gluon] c
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] d
    f2 [\bar t] -- [fermion, color=blue] b -- [fermion, color=blue] a -- [fermion, color=blue] f1 [t]
    f4 [\bar t] -- [fermion, color=blue] d -- [fermion, color=blue] c -- [fermion, color=blue] f3 [t]
    b -- [gluon] c
    ```

    <small>ATLAS, [TOPQ-2018-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-05/), figure 1a</small>

-   **Four tops · b**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] a
    a -- [gluon] b
    b -- [gluon] c
    b -- [gluon] d
    f2 [\bar t] -- [fermion, color=blue] c -- [fermion, color=blue] f1 [t]
    f4 [\bar t] -- [fermion, color=blue] d -- [fermion, color=blue] f3 [t]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] a
    a -- [gluon] b
    b -- [gluon] c
    b -- [gluon] d
    f2 [\bar t] -- [fermion, color=blue] c -- [fermion, color=blue] f1 [t]
    f4 [\bar t] -- [fermion, color=blue] d -- [fermion, color=blue] f3 [t]
    ```

    <small>ATLAS, [TOPQ-2018-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-05/), figure 1b</small>

-   **Flavour-changing neutral currents · a**

    ```feynman
    in: g q
    out: ph l n bq
    ph [particle={\gamma}]
    bq [particle={b}]
    l [particle={\ell^+}]
    n [particle={\nu}]
    g -- [gluon, label={g}] a
    q -- [fermion, label'={u/c}] a
    a -- [fermion, label={u/c}] f
    f -- [photon] ph
    f -- [fermion, label'={t}] c
    c -- [fermion] bq
    c -- [boson, label={W^+}] w
    l -- [fermion] w
    w -- [fermion] n
    ```

    ```text
    in: g q
    out: ph l n bq
    ph [particle={\gamma}]
    bq [particle={b}]
    l [particle={\ell^+}]
    n [particle={\nu}]
    g -- [gluon, label={g}] a
    q -- [fermion, label'={u/c}] a
    a -- [fermion, label={u/c}] f
    f -- [photon] ph
    f -- [fermion, label'={t}] c
    c -- [fermion] bq
    c -- [boson, label={W^+}] w
    l -- [fermion] w
    w -- [fermion] n
    ```

    <small>ATLAS, [TOPQ-2018-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-22/), figure 1a</small>

-   **Flavour-changing neutral currents · b**

    ```feynman
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] a
    a -- [gluon, label=g] b
    c -- [fermion, label=\bar t] b
    b -- [fermion, label=t] d [dot, color=red]
    f3 [\bar b] -- [fermion] c
    c -- [boson, label=W^-] w
    f1 [\bar\nu] -- [fermion] w -- [fermion] f2 [\ell]
    d -- [photon] f4 [\gamma]
    d -- [fermion] f5 [u/c]
    ```

    ```text
    in: i1 i2
    out: f1 f2 f3 f4 f5
    i1 [g] -- [gluon] a
    i2 [g] -- [gluon] a
    a -- [gluon, label=g] b
    c -- [fermion, label=\bar t] b
    b -- [fermion, label=t] d [dot, color=red]
    f3 [\bar b] -- [fermion] c
    c -- [boson, label=W^-] w
    f1 [\bar\nu] -- [fermion] w -- [fermion] f2 [\ell]
    d -- [photon] f4 [\gamma]
    d -- [fermion] f5 [u/c]
    ```

    <small>ATLAS, [TOPQ-2018-22](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/TOPQ-2018-22/), figure 1b</small>

</div>
