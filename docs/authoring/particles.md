---
hide:
  - toc
---

# All particles and line types

## All particles

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
supersymmetric particles, the colour. Add your own with [`registerParticle`](../usage/api.md#registerparticle).

Any name with a tilde is its antiparticle (`t~`, `ve~`, `ul~`): a charged one is its partner of the
other charge (`pi+~` is the `pi-`), a neutrino takes its bar on the symbol alone (`ve~` is
`\bar\nu_e`), anything else a bar over its label. A name feynjs does not know is an error on a
line; in a process it is drawn as a plain line labelled with the name, and
[`check`](../usage/api.md#check) warns of it.

*Lists the particle registry, `src/particles/registry.ts`.*

### Charged leptons

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

### Neutrinos

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

### Quarks

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

### Jets and generic final states

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

### Gauge bosons

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

### Higgs bosons and scalars

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

### Beyond the Standard Model

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

### Hadrons and beams

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

### Supersymmetry

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

### MadGraph's MSSM names

MadGraph's MSSM names, as its models name them after renaming, draw as the names above do, with
the labels the [MadGraph plugin](../compatibility/madgraph.md) gives them. They are matched only as
written: `dl` is the left down squark, and `DL` the [displaced lepton](objects.md).

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

### Other

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

## Every line type

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
The [Lines and particles](lines.md) guide explains them, and the
[Particles](#all-particles) reference lists all 105 names.

### Generic styles

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

### Modifiers

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

### Particles

A particle's name gives its line the style, the arrow and the label at once. An antiparticle's
arrow runs against the line. MadGraph's names work too: `t~`, `ve`, `ta-`, `w+`.

#### Quarks and leptons

| Particle | Drawn | Source |
|---|---|---|
| **Quark**: also `d` `s` `c` `b` `t` `q` `q'` | <div class="feynman">a -- [u] b</div> | `a -- [u] b` |
| **Antiquark**: also `dbar` `sbar` `cbar` `bbar` `tbar` `qbar` `qbar'` | <div class="feynman">a -- [ubar] b</div> | `a -- [ubar] b` |
| **Charged lepton**: also `e-` `tau-` `l-`, and `e` `mu` `tau` `l` | <div class="feynman">a -- [mu-] b</div> | `a -- [mu-] b` |
| **Charged antilepton**: also `e+` `tau+` `l+` | <div class="feynman">a -- [mu+] b</div> | `a -- [mu+] b` |
| **Neutrino**: also `nu` `nu_mu` `nu_tau` `nu_l` | <div class="feynman">a -- [nu_e] b</div> | `a -- [nu_e] b` |
| **Antineutrino** | <div class="feynman">a -- [nubar] b</div> | `a -- [nubar] b` |

#### Gauge bosons

| Particle | Drawn | Source |
|---|---|---|
| **Gluon** | <div class="feynman">a -- [g] b</div> | `a -- [g] b` |
| **Photon**: also `a` | <div class="feynman">a -- [gamma] b</div> | `a -- [gamma] b` |
| **Z boson** | <div class="feynman">a -- [Z] b</div> | `a -- [Z] b` |
| **W boson**: also `W-` `W` | <div class="feynman">a -- [W+] b</div> | `a -- [W+] b` |
| **Off shell**: also `Z*` `W*` | <div class="feynman">a -- [gamma*] b</div> | `a -- [gamma*] b` |
| **Any vector boson** | <div class="feynman">a -- [V] b</div> | `a -- [V] b` |

#### Higgs bosons and scalars

| Particle | Drawn | Source |
|---|---|---|
| **Higgs boson**: also `h` `A` `S` `phi` | <div class="feynman">a -- [H] b</div> | `a -- [H] b` |
| **Charged Higgs boson**: also `H-` `H++` `H--` | <div class="feynman">a -- [H+] b</div> | `a -- [H+] b` |
| **Leptoquark** | <div class="feynman">a -- [LQ] b</div> | `a -- [LQ] b` |
| **Pion**: also `pi-` `pi0` | <div class="feynman">a -- [pi+] b</div> | `a -- [pi+] b` |

#### Supersymmetric partners

Drawn in the SUSY colour, brick red unless the [theme](../setup/styling.md) sets another.

| Particle | Drawn | Source |
|---|---|---|
| **Gluino** | <div class="feynman">a -- [gluino] b</div> | `a -- [gluino] b` |
| **Squark**: also `stop` `sbottom` | <div class="feynman">a -- [squark] b</div> | `a -- [squark] b` |
| **Slepton**: also `stau` `selectron` `smuon` `sneutrino` | <div class="feynman">a -- [slepton] b</div> | `a -- [slepton] b` |
| **Neutralino**: also `neutralino1` `neutralino2` `neutralino3` `LSP` | <div class="feynman">a -- [neutralino] b</div> | `a -- [neutralino] b` |
| **Chargino**: also `chargino+` `chargino-` `chargino2` | <div class="feynman">a -- [chargino] b</div> | `a -- [chargino] b` |
| **Higgsino**: also `bino` `wino` | <div class="feynman">a -- [higgsino] b</div> | `a -- [higgsino] b` |
| **Gravitino** | <div class="feynman">a -- [gravitino] b</div> | `a -- [gravitino] b` |

#### Others

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
[a page of their own](objects.md).

### Arrows

An extra arrow, a given fraction of the way along the line, besides any arrow the line has.

| Line | Drawn | Source |
|---|---|---|
| **An arrow anywhere** | <div class="feynman">a -- [plain, with arrow=0.25] b</div> | `a -- [plain, with arrow=0.25] b` |
| **One pointing back** | <div class="feynman">a -- [plain, with reversed arrow=0.75] b</div> | `a -- [plain, with reversed arrow=0.75] b` |
| **Several** | <div class="feynman">a -- [fermion, with arrow=0.2, with arrow=0.8] b</div> | `a -- [fermion, with arrow=0.2, with arrow=0.8] b` |
| **On a scalar** | <div class="feynman">a -- [scalar, with arrow=0.5] b</div> | `a -- [scalar, with arrow=0.5] b` |

`arrows: none`, on a line of its own, drops every fermion arrow in the diagram.

### Momentum arrows

A short arrow beside the line, with its label: on the side away from the line's label, or, with a
prime, on the label's side.

| Line | Drawn | Source |
|---|---|---|
| **Momentum** | <div class="feynman">a -- [photon, momentum=k] b</div> | `a -- [photon, momentum=k] b` |
| **On the other side** | <div class="feynman">a -- [photon, momentum'=k] b</div> | `a -- [photon, momentum'=k] b` |
| **Against the line**: also `rmomentum` | <div class="feynman">a -- [photon, reversed momentum=k] b</div> | `a -- [photon, reversed momentum=k] b` |
| **Against the line, on the other side** | <div class="feynman">a -- [photon, reversed momentum'=k] b</div> | `a -- [photon, reversed momentum'=k] b` |
| **With a particle's label** | <div class="feynman">a -- [e-, momentum=p] b</div> | `a -- [e-, momentum=p] b` |

### Insertions

A mass or mixing insertion, a cross in a ring, a given fraction of the way along the line.

| Line | Drawn | Source |
|---|---|---|
| **One** | <div class="feynman">a -- [fermion, insertion=0.5] b</div> | `a -- [fermion, insertion=0.5] b` |
| **Two** | <div class="feynman">a -- [fermion, insertion=0.25, insertion=0.75] b</div> | `a -- [fermion, insertion=0.25, insertion=0.75] b` |

### Labels

| Line | Drawn | Source |
|---|---|---|
| **Label** | <div class="feynman">a -- [fermion, label=p] b</div> | `a -- [fermion, label=p] b` |
| **Label on the right of the line** | <div class="feynman">a -- [fermion, label'=p] b</div> | `a -- [fermion, label'=p] b` |
| **A particle's label replaced** | <div class="feynman">a -- [W+, label=W^{+*}] b</div> | `a -- [W+, label=W^{+*}] b` |

The [Labels and notes](lines.md#labels) guide lists the TeX that labels understand.

### Bending

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

### Colours

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

The [Styling](../setup/styling.md) guide covers colour by charge, black and white, and `pulse`, a
glow that runs along a line to draw the eye to it.
