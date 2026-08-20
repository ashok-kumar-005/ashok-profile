(function () {
  var canvas = document.getElementById("bg-flow");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width, height, dpr;

  var palette = [
    { r: 66, g: 97, b: 255 },   // vivid blue
    { r: 255, g: 90, b: 46 },   // hot rust/orange
    { r: 255, g: 176, b: 32 },  // gold
    { r: 66, g: 209, b: 148 },  // emerald
    { r: 189, g: 66, b: 255 }   // violet
  ];

  var blobs = [
    { color: palette[0], baseX: 0.26, baseY: 0.38, rx: 0.32, wobX: 0.12, wobY: 0.09, speed: 0.00046, phase: 0 },
    { color: palette[1], baseX: 0.74, baseY: 0.24, rx: 0.26, wobX: 0.10, wobY: 0.11, speed: 0.00058, phase: 2.1 },
    { color: palette[2], baseX: 0.58, baseY: 0.74, rx: 0.30, wobX: 0.11, wobY: 0.09, speed: 0.00039, phase: 4.2 },
    { color: palette[3], baseX: 0.16, baseY: 0.78, rx: 0.24, wobX: 0.09, wobY: 0.08, speed: 0.00052, phase: 1.4 },
    { color: palette[4], baseX: 0.48, baseY: 0.46, rx: 0.22, wobX: 0.10, wobY: 0.10, speed: 0.00061, phase: 3.3 }
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduceMotion) draw(0);
  }

  function draw(t) {
    var base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, "#0a0518");
    base.addColorStop(1, "#160a2e");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var ang = t * b.speed + b.phase;
      var x = (b.baseX + Math.cos(ang) * b.wobX) * width;
      var y = (b.baseY + Math.sin(ang * 1.3) * b.wobY) * height;
      var r = Math.max(width, height) * b.rx;
      var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(" + b.color.r + "," + b.color.g + "," + b.color.b + ",0.85)");
      grad.addColorStop(1, "rgba(" + b.color.r + "," + b.color.g + "," + b.color.b + ",0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    var sweep = (Math.sin(t * 0.00034) + 1) / 2;
    var hy = height * (0.22 + sweep * 0.18);
    var hl = ctx.createLinearGradient(0, 0, width, 0);
    hl.addColorStop(0, "rgba(255,255,255,0)");
    hl.addColorStop(0.5, "rgba(255,255,255,0.4)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = hl;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, hy + Math.sin(t * 0.0006) * 24);
    ctx.quadraticCurveTo(
      width * 0.5,
      hy - 50 + Math.cos(t * 0.00075) * 18,
      width,
      hy - 8
    );
    ctx.stroke();
  }

  function tick(t) {
    draw(t);
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);
  resize();
  requestAnimationFrame(tick);
})();
