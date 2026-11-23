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
---

# Lines and particles

***Choose how each line is drawn: a TikZ-Feynman style such as fermion, photon or gluon, or a particle name that sets the style, arrow and label at once.***

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

## Generic styles

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

**fermion** &nbsp; `a -- [fermion] b`

```feynman
a -- [fermion] b
```

**anti fermion** &nbsp; `a -- [anti fermion] b`

```feynman
a -- [anti fermion] b
```

**majorana** &nbsp; `a -- [majorana] b`

```feynman
a -- [majorana] b
```

**plain** &nbsp; `a -- [plain] b`

```feynman
a -- [plain] b
```

**photon / boson** &nbsp; `a -- [photon] b`

```feynman
a -- [photon] b
```

**charged boson** &nbsp; `a -- [charged boson] b`

```feynman
a -- [charged boson] b
```

**gluon** &nbsp; `a -- [gluon] b`

```feynman
a -- [gluon] b
```

**scalar (dashed)** &nbsp; `a -- [scalar] b`

```feynman
a -- [scalar] b
```

**charged scalar** &nbsp; `a -- [charged scalar] b`

```feynman
a -- [charged scalar] b
```

**ghost (dotted)** &nbsp; `a -- [ghost] b`

```feynman
a -- [ghost] b
```

**double** &nbsp; `a -- [double] b`

```feynman
a -- [double] b
```

**double photon (graviton)** &nbsp; `a -- [photon, double] b`

```feynman
a -- [photon, double] b
```

**heavy** &nbsp; `a -- [heavy] b`

```feynman
a -- [heavy] b
```

**proton** &nbsp; `a -- [proton] b`

```feynman
a -- [proton] b
```

## Particles

A particle name sets the line style, the label and the colour. A few common ones are below; the
[Particles reference](../reference/particles.md) lists all of them, and
[`registerParticle`](../reference/api.md#registerparticle) adds your own.

Supersymmetric particles are drawn a little bolder and in the SUSY colour (brick red by default,
`susyColor` in the [theme](styling.md)); their labels take the same colour.

**W, Z, photon** &nbsp; `a -- [W+] b`

```feynman
a -- [W+] b
```

**Higgs** &nbsp; `a -- [H] b`

```feynman
a -- [H] b
```

**gluon** &nbsp; `a -- [g] b`

```feynman
a -- [g] b
```

**top quark** &nbsp; `a -- [t] b`

```feynman
a -- [t] b
```

**gluino** &nbsp; `a -- [gluino] b`

```feynman
a -- [gluino] b
```

**squark, slepton** &nbsp; `a -- [squark] b`

```feynman
a -- [squark] b
```

**neutralino, chargino** &nbsp; `a -- [neutralino] b`

```feynman
a -- [neutralino] b
```

**gravitino** &nbsp; `a -- [gravitino] b`

```feynman
a -- [gravitino] b
```

**heavy neutral lepton (Majorana)** &nbsp; `a -- [N] b`

```feynman
a -- [N] b
```

**vector-like quark** &nbsp; `a -- [T] b`

```feynman
a -- [T] b
```

**leptoquark** &nbsp; `a -- [LQ] b`

```feynman
a -- [LQ] b
```

**Z'** &nbsp; `a -- [Z'] b`

```feynman
a -- [Z'] b
```
