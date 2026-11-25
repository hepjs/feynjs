# Jupyter

In a notebook, a diagram is a Python object that draws itself.

```sh
pip install feynjs
```

```python
from feynjs import Diagram

Diagram("p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)")
```

The cell's output is the diagram:

```feynman
p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)
```

`Diagram` takes any feynjs source, one line or many:

```python
Diagram("""
i1 [e-] -- a -- i2 [e+]
a [dot, label=e] -- [gamma] b [dot, label=e]
f1 [mu-] -- b -- f2 [mu+]
""")
```

The package carries the feynjs script, and each output carries it into the notebook the first
time, so a notebook draws with no network and still draws when it is opened again. It works in
JupyterLab, Jupyter Notebook and VS Code, which run the scripts in a trusted notebook's outputs; a
viewer that shows outputs without running them (GitHub's notebook preview, say) shows nothing.

`feynjs.SCRIPT` is the path of the bundled `feynjs.min.js`, and `feynjs.script()` its text, for
another tool that serves a page.
