# Web pages

```feynman
i1 [g] -- a
i2 [g] -- b
a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
c -- [H] f1
```

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

<div class="feynman">
  i1 [g] -- a
  i2 [g] -- b
  a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
  c -- [H] f1
</div>
```

The same source draws the same diagram everywhere. feynjs has no runtime dependencies. It is built
for ES2020, so it runs in any current browser and in Node.

## Install

Load it from jsDelivr. It defines one global, `feynjs`.

```html
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>
```

`@0.10` follows the newest 0.10 release.

### Without the CDN

Download `feynjs.min.js` once, from the latest release or from the npm package:

```sh
curl -L -o feynjs.min.js https://github.com/hepjs/feynjs/releases/latest/download/feynjs.min.js
# or: npm install feynjs, then copy node_modules/feynjs/dist/feynjs.min.js
```

It is one file of about 350 KB, with no dependencies, so it works with no network: behind a
firewall, offline, or on a site that loads nothing from other servers. To update, download it
again.

Put it with your page's files and load it from there:

```html
<script src="feynjs.min.js"></script>
```

## In a web page

Put the source in any element with the class `feynman` and call `feynjs.run()`:

```html
<link rel="stylesheet" href="feynjs.css">   <!-- optional: the label font -->
<script src="https://cdn.jsdelivr.net/npm/feynjs@0.10/dist/feynjs.min.js"></script>

<div class="feynman">
  i1 [g] -- a
  i2 [g] -- b
  a -- [fermion] c -- [fermion] b -- [fermion, label=t] a
  c -- [H] f1
</div>

<script>feynjs.run()</script>
```

`run` replaces each matching element's text with its diagram and marks it as done, so it is safe
to call again after adding content. `feynjs.run({ download: true })` also gives each diagram a
download icon, offering it as SVG or PNG. If a source has a mistake, the element shows the message and
the source instead, in a `pre.feynjs-error`.

### With another Markdown renderer

Most Markdown renderers turn a fenced block into `<pre><code class="language-feynman">`. Swap
each one for its diagram:

```js
document.querySelectorAll("pre > code.language-feynman").forEach((code) => {
  const figure = document.createElement("div");
  figure.className = "feynman";
  figure.innerHTML = feynjs.render(code.textContent);
  code.parentElement.replaceWith(figure);
});
```

For a Zensical or MkDocs site, see [Zensical setup](zensical.md).
