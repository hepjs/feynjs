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

Every name feynjs knows, 212 in all, and MadGraph's names for them. Write a name on a line
(`a -- [W+] b`) or on an external leg (`f1 [mu-]`) and it sets the line style, the label and, for
supersymmetric particles, the colour. Add your own with [`registerParticle`](api.md#registerparticle).

Any name with a tilde is its antiparticle (`t~`, `ve~`, `ul~`): a charged one is its partner of the
other charge (`pi+~` is the `pi-`), a neutrino takes its bar on the symbol alone (`ve~` is
`\bar\nu_e`), anything else a bar over its label. A name feynjs does not know is an error on a
line; in a process it is drawn as a plain line labelled with the name, and
[`check`](api.md#check) warns of it.

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
--- K*0
a -- [K*0] b
--- Lambda_b
a -- [Lambda_b] b
--- X(ucd)
a -- [X(ucd)] b
```

Mesons are drawn dashed, as the pion always was; baryons in three lines, as the proton is. Each
hadron's tooltip gives its quarks, charge, spin and mass.

- **A star** names an excited state, labelled with a superscript ∗ (`^*`): `K*`, `K*0`, `K*+`,
  `D*`, `D*0`, `D*-`, `B*`, `Ds*+`, `rho*`, `Sigma*+`.
- **A charge** may follow any hadron's name: `+`, `-`, `0` (and `++`, `--`): `kaon+`, `pion0`,
  `Lambda0`, `Lambda_b0`, `Bs0`, `Omega-`.
- **`bar`** after a name is the antiparticle: `K0bar`, `D0bar`, `B0bar`, `Lambdabar`.
- **Parentheses** after a name hold what it is made of, when everything in them is quarks (`u d s
  c b t`, each with `~` for the antiquark): `X(ucd)` is labelled `X` and made of u, c and d;
  `X(cc~)` is a meson, `Pc(uudcc~)` a pentaquark labelled `P_c`. Anything else in them is part of
  the label: `psi(2S)` is `\psi(2S)`, `X(3872)` is `X(3872)`, `upsilon(3S)` is `\Upsilon(3S)`.
- **Case matters**: `Omega` is the baryon `\Omega`, `omega` the meson `\omega`. `phi` stays the
  hypothetical scalar; the φ(1020) meson is `phi1020` or `phi(1020)`. `B` alone is the heavy
  bottom partner, and `K`, `D` alone are no names: give them a charge or a star.

| Name | Label | Drawn as |
|---|---|---|
| `p` | `p` | proton (three lines) |
| `n` | `n` | proton (three lines) |
| `neutron` | `n` | proton (three lines) |
| `pbar` | `\bar p` | proton (three lines) |
| `antiproton` | `\bar p` | proton (three lines) |
| `Pb` | `\mathrm{Pb}` | double |
| `pion` | `\pi` | scalar (dashed) |
| `pi+` | `\pi^+` | scalar (dashed) |
| `pi-` | `\pi^-` | scalar (dashed) |
| `pi0` | `\pi^0` | scalar (dashed) |
| `kaon` | `K` | scalar (dashed) |
| `K+` | `K^+` | scalar (dashed) |
| `K-` | `K^-` | scalar (dashed) |
| `K0` | `K^0` | scalar (dashed) |
| `K0bar` | `\bar K^0` | scalar (dashed) |
| `KS` | `K^0_S` | scalar (dashed) |
| `KL` | `K^0_L` | scalar (dashed) |
| `eta` | `\eta` | scalar (dashed) |
| `eta'` | `\eta'` | scalar (dashed) |
| `rho` | `\rho` | scalar (dashed) |
| `rho+` | `\rho^+` | scalar (dashed) |
| `rho-` | `\rho^-` | scalar (dashed) |
| `rho0` | `\rho^0` | scalar (dashed) |
| `omega` | `\omega` | scalar (dashed) |
| `phi1020` | `\phi(1020)` | scalar (dashed) |
| `phi(1020)` | `\phi(1020)` | scalar (dashed) |
| `jpsi` | `J/\psi` | scalar (dashed) |
| `J/psi` | `J/\psi` | scalar (dashed) |
| `psi2S` | `\psi(2S)` | scalar (dashed) |
| `psi(2S)` | `\psi(2S)` | scalar (dashed) |
| `upsilon` | `\Upsilon` | scalar (dashed) |
| `Upsilon` | `\Upsilon` | scalar (dashed) |
| `D+` | `D^+` | scalar (dashed) |
| `D-` | `D^-` | scalar (dashed) |
| `D0` | `D^0` | scalar (dashed) |
| `Ds` | `D_s` | scalar (dashed) |
| `Ds+` | `D_s^+` | scalar (dashed) |
| `Ds-` | `D_s^-` | scalar (dashed) |
| `B+` | `B^+` | scalar (dashed) |
| `B-` | `B^-` | scalar (dashed) |
| `B0` | `B^0` | scalar (dashed) |
| `Bs` | `B_s` | scalar (dashed) |
| `Bc` | `B_c` | scalar (dashed) |
| `Bc+` | `B_c^+` | scalar (dashed) |
| `Bc-` | `B_c^-` | scalar (dashed) |
| `Lambda` | `\Lambda` | proton (three lines) |
| `Lambda_b` | `\Lambda_b` | proton (three lines) |
| `Lambda_c` | `\Lambda_c` | proton (three lines) |
| `Lambda_c+` | `\Lambda_c^+` | proton (three lines) |
| `Sigma` | `\Sigma` | proton (three lines) |
| `Sigma+` | `\Sigma^+` | proton (three lines) |
| `Sigma0` | `\Sigma^0` | proton (three lines) |
| `Sigma-` | `\Sigma^-` | proton (three lines) |
| `Xi` | `\Xi` | proton (three lines) |
| `Xi0` | `\Xi^0` | proton (three lines) |
| `Xi-` | `\Xi^-` | proton (three lines) |
| `Omega` | `\Omega` | proton (three lines) |
| `Omega-` | `\Omega^-` | proton (three lines) |
| `Delta` | `\Delta` | proton (three lines) |
| `Delta++` | `\Delta^{++}` | proton (three lines) |
| `Delta+` | `\Delta^+` | proton (three lines) |
| `Delta0` | `\Delta^0` | proton (three lines) |
| `Delta-` | `\Delta^-` | proton (three lines) |

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
| `stop1` | `\tilde t_1` | scalar (dashed); SUSY colour |
| `stop2` | `\tilde t_2` | scalar (dashed); SUSY colour |
| `sbottom` | `\tilde b` | scalar (dashed); SUSY colour |
| `sbottom1` | `\tilde b_1` | scalar (dashed); SUSY colour |
| `sbottom2` | `\tilde b_2` | scalar (dashed); SUSY colour |
| `slepton` | `\tilde\ell` | scalar (dashed); SUSY colour |
| `stau` | `\tilde\tau` | scalar (dashed); SUSY colour |
| `stau1` | `\tilde\tau_1` | scalar (dashed); SUSY colour |
| `stau2` | `\tilde\tau_2` | scalar (dashed); SUSY colour |
| `selectron` | `\tilde e` | scalar (dashed); SUSY colour |
| `selectronL` | `\tilde e_L` | scalar (dashed); SUSY colour |
| `selectronR` | `\tilde e_R` | scalar (dashed); SUSY colour |
| `smuon` | `\tilde\mu` | scalar (dashed); SUSY colour |
| `smuonL` | `\tilde\mu_L` | scalar (dashed); SUSY colour |
| `smuonR` | `\tilde\mu_R` | scalar (dashed); SUSY colour |
| `sneutrino` | `\tilde\nu` | scalar (dashed); SUSY colour |
| `neutralino` | `\tilde\chi^0` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino1` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino2` | `\tilde\chi^0_2` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino3` | `\tilde\chi^0_3` | boson (wave) with a straight line over it; SUSY colour |
| `neutralino4` | `\tilde\chi^0_4` | boson (wave) with a straight line over it; SUSY colour |
| `chargino` | `\tilde\chi^\pm_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino1` | `\tilde\chi^\pm_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino2` | `\tilde\chi^\pm_2` | boson (wave) with a straight line over it; SUSY colour |
| `chargino+` | `\tilde\chi^+_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino-` | `\tilde\chi^-_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino1+` | `\tilde\chi^+_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino1-` | `\tilde\chi^-_1` | boson (wave) with a straight line over it; SUSY colour |
| `chargino2+` | `\tilde\chi^+_2` | boson (wave) with a straight line over it; SUSY colour |
| `chargino2-` | `\tilde\chi^-_2` | boson (wave) with a straight line over it; SUSY colour |
| `gravitino` | `\tilde G` | boson (wave) with a straight line over it; SUSY colour |
| `LSP` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `NLSP` | `\mathrm{NLSP}` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino` | `\tilde H` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino0` | `\tilde H^0` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino+` | `\tilde H^+` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino-` | `\tilde H^-` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino1` | `\tilde H^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `higgsino2` | `\tilde H^0_2` | boson (wave) with a straight line over it; SUSY colour |
| `bino` | `\tilde B` | boson (wave) with a straight line over it; SUSY colour |
| `wino` | `\tilde W` | boson (wave) with a straight line over it; SUSY colour |
| `wino0` | `\tilde W^0` | boson (wave) with a straight line over it; SUSY colour |
| `wino+` | `\tilde W^+` | boson (wave) with a straight line over it; SUSY colour |
| `wino-` | `\tilde W^-` | boson (wave) with a straight line over it; SUSY colour |

The generic `neutralino` carries no index (`\tilde\chi^0`); the generic `chargino` keeps the
label it always had, `\tilde\chi^\pm_1`, so that diagrams drawn with it stay as they were. Number
them for a particular one: `neutralino1` to `neutralino4`, `chargino1`, `chargino2+`.

## MadGraph's MSSM names

MadGraph's MSSM names, as its models name them after renaming, draw as the names above do, with
the labels the [MadGraph plugin](../compatibility/madgraph.md) gives them. They are matched only as
written: `dl` is the left down squark, and `DL` the [displaced lepton](../guide/objects.md).

```feynman
--- go
a -- [go] b
--- n1
a -- [n1] b
--- x1+
a -- [x1+] b
--- ul
a -- [ul] b
--- ta1-
a -- [ta1-] b
--- sve
a -- [sve] b
```

| Name | Label | Drawn as |
|---|---|---|
| `go` | `\tilde g` | gluon (coil) with a straight line over it; SUSY colour |
| `n1` | `\tilde\chi^0_1` | boson (wave) with a straight line over it; SUSY colour |
| `n2` | `\tilde\chi^0_2` | boson (wave) with a straight line over it; SUSY colour |
| `n3` | `\tilde\chi^0_3` | boson (wave) with a straight line over it; SUSY colour |
| `n4` | `\tilde\chi^0_4` | boson (wave) with a straight line over it; SUSY colour |
| `x1+` | `\tilde\chi^+_1` | boson (wave) with a straight line over it; SUSY colour |
| `x1-` | `\tilde\chi^-_1` | boson (wave) with a straight line over it; SUSY colour |
| `x2+` | `\tilde\chi^+_2` | boson (wave) with a straight line over it; SUSY colour |
| `x2-` | `\tilde\chi^-_2` | boson (wave) with a straight line over it; SUSY colour |
| `ul` | `\tilde u_{L}` | scalar (dashed); SUSY colour |
| `ul~` | `\bar{\tilde u_{L}}` | scalar (dashed); SUSY colour; antiparticle: its arrow runs against the line |
| `ur` | `\tilde u_{R}` | scalar (dashed); SUSY colour |
| `dl` | `\tilde d_{L}` | scalar (dashed); SUSY colour |
| `dr` | `\tilde d_{R}` | scalar (dashed); SUSY colour |
| `cl` | `\tilde c_{L}` | scalar (dashed); SUSY colour |
| `cr` | `\tilde c_{R}` | scalar (dashed); SUSY colour |
| `sl` | `\tilde s_{L}` | scalar (dashed); SUSY colour |
| `sr` | `\tilde s_{R}` | scalar (dashed); SUSY colour |
| `t1` | `\tilde t_1` | scalar (dashed); SUSY colour |
| `t2` | `\tilde t_2` | scalar (dashed); SUSY colour |
| `b1` | `\tilde b_1` | scalar (dashed); SUSY colour |
| `b2` | `\tilde b_2` | scalar (dashed); SUSY colour |
| `el-` | `\tilde{e}^-_L` | scalar (dashed); SUSY colour |
| `el+` | `\tilde{e}^+_L` | scalar (dashed); SUSY colour |
| `er-` | `\tilde{e}^-_R` | scalar (dashed); SUSY colour |
| `er+` | `\tilde{e}^+_R` | scalar (dashed); SUSY colour |
| `mul-` | `\tilde{\mu}^-_L` | scalar (dashed); SUSY colour |
| `mul+` | `\tilde{\mu}^+_L` | scalar (dashed); SUSY colour |
| `mur-` | `\tilde{\mu}^-_R` | scalar (dashed); SUSY colour |
| `mur+` | `\tilde{\mu}^+_R` | scalar (dashed); SUSY colour |
| `ta1-` | `\tilde\tau^-_1` | scalar (dashed); SUSY colour |
| `ta1+` | `\tilde\tau^+_1` | scalar (dashed); SUSY colour |
| `ta2-` | `\tilde\tau^-_2` | scalar (dashed); SUSY colour |
| `ta2+` | `\tilde\tau^+_2` | scalar (dashed); SUSY colour |
| `sve` | `\tilde\nu_{e}` | scalar (dashed); SUSY colour |
| `sve~` | `\bar{\tilde\nu_{e}}` | scalar (dashed); SUSY colour; antiparticle: its arrow runs against the line |
| `svm` | `\tilde\nu_{\mu}` | scalar (dashed); SUSY colour |
| `svt` | `\tilde\nu_{\tau}` | scalar (dashed); SUSY colour |
| `h1` | `h` | scalar (dashed) |
| `h2` | `H` | scalar (dashed) |
| `h3` | `A` | scalar (dashed) |
| `h+` | `H^+` | charged scalar (dashed) |
| `h-` | `H^-` | charged scalar (dashed); antiparticle: its arrow runs against the line |
| `vl` | `\nu_\ell` | fermion |
| `vl~` | `\bar\nu_\ell` | fermion; antiparticle: its arrow runs against the line |

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
| `dislep` | `\ell_{\mathrm{d}}` | jet (cone) |
| `hscp` | `\text{HSCP}` | jet (cone) |
