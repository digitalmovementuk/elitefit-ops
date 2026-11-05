/* Elite Fit · Design concept, Home v2a, booking-first · base.js (copied from variants/s3-home on 28 Oct 2026, unchanged logic)
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
  /* Handover fix, 29 Oct 2026: the shared conditioning clip has a head cut by its left source edge (RULINGS #46). This page uses its own face-safe re-cut, kept in this folder (the shared files stay untouched). */
  for (i = 0; i < (d.families || []).length; i++) { f = d.families[i]; if (f.id === 'conditioning') { f.video = 'assets/video/conditioning-facesafe.mp4'; f.poster = 'assets/img/conditioning-facesafe-poster.webp'; } }
  for (i = 0; i < (d.coaches || []).length; i++) { c = d.coaches[i]; c.photo = fix(c.photo); c.avatar = fix(c.avatar); }
  /* Handover fix, 29 Oct 2026 (RULINGS #53, #56): the coach avatars are the re-cropped files of the shared engine (head and shoulders, >= 3 px clear in the circle); the v1 avatar files are never requested. */
  for (i = 0; i < (d.coaches || []).length; i++) { c = d.coaches[i]; c.avatar = '../../engine-v2/img/r/avatar-' + c.id + '-96.webp'; }
  return d;
}, function () {});
})(window);
