/**
 * A small TeX-math subset rendered as plain SVG text, so diagrams need no math engine
 * and exported SVGs stand alone. Supports Greek, sub/superscripts, primes,
 * \tilde \bar \hat (and wide/overline forms), \mathrm/\text, and common symbols.
 */

const SYMBOLS: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ϵ", varepsilon: "ε", zeta: "ζ", eta: "η",
  theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ",
  sigma: "σ", tau: "τ", upsilon: "υ", phi: "ϕ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Upsilon: "Υ",
  Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  varPhi: "Φ", varGamma: "Γ", varDelta: "Δ", varLambda: "Λ", varSigma: "Σ", varOmega: "Ω", vartheta: "ϑ", varrho: "ϱ",
  ell: "ℓ", pm: "±", mp: "∓", to: "→", rightarrow: "→", leftarrow: "←", times: "×", cdot: "·",
  prime: "′", ast: "∗", star: "⋆", dagger: "†", infty: "∞", partial: "∂", hbar: "ℏ", neq: "≠",
  leq: "≤", geq: "≥", sim: "∼", approx: "≈", ldots: "…", dots: "…", "": " ",
};
const ACCENTS: Record<string, "tilde" | "bar" | "hat"> = {
  tilde: "tilde", widetilde: "tilde", bar: "bar", overline: "bar", hat: "hat", widehat: "hat",
};
const UPRIGHT_CMDS = new Set(["mathrm", "text", "textrm", "rm", "mathsf", "textsf", "operatorname"]);
const PASSTHROUGH = new Set(["mathit", "mathbf", "boldsymbol", "bm", "textit", "textbf", "textsf", "mathsfit", "mathcal", "ensuremath", "left", "right", "displaystyle"]);

type Node =
  | { t: "char"; c: string; italic: boolean }
  | { t: "group"; kids: Node[] }
  | { t: "accent"; kind: "tilde" | "bar" | "hat"; kid: Node }
  | { t: "sqrt"; kid: Node }
  | { t: "script"; base: Node; sup?: Node; sub?: Node }
  | { t: "space"; w: number };

class P {
  i = 0;
  s: string;
  constructor(s: string) { this.s = s; }
  parseSeq(upright: boolean, stop?: string): Node[] {
    const out: Node[] = [];
    while (this.i < this.s.length) {
      const ch = this.s[this.i];
      if (ch === stop) { this.i++; break; }
      if (ch === "^" || ch === "_") {
        this.i++;
        const arg = this.parseArg(upright);
        const prev = out.pop() ?? { t: "group", kids: [] } as Node;
        const sc: Node = prev.t === "script" ? prev : { t: "script", base: prev };
        if (sc.t === "script") { if (ch === "^") sc.sup = join(sc.sup, arg); else sc.sub = join(sc.sub, arg); }
        out.push(sc);
        continue;
      }
      if (ch === "'") { this.i++; out.push({ t: "char", c: "′", italic: false }); continue; }
      out.push(this.parseAtom(upright));
    }
    return out;
  }
  parseArg(upright: boolean): Node {
    while (this.s[this.i] === " ") this.i++;
    return this.parseAtom(upright);
  }
  parseAtom(upright: boolean): Node {
    const ch = this.s[this.i++];
    if (ch === "{") return { t: "group", kids: this.parseSeq(upright, "}") };
    if (ch === "\\") {
      const m = /^[A-Za-z]+/.exec(this.s.slice(this.i));
      if (!m) {
        const c = this.s[this.i++] ?? "";
        if (c === "," || c === ";" || c === ":" || c === " " || c === "!") return { t: "space", w: c === "!" ? -0.1 : 0.17 };
        return { t: "char", c, italic: false };
      }
      const name = m[0];
      this.i += name.length;
      while (this.s[this.i] === " ") this.i++;
      if (name in ACCENTS) return { t: "accent", kind: ACCENTS[name], kid: this.parseArg(upright) };
      if (name === "sqrt") return { t: "sqrt", kid: this.parseArg(upright) };
      if (UPRIGHT_CMDS.has(name)) return this.parseArg(true);
      if (PASSTHROUGH.has(name)) return this.s[this.i] === "{" ? this.parseArg(upright) : { t: "group", kids: [] };
      if (name === "quad") return { t: "space", w: 1 };
      if (name === "to" || name === "rightarrow") return { t: "group", kids: [{ t: "space", w: 0.2 }, { t: "char", c: "→", italic: false }, { t: "space", w: 0.2 }] };
      if (name in SYMBOLS) {
        const c = SYMBOLS[name];
        // (ε upright: the italic face draws it as the lunate ϵ of \epsilon)
        return { t: "char", c, italic: !upright && /[α-ωϵϕℓ]/.test(c) && c !== "ε" };
      }
      return { t: "group", kids: [...name].map((c) => ({ t: "char", c, italic: false } as Node)) };
    }
    if (ch === " ") return { t: "space", w: upright ? 0.25 : 0.22 };
    if (ch === "~") return { t: "space", w: 0.25 };
    if (ch === "-" && !upright) return { t: "char", c: "−", italic: false };
    if (ch === "*") return { t: "char", c: "∗", italic: false };
    return { t: "char", c: ch, italic: !upright && /[A-Za-z]/.test(ch) };
  }
}
function join(a: Node | undefined, b: Node): Node {
  if (!a) return b;
  return { t: "group", kids: [a, b] };
}

/** Rough advance widths in em for an italic serif; good enough to place labels. */
function charWidth(c: string, italic: boolean): number {
  if ("ijl′.,:;!|'".includes(c)) return 0.29;
  if ("ftrsI()[]/ℓ·".includes(c)) return 0.36;
  if ("mwMW".includes(c)) return italic ? 0.78 : 0.84;
  if ("±∓−+=→←×∼≈≤≥≠".includes(c)) return 0.62;
  if (c === "∗" || c === "⋆" || c === "†") return 0.46;
  if (/[A-Z]/.test(c)) return 0.66;
  if (/[Γ-Ω]/.test(c)) return 0.68;
  if (/[0-9]/.test(c)) return 0.5;
  if (/[α-ωϵϕ]/.test(c)) return 0.52;
  return 0.48;
}
function isTall(n: Node): boolean {
  if (n.t === "char") return /[A-Zbdfhklt0-9Γ-Ωβδζθλξℓ]/.test(n.c);
  if (n.t === "group") return n.kids.some(isTall);
  if (n.t === "script") return isTall(n.base);
  if (n.t === "accent" || n.t === "sqrt") return true;
  return false;
}

export interface LabelBox {
  /** SVG markup, baseline at y=0, starting at x=0 */
  svg: string;
  width: number;
  ascent: number;
  descent: number;
}

interface Ctx { parts: string[]; top: number; bottom: number }
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r2 = (n: number) => Math.round(n * 100) / 100;

function lay(n: Node, x: number, y: number, size: number, ctx: Ctx): number {
  switch (n.t) {
    case "space": return n.w * size;
    case "char": {
      const w = charWidth(n.c, n.italic) * size;
      ctx.parts.push(`<text x="${r2(x + w / 2)}" y="${r2(y)}" font-size="${r2(size)}" text-anchor="middle"${n.italic ? ' font-style="italic"' : ""}>${esc(n.c)}</text>`);
      ctx.top = Math.min(ctx.top, y - (isTall(n) ? 0.7 : 0.48) * size);
      ctx.bottom = Math.max(ctx.bottom, y + (/[gjpqyμβγηρφχψζξ]/.test(n.c) ? 0.22 : 0.02) * size);
      return w;
    }
    case "group": {
      let w = 0;
      for (const k of n.kids) w += lay(k, x + w, y, size, ctx);
      return w;
    }
    case "accent": {
      const w = lay(n.kid, x, y, size, ctx);
      const h = y - (isTall(n.kid) ? 0.82 : 0.6) * size;
      const sw = r2(size * 0.055);
      const x0 = x + w * 0.12 + size * 0.06, x1 = x + w * 0.92 + size * 0.06; // lean with the italic
      let d: string;
      if (n.kind === "bar") d = `M${r2(x0)} ${r2(h)}H${r2(x1)}`;
      else if (n.kind === "hat") d = `M${r2(x0)} ${r2(h + size * 0.06)}L${r2((x0 + x1) / 2)} ${r2(h - size * 0.07)}L${r2(x1)} ${r2(h + size * 0.06)}`;
      else {
        const a = size * 0.07, q = (x1 - x0) / 4;
        d = `M${r2(x0)} ${r2(h + a * 0.5)}C${r2(x0 + q * 0.6)} ${r2(h - a * 1.6)} ${r2(x0 + q * 1.4)} ${r2(h - a * 1.2)} ${r2(x0 + 2 * q)} ${r2(h)}S${r2(x1 - q * 0.6)} ${r2(h + a * 1.6)} ${r2(x1)} ${r2(h - a * 0.5)}`;
      }
      ctx.parts.push(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"/>`);
      ctx.top = Math.min(ctx.top, h - size * 0.12);
      return w;
    }
    case "sqrt": {
      // a radical drawn as one stroke: a tick, down, up to the bar that runs over the argument
      const lead = size * 0.5;
      const w = lay(n.kid, x + lead, y, size, ctx);
      const h = y - (isTall(n.kid) ? 0.86 : 0.66) * size;
      const sw = r2(size * 0.05);
      const d = `M${r2(x + size * 0.04)} ${r2(y - size * 0.3)}L${r2(x + size * 0.13)} ${r2(y - size * 0.35)}L${r2(x + size * 0.26)} ${r2(y + size * 0.06)}L${r2(x + lead - size * 0.04)} ${r2(h)}H${r2(x + lead + w + size * 0.02)}`;
      ctx.parts.push(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
      ctx.top = Math.min(ctx.top, h - size * 0.08);
      ctx.bottom = Math.max(ctx.bottom, y + size * 0.08);
      return lead + w + size * 0.06;
    }
    case "script": {
      const w = lay(n.base, x, y, size, ctx);
      const s = size * 0.7;
      const tall = isTall(n.base);
      let sw = 0;
      // (scripts stand a little clear of an italic letter, whose glyph leans past its advance)
      // (and further from an italic capital whose top leans out over it: W, V, Y, T, U, X)
      const overhang = n.base.t === "char" && n.base.italic && /[WVYTUX]/.test(n.base.c) ? size * 0.08 : 0;
      if (n.sup) sw = Math.max(sw, lay(n.sup, x + w + size * 0.16 + overhang, y - (tall ? 0.46 : 0.41) * size, s, ctx) + size * 0.12 + overhang);
      if (n.sub) sw = Math.max(sw, lay(n.sub, x + w + size * 0.1, y + 0.25 * size, s, ctx) + size * 0.06);
      return w + sw + size * 0.04;
    }
  }
}

/**
 * The word, if a label is just an upright word: `\mathrm{NLSP}`, `\text{LSP}`, or a run
 * of capitals such as `HLSP`. Such labels are names, not symbols, and are set smaller.
 */
function uprightWord(src: string): string | undefined {
  const wrapped = /^\\(?:mathrm|text|textrm|rm)\s*\{([A-Za-z][A-Za-z ]+)\}$/.exec(src);
  if (wrapped) return wrapped[1];
  return /^[A-Z]{2,}[A-Za-z]*$/.test(src) && !/^[A-Z][a-z]?$/.test(src) ? src : undefined;
}

/** Lay out a label. `wordScale` sets the size of labels that are upright words. */
export function layoutLabel(tex: string, size: number, wordScale = 1): LabelBox {
  tex = scriptCapitals(tex);
  let src = tex.trim().replace(/^\$+|\$+$/g, "");
  const word = uprightWord(src);
  if (word) { src = `\\mathrm{${word}}`; size *= wordScale; }
  const root: Node = { t: "group", kids: new P(src).parseSeq(false) };
  const ctx: Ctx = { parts: [], top: 0, bottom: 0 };
  const width = lay(root, 0, 0, size, ctx);
  return { svg: ctx.parts.join(""), width, ascent: -ctx.top, descent: ctx.bottom };
}

/** `\mathcal{M}` as the Unicode script capital (no math font is loaded). */
const SCRIPT = "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵";
function scriptCapitals(tex: string): string {
  return tex.replace(/\\mathcal\s*(?:\{\s*([A-Z])\s*\}|([A-Z]))/g, (_, a, b) => [...SCRIPT][(a ?? b).charCodeAt(0) - 65]);
}
