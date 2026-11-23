---
tags:
  - CLI
  - terminal
  - shell
  - npx
  - SVG export
  - tikz export
  - batch
  - CI
---

# Command line

***Draw, check and export diagrams from a shell: one command turns a .feyn file into SVG, TikZ-Feynman code, a lint report or a plain-English description.***

```sh
feynjs render ggf.feyn > ggf.svg
```

```feynman
g g > {t} > H
```

```text
g g > {t} > H
```

```sh
feynjs <command> [file]
```

Reads the diagram from `file`, or from standard input when there is none, and writes to standard
output. Installed with the package (`npx feynjs ...`), or run from a checkout as
`node bin/feynjs.mjs`.

| Command | Writes | Exit status |
|---|---|---|
| `render` | the SVG | 1 on a mistake in the source |
| `tikz` | TikZ-Feynman code | 1 on a mistake |
| `check` | one line per finding, or `no problems found` | 1 if any finding is an error |
| `describe` | the [description](../guide/tools.md#describe) as JSON | 1 on a mistake |
| `explain` | the diagram in plain English | 1 on a mistake |
| `measure` | the [layout score](../guide/tools.md#measure) as JSON | 1 on a mistake |

```sh
feynjs render ggf.feyn > ggf.svg
feynjs tikz ggf.feyn > ggf.tex && pdflatex ggf.tex
echo 'e- e+ > Z > mu- mu+' | feynjs describe
for f in diagrams/*.feyn; do feynjs check "$f" || echo "in $f"; done
```

Files with diagram source conventionally end in `.feyn`.
