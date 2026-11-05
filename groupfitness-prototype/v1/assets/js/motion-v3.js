/* Elite Fit Group Fitness concept v1 · motion-v3.js · v1.1, 29 Oct 2026
   The Original's motion engine for the motion pass (ef-gf/upgrade/MOTION-BRIEF.md, RULINGS 39). Loaded only by v1/index.html.
   v1.1 REPLACES the shared assets/js/motion.js on this page (that file stays untouched for s3-home and the others): same API
   (EF.motion.scan, EF.motion.on, EF.motion.roll), same CSS classes (html.m-ready, .m-in), but no scroll listener and no layout read
   in any scroll or animation frame (the shared file read scrollY in rAF for its fast-scroll flag; that flag is gone).
   Tokens, each played once per page view:
     rise, stagger, mask, deal   v1's own reveals (CSS in gf.css)
     lines     headlines: each line slides up out of its own clean mask (measured once, in the final font, never during scroll)
     cascade   children rise one after another (<= 0.9 s for the whole group)
     settle    a media frame rises into place (opacity + translate only: no clip or scale across faces)
     rows      ruled rows: each hairline draws (scaleX), then its row lifts
     draw      one hairline draws
     tilt      pointer tilt on coach photos (fine pointers; the box is measured on pointer entry, not per frame)
     data-count  a number counts up once (<= 0.7 s); the final value is in the HTML
   Anything already on screen (or scrolled past) at boot is final at once: no entrance on load (skim-first).
   Off without html.motion-ok (reduced motion, Save-Data): nothing is hidden. Classic deferred script, ES5, one IIFE. */
(function () {
'use strict';
var w = window, d = document, root = d.documentElement;
var EF = w.EF = w.EF || {};
if (EF.motion3) { return; }
var TOK = ['lines', 'cascade', 'settle', 'rows', 'draw', 'rise', 'stagger', 'mask', 'deal'];
var DONE_MS = 1300;
var io = null, heads = [], lastW = w.innerWidth, booted = false;
function qsa(s, c) { try { return [].slice.call((c || d).querySelectorAll(s)); } catch (e) { return []; } }
function toks(el) { return String(el.getAttribute('data-motion') || '').split(/\s+/); }
function mine(el) { var t = toks(el), i; for (i = 0; i < TOK.length; i++) { if (t.indexOf(TOK[i]) > -1) { return true; } } return false; }
function ok() { return root.classList.contains('motion-ok') && 'IntersectionObserver' in w; }
var raf = w.requestAnimationFrame ? function (f) { return w.requestAnimationFrame(f); } : function (f) { return w.setTimeout(f, 16); };

/* ---- headline lines: split into words, group by line with one layout read, wrap each line in a mask ---- */
function split(h) {
  if (!h.__m3) { h.__m3 = { html: h.innerHTML }; }
  var units = [];
  [].slice.call(h.childNodes).forEach(function (n) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach(function (p) {
        if (!p) { return; }
        if (/^\s+$/.test(p)) { units.push(d.createTextNode(' ')); return; }
        var s = d.createElement('span'); s.className = 'm3w'; s.textContent = p; units.push(s);
      });
    } else if (n.nodeType === 1) { var c = n.cloneNode(true); c.classList.add('m3w'); units.push(c); }
  });
  h.textContent = '';
  units.forEach(function (u) { h.appendChild(u); });
  var lines = [], top = null, cur = null;
  units.forEach(function (u) {
    if (u.nodeType !== 1) { if (cur) { cur.push(u); } return; }
    var t = u.offsetTop;
    if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
    cur.push(u);
  });
  h.textContent = '';
  lines.forEach(function (l, i) {
    while (l.length && l[l.length - 1].nodeType === 3) { l.pop(); }
    var o = d.createElement('span'), inn = d.createElement('span');
    o.className = 'm3l'; inn.className = 'm3l__in'; inn.style.setProperty('--l', String(i));
    l.forEach(function (u) { inn.appendChild(u); });
    o.appendChild(inn); h.appendChild(o);
    if (i < lines.length - 1) { h.appendChild(d.createTextNode(' ')); }
  });
}
function restore(h) { if (h.__m3) { h.innerHTML = h.__m3.html; } }

/* ---- the number counter (once) ---- */
function count(el) {
  if (el.__m3c) { return; }
  el.__m3c = true;
  var end = parseInt(el.textContent, 10);
  if (!(end > 0)) { return; }
  var t0 = 0, dur = 700;
  function step(t) {
    if (!t0) { t0 = t; }
    var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(end * e));
    if (k < 1) { raf(step); } else { el.textContent = String(end); }
  }
  el.textContent = '0';
  raf(step);
}

function show(el) {
  if (el.classList.contains('v-in')) { return; }
  el.classList.add('v-in', 'm-in');
  if (io) { io.unobserve(el); }
  qsa('[data-count]', el).forEach(count);
  w.setTimeout(function () { el.classList.add('v-done'); }, DONE_MS);
}
function boot() {
  if (!ok()) { return; }
  var els = qsa('[data-motion]').filter(mine), vh = w.innerHeight || 800;
  els.forEach(kidIndex);
  heads = els.filter(function (el) { return toks(el).indexOf('lines') > -1; });
  heads.forEach(split);
  /* anything on screen (or scrolled past) right now is final at once: no entrance on load */
  root.classList.add('m3-boot');
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.bottom <= 0 || (r.top < vh * 0.92 && r.bottom > 0)) { el.classList.add('v-in', 'm-in', 'v-done'); qsa('[data-count]', el).forEach(function (c) { c.__m3c = true; }); }
  });
  root.classList.add('m3-ready', 'm-ready');
  booted = true;
  els.forEach(function (el) { el.__m3s = true; });
  void root.offsetWidth;
  root.classList.remove('m3-boot');
  io = new w.IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.intersectionRatio >= 0.12) { show(e.target); }
      else if (!e.isIntersecting && e.boundingClientRect.top < 0) { show(e.target); }   /* jumped past it: show, nobody saw it */
    });
  }, { threshold: [0, 0.12], rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { if (!el.classList.contains('v-in')) { io.observe(el); } });
  /* a new width: shown headlines go back to their plain text, hidden ones are measured again */
  var rt = 0;
  w.addEventListener('resize', function () {
    w.clearTimeout(rt);
    rt = w.setTimeout(function () {
      if (w.innerWidth === lastW) { return; }
      lastW = w.innerWidth;
      heads.forEach(function (h) { restore(h); if (!h.classList.contains('v-in')) { split(h); } });
    }, 200);
  });
}
function kidIndex(el) {
  var t = toks(el);
  if (t.indexOf('stagger') < 0 && t.indexOf('deal') < 0) { return; }
  [].slice.call(el.children).forEach(function (k, i) { if (k.style && !k.style.getPropertyValue('--i')) { k.style.setProperty('--i', String(i)); } });
}
/* content rendered after boot (page.js, the sheet): new containers in view show at once, the others wait for the observer */
function scan(ctx) {
  if (!booted || !io) { return; }
  var list = qsa('[data-motion]', ctx && ctx.nodeType ? ctx : d).filter(mine);
  if (ctx && ctx.nodeType === 1 && ctx.hasAttribute('data-motion') && mine(ctx)) { list.unshift(ctx); }
  list.forEach(function (el) {
    kidIndex(el);
    if (el.__m3s) { return; }
    el.__m3s = true;
    if (el.classList.contains('v-in')) { return; }
    var r = el.getBoundingClientRect();
    if (r.bottom <= 0 || (r.top < (w.innerHeight || 800) * 0.92 && r.bottom > 0)) { el.classList.add('v-in', 'm-in', 'v-done'); }
    else { io.observe(el); }
  });
}
/* ---- pointer tilt (fine pointers only), up to 3 degrees; the box is read once on entry ---- */
var mqFine = null; try { mqFine = w.matchMedia('(hover: hover) and (pointer: fine)'); } catch (e) { }
var tHost = null, tEl = null, tBox = null, tx = 0, ty = 0, tRaf = 0;
function tiltOff() { if (tEl) { tEl.style.transform = ''; } tHost = tEl = tBox = null; }
function tiltDo() {
  tRaf = 0;
  if (!tEl || !tBox) { return; }
  var nx = Math.max(-1, Math.min(1, (tx - (tBox.left + tBox.width / 2)) / (tBox.width / 2)));
  var ny = Math.max(-1, Math.min(1, (ty - (tBox.top + tBox.height / 2)) / (tBox.height / 2)));
  tEl.style.transform = 'rotateX(' + (-ny * 3).toFixed(2) + 'deg) rotateY(' + (nx * 3).toFixed(2) + 'deg)';
}
d.addEventListener('pointermove', function (e) {
  if (!root.classList.contains('motion-ok') || !mqFine || !mqFine.matches || e.pointerType === 'touch') { return; }
  var host = e.target && e.target.closest ? e.target.closest('[data-motion~="tilt"]') : null;
  if (host !== tHost) { tiltOff(); if (host) { tHost = host; tEl = host.querySelector('[data-tilt-target]') || host; tBox = tEl.getBoundingClientRect(); } }
  if (!tHost) { return; }
  tx = e.clientX; ty = e.clientY;
  if (!tRaf) { tRaf = raf(tiltDo); }
}, { passive: true });
w.addEventListener('scroll', function () { if (tHost) { tiltOff(); } }, { passive: true });   /* the page moved under the pointer: let go (no read here) */
w.addEventListener('blur', tiltOff);
EF.motion = { version: 'v3-1.1.0', on: root.classList.contains('motion-ok'), scan: scan, roll: function (el, n) { if (el) { el.textContent = String(n); } } };
EF.motion3 = { version: '1.1.0' };
/* headlines are measured in their final font (Gilroy swaps in): start once the fonts are ready, or after 1.5 s at most */
var started = false;
function start() { if (started) { return; } started = true; boot(); }
function later() { try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(start, start); } else { start(); } } catch (e) { start(); } w.setTimeout(start, 1500); }
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', later); } else { later(); }
})();
