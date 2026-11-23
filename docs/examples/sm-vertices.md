---
tags:
  - Feynman rules
  - vertex factor
  - interaction vertex
  - gauge coupling
  - electroweak
  - Yukawa coupling
  - Higgs self-coupling
  - Standard Model
---

# Standard Model vertices

***Every interaction vertex of the Standard Model, each drawn on its own with its coupling beside it: QED, QCD, the weak force, the Higgs and the Yukawas.***

```feynman
--- QED
v [dot, label=eQ_f]
i1 [gamma] -- v
v -- [fermion] f1 [f]
v -- [anti fermion] f2 [\bar f]
--- QCD
v [dot, label=g_s f^{abc}]
i1 [g] -- v
v -- f1 [g]
v -- f2 [g]
--- Higgs
v [dot, label=6\lambda v]
i1 [H] -- v
v -- f1 [H]
v -- f2 [H]
```

```text
--- QED
v [dot, label=eQ_f]
i1 [gamma] -- v
v -- [fermion] f1 [f]
v -- [anti fermion] f2 [\bar f]
--- QCD
v [dot, label=g_s f^{abc}]
i1 [g] -- v
v -- f1 [g]
v -- f2 [g]
--- Higgs
v [dot, label=6\lambda v]
i1 [H] -- v
v -- f1 [H]
v -- f2 [H]
```

Each diagram is one vertex: a dot where the lines meet, with its coupling written beside it as a
[coupling label](../guide/labels.md#coupling-labels). The text under each heading gives the rest of
the vertex factor. Both leave out the overall factor of *i* and the sign, which differ from one
textbook to the next. Throughout, *Q<sub>f</sub>* is the fermion's charge in units of *e* > 0,
*c<sub>W</sub>* = cos θ<sub>W</sub> and *v* ≈ 246 GeV. The W and Z are in unitary gauge, so no
Goldstone bosons appear.

## QED

The photon couples to every charged fermion, through *eQ<sub>f</sub>*γ<sup>μ</sup>. It does not
couple to neutrinos.

<div class="grid cards" markdown style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr))">

-   **γ f f̄**

    ```feynman
    v [dot, label=eQ_f]
    i1 [gamma] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

    ```text
    v [dot, label=eQ_f]
    i1 [gamma] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

</div>

## QCD

The gluon couples to quarks through *g<sub>s</sub>*γ<sup>μ</sup>*T<sup>a</sup>* and, because it carries
colour itself, to other gluons. *T<sup>a</sup>* are the colour generators and *f<sup>abc</sup>* the
structure constants of SU(3).

<div class="grid cards" markdown>

-   **g q q̄**

    ```feynman
    v [dot, label=g_s T^a]
    i1 [g] -- v
    v -- f1 [q]
    v -- f2 [qbar]
    ```

    ```text
    v [dot, label=g_s T^a]
    i1 [g] -- v
    v -- f1 [q]
    v -- f2 [qbar]
    ```

-   **g g g**

    ```feynman
    v [dot, label=g_s f^{abc}]
    i1 [g] -- v
    v -- f1 [g]
    v -- f2 [g]
    ```

    ```text
    v [dot, label=g_s f^{abc}]
    i1 [g] -- v
    v -- f1 [g]
    v -- f2 [g]
    ```

-   **g g g g**

    ```feynman
    v [dot, label=g_s^2]
    i1 [g] -- v
    i2 [g] -- v
    v -- f1 [g]
    v -- f2 [g]
    ```

    ```text
    v [dot, label=g_s^2]
    i1 [g] -- v
    i2 [g] -- v
    v -- f1 [g]
    v -- f2 [g]
    ```

-   **ghost: g c c̄**

    ```feynman
    v [dot, label=g_s f^{abc}]
    i1 [g] -- v
    v -- [fermion, dotted] f1 [c]
    f2 [\bar c] -- [fermion, dotted] v
    ```

    ```text
    v [dot, label=g_s f^{abc}]
    i1 [g] -- v
    v -- [fermion, dotted] f1 [c]
    f2 [\bar c] -- [fermion, dotted] v
    ```

</div>

The three-gluon vertex also carries the gluons' momenta, the four-gluon vertex products
*f<sup>abe</sup>f<sup>cde</sup>*, and the ghost vertex the momentum of the outgoing ghost. Ghosts
appear only in loops, in a covariant gauge. A ghost is drawn as a dotted line with an arrow:
`[fermion, dotted]`, or `[ghost, with arrow=0.5]`.

## Weak charged current

The W couples only to left-handed fermions, through (*g*/√2)γ<sup>μ</sup>*P<sub>L</sub>*, with
*P<sub>L</sub>* = (1 − γ<sup>5</sup>)/2. It turns a fermion into its partner in the doublet: a charged
lepton into its neutrino, an up-type quark into a down-type one. Between quarks the coupling
carries an element of the CKM matrix: *V<sub>ud</sub>*, *V<sub>us</sub>*, ...

<div class="grid cards" markdown>

-   **W ν<sub>e</sub> e**

    ```feynman
    v [dot, label=g/\sqrt2]
    i1 [W+] -- v
    v -- f1 [nu_e]
    v -- f2 [e+]
    ```

    ```text
    v [dot, label=g/\sqrt2]
    i1 [W+] -- v
    v -- f1 [nu_e]
    v -- f2 [e+]
    ```

-   **W u d**

    ```feynman
    v [dot, label={V_{ud}\,g/\sqrt2}]
    i1 [W+] -- v
    v -- f1 [u]
    v -- f2 [dbar]
    ```

    ```text
    v [dot, label={V_{ud}\,g/\sqrt2}]
    i1 [W+] -- v
    v -- f1 [u]
    v -- f2 [dbar]
    ```

</div>

## Weak neutral current

The Z couples to every fermion, neutrinos included, through
(*g*/2*c<sub>W</sub>*)γ<sup>μ</sup>(*g<sub>V</sub>* − *g<sub>A</sub>*γ<sup>5</sup>), with *g<sub>V</sub>* =
*T*<sub>3</sub> − 2*Q<sub>f</sub>* sin²θ<sub>W</sub> and *g<sub>A</sub>* = *T*<sub>3</sub>. It does not
change flavour.

<div class="grid cards" markdown style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr))">

-   **Z f f̄**

    ```feynman
    v [dot, label=g/2c_W]
    i1 [Z] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

    ```text
    v [dot, label=g/2c_W]
    i1 [Z] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

</div>

## Triple gauge

Every electroweak triple gauge vertex has a W<sup>+</sup>W<sup>−</sup> pair: there is no γγZ, γZZ or
ZZZ vertex. Each also carries the momenta of the three bosons.

<div class="grid cards" markdown>

-   **γ W W**

    ```feynman
    v [dot, label=e]
    i1 [gamma] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

    ```text
    v [dot, label=e]
    i1 [gamma] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

-   **Z W W**

    ```feynman
    v [dot, label=g c_W]
    i1 [Z] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

    ```text
    v [dot, label=g c_W]
    i1 [Z] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

</div>

## Quartic gauge

Every electroweak quartic vertex has a W<sup>+</sup>W<sup>−</sup> pair too, and carries products of
*g*<sup>μν</sup>.

<div class="grid cards" markdown>

-   **W W W W**

    ```feynman
    v [dot, label=g^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

    ```text
    v [dot, label=g^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

-   **W W Z Z**

    ```feynman
    v [dot, label=g^2c_W^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

    ```text
    v [dot, label=g^2c_W^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

-   **W W γ γ**

    ```feynman
    v [dot, label=e^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [gamma]
    v -- f2 [gamma]
    ```

    ```text
    v [dot, label=e^2]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [gamma]
    v -- f2 [gamma]
    ```

-   **W W Z γ**

    ```feynman
    v [dot, label=egc_W, label side=left]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [Z]
    v -- f2 [gamma]
    ```

    ```text
    v [dot, label=egc_W, label side=left]
    i1 [W+] -- v
    i2 [W-] -- v
    v -- f1 [Z]
    v -- f2 [gamma]
    ```

</div>

## Higgs to gauge bosons

The Higgs couples to the W and the Z in proportion to their masses squared, each vertex times
*g*<sup>μν</sup>; written with *g*, 2*m*<sub>W</sub><sup>2</sup>/*v* = *gm*<sub>W</sub>. It does not
couple to photons or gluons at tree level: H → γγ and gg → H go through loops.

<div class="grid cards" markdown>

-   **H W W**

    ```feynman
    v [dot, label=2m_W^2/v]
    i1 [H] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

    ```text
    v [dot, label=2m_W^2/v]
    i1 [H] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

-   **H Z Z**

    ```feynman
    v [dot, label=2m_Z^2/v]
    i1 [H] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

    ```text
    v [dot, label=2m_Z^2/v]
    i1 [H] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

-   **H H W W**

    ```feynman
    v [dot, label=2m_W^2/v^2]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

    ```text
    v [dot, label=2m_W^2/v^2]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [W+]
    v -- f2 [W-]
    ```

-   **H H Z Z**

    ```feynman
    v [dot, label=2m_Z^2/v^2]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

    ```text
    v [dot, label=2m_Z^2/v^2]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [Z]
    v -- f2 [Z]
    ```

</div>

## Higgs self-couplings

From the potential *V* = λ(Φ<sup>†</sup>Φ − *v*<sup>2</sup>/2)<sup>2</sup>, so that
*m*<sub>H</sub><sup>2</sup> = 2λ*v*<sup>2</sup>: the triple coupling is 6λ*v* =
3*m*<sub>H</sub><sup>2</sup>/*v*, the quartic 6λ = 3*m*<sub>H</sub><sup>2</sup>/*v*<sup>2</sup>.

<div class="grid cards" markdown>

-   **H H H**

    ```feynman
    v [dot, label=6\lambda v]
    i1 [H] -- v
    v -- f1 [H]
    v -- f2 [H]
    ```

    ```text
    v [dot, label=6\lambda v]
    i1 [H] -- v
    v -- f1 [H]
    v -- f2 [H]
    ```

-   **H H H H**

    ```feynman
    v [dot, label=6\lambda]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [H]
    v -- f2 [H]
    ```

    ```text
    v [dot, label=6\lambda]
    i1 [H] -- v
    i2 [H] -- v
    v -- f1 [H]
    v -- f2 [H]
    ```

</div>

## Yukawa

The Higgs couples to each massive fermion through *y<sub>f</sub>*/√2 = *m<sub>f</sub>*/*v*, so most
strongly to the top quark. Neutrinos are massless in the Standard Model and do not couple.

<div class="grid cards" markdown style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr))">

-   **H f f̄**

    ```feynman
    v [dot, label=y_f/\sqrt2]
    i1 [H] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

    ```text
    v [dot, label=y_f/\sqrt2]
    i1 [H] -- v
    v -- [fermion] f1 [f]
    v -- [anti fermion] f2 [\bar f]
    ```

</div>
