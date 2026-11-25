---
tags:
  - nuclear reaction
  - fusion
  - fission
  - decay chain
  - dark matter
  - heavy ions
  - ultraperipheral collisions
---

# Nuclear and heavy ions

Nuclear reactions written as a process line and drawn as the textbook picture, and the photon collisions of lead ions at the LHC. The [Views](../guide/views.md#the-reaction-picture) page explains the reaction picture.

## Reactions

<div class="grid cards" markdown>

-   **Fusion: deuterium and tritium**

    ```feynman
    2H 3H > 4He n
    ```

    The reaction a fusion reactor runs on.

    ??? example "Source"

        ```text
        2H 3H > 4He n
        ```

-   **Fission of uranium-235**

    ```feynman
    235U n > 141Ba 92Kr n n n
    ```

    A slow neutron splits the nucleus; three neutrons carry the chain on.

    ??? example "Source"

        ```text
        235U n > 141Ba 92Kr n n n
        ```

-   **The first step of the pp chain**

    ```feynman
    p p > 2H e+ ve
    ```

    Two protons make a deuteron, a positron and a neutrino: how the Sun starts.

    ??? example "Source"

        ```text
        p p > 2H e+ ve
        ```

-   **The triple-alpha process**

    ```feynman
    4He 4He 4He > 12C
    ```

    Three helium nuclei make carbon in red giants.

    ??? example "Source"

        ```text
        4He 4He 4He > 12C
        ```

-   **Photodisintegration**

    ```feynman
    gamma 2H > p n
    ```

    A photon reaches into the deuteron and breaks it apart.

    ??? example "Source"

        ```text
        gamma 2H > p n
        ```

-   **Neutron scattering**

    ```feynman
    n 12C > n 12C
    ```

    The neutron leaves deflected; the nucleus recoils.

    ??? example "Source"

        ```text
        n 12C > n 12C
        ```

-   **Dark matter scattering off xenon**

    ```feynman
    signal: on
    chi Xe > chi Xe
    ```

    What a direct-detection experiment looks for: a recoiling nucleus, its scintillation light and ionisation electrons.

    ??? example "Source"

        ```text
        signal: on
        chi Xe > chi Xe
        ```

-   **De-excitation**

    ```feynman
    12C* > 12C gamma
    ```

    An excited nucleus gives off a photon.

    ??? example "Source"

        ```text
        12C* > 12C gamma
        ```

-   **The uranium series**

    ```feynman
    chain: curve
    238U > 234Th 4He, 234Th > 234Pa e- ve~, 234Pa > 234U e- ve~
    ```

    An alpha decay, then two beta decays, each named over its arrow.

    ??? example "Source"

        ```text
        chain: curve
        238U > 234Th 4He, 234Th > 234Pa e- ve~, 234Pa > 234U e- ve~
        ```

</div>

## From ATLAS papers

Figures from ATLAS publications, each written as a few lines of feynjs and laid out by it; the link under each goes to the paper.

<div class="grid cards" markdown>

-   **γγ → μμ in lead–lead collisions · a**

    ```feynman
    in: pb1 pb2
    out: pb3 m1 m2 pb4
    pb1 [particle={\mathrm{Pb}}]
    pb2 [particle={\mathrm{Pb}}]
    B1 [hatched blob]
    B2 [hatched blob]
    pb3 [particle={\mathrm{Pb}}]
    pb4 [particle={\mathrm{Pb}}]
    m1 [particle={\mu^-}]
    m2 [particle={\mu^+}]
    pb1 -- [fermion] B1
    B1 -- [fermion] pb3
    pb2 -- [fermion] B2
    B2 -- [fermion] pb4
    B1 -- [photon, label'={k_2}] a
    B2 -- [photon, label={k_1}] b
    b -- [fermion] a
    a -- [fermion] m1
    m2 -- [fermion] b
    ```

    <small>ATLAS, [HION-2016-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-02/), figure 1a</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 m1 m2 pb4
        pb1 [particle={\mathrm{Pb}}]
        pb2 [particle={\mathrm{Pb}}]
        B1 [hatched blob]
        B2 [hatched blob]
        pb3 [particle={\mathrm{Pb}}]
        pb4 [particle={\mathrm{Pb}}]
        m1 [particle={\mu^-}]
        m2 [particle={\mu^+}]
        pb1 -- [fermion] B1
        B1 -- [fermion] pb3
        pb2 -- [fermion] B2
        B2 -- [fermion] pb4
        B1 -- [photon, label'={k_2}] a
        B2 -- [photon, label={k_1}] b
        b -- [fermion] a
        a -- [fermion] m1
        m2 -- [fermion] b
        ```

-   **γγ → μμ in lead–lead collisions · b**

    ```feynman
    in: pb1 pb2
    out: pb3 m1 g1 m2 pb4
    pb1 [\mathrm{Pb}]
    pb2 [\mathrm{Pb}]
    pb3 [\mathrm{Pb}]
    pb4 [\mathrm{Pb}]
    B1 [hatched blob]
    B2 [hatched blob]
    pb1 -- [fermion] B1 -- [fermion] pb3
    pb2 -- [fermion] B2 -- [fermion] pb4
    B1 -- [photon, label'=k_2] a
    B2 -- [photon, label=k_1] b
    b -- [fermion] a -- [fermion] r -- [fermion] m1 [mu-]
    r -- [photon] g1 [gamma]
    m2 [mu+] -- [fermion] b
    ```

    <small>ATLAS, [HION-2016-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-02/), figure 1b</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 m1 g1 m2 pb4
        pb1 [\mathrm{Pb}]
        pb2 [\mathrm{Pb}]
        pb3 [\mathrm{Pb}]
        pb4 [\mathrm{Pb}]
        B1 [hatched blob]
        B2 [hatched blob]
        pb1 -- [fermion] B1 -- [fermion] pb3
        pb2 -- [fermion] B2 -- [fermion] pb4
        B1 -- [photon, label'=k_2] a
        B2 -- [photon, label=k_1] b
        b -- [fermion] a -- [fermion] r -- [fermion] m1 [mu-]
        r -- [photon] g1 [gamma]
        m2 [mu+] -- [fermion] b
        ```

-   **γγ → μμ in lead–lead collisions · c**

    ```feynman
    in: pb1 pb2
    out: pb3 m1 m2 pb4
    pb1 [\mathrm{Pb}]
    pb2 [\mathrm{p\ (in\ Pb)}]
    pb3 [\mathrm{Pb}]
    pb4 [\mathrm{Pb}^{\star}+\mathrm{X}]
    B1 [hatched blob]
    B2 [hatched blob]
    pb1 -- [fermion] B1 -- [fermion] pb3
    pb2 -- [fermion] B2 -- [proton] pb4
    B1 -- [photon, label'=k_2] a
    B2 -- [photon, label=k_1] b
    b -- [fermion] a -- [fermion] m1 [mu-]
    m2 [mu+] -- [fermion] b
    ```

    <small>ATLAS, [HION-2016-02](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-02/), figure 1c</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 m1 m2 pb4
        pb1 [\mathrm{Pb}]
        pb2 [\mathrm{p\ (in\ Pb)}]
        pb3 [\mathrm{Pb}]
        pb4 [\mathrm{Pb}^{\star}+\mathrm{X}]
        B1 [hatched blob]
        B2 [hatched blob]
        pb1 -- [fermion] B1 -- [fermion] pb3
        pb2 -- [fermion] B2 -- [proton] pb4
        B1 -- [photon, label'=k_2] a
        B2 -- [photon, label=k_1] b
        b -- [fermion] a -- [fermion] m1 [mu-]
        m2 [mu+] -- [fermion] b
        ```

-   **Light-by-light scattering · a**

    ```feynman
    in: g1 c1
    out: g2 c2
    c1 [crossed dot]
    c2 [crossed dot]
    g1 -- [photon] a
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [photon] g2
    c1 -- [photon] d
    c2 -- [photon] c
    ```

    <small>ATLAS, [HION-2016-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-05/), figure 1a, part 1</small>

    ??? example "Source"

        ```text
        in: g1 c1
        out: g2 c2
        c1 [crossed dot]
        c2 [crossed dot]
        g1 -- [photon] a
        a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
        b -- [photon] g2
        c1 -- [photon] d
        c2 -- [photon] c
        ```

-   **Light-by-light scattering · b**

    ```feynman
    in: g1 c1
    out: g2 g3
    c1 [crossed dot]
    g1 -- [photon] a
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [photon] g2
    c1 -- [photon] d
    c -- [photon] g3
    ```

    <small>ATLAS, [HION-2016-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-05/), figure 1a, part 2</small>

    ??? example "Source"

        ```text
        in: g1 c1
        out: g2 g3
        c1 [crossed dot]
        g1 -- [photon] a
        a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
        b -- [photon] g2
        c1 -- [photon] d
        c -- [photon] g3
        ```

-   **Light-by-light scattering · c**

    ```feynman
    in: g1 g4
    out: g2 g3
    g1 -- [photon] a
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [photon] g2
    g4 -- [photon] d
    c -- [photon] g3
    ```

    <small>ATLAS, [HION-2016-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-05/), figure 1a, part 3</small>

    ??? example "Source"

        ```text
        in: g1 g4
        out: g2 g3
        g1 -- [photon] a
        a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
        b -- [photon] g2
        g4 -- [photon] d
        c -- [photon] g3
        ```

-   **Light-by-light scattering · d**

    ```feynman
    in: pb1 pb2
    out: pb3 x pb4
    pb1 -- [fermion] a -- [fermion] pb3
    pb2 -- [fermion] b -- [fermion] pb4
    a [label=\mathrm{Pb}^{82+}]
    b [label=\mathrm{Pb}^{82+}]
    c [blob]
    a -- [photon, label'=\gamma] c
    b -- [photon, label=\gamma] c
    c -- [proton] x [X]
    ```

    <small>ATLAS, [HION-2016-05](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2016-05/), figure 1b</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 x pb4
        pb1 -- [fermion] a -- [fermion] pb3
        pb2 -- [fermion] b -- [fermion] pb4
        a [label=\mathrm{Pb}^{82+}]
        b [label=\mathrm{Pb}^{82+}]
        c [blob]
        a -- [photon, label'=\gamma] c
        b -- [photon, label=\gamma] c
        c -- [proton] x [X]
        ```

-   **Light-by-light and axion-like particles · a**

    ```feynman
    in: pb1 pb2
    out: pb3 g1 g2 pb4
    pb1 [\mathrm{Pb}]
    pb2 [\mathrm{Pb}]
    pb3 [\mathrm{Pb(*)}]
    pb4 [\mathrm{Pb(*)}]
    B1 [hatched blob]
    B2 [hatched blob]
    pb1 -- [fermion] B1 -- [fermion] pb3
    pb2 -- [fermion] B2 -- [fermion] pb4
    B1 -- [gamma] a
    B2 -- [gamma] d
    a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
    b -- [photon] g1 [gamma]
    c -- [photon] g2 [gamma]
    ```

    <small>ATLAS, [HION-2019-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2019-08/), figure 1a</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 g1 g2 pb4
        pb1 [\mathrm{Pb}]
        pb2 [\mathrm{Pb}]
        pb3 [\mathrm{Pb(*)}]
        pb4 [\mathrm{Pb(*)}]
        B1 [hatched blob]
        B2 [hatched blob]
        pb1 -- [fermion] B1 -- [fermion] pb3
        pb2 -- [fermion] B2 -- [fermion] pb4
        B1 -- [gamma] a
        B2 -- [gamma] d
        a -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a
        b -- [photon] g1 [gamma]
        c -- [photon] g2 [gamma]
        ```

-   **Light-by-light and axion-like particles · b**

    ```feynman
    in: i1 i2
    out: o1 g1 g2 o2
    i1 [particle={Pb}]
    i2 [particle={Pb}]
    o1 [particle={Pb(*)}]
    o2 [particle={Pb(*)}]
    c [small blob, color=gray]
    d [small blob, color=gray]
    g1 [particle={\gamma}]
    g2 [particle={\gamma}]
    i1 -- [fermion] b1
    b1 -- [fermion] o1
    i2 -- [fermion] b2
    b2 -- [fermion] o2
    b1 -- [photon, label'={\gamma}] c
    b2 -- [photon, label={\gamma}] c
    c -- [ghost, label={\textsf{a}}] d
    d -- [photon] g1
    d -- [photon] g2
    ```

    <small>ATLAS, [HION-2019-08](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2019-08/), figure 1b</small>

    ??? example "Source"

        ```text
        in: i1 i2
        out: o1 g1 g2 o2
        i1 [particle={Pb}]
        i2 [particle={Pb}]
        o1 [particle={Pb(*)}]
        o2 [particle={Pb(*)}]
        c [small blob, color=gray]
        d [small blob, color=gray]
        g1 [particle={\gamma}]
        g2 [particle={\gamma}]
        i1 -- [fermion] b1
        b1 -- [fermion] o1
        i2 -- [fermion] b2
        b2 -- [fermion] o2
        b1 -- [photon, label'={\gamma}] c
        b2 -- [photon, label={\gamma}] c
        c -- [ghost, label={\textsf{a}}] d
        d -- [photon] g1
        d -- [photon] g2
        ```

-   **γγ → e⁺e⁻**

    ```feynman
    in: pb1 pb2
    out: pb3 e1 e2 pb4
    pb1 [\mathrm{Pb}]
    pb2 [\mathrm{Pb}]
    pb3 [\mathrm{Pb}]
    pb4 [\mathrm{Pb}]
    B1 [hatched blob]
    B2 [hatched blob]
    pb1 -- [fermion] B1 -- [fermion] pb3
    pb2 -- [fermion] B2 -- [fermion] pb4
    B1 -- [photon] a
    B2 -- [photon] b
    b -- [fermion] a -- [fermion] e1 [e-]
    e2 [e+] -- [fermion] b
    ```

    <small>ATLAS, [HION-2021-16](https://atlas.web.cern.ch/Atlas/GROUPS/PHYSICS/PAPERS/HION-2021-16/), figure 1</small>

    ??? example "Source"

        ```text
        in: pb1 pb2
        out: pb3 e1 e2 pb4
        pb1 [\mathrm{Pb}]
        pb2 [\mathrm{Pb}]
        pb3 [\mathrm{Pb}]
        pb4 [\mathrm{Pb}]
        B1 [hatched blob]
        B2 [hatched blob]
        pb1 -- [fermion] B1 -- [fermion] pb3
        pb2 -- [fermion] B2 -- [fermion] pb4
        B1 -- [photon] a
        B2 -- [photon] b
        b -- [fermion] a -- [fermion] e1 [e-]
        e2 [e+] -- [fermion] b
        ```

</div>
