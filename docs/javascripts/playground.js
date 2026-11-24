// The playground: write feynjs source below, see the diagram above as you type.
//
// Built on the names feynjs gives every part of a drawing: each line's group carries
// data-edge="a--b" (with data-from, data-to, data-particle), each drawn point data-vertex="b",
// and the SVG holds the whole diagram as data in <metadata class="feynjs-model">. So the page can
// say what is under the pointer, show which line of the source made it, and let a point be
// dragged: dropping it writes `b at (x, y)` into the source. The same names are what a program,
// or a language model, reads to refer to a part of the diagram.
(function () {
  "use strict";

  const EXAMPLES = {
    "e⁺e⁻ → μ⁺μ⁻": "i1 [e-] -- a -- i2 [e+]\na -- [photon] b\nf1 [mu-] -- b -- f2 [mu+]",
    "Compton scattering": "in: i1 i2\nout: f1 f2\ni1 [e-] -- a\ni2 [gamma] -- a\na -- [fermion] b\nb -- f1 [e-]\nb -- f2 [gamma]",
    "Higgs by gluon fusion": "g g > {t} > H\nH > Z Z\nZ > e+ e-\nZ > mu+ mu-",
    "Top pair, decayed": "p p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
    "Colour flow": "colour flow: on\nd dbar > g > t tbar\nt > b W+\ntbar > bbar W-",
    "Gluino pair (SUSY)": "p p > gluino gluino\ngluino > q q neutralino2\nneutralino2 > Z neutralino1",
    "B⁰ → K*⁰ μ⁺μ⁻ penguin": "in: d1 b\nout: d2 s mu1 mu2\nd1 [d] -- [fermion] d2 [d]\ns [\\bar{s}] -- [fermion] l2 -- [fermion] l1 -- [fermion] b [\\bar{b}]\nl1 -- [boson, label=W^-] x -- [boson] l2\nx -- [photon, label={\\gamma, Z^0}] v\nv -- [fermion] mu1 [\\mu^-]\nmu2 [\\mu^+] -- [fermion] v\nhadron: B^0 = d1 b\nhadron: K^{*0} = d2 s",
    "Kinematic view": "view: kinematic\np p > t tbar\nt > b W+(> e+ nu)\ntbar > bbar W-(> q qbar)",
  };
  const SWITCHES = [
    { key: "layout", label: "Engine", options: ["", "grid", "manual", "v1"], names: ["default", "grid", "manual", "v1"] },
    { key: "colour flow", label: "Colour flow", options: ["", "on"], names: ["off", "on"] },
    { key: "colours", label: "Colours", options: ["", "bw"], names: ["colour", "black and white"] },
    { key: "size", label: "Size", options: ["", "small", "large"], names: ["normal", "small", "large"] },
  ];

  // ---- the source: its switch lines, read and written ----------------------------------------
  const switchLine = (key) => new RegExp(`^\\s*${key.replace(/ /g, "\\s+")}\\s*:\\s*(.*)$`, "im");
  const readSwitch = (src, key) => (switchLine(key).exec(src)?.[1] ?? "").trim();
  function writeSwitch(src, key, value) {
    if (switchLine(key).test(src)) return value ? src.replace(switchLine(key), `${key}: ${value}`) : src.replace(switchLine(key), "").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n");
    return value ? `${key}: ${value}\n${src}` : src;
  }
  function writePin(src, id, x, y) {
    const pin = `${id} at (${x}, ${y})`;
    const line = new RegExp(`^\\s*${id.replace(/[^\w']/g, "\\$&")}\\s+at\\s*\\([^)]*\\)\\s*$`, "m");
    return line.test(src) ? src.replace(line, pin) : `${src.replace(/\s*$/, "")}\n${pin}`;
  }
  // the source lines that name a point or a line, to show which wrote a part of the drawing
  function sourceLinesFor(src, ids) {
    const words = ids.map((id) => new RegExp(`(^|[^\\w'])${id.replace(/[^\w']/g, "\\$&")}(?![\\w'])`));
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

  function build(root) {
    root.innerHTML = `
      <div class="pg-stage"><div class="pg-drawing" aria-live="polite"></div><div class="pg-hover"></div></div>
      <div class="pg-bar">
        <label>Example <select class="pg-example"><option value="">choose…</option>${Object.keys(EXAMPLES).map((k) => `<option>${k}</option>`).join("")}</select></label>
        ${SWITCHES.map((s) => `<label>${s.label} <select data-switch="${s.key}">${s.options.map((o, i) => `<option value="${o}">${s.names[i]}</option>`).join("")}</select></label>`).join("")}
        <span class="pg-actions"><button type="button" data-do="share">Share link</button><button type="button" data-do="svg">SVG</button><button type="button" data-do="png">PNG</button><button type="button" data-do="tikz">TikZ</button></span>
      </div>
      <textarea class="pg-source" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="feynjs source"></textarea>
      <div class="pg-status"></div>
      <details class="pg-model"><summary>What a program (or an AI) sees: the diagram as data</summary><pre><code></code></pre></details>
      <details class="pg-tikz" hidden><summary>TikZ-Feynman code</summary><pre><code></code></pre></details>`;
    const drawing = root.querySelector(".pg-drawing"), hover = root.querySelector(".pg-hover");
    const source = root.querySelector(".pg-source"), status = root.querySelector(".pg-status");
    const modelOut = root.querySelector(".pg-model code"), tikz = root.querySelector(".pg-tikz");
    let model = null, timer = 0;

    function draw() {
      const src = source.value;
      for (const sel of root.querySelectorAll("[data-switch]")) sel.value = readSwitch(src, sel.dataset.switch).toLowerCase();
      try {
        drawing.innerHTML = feynjs.render(src, { idPrefix: "pg" });
        status.textContent = ""; status.className = "pg-status";
        const meta = drawing.querySelector("metadata.feynjs-model");
        model = meta ? JSON.parse(meta.textContent) : null;
        modelOut.textContent = model ? JSON.stringify(model, null, 1) : "(this version of feynjs does not write the diagram as data yet)";
        addHandles();
      } catch (e) {
        status.textContent = String(e.message || e); status.className = "pg-status pg-error";
      }
      history.replaceState(null, "", toHash(src));
    }
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 120); };

    // ---- what is under the pointer ----------------------------------------------------------
    function show(target) {
      root.querySelectorAll(".pg-on").forEach((el) => el.classList.remove("pg-on"));
      if (!target) { hover.textContent = ""; return; }
      target.classList.add("pg-on");
      const edge = target.dataset.edge, vertex = target.dataset.vertex;
      const ids = edge ? [target.dataset.from, target.dataset.to] : [vertex];
      const lines = sourceLinesFor(source.value, ids).map((n) => n + 1);
      const what = edge ? `line ${edge}${target.dataset.particle ? ` (${target.dataset.particle})` : ""}` : `point ${vertex}`;
      hover.textContent = `${what}${lines.length ? ` · source line ${lines.join(", ")}` : ""}${vertex ? " · drag to move" : ""}`;
    }
    drawing.addEventListener("pointerover", (e) => show(e.target.closest("[data-edge], .pg-handle")));
    drawing.addEventListener("pointerleave", () => show(null));
    drawing.addEventListener("click", (e) => {
      const hit = e.target.closest("[data-edge], .pg-handle");
      if (!hit) return;
      const ids = hit.dataset.edge ? [hit.dataset.from, hit.dataset.to] : [hit.dataset.vertex];
      const n = sourceLinesFor(source.value, ids)[0];
      if (n === undefined) return;
      const starts = source.value.split("\n").slice(0, n).reduce((s, l) => s + l.length + 1, 0);
      source.focus(); source.setSelectionRange(starts, starts + source.value.split("\n")[n].length);
    });

    // ---- a handle on every point, to drag it ------------------------------------------------
    function addHandles() {
      const svg = drawing.querySelector("svg");
      if (!svg || !model) return;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "pg-handles");
      for (const v of model.vertices) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("class", "pg-handle"); c.setAttribute("cx", v.x); c.setAttribute("cy", v.y); c.setAttribute("r", "7");
        c.dataset.vertex = v.id;
        g.appendChild(c);
      }
      svg.appendChild(g);
    }
    let dragging = null;
    drawing.addEventListener("pointerdown", (e) => {
      const h = e.target.closest(".pg-handle");
      if (!h) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      dragging = { h, svg: h.ownerSVGElement };
    });
    drawing.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const p = dragging.svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(dragging.svg.getScreenCTM().inverse());
      dragging.h.setAttribute("cx", q.x); dragging.h.setAttribute("cy", q.y);
      dragging.at = q;
    });
    drawing.addEventListener("pointerup", () => {
      if (!dragging) return;
      const { h, at } = dragging; dragging = null;
      if (!at || !model) return;
      // (to a tenth of a line's spacing, as a person would write it)
      const r = (n) => Math.round(n * 10) / 10;
      source.value = writePin(source.value, h.dataset.vertex, r(at.x / model.unit.x), r(-at.y / model.unit.y));
      draw();
    });

    // ---- controls -----------------------------------------------------------------------------
    source.addEventListener("input", later);
    root.querySelector(".pg-example").addEventListener("change", (e) => {
      if (!e.target.value) return;
      source.value = EXAMPLES[e.target.value]; e.target.value = ""; tikz.hidden = true; draw();
    });
    root.querySelectorAll("[data-switch]").forEach((sel) => sel.addEventListener("change", () => {
      source.value = writeSwitch(source.value, sel.dataset.switch, sel.value); draw();
    }));
    const save = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    const standalone = () => feynjs.render(source.value, { idPrefix: "pgx", standalone: true });
    root.querySelector(".pg-actions").addEventListener("click", async (e) => {
      const what = e.target.dataset.do;
      if (what === "share") {
        draw();
        try { await navigator.clipboard.writeText(location.href); status.textContent = "Link copied: it holds the source, so the diagram opens as you see it."; }
        catch (err) { status.textContent = location.href; }
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
        catch (err) { status.textContent = String(err.message || err); }
      }
    });

    source.value = fromHash() ?? EXAMPLES["Top pair, decayed"];
    draw();
  }

  const go = () => document.querySelectorAll("[data-feynjs-playground]:not([data-built])").forEach((root) => { root.dataset.built = "1"; build(root); });
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
