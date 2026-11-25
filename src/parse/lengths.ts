import { FeynError } from "../model.ts";

/**
 * How long one line (a propagator) is on paper, in cm: the length feynjs writes TikZ-Feynman
 * code at, so a length in cm read in is the length it is written out at.
 */
export const CM_PER_LINE_LENGTH = 1.6;

/** TeX's units, in cm (a point is 1/72.27 inch, a big point 1/72). */
const CM_PER_UNIT: Record<string, number> = { cm: 1, mm: 0.1, in: 2.54, pt: 2.54 / 72.27, bp: 2.54 / 72 };

/** A length as written: its number, and its unit if it has one (`1.5cm`, `3mm`, `2pt`). */
function lengthWritten(text: string, line: number): { n: number; unit?: string } {
  const m = /^\s*(-?(?:\d+\.?\d*|\.\d+))\s*([a-z]*)\s*$/.exec(text);
  if (!m || (m[2] && !Object.prototype.hasOwnProperty.call(CM_PER_UNIT, m[2]))) throw new FeynError(`"${text.trim()}" is not a length: write a number, or one in cm, mm, pt or in, such as 1.5cm`, line);
  return { n: Number(m[1]), unit: m[2] || undefined };
}

/** A length in line lengths: a bare number is one already (`1.5`), one in cm or mm is converted. */
export function lengthInLines(text: string, line: number): number {
  const { n, unit } = lengthWritten(text, line);
  return unit ? (n * CM_PER_UNIT[unit]) / CM_PER_LINE_LENGTH : n;
}

/** A length in cm, a bare number being cm already, as TikZ reads one. */
export function lengthInCm(text: string, line: number): number {
  const { n, unit } = lengthWritten(text, line);
  return unit ? n * CM_PER_UNIT[unit] : n;
}
