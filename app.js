(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Cursor spotlight ---------- */

  var spotlight = document.getElementById("spotlight");
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (spotlight && finePointer && !reduceMotion) {
    var pending = false;
    var lastX = 0, lastY = 0;

    window.addEventListener("mousemove", function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        spotlight.style.setProperty("--x", lastX + "px");
        spotlight.style.setProperty("--y", lastY + "px");
        pending = false;
      });
    }, { passive: true });
  } else if (spotlight) {
    spotlight.style.display = "none";
  }

  /* ---------- Scroll-spy nav ---------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  if (!links.length) return;

  var sections = links
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { id: id, el: el, link: link } : null;
    })
    .filter(Boolean);

  function setActive(id) {
    sections.forEach(function (s) {
      s.link.classList.toggle("is-active", s.id === id);
    });
  }

  // The section crossing this line (upper third of the viewport) is "current".
  // Higher than centre so short sections like About still get their turn.
  function activeSection() {
    var line = window.innerHeight * 0.35;

    // At the bottom of the page the last section can never reach the line,
    // so claim it explicitly.
    var atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (atBottom) return sections[sections.length - 1].id;

    var current = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.getBoundingClientRect().top <= line) {
        current = sections[i].id;
      }
    }
    return current;
  }

  var ticking = false;
  function update() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      setActive(activeSection());
      ticking = false;
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();
