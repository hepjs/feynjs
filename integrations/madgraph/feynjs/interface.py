"""The MadGraph command `feynjs`: draw the generated diagrams with feynjs."""
import html
import os
import shutil
import subprocess

import madgraph.interface.master_interface as master_interface

from . import convert

SCRIPT = "https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"


class FeynjsInterface(master_interface.MasterCmd):
    """MadGraph's usual prompt, with one command more: `feynjs`."""

    def do_feynjs(self, line):
        """feynjs [DIR] [--svg]: every diagram of the processes generated so far, as feynjs
        source (DIR/<process>_<n>.feyn) and a page that draws them (DIR/index.html); --svg also
        writes DIR/<process>_<n>.svg through `npx feynjs` (Node)."""
        words = line.split()
        svg = "--svg" in words
        folders = [w for w in words if not w.startswith("--")]
        outdir = folders[0] if folders else "feynjs_diagrams"
        if not self._curr_amps:
            print("Generate a process first, for example: generate e+ e- > mu+ mu-")
            return
        os.makedirs(outdir, exist_ok=True)
        model = self._curr_model
        sections, written = [], []
        for amplitude in self._curr_amps:
            diagrams = convert.whole_diagrams(amplitude, model)
            if not diagrams:
                continue
            process = diagrams[0][0]
            stem = process.shell_string()
            figures = []
            for n, (_, _, source) in enumerate(diagrams, 1):
                path = os.path.join(outdir, "%s_%d.feyn" % (stem, n))
                with open(path, "w") as f:
                    # (the hand-over version first, then which diagram this is)
                    head, rest = source.split("\n", 1)
                    f.write("%s\n%% %s, diagram %d\n%s" % (head, process.nice_string().splitlines()[0], n, rest))
                written.append(path)
                figures.append('<figure><div class="feynman">%s</div><figcaption>diagram %d</figcaption></figure>' % (html.escape(source), n))
            sections.append("<section><h2>%s</h2>%s</section>" % (html.escape(process.input_string()), "".join(figures)))
        with open(os.path.join(outdir, "index.html"), "w") as f:
            f.write('<!doctype html><meta charset="utf-8"><title>Diagrams</title>'
                    "<style>body{font:15px system-ui;margin:2rem}section{display:flex;flex-wrap:wrap;gap:1rem}"
                    "h2{width:100%%;font-size:17px}figure{margin:0;border:1px solid #ddd;padding:.5rem}"
                    "figcaption{text-align:center;color:#666;font-size:13px}</style>"
                    '<script src="%s"></script>%s' % (SCRIPT, "".join(sections)))
        print("feynjs: %d diagrams, and %s to see them" % (len(written), os.path.join(outdir, "index.html")))
        if svg:
            npx = shutil.which("npx")
            if not npx:
                print("feynjs: --svg needs Node (npx); the page draws the diagrams without it")
                return
            for path in written:
                with open(path[:-5] + ".svg", "w") as out:
                    subprocess.run([npx, "-y", "feynjs", "render", path], stdout=out, check=False)
            print("feynjs: SVGs written beside the sources")

    def help_feynjs(self):
        print(self.do_feynjs.__doc__)
