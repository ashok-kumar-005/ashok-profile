(function () {
  var canvas = document.getElementById("bg-network");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width, height, dpr;
  var points = [];
  var POINT_SPACING = 90;
  var LINK_DIST = 130;
  var DOT_COLOR = "20, 24, 33";
  var LINE_COLOR = "20, 24, 33";

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
    var cols = Math.ceil(width / POINT_SPACING) + 1;
    var rows = Math.ceil(height / POINT_SPACING) + 1;
    points = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        points.push({
          baseX: x * POINT_SPACING,
          baseY: y * POINT_SPACING,
          x: x * POINT_SPACING,
          y: y * POINT_SPACING,
          angle: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.25,
          radius: 6 + Math.random() * 10
        });
      }
    }
  }

  var mouse = { x: -9999, y: -9999 };
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
  });
  window.addEventListener("mouseleave", function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  var t = 0;
  function tick() {
    t += 0.006;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x = p.baseX + Math.cos(t * p.speed + p.angle) * p.radius;
      p.y = p.baseY + Math.sin(t * p.speed + p.angle) * p.radius;
    }

    ctx.lineWidth = 1;
    for (var a = 0; a < points.length; a++) {
      for (var b = a + 1; b < points.length; b++) {
        var p1 = points[a], p2 = points[b];
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var opacity = (1 - dist / LINK_DIST) * 0.16;
          ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + opacity + ")";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    for (var j = 0; j < points.length; j++) {
      var pt = points[j];
      var mdx = pt.x - mouse.x, mdy = pt.y - mouse.y;
      var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      var near = mdist < 160;
      var r = near ? 2.3 : 1.5;
      var op = near ? 0.55 : 0.28;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + DOT_COLOR + ", " + op + ")";
      ctx.fill();

      if (near) {
        var lineOp = (1 - mdist / 160) * 0.35;
        ctx.strokeStyle = "rgba(" + LINE_COLOR + ", " + lineOp + ")";
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    if (!reduceMotion) requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);
  resize();
  tick();
  if (reduceMotion) {
    // draw a single static frame, points already seeded at base position
  }
})();
