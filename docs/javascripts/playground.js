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
  // (toTikz is on the page's feynjs; should a build without it be in use, the full file beside it,
  // feynjs-full.min.js, is fetched the first time TikZ is asked for and takes the global over)
  let tools = null;
  const loadTools = () => tools || (tools = new Promise((resolve, reject) => {
    if (window.feynjs && typeof window.feynjs.toTikz === "function") return resolve(window.feynjs);
    const main = [...document.scripts].find((s) => /feynjs(\.min)?\.js(\?|$)/.test(s.src));
    if (!main) return reject(new Error("the TikZ tools could not be found beside feynjs"));
    const tag = document.createElement("script");
    tag.src = main.src.replace(/feynjs(\.min)?\.js/, "feynjs-full.min.js");
    tag.onload = () => (typeof window.feynjs?.toTikz === "function" ? resolve(window.feynjs) : reject(new Error("the TikZ tools did not load")));
    tag.onerror = () => { tools = null; reject(new Error("the TikZ tools could not be loaded")); };
    document.head.appendChild(tag);
  }));

  // (grouped as the menus show them; every one drawn by this site's own diagrams)
  const GROUPS = {
    "Standard Model": {
      "e⁺e⁻ → μ⁺μ⁻": "i1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]",
      "Compton scattering": "in: i1 i2\nout: f1 f2\ni1 [e-] -- a\ni2 [gamma] -- a\na -- [fermion] b\nb -- f1 [e-]\nb -- f2 [gamma]",
      "Drell–Yan": "i1 [q] -- a -- i2 [qbar]\na -- [gamma] b\nf1 [mu-] -- b -- f2 [mu+]",
      "Higgs by gluon fusion, H → 4ℓ": "g g > {t} > H\nH > Z Z\nZ > e+ e-\nZ > mu+ mu-",
      "Vector-boson fusion": "i1 [q] -- a -- f1 [q]\ni2 [q] -- b -- f3 [q]\na -- [W] c -- [W] b\nc [dot, label=\\kappa_V, color=green] -- f2 [H]",
      "Top pair, decayed": "p p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
      "Single top, tW": "in: i1 i2\nout: f2 f1\ni1 [g] -- a\ni2 [b] -- b -- [fermion, label=t] a\nb -- [boson] f1 [W-]\na -- f2 [t]",
      "Colour flow": "colour flow: on\nd dbar > g > t tbar\nt > b W+\ntbar > bbar W-",
      "Boosted top, as the detector sees it": "p p > t tbar\nt > bjet W+(> LRJ)\ntbar > bbar W-(> e- nu~)"
    },
    "SUSY": {
      "Gluino pair": "p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1",
      "One gluino decayed": "p p > gluino(> q q neutralino1) gluino",
      "Stop pair": "p p > stop stop~\nstop > t neutralino1\nstop~ > tbar neutralino1",
      "Long cascade": "i1 [p] -- pp [blob] -- i2 [p]\npp -- [gluino] d1\npp -- [gluino] d2\nd1 -- f1 [q]\nd1 -- f2 [q]\nd1 -- [chargino] e1\ne1 -- f3 [W]\ne1 -- [neutralino2] g1\ng1 -- f4 [Z]\ng1 -- f5 [neutralino1]\nd2 -- [chargino] e2\ne2 -- [neutralino2] g2\ne2 -- f6 [W]\ng2 -- f7 [neutralino1]\ng2 -- f8 [Z]\nd2 -- f9 [q]\nd2 -- f10 [q]",
      "Squark and gluino": "in: i1 i2\nout: f1 f2\ni1 [q] -- a -- f1 [squark]\ni2 [g] -- b\na -- [gluino] b\nb -- f2 [gluino]",
      "Slepton pair": "i1 [q] -- a -- i2 [qbar]\na -- [gamma] b\nb -- [slepton] c\nb -- [slepton] d\nc -- f1 [l]\nc -- f2 [neutralino]\nd -- f3 [l]\nd -- f4 [neutralino]"
    },
    "Flavour physics": {
      "B⁰ → K*⁰ μ⁺μ⁻ penguin": "in: d1 b\nout: d2 s mu1 mu2\nd1 [d] -- [fermion] d2 [d]\ns [\\bar{s}] -- [fermion] l2 -- [fermion, label={\\bar{u}, \\bar{c}, \\bar{t}}] l1 -- [fermion] b [\\bar{b}]\nl1 -- [boson, label=W^+] x -- [boson] l2\nx -- [photon, label={\\gamma, Z^0}] v\nv -- [fermion] mu1 [\\mu^-]\nmu2 [\\mu^+] -- [fermion] v\nhadron: B^0 = d1 b [brace]\nhadron: K^{*0} = d2 s [brace]",
      "Bc⁺ → J/ψ Ds⁺": "in: c1 b\nout: c2 cbar s c3\nc1 [c] -- [fermion] c2 [c]\ncbar [\\bar{c}] -- [fermion] v -- [fermion] b [\\bar{b}]\nv -- [boson, label=W] w\ns [\\bar{s}] -- [fermion] w -- [fermion] c3 [c]\nmeson: B_c^+ = c1 b\nmeson: J/\\psi = c2 cbar\nmeson: D_s^+ = s c3",
      "Bc⁺ → J/ψ Ds⁽*⁾⁺, annihilation": "in: b1 c1\nout: s1 c2 cb c3\nw1 -- [fermion] b1 [\\bar b]\nc1 [c] -- [fermion] w1\nw1 -- [boson, label=W] w2\ns1 [\\bar s] -- [fermion] w2 -- [fermion] c3 [c]\ncb [\\bar c] -- [fermion] vc -- [fermion] c2 [c]\nmeson: B_c^+ = b1 c1\nmeson: D_s^{(*)+} = s1 c2\nmeson: J/\\psi = cb c3"
    },
    "Heavy ion": {
      "Light-by-light scattering in Pb+Pb": "in: pb1 pb2\nout: pb3 g1 g2 pb4\npb1 [\\mathrm{Pb}]\npb2 [\\mathrm{Pb}]\npb3 [\\mathrm{Pb(*)}]\npb4 [\\mathrm{Pb(*)}]\nB1 [hatched blob]\nB2 [hatched blob]\npb1 -- [fermion] B1 -- [fermion] pb3\npb2 -- [fermion] B2 -- [fermion] pb4\nB1 -- [gamma] a\nB2 -- [gamma] d\na -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a\nb -- [photon] g1 [gamma]\nc -- [photon] g2 [gamma]",
      "Delbrück scattering": "in: g1 c1\nout: g2 c2\nc1 [crossed dot]\nc2 [crossed dot]\ng1 -- [photon] a\na -- [fermion] b -- [fermion] c -- [fermion] d -- [fermion] a\nb -- [photon] g2\nc1 -- [photon] d\nc2 -- [photon] c",
      "A photon off a lead nucleus": "i1 [Pb] -- b [nucleus=Pb] -- o1 [Pb]\nb -- [photon] g [gamma]",
      "Photon fusion to an axion": "i1 [p] -- a [dot] -- f1 [p*]\ni2 [p] -- b -- f3 [p]\na -- [gamma] c -- [gamma] b\nc -- [scalar, label=a] d\nd -- f2 [gamma]\nd -- f4 [gamma]"
    },
    "Views & engines": {
      "Kinematic view": "view: kinematic\np p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
      "Lattice QCD": "view: lattice\nlattice: 8x6\nboundary: periodic\nwilson loop: (1,1) to (4,4)\nplaquette: (5,1)\nlink: (5,4) to (6,4)\npolyakov loop: 7\nsite: (0,4) [label=\\psi(x)]",
      "Grid layout, isometric": "layout: grid\ngrid: iso\np p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
      "SUSY cascade on the grid": "layout: grid\np p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1"
    }
  };
  const EXAMPLES = Object.assign({}, ...Object.values(GROUPS));
  // (the lines the palette offers, each drawn by feynjs itself in its chip)
  // (the palette: line styles, then particles by the names you type; every particle feynjs knows
  // works the same, and the palette links to the whole list)
  const PALETTE_GROUPS = [
    ["Lines", ["fermion", "anti fermion", "photon", "gluon", "scalar", "ghost"]],
    ["Particles", ["e-", "mu-", "nu", "t", "b", "gamma", "g", "W+", "Z", "H", "gluino", "neutralino1", "squark"]],
  ];
  const PALETTE = PALETTE_GROUPS.flatMap(([, names]) => names);
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
          <select class="pg-example" aria-label="Examples"><option value="">Examples…</option>${Object.entries(GROUPS).map(([group, list]) => `<optgroup label="${group}">${Object.keys(list).map((k) => `<option>${k}</option>`).join("")}</optgroup>`).join("")}</select>
          <button type="button" data-do="surprise" title="A random example">Random</button>
          <span class="pg-sep"></span>
          <select data-switch="layout" title="Layout engine" aria-label="Layout engine"><option value="">Layout: forces</option><option value="grid">Layout: grid</option><option value="manual">Layout: manual</option><option value="v1">Layout: v1</option></select>
          <span class="pg-seg pg-gridkind" hidden><button type="button" data-grid="">Square</button><button type="button" data-grid="iso">Iso</button></span>
          <select class="pg-styling" title="Styling" aria-label="Styling">${STYLINGS.map((s, i) => `<option value="${i}">${i ? s.name[0].toUpperCase() + s.name.slice(1) : "Plain"}</option>`).join("")}</select>
          <select data-switch="size" title="Size" aria-label="Size"><option value="">Size: normal</option><option value="small">Size: small</option><option value="large">Size: large</option></select>
          <button type="button" data-do="why" class="pg-why" title="debug: on, why each line lies where it does: each line marked with the family of rules that shapes it">Why?</button>
          <span class="pg-actions">
            <span class="pg-seg"><button type="button" data-do="undo" title="Undo (⌘Z outside the editor)">Undo</button><button type="button" data-do="redo" title="Redo (⇧⌘Z)">Redo</button></span>
            <span class="pg-sep"></span>
            <span class="pg-seg"><button type="button" data-do="share" title="Copy a link that holds the source">Share</button><button type="button" data-do="svg" title="Download an SVG">SVG</button><button type="button" data-do="png" title="Download a PNG">PNG</button><button type="button" data-do="tikz" title="TikZ-Feynman code">TikZ</button></span>
          </span>
        </div>
        <div class="pg-body">
          <div class="pg-editor"><textarea class="pg-source" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="feynjs source"></textarea><div class="pg-status"></div></div>
          <div class="pg-stage"><div class="pg-drawing" aria-live="polite"></div><div class="pg-hover"></div><div class="pg-hint"></div></div>
          <div class="pg-palette" aria-label="Line to draw with">${PALETTE_GROUPS.map(([head, names]) => `<div class="pg-palette-head">${head}</div>` + names.map((p) => `<button type="button" class="pg-chip${p === PALETTE[0] ? " pg-active" : ""}" draggable="true" data-style="${p}" title="${p}: click to draw with it, or drop it on a line; write [${p}] in the source"><span class="pg-chip-line"></span><span class="pg-chip-name">${p}</span></button>`).join("")).join("")}<a class="pg-palette-more" href="../authoring/particles/" title="Every particle name feynjs knows">All particles →</a></div>
        </div>
      </div>
      <details class="pg-model"><summary>The diagram as data: what a program, or an AI, sees</summary><pre><code></code></pre></details>
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

    function draw(preview) {
      const src = preview ?? source.value;
      root.querySelector('[data-switch="layout"]').value = readSwitch(src, "layout");
      root.querySelector('[data-switch="size"]').value = readSwitch(src, "size");
      const styling = STYLINGS.findIndex((s, i) => i > 0 && Object.entries(s.lines).every(([k, v]) => readSwitch(src, k) === v));
      $(".pg-styling").value = String(Math.max(0, styling));
      $(".pg-why").classList.toggle("pg-active", readSwitch(src, "debug") === "on");
      const grid = readSwitch(src, "layout") === "grid";
      $(".pg-gridkind").hidden = !grid;
      root.querySelectorAll("[data-grid]").forEach((b) => b.classList.toggle("pg-active", (readSwitch(src, "grid").startsWith("iso") ? "iso" : "") === b.dataset.grid));
      if (!src.trim()) {
        // (an empty board to build on, as big as the pane: two pixels to the drawing's unit, the
        // first point a little left of the middle; and held, so drawing begins where it is)
        const stage = drawing.parentElement, w = Math.max(320, stage.clientWidth - 40), h = Math.max(180, stage.clientHeight - 56);
        drawing.innerHTML = `<svg xmlns="${NS}" class="feynjs pg-board" viewBox="${(-w / 4 + 40).toFixed(1)} ${(-h / 4).toFixed(1)} ${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)}" width="${w}" height="${h}"></svg>`;
        freeze();
        model = { unit: UNIT, vertices: [], edges: [] };
        modelOut.textContent = JSON.stringify(model, null, 1);
        say(tool === "draw" ? "" : "An empty board: choose Draw to build a diagram, or pick an example.");
        decorate();
      } else {
        try {
          drawing.innerHTML = feynjs.render(src, { idPrefix: "pg", model: true });
          // (while points are being moved or drawn, the frame holds still, so a point stays where
          // it was put; else the drawing fits the pane)
          if (frozen) hold(); else fit();
          say("");
          const meta = drawing.querySelector("metadata.feynjs-model");
          model = meta ? JSON.parse(meta.textContent) : null;
          modelOut.textContent = model ? JSON.stringify(model, null, 1) : "(this version of feynjs does not write the diagram as data yet)";
          decorate();
        } catch (e) { say(String(e.message || e), true); }
      }
      if (preview !== undefined) return;
      history.replaceState(null, "", toHash(src));
      showHint();
    }
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 120); };
    // the frame the drawing is shown in, held still while points are moved or drawn: its viewBox
    // and its size on the page, as they were when that began. Typing, an example or another tool
    // lets it go, and the drawing fits the pane again.
    let frozen = null;
    function freeze() {
      const svg = drawing.querySelector("svg");
      if (!svg) return;
      frozen = { viewBox: svg.getAttribute("viewBox"), width: svg.getAttribute("width"), height: svg.getAttribute("height") };
    }
    function hold() {
      const svg = drawing.querySelector("svg");
      if (!svg || !frozen) return;
      svg.setAttribute("viewBox", frozen.viewBox); svg.setAttribute("width", frozen.width); svg.setAttribute("height", frozen.height);
    }
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
        const c = svgEl("circle", { class: "pg-handle", cx: v.x, cy: v.y, r: 5.5 });
        c.dataset.vertex = v.id;
        g.appendChild(c);
      }
      svg.appendChild(g);
      snapGrid(svg);
    }
    // (the snapping grid, shown while drawing: dots over the whole pane, in the source's units)
    function snapGrid(svg) {
      const stage = drawing.parentElement.getBoundingClientRect(), ctm = svg.getScreenCTM();
      if (!ctm) return;
      const inv = ctm.inverse(), corner = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(inv); };
      const a = corner(stage.left, stage.top), b = corner(stage.right, stage.bottom), u = unitOf();
      const sx = SNAP.x * u.x, sy = SNAP.y * u.y;
      const dots = [];
      for (let x = Math.ceil(a.x / sx) * sx; x <= b.x && dots.length < 4000; x += sx)
        for (let y = Math.ceil(a.y / sy) * sy; y <= b.y; y += sy) dots.push(`M${x.toFixed(1)} ${y.toFixed(1)}h0`);
      svg.insertBefore(svgEl("path", { class: "pg-snapgrid", d: dots.join("") }), svg.firstChild);
      svg.appendChild(svgEl("circle", { class: "pg-ghost", r: 4, cx: -1e4, cy: -1e4 }));
    }
    const unitOf = () => (model && model.unit) || UNIT;
    function toSvg(svg, e) {
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    // (moving: to a tenth of a line's spacing; drawing: onto the snapping grid, half a step across
    // and three quarters up, near enough square on the page, so designs line up)
    const SNAP = { x: 0.5, y: 0.75 };
    const atOf = (q, step) => { const r = (n) => Math.round(n / step) * step; const u = unitOf(); return [+(r(q.x / u.x)).toFixed(2), +(r(-q.y / u.y)).toFixed(2) || 0]; };
    const snapAt = (q) => { const u = unitOf(); return [+(Math.round(q.x / u.x / SNAP.x) * SNAP.x).toFixed(2), +(Math.round(-q.y / u.y / SNAP.y) * SNAP.y).toFixed(2) || 0]; };
    const snapped = (q) => { const [x, y] = snapAt(q), u = unitOf(); return { x: x * u.x, y: -y * u.y }; };
    // (onto a point already drawn, when the pointer is close to it; else onto the grid)
    function target(svg, q) {
      let best = null, bestD = 16;
      for (const h of svg.querySelectorAll(".pg-handle")) {
        const d = Math.hypot(+h.getAttribute("cx") - q.x, +h.getAttribute("cy") - q.y);
        if (d < bestD) { best = h; bestD = d; }
      }
      return best ? { x: +best.getAttribute("cx"), y: +best.getAttribute("cy"), vertex: best.dataset.vertex } : snapped(q);
    }
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
    const stageEl = drawing.parentElement;
    stageEl.addEventListener("pointerdown", (e) => {
      const svg = drawing.querySelector("svg");
      if (!svg || e.button !== 0) return;
      const handle = e.target.closest(".pg-handle");
      if (tool === "move" && handle) {
        // (the frame holds from here, so the point stays under the pointer, and the diagram is
        // drawn again as it moves: its lines stretch and the other points settle round it)
        e.preventDefault(); stageEl.setPointerCapture(e.pointerId);
        if (!frozen) freeze();
        gesture = { kind: "move", id: handle.dataset.vertex };
      } else if (tool === "draw") {
        // (a click on a line restyles it: see the click handler)
        if (!handle && e.target.closest("[data-edge]")) return;
        e.preventDefault(); stageEl.setPointerCapture(e.pointerId);
        // (from a point already drawn when the pointer is near it, as the end of a line snaps to one)
        const near = handle ? { x: +handle.getAttribute("cx"), y: +handle.getAttribute("cy"), vertex: handle.dataset.vertex } : target(svg, toSvg(svg, e));
        const start = { x: near.x, y: near.y };
        const band = svgEl("line", { class: "pg-band", x1: start.x, y1: start.y, x2: start.x, y2: start.y });
        svg.appendChild(band);
        gesture = { kind: "draw", from: near.vertex, start, band, svg };
      }
    });
    stageEl.addEventListener("pointermove", (e) => {
      const svg = drawing.querySelector("svg");
      if (!svg) return;
      const ghost = svg.querySelector(".pg-ghost");
      if (!gesture) {
        // (where a click would put a point)
        if (ghost && tool === "draw") { const t = target(svg, toSvg(svg, e)); ghost.setAttribute("cx", t.x); ghost.setAttribute("cy", t.y); }
        return;
      }
      if (gesture.kind === "move") {
        gesture.at = toSvg(svg, e);
        if (!gesture.frame) gesture.frame = requestAnimationFrame(() => {
          gesture.frame = 0;
          draw(writePin(source.value, gesture.id, ...atOf(gesture.at, 0.1)));
          drawing.querySelector(`.pg-handle[data-vertex="${CSS.escape(gesture.id)}"]`)?.classList.add("pg-on");
        });
        return;
      }
      const q = toSvg(gesture.svg, e);
      {
        const t = target(gesture.svg, q);
        gesture.end = t;
        gesture.band.setAttribute("x2", t.x); gesture.band.setAttribute("y2", t.y);
        if (ghost) { ghost.setAttribute("cx", t.x); ghost.setAttribute("cy", t.y); }
        gesture.moved = Math.hypot(q.x - gesture.start.x, q.y - gesture.start.y) > 6;
      }
    });
    stageEl.addEventListener("pointerleave", () => { const ghost = drawing.querySelector(".pg-ghost"); if (ghost) ghost.setAttribute("cx", -1e4); });
    stageEl.addEventListener("pointerup", (e) => {
      if (!gesture) return;
      const g = gesture; gesture = null;
      if (g.kind === "move") {
        if (g.frame) cancelAnimationFrame(g.frame);
        if (g.at) change(writePin(source.value, g.id, ...atOf(g.at, 0.1)), `Moved ${g.id}.`);
        else draw();
        return;
      }
      g.band.remove();
      const end = g.end ?? target(g.svg, toSvg(g.svg, e));
      let src = source.value, from = g.from;
      const place = (q) => { const id = nextPointName(); const [x, y] = snapAt(q); src = `${src.replace(/\s*$/, "")}\n${id} at (${x}, ${y})`.replace(/^\n/, ""); model.vertices.push({ id }); return id; };
      if (!g.moved) {
        // (a click: a point of its own, on empty space)
        if (!from) { const id = place(end); ripple(g.svg, end); change(src, `Added point ${id}.`); }
        return;
      }
      if (!from) from = place(g.start);
      const to = end.vertex ?? place(end);
      if (to === from) return;
      src = `${src.replace(/\s*$/, "")}\n${from} -- [${brush}] ${to}`.replace(/^\n/, "");
      ripple(g.svg, end);
      change(src, `Drew ${brush} from ${from} to ${to}.`);
    });
    drawing.addEventListener("click", (e) => {
      const hit = partAt(e.target);
      if (!hit) return;
      if (tool === "erase") return erase(hit);
      if (tool === "move" && hit.dataset.object === "large") return openFiller(hit, e);
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

    // ---- inside a large-R jet: click one to choose what it holds --------------------------
    const FILLINGS = [["2 jets", "2j"], ["3 jets", "3j"], ["b + 2 jets (a top)", "1b 2j"], ["b + W → 2 jets", "1b W(2j)"], ["W → 2 jets", "W(2j)"], ["Z → 2 jets", "Z(2j)"], ["H → b b̄", "H(2b)"], ["empty", ""]];
    const filler = document.createElement("div");
    filler.className = "pg-filler"; filler.hidden = true;
    filler.innerHTML = `<div class="pg-filler-title">Inside this large-R jet</div><div class="pg-filler-list">${FILLINGS.map(([name, text]) => `<button type="button" data-fill="${text}">${name}<code>${text || "—"}</code></button>`).join("")}</div><form class="pg-filler-own"><input type="text" placeholder="your own: 1b W(2j)" aria-label="contents"><button type="submit">Set</button></form>`;
    root.appendChild(filler);
    let filling = null;
    // (every large-R jet written in the source, in order: in a line's brackets, [LRJ 1b], or in a
    // process, LRJ(1b W(2j)))
    function jetsInSource(src) {
      const found = [], re = /\b(LRJ|large[ -]r jet|fat jet)\b/gi;
      let m;
      while ((m = re.exec(src))) {
        const word = m[0];
        const lineStart = src.lastIndexOf("\n", m.index) + 1, upTo = src.slice(lineStart, m.index);
        const inBracket = (upTo.match(/\[/g) || []).length > (upTo.match(/\]/g) || []).length;
        if (inBracket) {
          const close = src.indexOf("]", m.index), comma = src.indexOf(",", m.index);
          const end = comma >= 0 && comma < close ? comma : close;
          found.push({ from: m.index, to: end, write: (inside) => `${word}${inside ? " " + inside : ""}` });
        } else {
          let end = m.index + word.length;
          if (src[end] === "(" && !/^\(\s*>/.test(src.slice(end))) { let depth = 0; do { if (src[end] === "(") depth++; if (src[end] === ")") depth--; end++; } while (depth > 0 && end < src.length); }
          found.push({ from: m.index, to: end, write: (inside) => `${word}${inside ? `(${inside})` : ""}` });
        }
      }
      return found;
    }
    function openFiller(edge, e) {
      const jets = [...drawing.querySelectorAll('[data-object="large"]')];
      filling = { k: jets.indexOf(edge) };
      const box = root.getBoundingClientRect();
      filler.style.left = `${Math.min(e.clientX - box.left + 8, root.clientWidth - 250)}px`;
      filler.style.top = `${e.clientY - box.top + 8}px`;
      filler.hidden = false;
      filler.querySelector("input").value = "";
    }
    function fill(inside) {
      if (!filling) return;
      const jets = jetsInSource(source.value), jet = jets[filling.k] ?? (jets.length === 1 ? jets[0] : undefined);
      filler.hidden = true;
      if (!jet) return say("Can't find this large-R jet in the source: write its contents as [LRJ 1b W(2j)] or LRJ(1b W(2j)).", true);
      change(source.value.slice(0, jet.from) + jet.write(inside.trim()) + source.value.slice(jet.to), inside ? `The large-R jet now holds ${inside}.` : "The large-R jet is empty.");
      filling = null;
    }
    filler.addEventListener("click", (e) => { const b = e.target.closest("[data-fill]"); if (b) fill(b.dataset.fill); });
    filler.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); fill(filler.querySelector("input").value); });
    document.addEventListener("pointerdown", (e) => { if (!filler.hidden && !filler.contains(e.target) && !e.target.closest?.('[data-object="large"]')) filler.hidden = true; });

    // ---- autocomplete: what fits where the cursor is ------------------------------------------
    // (switches at the start of a line; inside [ ] the line styles, particles, objects and
    // options; in a process, particles and objects; in edges, the diagram's own point names)
    const SWITCH_WORDS = ["layout", "grid", "background", "colour flow", "charge colour", "colours", "size", "scale", "view", "projection", "rotate", "show intermediate", "reconstruct", "in", "out", "hadron", "meson", "baryon", "note", "title", "arrows", "dots", "final plane", "debug", "lattice", "boundary", "wilson loop", "plaquette", "link", "polyakov loop", "site", "axes", "every fermion", "every photon", "every gluon", "every scalar", "horizontal", "vertical", "inline", "reveal"];
    const OBJECT_WORDS = ["LRJ", "SRJ", "SVJ", "EMG", "TRK", "TAU", "MET", "LJ", "BJ", "DT", "DL", "PR", "J", "bjet"];
    const OPTION_WORDS = ["label=", "label'=", "momentum=", "momentum'=", "reversed momentum=", "insertion=", "with arrow=", "with reversed arrow=", "bend=", "half left", "half right", "quarter left", "quarter right", "out=", "in=", "looseness=", "color=", "no label", "no arrow", "dot", "empty dot", "crossed dot", "square dot", "blob", "small blob", "hatched blob", "nucleus=", "cone", "jet", "pulse", "lifetime", "radiation", "brace", "cap", "particle="];
    const vocabulary = (kind) => {
      const lib = window.feynjs;
      const particles = lib.particleNames ? lib.particleNames() : [], styles = lib.lineStyles ? Object.keys(lib.lineStyles) : [];
      if (kind === "switch") return [...SWITCH_WORDS.map((w) => ({ word: w, kind: "switch", insert: `${w}: ` })), ...particles.map((w) => ({ word: w, kind: "particle" }))];
      if (kind === "bracket") return [...styles.map((w) => ({ word: w, kind: "line" })), ...particles.map((w) => ({ word: w, kind: "particle" })), ...OBJECT_WORDS.map((w) => ({ word: w, kind: "object" })), ...OPTION_WORDS.map((w) => ({ word: w, kind: "option" }))];
      if (kind === "process") return [...particles.map((w) => ({ word: w, kind: "particle" })), ...OBJECT_WORDS.map((w) => ({ word: w, kind: "object" }))];
      return (model?.vertices ?? []).map((v) => ({ word: v.id, kind: "point" }));
    };
    const menu = document.createElement("div");
    menu.className = "pg-complete"; menu.hidden = true; menu.setAttribute("role", "listbox");
    root.appendChild(menu);
    let choices = [], picked = 0, token = null;
    // (where the cursor is in the editor, in page pixels: a copy of the text up to it, laid out alike)
    function caretPoint() {
      const style = getComputedStyle(source), copy = document.createElement("div");
      for (const k of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "paddingTop", "paddingLeft", "paddingRight", "borderTopWidth", "borderLeftWidth", "boxSizing", "whiteSpace", "wordWrap", "tabSize"]) copy.style[k] = style[k];
      copy.style.position = "absolute"; copy.style.visibility = "hidden"; copy.style.whiteSpace = "pre-wrap"; copy.style.width = source.clientWidth + "px";
      copy.textContent = source.value.slice(0, source.selectionStart);
      const mark = document.createElement("span"); mark.textContent = "\u200b"; copy.appendChild(mark);
      root.appendChild(copy);
      const box = root.getBoundingClientRect(), at = mark.getBoundingClientRect(), from = copy.getBoundingClientRect();
      const ed = source.getBoundingClientRect();
      const point = { x: ed.left - box.left + (at.left - from.left) - source.scrollLeft, y: ed.top - box.top + (at.top - from.top) - source.scrollTop + parseFloat(style.lineHeight || "16") };
      copy.remove();
      return point;
    }
    function closeMenu() { menu.hidden = true; choices = []; token = null; }
    function suggest() {
      const caret = source.selectionStart;
      if (caret !== source.selectionEnd) return closeMenu();
      const before = source.value.slice(0, caret), lineStart = before.lastIndexOf("\n") + 1, line = before.slice(lineStart);
      const word = /[\w+\-~'*]*$/.exec(line)[0];
      if (!word) return closeMenu();
      const open = line.lastIndexOf("["), shut = line.lastIndexOf("]");
      const kind = open > shut ? "bracket" : line.trim() === word ? "switch" : /(^|\s)>(\s|$)/.test(line) || /^[\w+\-~]+(\s+[\w+\-~]+)*\s*$/.test(line) && !line.includes("--") ? "process" : "points";
      const lower = word.toLowerCase();
      const seen = new Set();
      choices = vocabulary(kind).filter((c) => c.word.toLowerCase().startsWith(lower) && c.word !== word && !seen.has(c.word) && seen.add(c.word))
        .sort((a, b) => a.word.length - b.word.length).slice(0, 8);
      if (!choices.length) return closeMenu();
      token = { from: caret - word.length, to: caret };
      picked = 0;
      menu.innerHTML = choices.map((c, k) => `<div class="pg-choice${k === 0 ? " pg-picked" : ""}" role="option" data-k="${k}"><span>${c.word.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span><em>${c.kind}</em></div>`).join("");
      const at = caretPoint();
      menu.style.left = `${Math.min(at.x, root.clientWidth - 220)}px`; menu.style.top = `${at.y + 2}px`;
      menu.hidden = false;
    }
    function accept(k) {
      if (!token || !choices[k]) return;
      const c = choices[k], text = c.insert ?? c.word;
      const v = source.value;
      source.value = v.slice(0, token.from) + text + v.slice(token.to);
      const caret = token.from + text.length;
      source.setSelectionRange(caret, caret);
      closeMenu(); later();
    }
    source.addEventListener("input", suggest);
    source.addEventListener("click", closeMenu);
    source.addEventListener("blur", () => setTimeout(closeMenu, 150));
    source.addEventListener("keydown", (e) => {
      if (menu.hidden) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        picked = (picked + (e.key === "ArrowDown" ? 1 : choices.length - 1)) % choices.length;
        menu.querySelectorAll(".pg-choice").forEach((el, k) => el.classList.toggle("pg-picked", k === picked));
      } else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); accept(picked); }
      else if (e.key === "Escape") { e.preventDefault(); closeMenu(); }
    });
    menu.addEventListener("mousedown", (e) => { const el = e.target.closest(".pg-choice"); if (el) { e.preventDefault(); accept(+el.dataset.k); } });

    // ---- controls -----------------------------------------------------------------------------
    function setTool(name) {
      const was = tool;
      tool = name;
      // (drawing: the frame as it is now holds while the tool is on; leaving it, the drawing fits again)
      if (name === "draw" && was !== "draw") freeze();
      if (name !== "draw" && was === "draw") { frozen = null; draw(); }
      root.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("pg-active", b.dataset.tool === name));
      const svg = drawing.querySelector("svg");
      if (svg) { svg.classList.remove("pg-tool-move", "pg-tool-draw", "pg-tool-erase"); svg.classList.add(`pg-tool-${name}`); }
      showHint();
    }
    root.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
    source.addEventListener("input", () => { frozen = null; later(); });
    root.querySelectorAll(".pg-example").forEach((menu) => menu.addEventListener("change", (e) => {
      if (!e.target.value) return;
      frozen = null; change(EXAMPLES[e.target.value]); e.target.value = ""; tikz.hidden = true;
    }));
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
      else if (what === "why") change(writeSwitch(source.value, "debug", readSwitch(source.value, "debug") === "on" ? "" : "on"));
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
        try { tikz.querySelector("code").textContent = (await loadTools()).toTikz(source.value); tikz.hidden = false; tikz.open = true; }
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
