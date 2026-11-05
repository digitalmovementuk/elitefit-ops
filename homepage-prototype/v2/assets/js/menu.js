/* menu.js · Version: v3.0 — 2026-10-02 · owner: menu sheet lane · own engine, transform + opacity only (see menu.css)
   Changelog: v3.0 created (Amendment 1). Listens for the document event "ef:menu" (the header button [data-menu], hero lane) and opens/closes #menu-sheet.
   Keeps aria-expanded and data-open on [data-menu] in sync. While open: role=dialog aria-modal, the rest of the page inert, focus trapped (header button + sheet), Esc and
   backdrop tap close, scroll locked with overflow:hidden on <html> (no position change, so no jump; scrollY is restored if a browser moved it), focus goes back to the button.
   A link click closes the sheet first, then jumps to the anchor with the destination highlight (window.EF.highlight from the hero lane, else a fallback).
   Speed (v3.0 r2, 4x CPU: tap to first paint 30 ms or better): the tap itself only flips #menu-sheet[data-s] and the button state, which starts the transform/opacity transitions on
   a sheet that is already laid out (visibility, not display). Everything else (focus, inert, scroll lock, header ink, live visit block, clock) runs after that first paint.
   Data: assets/data/menu-nav.json (links, socials), site.json (address, WhatsApp number), hours.json (hours, open state via timetable.js). Nothing is hard-coded here. */
import { witaNow, loadHours, openState } from './timetable.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DEF = {};                                  // provisional strings are read from the <template id="mnu-strings"> in the partial (build.mjs swaps copy.json into them)
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };
const getJson = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const cssMs = (name, dflt) => { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); const n = parseFloat(v); return Number.isFinite(n) ? n * (/ms$/.test(v) ? 1 : 1000) : dflt; };   // a custom property from menu.css, read once
/** runs after the next paint: rAF (before the frame) + a message (after it) */
const afterPaint = (fn) => requestAnimationFrame(() => { const ch = new MessageChannel(); ch.port1.onmessage = fn; ch.port2.postMessage(0); });

export async function init(ctx) {
  const sheet = $('#menu-sheet'), btn = $('[data-menu]');
  if (!sheet || !btn) return;
  const panel = $('[data-mnu-panel]', sheet), root = document.documentElement;
  const tpl = $('#mnu-strings');
  if (tpl) $$('[data-copy]', tpl.content).forEach((el) => { DEF[el.getAttribute('data-copy')] = el.textContent.trim(); });
  const T = (k, v) => { const s = ctx.t(k, v); return s === k ? fill(DEF[k] != null ? DEF[k] : k, v) : s; };

  let isOpen = false, locked = false, y0 = 0, token = 0, finishTimer = 0, clockTimer = 0, earlyTimer = 0, inerted = [], afterQ = null, linksSig = '';
  const EXIT = ctx.motion ? cssMs('--mnu-out', 220) : (ctx.reduced ? 0 : cssMs('--mnu-fade', 120));   // how long the sheet stays on screen after a close
  const model = { nav: null, site: null, hours: null };

  /* ---------- data ---------- */
  const ready = Promise.all([getJson('assets/data/menu-nav.json'), getJson('assets/data/site.json'), loadHours()]).then(([nav, site, hours]) => {
    model.nav = nav; model.site = site; model.hours = hours;
    paintStatic(); paintState(); prepareLinks();   // all of it before the first tap, so opening only has to start the transition
    (window.requestIdleCallback || setTimeout)(warm, { timeout: 2500 });
  });

  /* one invisible pass in idle time: the panel is shown at 0.1 % opacity for two frames, so its layer, paint records and tiles exist before the first tap (the first open was 8 ms slower without it) */
  function warm() {
    if (isOpen || sheet.dataset.s !== 'closed' || sheet.hasAttribute('data-leaving')) return;
    sheet.dataset.s = 'warm';
    afterPaint(() => afterPaint(() => { if (sheet.dataset.s === 'warm') sheet.dataset.s = 'closed'; }));
  }

  function paintStatic() {
    const { nav, site } = model;
    // socials: href from the content model (the partial carries the same URLs as the no-data default)
    if (nav && nav.social) nav.social.forEach((s) => { const a = $(`[data-mnu-social="${s.id}"]`, sheet); if (a && s.url) { a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; } });
    // WhatsApp: number from site.json (status TO CONFIRM stays in the data); no number = no button
    const wa = $('[data-mnu-wa]', sheet), num = site && site.whatsapp && site.whatsapp.number;
    if (wa) {
      if (num) { wa.href = 'https://wa.me/' + String(num).replace(/\D/g, '') + '?text=' + encodeURIComponent(T('menu.wa_text')); wa.hidden = false; } else wa.hidden = true;
    }
    // address + map link from site.json
    const addr = $('[data-mnu-addr]', sheet), a = site && site.address;
    if (addr) {
      if (a && a.line) { $('[data-mnu-addr-t]', addr).textContent = a.line; if (a.mapsUrl) addr.href = a.mapsUrl; addr.hidden = !a.mapsUrl; if (!a.mapsUrl) addr.removeAttribute('href'); } else addr.hidden = true;
    }
    paintHours();
  }

  const range = (d) => (d && d.open && d.close ? d.open + '–' + d.close : null);
  const uniform = (days) => { const v = Object.values(days || {}).map((d) => d.open + '|' + d.close); return v.length === 7 && v.every((x) => x === v[0]); };
  function paintHours() {
    const dl = $('[data-mnu-hours]', sheet), h = model.hours; if (!dl) return;
    dl.textContent = '';
    if (!h || !h.days) { dl.hidden = true; return; }
    const now = witaNow();
    const areas = h.areas ? Object.values(h.areas).filter((a) => a && a.days) : [];
    const rows = areas.length ? areas.map((a) => ({ k: a.label, days: a.days })) : [{ k: null, days: h.days }];
    const every = rows.every((r) => uniform(r.days));
    rows.forEach((r) => {
      const v = range(every ? r.days['1'] : r.days[String(now.dow)]); if (!v) return;
      const row = document.createElement('div');
      if (r.k) { const dt = document.createElement('dt'); dt.textContent = r.k; row.appendChild(dt); }
      const dd = document.createElement('dd'); dd.textContent = v; row.appendChild(dd); dl.appendChild(row);
    });
    if (!dl.children.length) { dl.hidden = true; return; }
    const note = document.createElement('p'); note.className = 'mnu__hours-note'; note.textContent = T(every ? 'menu.hours_every_day' : 'menu.hours_today');
    dl.appendChild(note); dl.hidden = false;
  }
  function paintState() {
    const el = $('[data-mnu-state]', sheet), h = model.hours; if (!el) return;
    if (!h) { el.hidden = true; return; }
    const o = openState(h, witaNow());
    const k = $('[data-mnu-state-k]', el), v = $('[data-mnu-state-v]', el);
    const put = (n, t) => { if (n.textContent !== t) n.textContent = t; };       // untouched text means no style or layout work
    if (o.open === true) { put(k, T('menu.open_now')); put(v, T('menu.open_until', { t: o.closes })); el.dataset.state = 'open'; }
    else if (o.open === false) { put(k, T('menu.closed_now')); put(v, o.opens ? T('menu.opens_at', { t: o.opens }) : ''); el.dataset.state = 'closed'; }
    else { el.hidden = true; return; }
    if (el.hidden) el.hidden = false;
  }
  const startClock = () => { stopClock(); clockTimer = setInterval(() => { if (!document.hidden) paintState(); }, 20000); };
  const stopClock = () => { clearInterval(clockTimer); clockTimer = 0; };

  /* links: only targets that exist in the page, in the order of menu-nav.json, numbered 01.. in that order */
  const sig = () => (model.nav && model.nav.links ? model.nav.links : []).map((l) => (document.getElementById(l.id) ? 1 : 0)).join('') + (document.getElementById('pricing') ? 1 : 0);
  function prepareLinks() {
    linksSig = sig();
    const list = $('.mnu__list', sheet); if (!list) return;
    const items = $$('.mnu__li', list), byId = new Map(items.map((li) => [$('a', li).getAttribute('href').slice(1), li]));
    const order = model.nav && model.nav.links ? model.nav.links.map((l) => l.id) : [...byId.keys()];
    const seen = new Set(), keep = [];
    order.forEach((id) => { const li = byId.get(id); if (li && document.getElementById(id) && !seen.has(id)) { seen.add(id); keep.push(li); } });
    items.forEach((li) => { if (!keep.includes(li)) li.remove(); });
    keep.forEach((li, i) => { list.appendChild(li); $('.mnu__idx', li).textContent = String(i + 1).padStart(2, '0'); li.style.setProperty('--i', i); });
    const n = keep.length;
    $$('.mnu__acts', sheet).forEach((el) => el.style.setProperty('--i', n));
    $$('[data-mnu-visit]', sheet).forEach((el) => el.style.setProperty('--i', n + 1));
    $$('.mnu__soc', sheet).forEach((el) => el.style.setProperty('--i', n + 2));
    // the "Buy a pass" target must exist too
    const buy = $('.mnu-btn--buy', sheet); if (buy && !document.getElementById(buy.getAttribute('href').slice(1))) buy.hidden = true;
  }

  /* ---------- page state: inert, scroll lock, aria ---------- */
  function setInert(on) {
    if (on) {
      inerted = [...document.body.children].filter((el) => el !== sheet && !el.matches('script, style, link, template, [data-hdr]') && !el.hasAttribute('inert'));
      inerted.forEach((el) => el.setAttribute('inert', ''));
    } else { inerted.forEach((el) => el.removeAttribute('inert')); inerted = []; }
  }
  function lock() { if (locked) return; locked = true; y0 = window.scrollY; root.classList.add('mnu-lock'); }
  function unlock() {
    if (!locked) return; locked = false; root.classList.remove('mnu-lock');
    if (Math.abs(window.scrollY - y0) > 0.5) window.scrollTo({ top: y0, left: 0, behavior: 'instant' });   // safety net: a browser that moved the page while it was locked
  }
  /* the header joins the light sheet only while the panel covers its strip: two frames after the sheet starts, and it leaves just before the panel is gone */
  const hdr = $('[data-hdr]');
  let hdrRaf = 0, hdrTimer = 0;
  function hdrRise() { cancelAnimationFrame(hdrRaf); clearTimeout(hdrTimer); root.setAttribute('data-menu-open', ''); }   // the header rises above the sheet at once (it never disappears behind it)
  function hdrInk() { if (hdr) hdr.classList.add('theme-light'); }                                                         // its ink flips once the panel covers it (after the first paint)
  function hdrOff() { cancelAnimationFrame(hdrRaf); clearTimeout(hdrTimer); root.removeAttribute('data-menu-open'); if (hdr) hdr.classList.remove('theme-light'); }
  function sync(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.toggleAttribute('data-open', open); }

  /* ---------- open / close ---------- */
  /* open(): the tap does the least that starts the animation (state attributes, no layout read, no focus, no inert, no scroll lock); settle() does the rest after the first paint,
     each heavy step in a task of its own so no frame is held up by more than one of them */
  function open() {
    if (isOpen) return;
    isOpen = true; const my = ++token; clearTimeout(finishTimer); clearTimeout(earlyTimer); afterQ = null; window.__efMenuQ = 0;
    sheet.removeAttribute('data-leaving');
    if (sheet.dataset.s === 'warm') { sheet.dataset.s = 'closed'; void sheet.offsetWidth; }   // a tap inside the two warm-up frames (rare): settle the closed look first so the entry still animates
    sync(true); hdrRise();
    sheet.dataset.s = 'open';
    afterPaint(() => {
      if (my !== token || !isOpen) return;
      hdrInk();
      const first = $('.mnu__link', sheet); if (first) first.focus({ preventScroll: true });
      if (sig() !== linksSig) prepareLinks();
      paintState(); startClock();
      afterPaint(() => { if (my !== token || !isOpen) return; lock(); afterPaint(() => { if (my === token && isOpen && !inerted.length) setInert(true); }); });
    });
  }
  function close(opts = {}) {
    if (!isOpen) return;
    isOpen = false; sync(false); stopClock();
    const my = ++token; afterQ = opts.after || null;
    let earlyRan = false;
    const runEarly = () => { if (earlyRan || !opts.early) return; earlyRan = true; unlock(); opts.early(); };   // release the lock, then start the jump while the sheet is still leaving
    sheet.setAttribute('data-leaving', ''); sheet.dataset.s = 'closed';
    if (opts.focus !== false) afterPaint(() => { if (my === token) btn.focus({ preventScroll: true }); });
    const done = () => {
      if (my !== token || isOpen) return;                // re-opened meanwhile: nothing to finish
      sheet.removeAttribute('data-leaving'); hdrOff(); unlock(); setInert(false);
      runEarly();
      const after = afterQ; afterQ = null; if (after) after();
    };
    clearTimeout(finishTimer); clearTimeout(hdrTimer); clearTimeout(earlyTimer);
    if (opts.early && EXIT > 0) earlyTimer = setTimeout(() => { if (my === token && !isOpen) runEarly(); }, Math.round(EXIT * 0.5));
    hdrTimer = setTimeout(() => { if (!isOpen) hdrOff(); }, Math.max(0, EXIT - 12));
    if (EXIT <= 0) done(); else finishTimer = setTimeout(done, EXIT + 40);
  }
  const toggle = () => { window.__efMenuQ = 0; if (isOpen) close(); else open(); };
  document.addEventListener('ef:menu', toggle);

  /* ---------- dismiss: Esc, backdrop, sr close button ---------- */
  sheet.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-mnu-link]');
    if (a) { e.preventDefault(); go(a.getAttribute('href').slice(1)); return; }
    if (e.target.closest('[data-mnu-close]') || e.target.closest('[data-mnu-scrim]')) { close(); return; }
  });
  document.addEventListener('click', (e) => {            // logo while open: close, then go home (the hero's own handler skips a prevented click)
    if (!isOpen) return;
    const a = e.target.closest && e.target.closest('.hdr__logo');
    if (a) { e.preventDefault(); go('top'); }
  }, true);
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const ring = [btn, ...$$('a[href], button:not([disabled])', panel).filter((el) => el.tabIndex >= 0 && !el.hidden && el.offsetParent !== null)];
    const i = ring.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? ring.length - 1 : i - 1) : (i === -1 || i === ring.length - 1 ? 0 : i + 1);
    e.preventDefault(); ring[next].focus({ preventScroll: true });
  });
  sheet.addEventListener('wheel', (e) => { if (!(panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1)) e.preventDefault(); }, { passive: false });   // covers the moment before the scroll lock lands
  sheet.addEventListener('touchmove', (e) => {           // iOS: the page behind never scrolls; the panel scrolls itself when it is taller than the screen
    if (panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1) return;
    e.preventDefault();
  }, { passive: false });

  /* ---------- jump: after the sheet has closed ---------- */
  function highlight(el) {
    if (window.EF && typeof window.EF.highlight === 'function') { window.EF.highlight(el); return; }
    const m = document.createElement('span'); m.className = 'mnu-hl'; m.setAttribute('aria-hidden', 'true');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(m);
    const a = m.animate ? m.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 0 }], { duration: 1200, easing: 'ease-out' }) : null;
    if (a) a.onfinish = () => m.remove(); else setTimeout(() => m.remove(), 1200);
  }
  /* jump = start (scroll, hash, highlight watch) + land (focus the heading). The scroll starts while the sheet is still leaving; the focus waits until the page is no longer inert. */
  function jumpStart(id) {
    const el = document.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: ctx.motion ? 'smooth' : 'auto', block: 'start' });
    history.replaceState(null, '', '#' + id);
    if (id !== 'top') {                                  // highlight once the jump has (nearly) landed
      let n = 0; const tick = () => { const r = el.getBoundingClientRect().top; if (Math.abs(r) < 120 || ++n > 90) highlight(el); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
  }
  function jumpLand(id) {
    const el = document.getElementById(id); if (!el) return;
    const h = el.querySelector('h1, h2') || el;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  }
  const jump = (id) => { jumpStart(id); jumpLand(id); };
  function go(id) {
    if (!isOpen && sheet.hasAttribute('data-leaving')) { afterQ = () => jump(id); return; }   // a second tap while the sheet is still leaving: the newest target wins
    if (!isOpen) { jump(id); return; }
    if (document.getElementById(id) && id !== 'top') history.replaceState(null, '', '#' + id);   // the address follows the tap at once
    close({ focus: false, early: () => jumpStart(id), after: () => jumpLand(id) });
  }

  await ready;
  if (window.__efMenuQ) { window.__efMenuQ = 0; open(); }   // a tap that arrived before this module had loaded
}
