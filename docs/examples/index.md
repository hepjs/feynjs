# Examples

Every diagram on these pages is drawn in your browser from the source shown beneath it. Copy any
of them as a starting point.

| | |
|---|---|
| [**Gallery**](gallery.md) | The library's own examples: s-, t- and u-channel, loops, boxes, penguins, VBF, di-Higgs, SUSY cascades, meson decays. |
| [**Stop production, step by step**](stop.md) | A walkthrough: how stops are made at the LHC and every common way they decay, one diagram at a time. |

## A few to start from

=== "Vector-boson fusion"

    ```feynman
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f3 [q]
    a -- [W] c -- [W] b
    c -- f2 [H]
    ```

    ```text
    i1 [q] -- a -- f1 [q]
    i2 [q] -- b -- f3 [q]
    a -- [W] c -- [W] b
    c -- f2 [H]
    ```

=== "Mono-X"

    ```feynman
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```

    ```text
    i1 [q] -- g1 -- a -- i2 [qbar]
    g1 -- f0 [g]
    a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
    b -- f1 [chi]
    b -- f2 [chibar]
    ```

=== "H to four leptons"

    ```feynman
    p p > H
    H > Z Z
    Z > mu+ mu-
    ```

    ```text
    p p > H
    H > Z Z
    Z > mu+ mu-
    ```

=== "Electroweakinos"

    ```feynman
    p p > chargino+ neutralino2
    chargino+ > W+ neutralino1
    neutralino2 > Z neutralino1
    ```

    ```text
    p p > chargino+ neutralino2
    chargino+ > W+ neutralino1
    neutralino2 > Z neutralino1
    ```
