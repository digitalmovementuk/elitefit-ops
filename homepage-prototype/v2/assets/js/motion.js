/* motion.js · Version: v3.0 — 2026-10-02 · owner: motion lane (Opus 5.5). Spec, moments, measurements and change log: MOTION-V3.md.
   Reveals, headline arrival, clip masks + parallax, readout rolls, section rules. WAAPI on translate/scale/opacity; scroll-linked on ViewTimeline
   (one rAF fallback). Never moves what is on screen at start, never hides a buy action, nothing hidden without JS / reduced motion / data-saver. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const VT = 'ViewTimeline' in window;
const PRIMARY = '.hero__cta,.hdr__buy,.prc-cta,.buy__btn,.wa,[data-checkout],.cls__cta,.pil__btn,.nut-ask,.btn--primary,.btn-split,[data-vis-wa],.ftr__wa';
// blocks without a hook in their partial: selector -> kind ('*' staggers the children)
const AUTO = [['#pillars .sec__lead', 'up'], ['#pricing .prc-eyebrow', 'left'], ['#pricing .prc-lede', 'up'], ['#pricing .prc-duo', 'up'],
  ['#pricing .prc-cards', 'rise*'], ['#pricing .prc-more', 'up*']];
const ROLL = '[data-count],.pil__num,.prc-t__n,.prc-t__s,.vis-h__t';
const GROW = '.rest-room__range', POP = '.rvw__stars i';
const BIG = '.vis__word,.ftr__mark-l';   // oversized words: arrive along the blur axis, the footer's two lines meet (the hero's lines part)
const LIVE = '.cls__readout';
const SECS = '#pillars,#elite-nutrition,#elite-training,#elite-rest,#coaches,#pricing,#reviews,#visit';
const KF = {
  up: [{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  left: [{ opacity: 0, translate: '-16px 0' }, { opacity: 1, translate: '0 0' }],
  rise: [{ translate: '0 24px' }, { translate: '0 0' }],
};
const SE = 'cubic-bezier(.3,.7,.4,1)';   // scrubbed: spread over the scroll
let C = null, E = 'ease-out', D = 600, raf = 0, VH = innerHeight, W = innerWidth, cio, rio, ro, mo;
let scrubs = [], groups = new Map(), made = [], rolls = [], tls = new Map(), near = new Map(), reach = new Map(), act = [], nio, bio, mo2;

function scrub(subj, el, kf, a, b, ez = 'linear') {
  let m = reach.get(subj);   // how far the page can scroll this subject: a move near the page end still lands
  if (m == null) { const r = subj.getBoundingClientRect(); m = ((document.documentElement.scrollHeight - innerHeight - scrollY - r.top + VH) / (VH + r.height)) * 100; reach.set(subj, m); }
  if (b > m - 2) b = Math.max(a + 4, m - 2);
  const o = { subj, a, b, band: b <= 50 };   // an arrival (done by half the range) only needs the band where it moves
  if (VT) {
    let tl = tls.get(subj); if (!tl) tls.set(subj, (tl = new ViewTimeline({ subject: subj, axis: 'block' })));
    o.an = el.animate(kf, { timeline: tl, rangeStart: `cover ${a}%`, rangeEnd: `cover ${b}%`, fill: 'both', easing: ez });
    let l = near.get(subj); if (!l) { near.set(subj, (l = [])); nio.observe(subj); } l.push(o);
    if (o.band && !l.b) { l.b = 1; bio.observe(subj); }
  } else { o.an = el.animate(kf, { duration: 1000, fill: 'both', easing: ez }); o.an.pause(); }
  scrubs.push(o); return o;
}
function geo() {   // fallback: untransformed positions, never read while scrolling
  VH = innerHeight;
  for (const o of scrubs) { let t = 0, n = o.subj; while (n) { t += n.offsetTop; n = n.offsetParent; } o.t = t; o.h = o.subj.offsetHeight; }
  tick();
}
function tick() {
  raf = 0; const y = scrollY;
  for (const o of scrubs) { const p = ((y + VH - o.t) / (VH + o.h)) * 100; o.an.currentTime = Math.min(1, Math.max(0, (p - o.a) / (o.b - o.a))) * 1000; }
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };

// headline arrival (M2): sliver-crop slide + scale settle + pan-blur echo; the title stays opaque
function headline(t, r) {
  const tn = [...t.childNodes].filter((n) => n.nodeType === 3 && n.data.trim()); if (!tn.length) return;
  const rg = document.createRange(); rg.setStart(tn[0], 0); const l = tn[tn.length - 1]; rg.setEnd(l, l.length);
  const fs = parseFloat(getComputedStyle(t).fontSize), w = rg.getBoundingClientRect().right - r.left;
  const dx = r.left < 40 ? r.left + 0.07 * fs : Math.min(0.35 * fs, 64);
  const s = Math.max(1, Math.min(1.06, (W - 2 - r.left + dx) / w));
  scrub(t, t, [{ translate: `${-dx}px 0`, scale: s }, { translate: '0 0', scale: 1 }], 0, 38, SE);
  echo(t, -dx, 38);
}
function echo(t, dx, b) {   // the pan-blur echo of the same words (generated content, aria-hidden) catches up and dissolves
  const g = document.createElement('span'); g.className = 'm-ghost'; g.setAttribute('aria-hidden', 'true');
  g.dataset.t = t.textContent.trim().replace(/\s+/g, ' ');
  t.classList.add('m-hl'); t.prepend(g); made.push(g);
  scrub(t, g, [{ translate: `${1.6 * dx}px 0`, opacity: 0.6 }, { opacity: 0.3, offset: 0.55 }, { translate: '0 0', opacity: 0 }], 0, b, SE);
}
// oversized words (visit place name, footer wordmark): slide in along x, settle, keep drifting a little while they pass
function big(w) {
  const cs = getComputedStyle(w), fs = parseFloat(cs.fontSize), ln = w.matches('.ftr__mark-l');
  if (cs.display === 'inline') { w.style.display = 'inline-block'; made.push({ remove: () => (w.style.display = '') }); }   // an inline box cannot move
  const dx = (ln ? 0.3 : 0.15) * fs * (ln && !w.previousElementSibling ? -1 : 1);
  scrub(w, w, ln ? [{ translate: `${dx}px 0` }, { translate: '0 0' }] : [{ translate: `${dx}px 0`, scale: 1.04 }, { translate: '0 0', scale: 1, offset: 0.45 }, { translate: `${-dx / 2}px 0`, scale: 1 }], 0, ln ? 40 : 100, SE);
  echo(w, dx, ln ? 40 : 45);
}
// clip mask (M6) + parallax (M7)
function mask(f) {
  const cov = (b) => { const c = document.createElement('i'); c.className = 'm-cov' + b; c.setAttribute('aria-hidden', 'true'); f.append(c); made.push(c); return c; };
  const v = f.querySelector('video,img');
  scrub(f, f, [{ scale: 0.92 }, { scale: 1 }], 0, 45, SE);
  for (const c of [cov(''), cov(' m-cov--b')]) scrub(f, c, [{ scale: '1 .72' }, { scale: '1 0' }], 0, 45, SE);
  if (v) { scrub(f, v, [{ scale: 1.24 }, { scale: 1.1 }], 0, 45, SE); parallax(v, f, 4); }
}
const parallax = (el, subj, p) => scrub(subj, el, [{ translate: `0 ${-p}%` }, { translate: `0 ${p}%` }], 0, 100);
function rule(sec) {
  const r = document.createElement('i'); r.className = 'm-rule'; r.setAttribute('aria-hidden', 'true'); sec.prepend(r); made.push(r);
  scrub(r, r, [{ scale: '0 1', opacity: 1 }, { scale: '1 1', opacity: 1, offset: 0.5 }, { scale: '1 1', opacity: 0 }], 0, 75, SE);
}

// reveals: WAAPI held at frame 0 while below the fold, played once on entry
function prime(el, now) {
  let k = el.dataset.reveal !== undefined ? el.dataset.reveal || 'up' : el.dataset.mAuto;
  const title = el.querySelector('.sec__title');
  const st = /\*$/.test(k) || title || el.hasAttribute('data-stagger') || /^[OU]L$/.test(el.tagName);
  k = k.replace('*', '');
  const kids = (n) => [...n.children].filter((c) => c !== title && !c.hidden && !(c.getAttribute('aria-hidden') === 'true' && !c.children.length));
  let items = st ? kids(el) : [el];
  if (!st) { const k = kids(el); if (k.length === 1 && /^[OU]L$/.test(k[0].tagName)) items = kids(k[0]); }   // a wrapper around one list staggers the list
  if (!items.length) items = [el];
  groups.set(el, items.map((n, i) => {
    let kk = n.classList.contains('pil__num') ? 'left' : k;
    if (n.matches(PRIMARY) || n.querySelector(PRIMARY)) kk = 'rise';
    const a = n.animate(KF[kk] || KF.up, { duration: D, easing: E, fill: 'backwards' });
    a.pause(); a.i = Math.min(i, 6); return a;
  }));
  if (!now) rio.observe(el);
  const rs = $$(ROLL, el); if (el.matches(ROLL)) rs.push(el);
  if (rs.length) (window.requestIdleCallback || setTimeout)(() => rs.forEach((n) => { const t = n.textContent.trim(); if (/\d/.test(t) && !n._odo && !n._run && groups.has(el)) build(n, t); }));
}
function play(el) {
  let g = groups.get(el); if (!g) return; groups.delete(el);
  if (g.some((a) => !a.effect.target.isConnected)) { g.forEach((a) => a.cancel()); prime(el, 1); g = groups.get(el); groups.delete(el); }   // rows rendered after priming
  const rd = !!(el.matches(ROLL) || el.querySelector(ROLL));
  if (act.length >= 3) { if (!rd) { g.forEach((a) => a.finish()); return; } act.shift().forEach((a) => a.finish()); }   // three moments at most; a readout wins its slot
  // each item starts in its own frame (45 ms apart) and the rolls 100 ms later, so no single frame promotes every layer at once
  act.push(g); g.forEach((a) => (a.i ? setTimeout(() => a.play(), a.i * 45) : a.play()));
  Promise.all(g.map((a) => a.finished)).catch(() => {}).then(() => { const i = act.indexOf(g); if (i > -1) act.splice(i, 1); });
  setTimeout(() => {
    const rs = $$(ROLL, el); if (el.matches(ROLL)) rs.push(el);
    rs.forEach((n) => roll(n));
    $$(GROW, el).forEach((b) => rolls.push(b.animate([{ scale: '0 1' }, { scale: '1 1' }], { duration: 680, easing: E, fill: 'backwards' })));
    $$(POP, el).forEach((b, i) => rolls.push(b.animate([{ opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }], { duration: 360, delay: i * 60, easing: E, fill: 'backwards' })));
  }, 100);
}

// readout rolls: aria-hidden overlay of generated digits over the real text (kept for screen readers); roll() from 0, morph() changed digits only
function build(el, txt) {   // the overlay alone (built in idle time before the block arrives, so its start costs no layout)
  const o = document.createElement('span'); o.className = 'm-odo'; o.setAttribute('aria-hidden', 'true');
  const ds = [];
  for (const part of txt.match(/\d|\D+/g)) {
    const s = document.createElement('span'); s.dataset.c = part;
    if (/\d/.test(part)) { s.className = 'm-odo__w'; const x = document.createElement('span'); x.className = 'm-odo__s'; s.append(x); ds.push(x); }
    else s.className = 'm-odo__c';
    o.append(s);
  }
  el.classList.add('m-odo-host'); el.append(o); return (el._odo = { o, ds, txt });
}
function odo(el, txt, plan, ms) {
  if (el._run) return;
  let b = el._odo; el._odo = null;
  if (!b || !b.o.isConnected || b.txt !== txt) { if (b) b.o.remove(); b = build(el, txt); el._odo = null; }
  el._run = 1;
  const as = b.ds.map((x, i) => { const [f, t, d] = plan(i, b.ds.length);
    return x.animate([{ transform: `translateY(${-f * 5}%)` }, { transform: `translateY(${-t * 5}%)` }], { duration: ms, delay: d, easing: E, fill: 'both' }); });
  rolls.push(...as);
  Promise.all(as.map((a) => a.finished)).catch(() => {}).then(() => { b.o.remove(); el.classList.remove('m-odo-host'); el._run = 0; });
}
export function roll(el, delay = 0, ms = 680) {
  const txt = el.textContent.trim(); if (!/\d/.test(txt)) return;
  const dg = txt.replace(/\D/g, '');
  odo(el, txt, (i, n) => [0, +dg[i] + (i === n - 1 ? 10 : 0), delay + (n - 1 - i) * 40], ms);
}
function morph(el, from) {
  const to = el.textContent.trim(); if (from.length !== to.length) return;
  const a = from.replace(/\D/g, ''), b = to.replace(/\D/g, ''), keep = b.length - 2;
  if (a.length !== b.length || a.slice(0, keep) === b.slice(0, keep)) return;
  const down = +b < +a;
  odo(el, to, (i) => { const f = +a[i], t = +b[i]; if (i >= keep || f === t) return [t, t, 0];
    return down ? (t > f ? [f + 10, t, 0] : [f, t, 0]) : (t < f ? [f, t + 10, 0] : [f, t, 0]); }, 360);
}
function onToggle(e) {   // a coach opens: the week arrives row by row and the class count reads out (closing stays instant, native)
  const d = e.target; if (!cio || !d.matches || !d.matches('.crc__c') || !d.open) return;
  d.querySelectorAll('.crc__body > p, .crc__days > li').forEach((n, i) => rolls.push(n.animate([{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], { duration: 280, delay: Math.min(i, 8) * 35, easing: E, fill: 'backwards' })));
  const m = d.querySelector('.crc__meta'); if (m) roll(m, 0, 440);   // UI feedback: done inside 600 ms
}
function live() {
  const els = $$(LIVE); if (!els.length) return;
  els.forEach((e) => { e._mt = e.textContent.trim(); });
  mo = new MutationObserver(() => els.forEach((e) => { const t = e.textContent.trim(); if (t !== e._mt) { const f = e._mt; e._mt = t; if (f && !document.hidden) morph(e, f); } }));
  els.forEach((e) => mo.observe(e, { childList: true, characterData: true, subtree: true }));
}

function classify(es) {
  for (const e of es) {
    const t = e.target, r = e.boundingClientRect; cio.unobserve(t);
    const where = r.top >= VH - 1 ? 'below' : r.bottom <= 0 ? 'above' : 'in';
    if (where === 'in') continue;
    if (t.matches('.sec__title')) headline(t, r);
    else if (t.matches(BIG)) big(t);
    else if (t.matches(SECS)) { if (where === 'below') rule(t); }
    else if (t.dataset.reveal === 'mask') mask(t);
    else if (t.hasAttribute('data-parallax')) parallax(t, t, parseFloat(t.dataset.parallax) || 4);
    else if (where === 'below' && !t.matches('.ftr__mark')) prime(t);   // the wordmark's lines move on their own
  }
  if (!VT) geo();
}
function start() {
  if (!C || !C.motion || cio) return;
  const cs = getComputedStyle(document.documentElement);
  D = parseFloat(cs.getPropertyValue('--dur-reveal')) || 600; E = cs.getPropertyValue('--ease-out').trim() || E;
  VH = innerHeight; W = innerWidth;
  AUTO.forEach(([s, k]) => $$(s).forEach((n) => { if (!n.hasAttribute('data-reveal')) n.dataset.mAuto = k; }));
  cio = new IntersectionObserver(classify);
  // scroll-linked layers off screen pause at their start or end state (main thread updates only the few on screen)
  nio = new IntersectionObserver((es) => es.forEach((e) => (near.get(e.target) || []).forEach((o) => {
    if (!e.isIntersecting) o.an.pause(); else if (!o.band || e.target._band || e.boundingClientRect.top < VH / 2) o.an.play();   // the last case: arrived by a jump
  })), { rootMargin: '10% 0px' });
  // arrivals follow the scroll only in the band where they move (lower half of the screen and just below it); outside it they hold their start or end state
  bio = new IntersectionObserver((es) => es.forEach((e) => { e.target._band = e.isIntersecting; (near.get(e.target) || []).forEach((o) => o.band && (e.isIntersecting ? o.an.play() : o.an.pause())); }), { rootMargin: '-50% 0px 10% 0px' });
  rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { rio.unobserve(e.target); play(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  [...$$('main .sec__title'), ...$$(BIG), ...$$(SECS), ...$$('main [data-reveal],footer [data-reveal],main [data-m-auto],main [data-parallax]')].forEach((n) => cio.observe(n));
  document.addEventListener('toggle', onToggle, true);
  const pin = document.querySelector('[data-rest-pin]');   // pinned temperature strip: the room that becomes current reads out
  if (pin) { mo2 = new MutationObserver((ms) => ms.forEach((m) => { const c = m.target, v = c.querySelector && c.querySelector('.rest-pin__v');
    if (v && c.classList.contains('is-current') && !/is-current/.test(m.oldValue || '') && v.getClientRects().length) rolls.push(v.animate([{ opacity: 0.3, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: E })); }));
    mo2.observe(pin, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true }); }
  if (!VT) { addEventListener('scroll', onScroll, { passive: true }); ro = new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(geo); }); ro.observe(document.body); }
  live();
  document.documentElement.dataset.motion = VT ? 'timeline' : 'raf';
}
function stop() {
  [cio, rio, ro, mo, mo2, nio, bio].forEach((x) => x && x.disconnect()); cio = rio = ro = mo = mo2 = nio = bio = null;
  removeEventListener('scroll', onScroll);
  scrubs.forEach((o) => o.an.cancel()); groups.forEach((g) => g.forEach((a) => a.cancel())); rolls.forEach((a) => a.cancel());
  $$('.m-odo').forEach((n) => n.remove()); $$('.m-odo-host').forEach((n) => n.classList.remove('m-odo-host'));
  $$('.m-hl').forEach((n) => n.classList.remove('m-hl')); made.forEach((n) => n.remove());
  scrubs = []; groups = new Map(); made = []; rolls = []; tls = new Map(); near = new Map(); reach = new Map(); act = [];
  document.removeEventListener('toggle', onToggle, true);
  delete document.documentElement.dataset.motion;
}

export function init(ctx) {
  if (/[?&]nomotion\b/.test(location.search)) return;   // QA: ?nomotion = page without this layer
  C = ctx; window.EF = Object.assign(window.EF || {}, { motion: { roll, morph, refresh: () => { stop(); start(); } } });
  document.addEventListener('touchstart', () => {}, { passive: true });   // iOS applies :active only with a touch listener
  start();
  let rt = 0;
  addEventListener('resize', () => { if (innerWidth === W) return; clearTimeout(rt); rt = setTimeout(() => { if (cio) { stop(); start(); } }, 250); }, { passive: true });
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener && mq.addEventListener('change', () => { C.motion = !mq.matches && !C.saveData; if (C.motion) start(); else stop(); });
}
