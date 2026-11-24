---
tags:
  - upgrade
  - new version
  - npm
  - jsDelivr
  - Obsidian
  - changelog
---

# Upgrading

***How to move to a new release of feynjs: from npm, from the jsDelivr link or in Obsidian. Then
what changed in each release.***

| Where you use feynjs | To upgrade |
|---|---|
| npm | `npm install feynjs@latest` |
| jsDelivr link, `feynjs@0.9` | nothing for a 0.9.x release; change the link for 0.10 |
| Obsidian | replace the plugin folder with the one from the new release |

Versions follow [semantic versioning](https://semver.org). Before 1.0, a new minor version (0.9
to 0.10) may change how a diagram is written. A layout that moves counts as a change too. Each
one is in the [changelog](#changelog) below.

## npm

```sh
npm install feynjs@latest
```

This updates `package.json` and the `feynjs` command too. Check with `npx feynjs check FILE` on a
few of your diagrams.

## The jsDelivr link

A link to `feynjs@0.9` picks up each 0.9.x release on its own:

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.9/dist/feynjs.min.js"></script>
```

jsDelivr can cache the version a range points to for up to about 12 hours, so a page may draw
with the previous release for that long after a new one is out.

A new minor version needs a new link. For 0.10, change `@0.9` to `@0.10` wherever the script is
loaded: `extra_javascript` in `zensical.toml` or `mkdocs.yml`, or the `<script>` tag. To stay on
one exact release, write it in full, such as `feynjs@0.9.3`.

## Obsidian

1.  Download `feynjs-obsidian.zip` from the
    [latest release](https://github.com/hepjs/feynjs/releases/latest) and unzip it.
2.  Replace the `feynjs` folder in `<vault>/.obsidian/plugins/` with the new one.
3.  In *Settings → Community plugins*, switch **feynjs** off and on again, or restart Obsidian.

The plugin keeps no settings of its own, so nothing is lost when its folder is replaced.

## Changelog

The full list is in
[CHANGELOG.md](https://github.com/hepjs/feynjs/blob/main/CHANGELOG.md). In short:

**0.9.3** (2026-11-24)
:   Every part of a drawing is named in the SVG (`data-edge`, `data-vertex`) and the diagram is
    written into it as JSON. The [playground](../playground.md). The grid and the lattice view
    stay faint on dark pages. Releases carry the Obsidian plugin as `feynjs-obsidian.zip`.
    Cascades on the grid layout are drawn as a level spine with what they give off hanging from it.

**0.9.1** (2026-11-24)
:   In Zensical and MkDocs, diagrams are drawn again after each instant page change, so the
    script and the `feynman` fence are all a site needs.

**0.9.0** (2026-11-23)
:   The first public release: the edge and process syntaxes, every TikZ-Feynman line style, the
    force, grid and manual layouts, the kinematic and lattice views, the npm package, the command
    line, TikZ export and the Obsidian plugin.
