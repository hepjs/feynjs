# How it works

A diagram is built in layers: points joined by lines, a particle on each line, what happens at
each point, what runs alongside, then where everything goes and how it is pictured. Each layer
is one page in this section, in this order. Below, one diagram is built up a layer at a time.
Point at a line of source to see what it draws.

## 1. Points and lines

Name the points and join them; feynjs places every point itself. The red arrows mark the
points `a` and `b`.

<div class="feynjs-explain" data-points="a b" markdown>

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

<div class="feynjs-explain" data-points="a b" markdown>

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

<div class="feynjs-explain" markdown>

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

<div class="feynjs-explain" data-points="a b" markdown>

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

<div class="feynjs-explain" markdown>

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

## 5. Where everything goes

An engine places the points. The default balances forces that encode how physicists draw; a
grid engine snaps lines to set angles; points given `at (x, y)` stay where they are put.

<div class="feynjs-explain" markdown>

```feynman
layout: grid
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
layout: grid                 % every line at a multiple of 45 degrees, every point on a grid
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

</div>

See [Engines](engines.md).

## 6. How it is pictured

The same diagram can be drawn as something else: the kinematics in the lab, a lattice, or for a
nuclear process, the textbook picture of the reaction.

<div class="feynjs-explain" markdown>

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
