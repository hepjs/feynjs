"""A Sphinx extension: every ``feynman`` code block, in reST or MyST Markdown, is drawn by feynjs.

In ``conf.py``::

    extensions = ["feynjs.sphinx"]

The extension serves the bundled script with the site (nothing is loaded from the network) and
tells Sphinx that ``feynman`` blocks are plain text, so it does not warn that it cannot highlight
them. Then::

    .. code-block:: feynman

       e- e+ > Z > mu- mu+
"""

from __future__ import annotations

from pathlib import Path

from . import SCRIPT, __version__


def setup(app):
    from pygments.lexers.special import TextLexer

    app.add_lexer("feynman", TextLexer)
    app.connect("builder-inited", _serve_script)
    app.add_js_file("feynjs.min.js")
    return {"version": __version__, "parallel_read_safe": True, "parallel_write_safe": True}


def _serve_script(app):
    static = str(Path(SCRIPT).parent)
    if static not in app.config.html_static_path:
        app.config.html_static_path.append(static)
