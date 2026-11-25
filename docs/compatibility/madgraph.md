# MadGraph

MadGraph generates every Feynman diagram of a process; feynjs draws them. With the feynjs plugin,
one command turns a process into its diagrams, each laid out as a paper would draw it, in any
model MadGraph can load. feynjs also reads MadGraph's process syntax directly, for writing a single
diagram by hand.

The plugin is set up in [Setup](../setup/index.md#setup-madgraph), and the [MadGraph
gallery](madgraph-gallery.md) shows what it draws. This page is about writing MadGraph's
syntax by hand.

## Writing MadGraph's syntax by hand

```text title="MadGraph"
import model sm
generate p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
output
```

```text title="feynjs"
p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

```feynman
p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

The process line is the same; the MadGraph commands (`import model`, `generate`, `output`) go.
Each decay after a comma is read as a decay line of its own, and a decay in brackets comes with the
decays of what it makes, so the line above draws just as feynjs's own way of writing it does:

```text title="feynjs, written its own way"
p p > t t~
t > b w+(> e+ ve)
t~ > b~ w-(> j j)
```

Brackets go inside brackets, as deep as the chain goes:

```text
p p > t1 t1~, (t1 > t n1, (t > b w+, w+ > e+ ve)), (t1~ > t~ n1, (t~ > b~ w-, w- > j j))
```

`>` may be written without spaces, `p p>t t~,t>b w+`, after a name ending in `-` too:
`w->e- ve~` is `w- > e- ve~`. Names need a space between them, as in MadGraph: `e+ e-`, not
`e+e-`.

## How it differs from MadGraph

MadGraph generates every diagram for a process. feynjs draws **one**: the one your lines
describe. So `e- e+ > mu- mu+` is a single four-point vertex; write `e- e+ > a > mu- mu+` or
`e- e+ > z > mu- mu+` to choose the diagram. A particle between two `>` is the line drawn there,
where in MadGraph it only requires that s-channel. Each diagram in a page is a separate block,
and `---` splits a block into [panels](../authoring/syntax.md#panels-and-switches).

<div class="grid" markdown>

```text title="a process"
e- e+ > a > mu- mu+
```

```text title="the same, as edges"
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

</div>

```feynman
e- e+ > a > mu- mu+
```

The two syntaxes reach the same drawing. Use processes for cascades and production and decay.
Use [edges](../authoring/syntax.md) for hadrons, coupling labels and anything you want to place by
hand. Switches such as `layout:`, `title:` and `arrows:` work with both.

## Particle names

MadGraph's Standard Model names work as they are. Where feynjs has a name of its own, both work.

| MadGraph | feynjs | Drawn as |
|---|---|---|
| `e-`, `e+`, `mu-`, `mu+` | the same | fermions |
| `ta-`, `ta+` | `tau-`, `tau+` | fermions |
| `ve`, `vm`, `vt` | `nu_e`, `nu_mu`, `nu_tau` | fermions |
| `u`, `d`, `s`, `c`, `b`, `t` | the same | fermions |
| `t~`, `b~`, `u~`, `ve~`, ... (any name and `~`) | `tbar`, `bbar`, `ubar`, ... | the antiparticle: arrow turned, a bar over the label |
| `g` | the same | a gluon |
| `a` | `gamma` | a photon |
| `z`, `w+`, `w-` | `Z`, `W+`, `W-` | wavy lines |
| `h` | the same, or `H` | a dashed line, labelled *h* (`H` is labelled *H*) |
| `p` | the same | two `p` coming in are beams into a blob |
| `j` | the same | a jet |
| `l+`, `l-` | the same | charged leptons, labelled ℓ |

Every name is in [All particles](../authoring/particles.md).

MadGraph's MSSM names work too, as its models name them after renaming, drawn and labelled as the
plugin draws them:

| MadGraph | feynjs | Drawn as |
|---|---|---|
| `go` | `gluino` | a gluino |
| `n1` ... `n4` | `neutralino1` ... `neutralino4` | neutralinos |
| `x1+`, `x1-`, `x2+`, `x2-` | `chargino1+`, `chargino1-`, `chargino2+`, `chargino2-` | charginos |
| `ul`, `ur`, `dl`, `dr`, `cl`, `cr`, `sl`, `sr` (and `ul~`, ...) | MadGraph's only | squarks, labelled `\tilde u_{L}` |
| `t1`, `t2`, `b1`, `b2` | `stop1`, `stop2`, `sbottom1`, `sbottom2` | squarks |
| `el-`, `el+`, `er-`, `mul-`, `mur+`, `ta1-`, `ta2+`, ... | MadGraph's only | sleptons, labelled `\tilde{e}^-_L`, `\tilde\tau^-_1` |
| `sve`, `svm`, `svt` (and `sve~`, ...) | MadGraph's only | sneutrinos |
| `h1`, `h2`, `h3`, `h+`, `h-` | `h`, the heavy `H`, `A`, `H+`, `H-` | Higgs bosons, labelled h, H, A |
| `vl`, `vl~` | `nu_l` | a lepton neutrino, ν_ℓ |

They are matched only as written: `dl` is the left down squark, and the displaced lepton is
`dislep` (or `DL`). A name feynjs doesn't know is still drawn, as a plain line with the name as its
label, and [`check`](../usage/api.md#check) warns of it.

## What feynjs takes

| MadGraph | In feynjs |
|---|---|
| `a b > c d` | yes: the process, the first line with `>` |
| `a b > x > c d` | yes: one particle between two `>`, drawn as the line between |
| `p p > t t~, t > b w+` | yes: each decay after a comma is a decay line, as `t > b w+` on a line of its own |
| `(t > b w+, w+ > e+ ve)` | yes: the decay and the decays of what it makes, as `t > b w+(> e+ ve)`; brackets nest |
| `p p>t t~`, with no spaces round `>` | yes, `w->e- ve~` too |
| `psi(2S)`, `X(3872)` | yes: brackets that do not start with `>` are part of the name |
| `g g > h [noborn=QCD]` | yes: through a top loop, the top triangle; the partons must be named, not `p p` |
| `[QCD]`, `[virt=QCD]`, `[QED]` | yes: the tree is drawn as it is |
| `[real=QCD]` and other brackets | no: write the loop where it goes, `g g > {t} > H` |
| `$ z`, `$$ z`, `/ z` | no: nothing to exclude, as only one diagram is drawn; write the lines you want |
| `QCD=2`, `QED<=2` | no: an error; remove them |
| `@1` | no: remove it |
| `generate`, `add process`, `import model`, `output`, `launch` | no: write the process alone |
| `define l = e+ e-` | no: an error; write the particles, or use the built-in `l+`, `l-`, `j`, `p` |

`$`, `$$`, `/` and `@1` are not errors: feynjs reads them as particle names and draws extra legs
for them. Take them out before pasting a process.

## What feynjs adds

These are feynjs's own, not MadGraph's:

- **Several decay lines for one particle**, used in turn: the first gluino decays the first way,
  the second the second way.
- **Loops in braces**, `g g > {t} > H`, in the process or in a decay.
- **Production modes**, `ggF > H`, `VBF > H`, `VBS > W+ W+`.
- **Detector objects** as particles, `bjet`, `LRJ`, `MET`.

All four are in [Write processes, as in MadGraph](../authoring/processes.md).
