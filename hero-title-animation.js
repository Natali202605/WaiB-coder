(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch =
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 899px)").matches;
  var lines = document.querySelectorAll("[data-hero-split]");

  if (!lines.length) return;

  function showPlain() {
    lines.forEach(function (el) {
      el.style.opacity = "1";
    });
    var title = document.querySelector(".hero__title--split");
    if (title) title.classList.add("is-split-ready", "is-split-done");
  }

  if (prefersReduced || isTouch || typeof gsap === "undefined") {
    showPlain();
    return;
  }

  /* Если GSAP не отработал — показать текст целиком */
  window.setTimeout(function () {
    var title = document.querySelector(".hero__title--split");
    if (title && !title.classList.contains("is-split-done")) {
      showPlain();
    }
  }, 4000);

  function splitElement(el, type) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    el.classList.add("split-parent");

    var parts = [];
    var units;

    if (type === "words") {
      units = text.split(/(\s+)/);
    } else {
      units = Array.from(text);
    }

    units.forEach(function (unit) {
      if (!unit) return;
      var span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");

      if (type === "words") {
        span.className = /^\s+$/.test(unit) ? "split-char split-char--space" : "split-word";
        if (/^\s+$/.test(unit)) {
          span.innerHTML = unit.replace(/ /g, "&nbsp;");
        } else {
          span.textContent = unit;
        }
      } else {
        span.className = unit === " " || unit === "\u00a0" ? "split-char split-char--space" : "split-char";
        if (unit === " ") {
          span.innerHTML = "&nbsp;";
        } else {
          span.textContent = unit;
        }
      }

      el.appendChild(span);
      if (!/^\s+$/.test(unit)) {
        parts.push(span);
      }
    });

    return parts;
  }

  function readNumber(el, name, fallback) {
    var raw = el.getAttribute(name);
    if (raw === null || raw === "") return fallback;
    var value = parseFloat(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function init() {
    var title = document.querySelector(".hero__title--split");
    if (!title) return;

    title.classList.add("is-split-ready");

    var timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
      onComplete: function () {
        title.classList.add("is-split-done");
        title.dispatchEvent(
          new CustomEvent("hero-title-complete", { bubbles: true })
        );
      },
    });

    lines.forEach(function (el, index) {
      var type = el.getAttribute("data-split-type") || "chars";
      var delayMs = readNumber(el, "data-split-delay", 50);
      var duration = readNumber(el, "data-split-duration", 1.25);
      var inLine2 = Boolean(el.closest(".hero__title-line2"));
      var offset = readNumber(
        el,
        "data-split-offset",
        inLine2 ? 0.35 + index * 0.18 : index === 0 ? 0 : 0.35
      );
      var targets = splitElement(el, type);

      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y: 40 });

      var position = el.classList.contains("hero__title-line1") ? 0 : offset;

      timeline.to(
        targets,
        {
          opacity: 1,
          y: 0,
          duration: duration,
          stagger: delayMs / 1000,
          force3D: true,
        },
        position
      );
    });
  }

  function whenReady(fn) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fn).catch(fn);
    } else {
      fn();
    }
  }

  whenReady(init);
})();
