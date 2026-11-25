# Sphinx

A Sphinx project draws every `feynman` code block, in reST or in MyST Markdown, once the script is
loaded.

1.  **Load the script** in `conf.py`, and silence the warning Sphinx gives for a code block's
    language it cannot highlight:

    ```python
    html_js_files = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
    suppress_warnings = ["misc.highlighting_failure"]
    ```

2.  **Write a diagram.** In reST, a `code-block`:

    ```rst
    .. code-block:: feynman

       e- e+ > Z > mu- mu+
    ```

    In MyST Markdown (with `myst_parser` in `extensions`), a fenced block:

    ````markdown
    ```feynman
    g g > {t} > H
    ```
    ````

    Both are drawn as:

    ```feynman
    e- e+ > Z > mu- mu+
    ```

The script finds Sphinx's code blocks (`<div class="highlight-feynman">`) on its own. Where a page
should hold HTML instead, a `raw` block works too, in reST or MyST:

```rst
.. raw:: html

   <div class="feynman">
   p p > t t~
   </div>
```

The diagrams take the page's text colour, so they follow a theme's light and dark modes. Tested
with Sphinx 9 and MyST-Parser, in the default theme.

A small project with diagrams in both reST and MyST Markdown, ready to build, is in the
repository: [integrations/sphinx](https://github.com/hepjs/feynjs/tree/main/integrations/sphinx).
