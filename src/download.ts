/**
 * A small download button on a drawn diagram: a quiet icon in its corner that offers the
 * diagram as an SVG file, a PNG image or TikZ-Feynman code (a complete .tex document, every
 * vertex placed). The pictures are standalone (black on white), whatever the page's theme. The PNG is drawn at three times the diagram's size with the label font
 * embedded, so it keeps the TeX face; the SVG names the font, as every feynjs SVG does.
 *
 * Browser only. Used by `run({ download: true })`.
 */
export function addDownloadButton(figure: HTMLElement, standaloneSvg: () => string, name: string, description?: string, tikz?: () => string): void {
  addStylesOnce();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "feynjs-download";
  button.setAttribute("aria-label", "Download diagram");
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  button.title = "Download";
  button.innerHTML = DOWNLOAD_ICON;

  const menu = document.createElement("div");
  menu.className = "feynjs-download-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  const item = (label: string, save: () => Promise<void>) => {
    const entry = document.createElement("button");
    entry.type = "button";
    entry.setAttribute("role", "menuitem");
    entry.textContent = label;
    entry.addEventListener("click", async () => { close(); await save(); });
    menu.appendChild(entry);
  };
  item("SVG", async () => saveFile(new Blob([standaloneSvg()], { type: "image/svg+xml" }), `${name}.svg`));
  item("PNG", async () => saveFile(await toPng(standaloneSvg()), `${name}.png`));
  if (tikz) item("TikZ", async () => saveFile(new Blob([tikz()], { type: "application/x-tex" }), `${name}.tex`));
  if (description) item("Copy description", async () => { await navigator.clipboard?.writeText(description); });

  const close = () => { menu.hidden = true; button.setAttribute("aria-expanded", "false"); document.removeEventListener("click", outside); };
  const outside = (event: Event) => { if (!figure.contains(event.target as Node)) close(); };
  button.addEventListener("click", () => {
    if (!menu.hidden) return close();
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    document.addEventListener("click", outside);
  });
  figure.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  figure.append(button, menu);
}

/** A file name from the process a diagram shows: "g g -> t tbar" becomes "feynman-g-g-t-tbar". */
export function fileNameFor(process: string | undefined, fallback: string): string {
  const slug = (process ?? "").replace(/->/g, " ").replace(/[^A-Za-z0-9+]+/g, "-").replace(/\+/g, "plus").replace(/^-|-$/g, "");
  return slug ? `feynman-${slug}`.slice(0, 80) : fallback;
}

// the Lucide "download" icon (ISC licence, lucide.dev)
const DOWNLOAD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

function addStylesOnce(): void {
  if (document.getElementById("feynjs-download-style")) return;
  const style = document.createElement("style");
  style.id = "feynjs-download-style";
  // quiet until the diagram is hovered or focused; pages can restyle every part by class
  style.textContent = `
.feynjs-figure { position: relative; display: inline-block; max-width: 100%; }
.feynjs-download { position: absolute; top: 0; right: 0; display: flex; padding: 4px; border: 0; border-radius: 4px;
  background: transparent; color: inherit; cursor: pointer; opacity: 0; transition: opacity .15s; }
.feynjs-figure:hover .feynjs-download, .feynjs-download:focus-visible, .feynjs-download[aria-expanded="true"] { opacity: .45; }
.feynjs-download:hover, .feynjs-download:focus-visible { opacity: .9; }
.feynjs-download-menu { position: absolute; top: 26px; right: 0; z-index: 2; display: flex; flex-direction: column; min-width: 4.5em;
  padding: 3px; border-radius: 6px; background: Canvas; color: CanvasText; box-shadow: 0 2px 10px rgba(0, 0, 0, .2); font: 12px/1.2 system-ui, sans-serif; }
.feynjs-download-menu[hidden] { display: none; }
.feynjs-download-menu button { padding: 5px 10px; border: 0; border-radius: 4px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.feynjs-download-menu button:hover, .feynjs-download-menu button:focus-visible { background: rgba(127, 127, 127, .18); }`;
  document.head.appendChild(style);
}

function saveFile(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The SVG drawn onto a canvas at `scale` times its size, as a PNG. */
async function toPng(svg: string, scale = 3): Promise<Blob> {
  const size = /width="([\d.]+)" height="([\d.]+)"/.exec(svg);
  const width = Math.ceil(Number(size?.[1] ?? 300) * scale), height = Math.ceil(Number(size?.[2] ?? 200) * scale);
  const url = URL.createObjectURL(new Blob([await withEmbeddedFonts(svg)], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG failed"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * An image drawn from an SVG cannot see the page's fonts, so the label font is carried in:
 * every @font-face on the page for the SVG's first font family, fetched and embedded.
 */
async function withEmbeddedFonts(svg: string): Promise<string> {
  const family = /font-family="'?([^',"]+)/.exec(svg)?.[1];
  if (!family) return svg;
  const faces: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; } // another origin's stylesheet
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      if (rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim() !== family) continue;
      const src = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue("src"))?.[1];
      if (!src) continue;
      const data = await fontAsDataUrl(new URL(src, sheet.href ?? document.baseURI).href);
      if (data) faces.push(`@font-face{font-family:'${family}';src:url(${data});font-style:${rule.style.getPropertyValue("font-style") || "normal"}}`);
    }
  }
  return faces.length ? svg.replace(/(<svg[^>]*>)/, `$1<style>${faces.join("")}</style>`) : svg;
}

const fetched = new Map<string, Promise<string | undefined>>();
function fontAsDataUrl(url: string): Promise<string | undefined> {
  if (!fetched.has(url)) {
    fetched.set(url, fetch(url).then(async (response) => {
      if (!response.ok) return undefined;
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let k = 0; k < bytes.length; k += 0x8000) binary += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
      return `data:font/otf;base64,${btoa(binary)}`;
    }).catch(() => undefined));
  }
  return fetched.get(url)!;
}
