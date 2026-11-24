---
tags:
  - textbook processes
  - QED
  - QCD
  - electroweak
  - Higgs production
  - Drell-Yan
  - B mixing
  - s-channel
---

# Standard Model processes

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

Six ways the LHC makes a Higgs boson; gluon fusion alone makes nearly nine in ten. `ggF` and `VBF` stand for
the gluon-fusion loop and the two forward quark lines; `label:` renames a particle wherever it
appears, so the W of the third panel is drawn as a V. Every diagram on this page is drawn in your browser
from the source beneath it; copy one as a starting point.

## QED

Electrons, muons and photons at lowest order: one photon exchanged, or one electron passed
between two photons.

<div class="grid cards" markdown>

-   **e⁺e⁻ → μ⁺μ⁻**

    ```feynman
    e- e+ > gamma > mu- mu+
    ```

    ```text
    e- e+ > gamma > mu- mu+
    ```

    The photon in the s channel. At higher energies a Z joins it, as in Drell–Yan below.

-   **Pair annihilation, e⁺e⁻ → γγ**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- b -- i2 [e+]
    a -- f1 [gamma]
    b -- f2 [gamma]
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- b -- i2 [e+]
    a -- f1 [gamma]
    b -- f2 [gamma]
    ```

    An electron exchanged between the two photons. The same diagram with the photons swapped
    adds to it.

-   **Bhabha scattering, s channel**

    ```feynman
    e- e+ > gamma > e- e+
    ```

    ```text
    e- e+ > gamma > e- e+
    ```

    e⁺e⁻ → e⁺e⁻: the pair annihilates into a photon...

-   **Bhabha scattering, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [e-]
    i2 [e+] -- b -- f2 [e+]
    a -- [gamma] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [e-]
    i2 [e+] -- b -- f2 [e+]
    a -- [gamma] b
    ```

    ...or exchanges one. The two amplitudes come with a relative minus sign.

-   **Møller scattering, t channel**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [e-]
    i2 [e-] -- b -- f2 [e-]
    a -- [gamma] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [e-]
    i2 [e-] -- b -- f2 [e-]
    a -- [gamma] b
    ```

    e⁻e⁻ → e⁻e⁻: two identical electrons, so the t channel comes with...

-   **Møller scattering, u channel**

    ```feynman
    in: i1 i2
    out: f2 f1
    i1 [e-] -- a
    i2 [e-] -- b
    f1 [e-]
    f2 [e-]
    a -- [e-, no arrow, with arrow=.8] f1
    b -- [e-, no arrow, with arrow=.8] f2
    a -- [gamma] b
    ```

    ```text
    in: i1 i2
    out: f2 f1
    i1 [e-] -- a
    i2 [e-] -- b
    f1 [e-]
    f2 [e-]
    a -- [e-, no arrow, with arrow=.8] f1
    b -- [e-, no arrow, with arrow=.8] f2
    a -- [gamma] b
    ```

    ...the u channel, the outgoing electrons swapped. `out: f2 f1` crosses the lines;
    `no arrow, with arrow=.8` moves
    the arrows clear of the crossing.

-   **Compton scattering, s channel**

    ```feynman
    e- gamma > e- > e- gamma
    ```

    ```text
    e- gamma > e- > e- gamma
    ```

    e⁻γ → e⁻γ: the electron absorbs the photon, then emits one...

-   **Compton scattering, u channel**

    ```feynman
    in: i1 i2
    out: f2 f1
    i1 [e-] -- a -- b -- f1 [e-]
    i2 [gamma] -- b
    a -- f2 [gamma]
    ```

    ```text
    in: i1 i2
    out: f2 f1
    i1 [e-] -- a -- b -- f1 [e-]
    i2 [gamma] -- b
    a -- f2 [gamma]
    ```

    ...or emits the outgoing photon first and absorbs the incoming one after.

</div>

## QCD

Top-quark pairs at a hadron collider, and quark–gluon scattering, one of the processes behind
jet production.

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

-   **qg → qg, s channel**

    ```feynman
    q g > q > q g
    ```

    ```text
    q g > q > q g
    ```

    The quark absorbs the gluon and gives it off again...

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

W and Z bosons made and decaying, and the weak decays of the muon, the neutron and the top
quark.

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

-   **e⁺e⁻ → W⁺W⁻, s channel**

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [photon, label={\gamma, Z}] b
    b -- f1 [W-]
    b -- f2 [W+]
    ```

    ```text
    i1 [e-] -- a -- i2 [e+]
    a -- [photon, label={\gamma, Z}] b
    b -- f1 [W-]
    b -- f2 [W+]
    ```

    Through the γWW and ZWW vertices...

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

-   **qq̄ → ZZ**

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [Z]
    i2 [qbar] -- b -- f2 [Z]
    a -- [fermion, label=q] b
    ```

    ```text
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- f1 [Z]
    i2 [qbar] -- b -- f2 [Z]
    a -- [fermion, label=q] b
    ```

    A quark exchanged in the t channel, with its u-channel partner. There is no s-channel
    diagram: the Standard Model has no ZZZ or ZZγ vertex.

-   **Top decay, t → bW⁺**

    ```feynman
    t > b W+(> l+ nu_l)
    ```

    ```text
    t > b W+(> l+ nu_l)
    ```

    The top decays almost always to a b quark and a W. `W+(> l+ nu_l)` decays the W on the
    spot, here to a lepton and its neutrino.

-   **Muon decay, μ⁻ → ν<sub>μ</sub> e⁻ ν̄<sub>e</sub>**

    ```feynman
    label: nubar = \bar\nu_e
    mu- > nu_mu W-(> e- nubar)
    ```

    ```text
    label: nubar = \bar\nu_e
    mu- > nu_mu W-(> e- nubar)
    ```

    The W is far off shell, so at low energy this is Fermi's four-fermion interaction. `label:`
    draws the antineutrino as ν̄<sub>e</sub>.

-   **Beta decay, n → p e⁻ ν̄<sub>e</sub>**

    ```feynman
    in: u1 d1 d2
    out: u2 d3 u3 e nu
    u1 [u] -- u2 [u]
    d1 [d] -- d3 [d]
    d2 [d] -- v -- u3 [u]
    v -- [boson, label=W^-] w
    w -- e [e-]
    nu [\bar\nu_e] -- [fermion] w
    baryon: n = u1 d1 d2
    baryon: p = u2 d3 u3
    ```

    ```text
    in: u1 d1 d2
    out: u2 d3 u3 e nu
    u1 [u] -- u2 [u]
    d1 [d] -- d3 [d]
    d2 [d] -- v -- u3 [u]
    v -- [boson, label=W^-] w
    w -- e [e-]
    nu [\bar\nu_e] -- [fermion] w
    baryon: n = u1 d1 d2
    baryon: p = u2 d3 u3
    ```

    A d quark of the neutron gives off a W⁻ and becomes a u; the other two quarks are
    spectators. `baryon:` groups each set of three quarks.

</div>

## Higgs

The production modes are at the top of the page. Here the gluon-fusion loop written out, the
main decays, and Higgs pairs.

<div class="grid cards" markdown>

-   **Gluon fusion, the loop written out**

    ```feynman
    g g > {t} > H
    ```

    ```text
    g g > {t} > H
    ```

    `ggF > H` is short for this. A particle in braces is a loop of that particle: here the top
    triangle.

-   **H → bb̄**

    ```feynman
    H > b bbar
    ```

    ```text
    H > b bbar
    ```

    The largest branching fraction, about 58%.

-   **H → γγ, W loop**

    ```feynman
    H > {W} > a a
    ```

    ```text
    H > {W} > a a
    ```

    The photons (`a`, as MadGraph writes them) couple to the Higgs only through a loop. The W
    loop dominates...

-   **H → γγ, top loop**

    ```feynman
    H > {t} > a a
    ```

    ```text
    H > {t} > a a
    ```

    ...and the top loop interferes with it destructively.

-   **H → ZZ\* → 4ℓ**

    ```feynman
    H > Z Z*
    Z > l+ l-
    Z* > l+ l-
    ```

    ```text
    H > Z Z*
    Z > l+ l-
    Z* > l+ l-
    ```

    One Z on shell and one off it (Z\*), since the Higgs is lighter than two Z bosons.

-   **H → WW\* → ℓνℓν**

    ```feynman
    label: nubar = \bar\nu_\ell
    H > W+ W-
    W+ > l+ nu_l
    W- > l- nubar
    ```

    ```text
    label: nubar = \bar\nu_\ell
    H > W+ W-
    W+ > l+ nu_l
    W- > l- nubar
    ```

    Likewise one W is off shell. The two neutrinos leave the detector unseen.

-   **Di-Higgs, gg → HH, triangle**

    ```feynman
    ggF > H > H H
    ```

    ```text
    ggF > H > H H
    ```

    Only the triangle carries the Higgs self-coupling...

-   **Di-Higgs, gg → HH, box**

    ```feynman
    g g > {t} > H H
    ```

    ```text
    g g > {t} > H H
    ```

    ...the box does not, and the two interfere destructively.

</div>

## Flavour

Quark legs grouped into hadrons: `hadron:` with `[brace]` draws a brace beside the legs,
`meson:` an ellipse over their ends. feynjs finds the loops and the spectator quarks itself.

### B⁰–B̄⁰ mixing

Two W bosons exchanged between the quark lines: the box that turns a B⁰ into a B̄⁰. The top
quark dominates the loop.

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

### b → sγ penguin, B̄⁰ → K̄\*⁰γ

The photon leaves the W in the loop, and the d̄ is a spectator. This one is drawn with the
older layout engine, `layout: v1`, which sends the photon up clear of the loop.

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

### π⁺ → μ⁺ν<sub>μ</sub>

The u and d̄ annihilate into a W⁺. Helicity suppression makes μ⁺ν<sub>μ</sub> win over
e⁺ν<sub>e</sub> by a factor of about 8000.

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
