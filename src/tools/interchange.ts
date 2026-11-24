/**
 * The hand-over format: feynjs source as other programs write it (the MadGraph plugin, a diagram
 * generator of one's own), versioned; and the same diagram given as data instead of text.
 *
 * The text stays the one source of truth: data is written out as text first, so a diagram given
 * either way is read, laid out and drawn by the same code.
 */
import { FeynError } from "../model.ts";

/** The version of the hand-over format this feynjs reads, as a file names it on its first line: `% feynjs-interchange 1`. */
export const INTERCHANGE_VERSION = 1;

/** The hand-over version a source says it was written for, or undefined when it names none. */
export function interchangeVersion(source: string): number | undefined {
  const named = /^\s*%\s*feynjs-interchange\s+(\d+)\b/m.exec(source);
  return named ? Number(named[1]) : undefined;
}

/** One point of a diagram given as data. */
export interface DiagramVertex {
  /** its name: letters, digits, _ and ' */
  id: string;
  /** an outgoing or incoming leg's particle, by name (`e-`, `t~`, `gluino`), or its label as TeX when no particle has that name */
  particle?: string;
  /** a coupling written beside an inner point, as TeX */
  coupling?: string;
  /** how the point is drawn: `dot`, `blob`, `crossed dot`, `nucleus=Pb`, ... */
  shape?: string;
  /** where to hold it, as `at (x, y)` does */
  at?: [number, number];
  /** any other options, as written in its brackets */
  options?: string;
}

/** One line of a diagram given as data. */
export interface DiagramEdge {
  from: string;
  to: string;
  /** the particle the line is, by name: its style, arrow and label follow */
  particle?: string;
  /** a line style instead, or as well: `fermion`, `photon`, `gluon`, `scalar`, `LRJ 1b W(2j)`, ... */
  style?: string;
  /** the line's label, as TeX */
  label?: string;
  /** any other options, as written in its brackets */
  options?: string;
}

/**
 * A diagram as data: the shapes are those of the diagram feynjs writes into every SVG it draws
 * (`<metadata class="feynjs-model">`), so a program reads and writes the same thing.
 */
export interface DiagramInput {
  /** the incoming legs, top to bottom */
  incoming?: string[];
  /** the outgoing legs, top to bottom; leave it out to let feynjs order them, so that no lines cross */
  outgoing?: string[];
  vertices?: DiagramVertex[];
  edges: DiagramEdge[];
  /** switches for the whole diagram, as written on their own lines: `{ layout: "grid", "colour flow": "on" }` */
  switches?: Record<string, string>;
}

const NAME = /^[A-Za-z_][\w']*$/;

function nameOf(id: unknown, what: string): string {
  if (typeof id !== "string" || !NAME.test(id)) throw new FeynError(`${what} needs a name of letters, digits, _ and ', not ${JSON.stringify(id)}`);
  return id;
}

/** TeX in braces, so commas and brackets inside it stay part of it; its own braces must balance. */
function braced(tex: string, what: string): string {
  let depth = 0;
  for (const ch of tex) {
    if (ch === "{") depth++;
    if (ch === "}" && --depth < 0) break;
  }
  if (depth !== 0) throw new FeynError(`${what} has braces that do not pair: ${JSON.stringify(tex)}`);
  return `{${tex}}`;
}

/** A diagram given as data, written as feynjs source in the hand-over format. */
export function toSource(input: DiagramInput): string {
  if (!input || !Array.isArray(input.edges)) throw new FeynError("a diagram given as data needs edges: [{ from, to, ... }]");
  const out = [`% feynjs-interchange ${INTERCHANGE_VERSION}`];
  for (const [key, value] of Object.entries(input.switches ?? {})) {
    if (!/^[a-z][a-z ]*$/i.test(key) || /[\n:]/.test(String(value))) throw new FeynError(`a switch is a word and a value on one line, not ${JSON.stringify(key)}: ${JSON.stringify(value)}`);
    out.push(`${key}: ${value}`);
  }
  if (input.incoming?.length) out.push(`in: ${input.incoming.map((id) => nameOf(id, "an incoming leg")).join(" ")}`);
  if (input.outgoing?.length) out.push(`out: ${input.outgoing.map((id) => nameOf(id, "an outgoing leg")).join(" ")}`);
  for (const v of input.vertices ?? []) {
    const id = nameOf(v.id, "a vertex");
    const options = [
      v.particle !== undefined ? `particle=${braced(v.particle, `${id}'s particle`)}` : "",
      v.coupling !== undefined ? `label=${braced(v.coupling, `${id}'s coupling`)}` : "",
      v.shape ?? "",
      v.options ?? "",
    ].filter(Boolean);
    if (options.length) out.push(`${id} [${options.join(", ")}]`);
    if (v.at) {
      const [x, y] = v.at;
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new FeynError(`${id}'s place needs two numbers, at: [x, y]`);
      out.push(`${id} at (${x}, ${y})`);
    }
  }
  for (const e of input.edges) {
    const from = nameOf(e.from, "an edge's from"), to = nameOf(e.to, "an edge's to");
    const options = [e.style ?? "", e.particle ?? "", e.label !== undefined ? `label=${braced(e.label, `the line ${from}--${to}'s label`)}` : "", e.options ?? ""].filter(Boolean);
    if (options.some((o) => /[\[\]\n]/.test(o) && !o.startsWith("label="))) throw new FeynError(`the line ${from}--${to} has a bracket or a new line in its options`);
    out.push(options.length ? `${from} -- [${options.join(", ")}] ${to}` : `${from} -- ${to}`);
  }
  return out.join("\n") + "\n";
}

/** Source text as it is, or a diagram given as data written out as source. */
export const sourceOf = (input: string | DiagramInput): string => (typeof input === "string" ? input : toSource(input));
