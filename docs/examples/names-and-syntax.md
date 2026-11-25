---
tags:
  - MadGraph
  - TikZ-Feynman
  - SUSY
  - hadrons
  - particle names
---

# Names and syntax

feynjs reads the names physicists write, MadGraph's as well as their own, and the syntax they
already know from MadGraph and TikZ-Feynman. Every diagram on this page is drawn live from the
source under it.

## MadGraph's process line, as it is

A process written as MadGraph writes it, decays after commas and in brackets, nested as deep as
the chain goes, draws as the whole diagram. Spaces round `>` are optional.

<div class="grid cards feynjs-demo" markdown>

-   **Top pairs, decayed:** the decays in brackets

    ```feynman
    p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
    ```

    ```text
    p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
    ```

-   **Stop pairs:** brackets inside brackets, in MadGraph's MSSM names

    ```feynman
    p p > t1 t1~, (t1 > t n1, (t > b w+, w+ > e+ ve)), (t1~ > t~ n1, (t~ > b~ w-, w- > j j))
    ```

    ```text
    p p > t1 t1~, (t1 > t n1, (t > b w+, w+ > e+ ve)), (t1~ > t~ n1, (t~ > b~ w-, w- > j j))
    ```

-   **No spaces needed** round `>`

    ```feynman
    e+ e->z>mu+ mu-
    ```

    ```text
    e+ e->z>mu+ mu-
    ```

</div>

More in [Write processes, as in MadGraph](../guide/processes.md) and [MadGraph](../guide/madgraph.md).

## Superpartners, by any name

MadGraph's MSSM names (`n1`, `x1+`, `el-`, `t1`, `go`, `sve`, `h2`) and the names papers use
(`neutralino2`, `chargino1+`, `higgsino0`, `wino+`, `stop1`) both draw as superpartners, in their
own colour and style. A name without a number is the generic particle: `neutralino` is
χ̃⁰.

<div class="grid cards feynjs-demo" markdown>

-   **Charginos and neutralinos,** in MadGraph's names

    ```feynman
    p p > x1+ n2, (x1+ > w+ n1, w+ > l+ vl), (n2 > z n1, z > l+ l-)
    ```

    ```text
    p p > x1+ n2, (x1+ > w+ n1, w+ > l+ vl), (n2 > z n1, z > l+ l-)
    ```

-   **The same pair,** in the names papers use

    ```feynman
    p p > chargino1+ neutralino2
    chargino1+ > W+ neutralino1
    neutralino2 > Z neutralino1
    ```

    ```text
    p p > chargino1+ neutralino2
    chargino1+ > W+ neutralino1
    neutralino2 > Z neutralino1
    ```

-   **Selectrons** (`el-`, the left-handed selectron)

    ```feynman
    p p > el- el+, (el- > e- n1), (el+ > e+ n1)
    ```

    ```text
    p p > el- el+, (el- > e- n1), (el+ > e+ n1)
    ```

-   **Higgsinos,** a compressed spectrum

    ```feynman
    p p > higgsino+ higgsino0
    higgsino+ > pi+ neutralino1
    higgsino0 > gamma neutralino1
    ```

    ```text
    p p > higgsino+ higgsino0
    higgsino+ > pi+ neutralino1
    higgsino0 > gamma neutralino1
    ```

</div>

Every name is in [All particles](../reference/particles.md).

## Hadrons, by their English names

Mesons and baryons by the names they are known by: `jpsi`, `K*+`, `Lambda_b`, `upsilon`. Any
takes a star, a charge or `bar`. A hadron with a state in brackets keeps it in its label,
`psi(2S)`; one written with its quarks, `X(ucd)` or `Pc(uudcc~)`, carries them. Point at a
label to see a hadron's quarks, charge and mass.

<div class="grid cards feynjs-demo" markdown>

-   **B⁺ → J/ψ K\*⁺**

    ```feynman
    B+ > jpsi K*+
    jpsi > mu+ mu-
    K*+ > K+ pi0
    ```

    ```text
    B+ > jpsi K*+
    jpsi > mu+ mu-
    K*+ > K+ pi0
    ```

-   **A state in brackets:** ψ(2S)

    ```feynman
    B0 > psi(2S) K0bar
    psi(2S) > jpsi pi+ pi-
    ```

    ```text
    B0 > psi(2S) K0bar
    psi(2S) > jpsi pi+ pi-
    ```

-   **A pentaquark,** written with its quarks

    ```feynman
    Lambda_b > Pc(uudcc~) K-
    Pc(uudcc~) > p jpsi
    ```

    ```text
    Lambda_b > Pc(uudcc~) K-
    Pc(uudcc~) > p jpsi
    ```

</div>

## TikZ-Feynman's keys

The keys TikZ-Feynman users reach for work on feynjs's lines: quoted labels, `bend left=60`,
`label=below:...` on a point, `[plain, gluon]` for a gluino, and places in cm or as an angle
and a distance.

<div class="grid cards feynjs-demo" markdown>

-   **A gluino pair:** `[plain, gluon]` and a quoted label

    ```feynman
    in: g1 g2
    out: f1 f2
    g1 [g] -- a
    g2 [g] -- a
    a -- [gluon, "\(g^*\)"] b
    b -- [plain, gluon] f1 [\tilde g]
    b -- [plain, gluon] f2 [\tilde g]
    ```

    ```text
    in: g1 g2
    out: f1 f2
    g1 [g] -- a
    g2 [g] -- a
    a -- [gluon, "\(g^*\)"] b
    b -- [plain, gluon] f1 [\tilde g]
    b -- [plain, gluon] f2 [\tilde g]
    ```

-   **A self-energy:** `bend left=60`, and `label=below:` on a point

    ```feynman
    i [e-] -- a -- [fermion] b -- f [e-]
    a -- [photon, bend left=60, "\(\gamma\)"] b
    a [dot, label=below:\(e\)]
    b [dot]
    ```

    ```text
    i [e-] -- a -- [fermion] b -- f [e-]
    a -- [photon, bend left=60, "\(\gamma\)"] b
    a [dot, label=below:\(e\)]
    b [dot]
    ```

-   **Places as TikZ writes them:** in cm, and as an angle and a distance

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [photon] b
    b -- f1 [mu-]
    b -- f2 [mu+]
    a at (0, 0)
    b [right=1.6cm of a]
    i1 at (150:1)
    i2 at (210:1)
    f1 at (25:2.1)
    f2 at (-25:2.1)
    ```

    ```text
    i1 [e-] -- a -- i2 [e+]
    a -- [photon] b
    b -- f1 [mu-]
    b -- f2 [mu+]
    a at (0, 0)
    b [right=1.6cm of a]
    i1 at (150:1)
    i2 at (210:1)
    f1 at (25:2.1)
    f2 at (-25:2.1)
    ```

</div>

## A paper's pictures, converted once

A whole TikZ-Feynman picture is not pasted into a `feynman` block: it is converted, once, into
feynjs's lines, which are then yours to keep and edit. The converter reads every picture in a
LaTeX file:

```sh
npx feynjs import paper.tex > diagrams.feyn
```

```latex
\feynmandiagram [horizontal=a to b] {
  i1 [particle=\(e^-\)] -- [fermion] a -- [fermion] i2 [particle=\(e^+\)],
  a -- [photon, edge label=\(\gamma\)] b,
  f1 [particle=\(\mu^+\)] -- [fermion] b -- [fermion] f2 [particle=\(\mu^-\)],
};
```

becomes

```feynman
horizontal: a to b
edge labels: left
i1 [particle={{e^-}}] -- [fermion] a -- [fermion] i2 [particle={{e^+}}]
a -- [photon, edge label=\(\gamma\)] b
f1 [particle={{\mu^+}}] -- [fermion] b -- [fermion] f2 [particle={{\mu^-}}]
```

```text
horizontal: a to b
edge labels: left
i1 [particle={{e^-}}] -- [fermion] a -- [fermion] i2 [particle={{e^+}}]
a -- [photon, edge label=\(\gamma\)] b
f1 [particle={{\mu^+}}] -- [fermion] b -- [fermion] f2 [particle={{\mu^-}}]
```

From JavaScript it is `fromTikz()` from `feynjs/tikz`, a module of its own that a page drawing
diagrams never loads. More in [TikZ-Feynman](../guide/tikz-feynman.md#converting-a-papers-pictures).
