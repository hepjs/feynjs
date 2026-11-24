// The paper's figure 1: one diagram through the tools arXiv uses. TikZ-Feynman's own example,
// e+ e- -> mu+ mu- with automatic layout, compiled by LuaLaTeX (which its layout needs), by
// pdfLaTeX (which arXiv runs) and by LaTeXML (arXiv's HTML); and feynjs's export of the same
// diagram through LaTeXML. Writes paper/figures/arxiv/*.{pdf,png}.
//
//   pixi run -e latexml node scripts/paper-arxiv-figure.mjs
// Needs lualatex and pdflatex (TeX Live), latexmlc, and playwright's Chromium
// (npm install --no-save playwright && npx playwright install chromium).
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { toTikz } from "../dist/feynjs.mjs";

const OUT = resolve("paper/figures/arxiv");
const ELLIS_EXAMPLE = String.raw`\feynmandiagram [horizontal=a to b] {
  i1 [particle=\(e^{-}\)] -- [fermion] a -- [fermion] i2 [particle=\(e^{+}\)],
  a -- [photon, edge label=\(\gamma\)] b,
  f1 [particle=\(\mu^{+}\)] -- [fermion] b -- [fermion] f2 [particle=\(\mu^{-}\)],
};`;
const FEYNJS_SOURCE = "i1 [e-] -- a -- i2 [e+]\na -- [gamma] b\nf1 [mu+] -- b -- f2 [mu-]";

mkdirSync(OUT, { recursive: true });
compiledWith("lualatex", ELLIS_EXAMPLE, "tikzfeynman-lualatex");
compiledWith("pdflatex", ELLIS_EXAMPLE, "tikzfeynman-pdflatex");
await convertedByLatexml(ELLIS_EXAMPLE, "tikzfeynman-latexml", "tikz-feynman");
await convertedByLatexml(toTikz(FEYNJS_SOURCE, { standalone: false }), "feynjs-latexml", "feynjs");
console.log(`paper/figures/arxiv: 2 PDFs, 2 PNGs`);

function standalone(body) {
  return ["\\documentclass[border=4pt]{standalone}", "\\usepackage{tikz-feynman}", "\\tikzfeynmanset{compat=1.1.0}",
    "\\begin{document}", body, "\\end{document}", ""].join("\n");
}

function compiledWith(engine, body, name) {
  const dir = mkdtempSync(join(tmpdir(), "feynjs-arxiv-"));
  writeFileSync(join(dir, `${name}.tex`), standalone(body));
  execFileSync(engine, ["-interaction=nonstopmode", `${name}.tex`], { cwd: dir, stdio: "ignore" });
  copyFileSync(join(dir, `${name}.pdf`), join(OUT, `${name}.pdf`));
}

/**
 * LaTeXML as arXiv runs it (raw style files included), then the SVG it made, photographed in
 * Chromium with a margin for the labels that stand outside it. The feynjs drawing loads the
 * feynjs package, as an author would.
 */
async function convertedByLatexml(body, name, usePackage) {
  const dir = mkdtempSync(join(tmpdir(), "feynjs-arxiv-"));
  copyFileSync("integrations/latex/feynjs.sty", join(dir, "feynjs.sty"));
  writeFileSync(join(dir, `${name}.tex`), ["\\documentclass{article}", `\\usepackage{${usePackage}}`, "\\tikzfeynmanset{compat=1.1.0}",
    "\\begin{document}", body, "\\end{document}", ""].join("\n"));
  try { execFileSync("latexmlc", ["--includestyles", `--dest=${name}.html`, `${name}.tex`], { cwd: dir, stdio: "ignore" }); }
  catch { /* LaTeXML may exit non-zero on warnings, or crash on exit after writing; the HTML is what counts */ }
  const html = readFileSync(join(dir, `${name}.html`), "utf8");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 3 });
    const picture = /<svg[^>]*class="ltx_picture[\s\S]*?<\/svg>/.exec(html)[0];
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#fff"><div id="picture" style="display:inline-block;padding:28px">${picture}</div></body></html>`);
    await page.locator("#picture").screenshot({ path: join(OUT, `${name}.png`) });
  } finally {
    await browser.close();
  }
}
