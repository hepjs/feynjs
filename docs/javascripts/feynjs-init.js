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
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true });
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
      var EVERY = 1.8, SECONDS = 9;
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
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
