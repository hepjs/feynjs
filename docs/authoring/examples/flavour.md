---
tags:
  - flavour physics
---

# Flavour physics

Quarks changing flavour inside hadrons: mixing, penguins and meson decays, each with the same
process written with hadron names under it. The [Tour](tour.md#mesons) draws every light meson as
it decays.

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

    ````markdown
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
    ````

    As hadrons, `B0 > B0bar`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    B0 > B0bar
    ```

    Two W bosons exchanged between the quark lines: the box that turns a B⁰ into a B̄⁰. The top
    quark dominates the loop.

-   **b → sγ penguin, B̄⁰ → K̄\*⁰γ**

    ```feynman
    in: b d1
    out: y s d2
    d2 [\bar{d}] -- [fermion] d1 [\bar{d}]
    b [b] -- [fermion] l1 -- [fermion, label={u, c, t}] l2 -- [fermion] s [s]
    l1 -- [boson, label=W^-] x -- [boson] l2
    x -- [photon] y [\gamma]
    hadron: \bar{B}^0 = b d1 [brace]
    hadron: \bar{K}^{*0} = s d2 [brace]
    ```

    ````markdown
    ```feynman
    in: b d1
    out: y s d2
    d2 [\bar{d}] -- [fermion] d1 [\bar{d}]
    b [b] -- [fermion] l1 -- [fermion, label={u, c, t}] l2 -- [fermion] s [s]
    l1 -- [boson, label=W^-] x -- [boson] l2
    x -- [photon] y [\gamma]
    hadron: \bar{B}^0 = b d1 [brace]
    hadron: \bar{K}^{*0} = s d2 [brace]
    ```
    ````

    As hadrons, `B0bar > K*0bar gamma`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    B0bar > K*0bar gamma
    ```

    The photon leaves the W in the loop, and the d̄ is a spectator.

-   **π⁺ → μ⁺ν<sub>μ</sub>**

    ```feynman
    in: u d
    out: mu nu
    u [u] -- [fermion] a -- [fermion] d [\bar{d}]
    a -- [W+] b
    mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
    meson: \pi^+ = u d
    ```

    ````markdown
    ```feynman
    in: u d
    out: mu nu
    u [u] -- [fermion] a -- [fermion] d [\bar{d}]
    a -- [W+] b
    mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
    meson: \pi^+ = u d
    ```
    ````

    As hadrons, `pi+ > mu+ vm`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    pi+ > mu+ vm
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

    ````markdown
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
    ````

    As hadrons, `B0 > K*0 mu+ mu-`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    B0 > K*0 mu+ mu-
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

    ````markdown
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
    ````

    As hadrons, `Bc+ > jpsi Ds+`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    Bc+ > jpsi Ds+
    ```

-   **B<sub>c</sub> → J/ψ D<sub>s</sub>, from ATLAS**

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

    ````markdown
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
    ````

    As hadrons, `Bc+ > jpsi Ds+`:
    { .feynjs-as-hadrons }

    ```feynman
    size: small
    Bc+ > jpsi Ds+
    ```

    <small>ATLAS, [BPHY-2018-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/BPHY-2018-08/), figure 1a</small>

</div>
