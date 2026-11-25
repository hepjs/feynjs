---
tags:
  - line styles
  - propagator
  - fermion
  - photon
  - gluon
  - scalar
  - ghost
  - TikZ-Feynman
  - TeX
  - LaTeX
  - Greek letters
  - edge label
  - momentum arrow
  - coupling
  - notes
  - annotation
---

# Lines, particles and labels

## Lines and particles

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] h
h -- [W+] w1
h -- [W-] w2
w1 -- f1 [e+]
w1 -- f2 [nu_e]
w2 -- f3 [mu-]
w2 -- f4 [nubar]
```

```text
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] h
h -- [W+] w1
h -- [W-] w2
w1 -- f1 [e+]
w1 -- f2 [nu_e]
w2 -- f3 [mu-]
w2 -- f4 [nubar]
```

A line's look comes from its options: a **generic style** (`fermion`, `photon`, ...) or a
**particle** (`e-`, `W+`, `gluino`, ...), which sets the style, the arrow and the label in one
word. A labelled external leg (`f1 [mu-]`) styles its own line, so most lines need no options.

Wavy and curly lines always hold a whole number of waves or loops, fitted to their length, so
they start and end cleanly.

### Generic styles

Named as in TikZ-Feynman. After a style or particle, these modify it:

| Add | Effect | Example |
|---|---|---|
| `heavy` | a thicker line (and a bigger arrow) | `[T, heavy]`, `[W', heavy]` |
| `dashed`, `dotted` | the same line, dashed or dotted (arrow kept) | `[fermion, dashed]` for a neutrino |
| `double` | drawn twice side by side | `[photon, double]` for a graviton, `[scalar, double]` for a long-lived particle |
| `jet` | a jet cone round the line | `[q, jet]`; on a leg's end, `f1 [q, jet]` |
| `no arrow`, `no label` | drop the arrow, drop a particle's label | `[W+, no label]` |
| `overlay` | a straight line over a wave or coil | |
| `label color=...` | a colour for the label alone | `[Z, color=green, label color=black]` |

`a -- [ellipsis] f` draws three dots where a leg would be ("and more"). The graviton `G` is a
double wave.

<div class="grid cards feynjs-swatches" markdown>

-   **fermion** `a -- [fermion] b`

    ```feynman
    a -- [fermion] b
    ```

-   **anti fermion** `a -- [anti fermion] b`

    ```feynman
    a -- [anti fermion] b
    ```

-   **majorana** `a -- [majorana] b`

    ```feynman
    a -- [majorana] b
    ```

-   **plain** `a -- [plain] b`

    ```feynman
    a -- [plain] b
    ```

-   **photon / boson** `a -- [photon] b`

    ```feynman
    a -- [photon] b
    ```

-   **charged boson** `a -- [charged boson] b`

    ```feynman
    a -- [charged boson] b
    ```

-   **gluon** `a -- [gluon] b`

    ```feynman
    a -- [gluon] b
    ```

-   **scalar (dashed)** `a -- [scalar] b`

    ```feynman
    a -- [scalar] b
    ```

-   **charged scalar** `a -- [charged scalar] b`

    ```feynman
    a -- [charged scalar] b
    ```

-   **ghost (dotted)** `a -- [ghost] b`

    ```feynman
    a -- [ghost] b
    ```

-   **double** `a -- [double] b`

    ```feynman
    a -- [double] b
    ```

-   **double photon (graviton)** `a -- [photon, double] b`

    ```feynman
    a -- [photon, double] b
    ```

-   **heavy** `a -- [heavy] b`

    ```feynman
    a -- [heavy] b
    ```

-   **proton** `a -- [proton] b`

    ```feynman
    a -- [proton] b
    ```

</div>

### Particles

A particle name sets the line style, the label and the colour. A few common ones are below; the
[Particles reference](../reference/particles.md) lists all of them, and
[`registerParticle`](../reference/api.md#registerparticle) adds your own.

Supersymmetric particles are drawn a little bolder and in the SUSY colour (brick red by default,
`susyColor` in the [theme](styling.md)); their labels take the same colour.

<div class="grid cards feynjs-swatches" markdown>

-   **W, Z, photon** `a -- [W+] b`

    ```feynman
    a -- [W+] b
    ```

-   **Higgs** `a -- [H] b`

    ```feynman
    a -- [H] b
    ```

-   **gluon** `a -- [g] b`

    ```feynman
    a -- [g] b
    ```

-   **top quark** `a -- [t] b`

    ```feynman
    a -- [t] b
    ```

-   **gluino** `a -- [gluino] b`

    ```feynman
    a -- [gluino] b
    ```

-   **squark, slepton** `a -- [squark] b`

    ```feynman
    a -- [squark] b
    ```

-   **neutralino, chargino** `a -- [neutralino] b`

    ```feynman
    a -- [neutralino] b
    ```

-   **gravitino** `a -- [gravitino] b`

    ```feynman
    a -- [gravitino] b
    ```

-   **heavy neutral lepton (Majorana)** `a -- [N] b`

    ```feynman
    a -- [N] b
    ```

-   **vector-like quark** `a -- [T] b`

    ```feynman
    a -- [T] b
    ```

-   **leptoquark** `a -- [LQ] b`

    ```feynman
    a -- [LQ] b
    ```

-   **Z'** `a -- [Z'] b`

    ```feynman
    a -- [Z'] b
    ```

</div>

## Labels

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [photon, momentum=q, label'=\gamma^*] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [photon, momentum=q, label'=\gamma^*] b
f1 [mu-] -- b -- f2 [mu+]
```

Every particle carries its own label, so most diagrams need none written. When you want your own,
labels are written in a small subset of TeX and typeset in New Computer Modern, the face of TeX
documents.

### Particle labels

A particle on a line or a leg labels it: `[W+]` writes W⁺, `[neutralino1]` writes χ̃⁰₁.
`label=` replaces the label, on the side feynjs picks (outside the diagram). `label'=` puts it
on the right of the line's direction, as TikZ-Feynman's `edge label'` does: below a line drawn
left to right. `no label` leaves it off.

A label that holds a comma goes in braces, so the comma isn't read as the end of the option:
`label={\gamma, Z^0}`.

### Where labels go

You don't place labels. Each one tries the outer side of its line first, then the other side,
then further along the line, then further out, until it is clear of every line, vertex and other
label. An external leg's label sits beyond the end of the leg.

### The TeX subset

| Write | Get |
|---|---|
| `\alpha \beta \gamma ... \Omega` | Greek letters, upper and lower case |
| `x^2`, `x_i`, `x^{+}_{1}` | superscripts and subscripts |
| `x'`, `x''` | primes |
| `\tilde t`, `\bar q`, `\hat s` (also `\widetilde`, `\overline`, `\widehat`) | accents |
| `\mathrm{h.c.}`, `\text{LSP}` | upright text |
| `\ell \pm \mp \to \times \cdot \dagger \infty \partial \hbar \neq` | common symbols |

No math engine is loaded. The labels are SVG text, so exported files need nothing else to display
correctly.

### Coupling labels

A label on a vertex is a coupling. It sits in the widest gap between the lines, set a little
smaller than particle labels. Give the vertex a dot and a colour to pick it out:

```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```

```text
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```

`label side=` puts it on a side of your choosing: `above`, `below`, `left`, `right`, or two of
them (`below left`).

```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, label side=left] -- f2 [H]
```

```text
c [dot, label=\kappa_V, label side=left] -- f2 [H]
```

### Words as labels

Labels written as words (`\text{LSP}`, or the particle `LSP`) are set upright and a little
smaller, as in SUSY papers.

### Notes

`note:` sets a few words in free space and draws an arrow to what they describe, as if by hand:
a gently curving pen stroke with an open arrowhead, in crayon blue, the words in the diagram's own colour. Point it at a point
(`note: c "VVH coupling"`), at a line between two points (`note: a--b "long-lived"`), or at a
particle by name (`note: H "..."`, its final state first). A side, `above`, `below`, `left` or
`right`, says where the words go; otherwise they go where there is room, away from the middle of
the diagram. Words in quotes are set upright; in braces they are TeX (`note: f1 {\text{soft } \pi^+}`).
Write as many notes as you like.

```feynman
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=W] c
b -- [boson, label=W] c
c -- [H] h [H]
note: c "VVH coupling"
```
