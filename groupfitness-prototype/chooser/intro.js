/* Elite Fit /groupfitness chooser · intro title card · v1 rev 11 · 29 Oct 2026 · Digital Movement
   Pairs with chooser/intro.css. Runs only when the head guard set html.efi (normal load or reload; not back/forward, not a return
   from a concept page; ?intro=1 forces, ?intro=0 turns off). Builds the overlay once, never reads layout, never moves focus.
   The timing lives in intro.css; this file starts it when the logo is decoded (300 ms cap), ends it early on any click, tap, swipe,
   key, wheel or focus, and removes the node when its fade ends. A click or tap that skips lands on the overlay itself, so it never
   opens a card underneath; pointer events pass through from that moment. The words are announced once through a polite status line.
   Changelog: v1 rev 11 (29 Oct 2026) first release. */
(function (d, w) {
  'use strict';
  var de = d.documentElement, cl = de.classList;
  if (!cl.contains('efi')) { return; }
  function quit() { cl.remove('efi', 'efi-on'); }
  var css = d.querySelector('link[href$="chooser/intro.css"]');
  if (!css || !d.body) { quit(); return; }
  // WebKit can run a deferred script before a stylesheet has loaded: wait for intro.css instead of giving up
  if (css.sheet) { start(); } else { css.addEventListener('load', start); css.addEventListener('error', quit); }

  function start() {
  var fp = 0; // first paint (first contentful paint where the browser has no first-paint entry)
  try { performance.getEntriesByType('paint').forEach(function (e) { if (!fp || e.name === 'first-paint') { fp = e.startTime; } }); } catch (e) {}
  if (fp && performance.now() - fp > 700) { quit(); return; } // too late to start a title card: show the page

  var i, s, fr = '', dim;
  function v(x, y, a, b, x0, y0, a0, b0) { return ' style="--x:' + x + 'px;--y:' + y + 'px;--a:' + a + ';--b:' + b + ';--x0:' + x0 + 'px;--y0:' + y0 + 'px;--a0:' + a0 + ';--b0:' + b0 + '"'; }
  function m(p, st, c) { return '<path class="m' + (c ? ' ' + c : '') + '" d="' + p + '"' + st + '/>'; }
  /* phone 40 x 80 -> monitor 156 x 98, radius 7: four corners move, four unit edges stretch (non-scaling strokes) */
  dim = m('M-1 0H1', v(0, -61, 78, 1, 0, -52, 20, 1));
  for (i = 0; i < 4; i++) {
    var sx = i === 1 || i === 2 ? 1 : -1, sy = i > 1 ? 1 : -1;
    fr += m('M0 ' + -sy * 7 + 'A7 7 0 0 ' + (sx * sy > 0 ? 1 : 0) + ' ' + -sx * 7 + ' 0', v(sx * 78, sy * 49, 1, 1, sx * 20, sy * 40, 1, 1));
  }
  for (s = -1; s < 2; s += 2) {
    fr += m('M-1 0H1', v(0, s * 49, 71, 1, 0, s * 40, 13, 1)) + m('M0-1V1', v(s * 78, 0, 1, 42, s * 20, 0, 1, 33));
    dim += m('M0-1V1', v(s * 78, -61, 1, 3.5, s * 20, -52, 1, 3.5));
  }
  /* the chooser itself as a grey wireframe: featured card + four, stacked on the phone, in one row on the desktop */
  var PH = [[-16, -30, 32, 16], [-16, -10, 32, 7.5], [-16, 1.5, 32, 7.5], [-16, 13, 32, 7.5], [-16, 24.5, 32, 7.5]], bk = '';
  for (i = 0; i < 5; i++) {
    bk += '<rect class="m" width="1" height="1"' + (i ? v(-68 + (i - 1) * 35.25, 4, 30.25, 30, PH[i][0], PH[i][1], PH[i][2], PH[i][3]) : v(-68, -34, 136, 32, -16, -30, 32, 16)).replace('"', '"--dl:' + i * 35 + 'ms;') + '/>';
  }
  var svg = '<svg class="efi-g" viewBox="-84 -68 168 136" width="168" height="136" aria-hidden="true" focusable="false">' +
    '<g class="efi-dim">' + dim + '</g>' +
    '<g class="efi-dr"><path d="M0 40H-13A7 7 0 0 1-20 33V-33A7 7 0 0 1-13-40H0"/><path d="M0 40H13A7 7 0 0 0 20 33V-33A7 7 0 0 0 13-40H0"/></g>' +
    '<g class="efi-bk">' + bk + '</g><g class="efi-fr">' + fr + '</g><rect class="efi-n" x="-5" y="-36" width="10" height="3" rx="1.5"/>' +
    '<path class="efi-nk" d="M-8 49.5L-10 63"/><path class="efi-nk" d="M8 49.5L10 63"/>' + m('M-1 0H1', v(0, 63, 28, 1, 0, 63, 0.01, 1), 'efi-bs') + '</svg>';

  var ov = d.createElement('div'), sr = d.createElement('p');
  ov.className = 'efi-ov efi-wait' + (cl.contains('motion-ok') ? '' : ' efi-still');
  ov.setAttribute('aria-hidden', 'true');
  ov.innerHTML = '<div class="efi-st"><div class="efi-dm"><img src="./chooser/brand/dm-logo-color-negative.svg" width="1098" height="234" alt="Digital Movement" decoding="async">' +
    '<div class="efi-cl"><div class="efi-cu"></div></div></div><div class="efi-ds"><div class="efi-art"><div>' + svg + '</div></div>' +
    '<p class="efi-copy"><span class="efi-l efi-l1"><span>Best on desktop</span></span> <span class="efi-l efi-l2"><span>screen for full design experience</span></span></p></div></div>';
  sr.className = 'efi-sr';
  sr.setAttribute('role', 'status');
  d.body.appendChild(ov);
  d.body.appendChild(sr);
  cl.add('efi-on'); // the head cover hands over to the overlay (same colour, no visible change)

  var EV = ['click', 'pointercancel', 'keydown', 'wheel', 'focusin'], done = 0, started = 0, safety;
  function go() { if (!started) { started = 1; ov.classList.remove('efi-wait'); } }
  function exitStart() {
    if (done) { return; }
    done = 1;
    ov.classList.add('efi-x');   // never blocks the page from here on
    cl.remove('efi');             // the chooser's own first-paint motion plays now
    EV.forEach(function (e) { w.removeEventListener(e, skip, true); });
  }
  function end() { exitStart(); clearTimeout(safety); if (ov.parentNode) { ov.parentNode.removeChild(ov); } cl.remove('efi-on'); }
  function skip() { if (!done) { ov.classList.add('efi-skip', 'efi-x'); exitStart(); } }
  ov.addEventListener('animationstart', function (e) { if (e.target === ov) { exitStart(); } });
  ov.addEventListener('animationend', function (e) { if (e.target === ov) { end(); } });
  EV.forEach(function (e) { w.addEventListener(e, skip, { capture: true, passive: true }); });
  ov.addEventListener('touchend', function (e) { if (!done && e.cancelable) { e.preventDefault(); } skip(); }); // a skip tap never becomes a click on a card
  w.addEventListener('pageshow', function (e) { if (e.persisted) { end(); } });
  safety = setTimeout(end, 5000);

  var img = ov.querySelector('img');
  if (img.decode) { img.decode().then(go, go); } else { go(); }
  setTimeout(go, 300);
  setTimeout(function () { sr.textContent = 'Digital Movement. Best on desktop screen for full design experience.'; }, 150);
  }
})(document, window);
