"""feynjs for MadGraph5_aMC@NLO: every diagram MadGraph generates, drawn by feynjs.

Install: copy this folder into MadGraph's PLUGIN directory, then start MadGraph with
`./bin/mg5_aMC --mode=feynjs`. After `generate`, the command `feynjs [DIR]` writes each diagram
as feynjs source and a page that draws them all; `feynjs DIR --svg` also writes SVGs, through
`npx feynjs` (Node), when it is there.
"""
from . import interface

new_interface = interface.FeynjsInterface
new_output = {}
latest_validated_version = (3, 8, 1)
minimal_mg5amcnlo_version = (3, 0, 0)
maximal_mg5amcnlo_version = (1000, 1000, 1000)
