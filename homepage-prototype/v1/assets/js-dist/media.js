(function (w, d) {
'use strict';
var clips = [].slice.call(d.querySelectorAll('video.clip[data-clip]'));
if (!clips.length || !('IntersectionObserver' in w)) { return; }
var HOLD = 450;
var root = d.documentElement;
function mq(q) { return (w.matchMedia && w.matchMedia(q)) || { matches: false }; }
var reduce = mq('(prefers-reduced-motion: reduce)');
var phone = mq('(max-width: 1023.98px), (pointer: coarse)');
var blocked = false, hold = false, timer = 0;
function allowed() {
var c = navigator.connection;
return !blocked && !d.hidden && !reduce.matches && root.classList.contains('motion-ok') &&
!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}
function play(v) {
if (!v.paused) { return; }
v.muted = true;
v.preload = 'auto';
var p;
try { p = v.play(); } catch (e) { p = 0; }
if (p && p.then) {
p.then(null, function (e) {
if (e && e.name === 'NotAllowedError') { blocked = true; sync(); }
});
}
}
function sync() {
var ok = allowed(), cap = phone.matches ? 2 : 3, want = [];
[].forEach.call(d.querySelectorAll('video:not(.clip)'), function (o) { if (!o.paused) { cap--; } });
clips.forEach(function (v) {
var s = v._stage;
if (ok && v._vis > 0 && (!s || (!hold && s.getAttribute('data-stage-active') === 'true'))) { want.push(v); }
});
want.sort(function (a, b) { return b._vis - a._vis; });
want = want.slice(0, Math.max(0, cap));
clips.forEach(function (v) {
if (want.indexOf(v) > -1) { play(v); } else if (!v.paused) { v.pause(); }
});
}
var near = new IntersectionObserver(function (es) {
es.forEach(function (e) {
if (e.isIntersecting && allowed()) { e.target._clip.preload = 'auto'; near.unobserve(e.target); }
});
}, { rootMargin: '50% 0px' });
var seen = new IntersectionObserver(function (es) {
es.forEach(function (e) { e.target._clip._vis = e.isIntersecting ? e.intersectionRatio : 0; });
sync();
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });
clips.forEach(function (v) {
var box = v.parentNode;
box._clip = v;
v._vis = 0;
v._stage = v.closest('.rec__stage');
v.addEventListener('playing', function () { v.setAttribute('data-clip-state', 'playing'); });
v.addEventListener('pause', function () { v.setAttribute('data-clip-state', 'paused'); });
near.observe(box);
seen.observe(box);
});
d.addEventListener('ef:recovery:stage', function () {
hold = true;
sync();
clearTimeout(timer);
timer = setTimeout(function () { hold = false; sync(); }, HOLD);
});
d.addEventListener('visibilitychange', sync);
[reduce, phone].forEach(function (m) {
if (m.addEventListener) { m.addEventListener('change', sync); } else if (m.addListener) { m.addListener(sync); }
});
if (w.MutationObserver) { new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] }); }
})(window, document);
