// A self-contained HTML page for a Notion /HTML block (or anywhere that takes one HTML file):
// feynjs inlined, as the block cannot load scripts from elsewhere, and the diagram's source near
// the top, ready to change.
//   node integrations/notion/build.mjs [diagram.feyn] [out.html]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname;
const source = process.argv[2] ? readFileSync(process.argv[2], "utf8") : "i1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]\n";
const out = process.argv[3] ?? `${here}dist/feynjs-notion.html`;
const library = readFileSync(`${here}../../dist/feynjs.min.js`, "utf8").replace(/<\/script/gi, "<\\/script");
const page = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin: 0; background: transparent; }
  body { display: flex; justify-content: center; padding: 8px 0; color: #37352f; }
  @media (prefers-color-scheme: dark) { body { color: #e6e6e5; } svg.feynjs .feynjs-bg { fill: #191919; } }
  svg.feynjs { max-width: 100%; height: auto; }
  svg.feynjs .feynjs-bg { fill: #fff; }
  svg.feynjs .feynjs-blob { fill: rgba(100, 120, 150, 0.2); }
  svg.feynjs .feynjs-jet-stop { stop-color: #3f90da; }
  pre { color: #c0392b; white-space: pre-wrap; font: 13px ui-monospace, monospace; }
</style></head>
<body>
<!-- ======== the diagram: change the lines between these two markers ======== -->
<script type="text/plain" id="diagram">
${source.trim()}
</script>
<!-- ========================================================================= -->
<div id="out"></div>
<script>${library}</script>
<script>
  try { document.getElementById("out").innerHTML = feynjs.render(document.getElementById("diagram").textContent); }
  catch (e) { const pre = document.createElement("pre"); pre.textContent = String(e && e.message || e); document.getElementById("out").replaceChildren(pre); }
</script>
</body></html>
`;
mkdirSync(new URL(".", `file://${out}`).pathname, { recursive: true });
writeFileSync(out, page);
console.log(`wrote ${out} (${Math.round(page.length / 1024)} KB)`);
