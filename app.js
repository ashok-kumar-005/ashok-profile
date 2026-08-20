(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var topbar = document.getElementById("topbar");
  var hero = document.querySelector(".hero");
  var rail = document.querySelector(".rail");

  /* ---------- Intro curtain ----------
     The CSS animation clears it on its own; this only tears the node out
     afterwards, and force-clears it if the animation never ran at all so the
     page can never be left sitting behind a curtain.                       */

  var preloader = document.getElementById("preloader");
  if (preloader) {
    var drop = function () {
      if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
      preloader = null;
    };
    if (reduceMotion) drop();
    else {
      preloader.addEventListener("animationend", function (e) {
        if (e.animationName === "curtain") drop();
      });
      setTimeout(drop, 3000);
    }
  }

  /* ---------- Pointer parallax on the hero shape layers ---------- */

  var shapes = document.querySelector(".shapes");
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (shapes && hero && finePointer && !reduceMotion) {
    var queued = false, px = 0, py = 0;

    window.addEventListener("mousemove", function (e) {
      // -1 .. 1 relative to the middle of the viewport
      px = (e.clientX / window.innerWidth - 0.5) * -2;
      py = (e.clientY / window.innerHeight - 0.5) * -2;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        shapes.style.setProperty("--par-x", px.toFixed(3));
        shapes.style.setProperty("--par-y", py.toFixed(3));
        queued = false;
      });
    }, { passive: true });
  }

  /* ---------- Top bar: solid once past the hero ----------
     The bar sits over the dark hero to start, so it only needs a
     background once lighter content scrolls underneath it.          */

  function onScroll() {
    if (!hero) return;
    var past = window.scrollY > hero.offsetHeight - 120;
    if (topbar) topbar.classList.toggle("is-stuck", past);
    if (rail) rail.classList.toggle("on-dark", !past);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- Active section in the top nav ---------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));
  var sections = links
    .map(function (link) {
      var el = document.getElementById(link.getAttribute("href").slice(1));
      return el ? { el: el, link: link } : null;
    })
    .filter(Boolean);

  function markActive() {
    var line = window.innerHeight * 0.4;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.getBoundingClientRect().top <= line) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle("is-active", s === current);
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      markActive();
      ticking = false;
    });
  }, { passive: true });
  markActive();

  /* ---------- Reveal content as it enters the viewport ---------- */

  var targets = document.querySelectorAll(
    ".band-head, .about-grid, .cert-group, .cert, .work, .edu li, .foot-links, .foot-fine"
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("reveal", "is-in");
    });
    return;
  }

  Array.prototype.forEach.call(targets, function (el) {
    el.classList.add("reveal");
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    // No negative bottom margin: anything sitting inside it at max scroll
    // could never intersect, and would stay invisible for good.
    { rootMargin: "0px 0px -40px 0px", threshold: 0.05 }
  );

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

  // Safety net: once the page is scrolled to the end, nothing may stay hidden.
  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY < document.body.scrollHeight - 4) return;
    Array.prototype.forEach.call(targets, function (el) {
      if (!el.classList.contains("is-in")) {
        el.classList.add("is-in");
        io.unobserve(el);
      }
    });
  }, { passive: true });
})();
