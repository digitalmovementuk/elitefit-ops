/* Elite Fit /groupfitness · Cinematic stage · base.js (27 Oct 2026)
   The variant reuses v1's engine (api.js + booking.js, unchanged) and v1's media. groupfitness.json stores media paths
   relative to v1/ ("assets/video/boxing.mp4"), so this file rebases them to ../../v1/ before anything renders.
   It must load after api.js and before booking.js: its then() is registered first, so it runs before booking.js boots a deep link. */
(function (w) {
'use strict';
var EF = w.EF = w.EF || {};
var BASE = '../../v1/';
EF.base = BASE;
function fix(p) { return (typeof p === 'string' && /^assets\//.test(p)) ? BASE + p : p; }
function rebase(d) {
  var i, f, c;
  if (!d || d._s1Rebased) { return d; }
  for (i = 0; d.families && i < d.families.length; i++) { f = d.families[i]; f.video = fix(f.video); f.poster = fix(f.poster); }
  for (i = 0; d.coaches && i < d.coaches.length; i++) { c = d.coaches[i]; c.photo = fix(c.photo); c.avatar = fix(c.avatar); }
  d._s1Rebased = true;
  return d;
}
if (EF.api && EF.api.load) { EF.api.load().then(rebase, function () { }); }
})(window);
