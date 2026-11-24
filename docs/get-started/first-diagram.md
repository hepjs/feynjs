---
tags:
  - tutorial
  - first diagram
  - quick start
  - s-channel
  - t-channel
  - errors
---

# Your first diagram

***Write your first diagram in three lines of text, read what each line means, and change it.***

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

feynjs turns a few lines of text into a Feynman diagram, drawn as SVG. To draw these yourself, put
them in a `feynman` block on a [Zensical site](zensical.md) or in an [Obsidian note](obsidian.md),
or paste them into the [playground](../playground.md). To install feynjs for your own code, see
[Developers](../developers/index.md#install).

!!! note "Early days"
    feynjs is at version 0.9. The syntax described here is stable enough to write diagrams
    with, but details of the layout still change from release to release.

## A first diagram

An electron and a positron annihilate into a photon, which makes a muon pair, as drawn at the top of this page:

```text
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

Read it line by line:

1. `i1 [e-] -- a -- i2 [e+]` is a **chain**. It joins three **vertices**, `i1`, `a` and `i2`,
   with two lines. `i1` and `i2` are external legs. Names starting with `i` come in from the
   left, so these two are the incoming particles. `[e-]` and `[e+]` say which particles they are.
2. `a -- [gamma] b` joins the two interaction points with a photon. `[gamma]` sets the wavy line
   and the label γ.
3. `f1 [mu-] -- b -- f2 [mu+]` gives the outgoing muons. Names starting with `f` leave to the right.

You never said where anything goes, which way the arrows point, or which line is wavy. The
particle names decided the styles and labels. The arrows follow the fermion flow: the positron's
arrow points backwards, as it does in a paper. The layout found the s-channel shape.

## Change it

Swap the photon for a Z and the muons for neutrinos:

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [nu] -- b -- f2 [nubar]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [Z] b
f1 [nu] -- b -- f2 [nubar]
```

Exchange the photon in the t-channel instead: each electron line runs straight through.

```feynman
i1 [e-] -- a -- f1 [e-]
i2 [e+] -- b -- f2 [e+]
a -- [gamma] b
```

```text
i1 [e-] -- a -- f1 [e-]
i2 [e+] -- b -- f2 [e+]
a -- [gamma] b
```

Add a gluon loop, a Higgs, a cascade of decays: the [features](../guide/index.md) cover each one.

## When something is wrong

A mistake in the text gives a message with its line number instead of a diagram:

```text
feynjs: line 2: unclosed [
```

`feynjs.check(source)` (or `feynjs check diagram.feyn`) finds physics slips the drawing would
hide: fermion lines that don't pair up at a vertex, arrows that don't flow through, legs with no
particle name. See [Checking diagrams](../guide/tools.md).

## Next

- [Write edges, as in TikZ-Feynman](../guide/syntax.md): the full syntax, step by step.
- [Write processes, as in MadGraph](../guide/processes.md): name the process and its decays.
- [Examples](../examples/index.md): hundreds of diagrams with their source.
