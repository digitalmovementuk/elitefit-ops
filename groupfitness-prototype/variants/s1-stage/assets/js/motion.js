/* Elite Fit /groupfitness · Cinematic stage · motion.js (27 Oct 2026)
   - [data-motion] reveals (wipe, stagger, cascade, mask, curtain): IntersectionObserver adds .m-in once. CSS in s1.css.
     Hidden states exist only under html.motion-ok.m-ready, so JS off, reduced motion and Save-Data show everything.
   - The chapter frame grows card -> full-bleed with CSS scroll-driven animations. Where animation-timeline is missing,
     html gets .no-sda and an IntersectionObserver toggles .is-full on each runway (0.6 s transition).
   - Sticky chapter bar: the family title swaps (0.38 s wipe) when a chapter crosses the middle of the screen; progress line
     falls back to a scroll handler without scroll timelines.
   - EF.motion.scan(root), EF.motion.roll(el, n) (odometer), EF.motion.on. Fast scrolling (> 2.5 px/ms) cuts reveals to 0.15 s. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;
var on = root.classList.contains('motion-ok');
var HAS_IO = 'IntersectionObserver' in w;
var sda = false;
try { sda = !!(w.CSS && w.CSS.supports && w.CSS.supports('animation-timeline: view()')); } catch (e) { sda = false; }
if (!sda) { root.classList.add('no-sda'); }

function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
function qs(s, c) { return (c || d).querySelector(s); }

/* ---------- reveals ---------- */
/* A fully clipped element (wipe, curtain) has no visible area, so IntersectionObserver would never report it:
   those are watched through their parent (the proxy) and revealed together with it. */
var io = (on && HAS_IO) ? new w.IntersectionObserver(function (es) {
  each(es, function (e) {
    if (!e.isIntersecting) { return; }
    var list = e.target._efTargets || [e.target];
    each(list, function (t) { reveal(t); });
    io.unobserve(e.target);
  });
}, { threshold: 0, rootMargin: '200000px 0px -8% 0px' }) : null; /* v1.5: anything already above the screen (after an anchor jump) counts as seen, so scrolling back shows it final */
/* clip-based reveals drop their clip-path once they land, so nothing stays clipped at rest */
function reveal(t) {
  t.classList.add('m-in');
  if (/\b(wipe|mask|curtain)\b/.test(t.getAttribute('data-motion') || '')) { w.setTimeout(function () { t.classList.add('m-done'); }, 800); }
}
function watch(el) {
  var t = el.getAttribute('data-motion') || '', proxy = el;
  if (/\b(wipe|curtain)\b/.test(t) && el.parentNode && el.parentNode.nodeType === 1) {
    proxy = el.parentNode;
    if (!proxy._efTargets) { proxy._efTargets = []; }
    proxy._efTargets.push(el);
    if (proxy._efWatched) { return; }
    proxy._efWatched = true;
  }
  io.observe(proxy);
}

function prep(el) {
  var t = el.getAttribute('data-motion') || '', inner;
  if (/\b(stagger|cascade|flap|credits)\b/.test(t)) { each(el.children, function (c, i) { c.style.setProperty('--i', i); }); }
  if (/\bcurtain\b/.test(t)) { inner = qs('.inter__in', el); if (inner) { each(inner.children, function (c, i) { c.style.setProperty('--i', i); }); } }
}
function scan(r) {
  each((r || d).querySelectorAll('[data-motion]'), function (el) {
    prep(el);
    if (el._efm) { return; }
    el._efm = true;
    if (!io) { el.classList.add('m-in'); return; }
    watch(el);
  });
}

/* ---------- odometer for spot counts ---------- */
function roll(el, n) {
  if (!el) { return; }
  var s = String(n), prev = String(el.textContent || '').replace(/\D/g, ''), i, html = '', cols, from;
  if (!on) { el.textContent = s; return; }
  for (i = 0; i < s.length; i++) {
    html += '<span class="odo__col" data-d="' + s.charAt(i) + '"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span>';
  }
  el.innerHTML = '<span class="odo" aria-hidden="true">' + html + '</span><span class="vh">' + s + '</span>';
  cols = el.querySelectorAll('.odo__col');
  each(cols, function (c, k) {
    var pi = prev.length - (s.length - k);
    from = pi >= 0 ? +prev.charAt(pi) : 0;
    c.style.transition = 'none';
    c.style.transform = 'translateY(' + (-from * 1.25) + 'em)';
  });
  void el.offsetWidth;
  each(cols, function (c) { c.style.transition = ''; c.style.transform = 'translateY(' + (-(+c.getAttribute('data-d')) * 1.25) + 'em)'; });
}

/* v1.5: no fast-scroll detector any more: it read the scroll position on every scroll event (forced layouts in the scroll trace). */

/* ---------- chapters ---------- */
var chapters = qs('[data-chapters]');
var bar = qs('[data-cbar]');
function initChapters() {
  if (!chapters) { return; }
  var chaps = chapters.querySelectorAll('.chap');
  var now = bar && qs('[data-cbar-now]', bar), line = bar && qs('[data-cbar-line]', bar);
  var countEl = bar && qs('[data-cbar-count]', bar), ofEl = bar && qs('[data-cbar-of]', bar);
  var active = -1;

  function labelParts(chap) {
    var lab = qs('.chap__label', chap), title = qs('.chap__title', chap);
    var txt = lab ? String(lab.textContent).replace(/\s+/g, ' ').trim() : '';
    var bits = txt.split(' · ');
    return { n: bits[0] || '', count: bits[1] || '', name: title ? title.textContent : '' };
  }
  function activate(i) {
    if (i === active || !now || !chaps[i]) { return; }
    active = i;
    var p = labelParts(chaps[i]);
    now.innerHTML = '<span class="cbar__n"></span> <span class="cbar__name"></span>';
    now.firstChild.textContent = p.n;
    now.lastChild.textContent = p.name;
    if (countEl) { countEl.textContent = p.count; }
    if (ofEl) { ofEl.textContent = (i + 1) + ' / ' + chaps.length; }
    if (on) { var odd = now.classList.contains('is-swap'); now.classList.toggle('is-swap', !odd); now.classList.toggle('is-swap2', odd); } /* two identical animations alternate, so no reflow is needed to restart it */
  }
  EF.motion.refreshBar = function () { var i = active; active = -1; activate(i < 0 ? 0 : i); };

  if (HAS_IO) {
    var mid = new w.IntersectionObserver(function (es) {
      each(es, function (e) { if (e.isIntersecting) { activate(Array.prototype.indexOf.call(chaps, e.target)); } });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    each(chaps, function (c) { mid.observe(c); });
  }

  /* frame fallback without scroll timelines */
  if (!sda && on && HAS_IO) {
    var grow = new w.IntersectionObserver(function (es) {
      each(es, function (e) { e.target.classList.toggle('is-full', e.isIntersecting); });
    }, { rootMargin: '0px 0px -42% 0px', threshold: 0 });
    each(chapters.querySelectorAll('.chap__run'), function (r) { grow.observe(r); });
  }

  /* progress line: CSS scroll timeline only (v1.5: the scroll-handler fallback read layout every frame; without timelines the line stays hidden) */
}

EF.motion = { scan: scan, roll: roll, on: on, sda: sda, refreshBar: function () { } };
initChapters();
scan(d);
root.classList.add('m-ready');
})(window, document);
