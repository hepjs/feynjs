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
      el.appendChild(part("feynjs-js", "js"));
    });
  };

  var go = function () {
    brandName();
    // (the home page's diagram first, without download buttons)
    feynjs.run({ querySelector: ".feynjs-splash div.feynman:not([data-processed])" });
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true });
    rippleFromCollision();
  };
  // the home page's ripples spread from the diagram's collision: their centre put on the blob
  // where the protons meet, as a share of the diagram's box, so it holds when the page resizes
  var rippleFromCollision = function () {
    document.querySelectorAll(".feynjs-splash-diagram").forEach(function (box) {
      var ripples = box.querySelector(".feynjs-splash-ripples"), blob = box.querySelector(".feynjs-collision");
      if (!ripples || !blob) return;
      var b = box.getBoundingClientRect(), c = blob.getBoundingClientRect();
      if (!b.width || !b.height) return;
      ripples.style.left = ((c.left + c.width / 2 - b.left) / b.width * 100).toFixed(2) + "%";
      ripples.style.top = ((c.top + c.height / 2 - b.top) / b.height * 100).toFixed(2) + "%";
      ripples.classList.add("feynjs-placed");
    });
    levelWithLogo();
  };
  // and the diagram stands so its collision is level with the middle of the logo beside it (only
  // when the two sit side by side; stacked, on a narrow screen, they keep their places)
  var levelWithLogo = function () {
    document.querySelectorAll(".feynjs-splash").forEach(function (splash) {
      var box = splash.querySelector(".feynjs-splash-diagram"), blob = box && box.querySelector(".feynjs-collision");
      var logo = Array.prototype.find.call(splash.querySelectorAll(".feynjs-splash-logo"), function (img) { return img.offsetParent !== null; });
      if (!box || !blob || !logo) return;
      box.style.transform = "";
      var l = logo.getBoundingClientRect(), c = blob.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (!l.height || b.top >= l.bottom) return;
      box.style.transform = "translateY(" + (l.top + l.height / 2 - (c.top + c.height / 2)).toFixed(1) + "px)";
      if (!logo.complete) logo.addEventListener("load", levelWithLogo, { once: true });
    });
  };
  window.addEventListener("resize", function () { levelWithLogo(); });
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
