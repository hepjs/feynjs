# Hand-over format

```feynman
% feynjs-interchange 1
in: i1 i2
i1 -- [e-] v1
v1 -- [e-] i2
v1 -- [Z] v2
v2 -- [mu-] f1
f2 -- [mu-] v2
```

```json
{
  "incoming": ["i1", "i2"],
  "edges": [
    { "from": "i1", "to": "v1", "particle": "e-" },
    { "from": "v1", "to": "i2", "particle": "e-" },
    { "from": "v1", "to": "v2", "particle": "Z" },
    { "from": "v2", "to": "f1", "particle": "mu-" },
    { "from": "f2", "to": "v2", "particle": "mu-" }
  ]
}
```

The two say the same: the data is written out as the source above (`toSource`), and then read,
laid out and drawn by the same code, so the two never differ.

## Version 1

A hand-over file starts with the line `% feynjs-interchange 1`, so feynjs knows which version of
the format it was written in. It is a comment to anything else. feynjs reads version 1; `check`
warns about a file that names a newer one. The version changes only when a file of the old
version would be read differently.

Version 1 is feynjs source written with a small, fixed set of lines:

| Line | Says |
|---|---|
| `% feynjs-interchange 1` | the version, first |
| `in: i1 i2` | the incoming legs, top to bottom |
| `out: f3 f4` | the outgoing legs, top to bottom; leave it out and feynjs orders them so that no lines cross |
| `key: value` | a switch for the whole diagram (`layout: grid`, `colour flow: on`) |
| `v [particle={e-}, label={g_Z}, dot]` | a point's particle (or its label, as TeX, when no particle has that name), its coupling, its shape |
| `v at (x, y)` | where to hold a point |
| `a -- [STYLE] b` | a line, from `a` to `b` |

`STYLE` is a particle's name, which sets the line's style, arrow and label (`e-`, `t~`, `W+`,
`gluino`: see [All particles](../authoring/particles.md)), or a line style with a label
(`fermion, label={\tilde\chi^0_2}`), or both.

**Arrows.** A fermion line written with a particle's name points the way that particle travels
from `a` to `b`; an antiparticle's name (`e+`, `t~`) turns it round. To draw an arrow from `a` to
`b` for an antiparticle, write the line from `b` to `a`, as the MadGraph plugin does.

**Names.** A point's name is letters, digits, `_` and `'`. Names carry over to the drawing: the
SVG names every point and line by them (`data-vertex`, `data-edge`) and holds the diagram as data
in `<metadata class="feynjs-model">`, so a program can find in the picture any part it handed
over. The MadGraph plugin names legs by MadGraph's own numbers (`i1`, `f3`), inner points `v1`,
`v2`, and the points of a decay it joins on with a prefix (`d1_`, and `d1_d1_` for a decay within
it).

## As data

Every function that takes source text takes the diagram as data too: `render`, `check`,
`describe`, `explain`, `measure` and `toTikz`. The command line reads a `.json` file, or JSON on
standard input, as data.

```js
import { render, toSource } from "feynjs";

const diagram = {
  incoming: ["i1", "i2"],
  edges: [
    { from: "i1", to: "v", particle: "g" },
    { from: "i2", to: "v", particle: "g" },
    { from: "v", to: "h", particle: "H" },
  ],
};
render(diagram);     // the SVG
toSource(diagram);   // the source, in the hand-over format
```

| Field | Holds |
|---|---|
| `incoming`, `outgoing` | leg names, top to bottom (`outgoing` best left out) |
| `edges` | `{ from, to, particle?, style?, label?, options? }` |
| `vertices` | `{ id, particle?, coupling?, shape?, at?: [x, y], options? }`, only for points that need one of these |
| `switches` | `{ "colour flow": "on", layout: "grid" }` |

The fields match the data feynjs writes into every SVG it draws, so a program reads and writes
the same shapes. Bad data is refused with the reason: a name with a space, a label whose braces
do not pair.
