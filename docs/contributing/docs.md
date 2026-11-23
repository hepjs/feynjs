---
tags:
  - documentation
  - Zensical
  - markdown
  - feynman block
  - writing pages
  - preview
  - logo
---

# The docs site

***How this site is built with Zensical, how to write a page and its diagrams, and how a
`feynman` block in the markdown becomes a drawing.***

A page draws a diagram from a fenced block. This is what you write:

````markdown
```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```
````

and this is what the page shows:

```feynman
in: i1 i2
out: f1 f2
i1 [e-] -- a
i2 [gamma] -- a
a -- [fermion] b
b -- f1 [e-]
b -- f2 [gamma]
```

This site is built with [Zensical](https://zensical.org) from the markdown in `docs/`, configured
in `zensical.toml`.

```sh
npm run build     # the library, including docs/javascripts/feynjs.min.js
zensical serve    # live preview at http://127.0.0.1:8000
zensical build    # the static site, into site/
```

The site draws its diagrams with the released library from jsDelivr (`extra_javascript` in
`zensical.toml`), so it shows what users of the release get. To preview a change to the library
before it is released, point that line at `javascripts/feynjs.min.js`, the copy `npm run build`
writes, and switch it back before committing. That copy is also published with the site, at
`https://hepjs.github.io/feynjs/javascripts/feynjs.min.js`.

## Writing pages

- **Markdown only.** Pages use markdown and the extensions configured in `zensical.toml`
  (admonitions, tabs, definition lists, tables). No raw HTML.
- **Diagrams are ```` ```feynman ```` blocks**, drawn in the browser by the library itself. Show
  the source with every diagram, in a ```` ```text ```` block, or a ```` ````markdown ```` block
  with the fence included when the point is how to write it in a page.
- **Each example should work when copied.** Don't rely on anything the reader can't see.
- **Write plainly.** Short sentences, the words physicists use, no marketing.

## Pages kept by hand

Three pages list what is in the code. For now they are kept by hand in this repository:

| Page | Lists |
|---|---|
| `examples/gallery.md` | the diagrams in `examples/*.feyn` |
| `reference/particles.md` | the particles in `src/particles/registry.ts` |
| `reference/theme.md` | the settings in `src/theme.ts` |

Adding a particle or a theme setting means updating its page too. So does adding an example to
`examples/`.

## How diagrams get drawn

`zensical.toml` registers a custom fence, so a `feynman` block becomes `<div class="feynman">`.
`docs/javascripts/feynjs-init.js` calls `feynjs.run` after every page load (including instant
navigation). It also puts the site's name in the header in its brand colours. `docs/stylesheets/feynjs.css` loads the label font and sets the diagram
colours for light and dark. `docs/stylesheets/theme.css` is the site's look, and
`overrides/partials/content.html` puts each page's tags under its title instead of at the foot.

## The brand

The logo files are in `docs/brand/logo/`: the mark, the wordmark and the lockups, each for light
and dark backgrounds, with the favicon and the social card. The site uses `mark-red.svg` as its
logo and `favicon.svg` as its favicon, both set in `zensical.toml`.
