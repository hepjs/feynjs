# Install

feynjs as an npm package: for your own programs, and the `feynjs` command.

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

## From JavaScript

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
often is cheap. Every function and option is in the [JavaScript API](api.md).

## From the command line

```sh
feynjs render diagram.feyn > diagram.svg   # SVG
feynjs tikz diagram.feyn > diagram.tex     # TikZ-Feynman, for pdflatex
feynjs check diagram.feyn                  # lint; exits 1 on an error
feynjs describe diagram.feyn               # the process, as JSON
feynjs measure diagram.feyn                # layout quality, as JSON
```

With no file, `feynjs` reads standard input. See [Command line](cli.md).

## For programs and AI tools

Every SVG feynjs draws names its parts: each line is a `<g data-edge="a--b">`, each point's mark a
`<g data-vertex="b">`, and `<metadata class="feynjs-model">` holds the whole diagram as JSON. A
page script, a test or a language model can find any part and change the source by name. See
[the drawing's parts, by name](api.md#the-drawings-parts-by-name).

## Further reading

- [JavaScript API](api.md): every function feynjs exports, with its options.
- [Command line](cli.md): every command, from SVG to TikZ-Feynman code and lint reports.
- [Theme settings](../setup/theme.md): every size, colour and layout weight, with its default.
