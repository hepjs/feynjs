// Render ```feynman blocks. document$ fires on first load and after every instant navigation.
// Also offers a small colour picker (SUSY lines and labels; blobs in blue-grey, blue, grey or red); the
// choice is kept between pages and visits, and applied through the stylesheet without redrawing.
(function () {
  var choices = {
    susy: { label: "SUSY", options: [["red", "#c0392b"], ["amber", "#e09000"], ["accent", "var(--md-accent-fg-color)"], ["blue", "#0b80c3"], ["text", "var(--md-default-fg-color)"]] },
    blob: { label: "Blobs", options: [["slate", "rgba(100, 120, 150, 0.55)"], ["blue", "rgba(11, 128, 195, 0.45)"], ["grey", "rgba(128, 128, 128, 0.45)"], ["red", "rgba(232, 32, 42, 0.45)"]] },
  };
  var stored = function (key) { try { return localStorage.getItem("feynjs-colour-" + key); } catch (e) { return null; } };
  var store = function (key, value) { try { localStorage.setItem("feynjs-colour-" + key, value); } catch (e) { /* private mode */ } };
  var apply = function (key, value) { document.documentElement.setAttribute("data-feynjs-" + key, value); };
  Object.keys(choices).forEach(function (key) { apply(key, stored(key) || choices[key].options[0][0]); });

  var picker = function () {
    if (document.querySelector(".feynjs-picker") || !document.querySelector("div.feynman")) return;
    var panel = document.createElement("div");
    panel.className = "feynjs-picker";
    panel.setAttribute("aria-label", "Diagram colours");
    Object.keys(choices).forEach(function (key) {
      var row = document.createElement("div");
      var name = document.createElement("span");
      name.textContent = choices[key].label;
      row.appendChild(name);
      choices[key].options.forEach(function (option) {
        var button = document.createElement("button");
        button.type = "button";
        button.title = choices[key].label + ": " + option[0];
        button.style.background = option[1];
        button.setAttribute("aria-pressed", String(document.documentElement.getAttribute("data-feynjs-" + key) === option[0]));
        button.addEventListener("click", function () {
          apply(key, option[0]);
          store(key, option[0]);
          row.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === button)); });
        });
        row.appendChild(button);
      });
      panel.appendChild(row);
    });
    document.body.appendChild(panel);
  };

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
    // (the home page's showcase first, without download buttons)
    feynjs.run({ querySelector: ".feynjs-hero-stage div.feynman:not([data-processed])" });
    feynjs.run({ querySelector: "div.feynman:not([data-processed])", download: true });
    var old = document.querySelector(".feynjs-picker");
    if (old && !document.querySelector("div.feynman")) old.remove();
    picker();
  };
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(go);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
