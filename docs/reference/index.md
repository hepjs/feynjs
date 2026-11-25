---
tags:
  - cheat sheet
  - quick reference
  - line options
  - vertex options
  - switches
  - TikZ-Feynman
  - MadGraph
---

# Syntax at a glance

```feynman
i1 [e-] -- a -- i2 [e+]
a [dot] -- [Z, momentum=q] b [dot]
b -- f1 [mu-]
b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a [dot] -- [Z, momentum=q] b [dot]
b -- f1 [mu-]
b -- f2 [mu+]
```

The whole syntax on one page. The [Components](../guide/index.md) pages explain each part with examples.

## Edges, as in TikZ-Feynman

| Write | Meaning |
|---|---|
| `a -- b -- c` | a chain: lines from `a` to `b` and `b` to `c` |
| `a -- [style] b` | a line with options |
| `a [options]` | a vertex with options |
| `v at (x, y)` | pin a vertex, in propagator lengths, y up |
| `b [right=of a]`, `[above left=1.5 of a]`, `[above right=1 and 2 of a]` | place a vertex from another (one line length by default; with two lengths, up then across), as TikZ does; the other must have a place itself |
| new line, `;` or `,` | end of a statement |
| `%`, `#`, `//` | a comment, to the end of the line |
| `i1`, `i2`, ... / `f1`, `f2`, ... | incoming / outgoing legs |

## Processes, as in MadGraph

| Write | Meaning |
|---|---|
| `p p > X Y` | the process (the first `>` line); `p p` draws beams into a blob |
| `a b > c d` | particles meeting at a point |
| `a b > g > c d` | through an intermediate line `g` |
| `t > b W+` | how a particle decays (every later `>` line) |
| two lines for one particle | used in turn by its instances; the last repeats |
| `W+(> e+ nu)` | decay this one particle on the spot |
| `g g > {t} > H`, `g g > {t} > H H`, `H > {W+} > a a` | through a loop of the particle in braces: everything meeting it at a corner of its own (a triangle, a box...), in the process or a decay; MadGraph's `[noborn=QCD]` is a top loop |
| `ggF > H`, `VBF > H`, `VBS > W+ W+`, `VBS(W) > H > W+ W-`, `VBS(W, H) > W+ H W-` | production modes: the top triangle; two quark lines whose bosons (V, or W or Z) fuse where what is made comes out; three or more made come off what the two exchange (the same boson, or as named), top to bottom |
| `t~`, `b~`, `ve~`, `ve`, `vm`, `ta-` | MadGraph's names: a tilde for an antiparticle, `ve` `vm` `vt` `vl` for neutrinos, `ta` for the tau; and the MSSM's, `go`, `n1`, `x1+`, `ul`, `t1`, `el-`, `ta1-`, `sve`, `h1` ([all](particles.md#madgraphs-mssm-names)) |

## Line options

| Option | Effect |
|---|---|
| `fermion`, `anti fermion`, `majorana`, `anti majorana`, `plain` | solid lines, with or without arrows |
| `photon`, `boson`, `charged boson`, `anti charged boson` | wavy lines |
| `gluon` | a coil |
| `scalar` (`dashed`), `charged scalar`, `anti charged scalar` | dashed lines |
| `ghost` (`dotted`) | a dotted line |
| `double`, `heavy`, `proton`, `jet` | two strokes, a thick line, three lines, a cone |
| `large jet`, `tau jet`, `semi-visible jet`, `emerging jet`, `displaced jet`, `lepton jet`, `missing energy` | [detector objects](../guide/objects.md) |
| `susy`, `susy fermion`, `susy gluon` | SUSY-coloured lines |
| `hidden` | not drawn (layout v1 still spaces for it; v2 ignores it) |
| `invisible` | not drawn, but holds the layout together in both engines |
| a particle name: `e-`, `W+`, `gluino`, ... | style, arrow and label together ([all names](particles.md)) |
| `label=...`, `label'=...` | label: on the side feynjs picks, or on the right of the line's direction (TikZ's `edge label'`) |
| `momentum=...` | a momentum arrow, on the side away from the label |
| `momentum'=...`, `reversed momentum=...` (`rmomentum`), `reversed momentum'=...` | on the label's side; pointing against the line; both |
| `insertion=0.33` (as many as wanted) | a mass or mixing insertion that far along the line: a cross in a ring |
| `with arrow=0.3`, `with reversed arrow=0.7` | an arrow (or one pointing back) that far along the line, besides any it has |
| `out=-45, in=180` (and `looseness=1.5`) | the line leaves at one angle and arrives from another, in degrees counter-clockwise from the right, as in TikZ |
| `no arrow`, `no label`, `overlay` | drop the arrow, drop the label, a straight line over a wave |
| `lifetime` (or `lifetime={c\tau}`) | a particle that lives a while: a band under the line, clear where it is made and 30% of its colour where it decays; with a value, a brace beside it carrying that label |
| `heavy`, `dashed`, `dotted`, `double`, `jet` (after a style) | thicker, dashed, dotted, drawn twice, a jet cone round it |
| `ellipsis` | three dots where a leg would be |
| `label color=...` | a colour for the label alone |
| `half left`, `half right`, `quarter left`, `quarter right`, `bend left`, `bend right`, `bend=deg` | curve the line |
| `color=...` | a palette name or any CSS colour |

## Detector objects

Written like a line style: adjectives, then the object, then what is drawn inside it as counts
(`2j 1e`). Long and short names are the same; short names are written as shown.

```
v -- [large R jet 2j 1e] f1      a large-R jet holding two jets and an electron
v -- [LRJ 2j 1e] f1              the same
v -- [LRJ(2j, 1e)] f1            the same
v -- [displaced jet] f2          (or [DIS J])
v -- [DIS track] f3
```

| Object | Short |
|---|---|
| jet, small R jet | `J`, `SRJ` |
| large R jet | `LRJ` |
| track | `TRK` |
| semi-visible jet | `SVJ` |
| emerging jet | `EMG` |
| tau jet | `TAU` |
| missing energy | `MET` |
| lepton jet | `LJ` |
| top jet | `TOP` |
| b jet | `BJ` |
| disappearing track | `DT` |
| displaced lepton, dislep | `DL` (as written: `dl` is MadGraph's left down squark) |
| proton remnant (a proton that broke up, p*) | `PR` |

Adjective: `displaced` (`DIS`): the object starts at a displaced vertex after a dotted flight.
Contents: `j` jet, `b` b-tagged jet (with its secondary vertex), `e` electron, `mu` muon, `l` lepton, `tau`, `g` or `y` photon, `q` quark, `nu` neutrino (dotted). A particle that decays inside an object is written with what it decays to in parentheses: `[LRJ 1b W(2j)]` a hadronically decaying top, `[LRJ 1b W(1mu 1nu)]` a semileptonic one (also `Z(...)`, `H(...)`, `t(...)`).

## Vertex options

| Option | Effect |
|---|---|
| a particle name or TeX label: `[e-]`, `[\tilde t]` | names an external leg |
| `dot`, `empty dot`, `square dot`, `crossed dot` | dots |
| `blob`, `hatched blob`, `small blob`, `small hatched blob` | discs |
| `jet` | this leg ends in a jet (a cone round its line) |
| `cone` | this leg is a jet, marked by a small cone in a column at the right, as many papers mark it |
| `insertion` | a cross on the line |
| `bag=proton` (or `pi+`, `J/psi`, `Zc`, `Pc`...; or its quarks, `uud`, `c cbar u dbar`), with `motion` to let its flux tubes breathe, `molecule` to draw a pentaquark as a baryon beside a meson (or write the parts with a plus, `uud + c cbar`) | a hadron with its valence quarks, each a dot in its colour charge (red, green, blue; antiquarks in anticolours, so the whole is colourless), bound by colour flux tubes as lattice QCD shows them: straight for a meson, a Y-junction for a baryon, linked junctions for tetra- and pentaquarks |
| `nucleus=Pb` (or `208Pb`, `Au`, `O`...; or `nucleus, A=16, Z=8`) | a nucleus drawn as its A protons and neutrons packed in a disc, Z of them dull red, the rest dull black, as wide as A to the third |
| `label=...` | a coupling label |
| `[photon, radiation]` (on a line) | given off as radiation: the line it leaves runs on straight into the collision (a gluon off an incoming quark is radiation already) |
| `rim=black`, `size=1.5` (on a dot) | a rim of another colour; a larger or smaller dot |
| `label side=below` | which side of the vertex the coupling label sits on: above, below, left, right, or two |
| `color=...` | colour |
| `in`, `out` | this leg enters / leaves |
| `pulse` (or `pulse=blue`) | an animated pulse around the point, to draw the eye to it, and a glow along every line that meets there; also on a line alone, `[gluino, pulse]` (still for readers who ask for reduced motion) |

## Switches

| Write | Effect |
|---|---|
| `in: a b`, `out: c d` | incoming and outgoing legs, in order top to bottom |
| `horizontal: a to b`, `vertical: a to b` | turn the whole diagram so `b` sits level right of `a`, or straight below it; `horizontal': a to b` (primed) mirrors it too |
| `note: c "words"`, `note: a--b "words" below`, `note: H {TeX}` | words in free space with a hand-drawn arrow to a point, a line, or a particle by name; as many as wanted; the arrow's colour `noteColor` in the theme (crayon blue) |
| `inline: a` | in a line of text, sit point `a` on the text's baseline (for a diagram inside an equation) |
| `every photon: color=blue`, `every fermion: heavy`, `every dot: size=1.5`, `every edge: ...`, `every vertex: ...` | defaults for every line or point of a kind (by its style or particle word, or what it is drawn as); its own settings still win |
| `label: particle = text` | draw that particle with a label of your own, everywhere it appears |
| `meson: name = leg leg`, `baryon:`, `hadron:` | a hadron as an ellipse; add `[brace]` for a brace, `[cap]` for a thin cap across the legs |
| `edge labels: left` | every `edge label=` on the left of its line's direction, as TikZ-Feynman puts it (a converted TikZ-Feynman picture asks for it); `edge label'=` stays on the right |
| `arrows: none` | no fermion arrows |
| `dots: all` | a dot on every vertex |
| `scale: 1.5` | draw larger (a zoom) |
| `size: 0.7` / `small` / `tiny` / `large` | optical size: shorter lines, relatively heavier strokes |
| `title: ...` | a title for the SVG |
| `layout: default` | the force layout (also `v2`) |
| `layout: manual` | points given `a at (x, y)` stay exactly there, TikZ-Feynman style; the forces place the rest |
| `layout: grid` (with `grid: 45` for coarser) | lines run level (or upright); only where two or more leave a point the same way do they part on 22.5 degree diagonals (45 with `grid: 45`) |
| `layout: v1` | the older rule-based engine |
| `grid: iso` | with the grid layout, an isometric (triangular) lattice: lines at 0, 60 and 120 degrees, forks forward at plus and minus 60 degrees, the background drawn to match |
| `grid forks: diagonal` | with the grid layout, the final states of a last decay part symmetrically about level, a grid step apart, to the final plane (by default a last decay into two different particles turns a right angle: one level to the final plane, the other straight up or down, away from the middle) |
| `view: kinematic` (with `projection: transverse` or `longitudinal`) | draw the event as a detector sees it: t-channel spectators forward and backward, what the collision makes central and spread round in azimuth, decay products near their parent; move a leg with `eta=`, `phi=` (degrees), `deta=`, `dphi=` |
| `rotate: 30` | in the kinematic view, turn the event by this many degrees: in azimuth in the transverse view, about the collision point in the longitudinal view (the beam and the detector stay put); 30 by default |
| `reconstruct: off` | in the kinematic view, draw final states as particles rather than as the objects they are reconstructed as (jets, tracks, missing energy) |
| `show intermediate: true` | in the kinematic view, draw the particles that decay on (tops, W bosons), their products starting from their ends |
| `view: lattice` | draw space-time as a lattice instead of the diagram: `lattice: 8x6` (sites across by up), `wilson loop: (1,1) to (4,4)`, `plaquette: (5,1)`, `link: (5,4) to (6,4)`, `polyakov loop: 7`, `site: (1,1) [label=\psi]`, `boundary: periodic`, `axes: off`; each may be written many times, and takes `[label=...]` and `[color=...]` |
| `background: grid` | a light grey grid behind the drawing, every half line length (on by default with `layout: grid`) |
| `debug: on` | a faint grid, each point's name, and each line marked with the family of rules that shapes it most (decays, mass, incoming...: measured, by settling the diagram again without each); under the drawing, each family once, with the lines it holds, and the steps after the forces that moved it ([Why a line is where it is](../guide/layout.md#why-a-line-is-where-it-is)) |
| `final plane: on` | the decays laid out as a tree: every final state on one vertical plane, every decay forking about level, the branches of a decay mirrored with equal room (by default each decay follows its parent's direction) |
| `colour flow: on` | draw colour flow beside quarks and gluons |
| `nucleon edges: tinted` (or `none`, `ink`) | how nuclei's nucleons are edged: a darker red and lighter grey, none, or ink (the default) |
| `charge colour: on` | colour charged lines by charge |
| `colours: bw` | draw the diagram in black; dots, blobs, hadrons and jet cones filled in one grey (`default` keeps SUSY and author colours) |
| `reveal: n` | the first `n` steps as usual, the rest faint |
| `---` or `--- caption` | start a new panel |
| `---[x]`, `---[+]`, `---[=]`, `---[cut]` | start a new panel joined to the one before by ×, +, = or a cut line |

## Labels

Greek letters, `^` and `_` with braces, primes, `\tilde \bar \hat` (and `\widetilde \overline
\widehat`), `\slashed{p}`, `\mathrm{}` and `\text{}`, and `\ell \pm \mp \to \times \cdot \dagger \infty \partial
\hbar \neq`. Braces around a label that holds a comma: `label={\gamma, Z}`.
