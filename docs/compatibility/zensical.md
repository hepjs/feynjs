# Zensical and MkDocs

A docs site: every `feynman` block in your Markdown becomes a diagram.

1.  **Load the script.** Add feynjs to the page scripts, in the `[project]` table:

    === "zensical.toml"

        ```toml
        [project]
        extra_javascript = ["https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"]
        ```

    === "mkdocs.yml"

        ```yaml
        extra_javascript:
          - https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js
        ```

2.  **Add the fence.** It keeps a `feynman` block as written. Without it, the highlighter turns the
    block into plain text and feynjs can't find it. If you already list `custom_fences` (for
    Mermaid, say), add the line to that list.

    === "zensical.toml"

        ```toml
        [project.markdown_extensions]
        pymdownx.superfences.custom_fences = [
          { name = "feynman", class = "feynman", format = "pymdownx.superfences.fence_div_format" },
        ]
        ```

    === "mkdocs.yml"

        ```yaml
        markdown_extensions:
          - pymdownx.superfences:
              custom_fences:
                - name: feynman
                  class: feynman
                  format: !!python/name:pymdownx.superfences.fence_div_format
        ```

3.  **Write a diagram** in any page, in a `feynman` code block:

    ````markdown
    ```feynman
    i1 [q] -- a -- i2 [qbar]
    a -- [Z'] b
    f1 [chi] -- b -- f2 [chibar]
    ```
    ````

feynjs draws the blocks once a page has loaded, and again after each instant page change.

## Demo

This block, in a page of this site:

````markdown
```feynman
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
f1 [chi] -- b -- f2 [chibar]
```
````

draws this diagram:

```feynman
i1 [q] -- a -- i2 [qbar]
a -- [Z'] b
f1 [chi] -- b -- f2 [chibar]
```

Diagrams draw in `currentColor`, so they follow the light and dark palettes without being drawn
again. A block can hold a process instead of edges:

````markdown
```feynman
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```
````

```feynman
p p > gluino gluino
gluino > q q neutralino2
neutralino2 > Z neutralino1
```

## Without the CDN

Download `feynjs.min.js` once, from the latest release or from the npm package:

```sh
curl -L -o feynjs.min.js https://github.com/hepjs/feynjs/releases/latest/download/feynjs.min.js
# or: npm install feynjs, then copy node_modules/feynjs/dist/feynjs.min.js
```

It is one file of about 350 KB, with no dependencies, so it works with no network: behind a
firewall, offline, or on a site that loads nothing from other servers. To update, download it
again.

Put it in `docs/javascripts/` and list it in place of the CDN link (the path is relative to
`docs/`):

=== "zensical.toml"

    ```toml
    [project]
    extra_javascript = ["javascripts/feynjs.min.js"]
    ```

=== "mkdocs.yml"

    ```yaml
    extra_javascript:
      - javascripts/feynjs.min.js
    ```

The site then carries its own copy, built and published with it.

## Optional extras

**Your own options.** To pass options to every diagram (a download button, say), call `run`
yourself from a small script listed after feynjs; feynjs leaves what you have drawn alone:

```js
document$.subscribe(() => feynjs.run({ download: true }));
```

`run` takes every option in the [JavaScript API](../usage/api.md#run).

## Next

- [Your first diagram](../get-started/first-diagram.md): what each line of a diagram means.
- [Write edges, as in TikZ-Feynman](../authoring/syntax.md) or
  [write processes, as in MadGraph](../authoring/processes.md).
- [Examples](../authoring/examples/index.md): hundreds of diagrams with their source.
