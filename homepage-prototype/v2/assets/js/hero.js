/* hero.js · Version: v3.0 — 2026-10-02 · owner: hero lane (Opus 5.5) · own engine, native scroll, transform + opacity only.
   Changelog: v3.0 created: live readouts (WITA clock, open state, next class + countdown, classes today), review rotation (verified quotes only),
   header states, hero clip after load, scroll-linked headline, anchor jump with destination highlight (window.EF.highlight, exported as highlight).
   Data: assets/data/hours.json, schedule.club.json, reviews.json through timetable.js; nothing hard-coded. */
import { witaNow, loadTimetable, nowNext, clock, loadHours, openState } from './timetable.js';

const $ = (s, r = document) => r.querySelector(s);
const DEF = { // provisional strings; copy/copy.json overrides every key
  'hero.ro_open_k': 'Open now', 'hero.ro_open_v': 'Until {t}', 'hero.ro_today_close_k': 'Today', 'hero.ro_closes': 'Closes {t}',
  'hero.ro_closed_k': 'Closed now', 'hero.ro_opens': 'Opens {t}', 'hero.ro_next_k': 'Next class', 'hero.ro_now_k': 'On now',
  'hero.ro_in': 'in {t}', 'hero.ro_until': 'till {t}', 'hero.ro_today_n': '{n} classes', 'hero.ro_today_1': '1 class',
  'hero.ro_today_0': 'No classes', 'hero.ro_left': '{n} to go',
};
let T = (k, v) => fill(DEF[k] || k, v);
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };
const set = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };

/* ---------- destination highlight (shared: classes, pricing and the menu use it) ---------- */
export function highlight(el) {
  if (!el) return;
  const old = el.querySelector(':scope > .ef-hl'); if (old) old.remove();
  const m = document.createElement('span'); m.className = 'ef-hl'; m.setAttribute('aria-hidden', 'true');
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(m); setTimeout(() => m.remove(), 1500);
}
function anchors(ctx) {
  // The click does the least possible before the next frame: the new state (hash + a DOM flag on the destination) and the scroll start.
  // No layout reads in the handler or per frame: focus moves in the next frame, the highlight waits for an IntersectionObserver band, not a rAF poll.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute('href').slice(1); if (!id) return;
    const el = document.getElementById(id); if (!el) return;
    e.preventDefault();
    history.replaceState(null, '', '#' + id);
    el.setAttribute('data-jump', '');               // the destination knows it is being jumped to (styles and other lanes can read it)
    el.scrollIntoView({ behavior: ctx.motion ? 'smooth' : 'auto', block: 'start' });
    requestAnimationFrame(() => {
      const h = el.querySelector('h1, h2') || el;
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    });
    if (id === 'top') { el.removeAttribute('data-jump'); return; }
    let done = false;
    const land = () => { if (done) return; done = true; io.disconnect(); clearTimeout(cap); el.removeAttribute('data-jump'); highlight(el); };
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) land(); }, { rootMargin: '0px 0px -84% 0px' }); // the top 16 % band: the jump has (nearly) landed
    const cap = setTimeout(land, 1600);
    requestAnimationFrame(() => io.observe(el));    // observe from the next frame, so the start position does not count as landed
  });
}

/* ---------- live readouts ---------- */
async function readouts(ctx) {
  const q = (k) => $(`[data-ro="${k}"]`);
  const el = { clock: q('clock'), openK: q('open-k'), openV: q('open-v'), nextK: q('next-k'), next: q('next'), cd: q('countdown'), today: q('today') };
  const openBox = $('[data-ro-open]'), nextBox = el.next && el.next.closest('.hero__ro');
  const [model, hours] = await Promise.all([loadTimetable().catch(() => null), loadHours()]);
  const wd = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'Asia/Makassar' });
  const paint = () => {
    const now = witaNow();
    set(el.clock, now.hhmmss);
    const o = openState(hours, now);
    if (o.open === true) { set(el.openK, T('hero.ro_open_k')); set(el.openV, T('hero.ro_open_v', { t: o.closes })); openBox.dataset.state = 'open'; }
    else if (o.open === false) { set(el.openK, T('hero.ro_closed_k')); set(el.openV, o.opens ? T('hero.ro_opens', { t: o.opens }) : ''); openBox.dataset.state = 'closed'; }
    else if (o.closes) { set(el.openK, T('hero.ro_today_close_k')); set(el.openV, T('hero.ro_closes', { t: o.closes })); openBox.dataset.state = 'unknown'; }
    if (!model) return;
    const nn = nowNext(model, now);
    if (nn.live) {  // key: On now · till 11:30 · value: Mobility
      set(el.nextK, T('hero.ro_now_k')); set(el.cd, T('hero.ro_until', { t: nn.live.end })); set(el.next, nn.live.title); nextBox.dataset.state = 'live';
    } else if (nn.next) {  // key: Next class · in 1:02:05 (today) or · Mon (another day) · value: 08:00 HYROX Conditioning (<= 24 characters, never cut)
      set(el.nextK, T('hero.ro_next_k')); nextBox.dataset.state = 'next';
      set(el.cd, nn.nextDayOffset ? wd.format(new Date(Date.now() + nn.nextDayOffset * 864e5)) : T('hero.ro_in', { t: clock(nn.secsToNext) }));
      set(el.next, nn.next.start + ' ' + nn.next.title);
    }
    const n = nn.classesToday;
    set(el.today, n === 0 ? T('hero.ro_today_0') : n === 1 ? T('hero.ro_today_1') : T('hero.ro_today_n', { n }));
  };
  paint();
  // tick on the second boundary; stop while the tab is hidden or the hero is far off screen
  let timer = 0, visible = true;
  const loop = () => { clearTimeout(timer); if (document.hidden || !visible) return; paint(); timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5); };
  document.addEventListener('visibilitychange', loop);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }, { rootMargin: '200px' }).observe($('.hero'));
  loop();
}

/* ---------- review line: verified 5-star quotes only, verbatim, gentle rotation ---------- */
async function reviews(ctx) {
  const stack = $('[data-rev-stack]'); if (!stack) return;
  const get = (f) => fetch(f).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  // rating, count and link from reviews.json; quotes from reviews.verified.json (full verbatim texts, FACTS-eligible; reviews lane)
  const [data, ver] = await Promise.all([get('assets/data/reviews.json'), get('assets/data/reviews.verified.json')]);
  if (data && data.rating != null) set($('[data-rev-score]'), String(data.rating));
  if (data && data.count != null) set($('[data-rev-count]'), String(data.count));
  const list = (ver && ver.quotes) || [];
  const ok = (r) => Number(r.stars) === 5 && r.verified !== false && r.origin === 'google' && !/\u2026\s*$|\.\.\.\s*$/.test(r.text);  // never a cut text
  const items = [...stack.children];
  items.forEach((q) => { const r = list.find((x) => x.author === q.dataset.author);
    if (!r || !ok(r) || r.text !== q.querySelector('.hero__q-t').textContent) { q.classList.remove('is-on'); q.dataset.out = '1'; q.setAttribute('aria-hidden', 'true'); } });
  // in rotation: verified AND shown at this size (CSS hides quotes that do not fit the reserved block on a phone)
  const live = items.filter((q) => !q.dataset.out && q.getClientRects().length);
  if (!live.length) { if (items.every((q) => q.dataset.out)) $('.hero__quotes').style.visibility = 'hidden'; return; }
  if (!live.some((q) => q.classList.contains('is-on'))) { items.forEach((q) => q.classList.remove('is-on')); live[0].classList.add('is-on'); live[0].removeAttribute('aria-hidden'); }
  if (live.length < 2 || !ctx.motion) return;            // reduced motion / data-saver: one quote, no rotation
  stack.removeAttribute('aria-live');                     // rotation is ambient; do not announce every change
  let i = live.findIndex((q) => q.classList.contains('is-on')), timer = 0, paused = false;
  const show = () => {
    const a = live[i]; i = (i + 1) % live.length; const b = live[i];
    a.classList.add('is-off'); a.classList.remove('is-on'); a.setAttribute('aria-hidden', 'true');
    setTimeout(() => a.classList.remove('is-off'), 700);
    b.classList.add('is-on'); b.removeAttribute('aria-hidden');
  };
  const run = () => { clearInterval(timer); if (!paused && !document.hidden) timer = setInterval(show, 7000); };
  const fig = $('[data-rev]');
  ['pointerenter', 'focusin'].forEach((t) => fig.addEventListener(t, () => { paused = true; run(); }));
  ['pointerleave', 'focusout'].forEach((t) => fig.addEventListener(t, () => { paused = false; run(); }));
  document.addEventListener('visibilitychange', run);
  run();
}

/* ---------- header states + scroll-linked headline (one rAF, runs only while scrolling; the drift is CSS where scroll-driven animations exist) ---------- */
const CSS_SCROLL = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
function scroller(ctx) {
  const hdr = $('[data-hdr]'), hero = $('.hero'), words = [...document.querySelectorAll('.hero__word')], media = $('[data-hero-media]');
  if (!hdr || !hero) return;
  let H = hero.offsetHeight, raf = 0, inView = true;
  addEventListener('resize', () => { H = hero.offsetHeight; frame(); }, { passive: true });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(hero);
  const frame = () => {
    raf = 0; const y = scrollY;
    hdr.toggleAttribute('data-scrolled', y > 8);  // v2.1 threshold; the reference turns solid at 40-50 px
    hdr.toggleAttribute('data-condensed', y > 48);      // measured on the reference: condenses at 40-50 px
    if (!ctx.motion || !inView || CSS_SCROLL) return;
    const p = Math.min(1, Math.max(0, y / H));
    // the two display lines slide apart along the line of motion, the footage drifts slower than the page
    words.forEach((w, k) => { w.style.translate = p ? `${((k % 2 ? 1 : -1) * p * 9).toFixed(2)}vw 0` : ''; }); // `translate`, so the CSS arrival (`transform`) never fights it
    if (media) media.style.translate = p ? `0 ${(p * H * 0.18).toFixed(1)}px` : '';
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  frame();
}

/* ---------- hero clip: after load, poster first, never with reduced motion or data-saver ---------- */
function clip(ctx) {
  const v = $('.hero__clip'), hero = $('.hero'); if (!v || !ctx.motion) return;
  const start = () => {
    const src = ctx.phone.matches ? v.dataset.srcM : v.dataset.srcD; if (!src) return;
    v.src = src; v.load();
    const go = () => { v.play().then(() => { hero.dataset.video = 'on'; }).catch(() => {}); };
    v.addEventListener('canplaythrough', go, { once: true });
    v.addEventListener('error', () => { delete hero.dataset.video; }, { once: true });
    new IntersectionObserver(([e]) => { if (!v.src) return; if (e.isIntersecting && hero.dataset.video) v.play().catch(() => {}); else v.pause(); }).observe(hero);
  };
  const later = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
}

export function init(ctx) {
  T = (k, v) => { const s = ctx.t(k, v); return s === k ? fill(DEF[k] || k, v) : s; };
  window.EF = Object.assign(window.EF || {}, { highlight });
  const menu = $('[data-menu]');
  if (menu) menu.addEventListener('click', () => document.dispatchEvent(new CustomEvent('ef:menu', { detail: { button: menu } })));
  scroller(ctx); anchors(ctx); clip(ctx);
  readouts(ctx).catch((e) => console.warn('[hero] readouts', e && e.message));
  reviews(ctx).catch((e) => console.warn('[hero] reviews', e && e.message));
}
