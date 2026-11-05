/* Elite Fit Group Fitness · Home · base.js (27 Oct 2026)
   The shared engine (../../v1/assets/js/api.js and booking.js) reads the class data from v1 and writes the media paths
   in that data page-relative ("assets/img/…"). This page lives two folders deeper, so before anything renders
   (this promise reaction is registered before booking.js registers its own boot) every shared asset path is pointed
   at ../../v1/. Nothing else in the data changes. Classic deferred script, ES5, one IIFE. */
(function (w) {
'use strict';
var EF = w.EF = w.EF || {};
var BASE = '../../v1/';
function fix(p) { return (typeof p === 'string' && /^assets\//.test(p)) ? BASE + p : p; }
EF.base = { v1: BASE, fix: fix };
if (!EF.api || !EF.api.load) { return; }
EF.api.load().then(function (d) {
  var i, f, c;
  for (i = 0; i < (d.families || []).length; i++) { f = d.families[i]; f.video = fix(f.video); f.poster = fix(f.poster); }
  for (i = 0; i < (d.coaches || []).length; i++) { c = d.coaches[i]; c.photo = fix(c.photo); c.avatar = fix(c.avatar); }
  return d;
}, function () {});
})(window);
