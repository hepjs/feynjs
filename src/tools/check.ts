import { FeynError } from "../model.ts";
import { INTERCHANGE_VERSION, interchangeVersion } from "./interchange.ts";
import type { Edge } from "../model.ts";
import { splitPanels } from "../render/panels.ts";
import { closestName } from "../parse/parse.ts";
import { nucleonMismatch, nucleusNamed, onlyNucleus } from "../parse/chains.ts";
import { parseObject } from "../particles/objects.ts";
import { lookupParticle, particleNames } from "../particles/registry.ts";
import { isExternal, kindOfLine, linesByVertex, readDiagram } from "./prepare.ts";
import type { Diagram } from "../model.ts";
import { unknownCommands } from "../label/label.ts";
import { TIKZ_LAYOUTS } from "../parse/tikz-layouts.ts";

/**
 * Something that looks wrong in a diagram (or, as information, is read otherwise than written:
 * a TikZ-Feynman layout drawn by feynjs's own). `vertex` names where, when it is at a vertex.
 */
export interface Finding {
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  vertex?: string;
}

/**
 * What a SUSY label says a line is, whatever style it was drawn in: a gluino or neutralino is
 * a Majorana fermion (it counts as a fermion, but its arrows carry no flow), a squark or
 * slepton a scalar.
 */
function susyKind(e: Edge): "majorana" | "scalar" | undefined {
  // (letters set in another face count the same: \tilde{\mathsf{g}} is a gluino)
  const label = (e.label ?? "").replace(/\s+/g, "").replace(/\\math(sf|rm|it|bf|cal)\{([^{}]*)\}/g, "$2").replace(/\{([^{}\\]*)\}/g, "$1");
  if (/^\\(tilde|widetilde)\{?(g|N|\\chi\^?\{?0|\\chi_\{?[0-9d])/.test(label) || /^\\(tilde|widetilde)\{?\\chi\}?(\^\{?0|_)/.test(label)) return "majorana";
  if (/^\\(tilde|widetilde)\{?(q|t|b|u|d|c|s|\\ell|l|e|\\mu|\\tau|\\nu)/.test(label)) return "scalar";
  return undefined;
}
const isFermionLine = (e: Edge) => {
  // (a nucleus's path, plain with no arrow, is no fermion)
  if (e.style.cls === "ion") return false;
  const kind = susyKind(e);
  if (kind) return kind === "majorana";
  return e.style.line === "plain" || (e.style.cls === "susy" && e.style.line !== "dash");
};

/**
 * Fast structural checks on a diagram: one pass over the vertices, no search.
 *
 * It checks what can be read from the drawing alone: fermion lines must pair up at a
 * vertex and their arrows must flow through it, and nothing may be left dangling. It
 * does not know charges or which vertices a model allows.
 */
export function check(source: string): Finding[] {
  // (a hand-over file written for a newer feynjs than this one may use lines this one reads otherwise)
  const version = interchangeVersion(source);
  const newer: Finding[] = version !== undefined && version > INTERCHANGE_VERSION
    ? [{ severity: "warning", rule: "interchange-version", message: `written for hand-over format ${version}; this feynjs reads ${INTERCHANGE_VERSION}, so some lines may not be read as meant` }] : [];
  return [...newer, ...checkPanels(source)];
}

function checkPanels(source: string): Finding[] {
  // several panels: each is a diagram of its own
  const panels = splitPanels(source);
  if (panels.length > 1) {
    return panels.flatMap((panel) => checkOne(panel.source).map((f) => ({ ...f, message: `${panel.caption}: ${f.message}` })));
  }
  return checkOne(panels[0]?.source ?? source);
}

function checkOne(source: string): Finding[] {
  let d;
  try {
    d = readDiagram(source);
  } catch (error) {
    if (error instanceof FeynError) return [{ severity: "error", rule: "syntax", message: error.message }];
    throw error;
  }
  const findings: Finding[] = [...switchFindings(d), ...labelFindings(d)];
  const lines = linesByVertex(d);
  // with `arrows: none` the arrows are not drawn, so their directions mean nothing
  const noArrows = d.directives.arrows === "none" || d.directives.arrows === "off";

  for (const [id, here] of lines) {
    const v = d.vertices.get(id)!;
    if (here.length === 0) {
      findings.push({ severity: "warning", rule: "unconnected", vertex: id, message: `"${id}" is not joined to anything` });
      continue;
    }
    if (isExternal(d, id, lines)) {
      const invisible = here.every((e) => e.style.line === "none");
      // (a nucleus is drawn as itself: it needs no name)
      if (!v.label && !invisible && v.shape !== "nucleus" && !here.some((e) => e.label)) findings.push({ severity: "warning", rule: "unlabelled-leg", vertex: id, message: `external leg "${id}" has no particle label` });
      continue;
    }
    if (here.length === 2) continue; // a mark on a line
    // (a jet can be a quark or a gluon: where one leaves, fermion lines are not counted)
    const isEffective = v.shape === "blob" || v.shape === "hatched" || here.some((e) => e.style.line === "jet");

    // Fermion number: fermion lines end only in pairs.
    const fermions = here.filter(isFermionLine);
    if (fermions.length % 2 === 1 && !isEffective) {
      findings.push({
        severity: "error", rule: "fermion-number", vertex: id,
        message: `${fermions.length} fermion line${fermions.length === 1 ? "" : "s"} meet at "${id}": fermion lines must come in pairs (${here.map(kindOfLine).join(", ")})`,
      });
    }

    // Fermion flow: as many arrows arrive as leave.
    const arrowed = here.filter((e) => e.style.line === "plain" && (e.style.arrow === 1 || e.style.arrow === -1) && susyKind(e) !== "majorana");
    const arriving = arrowed.filter((e) => (e.to === id) === (e.style.arrow === 1)).length;
    const leaving = arrowed.length - arriving;
    // only when every fermion here carries an arrow: a gluino or a Majorana line has none
    const allFermionsArrowed = arrowed.length === fermions.length;
    if (allFermionsArrowed && arrowed.length > 0 && arriving !== leaving && !isEffective && !noArrows) {
      findings.push({
        severity: "error", rule: "fermion-flow", vertex: id,
        message: `fermion arrows do not flow through "${id}": ${arriving} arrive and ${leaving} leave`,
      });
    }
  }

  const incoming = [...d.vertices.values()].filter((v) => isExternal(d, v.id, lines) && v.role === "in");
  if (incoming.length === 0 && d.edges.length > 0) {
    findings.push({ severity: "warning", rule: "no-incoming", message: "the diagram has no incoming leg" });
  }

  // (a name a process does not know is drawn anyway, as a plain line labelled with the name: say so)
  for (const name of unknownProcessNames(source)) {
    // (a guess only for a name long enough to be a misspelling: any one letter is one away from e)
    const guess = name.length >= 3 ? closestName(name, particleNames()) : undefined;
    findings.push({ severity: "warning", rule: "unknown-particle", message: `"${name}" in the process is not a particle feynjs knows: it is drawn as a plain line labelled with its name${guess ? ` (did you mean "${guess}"?)` : ""}` });
  }
  // (a nucleus written with its nucleons that are not the element's: He(3p 2n) is lithium)
  for (const message of nucleonMismatches(source)) findings.push({ severity: "warning", rule: "nucleus-nucleons", message });
  return findings;
}

/** Every switch feynjs reads (`in:`, `out:`, `hadron:`, `label:` and `every ...:` are read as they are met). */
const SWITCHES = new Set(["horizontal", "horizontal'", "vertical", "vertical'", "note", "inline", "arrows", "dots", "scale",
  "size", "title", "layout", "grid", "grid forks", "view", "projection", "rotate", "reconstruct", "show intermediate",
  "show intermediates", "lattice", "wilson loop", "plaquette", "link", "polyakov loop", "site", "boundary", "axes",
  "background", "debug", "final plane", "colour flow", "nucleon edges", "charge colour", "colours", "colors", "reveal",
  "edge labels", "chain", "modes", "signal"]);
const LAYOUTS = new Set(["default", "v2", "manual", "grid"]);

/** Switches feynjs does not know, and so passes over (`node distance: 2`), and layouts it does not have. */
function switchFindings(d: Diagram): Finding[] {
  const findings: Finding[] = [];
  for (const key of Object.keys(d.directives)) {
    if (!SWITCHES.has(key)) findings.push({ severity: "warning", rule: "unknown-switch", message: `"${key}:" is not a feynjs switch, so it changes nothing` });
  }
  const layout = d.directives.layout?.trim().toLowerCase();
  if (layout && TIKZ_LAYOUTS.has(layout)) findings.push({ severity: "info", rule: "tikz-layout", message: `TikZ-Feynman's ${layout} is drawn by feynjs's own force layout` });
  else if (layout === "v1") findings.push({ severity: "warning", rule: "layout-v1", message: `the older rule engine (layout: v1) is gone: the diagram is drawn with the default layout` });
  else if (layout && !LAYOUTS.has(layout)) findings.push({ severity: "warning", rule: "unknown-layout", message: `there is no layout "${layout}": the default is used (feynjs has default, manual and grid)` });
  return findings;
}

/** Labels holding a command feynjs draws as its letters (`\frac{1}{2}` as "frac12"). */
function labelFindings(d: Diagram): Finding[] {
  const labels = [
    ...d.edges.flatMap((e) => [e.label, e.momentum]),
    ...[...d.vertices.values()].flatMap((v) => [v.label, v.coupling]),
    ...d.hadrons.map((h) => h.label),
  ].filter((t): t is string => !!t);
  const unknown = [...new Set(labels.flatMap(unknownCommands))];
  return unknown.length ? [{ severity: "warning", rule: "label-command", message: `labels draw ${unknown.join(", ")} as ${unknown.length === 1 ? "its" : "their"} letters: feynjs does not set ${unknown.length === 1 ? "that command" : "those commands"}` }] : [];
}

/**
 * The names a process (`p p > gluino gluino`, `gluino > q q neutralino1`) uses that are no
 * particle, detector object or loop feynjs knows, each once, in the order written.
 */
function unknownProcessNames(source: string): string[] {
  const unknown: string[] = [];
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/%.*$/, "").trim();
    // (only process lines: a ">" not part of "->" (spaces round it or not), no "--", and not a
    // setting such as `title: H > ZZ`)
    if (!/(^|[^-])>/.test(line) || /--/.test(line) || /^[\w -]+:/.test(line)) continue;
    // (a MadGraph loop order at the end, [noborn=QCD]; a production mode at the start, ggF or VBF(W))
    const text = line.replace(/\[[^\]]*\]\s*$/, "").replace(/^\s*(?:ggf|vbf|vbs)(?:\([^)]*\))?\s*>/i, ">");
    // (in a nuclear process, 2H 3H > 4He n, its nuclei are known too)
    const nuclear = namesInProcess(text).some(onlyNucleus);
    for (const name of namesInProcess(text)) {
      const inner = /^\{(.+)\}$/.exec(name)?.[1].trim() ?? name;
      if (lookupParticle(inner) || isObject(inner) || unknown.includes(inner) || (nuclear && nucleusNamed(inner))) continue;
      unknown.push(inner);
    }
  }
  return unknown;
}

/** What is wrong with each nucleus a process writes with its nucleons, `He(3p 2n)`, once each. */
function nucleonMismatches(source: string): string[] {
  const found = new Set<string>();
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/%.*$/, "").trim();
    if (!/(^|[^-])>/.test(line) || /--/.test(line) || /^[\w -]+:/.test(line)) continue;
    for (const name of namesInProcess(line)) { const wrong = nucleonMismatch(name); if (wrong) found.add(wrong); }
  }
  return [...found];
}

/** A detector object's name, `LRJ(2j)` or `SVJ` (and not one that cannot be read). */
function isObject(name: string): boolean {
  try { return !!parseObject(name); } catch { return false; }
}

/** The names in a process line: words between spaces and ">", a decay's `(> ...)` opened, other parentheses kept with their name (`X(ucd)`, `LRJ(2j)`). */
function namesInProcess(text: string): string[] {
  const names: string[] = [];
  let k = 0;
  while (k < text.length) {
    // (commas part MadGraph's decays: `p p > t t~, t > b w+`)
    if (/[\s>),]/.test(text[k])) { k++; continue; }
    if (text[k] === "(") { k++; continue; }
    const start = k;
    while (k < text.length && !/[\s()>,]/.test(text[k])) k++;
    let name = text.slice(start, k);
    // (parentheses straight after a name: a decay if they open with ">", else part of the name)
    if (text[k] === "(" && !/^\(\s*>/.test(text.slice(k))) {
      let depth = 0;
      const open = k;
      for (; k < text.length; k++) {
        if (text[k] === "(") depth++;
        if (text[k] === ")" && --depth === 0) { k++; break; }
      }
      name += text.slice(open, k);
    }
    if (name) names.push(name);
  }
  return names;
}
