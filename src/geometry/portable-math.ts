/*! feynjs portable maths: functions ported from fdlibm.
 *   Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
 *   Developed at SunPro, a Sun Microsystems, Inc. business.
 *   Permission to use, copy, modify, and distribute this software is freely granted,
 *   provided that this notice is preserved.
 */
/**
 * Maths that gives the same bits on every machine.
 *
 * The engines' own Math.sin, Math.cos, Math.atan2, Math.exp, Math.log and Math.pow are only
 * "implementation-approximated": V8 on ARM64 rounds their last bit differently from V8 on x86
 * (its C maths is compiled with fused multiply-adds there), and Safari, Firefox and Bun each use
 * a maths library of their own. The force layout amplifies a last-bit difference into a visible
 * one, so one diagram laid out differently on a laptop and on a Linux build server.
 *
 * Everything here is written with + - * / and Math.sqrt only, which the language defines to be
 * exactly rounded with no fused operations, so it is identical in every engine, on every
 * processor. The functions are ports of fdlibm (Sun Microsystems, 1993, the library V8 itself
 * ports), keeping its order of operations, so on x86 they agree with V8 bit for bit:
 *
 *   Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
 *   Developed at SunPro, a Sun Microsystems, Inc. business.
 *   Permission to use, copy, modify, and distribute this software is freely granted,
 *   provided that this notice is preserved.
 *
 * Exact everywhere already, and so used as they are: Math.sqrt, abs, min, max, floor, ceil,
 * round, trunc, sign. test/portable-math.test.ts keeps src/ from calling the others directly.
 */

// ---------------------------------------------------------------------------------------------
// The bits of a double: fdlibm reads and writes the high and low 32-bit words.

// (one double seen as two 32-bit words; which word is high depends on the machine's byte order,
// found once, so this is right on big-endian machines too)
const doubleSlot = new Float64Array(1);
const signedWords = new Int32Array(doubleSlot.buffer), unsignedWords = new Uint32Array(doubleSlot.buffer);
const HIGH = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 1 : 0, LOW = 1 - HIGH;

function highWord(x: number): number {
  doubleSlot[0] = x;
  return signedWords[HIGH];
}

function lowWord(x: number): number {
  doubleSlot[0] = x;
  return unsignedWords[LOW];
}

function fromWords(high: number, low: number): number {
  signedWords[HIGH] = high;
  unsignedWords[LOW] = low >>> 0;
  return doubleSlot[0];
}

function withHighWord(x: number, high: number): number {
  return fromWords(high, lowWord(x));
}

function withLowWord(x: number, low: number): number {
  return fromWords(highWord(x), low);
}

// ---------------------------------------------------------------------------------------------
// sin, cos, tan

/** sin on [-pi/4, pi/4]; `tail` is the low part of the argument, used when `hasTail`. */
function kernelSin(x: number, tail: number, hasTail: boolean): number {
  const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
    S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
  if ((highWord(x) & 0x7fffffff) < 0x3e400000 && Math.trunc(x) === 0) return x; // |x| < 2^-27
  const z = x * x, v = z * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
  if (!hasTail) return x + v * (S1 + z * r);
  return x - ((z * (0.5 * tail - v * r) - tail) - v * S1);
}

/** cos on [-pi/4, pi/4]; `tail` is the low part of the argument. */
function kernelCos(x: number, tail: number): number {
  const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
    C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
  const ix = highWord(x) & 0x7fffffff;
  if (ix < 0x3e400000 && Math.trunc(x) === 0) return 1; // |x| < 2^-27
  const z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
  if (ix < 0x3fd33333) return 1 - (0.5 * z - (z * r - x * tail)); // |x| < 0.3
  const quarter = ix > 0x3fe90000 ? 0.28125 : fromWords(ix - 0x00200000, 0); // x/4, or 0.28125 beyond 0.78125
  return (1 - quarter) - ((0.5 * z - quarter) - (z * r - x * tail));
}

interface Reduced { quadrant: number; head: number; tail: number }

/**
 * x = quadrant * pi/2 + (head + tail), with |head + tail| <= pi/4: Cody and Waite's reduction
 * with pi/2 in three parts (fdlibm's medium range, exact for |x| up to about 2^19 * pi/2; layout
 * angles never come near that, and beyond it the result is still the same on every machine).
 */
function reduceByHalfPi(x: number): Reduced {
  const invpio2 = 6.36619772367581382433e-01, pio2_1 = 1.57079632673412561417e+00, pio2_1t = 6.07710050650619224932e-11,
    pio2_2 = 6.07710050630396597660e-11, pio2_2t = 2.02226624879595063154e-21, pio2_3 = 2.02226624871116645580e-21,
    pio2_3t = 8.47842766036889956997e-32;
  const hx = highWord(x), ix = hx & 0x7fffffff;
  if (ix < 0x4002d97c) return reduceNearHalfPi(x, hx, ix, pio2_1, pio2_1t, pio2_2, pio2_2t); // |x| < 3pi/4
  const t = Math.abs(x), n = Math.trunc(t * invpio2 + 0.5), fn = n;
  let r = t - fn * pio2_1, w = fn * pio2_1t, head = r - w;
  const exponent = ix >> 20;
  if (exponent - ((highWord(head) >> 20) & 0x7ff) > 16) { // cancellation: second part of pi/2
    let before = r;
    w = fn * pio2_2;
    r = before - w;
    w = fn * pio2_2t - ((before - r) - w);
    head = r - w;
    if (exponent - ((highWord(head) >> 20) & 0x7ff) > 49) { // and the third
      before = r;
      w = fn * pio2_3;
      r = before - w;
      w = fn * pio2_3t - ((before - r) - w);
      head = r - w;
    }
  }
  const tail = (r - head) - w;
  return hx < 0 ? { quadrant: -n, head: -head, tail: -tail } : { quadrant: n, head, tail };
}

/** fdlibm's special case for pi/4 < |x| < 3pi/4: one quarter turn off. */
function reduceNearHalfPi(x: number, hx: number, ix: number, pio2_1: number, pio2_1t: number, pio2_2: number, pio2_2t: number): Reduced {
  const sign = hx > 0 ? 1 : -1;
  let z = x - sign * pio2_1;
  if (ix !== 0x3ff921fb) {
    const head = z - sign * pio2_1t;
    return { quadrant: sign, head, tail: (z - head) - sign * pio2_1t };
  }
  z -= sign * pio2_2; // very near pi/2: a longer pi/2
  const head = z - sign * pio2_2t;
  return { quadrant: sign, head, tail: (z - head) - sign * pio2_2t };
}

export function sin(x: number): number {
  const ix = highWord(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) return kernelSin(x, 0, false); // |x| <= pi/4
  if (ix >= 0x7ff00000) return NaN;
  const { quadrant, head, tail } = reduceByHalfPi(x);
  switch (quadrant & 3) {
    case 0: return kernelSin(head, tail, true);
    case 1: return kernelCos(head, tail);
    case 2: return -kernelSin(head, tail, true);
    default: return -kernelCos(head, tail);
  }
}

export function cos(x: number): number {
  const ix = highWord(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) return kernelCos(x, 0); // |x| <= pi/4
  if (ix >= 0x7ff00000) return NaN;
  const { quadrant, head, tail } = reduceByHalfPi(x);
  switch (quadrant & 3) {
    case 0: return kernelCos(head, tail);
    case 1: return -kernelSin(head, tail, true);
    case 2: return -kernelCos(head, tail);
    default: return kernelSin(head, tail, true);
  }
}

export function tan(x: number): number {
  return sin(x) / cos(x);
}

// ---------------------------------------------------------------------------------------------
// atan, atan2, acos

const ATAN_HIGH = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const ATAN_LOW = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
const ATAN_SERIES = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
  9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
  4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];

export function atan(x: number): number {
  const hx = highWord(x), ix = hx & 0x7fffffff;
  if (ix >= 0x44100000) { // |x| >= 2^66
    if (x !== x) return NaN;
    return hx > 0 ? ATAN_HIGH[3] + ATAN_LOW[3] : -ATAN_HIGH[3] - ATAN_LOW[3];
  }
  let id = -1;
  if (ix < 0x3fdc0000) { // |x| < 0.4375
    if (ix < 0x3e200000) return x; // |x| < 2^-29
  } else {
    x = Math.abs(x);
    if (ix < 0x3ff30000) { // |x| < 1.1875
      if (ix < 0x3fe60000) { id = 0; x = (2 * x - 1) / (2 + x); } // 7/16 <= |x| < 11/16
      else { id = 1; x = (x - 1) / (x + 1); } // 11/16 <= |x| < 19/16
    } else if (ix < 0x40038000) { id = 2; x = (x - 1.5) / (1 + 1.5 * x); } // |x| < 2.4375
    else { id = 3; x = -1 / x; }
  }
  const a = ATAN_SERIES, z = x * x, w = z * z;
  const odd = z * (a[0] + w * (a[2] + w * (a[4] + w * (a[6] + w * (a[8] + w * a[10])))));
  const even = w * (a[1] + w * (a[3] + w * (a[5] + w * (a[7] + w * a[9]))));
  if (id < 0) return x - x * (odd + even);
  const result = ATAN_HIGH[id] - ((x * (odd + even) - ATAN_LOW[id]) - x);
  return hx < 0 ? -result : result;
}

/** The angle of (x, y) from the x axis, in (-pi, pi], as Math.atan2(y, x). */
export function atan2(y: number, x: number): number {
  const PI_OVER_4 = 7.8539816339744827900e-01, PI_OVER_2 = 1.5707963267948965580e+00, PI = 3.1415926535897931160e+00,
    PI_LOW = 1.2246467991473531772e-16;
  if (x !== x || y !== y) return NaN;
  if (x === 1) return atan(y);
  const hx = highWord(x), hy = highWord(y), ix = hx & 0x7fffffff, iy = hy & 0x7fffffff;
  const quadrant = ((hy >>> 31) & 1) | ((hx >>> 30) & 2); // 2 * sign(x) + sign(y)
  if (y === 0) return quadrant <= 1 ? y : quadrant === 2 ? PI : -PI;
  if (x === 0) return hy < 0 ? -PI_OVER_2 : PI_OVER_2;
  if (ix === 0x7ff00000 && lowWord(x) === 0) return atan2OfInfiniteX(quadrant, iy === 0x7ff00000 && lowWord(y) === 0, PI_OVER_4, PI);
  if (iy === 0x7ff00000 && lowWord(y) === 0) return hy < 0 ? -PI_OVER_2 : PI_OVER_2;
  const exponentGap = (iy - ix) >> 20;
  const z = exponentGap > 60 ? PI_OVER_2 + 0.5 * PI_LOW : hx < 0 && exponentGap < -60 ? 0 : atan(Math.abs(y / x));
  switch (quadrant) {
    case 0: return z;
    case 1: return -z;
    case 2: return PI - (z - PI_LOW);
    default: return (z - PI_LOW) - PI;
  }
}

function atan2OfInfiniteX(quadrant: number, yInfinite: boolean, PI_OVER_4: number, PI: number): number {
  if (yInfinite) return [PI_OVER_4, -PI_OVER_4, 3 * PI_OVER_4, -3 * PI_OVER_4][quadrant];
  return [0, -0, PI, -PI][quadrant];
}

export function acos(x: number): number {
  const pS0 = 1.66666666666666657415e-01, pS1 = -3.25565818622400915405e-01, pS2 = 2.01212532134862925881e-01,
    pS3 = -4.00555345006794114027e-02, pS4 = 7.91534994289814532176e-04, pS5 = 3.47933107596021167570e-05,
    qS1 = -2.40339491173441421878e+00, qS2 = 2.02094576023350569471e+00, qS3 = -6.88283971605453293030e-01,
    qS4 = 7.70381505559019352791e-02, PIO2_HIGH = 1.57079632679489655800e+00, PIO2_LOW = 6.12323399573676603587e-17,
    PI = 3.14159265358979311600e+00;
  const hx = highWord(x), ix = hx & 0x7fffffff;
  const ratio = (z: number) =>
    (z * (pS0 + z * (pS1 + z * (pS2 + z * (pS3 + z * (pS4 + z * pS5)))))) / (1 + z * (qS1 + z * (qS2 + z * (qS3 + z * qS4))));
  if (ix >= 0x3ff00000) { // |x| >= 1
    if (((ix - 0x3ff00000) | lowWord(x)) === 0) return hx > 0 ? 0 : PI + 2 * PIO2_LOW;
    return NaN;
  }
  if (ix < 0x3fe00000) { // |x| < 0.5
    if (ix <= 0x3c600000) return PIO2_HIGH + PIO2_LOW;
    return PIO2_HIGH - (x - (PIO2_LOW - x * ratio(x * x)));
  }
  if (hx < 0) { // x < -0.5
    const z = (1 + x) * 0.5, s = Math.sqrt(z), w = ratio(z) * s - PIO2_LOW;
    return PI - 2 * (s + w);
  }
  const z = (1 - x) * 0.5, s = Math.sqrt(z), head = withLowWord(s, 0), c = (z - head * head) / (s + head);
  return 2 * (head + (ratio(z) * s + c));
}

// ---------------------------------------------------------------------------------------------
// exp, log, and what is built from them

export function exp(x: number): number {
  const OVERFLOW = 7.09782712893383973096e+02, UNDERFLOW = -7.45133219101941108420e+02,
    LN2_HIGH = 6.93147180369123816490e-01, LN2_LOW = 1.90821492927058770002e-10, INV_LN2 = 1.44269504088896338700e+00,
    P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03, P3 = 6.61375632143793436117e-05,
    P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08, TWO_TO_MINUS_1000 = 9.33263618503218878990e-302;
  const hxSigned = highWord(x), negative = hxSigned < 0 ? 1 : 0, hx = hxSigned & 0x7fffffff;
  if (hx >= 0x40862e42) { // |x| >= 709.78...
    if (hx >= 0x7ff00000) return x !== x ? NaN : negative ? 0 : Infinity;
    if (x > OVERFLOW) return Infinity;
    if (x < UNDERFLOW) return 0;
  }
  let high = 0, low = 0, k = 0;
  if (hx > 0x3fd62e42) { // |x| > ln2 / 2
    if (hx < 0x3ff0a2b2) { // and < 1.5 ln2
      high = x - (negative ? -LN2_HIGH : LN2_HIGH); low = negative ? -LN2_LOW : LN2_LOW; k = 1 - negative - negative;
    } else {
      k = Math.trunc(INV_LN2 * x + (negative ? -0.5 : 0.5));
      high = x - k * LN2_HIGH; low = k * LN2_LOW;
    }
    x = high - low;
  } else if (hx < 0x3e300000) return 1 + x; // |x| < 2^-28
  const t = x * x, c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1 - ((x * c) / (c - 2) - x);
  const y = 1 - ((low - (x * c) / (2 - c)) - high);
  if (k >= -1021) return withHighWord(y, highWord(y) + (k << 20));
  return withHighWord(y, highWord(y) + ((k + 1000) << 20)) * TWO_TO_MINUS_1000;
}

export function log(x: number): number {
  const LN2_HIGH = 6.93147180369123816490e-01, LN2_LOW = 1.90821492927058770002e-10, TWO_54 = 1.80143985094819840000e+16,
    Lg1 = 6.666666666666735130e-01, Lg2 = 3.999999999940941908e-01, Lg3 = 2.857142874366239149e-01, Lg4 = 2.222219843214978396e-01,
    Lg5 = 1.818357216161805012e-01, Lg6 = 1.531383769920937332e-01, Lg7 = 1.479819860511658591e-01;
  let hx = highWord(x), k = 0;
  if (hx < 0x00100000) { // x < 2^-1022
    if (((hx & 0x7fffffff) | lowWord(x)) === 0) return -Infinity;
    if (hx < 0) return NaN;
    k -= 54; x *= TWO_54; hx = highWord(x);
  }
  if (hx >= 0x7ff00000) return x + x;
  k += (hx >> 20) - 1023;
  hx &= 0x000fffff;
  const i = (hx + 0x95f64) & 0x100000;
  x = withHighWord(x, hx | (i ^ 0x3ff00000)); // x or x/2, into [sqrt(2)/2, sqrt(2)]
  k += i >> 20;
  const f = x - 1, dk = k;
  if ((0x000fffff & (2 + hx)) < 3) { // -2^-20 <= f < 2^-20
    if (f === 0) return k === 0 ? 0 : dk * LN2_HIGH + dk * LN2_LOW;
    const R = f * f * (0.5 - 0.33333333333333333 * f);
    return k === 0 ? f - R : dk * LN2_HIGH - ((R - dk * LN2_LOW) - f);
  }
  const s = f / (2 + f), z = s * s, w = z * z;
  const t1 = w * (Lg2 + w * (Lg4 + w * Lg6)), t2 = z * (Lg1 + w * (Lg3 + w * (Lg5 + w * Lg7))), R = t2 + t1;
  if (((hx - 0x6147a) | (0x6b851 - hx)) > 0) {
    const halfSquare = 0.5 * f * f;
    return k === 0 ? f - (halfSquare - s * (halfSquare + R)) : dk * LN2_HIGH - ((halfSquare - (s * (halfSquare + R) + dk * LN2_LOW)) - f);
  }
  return k === 0 ? f - s * (f - R) : dk * LN2_HIGH - ((s * (f - R) - dk * LN2_LOW) - f);
}

/**
 * base ** exponent (as Math.pow), fdlibm's e_pow.c: log2 of the base in extra precision, times
 * the exponent split into high and low halves, then 2 to that power. Within one ulp.
 */
export function power(base: number, exponent: number): number {
  const special = powerOfSpecialValues(base, exponent);
  if (special !== undefined) return special;
  const hx = highWord(base), ix = hx & 0x7fffffff, whole = wholeExponentKind(base, exponent);
  if (hx < 0 && whole === 0) return NaN; // (negative) ** (not a whole number)
  const sign = hx < 0 && whole === 1 ? -1 : 1; // (negative) ** (odd)
  const hugeExponent = (highWord(exponent) & 0x7fffffff) > 0x41e00000; // |y| > 2^31
  const [high, low] = hugeExponent ? hugeExponentLog2(base, exponent, ix, sign) : log2InTwoParts(Math.abs(base), ix);
  if (high !== high) return low; // over- or underflowed already: `low` holds the answer
  return sign * twoToThe(exponent, high, low);
}

/** pow's cases of zero, one, two, a half, infinities and NaN, or undefined when none applies. */
function powerOfSpecialValues(x: number, y: number): number | undefined {
  const hx = highWord(x), lx = lowWord(x), hy = highWord(y), ly = lowWord(y), ix = hx & 0x7fffffff, iy = hy & 0x7fffffff;
  if ((iy | ly) === 0) return 1;
  if (ix > 0x7ff00000 || (ix === 0x7ff00000 && lx !== 0) || iy > 0x7ff00000 || (iy === 0x7ff00000 && ly !== 0)) return NaN;
  if (ly === 0) {
    if (iy === 0x7ff00000) { // y is +-Infinity
      if (((ix - 0x3ff00000) | lx) === 0) return NaN;
      if (ix >= 0x3ff00000) return hy >= 0 ? y : 0;
      return hy < 0 ? -y : 0;
    }
    if (iy === 0x3ff00000) return hy < 0 ? 1 / x : x; // y is +-1
    if (hy === 0x40000000) return x * x; // y is 2
    if (hy === 0x3fe00000 && hx >= 0) return Math.sqrt(x); // y is 0.5
  }
  if (lx === 0 && (ix === 0x7ff00000 || ix === 0 || ix === 0x3ff00000)) { // x is +-0, +-Infinity, +-1
    let z = Math.abs(x);
    if (hy < 0) z = 1 / z;
    if (hx < 0) {
      const whole = wholeExponentKind(x, y);
      if (((ix - 0x3ff00000) | whole) === 0) return NaN; // (-1) ** (not a whole number)
      if (whole === 1) z = -z;
    }
    return z;
  }
  return undefined;
}

/** For a negative base: 0 when the exponent is not a whole number, 1 when odd, 2 when even. */
function wholeExponentKind(x: number, y: number): number {
  if (highWord(x) >= 0) return 0;
  const hy = highWord(y), ly = lowWord(y), iy = hy & 0x7fffffff;
  if (iy >= 0x43400000) return 2; // |y| >= 2^53: even
  if (iy < 0x3ff00000) return 0; // |y| < 1
  const k = (iy >> 20) - 0x3ff;
  if (k > 20) {
    const j = ly >>> (52 - k);
    return ((j << (52 - k)) >>> 0) === ly ? 2 - (j & 1) : 0;
  }
  if (ly !== 0) return 0;
  const j = iy >> (20 - k);
  return (j << (20 - k)) === iy ? 2 - (j & 1) : 0;
}

/** |y| > 2^31: overflow or underflow unless x is within 2^-20 of one, then log2(x) from its series. */
function hugeExponentLog2(x: number, y: number, ix: number, sign: number): [number, number] {
  const IVLN2 = 1.44269504088896338700e+00, IVLN2_HIGH = 1.44269502162933349609e+00, IVLN2_LOW = 1.92596299112661746887e-08;
  const hy = highWord(y), iy = hy & 0x7fffffff, huge = 1.0e300, tiny = 1.0e-300;
  if (iy > 0x43f00000) { // |y| > 2^64
    if (ix <= 0x3fefffff) return [NaN, hy < 0 ? huge * huge : tiny * tiny];
    if (ix >= 0x3ff00000) return [NaN, hy > 0 ? huge * huge : tiny * tiny];
  }
  if (ix < 0x3fefffff) return [NaN, hy < 0 ? sign * huge * huge : sign * tiny * tiny];
  if (ix > 0x3ff00000) return [NaN, hy > 0 ? sign * huge * huge : sign * tiny * tiny];
  const t = Math.abs(x) - 1, w = (t * t) * (0.5 - t * (0.3333333333333333333333 - t * 0.25));
  const u = IVLN2_HIGH * t, v = t * IVLN2_LOW - w * IVLN2, high = withLowWord(u + v, 0);
  return [high, v - (high - u)];
}

/** log2(ax) as high + low, the high part with its low 32 bits clear. */
function log2InTwoParts(ax: number, ix: number): [number, number] {
  const BP = [1.0, 1.5], DP_HIGH = [0.0, 5.84962487220764160156e-01], DP_LOW = [0.0, 1.35003920212974897128e-08],
    TWO_53 = 9007199254740992.0, L1 = 5.99999999999994648725e-01, L2 = 4.28571428578550184252e-01, L3 = 3.33333329818377432918e-01,
    L4 = 2.72728123808534006489e-01, L5 = 2.30660745775561754067e-01, L6 = 2.06975017800338417784e-01,
    CP = 9.61796693925975554329e-01, CP_HIGH = 9.61796700954437255859e-01, CP_LOW = -7.02846165095275826516e-09;
  let n = 0;
  if (ix < 0x00100000) { ax *= TWO_53; n -= 53; ix = highWord(ax); } // subnormal
  n += (ix >> 20) - 0x3ff;
  const j = ix & 0x000fffff;
  let k: number;
  ix = j | 0x3ff00000;
  if (j <= 0x3988e) k = 0; // |x| < sqrt(3/2)
  else if (j < 0xbb67a) k = 1; // |x| < sqrt(3)
  else { k = 0; n += 1; ix -= 0x00100000; }
  ax = withHighWord(ax, ix);
  // ss = s_h + s_l = (x - 1) / (x + 1) or (x - 1.5) / (x + 1.5)
  const u = ax - BP[k], v = 1 / (ax + BP[k]), ss = u * v, sHigh = withLowWord(ss, 0);
  const tHigh = fromWords(((ix >> 1) | 0x20000000) + 0x00080000 + (k << 18), 0), tLow = ax - (tHigh - BP[k]);
  const sLow = v * ((u - sHigh * tHigh) - sHigh * tLow);
  let s2 = ss * ss;
  let r = s2 * s2 * (L1 + s2 * (L2 + s2 * (L3 + s2 * (L4 + s2 * (L5 + s2 * L6)))));
  r += sLow * (sHigh + ss);
  s2 = sHigh * sHigh;
  const t3High = withLowWord(3.0 + s2 + r, 0), t3Low = r - ((t3High - 3.0) - s2);
  const uu = sHigh * t3High, vv = sLow * t3High + t3Low * ss;
  const pHigh = withLowWord(uu + vv, 0), pLow = vv - (pHigh - uu);
  const zHigh = CP_HIGH * pHigh, zLow = CP_LOW * pHigh + pLow * CP + DP_LOW[k];
  const t = n, high = withLowWord(((zHigh + zLow) + DP_HIGH[k]) + t, 0);
  return [high, zLow - (((high - t) - DP_HIGH[k]) - zHigh)];
}

/** 2 ** (y * (t1 + t2)), with y split in halves so the product keeps its precision. */
function twoToThe(y: number, t1: number, t2: number): number {
  const LG2 = 6.93147180559945286227e-01, LG2_HIGH = 6.93147182464599609375e-01, LG2_LOW = -1.90465429995776804525e-09,
    OVT = 8.0085662595372944372e-17, P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03,
    P3 = 6.61375632143793436117e-05, P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08,
    huge = 1.0e300, tiny = 1.0e-300;
  const y1 = withLowWord(y, 0);
  const pLow = (y - y1) * t1 + y * t2;
  let pHigh = y1 * t1;
  let z = pLow + pHigh;
  let j = highWord(z);
  const i = lowWord(z);
  if (j >= 0x40900000) { // z >= 1024
    if (((j - 0x40900000) | i) !== 0 || pLow + OVT > z - pHigh) return huge * huge;
  } else if ((j & 0x7fffffff) >= 0x4090cc00) { // z <= -1075
    if (((j - 0xc090cc00) | i) !== 0 || pLow <= z - pHigh) return tiny * tiny;
  }
  const magnitudeHigh = j & 0x7fffffff;
  let k = (magnitudeHigh >> 20) - 0x3ff, n = 0;
  if (magnitudeHigh > 0x3fe00000) { // |z| > 0.5: n = [z + 0.5]
    n = j + (0x00100000 >> (k + 1));
    k = ((n & 0x7fffffff) >> 20) - 0x3ff;
    const t = fromWords(n & ~(0x000fffff >> k), 0);
    n = ((n & 0x000fffff) | 0x00100000) >> (20 - k);
    if (j < 0) n = -n;
    pHigh -= t;
  }
  const t = withLowWord(pLow + pHigh, 0);
  const u = t * LG2_HIGH, v = (pLow - (t - pHigh)) * LG2 + t * LG2_LOW;
  z = u + v;
  const w = v - (z - u), tt = z * z, t1b = z - tt * (P1 + tt * (P2 + tt * (P3 + tt * (P4 + tt * P5))));
  const r = (z * t1b) / (t1b - 2) - (w + z * w);
  z = 1 - (r - z);
  j = highWord(z) + (n << 20);
  if ((j >> 20) <= 0) return scaleByPowerOfTwo(z, n); // subnormal result
  return withHighWord(z, j);
}

/** x * 2^n, exactly, in steps that never overflow the factor. */
function scaleByPowerOfTwo(x: number, n: number): number {
  while (n < -1000) { x *= fromWords(0x3ff00000 - (1000 << 20), 0); n += 1000; }
  while (n > 1000) { x *= fromWords(0x3ff00000 + (1000 << 20), 0); n -= 1000; }
  return x * fromWords(0x3ff00000 + (n << 20), 0);
}

export function square(x: number): number {
  return x * x;
}

export function cbrt(x: number): number {
  if (x === 0 || x !== x || !Number.isFinite(x)) return x;
  const magnitude = Math.abs(x), guess = exp(log(magnitude) / 3);
  const refined = guess - (guess * guess * guess - magnitude) / (3 * guess * guess); // one Newton step
  return x < 0 ? -refined : refined;
}

export function cosh(x: number): number {
  const e = exp(Math.abs(x));
  return 0.5 * (e + 1 / e);
}

export function tanh(x: number): number {
  const magnitude = Math.abs(x);
  if (magnitude > 22) return x > 0 ? 1 : -1;
  if (magnitude < 1e-8) return x;
  const e = exp(2 * magnitude), result = (e - 1) / (e + 1);
  return x < 0 ? -result : result;
}

/**
 * The length of the vector (as Math.hypot), V8's way: scaled by the largest part and summed
 * with Kahan's compensation, so it keeps the values V8 has always given, now in every engine.
 */
export function hypot(a: number, b: number, c?: number): number {
  return c === undefined ? hypotOfTwo(a, b) : hypotOfMany([a, b, c]);
}

/**
 * The two-part case, the one the layout calls in its inner loops: the square root of the sum
 * of the two squares, each step exactly rounded, so the same everywhere. (Scaling by the larger
 * part first, as for more parts, only guards against squares beyond 1e308, which no drawing
 * measured in line lengths comes near.)
 */
function hypotOfTwo(a: number, b: number): number {
  if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) return Infinity;
  if (a !== a || b !== b) return NaN;
  return Math.sqrt(a * a + b * b);
}

/**
 * The length of (a, b) found as the engines find Math.hypot: scaled by the larger part first,
 * then the square root of the sum of the two squares (the same bits as V8's own). The layout's
 * written-out gradients and its fault check use it: the layouts were settled and approved with
 * it there, and the shorter form above would move the few that sit on a knife edge.
 */
export function scaledHypot(a: number, b: number): number {
  const sizeA = Math.abs(a), sizeB = Math.abs(b);
  if (sizeA === Infinity || sizeB === Infinity) return Infinity;
  if (sizeA !== sizeA || sizeB !== sizeB) return NaN;
  const largest = sizeA > sizeB ? sizeA : sizeB;
  if (largest === 0) return 0;
  const scaledA = sizeA / largest, scaledB = sizeB / largest;
  return Math.sqrt(scaledA * scaledA + scaledB * scaledB) * largest;
}

function hypotOfMany(parts: number[]): number {
  let largest = 0;
  for (const part of parts) {
    const size = Math.abs(part);
    if (size === Infinity) return Infinity;
    if (size !== size) return NaN;
    if (size > largest) largest = size;
  }
  if (largest === 0) return 0;
  let sum = 0, compensation = 0;
  for (const part of parts) {
    const scaled = Math.abs(part) / largest, summand = scaled * scaled - compensation, preliminary = sum + summand;
    compensation = (preliminary - sum) - summand;
    sum = preliminary;
  }
  return Math.sqrt(sum) * largest;
}
