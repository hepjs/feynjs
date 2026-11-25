# Exporting


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

