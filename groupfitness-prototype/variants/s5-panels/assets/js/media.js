/* Elite Fit /groupfitness · Panels app · media.js · 27 Oct 2026
   EF.media: lazy, capped, pausable class clips, poster first.
   - video[data-clip] keep preload="none" until they are allowed to play; play when their box is 25 % visible.
   - Hero panel clips ([data-panel-video]) play only inside the open panel (phones: the tapped card; desktop: the expanded one).
   - While the sheet is open only data-group="sheet" clips play. Cap: 2 on phones / coarse pointers, 3 on desktop.
   - [data-pause="<group>"] toggles a visitor pause for that group (aria-pressed, Pause/Play label and text).
   - Reduced motion, Save-Data, 2g/3g or no html.motion-ok: posters only; the buttons stay as Play buttons.
   Starts 250 ms after window load so posters and fonts win the first paint. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
if (EF.media && EF.media.version) { return; }
var root = d.documentElement;
var HAS_IO = 'IntersectionObserver' in w;
function qsa(s, c) { try { return [].slice.call((c || d).querySelectorAll(s)); } catch (e) { return []; } }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return null; } }
function yes(m) { return !!(m && m.matches); }
var mqReduce = mq('(prefers-reduced-motion: reduce)');
var mqSmall = mq('(max-width: 1023.98px)');
var mqCoarse = mq('(pointer: coarse)');

var clips = [];
var user = {};          /* group -> true paused by the visitor, false played by the visitor */
var sheetOpen = false;
var ready = false;
var blocked = false;
var seen = null;
var queued = false;

function slowNet() { try { var c = navigator.connection; return !!(c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''))); } catch (e) { return false; } }
function autoOk() { return HAS_IO && !yes(mqReduce) && !slowNet() && root.classList.contains('motion-ok'); }
function paused(g) { return user.hasOwnProperty(g) ? user[g] : !autoOk(); }
function cap() { return (yes(mqSmall) || yes(mqCoarse)) ? 2 : 3; }
function inDoc(el) { return !!el && root.contains(el); }
function eligible(r) {
  if (r.failed || !ready || d.hidden || blocked || !inDoc(r.v)) { return false; }
  if (sheetOpen && r.group !== 'sheet') { return false; }
  if (paused(r.group)) { return false; }
  if (r.panel && !r.panel.classList.contains('is-open')) { return false; }
  return r.vis >= 0.25;
}

function paint(btn) {
  var g = btn.getAttribute('data-pause') || '', p = paused(g), word = p ? 'Play' : 'Pause';
  var lab = btn.getAttribute('aria-label') || '';
  btn.setAttribute('aria-pressed', p ? 'true' : 'false');
  btn.setAttribute('aria-label', /^(Pause|Play)\b/i.test(lab) ? lab.replace(/^(Pause|Play)\b/i, word) : word + ' the video');
  var t = btn.querySelector('.pause__txt');
  if (t && t.textContent !== word) { t.textContent = word; }
}
function paintAll(ctx) { qsa('[data-pause]', ctx).forEach(paint); }

function prep(v) {
  v.muted = true; v.defaultMuted = true; v.loop = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  try { v.playsInline = true; } catch (e) {}
}
function play(r) {
  var v = r.v, p;
  if (!v.paused || r.pending) { return; }
  prep(v);
  v.preload = 'auto';
  r.pending = true;
  try { p = v.play(); } catch (e) { r.failed = true; r.pending = false; return; }
  if (p && p.then) {
    p.then(function () { r.pending = false; }, function (err) {
      r.pending = false;
      var n = err && err.name;
      if (n === 'AbortError') { return; }
      if (n === 'NotAllowedError') { blocked = true; arm(); return; }
      r.failed = true; v.classList.remove('is-playing');
    });
  } else { r.pending = false; }
}
function stop(r) { if (!r.v.paused) { try { r.v.pause(); } catch (e) {} } }
function arm() {
  if (arm.on) { return; }
  arm.on = true;
  function go() { arm.on = false; ['touchend', 'click', 'keydown'].forEach(function (n) { d.removeEventListener(n, go, true); }); blocked = false; syncNow(); }
  ['touchend', 'click', 'keydown'].forEach(function (n) { d.addEventListener(n, go, true); });
}

function syncNow() {
  queued = false;
  clips = clips.filter(function (r) { if (inDoc(r.v)) { return true; } if (seen) { seen.unobserve(r.box); } return false; });
  var want = clips.filter(eligible).sort(function (a, b) { return b.vis - a.vis; }).slice(0, cap());
  clips.forEach(function (r) {
    if (want.indexOf(r) > -1) { play(r); }
    else { stop(r); r.v.classList.remove('is-playing'); }
  });
  paintAll(d);
}
function sync() { if (queued) { return; } queued = true; (w.requestAnimationFrame || w.setTimeout)(syncNow); }

function register(v) {
  if (v.__efm) { return; }
  var box = v.parentNode;
  var r = { v: v, box: box, group: v.getAttribute('data-group') || 'default', vis: HAS_IO ? 0 : 1, failed: false, pending: false, panel: v.hasAttribute('data-panel-video') && v.closest ? v.closest('.panel') : null };
  v.__efm = r;
  prep(v);
  if (!v.getAttribute('preload')) { v.setAttribute('preload', 'none'); }
  v.addEventListener('playing', function () { v.classList.add('is-playing'); });
  v.addEventListener('error', function () { r.failed = true; v.classList.remove('is-playing'); });
  clips.push(r);
  if (seen) { seen.observe(box); box.__efr = (box.__efr || []).concat([r]); }
}
function scan(ctx) {
  qsa('video[data-clip]', ctx && ctx.nodeType ? ctx : d).forEach(register);
  paintAll(ctx && ctx.nodeType ? ctx : d);
  sync();
}

if (HAS_IO) {
  seen = new w.IntersectionObserver(function (es) {
    es.forEach(function (e) { (e.target.__efr || []).forEach(function (r) { r.vis = e.isIntersecting ? e.intersectionRatio : 0; }); });
    sync();
  }, { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] });
}

d.addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('[data-pause]') : null;
  if (!b) { return; }
  e.preventDefault();
  var g = b.getAttribute('data-pause') || '';
  user[g] = !paused(g);
  blocked = false; ready = true;
  syncNow();
});
d.addEventListener('visibilitychange', syncNow);
d.addEventListener('ef:panel', sync);
d.addEventListener('ef:sheet', function (e) { sheetOpen = !!(e.detail && e.detail.open); sync(); });
w.addEventListener('pagehide', function () { clips.forEach(stop); });
var rt = 0;
w.addEventListener('resize', function () { w.clearTimeout(rt); rt = w.setTimeout(sync, 150); });

function start() { if (ready) { return; } ready = true; syncNow(); }
scan(d);
if (d.readyState === 'complete') { w.setTimeout(start, 250); }
else { w.addEventListener('load', function () { w.setTimeout(start, 250); }); w.setTimeout(start, 3500); }

EF.media = {
  version: 's5-1.0', scan: scan, sync: syncNow,
  state: function () { var p = clips.filter(function (r) { return !r.v.paused; }); return { mode: autoOk() ? 'auto' : 'poster', playing: p.length, groups: p.map(function (r) { return r.group; }), clips: clips.length }; }
};
})(window, document);
