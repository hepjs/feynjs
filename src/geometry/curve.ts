export interface Pt { x: number; y: number }

/** A curve sampled as a polyline with arc-length lookup. Screen coordinates (y down). */
export class Curve {
  pts: Pt[];
  cum: number[];
  length: number;
  straight: boolean;

  constructor(pts: Pt[], straight = false) {
    this.pts = pts;
    this.straight = straight;
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) {
      this.cum.push(this.cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    this.length = this.cum[this.cum.length - 1];
  }

  static line(a: Pt, b: Pt): Curve { return new Curve([a, b], true); }

  /**
   * Circular arc from a to b. `bend` is the departure angle in degrees away from the
   * chord (90 = semicircle); positive bends to the left of travel as seen on screen.
   */
  static arc(a: Pt, b: Pt, bend: number): Curve {
    const chord = Math.hypot(b.x - a.x, b.y - a.y);
    if (Math.abs(bend) < 1 || chord === 0) return Curve.line(a, b);
    const th = (Math.abs(bend) * Math.PI) / 180;
    const r = chord / (2 * Math.sin(th));
    const sign = bend > 0 ? 1 : -1;
    const ux = (b.x - a.x) / chord, uy = (b.y - a.y) / chord;
    // left of travel on screen (y down) is (uy, -ux)
    const lx = uy * sign, ly = -ux * sign;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const d = r * Math.cos(th);
    const cx = mx - lx * d, cy = my - ly * d;
    const a0 = Math.atan2(a.y - cy, a.x - cx);
    const n = Math.max(16, Math.ceil((2 * th * r) / 3));
    const pts: Pt[] = [];
    // sweep direction: towards the bulge side
    const probe = a0 + th;
    const dir = ((cx + r * Math.cos(probe) - mx) * lx + (cy + r * Math.sin(probe) - my) * ly) > 0 ? 1 : -1;
    for (let i = 0; i <= n; i++) {
      const ang = a0 + dir * 2 * th * (i / n);
      pts.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
    }
    pts[n] = { ...b };
    return new Curve(pts);
  }

  /** Full circle starting and ending at p, bulging in direction (dx, dy). */
  static loop(p: Pt, dx: number, dy: number, radius: number): Curve {
    const cx = p.x + dx * radius, cy = p.y + dy * radius;
    const a0 = Math.atan2(p.y - cy, p.x - cx);
    const pts: Pt[] = [];
    for (let i = 0; i <= 48; i++) {
      const ang = a0 + (2 * Math.PI * i) / 48;
      pts.push({ x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) });
    }
    return new Curve(pts);
  }

  /** Point and unit tangent at arc length s. */
  at(s: number): { x: number; y: number; tx: number; ty: number } {
    const { pts, cum } = this;
    s = Math.max(0, Math.min(this.length, s));
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const seg = cum[hi] - cum[lo] || 1;
    const f = (s - cum[lo]) / seg;
    const a = pts[lo], b = pts[hi];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, tx: (b.x - a.x) / seg, ty: (b.y - a.y) / seg };
  }

  /** Point at arc length s displaced by `off` along the normal (right of travel on screen). */
  offset(s: number, off: number): Pt {
    const p = this.at(s);
    return { x: p.x - p.ty * off, y: p.y + p.tx * off };
  }

  /** Sub-curve between arc lengths s0 and s1. */
  slice(s0: number, s1: number): Curve {
    if (this.straight) return Curve.line(this.at(s0), this.at(s1));
    const pts: Pt[] = [this.at(s0)];
    for (let i = 0; i < this.pts.length; i++) if (this.cum[i] > s0 && this.cum[i] < s1) pts.push(this.pts[i]);
    pts.push(this.at(s1));
    return new Curve(pts);
  }
}

export const fmt = (n: number) => (Math.round(n * 100) / 100).toString();
export function pathFrom(pts: Pt[], close = false): string {
  return pts.map((p, i) => `${i ? "L" : "M"}${fmt(p.x)} ${fmt(p.y)}`).join("") + (close ? "Z" : "");
}
