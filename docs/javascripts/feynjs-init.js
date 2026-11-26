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
    document.querySelectorAll(".feynjs-row--morph div.feynman:not([data-processed]), .feynjs-layouts div.feynman:not([data-processed])").forEach(function (el) { el.dataset.source = el.textContent; });
    feynjs.run({ querySelector: ".feynjs-row--steps div.feynman:not([data-processed])", levels: true, model: true });
    feynjs.run({ querySelector: ".feynjs-row div.feynman:not([data-processed])" });
    stepByStep();
    twoEngines();
    water();
    // (the tour's small figures without download buttons)
    feynjs.run({ querySelector: ".feynjs-tour div.feynman:not([data-processed])", model: true });
    feynjs.run({ querySelector: ".feynjs-layouts div.feynman:not([data-processed])" });
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true, model: true });
    explain();
    layouts();
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
      var ends = [feynjs.render(source, { idPrefix: "morph0", model: true }), feynjs.render("layout: grid\n" + source, { idPrefix: "morph1", model: true })];
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
        return feynjs.render("layout: manual\n" + source + "\n" + pins.join("\n"), { idPrefix: "morph", model: true });
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
  // the home page's banner: rings from the js, the first few close together, then fewer, growing
  // slowly and evenly outward; each fades as it nears the banner's far corner and is dropped there,
  // so only the handful still in sight are ever drawn. Paused while the banner is out of view or
  // the page is hidden; still for readers who ask for less motion.
  // (All the rings are drawn on one canvas, the size of the banner: one small bitmap however many
  // rings are out, and nothing for the page to lay out again each frame. Where each ring is comes
  // from the clock alone, so a pause picks up just where it left off. The rings start once the
  // page's own diagrams are drawn, so the first seconds are not spent waiting on them.)
  var water = function () {
    document.querySelectorAll(".feynjs-splash:not([data-water])").forEach(function (splash) {
      splash.setAttribute("data-water", "");
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var source = splash.querySelector(".feynjs-splash-ripples");
      if (!source || !window.requestAnimationFrame) return;
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext && canvas.getContext("2d");
      if (!ctx) return;
      var layer = document.createElement("div");
      layer.className = "feynjs-water";
      layer.setAttribute("aria-hidden", "true");
      layer.appendChild(canvas);
      splash.insertBefore(layer, splash.firstChild);
      // (the first FIRST rings EVERY seconds apart, then each gap SLOWER seconds longer, up to LATEST;
      // a ring takes SECONDS to reach the banner's far corner, fading over the last FADE of the way)
      var EVERY = 0.9, FIRST = 3, SLOWER = 0.6, LATEST = 3.2, SECONDS = 14, FADE = 0.45;
      var FROM = 0.3 * 16, OPACITY = 0.35, LINE = 1.25;
      var w = 0, h = 0, cx = 0, cy = 0, dpr = 1, reach = 1, colour = "#c0392b";
      // (the banner's size and where the js is in it; the canvas is sized again only when its size
      // in pixels changes, since sizing it clears it)
      var measure = function () {
        var b = splash.getBoundingClientRect(), s = source.getBoundingClientRect();
        w = b.width; h = b.height; cx = s.left - b.left; cy = s.top - b.top;
        reach = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy), 1);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var pw = Math.round(w * dpr), ph = Math.round(h * dpr);
        if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      };
      var tint = function () { colour = getComputedStyle(layer).color || colour; };
      // (when the k-th ring is born, from the clock's start: a fixed schedule, so the clock alone
      // says which rings are out)
      var born = [0];
      var birth = function (k) {
        while (born.length <= k) {
          var n = born.length, gap = n < FIRST ? EVERY : Math.min(EVERY + SLOWER * (n - FIRST + 1), LATEST);
          born.push(born[n - 1] + gap);
        }
        return born[k];
      };
      var oldest = 0, clock = 0, last = 0, frame = 0, running = false;
      var draw = function (now) {
        frame = 0;
        if (!running) return;
        clock += Math.min((now - (last || now)) / 1000, 0.25); last = now;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = colour; ctx.lineWidth = LINE;
        // (a ring past the far corner is out of sight for good: dropped, never looked at again)
        while (clock - birth(oldest) >= SECONDS) oldest++;
        for (var k = oldest; birth(k) <= clock; k++) {
          var age = (clock - birth(k)) / SECONDS;
          var r = FROM / 2 + (reach - FROM / 2) * age - LINE / 2;
          if (r <= 0) continue;
          var fade = age < 1 - FADE ? 1 : (1 - age) / FADE;
          ctx.globalAlpha = OPACITY * fade * fade;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
        }
        frame = requestAnimationFrame(draw);
      };
      var start = function () {
        if (running || !ready) return;
        running = true; last = 0; tint();
        if (!frame) frame = requestAnimationFrame(draw);
      };
      // (the rings wait until the page's diagrams are drawn: the main thread is free then)
      var ready = false;
      var whenFree = window.requestIdleCallback ? window.requestIdleCallback.bind(window) : function (f) { return setTimeout(f, 400); };
      whenFree(function () { ready = true; if (!document.hidden && inView) start(); }, { timeout: 1500 });
      var stop = function () { running = false; if (frame) cancelAnimationFrame(frame); frame = 0; };
      measure();
      if ("ResizeObserver" in window) {
        var resized = new ResizeObserver(measure);
        resized.observe(splash); resized.observe(source.parentNode);
      } else window.addEventListener("resize", measure);
      // (the colour follows the light and dark schemes)
      new MutationObserver(tint).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
      splash.classList.add("feynjs-water-on");
      // (the page's own rings, there for readers without the js, are taken out: they grow by their
      // width and height, which lays the page out again every frame)
      source.querySelectorAll("span").forEach(function (ring) { ring.remove(); });
      var inView = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (seen) { inView = seen[0].isIntersecting; if (inView && !document.hidden) start(); else stop(); }, { threshold: 0.1 }).observe(splash);
      } else start();
      document.addEventListener("visibilitychange", function () { if (document.hidden || !splash.isConnected) stop(); else start(); });
    });
  };
  // A worked diagram explained line by line (.feynjs-explain: a diagram, then its source with a
  // note after each line's %). The note sits beside its line (under it on a narrow screen).
  // Pointing at a line, tapping it, or moving to it with the keyboard lights what it draws, in
  // three steady colours: lines blue, points amber, labels teal; the rest dims. A process line
  // (e- e+ > gamma > mu- mu+) lights its stages in turn. Each block steps slowly through its lines
  // over and over while in view, the text beside the diagram changing with it: pointing, a click
  // or a key only pauses it, and it carries on a little after. The % stays in the code, so a copy is
  // still valid source.
  var idsOf = function (src) {
    var s = src.replace(/\[[^\]]*\]/g, " ").trim();
    var m = /^(in|out)\s*:\s*(.*)$/.exec(s);
    if (m) return m[2].split(/\s+/).filter(Boolean);
    if (s.indexOf("--") >= 0) return s.split("--").map(function (t) { return t.trim().split(/\s+/)[0]; });
    var v = /^([A-Za-z_][\w']*)$/.exec(s);
    return v ? [v[1]] : [];
  };
  var all = function (root, selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); };
  var edgesOf = function (svg, src) {
    var s = src.replace(/\[[^\]]*\]/g, " ").trim();
    var at = function (id) { return all(svg, '[data-edge][data-from="' + id + '"], [data-edge][data-to="' + id + '"]'); };
    var m = /^(in|out)\s*:\s*(.*)$/.exec(s);
    if (m) return m[2].split(/\s+/).filter(Boolean).reduce(function (found, id) { return found.concat(at(id)); }, []);
    if (s.indexOf("--") >= 0) {
      var ids = idsOf(src), found = [];
      for (var i = 0; i + 1 < ids.length; i++) found = found.concat(all(svg, '[data-edge="' + ids[i] + "--" + ids[i + 1] + '"], [data-edge="' + ids[i + 1] + "--" + ids[i] + '"]'));
      return found;
    }
    var v = /^([A-Za-z_][\w']*)$/.exec(s);
    return v ? at(v[1]) : null;
  };
  // (a simple process line, a > b > c, as its stages: the particles named at each step)
  var stagesOf = function (src) {
    if (/[,()]/.test(src) || src.indexOf(">") < 0 || src.indexOf("--") >= 0 || src.indexOf(":") >= 0) return null;
    return src.split(">").map(function (part) { return part.trim().split(/\s+/).filter(Boolean); });
  };
  // (each label to the line it names: the nearest, measured on the page)
  var pairLabels = function (svg) {
    var edges = all(svg, "[data-edge]").map(function (g) {
      var path = g.querySelector("path"), pts = [];
      if (!path || !path.getTotalLength) return { g: g, pts: pts };
      var length = path.getTotalLength(), ctm = path.getScreenCTM();
      for (var k = 0; k <= 12; k++) {
        var p = path.getPointAtLength((length * k) / 12);
        var q = ctm ? new DOMPoint(p.x, p.y).matrixTransform(ctm) : p;
        pts.push(q);
      }
      return { g: g, pts: pts };
    });
    all(svg, ".feynjs-labels > g").forEach(function (label) {
      var r = label.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, best = null, near = Infinity;
      edges.forEach(function (e) {
        e.pts.forEach(function (p) { var d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < near) { near = d; best = e.g; } });
      });
      if (best) { best.feynjsLabels = (best.feynjsLabels || []).concat([label]); }
    });
  };
  // name tags for a worked diagram's points (data-points="i1 i2 a b f1 f2"): each point's name with
  // a curved arrow to it, shown while a line naming the point is lit (always, with
  // data-names="rest", while nothing is lit); a point inside the diagram also gets a vertex dot,
  // and a leg's end one while it is lit.
  // Drawn over the diagram, not part of its source.
  var teach = function (svg, names) {
    var meta = svg.querySelector("metadata.feynjs-model");
    if (!meta) return;
    var model = JSON.parse(meta.textContent), vb = svg.viewBox.baseVal;
    var points = model.vertices, cx = 0, cy = 0;
    points.forEach(function (w) { cx += w.x / points.length; cy += w.y / points.length; });
    var make = function (tag, attrs) {
      var el = document.createElementNS(NS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };
    var layer = make("g", { "class": "feynjs-teach", "aria-hidden": "true" });
    var x0 = vb.x, y0 = vb.y, x1 = vb.x + vb.width, y1 = vb.y + vb.height;
    var f = function (n) { return Math.round(n * 100) / 100; };
    names.forEach(function (id) {
      var v = points.filter(function (w) { return w.id === id; })[0];
      if (!v) return;
      var outer = v.role === "in" || v.role === "out";
      var dx = outer ? v.x - cx : 0, dy = outer ? v.y - cy : 1, n = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= n; dy /= n;
      var px = -dy, py = dx;
      var g = make("g", { "class": "feynjs-teach-tag", "data-teach": id });
      // (a vertex dot at the point: always inside the diagram, at a leg's end only while it is lit)
      layer.appendChild(make("circle", { "class": "feynjs-teach-dot" + (outer ? " feynjs-teach-dot--end" : ""), "data-teach": id, cx: v.x, cy: v.y, r: 2.2 }));
      var sx = v.x + dx * 19, sy = v.y + dy * 19, tx = v.x + dx * 4.5, ty = v.y + dy * 4.5;
      var qx = (sx + tx) / 2 + px * 6, qy = (sy + ty) / 2 + py * 6;
      var ux = tx - qx, uy = ty - qy, un = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= un; uy /= un;
      var head = function (turn) {
        var c = Math.cos(turn), s = Math.sin(turn);
        return [tx - 4 * (ux * c - uy * s), ty - 4 * (ux * s + uy * c)];
      };
      var h1 = head(0.5), h2 = head(-0.5);
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
      if (box.dataset.names === "rest") box.classList.add("feynjs-names-rest");
      var names = (box.getAttribute("data-points") || "").split(/\s+/).filter(Boolean);
      if (names.length) teach(svg, names);
      pairLabels(svg);
      var lit = [], stageTimer = null, current = -1, lines = [], playing = null, counter = null;
      var light = function (el, cls) { el.classList.add(cls); lit.push([el, cls]); };
      var live = document.createElement("p");
      live.className = "feynjs-explain-says";
      live.setAttribute("aria-live", "polite");
      var said = document.createElement("code");
      said.className = "feynjs-explain-line";
      var sentence = function (note) { note = note.charAt(0).toUpperCase() + note.slice(1); return /[.!?…]$/.test(note) ? note : note + "."; };
      var rest = function () { said.textContent = " "; said.style.visibility = "hidden"; live.textContent = box.dataset.says || ""; };
      var clear = function () {
        lit.forEach(function (p) { p[0].classList.remove(p[1]); });
        lit = [];
        clearInterval(stageTimer); stageTimer = null;
        box.classList.remove("feynjs-explaining");
        lines.forEach(function (l) { l.el.classList.remove("feynjs-line-on"); });
        current = -1;
        rest();
        if (counter) Array.prototype.forEach.call(counter.children, function (d) { d.classList.remove("feynjs-on"); });
      };
      var lightEdges = function (edges) {
        edges.forEach(function (e) {
          light(e, "feynjs-lit-line");
          (e.feynjsLabels || []).forEach(function (l) { light(l, "feynjs-lit-label"); });
        });
      };
      var show = function (k) {
        clear();
        var line = lines[k];
        if (!line) return;
        current = k;
        box.classList.add("feynjs-explaining");
        line.el.classList.add("feynjs-line-on");
        if (counter) Array.prototype.forEach.call(counter.children, function (d, j) { d.classList.toggle("feynjs-on", j === k); });
        live.textContent = sentence(line.note);
        said.textContent = line.src;
        said.style.visibility = "visible";
        line.ids.forEach(function (id) {
          all(svg, '[data-vertex="' + id + '"], .feynjs-teach-tag[data-teach="' + id + '"], .feynjs-teach-dot[data-teach="' + id + '"]').forEach(function (el) { light(el, "feynjs-lit-point"); });
        });
        if (line.stages) {
          var s = 0;
          var stage = function () {
            lit.filter(function (p) { return p[1] === "feynjs-lit-line" || p[1] === "feynjs-lit-label"; }).forEach(function (p) { p[0].classList.remove(p[1]); });
            lit = lit.filter(function (p) { return p[1] !== "feynjs-lit-line" && p[1] !== "feynjs-lit-label"; });
            var names = line.stages[s % line.stages.length];
            lightEdges(all(svg, "[data-edge]").filter(function (e) { return names.indexOf(e.getAttribute("data-particle")) >= 0; }));
            s++;
          };
          stage();
          stageTimer = setInterval(stage, 1000);
        } else if (line.edges === null || !line.edges.length) lightEdges(all(svg, "[data-edge]"));
        else lightEdges(line.edges);
      };
      all(code, ':scope > span[id^="__span"]').forEach(function (el) {
        var anchor = el.querySelector("a");
        var text = el.textContent.replace(/\n$/, "");
        var cut = text.indexOf("%");
        var src = cut < 0 ? text : text.slice(0, cut), note = cut < 0 ? "" : text.slice(cut + 1).trim();
        if (!note) return;
        el.textContent = "";
        if (anchor) el.appendChild(anchor);
        var srcEl = document.createElement("span");
        srcEl.className = "feynjs-src";
        srcEl.textContent = src.replace(/\s+$/, "");
        el.appendChild(srcEl);
        var chip = document.createElement("span");
        chip.className = "feynjs-note";
        var mark = document.createElement("span");
        mark.className = "feynjs-note-mark";
        mark.textContent = "  % ";
        chip.appendChild(mark);
        chip.appendChild(document.createTextNode(note));
        el.appendChild(chip);
        el.appendChild(document.createTextNode("\n"));
        el.classList.add("feynjs-line");
        el.setAttribute("tabindex", "0");
        var k = lines.length;
        lines.push({ el: el, note: note, src: src.trim(), ids: idsOf(src), edges: edgesOf(svg, src), stages: stagesOf(src.trim()) });
        el.addEventListener("mouseenter", function () { stop(); show(k); });
        el.addEventListener("click", function () { stop(); show(k); later(); });
        el.addEventListener("focus", function () { stop(); show(k); });
        el.addEventListener("blur", function () { later(); });
        el.addEventListener("keydown", function (e) {
          var to = e.key === "ArrowDown" ? k + 1 : e.key === "ArrowUp" ? k - 1 : -1;
          if (to >= 0 && to < lines.length) { e.preventDefault(); lines[to].el.focus(); }
        });
      });
      if (!lines.length) return;
      rest();
      // (the notes in one column, just past the longest line of source)
      var widest = 0;
      all(code, ".feynjs-src").forEach(function (el) { widest = Math.max(widest, el.textContent.length); });
      all(code, ".feynjs-src").forEach(function (el) { el.style.setProperty("--feynjs-src-width", (widest + 3) + "ch"); });
      var stop = function () { clearTimeout(playing); playing = null; };
      // (slowly through every line, then the summary a while, then round again, while in view;
      // whatever the reader does only pauses it: it carries on from the next line a little after)
      var STEP = 3000, REST = 2500, PAUSE = 5000, inView = false;
      var later = function () {
        stop();
        if (!inView || still) return;
        playing = setTimeout(function () { run(current < 0 ? 0 : current + 1); }, PAUSE);
      };
      var run = function (k) {
        stop();
        if (!inView) return;
        if (k >= lines.length) { clear(); playing = setTimeout(function () { run(0); }, REST); return; }
        show(k);
        playing = setTimeout(function () { run(k + 1); }, lines[k].stages ? Math.max(STEP, 1000 * lines[k].stages.length + 800) : STEP);
      };
      // (the diagram and, beside it, what the lit line does: its source and a sentence)
      var diagram = box.querySelector("div.feynman");
      var stage = document.createElement("div");
      stage.className = "feynjs-explain-stage";
      diagram.parentNode.insertBefore(stage, diagram);
      stage.appendChild(diagram);
      var aside = document.createElement("div");
      aside.className = "feynjs-explain-aside";
      aside.appendChild(said);
      aside.appendChild(live);
      stage.appendChild(aside);
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!("IntersectionObserver" in window) || still) return;
      // (pointing pauses the loop; it picks up again a little after the pointer leaves)
      box.addEventListener("mouseleave", function () { if (document.activeElement && box.contains(document.activeElement)) return; later(); });
      // (it plays once a quarter of the block is on screen, so a tall block starts too)
      new IntersectionObserver(function (e) {
        inView = e[0].isIntersecting;
        if (!inView) { stop(); clear(); return; }
        if (!playing) playing = setTimeout(function () { run(current < 0 ? 0 : current); }, 800);
      }, { threshold: 0.25 }).observe(box);
    });
  };
  // The layouts of one diagram (.feynjs-layouts): buttons for the default, the grid and the final
  // plane, and the diagram moving smoothly from one to the next, each point setting off in turn
  // from the left. The switch line in the source beside it follows. It steps through the three
  // while in view until a button is pressed.
  var layouts = function () {
    document.querySelectorAll(".feynjs-layouts div.feynman[data-source]:not([data-morph])").forEach(function (box) {
      box.setAttribute("data-morph", "");
      var holder = box.closest(".feynjs-layouts");
      var source = box.dataset.source.trim();
      var ENDS = [
        { name: "Default", line: "layout: default", note: "forces balanced as physicists draw: decays fan out, nothing crosses" },
        { name: "Grid", line: "layout: grid", note: "every line at a multiple of 45 degrees, every point on a grid" },
        { name: "Final plane", line: "final plane: on", note: "everything that leaves lined up in one column" },
      ];
      var model = function (svg) {
        var m = /<metadata class="feynjs-model">([\s\S]*?)<\/metadata>/.exec(svg);
        var text = document.createElement("textarea"); text.innerHTML = m[1];
        return JSON.parse(text.value);
      };
      var ends = ENDS.map(function (e, k) { return feynjs.render(e.line + "\n" + source, { idPrefix: "lay" + k, model: true }); });
      var at = ends.map(function (svg) { var byId = {}; model(svg).vertices.forEach(function (v) { byId[v.id] = v.at; }); return byId; });
      var ids = Object.keys(at[0]);
      var boxes = ends.map(function (svg) { return /viewBox="([^"]+)"/.exec(svg)[1].split(/\s+/).map(Number); });
      var x0 = Math.min.apply(null, boxes.map(function (b) { return b[0]; })), y0 = Math.min.apply(null, boxes.map(function (b) { return b[1]; }));
      var x1 = Math.max.apply(null, boxes.map(function (b) { return b[0] + b[2]; })), y1 = Math.max.apply(null, boxes.map(function (b) { return b[1] + b[3]; }));
      var padX = (x1 - x0) * 0.05, padY = (y1 - y0) * 0.06;
      var frame = [x0 - padX, y0 - padY, x1 - x0 + 2 * padX, y1 - y0 + 2 * padY].map(function (n) { return n.toFixed(2); }).join(" ");
      var labelsOf = function (svg) { var m = /<g class="feynjs-labels">[\s\S]*<\/g><\/svg>\s*$/.exec(svg); return m ? m[0].replace(/<\/svg>\s*$/, "") : ""; };
      var endLabels = ends.map(labelsOf);
      var gridLines = (/<path class="feynjs-grid"[^>]*\/>/.exec(ends[1]) || [""])[0];
      var show = function (svg, gridShown, labels) {
        var drawn = svg.replace(/<svg ([^>]*?)viewBox="[^"]+"([^>]*?) width="[^"]*" height="[^"]*"/, '<svg $1viewBox="' + frame + '"$2');
        drawn = drawn.replace(/<path class="feynjs-grid"[^>]*\/>/, "");
        if (gridShown > 0 && gridLines) drawn = drawn.replace(/(<g class="feynjs-edges")/, gridLines.replace("<path ", '<path opacity="' + gridShown.toFixed(3) + '" ') + "$1");
        if (labels) {
          var own = labelsOf(drawn), kept = labels.from > 0 ? own.replace('<g class="feynjs-labels">', '<g class="feynjs-labels" opacity="' + labels.from.toFixed(3) + '">') : "";
          var arriving = labels.to > 0 ? endLabels[labels.end].replace('<g class="feynjs-labels">', '<g class="feynjs-labels" opacity="' + labels.to.toFixed(3) + '">') : "";
          drawn = drawn.replace(own, kept + arriving);
        }
        box.innerHTML = drawn;
      };
      var SWEEP = 0.5, EACH = 0.9, LENGTH = SWEEP + EACH;
      var ease = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
      var between = function (seconds, from, to) {
        var xs = ids.map(function (id) { return at[from][id][0]; });
        var left = Math.min.apply(null, xs), across = (Math.max.apply(null, xs) - left) || 1;
        var pins = ids.map(function (id) {
          var a = at[from][id], b = at[to][id] || a;
          var u = Math.max(0, Math.min(1, (seconds - (SWEEP * (a[0] - left)) / across) / EACH)), e = ease(u);
          return id + " at (" + (a[0] + (b[0] - a[0]) * e).toFixed(3) + ", " + (a[1] + (b[1] - a[1]) * e).toFixed(3) + ")";
        });
        return feynjs.render("layout: manual\n" + source + "\n" + pins.join("\n"), { idPrefix: "lay", model: true });
      };
      // the buttons, and the switch line in the source
      var bar = document.createElement("div");
      bar.className = "feynjs-layouts-bar";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Layout");
      var buttons = ENDS.map(function (e, k) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "feynjs-explain-button"; b.textContent = e.name;
        b.addEventListener("click", function () { pausedUntil = Date.now() + 6000; go(k); });
        bar.appendChild(b);
        return b;
      });
      box.parentNode.insertBefore(bar, box);
      var code = holder.querySelector("pre code");
      var escape = function (text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
      var mark = function (k) {
        buttons.forEach(function (b, j) { b.classList.toggle("feynjs-on", j === k); b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
        if (code) code.innerHTML = '<span class="feynjs-line feynjs-line-on"><span class="feynjs-src" style="--feynjs-src-width: 19ch">' + escape(ENDS[k].line) + '</span><span class="feynjs-note"><span class="feynjs-note-mark">  % </span>' + escape(ENDS[k].note) + "</span>\n</span>" + escape(source);
      };
      var state = 0, running = false, timer = null;
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var go = function (to, then) {
        if (to === state || running) return;
        mark(to);
        if (still) { state = to; show(ends[to], to === 1 ? 1 : 0); if (then) then(); return; }
        var from = state, start = performance.now();
        running = true;
        var step = function (now) {
          var seconds = (now - start) / 1000, t = Math.min(1, seconds / LENGTH);
          var gridShown = to === 1 ? Math.max(0, (t - 0.45) / 0.55) : from === 1 ? Math.max(0, 1 - t / 0.5) : 0;
          var labels = { from: Math.max(0, 1 - t / 0.18), to: Math.max(0, (t - 0.78) / 0.22), end: to };
          if (t < 1) { show(between(seconds, from, to), gridShown, labels); requestAnimationFrame(step); }
          else { state = to; running = false; show(ends[to], to === 1 ? 1 : 0); if (then) then(); }
        };
        requestAnimationFrame(step);
      };
      // (round the three while in view; a button press only pauses it)
      var pausedUntil = 0;
      var loop = function () {
        timer = setTimeout(function () {
          if (Date.now() < pausedUntil || running) { loop(); return; }
          go((state + 1) % ENDS.length, loop);
        }, 2600);
      };
      mark(0);
      show(ends[0], 0);
      if (!still && "IntersectionObserver" in window) {
        new IntersectionObserver(function (seen) {
          if (seen[0].isIntersecting) { if (!timer && !running) loop(); }
          else { clearTimeout(timer); timer = null; }
        }, { threshold: 0.5 }).observe(box);
      }
    });
  };
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
