/**
 * The black-and-white scheme (`colours: bw`): a finished drawing made black, with grey only in
 * its filled shapes (dots, blobs, hadrons, jet cones), all in one grey. Black, white, `none`
 * and `currentColor` are left as they are.
 */
const NAMED: Record<string, string> = {
  red: "#ff0000", green: "#008000", blue: "#0000ff", orange: "#ffa500", purple: "#800080", pink: "#ffc0cb",
  teal: "#008080", gold: "#ffd700", brown: "#a52a2a", yellow: "#ffff00", cyan: "#00ffff", magenta: "#ff00ff",
  grey: "#808080", gray: "#808080", navy: "#000080", maroon: "#800000", olive: "#808000", lime: "#00ff00",
};

/** The grey of the same (perceived) lightness as a colour given as r, g, b in 0-255. */
function grey(r: number, g: number, b: number): string {
  const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const v = Math.round(255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055));
  const h = Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

/** One colour value made grey; anything that is not a colour is returned unchanged. */
export function toGrey(value: string): string {
  const v = value.trim().toLowerCase();
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,[^)]*)?\)$/.exec(v);
  if (m?.[4]) {
    const g = grey(Number(m[1]), Number(m[2]), Number(m[3]));
    return `rgba(${parseInt(g.slice(1, 3), 16)},${parseInt(g.slice(1, 3), 16)},${parseInt(g.slice(1, 3), 16)}${m[4]})`;
  }
  const rgb = colourAsRgb(v);
  return rgb ? grey(...rgb) : value;
}

/**
 * A colour as red, green and blue in 0-255: a CSS name from the table above, #rgb, #rrggbb or
 * rgb(r, g, b). Undefined for anything else (currentColor, an unknown name).
 */
export function colourAsRgb(value: string): [number, number, number] | undefined {
  const v = value.trim().toLowerCase();
  if (NAMED[v]) return colourAsRgb(NAMED[v]);
  let m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v);
  if (m) return m.slice(1).map((c) => parseInt(c + c, 16)) as [number, number, number];
  m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(v);
  if (m) return m.slice(1).map((c) => parseInt(c, 16)) as [number, number, number];
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,[^)]*)?\)$/.exec(v);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return undefined;
}

/** The one grey the black-and-white scheme fills shapes with. */
export const BW_FILL = "#a6a6a6";

/** True for a value that is a colour other than black or white (not none, currentColor or a url). */
function coloured(value: string): boolean {
  const g = toGrey(value).toLowerCase();
  return g !== value.toLowerCase() || /^#[0-9a-f]{6}$/.test(g) ? !/^#(000000|ffffff)$/.test(g) : false;
}

/**
 * The black-and-white scheme: lines, arrows and text black; only the fills of dots, blobs,
 * hadrons and jet cones grey (the grey of the same lightness), so shapes keep their shading.
 */
export function greyscaleSvg(svg: string): string {
  const colourAttr = /\b(fill|stroke|stop-color|color|flood-color|lighting-color)=("|')([^"']*)\2/g;
  // (marked, so a page's own colours for SUSY lines, blobs and cones leave it alone)
  svg = svg.replace(/class="feynjs"/, 'class="feynjs feynjs-bw"');
  return svg.replace(/<([a-zA-Z]+)\b[^>]*>/g, (tag, name: string) => {
    // (the background grid keeps its light grey)
    if (/class="feynjs-grid"/.test(tag)) return tag;
    // (shapes that are filled areas keep a grey fill; a gradient's stops are a cone's shading)
    const shaded = name === "circle" || name === "ellipse" || name === "stop" || /class="[^"]*(blob|hatch|jet-stop|feynjs-jet")/.test(tag);
    return tag.replace(colourAttr, (whole, attr: string, q: string, value: string) => {
      if (!coloured(value)) return whole;
      const grey = shaded && (attr === "fill" || attr === "stop-color");
      // (one grey for every fill; a see-through fill keeps how see-through it was)
      const alpha = /^rgba\([^)]*,\s*([\d.]+)\s*\)$/i.exec(value.trim());
      return `${attr}=${q}${grey ? (alpha ? `rgba(166,166,166,${alpha[1]})` : BW_FILL) : "#000000"}${q}`;
    });
  });
}
