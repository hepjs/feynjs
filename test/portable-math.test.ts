import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as portable from "../src/geometry/portable-math.ts";

// Layouts must be the same on every machine (Apple Silicon, x86, Windows, Linux; Chrome, Firefox,
// Safari, Node, Bun, Deno). The engines' own transcendental maths is not: see portable-math.ts.

const MODULE = join("src", "geometry", "portable-math.ts");
const ENGINE_MATHS = /\bMath\.(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|exp|expm1|log|log1p|log2|log10|pow|cbrt|hypot)\s*\(/;
const EXPONENT_OPERATOR = /[\w)\]]\s*\*\*\s*[\w(.-]/;

test("src/ uses the portable maths, never the engine's own", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles("src")) {
    if (file === MODULE) continue;
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "");
      if (ENGINE_MATHS.test(code) || EXPONENT_OPERATOR.test(code)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, [], "use portable.sin/cos/atan2/power/... from src/geometry/portable-math.ts");
});

test("src/ never depends on the reader's language (locale), which differs between machines and engines", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles("src")) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (/\blocaleCompare\b|\bIntl\.|\btoLocale\w*\(/.test(line.replace(/\/\/.*$/, ""))) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, [], "compare strings by their characters, not with localeCompare or Intl");
});

test("the portable maths gives the same bits as on every other machine", () => {
  // The hash of every function over a fixed set of inputs. CI checks it on each operating system
  // and processor; if it differs anywhere, layouts would differ there too.
  assert.equal(hashOfAllResults(), GOLDEN);
});

test("the portable maths is accurate", () => {
  const worstAllowed: Record<string, [(x: number, y: number) => number, (x: number, y: number) => number, number]> = {
    sin: [portable.sin, Math.sin, 1], cos: [portable.cos, Math.cos, 1], tan: [portable.tan, Math.tan, 4],
    atan2: [(x, y) => portable.atan2(y, x), (x, y) => Math.atan2(y, x), 1], acos: [(x) => portable.acos(x / 1000), (x) => Math.acos(x / 1000), 1],
    exp: [(x) => portable.exp(x / 3), (x) => Math.exp(x / 3), 1], log: [(x) => portable.log(Math.abs(x)), (x) => Math.log(Math.abs(x)), 1],
    power: [(x, y) => portable.power(Math.abs(x), y), (x, y) => Math.pow(Math.abs(x), y), 1],
    // (hypot is the plain square root of the sum of squares, within 2 ulp of the engine's scaled
    // one; scaledHypot is the engine's, bit for bit)
    hypot: [portable.hypot, Math.hypot, 2], scaledHypot: [portable.scaledHypot, Math.hypot, 0],
    cbrt: [portable.cbrt, Math.cbrt, 2], cosh: [(x) => portable.cosh(x / 3), (x) => Math.cosh(x / 3), 2],
  };
  const [xs, ys] = sampleInputs(20000);
  for (const [name, [mine, engine, allowed]] of Object.entries(worstAllowed)) {
    let worst = 0;
    for (let i = 0; i < xs.length; i++) worst = Math.max(worst, ulpsApart(mine(xs[i], ys[i]), engine(xs[i], ys[i])));
    assert.ok(worst <= allowed, `${name}: ${worst} ulp from the engine's own (at most ${allowed} allowed)`);
  }
});

const GOLDEN = "8e6eb142159b160b";

function hashOfAllResults(): string {
  const [xs, ys] = sampleInputs(20000);
  const functions = [portable.sin, portable.cos, portable.tan, (x: number, y: number) => portable.atan2(y, x), (x: number) => portable.acos(x / 1000),
    (x: number) => portable.exp(x / 3), (x: number) => portable.log(Math.abs(x)), (x: number, y: number) => portable.power(Math.abs(x), y),
    portable.cbrt, (x: number) => portable.cosh(x / 3), portable.tanh, portable.hypot, portable.scaledHypot];
  const results = new Float64Array(xs.length * functions.length);
  functions.forEach((f, j) => xs.forEach((x, i) => { results[j * xs.length + i] = f(x, ys[i]); }));
  return createHash("sha256").update(new Uint8Array(results.buffer)).digest("hex").slice(0, 16);
}

/** A fixed spread of inputs: small angles, wide angles, and large arguments. */
function sampleInputs(n: number): [number[], number[]] {
  let seed = 7;
  const next = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const kind = next();
    xs.push(kind < 0.5 ? (next() - 0.5) * 20 : kind < 0.8 ? (next() - 0.5) * 2 : (next() - 0.5) * 2000);
    ys.push((next() - 0.5) * (kind < 0.5 ? 20 : 3));
  }
  return [xs, ys];
}

function ulpsApart(a: number, b: number): number {
  if (a === b || (a !== a && b !== b)) return 0;
  const view = new DataView(new ArrayBuffer(16));
  view.setFloat64(0, a);
  view.setFloat64(8, b);
  const gap = view.getBigInt64(0) - view.getBigInt64(8);
  return Number(gap < 0n ? -gap : gap);
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}
