# Get started

feynjs turns a few lines of text into a Feynman diagram, drawn as SVG. This page installs it and
walks through a first diagram. [Where to use it](use.md) shows how to put diagrams in a docs site,
a web page, a JavaScript program or a shell script.

## Install

=== "npm"

    ```sh
    npm install feynjs
    ```

    ```js
    import { render } from "feynjs";
    ```

=== "Script tag"

    Load it from jsDelivr. It defines one global, `feynjs`.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>
    ```

    `@0.9` follows the newest 0.9 release. To keep a copy of your own, take `dist/feynjs.min.js`
    from the package and serve it next to your page.

=== "From source"

    ```sh
    git clone https://github.com/hepjs/feynjs.git && cd feynjs
    npm install
    npm run build      # dist/feynjs.mjs (ES module) and dist/feynjs.min.js (script tag)
    ```

!!! note "Early days"
    feynjs is at version 0.9. The syntax described here is stable enough to write diagrams
    with, but details of the layout still change from release to release.

feynjs has no runtime dependencies. It is built for ES2020, so it runs in any current browser and in Node.

## A first diagram

An electron and a positron annihilate into a photon, which makes a muon pair:

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

Add a gluon loop, a Higgs, a cascade of decays: the [guide](../guide/index.md) covers each one.

## When something is wrong

A mistake in the text gives a message with its line number instead of a diagram:

```text
feynjs: line 2: unclosed [
```

`feynjs.check(source)` (or `feynjs check diagram.feyn`) finds physics slips the drawing would
hide: fermion lines that don't pair up at a vertex, arrows that don't flow through, legs with no
particle name. See [Checking diagrams](../guide/tools.md).

## Next

- [Where to use it](use.md): docs sites, web pages, JavaScript, the command line.
- [Writing diagrams](../guide/syntax.md): the full syntax, step by step.
- [Examples](../examples/index.md): hundreds of diagrams with their source.
