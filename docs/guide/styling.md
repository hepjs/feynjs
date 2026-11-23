# Styling and export

## The theme

Every size, colour and layout weight is a setting with a default. Pass the ones you want to
change as `theme`; the rest keep their defaults:

```js
feynjs.render(source, {
  theme: {
    line: { stroke: 1.8, waveAmplitude: 5 },
    vertex: { dot: 4 },
    susyColor: "#8e44ad",
  },
});

// or for every diagram on a page
feynjs.run({ theme: { line: { stroke: 1.8 } } });
```

All of them, with their defaults, are in [Theme settings](../reference/theme.md).

## Size

`size:` draws a diagram smaller (or larger) the way type is drawn for a small size: line lengths
follow the size exactly, while strokes, arrows, dots and labels shrink less, so a small diagram
stays legible instead of turning into a hairline copy. Any number works (1 is normal), or
`tiny` (0.55), `small` (0.72) and `large` (1.3); from JavaScript, `theme: { size: 0.7 }`.
`scale:` is different: it zooms the finished drawing, strokes and all.

```feynman
--- size 1
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
--- size: small
size: small
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
--- size: tiny
size: tiny
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

## Light and dark

Lines and labels are drawn in `currentColor`, so a diagram takes the colour of the text around it
and follows a page's light or dark theme without being drawn again. Give its container a colour
to change it:

```css
div.feynman { color: #1b1f24; }
[data-md-color-scheme="slate"] div.feynman { color: #e6e8eb; }
```

## Colours

`color=` on a line or vertex takes a name from the theme's palette (`blue`, `orange`, `red`,
`green`, `pink`, `teal`, `gold`, ... the Petroff accessible colour cycle) or any CSS colour.

Supersymmetric particles take `susyColor` (brick red by default). Blobs and hadron ellipses take
`vertex.blobFill`, a translucent slate. Both are also marked with classes, so a stylesheet can
recolour them without redrawing:

| Class | On |
|---|---|
| `svg.feynjs` | every diagram |
| `.feynjs-susy` | SUSY lines and their labels |
| `.feynjs-blob` | hadron ellipses (their fill) |
| `.feynjs-collision` | a blob vertex, such as the pp collision (grey, like the decay vertices) |
| `.feynjs-blob-label` | the name inside a hadron ellipse |
| `.feynjs-bg` | shapes filled with the page background (open, crossed and hatched dots) |

```css
svg.feynjs .feynjs-susy { color: #8e44ad; }
svg.feynjs .feynjs-blob { fill: rgba(11, 128, 195, 0.15); }
```

This site's diagram colour picker, in the corner of any page with diagrams, works this way.

## Colour by charge

`charge colour: on` colours each line whose particle is known by the sign of its electric charge:
positive in orange, negative in blue, a "±" charge in purple. Neutral lines keep their usual
colour. A particle is known when it is named on the line, on its external leg, or by a quark's
label (`[\bar{b}]`). The colours are `chargeColors` in the [theme](../reference/theme.md).

```feynman
charge colour: on
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> mu- nubar)
```

```text
charge colour: on
p p > t tbar
t > b W+(> e+ nu)
tbar > bbar W-(> mu- nubar)
```

## Particle cards

With `run({ tooltips: true })`, pointing at a particle's label shows a card with its name,
charge, spin, colour and mass (PDG values), and whether it is hypothetical; an SVG drawn with
`render(source, { tooltips: true })` carries a plain one-line tooltip instead. Off by default. The card's colours are CSS custom
properties: `--feynjs-tooltip-bg`, `--feynjs-tooltip-fg`, `--feynjs-tooltip-accent`,
`--feynjs-tooltip-border`, `--feynjs-tooltip-font`. The data is `feynjs.particleProperties`.

## The label font

Labels are set in New Computer Modern, the face of TeX documents, when the page provides it, and
fall back to Latin Modern, CMU Serif, STIX Two or Times. To load it, copy `docs/fonts/` and
this site's `stylesheets/feynjs.css` (see [Where to use it](../get-started/use.md)). The
`fontFamily` theme setting changes the face.

## Exporting

**Standalone SVG.** On a page, a diagram inherits its colours. To get a file that displays
correctly anywhere (a slide, a paper, an image viewer), ask for its own colours:

```js
const svg = feynjs.render(source, { standalone: true });                 // black on white
const tinted = feynjs.render(source, { standalone: true, background: "#f4f1ea" });
```

From a shell, `feynjs render diagram.feyn > diagram.svg` writes the SVG; its lines are
`currentColor`, which most viewers draw in black.

**From a page.** `feynjs.run({ download: true })` puts a quiet download icon in the corner of
each diagram (it shows when you point at the diagram). It offers the diagram as SVG or as PNG,
both standalone. The PNG is drawn at three times the size, with the page's label font embedded so
it keeps the TeX face. Every diagram on this site has one.

**TikZ-Feynman.** `toTikz` writes the same layout as TikZ-Feynman code, with every vertex
placed, ready for `pdflatex` or `lualatex`:

```js
const tex = feynjs.toTikz(source, { standalone: true });   // a complete document
const body = feynjs.toTikz(source);                         // just the tikzpicture
```

`unit` sets the length of a propagator in cm.

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

## Drawing the eye

`pulse` on a point rings it and sets every line that meets there glowing in step; on a line alone
(`[gluino, pulse]`) only that line glows.

```feynman
i1 [e-] -- a -- i2 [e+]
a [dot, pulse] -- [Z] b
b -- f1 [mu-]
b -- f2 [mu+]
```

## Stepping through time

`render(source, { levels: true })` tags every line, vertex and label with its step in time
(`data-level`: steps from the incoming particles), so a page can reveal a diagram one step at a
time. The [stop production](../examples/stop.md) walkthrough uses it.
