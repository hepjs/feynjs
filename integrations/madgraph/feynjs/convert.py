"""MadGraph diagrams as feynjs source.

MadGraph's own drawing module reads a diagram into lines and points and settles which way each
fermion line runs (drawing.FeynmanDiagram); this reads those lines as feynjs edges. feynjs then
lays the diagram out itself: MadGraph's positions are not used. A decay chain, which MadGraph
keeps as a production and its decays, is joined back into whole diagrams: each decay attached
where its particle leaves the production.
"""
import itertools
import re

import madgraph.core.drawing as drawing

# The Standard Model names, as MadGraph writes them, that feynjs knows: each draws with its own
# style, arrow and label.
KNOWN = set("""e- e+ mu- mu+ ta- ta+ ve vm vt ve~ vm~ vt~ u d s c b t u~ d~ s~ c~ b~ t~
g a Z W+ W- H h z w+ w-""".split())

# Any other particle (a new model's) is drawn by the kind of line its model gives it.
STYLE_OF_LINE = {"straight": "plain", "dashed": "scalar", "wavy": "boson", "curly": "gluon",
                 "dotted": "ghost", "double": "double", "swavy": "susy", "scurly": "susy gluon"}

# (a decay chain's combinations, production diagrams times each decay's, can be many)
MOST_COMBINATIONS = 60


def _style(line):
    """The feynjs options for one line: its particle's name, or a style and a label."""
    name = line.get_name()
    if name in KNOWN:
        return name
    family = susy_family(name)
    if family:
        return "%s, label={%s}" % (family, tex_label(name))
    kind = line.get_info("line")
    style = STYLE_OF_LINE.get(kind, "plain")
    if kind == "straight" and line.is_fermion():
        style = "fermion"
    return "%s, label={%s}" % (style, tex_label(name))


def susy_family(name):
    """feynjs's own particle for an MSSM name's family, which draws it as papers do (a gluino
    curly with a line through it, neutralinos and charginos wavy with a line through, squarks and
    sleptons dashed), or None; the label stays the particle's own."""
    core = name[:-1] if name.endswith("~") else name
    if core == "go":
        return "gluino"
    if re.match(r"^n\d$", core):
        return "neutralino1"
    m = re.match(r"^x\d([+-])$", core)
    if m:
        return "chargino" + m.group(1)
    if re.match(r"^[udscbt][lr12]$", core):
        return "squark"
    if re.match(r"^sv\d", core):
        return "sneutrino"
    if re.match(r"^sl\d", core):
        return "slepton"
    return None


def tex_label(name):
    """A label for a particle feynjs does not know, by its MadGraph name: the MSSM's names as
    papers write them (go a gluino, n1 a neutralino, x1+ a chargino, t1 and ul squarks, sl1- a
    slepton), else the name itself, upright."""
    bar = name.endswith("~")
    core = name[:-1] if bar else name
    m = re.match(r"^(x)(\d)([+-])$", core)
    if m:
        return "\\tilde\\chi^%s_%s" % (m.group(3), m.group(2))
    m = re.match(r"^n(\d)$", core)
    if m:
        return "\\tilde\\chi^0_%s" % m.group(1)
    if core == "go":
        return "\\tilde g"
    m = re.match(r"^([udscbt])([lr12])$", core)
    if m:
        squark = "\\tilde %s_{%s}" % (m.group(1), m.group(2).upper() if m.group(2) in "lr" else m.group(2))
        return "\\bar{%s}" % squark if bar else squark
    m = re.match(r"^(sv|sl|ta|mu|e)(\d?)([lr]?)([+-]?)$", core)
    if m and core.startswith(("sv", "sl")):
        base = "\\tilde\\nu" if m.group(1) == "sv" else "\\tilde\\ell"
        return "%s_{%s}%s" % (base, m.group(2) or "", "^" + m.group(4) if m.group(4) else "")
    for higgs, tex in (("h01", "h"), ("h02", "H"), ("a0", "A"), ("h+", "H^+"), ("h-", "H^-")):
        if core == higgs:
            return tex
    return "\\mathrm{%s}" % name


def p_in(point, edge):
    return point in (edge[0], edge[2])


class Piece:
    """One diagram as feynjs edges: (from, options, to, particle id), with its legs by number."""

    def __init__(self, diagram, model, process, prefix=""):
        picture = drawing.FeynmanDiagram(diagram, model, opt=drawing.DrawOption())
        picture.main()
        initial = len([leg for leg in process.get("legs") if not leg.get("state")])
        names, inner = {}, [0]

        def name_of(point):
            if id(point) not in names:
                if point.is_external():
                    number = point.lines[0].number
                    names[id(point)] = ("%si%d" if number <= initial else "%sf%d") % (prefix, number)
                else:
                    inner[0] += 1
                    names[id(point)] = "%sv%d" % (prefix, inner[0])
            return names[id(point)]

        # (MadGraph runs each fermion line the way its arrow points; feynjs turns an
        # antiparticle's arrow round itself, so a line named by an antiparticle, e+ or t~, is
        # written from its other end)
        def edge(line):
            a, b, style = name_of(line.begin), name_of(line.end), _style(line)
            return [b, style, a, abs(line.id)] if line.id < 0 and style in KNOWN else [a, style, b, abs(line.id)]
        self.edges = [edge(line) for line in picture.lineList]
        self.prefix = prefix
        self.process = process
        # (each leg's particle by its signed id, as the process lists it: a t and a t~ differ)
        listed = process.get("legs")
        self.legs = {}
        for line in picture.lineList:
            for point in (line.begin, line.end):
                if point.is_external():
                    self.legs[name_of(point)] = listed[line.number - 1].get("id")

    def outgoing_of(self, pid, taken):
        """The first outgoing leg of particle `pid` not yet given a decay."""
        for name in sorted((n for n in self.legs if n[len(self.prefix)] == "f"), key=lambda n: int(n[len(self.prefix) + 1:])):
            if self.legs[name] == pid and name not in taken:
                return name
        return None

    def attach(self, leg, decay):
        """`decay`, a diagram of the particle leaving at `leg`, put in place of the leg: its own
        incoming leg removed, and the line into it joined to the production's line out."""
        incoming = next(n for n in decay.legs if n[len(decay.prefix)] == "i")
        inside = [e for e in decay.edges if incoming not in (e[0], e[2])]
        start = next(e for e in decay.edges if incoming in (e[0], e[2]))
        first = start[2] if start[0] == incoming else start[0]
        for e in self.edges:
            for k in (0, 2):
                if e[k] == leg:
                    e[k] = first
        self.edges += inside
        del self.legs[leg]
        self.legs.update({n: p for n, p in decay.legs.items() if n != incoming})

    def merge_pass_throughs(self):
        """A point with just two lines of one particle (where a decay was joined on, or a
        MadGraph point that carries a line straight on) is no vertex: the two lines become one."""
        while True:
            count = {}
            for a, _, b, _ in self.edges:
                count[a] = count.get(a, 0) + 1
                count[b] = count.get(b, 0) + 1
            point = next((p for p, n in count.items() if n == 2 and p not in self.legs
                          and len({e[3] for e in self.edges if p in (e[0], e[2])}) == 1), None)
            if point is None:
                return
            into, out = [e for e in self.edges if p_in(point, e)]
            # (the line keeps its way: from the far end of the line in, to the far end of the line out)
            start = into[0] if into[2] == point else into[2]
            end = out[2] if out[0] == point else out[0]
            if into[2] != point:
                start, end = end, start
            self.edges = [e for e in self.edges if e is not into and e is not out] + [[start, into[1], end, into[3]]]

    def source(self):
        self.merge_pass_throughs()
        legs = sorted(self.legs, key=lambda n: (n.count("_"), n))
        # (the incoming legs in MadGraph's order; the outgoing ones left to feynjs, which orders
        # them so that no lines cross: a fixed order, MadGraph's numbering, would force crossings)
        head = ["in: " + " ".join(n for n in legs if n.split("_")[-1][0] == "i")]
        return "\n".join(head + ["%s -- [%s] %s" % (a, o, b) for a, o, b, _ in self.edges]) + "\n"


def _joined(chain, model, prefix, budget):
    """Whole diagrams (Pieces) of a decay chain (a DecayChainAmplitude): each of its own
    diagrams with a decay joined on wherever a particle it decays leaves (every gluino of a
    gluino pair, as MadGraph reads `(go > t t~ n1)`), decays within decays too; at most budget[0]."""
    chains = [(sub.get("amplitudes")[0].get("process").get("legs")[0].get("id"), sub) for sub in chain.get("decay_chains")]
    for core in chain.get("amplitudes"):
        process = core.get("process")
        for diagram in core.get("diagrams"):
            base = Piece(diagram, model, process, prefix)
            # (the legs that decay, each with its own decays' whole diagrams, made under its own name)
            places, options, taken = [], [], set()
            for pid, sub in chains:
                while True:
                    leg = base.outgoing_of(pid, taken)
                    if leg is None:
                        break
                    taken.add(leg)
                    places.append(leg)
                    options.append(list(_joined(sub, model, "%sd%d_" % (prefix, len(places)), [budget[0]])))
            for choice in itertools.product(*options):
                if budget[0] <= 0:
                    return
                whole = Piece(diagram, model, process, prefix)
                for leg, decay in zip(places, choice):
                    whole.attach(leg, decay)
                budget[0] -= 1
                yield whole


def whole_diagrams(amplitude, model):
    """(process, number, feynjs source) for every diagram of an amplitude; a decay chain's
    production and decays, to any depth, joined into whole diagrams (at most MOST_COMBINATIONS)."""
    if "decay_chains" not in amplitude:
        process = amplitude.get("process")
        return [(process, n, Piece(d, model, process).source()) for n, d in enumerate(amplitude.get("diagrams"), 1)]
    return [(whole.process, n, whole.source()) for n, whole in enumerate(_joined(amplitude, model, "", [MOST_COMBINATIONS]), 1)]
