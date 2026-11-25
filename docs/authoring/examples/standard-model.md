---
tags:
  - Standard Model
---

# The Standard Model

The textbook diagrams, from QED to the Higgs boson, each with its source.

## QED and QCD

<div class="grid cards" markdown>

-   **e⁺e⁻ → μ⁺μ⁻**

    ```feynman
    e- e+ > gamma > mu- mu+
    ```

    ```text
    e- e+ > gamma > mu- mu+
    ```

    The photon in the s channel. At higher energies a Z joins it, as in Drell–Yan below.

-   **Compton scattering, s channel**

    ```feynman
    e- gamma > e- > e- gamma
    ```

    ```text
    e- gamma > e- > e- gamma
    ```

    e⁻γ → e⁻γ: the electron absorbs the photon, then emits one...

-   **qg → qg, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [q]
    i2 [g] -- b -- f2 [g]
    a -- [gluon] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [q]
    i2 [g] -- b -- f2 [g]
    a -- [gluon] b
    ```

    ...or exchanges a gluon with it, through the three-gluon vertex.

</div>

## Electroweak

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

-   **e⁺e⁻ → W⁺W⁻, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [W-]
    i2 [e+] -- b -- f2 [W+]
    a -- [fermion, label=\nu_e] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [W-]
    i2 [e+] -- b -- f2 [W+]
    a -- [fermion, label=\nu_e] b
    ```

    ...and through a neutrino exchanged. The two cancel at high energy, keeping the
    cross-section from growing, as LEP2 measured.

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

</div>

## Top quarks

<div class="grid cards" markdown>

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

## The Higgs boson

<div class="grid cards" markdown>

-   **Six ways to make a Higgs**

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

    Gluon fusion alone makes nearly nine in ten. `ggF` and `VBF` name the gluon-fusion loop and the
    two forward quark lines.

-   **H → γγ, W loop**

    ```feynman
    H > {W} > a a
    ```

    ```text
    H > {W} > a a
    ```

    The photons (`a`, as MadGraph writes them) couple to the Higgs only through a loop. The W
    loop dominates...

-   **Di-Higgs, gg → HH, box**

    ```feynman
    g g > {t} > H H
    ```

    ```text
    g g > {t} > H H
    ```

    ...the box does not, and the two interfere destructively.

</div>

## Loops

<div class="grid cards" markdown>

-   **Vertex correction**

    ```feynman
    % a photon vertex with a photon loop around it
    in: i1 i2
    out: f1
    i1 [e-] -- a -- c -- d -- f1 [e-]
    a -- [photon, half left] d
    i2 [gamma] -- c
    ```

    ```text
    % a photon vertex with a photon loop around it
    in: i1 i2
    out: f1
    i1 [e-] -- a -- c -- d -- f1 [e-]
    a -- [photon, half left] d
    i2 [gamma] -- c
    ```

-   **Vacuum polarisation**

    ```feynman
    i1 [gamma] -- a
    a -- [fermion, half left] b
    b -- [fermion, half left] a
    b -- f1 [gamma]
    ```

    ```text
    i1 [gamma] -- a
    a -- [fermion, half left] b
    b -- [fermion, half left] a
    b -- f1 [gamma]
    ```

</div>

## From ATLAS papers

Figures from ATLAS publications, written as a few lines of feynjs; the link under each goes to the paper.

<div class="grid cards" markdown>

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

    <small>ATLAS, [STDM-2022-06](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/STDM-2022-06/), figure 1a</small>

-   **Four tops**

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

-   **HH from gluons**

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

</div>
