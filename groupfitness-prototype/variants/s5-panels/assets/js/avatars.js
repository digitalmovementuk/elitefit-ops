/* Elite Fit /groupfitness · Tactile · avatars.js · 29 Oct 2026 (v2.8)
   RULINGS #53/#53a: every coach avatar comes from the engine's head-and-shoulders set, engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp,
   never the tight shared v1/assets/img/avatar-*.webp (which stays untouched). The engine draws its own avatars (finder rows, the step 2
   strip) from coach.avatar, and a deep link renders them as soon as the data is in. WebKit fetches an img's src before its srcset, so the
   data is re-pointed here, loaded right after api.js: this is the first .then() on the load promise, ahead of booking.js and page.js.
   It also gives each coach an avatarSet (48w to 128w) for page.js, and adds the new file name to the engine's srcset map (keyed by name).
   ES5, one IIFE. */
(function (w) {
  'use strict';
  var EF = w.EF;
  if (!EF || !EF.api || !EF.api.load) { return; }
  var DIR = '../../engine-v2/img/r/avatar-', WIDTHS = [48, 64, 96, 128];
  function abs(p) { try { return new URL(p, document.baseURI).href; } catch (e) { return p; } }
  function set(id) { return WIDTHS.map(function (x) { return abs(DIR + id + '-' + x + '.webp') + ' ' + x + 'w'; }).join(', '); }
  EF.api.load().then(function (d) {
    var i, c, m;
    d.srcset = d.srcset || {};
    for (i = 0; i < (d.coaches || []).length; i++) {
      c = d.coaches[i];
      m = /avatar-([a-z]+)\.webp(?:$|\?)/.exec(String(c.avatar || ''));
      if (!m) { continue; }
      c.avatarSet = set(m[1]);
      c.avatar = abs(DIR + m[1] + '-96.webp');
      d.srcset['avatar-' + m[1] + '-96.webp'] = c.avatarSet;
    }
    return d;
  }, function () {});
})(window);
