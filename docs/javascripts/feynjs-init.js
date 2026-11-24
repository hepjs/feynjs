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
  // it, so the lines re-fit their waves and arrows as they go. It plays back and forth while the
  // row is in view; the switch above it goes to either engine.
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
      var frame = x0.toFixed(2) + " " + y0.toFixed(2) + " " + (x1 - x0).toFixed(2) + " " + (y1 - y0).toFixed(2);
      var show = function (svg, grid) {
        // (the same frame and no size of its own: the box sizes it, the same every frame)
        box.innerHTML = svg.replace(/<svg ([^>]*?)viewBox="[^"]+"([^>]*?) width="[^"]*" height="[^"]*"/, '<svg $1viewBox="' + frame + '"$2');
        box.classList.toggle("feynjs-on-grid", !!grid);
      };
      var between = function (t) {
        var pins = at[0].map(function (v, k) {
          var w = at[1][k];
          return v.id + " at (" + (v.at[0] + (w.at[0] - v.at[0]) * t).toFixed(3) + ", " + (v.at[1] + (w.at[1] - v.at[1]) * t).toFixed(3) + ")";
        });
        return feynjs.render("layout: manual\n" + source + "\n" + pins.join("\n"), { idPrefix: "morph" });
      };
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var state = 0, running = null, timer = null, auto = true;
      var buttons = document.createElement("div");
      buttons.className = "feynjs-engine-switch";
      buttons.innerHTML = '<button type="button" data-to="0" class="feynjs-on">Forces</button><button type="button" data-to="1">Grid</button>';
      box.parentElement.insertBefore(buttons, box);
      var mark = function (to) { buttons.querySelectorAll("button").forEach(function (b) { b.classList.toggle("feynjs-on", Number(b.dataset.to) === to); }); };
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var go = function (to, then) {
        if (to === state || running) return;
        mark(to);
        if (still) { state = to; show(ends[to], to === 1); if (then) then(); return; }
        var from = state, start = performance.now(), length = 1400;
        running = true;
        var step = function (now) {
          var t = Math.min(1, (now - start) / length), k = ease(t);
          if (t < 1) { show(between(from === 0 ? k : 1 - k), false); requestAnimationFrame(step); }
          else { state = to; running = null; show(ends[to], to === 1); if (then) then(); }
        };
        requestAnimationFrame(step);
      };
      var loop = function () { if (!auto) return; timer = setTimeout(function () { go(1 - state, loop); }, 2200); };
      buttons.addEventListener("click", function (e) {
        var to = e.target.dataset && e.target.dataset.to;
        if (to === undefined) return;
        auto = false; clearTimeout(timer); go(Number(to));
      });
      show(ends[0], false);
      if (!still && "IntersectionObserver" in window) {
        new IntersectionObserver(function (seen) {
          if (seen[0].isIntersecting) { if (auto && !timer && !running) loop(); }
          else { clearTimeout(timer); timer = null; }
        }, { threshold: 0.5 }).observe(box);
      }
    });
  };
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
