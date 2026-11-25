---
hide:
  - navigation
  - toc
tags:
  - particle names
  - Standard Model
  - interactions
  - mesons
  - SUSY
  - nuclei
  - detector objects
---

# Tour

From the fundamental particles to what a detector sees. Every figure is drawn live by feynjs; the
code under a line is the name that draws it. [All particles and line types](../reference/particles.md)
lists every name.

<div class="feynjs-tour" markdown>

## The Standard Model

<div class="tour-table"><span></span><span class="tour-head">I</span><span class="tour-head">II</span><span class="tour-head">III</span><span class="tour-head tour-sep">gauge bosons</span><span class="tour-head">scalar</span><span class="tour-row">up-type quarks</span><figure><div class="feynman">a -- [u] b</div><figcaption><code>u</code></figcaption></figure><figure><div class="feynman">a -- [c] b</div><figcaption><code>c</code></figcaption></figure><figure><div class="feynman">a -- [t] b</div><figcaption><code>t</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [g] b</div><figcaption><code>g</code></figcaption></figure><figure class="tour-tall"><div class="feynman">a -- [H] b</div><figcaption><code>H</code></figcaption></figure><span class="tour-row">down-type quarks</span><figure><div class="feynman">a -- [d] b</div><figcaption><code>d</code></figcaption></figure><figure><div class="feynman">a -- [s] b</div><figcaption><code>s</code></figcaption></figure><figure><div class="feynman">a -- [b] b</div><figcaption><code>b</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [gamma] b</div><figcaption><code>gamma</code></figcaption></figure><span class="tour-row">charged leptons</span><figure><div class="feynman">a -- [e-] b</div><figcaption><code>e-</code></figcaption></figure><figure><div class="feynman">a -- [mu-] b</div><figcaption><code>mu-</code></figcaption></figure><figure><div class="feynman">a -- [tau-] b</div><figcaption><code>tau-</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [Z] b</div><figcaption><code>Z</code></figcaption></figure><span class="tour-row">neutrinos</span><figure><div class="feynman">a -- [ve] b</div><figcaption><code>ve</code></figcaption></figure><figure><div class="feynman">a -- [vm] b</div><figcaption><code>vm</code></figcaption></figure><figure><div class="feynman">a -- [vt] b</div><figcaption><code>vt</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [W+] b</div><figcaption><code>W+</code></figcaption></figure></div>

## Interactions

Every vertex of the Standard Model, by force and by how many bosons meet, with its coupling. The
photon and the Z mix the U(1)<sub>Y</sub> and SU(2)<sub>L</sub> fields, so the electroweak rows are
drawn after symmetry breaking.

<div class="tour-forces"><span></span><span class="tour-head">two fermions and a boson</span><span class="tour-head">three bosons</span><span class="tour-head">four bosons</span><span class="tour-row"><b>Electromagnetic</b><span>U(1)<sub>EM</sub></span></span><div><figure><div class="feynman">v [dot, label=eQ_f]
i1 [gamma] -- v
v -- [fermion] f1 [f]
v -- [anti fermion] f2 [\bar f]</div><figcaption><span>f f̄ γ</span></figcaption></figure></div><div></div><div></div><span class="tour-row"><b>Weak</b><span>SU(2)<sub>L</sub> × U(1)<sub>Y</sub></span></span><div><figure><div class="feynman">v [dot, label=g/2c_W]
i1 [Z] -- v
v -- [fermion] f1 [f]
v -- [anti fermion] f2 [\bar f]</div><figcaption><span>f f̄ Z</span></figcaption></figure><figure><div class="feynman">v [dot, label={V_{ud}\,g/\sqrt2}]
i1 [W+] -- v
v -- f1 [u]
v -- f2 [dbar]</div><figcaption><span>u d̄ W</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=e]
i1 [gamma] -- v
v -- f1 [W+]
v -- f2 [W-]</div><figcaption><span>γ W W</span></figcaption></figure><figure><div class="feynman">v [dot, label=g c_W]
i1 [Z] -- v
v -- f1 [W+]
v -- f2 [W-]</div><figcaption><span>Z W W</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=g^2]
i1 [W+] -- v
i2 [W-] -- v
v -- f1 [W+]
v -- f2 [W-]</div><figcaption><span>W W W W</span></figcaption></figure><figure><div class="feynman">v [dot, label=g^2c_W^2]
i1 [W+] -- v
i2 [W-] -- v
v -- f1 [Z]
v -- f2 [Z]</div><figcaption><span>W W Z Z</span></figcaption></figure><figure><div class="feynman">v [dot, label=e^2]
i1 [W+] -- v
i2 [W-] -- v
v -- f1 [gamma]
v -- f2 [gamma]</div><figcaption><span>W W γ γ</span></figcaption></figure></div><span class="tour-row"><b>Strong</b><span>SU(3)<sub>c</sub></span></span><div><figure><div class="feynman">v [dot, label=g_s T^a]
i1 [g] -- v
v -- f1 [q]
v -- f2 [qbar]</div><figcaption><span>q q̄ g</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=g_s f^{abc}]
i1 [g] -- v
v -- f1 [g]
v -- f2 [g]</div><figcaption><span>g g g</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=g_s^2]
i1 [g] -- v
i2 [g] -- v
v -- f1 [g]
v -- f2 [g]</div><figcaption><span>g g g g</span></figcaption></figure></div><span class="tour-row"><b>Higgs</b><span>after symmetry breaking</span></span><div><figure><div class="feynman">v [dot, label=y_f/\sqrt2]
i1 [H] -- v
v -- [fermion] f1 [f]
v -- [anti fermion] f2 [\bar f]</div><figcaption><span>h f f̄</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=2m_W^2/v]
i1 [H] -- v
v -- f1 [W+]
v -- f2 [W-]</div><figcaption><span>h W W</span></figcaption></figure><figure><div class="feynman">v [dot, label=2m_Z^2/v]
i1 [H] -- v
v -- f1 [Z]
v -- f2 [Z]</div><figcaption><span>h Z Z</span></figcaption></figure><figure><div class="feynman">v [dot, label=6\lambda v]
i1 [H] -- v
v -- f1 [H]
v -- f2 [H]</div><figcaption><span>h h h</span></figcaption></figure></div><div><figure><div class="feynman">v [dot, label=2m_W^2/v^2]
i1 [H] -- v
i2 [H] -- v
v -- f1 [W+]
v -- f2 [W-]</div><figcaption><span>h h W W</span></figcaption></figure><figure><div class="feynman">v [dot, label=6\lambda]
i1 [H] -- v
i2 [H] -- v
v -- f1 [H]
v -- f2 [H]</div><figcaption><span>h h h h</span></figcaption></figure></div></div>

## Mesons

The light pseudoscalar mesons, each drawn as it decays, with its quark lines and its hadrons
braced: strangeness down the rows, isospin across.

<div class="tour-multiplet tour-decays"><figure><div class="feynman">in: iQ iS
out: fx fy fS fQ
iQ [\bar{s}]
iS [d]
fQ [\bar{u}]
fS [d]
fx [u]
fy [\bar{d}]
v -- [fermion] iQ
fQ -- [fermion] v
iS -- [fermion] fS
v -- [boson, label=W^+] w
w -- [fermion] fx
fy -- [fermion] w
meson: K^0 = iQ iS [brace]
meson: \pi^+ = fx fy [brace]
meson: \pi^- = fS fQ [brace]</div><figcaption><b>K⁰ → π⁺ π⁻</b><span>tree</span></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">in: iQ iS
out: fl fn
iQ [u]
iS [\bar{s}]
iQ -- [fermion] v
v -- [fermion] iS
v -- [boson, label=W^+] w
w -- fl [mu+]
w -- fn [vm]
meson: K^+ = iQ iS [brace]</div><figcaption><b>K⁺ → μ⁺ ν<sub>μ</sub></b><span>annihilation through a W</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fl fn
iQ [d]
iS [\bar{u}]
iQ -- [fermion] v
v -- [fermion] iS
v -- [boson, label=W^-] w
w -- fl [mu-]
w -- fn [vm~]
meson: \pi^- = iQ iS [brace]</div><figcaption><b>π⁻ → μ⁻ ν̄<sub>μ</sub></b><span>annihilation through a W</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: f1 f2
iQ [u]
iS [\bar{u}]
iQ -- [fermion] a -- [fermion, label=u] b -- [fermion] iS
a -- f1 [gamma]
b -- f2 [gamma]
meson: \pi^0 = iQ iS [brace]</div><figcaption><b>π⁰ → γ γ</b><span>annihilation to two photons</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fl fn
iQ [u]
iS [\bar{d}]
iQ -- [fermion] v
v -- [fermion] iS
v -- [boson, label=W^+] w
w -- fl [mu+]
w -- fn [vm]
meson: \pi^+ = iQ iS [brace]</div><figcaption><b>π⁺ → μ⁺ ν<sub>μ</sub></b><span>annihilation through a W</span></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">in: iQ iS
out: f1 f2
iQ [u]
iS [\bar{u}]
iQ -- [fermion] a -- [fermion, label=u] b -- [fermion] iS
a -- f1 [gamma]
b -- f2 [gamma]
meson: \eta = iQ iS [brace]</div><figcaption><b>η → γ γ</b><span>annihilation to two photons, through its u ū part</span></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">in: iQ iS
out: fl fn
iQ [s]
iS [\bar{u}]
iQ -- [fermion] v
v -- [fermion] iS
v -- [boson, label=W^-] w
w -- fl [mu-]
w -- fn [vm~]
meson: K^- = iQ iS [brace]</div><figcaption><b>K⁻ → μ⁻ ν̄<sub>μ</sub></b><span>annihilation through a W</span></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">in: iQ iS
out: fx fy fQ fS
iQ [s]
iS [\bar{d}]
fQ [u]
fS [\bar{d}]
fx [d]
fy [\bar{u}]
iQ -- [fermion] v
v -- [fermion] fQ
fS -- [fermion] iS
v -- [boson, label=W^-] w
w -- [fermion] fx
fy -- [fermion] w
meson: \bar K^0 = iQ iS [brace]
meson: \pi^+ = fQ fS [brace]
meson: \pi^- = fx fy [brace]</div><figcaption><b>K̄⁰ → π⁺ π⁻</b><span>tree</span></figcaption></figure></div>

### Heavier mesons

The shapes B physics uses: tree, colour-suppressed, penguin, annihilation and semileptonic decays.

<div class="tour-flow tour-decays"><figure><div class="feynman">in: iQ iS
out: fy fq fqb fx
iQ [u]
iS [\bar{u}]
fq [u]
fqb [\bar{u}]
fx [d]
fy [\bar{d}]
iQ -- [fermion] g -- [fermion] fq
fqb -- [fermion] iS
g -- [gluon] p
p -- [fermion] fx
fy -- [fermion] p
meson: \rho^0 = iQ iS [brace]
meson: \pi^+ = fy fq [brace]
meson: \pi^- = fqb fx [brace]</div><figcaption><b>ρ⁰ → π⁺ π⁻</b><span>strong: a quark pair from the vacuum</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fy fq fqb fx
iQ [s]
iS [\bar{s}]
fq [s]
fqb [\bar{s}]
fx [u]
fy [\bar{u}]
iQ -- [fermion] g -- [fermion] fq
fqb -- [fermion] iS
g -- [gluon] p
p -- [fermion] fx
fy -- [fermion] p
meson: \phi(1020) = iQ iS [brace]
meson: K^+ = fqb fx [brace]
meson: K^- = fy fq [brace]</div><figcaption><b>φ → K⁺ K⁻</b><span>strong: a quark pair from the vacuum</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fl fn
iQ [c]
iS [\bar{c}]
iQ -- [fermion] v
v -- [fermion] iS
v -- [photon, label=\gamma^*] w
w -- fl [mu+]
w -- fn [mu-]
meson: J/\psi = iQ iS [brace]</div><figcaption><b>J/ψ → μ⁺ μ⁻</b><span>annihilation through a virtual photon</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fy fQ fS
iQ [c]
iS [\bar{u}]
fQ [s]
fS [\bar{u}]
fx [u]
fy [\bar{d}]
iQ -- [fermion] v
v -- [fermion] fQ
fS -- [fermion] iS
v -- [boson, label=W^+] w
w -- [fermion] fx
fy -- [fermion] w
meson: D^0 = iQ iS [brace]
meson: K^- = fQ fS [brace]
meson: \pi^+ = fx fy [brace]</div><figcaption><b>D⁰ → K⁻ π⁺</b><span>tree</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fy fQ fS
iQ [c]
iS [\bar{s}]
fQ [s]
fS [\bar{s}]
fx [u]
fy [\bar{d}]
iQ -- [fermion] v
v -- [fermion] fQ
fS -- [fermion] iS
v -- [boson, label=W^+] w
w -- [fermion] fx
fy -- [fermion] w
meson: D_s^+ = iQ iS [brace]
meson: \phi(1020) = fQ fS [brace]
meson: \pi^+ = fx fy [brace]</div><figcaption><b>D<sub>s</sub>⁺ → φ π⁺</b><span>tree</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fy fQ fS
iQ [b]
iS [\bar{d}]
fQ [c]
fS [\bar{d}]
fx [d]
fy [\bar{u}]
iQ -- [fermion] v
v -- [fermion] fQ
fS -- [fermion] iS
v -- [boson, label=W^-] w
w -- [fermion] fx
fy -- [fermion] w
meson: \bar B^0 = iQ iS [brace]
meson: D^+ = fQ fS [brace]
meson: \pi^- = fx fy [brace]</div><figcaption><b>B̄⁰ → D⁺ π⁻</b><span>tree</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fy fQ fS
iQ [\bar{b}]
iS [u]
fQ [\bar{c}]
fS [u]
fx [u]
fy [\bar{d}]
v -- [fermion] iQ
fQ -- [fermion] v
iS -- [fermion] fS
v -- [boson, label=W^+] w
w -- [fermion] fx
fy -- [fermion] w
meson: B^+ = iQ iS [brace]
meson: \bar D^0 = fQ fS [brace]
meson: \pi^+ = fx fy [brace]</div><figcaption><b>B⁺ → D̄⁰ π⁺</b><span>tree</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fQ fS fy
iQ [\bar{b}]
iS [u]
fQ [\bar{c}]
fS [u]
fx [c]
fy [\bar{s}]
v -- [fermion] iQ
fQ -- [fermion] v
iS -- [fermion] fS
v -- [boson, label=W^+] w
w -- [fermion] fx
fy -- [fermion] w
meson: B^+ = iQ iS [brace]
meson: J/\psi = fx fQ [brace]
meson: K^+ = fS fy [brace]</div><figcaption><b>B⁺ → J/ψ K⁺</b><span>colour-suppressed</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fx fQ fS fy
iQ [\bar{b}]
iS [u]
fQ [\bar{s}]
fS [u]
fx [s]
fy [\bar{s}]
fQ -- [fermion] l2 -- [fermion] x -- [fermion, label={\bar{u}, \bar{c}, \bar{t}}] l1 -- [fermion] iQ
iS -- [fermion] fS
l1 -- [boson, label=W^+] l2
x -- [gluon] p
p -- [fermion] fx
fy -- [fermion] p
meson: B^+ = iQ iS [brace]
meson: \phi(1020) = fx fQ [brace]
meson: K^+ = fS fy [brace]</div><figcaption><b>B⁺ → φ K⁺</b><span>penguin</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: fl fn fQ fS
iQ [b]
iS [\bar{d}]
fQ [c]
fS [\bar{d}]
iQ -- [fermion] v
v -- [fermion] fQ
fS -- [fermion] iS
v -- [boson, label=W^-] w
w -- fl [e-]
w -- fn [ve~]
meson: \bar B^0 = iQ iS [brace]
meson: D^+ = fQ fS [brace]</div><figcaption><b>B̄⁰ → D⁺ e⁻ ν̄<sub>e</sub></b><span>semileptonic</span></figcaption></figure></div>

### The OZI rule

The φ is mostly s s̄ and decays mostly to two kaons, though three pions would leave far more
energy to spare: its quark lines run straight through into the kaons. To make pions, the s and s̄
must annihilate and every quark be made anew from gluons, a disconnected diagram the
Okubo–Zweig–Iizuka rule suppresses. It is why the J/ψ lives so long.

<div class="tour-flow tour-decays"><figure><div class="feynman">in: iQ iS
out: fy fq fqb fx
iQ [s]
iS [\bar{s}]
fq [s]
fqb [\bar{s}]
fx [u]
fy [\bar{u}]
iQ -- [fermion] g -- [fermion] fq
fqb -- [fermion] iS
g -- [gluon] p
p -- [fermion] fx
fy -- [fermion] p
meson: \phi(1020) = iQ iS [brace]
meson: K^+ = fqb fx [brace]
meson: K^- = fy fq [brace]</div><figcaption><b>φ → K⁺ K⁻</b><span>strong: a quark pair from the vacuum</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: q1 b2 q3 b1 q2 b3
iQ [s]
iS [\bar{s}]
q1 [u]
b1 [\bar{u}]
q2 [d]
b2 [\bar{d}]
q3 [u]
b3 [\bar{u}]
iQ -- [fermion] a1
a1 -- [fermion] a2
a2 -- [fermion] a3
a3 -- [fermion] iS
a1 -- [gluon] p1
p1 -- [fermion] q1
b1 -- [fermion] p1
a2 -- [gluon] p2
p2 -- [fermion] q2
b2 -- [fermion] p2
a3 -- [gluon] p3
p3 -- [fermion] q3
b3 -- [fermion] p3
meson: \phi(1020) = iQ iS [brace]
meson: \pi^+ = q1 b2 [brace]
meson: \pi^- = q2 b3 [brace]
meson: \pi^0 = q3 b1 [brace]</div><figcaption><b>φ → π⁺ π⁻ π⁰</b><span>OZI-suppressed: through three gluons</span></figcaption></figure><figure><div class="feynman">in: iQ iS
out: q1 b2 q3 b1 q2 b3
iQ [c]
iS [\bar{c}]
q1 [u]
b1 [\bar{u}]
q2 [d]
b2 [\bar{d}]
q3 [u]
b3 [\bar{u}]
iQ -- [fermion] a1
a1 -- [fermion] a2
a2 -- [fermion] a3
a3 -- [fermion] iS
a1 -- [gluon] p1
p1 -- [fermion] q1
b1 -- [fermion] p1
a2 -- [gluon] p2
p2 -- [fermion] q2
b2 -- [fermion] p2
a3 -- [gluon] p3
p3 -- [fermion] q3
b3 -- [fermion] p3
meson: J/\psi = iQ iS [brace]
meson: \pi^+ = q1 b2 [brace]
meson: \pi^- = q2 b3 [brace]
meson: \pi^0 = q3 b1 [brace]</div><figcaption><b>J/ψ → π⁺ π⁻ π⁰</b><span>OZI-suppressed: through three gluons</span></figcaption></figure></div>

## Baryons

The baryon octet: strangeness down the rows, isospin across.

<div class="tour-multiplet tour-small"><figure><div class="feynman">a -- [n] b</div><figcaption><code>n</code></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">a -- [p] b</div><figcaption><code>p</code></figcaption></figure><figure><div class="feynman">a -- [Sigma-] b</div><figcaption><code>Sigma-</code></figcaption></figure><figure><div class="feynman">a -- [Sigma0] b</div><figcaption><code>Sigma0</code></figcaption></figure><figure><div class="feynman">a -- [Sigma+] b</div><figcaption><code>Sigma+</code></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">a -- [Lambda] b</div><figcaption><code>Lambda</code></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">a -- [Xi-] b</div><figcaption><code>Xi-</code></figcaption></figure><figure class="tour-gap"></figure><figure><div class="feynman">a -- [Xi0] b</div><figcaption><code>Xi0</code></figcaption></figure></div>

## Superpartners

The Standard Model's mirror, in MadGraph's MSSM names; each also has a long name (`gluino`,
`neutralino1`, `chargino1+`, `stop1`).

<div class="tour-table"><span></span><span class="tour-head">I</span><span class="tour-head">II</span><span class="tour-head">III</span><span class="tour-head tour-sep">gauginos</span><span class="tour-head">higgsino</span><span class="tour-row">up-type squarks</span><figure><div class="feynman">a -- [ul] b</div><figcaption><code>ul</code></figcaption></figure><figure><div class="feynman">a -- [cl] b</div><figcaption><code>cl</code></figcaption></figure><figure><div class="feynman">a -- [t1] b</div><figcaption><code>t1</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [go] b</div><figcaption><code>go</code><span>gluino</span></figcaption></figure><figure class="tour-tall"><div class="feynman">a -- [higgsino] b</div><figcaption><code>higgsino</code></figcaption></figure><span class="tour-row">down-type squarks</span><figure><div class="feynman">a -- [dl] b</div><figcaption><code>dl</code></figcaption></figure><figure><div class="feynman">a -- [sl] b</div><figcaption><code>sl</code></figcaption></figure><figure><div class="feynman">a -- [b1] b</div><figcaption><code>b1</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [n1] b</div><figcaption><code>n1</code><span>neutralino1</span></figcaption></figure><span class="tour-row">charged sleptons</span><figure><div class="feynman">a -- [el-] b</div><figcaption><code>el-</code></figcaption></figure><figure><div class="feynman">a -- [mul-] b</div><figcaption><code>mul-</code></figcaption></figure><figure><div class="feynman">a -- [ta1-] b</div><figcaption><code>ta1-</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [n2] b</div><figcaption><code>n2</code><span>neutralino2</span></figcaption></figure><span class="tour-row">sneutrinos</span><figure><div class="feynman">a -- [sve] b</div><figcaption><code>sve</code></figcaption></figure><figure><div class="feynman">a -- [svm] b</div><figcaption><code>svm</code></figcaption></figure><figure><div class="feynman">a -- [svt] b</div><figcaption><code>svt</code></figcaption></figure><figure class="tour-sep"><div class="feynman">a -- [x1+] b</div><figcaption><code>x1+</code><span>chargino1+</span></figcaption></figure></div>

### Other new particles

<div class="tour-flow"><figure><div class="feynman">a -- [Z&#x27;] b</div><figcaption><code>Z&#x27;</code></figcaption></figure><figure><div class="feynman">a -- [W&#x27;] b</div><figcaption><code>W&#x27;</code></figcaption></figure><figure><div class="feynman">a -- [LQ] b</div><figcaption><code>LQ</code></figcaption></figure><figure><div class="feynman">a -- [N] b</div><figcaption><code>N</code></figcaption></figure><figure><div class="feynman">a -- [chi] b</div><figcaption><code>chi</code></figcaption></figure><figure><div class="feynman">a -- [gravitino] b</div><figcaption><code>gravitino</code></figcaption></figure></div>

## Nuclei

Each drawn as its protons and neutrons, every nucleon the same size: `a [nucleus=Pb]`.

<div class="tour-nuclei"><figure><div class="feynman">a [nucleus=H]</div><figcaption><code>H</code></figcaption></figure><figure><div class="feynman">a [nucleus=2H]</div><figcaption><code>2H</code></figcaption></figure><figure><div class="feynman">a [nucleus=He]</div><figcaption><code>He</code></figcaption></figure><figure><div class="feynman">a [nucleus=Li]</div><figcaption><code>Li</code></figcaption></figure><figure><div class="feynman">a [nucleus=C]</div><figcaption><code>C</code></figcaption></figure><figure><div class="feynman">a [nucleus=O]</div><figcaption><code>O</code></figcaption></figure><figure><div class="feynman">a [nucleus=Ne]</div><figcaption><code>Ne</code></figcaption></figure><figure><div class="feynman">a [nucleus=Ar]</div><figcaption><code>Ar</code></figcaption></figure><figure><div class="feynman">a [nucleus=Cu]</div><figcaption><code>Cu</code></figcaption></figure><figure><div class="feynman">a [nucleus=Kr]</div><figcaption><code>Kr</code></figcaption></figure><figure><div class="feynman">a [nucleus=Xe]</div><figcaption><code>Xe</code></figcaption></figure><figure><div class="feynman">a [nucleus=Au]</div><figcaption><code>Au</code></figcaption></figure><figure><div class="feynman">a [nucleus=Pb]</div><figcaption><code>Pb</code></figcaption></figure><figure><div class="feynman">a [nucleus=U]</div><figcaption><code>U</code></figcaption></figure></div>

## Detector objects

What an analysis selects, by signature.

<div class="tour-flow"><span class="tour-label">prompt</span><figure><div class="feynman">a -- f [e-]</div><figcaption><code>e-</code></figcaption></figure><figure><div class="feynman">a -- f [mu-]</div><figcaption><code>mu-</code></figcaption></figure><figure><div class="feynman">a -- f [tauh]</div><figcaption><code>tauh</code></figcaption></figure><figure><div class="feynman">a -- f [gamma]</div><figcaption><code>gamma</code></figcaption></figure><figure><div class="feynman">a -- f [j]</div><figcaption><code>j</code></figcaption></figure><figure><div class="feynman">a -- f [bjet]</div><figcaption><code>bjet</code></figcaption></figure><figure><div class="feynman">a -- f [J]</div><figcaption><code>J</code></figcaption></figure><figure><div class="feynman">a -- f [Jt]</div><figcaption><code>Jt</code></figcaption></figure></div><div class="tour-flow"><span class="tour-label">invisible</span><figure><div class="feynman">a -- f [met]</div><figcaption><code>met</code></figcaption></figure></div><div class="tour-flow"><span class="tour-label">long-lived and exotic</span><figure><div class="feynman">a -- f [dislep]</div><figcaption><code>dislep</code></figcaption></figure><figure><div class="feynman">a -- f [dj]</div><figcaption><code>dj</code></figcaption></figure><figure><div class="feynman">a -- f [ej]</div><figcaption><code>ej</code></figcaption></figure><figure><div class="feynman">a -- f [svj]</div><figcaption><code>svj</code></figcaption></figure><figure><div class="feynman">a -- f [dt]</div><figcaption><code>dt</code></figcaption></figure><figure><div class="feynman">a -- f [hscp]</div><figcaption><code>hscp</code></figcaption></figure><figure><div class="feynman">a -- f [ljet]</div><figcaption><code>ljet</code></figcaption></figure></div>

### Inside a large-R jet

A large-R jet holds what it is made of: `[LRJ 1b W(2j)]` is a b-tagged subjet and a W decaying
to two quarks inside it, a hadronic top.

<div class="tour-flow tour-jets"><figure><div class="feynman">a -- [LRJ] f [J]</div><figcaption><code>LRJ</code><span>a large-R jet</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 2j] f [J]</div><figcaption><code>LRJ 2j</code><span>W or Z to two quarks</span></figcaption></figure><figure><div class="feynman">a -- [LRJ Z(2j)] f [J]</div><figcaption><code>LRJ Z(2j)</code><span>the Z named</span></figcaption></figure><figure><div class="feynman">a -- [LRJ H(2b)] f [J]</div><figcaption><code>LRJ H(2b)</code><span>H to b b̄</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 3j] f [J]</div><figcaption><code>LRJ 3j</code><span>three prongs</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 1b W(2j)] f [J]</div><figcaption><code>LRJ 1b W(2j)</code><span>a hadronic top</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 1b W(1mu 1nu)] f [J]</div><figcaption><code>LRJ 1b W(1mu 1nu)</code><span>a semileptonic top</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 4j] f [J]</div><figcaption><code>LRJ 4j</code><span>four prongs</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 2tau] f [J]</div><figcaption><code>LRJ 2tau</code><span>boosted di-tau</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 1j 1e] f [J]</div><figcaption><code>LRJ 1j 1e</code><span>an electron inside</span></figcaption></figure><figure><div class="feynman">a -- [LRJ 2mu] f [J]</div><figcaption><code>LRJ 2mu</code><span>two muons</span></figcaption></figure><figure><div class="feynman">a -- [DIS LRJ 2j] f [J]</div><figcaption><code>DIS LRJ 2j</code><span>displaced</span></figcaption></figure></div>

</div>
