# Gallery

Every diagram below is laid out automatically: the source gives only the particles and how they connect.

## bhabha-t

```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a -- f1 [e-]
i2 [e+] -- b -- f2 [e+]
a -- [gamma] b
```

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a -- f1 [e-]
i2 [e+] -- b -- f2 [e+]
a -- [gamma] b
```
````

## Box on a quark line

```feynman
% B0 -> K*0 mu mu through a W box: two W rungs between the quark line and the lepton line
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^+] n1
l2 -- [boson, label=W^-] n2
mu2 [\mu^+] -- [fermion] n1 -- [fermion, label=\nu_\mu] n2 -- [fermion] mu1 [\mu^-]
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```

````markdown
```feynman
% B0 -> K*0 mu mu through a W box: two W rungs between the quark line and the lepton line
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^+] n1
l2 -- [boson, label=W^-] n2
mu2 [\mu^+] -- [fermion] n1 -- [fermion, label=\nu_\mu] n2 -- [fermion] mu1 [\mu^-]
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```
````

## Box loop

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] d -- [fermion] b -- [fermion] a
c -- f1 [H]
d -- f2 [H]
```

````markdown
```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] d -- [fermion] b -- [fermion] a
c -- f1 [H]
d -- f2 [H]
```
````

## bremsstrahlung

```feynman
in: i1 i2
out: f3 f1 f2
i1 [e-] -- a -- b -- f1 [e-]
a -- f3 [gamma]
b -- [gamma] c
i2 [q] -- c -- f2 [q]
```

````markdown
```feynman
in: i1 i2
out: f3 f1 f2
i1 [e-] -- a -- b -- f1 [e-]
a -- f3 [gamma]
b -- [gamma] c
i2 [q] -- c -- f2 [q]
```
````

## Self-energy bubble

```feynman
i1 -- [photon, momentum=q] a
a -- [fermion] b
b -- [fermion] a
b -- [photon] f1
```

````markdown
```feynman
i1 -- [photon, momentum=q] a
a -- [fermion] b
b -- [fermion] a
b -- [photon] f1
```
````

## compton

```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```
````

## Dark-photon cascade

```feynman
% ATLAS-CONF-2011-076 Fig. 1, written with defaults only
q1 [q] -- a -- [squark] c
q2 [qbar] -- b -- [squark] d
a -- [gluino] b
c -- qt [q]
c -- [plain, label=\tilde{N}_1] e
e -- fd1 [f_d]
e -- [photon, label=\gamma_d] g
g -- l1 [l+]
g -- l2 [l-]
d -- [plain, label=\tilde{N}_1] f
f -- [photon, label=\gamma_d] h
h -- l3 [l+]
h -- l4 [l-]
f -- fd2 [f_d]
d -- qb [q]
```

````markdown
```feynman
% ATLAS-CONF-2011-076 Fig. 1, written with defaults only
q1 [q] -- a -- [squark] c
q2 [qbar] -- b -- [squark] d
a -- [gluino] b
c -- qt [q]
c -- [plain, label=\tilde{N}_1] e
e -- fd1 [f_d]
e -- [photon, label=\gamma_d] g
g -- l1 [l+]
g -- l2 [l-]
d -- [plain, label=\tilde{N}_1] f
f -- [photon, label=\gamma_d] h
h -- l3 [l+]
h -- l4 [l-]
f -- fd2 [f_d]
d -- qb [q]
```
````

## drell-yan

```feynman
i1 [q] -- a -- i2 [qbar]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

````markdown
```feynman
i1 [q] -- a -- i2 [qbar]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```
````

## gg-ttbar-s

```feynman
i1 [g] -- a
i2 [g] -- a
a -- [gluon, label=g] b
f1 [t] -- b -- f2 [tbar]
```

````markdown
```feynman
i1 [g] -- a
i2 [g] -- a
a -- [gluon, label=g] b
f1 [t] -- b -- f2 [tbar]
```
````

## gg-ttbar

```feynman
i1 [g] -- a
i2 [g] -- b
f1 [tbar] -- [fermion] b -- [fermion] a -- [fermion] f2 [t]
```

````markdown
```feynman
i1 [g] -- a
i2 [g] -- b
f1 [tbar] -- [fermion] b -- [fermion] a -- [fermion] f2 [t]
```
````

## Gluon fusion (triangle)

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

````markdown
```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```
````

## gluon-splitting

```feynman
i1 [q] -- a -- f1 [q]
a -- [gluon, label=g] b
b -- f2 [b]
b -- f3 [bbar]
```

````markdown
```feynman
i1 [q] -- a -- f1 [q]
a -- [gluon, label=g] b
b -- f2 [b]
b -- f3 [bbar]
```
````

## h-zz-4l

```feynman
i1 [H] -- a
a -- [Z*] b
a -- [Z] c
b -- f1 [l+]
b -- f2 [l-]
c -- f3 [l+]
c -- f4 [l-]
```

````markdown
```feynman
i1 [H] -- a
a -- [Z*] b
a -- [Z] c
b -- f1 [l+]
b -- f2 [l-]
c -- f3 [l+]
c -- f4 [l-]
```
````

## Di-Higgs with coupling labels

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion] a
c [dot, label=\kappa_t, color=teal] -- [H] v [dot, label=\kappa_\lambda, color=pink]
v -- f1 [H]
v -- f2 [H]
```

````markdown
```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion] a
c [dot, label=\kappa_t, color=teal] -- [H] v [dot, label=\kappa_\lambda, color=pink]
v -- f1 [H]
v -- f2 [H]
```
````

## Higgs-strahlung

```feynman
i1 [q] -- a -- i2 [qbar']
a -- [W*] b
b -- [W] c
b -- [H] d
c -- f1 [l]
c -- f2 [nubar]
d -- f3 [b]
d -- f4 [bbar]
```

````markdown
```feynman
i1 [q] -- a -- i2 [qbar']
a -- [W*] b
b -- [W] c
b -- [H] d
c -- f1 [l]
c -- f2 [nubar]
d -- f3 [b]
d -- f4 [bbar]
```
````

## lepton-flavour-violation

```feynman
in: i1 i2
out: f1 f2
i1 [mu-] -- a -- f1 [e-]
a -- [Z'] b
i2 [e-] -- b -- f2 [mu-]
```

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [mu-] -- a -- f1 [e-]
a -- [Z'] b
i2 [e-] -- b -- f2 [mu-]
```
````

## Meson decay with hadron ellipses

```feynman
% Bc+ -> J/psi Ds+: a spectator charm quark and a W emitted from the b line
in: c1 b
out: c2 cbar s c3
c1 [c] -- [fermion] c2 [c]
cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
v -- [boson, label=W] w
s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
meson: B_c^+ = c1 b
meson: J/\psi = c2 cbar
meson: D_s^+ = s c3
```

````markdown
```feynman
% Bc+ -> J/psi Ds+: a spectator charm quark and a W emitted from the b line
in: c1 b
out: c2 cbar s c3
c1 [c] -- [fermion] c2 [c]
cbar [\bar{c}] -- [fermion] v -- [fermion] b [\bar{b}]
v -- [boson, label=W] w
s [\bar{s}] -- [fermion] w -- [fermion] c3 [c]
meson: B_c^+ = c1 b
meson: J/\psi = c2 cbar
meson: D_s^+ = s c3
```
````

## A line that changes particle (mixing)

```feynman
% a neutrino turns into a heavy neutral lepton and back: one line, two crosses, three styles
in: w
out: mu1 mu2 e nue
w [W+] -- [boson] v1
mu1 [mu+] -- [fermion] v1
v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
v2 -- [boson, label=W^{+*}] v3
v2 -- [fermion] mu2 [mu-]
e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
```

````markdown
```feynman
% a neutrino turns into a heavy neutral lepton and back: one line, two crosses, three styles
in: w
out: mu1 mu2 e nue
w [W+] -- [boson] v1
mu1 [mu+] -- [fermion] v1
v1 -- [fermion, label'=\nu_\mu] x1 [insertion] -- [scalar, color=red, label=N] x2 [insertion] -- [fermion, label'=\nu_\mu] v2
v2 -- [boson, label=W^{+*}] v3
v2 -- [fermion] mu2 [mu-]
e [e+] -- [fermion] v3 -- [fermion] nue [nu_e]
```
````

## Mono-X with initial-state radiation

```feynman
i1 [q] -- g1 -- a -- i2 [qbar]
g1 -- f0 [g]
a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
b -- f1 [chi]
b -- f2 [chibar]
```

````markdown
```feynman
i1 [q] -- g1 -- a -- i2 [qbar]
g1 -- f0 [g]
a [dot, label=g_q] -- [Z', label=Z'] b [dot, label=g_\chi]
b -- f1 [chi]
b -- f2 [chibar]
```
````

## pair-annihilation

```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a -- b -- i2 [e+]
a -- f1 [gamma]
b -- f2 [gamma]
```

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a -- b -- i2 [e+]
a -- f1 [gamma]
b -- f2 [gamma]
```
````

## Panels

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
--- (b) with a Z
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [mu-] -- b -- f2 [mu+]
--- (c) with a Higgs
i1 [e-] -- a -- i2 [e+]
a -- [H] b
f1 [b] -- b -- f2 [bbar]
```

````markdown
```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
--- (b) with a Z
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [mu-] -- b -- f2 [mu+]
--- (c) with a Higgs
i1 [e-] -- a -- i2 [e+]
a -- [H] b
f1 [b] -- b -- f2 [bbar]
```
````

## Penguin: a loop on the quark line

```feynman
% B0 -> K*0 mu mu: a W loop over the quark line, with the photon leaving the loop
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```

````markdown
```feynman
% B0 -> K*0 mu mu: a W loop over the quark line, with the photon leaving the loop
in: d1 b
out: d2 s mu1 mu2
d1 [d] -- [fermion] d2 [d]
s [\bar{s}] -- [fermion] l2 -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] b [\bar{b}]
l1 -- [boson, label=W^-] x -- [boson] l2
x -- [photon, label={\gamma, Z^0}] v
v -- [fermion] mu1 [\mu^-]
mu2 [\mu^+] -- [fermion] v
hadron: B^0 = d1 b [brace]
hadron: K^{*0} = d2 s [brace]
```
````

## Photon fusion with a proton remnant

```feynman
i1 [p] -- a [dot] -- f1 [p*]
i2 [p] -- b -- f3 [p]
a -- [gamma] c -- [gamma] b
c -- [scalar, label=a] d
d -- f2 [gamma]
d -- f4 [gamma]
```

````markdown
```feynman
i1 [p] -- a [dot] -- f1 [p*]
i2 [p] -- b -- f3 [p]
a -- [gamma] c -- [gamma] b
c -- [scalar, label=a] d
d -- f2 [gamma]
d -- f4 [gamma]
```
````

## s-channel

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

````markdown
```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```
````

## single-top-tw

```feynman
in: i1 i2
out: f2 f1
i1 [g] -- a
i2 [b] -- b -- [fermion, label=t] a
b -- [boson] f1 [W-]
a -- f2 [t]
```

````markdown
```feynman
in: i1 i2
out: f2 f1
i1 [g] -- a
i2 [b] -- b -- [fermion, label=t] a
b -- [boson] f1 [W-]
a -- f2 [t]
```
````

## slepton-pair

```feynman
i1 [q] -- a -- i2 [qbar]
a -- [gamma] b
b -- [slepton] c
b -- [slepton] d
c -- f1 [l]
c -- f2 [neutralino]
d -- f3 [l]
d -- f4 [neutralino]
```

````markdown
```feynman
i1 [q] -- a -- i2 [qbar]
a -- [gamma] b
b -- [slepton] c
b -- [slepton] d
c -- f1 [l]
c -- f2 [neutralino]
d -- f3 [l]
d -- f4 [neutralino]
```
````

## squark-gluino

```feynman
in: i1 i2
out: f1 f2
i1 [q] -- a -- f1 [squark]
i2 [g] -- b
a -- [gluino] b
b -- f2 [gluino]
```

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [q] -- a -- f1 [squark]
i2 [g] -- b
a -- [gluino] b
b -- f2 [gluino]
```
````

## Four-stage SUSY cascade

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [chargino] e1
e1 -- f3 [W]
e1 -- [neutralino2] g1
g1 -- f4 [Z]
g1 -- f5 [neutralino1]
d2 -- [chargino] e2
e2 -- [neutralino2] g2
e2 -- f6 [W]
g2 -- f7 [neutralino1]
g2 -- f8 [Z]
d2 -- f9 [q]
d2 -- f10 [q]
```

````markdown
```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [chargino] e1
e1 -- f3 [W]
e1 -- [neutralino2] g1
g1 -- f4 [Z]
g1 -- f5 [neutralino1]
d2 -- [chargino] e2
e2 -- [neutralino2] g2
e2 -- f6 [W]
g2 -- f7 [neutralino1]
g2 -- f8 [Z]
d2 -- f9 [q]
d2 -- f10 [q]
```
````

## SUSY cascade

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [neutralino2] e1
e1 -- f3 [Z]
e1 -- f4 [neutralino1]
d2 -- [neutralino2] e2
e2 -- f5 [neutralino1]
e2 -- f6 [Z]
d2 -- f7 [q]
d2 -- f8 [q]
```

````markdown
```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] d1
pp -- [gluino] d2
d1 -- f1 [q]
d1 -- f2 [q]
d1 -- [neutralino2] e1
e1 -- f3 [Z]
e1 -- f4 [neutralino1]
d2 -- [neutralino2] e2
e2 -- f5 [neutralino1]
e2 -- f6 [Z]
d2 -- f7 [q]
d2 -- f8 [q]
```
````

## Quark exchanged between two gluons

```feynman
% gg -> t tbar H: the top quark is exchanged between the two gluons and radiates the Higgs
i1 [g] -- a
i2 [g] -- b
f1 [tbar] -- [fermion] b -- [fermion, label=t] m -- [fermion] a -- [fermion] f2 [t]
m -- [H] h
h -- f3 [b]
h -- f4 [bbar]
```

````markdown
```feynman
% gg -> t tbar H: the top quark is exchanged between the two gluons and radiates the Higgs
i1 [g] -- a
i2 [g] -- b
f1 [tbar] -- [fermion] b -- [fermion, label=t] m -- [fermion] a -- [fermion] f2 [t]
m -- [H] h
h -- f3 [b]
h -- f4 [bbar]
```
````

## t-channel

```feynman
i1 [q] -- a -- f1 [q']
i2 [b] -- b -- f2 [t]
a -- [W] b
```

````markdown
```feynman
i1 [q] -- a -- f1 [q']
i2 [b] -- b -- f2 [t]
a -- [W] b
```
````

## top-decay

```feynman
i1 [t] -- a
a -- [boson, label=W^+] b
a -- f1 [b]
b -- f2 [l+]
b -- f3 [nu]
```

````markdown
```feynman
i1 [t] -- a
a -- [boson, label=W^+] b
a -- f1 [b]
b -- f2 [l+]
b -- f3 [nu]
```
````

## u-channel (crossed final states)

```feynman
% listing the outgoing legs in swapped order crosses the lines
in: i1 i2
out: f2 f1
i1 [qbar'] -- a -- f1 [Z]
i2 [q] -- b -- f2 [W]
b -- [fermion, label=q'] a
```

````markdown
```feynman
% listing the outgoing legs in swapped order crosses the lines
in: i1 i2
out: f2 f1
i1 [qbar'] -- a -- f1 [Z]
i2 [q] -- b -- f2 [W]
b -- [fermion, label=q'] a
```
````

## vacuum-polarisation

```feynman
i1 [gamma] -- a
a -- [fermion, half left] b
b -- [fermion, half left] a
b -- f1 [gamma]
```

````markdown
```feynman
i1 [gamma] -- a
a -- [fermion, half left] b
b -- [fermion, half left] a
b -- f1 [gamma]
```
````

## Vector-boson fusion

```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```

````markdown
```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```
````

## vertex-correction

```feynman
% a photon vertex with a photon loop around it
in: i1 i2
out: f1
i1 [e-] -- a -- c -- d -- f1 [e-]
a -- [photon, half left] d
i2 [gamma] -- c
```

````markdown
```feynman
% a photon vertex with a photon loop around it
in: i1 i2
out: f1
i1 [e-] -- a -- c -- d -- f1 [e-]
a -- [photon, half left] d
i2 [gamma] -- c
```
````

## ww-scattering

```feynman
in: i1 i2
out: f1 f2 f3 f4
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W+] c
b -- [W+] c
c -- [Z] d
d -- f3 [l+]
d -- f4 [l-]
```

````markdown
```feynman
in: i1 i2
out: f1 f2 f3 f4
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f2 [q]
a -- [W+] c
b -- [W+] c
c -- [Z] d
d -- f3 [l+]
d -- f4 [l-]
```
````

## z-to-bb

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [b] -- b -- f2 [bbar]
b -- [gluon] c
c -- f3 [g]
```

````markdown
```feynman
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [b] -- b -- f2 [bbar]
b -- [gluon] c
c -- f3 [g]
```
````
