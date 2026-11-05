/* Elite Fit /groupfitness · Loud (s4-kinetic) · motion.js · v1.6 (29 Oct 2026; v1.4 motion earlier that day, v1 27 Oct)
   v1.6 (layout gate v1): a reveal plays as soon as its element enters the screen (no -8 % bottom margin), so a masked
   headline word or display letter is never seen half-entered and still masked at the screen's bottom edge.
   EF.motion: the type is the motion (MOTION-BRIEF v1.0, RULINGS #39).
   - Gate: html.motion-ok (set in <head>; off for prefers-reduced-motion and Save-Data). Without it this file only wires the
     API: nothing is split, hidden or moved, numbers are static and the class names stay one static line. No JS: all visible.
   - Reveals play once. One IntersectionObserver reports each element: if its first report finds it fully below the screen
     it is armed (.m-arm, hidden, which nobody sees), and it plays (.m-in .m-play) when it enters. Anything on screen or
     above at that first report is final at once (.m-in), so nothing above the fold ever waits for an entrance.
   - Scroll-linked motion (type drift, the headline scale settle, the hero clip lift, the sauna parallax) is CSS
     scroll-driven animation (html.sdt). Without it the drifting type enters once from its offset (IO class, CSS transition).
   - v1.4: no scroll listener, no layout read in any scroll or animation frame (the v1 drift fallback read
     getBoundingClientRect per element per frame, and the fast-scroll flag read scrollY; both are gone). Geometry is read
     only at init and on resize (marquee width) or comes from ResizeObserver (page height, the Book ring).
   - Tokens: data-split (headline words rise from their line mask), data-chars (display type letters rise from their mask;
     "whole" = the word as one piece), data-motion rise | lift | stagger | mask | num | cascade (CSS in kinetic.css v1.4),
     data-count (counts up once, <= 0.7 s, digits never change count, the final value stays in the HTML).
   - The class-name marquee: speed and direction follow scroll speed through Web Animations playbackRate (compositor only;
     the scroll offset comes from a ScrollTimeline snapshot, never from scrollY), then ease back; it pauses off-screen,
     on hover, focus and its Pause button.
   Classic deferred script, ES5, one IIFE. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
if (EF.motion) { return; }

var root = d.documentElement;
var ON = root.classList.contains('motion-ok');
var SDT = root.classList.contains('sdt');
var HAS_IO = 'IntersectionObserver' in w;
var raf = w.requestAnimationFrame ? function (f) { return w.requestAnimationFrame(f); } : function (f) { return w.setTimeout(f, 16); };
function qsa(sel, ctx) { try { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); } catch (e) { return []; } }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function span(cls, txt) { var s = d.createElement('span'); s.className = cls; if (txt != null) { s.textContent = txt; } return s; }

/* ---------- headline words: each word rises from its own line mask ---------- */
function splitWords(el) {
  if (el.__efSplit) { return; }
  el.__efSplit = true;
  if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', String(el.textContent).replace(/\s+/g, ' ').trim()); }
  var n = 0;
  (function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (k) {
      if (k.nodeType === 3) {
        if (!/\S/.test(k.nodeValue)) { return; }
        var frag = d.createDocumentFragment();
        k.nodeValue.split(/(\s+)/).forEach(function (p) {
          if (!p) { return; }
          if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
          var a = span('w'), b = span('wi', p);
          b.style.setProperty('--i', Math.min(n++, 6));
          a.appendChild(b); frag.appendChild(a);
        });
        node.replaceChild(frag, k);
      } else if (k.nodeType === 1 && !/\b(w|wi|sample)\b/.test(k.className || '') && k.getAttribute('aria-hidden') !== 'true') { walk(k); }
    });
  })(el);
}

/* ---------- display type letters: the readable text stays in a visually hidden copy, the letters are aria-hidden ---------- */
function splitChars(el) {
  if (el.__efCh) { return; }
  el.__efCh = true;
  var sel = el.getAttribute('data-chars') || '', whole = sel === 'whole', parts = sel && !whole ? qsa(sel, el) : [el], n = 0;
  parts.forEach(function (p) {
    var txt = String(p.textContent).replace(/\s+/g, ' ').trim(), lm, i, c, s;
    if (!txt) { return; }
    lm = span('lm'); lm.setAttribute('aria-hidden', 'true');
    if (whole) { lm.appendChild(span('ch', txt)); }
    else {
      for (i = 0; i < txt.length; i++) {
        c = txt.charAt(i);
        if (c === ' ') { lm.appendChild(d.createTextNode(' ')); continue; }
        s = span('ch', c); s.style.setProperty('--c', Math.min(n++, 16)); lm.appendChild(s);
      }
    }
    p.textContent = '';
    p.appendChild(span('vh', txt));
    p.appendChild(lm);
  });
}

/* ---------- count-up: once, 0.7 s, never above the real value. The real number stays in place (it sets the width and is
   what screen readers get); the running digits are an aria-hidden overlay, so Gilroy's proportional digits never shift
   the caption (CLS 0) ---------- */
function count(el) {
  if (el.__efCo) { return; }
  el.__efCo = true;
  var s = String(el.textContent).replace(/\D/g, ''), target = parseInt(s, 10);
  if (!(target > 0)) { return; }
  var from = s.length > 1 ? Math.pow(10, s.length - 1) : 0, t0 = 0, dur = 700, ov = span('cnt', String(from));
  if (from >= target) { return; }
  ov.setAttribute('aria-hidden', 'true');
  el.appendChild(ov); el.classList.add('is-counting');
  function frame(t) {
    if (!t0) { t0 = t; }
    var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    if (k >= 1) { el.classList.remove('is-counting'); if (ov.parentNode) { ov.parentNode.removeChild(ov); } return; }
    ov.textContent = String(Math.min(target, Math.round(from + (target - from) * e)));
    raf(frame);
  }
  raf(frame);
}

/* ---------- reveals: arm what is below the screen, play it once when it enters ---------- */
var io = null;
function play(el, anim) {
  if (el.__efIn) { return; }
  el.__efIn = true;
  el.classList.add('m-in');
  if (anim) { el.classList.add('m-play'); qsa('[data-count]', el).forEach(count); }
  if (io) { io.unobserve(el); }
}
if (ON && HAS_IO) {
  io = new w.IntersectionObserver(function (es) {
    for (var i = 0; i < es.length; i++) {
      var e = es[i], el = e.target, r = e.boundingClientRect, rb = e.rootBounds;
      if (!el.__efSeen) {
        el.__efSeen = true;
        /* arm only what lies fully below the screen (v1.6: rootBounds is the screen itself) */
        if (rb && r.height > 0 && r.top >= rb.bottom - 1) { el.classList.add('m-arm'); continue; }
        play(el, false);
        continue;
      }
      if (e.isIntersecting || r.bottom <= 0) { play(el, true); }
    }
  }, { rootMargin: '0px' });
}
function watch(el) {
  if (el.__efW) { return; }
  el.__efW = true;
  if (io) { io.observe(el); } else { play(el, false); }
}
function stagger(el) { var k = el.children, i; for (i = 0; i < k.length; i++) { k[i].style.setProperty('--i', Math.min(i, 3)); } }

/* ---------- the class-name marquee ---------- */
function initMarquee() {
  var box = d.querySelector('[data-marquee]');
  if (!box || !ON) { return; }
  var track = box.querySelector('[data-marquee-track]'), list = box.querySelector('[data-marquee-list]'), btn = box.querySelector('[data-marquee-pause]');
  if (!track || !list) { return; }
  var copy = list.cloneNode(true);
  copy.removeAttribute('data-marquee-list');
  copy.setAttribute('aria-hidden', 'true');
  track.appendChild(copy);
  var anim = null, vis = false, looping = false, rate = 1, lastP = null, lastT = 0, range = 0, vh = w.innerHeight || 0;
  function grab() {
    try { anim = (track.getAnimations ? track.getAnimations() : [])[0] || null; } catch (e) { anim = null; }
    /* start deep inside the loop, so a reversed pass can never run back past time 0 */
    try { if (anim && anim.currentTime < 3e6) { anim.currentTime = 3e6 + (anim.currentTime || 0); } } catch (e2) { }
  }
  function setDur() {
    var width = list.getBoundingClientRect().width, speed = (w.innerWidth || 0) < 760 ? 42 : 64;
    vh = w.innerHeight || vh;
    if (width > 0) { track.style.setProperty('--marq-dur', Math.max(24, width / speed).toFixed(1) + 's'); }
  }
  setDur();
  try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(setDur); } } catch (e) { }
  var rt = 0;
  w.addEventListener('resize', function () { w.clearTimeout(rt); rt = w.setTimeout(setDur, 200); });
  box.classList.add('marq--run');
  grab();
  function paused() { return box.classList.contains('is-paused'); }
  if (btn) {
    btn.addEventListener('click', function () {
      var p = !paused();
      box.classList.toggle('is-paused', p);
      btn.setAttribute('aria-pressed', p ? 'true' : 'false');
      btn.setAttribute('aria-label', (p ? 'Play' : 'Pause') + ' the class names');
      kick();
    });
  }
  /* scroll speed: a ScrollTimeline snapshot (percent of the page), the page height from a ResizeObserver */
  var tl = null;
  try { if (w.ScrollTimeline && w.ResizeObserver) { tl = new w.ScrollTimeline({ source: root, axis: 'block' }); } } catch (e3) { tl = null; }
  if (tl) { new w.ResizeObserver(function (es) { range = Math.max(0, es[0].contentRect.height - vh); }).observe(d.body); }
  function setRate(r) {
    if (!anim) { return; }
    try { if (anim.updatePlaybackRate) { anim.updatePlaybackRate(r); } else { anim.playbackRate = r; } } catch (e) { }
  }
  function loop(t) {
    if (!vis || paused()) { looping = false; lastP = null; rate = 1; setRate(1); return; }
    var ct = tl.currentTime, p = ct && typeof ct.value === 'number' ? ct.value : null;
    if (p !== null && lastP !== null && t > lastT && range > 0) {
      var v = (p - lastP) / 100 * range / (t - lastT), target = clamp(1 + v * 1.5, -3, 5);
      /* catch up quickly, ease back slowly */
      rate += (target - rate) * (Math.abs(target - 1) > Math.abs(rate - 1) ? 0.3 : 0.05);
    } else { rate += (1 - rate) * 0.05; }
    lastP = p; lastT = t;
    if (Math.abs(rate - 1) < 0.01) { rate = 1; }
    if (anim && Math.abs(anim.playbackRate - rate) > 0.02) { setRate(rate); }
    raf(loop);
  }
  function kick() { if (tl && vis && !looping && !paused()) { if (!anim) { grab(); } looping = true; raf(loop); } }
  if (HAS_IO) {
    new w.IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      box.classList.toggle('is-off', !vis);
      kick();
    }, { rootMargin: '10% 0px 10% 0px' }).observe(box);
  }
}

/* ---------- the sticky Book ring: the exact start scale for a ring that grows 11 px on every side ---------- */
function initRing() {
  var b = d.querySelector('.buybar__btn');
  if (!b || !ON || !w.ResizeObserver) { return; }
  new w.ResizeObserver(function (es) {
    var e = es[0], s = e.borderBoxSize && e.borderBoxSize[0], bw = s ? s.inlineSize : e.contentRect.width, bh = s ? s.blockSize : e.contentRect.height;
    if (bw > 0 && bh > 0) { b.style.setProperty('--rsx', (bw / (bw + 22)).toFixed(4)); b.style.setProperty('--rsy', (bh / (bh + 22)).toFixed(4)); }
  }).observe(b);
}

/* ---------- anchor jumps glide (scroll-behavior only while that jump runs; never for the sheet's scroll restore) ---------- */
function initAnchors() {
  if (!ON) { return; }
  var t = 0;
  function off() { w.clearTimeout(t); root.classList.remove('m-smooth'); }
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || (a.getAttribute('href') || '').length < 2) { return; }
    root.classList.add('m-smooth');
    w.clearTimeout(t); t = w.setTimeout(off, 1500);
  }, true);
  w.addEventListener('scrollend', off);
}

/* ---------- odometer for a spot counter (kept for the shared page contract) ---------- */
function roll(el, n) {
  var s = String(n);
  if (!el) { return; }
  if (!ON) { el.textContent = s; return; }
  var old = String(el.textContent || '').replace(/\D/g, '') || s;
  if (old === s) { el.textContent = s; return; }
  var wrap = span('odo'), i, col, len = Math.max(old.length, s.length);
  wrap.setAttribute('aria-hidden', 'true');
  var pOld = new Array(len - old.length + 1).join(' ') + old, pNew = new Array(len - s.length + 1).join(' ') + s;
  for (i = 0; i < len; i++) {
    col = span('odo__col');
    col.appendChild(span('', pOld.charAt(i) === ' ' ? '' : pOld.charAt(i)));
    col.appendChild(span('', pNew.charAt(i) === ' ' ? '' : pNew.charAt(i)));
    wrap.appendChild(col);
  }
  el.textContent = '';
  el.appendChild(span('vh', s)); el.appendChild(wrap);
  raf(function () { raf(function () { var cols = wrap.children, j; for (j = 0; j < cols.length; j++) { if (pOld.charAt(j) !== pNew.charAt(j)) { cols[j].style.transform = 'translateY(-1.25em)'; } } }); });
  w.setTimeout(function () { if (el.contains(wrap)) { el.textContent = s; } }, 520);
}

/* ---------- scan (the page and the booking engine call it after each render) ---------- */
function scan(ctx) {
  ctx = ctx && ctx.nodeType ? ctx : d;
  if (!ON) { return; }
  qsa('[data-split]', ctx).forEach(function (el) { splitWords(el); watch(el); });
  qsa('[data-chars]', ctx).forEach(function (el) { splitChars(el); watch(el); });
  qsa('[data-motion]', ctx).forEach(function (el) { if (/\bstagger\b/.test(el.getAttribute('data-motion') || '')) { stagger(el); } watch(el); });
  if (!SDT) { qsa('[data-drift="l"],[data-drift="r"],[data-drift="il"],[data-drift="ir"]', ctx).forEach(watch); }
}

function init() {
  if (ON) { root.classList.add('m-ready'); }
  initMarquee();
  initRing();
  initAnchors();
  scan(d);
}

EF.motion = { on: ON, scan: scan, roll: roll, split: splitWords };
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
