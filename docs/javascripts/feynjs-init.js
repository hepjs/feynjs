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
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true });
  };
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
