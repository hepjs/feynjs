// The playground: write feynjs source below, see the diagram above as you type, or build one
// with the pointer.
//
// Built on the names feynjs gives every part of a drawing: each line's group carries
// data-edge="a--b" (with data-from, data-to, data-particle), each drawn point data-vertex="b",
// and the SVG holds the whole diagram as data in <metadata class="feynjs-model">. So the page can
// say what is under the pointer, show which line of the source made it, and change the source
// by name: moving a point writes `b at (x, y)`, drawing a line writes `a -- [gluon] b`. The same
// names are what a program, or a language model, reads to refer to a part of the diagram.
(function () {
  "use strict";

  const EXAMPLES = {
    "e⁺e⁻ → μ⁺μ⁻": "i1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]",
    "Compton scattering": "in: i1 i2\nout: f1 f2\ni1 [e-] -- a\ni2 [gamma] -- a\na -- [fermion] b\nb -- f1 [e-]\nb -- f2 [gamma]",
    "Higgs by gluon fusion": "g g > {t} > H\nH > Z Z\nZ > e+ e-\nZ > mu+ mu-",
    "Top pair, decayed": "p p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
    "Colour flow": "colour flow: on\nd dbar > g > t tbar\nt > b W+\ntbar > bbar W-",
    "Gluino pair (SUSY)": "p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1",
    "One gluino decayed": "p p > gluino(> q q neutralino1) gluino",
    "B⁰ → K*⁰ μ⁺μ⁻ penguin": "in: d1 b\nout: d2 s mu1 mu2\nd1 [d] -- [fermion] d2 [d]\ns [\\bar{s}] -- [fermion] l2 -- [fermion] l1 -- [fermion] b [\\bar{b}]\nl1 -- [boson, label=W^-] x -- [boson] l2\nx -- [photon, label={\\gamma, Z^0}] v\nv -- [fermion] mu1 [\\mu^-]\nmu2 [\\mu^+] -- [fermion] v\nhadron: B^0 = d1 b\nhadron: K^{*0} = d2 s",
    "Boosted top, as the detector sees it": "p p > t tbar\nt > bjet W+(> LRJ)\ntbar > bbar W-(> e- nu~)",
    "Kinematic view": "view: kinematic\np p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
    "Grid, isometric": "layout: grid\ngrid: iso\np p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
  };
  // (the lines the palette offers, each drawn by feynjs itself in its chip)
  const PALETTE = ["fermion", "anti fermion", "photon", "gluon", "scalar", "ghost", "W+", "Z", "H", "g", "gluino", "neutralino1"];
  const STYLINGS = [
    { name: "plain", lines: {} },
    { name: "colour flow", lines: { "colour flow": "on" } },
    { name: "charge colour", lines: { "charge colour": "on" } },
    { name: "black and white", lines: { colours: "bw" } },
  ];
  const STYLING_KEYS = ["colour flow", "charge colour", "colours"];

  // ---- the source: its switch lines, read and written ----------------------------------------
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const switchLine = (key) => new RegExp(`^[ \\t]*${key.replace(/ /g, "[ \\t]+")}[ \\t]*:[ \\t]*(.*)\\n?`, "im");
  const readSwitch = (src, key) => (switchLine(key).exec(src)?.[1] ?? "").trim().toLowerCase();
  function writeSwitch(src, key, value) {
    if (switchLine(key).test(src)) return value ? src.replace(switchLine(key), `${key}: ${value}\n`) : src.replace(switchLine(key), "");
    return value ? `${key}: ${value}\n${src}` : src;
  }
  const pinLine = (id) => new RegExp(`^[ \\t]*${esc(id)}[ \\t]+at[ \\t]*\\([^)]*\\)[ \\t]*\\n?`, "m");
  function writePin(src, id, x, y) {
    const pin = `${id} at (${x}, ${y})`;
    return pinLine(id).test(src) ? src.replace(pinLine(id), pin + "\n") : `${src.replace(/\s*$/, "")}\n${pin}`.replace(/^\n/, "");
  }
  // a line written on its own, `a -- [style] b` or `a -- b`: the only kind the pointer rewrites
  const simpleEdge = (from, to) => new RegExp(`^[ \\t]*${esc(from)}[ \\t]*--[ \\t]*(\\[[^\\]]*\\][ \\t]*)?${esc(to)}[ \\t]*$`, "m");
  // the source lines that name a point or a line, to show which wrote a part of the drawing
  function sourceLinesFor(src, ids) {
    const words = ids.map((id) => new RegExp(`(^|[^\\w'])${esc(id)}(?![\\w'])`));
    return src.split("\n").map((text, n) => ({ text, n })).filter(({ text }) => words.every((w) => w.test(text))).map(({ n }) => n);
  }

  // ---- sharing: the source in the address -----------------------------------------------------
  const toHash = (src) => "#src=" + btoa(String.fromCharCode(...new TextEncoder().encode(src))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function fromHash() {
    const m = /#src=([\w-]+)/.exec(location.hash);
    if (!m) return undefined;
    try {
      const b = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
      return new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0)));
    } catch (e) { return undefined; }
  }

  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (name, attrs) => { const el = document.createElementNS(NS, name); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

  function build(root) {
    root.innerHTML = `
      <div class="pg-pane">
        <div class="pg-top" role="toolbar" aria-label="Playground controls">
          <span class="pg-seg" data-group="tool">
            <button type="button" data-tool="move" class="pg-active" title="Drag points to move them">Move</button>
            <button type="button" data-tool="draw" title="Click empty space for a point; drag from a point to draw a line">Draw</button>
            <button type="button" data-tool="erase" title="Click a point or a line to remove it">Erase</button>
          </span>
          <span class="pg-sep"></span>
          <select class="pg-example" aria-label="Example"><option value="">Examples…</option>${Object.keys(EXAMPLES).map((k) => `<option>${k}</option>`).join("")}</select>
          <button type="button" data-do="surprise" title="A random example">Surprise me</button>
          <span class="pg-sep"></span>
          <label title="Layout engine">Engine <select data-switch="layout"><option value="">default</option><option value="grid">grid</option><option value="manual">manual</option><option value="v1">v1</option></select></label>
          <span class="pg-seg pg-gridkind" hidden><button type="button" data-grid="">Square</button><button type="button" data-grid="iso">Iso</button></span>
          <label>Styling <select class="pg-styling">${STYLINGS.map((s, i) => `<option value="${i}">${s.name}</option>`).join("")}</select></label>
          <label>Size <select data-switch="size"><option value="">normal</option><option value="small">small</option><option value="large">large</option></select></label>
          <span class="pg-actions">
            <button type="button" data-do="undo" title="Undo (⌘Z outside the editor)">Undo</button><button type="button" data-do="redo" title="Redo (⇧⌘Z)">Redo</button>
            <span class="pg-sep"></span>
            <button type="button" data-do="share" title="Copy a link that holds the source">Share</button><button type="button" data-do="svg">SVG</button><button type="button" data-do="png">PNG</button><button type="button" data-do="tikz">TikZ</button>
          </span>
        </div>
        <div class="pg-body">
          <div class="pg-stage"><div class="pg-drawing" aria-live="polite"></div><div class="pg-hover"></div><div class="pg-hint"></div></div>
          <div class="pg-palette" aria-label="Line to draw with">${PALETTE.map((p, i) => `<button type="button" class="pg-chip${i === 0 ? " pg-active" : ""}" draggable="true" data-style="${p}" title="${p}: click to draw with it, or drop it on a line"><span class="pg-chip-line"></span><span class="pg-chip-name">${p}</span></button>`).join("")}</div>
        </div>
      </div>
      <textarea class="pg-source" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="feynjs source"></textarea>
      <div class="pg-status"></div>
      <details class="pg-model"><summary>What a program (or an AI) sees: the diagram as data</summary><pre><code></code></pre></details>
      <details class="pg-tikz" hidden><summary>TikZ-Feynman code</summary><pre><code></code></pre></details>`;
    const $ = (sel) => root.querySelector(sel);
    const drawing = $(".pg-drawing"), hover = $(".pg-hover"), hint = $(".pg-hint");
    const source = $(".pg-source"), status = $(".pg-status");
    const modelOut = $(".pg-model code"), tikz = $(".pg-tikz");
    let model = null, timer = 0, tool = "move", brush = PALETTE[0];
    const UNIT = { x: 52, y: 34 };

    // ---- the chips: each line drawn by feynjs ------------------------------------------------
    root.querySelectorAll(".pg-chip").forEach((chip) => {
      try { chip.querySelector(".pg-chip-line").innerHTML = feynjs.render(`a -- [${chip.dataset.style}, no label] b`, { idPrefix: `chip${chip.dataset.style.replace(/\W/g, "")}` }); }
      catch (e) { /* (a name this version does not know: the chip keeps its word only) */ }
    });

    // ---- history: every change the page makes can be undone ---------------------------------
    const past = [], future = [];
    function change(next, note) {
      if (next === source.value) return;
      past.push(source.value); future.length = 0;
      source.value = next; draw();
      if (note) say(note);
    }
    function undo() { if (!past.length) return; future.push(source.value); source.value = past.pop(); draw(); }
    function redo() { if (!future.length) return; past.push(source.value); source.value = future.pop(); draw(); }
    let typedFrom = null;
    source.addEventListener("focus", () => { typedFrom = source.value; });
    source.addEventListener("blur", () => { if (typedFrom !== null && typedFrom !== source.value) { past.push(typedFrom); future.length = 0; } typedFrom = null; });

    const say = (text, error) => { status.textContent = text; status.className = error ? "pg-status pg-error" : "pg-status"; };

    function draw() {
      const src = source.value;
      root.querySelector('[data-switch="layout"]').value = readSwitch(src, "layout");
      root.querySelector('[data-switch="size"]').value = readSwitch(src, "size");
      const styling = STYLINGS.findIndex((s, i) => i > 0 && Object.entries(s.lines).every(([k, v]) => readSwitch(src, k) === v));
      $(".pg-styling").value = String(Math.max(0, styling));
      const grid = readSwitch(src, "layout") === "grid";
      $(".pg-gridkind").hidden = !grid;
      root.querySelectorAll("[data-grid]").forEach((b) => b.classList.toggle("pg-active", (readSwitch(src, "grid").startsWith("iso") ? "iso" : "") === b.dataset.grid));
      if (!src.trim()) {
        // (an empty board to build on: the drawing's own units, a little room each way)
        drawing.innerHTML = `<svg xmlns="${NS}" class="feynjs pg-board" viewBox="-60 -90 320 180" width="320" height="180"></svg>`;
        model = { unit: UNIT, vertices: [], edges: [] };
        modelOut.textContent = JSON.stringify(model, null, 1);
        say(tool === "draw" ? "" : "An empty board: choose Draw to build a diagram, or pick an example.");
        decorate();
      } else {
        try {
          drawing.innerHTML = feynjs.render(src, { idPrefix: "pg" });
          fit();
          say("");
          const meta = drawing.querySelector("metadata.feynjs-model");
          model = meta ? JSON.parse(meta.textContent) : null;
          modelOut.textContent = model ? JSON.stringify(model, null, 1) : "(this version of feynjs does not write the diagram as data yet)";
          decorate();
        } catch (e) { say(String(e.message || e), true); }
      }
      history.replaceState(null, "", toHash(src));
      showHint();
    }
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 120); };
    // (the drawing as large as the pane allows, up to a little over twice its own size; its own
    // size kept, so a resize only rescales it)
    function fit() {
      const svg = drawing.querySelector("svg"), stage = drawing.parentElement;
      if (!svg || svg.classList.contains("pg-board")) return;
      if (!svg.dataset.w) { svg.dataset.w = svg.getAttribute("width"); svg.dataset.h = svg.getAttribute("height"); }
      const w = parseFloat(svg.dataset.w), h = parseFloat(svg.dataset.h);
      if (!w || !h) return;
      const k = Math.min((stage.clientWidth - 40) / w, (stage.clientHeight - 56) / h, 2.2);
      if (k > 0) { svg.setAttribute("width", (w * k).toFixed(1)); svg.setAttribute("height", (h * k).toFixed(1)); }
    }
    let lastStage = 0;
    new ResizeObserver(() => { const size = drawing.parentElement.clientWidth * 10000 + drawing.parentElement.clientHeight; if (size !== lastStage) { lastStage = size; fit(); } }).observe(drawing.parentElement);
    function showHint() {
      hint.textContent = tool === "draw" ? `Drawing ${brush}: click empty space for a point · drag from a point to another, or out into space`
        : tool === "erase" ? "Click a point or a line to remove it" : "Drag a point to move it · click a part to find its source line";
    }

    // ---- the drawing's parts: handles on every point -----------------------------------------
    function decorate() {
      const svg = drawing.querySelector("svg");
      if (!svg || !model) return;
      svg.classList.add(`pg-tool-${tool}`);
      // (a wide, unseen stroke along every line, so a wavy or curly one is easy to point at)
      for (const edge of svg.querySelectorAll("[data-edge]")) {
        const path = edge.querySelector("path");
        if (path) edge.appendChild(svgEl("path", { class: "pg-hit", d: path.getAttribute("d") }));
      }
      const g = svgEl("g", { class: "pg-handles" });
      for (const v of model.vertices) {
        const c = svgEl("circle", { class: "pg-handle", cx: v.x, cy: v.y, r: 7 });
        c.dataset.vertex = v.id;
        g.appendChild(c);
      }
      svg.appendChild(g);
    }
    const unitOf = () => (model && model.unit) || UNIT;
    function toSvg(svg, e) {
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    // (to a tenth of a line's spacing when moving; to half a step when building, so designs line up)
    const atOf = (q, step) => { const r = (n) => Math.round(n / step) * step; const u = unitOf(); return [+(r(q.x / u.x)).toFixed(2), +(r(-q.y / u.y)).toFixed(2) || 0]; };
    function ripple(svg, q) {
      for (const delay of [0, 120]) {
        const c = svgEl("circle", { class: "pg-ripple", cx: q.x, cy: q.y, r: 5 });
        c.style.animationDelay = `${delay}ms`;
        svg.appendChild(c);
        setTimeout(() => c.remove(), 900 + delay);
      }
    }
    function nextPointName() {
      const taken = new Set((model?.vertices ?? []).map((v) => v.id));
      for (let n = 1; ; n++) if (!taken.has(`v${n}`) && !new RegExp(`(^|[^\\w'])v${n}(?![\\w'])`).test(source.value)) return `v${n}`;
    }

    // ---- what is under the pointer ------------------------------------------------------------
    const partAt = (target) => target.closest("[data-edge], .pg-handle");
    function show(target) {
      root.querySelectorAll(".pg-on").forEach((el) => el.classList.remove("pg-on"));
      if (!target) { hover.textContent = ""; return; }
      target.classList.add("pg-on");
      const edge = target.dataset.edge, vertex = target.dataset.vertex;
      const ids = edge ? [target.dataset.from, target.dataset.to] : [vertex];
      const lines = sourceLinesFor(source.value, ids).map((n) => n + 1);
      hover.textContent = `${edge ? `line ${edge}${target.dataset.particle ? ` (${target.dataset.particle})` : ""}` : `point ${vertex}`}${lines.length ? ` · source line ${lines.join(", ")}` : ""}`;
    }
    drawing.addEventListener("pointerover", (e) => { if (!gesture) show(partAt(e.target)); });
    drawing.addEventListener("pointerleave", () => { if (!gesture) show(null); });

    // ---- gestures: move, draw, erase ---------------------------------------------------------
    let gesture = null;
    drawing.addEventListener("pointerdown", (e) => {
      const svg = drawing.querySelector("svg");
      if (!svg || e.button !== 0) return;
      const handle = e.target.closest(".pg-handle");
      if (tool === "move" && handle) {
        e.preventDefault(); handle.setPointerCapture(e.pointerId);
        gesture = { kind: "move", handle, svg };
      } else if (tool === "draw") {
        // (a click on a line restyles it: see the click handler)
        if (!handle && e.target.closest("[data-edge]")) return;
        e.preventDefault(); drawing.setPointerCapture(e.pointerId);
        const start = handle ? { x: +handle.getAttribute("cx"), y: +handle.getAttribute("cy") } : toSvg(svg, e);
        const band = svgEl("line", { class: "pg-band", x1: start.x, y1: start.y, x2: start.x, y2: start.y });
        svg.appendChild(band);
        gesture = { kind: "draw", from: handle?.dataset.vertex, start, band, svg };
      }
    });
    drawing.addEventListener("pointermove", (e) => {
      if (!gesture) return;
      const q = toSvg(gesture.svg, e);
      if (gesture.kind === "move") { gesture.handle.setAttribute("cx", q.x); gesture.handle.setAttribute("cy", q.y); gesture.at = q; }
      else { gesture.band.setAttribute("x2", q.x); gesture.band.setAttribute("y2", q.y); gesture.moved = Math.hypot(q.x - gesture.start.x, q.y - gesture.start.y) > 6; }
    });
    drawing.addEventListener("pointerup", (e) => {
      if (!gesture) return;
      const g = gesture; gesture = null;
      if (g.kind === "move") {
        if (g.at) change(writePin(source.value, g.handle.dataset.vertex, ...atOf(g.at, 0.1)), `Moved ${g.handle.dataset.vertex}.`);
        return;
      }
      g.band.remove();
      const end = toSvg(g.svg, e);
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".pg-handle");
      let src = source.value, from = g.from;
      const place = (q) => { const id = nextPointName(); const [x, y] = atOf(q, 0.5); src = `${src.replace(/\s*$/, "")}\n${id} at (${x}, ${y})`.replace(/^\n/, ""); model.vertices.push({ id }); return id; };
      if (!g.moved) {
        // (a click: a point of its own, on empty space)
        if (!from) { const id = place(end); ripple(g.svg, end); change(src, `Added point ${id}.`); }
        return;
      }
      if (!from) from = place(g.start);
      const to = over?.dataset.vertex ?? place(end);
      if (to === from) return;
      src = `${src.replace(/\s*$/, "")}\n${from} -- [${brush}] ${to}`.replace(/^\n/, "");
      ripple(g.svg, end);
      change(src, `Drew ${brush} from ${from} to ${to}.`);
    });
    drawing.addEventListener("click", (e) => {
      const hit = partAt(e.target);
      if (!hit) return;
      if (tool === "erase") return erase(hit);
      if (tool === "draw" && hit.dataset.edge) return restyle(hit, brush);
      if (tool === "move") {
        const ids = hit.dataset.edge ? [hit.dataset.from, hit.dataset.to] : [hit.dataset.vertex];
        const n = sourceLinesFor(source.value, ids)[0];
        if (n === undefined) return;
        const starts = source.value.split("\n").slice(0, n).reduce((s, l) => s + l.length + 1, 0);
        source.focus(); source.setSelectionRange(starts, starts + source.value.split("\n")[n].length);
      }
    });
    function restyle(edge, style) {
      const line = simpleEdge(edge.dataset.from, edge.dataset.to);
      if (!line.test(source.value)) return say(`${edge.dataset.edge} is written as part of a chain or a process: change it in the source.`, true);
      change(source.value.replace(line, `${edge.dataset.from} -- [${style}] ${edge.dataset.to}`), `${edge.dataset.edge} is now ${style}.`);
    }
    function erase(hit) {
      let src = source.value;
      if (hit.dataset.edge) {
        const line = simpleEdge(hit.dataset.from, hit.dataset.to);
        if (!line.test(src)) return say(`${hit.dataset.edge} is written as part of a chain or a process: remove it in the source.`, true);
        return change(src.replace(line, "").replace(/\n{2,}/g, "\n").replace(/^\n/, ""), `Removed ${hit.dataset.edge}.`);
      }
      const id = hit.dataset.vertex;
      const lines = (model?.edges ?? []).filter((ed) => ed.from === id || ed.to === id);
      if (lines.some((ed) => !simpleEdge(ed.from, ed.to).test(src))) return say(`${id} is part of a chain or a process: remove it in the source.`, true);
      for (const ed of lines) src = src.replace(simpleEdge(ed.from, ed.to), "");
      src = src.replace(pinLine(id), "").replace(/\n{2,}/g, "\n").replace(/^\n/, "");
      change(src, `Removed ${id}${lines.length ? ` and its ${lines.length === 1 ? "line" : "lines"}` : ""}.`);
    }

    // ---- the palette: pick a line to draw with, or drop one on a line -----------------------
    root.querySelectorAll(".pg-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        brush = chip.dataset.style;
        root.querySelectorAll(".pg-chip").forEach((c) => c.classList.toggle("pg-active", c === chip));
        setTool("draw");
      });
      chip.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", chip.dataset.style); e.dataTransfer.effectAllowed = "copy"; });
    });
    drawing.addEventListener("dragover", (e) => { const edge = e.target.closest?.("[data-edge]"); if (edge) { e.preventDefault(); show(edge); } });
    drawing.addEventListener("drop", (e) => { const edge = e.target.closest?.("[data-edge]"); if (!edge) return; e.preventDefault(); restyle(edge, e.dataTransfer.getData("text/plain")); });

    // ---- controls -----------------------------------------------------------------------------
    function setTool(name) {
      tool = name;
      root.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("pg-active", b.dataset.tool === name));
      const svg = drawing.querySelector("svg");
      if (svg) { svg.classList.remove("pg-tool-move", "pg-tool-draw", "pg-tool-erase"); svg.classList.add(`pg-tool-${name}`); }
      showHint();
    }
    root.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
    source.addEventListener("input", later);
    $(".pg-example").addEventListener("change", (e) => {
      if (!e.target.value) return;
      change(EXAMPLES[e.target.value]); e.target.value = ""; tikz.hidden = true;
    });
    root.querySelectorAll("[data-switch]").forEach((sel) => sel.addEventListener("change", () => {
      let src = writeSwitch(source.value, sel.dataset.switch, sel.value);
      if (sel.dataset.switch === "layout" && sel.value !== "grid") src = writeSwitch(src, "grid", "");
      change(src);
    }));
    root.querySelectorAll("[data-grid]").forEach((b) => b.addEventListener("click", () => change(writeSwitch(source.value, "grid", b.dataset.grid))));
    $(".pg-styling").addEventListener("change", (e) => {
      let src = source.value;
      for (const k of STYLING_KEYS) src = writeSwitch(src, k, "");
      for (const [k, v] of Object.entries(STYLINGS[+e.target.value].lines)) src = writeSwitch(src, k, v);
      change(src);
    });
    const save = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    const standalone = () => feynjs.render(source.value, { idPrefix: "pgx", standalone: true });
    root.querySelector(".pg-top").addEventListener("click", async (e) => {
      const what = e.target.dataset?.do;
      if (!what) return;
      if (what === "undo") undo();
      else if (what === "redo") redo();
      else if (what === "surprise") {
        const names = Object.keys(EXAMPLES).filter((k) => EXAMPLES[k] !== source.value);
        change(EXAMPLES[names[Math.floor(Math.random() * names.length)]]);
      } else if (what === "share") {
        draw();
        try { await navigator.clipboard.writeText(location.href); say("Link copied: it holds the source, so the diagram opens as you see it."); }
        catch (err) { say(location.href); }
      } else if (what === "svg") save(new Blob([standalone()], { type: "image/svg+xml" }), "diagram.svg");
      else if (what === "png") {
        const img = new Image(), url = URL.createObjectURL(new Blob([standalone()], { type: "image/svg+xml" }));
        img.onload = () => {
          const k = 3, c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k;
          const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob((b) => save(b, "diagram.png")); URL.revokeObjectURL(url);
        };
        img.src = url;
      } else if (what === "tikz") {
        try { tikz.querySelector("code").textContent = feynjs.toTikz(source.value); tikz.hidden = false; tikz.open = true; }
        catch (err) { say(String(err.message || err), true); }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (!root.isConnected || document.activeElement === source) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); (e.shiftKey ? redo : undo)(); }
    });

    source.value = fromHash() ?? EXAMPLES["Top pair, decayed"];
    draw();
  }

  const go = () => document.querySelectorAll("[data-feynjs-playground]:not([data-built])").forEach((root) => { root.dataset.built = "1"; build(root); });
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
