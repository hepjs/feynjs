# Development setup

You need Node (24 is used in development) and npm. The docs site also needs
[Zensical](https://zensical.org) (`pip install zensical`). The corpus tools need Python 3 and a
TeX installation with TikZ-Feynman.

```sh
git clone <the feynjs repository> && cd feynjs
npm install
npm test
```

## Commands

| Command | What it does |
|---|---|
| `npm test` | the unit tests (`node --test`, TypeScript run directly) |
| `npm run typecheck` | `tsc --noEmit` over everything |
| `npm run build` | `dist/feynjs.mjs`, `dist/feynjs.min.js` and the docs' copy, with esbuild |
| `node scripts/quality-report.mjs` | rank every example and corpus diagram by its layout score |
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
| `scripts/` | build, preview, quality and page generators |
| `bench/` | timing |
| `docs/` | this site |
| `bin/` | the command line |
| `reference/` | upstream TikZ-Feynman and Mermaid sources, for reference only (not committed) |

TikZ-Feynman is GPL-licensed. Its numbers and conventions are a reference; don't copy its code.
