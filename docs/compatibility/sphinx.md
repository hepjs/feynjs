# Sphinx

A Sphinx project draws every `feynman` code block, in reST or in MyST Markdown.

1.  **Add the extension.** Install the Python package, which carries feynjs, and list it in
    `conf.py`:

    ```sh
    pip install feynjs
    ```

    ```python
    extensions = ["feynjs.sphinx"]
    ```

    The extension serves the script with your site (nothing is loaded from the network) and tells
    Sphinx that `feynman` blocks are plain text, so a strict build (`-W`) passes.

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

## Without the Python package

Load the script from the CDN in `conf.py`, and silence the warning Sphinx gives for a code block's
language it cannot highlight:

```python
html_js_files = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
suppress_warnings = ["misc.highlighting_failure"]
```

### Or a copy of your own

Download `feynjs.min.js` once, from the latest release or from the npm package:

```sh
curl -L -o feynjs.min.js https://github.com/hepjs/feynjs/releases/latest/download/feynjs.min.js
# or: npm install feynjs, then copy node_modules/feynjs/dist/feynjs.min.js
```

It is one file of about 350 KB, with no dependencies, so it works with no network: behind a
firewall, offline, or on a site that loads nothing from other servers. To update, download it
again.

Put it in the project's `_static/` folder and load it from there in `conf.py`:

```python
html_static_path = ["_static"]
html_js_files = ["feynjs.min.js"]
```

The diagrams take the page's text colour, so they follow a theme's light and dark modes. Tested
with Sphinx 9 and MyST-Parser, in the default theme.

A small project with diagrams in both reST and MyST Markdown, ready to build, is in the
repository: [integrations/sphinx](https://github.com/hepjs/feynjs/tree/main/integrations/sphinx).
