import { fmt } from "../geometry/curve.ts";
import { svgDocument } from "./svg.ts";
import type { Theme } from "../theme.ts";

/** One diagram of several that are drawn side by side, with the caption shown under it. */
export interface Panel {
  source: string;
  caption: string;
  /** what stands between this panel and the one before: a symbol (×, ⊗, +, =), a cut line, or `into: words`, the fan-out from a step */
  joiner?: string;
  /** a step drawn before this panel (`---[step: words]`, a panel of no diagram of its own): a tall box of words, arrows in and out */
  step?: string;
  /** what goes into the step, each a labelled arrow from the panel before (`---[step: words | topology, impact parameters]`) */
  stepInputs?: string[];
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
  // (a step, `---[step: words]` with nothing under it, is no diagram: it rides on the panel after it)
  const used: (typeof panels[number] & { step?: string })[] = [];
  let step: string | undefined;
  for (const p of panels) {
    const stepWords = /^step\s*:\s*(.+)$/i.exec(p.joiner ?? "")?.[1];
    if (!p.lines.some((l) => l.trim() !== "")) { if (stepWords) step = stepWords.trim(); continue; }
    used.push({ ...p, ...(stepWords ? { joiner: undefined } : {}), ...(step || stepWords ? { step: step ?? stepWords!.trim() } : {}) });
    step = undefined;
  }
  const joined = used.some((p) => p.joiner || p.step);
  return used.map((p, i) => ({
    source: p.lines.join("\n"),
    caption: p.caption ?? (joined ? "" : `(${String.fromCharCode(97 + i)})`),
    joiner: i > 0 ? p.joiner : undefined,
    ...(p.step ? { step: p.step.split("|")[0].trim() } : {}),
    ...(p.step?.includes("|") ? { stepInputs: p.step.split("|")[1].split(",").map((x) => x.trim()).filter(Boolean) } : {}),
  }));
}

const JOINERS: Record<string, string> = { x: "×", times: "×", otimes: "⊗", "+": "+", "=": "=", "→": "→", to: "→" };

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A step's box (white words on it, clear for reading) and the fan-out's colour, an amber. */
// (the step a muted slate blue, white words on it 5:1; the fan-out the lightest amber still 3:1 on a white page)
const STEP_FILL = "#4f7099", FLOW_COLOUR = "#c8841c";

/** One sentence of how the panels flow, when steps or a fan-out join them: "A jet, then flavour tagging, into a b-jet and a c-jet." */
function flowSentence(captions: string[], joiners: (string | undefined)[], steps: (string | undefined)[]): string | undefined {
  if (!steps.some(Boolean) && !joiners.some((j) => j && /^into\s*:/i.test(j))) return undefined;
  const name = (i: number) => captions[i] || `panel ${i + 1}`;
  const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  const out: string[] = [];
  for (let i = 0; i < captions.length; i++) {
    if (steps[i]) out.push(`then ${steps[i]}`);
    const into = /^into\s*:\s*(.*)$/i.exec(joiners[i] ?? "");
    if (into) { out.push(`${(into[1] || "into").toLowerCase()} ${list(captions.slice(i).map((_, k) => name(i + k)))}`); break; }
    out.push(name(i));
  }
  const s = out.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

/** An arrow from `a` to `b`, its head filled. */
function arrowSvg(a: { x: number; y: number }, b: { x: number; y: number }, colour: string, width: number): string {
  const dx = b.x - a.x, dy = b.y - a.y, n = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / n, uy = dy / n, h = width * 5, s = width * 2.6;
  const back = { x: b.x - ux * h, y: b.y - uy * h };
  return `<path d="M${fmt(a.x)} ${fmt(a.y)}L${fmt(back.x)} ${fmt(back.y)}" stroke="${colour}" stroke-width="${fmt(width)}" fill="none"/>`
    + `<path d="M${fmt(b.x)} ${fmt(b.y)}L${fmt(back.x - uy * s)} ${fmt(back.y + ux * s)}L${fmt(back.x + uy * s)} ${fmt(back.y - ux * s)}Z" fill="${colour}"/>`;
}

/** Place rendered diagrams in rows, each with its caption centred beneath. */
export function composePanels(svgs: string[], captions: string[], theme: Theme, perRow: number, joiners: (string | undefined)[] = [], steps: (string | undefined)[] = [], stepInputs: (string[] | undefined)[] = []): string {
  const sizes = svgs.map((svg) => {
    const m = /width="([\d.]+)" height="([\d.]+)"/.exec(svg)!;
    return { w: Number(m[1]), h: Number(m[2]) };
  });
  const gap = theme.fontSize * 2, captionHeight = theme.fontSize * 1.8;
  const rows: number[][] = [];
  svgs.forEach((_, i) => { if (i % perRow === 0) rows.push([]); rows[rows.length - 1].push(i); });
  let y = 0, totalWidth = 0;
  const parts: string[] = [];
  const w = theme.line.stroke * 1.1, fs = theme.fontSize;
  for (const row of rows) {
    const rowHeight = Math.max(...row.map((i) => sizes[i].h));
    // (a fan-out in the row: a band above the panels for its bar and words)
    const fan = row.find((i) => /^into\s*:/i.test(joiners[i] ?? ""));
    const band = fan !== undefined ? fs * 2.8 : 0, cy = y + band + rowHeight / 2;
    let x = 0, stepRight: number | undefined;
    const centres: number[] = [];
    for (const i of row) {
      // a step before this panel: an arrow in from the panel before, the box, an arrow out
      // (or, from a fan-out, the bar over the panels after it)
      if (steps[i]) {
        // (what goes into it: labelled arrows, the words flat above each, spread down the row)
        const inputs = stepInputs[i] ?? [], labelSize = fs * 0.8;
        const stepW = fs * 2.3, arrow = Math.max(gap * 1.2, ...inputs.map((t) => t.length * labelSize * 0.52 + fs)), left = i === row[0] ? x : x - gap + 4;
        if (i !== row[0] && !inputs.length) parts.push(arrowSvg({ x: left, y: cy }, { x: left + arrow, y: cy }, "currentColor", w));
        inputs.forEach((words, k) => {
          const ay = y + band + (rowHeight * (k + 1)) / (inputs.length + 1);
          parts.push(arrowSvg({ x: left, y: ay }, { x: left + arrow, y: ay }, "currentColor", w)
            + `<text x="${fmt(left + arrow / 2)}" y="${fmt(ay - labelSize * 0.45)}" text-anchor="middle" font-size="${fmt(labelSize)}" font-family="${theme.captionFontFamily}" fill="currentColor">${escapeText(words)}</text>`);
        });
        // (clear of the arrows into it: a little room before the box)
        const bx = i === row[0] ? x : left + arrow + fs * 0.6, h = band + rowHeight;
        const words = escapeText(steps[i]!), size = Math.min(fs * 0.95, (h * 0.9) / Math.max(steps[i]!.length * 0.52, 1));
        parts.push(`<g class="feynjs-step"><rect x="${fmt(bx)}" y="${fmt(y)}" width="${fmt(stepW)}" height="${fmt(h)}" rx="${fmt(stepW * 0.32)}" fill="${STEP_FILL}"/>`
          + `<text transform="rotate(-90 ${fmt(bx + stepW / 2)} ${fmt(y + h / 2)})" x="${fmt(bx + stepW / 2)}" y="${fmt(y + h / 2 + size * 0.35)}" text-anchor="middle" font-size="${fmt(size)}" font-family="${theme.captionFontFamily}" font-style="italic" fill="#fff">${words}</text></g>`);
        stepRight = bx + stepW;
        x = bx + stepW + gap;
        if (!/^into\s*:/i.test(joiners[i] ?? "")) {
          parts.push(arrowSvg({ x: stepRight + 4, y: cy }, { x: stepRight + arrow, y: cy }, "currentColor", w));
          x = stepRight + arrow + 8;
        }
      }
      // what stands between this panel and the one before, in the gap: a symbol or a cut
      const joiner = /^into\s*:/i.test(joiners[i] ?? "") ? undefined : joiners[i];
      if (joiner && i !== row[0] && !steps[i]) {
        const mid = x - gap / 2;
        if (joiner === "cut") parts.push(`<path d="M${fmt(mid)} ${fmt(y + band)}V${fmt(y + band + rowHeight)}" stroke="currentColor" stroke-width="${fmt(theme.line.stroke)}" stroke-dasharray="6 4" opacity="0.7"/>`);
        else parts.push(`<text x="${fmt(mid)}" y="${fmt(cy + theme.fontSize * 0.45)}" text-anchor="middle" font-size="${fmt(theme.fontSize * 1.6)}" fill="currentColor">${escapeText(JOINERS[joiner] ?? joiner)}</text>`);
      }
      const inner = svgs[i].replace(/^<svg /, `<svg x="${fmt(x)}" y="${fmt(y + band + (rowHeight - sizes[i].h) / 2)}" `);
      parts.push(inner);
      centres[i] = x + sizes[i].w / 2;
      // (a caption is words, set in a text face, and carries a class a page can restyle)
      parts.push(`<text class="feynjs-caption" x="${fmt(x + sizes[i].w / 2)}" y="${fmt(y + band + rowHeight + captionHeight * 0.75)}" text-anchor="middle" font-size="${theme.fontSize}" font-family="${theme.captionFontFamily}" fill="currentColor">${escapeText(captions[i])}</text>`);
      x += sizes[i].w + gap;
    }
    // the fan-out: a bar from the step over its panels, its words on it, an arrow down to each
    if (fan !== undefined) {
      const targets = row.filter((i) => i >= fan), busY = y + band * 0.42, from = stepRight ?? centres[targets[0]] - gap, to = centres[targets[targets.length - 1]];
      parts.push(`<path d="M${fmt(from)} ${fmt(busY)}H${fmt(to)}" stroke="${FLOW_COLOUR}" stroke-width="${fmt(w * 1.3)}" fill="none"/>`);
      for (const t of targets) parts.push(arrowSvg({ x: centres[t], y: busY }, { x: centres[t], y: y + band - 2 }, FLOW_COLOUR, w * 1.3));
      const words = /^into\s*:\s*(.*)$/i.exec(joiners[fan]!)![1].trim();
      if (words) {
        const mid = (from + to) / 2, width = words.length * fs * 0.52 + fs;
        parts.push(`<rect class="feynjs-bg" x="${fmt(mid - width / 2)}" y="${fmt(busY - fs * 0.7)}" width="${fmt(width)}" height="${fmt(fs * 1.4)}" fill="#fff"/>`
          + `<text x="${fmt(mid)}" y="${fmt(busY + fs * 0.35)}" text-anchor="middle" font-size="${fmt(fs)}" font-family="${theme.captionFontFamily}" fill="currentColor">${escapeText(words)}</text>`);
      }
    }
    totalWidth = Math.max(totalWidth, x - gap);
    y += band + rowHeight + captionHeight + gap / 2;
  }
  const height = y - gap / 2;
  const flow = flowSentence(captions, joiners, steps);
  return svgDocument({ cls: "feynjs-panels", role: "group", ...(flow ? { label: flow } : {}), box: { left: 0, top: 0, width: totalWidth, height }, scale: 1, idPrefix: "feynjs-panels", theme, body: parts.join("") });
}
