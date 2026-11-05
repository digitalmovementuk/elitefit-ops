/* Elite Fit /groupfitness · Panels app · motion.js · 27 Oct 2026
   EF.motion: enter-view reveals ([data-m] rise, stagger, deal, fan, mask, frame, meters = seat rows fill), the odometer roll,
   and the fallbacks for engines without CSS scroll-driven animations
   (scroll progress bars, hero panels settle). Native scroll only; this file only sets classes and CSS variables.
   Nothing is hidden until html.m-ready is set, and that only happens with html.motion-ok (no reduced motion, no Save-Data). */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
if (EF.motion && EF.motion.version) { return; }
var root = d.documentElement;
var HAS_IO = 'IntersectionObserver' in w;
var raf = w.requestAnimationFrame ? function (f) { return w.requestAnimationFrame(f); } : function (f) { return w.setTimeout(f, 16); };
function qsa(s, c) { try { return [].slice.call((c || d).querySelectorAll(s)); } catch (e) { return []; } }
function now() { return w.performance && w.performance.now ? w.performance.now() : Date.now(); }
function sdaOk() { try { return !!(w.CSS && w.CSS.supports && w.CSS.supports('animation-timeline: view()') && w.CSS.supports('animation-timeline: scroll()')); } catch (e) { return false; } }

var on = root.classList.contains('motion-ok') && HAS_IO;
var sda = sdaOk();
if (sda) { root.classList.add('sda'); }
var io = null;

function reveal(el) {
  if (el.classList.contains('m-in')) { return; }
  el.classList.add('m-in');
  /* a reveal plays once per page view: after it, re-rendered lists (day switch, booking) appear without replaying it */
  w.setTimeout(function () { el.classList.add('is-settled'); }, 1200);
  qsa('.meter.m-wait, .seatrow.m-wait', el).forEach(function (m) { m.classList.remove('m-wait'); });
  if (io) { io.unobserve(el); }
}
function indexKids(el) {
  var t = el.getAttribute('data-m'), kids = el.children, i, n = 0;
  if (t !== 'stagger' && t !== 'deal' && t !== 'fade') { return; }
  for (i = 0; i < kids.length; i++) { kids[i].style.setProperty('--i', n++); }
}
function scan(ctx) {
  var list = qsa('[data-m]', ctx && ctx.nodeType ? ctx : d);
  if (ctx && ctx.nodeType === 1 && ctx.hasAttribute && ctx.hasAttribute('data-m')) { list.unshift(ctx); }
  qsa('.ticks li', ctx && ctx.nodeType ? ctx : d).forEach(function (li, i) { li.style.setProperty('--i', i); });
  list.forEach(function (el) {
    indexKids(el);
    if (!on) { el.classList.add('m-in'); return; }
    if (el.__mSeen) { if (el.classList.contains('m-in')) { qsa('.meter.m-wait, .seatrow.m-wait', el).forEach(function (m) { m.classList.remove('m-wait'); }); } return; }
    el.__mSeen = true;
    io.observe(el);
  });
}

/* odometer: roll a number in place (spot counters). Reduced motion: plain text. */
function roll(el, to, from) {
  if (!el) { return; }
  var target = String(to);
  if (!on || from === undefined || from === null || String(from) === target) { el.textContent = target; return; }
  var a = String(from), b = target, len = Math.max(a.length, b.length), i, html = '';
  while (a.length < len) { a = ' ' + a; }
  while (b.length < len) { b = ' ' + b; }
  for (i = 0; i < len; i++) {
    html += '<span class="odo__col" data-to="' + (a.charAt(i) === b.charAt(i) ? 0 : 1) + '"><span>' + (a.charAt(i) === ' ' ? '' : a.charAt(i)) + '</span><span>' + (b.charAt(i) === ' ' ? '' : b.charAt(i)) + '</span></span>';
  }
  el.innerHTML = '<span class="odo" aria-hidden="true">' + html + '</span><span class="vh">' + target + '</span>';
  var cols = qsa('.odo__col', el);
  raf(function () { raf(function () {
    cols.forEach(function (c) { if (c.getAttribute('data-to') === '1') { c.style.transform = 'translateY(-50%)'; } });
  }); });
  w.setTimeout(function () { el.textContent = target; }, 520);
}

/* seat rows (and the old meters) re-rendered by a visitor action fill again on the next frame */
function fillMeters(ctx) {
  if (!on) { qsa('.meter.m-wait, .seatrow.m-wait', ctx).forEach(function (m) { m.classList.remove('m-wait'); }); return; }
  raf(function () { raf(function () { qsa('.meter.m-wait, .seatrow.m-wait', ctx).forEach(function (m) { m.classList.remove('m-wait'); }); }); });
}


/* fallbacks without scroll-driven CSS: progress bars (--p) and the hero panels settle (.is-out) */
var ticking = false;
function progress() {
  ticking = false;
  var max = Math.max(1, (d.documentElement.scrollHeight || 0) - (w.innerHeight || 0));
  root.style.setProperty('--p', Math.min(1, Math.max(0, (w.pageYOffset || 0) / max)).toFixed(4));
}
function onScroll() {
  if (on && !sda && !ticking) { ticking = true; raf(progress); }
}
function heroFallback() {
  var p = d.querySelector('[data-panels]');
  if (!p || sda || !on || !HAS_IO) { return; }
  new w.IntersectionObserver(function (es) {
    var e = es[0];
    var out = !e.isIntersecting || (e.intersectionRatio < 0.45 && e.boundingClientRect.top < 0);
    p.classList.toggle('is-out', out);
  }, { threshold: [0, 0.2, 0.45, 0.7, 1] }).observe(p);
}

function init() {
  if (on) {
    io = new w.IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    root.classList.add('m-ready');
  }
  scan(d);
  heroFallback();
  w.addEventListener('scroll', onScroll, { passive: true });
  if (on && !sda) { progress(); w.addEventListener('resize', function () { raf(progress); }); }
}

EF.motion = { version: 's5-2.1', on: on, sda: sda, scan: scan, roll: roll, fillMeters: fillMeters };
init();
})(window, document);
