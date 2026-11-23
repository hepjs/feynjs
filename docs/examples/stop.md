---
tags:
  - top squark
  - squark
  - SUSY
  - supersymmetry
  - neutralino
  - chargino
  - RPV
  - LHC
---

# Stop production, step by step

***Stop pairs at the LHC and the ways a stop decays: to a top or a charm quark, through a chargino or the second neutralino, or without R-parity.***

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label'={\tilde{t}^*}] s2
s1 -- a1 [t]
s1 -- a2 [neutralino1]
s2 -- b1 [neutralino1]
s2 -- [anti fermion] b2 [\bar{t}]
```

```text
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label'={\tilde{t}^*}] s2
s1 -- a1 [t]
s1 -- a2 [neutralino1]
s2 -- b1 [neutralino1]
s2 -- [anti fermion] b2 [\bar{t}]
```

The stop ($\tilde t$) is the supersymmetric partner of the top quark. This page builds up how it is made at the LHC and every common way it decays, one diagram at a time. Each diagram is laid out automatically from a few lines of source; open any block to see it.

[Watch the diagrams grow one step in time at a time](stop-steps.html){ .md-button }

## 1. Making a pair of stops

At the LHC two protons collide. Stops carry colour, so they are made in pairs, a stop and an anti-stop, by the strong force. Drawn at the level of the protons, the details of the collision hide inside a blob:

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label={\tilde{t}^*}] s2
s1 -- [hidden] e1
s2 -- [hidden] e2
```

Inside the protons it is mostly gluons that make the pair. Two gluons can fuse into one, which then splits into the stop and anti-stop:

```feynman
in: g1 g2
out: t1 t2
g1 [g] -- a
g2 [g] -- a
a -- [gluon, label=g] b
b -- t1 [stop]
b -- [stop, no label] t2 [\tilde{t}^*]
```

or the two gluons can trade a stop between them:

```feynman
in: g1 g2
out: t1 t2
g1 [g] -- a
g2 [g] -- b
a -- [stop] b
a -- t1 [stop]
b -- [stop, no label] t2 [\tilde{t}^*]
```

## 2. How a single stop decays

What a stop turns into depends on how heavy it is compared with the particles it can decay into. The lightest neutralino ($\tilde\chi^0_1$) is stable and escapes the detector unseen, which is why these searches look for missing momentum.

**Heavy enough for a real top.** The simplest decay: a top quark and the lightest neutralino.

```feynman
in: s
out: t n
s [stop] -- v
v -- t [t]
v -- n [neutralino1]
```

**Too light for a real top.** The top is only virtual ($t^*$) and immediately gives a $b$ quark and a $W$ boson: a three-body decay.

```feynman
in: s
out: b w n
s [stop] -- v
v -- [fermion, label={t^*}] u
v -- n [neutralino1]
u -- b [b]
u -- w [W]
```

**Lighter still.** Now the $W$ is virtual too and gives two fermions: a four-body decay.

```feynman
in: s
out: b f1 f2 n
s [stop] -- v
v -- [fermion, label={t^*}] u
v -- n [neutralino1]
u -- b [b]
u -- [boson, label={W^*}] w
w -- f1 [f]
w -- [anti fermion] f2 [\bar{f}']
```

**When almost nothing is open,** the stop can change flavour and decay to a charm quark.

```feynman
in: s
out: c n
s [stop] -- v
v -- c [c]
v -- n [neutralino1]
```

**Through a chargino.** If a chargino ($\tilde\chi^\pm_1$) is lighter than the stop, the stop can give a $b$ quark and the chargino, which then gives a $W$ and the neutralino.

```feynman
in: s
out: b w n
s [stop] -- v
v -- b [b]
v -- [chargino] x
x -- w [W]
x -- n [neutralino1]
```

**Through the second neutralino.** The heavier neutralino ($\tilde\chi^0_2$) gives a $Z$ or a Higgs boson and the lightest neutralino.

```feynman
in: s
out: t z n
s [stop] -- v
v -- t [t]
v -- [neutralino2] x
x -- z [Z, label={Z/h}]
x -- n [neutralino1]
```

**Without R-parity.** If R-parity is violated there is no stable neutralino at all: the stop decays straight into two quarks ($\lambda''$),

```feynman
in: s
out: b q
s [stop] -- v [dot, label={\lambda''}]
b [particle={\bar{b}}]
q [particle={\bar{s}}]
v -- [plain] b
v -- [plain] q
```

or into a quark and a lepton ($\lambda'$), when it looks like a leptoquark.

```feynman
in: s
out: b l
s [stop] -- v [dot, label={\lambda'}]
v -- b [b]
v -- [anti fermion] l [\ell^+]
```

## 3. Putting it together

A real event has two stops, each decaying. Here are the full diagrams for the most searched-for cases.

**Both stops to a top and a neutralino:** the diagram at the top of this page.

**Both stops through a chargino:**

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label'={\tilde{t}^*}] s2
s1 -- a1 [b]
s1 -- [chargino] x1
x1 -- a2 [W]
x1 -- a3 [neutralino1]
s2 -- [chargino] x2
s2 -- [anti fermion] b1 [\bar{b}]
x2 -- b2 [neutralino1]
x2 -- b3 [W]
```

**Both stops through the second neutralino:**

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label'={\tilde{t}^*}] s2
s1 -- a1 [t]
s1 -- [neutralino2] x1
x1 -- a2 [Z]
x1 -- a3 [neutralino1]
s2 -- [neutralino2] x2
s2 -- [anti fermion] b1 [\bar{t}]
x2 -- b2 [neutralino1]
x2 -- b3 [Z]
```

**One of each (mixed decays):**

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] s1
pp -- [stop, label'={\tilde{t}^*}] s2
s1 -- a1 [t]
s1 -- a2 [neutralino1]
s2 -- [chargino] x2
s2 -- [anti fermion] b1 [\bar{b}]
x2 -- b2 [neutralino1]
x2 -- b3 [W]
```

**R-parity violating, both stops to two quarks:**

```feynman
i1 [p] -- pp [blob] -- i2 [p]
pp -- [stop] r1 [dot, label={\lambda''}]
pp -- [stop, label'={\tilde{t}^*}] r2 [dot, label={\lambda''}]
a1 [particle={\bar{b}}]
a2 [particle={\bar{s}}]
b1 [particle={b}]
b2 [particle={s}]
r1 -- [plain] a1
r1 -- [plain] a2
r2 -- [plain] b1
r2 -- [plain] b2
```
