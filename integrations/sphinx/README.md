# feynjs in Sphinx

A small Sphinx project whose pages hold Feynman diagrams, in reST (`docs/index.rst`) and in MyST
Markdown (`docs/markdown.md`). The only setup is three lines in `docs/conf.py`: the script, and a
setting that silences Sphinx's warning about the `feynman` language it cannot highlight.

```sh
pip install sphinx myst-parser
sphinx-build -b html docs build
open build/index.html
```

A diagram is a `feynman` code block:

```rst
.. code-block:: feynman

   q qbar > Z > mu- mu+
```

or, in MyST Markdown, a fenced block. A `raw` HTML block with `<div class="feynman">` works too.
