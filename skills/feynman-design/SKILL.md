---
name: feynman-design
description: Design clear, correct Feynman diagrams with feynjs: what to draw, how to lay it out the way physicists expect, how to check the physics, and how to draw the reader's eye. Use when asked to design, improve, review or restyle a Feynman diagram, choose between layouts, or make a diagram for a paper, talk or documentation page. For the syntax itself, see the feynjs skill.
---

# Designing Feynman diagrams

A good diagram says one thing, reads left to right in time, and looks like the diagrams in recent
papers. feynjs does the placing; your job is to choose what to draw, write the least source that
says it, and check the result. The syntax is in the `feynjs` skill and at
https://hepjs.github.io/feynjs/authoring/.

## 1. Decide what it must say

- **One message per diagram.** A production mechanism, a decay, a loop, a signal topology. If a
  figure needs two messages, draw two panels (`---` between them, a caption after it:
  `--- (b) through a Z`).
- **Pick the level.** Partons (`q qbar > Z`) for the hard process; beams (`p p > ...`) when the
  proton remnants matter; quark lines with braces (`hadron: B^0 = d b [brace]`) for flavour
  physics; the reaction picture (`2H 3H > 4He n`) for nuclear physics; detector objects
  (`[LRJ 1b W(2j)]`, `MET`) for what an analysis selects.
- **Draw the minimum.** Leave out what the reader does not need: decays that do not matter (a
  stable `W` is fine), the second diagram of a pair (say "and crossed" in the caption instead).

## 2. Write the least source

- **A process line first.** `p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)` or
  `g g > {t} > H` gets the topology right with no coordinates. Use edges (`a -- [gamma] b`) only
  for what a process line cannot say: boxes, penguins, couplings on vertices, hadrons.
- **Name particles, not styles.** `[gluino]` gives the line, its arrow, its colour and its label;
  `[plain]` with a hand-written label throws that away.
- **Order the legs** with `in:` and `out:` (top to bottom) only when the default order is wrong,
  for example to keep a u-channel's crossing.
- **No coordinates** unless nothing else works. Reach for a switch first (`final plane: on`,
  `layout: grid`), then `layout: manual` with a few `v at (x, y)` pins.

## 3. Lay it out as physicists do

These are the conventions the default engine follows; check the result against them.

- **Time runs left to right.** Incoming on the left, outgoing on the right, nothing flowing back.
- **Near top–bottom symmetry.** Pair production mirrors about the middle; the two beams start
  together.
- **Compact.** Short external legs, short beam lines, few waves and coils; not TikZ's large canvas.
- **Scattering reads as scattering.** In a t-channel exchange, each incoming line runs in toward
  the centre and each outgoing line leaves outward; the bottom line comes in rising and leaves
  falling, the top one the mirror image. Particles produced by the scattering sit between the two
  scattered lines.
- **Exchanges.** A heavy line exchanged between the beams (a neutralino, a gluino) stands upright;
  a light quark exchange may lean forward, especially when a line radiates before it.
- **Radiation.** ISR or FSR off a fermion does not bend the fermion; the radiated line is of
  moderate length. Radiation off a W usually does bend it.
- **Cascades.** A SUSY cascade arcs gently, each stage changing direction a little, each stage
  shorter, with a narrow opening angle from the collision; the stable particle at the end does not
  bend outward.
- **Decays.** A W or Z decays about its own direction of travel. `final plane: on` lines every
  final state up in one column when the reader should compare final states.
- **Loops.** Write them in braces (`{t}`) or as closed paths; a loop is round, a box square.
- **Hadrons.** Spectator quark lines are straight. In a strong decay with a quark pair from the
  vacuum, the two partner lines are straight or diverge symmetrically, never one bent.
- **Crossings.** None, except the ones the physics asks for (a u-channel's swapped final states).

## 4. Check the physics

A diagram that looks right can still be wrong. Before showing it:

- **Charge** is conserved at every vertex. An internal W's label is the charge emitted at the
  earlier vertex: b → u gives off a W⁻, b̄ → ū a W⁺.
- **Colour.** A gluon couples only to coloured lines: in a b → s penguin with a gluon, the gluon
  leaves the up-type quark in the loop, never the W. A photon or Z may leave the W (γWW, ZWW).
- **Fermion flow** is continuous: arrows run through every vertex, in on one side and out on the
  other.
- **Allowed vertices only.** No ZZZ or ZZγ vertex in the Standard Model; no gluon on a lepton.
- **Hadron content** matches the name (`B^+` is u b̄). An OZI-suppressed decay (φ → 3π, J/ψ → 3π)
  goes through gluons, with every quark made anew.
- **Run `check`.** `feynjs check file.feyn` (or `check(source)`) reports broken fermion flow,
  unlabelled legs and unknown names; `explain` says the diagram back in words, which catches a
  wrong topology quickly.

## 5. Draw the eye, sparingly

- **One emphasis per diagram.** A `pulse` on the collision or the coupling being measured
  (`a [dot, pulse]`), a `lifetime` band on a long-lived particle (`[chargino, lifetime={c\tau}]`),
  a brace on a hadron, or a note (`note: a "new coupling"`). Not all at once.
- **Colour carries meaning.** feynjs colours superpartners on its own; add colour only for a
  reason (a new particle in red), `charge colour: on` when charge is the point, and
  `colours: bw` for a journal that prints in black.
- **Labels.** Particle names label themselves; label a coupling on its vertex
  (`v [dot, label=g_{Z'}]`); keep label text short; use `label:` to rename a particle everywhere
  (`label: W = V`).
- **Size for the medium.** `size: small` for a slide or a dense figure, `scale:` to zoom.

## 6. Look, measure, adjust

1. Render it and look at it at the size it will be shown.
2. `feynjs measure` reports crossings, crowded labels, stubs and the smallest angle; aim for zero
   problems.
3. Compare with how recent papers draw the same process (ATLAS and CMS figures are good
   references). If feynjs's layout differs, change the source's structure or add a switch before
   pinning points.
4. `debug: on` shows each point's name and which rules shaped each line, when a line will not go
   where you expect.

## Checklist

- [ ] One message; extra messages in panels with captions.
- [ ] Time left to right; legs in the intended order; no unintended crossings.
- [ ] Scattering lines in toward the centre and out away; cascades arc gently.
- [ ] Charge, colour and fermion flow correct at every vertex; `check` clean.
- [ ] At most one emphasis; colour only where it means something.
- [ ] `measure` shows no crowding; the diagram reads at its final size.
