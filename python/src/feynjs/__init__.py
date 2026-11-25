"""feynjs for Python: the feynjs engine, bundled, for Sphinx and Jupyter.

feynjs lays out and draws Feynman diagrams from text. The engine is JavaScript and runs in the
page; this package carries it, so a Sphinx site or a notebook draws diagrams with nothing loaded
from the network.

- Sphinx: add ``"feynjs.sphinx"`` to ``extensions``; every ``feynman`` code block is drawn.
- Jupyter: ``feynjs.Diagram("e- e+ > Z > mu- mu+")`` shows the diagram.

Docs: https://hepjs.github.io/feynjs/
"""

from __future__ import annotations

import html
import itertools
from pathlib import Path

__version__ = "0.10.1"

#: The bundled script, feynjs.min.js.
SCRIPT = Path(__file__).parent / "static" / "feynjs.min.js"

__all__ = ["Diagram", "SCRIPT", "script", "__version__"]


def script() -> str:
    """The feynjs script, as text: one file, no dependencies, defining the global ``feynjs``."""
    return SCRIPT.read_text(encoding="utf-8")


_ids = itertools.count(1)


class Diagram:
    """A Feynman diagram from feynjs source, shown as a drawing in Jupyter.

    >>> Diagram("p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)")

    The notebook draws it in the browser, with the script carried in the output, so it needs no
    network and still draws when the notebook is opened again.
    """

    def __init__(self, source: str):
        self.source = source.strip("\n")

    def __repr__(self) -> str:
        return f"Diagram({self.source!r})"

    def _repr_html_(self) -> str:
        n = next(_ids)
        element = f"feynjs-diagram-{n}"
        return (
            f'<div class="feynman" id="{element}">{html.escape(self.source)}</div>'
            # (the script once per page: later outputs find it already there)
            "<script>(function(){"
            "if(!window.feynjs){var s=document.createElement('script');"
            f"s.text={_js_string(script())};document.head.appendChild(s);}}"
            f"window.feynjs.run({{querySelector:'#{element}'}});"
            "})();</script>"
        )


def _js_string(text: str) -> str:
    """A JavaScript string literal for the text, safe inside a <script> element."""
    import json

    return json.dumps(text).replace("</", "<\\/")
