/* Elite Fit Group Fitness concept v1 · motion.js
   EF.motion: enter-view reveals (rise, stagger, mask, deal), pointer tilt, odometer roll, fast-scroll flag.
   Native scroll only. Transform, opacity and clip-path are animated by CSS (gf.css, bottom block);
   this file only sets state classes: html.m-ready, element.m-in, html.m-fast.
   Content is fully visible without JS: nothing is hidden until this file adds html.m-ready. */
(function () {
'use strict';
var w = window, d = document, root = d.documentElement;
var EF = w.EF = w.EF || {};
if (EF.motion && EF.motion.version) { return; }

var VERSION = '1.0.0';
var RATIO = 0.15;            /* contract: IntersectionObserver threshold .15, rootMargin 0 0 -8% 0 */
var BOTTOM = 0.08;
var REPLAY_MS = 1200;        /* children swapped in within this long after their container revealed replay the entrance */
var ROLL_MS = 400;
var FAST_PX_MS = 2.5;        /* contract: scroll speed > 2.5 px/ms */
var FAST_HOLD = 400;
var TILT_MAX = 3;            /* degrees */
var REVEAL = ['rise', 'stagger', 'mask', 'deal'];

var HAS_IO = 'IntersectionObserver' in w;
var slice = Array.prototype.slice;
var raf = w.requestAnimationFrame ? function (f) { return w.requestAnimationFrame(f); } : function (f) { return w.setTimeout(f, 16); };
function now() { return (w.performance && w.performance.now) ? w.performance.now() : Date.now(); }
function guard(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { return undefined; } }; }
function qsa(sel, ctx) { try { return slice.call((ctx || d).querySelectorAll(sel)); } catch (e) { return []; } }
function mq(q) { try { return w.matchMedia ? w.matchMedia(q) : null; } catch (e) { return null; } }
function yes(m) { return !!(m && m.matches); }
function listen(m, fn) { if (!m) { return; } if (m.addEventListener) { m.addEventListener('change', fn); } else if (m.addListener) { m.addListener(fn); } }
function saveData() { try { var c = navigator.connection; return !!(c && c.saveData); } catch (e) { return false; } }
function vh() { return w.innerHeight || root.clientHeight || 800; }
function inDoc(el) { return !!el && root.contains(el); }
function tokens(el) { return String(el.getAttribute('data-motion') || '').split(/\s+/); }
function has(list, t) { return list.indexOf(t) > -1; }
function isReveal(list) { for (var i = 0; i < REVEAL.length; i++) { if (has(list, REVEAL[i])) { return true; } } return false; }

var mqReduce = mq('(prefers-reduced-motion: reduce)');
var mqFine = mq('(hover: hover) and (pointer: fine)');
var active = false;          /* motion allowed right now (EF.motion.on) */
var booted = false;
var io = null;
var holding = false;         /* boot: nothing is released until the hidden state has been painted */
var held = [];

/* ---------- reveals ---------- */
function reveal(el) {
  if (!el.classList.contains('m-in')) { el.classList.add('m-in'); }
  el.__mInAt = now();
  if (io) { io.unobserve(el); }
}
function revealAll() {
  qsa('[data-motion]').forEach(function (el) { if (isReveal(tokens(el))) { reveal(el); } });
  if (io) { io.disconnect(); }
}
function indexKids(el) {
  var kids = el.children, fresh = 0, i, k;
  for (i = 0; i < kids.length; i++) {
    k = kids[i];
    if (!k.__mKid) {
      k.__mKid = true;
      fresh++;
      if (k.style && !k.style.getPropertyValue('--i')) { k.style.setProperty('--i', String(i)); }
    }
  }
  return { fresh: fresh, total: kids.length };
}
var onIntersect = guard(function (entries) {
  entries.forEach(function (e) {
    var el = e.target;
    if (e.isIntersecting && e.intersectionRatio >= RATIO) { reveal(el); }
    else if (!e.isIntersecting && e.boundingClientRect.top < 0) { reveal(el); }   /* scrolled past: show it, nobody sees it */
  });
});
function makeIO() {
  if (io || !HAS_IO) { return; }
  io = new w.IntersectionObserver(onIntersect, { threshold: [0, RATIO], rootMargin: '0px 0px -' + (BOTTOM * 100) + '% 0px' });
}
function collect(ctx) {
  var out = [];
  var list = qsa('[data-motion]', ctx);
  if (ctx && ctx.nodeType === 1 && ctx.hasAttribute && ctx.hasAttribute('data-motion')) { list.unshift(ctx); }
  list.forEach(function (el) {
    var t = tokens(el);
    var kids = (has(t, 'stagger') || has(t, 'deal')) ? indexKids(el) : null;
    if (!isReveal(t)) { return; }
    if (el.__mSeen) {
      /* same container, brand-new children right after it revealed (page.js swaps its loading line for the cards) */
      if (kids && kids.total && kids.fresh === kids.total && el.classList.contains('m-in') && el.__mInAt && now() - el.__mInAt < REPLAY_MS && io) {
        el.classList.remove('m-in');
        el.__mInAt = 0;
        io.observe(el);
      }
      return;
    }
    el.__mSeen = true;
    if (el.classList.contains('m-in')) { return; }
    out.push(el);
    if (holding) { held.push(el); } else if (io) { io.observe(el); }
  });
  return out;
}
function scan(ctx) {
  if (!active || !io) { return; }
  collect(ctx && ctx.nodeType ? ctx : d);
}
function firstView(r) {
  var top = Math.max(r.top, 0), bot = Math.min(r.bottom, vh() * (1 - BOTTOM)), h = bot - top;
  if (r.width === 0 && r.height === 0) { return false; }
  if (r.bottom <= 0) { return true; }
  return h > 0 && (h >= r.height * RATIO || h >= vh() * 0.35);
}
function paintedAlready() {
  try { return w.performance.getEntriesByType('paint').length > 0; } catch (e) { return false; }
}
function afterFirstPaint(fn) {
  /* Browsers start no transition before their first paint, so the entrance waits for it (hidden state painted, then released). */
  var done = false;
  function go() { if (done) { return; } done = true; raf(guard(fn)); }
  try {
    var po = new w.PerformanceObserver(function (l) { if (l.getEntries().length) { po.disconnect(); go(); } });
    po.observe({ type: 'paint', buffered: true });
  } catch (e) { raf(function () { raf(function () { w.setTimeout(go, 30); }); }); }
  w.setTimeout(go, 700);
}
function revealInView(list) {
  var rects = list.map(function (el) { return el.getBoundingClientRect(); });
  list.forEach(function (el, i) { if (firstView(rects[i])) { reveal(el); } });
}
function release() {
  holding = false;
  var list = held;
  held = [];
  revealInView(list);
  list.forEach(function (el) { if (!el.classList.contains('m-in') && io) { io.observe(el); } });
}
function boot() {
  booted = true;
  var painted = paintedAlready();
  holding = !painted;
  var list = collect(d);
  if (painted) {
    /* The page is already on screen (slow script): never hide what is in view, no flash. */
    revealInView(list);
    root.classList.add('m-ready');
    return;
  }
  /* Commit the hidden pre-state without transitions; the first paint shows it; then in-view elements transition in (hero line rises on load). */
  var st = d.createElement('style');
  st.setAttribute('data-ef-motion', '');
  st.textContent = 'html.m-boot *,html.m-boot *::before,html.m-boot *::after{transition:none!important}';
  (d.head || root).appendChild(st);
  root.classList.add('m-boot');
  root.classList.add('m-ready');
  void root.offsetWidth;
  root.classList.remove('m-boot');
  void root.offsetWidth;
  afterFirstPaint(release);
}

/* ---------- fast scroll flag ---------- */
var lastY = 0, lastT = 0, ticking = false, fastTimer = 0, scrollWired = false;
function measureScroll() {
  ticking = false;
  var y = w.pageYOffset || root.scrollTop || 0, t = now(), dt = t - lastT;
  if (dt > 0 && lastT) {
    if (Math.abs(y - lastY) / dt > FAST_PX_MS) {
      root.classList.add('m-fast');
      w.clearTimeout(fastTimer);
      fastTimer = w.setTimeout(function () { root.classList.remove('m-fast'); }, FAST_HOLD);
    }
  }
  lastY = y; lastT = t;
}
var onScroll = guard(function () {
  if (!active || ticking) { return; }
  ticking = true;
  raf(guard(measureScroll));
});
function wireScroll() {
  if (scrollWired) { return; }
  scrollWired = true;
  lastY = w.pageYOffset || 0;
  lastT = now();
  w.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- pointer tilt (fine pointers only) ---------- */
var tiltHost = null, tiltTarget = null, tiltRaf = 0, tx = 0, ty = 0;
function tiltReset() {
  if (tiltTarget) { tiltTarget.style.transform = ''; }
  tiltHost = null; tiltTarget = null;
}
function tiltApply() {
  tiltRaf = 0;
  if (!tiltTarget || !active) { return; }
  var r = tiltTarget.getBoundingClientRect();
  if (!r.width || !r.height) { return; }
  var nx = Math.max(-1, Math.min(1, (tx - (r.left + r.width / 2)) / (r.width / 2)));
  var ny = Math.max(-1, Math.min(1, (ty - (r.top + r.height / 2)) / (r.height / 2)));
  var own = tiltTarget === tiltHost ? 'perspective(900px) ' : '';
  tiltTarget.style.transform = own + 'rotateX(' + (-ny * TILT_MAX).toFixed(2) + 'deg) rotateY(' + (nx * TILT_MAX).toFixed(2) + 'deg)';
}
var onPointerMove = guard(function (e) {
  if (!active || !yes(mqFine) || e.pointerType === 'touch') { return; }
  var host = e.target && e.target.closest ? e.target.closest('[data-motion~="tilt"]') : null;
  if (host !== tiltHost) {
    tiltReset();
    if (host) { tiltHost = host; tiltTarget = host.querySelector('[data-tilt-target]') || host; }
  }
  if (!tiltHost) { return; }
  tx = e.clientX; ty = e.clientY;
  if (!tiltRaf) { tiltRaf = raf(guard(tiltApply)); }
});
d.addEventListener('pointermove', onPointerMove, { passive: true });
d.addEventListener('pointerout', function (e) { if (!e.relatedTarget) { tiltReset(); } });   /* pointer left the window */
w.addEventListener('blur', function () { tiltReset(); });

/* ---------- odometer ---------- */
var rollIO = null;
function mk(cls, txt) {
  var s = d.createElement('span');
  if (cls) { s.className = cls; }
  if (txt !== undefined) { s.textContent = txt; }
  return s;
}
function buildStatic(el, str) {
  var odo = mk('odo'), i, col;
  el.textContent = '';
  odo.style.fontVariantNumeric = 'tabular-nums';
  for (i = 0; i < str.length; i++) { col = mk('odo__col'); col.appendChild(mk('', str.charAt(i))); odo.appendChild(col); }
  el.appendChild(odo);
}
function rollFinish(el) {
  var st = el.__mRoll;
  if (!st) { return; }
  w.clearTimeout(st.timer);
  if (st.busy) { buildStatic(el, st.target); }
  st.str = st.target;
  st.busy = false;
}
function sequence(f, t) {
  var seq = [], a, b, i;
  if (f === t) { return [t]; }
  if (f === '') { return ['', t]; }
  if (t === '') { return [f, '']; }
  a = +f; b = +t;
  if (b > a) { for (i = a; i <= b; i++) { seq.push(String(i)); } }
  else { for (i = a; i >= b; i--) { seq.push(String(i)); } }
  return seq;
}
function rollAnimate(el, from, to) {
  var st = el.__mRoll, len = Math.max(from.length, to.length), i, f, t, col, seq, k, odo = mk('odo'), cols = [];
  while (from.length < len) { from = ' ' + from; }
  while (to.length < len) { to = ' ' + to; }
  odo.style.fontVariantNumeric = 'tabular-nums';
  for (i = 0; i < len; i++) {
    f = from.charAt(i) === ' ' ? '' : from.charAt(i);
    t = to.charAt(i) === ' ' ? '' : to.charAt(i);
    seq = sequence(f, t);
    col = mk('odo__col');
    for (k = 0; k < seq.length; k++) { col.appendChild(mk('', seq[k])); }
    col.__mSteps = seq.length;
    cols.push(col);
    odo.appendChild(col);
  }
  el.textContent = '';
  el.appendChild(odo);
  st.busy = true;
  void odo.offsetWidth;                        /* commit the start position, then slide */
  cols.forEach(function (c) { if (c.__mSteps > 1) { c.style.transform = 'translateY(-' + (((c.__mSteps - 1) / c.__mSteps) * 100).toFixed(4) + '%)'; } });
  w.clearTimeout(st.timer);
  st.timer = w.setTimeout(guard(function () { rollFinish(el); }), ROLL_MS + 120);
}
function inView(el) {
  var r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < vh() && r.width > 0;
}
function queueEnter(el) {
  if (!HAS_IO) { return; }
  if (!rollIO) {
    rollIO = new w.IntersectionObserver(guard(function (entries) {
      entries.forEach(function (e) {
        var el = e.target, st = el.__mRoll;
        if (!e.isIntersecting || e.intersectionRatio < 0.6) { return; }
        rollIO.unobserve(el);
        if (!st || !active || !inDoc(el) || st.busy || st.str !== st.target) { return; }
        var zeros = st.target.replace(/\d/g, '0');
        if (zeros === st.target) { return; }
        w.setTimeout(guard(function () { if (active && inDoc(el) && el.__mRoll === st && !st.busy) { rollAnimate(el, zeros, st.target); } }), 140);
      });
    }), { threshold: [0.6] });
  }
  rollIO.observe(el);
}
/* roll(el, n): replace the content of el with an odometer and slide it to n (0.4 s).
   First call on a fresh element whose text already reads n: shows n at once and rolls up from 0 when the element is 60 % in view.
   A call with a different number rolls from what the element shows to n straight away (when on screen). */
function roll(el, n) {
  if (!el || el.nodeType !== 1) { return; }
  var v = +n, to, st, cur, t;
  if (!(v >= 0) || v !== Math.floor(v) || v > 9999) { el.textContent = String(n); el.__mRoll = null; return; }
  to = String(v);
  st = el.__mRoll;
  if (!active) {
    if (st) { w.clearTimeout(st.timer); }
    el.__mRoll = null;
    el.textContent = to;
    return;
  }
  if (st && st.target === to) { return; }
  if (st && st.busy) { rollFinish(el); }
  cur = st ? st.str : null;
  if (cur === null) {
    t = String(el.textContent || '').replace(/\s+/g, '');
    cur = /^\d{1,4}$/.test(t) ? t : null;
  }
  if (cur === null || cur === to) {
    buildStatic(el, to);
    el.__mRoll = { str: to, target: to, busy: false, timer: 0 };
    queueEnter(el);
    return;
  }
  el.__mRoll = { str: cur, target: to, busy: false, timer: 0 };
  if (inView(el)) { rollAnimate(el, cur, to); }
  else { buildStatic(el, to); el.__mRoll.str = to; }
}

/* ---------- on / off (prefers-reduced-motion and Save-Data, live) ---------- */
function activate() {
  if (active) { return; }
  active = true;
  root.classList.add('motion-ok');
  if (!HAS_IO) { return; }
  makeIO();
  wireScroll();
  if (!booted) { boot(); } else { collect(d); }
}
function deactivate() {
  if (!active) { return; }
  active = false;
  root.classList.remove('motion-ok');
  root.classList.remove('m-fast');
  revealAll();
  tiltReset();
}
function evaluate() {
  var ok = !yes(mqReduce) && !saveData();
  if (ok) { activate(); } else { deactivate(); root.classList.remove('motion-ok'); }
}

var api = EF.motion = { version: VERSION, scan: scan, roll: roll, revealAll: revealAll };
try { Object.defineProperty(api, 'on', { get: function () { return active; }, enumerable: true }); } catch (e) { api.on = false; }

listen(mqReduce, guard(evaluate));
try { if (navigator.connection && navigator.connection.addEventListener) { navigator.connection.addEventListener('change', guard(evaluate)); } } catch (e) { }
w.addEventListener('beforeprint', guard(function () { if (io) { revealAll(); } }));

if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', guard(evaluate)); }
else { evaluate(); }
})();
