---
tags:
  - line styles
  - propagators
  - fermion line
  - photon
  - gluon
  - ghost
  - Majorana
  - momentum arrow
---

# Every line type

```feynman
i1 [q] -- a -- i2 [qbar]
a -- [gluon] b
b -- [squark] c
b -- [squark] d
c -- f1 [q]
c -- [neutralino2] e
e -- f2 [h]
e -- f3 [neutralino1]
d -- f4 [q]
d -- f5 [neutralino1]
```

```text
i1 [q] -- a -- i2 [qbar]
a -- [gluon] b
b -- [squark] c
b -- [squark] d
c -- f1 [q]
c -- [neutralino2] e
e -- f2 [h]
e -- f3 [neutralino1]
d -- f4 [q]
d -- f5 [neutralino1]
```

Each row of the tables below is one line between two points, `a` and `b`, beside its source.
Write a **style** (`fermion`, `gluon`, ...) for a bare line, or a **particle** (`e-`, `W+`,
`gluino`, ...) for a line that comes with its arrow and label, and add **options** after either.
The [Lines and particles](../guide/lines.md) guide explains them, and the
[Particles](../reference/particles.md) reference lists all 105 names.

## Generic styles

The line styles of TikZ-Feynman, under the same names.

| Line | Drawn | Source |
|---|---|---|
| **Fermion** | <div class="feynman">a -- [fermion] b</div> | `a -- [fermion] b` |
| **Antifermion**: the arrow against the line | <div class="feynman">a -- [anti fermion] b</div> | `a -- [anti fermion] b` |
| **Majorana fermion**: also `anti majorana` | <div class="feynman">a -- [majorana] b</div> | `a -- [majorana] b` |
| **Plain**: no arrow | <div class="feynman">a -- [plain] b</div> | `a -- [plain] b` |
| **Photon**, any vector boson: also `boson` | <div class="feynman">a -- [photon] b</div> | `a -- [photon] b` |
| **Charged vector boson** | <div class="feynman">a -- [charged boson] b</div> | `a -- [charged boson] b` |
| **Charged vector boson**, arrow reversed | <div class="feynman">a -- [anti charged boson] b</div> | `a -- [anti charged boson] b` |
| **Gluon** | <div class="feynman">a -- [gluon] b</div> | `a -- [gluon] b` |
| **Scalar**: also `dashed` | <div class="feynman">a -- [scalar] b</div> | `a -- [scalar] b` |
| **Charged scalar** | <div class="feynman">a -- [charged scalar] b</div> | `a -- [charged scalar] b` |
| **Charged scalar**, arrow reversed | <div class="feynman">a -- [anti charged scalar] b</div> | `a -- [anti charged scalar] b` |
| **Ghost**: also `dotted` | <div class="feynman">a -- [ghost] b</div> | `a -- [ghost] b` |
| **Gaugino**: a wave with a line over it | <div class="feynman">a -- [boson, overlay] b</div> | `a -- [boson, overlay] b` |
| **Gluino**: a coil with a line over it | <div class="feynman">a -- [gluon, overlay] b</div> | `a -- [gluon, overlay] b` |
| **SUSY scalar** | <div class="feynman">a -- [susy] b</div> | `a -- [susy] b` |
| **SUSY gaugino** | <div class="feynman">a -- [susy fermion] b</div> | `a -- [susy fermion] b` |
| **SUSY gluino** | <div class="feynman">a -- [susy gluon] b</div> | `a -- [susy gluon] b` |
| **Double** | <div class="feynman">a -- [double] b</div> | `a -- [double] b` |
| **Heavy fermion** | <div class="feynman">a -- [heavy] b</div> | `a -- [heavy] b` |
| **Proton**: three lines | <div class="feynman">a -- [proton] b</div> | `a -- [proton] b` |
| **Jet**: a cone | <div class="feynman">a -- [jet] b</div> | `a -- [jet] b` |
| **And more**: three dots | <div class="feynman">a -- [ellipsis] b</div> | `a -- [ellipsis] b` |

Two more are not drawn: `invisible` still holds its two points together in the layout, while
`hidden` is left out of it (only the older v1 engine makes room for it).

## Modifiers

Written after a style or a particle, these change how it is drawn and keep the rest.

| Line | Drawn | Source |
|---|---|---|
| **Heavy**: thicker, with a bigger arrow | <div class="feynman">a -- [fermion, heavy] b</div> | `a -- [fermion, heavy] b` |
| **Dashed**, the arrow kept | <div class="feynman">a -- [fermion, dashed] b</div> | `a -- [fermion, dashed] b` |
| **Dotted**, the arrow kept | <div class="feynman">a -- [fermion, dotted] b</div> | `a -- [fermion, dotted] b` |
| **Double**: a graviton | <div class="feynman">a -- [photon, double] b</div> | `a -- [photon, double] b` |
| **Double**: a long-lived scalar | <div class="feynman">a -- [scalar, double] b</div> | `a -- [scalar, double] b` |
| **Jet**: a cone round the line | <div class="feynman">a -- [q, jet] b</div> | `a -- [q, jet] b` |
| **No arrow** | <div class="feynman">a -- [e-, no arrow] b</div> | `a -- [e-, no arrow] b` |
| **No label** | <div class="feynman">a -- [W+, no label] b</div> | `a -- [W+, no label] b` |
| **Lifetime**: a band that fills in toward the decay | <div class="feynman">a -- [stop, lifetime] b</div> | `a -- [stop, lifetime] b` |
| **Lifetime** with a brace | <div class="feynman">a -- [chargino, lifetime={c\tau}] b</div> | `a -- [chargino, lifetime={c\tau}] b` |

## Particles

A particle's name gives its line the style, the arrow and the label at once. An antiparticle's
arrow runs against the line. MadGraph's names work too: `t~`, `ve`, `ta-`, `w+`.

### Quarks and leptons

| Particle | Drawn | Source |
|---|---|---|
| **Quark**: also `d` `s` `c` `b` `t` `q` `q'` | <div class="feynman">a -- [u] b</div> | `a -- [u] b` |
| **Antiquark**: also `dbar` `sbar` `cbar` `bbar` `tbar` `qbar` `qbar'` | <div class="feynman">a -- [ubar] b</div> | `a -- [ubar] b` |
| **Charged lepton**: also `e-` `tau-` `l-`, and `e` `mu` `tau` `l` | <div class="feynman">a -- [mu-] b</div> | `a -- [mu-] b` |
| **Charged antilepton**: also `e+` `tau+` `l+` | <div class="feynman">a -- [mu+] b</div> | `a -- [mu+] b` |
| **Neutrino**: also `nu` `nu_mu` `nu_tau` `nu_l` | <div class="feynman">a -- [nu_e] b</div> | `a -- [nu_e] b` |
| **Antineutrino** | <div class="feynman">a -- [nubar] b</div> | `a -- [nubar] b` |

### Gauge bosons

| Particle | Drawn | Source |
|---|---|---|
| **Gluon** | <div class="feynman">a -- [g] b</div> | `a -- [g] b` |
| **Photon**: also `a` | <div class="feynman">a -- [gamma] b</div> | `a -- [gamma] b` |
| **Z boson** | <div class="feynman">a -- [Z] b</div> | `a -- [Z] b` |
| **W boson**: also `W-` `W` | <div class="feynman">a -- [W+] b</div> | `a -- [W+] b` |
| **Off shell**: also `Z*` `W*` | <div class="feynman">a -- [gamma*] b</div> | `a -- [gamma*] b` |
| **Any vector boson** | <div class="feynman">a -- [V] b</div> | `a -- [V] b` |

### Higgs bosons and scalars

| Particle | Drawn | Source |
|---|---|---|
| **Higgs boson**: also `h` `A` `S` `phi` | <div class="feynman">a -- [H] b</div> | `a -- [H] b` |
| **Charged Higgs boson**: also `H-` `H++` `H--` | <div class="feynman">a -- [H+] b</div> | `a -- [H+] b` |
| **Leptoquark** | <div class="feynman">a -- [LQ] b</div> | `a -- [LQ] b` |
| **Pion**: also `pi-` `pi0` | <div class="feynman">a -- [pi+] b</div> | `a -- [pi+] b` |

### Supersymmetric partners

Drawn in the SUSY colour, brick red unless the [theme](../guide/styling.md) sets another.

| Particle | Drawn | Source |
|---|---|---|
| **Gluino** | <div class="feynman">a -- [gluino] b</div> | `a -- [gluino] b` |
| **Squark**: also `stop` `sbottom` | <div class="feynman">a -- [squark] b</div> | `a -- [squark] b` |
| **Slepton**: also `stau` `selectron` `smuon` `sneutrino` | <div class="feynman">a -- [slepton] b</div> | `a -- [slepton] b` |
| **Neutralino**: also `neutralino1` `neutralino2` `neutralino3` `LSP` | <div class="feynman">a -- [neutralino] b</div> | `a -- [neutralino] b` |
| **Chargino**: also `chargino+` `chargino-` `chargino2` | <div class="feynman">a -- [chargino] b</div> | `a -- [chargino] b` |
| **Higgsino**: also `bino` `wino` | <div class="feynman">a -- [higgsino] b</div> | `a -- [higgsino] b` |
| **Gravitino** | <div class="feynman">a -- [gravitino] b</div> | `a -- [gravitino] b` |

### Others

| Particle | Drawn | Source |
|---|---|---|
| **Z′**: also `W'` | <div class="feynman">a -- [Z'] b</div> | `a -- [Z'] b` |
| **Graviton** | <div class="feynman">a -- [G] b</div> | `a -- [G] b` |
| **Heavy neutral lepton**, a Majorana fermion | <div class="feynman">a -- [N] b</div> | `a -- [N] b` |
| **Vector-like quark**: also `B` | <div class="feynman">a -- [T] b</div> | `a -- [T] b` |
| **Dark matter**: also `chibar` | <div class="feynman">a -- [chi] b</div> | `a -- [chi] b` |
| **Proton**: also `p*`, what is left when it breaks up | <div class="feynman">a -- [p] b</div> | `a -- [p] b` |
| **Lead nucleus** | <div class="feynman">a -- [Pb] b</div> | `a -- [Pb] b` |
| **Jet**: also `X` | <div class="feynman">a -- [j] b</div> | `a -- [j] b` |
| **b-jet** | <div class="feynman">a -- [bjet] b</div> | `a -- [bjet] b` |

Large-R jets, hadronic taus, missing energy and the other things a detector sees are on
[a page of their own](../guide/objects.md).

## Arrows

An extra arrow, a given fraction of the way along the line, besides any arrow the line has.

| Line | Drawn | Source |
|---|---|---|
| **An arrow anywhere** | <div class="feynman">a -- [plain, with arrow=0.25] b</div> | `a -- [plain, with arrow=0.25] b` |
| **One pointing back** | <div class="feynman">a -- [plain, with reversed arrow=0.75] b</div> | `a -- [plain, with reversed arrow=0.75] b` |
| **Several** | <div class="feynman">a -- [fermion, with arrow=0.2, with arrow=0.8] b</div> | `a -- [fermion, with arrow=0.2, with arrow=0.8] b` |
| **On a scalar** | <div class="feynman">a -- [scalar, with arrow=0.5] b</div> | `a -- [scalar, with arrow=0.5] b` |

`arrows: none`, on a line of its own, drops every fermion arrow in the diagram.

## Momentum arrows

A short arrow beside the line, with its label: on the side away from the line's label, or, with a
prime, on the label's side.

| Line | Drawn | Source |
|---|---|---|
| **Momentum** | <div class="feynman">a -- [photon, momentum=k] b</div> | `a -- [photon, momentum=k] b` |
| **On the other side** | <div class="feynman">a -- [photon, momentum'=k] b</div> | `a -- [photon, momentum'=k] b` |
| **Against the line**: also `rmomentum` | <div class="feynman">a -- [photon, reversed momentum=k] b</div> | `a -- [photon, reversed momentum=k] b` |
| **Against the line, on the other side** | <div class="feynman">a -- [photon, reversed momentum'=k] b</div> | `a -- [photon, reversed momentum'=k] b` |
| **With a particle's label** | <div class="feynman">a -- [e-, momentum=p] b</div> | `a -- [e-, momentum=p] b` |

## Insertions

A mass or mixing insertion, a cross in a ring, a given fraction of the way along the line.

| Line | Drawn | Source |
|---|---|---|
| **One** | <div class="feynman">a -- [fermion, insertion=0.5] b</div> | `a -- [fermion, insertion=0.5] b` |
| **Two** | <div class="feynman">a -- [fermion, insertion=0.25, insertion=0.75] b</div> | `a -- [fermion, insertion=0.25, insertion=0.75] b` |

## Labels

| Line | Drawn | Source |
|---|---|---|
| **Label** | <div class="feynman">a -- [fermion, label=p] b</div> | `a -- [fermion, label=p] b` |
| **Label on the right of the line** | <div class="feynman">a -- [fermion, label'=p] b</div> | `a -- [fermion, label'=p] b` |
| **A particle's label replaced** | <div class="feynman">a -- [W+, label=W^{+*}] b</div> | `a -- [W+, label=W^{+*}] b` |

The [Labels and notes](../guide/labels.md) guide lists the TeX that labels understand.

## Bending

Angles count anticlockwise from the right, in degrees, as in TikZ.

| Line | Drawn | Source |
|---|---|---|
| **Half left**: also `half right` | <div class="feynman">a -- [fermion, half left] b</div> | `a -- [fermion, half left] b` |
| **Quarter left**: also `quarter right` | <div class="feynman">a -- [fermion, quarter left] b</div> | `a -- [fermion, quarter left] b` |
| **Bend left**: also `bend right` | <div class="feynman">a -- [fermion, bend left] b</div> | `a -- [fermion, bend left] b` |
| **Bend by any angle** | <div class="feynman">a -- [gluon, bend=60] b</div> | `a -- [gluon, bend=60] b` |
| **Leaving and arriving at given angles** | <div class="feynman">a -- [fermion, out=90, in=90] b</div> | `a -- [fermion, out=90, in=90] b` |
| **The same, looser** | <div class="feynman">a -- [fermion, out=90, in=90, looseness=1.5] b</div> | `a -- [fermion, out=90, in=90, looseness=1.5] b` |

Two bent lines make a loop, and a bent line beside a straight one a self-energy:

```feynman
--- a quark loop
i1 [g] -- a
a -- [fermion, half left] b -- [fermion, half left] a
b -- f1 [g]
--- an electron self-energy
i1 [e-] -- a -- b -- f1 [e-]
a -- [photon, half left] b
```

```text
--- a quark loop
i1 [g] -- a
a -- [fermion, half left] b -- [fermion, half left] a
b -- f1 [g]
--- an electron self-energy
i1 [e-] -- a -- b -- f1 [e-]
a -- [photon, half left] b
```

## Colours

| Line | Drawn | Source |
|---|---|---|
| **A palette colour**: also `red`, `blue`, `green`, `gray` alone | <div class="feynman">a -- [gluon, color=blue] b</div> | `a -- [gluon, color=blue] b` |
| **Any CSS colour** | <div class="feynman">a -- [fermion, color=#e67e22] b</div> | `a -- [fermion, color=#e67e22] b` |
| **The label in another colour** | <div class="feynman">a -- [Z, color=green, label color=black] b</div> | `a -- [Z, color=green, label color=black] b` |

`every` sets a colour, or any other option, for every line of a kind, here both photons in
Compton scattering:

```feynman
every photon: color=red
i1 [e-] -- a -- b -- f1 [e-]
i2 [gamma] -- a
b -- f2 [gamma]
```

```text
every photon: color=red
i1 [e-] -- a -- b -- f1 [e-]
i2 [gamma] -- a
b -- f2 [gamma]
```

The [Styling](../guide/styling.md) guide covers colour by charge, black and white, and `pulse`, a
glow that runs along a line to draw the eye to it.
