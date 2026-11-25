---
hide:
  - toc
tags:
  - get started
  - setup
  - Zensical
  - MkDocs
  - Obsidian
  - LaTeX
  - JavaScript
  - MadGraph
---

# Get started

Pick where you write. Every option draws the same diagrams from the same text.
{ .feynjs-start-lead }

<div class="grid cards feynjs-start" markdown>

-   **Zensical or MkDocs**

    A docs site: every <code>feynman</code> block in your Markdown becomes a diagram.

    ```toml
    extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
    ```

    [Set up a site](setup.md#setup-zensical--mkdocs){ .md-button .md-button--primary }

-   **Obsidian**

    Your notes: the same <code>feynman</code> blocks, drawn in the note's own colours.

    ```text
    feynjs-obsidian.zip  →  .obsidian/plugins/feynjs/
    ```

    [Set up Obsidian](setup.md#setup-obsidian){ .md-button .md-button--primary }

-   **A web page**

    Any page: one script tag, and every <code>feynman</code> block or <code>&lt;div class="feynman"&gt;</code> is drawn.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>
    ```

    [Use it in a page](setup.md#setup-web-page){ .md-button }

-   **LaTeX**

    A paper: write diagrams in feynjs syntax; they compile as TikZ-Feynman, on Overleaf and arXiv too.

    ```latex
    \usepackage{feynjs}
    \begin{feynjs}
    p p > t tbar
    \end{feynjs}
    ```

    [Set up LaTeX](setup.md#setup-latex){ .md-button }

-   **JavaScript**

    Your own program: <code>render</code> gives the SVG, <code>toTikz</code> the TikZ.

    ```js
    // npm install feynjs
    import { render } from "feynjs";
    const svg = render("g g > {t} > H");
    ```

    [The API](../guide/api.md){ .md-button }

-   **The command line**

    A shell: draw, check, describe or measure a diagram from a file.

    ```sh
    npx feynjs render diagram.feyn > diagram.svg
    ```

    [The commands](../guide/cli.md){ .md-button }

-   **MadGraph**

    Every diagram of a process MadGraph generates, decay chains joined into whole diagrams.

    ```text
    mg5_aMC --mode=feynjs
    ```

    [Set up MadGraph](setup.md#setup-madgraph){ .md-button }

-   **Just try it**

    No setup: type a diagram in the browser, drag its points, and take it away as SVG, PNG or TikZ.

    [Open the playground](../playground.md){ .md-button }

</div>

New to the syntax? **[Your first diagram](first-diagram.md)** explains what each line means, from
one example.
{ .feynjs-start-next }

[Your first diagram](first-diagram.md){ .md-button .md-button--primary }
[Upgrading](about.md#upgrading){ .md-button }
[Browser support](about.md#browser-support){ .md-button }
{ .feynjs-start-buttons }
