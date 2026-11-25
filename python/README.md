# feynjs for Python

[feynjs](https://hepjs.github.io/feynjs/) lays out and draws Feynman diagrams from text. This
package carries its engine for Python projects: a Sphinx extension and a Jupyter display, with
nothing loaded from the network.

```sh
pip install feynjs
```

## Sphinx

In `conf.py`:

```python
extensions = ["feynjs.sphinx"]
```

Every `feynman` code block, in reST or MyST Markdown, is then drawn:

```rst
.. code-block:: feynman

   p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

## Jupyter

```python
from feynjs import Diagram
Diagram("e- e+ > Z > mu- mu+")
```

## The script

`feynjs.SCRIPT` is the path of the bundled `feynjs.min.js`, and `feynjs.script()` its text, for
any other tool that serves a page.

The syntax, and feynjs for the web, Markdown sites, Obsidian and LaTeX:
https://hepjs.github.io/feynjs/
