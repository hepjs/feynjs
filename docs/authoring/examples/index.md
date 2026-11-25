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

    QED and QCD, the weak bosons, top quarks, the Higgs boson and loops.

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

    Dark matter, leptoquarks, heavy neutrinos, supersymmetry and extra dimensions.

</div>
