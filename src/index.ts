import { parse } from "./parse/parse.ts";
import { renderDiagram } from "./render/render.ts";
import { composePanels, splitPanels } from "./render/panels.ts";
import { themeWith } from "./theme.ts";
import { registry } from "./particles/registry.ts";
import { describe } from "./tools/describe.ts";
import { explain } from "./tools/explain.ts";
import { addDownloadButton, fileNameFor } from "./download.ts";
import { installTooltips } from "./tooltip.ts";
import type { RenderOptions } from "./render/render.ts";

export { parse } from "./parse/parse.ts";
export { FeynError } from "./model.ts";
export { defaultTheme, themeWith } from "./theme.ts";
export { registerParticle, registerLineStyle, lookupParticle, particleNames, STYLES as lineStyles } from "./particles/registry.ts";
export { describe } from "./tools/describe.ts";
export { explain } from "./tools/explain.ts";
export { particleInfo, PROPERTIES as particleProperties } from "./particles/properties.ts";
export type { ParticleProperties } from "./particles/properties.ts";
export { check } from "./tools/check.ts";
export { toTikz } from "./tools/tikz.ts";
export { measure } from "./tools/quality.ts";
export type { Quality } from "./tools/quality.ts";
export type { Description } from "./tools/describe.ts";
export type { Finding } from "./tools/check.ts";
export type { TikzOptions } from "./tools/tikz.ts";
export type { RenderOptions } from "./render/render.ts";
export type { Theme, ThemeOverrides, LineLook, VertexLook, LayoutRules } from "./theme.ts";
export type { Particle } from "./particles/registry.ts";
export type { Diagram, Edge, EdgeStyle, Vertex } from "./model.ts";

/** Make an SVG display correctly on its own: black ink on a plain background. */
function makeStandalone(svg: string, background: string): string {
  const withColour = svg.replace(/^<svg /, '<svg color="#000000" ');
  return withColour.replace(/(<svg[^>]*>)/, `$1<rect x="-100000" y="-100000" width="200000" height="200000" fill="${background}"/>`);
}

/**
 * Diagram source text -> SVG markup. Throws FeynError on bad input. Lines of `---` split the
 * source into panels drawn side by side, each captioned (a), (b), ... or with the text after the dashes.
 */
export function render(source: string, options: RenderOptions = {}): string {
  // the same source drawn the same way again (a page revisited, an edit elsewhere) is not
  // laid out again
  const key = `${registry.version}\u0000${JSON.stringify(options)}\u0000${source}`;
  const known = drawn.get(key);
  if (known !== undefined) {
    drawn.delete(key);
    drawn.set(key, known);
    return known;
  }
  const svg = draw(source, options);
  drawn.set(key, svg);
  if (drawn.size > DRAWN_KEPT) drawn.delete(drawn.keys().next().value!);
  return svg;
}

/** The drawings made most recently, by source and options (oldest first). */
const drawn = new Map<string, string>();
const DRAWN_KEPT = 256;

function draw(source: string, options: RenderOptions): string {
  const panels = splitPanels(source);
  let svg: string;
  if (panels.length <= 1 && !/^\s*-{3,}/m.test(source)) {
    svg = renderDiagram(parse(source), options);
  } else {
    const theme = themeWith(options.theme);
    const svgs = panels.map((p, i) => renderDiagram(parse(p.source), { ...options, idPrefix: `${options.idPrefix ?? "feyn"}p${i}` }));
    svg = composePanels(svgs, panels.map((p) => p.caption), theme, options.panelsPerRow ?? (panels.some((p) => p.joiner) ? panels.length : 3), panels.map((p) => p.joiner));
  }
  return options.standalone ? makeStandalone(svg, options.background ?? "#ffffff") : svg;
}

export interface RunOptions extends RenderOptions {
  /** elements whose text content is diagram source */
  querySelector?: string;
  root?: ParentNode;
  /** a quiet download button on each diagram, offering it as SVG or PNG */
  download?: boolean;
}

let diagramCounter = 0;

/**
 * Replace every matching element's text with its rendered diagram. Safe to call repeatedly.
 * By default: elements with the class `feynman`, and the ```feynman code blocks Markdown tools
 * write (`<pre><code class="language-feynman">`, from GitHub Pages, Hugo, Jekyll, markdown-it).
 */
export function run(options: RunOptions = {}): void {
  const { querySelector, root = document, download, ...renderOptions } = options;
  if (renderOptions.tooltips) installTooltips();
  // (a Markdown code block becomes a plain element first, in place of the block: plain Markdown
  // writes <pre><code class="language-feynman">; highlighters such as MkDocs's and Zensical's
  // put the class on a wrapper round the <pre>)
  if (!querySelector) root.querySelectorAll<HTMLElement>("pre > code.language-feynman, .language-feynman > pre > code").forEach((code) => {
    const pre = code.parentElement!, wrapper = pre.parentElement;
    const block = wrapper && wrapper.classList.contains("language-feynman") && !wrapper.classList.contains("feynman") ? wrapper : pre;
    if (!block.isConnected) return;
    const holder = document.createElement("div");
    holder.className = "feynman";
    holder.textContent = code.textContent ?? "";
    block.replaceWith(holder);
  });
  const selector = querySelector ?? ".feynman:not([data-processed])";
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (element.dataset.processed) return;
    const source = element.textContent ?? "";
    const n = diagramCounter++;
    element.dataset.processed = "true";
    try {
      const svg = render(source, { ...renderOptions, idPrefix: `feyn${n}` });
      element.classList.add("feynjs-rendered");
      if (!download) { element.innerHTML = svg; return; }
      element.innerHTML = `<span class="feynjs-figure">${svg}</span>`;
      const standalone = () => render(source, { ...renderOptions, idPrefix: `feyn${n}x`, standalone: true });
      addDownloadButton(element.firstElementChild as HTMLElement, standalone, fileNameFor(processOf(source), `feynman-diagram-${n + 1}`), descriptionOf(source));
    } catch (error) {
      const message = document.createElement("pre");
      message.className = "feynjs-error";
      message.textContent = `feynjs: ${(error as Error).message}\n\n${source.trim()}`;
      element.replaceChildren(message);
    }
  });
}

// On a page, feynjs draws every diagram once the page has loaded, as Mermaid does, so a script
// tag is all a site needs. A site that calls run() itself (with its own options) does so first,
// and what it has drawn is left alone; startOnLoad(false) turns this off.
let drawOnLoad = true;
/** Whether feynjs draws a page's diagrams by itself once the page has loaded (it does unless told not to). */
export function startOnLoad(on: boolean): void { drawOnLoad = on; }
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const go = () => setTimeout(() => { if (drawOnLoad) run(); }, 0);
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

/** A source's plain-English description, panel by panel. */
function descriptionOf(source: string): string | undefined {
  try {
    const panels = splitPanels(source);
    return panels.length === 1 ? explain(source) : panels.map((p) => `${p.caption}: ${explain(p.source)}`).join(" ");
  } catch { return undefined; }
}

/** The process a source draws, for naming its file; nothing for several panels. */
function processOf(source: string): string | undefined {
  try { return splitPanels(source).length === 1 ? describe(source).process : undefined; } catch { return undefined; }
}
