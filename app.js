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

  /* ---------- Signal network ----------
     Nodes drift, nearby ones link up, and pulses periodically travel along
     those links — so the hero keeps moving on a phone with no pointer.   */

  var canvas = document.getElementById("neural");

  if (canvas && hero && !reduceMotion) {
    (function () {
      var ctx = canvas.getContext("2d");
      var w = 0, h = 0, dpr = 1;
      var nodes = [], pulses = [];
      var LINK = 0;
      var raf = null, running = false;

      function build() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Fewer, further-apart nodes on small screens: cheaper and less busy.
        var narrow = w < 700;
        LINK = narrow ? 130 : 165;
        var target = Math.round((w * h) / (narrow ? 26000 : 20000));
        var count = Math.max(14, Math.min(narrow ? 26 : 52, target));

        nodes = [];
        for (var i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            r: 1.1 + Math.random() * 1.6,
            // countdown until this node fires a pulse
            next: 600 + Math.random() * 4200,
            flash: 0
          });
        }
        pulses = [];
      }

      function fire(from) {
        // Send a pulse to a random node currently in range.
        var near = [];
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === from) continue;
          var dx = nodes[i].x - from.x, dy = nodes[i].y - from.y;
          if (dx * dx + dy * dy < LINK * LINK) near.push(nodes[i]);
        }
        if (!near.length) return;
        from.flash = 1;
        pulses.push({
          a: from,
          b: near[(Math.random() * near.length) | 0],
          t: 0,
          speed: 0.010 + Math.random() * 0.012
        });
      }

      var last = 0;
      function frame(now) {
        var dt = last ? Math.min(now - last, 50) : 16;
        last = now;

        ctx.clearRect(0, 0, w, h);

        var i, j, n;

        for (i = 0; i < nodes.length; i++) {
          n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -30) n.x = w + 30;
          if (n.x > w + 30) n.x = -30;
          if (n.y < -30) n.y = h + 30;
          if (n.y > h + 30) n.y = -30;

          n.flash *= 0.94;
          n.next -= dt;
          if (n.next <= 0) {
            n.next = 2600 + Math.random() * 6000;
            fire(n);
          }
        }

        // Links
        ctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
          for (j = i + 1; j < nodes.length; j++) {
            var a = nodes[i], b = nodes[j];
            var dx = a.x - b.x, dy = a.y - b.y;
            var d2 = dx * dx + dy * dy;
            if (d2 > LINK * LINK) continue;
            var d = Math.sqrt(d2);
            var alpha = (1 - d / LINK) * 0.20;
            ctx.strokeStyle = "rgba(163, 178, 224, " + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Pulses travelling along links
        for (i = pulses.length - 1; i >= 0; i--) {
          var p = pulses[i];
          p.t += p.speed * (dt / 16);
          if (p.t >= 1) {
            p.b.flash = 1;
            pulses.splice(i, 1);
            // Chain onward now and then, so signals propagate
            if (Math.random() < 0.55) fire(p.b);
            continue;
          }
          var px = p.a.x + (p.b.x - p.a.x) * p.t;
          var py = p.a.y + (p.b.y - p.a.y) * p.t;
          var fade = Math.sin(p.t * Math.PI);

          var g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, "rgba(255, 122, 120, " + (0.85 * fade).toFixed(3) + ")");
          g.addColorStop(1, "rgba(255, 77, 141, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 236, 232, " + (0.95 * fade).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(px, py, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nodes
        for (i = 0; i < nodes.length; i++) {
          n = nodes[i];
          if (n.flash > 0.02) {
            ctx.fillStyle = "rgba(255, 77, 141, " + (0.22 * n.flash).toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + 9 * n.flash, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "rgba(198, 210, 245, " + (0.34 + 0.5 * n.flash).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }

        raf = requestAnimationFrame(frame);
      }

      function start() {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }

      build();
      start();

      var rt = null;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(build, 200);
      }, { passive: true });

      // Don't burn cycles while the hero is off-screen or the tab is hidden.
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) start(); else stop();
        }, { threshold: 0 }).observe(hero);
      }
    })();
  } else if (canvas) {
    canvas.style.display = "none";
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

  /* ---------- Solution screenshots ----------
     Filenames are discovered, not listed: for a row tagged
     data-shots="09-chess-analytics" this probes
     assets/shots/09-chess-analytics-1.jpg, -2, -3 ... and stops at the first
     number that has neither a .jpg nor a .png. Dropping 09-chess-analytics-5.jpg
     into assets/shots/ is therefore the whole job — no code change. A project
     with no files at all adds no markup, so its row stays exactly as it was. */

  var SHOT_DIR = "assets/shots/";
  var SHOT_EXT = ["jpg", "png", "jpeg", "webp"];
  var SHOT_MAX = 12; // hard stop, so a missing file can never loop forever

  // Resolves to the first extension that loads, or null if none do.
  function findShot(slug, n) {
    return new Promise(function (resolve) {
      var i = 0;
      (function tryNext() {
        if (i >= SHOT_EXT.length) return resolve(null);
        var url = SHOT_DIR + slug + "-" + n + "." + SHOT_EXT[i++];
        var probe = new Image();
        probe.onload = function () { resolve(url); };
        probe.onerror = tryNext;
        probe.src = url;
      })();
    });
  }

  // Walks 1..SHOT_MAX and stops at the first gap.
  function collectShots(slug) {
    var found = [];
    return new Promise(function (resolve) {
      (function step(n) {
        if (n > SHOT_MAX) return resolve(found);
        findShot(slug, n).then(function (url) {
          if (!url) return resolve(found);
          found.push(url);
          step(n + 1);
        });
      })(1);
    });
  }

  var viewer = document.getElementById("shot-viewer");
  var works = document.querySelectorAll(".work[data-shots]");

  if (viewer && works.length && "Promise" in window) {
    var vImg = viewer.querySelector(".shot-full");
    var vProject = viewer.querySelector(".shot-project");
    var vCount = viewer.querySelector(".shot-count");
    var vPrev = viewer.querySelector(".shot-prev");
    var vNext = viewer.querySelector(".shot-next");

    var group = [];   // urls of the project currently open
    var title = "";
    var index = 0;
    var lastFocus = null;

    function render() {
      vImg.src = group[index];
      vImg.alt = title + " screenshot " + (index + 1) + " of " + group.length;
      vProject.textContent = title;
      vCount.textContent = (index + 1) + " / " + group.length;
      viewer.classList.toggle("is-single", group.length < 2);
    }

    function step(delta) {
      if (group.length < 2) return;
      index = (index + delta + group.length) % group.length;
      render();
    }

    function open(shots, name, start, trigger) {
      group = shots;
      title = name;
      index = start;
      lastFocus = trigger || null;
      viewer.hidden = false;
      viewer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      render();
      (group.length > 1 ? vNext : viewer.querySelector(".shot-close")).focus();
    }

    function close() {
      viewer.hidden = true;
      viewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      vImg.removeAttribute("src");
      if (lastFocus) lastFocus.focus();
      lastFocus = null;
    }

    vPrev.addEventListener("click", function () { step(-1); });
    vNext.addEventListener("click", function () { step(1); });

    // The X and the backdrop both carry data-shot-close.
    Array.prototype.forEach.call(
      viewer.querySelectorAll("[data-shot-close]"),
      function (el) { el.addEventListener("click", close); }
    );

    document.addEventListener("keydown", function (e) {
      if (viewer.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });

    Array.prototype.forEach.call(works, function (work) {
      var slug = work.getAttribute("data-shots");
      var body = work.querySelector(".work-body");
      if (!slug || !body) return;

      collectShots(slug).then(function (shots) {
        if (!shots.length) return; // row is left untouched

        var name = (work.querySelector(".work-title") || {}).textContent || slug;
        var list = document.createElement("ul");
        list.className = "work-shots";

        shots.forEach(function (url, i) {
          var li = document.createElement("li");
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "work-shot";
          btn.setAttribute("aria-label", "Open " + name + " screenshot " + (i + 1));

          var img = document.createElement("img");
          img.src = url;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";

          btn.appendChild(img);
          btn.addEventListener("click", function () { open(shots, name, i, btn); });
          li.appendChild(btn);
          list.appendChild(li);
        });

        body.appendChild(list);
      });
    });
  }

  /* ---------- Reveal content as it enters the viewport ---------- */

  var targets = document.querySelectorAll(
    ".band-head, .about-grid, .role-item, .cert-group, .cert, .work, .edu li, " +
    ".foot-links, .foot-fine"
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
