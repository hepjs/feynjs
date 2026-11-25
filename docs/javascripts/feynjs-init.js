// Render ```feynman blocks. document$ fires on first load and after every instant navigation.
(function () {
  // the site's name in the header, its two parts coloured apart (theme.css says how)
  var brandName = function () {
    var part = function (cls, text) {
      var span = document.createElement("span");
      span.className = cls;
      span.textContent = text;
      return span;
    };
    document.querySelectorAll(".md-header__topic .md-ellipsis").forEach(function (el) {
      if (el.querySelector(".feynjs-js") || el.textContent.trim() !== "feynjs") return;
      el.textContent = "";
      el.appendChild(part("feynjs-feyn", "feyn"));
      // (the photon between the words, as in the logo)
      var photon = part("feynjs-photon", "");
      photon.setAttribute("aria-hidden", "true");
      el.appendChild(photon);
      el.appendChild(part("feynjs-js", "js"));
    });
  };

  var go = function () {
    brandName();
    // (the home page's tour first, without download buttons; the time-order row with each part
    // tagged by its step, so it can be drawn one step at a time)
    // (the two-engines row keeps its source, to draw it again as it moves between the engines)
    document.querySelectorAll(".feynjs-row--morph div.feynman:not([data-processed])").forEach(function (el) { el.dataset.source = el.textContent; });
    feynjs.run({ querySelector: ".feynjs-row--steps div.feynman:not([data-processed])", levels: true });
    feynjs.run({ querySelector: ".feynjs-row div.feynman:not([data-processed])" });
    stepByStep();
    twoEngines();
    water();
    // (the tour's small figures without download buttons)
    feynjs.run({ querySelector: ".feynjs-tour div.feynman:not([data-processed])" });
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true });
    explain();
  };
  // the time-order row plays: each step of the diagram appears in turn, and as a vertex is
  // reached it punches and sends out a ripple, as the logo's vertices do. It plays when the row
  // comes into view, and again when the pointer moves onto it.
  var NS = "http://www.w3.org/2000/svg";
  var stepByStep = function () {
    document.querySelectorAll(".feynjs-row--steps svg.feynjs:not([data-steps])").forEach(function (svg) {
      svg.setAttribute("data-steps", "");
      var meta = svg.querySelector("metadata.feynjs-model");
      if (!meta) return;
      var model = JSON.parse(meta.textContent), stepOf = {};
      svg.querySelectorAll("[data-level]").forEach(function (part) {
        var step = Number(part.getAttribute("data-level"));
        part.style.setProperty("--step", step);
        // (a point is reached at the step of the first line to arrive at it)
        var edge = part.querySelector("[data-edge]");
        if (!edge) return;
        [edge.getAttribute("data-from"), edge.getAttribute("data-to")].forEach(function (id) {
          if (id && (stepOf[id] === undefined || step < stepOf[id])) stepOf[id] = step;
        });
      });
      var layer = document.createElementNS(NS, "g");
      layer.setAttribute("class", "feynjs-step-marks");
      layer.setAttribute("aria-hidden", "true");
      model.vertices.forEach(function (v) {
        if (v.role === "in" || v.role === "out" || stepOf[v.id] === undefined) return;
        var mark = function (cls, k) {
          var c = document.createElementNS(NS, "circle");
          c.setAttribute("cx", v.x); c.setAttribute("cy", v.y); c.setAttribute("r", cls === "feynjs-step-punch" ? 3.2 : 4);
          c.setAttribute("class", cls);
          c.style.setProperty("--step", stepOf[v.id]); c.style.setProperty("--k", k);
          layer.appendChild(c);
        };
        mark("feynjs-step-ripple", 0); mark("feynjs-step-ripple", 1); mark("feynjs-step-punch", 0);
      });
      svg.appendChild(layer);
      var play = function () { svg.classList.remove("feynjs-play"); void svg.getBoundingClientRect(); svg.classList.add("feynjs-play"); };
      var row = svg.closest(".feynjs-row");
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (seen, watcher) {
          if (seen[0].isIntersecting) { play(); watcher.disconnect(); }
        }, { threshold: 0.5 }).observe(svg);
      } else play();
      if (row) row.addEventListener("mouseenter", play);
    });
  };
  // the two-engines row: the same diagram moves between the force layout and the grid. Each frame
  // is drawn by feynjs, every point pinned (at (x, y)) part way between where the two engines put
  // it, so the lines re-fit their waves and arrows as they go. The points move in time order, left
  // to right, each a little after the one before, and snap into place with a small overshoot; the
  // grid draws in as they arrive and fades as they leave. It plays back and forth while the row is
  // in view, a label over it saying which engine is showing.
  var twoEngines = function () {
    document.querySelectorAll(".feynjs-row--morph div.feynman[data-source]:not([data-morph])").forEach(function (box) {
      box.setAttribute("data-morph", "");
      var source = box.dataset.source.trim();
      var model = function (svg) {
        var m = /<metadata class="feynjs-model">([\s\S]*?)<\/metadata>/.exec(svg);
        var text = document.createElement("textarea"); text.innerHTML = m[1];
        return JSON.parse(text.value);
      };
      var ends = [feynjs.render(source, { idPrefix: "morph0" }), feynjs.render("layout: grid\n" + source, { idPrefix: "morph1" })];
      var at = ends.map(function (svg) { return model(svg).vertices.map(function (v) { return { id: v.id, at: v.at }; }); });
      // (one frame for both ends and everything between, so the drawing keeps its scale as it moves)
      var boxes = ends.map(function (svg) { return /viewBox="([^"]+)"/.exec(svg)[1].split(/\s+/).map(Number); });
      var x0 = Math.min(boxes[0][0], boxes[1][0]), y0 = Math.min(boxes[0][1], boxes[1][1]);
      var x1 = Math.max(boxes[0][0] + boxes[0][2], boxes[1][0] + boxes[1][2]), y1 = Math.max(boxes[0][1] + boxes[0][3], boxes[1][1] + boxes[1][3]);
      // (with room round it, so nothing on its way between the two is cut off)
      var padX = (x1 - x0) * 0.06, padY = (y1 - y0) * 0.08;
      var frame = (x0 - padX).toFixed(2) + " " + (y0 - padY).toFixed(2) + " " + (x1 - x0 + 2 * padX).toFixed(2) + " " + (y1 - y0 + 2 * padY).toFixed(2);
      // (each end's labels, to show as it arrives: placed once, where they will stay)
      var labelsOf = function (svg) { var m = /<g class="feynjs-labels">[\s\S]*<\/g><\/svg>\s*$/.exec(svg); return m ? m[0].replace(/<\/svg>\s*$/, "") : ""; };
      var endLabels = ends.map(labelsOf);
      // (the grid the grid engine draws behind its diagram, to draw in part way)
      var gridLines = (/<path class="feynjs-grid"[^>]*\/>/.exec(ends[1]) || [""])[0];
      var show = function (svg, grid, gridShown, labels) {
        // (the same frame and no size of its own: the box sizes it, the same every frame)
        var drawn = svg.replace(/<svg ([^>]*?)viewBox="[^"]+"([^>]*?) width="[^"]*" height="[^"]*"/, '<svg $1viewBox="' + frame + '"$2');
        if (gridShown && gridLines) drawn = drawn.replace(/(<g class="feynjs-edges")/, gridLines.replace("<path ", '<path opacity="' + gridShown.toFixed(3) + '" ') + "$1");
        // (on the way between, labels would hop from side to side as feynjs places them afresh each
        // frame: they fade out as the points set off, and the arriving end's own fade in)
        if (labels) {
          var own = labelsOf(drawn), shown = labels.from > 0 ? own.replace('<g class="feynjs-labels">', '<g class="feynjs-labels" opacity="' + labels.from.toFixed(3) + '">') : "";
          var arriving = labels.to > 0 ? endLabels[labels.end].replace('<g class="feynjs-labels">', '<g class="feynjs-labels" opacity="' + labels.to.toFixed(3) + '">') : "";
          drawn = drawn.replace(own, shown + arriving);
        }
        box.innerHTML = drawn;
        box.classList.toggle("feynjs-on-grid", !!grid);
      };
      // (each point's turn: by how far along it lies, left to right, the collision first)
      var xs = at[0].map(function (v) { return v.at[0]; });
      var left = Math.min.apply(null, xs), across = (Math.max.apply(null, xs) - left) || 1;
      var SWEEP = 0.55, EACH = 0.9, LENGTH = SWEEP + EACH;
      var turn = at[0].map(function (v) { return (SWEEP * (v.at[0] - left)) / across; });
      // (a snap: past the mark a little, then back)
      var snap = function (u) { var c = 1.4; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
      var between = function (seconds, from) {
        var pins = at[0].map(function (v, k) {
          var a = at[from][k].at, b = at[1 - from][k].at;
          var u = Math.max(0, Math.min(1, (seconds - turn[k]) / EACH)), e = u === 0 ? 0 : snap(u);
          return v.id + " at (" + (a[0] + (b[0] - a[0]) * e).toFixed(3) + ", " + (a[1] + (b[1] - a[1]) * e).toFixed(3) + ")";
        });
        return feynjs.render("layout: manual\n" + source + "\n" + pins.join("\n"), { idPrefix: "morph" });
      };
      var state = 0, running = null, timer = null;
      var label = document.createElement("div");
      label.className = "feynjs-engine-label";
      label.setAttribute("aria-hidden", "true");
      label.innerHTML = '<span data-to="0" class="feynjs-on">Forces</span><span data-to="1">Grid</span>';
      box.parentElement.insertBefore(label, box);
      // (the source beside it follows: its layout: grid line there on the grid, faded out on forces)
      var code = box.closest(".feynjs-row") && box.closest(".feynjs-row").querySelector(".feynjs-row-text pre code");
      var gridLine = null;
      if (code) {
        var escape = function (text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
        // (the switch line a block of its own, a highlighted band, so no line break after it)
        code.innerHTML = code.textContent.replace(/\n$/, "").split("\n").map(function (line) {
          return /^\s*layout:\s*grid\s*$/.test(line) ? '<span class="feynjs-switch-line">' + escape(line) + "</span>" : escape(line) + "\n";
        }).join("").replace(/\n$/, "");
        gridLine = code.querySelector(".feynjs-switch-line");
      }
      var mark = function (to) {
        label.querySelectorAll("span").forEach(function (b) { b.classList.toggle("feynjs-on", Number(b.dataset.to) === to); });
        if (gridLine) gridLine.classList.toggle("feynjs-on", to === 1);
      };
      mark(0);
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var go = function (to, then) {
        if (to === state || running) return;
        mark(to);
        if (still) { state = to; show(ends[to], to === 1); if (then) then(); return; }
        var from = state, start = performance.now();
        running = true;
        var step = function (now) {
          var seconds = (now - start) / 1000, t = Math.min(1, seconds / LENGTH);
          // (the grid draws in over the second half on the way there, fades over the first half back)
          var gridShown = to === 1 ? Math.max(0, (t - 0.45) / 0.55) : Math.max(0, 1 - t / 0.5);
          var labels = { from: Math.max(0, 1 - t / 0.18), to: Math.max(0, (t - 0.78) / 0.22), end: to };
          if (t < 1) { show(between(seconds, from), false, gridShown, labels); requestAnimationFrame(step); }
          else { state = to; running = null; show(ends[to], to === 1); if (then) then(); }
        };
        requestAnimationFrame(step);
      };
      var loop = function () { timer = setTimeout(function () { go(1 - state, loop); }, 2200); };
      show(ends[0], false);
      if (!still && "IntersectionObserver" in window) {
        new IntersectionObserver(function (seen) {
          if (seen[0].isIntersecting) { if (!timer && !running) loop(); }
          else { clearTimeout(timer); timer = null; }
        }, { threshold: 0.5 }).observe(box);
      }
    });
  };
  // the home page's banner: rings from the js, one every few seconds, growing slowly and evenly
  // outward and fading, so a few are always on their way, evenly spaced. Paused while the banner is
  // out of view or the page is hidden; still for readers who ask for less motion.
  var water = function () {
    document.querySelectorAll(".feynjs-splash:not([data-water])").forEach(function (splash) {
      splash.setAttribute("data-water", "");
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var source = splash.querySelector(".feynjs-splash-ripples");
      if (!source) return;
      var layer = document.createElement("div");
      layer.className = "feynjs-water";
      layer.setAttribute("aria-hidden", "true");
      splash.insertBefore(layer, splash.firstChild);
      var EVERY = 0.9, SECONDS = 18;
      var ring = function () {
        var b = splash.getBoundingClientRect(), s = source.getBoundingClientRect();
        var r = document.createElement("span");
        r.className = "feynjs-water-ring";
        r.style.left = (s.left - b.left) + "px"; r.style.top = (s.top - b.top) + "px";
        r.style.setProperty("--to", (Math.max(b.width, b.height) * 2.2) + "px");
        r.style.animationDuration = SECONDS + "s";
        r.addEventListener("animationend", function () { r.remove(); });
        layer.appendChild(r);
      };
      var timer = null;
      var start = function () { if (timer) return; ring(); timer = setInterval(ring, EVERY * 1000); };
      var stop = function () { clearInterval(timer); timer = null; };
      splash.classList.add("feynjs-water-on");
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (seen) { if (seen[0].isIntersecting && !document.hidden) start(); else stop(); }, { threshold: 0.1 }).observe(splash);
      } else start();
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (splash.isConnected) start(); });
    });
  };
  // a worked diagram explained line by line (.feynjs-explain: a diagram, then its source with a
  // note after each line's %). The note sits beside its line; pointing at a line (or tapping it)
  // pulses the parts of the diagram it draws and dims the rest. When the block first comes into
  // view it plays through its lines once. The % stays in the code, so a copy is still valid source.
  var partsOf = function (svg, src) {
    var s = src.replace(/\[[^\]]*\]/g, " ").trim();
    var edgesAt = function (id) { return Array.prototype.slice.call(svg.querySelectorAll('[data-edge][data-from="' + id + '"], [data-edge][data-to="' + id + '"]')); };
    var m = /^(in|out)\s*:\s*(.*)$/.exec(s);
    if (m) return m[2].split(/\s+/).filter(Boolean).reduce(function (all, id) { return all.concat(edgesAt(id)); }, []);
    if (s.indexOf("--") >= 0) {
      var ids = s.split("--").map(function (t) { return t.trim().split(/\s+/)[0]; });
      var found = [];
      for (var i = 0; i + 1 < ids.length; i++) {
        var a = ids[i], b = ids[i + 1];
        found = found.concat(Array.prototype.slice.call(svg.querySelectorAll('[data-edge="' + a + "--" + b + '"], [data-edge="' + b + "--" + a + '"]')));
      }
      return found;
    }
    var v = /^([A-Za-z_][\w']*)$/.exec(s);
    if (v) return Array.prototype.slice.call(svg.querySelectorAll('[data-vertex="' + v[1] + '"]')).concat(edgesAt(v[1]));
    return null;  // (a process line or a switch: it shapes the whole diagram)
  };
  // name tags for a worked diagram's points (.feynjs-explain data-points="i1 i2 a b f1 f2"): each
  // point's name with a curved arrow to it, shown while a line of source that names the point is
  // lit; a point inside the diagram also gets a vertex dot, always shown. Drawn over the
  // diagram, not part of its source.
  var idsOf = function (src) {
    var s = src.replace(/\[[^\]]*\]/g, " ").trim();
    var m = /^(in|out)\s*:\s*(.*)$/.exec(s);
    if (m) return m[2].split(/\s+/).filter(Boolean);
    if (s.indexOf("--") >= 0) return s.split("--").map(function (t) { return t.trim().split(/\s+/)[0]; });
    var v = /^([A-Za-z_][\w']*)$/.exec(s);
    return v ? [v[1]] : [];
  };
  var teach = function (svg, names) {
    var meta = svg.querySelector("metadata.feynjs-model");
    if (!meta) return;
    var model = JSON.parse(meta.textContent), vb = svg.viewBox.baseVal;
    var all = model.vertices, cx = 0, cy = 0;
    all.forEach(function (w) { cx += w.x / all.length; cy += w.y / all.length; });
    var make = function (tag, attrs) {
      var el = document.createElementNS(NS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };
    var layer = make("g", { "class": "feynjs-teach", "aria-hidden": "true" });
    var x0 = vb.x, y0 = vb.y, x1 = vb.x + vb.width, y1 = vb.y + vb.height;
    var f = function (n) { return Math.round(n * 100) / 100; };
    names.forEach(function (id) {
      var v = all.filter(function (w) { return w.id === id; })[0];
      if (!v) return;
      var outer = v.role === "in" || v.role === "out";
      var dx = outer ? v.x - cx : 0, dy = outer ? v.y - cy : 1, n = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= n; dy /= n;
      var px = -dy, py = dx;
      if (!outer) layer.appendChild(make("circle", { "class": "feynjs-teach-dot", cx: v.x, cy: v.y, r: 2.2 }));
      var sx = v.x + dx * 19, sy = v.y + dy * 19, tx = v.x + dx * 4.5, ty = v.y + dy * 4.5;
      var qx = (sx + tx) / 2 + px * 6, qy = (sy + ty) / 2 + py * 6;
      var ux = tx - qx, uy = ty - qy, un = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= un; uy /= un;
      var head = function (turn) {
        var c = Math.cos(turn), s2 = Math.sin(turn);
        return [tx - 4 * (ux * c - uy * s2), ty - 4 * (ux * s2 + uy * c)];
      };
      var h1 = head(0.5), h2 = head(-0.5);
      var g = make("g", { "class": "feynjs-teach-tag", "data-teach": id });
      g.appendChild(make("path", { d: "M" + f(sx) + " " + f(sy) + "Q" + f(qx) + " " + f(qy) + " " + f(tx) + " " + f(ty) + "M" + f(h1[0]) + " " + f(h1[1]) + "L" + f(tx) + " " + f(ty) + "L" + f(h2[0]) + " " + f(h2[1]) }));
      var lx = v.x + dx * 26, ly = v.y + dy * 26 + 3;
      var t = make("text", { x: f(lx), y: f(ly), "text-anchor": "middle" });
      t.textContent = id;
      g.appendChild(t);
      layer.appendChild(g);
      var w = id.length * 3 + 3;
      x0 = Math.min(x0, lx - w); x1 = Math.max(x1, lx + w); y0 = Math.min(y0, ly - 9); y1 = Math.max(y1, ly + 3);
    });
    var scale = parseFloat(svg.getAttribute("height")) / vb.height;
    if (x0 < vb.x || y0 < vb.y || x1 > vb.x + vb.width || y1 > vb.y + vb.height) {
      svg.setAttribute("viewBox", [x0, y0, x1 - x0, y1 - y0].map(f).join(" "));
      svg.setAttribute("width", f((x1 - x0) * scale));
      svg.setAttribute("height", f((y1 - y0) * scale));
    }
    svg.appendChild(layer);
  };
  var explain = function () {
    document.querySelectorAll(".feynjs-explain:not([data-explained])").forEach(function (box) {
      var svg = box.querySelector("svg.feynjs"), code = box.querySelector("pre code");
      if (!svg || !code) return;
      box.setAttribute("data-explained", "");
      var names = (box.getAttribute("data-points") || "").split(/\s+/).filter(Boolean);
      if (names.length) teach(svg, names);
      var lit = [], steps = [];
      var clear = function () {
        lit.forEach(function (el) { el.classList.remove("feynjs-lit"); });
        lit = [];
        svg.classList.remove("feynjs-lit-all");
        box.classList.remove("feynjs-explaining");
        code.querySelectorAll(".feynjs-line-on").forEach(function (l) { l.classList.remove("feynjs-line-on"); });
      };
      Array.prototype.forEach.call(code.querySelectorAll(':scope > span[id^="__span"]'), function (line) {
        var anchor = line.querySelector("a");
        var text = line.textContent.replace(/\n$/, "");
        var cut = text.indexOf("%");
        var src = cut < 0 ? text : text.slice(0, cut), note = cut < 0 ? "" : text.slice(cut + 1).trim();
        if (!note) return;
        line.textContent = "";
        if (anchor) line.appendChild(anchor);
        var code_ = document.createElement("span");
        code_.className = "feynjs-src";
        code_.textContent = src.replace(/\s+$/, "");
        line.appendChild(code_);
        var chip = document.createElement("span");
        chip.className = "feynjs-note";
        var mark = document.createElement("span");
        mark.className = "feynjs-note-mark";
        mark.textContent = "  % ";
        chip.appendChild(mark);
        chip.appendChild(document.createTextNode(note));
        line.appendChild(chip);
        line.appendChild(document.createTextNode("\n"));
        line.classList.add("feynjs-line");
        var parts = partsOf(svg, src), ids = idsOf(src);
        var on = function () {
          clear();
          ids.forEach(function (id) {
            Array.prototype.forEach.call(svg.querySelectorAll('.feynjs-teach-tag[data-teach="' + id + '"]'), function (el) { el.classList.add("feynjs-lit"); lit.push(el); });
          });
          box.classList.add("feynjs-explaining");
          line.classList.add("feynjs-line-on");
          if (parts === null || !parts.length) svg.classList.add("feynjs-lit-all");
          else parts.forEach(function (el) { el.classList.add("feynjs-lit"); lit.push(el); });
        };
        steps.push(on);
        line.addEventListener("mouseenter", function () { box.dataset.touched = "1"; on(); });
        line.addEventListener("mouseleave", clear);
        line.addEventListener("click", function () { box.dataset.touched = "1"; on(); });
      });
      // (the notes in one column, just past the longest line of source)
      var widest = 0;
      code.querySelectorAll(".feynjs-src").forEach(function (el) { widest = Math.max(widest, el.textContent.length); });
      code.querySelectorAll(".feynjs-src").forEach(function (el) { el.style.minWidth = (widest + 3) + "ch"; });
      if (!steps.length || !("IntersectionObserver" in window)) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var seen = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        seen.disconnect();
        var k = 0;
        var next = function () {
          if (box.dataset.touched) return;
          if (k >= steps.length) { clear(); return; }
          steps[k++]();
          setTimeout(next, 1400);
        };
        setTimeout(next, 500);
      }, { threshold: 0.6 });
      seen.observe(box);
    });
  };
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
