(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Page scroll progress (0 at top, 1 at the bottom of the page) — one
     shared, rAF-batched value. Both the hero readout and the rail's
     persistent signal object key off this, so "confidence" means the
     same thing everywhere: how far into the story you've scrolled.
     --------------------------------------------------------------------- */
  var pageProgressValue = 0;
  function updatePageProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    pageProgressValue = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  }
  updatePageProgress();
  function pageProgress() { return pageProgressValue; }
  if (!reduceMotion) {
    var pageProgressTicking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (pageProgressTicking) return;
        pageProgressTicking = true;
        requestAnimationFrame(function () {
          updatePageProgress();
          pageProgressTicking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", updatePageProgress);
  }

  /* ---------------------------------------------------------------------
     Theme toggle (defaults to system; manual choice persisted best-effort)
     --------------------------------------------------------------------- */
  (function themeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    var stored = null;
    try { stored = localStorage.getItem("ykg-theme"); } catch (e) { /* storage unavailable, ignore */ }
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
      btn.setAttribute("aria-pressed", "true");
    }
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var isDark = current
        ? current === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      btn.setAttribute("aria-pressed", "true");
      try { localStorage.setItem("ykg-theme", next); } catch (e) { /* ignore */ }
    });
  })();

  /* ---------------------------------------------------------------------
     Local clock (Waterloo, Ontario = America/Toronto)
     --------------------------------------------------------------------- */
  (function clock() {
    var el = document.getElementById("railClock");
    if (!el) return;
    function tick() {
      try {
        var fmt = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Toronto",
          hour: "2-digit",
          minute: "2-digit"
        });
        el.textContent = fmt.format(new Date());
      } catch (e) {
        el.textContent = "";
      }
    }
    tick();
    setInterval(tick, 30000);
  })();

  /* ---------------------------------------------------------------------
     Scroll-reveal, then continuous scroll-linked drift. Rows and cards
     don't just fade/slide in once and go static — once revealed, a row
     keeps a small vertical offset tied to where it sits in the viewport,
     drifting toward 0 as it nears center and the other way as it leaves,
     so the page keeps visibly responding to scroll the whole way through
     rather than only animating on entry. Restrained: a few pixels, not a
     showcase effect.
     --------------------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll("[data-reveal]");
    var PARALLAX_SELECTOR = ".dossier-row, .ledger-row, .quote, .channel";
    var parallaxEls = [];
    var parallaxTicking = false;
    var DRIFT = 16; // px of travel, edge to edge

    function updateParallax() {
      var vh = window.innerHeight;
      var center = vh / 2;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var elCenter = rect.top + rect.height / 2;
        var progress = (center - elCenter) / vh;
        progress = Math.max(-0.5, Math.min(0.5, progress));
        el.style.transform = "translateY(" + (progress * DRIFT).toFixed(1) + "px)";
      });
      parallaxTicking = false;
    }
    function onParallaxScroll() {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    }
    function activateParallax(el) {
      if (reduceMotion || !el.matches(PARALLAX_SELECTOR)) return;
      // Hand the transform over to JS: drop it from the CSS transition so
      // per-frame scroll updates apply instantly instead of chasing an
      // 0.8s easing curve meant for the one-time entrance only.
      el.style.transitionProperty = "opacity";
      parallaxEls.push(el);
      if (parallaxEls.length === 1) {
        window.addEventListener("scroll", onParallaxScroll, { passive: true });
        window.addEventListener("resize", onParallaxScroll);
        onParallaxScroll();
      }
    }

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () {
              el.classList.add("is-visible");
              activateParallax(el);
            }, (i % 6) * 60);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { io.observe(el); });

    // Safety net: never leave content permanently invisible (slow observer,
    // a browser quirk, a headless/print render that never fires an
    // intersection callback for off-screen elements).
    setTimeout(function () {
      items.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        el.classList.add("is-visible");
        activateParallax(el);
      });
    }, 2500);
  })();

  /* ---------------------------------------------------------------------
     Background parallax — the faint section numerals drift a little as
     their section crosses the viewport, so the page reads as layered
     rather than flat. Cheap: only a handful of elements, one rAF-batched
     scroll listener, plain transform (no layout writes).
     --------------------------------------------------------------------- */
  (function parallaxMarks() {
    if (reduceMotion) return;
    var marks = document.querySelectorAll(".section-mark");
    if (!marks.length) return;

    var ticking = false;
    var DRIFT = 46; // px of travel, edge to edge

    function update() {
      var vh = window.innerHeight;
      marks.forEach(function (el) {
        var parent = el.parentElement;
        if (!parent) return;
        var rect = parent.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        var progress = (vh / 2 - mid) / vh; // ~ -0.5 .. 0.5 while crossing the middle third
        progress = Math.max(-1, Math.min(1, progress));
        el.style.transform = "translateY(" + (progress * DRIFT).toFixed(1) + "px)";
      });
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();

  /* ---------------------------------------------------------------------
     Rail nav spy
     --------------------------------------------------------------------- */
  (function navSpy() {
    var links = document.querySelectorAll(".rail-nav a[data-nav]");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (a) { a.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* ---------------------------------------------------------------------
     Dossier accordion (project rows)
     --------------------------------------------------------------------- */
  (function accordion() {
    var rows = document.querySelectorAll(".dossier-row");
    rows.forEach(function (row) {
      var head = row.querySelector(".dossier-head");
      head.addEventListener("click", function () {
        var isOpen = row.classList.contains("is-open");
        rows.forEach(function (r) {
          r.classList.remove("is-open");
          r.querySelector(".dossier-head").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          row.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Earlier-roles toggle (experience ledger)
     --------------------------------------------------------------------- */
  (function ledgerToggle() {
    var btn = document.getElementById("ledgerToggle");
    if (!btn) return;
    var rows = document.querySelectorAll(".ledger-row--earlier");
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      rows.forEach(function (r) {
        r.hidden = expanded;
        if (!expanded) r.classList.add("is-visible");
      });
      btn.querySelector(":last-child") &&
        (btn.lastChild.textContent = expanded
          ? " Show earlier roles (2017 — 2020)"
          : " Hide earlier roles");
    });
  })();

  /* ---------------------------------------------------------------------
     Ambient WebGL "signal static" — a cheap, chunky, slowly-drifting noise
     field rendered at a fraction of screen resolution (image-rendering:
     pixelated upscales it into blocky interference rather than smooth
     photographic grain). Purely atmospheric, very low opacity. Falls back
     silently to the static SVG-noise layer in CSS if WebGL is unavailable.
     --------------------------------------------------------------------- */
  (function webglGrain() {
    var canvas = document.getElementById("grainCanvas");
    if (!canvas) return;
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    var vertSrc =
      "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
    var fragSrc =
      "precision mediump float;" +
      "uniform vec2 u_res; uniform float u_time;" +
      "float hash(vec2 v) { return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453); }" +
      "void main() {" +
      "  vec2 uv = gl_FragCoord.xy / u_res;" +
      "  float n = hash(floor(uv * u_res * 0.35) + floor(u_time * 6.0));" +
      "  gl_FragColor = vec4(vec3(n), 1.0);" +
      "}";

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, vertSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    var pLoc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    var resLoc = gl.getUniformLocation(program, "u_res");
    var timeLoc = gl.getUniformLocation(program, "u_time");

    var SCALE = 0.22; // render at ~22% resolution for a chunky, static-like look
    function resize() {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * SCALE));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    var t = 0;
    var running = true;
    function frame() {
      if (!running) return;
      gl.uniform1f(timeLoc, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      t += reduceMotion ? 0 : 0.02;
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    frame();
    document.documentElement.classList.add("has-webgl-grain");

    document.addEventListener("visibilitychange", function () {
      running = document.visibilityState === "visible";
      if (running && !reduceMotion) requestAnimationFrame(frame);
    });
  })();

  /* ---------------------------------------------------------------------
     Hero visual — a 3D "signal field": two blended wave layers (social
     attention / revenue) rendered as a wireframe terrain receding to a
     horizon, in the site's own amber/slate/near-black palette (no glow,
     no glass — a restrained take on a procedural WebGL hero, not a
     Three.js showcase). The layers' phases converge over time, and an
     HTML-overlaid confidence score climbs to match. Falls back to a flat
     2D correlation chart if WebGL isn't available.
     --------------------------------------------------------------------- */
  (function heroSignalField() {
    var canvas = document.getElementById("signalCanvas");
    if (!canvas) return;
    var scoreEl = document.getElementById("scoreValue");

    function cssVar(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return v ? v.trim() : fallback;
    }

    // Score reflects how far into the page you've scrolled, not elapsed
    // time — the same "confidence" the rail's signal object tracks.
    function scoreForProgress(progress) {
      var score = 58 + progress * 40 + Math.sin(Date.now() / 900) * (1 - progress) * 4;
      return Math.max(0, Math.min(99, Math.round(score)));
    }
    function tickScore() {
      if (scoreEl) scoreEl.textContent = scoreForProgress(pageProgress()) + "%";
    }

    run2DFallback();

    /* ---- 2D fallback (flat correlation chart) for browsers without WebGL ---- */
    function run2DFallback() {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var w = canvas.width, h = canvas.height;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      function point(x, phase, amp) {
        return Math.sin(x * 0.018 + phase) * amp + Math.sin(x * 0.041 + phase * 1.7) * amp * 0.28;
      }

      var running = true;
      function draw(seconds) {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = cssVar("--bg-raised", "#10151b");
        ctx.fillRect(0, 0, w, h);

        var midTop = h * 0.34, midBottom = h * 0.64, amp1 = h * 0.14, amp2 = h * 0.12;
        var t = seconds * 55;
        var progress = pageProgress();
        var drift = (1 - progress) * 1.6;

        ctx.beginPath();
        for (var x = 0; x <= w; x += 4) {
          var y = midTop + point(x, t * 0.016, amp1);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = cssVar("--accent", "#E7A23C");
        ctx.lineWidth = 2.2;
        ctx.lineJoin = "round";
        ctx.stroke();

        ctx.beginPath();
        for (var x2 = 0; x2 <= w; x2 += 4) {
          var y2 = midBottom + point(x2, t * 0.0157 + drift, amp2);
          if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = cssVar("--trace", "#6E8CA6");
        ctx.lineWidth = 2.2;
        ctx.stroke();

        tickScore();
      }

      var startTime = null;
      function loop(nowMs) {
        if (!running) return;
        if (startTime === null) startTime = nowMs;
        draw((nowMs - startTime) / 1000);
        if (!reduceMotion) requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

      document.addEventListener("visibilitychange", function () {
        running = document.visibilityState === "visible";
        if (running && !reduceMotion) requestAnimationFrame(loop);
      });

      var themeBtn = document.getElementById("themeToggle");
      if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(function () { draw(0); }, 10); });
    }
  })();

  /* ---------------------------------------------------------------------
     Signal float — the one 3D object on the page, pinned to the
     viewport itself (not any one section) so it's on screen the entire
     time you're on the page, on every screen size. Its geometry is
     driven by pageProgress: a loose scatter of points at the top of the
     page, pulling together into a solid wireframe icosahedron by the
     time you reach the bottom — "scattered signals" resolving into a
     "decision", literally, as you scroll. Hand-rolled WebGL, no
     libraries. Falls back to a plain static readout (no animation) if
     WebGL isn't available.
     --------------------------------------------------------------------- */
  (function signalFloat() {
    var canvas = document.getElementById("signalFloatCanvas");
    if (!canvas) return;
    var scoreEl = document.getElementById("signalFloatScore");

    // Pinned to one fixed spot in the viewport — it does not travel up,
    // down, or sideways at all. Sliding a dot along the edge as you
    // scroll read as a cheap scrollbar gimmick, not a meaningful object,
    // so all of the scroll-reactivity now lives in the object itself:
    // its own rotation, and the scatter-to-solid assembly driven by
    // pageProgress (see run3D below) — "scattered signals resolving
    // into a decision" as you read further. The only thing this block
    // still does is fade it in once you're past the hero and fade it
    // out again near the very bottom of the page.
    var floatWrap = canvas.closest(".signal-float");
    if (floatWrap) {
      var heroEl = document.getElementById("hero");

      function targetOpacity() {
        var vh = window.innerHeight;
        var p = pageProgress();
        var opacity = 1;
        if (heroEl) {
          var hr = heroEl.getBoundingClientRect();
          var heroClear = Math.min(1, Math.max(0, -hr.bottom / (vh * 0.4)));
          opacity = Math.min(opacity, heroClear);
        }
        var nearBottom = Math.max(0, (p - 0.94) / 0.06);
        opacity = Math.min(opacity, 1 - nearBottom);
        return opacity;
      }

      function apply(opacity) {
        floatWrap.style.opacity = String(opacity);
      }

      if (reduceMotion) {
        apply(targetOpacity());
        window.addEventListener("resize", function () { apply(targetOpacity()); });
      } else {
        var curOpacity = 0;
        (function floatTick() {
          curOpacity += (targetOpacity() - curOpacity) * 0.08;
          apply(curOpacity);
          requestAnimationFrame(floatTick);
        })();
      }
    }

    function cssVar(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return v ? v.trim() : fallback;
    }
    function hexToRgb01(hex, fallback) {
      hex = (hex || fallback).replace("#", "");
      if (hex.length !== 6) hex = fallback.replace("#", "");
      var n = parseInt(hex, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    function tickScore() {
      if (scoreEl) scoreEl.textContent = Math.round(58 + pageProgress() * 40) + "%";
    }

    // alpha: true (and a fully transparent clear below) so the canvas has
    // no backing fill of its own — the wireframe paints directly onto
    // whatever the page looks like underneath it, card or no card.
    var gl = canvas.getContext("webgl", { antialias: true, alpha: true }) ||
      canvas.getContext("experimental-webgl", { antialias: true, alpha: true });

    if (gl) {
      run3D(gl);
    } else {
      tickScore(); // static readout still means something without WebGL
    }

    function run3D(gl) {
      var vertSrc = [
        "attribute vec3 a_pos;",
        "attribute vec3 a_scatter;",
        "uniform mat4 u_proj;",
        "uniform float u_yaw;",
        "uniform float u_pitch;",
        "uniform float u_scatterAmt;",
        "uniform vec3 u_amber;",
        "uniform vec3 u_slate;",
        "varying vec3 v_color;",
        "varying float v_depth;",
        "void main() {",
        "  vec3 p = a_pos + a_scatter * u_scatterAmt;",
        "  float cy = cos(u_yaw); float sy = sin(u_yaw);",
        "  float x1 = p.x * cy + p.z * sy;",
        "  float z1 = -p.x * sy + p.z * cy;",
        "  float cx = cos(u_pitch); float sx = sin(u_pitch);",
        "  float y2 = p.y * cx - z1 * sx;",
        "  float z2 = p.y * sx + z1 * cx;",
        "  vec3 pos = vec3(x1, y2, z2) + vec3(0.0, 0.0, -4.4);",
        "  float mixT = clamp(0.5 + 0.5 * p.y, 0.0, 1.0);",
        "  v_color = mix(u_slate, u_amber, mixT);",
        "  v_depth = pos.z;",
        "  gl_Position = u_proj * vec4(pos, 1.0);",
        "}"
      ].join("\n");

      var fragSrc = [
        "precision mediump float;",
        "varying vec3 v_color;",
        "varying float v_depth;",
        "uniform vec3 u_fog;",
        "uniform float u_far;",
        "void main() {",
        "  float fog = clamp((-v_depth - 2.6) / u_far, 0.0, 1.0);",
        "  fog = fog * fog;",
        "  vec3 color = mix(v_color, u_fog, fog);",
        "  gl_FragColor = vec4(color, 1.0);",
        "}"
      ].join("\n");

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
        return s;
      }
      var vs = compile(gl.VERTEX_SHADER, vertSrc);
      var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
      if (!vs || !fs) { tickScore(); return; }

      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { tickScore(); return; }
      gl.useProgram(program);

      // Same icosahedron construction as the hero used to use: 12
      // vertices from the golden ratio, edges derived as the pairs at
      // the minimum pairwise distance.
      var PHI = (1 + Math.sqrt(5)) / 2;
      var raw = [
        [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
        [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
        [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
      ];
      var icoVerts = raw.map(function (v) {
        var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
      });
      function vDist(a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      var minEdge = Infinity;
      for (var vi = 0; vi < icoVerts.length; vi++) {
        for (var vj = vi + 1; vj < icoVerts.length; vj++) {
          var d0 = vDist(icoVerts[vi], icoVerts[vj]);
          if (d0 < minEdge) minEdge = d0;
        }
      }
      var edgeIdx = [];
      for (var ei = 0; ei < icoVerts.length; ei++) {
        for (var ej = ei + 1; ej < icoVerts.length; ej++) {
          if (Math.abs(vDist(icoVerts[ei], icoVerts[ej]) - minEdge) < 0.01) {
            edgeIdx.push(ei, ej);
          }
        }
      }
      var flatVerts = [];
      icoVerts.forEach(function (v) { flatVerts.push(v[0], v[1], v[2]); });

      // Each vertex's scatter target: pushed outward and off to a random
      // side, not just further along its own spoke — a jumbled cloud
      // rather than a bigger, cleaner icosahedron. At rest (u_scatterAmt
      // = 0) every point sits exactly on the icosahedron; at full scatter
      // (u_scatterAmt = 1) it's out in that cloud — "not yet resolved."
      var flatScatter = [];
      icoVerts.forEach(function (v) {
        var jitter = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
        var jLen = Math.sqrt(jitter[0] * jitter[0] + jitter[1] * jitter[1] + jitter[2] * jitter[2]) || 1;
        var outward = 0.12 + Math.random() * 0.22;
        var side = 0.55 + Math.random() * 0.45;
        flatScatter.push(
          v[0] * outward + (jitter[0] / jLen) * side,
          v[1] * outward + (jitter[1] / jLen) * side,
          v[2] * outward + (jitter[2] / jLen) * side
        );
      });

      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatVerts), gl.STATIC_DRAW);
      var aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

      var sbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatScatter), gl.STATIC_DRAW);
      var aScatter = gl.getAttribLocation(program, "a_scatter");
      gl.enableVertexAttribArray(aScatter);
      gl.vertexAttribPointer(aScatter, 3, gl.FLOAT, false, 0, 0);

      var ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edgeIdx), gl.STATIC_DRAW);

      var uProj = gl.getUniformLocation(program, "u_proj");
      var uYaw = gl.getUniformLocation(program, "u_yaw");
      var uPitch = gl.getUniformLocation(program, "u_pitch");
      var uScatterAmt = gl.getUniformLocation(program, "u_scatterAmt");
      var uAmber = gl.getUniformLocation(program, "u_amber");
      var uSlate = gl.getUniformLocation(program, "u_slate");
      var uFog = gl.getUniformLocation(program, "u_fog");
      var uFar = gl.getUniformLocation(program, "u_far");

      function applyColors() {
        var amber = hexToRgb01(cssVar("--accent"), "#E7A23C");
        var slate = hexToRgb01(cssVar("--trace"), "#6E8CA6");
        // Fog is the real page background, not a card color — the far
        // edges of the wireframe fade toward whatever the page looks like
        // right there, since there's no card to fade into anymore.
        var fog = hexToRgb01(cssVar("--bg"), "#0B0D10");
        gl.uniform3f(uAmber, amber[0], amber[1], amber[2]);
        gl.uniform3f(uSlate, slate[0], slate[1], slate[2]);
        gl.uniform3f(uFog, fog[0], fog[1], fog[2]);
        // Fully transparent clear — no fill behind the lines at all.
        gl.clearColor(0, 0, 0, 0);
      }
      applyColors();
      gl.uniform1f(uFar, 5.4);

      function perspective(fovyRad, aspect, near, far) {
        var f = 1 / Math.tan(fovyRad / 2);
        var nf = 1 / (near - far);
        return new Float32Array([
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (far + near) * nf, -1,
          0, 0, 2 * far * near * nf, 0
        ]);
      }

      function resize() {
        var w = canvas.clientWidth || 108;
        var h = canvas.clientHeight || 108;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniformMatrix4fv(uProj, false, perspective((38 * Math.PI) / 180, w / h, 0.1, 20));
      }
      resize();
      window.addEventListener("resize", resize);

      var BASE_PITCH = 0.5;
      var yawAccum = 0;
      var scatterCurrent = 1;
      var startTime = null;
      var lastMs = null;
      var running = true;

      // A flywheel, not a fixed spin: scrolling adds angular momentum
      // directly (down spins one way, up the other, faster flicks spin
      // harder), which then coasts to a stop under friction rather than
      // cutting instantly. That's the actual scroll-reactivity now that
      // the object no longer moves position — you can feel it respond to
      // your own scrolling in real time, not just glance at a slow, fixed
      // idle spin. It never fully stops, though: a gentle idle rotation
      // keeps it alive between scrolls.
      var lastScrollY = window.scrollY;
      var scrollSpin = 0;

      function render(nowMs) {
        if (!running) return;
        if (startTime === null) { startTime = nowMs; lastMs = nowMs; }
        var seconds = (nowMs - startTime) / 1000;
        var dt = Math.min(0.05, (nowMs - lastMs) / 1000);
        lastMs = nowMs;

        var progress = pageProgress();
        var scatterTarget = 1 - progress;
        scatterCurrent += (scatterTarget - scatterCurrent) * 0.09;

        if (reduceMotion) {
          // Even under "reduce motion" this should never read as inert —
          // just calm: a slow, steady turn with no scroll-linked bursts.
          yawAccum += dt * 0.12;
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(uYaw, yawAccum);
          gl.uniform1f(uPitch, BASE_PITCH);
          gl.uniform1f(uScatterAmt, scatterCurrent);
          gl.drawElements(gl.LINES, edgeIdx.length, gl.UNSIGNED_SHORT, 0);
          tickScore();
          requestAnimationFrame(render);
          return;
        }

        var scrollY = window.scrollY;
        var scrollDelta = scrollY - lastScrollY;
        lastScrollY = scrollY;
        scrollSpin += scrollDelta * 0.0055;
        scrollSpin = Math.max(-3.2, Math.min(3.2, scrollSpin));
        scrollSpin *= 0.94; // friction — coasts down rather than cutting off

        // A calmer always-on idle spin underneath the scroll-driven kick,
        // a little quicker while still unresolved. Brisk enough that a
        // full turn takes a few seconds, not the better part of a minute.
        var idleSpeed = 1.15 - progress * 0.35;
        yawAccum += dt * (idleSpeed + scrollSpin);

        // A slow secondary tumble on the other axis so it reads as a real
        // 3D object turning in space, not a flat disc spinning in place.
        var pitch = BASE_PITCH + Math.sin(seconds * 0.4) * 0.22 + scrollSpin * 0.05;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uYaw, yawAccum);
        gl.uniform1f(uPitch, pitch);
        gl.uniform1f(uScatterAmt, scatterCurrent);
        gl.drawElements(gl.LINES, edgeIdx.length, gl.UNSIGNED_SHORT, 0);

        tickScore();
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      document.addEventListener("visibilitychange", function () {
        running = document.visibilityState === "visible";
        if (running && !reduceMotion) requestAnimationFrame(render);
      });

      var themeBtn = document.getElementById("themeToggle");
      if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(applyColors, 10); });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        setTimeout(applyColors, 10);
      });
    }
  })();
})();
