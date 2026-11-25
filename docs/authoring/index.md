# How it works

A diagram is built in layers: points joined by lines, a particle on each line, what happens at
each point, what runs alongside, then where everything goes and how it is pictured. Each layer
is one page in this section, in this order. Below, one diagram is built up a layer at a time.
Point at a line of source to see what it draws.

## 1. Points and lines

Name the points and join them; feynjs places every point itself. Point at a line of source, or
step through it with the arrows beside the diagram: what the line draws lights up, and the
text beside the diagram says what it does.

<div class="feynjs-explain" data-says="Five lines: two lines come in, one runs between, two go out." data-points="i1 i2 a b f1 f2" data-names="rest" markdown>

```feynman
in: i1 i2
out: f1 f2
i1 -- a -- i2
a -- b
f1 -- b -- f2
```

```text
in: i1 i2           % i1 and i2 come in, on the left
out: f1 f2          % f1 and f2 go out, on the right
i1 -- a -- i2       % the two incoming lines meet at a
a -- b              % a line from a to b
f1 -- b -- f2       % the two outgoing lines leave b
```

</div>

[Writing diagrams](syntax.md) covers chains, panels and the switches that apply to a whole
diagram.

## 2. A particle on each line

A particle's name sets the line's style, its arrow and its label in one word.

<div class="feynjs-explain" data-says="Name a particle and its line takes the style, the arrow and the label." data-points="i1 i2 a b f1 f2" markdown>

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]      % an electron and a positron, named on their points
a -- [gamma] b               % a photon, named on its line
f1 [mu-] -- b -- f2 [mu+]    % a muon pair
```

</div>

`in:` and `out:` can go: names starting with `i` come in and names starting with `f` go out.
[Lines, particles and labels](lines.md) has every line style, label and note;
[All particles and line types](particles.md) lists every name.

Or name the process, as MadGraph writes it, and feynjs works out the points and lines:

<div class="feynjs-explain" data-says="One line, read left to right: what comes in, what is exchanged, what goes out." markdown>

```feynman
e- e+ > gamma > mu- mu+
```

```text
e- e+ > gamma > mu- mu+      % what comes in > what is exchanged > what goes out
```

</div>

[Processes](processes.md) covers decays, decay chains and production modes.

## 3. What happens at a point

A point can carry a vertex dot and its coupling, or be a blob, a proton beam, a nucleus, or a
hadron's quarks.

<div class="feynjs-explain" data-says="A dot where the lines meet, with its coupling beside it." data-points="i1 i2 a b f1 f2" markdown>

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
a [dot, label=e]
b [dot, label=e]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
a [dot, label=e]             % a dot at a, its coupling e beside it
b [dot, label=e]             % and the same at b
```

</div>

[Vertices, loops and hadrons](vertices.md) also covers loops, boxes, penguins, mesons and
spectator quarks.

## 4. What runs alongside

Colour can be drawn beside the quarks and gluons, and a final state can be drawn as what a
detector sees: a jet, a large-R jet with what is inside it, missing energy.

<div class="feynjs-explain" data-says="Colour runs beside each quark and gluon, as a line of its own." markdown>

```feynman
colour flow: on
u ubar > g > t tbar
```

```text
colour flow: on              % draw each colour line beside its quark or gluon
u ubar > g > t tbar          % a quark pair makes a gluon, which makes a top pair
```

</div>

See [Colour flow](colour-flow.md) and [Detector objects](objects.md).

## 5. How it's all laid out

An engine places the points, and one switch picks it; the rest of the source stays the same.
Press a button to watch the same diagram move to another layout.

<div class="feynjs-layouts" markdown>

```feynman
p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

```text
layout: default
p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

</div>

- **Default** balances forces that encode how physicists draw: decays fan out from their parent,
  the stages of a cascade grow shorter, nothing crosses.
- **Grid** snaps every line to a multiple of 45 degrees, as a diagram drawn on squared paper.
- **Final plane** lines up every outgoing particle on the right, as the final state an experiment
  sees.

Points given `at (x, y)` stay where they are put, and the rest settle round them.
[Engines](engines.md) covers each engine and its settings.

## 6. Drawing the eye

Three marks point a reader at what matters: a pulse on a point or a line, a band for a particle
that lives a while, and a brace grouping lines.

<div class="feynjs-explain" data-says="A pulse and a lifetime band draw the eye to what matters." markdown>

```feynman
i1 [q] -- a -- i2 [qbar']
a [dot, pulse] -- [W+] b
b -- [chargino, lifetime={c\tau}] c
b -- f1 [neutralino2]
c -- f2 [neutralino1]
c -- f3 [pi+]
```

```text
i1 [q] -- a -- i2 [qbar']
a [dot, pulse] -- [W+] b                  % pulse: the point beats and the lines meeting there glow
b -- [chargino, lifetime={c\tau}] c       % lifetime: a band filling in toward the decay, braced with cτ
b -- f1 [neutralino2]
c -- f2 [neutralino1]
c -- f3 [pi+]
```

</div>

<div class="feynjs-explain" data-says="A brace groups quarks into the hadron they make." markdown>

```feynman
in: u d
out: mu nu
u [u] -- [fermion] a -- [fermion] d [\bar{d}]
a -- [W+] b
mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
hadron: \pi^+ = u d [brace]
```

```text
in: u d
out: mu nu
u [u] -- [fermion] a -- [fermion] d [\bar{d}]    % a u and a d-bar...
a -- [W+] b
mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
hadron: \pi^+ = u d [brace]                      % ...braced together as the pion they make
```

</div>

[Drawing the eye](emphasis.md) covers pulses, lifetimes and revealing a diagram step by step;
hadrons are in [Vertices, loops and hadrons](vertices.md#hadrons).

## 7. How it is pictured

The same diagram can be drawn as something else: the kinematics in the lab, a lattice, or for a
nuclear process, the textbook picture of the reaction.

<div class="feynjs-explain" data-says="A nuclear process drawn as the textbook picture of the reaction." markdown>

```feynman
2H 3H > 4He n
```

```text
2H 3H > 4He n                % deuterium and tritium fuse to helium and a neutron
```

</div>

See [Views](views.md).

## The whole syntax, and complete diagrams

[Syntax at a glance](syntax-at-a-glance.md) puts every part of the syntax on one page.
[Examples](examples/index.md) has complete diagrams by subject, from the Standard Model to
supersymmetry, each with its source.
