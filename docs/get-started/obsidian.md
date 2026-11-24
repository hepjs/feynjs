---
tags:
  - Obsidian
  - notes
  - plugin
  - vault
  - Markdown
  - offline
---

# Obsidian setup

***The feynjs plugin draws a `feynman` code block in any note. It follows light and dark themes,
and everything it needs is inside the plugin, so it works offline.***

1.  **Get the plugin.** Download `feynjs-obsidian.zip` from the
    [latest release](https://github.com/hepjs/feynjs/releases/latest) and unzip it. It holds one
    folder, `feynjs`.

2.  **Put it in your vault.** Move the `feynjs` folder into your vault's plugin folder,
    `<vault>/.obsidian/plugins/`. The folder `.obsidian` is hidden: on a Mac press
    ++cmd+shift+period++ in Finder to show it.

3.  **Turn it on.** In Obsidian, open *Settings → Community plugins*, turn off *Restricted mode* if
    asked, then switch on **feynjs**.

4.  **Write a diagram** in any note, in a `feynman` code block:

    ````markdown
    ```feynman
    e- e+ > gamma > mu- mu+
    ```
    ````

## Demo

The block above draws this diagram, in Obsidian's text colour:

```feynman
e- e+ > gamma > mu- mu+
```

Any diagram on this site works in a note. Here is the same one, written as edges, as in
TikZ-Feynman:

````markdown
```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```
````

```feynman
i1 [e-] -- a -- i2 [e+]
a -- [gamma] b
f1 [mu-] -- b -- f2 [mu+]
```

## Build the plugin yourself

To build the plugin from a checkout instead, run `node integrations/obsidian/build.mjs` and copy
`integrations/obsidian/dist/feynjs` into the plugin folder.

## Next

- [Your first diagram](first-diagram.md): what each line of a diagram means.
- [Write edges, as in TikZ-Feynman](../guide/syntax.md) or
  [write processes, as in MadGraph](../guide/processes.md).
- [Examples](../examples/index.md): hundreds of diagrams with their source.
