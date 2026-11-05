/* Elite Fit /groupfitness chooser · motion · v1 rev 5 · 29 Oct 2026 · Digital Movement
   Pairs with chooser/motion.css. Does nothing unless the head script set html.motion-ok (JS on, no reduced motion, no Save-Data),
   so without it every card is simply visible. No scroll listeners: IntersectionObserver only; layout is read once at start
   (and after a resize), always before any class is written.
   1. Faces rule. Each thumb <img>/<source> carries data-faces (face boxes of that file, normalised x,y,w,h;...). For the crop
      on screen (object-fit: cover + object-position) a zoom is allowed only if every face in view keeps >= 10 % margin from
      the frame edge at rest AND at the extreme frame. data-settle (1.04) and data-zoom (1.03) are set on the card's <li> with
      the first safe transform origin (--m-o / --m-oz). No data-faces, or a face already cut by the frame: no zoom.
   2. Cascade. Items fully below the fold get .rv (hidden by motion.css) and .in once as they enter, staggered 70 ms per row
      position (max 3 steps). Items in view at load are never hidden. Focus inside a hidden or moving card shows it at once.
   3. Lock. A card is .settled once its thumbnail settle is complete, so the scroll-driven settle never replays.
   Changelog: v1 rev 5 (29 Oct 2026) faces rule, row stagger, settle lock, focus guard. v1 (27 Oct 2026) staggered reveal. */
(function () {
  'use strict';
  var d = document, de = d.documentElement, w = window;
  if (!de.classList.contains('motion-ok')) { return; }
  d.addEventListener('touchstart', function () {}, { passive: true }); // lets iOS Safari show :active press states

  var cards = [].slice.call(d.querySelectorAll('.grid > li'));
  var items = [].slice.call(d.querySelectorAll('[data-reveal]'));
  var SETTLE = [[50, 50], [50, 0], [50, 100], [0, 50], [100, 50], [0, 0], [100, 0], [0, 100], [100, 100]];
  var ZOOM = [[50, 0], [50, 50], [0, 0], [100, 0], [0, 50], [100, 50], [50, 100], [0, 100], [100, 100]];

  function activeSource(img) {
    var ss = img.parentNode.getElementsByTagName('source');
    for (var i = 0; i < ss.length; i++) {
      var m = ss[i].getAttribute('media');
      if (!m || w.matchMedia(m).matches) { return ss[i]; }
    }
    return img;
  }
  function off(v, free) { return /%$/.test(v) ? free * parseFloat(v) / 100 : (parseFloat(v) || 0); }

  /* read phase: frame size, crop and face boxes in frame pixels; null = unknown, no zoom */
  function geometry(li) {
    var media = li.querySelector('.card__media'), img = media && media.querySelector('img');
    if (!img) { return null; }
    var s = activeSource(img), raw = s.getAttribute('data-faces');
    var iw = +s.getAttribute('width') || img.naturalWidth, ih = +s.getAttribute('height') || img.naturalHeight;
    var fw = media.clientWidth, fh = media.clientHeight;
    if (raw === null || !iw || !ih || !fw || !fh) { return null; }
    var pos = getComputedStyle(img).objectPosition.split(' ');
    var k = Math.max(fw / iw, fh / ih), rw = iw * k, rh = ih * k;
    var ox = off(pos[0], fw - rw), oy = off(pos[1] || '50%', fh - rh), boxes = [];
    var list = raw ? raw.split(';') : [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i].split(',').map(Number);
      var x0 = ox + f[0] * rw, y0 = oy + f[1] * rh, x1 = x0 + f[2] * rw, y1 = y0 + f[3] * rh;
      if (x1 <= 0 || y1 <= 0 || x0 >= fw || y0 >= fh) { continue; }          // outside the crop: a zoom only pushes it further out
      if (x0 < 0 || y0 < 0 || x1 > fw || y1 > fh) { return { fw: fw, fh: fh, cut: true }; } // already cut by the frame
      boxes.push([x0, y0, x1, y1]);
    }
    return { fw: fw, fh: fh, boxes: boxes };
  }
  function margin(b, g) { return Math.min(b[0] / g.fw, b[1] / g.fh, (g.fw - b[2]) / g.fw, (g.fh - b[3]) / g.fh); }
  function safeOrigin(g, scale, origins) {
    if (!g || g.cut) { return null; }
    for (var o = 0; o < origins.length; o++) {
      var tx = origins[o][0] / 100 * g.fw, ty = origins[o][1] / 100 * g.fh, ok = true;
      for (var i = 0; i < g.boxes.length && ok; i++) {
        var b = g.boxes[i];
        var z = [tx + (b[0] - tx) * scale, ty + (b[1] - ty) * scale, tx + (b[2] - tx) * scale, ty + (b[3] - ty) * scale];
        ok = margin(b, g) >= 0.1 && margin(z, g) >= 0.1;   // margins are linear in scale, so rest + extreme cover every frame
      }
      if (ok) { return origins[o][0] + '% ' + origins[o][1] + '%'; }
    }
    return null;
  }
  function flag(li, attr, prop, origin) {
    if (origin) { li.setAttribute(attr, ''); li.style.setProperty(prop, origin); }
    else { li.removeAttribute(attr); li.style.removeProperty(prop); }
  }
  function faces() {
    var geo = cards.map(geometry);                                          // read
    cards.forEach(function (li, i) {                                        // write
      flag(li, 'data-settle', '--m-o', safeOrigin(geo[i], 1.04, SETTLE));
      flag(li, 'data-zoom', '--m-oz', safeOrigin(geo[i], 1.03, ZOOM));
    });
  }
  /* WebKit can run a deferred script before the stylesheets apply; measure only once every sheet is in */
  var sheets = [].slice.call(d.querySelectorAll('link[rel="stylesheet"]')).filter(function (l) { return !l.sheet; });
  if (!sheets.length) { start(); }
  else {
    var left = sheets.length;
    sheets.forEach(function (l) {
      var done = function () { l.removeEventListener('load', done); l.removeEventListener('error', done); if (--left === 0) { start(); } };
      l.addEventListener('load', done); l.addEventListener('error', done);
    });
  }

  function start() {
  faces();
  var rt;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(faces, 150); }, { passive: true });

  if (!('IntersectionObserver' in w)) { return; }
  var vh = w.innerHeight;
  var tops = items.map(function (el) { return el.getBoundingClientRect().top; }); // read
  items.forEach(function (el, i) { if (tops[i] >= vh) { el.classList.add('rv'); } }); // write

  function lock(el) { el.classList.add('settled'); io.unobserve(el); }
  var io = new IntersectionObserver(function (entries) {
    var fresh = [];
    entries.forEach(function (e) {
      var el = e.target;
      el.mRatio = e.intersectionRatio;
      el.mPast = e.boundingClientRect.top < 0;
      if (e.isIntersecting && e.intersectionRatio >= 0.08 && !el.classList.contains('in')) { fresh.push(e); }
      else if (el.mDone && (el.mRatio >= 0.5 || el.mPast)) { lock(el); }
    });
    fresh.sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); });
    fresh.forEach(function (e, n) {
      var el = e.target, step = Math.min(n, 3) * 70;
      el.style.setProperty('--d', step + 'ms');
      el.classList.add('in');
      setTimeout(function () { el.mDone = true; if (el.mRatio >= 0.5 || el.mPast) { lock(el); } }, 700 + step);
    });
  }, { threshold: [0, 0.08, 0.5] });
  items.forEach(function (el) { if (el.classList.contains('rv')) { io.observe(el); } });

  d.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('.rv');
    if (el && !el.classList.contains('settled')) { el.classList.add('now', 'in'); el.mDone = true; lock(el); }
  });
  }
})();
