# Styling


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

All of them, with their defaults, are in [Theme settings](theme.md).

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

## Colour by charge

`charge colour: on` colours each line whose particle is known by the sign of its electric charge:
positive in orange, negative in blue, a "±" charge in purple. Neutral lines keep their usual
colour. A particle is known when it is named on the line, on its external leg, or by a quark's
label (`[\bar{b}]`). The colours are `chargeColors` in the [theme](theme.md).
The diagram at the top of this page uses it.

## Colour schemes

`colours: bw` (or `colors: bw`) draws the diagram in black, for a journal that prints in black
and white. Dots, blobs, hadrons and jet cones are filled in one grey, so shapes keep their
shading. The default scheme keeps SUSY lines and the colours an author gives. From JavaScript,
`theme: { colourScheme: "bw" }`.

```feynman
--- default
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] g1 [dot, color=red]
g1 -- f1 [q, jet]
g1 -- f2 [q, color=blue]
g1 -- f3 [neutralino1]
--- colours: bw
colours: bw
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] g1 [dot, color=red]
g1 -- f1 [q, jet]
g1 -- f2 [q, color=blue]
g1 -- f3 [neutralino1]
```

```text
colours: bw
i1 [p] -- pp [blob] -- i2 [p]
pp -- [gluino] g1 [dot, color=red]
g1 -- f1 [q, jet]
g1 -- f2 [q, color=blue]
g1 -- f3 [neutralino1]
```

## Particle cards

With `run({ tooltips: true })`, pointing at a particle's label shows a card with its name,
charge, spin, colour and mass (PDG values), and whether it is hypothetical; an SVG drawn with
`render(source, { tooltips: true })` carries a plain one-line tooltip instead. Off by default. The card's colours are CSS custom
properties: `--feynjs-tooltip-bg`, `--feynjs-tooltip-fg`, `--feynjs-tooltip-accent`,
`--feynjs-tooltip-border`, `--feynjs-tooltip-font`. The data is `feynjs.particleProperties`.

## The label font

Labels are set in the reader's own math font, the one the browser uses for equations (CSS
`font-family: math`): STIX Two Math on a Mac, Cambria Math on Windows. Nothing is downloaded,
and italic letters are Unicode's mathematical italics, so every math font draws its own italic
shapes. Where `math` is not understood (an older browser, an SVG opened in a drawing program),
the face falls back to STIX Two Math, Cambria Math, New Computer Modern Math, Latin Modern Math,
then any serif. The `fontFamily` theme setting changes the face; a diagram's layout never depends
on it.

