# A Sphinx project with feynjs diagrams. Build it with:
#   pip install sphinx myst-parser feynjs
#   sphinx-build -b html docs build
project = "Feynman diagrams in Sphinx"
# feynjs.sphinx serves the feynjs script with the site and draws every feynman code block;
# myst_parser is only for the Markdown page
extensions = ["myst_parser", "feynjs.sphinx"]
source_suffix = {".rst": "restructuredtext", ".md": "markdown"}

# Without the Python package, load the script from the CDN instead, and silence the warning
# Sphinx gives for a language it cannot highlight:
# html_js_files = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
# suppress_warnings = ["misc.highlighting_failure"]
