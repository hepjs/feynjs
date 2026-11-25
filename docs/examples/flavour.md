---
tags:
  - B physics
  - mixing
  - penguin
  - meson decay
  - quarkonium
---

# Flavour physics

Quarks changing flavour inside hadrons: mixing boxes, penguins, the decays of B, D and K mesons with their quark lines grouped into hadrons, and quarkonium. The [tour](tour.md#mesons) draws every light meson as it decays.

## Textbook

<div class="grid cards" markdown>

-   **B⁰–B̄⁰ mixing**

    ```feynman
    in: i1 i2
    out: f1 f2
    f1 [\bar{d}] -- [fermion] a
    a -- [fermion, label={\bar u, \bar c, \bar t}] b
    b -- [fermion] i1 [\bar{b}]
    i2 [d] -- [fermion] c
    c -- [fermion, label={u, c, t}] d
    d -- [fermion] f2 [b]
    b -- [boson, label=W^+] c
    a -- [boson, label=W^-] d
    hadron: B^0 = i1 i2 [brace]
    hadron: \bar{B}^0 = f1 f2 [brace]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    f1 [\bar{d}] -- [fermion] a
    a -- [fermion, label={\bar u, \bar c, \bar t}] b
    b -- [fermion] i1 [\bar{b}]
    i2 [d] -- [fermion] c
    c -- [fermion, label={u, c, t}] d
    d -- [fermion] f2 [b]
    b -- [boson, label=W^+] c
    a -- [boson, label=W^-] d
    hadron: B^0 = i1 i2 [brace]
    hadron: \bar{B}^0 = f1 f2 [brace]
    ```

    Two W bosons exchanged between the quark lines: the box that turns a B⁰ into a B̄⁰. The top
    quark dominates the loop.

-   **b → sγ penguin, B̄⁰ → K̄\*⁰γ**

    ```feynman
    layout: v1
    in: b d1
    out: y s d2
    d2 [\bar{d}] -- [fermion] d1 [\bar{d}]
    b [b] -- [fermion] l1 -- [fermion, label={u, c, t}] l2 -- [fermion] s [s]
    l1 -- [boson, label=W^-] x -- [boson] l2
    x -- [photon] y [\gamma]
    hadron: \bar{B}^0 = b d1 [brace]
    hadron: \bar{K}^{*0} = s d2 [brace]
    ```

    ```text
    layout: v1
    in: b d1
    out: y s d2
    d2 [\bar{d}] -- [fermion] d1 [\bar{d}]
    b [b] -- [fermion] l1 -- [fermion, label={u, c, t}] l2 -- [fermion] s [s]
    l1 -- [boson, label=W^-] x -- [boson] l2
    x -- [photon] y [\gamma]
    hadron: \bar{B}^0 = b d1 [brace]
    hadron: \bar{K}^{*0} = s d2 [brace]
    ```

    The photon leaves the W in the loop, and the d̄ is a spectator. This one is drawn with the
    older layout engine, `layout: v1`, which sends the photon up clear of the loop.

-   **π⁺ → μ⁺ν<sub>μ</sub>**

    ```feynman
    in: u d
    out: mu nu
    u [u] -- [fermion] a -- [fermion] d [\bar{d}]
    a -- [W+] b
    mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
    meson: \pi^+ = u d
    ```

    ```text
    in: u d
    out: mu nu
    u [u] -- [fermion] a -- [fermion] d [\bar{d}]
    a -- [W+] b
    mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
    meson: \pi^+ = u d
    ```

    The u and d̄ annihilate into a W⁺. Helicity suppression makes μ⁺ν<sub>μ</sub> win over
    e⁺ν<sub>e</sub> by a factor of about 8000.

-   **Box on a quark line**

    ```feynman
    % B0 -> K*0 mu mu through a W box: two W rungs between the quark line and the lepton line
    in: d1 b
    out: d2 s mu1 mu2
    d1 [d] -- [fermion] d2 [d]
    s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
    l1 -- [boson, label=W^+] n1
    l2 -- [boson, label=W^-] n2
    mu2 [\mu^+] -- [fermion] n1 -- [fermion, label=\nu_\mu] n2 -- [fermion] mu1 [\mu^-]
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    ```text
    % B0 -> K*0 mu mu through a W box: two W rungs between the quark line and the lepton line
    in: d1 b
    out: d2 s mu1 mu2
    d1 [d] -- [fermion] d2 [d]
    s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
    l1 -- [boson, label=W^+] n1
    l2 -- [boson, label=W^-] n2
    mu2 [\mu^+] -- [fermion] n1 -- [fermion, label=\nu_\mu] n2 -- [fermion] mu1 [\mu^-]
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

-   **Penguin: a loop on the quark line**

    ```feynman
    % B0 -> K*0 mu mu: a W loop over the quark line, with the photon leaving the loop
    in: d1 b
    out: d2 s mu1 mu2
    d1 [d] -- [fermion] d2 [d]
    s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
    l1 -- [boson, label=W^+] x -- [boson] l2
    x -- [photon, label={\gamma, Z^0}] v
    v -- [fermion] mu1 [\mu^-]
    mu2 [\mu^+] -- [fermion] v
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    ```text
    % B0 -> K*0 mu mu: a W loop over the quark line, with the photon leaving the loop
    in: d1 b
    out: d2 s mu1 mu2
    d1 [d] -- [fermion] d2 [d]
    s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
    l1 -- [boson, label=W^+] x -- [boson] l2
    x -- [photon, label={\gamma, Z^0}] v
    v -- [fermion] mu1 [\mu^-]
    mu2 [\mu^+] -- [fermion] v
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

-   **Meson decay with hadron ellipses**

    ```feynman
    % Bc+ -> J/psi Ds+: a spectator charm quark and a W emitted from the b line
    in: c1 b
    out: c2 cbar s c3
    c1 [c] -- [fermion] c2 [c]
    cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
    v -- [boson, label=W] w
    s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
    meson: B_c^+ = c1 b
    meson: J/\psi = c2 cbar
    meson: D_s^+ = s c3
    ```

    ```text
    % Bc+ -> J/psi Ds+: a spectator charm quark and a W emitted from the b line
    in: c1 b
    out: c2 cbar s c3
    c1 [c] -- [fermion] c2 [c]
    cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
    v -- [boson, label=W] w
    s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
    meson: B_c^+ = c1 b
    meson: J/\psi = c2 cbar
    meson: D_s^+ = s c3
    ```

-   **A line that changes particle (mixing)**

    ```feynman
    % a neutrino turns into a heavy neutral lepton and back: one line, two crosses, three styles
    in: w
    out: mu1 mu2 e nue
    w [W+] -- [boson] v1
    mu1 [mu+] -- [fermion] v1
    v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
    v2 -- [boson, label=W^{+*}] v3
    v2 -- [fermion] mu2 [mu-]
    e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
    ```

    ```text
    % a neutrino turns into a heavy neutral lepton and back: one line, two crosses, three styles
    in: w
    out: mu1 mu2 e nue
    w [W+] -- [boson] v1
    mu1 [mu+] -- [fermion] v1
    v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
    v2 -- [boson, label=W^{+*}] v3
    v2 -- [fermion] mu2 [mu-]
    e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
    ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **B⁰ → K*μμ · a**

    ```feynman
    in: d1 b
    out: d2 s mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    b [particle={\overline{b}}]
    s [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    s -- [fermion] w2
    w2 -- [fermion, label'={{\overline{u},\overline{c},\overline{t}}}] w1
    w1 -- [fermion] b
    w1 -- [photon, label'={W^+}] l1
    w2 -- [photon, label={W^-}] l2
    l1 -- [fermion, label={\nu_\mu}] l2
    l2 -- [fermion] mu1
    mu2 -- [fermion] l1
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    ```text
    in: d1 b
    out: d2 s mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    b [particle={\overline{b}}]
    s [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    s -- [fermion] w2
    w2 -- [fermion, label'={{\overline{u},\overline{c},\overline{t}}}] w1
    w1 -- [fermion] b
    w1 -- [photon, label'={W^+}] l1
    w2 -- [photon, label={W^-}] l2
    l1 -- [fermion, label={\nu_\mu}] l2
    l2 -- [fermion] mu1
    mu2 -- [fermion] l1
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    <small>ATLAS, [BPHY-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2013-02/), auxiliary figure 1a</small>

-   **B⁰ → K*μμ · b**

    ```feynman
    in: d1 b
    out: d2 s mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    b [particle={\overline{b}}]
    s [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    s -- [fermion] w2
    w2 -- [fermion] v
    v -- [fermion, label={\overline{u},\overline{c},\overline{t}}] w1
    w1 -- [fermion] b
    w1 -- [photon, bend=90, label={W^-}] w2
    v -- [photon, label'={{\gamma, Z^0}}] m
    m -- [fermion] mu1
    mu2 -- [fermion] m
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    ```text
    in: d1 b
    out: d2 s mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    b [particle={\overline{b}}]
    s [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    s -- [fermion] w2
    w2 -- [fermion] v
    v -- [fermion, label={\overline{u},\overline{c},\overline{t}}] w1
    w1 -- [fermion] b
    w1 -- [photon, bend=90, label={W^-}] w2
    v -- [photon, label'={{\gamma, Z^0}}] m
    m -- [fermion] mu1
    mu2 -- [fermion] m
    hadron: B^0 = d1 b [brace]
    hadron: K^{*0} = d2 s [brace]
    ```

    <small>ATLAS, [BPHY-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2013-02/), auxiliary figure 1b</small>

-   **B⁰ → K*μμ · c**

    ```feynman
    in: d1 bb
    out: d2 sb mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    bb [particle={\overline{b}}]
    sb [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    sb -- [fermion] l2
    l2 -- [fermion, label={\overline{u}, \overline{c}, \overline{t}}] l1
    l1 -- [fermion] bb
    l1 -- [photon, quarter right, label={W^-}] lb
    lb -- [photon, quarter right] l2
    lb -- [photon, label={\gamma, Z^0}] v
    v -- [fermion] mu1
    mu2 -- [fermion] v
    hadron: B^0 = d1 bb [brace]
    hadron: K^{*0} = d2 sb [brace]
    ```

    ```text
    in: d1 bb
    out: d2 sb mu1 mu2
    d1 [particle={d}]
    d2 [particle={d}]
    bb [particle={\overline{b}}]
    sb [particle={\overline{s}}]
    mu1 [particle={\mu^-}]
    mu2 [particle={\mu^+}]
    d1 -- [fermion] d2
    sb -- [fermion] l2
    l2 -- [fermion, label={\overline{u}, \overline{c}, \overline{t}}] l1
    l1 -- [fermion] bb
    l1 -- [photon, quarter right, label={W^-}] lb
    lb -- [photon, quarter right] l2
    lb -- [photon, label={\gamma, Z^0}] v
    v -- [fermion] mu1
    mu2 -- [fermion] v
    hadron: B^0 = d1 bb [brace]
    hadron: K^{*0} = d2 sb [brace]
    ```

    <small>ATLAS, [BPHY-2013-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2013-02/), auxiliary figure 1c</small>

-   **B<sub>c</sub> → J/ψ D<sub>s</sub> · a**

    ```feynman
    in: bt bb
    out: dt db jt jb
    jb [particle={c}]
    db [particle={\bar{c}}]
    jt -- [fermion] w1
    w1 -- [fermion, label={\bar{b}}] bt
    bb -- [fermion, label={c}] sm
    sm -- [fermion] jb
    w1 -- [photon, label={W}] w2
    dt -- [fermion, label={\bar{s}}] w2
    w2 -- [fermion, label={c}] db
    hadron: B_c^+ = bt bb
    hadron: J/\psi = jt jb
    hadron: D_s^{(*)+} = dt db
    ```

    ```text
    in: bt bb
    out: dt db jt jb
    jb [particle={c}]
    db [particle={\bar{c}}]
    jt -- [fermion] w1
    w1 -- [fermion, label={\bar{b}}] bt
    bb -- [fermion, label={c}] sm
    sm -- [fermion] jb
    w1 -- [photon, label={W}] w2
    dt -- [fermion, label={\bar{s}}] w2
    w2 -- [fermion, label={c}] db
    hadron: B_c^+ = bt bb
    hadron: J/\psi = jt jb
    hadron: D_s^{(*)+} = dt db
    ```

    <small>ATLAS, [BPHY-2018-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2018-08/), figure 1a</small>

-   **B<sub>c</sub> → J/ψ D<sub>s</sub> · b**

    ```feynman
    in: b1 c1
    out: cb c2 s1 c3
    w1 -- [fermion] b1 [\bar b]
    cb [\bar c] -- [fermion] w1
    w1 -- [boson, label=W] w2
    s1 [\bar s] -- [fermion] w2 -- [fermion] c2 [c]
    c1 [c] -- [fermion] c3 [c]
    meson: B_c^+ = b1 c1
    meson: J/\psi = cb c2
    meson: D_s^{(*)+} = s1 c3
    ```

    ```text
    in: b1 c1
    out: cb c2 s1 c3
    w1 -- [fermion] b1 [\bar b]
    cb [\bar c] -- [fermion] w1
    w1 -- [boson, label=W] w2
    s1 [\bar s] -- [fermion] w2 -- [fermion] c2 [c]
    c1 [c] -- [fermion] c3 [c]
    meson: B_c^+ = b1 c1
    meson: J/\psi = cb c2
    meson: D_s^{(*)+} = s1 c3
    ```

    <small>ATLAS, [BPHY-2018-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2018-08/), figure 1b</small>

-   **B<sub>c</sub> → J/ψ D<sub>s</sub> · c**

    ```feynman
    in: b1 c1
    out: s1 c2 cb c3
    w1 -- [fermion] b1 [\bar b]
    c1 [c] -- [fermion] w1
    w1 -- [boson, label=W] w2
    s1 [\bar s] -- [fermion] w2 -- [fermion] c3 [c]
    cb [\bar c] -- [fermion] vc -- [fermion] c2 [c]
    meson: B_c^+ = b1 c1
    meson: D_s^{(*)+} = s1 c2
    meson: J/\psi = cb c3
    ```

    ```text
    in: b1 c1
    out: s1 c2 cb c3
    w1 -- [fermion] b1 [\bar b]
    c1 [c] -- [fermion] w1
    w1 -- [boson, label=W] w2
    s1 [\bar s] -- [fermion] w2 -- [fermion] c3 [c]
    cb [\bar c] -- [fermion] vc -- [fermion] c2 [c]
    meson: B_c^+ = b1 c1
    meson: D_s^{(*)+} = s1 c2
    meson: J/\psi = cb c3
    ```

    <small>ATLAS, [BPHY-2018-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2018-08/), figure 1c</small>

-   **J/ψ pairs · a**

    ```feynman
    in: g1 g2
    out: b1a b1b b2b b2a
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    b1a -- [fermion] v1
    v1 -- [fermion] m
    m -- [fermion] v2
    v2 -- [fermion] b2a
    m -- [gluon] gv
    b2b -- [fermion] gv
    gv -- [fermion] b1b
    meson: = b1a b1b [hatched]
    meson: = b2b b2a [hatched]
    ```

    ```text
    in: g1 g2
    out: b1a b1b b2b b2a
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    b1a -- [fermion] v1
    v1 -- [fermion] m
    m -- [fermion] v2
    v2 -- [fermion] b2a
    m -- [gluon] gv
    b2b -- [fermion] gv
    gv -- [fermion] b1b
    meson: = b1a b1b [hatched]
    meson: = b2b b2a [hatched]
    ```

    <small>ATLAS, [BPHY-2015-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2015-02/), figure 1a</small>

-   **J/ψ pairs · b**

    ```feynman
    in: g1 g2
    out: a1 a2 c1 c2 g3
    g1 -- [gluon] v1
    a1 -- [fermion] v1 -- [fermion] m -- [fermion] v2 -- [fermion] c2
    c1 -- [fermion] gv -- [fermion] a2
    m -- [gluon] gv
    v2 -- [gluon] t
    g2 -- [gluon] t
    t -- [gluon] g3
    meson: J/\psi = a1 a2
    meson: J/\psi = c1 c2
    ```

    ```text
    in: g1 g2
    out: a1 a2 c1 c2 g3
    g1 -- [gluon] v1
    a1 -- [fermion] v1 -- [fermion] m -- [fermion] v2 -- [fermion] c2
    c1 -- [fermion] gv -- [fermion] a2
    m -- [gluon] gv
    v2 -- [gluon] t
    g2 -- [gluon] t
    t -- [gluon] g3
    meson: J/\psi = a1 a2
    meson: J/\psi = c1 c2
    ```

    <small>ATLAS, [BPHY-2015-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2015-02/), figure 1b</small>

-   **J/ψ pairs · c**

    ```feynman
    in: g1 g2
    out: a1 a2 b1 b2
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    v1 -- [gluon] v2
    v1 -- [gluon] p1
    v2 -- [gluon] p2
    p1 -- [fermion] a1
    a2 -- [fermion] p1
    p2 -- [fermion] b1
    b2 -- [fermion] p2
    meson: = a1 a2 [hatched]
    meson: = b1 b2 [hatched]
    ```

    ```text
    in: g1 g2
    out: a1 a2 b1 b2
    g1 -- [gluon] v1
    g2 -- [gluon] v2
    v1 -- [gluon] v2
    v1 -- [gluon] p1
    v2 -- [gluon] p2
    p1 -- [fermion] a1
    a2 -- [fermion] p1
    p2 -- [fermion] b1
    b2 -- [fermion] p2
    meson: = a1 a2 [hatched]
    meson: = b1 b2 [hatched]
    ```

    <small>ATLAS, [BPHY-2015-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2015-02/), figure 1c</small>

-   **J/ψ pairs · d**

    ```feynman
    in: g1 g2 h1 h2
    out: g3 h3
    g1 -- [gluon] a1
    g2 -- [gluon] b1
    c1 -- [gluon] g3
    a1 -- [fermion] m1 [hatched blob] -- [fermion] c1 -- [fermion] b1 -- [fermion] a1
    h1 -- [gluon] a2
    h2 -- [gluon] b2
    c2 -- [gluon] h3
    a2 -- [fermion] m2 [hatched blob] -- [fermion] c2 -- [fermion] b2 -- [fermion] a2
    ```

    ```text
    in: g1 g2 h1 h2
    out: g3 h3
    g1 -- [gluon] a1
    g2 -- [gluon] b1
    c1 -- [gluon] g3
    a1 -- [fermion] m1 [hatched blob] -- [fermion] c1 -- [fermion] b1 -- [fermion] a1
    h1 -- [gluon] a2
    h2 -- [gluon] b2
    c2 -- [gluon] h3
    a2 -- [fermion] m2 [hatched blob] -- [fermion] c2 -- [fermion] b2 -- [fermion] a2
    ```

    <small>ATLAS, [BPHY-2015-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2015-02/), figure 1d</small>

-   **H → meson + γ**

    ```feynman
    in: h
    out: qi qj y
    h [H(Z)] -- [scalar] v
    v -- [fermion] qi [q_i]
    qj [\bar q_j] -- [fermion] w -- [fermion, label=\bar q_j] v
    w -- [photon] y [\gamma]
    meson: \mathcal{M} = qi qj [cap]
    ```

    ```text
    in: h
    out: qi qj y
    h [H(Z)] -- [scalar] v
    v -- [fermion] qi [q_i]
    qj [\bar q_j] -- [fermion] w -- [fermion, label=\bar q_j] v
    w -- [photon] y [\gamma]
    meson: \mathcal{M} = qi qj [cap]
    ```

    <small>ATLAS, [HDBS-2018-52](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HDBS-2018-52/), figure 1</small>

</div>
