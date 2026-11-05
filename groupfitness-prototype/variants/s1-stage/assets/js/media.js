/* Elite Fit /groupfitness · Cinematic stage · media.js (27 Oct 2026)
   EF.media: lazy, capped, pausable clips.
   - video[data-clip] carry no src until they may play (preload="none"); posters sit underneath.
   - Chapter clips pick data-src-wide (16:9, from 1024 px in landscape) or data-src-tall (3:4, v1's clips).
   - Plays when its frame is 25 % visible; cap 2 on phones / coarse pointers, 3 on desktop; highest visibility first.
   - Bytes only after window load (+250 ms), so the title card and posters win the first paint.
   - While the sheet is open only data-group="sheet" clips play.
   - [data-pause="<group>"] toggles a visitor pause (aria-pressed, label Pause/Play). Reduced motion, Save-Data or no
     motion-ok: posters only, buttons start as Play; a visitor's Play is honoured.
   - EF.media.scan(root), EF.media.sync(). */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
if (EF.media && EF.media.version) { return; }
var root = d.documentElement;
var HAS_IO = 'IntersectionObserver' in w;
var clips = [], user = {}, sheetOpen = false, ready = false, blocked = false, queued = false;

function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
function mq(q) { try { return w.matchMedia ? w.matchMedia(q) : null; } catch (e) { return null; } }
function yes(m) { return !!(m && m.matches); }
function listen(m, fn) { if (!m) { return; } if (m.addEventListener) { m.addEventListener('change', fn); } else if (m.addListener) { m.addListener(fn); } }
var mqWide = mq('(min-width: 1024px) and (min-aspect-ratio: 5/4)');
var mqSmall = mq('(max-width: 1023.98px), (pointer: coarse)');
var mqReduce = mq('(prefers-reduced-motion: reduce)');
function slowNet() {
  try { var c = navigator.connection; return !!(c && (c.saveData || /^(slow-2g|2g)$/.test(c.effectiveType || ''))); } catch (e) { return false; }
}
function autoOk() { return HAS_IO && root.classList.contains('motion-ok') && !yes(mqReduce) && !slowNet(); }
function cap() { return yes(mqSmall) ? 2 : 3; }
function srcFor(v) {
  var wide = v.getAttribute('data-src-wide'), tall = v.getAttribute('data-src-tall');
  if (wide && yes(mqWide)) { return wide; }
  return tall || v.getAttribute('src') || '';
}
function boxOf(v) { return (v.closest && (v.closest('.frame') || v.closest('.sh-media') || v.closest('figure'))) || v.parentNode; }

var io = HAS_IO ? new w.IntersectionObserver(function (es) {
  each(es, function (e) { each(clips, function (r) { if (r.box === e.target) { r.vis = e.isIntersecting ? e.intersectionRatio : 0; } }); });
  queue();
}, { threshold: [0, 0.25, 0.5, 0.75, 1] }) : null;

function groupPaused(g) {
  if (user[g] === true) { return true; }
  if (user[g] === false) { return false; }
  return !autoOk() || blocked;
}
function syncButtons(g) {
  each(d.querySelectorAll('[data-pause="' + g + '"]'), function (b) {
    var p = groupPaused(g), l = b.getAttribute('aria-label') || '', t = b.querySelector('.pause__txt');
    b.setAttribute('aria-pressed', p ? 'true' : 'false');
    b.setAttribute('aria-label', l.replace(/^(Pause|Play)/, p ? 'Play' : 'Pause'));
    if (t) { t.textContent = p ? 'Play' : 'Pause'; }
  });
}
function register(v) {
  if (v._efc) { return; }
  v._efc = true;
  v.muted = true;
  v.setAttribute('muted', '');
  var r = { v: v, box: boxOf(v), group: v.getAttribute('data-group') || 'default', ambient: v.hasAttribute('data-ambient'), vis: HAS_IO ? 0 : 1, failed: false, cur: v.getAttribute('src') || '' };
  clips.push(r);
  v.addEventListener('playing', function () { v.classList.add('is-playing'); });
  v.addEventListener('error', function () { if (v.getAttribute('src')) { r.failed = true; v.classList.remove('is-playing'); } });
  if (io) { io.observe(r.box); }
  syncButtons(r.group);
}
function prune() {
  clips = clips.filter(function (r) {
    if (root.contains(r.v)) { return true; }
    if (io) { io.unobserve(r.box); }
    return false;
  });
}
function allowed(r) {
  if (r.failed || d.hidden) { return false; }
  if (sheetOpen && r.group !== 'sheet') { return false; }
  if (!sheetOpen && r.group === 'sheet') { return false; }
  return !groupPaused(r.group);
}
function play(r) {
  var v = r.v, s = srcFor(v), p;
  if (!s) { return; }
  if (r.cur !== s || !v.getAttribute('src')) { r.cur = s; v.classList.remove('is-playing'); v.setAttribute('src', s); }
  v.preload = 'auto';
  if (!v.paused) { return; }
  try { p = v.play(); } catch (e) { return; }
  if (p && p.catch) {
    p.catch(function (err) {
      if (err && err.name === 'NotAllowedError') { blocked = true; each(clips, function (c) { syncButtons(c.group); }); }
    });
  }
}
function stop(r) { if (!r.v.paused) { try { r.v.pause(); } catch (e) { } } }
function sync() {
  queued = false;
  if (!ready) { return; }
  prune();
  var want = clips.filter(function (r) { return !r.ambient && r.vis >= 0.25 && allowed(r); })
    .sort(function (a, b) { return b.vis - a.vis; }).slice(0, cap())
    .concat(clips.filter(function (r) { return r.ambient && r.vis >= 0.25 && allowed(r); }));
  each(clips, function (r) { if (want.indexOf(r) > -1) { play(r); } else { stop(r); } });
}
function queue() {
  if (queued) { return; }
  queued = true;
  (w.requestAnimationFrame || function (f) { return w.setTimeout(f, 16); })(sync);
}
function scan(rootEl) { each((rootEl || d).querySelectorAll('video[data-clip]'), register); prune(); queue(); }

d.addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('[data-pause]') : null, g;
  if (!b) { return; }
  g = b.getAttribute('data-pause');
  user[g] = !groupPaused(g);
  if (user[g] === false) { blocked = false; }
  syncButtons(g);
  sync();
});
d.addEventListener('ef:sheet', function (e) { sheetOpen = !!(e.detail && e.detail.open); prune(); queue(); });
d.addEventListener('visibilitychange', queue);
var rt = 0;
w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(queue, 150); });
listen(mqWide, function () { each(clips, function (r) { if (r.cur && r.cur !== srcFor(r.v)) { stop(r); r.v.classList.remove('is-playing'); } }); queue(); });
listen(mqReduce, function () { each(clips, function (c) { syncButtons(c.group); }); queue(); });

function start() { ready = true; queue(); }
scan(d);
if (d.readyState === 'complete') { w.setTimeout(start, 250); } else { w.addEventListener('load', function () { w.setTimeout(start, 250); }); }

EF.media = { version: 's1-1.0', scan: scan, sync: queue };
})(window, document);
