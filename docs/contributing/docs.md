# The docs site

This site is built with [Zensical](https://zensical.org) from the markdown in `docs/`, configured
in `zensical.toml`.

```sh
npm run build     # the library, including docs/javascripts/feynjs.min.js
zensical serve    # live preview at http://127.0.0.1:8000
zensical build    # the static site, into site/
```

## Writing pages

- **Markdown only.** Pages use markdown and the extensions configured in `zensical.toml`
  (admonitions, tabs, definition lists, tables). No raw HTML.
- **Diagrams are ```` ```feynman ```` blocks**, drawn in the browser by the library itself. Show
  the source with every diagram, in a ```` ```text ```` block, or a ```` ````markdown ```` block
  with the fence included when the point is how to write it in a page.
- **Each example should work when copied.** Don't rely on anything the reader can't see.
- **Write plainly.** Short sentences, the words physicists use, no marketing.

## Generated pages

Some pages are written by scripts and should not be edited by hand:

| Page | Script | From |
|---|---|---|
| `examples/gallery.md` | `node scripts/gen-docs.mjs` | `examples/*.feyn` |
| `reference/particles.md`, `reference/theme.md` | `node scripts/gen-reference.mjs` | the registry, `src/theme.ts` |

Run them after `npm run build`, since they read `dist/`.

## How diagrams get drawn

`zensical.toml` registers a custom fence, so a `feynman` block becomes `<div class="feynman">`.
`docs/javascripts/feynjs-init.js` calls `feynjs.run` after every page load (including instant
navigation). It also puts the site's name in the header in its brand colours and adds the
diagram colour picker. `docs/stylesheets/feynjs.css` loads the label font and sets the diagram
colours for light and dark. `docs/stylesheets/theme.css` is the site's look.

## The brand

