---
hide:
  - toc
---

# Get started

feynjs draws a Feynman diagram from a few lines of text. The quickest way to see it: add one
script to a page, and write a diagram in a `feynman` block.

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

<div class="feynman">
e- e+ > Z > mu- mu+
</div>
```

```feynman
e- e+ > Z > mu- mu+
```

That is all a web page needs. For a docs site, a notebook, a note, a talk or a paper, see
[the list below](#where-you-write): Zensical and MkDocs, Sphinx, Jupyter, Obsidian and LaTeX each take a
line or two. Or try it with no setup at all in the [playground](../playground.md).

[Your first diagram](first-diagram.md){ .md-button .md-button--primary }
[Where you write](#where-you-write){ .md-button }

## Where you write

Every option draws the same diagrams from the same text.

<div class="grid cards feynjs-start" markdown>

-   **Zensical or MkDocs**

    A docs site: every <code>feynman</code> block in your Markdown becomes a diagram.

    ```toml
    extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
    ```

    [Set up a site](zensical.md){ .md-button .md-button--primary }

-   **Sphinx**

    A Sphinx project: <code>feynman</code> code blocks in reST or MyST Markdown become diagrams.

    ```python
    # pip install feynjs
    extensions = ["feynjs.sphinx"]
    ```

    [Set up Sphinx](sphinx.md){ .md-button }

-   **Obsidian**

    Your notes: the same <code>feynman</code> blocks, drawn in the note's own colours.

    ```text
    feynjs-obsidian.zip  →  .obsidian/plugins/feynjs/
    ```

    [Set up Obsidian](obsidian.md){ .md-button .md-button--primary }

-   **A web page**

    Any page: one script tag, and every <code>feynman</code> block or <code>&lt;div class="feynman"&gt;</code> is drawn.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>
    ```

    [Use it in a page](web.md){ .md-button }

-   **LaTeX**

    A paper: write diagrams in feynjs syntax; they compile as TikZ-Feynman, on Overleaf and arXiv too.

    ```latex
    \usepackage{feynjs}
    \begin{feynjs}
    p p > t tbar
    \end{feynjs}
    ```

    [Set up LaTeX](latex.md){ .md-button }

-   **JavaScript**

    Your own program: <code>render</code> gives the SVG, <code>toTikz</code> the TikZ.

    ```js
    // npm install feynjs
    import { render } from "feynjs";
    const svg = render("g g > {t} > H");
    ```

    [The API](api.md){ .md-button }

-   **Jupyter**

    A notebook: a diagram is a Python object that draws itself.

    ```python
    # pip install feynjs
    from feynjs import Diagram
    Diagram("g g > {t} > H")
    ```

    [Use it in Jupyter](jupyter.md){ .md-button }

-   **The command line**

    A shell: draw, check, describe or measure a diagram from a file.

    ```sh
    npx feynjs render diagram.feyn > diagram.svg
    ```

    [The commands](cli.md){ .md-button }

-   **MadGraph**

    Every diagram of a process MadGraph generates, decay chains joined into whole diagrams.

    ```text
    mg5_aMC --mode=feynjs
    ```

    [Set up MadGraph](../setup/madgraph.md#the-plugin){ .md-button }

-   **Just try it**

    No setup: type a diagram in the browser, drag its points, and take it away as SVG, PNG or TikZ.

    [Open the playground](../playground.md){ .md-button }

</div>

After a diagram is in place: [check](../authoring/checks.md) it, [export](../setup/export.md) it as SVG, PNG or
TikZ, and [upgrade](upgrading.md) to a new release. [Browsers and Node](browsers.md) says where it
runs.

**Next:** [Your first diagram](first-diagram.md) explains what each line means, and
[How it works](../authoring/index.md) builds a diagram up a layer at a time.
