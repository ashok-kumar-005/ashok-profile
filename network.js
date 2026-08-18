(function () {
  var canvas = document.getElementById("bg-network");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width, height, dpr;
  var particles = [];
  var DENSITY = 16000; // px^2 per particle
  var MAX_PARTICLES = 160;
  var LINK_DIST = 140;
  var DOT_COLOR = "20, 24, 33";
  var LINE_COLOR = "20, 24, 33";
  var DRIFT_SPEED = reduceMotion ? 0.06 : 0.18;
  var MOUSE_RADIUS = 150;
  var MOUSE_FORCE = 0.6;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = document.documentElement.scrollHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.min(MAX_PARTICLES, Math.max(24, Math.round((width * height) / DENSITY)));
    particles = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * DRIFT_SPEED * (0.5 + Math.random()),
        vy: Math.sin(angle) * DRIFT_SPEED * (0.5 + Math.random()),
        r: 1.3 + Math.random() * 1.4
      });
    }
  }

  var mouse = { x: -9999, y: -9999, active: false };
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", function () {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener("scroll", function () {
    // keep mouse anchored to viewport position while scrolling
  }, { passive: true });

  function tick() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (mouse.active) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0.001) {
          var force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (dx / dist) * force * 0.06;
          p.vy += (dy / dist) * force * 0.06;
        }
      }

      // gentle drag back toward drift speed so particles don't run away forever
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var maxSpeed = DRIFT_SPEED * 4;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      p.vx *= 0.985;
      p.vy *= 0.985;
      var s = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (s < DRIFT_SPEED * 0.3) {
        var a = Math.atan2(p.vy, p.vx) + (Math.random() - 0.5) * 0.4;
        p.vx = Math.cos(a) * DRIFT_SPEED * 0.6;
        p.vy = Math.sin(a) * DRIFT_SPEED * 0.6;
      }
    }

    ctx.lineWidth = 1;
    for (var a2 = 0; a2 < particles.length; a2++) {
      for (var b = a2 + 1; b < particles.length; b++) {
        var p1 = particles[a2], p2 = particles[b];
        var ldx = p1.x - p2.x, ldy = p1.y - p2.y;
        var ldist = Math.sqrt(ldx * ldx + ldy * ldy);
        if (ldist < LINK_DIST) {
          var opacity = (1 - ldist / LINK_DIST) * 0.24;
          ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + opacity + ")";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    for (var j = 0; j < particles.length; j++) {
      var pt = particles[j];
      var mdx = pt.x - mouse.x, mdy = pt.y - mouse.y;
      var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      var near = mouse.active && mdist < MOUSE_RADIUS;
      var r = near ? pt.r * 1.6 : pt.r;
      var op = near ? 0.6 : 0.32;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + DOT_COLOR + ", " + op + ")";
      ctx.fill();

      if (near) {
        var lineOp = (1 - mdist / MOUSE_RADIUS) * 0.4;
        ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + lineOp + ")";
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);
  resize();
  requestAnimationFrame(tick);
})();
