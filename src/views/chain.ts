import type { Pt } from "../geometry/curve.ts";
import type { ChainNucleus, DecayStep, Diagram } from "../model.ts";
import { lookupParticle } from "../particles/registry.ts";
import { nucleusRadius } from "../render/nucleus.ts";
import type { Theme } from "../theme.ts";
import { Scene } from "../render/scene.ts";
import type { RenderOptions } from "../render/render.ts";
import { along, arrowLine, lineAt, nucleusAt, sizesFor, textToward, unitAt, viewSvg } from "./reaction.ts";

/**
 * A decay chain, as textbooks draw one: each nucleus in turn, joined by arrows of one length, and
 * what each step gives off (the alpha as a small helium nucleus, the beta as its electron and
 * antineutrino) branching off its arrow, small and to one side. Each nucleus is named on the other
 * side, and each arrow with its mode (α, β⁻, β⁺, γ) where it can be told; `modes: off` leaves
 * those out.
 *
 *   chain: straight     left to right (the default)
 *   chain: curve        along a gentle arc, so a long chain fits
 */
export function drawDecayChain(d: Diagram, steps: DecayStep[], theme: Theme, idPrefix = "feyn", options: RenderOptions = {}): { svg: string; scene: Scene } {
  const look = sizesFor(theme), scene = new Scene(d, theme, idPrefix), unit = theme.vertex.nucleusUnit;
  const curved = /^(curve|curved|arc)$/i.test((d.directives.chain ?? "").trim());
  const modes = !/^(off|no|false)$/i.test((d.directives.modes ?? "").trim());
  const nuclei: ChainNucleus[] = [steps[0].parent, ...steps.map((s) => s.daughter)];
  const radius = nuclei.map((n) => nucleusRadius(n.A, unit));
  const length = look.length * 1.15;
  // (each step turns a little, so the whole bends through an arc of up to 140 degrees, even about the top)
  const turn = curved ? Math.min(24, 140 / steps.length) : 0;
  const heading = (k: number) => (turn * (steps.length - 1)) / 2 - turn * k;
  const centres: Pt[] = [{ x: 0, y: 0 }];
  steps.forEach((_, k) => centres.push(along(centres[k], unitAt(heading(k)), radius[k] + look.gap + length + look.gap + radius[k + 1])));
  const ids = nuclei.map((n, k) => nucleusAt(scene, centres[k], n.A, n.Z, radius[k], [n.name, n.label]));

  // each nucleus named on the left of the way the chain runs (above, when it runs straight)
  nuclei.forEach((n, k) => {
    const h = k === 0 ? heading(0) : k === steps.length ? heading(k - 1) : (heading(k - 1) + heading(k)) / 2;
    textToward(scene, n.label, look.size, along(centres[k], unitAt(h + 90), radius[k]), unitAt(h + 90), look.labelGap);
  });
  steps.forEach((step, k) => {
    const u = unitAt(heading(k)), left = unitAt(heading(k) + 90);
    const from = along(centres[k], u, radius[k] + look.gap), to = along(centres[k + 1], u, -(radius[k + 1] + look.gap));
    scene.edges.push(`<g class="feynjs-chain-arrow" data-line="plain">${arrowLine(from, to, "plain", look.stroke, theme)}</g>`);
    lineAt(scene, from, to, [ids[k], ids[k + 1]]);
    const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    // (its mode above it, where it can be told from what is given off)
    const mode = modeOf(step);
    if (modes && mode) textToward(scene, mode, look.size * 0.85, middle, left, look.labelGap * 0.8);
    // what it gives off, fanned forward and down from the arrow's middle, each on a short arrow
    const small = length * 0.42, n = step.given.length, spread = 40;
    step.given.forEach((given, j) => {
      const degrees = heading(k) - 75 + ((n - 1) / 2 - j) * spread * (n > 2 ? 0.8 : 1);
      const w = unitAt(degrees), start = along(middle, w, look.stroke), end = along(start, w, small);
      const line = given.particle ? lookupParticle(given.particle)?.style.line : "plain";
      const kind = line === "wave" || line === "coil" || line === "dash" ? line : "plain";
      scene.edges.push(`<g class="feynjs-chain-given" data-line="${kind}">${arrowLine(start, end, kind, look.stroke * 0.8, theme)}</g>`);
      const names = [...(given.particle ? [given.particle] : []), ...(given.nucleus ? [given.nucleus.name] : []), given.label];
      if (given.nucleus) {
        const r = nucleusRadius(given.nucleus.A, unit), at = along(end, w, look.gap * 0.6 + r);
        const id = nucleusAt(scene, at, given.nucleus.A, given.nucleus.Z, r, names);
        lineAt(scene, start, end, [ids[k], id]);
        textToward(scene, given.label, look.size * 0.8, along(at, w, r), w, look.labelGap * 0.7);
      } else {
        const id = scene.target(names, end, 3);
        lineAt(scene, start, end, [ids[k], id]);
        textToward(scene, given.label, look.size * 0.8, end, w, look.labelGap * 0.7);
      }
    });
  });
  const middle = centres.reduce((s, p) => ({ x: s.x + p.x / centres.length, y: s.y + p.y / centres.length }), { x: 0, y: 0 });
  return { svg: viewSvg(scene, d, "feynjs-chain", `a decay chain of ${steps.length} steps`, middle, false, options), scene };
}

/**
 * A step's mode, where what it gives off tells it: α (a helium-4 nucleus), β⁻ (an electron), β⁺
 * (a positron), γ (only photons, the nucleus the same); none for anything else.
 */
export function modeOf(step: DecayStep): string | undefined {
  const given = step.given;
  if (given.some((g) => g.nucleus && g.nucleus.A === 4 && g.nucleus.Z === 2)) return "\\alpha";
  if (given.some((g) => g.particle === "e-")) return "\\beta^-";
  if (given.some((g) => g.particle === "e+")) return "\\beta^+";
  if (given.length && given.every((g) => g.particle === "gamma" || g.particle === "a")) return "\\gamma";
  return undefined;
}
