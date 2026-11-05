/* Elite Fit /groupfitness · Kinetic type v1 · bridge.js (27 Oct 2026)
   The shared engine (../../v1/assets/js/api.js + booking.js) is linked unchanged. Its data file lists media as
   "assets/img/…" relative to the v1 page. This variant lives two folders deeper, so before any other script reads
   the data, the shared media paths are pointed at ../../v1/. Loads after api.js and before booking.js, so its
   .then() runs first. No network calls of its own. */
(function (w) {
'use strict';
var EF = w.EF = w.EF || {};
var BASE = '../../v1/';
EF.assetBase = BASE;
function fix(p) { return (typeof p === 'string' && /^assets\//.test(p)) ? BASE + p : p; }
if (!EF.api || !EF.api.load) { return; }
EF.api.load().then(function (d) {
  var i;
  for (i = 0; i < (d.families || []).length; i++) { d.families[i].video = fix(d.families[i].video); d.families[i].poster = fix(d.families[i].poster); }
  for (i = 0; i < (d.coaches || []).length; i++) { d.coaches[i].photo = fix(d.coaches[i].photo); d.coaches[i].avatar = fix(d.coaches[i].avatar); }
}, function () {});
})(window);
