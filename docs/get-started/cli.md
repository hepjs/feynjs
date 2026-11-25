# Command line

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
| `describe` | the [description](../authoring/checks.md#describe) as JSON | 1 on a mistake |
| `explain` | the diagram in plain English | 1 on a mistake |
| `measure` | the [layout score](../authoring/checks.md#measure) as JSON | 1 on a mistake |
| `import [file.tex]` | every TikZ-Feynman picture in a LaTeX file, as feynjs's lines (each under a comment when there are several): see [TikZ-Feynman](../setup/tikz-feynman.md#converting-a-papers-pictures) | 1 on a mistake |
| `cache [dir]` | each `*-feynjs-*.feyn` a LaTeX document left in `dir` (default `.`) drawn as TikZ-Feynman code beside it, skipping those already drawn: see [LaTeX](latex.md) | 1 on a mistake |

```sh
feynjs render ggf.feyn > ggf.svg
feynjs tikz ggf.feyn > ggf.tex && pdflatex ggf.tex
echo 'e- e+ > Z > mu- mu+' | feynjs describe
for f in diagrams/*.feyn; do feynjs check "$f" || echo "in $f"; done
```

Files with diagram source conventionally end in `.feyn`; a `.json` file is read as a [diagram given as data](interchange.md). `--unit cm` sets the length of a propagator in the TikZ code, and `--picture` writes a bare `tikzpicture` without a document round it.
