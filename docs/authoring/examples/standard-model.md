# The Standard Model

The textbook diagrams: electrons and photons, quarks and gluons, the weak decays, and the loops that correct them; then every vertex of the theory with its coupling. Each is drawn in your browser from the source folded under it.

## QED

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

-   **Bremsstrahlung**

    ```feynman
    in: i1 i2
    out: f3 f1 f2
    i1 [e-] -- a -- b -- f1 [e-]
    a -- f3 [gamma]
    b -- [gamma] c
    i2 [q] -- c -- f2 [q]
    ```

    ```text
    in: i1 i2
    out: f3 f1 f2
    i1 [e-] -- a -- b -- f1 [e-]
    a -- f3 [gamma]
    b -- [gamma] c
    i2 [q] -- c -- f2 [q]
    ```

</div>

## QCD

<div class="grid cards" markdown>

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

-   **Gluon splitting**

    ```feynman
    i1 [q] -- a -- f1 [q]
    a -- [gluon, label=g] b
    b -- f2 [b]
    b -- f3 [bbar]
    ```

    ```text
    i1 [q] -- a -- f1 [q]
    a -- [gluon, label=g] b
    b -- f2 [b]
    b -- f3 [bbar]
    ```

-   **Quark exchanged between two gluons**

    ```feynman
    % gg -> t tbar H: the top quark is exchanged between the two gluons and radiates the Higgs
    i1 [g] -- a
    i2 [g] -- b
    f1 [tbar] -- [fermion] b -- [fermion, label=t] m -- [fermion] a -- [fermion] f2 [t]
    m -- [H] h
    h -- f3 [b]
    h -- f4 [bbar]
    ```

    ```text
    % gg -> t tbar H: the top quark is exchanged between the two gluons and radiates the Higgs
    i1 [g] -- a
    i2 [g] -- b
    f1 [tbar] -- [fermion] b -- [fermion, label=t] m -- [fermion] a -- [fermion] f2 [t]
    m -- [H] h
    h -- f3 [b]
    h -- f4 [bbar]
    ```

</div>

## Weak decays

<div class="grid cards" markdown>

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

## Loops

<div class="grid cards" markdown>

-   **Self-energy bubble**

    ```feynman
    i1 -- [photon, momentum=q] a
    a -- [fermion] b
    b -- [fermion] a
    b -- [photon] f1
    ```

    ```text
    i1 -- [photon, momentum=q] a
    a -- [fermion] b
    b -- [fermion] a
    b -- [photon] f1
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

-   **Box loop**

    ```feynman
    i1 [g] -- a
    i2 [g] -- b
    a -- [fermion] c -- [fermion] d -- [fermion] b -- [fermion] a
    c -- f1 [H]
    d -- f2 [H]
    ```

    ```text
    i1 [g] -- a
    i2 [g] -- b
    a -- [fermion] c -- [fermion] d -- [fermion] b -- [fermion] a
    c -- f1 [H]
    d -- f2 [H]
    ```

</div>

## The vertices

Each diagram is one vertex: a dot where the lines meet, with its coupling written beside it as a
[coupling label](../lines.md#coupling-labels). The text under each heading gives the rest of
the vertex factor. Both leave out the overall factor of *i* and the sign, which differ from one
textbook to the next. Throughout, *Q<sub>f</sub>* is the fermion's charge in units of *e* > 0,
*c<sub>W</sub>* = cos θ<sub>W</sub> and *v* ≈ 246 GeV. The W and Z are in unitary gauge, so no
Goldstone bosons appear.

### QED

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

### QCD

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

### Weak charged current

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

### Weak neutral current

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

### Triple gauge

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

### Quartic gauge

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

### Higgs to gauge bosons

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

### Higgs self-couplings

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

### Yukawa

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
