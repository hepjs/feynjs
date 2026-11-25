import { fromTikzPicture } from "../parse/tikz-picture.ts";
import { CM_PER_LINE_LENGTH } from "../parse/lengths.ts";

/**
 * Every TikZ-Feynman picture in a LaTeX text, as feynjs source, one per picture, in order:
 * `\feynmandiagram [...] { ... };`, the `feynman` environment (in a tikzpicture or not), or a
 * picture's body alone (`\vertex` and `\diagram*` statements). Each is read as TikZ means it:
 * places in cm, written out in line lengths; `right=of a` TikZ-Feynman's node distance away; the
 * braced text of a `\vertex` as its label; groups and chains over several lines joined. A
 * one-way step, as a paper's diagrams move to feynjs: a feynman fence holds feynjs's own lines.
 * This is its own module, `feynjs/tikz`, so a page that only draws diagrams does not load it.
 */
export function fromTikz(tex: string): string[] {
  return picturesIn(tex).map(({ text, line, settings }) => tidy(fromTikzPicture(settings + "\n".repeat(Math.max(0, line - 1 - settings.split("\n").length + 1)) + text)));
}

/**
 * The pictures in a LaTeX text, each with the line it starts on (so an error names the file's
 * line) and the `\tikzfeynmanset{...}` written before it, which holds for every picture after it.
 */
function picturesIn(tex: string): { text: string; line: number; settings: string }[] {
  // (LaTeX comments dropped, line by line, so the lines still count true; \% is a percent sign)
  const text = tex.split(/\r?\n/).map((l) => l.replace(/(^|[^\\])%.*$/, "$1")).join("\n");
  const lineAt = (k: number) => text.slice(0, k).split("\n").length;
  const found: { start: number; end: number }[] = [];
  const pattern = /\\begin\s*\{\s*(tikzpicture|feynman)\s*\}|\\feynmandiagram\b/g;
  for (let m = pattern.exec(text); m; m = pattern.exec(text)) {
    const end = m[1] ? environmentEnd(text, m[1], m.index) : diagramEnd(text, m.index);
    const body = text.slice(m.index, end);
    // (a tikzpicture counts only when it holds a Feynman diagram)
    if (m[1] !== "tikzpicture" || /\\begin\s*\{\s*feynman\s*\}|\\feynmandiagram\b/.test(body)) found.push({ start: m.index, end });
    pattern.lastIndex = end;
  }
  const settingsBefore = (k: number) => [...text.slice(0, k).matchAll(/\\tikzfeynmanset\s*\{/g)].map((m) => text.slice(m.index!, diagramEnd(text, m.index!))).join(" ");
  if (found.length) return found.map(({ start, end }) => ({ text: text.slice(start, end), line: lineAt(start), settings: settingsBefore(start) }));
  // (no picture round it: a body pasted alone, its \vertex and \diagram* statements)
  return /\\(vertex|diagram)\b/.test(text) ? [{ text, line: 1, settings: "" }] : [];
}

/** Where an environment opened at `from` ends: past its `\end{name}`, or the text's end. */
function environmentEnd(text: string, name: string, from: number): number {
  const close = new RegExp(`\\\\end\\s*\\{\\s*${name}\\s*\\}`, "g");
  close.lastIndex = from;
  const m = close.exec(text);
  return m ? m.index + m[0].length : text.length;
}

/** Where `\feynmandiagram [...] { ... };` ends: past the brace that closes its body (and the semicolon). */
function diagramEnd(text: string, from: number): number {
  let k = text.indexOf("{", from), depth = 0;
  if (k < 0) return text.length;
  for (; k < text.length; k++) {
    if (text[k] === "{") depth++;
    else if (text[k] === "}" && --depth === 0) break;
  }
  const semicolon = /^\s*;/.exec(text.slice(k + 1));
  return k + 1 + (semicolon ? semicolon[0].length : 0);
}

/**
 * The rewritten picture made to read as a hand-written feynjs source: switches first, places in
 * line lengths (TikZ's cm at 1.6cm a line), the options feynjs has no use for in a comment, no
 * blank lines left where the TikZ wrapping was.
 */
function tidy(source: string): string {
  const lines = source.split("\n").flatMap(statements).map((l) => l.trim()).filter(Boolean).map(inLineLengths);
  const isSwitch = (l: string) => /^[a-z][\w' -]*:\s/i.test(l) && !l.includes("--") && !/\sat\s*\(/.test(l);
  const unused = lines.filter((l) => /^tikz:\s/.test(l)).map((l) => `% TikZ options feynjs does not use: ${l.replace(/^tikz:\s*/, "").replace(/^\{|\}$/g, "")}`);
  const switches = lines.filter((l) => isSwitch(l) && !/^tikz:\s/.test(l));
  const rest = lines.filter((l) => !isSwitch(l) && !/^tikz:\s/.test(l));
  return [...unused, ...switches, ...rest].join("\n");
}

/** A line's lengths in cm (`at (1.5cm, 0cm)`, `right=1.5cm of a`) written in line lengths, feynjs's own unit. */
function inLineLengths(line: string): string {
  return line.replace(/(-?(?:\d+\.?\d*|\.\d+))\s*cm\b/g, (_, n) => {
    const v = Math.round((Number(n) / CM_PER_LINE_LENGTH) * 10000) / 10000;
    return String(Object.is(v, -0) ? 0 : v);
  });
}

/** A line's statements: split at the semicolons outside brackets, braces and parentheses. */
function statements(line: string): string[] {
  const out: string[] = [];
  let depth = 0, from = 0;
  for (let k = 0; k < line.length; k++) {
    if ("[{(".includes(line[k])) depth++;
    else if ("]})".includes(line[k])) depth--;
    else if (line[k] === ";" && depth === 0) { out.push(line.slice(from, k)); from = k + 1; }
  }
  return [...out, line.slice(from)];
}
