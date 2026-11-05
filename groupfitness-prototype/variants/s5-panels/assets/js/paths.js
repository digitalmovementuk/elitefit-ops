/* Elite Fit /groupfitness · Panels app · paths.js · 27 Oct 2026
   The shared v1 data file lists media as page-relative paths ("assets/img/…") written for v1/index.html.
   This variant lives two folders deeper, so before any other script reads the data we point those paths
   at the shared files in ../../v1/. Runs after v1 api.js and before v1 booking.js (defer order), so its
   .then() is the first one on the load promise. Nothing is copied, nothing else changes. ES5, one IIFE. */
(function (w) {
'use strict';
var EF = w.EF = w.EF || {};
if (!EF.api || !EF.api.load) { return; }
var BASE = '../../v1/';
function fix(p) { return (typeof p === 'string' && p && !/^(?:[a-z]+:|\/|\.\.\/)/i.test(p)) ? BASE + p : p; }
EF.api.load().then(function (d) {
  var i, f, c;
  for (i = 0; i < (d.families || []).length; i++) { f = d.families[i]; f.video = fix(f.video); f.poster = fix(f.poster); }
  for (i = 0; i < (d.coaches || []).length; i++) { c = d.coaches[i]; c.photo = fix(c.photo); c.avatar = fix(c.avatar); }
  return d;
}, function () {});
})(window);
