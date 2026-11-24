---
tags:
  - script tag
  - HTML
  - npm
  - JavaScript
  - React
  - command line
  - CLI
  - data-edge
---

# Use feynjs from code

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>

<div class="feynman">
  i1 [g] -- a
  i2 [g] -- b
  a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
  c -- [H] f1
</div>
```

The same source draws the same diagram everywhere. feynjs has no runtime dependencies. It is built
for ES2020, so it runs in any current browser and in Node.

## Install

=== "npm"

    ```sh
    npm install feynjs
    ```

    ```js
    import { render } from "feynjs";
    ```

=== "Script tag"

    Load it from jsDelivr. It defines one global, `feynjs`.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>
    ```

    `@0.9` follows the newest 0.9 release. To keep a copy of your own, take `dist/feynjs.min.js`
    from the package and serve it next to your page.

=== "From source"

    ```sh
    git clone https://github.com/hepjs/feynjs.git && cd feynjs
    npm install
    npm run build      # dist/feynjs.mjs (ES module) and dist/feynjs.min.js (script tag)
    ```

## In a web page

Put the source in any element with the class `feynman` and call `feynjs.run()`:

```html
<link rel="stylesheet" href="feynjs.css">   <!-- optional: the label font -->
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>

<div class="feynman">
  i1 [g] -- a
  i2 [g] -- b
  a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
  c -- [H] f1
</div>

<script>feynjs.run()</script>
```

`run` replaces each matching element's text with its diagram and marks it as done, so it is safe
to call again after adding content. `feynjs.run({ download: true })` also gives each diagram a
download icon, offering it as SVG or PNG. If a source has a mistake, the element shows the message and
the source instead, in a `pre.feynjs-error`.

### With another Markdown renderer

Most Markdown renderers turn a fenced block into `<pre><code class="language-feynman">`. Swap
each one for its diagram:

```js
document.querySelectorAll("pre > code.language-feynman").forEach((code) => {
  const figure = document.createElement("div");
  figure.className = "feynman";
  figure.innerHTML = feynjs.render(code.textContent);
  code.parentElement.replaceWith(figure);
});
```

For a Zensical or MkDocs site, see [Zensical setup](../get-started/zensical.md).

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
often is cheap. Every function and option is in the [JavaScript API](../reference/api.md).

## From the command line

```sh
feynjs render diagram.feyn > diagram.svg   # SVG
feynjs tikz diagram.feyn > diagram.tex     # TikZ-Feynman, for pdflatex
feynjs check diagram.feyn                  # lint; exits 1 on an error
feynjs describe diagram.feyn               # the process, as JSON
feynjs measure diagram.feyn                # layout quality, as JSON
```

With no file, `feynjs` reads standard input. See [Command line](../reference/cli.md).

## For programs and AI tools

Every SVG feynjs draws names its parts: each line is a `<g data-edge="a--b">`, each point's mark a
`<g data-vertex="b">`, and `<metadata class="feynjs-model">` holds the whole diagram as JSON. A
page script, a test or a language model can find any part and change the source by name. See
[the drawing's parts, by name](../reference/api.md#the-drawings-parts-by-name).

## Reference

- [JavaScript API](../reference/api.md): every function feynjs exports, with its options.
- [Command line](../reference/cli.md): every command, from SVG to TikZ-Feynman code and lint reports.
- [Theme settings](../reference/theme.md): every size, colour and layout weight, with its default.
