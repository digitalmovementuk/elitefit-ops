/* Elite Fit /groupfitness · Loud (s4-kinetic) · avatars.js · v1.9 (29 Oct 2026)
   The engine draws its own coach avatars (finder rows, step-2 strip) from coach.avatar. This points coach.avatar at the
   head-and-shoulders crop in engine-v2/img/r (RULINGS #53a) before anything renders, so the shared v1 file is never
   requested (WebKit starts fetching an img's src before its srcset is set). Loaded right after api.js, so this .then runs
   before booking.js's. page.js does the same once more (harmless). Classic deferred script, ES5. */
(function (w) {
  'use strict';
  var EF = w.EF;
  if (!EF || !EF.api || !EF.api.load) { return; }
  EF.api.load().then(function (d) {
    (d.coaches || []).forEach(function (c) {
      try { c.avatar = new w.URL('../../engine-v2/img/r/avatar-' + c.id + '-64.webp', w.location.href).href; } catch (e) { }
    });
  }, function () { });
})(window);
