---
tags:
  - install
  - clone
  - npm
  - Node
  - esbuild
  - Zensical
  - repository
---

# Development setup

```sh
git clone https://github.com/hepjs/feynjs.git && cd feynjs
npm install
npm test
```

To see that the checkout draws, build the library and render an example from the command line:

```sh
npm run build
node bin/feynjs.mjs render examples/s-channel.feyn > s-channel.svg
```

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

You need Node (24 is used in development) and npm. The docs site also needs
[Zensical](https://zensical.org) (`pip install zensical`). The corpus tools need Python 3 and a
TeX installation with TikZ-Feynman.

## Commands

| Command | What it does |
|---|---|
| `npm test` | the unit tests (`node --test`, TypeScript run directly) |
| `npm run typecheck` | `tsc --noEmit` over everything |
| `npm run build` | `dist/feynjs.mjs`, `dist/feynjs.min.js` and the docs' copy, with esbuild |
| `node bin/feynjs.mjs render x.feyn` | the command line, from the checkout |
| `npm run docs` | build the library, then the docs site into `site/` |
| `zensical serve` | the docs site with live reload, at <http://127.0.0.1:8000> |

## Layout of the repository

| Path | What is there |
|---|---|
| `src/` | the library ([Architecture](architecture.md)) |
| `test/` | unit tests |
| `examples/` | example diagrams, `.feyn` files: the gallery and the preview sheet |
| `validation/` | diagrams from ATLAS papers transcribed as feynjs source, and the approved layouts |
| `scripts/` | the build, and approving the layout baseline |
| `docs/` | this site |
| `bin/` | the command line |
| `integrations/` | the Obsidian plugin |

TikZ-Feynman is GPL-licensed. Its numbers and conventions are a reference; don't copy its code.
