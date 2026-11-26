// The tools: checks, measures, TikZ-Feynman code and the diagram as data. Programs use them, a
// page drawing diagrams does not (toTikz apart, which its download menu offers), so they are kept
// out of the browser file, feynjs.min.js: they are in npm's feynjs and in feynjs-full.min.js.
import { check as checkText } from "./tools/check.ts";
import { describe as describeText } from "./tools/describe.ts";
import { toTikz as tikzText } from "./tools/tikz.ts";
import { measure as measureText } from "./tools/quality.ts";
import { sourceOf } from "./tools/interchange.ts";
import type { DiagramInput } from "./tools/interchange.ts";
import type { TikzOptions } from "./tools/tikz.ts";
import type { ThemeOverrides } from "./theme.ts";

export { INTERCHANGE_VERSION, toSource } from "./tools/interchange.ts";
export type { DiagramInput, DiagramVertex, DiagramEdge } from "./tools/interchange.ts";
export type { Quality } from "./tools/quality.ts";
export type { Description } from "./tools/describe.ts";
export type { Finding } from "./tools/check.ts";
export type { TikzOptions } from "./tools/tikz.ts";

// (every tool takes the source as text, or the diagram as data: see toSource)
/** Structural checks: fermion flow, dangling lines, a hand-over version newer than this feynjs reads. */
export const check = (input: string | DiagramInput) => checkText(sourceOf(input));
/** The diagram as data: what comes in, what goes out, its vertices and loops. */
export const describe = (input: string | DiagramInput) => describeText(sourceOf(input));
/** How well the layout came out: crossings, crowding, angles. */
export const measure = (input: string | DiagramInput, theme: ThemeOverrides = {}) => measureText(sourceOf(input), theme);
/** TikZ-Feynman code for the diagram. */
export const toTikz = (input: string | DiagramInput, options: TikzOptions = {}) => tikzText(sourceOf(input), options);
