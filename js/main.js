(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var motion = !reduce && 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Rotating word in the headline: leaves upward with a blur, the next one rises in
  var words = ['compréhensible', 'utile', 'désirable', 'concrète'];
  var el = document.getElementById('swap'), i = 0;
  if (el && !reduce) {
    setInterval(function () {
      el.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % words.length; el.textContent = words[i];
        el.classList.remove('out'); el.classList.add('enter');
        void el.offsetWidth;
        el.classList.remove('enter');
      }, 450);
    }, 2900);
  }

  // Project filters, with a small pop on the cards that stay lit
  var buttons = $$('.filters button');
  var cards = $$('.project');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f;
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var on = f === 'all' || c.dataset.cat.split(' ').indexOf(f) !== -1;
        c.classList.toggle('dim', !on);
        c.classList.remove('pop');
        if (on && !reduce) { void c.offsetWidth; c.classList.add('pop'); }
      });
    });
  });

  // Copy e-mail
  var copyBtn = document.getElementById('copy-mail');
  copyBtn.addEventListener('click', function () {
    var txt = document.getElementById('mail').textContent;
    var done = function () { copyBtn.textContent = 'Copié'; setTimeout(function () { copyBtn.textContent = 'Copier'; }, 1600); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(done, function () { selectText(); });
    } else { selectText(); }
    function selectText() { var r = document.createRange(); r.selectNodeContents(document.getElementById('mail')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  });

  // Scroll progress, nav state, active section
  var nav = $('.nav');
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var links = $$('.nav ul a');
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var hero = $('.hero'), heroWrap = $('.hero .wrap'), cv = document.getElementById('contours');
  var ticking = false, tl = $('.timeline');
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 12);
    var current = -1;
    sections.forEach(function (s, k) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = k; });
    links.forEach(function (a, k) { a.classList.toggle('active', k === current); });
    if (!reduce && hero) {
      var h = hero.offsetHeight;
      if (y < h) {
        var p = y / h;
        heroWrap.style.translate = '0 ' + (y * 0.28).toFixed(1) + 'px';
        heroWrap.style.opacity = Math.max(0, 1 - p * 1.25).toFixed(3);
        if (cv) cv.style.transform = 'scale(' + (1 + p * 0.12).toFixed(4) + ')';
      }
    }
    if (motion && tl) {
      var r = tl.getBoundingClientRect();
      tl.style.setProperty('--tl', Math.max(0, Math.min(1, (window.innerHeight * 0.8 - r.top) / r.height)).toFixed(4));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (motion) {
    root.classList.add('motion');

    // Split section titles into masked words
    $$('.head h2, .contact h2').forEach(function (h) {
      var n = 0, parts = [];
      Array.prototype.slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (t) { if (t) parts.push(/^\s+$/.test(t) ? document.createTextNode(t) : t); });
        } else { parts.push(node); }
      });
      h.textContent = '';
      parts.forEach(function (p) {
        if (p.nodeType === 3) { h.appendChild(p); return; }
        var w = document.createElement('span'), inner = document.createElement('span');
        w.className = 'w'; inner.style.setProperty('--wi', n++);
        if (typeof p === 'string') inner.textContent = p; else inner.appendChild(p);
        w.appendChild(inner); h.appendChild(w);
      });
      h.classList.add('split');
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    });

    // Tag what enters, and how
    var tag = function (sel, kind) { $$(sel).forEach(function (n) { if (!n.dataset.a) n.dataset.a = kind; }); };
    tag('.head .label, .contact > .wrap > .label', 'fade');
    tag('.about > div:first-child > p, .fact, .pillar, .filters button, .skills > div, .contact-line, .contact footer', 'up');
    tag('.project, .engage', 'scale');
    tag('.timeline li', 'fade');

    // Hero entrance, staggered on load
    var heroSeq = $$('.hero .who, .hero .h1-line, .hero .lede, .hero .chip, .hero .btn');
    heroSeq.forEach(function (n, k) {
      n.dataset.a = n.classList.contains('chip') ? 'pop' : 'up';
      n.style.setProperty('--d', (120 + k * 90) + 'ms');
    });
    // Once an element has entered, it drops its entrance styles and gets back its own hover transitions
    var settle = function (n, ms) { setTimeout(function () { delete n.dataset.a; n.style.removeProperty('--d'); }, ms); };
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      heroSeq.forEach(function (n, k) { n.classList.add('in'); settle(n, 120 + k * 90 + 1300); });
    }); });

    // Scroll entrances: whatever arrives together is staggered
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        io.unobserve(t);
        if (t.dataset.a) {
          var d = t.closest('.timeline') ? Math.min(k++ * 160, 1120) : Math.min(k++ * 85, 680);
          t.style.setProperty('--d', d + 'ms');
          settle(t, d + 1300);
        }
        t.classList.add('in');
        if (t.classList.contains('fact')) countUp(t.querySelector('b'));
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    $$('[data-a], .split').forEach(function (n) { if (heroSeq.indexOf(n) === -1) io.observe(n); });
    // At the very bottom of the page, nothing is left waiting
    window.addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      $$('[data-a]:not(.in), .split:not(.in)').forEach(function (n) { n.classList.add('in'); io.unobserve(n); if (n.dataset.a) settle(n, 1300); });
    }, { passive: true });

    // Count-up for the key figures, ending on the exact original text
    var countUp = function (b) {
      if (!b) return;
      var orig = b.textContent, m = orig.replace(/\s/g, '').match(/^(\d+)(.*)$/);
      if (!m) return;
      var target = parseInt(m[1], 10), suffix = m[2], start = null, dur = 1600;
      var fmt = function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
      (function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(2, -10 * p);
        b.textContent = p < 1 ? fmt(Math.round(target * e)) + suffix : orig;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    };
  }

  if (!reduce && fine) {
    // 3D tilt with a light that follows the cursor
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.classList.add('tilting');
        c.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
        c.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        c.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () {
        c.classList.remove('tilting');
        c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
      });
    });

    // Magnetic buttons
    $$('.btn, .copy').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.classList.add('magnet');
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.classList.remove('magnet'); b.style.translate = ''; });
    });

    // Soft glow following the cursor in the hero
    if (hero) {
      var gx = 70, gy = 30, tx = 70, ty = 30, glowing = false;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
        if (!glowing) { glowing = true; requestAnimationFrame(glow); }
      });
      var glow = function () {
        gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
        hero.style.setProperty('--hx', gx.toFixed(2) + '%'); hero.style.setProperty('--hy', gy.toFixed(2) + '%');
        if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.1) requestAnimationFrame(glow); else glowing = false;
      };
    }
  }

  // Living contour map behind the hero (value noise, marching squares)
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W, H, dpr, cell = 14, t = 0;
  var perm = []; for (var k = 0; k < 512; k++) perm[k] = Math.floor(Math.random() * 256);
  function hash(x, y) { return perm[(perm[x & 255] + y) & 255] / 255; }
  function smooth(v) { return v * v * (3 - 2 * v); }
  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    var u = smooth(xf), v = smooth(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function field(x, y) { return noise(x * 0.012 + t, y * 0.012) * 0.65 + noise(x * 0.03, y * 0.03 - t * 0.6) * 0.35; }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--contour').trim() || 'rgba(38,72,216,.16)';
    ctx.lineWidth = 1;
    var cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, g = [];
    for (var y = 0; y < rows; y++) { g[y] = []; for (var x = 0; x < cols; x++) g[y][x] = field(x * cell, y * cell); }
    ctx.beginPath();
    for (var lv = 0.25; lv < 0.8; lv += 0.06) {
      for (var y2 = 0; y2 < rows - 1; y2++) for (var x2 = 0; x2 < cols - 1; x2++) {
        var a = g[y2][x2], b = g[y2][x2 + 1], c = g[y2 + 1][x2 + 1], d = g[y2 + 1][x2];
        var pts = [], px = x2 * cell, py = y2 * cell;
        if ((a < lv) !== (b < lv)) pts.push([px + cell * (lv - a) / (b - a), py]);
        if ((b < lv) !== (c < lv)) pts.push([px + cell, py + cell * (lv - b) / (c - b)]);
        if ((d < lv) !== (c < lv)) pts.push([px + cell * (lv - d) / (c - d), py + cell]);
        if ((a < lv) !== (d < lv)) pts.push([px, py + cell * (lv - a) / (d - a)]);
        if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
      }
    }
    ctx.stroke();
  }
  resize(); draw();
  window.addEventListener('resize', function () { resize(); draw(); });
  if (!reduce) {
    var last = 0, heroVisible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(cv);
    (function loop(ts) {
      if (heroVisible && ts - last > 66) { t += 0.0025; draw(); last = ts; }
      requestAnimationFrame(loop);
    })(0);
  }
})();
