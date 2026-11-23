import type { Diagram, Edge } from "../model.ts";

/** A quark named by a TeX label, `\bar{b}`, `\bar c`, `c` or `q'`: its particle name, or nothing. */
export function quarkFromLabel(label: string | undefined): string | undefined {
  if (!label) return undefined;
  const m = /^\s*(?:\\(?:bar|overline)\s*\{?\s*([udscbtq])\s*\}?|([udscbtq]))\s*'?\s*$/.exec(label);
  if (!m) return undefined;
  return m[1] ? `${m[1]}bar` : m[2];
}

/**
 * The particle a line is: named on the line itself, or on the external leg it leads to, by a
 * particle key or by a quark's TeX label.
 */
export function particleOfEdge(d: Diagram, e: Edge): string | undefined {
  if (e.particle) return e.particle;
  for (const id of [e.from, e.to]) {
    const v = d.vertices.get(id)!;
    if (!v.role) continue;
    if (v.particle) return v.particle;
    const quark = quarkFromLabel(v.label);
    if (quark) return quark;
  }
  return undefined;
}
