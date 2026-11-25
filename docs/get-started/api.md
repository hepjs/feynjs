# JavaScript API

```js
import { render } from "feynjs";
const svg = render("e- e+ > Z > mu- mu+");   // SVG markup, ready to put in a page
```

```feynman
e- e+ > Z > mu- mu+
```

```js
import { render, run, check, describe, measure, toTikz, registerParticle } from "feynjs";
```

With the script tag, the same functions are on the global `feynjs`. TypeScript types ship with the
package: `RenderOptions`, `Theme`, `ThemeOverrides`, `Particle`, `Description`, `Finding`,
`Quality`, `TikzOptions`, `Diagram`.

## Install

=== "npm"

    ```sh
    npm install feynjs
    ```

    ```js
    import { render } from "feynjs";
    ```

=== "From source"

    ```sh
    git clone https://github.com/hepjs/feynjs.git && cd feynjs
    npm install
    npm run build      # dist/feynjs.mjs (ES module) and dist/feynjs.min.js (script tag)
    ```

### From JavaScript

`render` takes the source and returns the SVG as a string. It works the same in a browser, in Node
and in a build step:

```js
import { render } from "feynjs";
import { writeFileSync } from "node:fs";

const source = `
  i1 [q] -- a -- f1 [q']
  i2 [b] -- b -- f2 [t]
  a -- [W] b
`;

// standalone: black on white, correct outside a themed page (slides, papers, editors)
writeFileSync("single-top.svg", render(source, { standalone: true }));
```

In a component framework, put the string into the page as HTML, for example in React with
`<div dangerouslySetInnerHTML={{ __html: render(source) }} />`. The SVG is built from your source
text, so it carries no script.

The same source is drawn only once: `render` keeps the last 256 diagrams, so a page that redraws
often is cheap. Every function and option is below.

## Drawing

### render

```ts
render(source: string, options?: RenderOptions): string
```

The diagram as SVG markup. Throws `FeynError` on a mistake in the source. Lines of `---` split
the source into [panels](../authoring/syntax.md#panels-and-switches). The last 256 diagrams drawn are remembered, so
drawing the same source again costs nothing.

| Option | Default | Meaning |
|---|---|---|
| `theme` | | overrides for any [theme setting](../setup/theme.md) |
| `standalone` | `false` | give the SVG its own colours (black on `background`) for use outside a page |
| `background` | `"#ffffff"` | the background of a standalone SVG |
| `panelsPerRow` | `3` | panels in a row |
| `idPrefix` | `"feyn"` | prefix for the ids inside the SVG, when several diagrams share a page |
| `levels` | `false` | tag each part with its step in time (`data-level`), to reveal it step by step |
| `reveal` | | draw the first `reveal` steps as usual and the rest faint and grey |

### run

```ts
run(options?: RunOptions): void
```

Draws every element on the page that holds diagram source, replacing its text with the SVG.
Takes every `render` option, plus:

| Option | Default | Meaning |
|---|---|---|
| `querySelector` | `".feynman:not([data-processed])"` | which elements hold source |
| `root` | `document` | where to look |
| `download` | `false` | a quiet download icon on each diagram, offering it as SVG or PNG |
| `tooltips` | `false` | a card with a particle's properties when the pointer rests on its label |

Each element drawn gets `data-processed` and the class `feynjs-rendered`, so calling `run` again
draws only what is new. An element whose source has a mistake shows the message and the source in
a `pre.feynjs-error` instead.

## Reading

### check

```ts
check(source: string): Finding[]
// Finding: { severity: "error" | "warning", rule: string, message: string, vertex?: string }
```

Structural lint: fermion pairing and flow, unconnected vertices, unlabelled legs. See
[Checking diagrams](../authoring/checks.md#check).

### describe

```ts
describe(source: string): Description
```

`{ process, incoming, outgoing, propagators, vertices, loops, pieces, hadrons }`. See
[Checking diagrams](../authoring/checks.md#describe).

### measure

```ts
measure(source: string, theme?: ThemeOverrides): Quality
```

`{ crossings, crowdedVertices, crowdedLabels, smallestAngle, stubs, aspect, problems }`. See
[Checking diagrams](../authoring/checks.md#measure).

### explain

```ts
explain(source: string): string
```

The diagram in plain English, as every SVG carries in its `<desc>`. See
[Checking diagrams](../authoring/checks.md#explain).

### parse

```ts
parse(source: string): Diagram
```

The source as data, before layout: `{ vertices, edges, hadrons, directives }`. Process lines are
already expanded into edges.

## A diagram as data

`render`, `check`, `describe`, `explain`, `measure` and `toTikz` each take the source as text, or
the diagram as data: `{ incoming, outgoing, vertices, edges, switches }`. `toSource(data)` returns
the source it is drawn from, in the [hand-over format](interchange.md);
`INTERCHANGE_VERSION` is the version of that format this feynjs reads.

## The drawing's parts, by name

Every SVG feynjs draws names its parts, so a program (a page script, a test, or a language model
reading the SVG) can find any of them and change the source by name:

| In the SVG | What it is |
|---|---|
| `<g data-edge="a--b" data-from="a" data-to="b" data-particle="W+">` | a line, named by its ends (`a--b#2` for a second line between the same points), with its particle when it has one |
| `<g data-vertex="b">` | the mark drawn at a point (a dot, blob, cross, nucleus and so on) |
| `<metadata class="feynjs-model">` | the whole diagram as JSON |

The JSON lists every point and every line:

```json
{ "feynjs": 1, "unit": { "x": 52, "y": 34 },
  "vertices": [ { "id": "i1", "role": "in", "x": 14.26, "y": -35.75, "at": [0.27, 1.05], "label": "e^-", "particle": "e-" },
                { "id": "b", "x": 103.99, "y": 0, "at": [2, 0], "shape": "dot" } ],
  "edges": [ { "id": "a--b", "from": "a", "to": "b", "particle": "gamma", "line": "wave" } ] }
```

`x` and `y` are where a point is drawn, in the SVG's own units; `at` is the `b at (x, y)` that
would hold it there. A process (`p p > t tbar`) names the points it makes for you (`pp1`,
`in1`, ...), and the JSON gives those names too. The [playground](../playground.md) is built on
this: it says what is under the pointer, and dragging a point writes its `at (x, y)`.

## Exporting

### toTikz

```ts
toTikz(source: string, options?: TikzOptions): string
```

The diagram as TikZ-Feynman code with every vertex placed where feynjs put it.

| Option | Default | Meaning |
|---|---|---|
| `standalone` | `false` | a complete document, ready for `pdflatex` |
| `unit` | | the length of a propagator, in cm |
| `theme` | | theme overrides, which change the layout |

### fromTikz

```ts
import { fromTikz } from "feynjs/tikz";
fromTikz(tex: string): string[]
```

Every TikZ-Feynman picture in a LaTeX text (`\feynmandiagram`, the `feynman` environment, or a
picture's body alone) as feynjs's lines, one string per picture, in order: the one-way step that
brings a paper's diagrams to feynjs. A module of its own, so a page that only draws diagrams does
not load it; in a page, `dist/feynjs-tikz.min.js` defines `feynjsTikz.fromTikz`. See
[TikZ-Feynman](../setup/tikz-feynman.md#converting-a-papers-pictures).

## Particles and styles

### registerParticle

```ts
registerParticle(name: string, particle: Particle): void
// Particle: { style: EdgeStyle, label: string, anti?: boolean }
```

Adds a particle name, usable on lines, on legs and in processes.

```js
feynjs.registerParticle("ALP", { style: feynjs.lineStyles.scalar, label: "a" });
feynjs.registerParticle("Zd", { style: feynjs.lineStyles.photon, label: "Z_d" });
```

`anti: true` makes it an antiparticle: its arrow runs against its direction of travel.

### registerLineStyle

```ts
registerLineStyle(name: string, style: EdgeStyle): void
// EdgeStyle: { line: "plain" | "wave" | "coil" | "dash" | "dot" | "double" | "triple" | "jet" | "none",
//              arrow: 0 | 1 | -1 | 2, overlay?: boolean, heavy?: boolean, color?: string, cls?: string }
```

Adds a generic style, usable as `a -- [name] b`. `arrow` is 1 along the line, -1 against it, 2 for
two clashing arrows (Majorana), 0 for none.

### lookupParticle, particleNames, lineStyles

```ts
lookupParticle(name: string): Particle | undefined
particleNames(): string[]
lineStyles: Record<string, EdgeStyle>
```

The registry, for reading. [Particles](../authoring/particles.md) lists every built-in name.

## Theme

### defaultTheme, themeWith

```ts
defaultTheme: Theme
themeWith(overrides?: ThemeOverrides): Theme
```

The defaults, and the defaults with your overrides merged one level deep. See
[Theme settings](../setup/theme.md).

## Errors

### FeynError

```ts
class FeynError extends Error { line?: number }
```

Thrown for a mistake in the source. `message` starts with the line number (`line 2: unclosed [`)
and `line` holds it.

## For programs and AI tools

Every SVG feynjs draws names its parts: each line is a `<g data-edge="a--b">`, each point's mark a
`<g data-vertex="b">`, and `<metadata class="feynjs-model">` holds the whole diagram as JSON. A
page script, a test or a language model can find any part and change the source by name. See
[the drawing's parts, by name](#the-drawings-parts-by-name).

Two skills for AI assistants come with the repository:
[`feynjs`](https://github.com/hepjs/feynjs/tree/main/skills/feynjs), for writing, checking and
rendering diagrams, and [`feynman-design`](https://github.com/hepjs/feynjs/tree/main/skills/feynman-design),
for designing them: what to draw, how physicists lay it out, and the physics to check. Copy a
skill's folder into your assistant's skills folder to use it.

