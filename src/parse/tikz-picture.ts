import { FeynError } from "../model.ts";
import { lengthInCm } from "./lengths.ts";
import { TIKZ_LAYOUTS } from "./tikz-layouts.ts";

/**
 * A TikZ-Feynman picture pasted as a paper writes it, read as feynjs's own lines before the
 * diagram is read:
 *
 *     \feynmandiagram [horizontal=a to b] { i1 -- [fermion] a -- [fermion] i2, a -- [photon] b, ... };
 *
 *     \begin{feynman}                          (in a tikzpicture or not)
 *       \vertex (a);                           (the first point with no place sits at the origin)
 *       \vertex [right=of a] (b) {\(e^-\)};    (the braced text is the point's particle label)
 *       \diagram* { (a) -- [fermion] (b), (b) -- [gluon] {c, d} };
 *     \end{feynman}
 *
 * What the picture means is kept: a place is in cm, as TikZ measures it (a bare number too),
 * `right=of a` is TikZ-Feynman's node distance away (1.5cm; 1cm with `small`, 2cm with
 * `large`), a diagonal one that far along the diagonal, and an edge label sits on the left of
 * its line (`edge labels: left`). A chain may run over several lines, as in TikZ, and a group
 * (`a -- {b, c}`, `{a, b} -- c`) joins every point of it. The picture's own options become
 * switches; ones feynjs has no use for are kept in a `tikz:` switch, which check() names.
 * Each statement lands on the line it started on, so an error points at the right line.
 */
export function fromTikzPicture(source: string): string {
  if (!/\\(feynmandiagram|begin\s*\{\s*(feynman|tikzpicture)\s*\}|vertex\b|diagram\b)/.test(source)) return source;
  const picture = new TikzPicture(source);
  return picture.asFeynjs();
}

/** TikZ-Feynman's distance between points placed from one another, in cm, at each size. */
const NODE_DISTANCE: Record<string, number> = { small: 1, medium: 1.5, large: 2 };
const DIAGONAL = 0.707106781;

interface Piece { text: string; start: number }
interface PointWritten { name: string; options: string[]; at?: string; text?: string; start: number }

class TikzPicture {
  /** the source, its comments blanked out (so every offset still points where it did) */
  private text: string;
  private lineStarts: number[] = [0];
  /** what each line of the source becomes */
  private lines: string[][];
  /** lines feynjs reads first, whatever their place: `every photon: ...` */
  private everyLines: string[] = [];
  /** the picture's options feynjs has no use for */
  private unused: string[] = [];
  /** how far `right=of a` places a point, in cm (and whether `node distance=` said so) */
  private nodeDistance = NODE_DISTANCE.medium;
  private nodeDistanceSet = false;

  constructor(source: string) {
    this.text = source.replace(/(^|[^\\])%.*$/gm, (all, before: string) => before + " ".repeat(all.length - before.length));
    for (let i = 0; i < source.length; i++) if (source[i] === "\n") this.lineStarts.push(i + 1);
    this.lines = this.lineStarts.map(() => []);
  }

  asFeynjs(): string {
    // (the environments only hold the picture: a tikzpicture's options are the diagram's)
    let body = this.text;
    for (const m of this.text.matchAll(/\\(begin|end)\s*\{\s*(tikzpicture|feynman)\s*\}/g)) {
      let end = m.index! + m[0].length;
      const bracket = m[1] === "begin" ? /^\s*\[/.exec(this.text.slice(end)) : null;
      if (bracket) {
        const open = end + bracket[0].length - 1, close = closing(this.text, open, this.lineOf(open));
        this.diagramOptions(this.text.slice(open + 1, close), open);
        end = close + 1;
      }
      // (blanked to the statement's end, newlines kept, so every offset still points where it did)
      body = body.slice(0, m.index!) + ";" + body.slice(m.index! + 1, end).replace(/[^\n]/g, " ") + body.slice(end);
    }
    // (\tikzfeynmanset{every photon/.style={blue}} sets options and ends with its brace, not a ;)
    for (const m of this.text.matchAll(/\\tikzfeynmanset\s*\{/g)) {
      const open = m.index! + m[0].length - 1, close = closing(this.text, open, this.lineOf(open));
      this.diagramOptions(this.text.slice(open + 1, close), m.index!);
      body = body.slice(0, m.index!) + ";" + body.slice(m.index! + 1, close + 1).replace(/[^\n]/g, " ") + body.slice(close + 1);
    }
    const statements = splitAt(body, [";"]).filter((p) => p.text.trim());
    const points: PointWritten[] = [];
    const graphs: Piece[] = [];
    for (const statement of statements) {
      const text = statement.text.trim(), start = statement.start + statement.text.indexOf(text);
      const command = /^\\([A-Za-z]+)(\*?)/.exec(text);
      if (!command) throw new FeynError(`cannot read "${text.slice(0, 40)}" in a TikZ-Feynman picture: feynjs reads \\feynmandiagram, \\vertex and \\diagram there`, this.lineOf(start));
      const rest = text.slice(command[0].length), restStart = start + command[0].length;
      if (command[1] === "vertex") points.push(this.pointWritten(rest, restStart));
      else if (command[1] === "feynmandiagram" || command[1] === "diagram") graphs.push(this.graphWritten(rest, restStart));
      else throw new FeynError(`feynjs reads \\feynmandiagram, \\vertex and \\diagram in a TikZ-Feynman picture, not \\${command[1]}`, this.lineOf(start));
    }
    this.writePoints(points);
    for (const graph of graphs) this.writeGraph(graph.text, graph.start);
    const written = this.lines.map((statements) => statements.join("; "));
    // (after the picture's own lines: TikZ's edge labels sit on the left, and what feynjs has no use for is named)
    written.push("edge labels: left");
    if (this.unused.length) written.push(`tikz: {${this.unused.join(", ")}}`);
    return [...written, ...this.everyLines].join("\n");
  }

  private lineOf(offset: number): number {
    let lo = 0, hi = this.lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (this.lineStarts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  }

  /** A statement on the line it started on (all on that line: feynjs ends a statement with its line). */
  private write(offset: number, statement: string): void {
    this.lines[this.lineOf(offset) - 1].push(statement.replace(/\s*\n\s*/g, " "));
  }

  /** The braced group that `text` starts with (after any spaces). */
  private braced(text: string, start: number): Piece {
    const open = text.search(/\S/);
    if (open < 0 || text[open] !== "{") throw new FeynError(`write the diagram in braces: \\diagram* { a -- b }`, this.lineOf(start));
    const close = closing(text, open, this.lineOf(start + open));
    if (text.slice(close + 1).trim()) throw new FeynError(`cannot read "${text.slice(close + 1).trim().slice(0, 40)}" after the diagram`, this.lineOf(start + close));
    return { text: text.slice(open + 1, close), start: start + open + 1 };
  }

  /** `\feynmandiagram [options] { graph }`, `\diagram* [options] { graph }`. */
  private graphWritten(rest: string, start: number): Piece {
    const i = rest.search(/\S/);
    if (i >= 0 && rest[i] === "[") {
      const close = closing(rest, i, this.lineOf(start + i));
      this.diagramOptions(rest.slice(i + 1, close), start + i);
      rest = " ".repeat(close + 1) + rest.slice(close + 1);
    }
    return this.braced(rest, start);
  }

  /** The picture's own options: its switches, on the line they are written on. */
  private diagramOptions(body: string, offset: number): void {
    const line = this.lineOf(offset), options = pictureOptions(body, line);
    for (const statement of options.switches) this.write(offset, statement);
    this.everyLines.push(...options.every);
    this.unused.push(...options.unused);
    if (options.nodeDistance !== undefined) { this.nodeDistance = options.nodeDistance; this.nodeDistanceSet = true; }
    else if (options.size && !this.nodeDistanceSet) this.nodeDistance = NODE_DISTANCE[options.size];
  }

  /** `\vertex [options] (name) at (x, y) {text}`, its parts in any order TikZ allows. */
  private pointWritten(rest: string, start: number): PointWritten {
    const point: PointWritten = { name: "", options: [], start };
    const line = this.lineOf(start);
    let at = false;
    for (let i = 0; i < rest.length;) {
      const ch = rest[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (rest.startsWith("at", i) && !/\w/.test(rest[i + 2] ?? "")) { at = true; i += 2; continue; }
      if (ch !== "[" && ch !== "(" && ch !== "{") throw new FeynError(`cannot read "${rest.slice(i).trim().slice(0, 40)}" in \\vertex`, line);
      const close = closing(rest, i, line), inside = rest.slice(i + 1, close);
      if (ch === "[") point.options.push(...splitAt(inside, [","]).map((p) => p.text.trim()).filter(Boolean));
      else if (ch === "{") point.text = inside.trim();
      else if (at) { point.at = inside; at = false; }
      else point.name = pointName(inside, line);
      i = close + 1;
    }
    if (!point.name) throw new FeynError(`a \\vertex needs a name: \\vertex (a)`, line);
    return point;
  }

  /** The points, each as one line: its options, its place, its particle label. */
  private writePoints(points: PointWritten[]): void {
    // (TikZ puts a point with no place at the origin: the first such point goes there, when the
    // picture places points at all, and the others are left to the layout)
    const placed = (p: PointWritten) => p.at !== undefined || p.options.some((o) => placement(o) !== undefined);
    const origin = points.some(placed) ? points.find((p) => !placed(p)) : undefined;
    for (const p of points) {
      const line = this.lineOf(p.start);
      const options = p.options.map((o) => this.vertexOption(o, line));
      if (p.text) options.push(asText(p.text));
      const at = p === origin ? " at (0cm, 0cm)" : p.at !== undefined ? ` ${this.coordinate(p.at, line)}` : "";
      this.write(p.start, `${p.name}${options.length ? ` [${options.join(", ")}]` : ""}${at}`);
    }
  }

  /** `at (1, 2)` in cm, as TikZ means a bare number; `(30:1)` likewise; `at (a)` on a. */
  private coordinate(inside: string, line: number): string {
    const polar = /^\s*(-?[\d.]+)\s*:\s*(.+?)\s*$/.exec(inside);
    if (polar) return `at (${polar[1]}:${withUnit(polar[2], line)})`;
    const parts = splitAt(inside, [","]);
    if (parts.length === 2) return `at (${withUnit(parts[0].text, line)}, ${withUnit(parts[1].text, line)})`;
    if (parts.length === 1 && /^\s*[A-Za-z_][\w']*(\.[\w ]+)?\s*$/.test(inside)) return `at (${pointName(inside, line)})`;
    throw new FeynError(`cannot read the place (${inside.trim()}): write (x, y), (angle:distance) or a point's name`, line);
  }

  /**
   * A point's option: a place from another point in cm, as TikZ measures it; its particle
   * label as the text it is in TikZ; any other as it is.
   */
  private vertexOption(option: string, line: number): string {
    const particle = /^\s*particle\s*=\s*([\s\S]*?)\s*$/.exec(option);
    if (particle) return asText(particle[1]);
    const p = placement(option);
    if (!p) return option;
    const anchor = pointName(p.anchor, line);
    const diagonal = /^(above|below) (left|right)$/.test(p.key);
    if (p.second !== undefined) return `${p.key}=${centimetres(p.first!, line)}cm and ${centimetres(p.second, line)}cm of ${anchor}`;
    const distance = p.first !== undefined ? centimetres(p.first, line) : this.nodeDistance;
    // (one distance on a diagonal is along it, as TikZ's positioning library puts it)
    const along = round(diagonal ? distance * DIAGONAL : distance);
    return diagonal ? `${p.key}=${along}cm and ${along}cm of ${anchor}` : `${p.key}=${along}cm of ${anchor}`;
  }

  /** A TikZ graph: chains joined by `,` or `;`, run over as many lines as they like. */
  private writeGraph(body: string, start: number): void {
    for (const piece of splitAt(body, [",", ";"])) {
      const text = piece.text.trim();
      if (!text) continue;
      const at = start + piece.start + piece.text.indexOf(text);
      const chain = this.chainOf(text, at);
      for (const statement of chain.statements) this.write(at, statement);
    }
  }

  /**
   * One chain, `a -- [fermion] b -- c`, as feynjs's lines. A group, `{b, c}`, is several chains
   * at once: a line into it reaches the first point of each, a line out of it leaves the last.
   */
  private chainOf(text: string, start: number): { first: string[]; last: string[]; statements: string[] } {
    const line = this.lineOf(start);
    const steps = splitAt(text, ["--"]);
    const statements: string[] = [];
    let simple = true;
    const terms: { names: { first: string[]; last: string[] }; edge: string; written: string }[] = [];
    steps.forEach((step, k) => {
      let term = step.text.trim(), edge = "";
      if (k > 0 && term.startsWith("[")) {
        const close = closing(term, 0, line);
        edge = term.slice(0, close + 1);
        term = term.slice(close + 1).trim();
      }
      if (!term) throw new FeynError(`a line in "${text.slice(0, 40)}" has no point at its end`, line);
      if (term.startsWith("{")) {
        const close = closing(term, 0, line);
        if (term.slice(close + 1).trim()) throw new FeynError(`cannot read "${term.slice(close + 1).trim()}" after a group`, line);
        // (a group's own options, `{[same layer] b, c}`, are for TikZ's layouts alone)
        const inside = term.slice(1, close).replace(/^\s*\[[^\]]*\]/, "");
        const group = { first: [] as string[], last: [] as string[] };
        for (const piece of splitAt(inside, [",", ";"])) {
          if (!piece.text.trim()) continue;
          const inner = this.chainOf(piece.text.trim(), start + steps[k].start + steps[k].text.trimEnd().length - term.length + 1 + piece.start);
          group.first.push(...inner.first);
          group.last.push(...inner.last);
          statements.push(...inner.statements);
        }
        terms.push({ names: group, edge, written: "" });
        simple = false;
      } else {
        const m = /^\(?\s*([^\s()[\]{}.]+)(?:\.[\w ]+)?\s*\)?\s*(\[[\s\S]*\])?$/.exec(term);
        if (!m) throw new FeynError(`cannot read "${term.slice(0, 40)}" as a point`, line);
        const name = pointName(m[1], line);
        const options = m[2] ? splitAt(m[2].slice(1, -1), [","]).map((o) => o.text.trim()).filter(Boolean).map((o) => this.vertexOption(o, line)) : [];
        terms.push({ names: { first: [name], last: [name] }, edge, written: `${name}${options.length ? ` [${options.join(", ")}]` : ""}` });
      }
    });
    if (simple) statements.push(terms.map((t, k) => (k ? `-- ${t.edge ? `${t.edge} ` : ""}` : "") + t.written).join(" "));
    else {
      for (const t of terms) if (t.written !== t.names.first[0] && t.written) statements.push(t.written);
      for (let k = 1; k < terms.length; k++) {
        for (const from of terms[k - 1].names.last) for (const to of terms[k].names.first) statements.push(`${from} -- ${terms[k].edge ? `${terms[k].edge} ` : ""}${to}`);
      }
    }
    return { first: terms[0].names.first, last: terms[terms.length - 1].names.last, statements };
  }
}

/**
 * A TikZ-Feynman picture's options (`\feynmandiagram [...]`, `\diagram [...]`, a tikzpicture's,
 * or feynjs's own `[...]` line) as switches: `horizontal=a to b` (and vertical, primed),
 * `small`, `medium`, `large`, `inline=(a)` (small, and sat on the text), `baseline=(a.base)`,
 * a TikZ layout's name, `every photon/.style={...}`. `node distance=` is how far `right=of a`
 * places a point; what feynjs has no use for is kept, to be named.
 */
export function pictureOptions(body: string, line: number): { switches: string[]; every: string[]; unused: string[]; size?: string; nodeDistance?: number } {
  const out: { switches: string[]; every: string[]; unused: string[]; size?: string; nodeDistance?: number } = { switches: [], every: [], unused: [] };
  for (const piece of splitAt(body, [","])) {
    const option = piece.text.trim().replace(/^\/tikz(feynman)?\//, "");
    if (!option) continue;
    const eq = splitAt(option, ["="]);
    const key = eq[0].text.trim().replace(/\s+/g, " ");
    const value = eq.length > 1 ? unbrace(option.slice(eq[0].text.length + 1).trim()) : undefined;
    const every = /^(every [a-z ]+?)\/\.(append )?style$/.exec(key);
    if (/^(horizontal|vertical)'?$/.test(key) && value) {
      const m = /^\s*(.+?)\s+to\s+(.+?)\s*$/.exec(value);
      if (!m) throw new FeynError(`write "${key}=a to b"`, line);
      out.switches.push(`${key}: ${pointName(m[1], line)} to ${pointName(m[2], line)}`);
    } else if (key in NODE_DISTANCE && value === undefined) {
      out.switches.push(`size: ${key}`);
      out.size = key;
    } else if ((key === "inline" || key === "baseline") && (value || key === "inline")) {
      // (TikZ-Feynman's inline is small too)
      if (key === "inline") { out.switches.push("size: small"); out.size = "small"; }
      if (value) out.switches.push(`inline: ${pointName(value, line)}`);
    } else if (TIKZ_LAYOUTS.has(key) && value === undefined) out.switches.push(`layout: ${key}`);
    else if (key === "node distance" && value) {
      const [first, second] = value.split(/\s+and\s+/);
      out.nodeDistance = centimetres(second ?? first, line);
    } else if (every && value !== undefined) out.every.push(`${every[1]}: ${value}`);
    else out.unused.push(option.replace(/\s+/g, " "));
  }
  return out;
}

/** `right=of a`, `above left=1.5cm of b`, `below=1 and 2 of c.east`: what the option places from. */
function placement(option: string): { key: string; first?: string; second?: string; anchor: string } | undefined {
  const m = /^\s*((?:above|below)(?: left| right)?|left|right)\s*=\s*(?:(.+?)(?:\s+and\s+(.+?))?\s+)?of\s+(.+?)\s*$/.exec(option);
  return m ? { key: m[1], first: m[2], second: m[3], anchor: m[4] } : undefined;
}

/** A point's name: `a`, `(a)`, `a.east` (an anchor is the point itself in feynjs). */
function pointName(text: string, line: number): string {
  const m = /^\s*\(?\s*([^\s()[\]{}.]+)(?:\.[\w ]+)?\s*\)?\s*$/.exec(text);
  if (!m || !/^[A-Za-z_][\w']*$/.test(m[1])) throw new FeynError(`feynjs names a point with letters, digits, _ and ', starting with a letter: not "${text.trim()}"`, line);
  return m[1];
}

/** A length in cm, rounded (a bare number is in cm, as TikZ reads it). */
const centimetres = (text: string, line: number) => round(lengthInCm(text, line));
const withUnit = (text: string, line: number) => `${centimetres(text, line)}cm`;
const round = (n: number) => Math.round(n * 10000) / 10000;
/**
 * A point's text, as TikZ sets it: words, not a feynjs particle name (`particle={{q}}`, braced
 * twice, is the label q, drawn as written, with nothing of the quark's line style).
 */
function asText(text: string): string {
  const inner = unbrace(text.trim()).replace(/^\$([\s\S]*)\$$/, "$1").replace(/^\\\(([\s\S]*)\\\)$/, "$1").trim();
  return `particle={{${inner}}}`;
}
const unbrace = (s: string) => (s.startsWith("{") && s.endsWith("}") ? s.slice(1, -1).trim() : s);

/** The index of the bracket that closes the one at `open` (a backslashed one does not count). */
function closing(text: string, open: number, line: number): number {
  const pairs: Record<string, string> = { "[": "]", "{": "}", "(": ")" };
  const stack: string[] = [];
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\") { i++; continue; }
    // (a parenthesis inside braces or brackets is text, `[edge label=f(x]`, and may stand alone)
    const inText = stack.length > 0 && stack[stack.length - 1] !== ")";
    if ((ch === "(" || ch === ")") && inText) continue;
    if (ch in pairs) stack.push(pairs[ch]);
    else if (ch === "]" || ch === "}" || ch === ")") {
      if (ch !== stack[stack.length - 1]) throw new FeynError(`a "${ch}" here closes nothing`, line);
      stack.pop();
      if (!stack.length) return i;
    }
  }
  throw new FeynError(`a "${text[open]}" is not closed`, line);
}

/**
 * Split at any of `seps` (`,`, or `--`) outside every bracket and brace, keeping where each
 * piece starts. A backslashed character (`\(`, `\{`) is text, not a bracket.
 */
function splitAt(text: string, seps: string[]): Piece[] {
  const out: Piece[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\") { i++; continue; }
    if (ch === "[" || ch === "{" || ch === "(") depth++;
    else if (ch === "]" || ch === "}" || ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0) {
      const sep = seps.find((s) => text.startsWith(s, i));
      if (sep === undefined) continue;
      out.push({ text: text.slice(start, i), start });
      start = i + sep.length;
      i += sep.length - 1;
    }
  }
  out.push({ text: text.slice(start), start });
  return out;
}
