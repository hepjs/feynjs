---
hide:
  - toc
---

# Get started

feynjs draws a Feynman diagram from a few lines of text. The quickest way to see it: add one
script to a page, and write a diagram in a `feynman` block.

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

<div class="feynman">
e- e+ > Z > mu- mu+
</div>
```

```feynman
e- e+ > Z > mu- mu+
```

That is all a web page needs. For a docs site, a notebook, a note, a talk or a paper, see
[Usage](../usage/index.md): Zensical and MkDocs, Sphinx, Jupyter, Obsidian and LaTeX each take a
line or two. Or try it with no setup at all in the [playground](../playground.md).

[Your first diagram](first-diagram.md){ .md-button .md-button--primary }
[Where to use it](../usage/index.md){ .md-button }

**Next:** [Your first diagram](first-diagram.md) explains what each line means, and
[How it works](../authoring/index.md) builds a diagram up a layer at a time.
