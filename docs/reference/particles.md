---
tags:
  - particle names
  - MadGraph names
  - SUSY
  - Standard Model
  - line styles
  - labels
  - registerParticle
  - PDG
hide:
  - toc
---

# All particles

***Every particle name feynjs knows, and how each is drawn: write a name on a line or a leg and it sets the line style, the arrow and the label.***

```feynman
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > H neutralino1
```

```text
p p > chargino+ neutralino2
chargino+ > W+ neutralino1
neutralino2 > H neutralino1
```

Every name feynjs knows, 105 in all. Write a name on a line (`a -- [W+] b`) or on an
external leg (`f1 [mu-]`) and it sets the line style, the label and, for supersymmetric particles, the
colour. Add your own with [`registerParticle`](api.md#registerparticle).

*Lists the particle registry, `src/particles/registry.ts`.*

## Charged leptons

```feynman
--- e-
a -- [e-] b
--- e+
a -- [e+] b
--- e
a -- [e] b
--- mu-
a -- [mu-] b
--- mu+
a -- [mu+] b
--- mu
a -- [mu] b
```

| Name | Label | Drawn as |
|---|---|---|
| `e-` | `e^-` | fermion |
| `e+` | `e^+` | fermion; antiparticle: its arrow runs against the line |
| `e` | `e` | fermion |
| `mu-` | `\mu^-` | fermion |
| `mu+` | `\mu^+` | fermion; antiparticle: its arrow runs against the line |
| `mu` | `\mu` | fermion |
| `tau-` | `\tau^-` | fermion |
| `tau+` | `\tau^+` | fermion; antiparticle: its arrow runs against the line |
| `tau` | `\tau` | fermion |
| `l-` | `\ell^-` | fermion |
| `l+` | `\ell^+` | fermion; antiparticle: its arrow runs against the line |
| `l` | `\ell` | fermion |

## Neutrinos

```feynman
--- nu
a -- [nu] b
--- nubar
a -- [nubar] b
--- nu_e
a -- [nu_e] b
--- nu_mu
a -- [nu_mu] b
--- nu_tau
a -- [nu_tau] b
--- nu_l
a -- [nu_l] b
```

| Name | Label | Drawn as |
|---|---|---|
| `nu` | `\nu` | fermion |
| `nubar` | `\bar\nu` | fermion; antiparticle: its arrow runs against the line |
| `nu_e` | `\nu_e` | fermion |
| `nu_mu` | `\nu_\mu` | fermion |
| `nu_tau` | `\nu_\tau` | fermion |
| `nu_l` | `\nu_\ell` | fermion |

## Quarks

```feynman
--- u
a -- [u] b
--- ubar
a -- [ubar] b
--- d
a -- [d] b
--- dbar
a -- [dbar] b
--- s
a -- [s] b
--- sbar
a -- [sbar] b
```

| Name | Label | Drawn as |
|---|---|---|
| `u` | `u` | fermion |
| `ubar` | `\bar u` | fermion; antiparticle: its arrow runs against the line |
| `d` | `d` | fermion |
| `dbar` | `\bar d` | fermion; antiparticle: its arrow runs against the line |
| `s` | `s` | fermion |
| `sbar` | `\bar s` | fermion; antiparticle: its arrow runs against the line |
| `c` | `c` | fermion |
| `cbar` | `\bar c` | fermion; antiparticle: its arrow runs against the line |
| `b` | `b` | fermion |
| `bbar` | `\bar b` | fermion; antiparticle: its arrow runs against the line |
| `t` | `t` | fermion |
| `tbar` | `\bar t` | fermion; antiparticle: its arrow runs against the line |
| `q` | `q` | fermion |
| `qbar` | `\bar q` | fermion; antiparticle: its arrow runs against the line |
| `q'` | `q'` | fermion |
| `qbar'` | `\bar q'` | fermion; antiparticle: its arrow runs against the line |

## Jets and generic final states

```feynman
--- j
a -- [j] b
--- bjet
a -- [bjet] b
--- p*
a -- [p*] b
--- X
a -- [X] b
```

| Name | Label | Drawn as |
|---|---|---|
| `j` | `j` | jet (cone) |
| `bjet` | `b` | jet (cone) |
| `p*` | `p^*` | proton (three lines) |
| `X` | `X` | jet (cone) |

## Gauge bosons

```feynman
--- g
a -- [g] b
--- gamma
a -- [gamma] b
--- a
a -- [a] b
--- Z
a -- [Z] b
--- W
a -- [W] b
--- W+
a -- [W+] b
```

| Name | Label | Drawn as |
|---|---|---|
| `g` | `g` | gluon (coil) |
| `gamma` | `\gamma` | boson (wave) |
| `a` | `\gamma` | boson (wave) |
| `Z` | `Z` | boson (wave) |
| `W` | `W` | boson (wave) |
| `W+` | `W^+` | boson (wave) |
| `W-` | `W^-` | boson (wave) |
| `V` | `V` | boson (wave) |
| `gamma*` | `\gamma^*` | boson (wave) |
| `Z*` | `Z^*` | boson (wave) |
| `W*` | `W^*` | boson (wave) |

## Higgs bosons and scalars

```feynman
--- H
a -- [H] b
--- h
a -- [h] b
--- A
a -- [A] b
--- S
a -- [S] b
--- phi
a -- [phi] b
--- H+
a -- [H+] b
```

| Name | Label | Drawn as |
|---|---|---|
| `H` | `H` | scalar (dashed) |
| `h` | `h` | scalar (dashed) |
| `A` | `A` | scalar (dashed) |
| `S` | `S` | scalar (dashed) |
| `phi` | `\phi` | scalar (dashed) |
| `H+` | `H^+` | charged scalar (dashed) |
| `H-` | `H^-` | charged scalar (dashed); antiparticle: its arrow runs against the line |
| `H++` | `H^{++}` | charged scalar (dashed) |
| `H--` | `H^{--}` | charged scalar (dashed); antiparticle: its arrow runs against the line |

## Beyond the Standard Model

```feynman
--- Z'
a -- [Z'] b
--- W'
a -- [W'] b
--- G
a -- [G] b
--- LQ
a -- [LQ] b
--- chi
a -- [chi] b
--- chibar
a -- [chibar] b
```

| Name | Label | Drawn as |
|---|---|---|
| `Z'` | `Z'` | boson (wave) |
| `W'` | `W'` | boson (wave) |
| `G` | `G` | boson (wave) |
| `LQ` | `\mathrm{LQ}` | scalar (dashed) |
| `chi` | `\chi` | fermion |
| `chibar` | `\bar\chi` | fermion; antiparticle: its arrow runs against the line |
| `N` | `N` | majorana |
| `T` | `T` | fermion, heavy |
| `B` | `B` | fermion, heavy |

## Hadrons and beams

```feynman
--- p
a -- [p] b
--- Pb
a -- [Pb] b
--- pi+
a -- [pi+] b
--- pi-
a -- [pi-] b
--- pi0
a -- [pi0] b
```

| Name | Label | Drawn as |
|---|---|---|
| `p` | `p` | proton (three lines) |
| `Pb` | `\mathrm{Pb}` | double |
| `pi+` | `\pi^+` | scalar (dashed) |
| `pi-` | `\pi^-` | scalar (dashed) |
| `pi0` | `\pi^0` | scalar (dashed) |

## Supersymmetry

```feynman
--- gluino
a -- [gluino] b
--- squark
a -- [squark] b
--- stop
a -- [stop] b
--- sbottom
a -- [sbottom] b
--- slepton
a -- [slepton] b
--- stau
a -- [stau] b
```

| Name | Label | Drawn as |
|---|---|---|
| `gluino` | `\tilde g` | gluon (coil) with a straight line over it; SUSY colour |
| `squark` | `\tilde q` | scalar (dashed); SUSY colour |
| `stop` | `\tilde t` | scalar (dashed); SUSY colour |
| `sbottom` | `\tilde b` | scalar (dashed); SUSY colour |
| `slepton` | `\tilde\ell` | scalar (dashed); SUSY colour |
| `stau` | `\tilde\tau` | scalar (dashed); SUSY colour |
| `selectron` | `\tilde e` | scalar (dashed); SUSY colour |
| `smuon` | `\tilde\mu` | scalar (dashed); SUSY colour |
| `sneutrino` | `\tilde\nu` | scalar (dashed); SUSY colour |
| `neutralino` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino1` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino2` | `\tilde\chi^0_2` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino3` | `\tilde\chi^0_3` | boson (wave) with a straight line over it; SUSY colour |
| `chargino` | `\tilde\chi^\pm_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino+` | `\tilde\chi^+_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino-` | `\tilde\chi^-_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino2` | `\tilde\chi^\pm_2` | boson (wave) with a straight line over it; SUSY colour |
| `gravitino` | `\tilde G` | boson (wave) with a straight line over it; SUSY colour |
| `LSP` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino` | `\tilde H` | boson (wave) with a straight line over it; SUSY colour |
| `bino` | `\tilde B` | boson (wave) with a straight line over it; SUSY colour |
| `wino` | `\tilde W` | boson (wave) with a straight line over it; SUSY colour |

## Other

```feynman
--- J
a -- [J] b
--- tauh
a -- [tauh] b
--- svj
a -- [svj] b
--- ej
a -- [ej] b
--- dj
a -- [dj] b
--- ljet
a -- [ljet] b
```

| Name | Label | Drawn as |
|---|---|---|
| `J` | `J` | jet (cone) |
| `tauh` | `\tau_{\mathrm{had}}` | jet (cone) |
| `svj` | `\text{SVJ}` | jet (cone) |
| `ej` | `\text{EJ}` | jet (cone) |
| `dj` | `\text{DJ}` | jet (cone) |
| `ljet` | `\text{LJ}` | jet (cone) |
| `met` | `E_{\mathrm{T}}^{\mathrm{miss}}` | jet (cone) |
| `Jt` | `J_t` | jet (cone) |
| `dt` | `\text{DT}` | jet (cone) |
| `dl` | `\ell_{\mathrm{d}}` | jet (cone) |
| `hscp` | `\text{HSCP}` | jet (cone) |
