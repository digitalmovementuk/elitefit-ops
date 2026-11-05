/* Elite Fit /groupfitness · Editorial · paths.js (27 Oct 2026)
   The shared data file (../../v1/assets/data/groupfitness.json) stores media paths relative to the v1 page
   ("assets/img/…", "assets/video/…"). This variant lives two folders deeper, so before booking.js and page.js
   use the data, point those paths at ../../v1/. Runs right after api.js, so its .then() is registered first.
   Nothing else is changed; v1 files are untouched. */
(function (w) {
'use strict';
var EF = w.EF = w.EF || {};
if (!EF.api || !EF.api.load || EF.pathsFixed) { return; }
EF.pathsFixed = true;
var BASE = '../../v1/';
function fix(v) { return (typeof v === 'string' && /^assets\//.test(v)) ? BASE + v : v; }
EF.api.load().then(function (d) {
  var i;
  (d.families || []).forEach(function (f) { f.video = fix(f.video); f.poster = fix(f.poster); });
  (d.coaches || []).forEach(function (c) { c.photo = fix(c.photo); c.avatar = fix(c.avatar); });
  for (i = 0; i < (d.classes || []).length; i++) { if (d.classes[i].video) { d.classes[i].video = fix(d.classes[i].video); } }
  return d;
}, function () {});
})(window);
