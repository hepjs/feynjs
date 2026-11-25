# Drawing the eye

What a reader should look at first: a pulse on a point or a line, a band for a particle that lives a while, or a diagram revealed one step at a time. A brace grouping lines into a hadron is in [Vertices, loops and hadrons](vertices.md#hadrons).

## Lifetimes

A particle that lives a while before it decays takes `lifetime`: a band under its line, clear
where it is made and filling in toward where it decays. Give it a value and a brace beside the
line carries it.

```feynman
in: i1 i2
out: f1 f2 f3 f4
i1 [p] -- pp [blob] -- i2 [p]
pp -- [chargino, lifetime={c\tau}] c1
pp -- [chargino, lifetime] c2
c1 -- f1 [pi+]
c1 -- f2 [neutralino1]
c2 -- f3 [neutralino1]
c2 -- f4 [pi-]
```

The band takes the line's colour (else `lifetime.color` in the theme), and `lifetime.width`,
`lifetime.opacity` and `lifetime.braceDepth` set its size, how solid it ends and the brace.

## A pulse

`pulse` points a reader at one part of a diagram: the collision, a coupling, the line a
measurement is about. On a point it rings it and sets every line that meets there glowing in step;
on a line alone (`[gluino, pulse]`) only that line glows. `pulse=blue` gives it a colour; the
theme's `pulseColor` and `pulseSeconds` set the default colour and how long one beat lasts.

```feynman
--- on a point
i1 [e-] -- a -- i2 [e+]
a [dot, pulse] -- [Z] b
b -- f1 [mu-]
b -- f2 [mu+]
--- on a coupling and a line
i1 [q] -- a
i2 [q] -- b
a -- f1 [q]
b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H, pulse=blue] l [dot, pulse]
l -- h1 [H]
l -- h2 [H]
```

```text
--- on a point
i1 [e-] -- a -- i2 [e+]
a [dot, pulse] -- [Z] b
b -- f1 [mu-]
b -- f2 [mu+]
--- on a coupling and a line
i1 [q] -- a
i2 [q] -- b
a -- f1 [q]
b -- f2 [q]
a -- [W] c
b -- [W] c
c -- [H, pulse=blue] l [dot, pulse]
l -- h1 [H]
l -- h2 [H]
```

On the collision, `pp [blob, pulse]` rings the blob.

## Stepping through time

`render(source, { levels: true })` tags every line, vertex and label with its step in time
(`data-level`: steps from the incoming particles), so a page can reveal a diagram one step at a
time. The [stop production](examples/stop.md) walkthrough uses it.

