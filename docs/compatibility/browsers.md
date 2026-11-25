# Browsers and Node

| | Needs |
|---|---|
| Browsers | any current Chrome, Edge, Firefox or Safari: the script is built for ES2020 |
| npm package and `feynjs` command | Node 20 or later |
| Page charset | none: the script is plain ASCII |
| Other libraries | none: no runtime dependencies, no math engine |

## Browsers

The script is compiled to ES2020 JavaScript (the esbuild target in `scripts/build.mjs`). Every
browser released in recent years runs it. It needs no plug-ins and no WebGL; a canvas is used
only to save a diagram as PNG. Labels are measured from a table built into the library, not in
the browser, so a diagram comes out the same in every browser.

## Node and the command line

The npm package and the `feynjs` command need Node 20 or later (`engines` in `package.json`).
`render` needs no browser: it returns the SVG as a string, the same in Node as on a page. See
[Use feynjs from code](../usage/index.md) and [Command line](../usage/cli.md).

## Any page charset

Every character in the script is ASCII; Greek letters and other symbols are written as escapes.
So it runs on a page that declares no charset, or a different one, without garbled labels.

## Light and dark

A diagram is plain SVG, its lines and labels drawn in `currentColor`. It takes the colour of the
text around it, so it follows a light or dark theme without being drawn again. Switch this site's
theme to see the diagram below change:

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

To set the colours yourself, or to get a file with colours of its own for a slide or a paper, see
[Light and dark](../setup/index.md#light-and-dark) and
[Exporting](../usage/export.md).
