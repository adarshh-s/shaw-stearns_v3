/* ==========================================================================
   Liquid — a dark, silk-like fluid surface rendered in WebGL.

   Layers:
   1. A domain-warped fractal noise field (the silk folds).
   2. A low-resolution "wake" simulation: the cursor injects velocity that is
      advected, curled and slowly settles. The silk is sampled through it, so
      moving the pointer drags and stirs the folds instead of painting on them.
   3. Lighting: normals from the noise slope, an orbiting light, sheen, glint,
      fresnel and a thin-film tint (navy and sapphire with bronze glints).

   Simplex noise: Ian McEwan, Ashima Arts (MIT).
   ========================================================================== */

/**
 * Mounts the liquid surface on `host` (an element containing a <canvas>).
 * `isActive()` lets the caller pause rendering (e.g. when faded out).
 * Returns { wake, destroy }: call wake() when isActive() may have turned true.
 */
export function createLiquid(host, isActive) {
  var noop = { wake: function () {}, destroy: function () {} };
  var canvas = host.querySelector("canvas");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var listeners = [];
  function on(target, type, fn, opts) { target.addEventListener(type, fn, opts); listeners.push([target, type, fn, opts]); }

  var gl = canvas.getContext("webgl", {
    antialias: false, alpha: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: "high-performance"
  });
  if (!gl) { host.classList.add("no-gl"); return noop; }

  /* ---------------------------------------------------------------- shaders */

  var VERT = [
    "attribute vec2 aPos;",
    "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
  ].join("\n");

  var NOISE = [
    "vec3 perm3(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }",
    "float snoise(vec2 v){",
    "  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);",
    "  vec2 i = floor(v + dot(v, C.yy));",
    "  vec2 x0 = v - i + dot(i, C.xx);",
    "  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec4 x12 = x0.xyxy + C.xxzz;",
    "  x12.xy -= i1;",
    "  i = mod(i, 289.0);",
    "  vec3 p = perm3(perm3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));",
    "  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);",
    "  m = m * m; m = m * m;",
    "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "  vec3 h = abs(x) - 0.5;",
    "  vec3 a0 = x - floor(x + 0.5);",
    "  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);",
    "  vec3 g;",
    "  g.x = a0.x * x0.x + h.x * x0.y;",
    "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "  return 130.0 * dot(m, g);",
    "}",
    // three octaves, rotated each step to break up axis-aligned artefacts
    "const mat2 ROT = mat2(0.87758, 0.47943, -0.47943, 0.87758);",
    "float fbm(vec2 p){",
    "  float s = 0.0, a = 0.5;",
    "  for (int i = 0; i < 3; i++) { s += a * snoise(p); p = ROT * p * 2.0 + 100.0; a *= 0.5; }",
    "  return s;",
    "}"
  ].join("\n");

  // Wake simulation: rg = velocity (0.5 = rest), b = stir amount
  var WAKE = [
    "precision highp float;",
    "uniform sampler2D uPrev;",
    "uniform vec2 uPtr;",
    "uniform vec2 uPtrVel;",
    "uniform float uInject;",
    "uniform float uDt;",
    "uniform float uTexel;",
    "uniform float uAspect;",
    "vec3 rd(vec2 at){ vec4 c = texture2D(uPrev, at); return vec3((c.rg - 0.5) * 2.0, c.b); }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy * uTexel;",
    "  vec3 here = rd(uv);",
    "  vec3 src = rd(uv - here.xy * uDt * 0.9);",              // semi-lagrangian advection
    "  float cl = (rd(uv + vec2(uTexel, 0.0)).y - rd(uv - vec2(uTexel, 0.0)).y)",
    "           - (rd(uv + vec2(0.0, uTexel)).x - rd(uv - vec2(0.0, uTexel)).x);",
    "  vec2 vel = src.xy + vec2(-src.y, src.x) * cl * 3.0 * uDt;", // turn around local vorticity
    "  float stir = src.z;",
    "  vel *= exp(-uDt * 0.9);",
    "  stir *= exp(-uDt * 0.7);",
    "  vec2 d = (uv - uPtr) * vec2(uAspect, 1.0);",
    "  float k = exp(-dot(d, d) / 0.0028) * uInject;",
    "  vel += uPtrVel * k;",
    "  stir += length(uPtrVel) * 0.7 * k;",
    "  if (length(vel) < 0.006) vel = vec2(0.0);",
    "  if (stir < 0.004) stir = 0.0;",
    "  gl_FragColor = vec4(clamp(vel * 0.5 + 0.5, 0.0, 1.0), clamp(stir, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  var SURFACE = [
    "precision highp float;",
    "uniform float uTime;",
    "uniform vec2 uRes;",
    "uniform vec2 uPtr;",          // spring-follow pointer in aspect space
    "uniform float uPtrSpeed;",    // damped pointer speed 0..1
    "uniform float uScrollVel;",   // damped scroll speed 0..1
    "uniform float uDrift;",
    "uniform sampler2D uWake;",
    "uniform vec3 uBase;",
    "uniform vec3 uMid;",
    "uniform vec3 uHigh;",
    "uniform vec3 uFold;",
    "uniform vec3 uAccent;",
    "uniform float uAccentMix;",
    NOISE,
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  vec2 p = uv * 2.0 - 1.0;",
    "  p.x *= uRes.x / uRes.y;",
    "  float t = uTime * 0.15;",
    "  float pull = exp(-length(p - uPtr) * 1.5) * (0.5 + uPtrSpeed * 0.55);",

    "  vec4 wk = texture2D(uWake, uv);",
    "  vec2 flow = (wk.rg - 0.5) * 2.0;",
    "  float stir = wk.b;",

    // two passes of domain warping
    "  vec2 q = vec2(fbm(p), fbm(p + vec2(1.0)));",
    "  vec2 r = vec2(",
    "    fbm(p + q + vec2(1.7, 9.2) + 0.15 * t + uPtr.x * pull),",
    "    fbm(p + q + vec2(8.3, 2.8) + 0.126 * t + uPtr.y * pull));",
    "  vec2 w = p + r + uDrift * 0.2 + flow * 0.75 + stir * 0.4 * vec2(r.y, -r.x);",
    "  float f = fbm(w);",

    // surface relief from the slope of the final field
    "  float e = 0.07;",
    "  float fx = fbm(w + vec2(e, 0.0));",
    "  float fy = fbm(w + vec2(0.0, e));",
    "  vec3 n = normalize(vec3(-(fx - f) / e * 0.16, -(fy - f) / e * 0.16, 1.0));",

    // light slowly orbits and leans toward the pointer
    "  vec3 L = normalize(vec3(0.55 * cos(uTime * 0.11) + uPtr.x * 0.25, 0.45 * sin(uTime * 0.09) + uPtr.y * 0.25 + 0.35, 0.85));",
    "  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));",
    "  float ndl = max(dot(n, L), 0.0);",
    "  float ndh = max(dot(n, H), 0.0);",
    "  float ndv = max(n.z, 0.0);",
    "  float sheen = pow(ndh, 12.0) * 0.12;",
    "  float glint = pow(ndh, 72.0) * 0.32;",
    "  float fres = pow(1.0 - ndv, 3.2);",
    "  float crest = clamp(length(q) * length(r) * f * 1.6, 0.0, 1.0);",

    "  vec3 cBase = uBase;",
    "  vec3 cMid  = uMid;",
    "  vec3 cHigh = uHigh;",
    "  vec3 alb = mix(cBase, cMid, clamp(f * f * 4.0, 0.0, 1.0));",
    "  alb = mix(alb, cHigh, clamp(length(q) * length(r) * f, 0.0, 1.0) * (0.6 + pull * 0.4));",
    "  vec3 col = alb * (0.78 + 0.22 * ndl);",

    // thin-film iridescence, desaturated and pulled toward silver / bronze
    "  float path = (f * 0.5 + 0.5) * 2.2 + (1.0 - ndv) * 1.6;",
    "  vec3 film = 0.5 + 0.5 * cos(6.28318 * (path + vec3(0.0, 0.33, 0.67)));",
    "  film = mix(vec3(dot(film, vec3(0.3333))), film, 0.4);",
    "  film = mix(film, cHigh * 1.6, 0.5);",
    "  film = mix(film, uAccent * 1.5, uAccentMix * 0.3 * smoothstep(0.2, 0.9, path * 0.5));",
    "  col += film * (fres * 0.16 + sheen + glint * 0.7) * (0.45 + 0.55 * crest) * (0.75 + uScrollVel * 0.08);",
    "  col += mix(cHigh, uAccent * 1.4, uAccentMix) * glint * 0.55 * crest;",

    // fine fold lines
    "  float fold = smoothstep(0.4, 0.5, f) - smoothstep(0.5, 0.6, f);",
    "  col += uFold * fold * (0.35 + uScrollVel * 0.1);",

    "  float vig = smoothstep(2.5, 0.1, length(p));",
    "  col *= 0.4 + 0.6 * vig;",
    "  col = pow(max(col, 0.0), vec3(0.97)) * 0.99 + 0.004;",
    "  col *= smoothstep(0.0, 0.2, uv.y);",                  // fade to black at the bottom edge

    // interleaved gradient noise dither to prevent banding
    "  float ign = fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y));",
    "  col += (ign - 0.5) / 255.0;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  /* ---------------------------------------------------------------- helpers */

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function program(fragSrc, names) {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    var u = {};
    names.forEach(function (n) { u[n] = gl.getUniformLocation(p, n); });
    return { p: p, u: u, a: gl.getAttribLocation(p, "aPos") };
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  function use(prog) {
    gl.useProgram(prog.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(prog.a);
    gl.vertexAttribPointer(prog.a, 2, gl.FLOAT, false, 0, 0);
  }

  var surface = program(SURFACE, ["uTime", "uRes", "uPtr", "uPtrSpeed", "uScrollVel", "uDrift", "uWake", "uBase", "uMid", "uHigh", "uFold", "uAccent", "uAccentMix"]);
  var wake = program(WAKE, ["uPrev", "uPtr", "uPtrVel", "uInject", "uDt", "uTexel", "uAspect"]);
  if (!surface) { host.classList.add("no-gl"); return noop; }

  // ping-pong wake buffers
  var WN = 256;
  var wakeTex = [], wakeFbo = [], wakeIdx = 0;
  if (wake) {
    for (var i = 0; i < 2; i++) {
      var tx = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, WN, WN, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);
      gl.viewport(0, 0, WN, WN);
      gl.clearColor(0.5, 0.5, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      wakeTex.push(tx); wakeFbo.push(fb);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /* ------------------------------------------------------------------ input */

  var aspect = window.innerWidth / window.innerHeight;
  var target = { x: 0, y: 0 };            // pointer in aspect space
  var bead = { x: 0, y: 0, vx: 0, vy: 0 }; // spring that follows the pointer
  var ptrSpeed = 0, scrollVel = 0, drift = 0;
  var lastX = 0, lastY = 0;
  var wakePtr = { x: 0.5, y: 0.5 }, wakeVel = { x: 0, y: 0 }, wakePrev = { x: 0.5, y: 0.5 };
  var lastMoveT = 0, moved = false;
  var lastScroll = window.scrollY;

  on(window, "pointermove", function (e) {
    var nx = (e.clientX / window.innerWidth) * 2 - 1;
    var ny = -((e.clientY / window.innerHeight) * 2 - 1);
    target.x = nx * aspect;
    target.y = ny;
    ptrSpeed = Math.min(ptrSpeed + Math.hypot(nx - lastX, ny - lastY) * 6, 1);
    lastX = nx; lastY = ny;

    var now = performance.now();
    var ux = e.clientX / window.innerWidth, uy = 1 - e.clientY / window.innerHeight;
    var dt = Math.max(0.004, (now - lastMoveT) / 1000);
    wakeVel.x = Math.max(-1, Math.min(1, (ux - wakePrev.x) / dt * 0.3));
    wakeVel.y = Math.max(-1, Math.min(1, (uy - wakePrev.y) / dt * 0.3));
    wakePtr.x = ux; wakePtr.y = uy;
    wakePrev.x = ux; wakePrev.y = uy;
    lastMoveT = now; moved = true;
    wakeUp();
  }, { passive: true });

  on(window, "scroll", function () {
    var y = window.scrollY;
    scrollVel = Math.min(scrollVel + Math.abs(y - lastScroll) / 220, 1);
    lastScroll = y;
  }, { passive: true });

  /* ----------------------------------------------------------------- sizing */

  // Render at device resolution (capped at 2x) within a pixel budget, so the
  // silk stays crisp on retina screens instead of being upscaled by the browser.
  var PIXEL_BUDGET = 4.2e6;   // max drawing-buffer pixels
  var MIN_SCALE = 0.75;       // never drop below 0.75 device px per CSS px
  var scale = 0, maxScale = 1, cssW = 1, cssH = 1;
  function measure() {
    cssW = Math.max(1, canvas.clientWidth);
    cssH = Math.max(1, canvas.clientHeight);
    aspect = cssW / cssH;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    maxScale = Math.max(MIN_SCALE, Math.min(dpr, Math.sqrt(PIXEL_BUDGET / (cssW * cssH))));
    scale = scale ? Math.min(scale, maxScale) : maxScale;
    applyScale();
  }
  function applyScale() {
    var w = Math.max(1, Math.round(cssW * scale));
    var h = Math.max(1, Math.round(cssH * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
  measure();
  on(window, "resize", measure);

  // Adaptive quality: only step resolution down when the GPU is clearly
  // struggling for several windows in a row, and recover once it keeps up.
  var samples = [], refresh = 1000 / 60, refreshSeen = 0, slow = 0, settled = 0, startedAt = 0;
  function adapt(now, ft) {
    if (!startedAt) startedAt = now;
    if (ft < 3 || ft > 250) return;
    samples.push(ft);
    if (samples.length < 60) return;
    var sorted = samples.slice().sort(function (a, b) { return a - b; });
    samples.length = 0;
    var fast = sorted[Math.floor(sorted.length * 0.1)];
    var med = sorted[sorted.length >> 1];
    // a faster display refresh only counts once seen in two windows running
    if (fast < refresh * 0.9) { if (refreshSeen && Math.abs(refreshSeen - fast) < fast * 0.1) refresh = Math.max(4, fast); refreshSeen = fast; }
    else refreshSeen = 0;
    if (now - startedAt < 2500) return;
    // 1.6x the refresh, and under 30fps in absolute terms, before giving up detail
    if (med > refresh * 1.6 && med > 30) {
      settled = 0;
      if (++slow >= 2 && scale > MIN_SCALE) { slow = 0; scale = Math.max(MIN_SCALE, scale * 0.9); applyScale(); }
    } else {
      slow = 0;
      if (med < refresh * 1.15 && scale < maxScale && ++settled >= 3) { settled = 0; scale = Math.min(maxScale, scale * 1.1); applyScale(); }
    }
  }

  function active() { return !document.hidden && (!isActive || isActive()); }

  /* ------------------------------------------------------------------- loop */

  // Brand palette: Shaw Stearns navy (#23365b) deepening to near-black,
  // sapphire on the crests, bronze (#9a8254) catching the brightest glints.
  var PALETTE = {
    base:   [0.006, 0.012, 0.032],
    mid:    [0.075, 0.120, 0.245],
    high:   [0.340, 0.470, 0.760],
    fold:   [0.160, 0.260, 0.540],
    accent: [0.604, 0.510, 0.329],
    accentMix: 0.75
  };
  var t0 = performance.now(), prev = t0, raf = 0;

  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - prev) / 1000);
    adapt(now, now - prev);
    prev = now;

    var damp = Math.exp(-2.2 * dt);
    scrollVel *= damp;
    ptrSpeed *= damp;
    drift += 0.001;

    // critically-ish damped spring: a quick flick stretches the silk
    var ax = (target.x - bead.x) * 70 - bead.vx * 9;
    var ay = (target.y - bead.y) * 70 - bead.vy * 9;
    bead.vx += ax * dt; bead.vy += ay * dt;
    bead.x += bead.vx * dt; bead.y += bead.vy * dt;

    if (wake) {
      var inject = moved && now - lastMoveT < 90 ? 1 : 0;
      moved = false;
      var next = wakeIdx ^ 1;
      use(wake);
      gl.bindFramebuffer(gl.FRAMEBUFFER, wakeFbo[next]);
      gl.viewport(0, 0, WN, WN);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wakeTex[wakeIdx]);
      gl.uniform1i(wake.u.uPrev, 0);
      gl.uniform2f(wake.u.uPtr, wakePtr.x, wakePtr.y);
      gl.uniform2f(wake.u.uPtrVel, wakeVel.x, wakeVel.y);
      gl.uniform1f(wake.u.uInject, inject);
      gl.uniform1f(wake.u.uDt, dt);
      gl.uniform1f(wake.u.uTexel, 1 / WN);
      gl.uniform1f(wake.u.uAspect, canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      wakeIdx = next;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    use(surface);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(surface.u.uTime, (now - t0) / 1000);
    gl.uniform2f(surface.u.uRes, canvas.width, canvas.height);
    gl.uniform2f(surface.u.uPtr, bead.x, bead.y);
    gl.uniform1f(surface.u.uPtrSpeed, ptrSpeed);
    gl.uniform1f(surface.u.uScrollVel, scrollVel);
    gl.uniform1f(surface.u.uDrift, drift);
    gl.uniform3fv(surface.u.uBase, PALETTE.base);
    gl.uniform3fv(surface.u.uMid, PALETTE.mid);
    gl.uniform3fv(surface.u.uHigh, PALETTE.high);
    gl.uniform3fv(surface.u.uFold, PALETTE.fold);
    gl.uniform3fv(surface.u.uAccent, PALETTE.accent);
    gl.uniform1f(surface.u.uAccentMix, PALETTE.accentMix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, wake ? wakeTex[wakeIdx] : null);
    gl.uniform1i(surface.u.uWake, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!reduceMotion && !lost && active()) raf = requestAnimationFrame(frame);
  }

  var lost = false;
  function wakeUp() {
    if (!raf && !reduceMotion && !lost && active()) { prev = performance.now(); raf = requestAnimationFrame(frame); }
  }

  on(document, "visibilitychange", wakeUp);
  on(canvas, "webglcontextlost", function (e) { e.preventDefault(); lost = true; if (raf) cancelAnimationFrame(raf); raf = 0; });
  on(canvas, "webglcontextrestored", function () { window.location.reload(); });

  // with reduced motion this draws a single still frame
  raf = requestAnimationFrame(frame);

  return {
    wake: wakeUp,
    destroy: function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; lost = true;
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      gl.deleteProgram(surface.p);
      if (wake) {
        gl.deleteProgram(wake.p);
        wakeTex.forEach(function (t) { gl.deleteTexture(t); });
        wakeFbo.forEach(function (f) { gl.deleteFramebuffer(f); });
      }
      gl.deleteBuffer(quad);
    }
  };
}
