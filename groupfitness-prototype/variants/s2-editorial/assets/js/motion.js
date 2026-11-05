/* Elite Fit /groupfitness · Coffee Table (s2-editorial) · motion.js (v3, 29 Oct 2026, MOTION-BRIEF v1.0)
   "Print in motion": hairlines draw like a ruler, folio numerals tick, headlines and pull-quotes set line by line, photographs settle
   onto the page, the masthead's running indicator glides as the spreads hand over. CSS does the moving (editorial.css, MOTION v3);
   this file only adds classes once, builds the odometer columns and moves one indicator.
   - Native scroll only: no scroll or wheel listeners, no smooth-scroll library. Reveals are IntersectionObserver classes, once each.
   - Skim-first: anything already on screen when the page loads is marked revealed at once, so nothing above the fold waits.
   - Gate: html.motion-ok (off for prefers-reduced-motion and Save-Data). Without it nothing is hidden, split or moved.
   API: EF.motion.on, EF.motion.scan(root), EF.motion.roll(el, n). Classic deferred script, ES5, no dependencies. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;
var ON = root.classList.contains('motion-ok') && 'IntersectionObserver' in w;
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }

var io = null, first = true;
var SEL = '[data-lines], [data-reveal], [data-stagger], [data-rule], [data-frame], .coaches, .sp__lead, .trustrow, .sched__tools, .days, .tt, .rows, ' +
  '.feat__feel, .feat__meta, .cidx, .offer__deal, .offer__price, .offer__copy, .pq__by, .pq__score, .coverlines, .ftr__mast, .ftr__cols, .bring, .faq, .nextup__note, .sched__notes, .nextup-blk__rule';

/* ---------- line masks (headlines and pull-quotes only) ---------- */
function tokens(el) {
  var out = [], pendingSpace = false;
  [].slice.call(el.childNodes).forEach(function (n) {
    if (n.nodeType === 3) {
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) { return; }
        if (/^\s+$/.test(part)) { pendingSpace = true; return; }
        out.push({ text: part, sp: pendingSpace }); pendingSpace = false;
      });
    } else if (n.nodeType === 1) { out.push({ node: n.cloneNode(true), sp: pendingSpace }); pendingSpace = false; }
  });
  return out;
}
function split(el) {
  if (el.__ln || el.classList.contains('m-in')) { return; }
  var orig = el.__orig || el.innerHTML;
  el.__orig = orig;
  var toks = tokens(el), words = [];
  el.innerHTML = '';
  toks.forEach(function (t, i) {
    if (i && t.sp) { el.appendChild(d.createTextNode(' ')); }
    var s = d.createElement('span');
    s.style.display = 'inline-block';
    if (t.node) { s.appendChild(t.node); } else { s.textContent = t.text; }
    s.__sp = t.sp; el.appendChild(s); words.push(s);
  });
  var lines = [], cur = null, top = null;
  words.forEach(function (s) { var tp = s.offsetTop; if (top === null || Math.abs(tp - top) > 3) { cur = []; lines.push(cur); top = tp; } cur.push(s); });
  el.innerHTML = '';
  lines.forEach(function (ws, i) {
    var ln = d.createElement('span'), inner = d.createElement('span');
    ln.className = 'ln ln--b'; ln.style.setProperty('--li', Math.min(i, 4));
    inner.className = 'ln__i';
    ws.forEach(function (s, j) { if (j && s.__sp) { inner.appendChild(d.createTextNode(' ')); } while (s.firstChild) { inner.appendChild(s.firstChild); } });
    ln.appendChild(inner); el.appendChild(ln);
    if (i < lines.length - 1) { el.appendChild(d.createTextNode(' ')); }
  });
  el.__ln = true;
}
function unsplit(el) { if (el.__ln && el.__orig) { el.innerHTML = el.__orig; el.__ln = false; } }

/* ---------- odometer columns: the folio "0N//07" ticks up from 00; the 4.7 score rolls up once (final text stays for screen readers) ---------- */
function column(n) { var s = '', i; for (i = 0; i <= n; i++) { s += '<span>' + i + '</span>'; } return '<span class="odc" style="--n:' + n + '" aria-hidden="true"><span class="odc__in">' + s + '</span></span>'; }
function folio(el) {
  var inner = el.querySelector('.ln__i'), t = inner && inner.firstChild;
  if (!t || t.nodeType !== 3 || !/^0\d$/.test(t.nodeValue) || el.__odo) { return; }
  el.__odo = true;
  var n = +t.nodeValue.charAt(1), wrap = d.createElement('span');
  wrap.className = 'odo2'; wrap.innerHTML = '0' + column(n);
  inner.replaceChild(wrap, t);
}
function score(el) {
  var num = el.querySelector('.pq__num');
  if (!num || num.__odo || !/^\d\.\d$/.test(num.textContent)) { return; }
  num.__odo = true;
  var v = num.textContent;
  num.innerHTML = '<span class="vh">' + v + '</span><span class="odo2" aria-hidden="true">' + column(+v.charAt(0)) + '.' + column(+v.charAt(2)) + '</span>';
}

/* ---------- reveal once ---------- */
function reveal(el) {
  if (el.classList.contains('m-in')) { return; }
  el.classList.add('m-in'); el.classList.remove('m-wait');
  if (el.hasAttribute('data-lines')) { w.setTimeout(function () { unsplit(el); }, 780); }
}
function prepStagger(el) { [].slice.call(el.children).forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 6)); }); }
function onScreen(el) { var r = el.getBoundingClientRect(); return r.top < (w.innerHeight || root.clientHeight) && r.bottom > 0; }
function observe(el) {
  if (el.__mo) { return; }
  el.__mo = true;
  /* hidden at this width (the desktop trust row on a phone): never wait on it */
  if (!el.getClientRects().length) { el.__mo = false; return; }
  /* skim-first: on first paint, whatever is already on screen stays as it is */
  if (first && onScreen(el)) { el.classList.add('m-in'); return; }
  /* only elements this file is waiting on are hidden (.m-wait); anything re-rendered later simply shows */
  el.classList.add('m-wait');
  if (el.hasAttribute('data-lines')) { split(el); }
  if (el.hasAttribute('data-stagger') || el.classList.contains('coaches')) { prepStagger(el); }
  if (el.classList.contains('sp__rule')) { var f = el.querySelector('.folio'); if (f) { folio(f); } }
  if (el.classList.contains('pq__score')) { score(el); }
  if (io) { io.observe(el); } else { reveal(el); }
}
function scan(ctx) {
  if (!ON) { return; }
  var box = ctx && ctx.nodeType ? ctx : d;
  qsa(SEL, box).forEach(function (el) {
    if (el.closest && el.closest('#sheet')) { return; }
    if (el.__mo && (el.hasAttribute('data-stagger') || el.classList.contains('coaches'))) { prepStagger(el); }
    observe(el);
  });
}

/* ---------- spot odometer (kept for page.js) ---------- */
function roll(el, n) { if (el) { el.textContent = n; } }

/* ---------- the masthead's running indicator (desktop): one 2 px rule glides to the link of the spread in view ---------- */
function initRunner() {
  var nav = d.querySelector('.hdr__nav');
  if (!nav || !w.matchMedia) { return; }
  var links = qsa('a[href^="#"]', nav), ind = d.createElement('span'), pos = [], cur = -1, mq = w.matchMedia('(min-width: 1024px)');
  ind.className = 'hdr__ind'; ind.setAttribute('aria-hidden', 'true'); nav.appendChild(ind);
  function measure() { pos = links.map(function (a) { return [a.offsetLeft, a.offsetWidth]; }); place(); }
  function place() {
    if (cur < 0 || !pos[cur]) { ind.classList.remove('is-on'); return; }
    ind.style.transform = 'translateX(' + pos[cur][0] + 'px) scaleX(' + (pos[cur][1] / 100) + ')';
    ind.classList.add('is-on');
  }
  var targets = links.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  var seen = links.map(function () { return false; });
  var ob = new w.IntersectionObserver(function (es) {
    es.forEach(function (e) { seen[targets.indexOf(e.target)] = e.isIntersecting; });
    var i, at = -1;
    for (i = 0; i < seen.length; i++) { if (seen[i]) { at = i; } }
    if (at !== cur) { cur = at; links.forEach(function (a, j) { a.classList.toggle('is-here', j === cur); }); place(); }
  }, { rootMargin: '-45% 0px -54% 0px' });
  targets.forEach(function (t) { if (t) { ob.observe(t); } });
  measure();
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 150); });
  if (mq.addEventListener) { mq.addEventListener('change', measure); }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(measure); }
}

function init() {
  if (!ON) { return; }
  io = new w.IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  scan(d);
  first = false;
  root.classList.add('m-ready');
  initRunner();
  /* fonts change line breaks: re-split anything still waiting once Gilroy is in, and on a width change */
  function resplit() { qsa('[data-lines]').forEach(function (el) { if (el.classList.contains('m-in') || !el.__ln) { return; } unsplit(el); split(el); }); }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(resplit); }
  var lastW = w.innerWidth, t = 0;
  w.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { if (w.innerWidth !== lastW) { lastW = w.innerWidth; resplit(); } }, 150); });
}

EF.motion = { on: ON, scan: scan, roll: roll };
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
