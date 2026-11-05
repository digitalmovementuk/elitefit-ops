/* ============================================================================
   Elite Fit Bali — homepage v2.0 — assets/js/main.js (integrator, Step 3)
   Version: v2.0 — 2026-10-01 · classic deferred script, one IIFE, loads last
   (CONTRACT §6 order: api, shop, schedule, hero, motion, main). Never throws,
   never logs, never animates: it only sets the state attributes the lanes and
   the motion layer read.

   1. Checkout gate. MOCK: the checkout in v2.0 is a labelled concept
      (CONTRACT §1). It must never run on a public domain (WP-MAPPING §1 hard
      gate). Mode, from window.EF_CONFIG.checkout and the host:
        'concept'  – the concept checkout opens (default on localhost,
                     127.0.0.1, file:, *.local, *.test, and on hosts listed in
                     EF_CONFIG.previewHosts, e.g. a noindexed staging site)
        'whatsapp' – every [data-open-checkout] opens a pre-filled WhatsApp
                     chat instead and #checkout is hidden (default on every
                     other host, and whenever #checkout is not on the page)
        'live'     – EFApi runs in live mode (phase 2; not wired in v2.0)
      The mode is written to <html data-checkout="…">.
   2. Header menu (#hdr-menu[data-state], .hdr__toggle[aria-expanded]):
      toggle; close on Escape (focus back to the toggle), on a link or button
      tap inside the menu, on a tap outside the header, when focus leaves the
      header, and when the viewport reaches 1024 px. Not modal: no focus trap.
   3. Coaches "Show all five" (.team__more[aria-expanded][data-state]).
   4. Motion failsafe: if html.motion-ok is set and motion.js is missing, or
      html.motion-live has not appeared 3 s after `load`, remove motion-ok so
      the complete static layout shows (lane L4: Recharge rooms 2–4).
   5. Skip link: moves focus to the Today heading, not only the scroll.
   6. v2.1 lane E1: where am I, anchor jumps, cursor response (notes at §6).
   Change log: v2.0 integrator · v2.1 — 2026-10-01 lane E1 item 6.
   ============================================================================ */
(function (win, doc) {
'use strict';
var root = doc.documentElement;
var WA = 'https://wa.me/6285195520220';
function guard(fn) {
return function () {
try { return fn.apply(this, arguments); } catch (e) { }
};
}
function closest(node, sel) {
while (node && node.nodeType !== 1) { node = node.parentNode; }
return node && node.closest ? node.closest(sel) : null;
}
function cfg() { return win.EF_CONFIG && typeof win.EF_CONFIG === 'object' ? win.EF_CONFIG : {}; }
var TIER = { perform: 'Perform', elite: 'Elite', recharge: 'Recharge' };
var LENGTH = { day: 'day pass', week: '1-week pass', w4: '4-week membership', w12: '12-week membership', w26: '26-week membership', w52: '52-week membership' };
function isLocalHost() {
var p = win.location.protocol, h = win.location.hostname;
return p === 'file:' || h === '' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1' || /\.(local|test|localhost)$/i.test(h);
}
function checkoutMode() {
var c = cfg();
var api = win.EFApi;
if (!doc.getElementById('checkout')) { return 'whatsapp'; }
if (api && api.mode === 'live') { return 'live'; }
if (c.checkout === 'whatsapp') { return 'whatsapp'; }
var hosts = Array.isArray(c.previewHosts) ? c.previewHosts : [];
if (isLocalHost() || hosts.indexOf(win.location.hostname) > -1) { return 'concept'; }
return 'whatsapp'; // MOCK must not reach a public domain
}
function waText(el) {
var tier = TIER[el.getAttribute('data-tier')] || '';
var len = LENGTH[el.getAttribute('data-length')] || '';
var what = tier && len ? ' (' + tier + ', ' + len + ')' : '';
return 'Hello Elite Fit Bali! I would like to buy a pass' + what + '.';
}
function openWhatsApp(el) {
var a = doc.createElement('a');
a.href = WA + '?text=' + encodeURIComponent(waText(el));
a.target = '_blank';
a.rel = 'noopener';
a.style.display = 'none';
doc.body.appendChild(a);
a.click();
doc.body.removeChild(a);
}
var MODE = 'concept';
guard(function () {
MODE = checkoutMode();
root.setAttribute('data-checkout', MODE);
if (MODE !== 'whatsapp') { return; }
var co = doc.getElementById('checkout');
if (co) { co.hidden = true; co.setAttribute('aria-hidden', 'true'); }
win.addEventListener('click', guard(function (e) {
var el = closest(e.target, '[data-open-checkout]');
if (!el) { return; }
e.preventDefault();
openWhatsApp(el);
}), true);
})();
guard(function () {
var header = doc.getElementById('site-header');
var toggle = doc.querySelector('.hdr__toggle');
var menu = doc.getElementById('hdr-menu');
if (!header || !toggle || !menu) { return; }
var mqDesk = win.matchMedia ? win.matchMedia('(min-width: 1024px)') : null;
var reopenFromBuy = false;
function isOpen() { return menu.getAttribute('data-state') === 'open'; }
function set(open, focusToggle) {
if (open === isOpen()) { return; }
toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
menu.setAttribute('data-state', open ? 'open' : 'closed');
if (!open && focusToggle) { try { toggle.focus({ preventScroll: true }); } catch (e) { toggle.focus(); } }
}
if (menu.getAttribute('data-state') !== 'open') { toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', guard(function () { set(!isOpen(), false); }));
menu.addEventListener('click', guard(function (e) {
var hit = closest(e.target, 'a, button');
if (!hit || !menu.contains(hit)) { return; }
if (hit.hasAttribute('data-open-checkout')) { reopenFromBuy = true; }
set(false, false);
}));
var scrim = header.querySelector('.hdr__scrim');
if (scrim) { scrim.addEventListener('click', guard(function () { set(false, false); })); }
doc.addEventListener('keydown', guard(function (e) {
if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) { set(false, true); }
}));
doc.addEventListener('pointerdown', guard(function (e) {
if (isOpen() && !header.contains(e.target)) { set(false, false); }
}), { passive: true });
header.addEventListener('focusout', guard(function (e) {
var to = e.relatedTarget;
if (isOpen() && to && !header.contains(to)) { set(false, false); }
}));
if (mqDesk) {
var onDesk = guard(function () { if (mqDesk.matches) { set(false, false); } });
if (mqDesk.addEventListener) { mqDesk.addEventListener('change', onDesk); } else if (mqDesk.addListener) { mqDesk.addListener(onDesk); }
}
var co = doc.getElementById('checkout');
if (co && 'MutationObserver' in win) {
new win.MutationObserver(guard(function () {
if (!reopenFromBuy || co.getAttribute('data-state') !== 'closed') { return; }
reopenFromBuy = false;
win.setTimeout(guard(function () {
var a = doc.activeElement;
if (!a || a === doc.body || menu.contains(a)) { try { toggle.focus({ preventScroll: true }); } catch (e) { toggle.focus(); } }
}), 320);
})).observe(co, { attributes: true, attributeFilter: ['data-state'] });
}
})();
doc.addEventListener('click', guard(function (e) {
var btn = closest(e.target, '.team__more');
if (!btn) { return; }
var open = btn.getAttribute('data-state') === 'open';
btn.setAttribute('data-state', open ? 'closed' : 'open');
btn.setAttribute('aria-expanded', open ? 'false' : 'true');
}));
guard(function () {
if (!root.classList.contains('motion-ok')) { return; }
if (!win.EFMotion) { root.classList.remove('motion-ok'); return; }
var check = guard(function () {
if (!root.classList.contains('motion-live')) { root.classList.remove('motion-ok'); }
});
var arm = function () { win.setTimeout(check, 3000); };
if (doc.readyState === 'complete') { arm(); } else { win.addEventListener('load', arm, { once: true }); }
})();
doc.addEventListener('click', guard(function (e) {
var link = closest(e.target, '.skip-link');
if (!link) { return; }
var id = (link.getAttribute('href') || '').replace(/^#/, '');
var target = id && doc.getElementById(id);
if (!target) { return; }
var focusEl = target.querySelector('h2, h1') || target;
if (!focusEl.hasAttribute('tabindex')) { focusEl.setAttribute('tabindex', '-1'); }
e.preventDefault();
target.scrollIntoView({ block: 'start' });
try { focusEl.focus({ preventScroll: true }); } catch (err) { focusEl.focus(); }
if (win.history && win.history.replaceState) { try { win.history.replaceState(win.history.state, '', '#' + id); } catch (err) { } }
}));
guard(function () {
var kbd = false;
doc.addEventListener('keydown', function () { kbd = true; }, true);
doc.addEventListener('pointerdown', function () { kbd = false; }, true);
doc.addEventListener('focusin', function (e) {
var t = e.target;
if (!kbd && t.setAttribute && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { t.setAttribute('data-e1-quiet', ''); }
}, true);
doc.addEventListener('focusout', function (e) { if (e.target.removeAttribute) { e.target.removeAttribute('data-e1-quiet'); } }, true);
var hdr = doc.getElementById('site-header');
if (!hdr) { return; }
var nav = hdr.querySelector('.hdr__nav');
var ind = hdr.querySelector('.hdr__ind');
var links = [].slice.call(hdr.querySelectorAll('a[href^="#"]'));
var cur = null;
function moving() { return root.classList.contains('motion-ok'); }
var place = guard(function () {
if (!ind || !ind.offsetParent) { return; }
var a = nav.querySelector('[aria-current]');
if (!a) { nav.removeAttribute('data-cur'); return; }
var p = parseFloat(win.getComputedStyle(a).paddingLeft) || 0;
ind.style.setProperty('--e1-x', a.offsetLeft + p + 'px');
ind.style.setProperty('--e1-s', ((a.offsetWidth - 2 * p) / 100).toFixed(3));
nav.setAttribute('data-cur', '');
});
function setCur(id) {
if (id === cur) { return; }
cur = id;
links.forEach(function (a) {
if (a.getAttribute('href') === '#' + id) { a.setAttribute('aria-current', 'location'); } else { a.removeAttribute('aria-current'); }
});
place();
}
if ('IntersectionObserver' in win) {
var io = new win.IntersectionObserver(guard(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { setCur(e.target.id); } });
}), { rootMargin: '-40% 0px -59% 0px' });
[].forEach.call(doc.querySelectorAll('main > section[id]'), function (s) { io.observe(s); });
}
win.addEventListener('resize', place, { passive: true });
if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(place); }
function cue(h) {
if (h.animate) {
h.animate([{ opacity: 0.2, transform: 'translateY(0.3em)' }, { opacity: 1, transform: 'none' }],
{ duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
}
}
doc.addEventListener('click', guard(function (e) {
if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
var a = closest(e.target, 'a[href^="#"]');
var id = a && !a.classList.contains('skip-link') ? a.getAttribute('href').slice(1) : '';
var t = id && doc.getElementById(id);
if (!t) { return; }
e.preventDefault();
var smooth = moving();
var from = win.pageYOffset;
var H = win.innerHeight;
var y = Math.round(t.getBoundingClientRect().top + from - hdr.offsetHeight + (parseFloat(win.getComputedStyle(hdr).getPropertyValue('--e1-shrink')) || 0));
if (smooth && Math.abs(y - from) > 1.5 * H) { win.scrollTo(0, y > from ? y - 0.6 * H : y + 0.6 * H); }
if (!smooth) { win.scrollTo(0, y); }
try { win.history.pushState(null, '', '#' + id); } catch (err) { }
var h = t.querySelector('h2, h1') || t;
var fresh = h.getAttribute('data-m-words') === 'pre';
if (!h.hasAttribute('tabindex')) { h.setAttribute('tabindex', '-1'); }
try { h.focus({ preventScroll: true }); } catch (err) { }
if (smooth) { glide(y, fresh ? null : h); }
}));
var run = 0;
function glide(y, h) {
var from = win.pageYOffset, d = y - from, t0 = 0, id = ++run;
var dur = Math.min(win.innerWidth < 760 ? 160 : 200, 90 + Math.abs(d) * 0.15);
var stop = function () { run++; };
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (n) { win.addEventListener(n, stop, { passive: true, once: true }); });
win.requestAnimationFrame(function step(t) {
if (id !== run) { return; }
if (!t0) { t0 = t; }
var p = Math.min(1, (t - t0) / dur);
win.scrollTo(0, Math.round(from + d * (1 - Math.pow(1 - p, 3))));
if (p < 1) { win.requestAnimationFrame(step); } else if (h) { cue(h); }
});
}
var fine = win.matchMedia ? win.matchMedia('(hover: hover) and (pointer: fine)') : null;
var mag = null, box = null;
function free() { if (mag) { mag.style.translate = ''; mag = null; } }
doc.addEventListener('pointermove', guard(function (e) {
var b = e.pointerType === 'mouse' && fine && fine.matches && moving() ? closest(e.target, '#hero .btn--primary, #site-header .btn--primary') : null;
if (b !== mag) { free(); if (!b) { return; } mag = b; box = b.getBoundingClientRect(); }
if (!b) { return; }
b.style.translate = (((e.clientX - box.left) / box.width - 0.5) * 6).toFixed(1) + 'px ' + (((e.clientY - box.top) / box.height - 0.5) * 4).toFixed(1) + 'px';
}), { passive: true });
win.addEventListener('scroll', free, { passive: true });
})();
win.EFMain = { version: '2.0', checkout: function () { return MODE; } };
}(window, document));
