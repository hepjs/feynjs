import { fmt } from "../geometry/curve.ts";
import { svgDocument } from "./svg.ts";
import type { Theme } from "../theme.ts";

/** One diagram of several that are drawn side by side, with the caption shown under it. */
export interface Panel {
  source: string;
  caption: string;
  /** what stands between this panel and the one before: a symbol (×, ⊗, +, =) or a cut line */
  joiner?: string;
}

/**
 * Split source text into panels. A line of three or more dashes starts a new panel, and
 * any text after the dashes is that panel's caption: `--- (b) with a loop`. Without
 * captions, panels are lettered (a), (b), (c). A joiner in brackets stands between this
 * panel and the one before: `---[x]` a times sign (two scatterings at once), `---[otimes]`,
 * `---[+]`, `---[=]`, or `---[cut]` a dashed cut line (an amplitude and its conjugate).
 * Joined panels are one figure, so they are not lettered.
 */
export function splitPanels(source: string): Panel[] {
  const panels: { lines: string[]; caption?: string; joiner?: string }[] = [{ lines: [] }];
  for (const line of source.split(/\r?\n/)) {
    const separator = /^\s*-{3,}\s*(?:\[([^\]]*)\])?\s*(.*?)\s*$/.exec(line);
    if (separator) panels.push({ lines: [], caption: separator[2] || undefined, joiner: separator[1]?.trim() || undefined });
    else panels[panels.length - 1].lines.push(line);
  }
  const used = panels.filter((p) => p.lines.some((l) => l.trim() !== ""));
  const joined = used.some((p) => p.joiner);
  return used.map((p, i) => ({
    source: p.lines.join("\n"),
    caption: p.caption ?? (joined ? "" : `(${String.fromCharCode(97 + i)})`),
    joiner: i > 0 ? p.joiner : undefined,
  }));
}

const JOINERS: Record<string, string> = { x: "×", times: "×", otimes: "⊗", "+": "+", "=": "=", "→": "→", to: "→" };

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Place rendered diagrams in rows, each with its caption centred beneath. */
export function composePanels(svgs: string[], captions: string[], theme: Theme, perRow: number, joiners: (string | undefined)[] = []): string {
  const sizes = svgs.map((svg) => {
    const m = /width="([\d.]+)" height="([\d.]+)"/.exec(svg)!;
    return { w: Number(m[1]), h: Number(m[2]) };
  });
  const gap = theme.fontSize * 2, captionHeight = theme.fontSize * 1.8;
  const rows: number[][] = [];
  svgs.forEach((_, i) => { if (i % perRow === 0) rows.push([]); rows[rows.length - 1].push(i); });
  let y = 0, totalWidth = 0;
  const parts: string[] = [];
  for (const row of rows) {
    const rowHeight = Math.max(...row.map((i) => sizes[i].h));
    let x = 0;
    for (const i of row) {
      // what stands between this panel and the one before, in the gap: a symbol or a cut
      const joiner = joiners[i];
      if (joiner && i !== row[0]) {
        const mid = x - gap / 2, cy = y + rowHeight / 2;
        if (joiner === "cut") parts.push(`<path d="M${fmt(mid)} ${fmt(y)}V${fmt(y + rowHeight)}" stroke="currentColor" stroke-width="${fmt(theme.line.stroke)}" stroke-dasharray="6 4" opacity="0.7"/>`);
        else parts.push(`<text x="${fmt(mid)}" y="${fmt(cy + theme.fontSize * 0.45)}" text-anchor="middle" font-size="${fmt(theme.fontSize * 1.6)}" fill="currentColor">${escapeText(JOINERS[joiner] ?? joiner)}</text>`);
      }
      const inner = svgs[i].replace(/^<svg /, `<svg x="${fmt(x)}" y="${fmt(y + (rowHeight - sizes[i].h) / 2)}" `);
      parts.push(inner);
      // (a caption is words, set in a text face, and carries a class a page can restyle)
      parts.push(`<text class="feynjs-caption" x="${fmt(x + sizes[i].w / 2)}" y="${fmt(y + rowHeight + captionHeight * 0.75)}" text-anchor="middle" font-size="${theme.fontSize}" font-family="${theme.captionFontFamily}" fill="currentColor">${escapeText(captions[i])}</text>`);
      x += sizes[i].w + gap;
    }
    totalWidth = Math.max(totalWidth, x - gap);
    y += rowHeight + captionHeight + gap / 2;
  }
  const height = y - gap / 2;
  return svgDocument({ cls: "feynjs-panels", role: "group", box: { left: 0, top: 0, width: totalWidth, height }, scale: 1, idPrefix: "feynjs-panels", theme, body: parts.join("") });
}
