# feynjs in Sphinx

A small Sphinx project whose pages hold Feynman diagrams, in reST (`docs/index.rst`) and in MyST
Markdown (`docs/markdown.md`). The only setup is one line in `docs/conf.py`, the extension from
the `feynjs` Python package; the file also shows the way without it, from the CDN.

```sh
pip install sphinx myst-parser feynjs
sphinx-build -b html docs build
open build/index.html
```

A diagram is a `feynman` code block:

```rst
.. code-block:: feynman

   q qbar > Z > mu- mu+
```

or, in MyST Markdown, a fenced block. A `raw` HTML block with `<div class="feynman">` works too.
