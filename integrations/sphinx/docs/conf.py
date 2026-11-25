# A Sphinx project with feynjs diagrams. Build it with:
#   pip install sphinx myst-parser
#   sphinx-build -b html docs build
project = "Feynman diagrams in Sphinx"
extensions = ["myst_parser"]  # for the Markdown page; reST needs nothing more
source_suffix = {".rst": "restructuredtext", ".md": "markdown"}

# feynjs, from the CDN: it draws every feynman code block once the page loads
html_js_files = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
# Or without the CDN: download the file once into docs/_static/,
#   curl -L -o docs/_static/feynjs.min.js https://github.com/hepjs/feynjs/releases/latest/download/feynjs.min.js
# and load it from there instead:
# html_static_path = ["_static"]
# html_js_files = ["feynjs.min.js"]

# Sphinx has no highlighter for the feynman language; the block is drawn, not highlighted
suppress_warnings = ["misc.highlighting_failure"]
