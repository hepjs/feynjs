---
tags:
  - TeX
  - LaTeX
  - Greek letters
  - edge label
  - momentum arrow
  - coupling
  - notes
  - annotation
---

# Labels

***Write your own labels in a small subset of TeX, mark a coupling at a vertex, and point at parts of a diagram with notes. Every label is placed clear of the lines.***

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [photon, momentum=q, label'=\gamma^*] b
f1 [mu-] -- b -- f2 [mu+]
```

```text
i1 [e-] -- a -- i2 [e+]
a -- [photon, momentum=q, label'=\gamma^*] b
f1 [mu-] -- b -- f2 [mu+]
```

Every particle carries its own label, so most diagrams need none written. When you want your own,
labels are written in a small subset of TeX and typeset in New Computer Modern, the face of TeX
documents.

## Particle labels

A particle on a line or a leg labels it: `[W+]` writes W⁺, `[neutralino1]` writes χ̃⁰₁.
`label=` replaces the label, on the side feynjs picks (outside the diagram). `label'=` puts it
on the right of the line's direction, as TikZ-Feynman's `edge label'` does: below a line drawn
left to right. `no label` leaves it off.

A label that holds a comma goes in braces, so the comma isn't read as the end of the option:
`label={\gamma, Z^0}`.

## Where labels go

You don't place labels. Each one tries the outer side of its line first, then the other side,
then further along the line, then further out, until it is clear of every line, vertex and other
label. An external leg's label sits beyond the end of the leg.

## The TeX subset

| Write | Get |
|---|---|
| `\alpha \beta \gamma ... \Omega` | Greek letters, upper and lower case |
| `x^2`, `x_i`, `x^{+}_{1}` | superscripts and subscripts |
| `x'`, `x''` | primes |
| `\tilde t`, `\bar q`, `\hat s` (also `\widetilde`, `\overline`, `\widehat`) | accents |
| `\mathrm{h.c.}`, `\text{LSP}` | upright text |
| `\ell \pm \mp \to \times \cdot \dagger \infty \partial \hbar \neq` | common symbols |

No math engine is loaded. The labels are SVG text, so exported files need nothing else to display
correctly.

## Coupling labels

A label on a vertex is a coupling. It sits in the widest gap between the lines, set a little
smaller than particle labels. Give the vertex a dot and a colour to pick it out:

```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```

```text
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, color=green] -- f2 [H]
```

`label side=` puts it on a side of your choosing: `above`, `below`, `left`, `right`, or two of
them (`below left`).

```feynman
i1 [q] -- a -- f1 [q]
i2 [q] -- b -- f3 [q]
a -- [W] c -- [W] b
c [dot, label=\kappa_V, label side=left] -- f2 [H]
```

```text
c [dot, label=\kappa_V, label side=left] -- f2 [H]
```

## Words as labels

Labels written as words (`\text{LSP}`, or the particle `LSP`) are set upright and a little
smaller, as in SUSY papers.

## Notes

`note:` sets a few words in free space and draws an arrow to what they describe, as if by hand:
a gently curving pen stroke with an open arrowhead, in crayon blue, the words in the diagram's own colour. Point it at a point
(`note: c "VVH coupling"`), at a line between two points (`note: a--b "long-lived"`), or at a
particle by name (`note: H "..."`, its final state first). A side, `above`, `below`, `left` or
`right`, says where the words go; otherwise they go where there is room, away from the middle of
the diagram. Words in quotes are set upright; in braces they are TeX (`note: f1 {\text{soft } \pi^+}`).
Write as many notes as you like.

```feynman
q1 [q] -- a -- q3 [q]
q2 [q] -- b -- q4 [q]
a -- [boson, label=W] c
b -- [boson, label=W] c
c -- [H] h [H]
note: c "VVH coupling"
```

