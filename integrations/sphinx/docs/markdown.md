# In MyST Markdown

A fenced `feynman` block is drawn as in reST.

```feynman
g g > {t} > H
H > Z Z
Z > l+ l-
```

A loop and a hadron, every line written out:

```feynman
in: u d
out: mu nu
u [u] -- [fermion] a -- [fermion] d [\bar{d}]
a -- [W+] b
mu [mu+] -- [fermion] b -- [fermion] nu [nu_mu]
hadron: \pi^+ = u d [brace]
```
