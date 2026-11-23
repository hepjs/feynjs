import { PROPERTIES } from "./particles/properties.ts";

/**
 * A card that shows what a particle is when the pointer rests on its label: the symbol as the
 * diagram sets it, the particle's name, and its charge, spin, colour and mass. One card serves
 * the whole page. A label's own `<title>` (the plain tooltip an exported SVG keeps) is set aside
 * while the card is in use, so the two never show together.
 *
 * Browser only. Installed by `run()`; `run({ tooltips: false })` leaves it out.
 */
export function installTooltips(): void {
  if (installed) return;
  installed = true;
  addStyles();
  const card = document.createElement("div");
  card.className = "feynjs-tooltip";
  card.setAttribute("role", "tooltip");
  card.hidden = true;
  document.body.appendChild(card);

  let current: SVGGElement | undefined;
  document.addEventListener("pointerover", (event) => {
    const label = (event.target as Element).closest?.("svg.feynjs [data-particle]") as SVGGElement | null;
    if (!label || label === current) return;
    current = label;
    setTitleAside(label);
    fill(card, label);
    card.hidden = false;
    place(card, label);
  });
  document.addEventListener("pointerout", (event) => {
    if (!current) return;
    const to = event.relatedTarget as Node | null;
    if (to && current.contains(to)) return;
    current = undefined;
    card.hidden = true;
  });
  window.addEventListener("scroll", () => { card.hidden = true; current = undefined; }, { passive: true });
}

let installed = false;

/** Keep a label's plain tooltip out of the way: the card says it better. */
function setTitleAside(label: SVGGElement): void {
  const title = label.querySelector("title");
  if (title) { label.dataset.info = title.textContent ?? ""; title.remove(); }
}

const ROWS: [string, "charge" | "spin" | "colour" | "mass"][] = [["Charge", "charge"], ["Spin", "spin"], ["Colour", "colour"], ["Mass", "mass"]];

function fill(card: HTMLElement, label: SVGGElement): void {
  const p = PROPERTIES[label.dataset.particle ?? ""];
  card.replaceChildren();
  if (!p) return;
  // the header: the symbol as the diagram sets it, beside the name
  const head = element("div", "feynjs-tooltip-head");
  head.append(symbolOf(label), element("span", "feynjs-tooltip-name", p.name));
  card.append(head);
  const rows = element("dl", "feynjs-tooltip-rows");
  for (const [name, key] of ROWS) {
    const value = p[key];
    if (!value) continue;
    rows.append(element("dt", "", name), element("dd", "", key === "charge" ? value.replace(/^-/, "−") : value));
  }
  if (rows.childElementCount) card.append(rows);
  const notes = (p.note ?? "").split("; ").filter(Boolean);
  if (notes.length) {
    const foot = element("div", "feynjs-tooltip-notes");
    for (const note of notes) foot.append(element("span", note === "hypothetical" ? "feynjs-tooltip-tag" : "", note));
    card.append(foot);
  }
}

/** A copy of the label's typeset symbol, in a little SVG of its own. */
function symbolOf(label: SVGGElement): Element {
  const box = label.getBBox();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "feynjs-tooltip-symbol");
  svg.setAttribute("viewBox", `${box.x - 1} ${box.y - 1} ${box.width + 2} ${box.height + 2}`);
  svg.setAttribute("height", String(Math.round((box.height + 2) * 1.35)));
  svg.setAttribute("font-family", label.closest("svg")?.getAttribute("font-family") ?? "serif");
  const copy = label.cloneNode(true) as SVGGElement;
  copy.removeAttribute("transform");
  copy.querySelector("title")?.remove();
  svg.appendChild(copy);
  return svg;
}

/** Above the label, centred on it; below it if there is no room above. */
function place(card: HTMLElement, label: Element): void {
  const r = label.getBoundingClientRect(), c = card.getBoundingClientRect(), gap = 8;
  let top = r.top - c.height - gap;
  if (top < 4) top = r.bottom + gap;
  const left = Math.min(Math.max(4, r.left + r.width / 2 - c.width / 2), window.innerWidth - c.width - 4);
  card.style.top = `${Math.round(top + window.scrollY)}px`;
  card.style.left = `${Math.round(left + window.scrollX)}px`;
}

function element(tag: string, cls: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function addStyles(): void {
  const style = document.createElement("style");
  style.id = "feynjs-tooltip-style";
  // every colour is a custom property, so a page can match its theme
  style.textContent = `
.feynjs-tooltip { position: absolute; z-index: 20; min-width: 11rem; max-width: 17rem; padding: .6rem .75rem .65rem; border-radius: .65rem;
  background: var(--feynjs-tooltip-bg, rgba(255, 255, 255, .38)); color: var(--feynjs-tooltip-fg, #1b1f24);
  -webkit-backdrop-filter: blur(8px) saturate(1.5); backdrop-filter: blur(8px) saturate(1.5);
  border: 1px solid var(--feynjs-tooltip-border, rgba(255, 255, 255, .75));
  box-shadow: 0 8px 28px rgba(0, 0, 0, .12), inset 0 1px 0 rgba(255, 255, 255, .5);
  font: 12px/1.45 var(--feynjs-tooltip-font, system-ui, -apple-system, "Segoe UI", sans-serif);
  pointer-events: none; animation: feynjs-tooltip-in .12s ease-out; }
.feynjs-tooltip[hidden] { display: none; }
@keyframes feynjs-tooltip-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.feynjs-tooltip-head { display: flex; align-items: center; gap: .55rem; margin-bottom: .35rem; }
.feynjs-tooltip-symbol { flex: none; color: inherit; fill: currentColor; overflow: visible; }
.feynjs-tooltip-name { font-weight: 600; font-size: 13px; }
.feynjs-tooltip-rows { display: grid; grid-template-columns: auto 1fr; gap: .1rem .9rem; margin: 0; padding-top: .35rem; border-top: 1px solid var(--feynjs-tooltip-rule, rgba(127, 127, 127, .18)); }
.feynjs-tooltip-rows dt { opacity: .6; margin: 0; }
.feynjs-tooltip-rows dd { margin: 0; font-variant-numeric: tabular-nums; }
.feynjs-tooltip-notes { display: flex; flex-wrap: wrap; gap: .3rem .5rem; margin-top: .45rem; opacity: .8; font-style: italic; }
.feynjs-tooltip-tag { font-style: normal; font-size: 10.5px; padding: 0 .4rem; border-radius: 1rem; background: var(--feynjs-tooltip-tag, rgba(192, 57, 43, .12)); color: var(--feynjs-tooltip-accent, #c0392b); opacity: 1; }`;
  document.head.appendChild(style);
}
