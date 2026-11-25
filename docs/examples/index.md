---
tags:
  - examples
  - sample diagrams
---

# Examples

Complete diagrams by subject, each drawn in your browser from a few lines of source; open
**Source** under any of them to copy it.

<div class="grid cards feynjs-examples" markdown>

-   [**Tour**](tour.md)

    ```feynman
    a -- [g] b
    ```

    Every particle, how they meet, what they build, and what a detector sees.

-   [**The Standard Model**](standard-model.md)

    ```feynman
    e- e+ > gamma > mu- mu+
    ```

    QED, QCD, weak decays, loops, and every vertex with its coupling.

-   [**Diboson**](diboson.md)

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [e-] -- a -- f1 [W-]
    i2 [e+] -- b -- f2 [W+]
    a -- [fermion, label=\nu_e] b
    ```

    WW, WZ, ZZ, Wγ, three bosons, and vector-boson scattering.

-   [**V + jets**](vjets.md)

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a
    i2 [g] -- a
    a -- [q] b
    b -- f1 [Z]
    b -- f2 [q]
    ```

    Drell–Yan, a W or Z against a jet, and Z with b-quarks.

-   [**Top quarks**](top.md)

    ```feynman
    p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
    ```

    Pairs, single tops, tt̄W, tZq, four tops, and the top decay.

-   [**Higgs**](higgs.md)

    ```feynman
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f3 [q]
    a -- [W] c -- [W] b
    c -- f2 [H]
    ```

    Every production mode, the decays, Higgs pairs, and extended Higgs sectors.

-   [**Flavour physics**](flavour.md)

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

    Mixing boxes, penguins, B, D and K decays with their hadrons, quarkonium.

-   [**Nuclear and heavy ions**](nuclear.md)

    ```feynman
    2H 3H > 4He n
    ```

    Fusion, fission, decay chains, dark matter on xenon, and photon collisions of lead ions.

-   [**Beyond the Standard Model**](bsm.md)

    ```feynman
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```

    Dark matter, Z' and W', leptoquarks, heavy and excited fermions, dark photons.

-   [**Supersymmetry**](susy.md)

    ```feynman
    p p > chargino+ neutralino2
    chargino+ > W+ neutralino1
    neutralino2 > Z neutralino1
    ```

    Squarks, gluinos, electroweakinos and sleptons, and their cascades.

-   [**Extra dimensions**](kaluza-klein.md)

    ```feynman
    in: i1 i2
    out: f1 f2
    i1 [q] -- a -- i2 [qbar]
    a -- [gluon, heavy, label=g_{\mathrm{KK}}] b
    f1 [tbar] -- b -- f2 [t]
    ```

    Kaluza–Klein gravitons and gluons, and universal extra dimensions.

-   [**MadGraph gallery**](madgraph-gallery.md)

    ```feynman
    p p > w+ z, w+ > e+ ve, z > mu+ mu-
    ```

    Processes typed as MadGraph takes them, every diagram drawn: feynjs reading MadGraph.

</div>
