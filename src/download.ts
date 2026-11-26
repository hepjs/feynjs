/**
 * A small download button on a drawn diagram: a quiet icon in its corner that offers the
 * diagram as an SVG file, a PNG or TIFF image, or TikZ-Feynman code (a complete .tex document,
 * every vertex placed). The pictures are standalone (black on white), whatever the page's theme.
 * The PNG and TIFF are drawn at three times the diagram's size with the label font embedded, so
 * they keep the TeX face; the SVG names the font, as every feynjs SVG does.
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
  item("TIFF", async () => saveFile(await toTiff(standaloneSvg()), `${name}.tiff`));
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
  const canvas = await toCanvas(svg, scale);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG failed"))), "image/png"));
}

/** The SVG drawn onto a canvas at `scale` times its size, as a TIFF, its resolution recorded (96 dpi at scale 1). */
async function toTiff(svg: string, scale = 3): Promise<Blob> {
  const canvas = await toCanvas(svg, scale);
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
  return new Blob([encodeTiff(canvas.width, canvas.height, data, Math.round(96 * scale)).buffer as ArrayBuffer], { type: "image/tiff" });
}

/**
 * Pixels as a TIFF: baseline, little-endian, RGB, uncompressed (the form every reader takes, and
 * what a journal asking for TIFF wants), with the resolution recorded in dpi. The pixels are
 * composed on white, so the file is opaque.
 */
export function encodeTiff(width: number, height: number, rgba: Uint8ClampedArray | Uint8Array, dpi: number): Uint8Array {
  // (the header, then the directory of 13 tags, then what does not fit a tag's 4 bytes: the three
  // bits-per-sample values and the two resolutions; then the pixels, in one strip)
  const tags = 13, ifd = 8, extras = ifd + 2 + tags * 12 + 4, pixels = extras + 6 + 16;
  const bytes = new Uint8Array(pixels + width * height * 3), view = new DataView(bytes.buffer);
  bytes.set([0x49, 0x49, 42, 0]);
  view.setUint32(4, ifd, true);
  view.setUint16(ifd, tags, true);
  let at = ifd + 2;
  // (types: 3 a short, 4 a long, 5 a rational; the tags in rising order, as TIFF requires)
  const tag = (id: number, type: number, count: number, value: number) => {
    view.setUint16(at, id, true); view.setUint16(at + 2, type, true); view.setUint32(at + 4, count, true);
    if (type === 3 && count === 1) view.setUint16(at + 8, value, true); else view.setUint32(at + 8, value, true);
    at += 12;
  };
  tag(256, 4, 1, width); tag(257, 4, 1, height); tag(258, 3, 3, extras); tag(259, 3, 1, 1); tag(262, 3, 1, 2);
  tag(273, 4, 1, pixels); tag(277, 3, 1, 3); tag(278, 4, 1, height); tag(279, 4, 1, width * height * 3);
  tag(282, 5, 1, extras + 6); tag(283, 5, 1, extras + 14); tag(284, 3, 1, 1); tag(296, 3, 1, 2);
  view.setUint32(at, 0, true);
  for (let k = 0; k < 3; k++) view.setUint16(extras + 2 * k, 8, true);
  for (const o of [extras + 6, extras + 14]) { view.setUint32(o, dpi, true); view.setUint32(o + 4, 1, true); }
  for (let i = 0, o = pixels; i < rgba.length; i += 4, o += 3) {
    const a = rgba[i + 3] / 255, white = 255 * (1 - a);
    bytes[o] = Math.round(rgba[i] * a + white); bytes[o + 1] = Math.round(rgba[i + 1] * a + white); bytes[o + 2] = Math.round(rgba[i + 2] * a + white);
  }
  return bytes;
}

/** The SVG drawn onto a canvas at `scale` times its size. */
async function toCanvas(svg: string, scale: number): Promise<HTMLCanvasElement> {
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
    return canvas;
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
