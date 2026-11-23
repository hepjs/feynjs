---
tags:
  - script tag
  - Zensical
  - MkDocs
  - Markdown
  - HTML
  - React
  - Obsidian
  - notes
  - command line
  - CLI
---

# Where to use it

***Put diagrams on a web page, in a Zensical or MkDocs site, in Obsidian notes, in a JavaScript program or a shell script. On a web page, one script tag is enough.***

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

The same source draws the same diagram everywhere. Pick the way that fits your project.

## In a Zensical or MkDocs site

This site is built this way. A `feynman` code block in any page becomes a diagram, and its source
stays readable in the markdown.

**1. Copy the files** into your `docs/` folder. The library itself comes from jsDelivr (step 3).

| File | From | What it does |
|---|---|---|
| `javascripts/feynjs-init.js` | below | draws the blocks on every page |
| `stylesheets/feynjs.css` | this site's `docs/stylesheets/feynjs.css` | the label font and the colours for light and dark (optional) |
| `fonts/NewCM10-Book.otf`, `fonts/NewCM10-BookItalic.otf` | this site's `docs/fonts/` | New Computer Modern, the face of the labels (optional) |

**2. Draw the blocks** with a one-line `feynjs-init.js`. `document$` fires on the first load and
again after each instant page change:

```js
document$.subscribe(() => feynjs.run({ querySelector: "div.feynman:not([data-processed])" }));
```

**3. Register the fence** and the files in your configuration:

=== "zensical.toml"

    ```toml
    [project]
    extra_css = ["stylesheets/feynjs.css"]
    extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js", "javascripts/feynjs-init.js"]

    [project.markdown_extensions]
    pymdownx.superfences.custom_fences = [
      { name = "feynman", class = "feynman", format = "pymdownx.superfences.fence_div_format" },
    ]
    ```

=== "mkdocs.yml"

    ```yaml
    extra_css:
      - stylesheets/feynjs.css
    extra_javascript:
      - https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js
      - javascripts/feynjs-init.js
    markdown_extensions:
      - pymdownx.superfences:
          custom_fences:
            - name: feynman
              class: feynman
              format: !!python/name:pymdownx.superfences.fence_div_format
    ```

**4. Write diagrams** in any page:

````markdown
```feynman
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
f1 [chi] -- b -- f2 [chibar]
```
````

```feynman
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
f1 [chi] -- b -- f2 [chibar]
```

Diagrams draw in `currentColor`, so they follow the light and dark palettes without being drawn
again.

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

### With another markdown renderer

Most markdown renderers turn a fenced block into `<pre><code class="language-feynman">`. Swap
each one for its diagram:

```js
document.querySelectorAll("pre > code.language-feynman").forEach((code) => {
  const figure = document.createElement("div");
  figure.className = "feynman";
  figure.innerHTML = feynjs.render(code.textContent);
  code.parentElement.replaceWith(figure);
});
```

## In Obsidian

The feynjs plugin draws a `feynman` code block in any note, in Obsidian's text colour, so it
follows light and dark themes. Everything it needs is inside the plugin, so it works offline.

**1. Get the plugin.** Download `feynjs-obsidian.zip` from the
[latest release](https://github.com/hepjs/feynjs/releases/latest) and unzip it. It holds one
folder, `feynjs`.

**2. Put it in your vault.** Move the `feynjs` folder into your vault's plugin folder,
`<vault>/.obsidian/plugins/`. The folder `.obsidian` is hidden: on a Mac press
++cmd+shift+period++ in Finder to show it.

**3. Turn it on.** In Obsidian, open *Settings → Community plugins*, turn off *Restricted mode* if
asked, then switch on **feynjs**.

**4. Write a diagram** in any note:

````markdown
```feynman
e+ e- > mu+ mu-
```
````

To build the plugin from a checkout instead, run `node integrations/obsidian/build.mjs` and copy
`integrations/obsidian/dist/feynjs` into the plugin folder.

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
often is cheap.

## From the command line

```sh
feynjs render diagram.feyn > diagram.svg   # SVG
feynjs tikz diagram.feyn > diagram.tex     # TikZ-Feynman, for pdflatex
feynjs check diagram.feyn                  # lint; exits 1 on an error
feynjs describe diagram.feyn               # the process, as JSON
feynjs measure diagram.feyn                # layout quality, as JSON
```

With no file, `feynjs` reads standard input. See the [command line reference](../reference/cli.md).
