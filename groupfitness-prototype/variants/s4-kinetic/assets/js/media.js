/* Elite Fit /groupfitness · Kinetic type v1 · media.js (27 Oct 2026)
   EF.media: lazy, capped, pausable clips (same contract as v1's media.js, without the hero panels).
   - video[data-clip] stay preload="none" until near the screen and allowed to play. Poster first, always.
   - Plays when its box is 25 % visible. Cap 2 on phones and coarse pointers, 4 on desktop, most visible first.
   - While the sheet is open only data-group="sheet" clips play.
   - [data-pause="<group>"] toggles a visitor pause for that group (aria-pressed, Pause/Play label).
   - Reduced motion, Save-Data, 2g/3g or no motion-ok: posters only, no autoplay; pause buttons become Play buttons.
   - iOS Low Power Mode refuses play(): retry once inside the next tap.
   - v1.4 motion (29 Oct 2026): a clip with data-mq="<media query>" plays only while that query matches, so the hero cut
     hidden at this width (tall on desktop, wide on phones) no longer decodes or takes one of the two phone slots. */
(function () {
'use strict';
var w = window, d = document, root = d.documentElement;
var EF = w.EF = w.EF || {};
if (EF.media && EF.media.version) { return; }

var VERSION = 's4-1.4.0';
var MIN_VIS = 0.25, CAP_SMALL = 2, CAP_DESK = 4, START_DELAY = 250;
var HAS_IO = 'IntersectionObserver' in w;
var raf = w.requestAnimationFrame ? function (f) { return w.requestAnimationFrame(f); } : function (f) { return w.setTimeout(f, 16); };
function guard(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { return undefined; } }; }
function qsa(sel, ctx) { try { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); } catch (e) { return []; } }
function mq(q) { try { return w.matchMedia ? w.matchMedia(q) : null; } catch (e) { return null; } }
function yes(m) { return !!(m && m.matches); }
function listen(m, fn) { if (!m) { return; } if (m.addEventListener) { m.addEventListener('change', fn); } else if (m.addListener) { m.addListener(fn); } }
function inDoc(el) { return !!el && root.contains(el); }

var mqReduce = mq('(prefers-reduced-motion: reduce)');
var mqNarrow = mq('(max-width: 1023.98px)');
var mqCoarse = mq('(pointer: coarse)');
var clips = [], userSet = {}, sheetOpen = false, blocked = false, ready = false, seen = null, near = null, queued = false, lastAuto = null;

function slowNet() {
  try { var c = navigator.connection; return !!(c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''))); } catch (e) { return false; }
}
function autoOk() { return HAS_IO && !yes(mqReduce) && !slowNet() && root.classList.contains('motion-ok'); }
function isPaused(g) { return userSet.hasOwnProperty(g) ? userSet[g] : !autoOk(); }
function groupOk(g) { return !isPaused(g) && (autoOk() || userSet[g] === false); }
function cap() { return (yes(mqNarrow) || yes(mqCoarse)) ? CAP_SMALL : CAP_DESK; }
function eligible(r) {
  if (r.failed || !ready || d.hidden || !inDoc(r.v) || blocked) { return false; }
  if (sheetOpen && r.group !== 'sheet') { return false; }
  if (r.mq && !r.mq.matches) { return false; }
  return groupOk(r.group);
}

function paintButton(btn) {
  var g = btn.getAttribute('data-pause') || '', p = isPaused(g), word = p ? 'Play' : 'Pause', lab = btn.getAttribute('aria-label') || '';
  btn.setAttribute('aria-pressed', p ? 'true' : 'false');
  lab = /^(Pause|Play)\b/i.test(lab) ? lab.replace(/^(Pause|Play)\b/i, word) : (lab || word + ' the video');
  btn.setAttribute('aria-label', lab);
  var t = btn.querySelector('.pause__txt');
  if (t && t.textContent !== word) { t.textContent = word; }
}
function paintButtons(ctx) { qsa('[data-pause]', ctx).forEach(paintButton); }

function prep(v) {
  v.muted = true; v.defaultMuted = true; v.loop = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
  try { v.playsInline = true; } catch (e) { }
}
function armGesture() {
  if (armGesture.on) { return; }
  armGesture.on = true;
  var go = guard(function () {
    armGesture.on = false;
    ['touchend', 'click', 'keydown'].forEach(function (n) { d.removeEventListener(n, go, true); });
    blocked = false;
    syncNow();
  });
  ['touchend', 'click', 'keydown'].forEach(function (n) { d.addEventListener(n, go, true); });
}
function fail(r) { r.failed = true; r.want = false; r.pending = false; r.v.classList.remove('is-playing'); }
function startPlay(r) {
  var v = r.v, p;
  if (!v.paused || r.pending) { return; }
  prep(v);
  v.preload = 'auto';
  r.pending = true;
  try { p = v.play(); } catch (e) { fail(r); return; }
  if (p && typeof p.then === 'function') {
    p.then(function () { r.pending = false; }, function (err) {
      r.pending = false;
      var n = err && err.name;
      if (n === 'AbortError') { return; }
      if (n === 'NotAllowedError') { blocked = true; armGesture(); return; }
      fail(r);
    });
  } else { r.pending = false; }
}
function stopPlay(r) { if (!r.v.paused) { try { r.v.pause(); } catch (e) { } } }
function toPoster(r) { stopPlay(r); r.v.classList.remove('is-playing'); }
function dropGone() {
  clips = clips.filter(function (r) {
    if (inDoc(r.v)) { return true; }
    var list = r.box.__efmRecs || [], i = list.indexOf(r);
    if (i > -1) { list.splice(i, 1); }
    if (!list.length) { if (seen) { seen.unobserve(r.box); } if (near) { near.unobserve(r.box); } }
    return false;
  });
}
function warm(r) { if (r.v.preload !== 'auto') { r.v.preload = 'auto'; } }
function syncNow() {
  queued = false;
  dropGone();
  var limit = cap(), auto = autoOk(), list = [];
  lastAuto = auto;
  root.classList.toggle('media-manual', !auto);
  clips.forEach(function (r) { if (eligible(r) && r.vis >= MIN_VIS) { list.push(r); } });
  list.sort(function (a, b) { return (b.vis + (b.v.paused ? 0 : 0.15)) - (a.vis + (a.v.paused ? 0 : 0.15)); });
  list = list.slice(0, limit);
  clips.forEach(function (r) {
    if (list.indexOf(r) > -1) { r.want = true; startPlay(r); }
    else {
      r.want = false;
      if (!auto && userSet[r.group] !== false) { toPoster(r); } else { stopPlay(r); }
      if (r.near && eligible(r)) { warm(r); }
    }
  });
  paintButtons();
}
function sync() { if (queued) { return; } queued = true; raf(guard(syncNow)); }

function register(v) {
  if (v.__efm) { return; }
  var box = v.parentNode;
  var q = v.getAttribute('data-mq');
  var r = { v: v, box: box, group: v.getAttribute('data-group') || 'default', vis: HAS_IO ? 0 : 1, near: false, failed: false, pending: false, want: false, retries: 0, mq: q ? mq(q) : null };
  if (r.mq) { listen(r.mq, guard(function () { syncNow(); })); }
  v.__efm = r;
  prep(v);
  if (!v.getAttribute('preload')) { v.setAttribute('preload', 'none'); }
  v.addEventListener('playing', function () { v.classList.add('is-playing'); r.retries = 0; });
  v.addEventListener('pause', function () { if (r.want && !v.ended && !d.hidden && r.retries < 3) { r.retries++; w.setTimeout(guard(sync), 160); } });
  v.addEventListener('error', function () { fail(r); });
  clips.push(r);
  (box.__efmRecs = box.__efmRecs || []).push(r);
  if (box.__efmRecs.length === 1) { if (seen) { seen.observe(box); } if (near) { near.observe(box); } }
}
function scan(ctx) {
  var c = ctx && ctx.nodeType ? ctx : d;
  qsa('video[data-clip]', c).forEach(register);
  paintButtons(c);
  sync();
}

function makeObservers() {
  if (!HAS_IO) { return; }
  seen = new w.IntersectionObserver(guard(function (entries) {
    entries.forEach(function (e) { (e.target.__efmRecs || []).forEach(function (r) { r.vis = e.isIntersecting ? e.intersectionRatio : 0; }); });
    sync();
  }), { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] });
  near = new w.IntersectionObserver(guard(function (entries) {
    entries.forEach(function (e) { (e.target.__efmRecs || []).forEach(function (r) { r.near = e.isIntersecting; if (e.isIntersecting && ready && eligible(r)) { warm(r); } }); });
  }), { rootMargin: '40% 0px 40% 0px' });
}

d.addEventListener('click', guard(function (e) {
  var btn = e.target && e.target.closest ? e.target.closest('[data-pause]') : null;
  if (!btn) { return; }
  var g = btn.getAttribute('data-pause') || '';
  userSet[g] = !isPaused(g);
  blocked = false;
  ready = true;
  paintButtons();
  syncNow();
}));
d.addEventListener('visibilitychange', guard(function () { syncNow(); }));
w.addEventListener('pagehide', guard(function () { clips.forEach(stopPlay); }));
w.addEventListener('pageshow', guard(function () { sync(); }));
d.addEventListener('ef:sheet', guard(function (e) { sheetOpen = !!(e && e.detail && e.detail.open); syncNow(); }));
var rt = 0;
w.addEventListener('resize', guard(function () { w.clearTimeout(rt); rt = w.setTimeout(guard(syncNow), 150); }));
[mqReduce, mqNarrow, mqCoarse].forEach(function (m) { listen(m, guard(function () { syncNow(); })); });
try { if (navigator.connection && navigator.connection.addEventListener) { navigator.connection.addEventListener('change', guard(syncNow)); } } catch (e) { }
if (w.MutationObserver) {
  try { new w.MutationObserver(guard(function () { if (autoOk() !== lastAuto) { sync(); } })).observe(root, { attributes: true, attributeFilter: ['class'] }); } catch (e) { }
}

function start() { if (ready) { return; } ready = true; syncNow(); }
function init() {
  makeObservers();
  scan(d);
  if (d.readyState === 'complete') { w.setTimeout(guard(start), START_DELAY); }
  else {
    w.addEventListener('load', function () { w.setTimeout(guard(start), START_DELAY); });
    w.setTimeout(guard(start), 3500);
  }
}

EF.media = {
  version: VERSION,
  scan: scan,
  sync: syncNow,
  state: function () {
    var playing = clips.filter(function (r) { return !r.v.paused && !r.v.ended; });
    return { mode: autoOk() ? 'auto' : 'poster', cap: cap(), playing: playing.length, groups: playing.map(function (r) { return r.group; }), files: playing.map(function (r) { return String(r.v.getAttribute('src') || '').split('/').pop(); }), clips: clips.length, failed: clips.filter(function (r) { return r.failed; }).length, blocked: blocked };
  }
};
init();
})();
