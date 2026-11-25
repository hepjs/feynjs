---
hide:
  - toc
---

# Setup

One tab for each place you can write a diagram. Each draws the same diagrams from the same text.

=== "Zensical / MkDocs"

    1.  **Load the script.** Add feynjs to the page scripts, in the `[project]` table:

        === "zensical.toml"

            ```toml
            [project]
            extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
            ```

        === "mkdocs.yml"

            ```yaml
            extra_javascript:
              - https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js
            ```

    2.  **Add the fence.** It keeps a `feynman` block as written. Without it, the highlighter turns the
        block into plain text and feynjs can't find it. If you already list `custom_fences` (for
        Mermaid, say), add the line to that list.

        === "zensical.toml"

            ```toml
            [project.markdown_extensions]
            pymdownx.superfences.custom_fences = [
              { name = "feynman", class = "feynman", format = "pymdownx.superfences.fence_div_format" },
            ]
            ```

        === "mkdocs.yml"

            ```yaml
            markdown_extensions:
              - pymdownx.superfences:
                  custom_fences:
                    - name: feynman
                      class: feynman
                      format: !!python/name:pymdownx.superfences.fence_div_format
            ```

    3.  **Write a diagram** in any page, in a `feynman` code block:

        ````markdown
        ```feynman
        i1 [q] -- a -- i2 [qbar]
        a -- [Z'] b
        f1 [chi] -- b -- f2 [chibar]
        ```
        ````

    feynjs draws the blocks once a page has loaded, and again after each instant page change.

    ### Demo

    This block, in a page of this site:

    ````markdown
    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [Z'] b
    f1 [chi] -- b -- f2 [chibar]
    ```
    ````

    draws this diagram:

    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [Z'] b
    f1 [chi] -- b -- f2 [chibar]
    ```

    Diagrams draw in `currentColor`, so they follow the light and dark palettes without being drawn
    again. A block can hold a process instead of edges:

    ````markdown
    ```feynman
    p p > gluino gluino
    gluino > q q neutralino2
    neutralino2 > Z neutralino1
    ```
    ````

    ```feynman
    p p > gluino gluino
    gluino > q q neutralino2
    neutralino2 > Z neutralino1
    ```

    ### Optional extras

    **Your own options.** To pass options to every diagram (a download button, say), call `run`
    yourself from a small script listed after feynjs; feynjs leaves what you have drawn alone:

    ```js
    document$.subscribe(() => feynjs.run({ download: true }));
    ```

    `run` takes every option in the [JavaScript API](../usage/api.md#run).

    ### Next

    - [Your first diagram](../get-started/first-diagram.md): what each line of a diagram means.
    - [Write edges, as in TikZ-Feynman](../authoring/syntax.md) or
      [write processes, as in MadGraph](../authoring/processes.md).
    - [Examples](../authoring/examples/index.md): hundreds of diagrams with their source.

=== "Obsidian"

    1.  **Get the plugin.** Download `feynjs-obsidian.zip` from the
        [latest release](https://github.com/hepjs/feynjs/releases/latest) and unzip it. It holds one
        folder, `feynjs`.

    2.  **Put it in your vault.** Move the `feynjs` folder into your vault's plugin folder,
        `<vault>/.obsidian/plugins/`. The folder `.obsidian` is hidden: on a Mac press
        ++cmd+shift+period++ in Finder to show it.

    3.  **Turn it on.** In Obsidian, open *Settings → Community plugins*, turn off *Restricted mode* if
        asked, then switch on **feynjs**.

    4.  **Write a diagram** in any note, in a `feynman` code block:

        ````markdown
        ```feynman
        e- e+ > gamma > mu- mu+
        ```
        ````

    ### Demo

    The block above draws this diagram, in Obsidian's text colour:

    ```feynman
    e- e+ > gamma > mu- mu+
    ```

    Any diagram on this site works in a note. Here is the same one, written as edges, as in
    TikZ-Feynman:

    ````markdown
    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [gamma] b
    f1 [mu-] -- b -- f2 [mu+]
    ```
    ````

    ```feynman
    i1 [e-] -- a -- i2 [e+]
    a -- [gamma] b
    f1 [mu-] -- b -- f2 [mu+]
    ```

    ### Build the plugin yourself

    To build the plugin from a checkout instead, run `node integrations/obsidian/build.mjs` and copy
    `integrations/obsidian/dist/feynjs` into the plugin folder.

    ### Next

    - [Your first diagram](../get-started/first-diagram.md): what each line of a diagram means.
    - [Write edges, as in TikZ-Feynman](../authoring/syntax.md) or
      [write processes, as in MadGraph](../authoring/processes.md).
    - [Examples](../authoring/examples/index.md): hundreds of diagrams with their source.

=== "Web page"

    ```feynman
    i1 [g] -- a
    i2 [g] -- b
    a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
    c -- [H] f1
    ```

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

    <div class="feynman">
      i1 [g] -- a
      i2 [g] -- b
      a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
      c -- [H] f1
    </div>
    ```

    The same source draws the same diagram everywhere. feynjs has no runtime dependencies. It is built
    for ES2020, so it runs in any current browser and in Node.

    ### Install

    Load it from jsDelivr. It defines one global, `feynjs`.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>
    ```

    `@0.10` follows the newest 0.10 release. To keep a copy of your own, take `dist/feynjs.min.js`
    from the package and serve it next to your page.

    ### In a web page

    Put the source in any element with the class `feynman` and call `feynjs.run()`:

    ```html
    <link rel="stylesheet" href="feynjs.css">   <!-- optional: the label font -->
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

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

    #### With another Markdown renderer

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

    For a Zensical or MkDocs site, see [Zensical setup](#setup-zensical--mkdocs).

=== "JavaScript & command line"

    ### Install

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
    often is cheap. Every function and option is in the [JavaScript API](../usage/api.md).

    ### From the command line

    ```sh
    feynjs render diagram.feyn > diagram.svg   # SVG
    feynjs tikz diagram.feyn > diagram.tex     # TikZ-Feynman, for pdflatex
    feynjs check diagram.feyn                  # lint; exits 1 on an error
    feynjs describe diagram.feyn               # the process, as JSON
    feynjs measure diagram.feyn                # layout quality, as JSON
    ```

    With no file, `feynjs` reads standard input. See [Command line](../usage/cli.md).

    ### For programs and AI tools

    Every SVG feynjs draws names its parts: each line is a `<g data-edge="a--b">`, each point's mark a
    `<g data-vertex="b">`, and `<metadata class="feynjs-model">` holds the whole diagram as JSON. A
    page script, a test or a language model can find any part and change the source by name. See
    [the drawing's parts, by name](../usage/api.md#the-drawings-parts-by-name).

    ### Further reading

    - [JavaScript API](../usage/api.md): every function feynjs exports, with its options.
    - [Command line](../usage/cli.md): every command, from SVG to TikZ-Feynman code and lint reports.
    - [Theme settings](theme.md): every size, colour and layout weight, with its default.

=== "LaTeX"

    Write a diagram in feynjs's syntax inside a LaTeX document, and get a TikZ-Feynman drawing with
    every vertex placed by feynjs. It compiles anywhere TikZ-Feynman does: pdfLaTeX, LuaLaTeX,
    XeLaTeX, Tectonic, Overleaf, arXiv (PDF and HTML) and journal production.

    ```feynman
    p p > t tbar
    t > b W+(> e+ nu)
    tbar > bbar W-(> q qbar)
    ```

    ```latex
    \usepackage{feynjs}
    ...
    \begin{feynjs}
    p p > t tbar
    t > b W+(> e+ nu)
    tbar > bbar W-(> q qbar)
    \end{feynjs}

    \feynjsset{unit=1.0}          % shorter propagators (cm) for the diagrams that follow
    \feynjsfile{diagrams/vbf.feyn}  % or a diagram kept in a file of its own
    ```

    ### Setting it up

    1. Copy [`feynjs.sty`](https://github.com/hepjs/feynjs/blob/main/integrations/latex/feynjs.sty)
       next to your document, or into your TeX tree.
    2. Install the `feynjs` command: `npm install -g feynjs`.

    ### How it works

    TeX cannot run JavaScript, and does not need to. Laying out the diagrams is a separate step, as
    `bibtex` is for citations:

    1. **LaTeX** writes each diagram's source beside the document (`paper-feynjs-1.feyn`, ...), and
       leaves a box in its place saying what to run.
    2. **`feynjs cache`** draws each one as TikZ-Feynman code with every vertex placed
       (`paper-feynjs-1.tex`, ...). Diagrams that have not changed are left alone.
    3. **LaTeX** again reads the drawings in.

    ```sh
    pdflatex paper
    feynjs cache .
    pdflatex paper
    ```

    With `--shell-escape` and `feynjs` installed, LaTeX does the middle step itself, in one run.

    Each drawing records the checksum of the source it was drawn from, so an edited diagram is noticed
    (a warning, and the box again) until it is drawn again.

    ### Overleaf, arXiv and journals

    These run neither Node.js nor shell escape. Run `feynjs cache` once on your own machine and upload
    the `*-feynjs-*.tex` files with your document: they need only TikZ-Feynman. On arXiv they compile
    with pdfLaTeX, and LaTeXML turns them into the HTML version with the waves of photons, W and Z
    kept (the package swaps TikZ-Feynman's own wave, which LaTeXML cannot draw, for one it can).

    The drawings are the same on every machine: feynjs lays a diagram out bit for bit alike on every
    processor and in every JavaScript engine, so a coauthor's `feynjs cache` gives the same paper.

    ### Without the package

    `feynjs tikz diagram.feyn` (or [`toTikz`](../usage/api.md) from code) writes one diagram as
    TikZ-Feynman code to paste in by hand. See [TikZ-Feynman](../compatibility/tikz-feynman.md) for what carries over.

=== "MadGraph"

    feynjs comes with a MadGraph plugin. MadGraph generates every diagram of a process, in any model
    it can load, and the plugin hands each one to feynjs to draw. Download `feynjs-madgraph.zip` from
    the [latest release](https://github.com/hepjs/feynjs/releases/latest), unzip it into MadGraph's
    `PLUGIN` folder (it holds one folder, `feynjs`), and start MadGraph in its mode:

    ```text
    unzip feynjs-madgraph.zip -d <MG5>/PLUGIN/
    <MG5>/bin/mg5_aMC --mode=feynjs
    MG5_aMC> generate e+ e- > t t~, t > b w+, t~ > b~ w-
    MG5_aMC> feynjs ttbar
    ```

    `feynjs DIR` writes each diagram as feynjs source, `DIR/<process>_<n>.feyn`, and a page,
    `DIR/index.html`, that draws them all; `feynjs DIR --svg` writes SVGs too, through Node's `npx`.
    A decay chain, which MadGraph keeps as a production and its decays, comes out as whole diagrams,
    each decay joined on where its particle leaves. Standard Model particles keep their MadGraph names,
    which feynjs reads; a new model's particles are drawn by the line type the model gives them and
    labelled with their TeX names.

    The [MadGraph gallery](../compatibility/madgraph-gallery.md) shows what the plugin draws. To
    write a single diagram in MadGraph's syntax by hand, see [Coming from
    MadGraph](../compatibility/madgraph.md).
