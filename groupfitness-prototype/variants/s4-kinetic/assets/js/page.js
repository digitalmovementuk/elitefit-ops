/* Elite Fit /groupfitness · Loud (s4-kinetic) v1.6 · page.js (29 Oct 2026; v1.3 to v1.5 earlier the same day)
   v1.6 (layout gate v1): meta labels carry a meta class (day tabs, week-grid Today, seat and status lines: RULINGS #41);
   the boxing Next-up clip is the face-safe card-boxing-v16c (RULINGS #46).
   v1.10 (handover v2): the sculpt card and chapter use the face-safe re-cut card-sculpt-v110b.
   v1.8 (RULINGS #53, #53a): every coach avatar uses the engine-v2/img/r head-and-shoulders crops (48/64/96/128w srcset).
   v1.7 (RULINGS #51, the whole head 8 px clear): the boxing card shows a face-free club still; conditioning uses card-conditioning-v17.
   Renders and wires the page from EF.api data: the Now / Next bar, hero quotes, the week (section 1: Mon to Sun grid on
   desktop, day selector and list on phones), next up with class clips, numbers, class chapters, coaches, the sticky bar.
   Hooks follow the shared page contract, so the booking engine and the automated checks work unchanged.
   Classic deferred script, ES5, no dependencies. v1.3 changes: see README "What changed in v1.3".
   v1.4 motion (29 Oct 2026): no scroll listener (the header hairline follows a 5 px IntersectionObserver sentinel), the day
   switch and filters run as a View Transition with an instant fallback, and the week, coach, class and next-up renders
   carry the motion hooks (--i / --c / --r cascade indexes, data-chars on coach names, data-motion lift / stagger / rise).
   v1.5 (29 Oct 2026, fix round 5): the Now bar shows the real class name at every width (#43, short form only for the
   longest name where it would need a 3rd line); week-chip names start with the visible text and Next-up cards are named by
   their content (WCAG 2.5.3); the day indicator follows the day strip's size (it appears when the desktop panel opens). */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false }; } }
function motionOn() { return root.classList.contains('motion-ok'); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function store() { try { return (EF.api && EF.api.store && EF.api.store.get()) || {}; } catch (e) { return {}; } }
function storeSet(p) { try { if (EF.api && EF.api.store) { EF.api.store.set(p); } } catch (e) { } }
function scrollToEl(el) {
  if (!el) { return; }
  try { el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' }); } catch (e) { el.scrollIntoView(); }
}
function openOcc(id, opts) { if (EF.booking && EF.booking.open && id) { EF.booking.open(id, opts || {}); } }
function rescan(el) { if (EF.motion && EF.motion.scan && el) { EF.motion.scan(el); } }
function mediaScan(el) { if (EF.media && EF.media.scan && el) { EF.media.scan(el); } }
function dayLabel(occ) {
  if (occ.dayIndex === 0) { return 'Today'; }
  if (occ.dayIndex === 1) { return 'Tomorrow'; }
  return EF.api.dateShort(occ.ymd);
}
function dayPhrase(occ) { return occ.dayIndex === 0 ? 'today' : (occ.dayIndex === 1 ? 'tomorrow' : EF.api.dateShort(occ.ymd)); }
function isSample(obj, field) { return !!(obj.sample_fields && obj.sample_fields.indexOf(field) > -1) || (field === 'length' && !!obj.length_sample); }
var CHIP = ' <span class="sample">Sample</span>';
/* VISUAL-AUDIT S4-1 / RULINGS #11: one Sample marker per list (the section footnotes); levels and lengths are in the README Sample list */
function levelHtml(cls) { return esc(cls.level); }
function lengthHtml(cls) { return cls.length_min + ' min'; }
function arrow() { return '<span class="arr" aria-hidden="true">→</span>'; }
/* v1.8 (RULINGS #53, #53a): coach avatars are the head-and-shoulders crops in engine-v2/img/r, one crop per coach everywhere
   (page and sheet; the sheet gets the same srcset from assets/data/engine-overlay-v18.json) */
var AV_BASE = '../../engine-v2/img/r/avatar-';
function avSet(id) { return [48, 64, 96, 128].map(function (n) { return AV_BASE + id + '-' + n + '.webp ' + n + 'w'; }).join(', '); }
function avImg(co, px, extra) { return '<img src="' + AV_BASE + esc(co.id) + '-48.webp" srcset="' + avSet(esc(co.id)) + '" sizes="' + px + 'px" alt="" width="' + px + '" height="' + px + '"' + (extra || '') + '>'; }
var GMARK = '<svg class="gmark" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

var DATA = null;

/* ---------- clips: which footage each class family uses here. #28: real club footage first; stock only with a visible label ---------- */
var CLIP = {
  boxing: { file: 'card-boxing-v17', w: 640, h: 300, stock: false, still: true }, /* v1.7 (RULINGS #51): a still with no face, a glove at the bag, Elite Fit's own footage (s3-home-v2 nextup-boxing.webp, a crop of the club's "Better together" film); no boxing window of the stock clip keeps the whole head 8 px clear for more than 1 s. v1.6 was card-boxing-v16c: the face is >= 10 % from every edge in every 0.1 s frame and the crown stays inside (#46) */
  conditioning: { file: 'card-conditioning-v17', w: 960, h: 540, stock: false }, /* Elite Fit, the club's landscape header film. v1.7 (RULINGS #51): re-cut from s1-stage conditioning-wide.mp4 (x 0 to 1173, y 27 to 687 of 1280x720), so the fourth woman's head at the right edge is out of frame; every head is >= 125 px clear */
  sculpt: { file: 'card-sculpt-v110b', w: 960, h: 540, stock: false }, /* Elite Fit, the club's landscape header film. v1.10 (#46, #51): re-cut from s1-stage sculpt-wide.mp4 (x 520 to 1195, y 60 to 440 of 1280x720): the foreground head that the old cut lost at its bottom edge is out of frame; every head >= 64 px clear */
  mobility: { file: 'card-mobility', w: 960, h: 540, stock: true }     /* Pexels 6326792 (Pavel Danilyuk) */
};
var CHAPTER_STOCK = { boxing: true, conditioning: false, sculpt: false, mobility: true };

/* ---------- P13 · free-spots seat row (same markup and wording as engine-v2's EF.seats) ---------- */
function capOf(o) { var c = DATA && DATA.timetable && DATA.timetable.capacity; return (c && c[o.classId]) || o.capacity || 14; }
function freeOf(o) { return Math.max(0, Math.min(o.spotsLeft, capOf(o))); }
function seatLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function seatSr(o) { var f = freeOf(o), c = capOf(o); return f <= 0 ? 'Full, ' + c + ' of ' + c + ' spots taken. Join the waitlist.' : f + ' of ' + c + ' spots free'; }
function seatsHtml(o) {
  var free = freeOf(o), cap = capOf(o);
  if (EF.seats && EF.seats.html) { return EF.seats.html(free, cap); }
  var i, out = '', group = cap > 12;
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { out += '<b class="seat-gap"></b>'; }
    out += '<i class="seat' + (i < free ? ' seat--free' : '') + '" style="--s:' + i + '"></i>';
  }
  var lbl = seatLabel(free), num = /^\d+/.exec(lbl);
  return '<span class="seatrow' + (free <= 0 ? ' seatrow--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '">' +
    '<span class="seats" aria-hidden="true">' + out + '</span>' +
    '<span class="seatrow__lbl" aria-hidden="true">' + (num ? '<b>' + num[0] + '</b>' + lbl.slice(num[0].length) : lbl) + '</span>' +
    '<span class="vh">' + seatSr(o) + '</span></span>';
}
function spotsText(o) { return o.past ? 'Finished' : seatLabel(freeOf(o)); }

/* ---------- data binding ---------- */
function bindStatic() {
  var p = DATA.passes, c = DATA.club, packs = {};
  (p.packs || []).forEach(function (k) { packs[k.id] = k.price_idr; });
  var prices = { day: p.day && p.day.price_idr, duo: p.duo.price_idr, 'duo-total': p.duo.price_idr * (p.duo.people || 2), 'duo-old': p.duo.old_price_idr, recharge_day: p.recharge_day && p.recharge_day.price_idr, 'class-1': packs['class-1'] };
  qsa('[data-price]').forEach(function (el) { var v = prices[el.getAttribute('data-price')]; if (v) { el.textContent = EF.api.k(v); } });
  qsa('[data-bind="weekly-count"]').forEach(function (el) { el.textContent = EF.api.weeklyCount(); });
  qsa('[data-bind="coach-count"]').forEach(function (el) { el.textContent = DATA.coaches.length; });
  qsa('[data-bind="class-count"]').forEach(function (el) { el.textContent = DATA.classes.length; });
  qsa('[data-bind="weekend-note"]').forEach(function (el) { el.textContent = DATA.timetable.weekend_note; });
  qsa('[data-bind="address"]').forEach(function (el) { el.textContent = c.address_short || c.address; });
  if (c.whatsapp) {
    qsa('[data-bind="wa-link"]').forEach(function (el) { el.textContent = c.whatsapp.number; el.href = 'https://wa.me/' + c.whatsapp.wa; });
    qsa('[data-bind="wa-btn"]').forEach(function (el) { el.href = 'https://wa.me/' + c.whatsapp.wa; });
  }
  bindRating();
}
/* P21 · the rating comes from the data. v1's data still holds the older read (488, "October 2026"); the markup carries the
   28 Oct 2026 read (497) until engine-v2's overlay supplies a dated one, which then wins everywhere. */
function bindRating() {
  var r = DATA.club && DATA.club.rating;
  if (!r || !r.count || !/^\d{4}-\d\d-\d\d$/.test(String(r.as_of || ''))) { return; }
  qsa('[data-bind="rating-count"]').forEach(function (el) { el.textContent = r.count; });
  qsa('[data-bind="rating-value"]').forEach(function (el) { el.textContent = r.value; });
  qsa('[data-bind="rating-aria"]').forEach(function (el) { el.setAttribute('aria-label', 'Rated ' + r.value + ' out of 5 from ' + r.count + ' Google reviews'); });
}

/* ---------- P23 · Now / Next bar: what runs right now (or next), live countdown in Bali time, tap books that class ---------- */
var ICON = {
  boxing: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 11.5V7.6A4.6 4.6 0 0 1 12.6 3h.6A3.8 3.8 0 0 1 17 6.8v5.7a4.5 4.5 0 0 1-4.5 4.5H11a3 3 0 0 1-3-3"/><path d="M8 11.5a2.1 2.1 0 0 0 0 4.2h2.2"/><path d="M9.2 17.2V21h7v-4.2"/></svg>',
  conditioning: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9.4V8a3 3 0 0 1 6 0v1.4"/><circle cx="12" cy="15" r="6"/></svg>',
  sculpt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5v11M3.5 9.2v5.6M17.5 6.5v11M20.5 9.2v5.6M6.5 12h11"/></svg>',
  mobility: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4.6" r="2"/><path d="M4 9.4l8 1.6 8-1.6"/><path d="M12 11v4.6l-4 5M12 15.6l4 5"/></svg>'
};
/* v1.5 (#43, #12): real names at every width. Only the longest name keeps a short form, used only where the full name would
   need a 3rd line or a word would not fit in the phone bar (it does at 360 to 414 px) */
var SHORT = { 'injury-prevention-mobility': 'Injury Prevention' };
function fmtLeft(ms) {
  var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
}
function spokenLeft(ms) {
  var mins = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  return (h ? plural(h, 'hour', 'hours') + (m ? ' ' : '') : '') + (m ? plural(m, 'minute', 'minutes') : '');
}
function nextBookable(classId, after) {
  var wk = EF.api.week(), i, j, o;
  for (i = 0; i < wk.length; i++) { for (j = 0; j < wk[i].occs.length; j++) { o = wk[i].occs[j]; if (o.classId === classId && o.start > after && !o.full) { return o; } } }
  return EF.api.occ(classId);
}
function initNowBar() {
  var bar = qs('[data-nowbar]');
  if (!bar || !EF.api || !EF.api.week) { return; }
  var el = {
    go: qs('[data-nowbar-go]', bar), k: qs('[data-nowbar-k]', bar), icon: qs('[data-nowbar-icon]', bar), cls: qs('[data-nowbar-cls]', bar),
    av: qs('[data-nowbar-av]', bar), coach: qs('[data-nowbar-coach]', bar), pre: qs('[data-nowbar-pre]', bar), post: qs('[data-nowbar-post]', bar), t: qs('[data-nowbar-t]', bar),
    label: qs('[data-nowbar-label]', bar), sr: qs('[data-nowbar-sr]', bar), video: qs('[data-nowbar-video]', bar), poster: qs('[data-nowbar-poster]', bar)
  };
  var offset = EF.api.now() - Date.now(), cur = null, fam = '', lastMin = -1, phone = mq('(max-width: 414px)');
  function clock() { return Date.now() + offset; }
  function pick(t) {
    var wk = EF.api.week(), i, j, o, next = null;
    for (i = 0; i < wk.length; i++) {
      for (j = 0; j < wk[i].occs.length; j++) {
        o = wk[i].occs[j];
        if (o.start <= t && t < o.end) { return { occ: o, mode: 'now' }; }
        if (o.start > t && (!next || o.start < next.start)) { next = o; }
      }
    }
    return next ? { occ: next, mode: 'next' } : null;
  }
  function render() {
    if (!cur) { el.go.hidden = true; return; }
    var o = cur.occ, now = cur.mode === 'now';
    el.k.textContent = now ? 'Now' : 'Next';
    el.icon.innerHTML = ICON[o.family.id] || '';
    el.av.srcset = avSet(o.coach.id); el.av.src = AV_BASE + o.coach.id + '-48.webp';
    el.coach.textContent = o.coach.name;
    /* RULINGS #43: desktop "ends in 23:14" / "starts in 1:12:05"; phones "23:14 left" / "in 1:12:05" */
    el.pre.textContent = phone.matches ? (now ? '' : 'in ') : (now ? 'ends in ' : 'starts in ');
    el.post.textContent = phone.matches && now ? ' left' : '';
    el.label.textContent = (now ? 'Running now: ' : 'Next class: ') + o.cls.name + ' with ' + o.coach.name + ', ' + (now ? 'ends at ' + EF.api.time12(EF.api.wita(o.end).hh + ':' + pad(EF.api.wita(o.end).mm)) : dayPhrase(o) + ' at ' + EF.api.time12(o.time)) + '. Book the next one.';
    if (o.family.id !== fam) {
      fam = o.family.id;
      el.poster.src = 'assets/img/bar-' + fam + '-poster.webp';
      el.video.setAttribute('src', 'assets/video/bar-' + fam + '.mp4');
      if (EF.media && EF.media.sync) { EF.media.sync(); }
    }
    el.go.hidden = false;
    fitName();
    lastMin = -1;
  }
  function fitName() {
    if (!cur) { return; }
    var o = cur.occ, s = SHORT[o.classId];
    el.cls.style.width = '';
    el.cls.textContent = o.cls.name;
    if (el.go.hidden) { return; }
    var lh = parseFloat(w.getComputedStyle(el.cls).lineHeight) || 16;
    if (s && (el.cls.scrollHeight > lh * 2 + 2 || el.cls.scrollWidth > el.cls.clientWidth + 1)) { el.cls.textContent = s; }
    /* a name on 2 lines: the box hugs its longer line, so the " · " after it sits next to the words */
    if (el.cls.scrollHeight > lh * 1.5 && d.createRange) {
      var rg = d.createRange(), wmax = 0, rs, i;
      rg.selectNodeContents(el.cls); rs = rg.getClientRects();
      for (i = 0; i < rs.length; i++) { wmax = Math.max(wmax, rs[i].width); }
      if (wmax > 0) { el.cls.style.width = Math.ceil(wmax + 1) + 'px'; }
    }
  }
  function tick() {
    var t = clock();
    if (!cur || (cur.mode === 'now' ? t >= cur.occ.end : t >= cur.occ.start)) { cur = pick(t); render(); }
    if (!cur) { return; }
    var left = (cur.mode === 'now' ? cur.occ.end : cur.occ.start) - t;
    el.t.textContent = fmtLeft(left);
    var min = Math.ceil(left / 60000);
    if (min !== lastMin) { lastMin = min; el.sr.textContent = cur.occ.cls.name + (cur.mode === 'now' ? ' ends in ' : ' starts in ') + spokenLeft(left) + '.'; }
  }
  el.go.addEventListener('click', function () { if (cur) { var o = nextBookable(cur.occ.classId, clock()); if (o) { openOcc(o.id, { src: 'nowbar' }); } } });
  [phone].forEach(function (m) { if (m.addEventListener) { m.addEventListener('change', render); } else if (m.addListener) { m.addListener(render); } });
  var ft = 0;
  w.addEventListener('resize', function () { w.clearTimeout(ft); ft = w.setTimeout(fitName, 150); });
  try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(fitName); } } catch (e) { }
  tick();
  w.setInterval(tick, 1000);
}

/* ---------- P4 · hero quotes: one real Google review at a time, verbatim cuts of 12 words or fewer, every 3.5 s.
   The words rise from their line mask (the house move); static under reduced motion; a quote that needs a third line at the
   current width is skipped there, never cut. Engine-v2's data wins once it carries the hero set. ---------- */
var HERO_Q = [ /* verbatim cuts from ef-gf/s3v2/reviews (raw Maps text, typos kept) */
  { id: 'R01', text: '…the trainers are friendly, knowledgeable, and always happy to help.', by: 'Sonal P., Google review' },
  { id: 'R02', text: 'Amazing facilities and great classes.', by: 'Alex F., Google review' },
  { id: 'R03', text: 'Excellent gym with top-level equipment, a great range of classes…', by: 'Tom H., Google review' },
  { id: 'R04', text: '…The variety of classes offered is amazing…', by: 'Edi H., Google review' },
  { id: 'R05', text: '…Great variety of classes and equipment is exceptional .', by: 'Kieran H., Google review' }
];
function wordCount(s) { return String(s).replace(/…/g, ' ').split(/\s+/).filter(function (x) { return /\w/.test(x); }).length; }
function heroQuotes() {
  var l = (DATA.reviews || []).filter(function (r) { return r && r.tags && r.tags.hero && r.text && r.by && wordCount(r.text) <= 12; });
  return l.length >= 2 ? l : HERO_Q;
}
function splitWords(s) {
  return String(s).split(/\s+/).map(function (word, i) { return '<span class="w"><span class="wi" style="--i:' + Math.min(i, 11) + '">' + esc(word) + '</span></span>'; }).join(' ');
}
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var list = heroQuotes(), slides = qs('.hq__slides', box), btn = qs('[data-hq-pause]');
  slides.innerHTML = list.map(function (r, i) {
    return '<figure class="hq__slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '" aria-hidden="true" data-q="' + esc(r.id || '') + '"><blockquote><p>' + splitWords('“' + r.text + '”') + '</p></blockquote><figcaption>' + GMARK + '<span>' + esc(r.by) + '</span></figcaption></figure>';
  }).join('');
  var items = qsa('.hq__slide', slides), usable = [], cur = 0, timer = 0, userPaused = false, hover = false, focusIn = false, inView = true;
  function show(i, still) {
    items.forEach(function (it) { it.classList.remove('is-on', 'is-still'); it.setAttribute('aria-hidden', 'true'); });
    cur = (i + usable.length) % usable.length;
    var it = usable[cur];
    if (still) { it.classList.add('is-still'); }
    it.classList.add('is-on'); it.removeAttribute('aria-hidden');
  }
  function measure() {
    items.forEach(function (it) { it.classList.remove('is-skip'); });
    usable = items.filter(function (it) {
      var p = qs('blockquote p', it), lh = parseFloat(w.getComputedStyle(p).lineHeight) || 24;
      var fits = p.scrollHeight <= lh * 2 + 3;
      it.classList.toggle('is-skip', !fits);
      return fits;
    });
    if (!usable.length) { usable = [items[1] || items[0]]; usable[0].classList.remove('is-skip'); }
    var start = 0;
    usable.forEach(function (it, i) { if (it.getAttribute('data-q') === 'R02') { start = i; } });
    show(start, true);
    if (btn) { btn.hidden = usable.length < 2 || !motionOn(); }
  }
  function auto() { return motionOn() && !userPaused && !hover && !focusIn && inView && !d.hidden && usable.length > 1; }
  function tick() { w.clearTimeout(timer); if (auto()) { timer = w.setTimeout(function () { show(cur + 1); tick(); }, 3500); } }
  if ('IntersectionObserver' in w) { new w.IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== inView) { inView = v; tick(); } }).observe(box); }
  if (btn) {
    btn.addEventListener('click', function () {
      userPaused = !userPaused;
      btn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      btn.setAttribute('aria-label', (userPaused ? 'Play' : 'Pause') + ' the review quotes');
      tick();
    });
  }
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  box.addEventListener('focusin', function () { focusIn = true; tick(); });
  box.addEventListener('focusout', function () { focusIn = false; tick(); });
  d.addEventListener('visibilitychange', tick);
  var rt = 0, lastW = w.innerWidth;
  w.addEventListener('resize', function () { if (w.innerWidth === lastW) { return; } lastW = w.innerWidth; w.clearTimeout(rt); rt = w.setTimeout(function () { measure(); tick(); }, 200); });
  try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(function () { measure(); tick(); }); } } catch (e) { }
  measure(); tick();
}

/* ---------- next up: a class clip on top, the start time as the hero of each card, the seat row ---------- */
var nextBox;
function cardMedia(o) {
  var c = CLIP[o.family.id];
  if (!c) { return ''; }
  return '<span class="ncard__media" aria-hidden="true"><img class="media__poster" src="assets/img/' + c.file + '-poster.webp" alt="" width="' + c.w + '" height="' + c.h + '" loading="lazy" decoding="async">' +
    (c.still ? '' : '<video data-clip data-group="next" muted loop playsinline preload="none" src="assets/video/' + c.file + '.mp4"></video>') + '</span>';   /* v1.7: a still card has no clip */
}
function renderNext() {
  nextBox = nextBox || qs('[data-nextup]');
  if (!nextBox) { return; }
  var list = EF.api.upcoming(3);
  if (!list.length) { nextBox.innerHTML = '<p class="nextup__loading">No classes left this week. New dates appear every day.</p>'; return; }
  nextBox.innerHTML = list.map(function (o, i) {
    var lab = dayLabel(o), c = CLIP[o.family.id];
    var when = (lab === 'Today' || lab === 'Tomorrow') ? lab + ' · ' + EF.api.dateShort(o.ymd) : EF.api.dateShort(o.ymd);
    return '<button class="ncard" type="button" data-testid="next-card" data-motion="rise" data-occ="' + esc(o.id) + '" style="--i:' + i + '">' +
      cardMedia(o) +
      '<span class="ncard__when">' + esc(when) + '</span>' +
      '<span class="ncard__time">' + esc(o.time) + '</span>' +
      '<span class="ncard__name">' + esc(o.cls.name) + '</span>' +
      '<span class="who">' + avImg(o.coach, 36, ' loading="lazy"') + 'with ' + esc(o.coach.name) + '</span>' +
      '<span class="ncard__meta">' + o.cls.length_min + ' min · ' + esc(o.cls.level) + (c && c.stock ? ' · <span class="ncard__stock">Stock clip</span>' : '') + '</span>' +
      '<span class="ncard__foot">' + seatsHtml(o) + '<span class="fauxbtn">Book ' + arrow() + '</span></span>' +
    '</button>';
  }).join('');
  qsa('.ncard', nextBox).forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-occ')); }); });
  rescan(nextBox.parentNode);
  mediaScan(nextBox);
}

/* ---------- class chapters ---------- */
function renderChapters() {
  qsa('[data-chap-body]').forEach(function (box) {
    var fid = box.getAttribute('data-chap-body'), fam = EF.api.family(fid);
    if (!fam) { return; }
    var classes = EF.api.classesInFamily(fid), weekly = 0, coachIds = [];
    classes.forEach(function (c) { weekly += EF.api.slots(c.id).length; if (coachIds.indexOf(c.coach) < 0) { coachIds.push(c.coach); } });
    var coaches = coachIds.map(function (id) { return EF.api.coach(id); }).filter(Boolean);
    var html = '<p class="eyebrow chap__label">' + esc(fam.label) + ' · ' + esc(plural(weekly, 'class', 'classes')) + ' a week</p>' +
      '<p class="chap__feel">' + esc(fam.feel) + '</p>' +
      '<ul class="chap__meta"><li class="chip">60 min</li><li class="chip">' + esc(fam.level_line) + '</li>' +
      '<li class="chip">' + coaches.map(function (co) { return '<span class="who">' + avImg(co, 28, ' loading="lazy"') + esc(co.name) + '</span>'; }).join(' ') + '</li>' +
      (CHAPTER_STOCK[fid] ? '<li class="chip chip--stock">Stock clip</li>' : '') + '</ul>' +
      '<ul class="ccards" data-motion="stagger">' + classes.map(function (c) {
        var slots = EF.api.slots(c.id).map(function (s) { return s.dowShort + ' ' + s.time; }).join(', ');
        var co = EF.api.coach(c.coach), next = EF.api.occ(c.id);
        var lvl = esc(c.level) + (isSample(c, 'length') ? ' · ' + c.length_min + ' min' : '');
        return '<li class="ccard"><button class="ccard__hit" type="button" aria-expanded="false" aria-controls="cc-' + esc(c.id) + '">' +
          '<span class="ccard__name">' + esc(c.name) + '</span>' +
          '<span class="ccard__sub">with ' + esc(co ? co.name : '') + ' · ' + lvl + '<br>' + esc(slots) + '</span>' +
          '<span class="ccard__plus" aria-hidden="true"></span></button>' +
          '<div class="ccard__more" id="cc-' + esc(c.id) + '" inert><div><div class="ccard__in">' +
          '<p>' + esc(c.description) + '</p>' +
          (next ? '<button class="link-t" type="button" data-open-occ="' + esc(next.id) + '"><span>Book the next one: ' + esc(dayPhrase(next) + ' at ' + next.time) + '</span> ' + arrow() + '</button>' : '') +
          '</div></div></div></li>';
      }).join('') + '</ul>' +
      '<a class="link-t" href="#schedule" data-filter-family="' + esc(fid) + '"><span>See ' + esc(fam.name.toLowerCase()) + ' times</span> ' + arrow() + '</a>';
    box.innerHTML = html;
  });
  qsa('.ccard__hit').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.parentNode, open = !card.classList.contains('is-open'), more = qs('.ccard__more', card);
      card.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (more) { if (open) { more.removeAttribute('inert'); } else { more.setAttribute('inert', ''); } }
    });
  });
  qsa('[data-open-occ]').forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-open-occ')); }); });
}

/* ---------- P22 · the week (section 1): day selector + list on phones, a today-first 7-day grid from 1024 px, one data model ---------- */
var S = { day: 0, family: '', coaches: [], times: [], levels: [] };
var sched = {};
var TIMES = [
  { id: 'morning', name: 'Morning, before 12:00', test: function (t) { return t < '12:00'; } },
  { id: 'afternoon', name: 'Afternoon, from 12:00', test: function (t) { return t >= '12:00' && t < '17:00'; } },
  { id: 'evening', name: 'Evening, from 17:00', test: function (t) { return t >= '17:00'; } }
];
var LEVELS = [{ id: 'beginner', name: 'Beginner' }, { id: 'advanced', name: 'Advanced' }, { id: 'all', name: 'All levels' }];
function matches(o, f) {
  if (f.family && o.family.id !== f.family) { return false; }
  if (f.coaches.length && f.coaches.indexOf(o.coach.id) < 0) { return false; }
  if (f.times.length && !TIMES.some(function (t) { return f.times.indexOf(t.id) > -1 && t.test(o.time); })) { return false; }
  if (f.levels.length && f.levels.indexOf(o.cls.level_key) < 0) { return false; }
  return true;
}
function filterCount(f) { return (f.family ? 1 : 0) + f.coaches.length + f.times.length + f.levels.length; }
function copyF(f) { return { day: f.day, family: f.family, coaches: f.coaches.slice(), times: f.times.slice(), levels: f.levels.slice() }; }
function dayRows(i, f) { var day = EF.api.week()[i]; return day ? day.occs.filter(function (o) { return matches(o, f); }) : []; }

function renderDays() {
  var wk = EF.api.week(), bookedDays = {};
  (store().bookings || []).forEach(function (b) { bookedDays[b.ymd] = true; });
  sched.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (day.isToday ? ' is-today' : '') + (bookedDays[day.ymd] ? ' has-booking' : '') + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" style="--i:' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
      '<span class="day__dow day__label">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span> <span class="day__num">' + day.dayNum + '</span><span class="vh">, ' + esc(day.long + ', ' + plural(day.occs.length, 'class', 'classes')) + '</span><span class="day__dot" aria-hidden="true"></span></button>';
  }).join('');
  moveInd();
}
function moveInd() {
  var ind = qs('.days__ind', sched.days), btn = qs('[data-day="' + S.day + '"]', sched.days);
  if (!ind || !btn) { return; }
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
}
function selectDay(i, focus) {
  S.day = i;
  qsa('.day', sched.days).forEach(function (b) {
    var on = +b.getAttribute('data-day') === i;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
    if (on && focus) { b.focus(); }
  });
  moveInd();
  renderRows(true);
}
function rowHtml(o, i) {
  var label = o.cls.name + ', ' + o.time + ' with ' + o.coach.name + '. ' + (o.past ? 'Finished' : seatSr(o)) + '. See details';
  var act;
  if (o.past) { act = '<span class="row__label">Finished</span>'; }
  else if (o.booking && !o.booking.waitlist) { act = '<button class="rbtn rbtn--booked" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="Booked: ' + esc(o.cls.name + ' ' + o.time) + '">Booked</button>'; }
  else if (o.full) { act = '<button class="rbtn" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Join waitlist for ' + o.cls.name + ' at ' + o.time) + '">Join waitlist</button>'; }
  else { act = '<button class="rbtn" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Book ' + o.cls.name + ' at ' + o.time) + '">Book</button>'; }
  var state = o.booking && !o.booking.waitlist ? esc("You're booked") : (o.booking && o.booking.waitlist ? 'On the waitlist' : (o.past ? 'Finished' : seatsHtml(o)));
  return '<li class="row' + (o.past ? ' is-past' : '') + (o.booking ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '"' + (o.past ? ' data-past' : '') + ' style="--i:' + i + '">' +
    (o.past ? '' : '<button class="row__hit" type="button" data-open="' + esc(o.id) + '" aria-label="' + esc(label) + '"></button>') +
    '<div class="row__when"><span class="row__time">' + esc(o.time) + '</span><span class="row__len">' + lengthHtml(o.cls) + '</span></div>' +
    '<div class="row__main"><p class="row__name">' + esc(o.cls.name) + '</p>' +
    '<p class="row__by">' + avImg(o.coach, 28, ' loading="lazy"') + '<span>' + esc(o.coach.name) + ' · ' + levelHtml(o.cls) + '</span></p></div>' +
    '<span class="row__spots">' + state + '</span>' +
    '<div class="row__act">' + act + '</div></li>';
}
function chipHtml(o, day, r) {
  var st = ' style="--r:' + (r || 0) + '"';
  if (o.past) { return '<div class="wkc is-past"' + st + '><span class="wkc__t">' + esc(o.time) + '</span><span class="wkc__n">' + esc(o.cls.name) + '</span><span class="wkc__done wkc__meta">Finished</span></div>'; }
  var booked = o.booking && !o.booking.waitlist;
  var free = freeOf(o), cap = capOf(o);
  var lab = o.time + ' ' + o.cls.name + ', ' + (booked ? "You're booked" : seatLabel(free) + (free > 0 ? ' of ' + cap : '')) + '. ' + day.long + ' with ' + o.coach.name + '.' + (booked || o.full ? '' : ' Book');
  return '<button class="wkc' + (booked ? ' is-booked' : '') + '"' + st + ' type="button" data-book="' + esc(o.id) + '" data-testid="wk-chip" aria-label="' + esc(lab) + '">' +
    '<span class="wkc__t">' + esc(o.time) + '</span> <span class="wkc__n">' + esc(o.cls.name) + '</span> ' +
    (booked ? '<span class="wkc__done wkc__meta">You\'re booked</span>' : '<span class="wkc__meta">' + seatsHtml(o) + '</span>') + '</button>';   /* v1.5: spaces between the parts, so their text reads as words (2.5.3) */
}
function renderWeek() {
  if (!sched.week) { return; }
  /* RULINGS #32: today first, the same order as the phone day selector, so dates read left to right and no finished day shows */
  var wk = EF.api.week(), i, day, list, html = '';
  for (i = 0; i < wk.length; i++) {
    day = wk[i];
    list = day.occs.filter(function (o) { return matches(o, S); });
    html += '<div class="wk__col' + (day.isToday ? ' is-today' : '') + '" style="--c:' + i + '" role="group" aria-label="' + esc(day.long + (day.isToday ? ', today' : '') + ', ' + plural(list.length, 'class', 'classes')) + '">' +
      '<div class="wk__h">' + (day.isToday ? '<span class="wk__today wk__label">Today</span>' : '') + '<span class="wk__dow">' + esc(day.dowShort) + '</span><span class="wk__date">' + esc(day.dayNum + ' ' + day.monthShort) + '</span></div>' +
      (list.length ? list.map(function (o, r) { return chipHtml(o, day, r); }).join('') : '<p class="wk__none">' + (day.occs.length ? 'No match' : 'No classes') + '</p>') + '</div>';
  }
  sched.week.innerHTML = html;
}
var vtOn = false;
function renderRows(animate) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day) { return; }
  var list = dayRows(S.day, S);
  var draw = function (cascade) {
    sched.rows.innerHTML = list.map(rowHtml).join('');
    if (cascade) { qsa('.row', sched.rows).forEach(function (r) { r.classList.add('is-enter'); }); }
    sched.empty.hidden = list.length > 0;
    sched.title.textContent = (day.isToday ? 'Today, ' : '') + day.long;
    sched.count.textContent = plural(list.length, 'class', 'classes');
    var left = day.occs.filter(function (o) { return !o.past; }).length;
    if (day.isToday && day.occs.length && !left) {
      var tmr = wk[1] && wk[1].occs[0];
      sched.done.textContent = "That's today done." + (tmr ? ' Tomorrow starts at ' + tmr.time + ' with ' + tmr.cls.name + '.' : '');
      sched.done.hidden = false;
    } else { sched.done.hidden = true; }
    renderWeek();
    renderBadge();
  };
  /* v1.4 motion: a day switch or filter change is a View Transition on the list (CSS: kinetic.css v1.4 section 7);
     without the API the new rows cascade in at once; reduced motion, Save-Data and the first render are instant */
  if (animate && motionOn() && d.startViewTransition && !vtOn) {
    vtOn = true;
    root.classList.add('vt-sched');
    var done = function () { vtOn = false; root.classList.remove('vt-sched'); };
    try { d.startViewTransition(function () { draw(false); }).finished.then(done, done); } catch (e) { done(); draw(false); }
  } else { draw(animate && motionOn()); }
}
function renderBadge() {
  var n = filterCount(S), b = sched.badge;
  if (!b) { return; }
  var before = b.textContent;
  b.textContent = n;
  b.hidden = n === 0;
  if (String(n) !== before && n > 0 && motionOn()) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  qsa('.fchip', sched.chips).forEach(function (c) { c.setAttribute('aria-pressed', (c.getAttribute('data-fam') || '') === S.family ? 'true' : 'false'); });
}
function firstOpenDay() {
  var wk = EF.api.week(), i;
  for (i = 0; i < wk.length; i++) { if (wk[i].occs.some(function (o) { return !o.past; })) { return i; } }
  return 0;
}
function initSchedule() {
  var box = qs('[data-schedule]');
  if (!box) { return; }
  sched = {
    box: box, days: qs('[data-days]', box), chips: qs('[data-fchips]', box), badge: qs('[data-filter-count]', box),
    title: qs('[data-day-title]', box), count: qs('[data-day-count]', box), done: qs('[data-day-done]', box),
    rows: qs('[data-rows]', box), empty: qs('[data-empty]', box), week: qs('[data-week]', box)
  };
  sched.rows.id = 'sched-rows';
  S.day = firstOpenDay();
  renderDays();
  renderRows(false);
  sched.days.addEventListener('click', function (e) { var b = e.target.closest('.day'); if (b) { selectDay(+b.getAttribute('data-day')); } });
  sched.days.addEventListener('keydown', function (e) {
    var k = e.key, n = EF.api.week().length, i = S.day;
    if (k === 'ArrowRight') { i = (i + 1) % n; } else if (k === 'ArrowLeft') { i = (i - 1 + n) % n; } else if (k === 'Home') { i = 0; } else if (k === 'End') { i = n - 1; } else { return; }
    e.preventDefault(); selectDay(i, true);
  });
  sched.chips.addEventListener('click', function (e) {
    var c = e.target.closest('.fchip'); if (!c) { return; }
    S.family = c.getAttribute('data-fam') || '';
    renderRows(true);
  });
  [sched.rows, sched.week].forEach(function (el) {
    if (!el) { return; }
    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book], [data-open]');
      if (t) { openOcc(t.getAttribute('data-book') || t.getAttribute('data-open')); }
    });
  });
  qsa('[data-clear-filters]').forEach(function (b) { b.addEventListener('click', function () { S.family = ''; S.coaches = []; S.times = []; S.levels = []; renderRows(true); }); });
  var fb = qs('[data-open-filters]', box);
  if (fb) { fb.addEventListener('click', function () { if (EF.sheet && EF.sheet.open) { EF.sheet.open('filters', {}, '?view=filters'); } }); }
  var rt = 0;
  w.addEventListener('resize', function () { w.clearTimeout(rt); rt = w.setTimeout(moveInd, 120); });
  try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(moveInd); } } catch (e) { }
  if (w.ResizeObserver) { new w.ResizeObserver(function () { moveInd(); }).observe(sched.days); }
  registerFilters();
}
EF.schedule = {
  show: function (o) {
    o = o || {};
    if (!sched.days) { return; }
    if (o.ymd) { EF.api.week().forEach(function (day, i) { if (day.ymd === o.ymd) { S.day = i; } }); }
    if (o.family != null) { S.family = o.family; }
    selectDay(S.day);
    var sec = d.getElementById('schedule');
    scrollToEl(sec);
    try { sec.focus({ preventScroll: true }); } catch (e) { }
  },
  state: function () { return copyF(S); }
};

/* filter drawer, rendered through EF.sheet */
function registerFilters() {
  if (!EF.sheet || !EF.sheet.register) { return; }
  EF.sheet.register('filters', function () {
    var F = copyF(S);
    return {
      label: 'Filters', progress: null, testid: 'step-filters', mode: 'filters',
      render: function (body, foot) {
        var fams = DATA.families, coaches = DATA.coaches, desk = mq('(min-width: 1024px)').matches;
        function tog(group, id, name, on, img) {
          return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? avImg(img, 26) : '') + esc(name) + '</button>';
        }
        function count() { if (desk) { var n = 0; EF.api.week().forEach(function (day) { n += day.occs.filter(function (o) { return matches(o, F); }).length; }); return n; } return dayRows(S.day, F).length; }
        body.innerHTML = '<div data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">' + (desk ? 'For the whole week.' : 'For ' + esc(EF.api.week()[S.day].long) + '.') + '</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="opts">' + tog('family', '', 'All classes', !F.family) + fams.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="opts">' + coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Time of day</legend><div class="opts">' + TIMES.map(function (t) { return tog('times', t.id, t.name, F.times.indexOf(t.id) > -1); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Level</legend><div class="opts">' + LEVELS.map(function (l) { return tog('levels', l.id, l.name, F.levels.indexOf(l.id) > -1); }).join('') + '</div></fieldset>' +
          '<p class="sh-lead"><span class="sample">Sample</span> Most class levels are placeholders until the club confirms them.</p></div>';
        foot.innerHTML = '<div class="foot-row"><button class="btn btn--outline btn--sm" type="button" data-testid="filters-clear" data-fclear>Clear all</button>' +
          '<button class="btn btn--primary" type="button" data-testid="filters-apply" data-fapply></button></div>';
        var apply = qs('[data-fapply]', foot);
        function sync() {
          qsa('.tog', body).forEach(function (b) {
            var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
            var on = g === 'family' ? F.family === v : F[g].indexOf(v) > -1;
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          apply.innerHTML = 'Show ' + plural(count(), 'class', 'classes') + ' ' + arrow();
        }
        body.addEventListener('click', function (e) {
          var b = e.target.closest('.tog'); if (!b) { return; }
          var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
          if (g === 'family') { F.family = v; } else { var at = F[g].indexOf(v); if (at > -1) { F[g].splice(at, 1); } else { F[g].push(v); } }
          sync();
        });
        qs('[data-fclear]', foot).addEventListener('click', function () { F.family = ''; F.coaches = []; F.times = []; F.levels = []; sync(); });
        apply.addEventListener('click', function () {
          S.family = F.family; S.coaches = F.coaches; S.times = F.times; S.levels = F.levels;
          renderRows(true);
          EF.sheet.close();
        });
        sync();
      }
    };
  });
}

/* ---------- coaches: an index of giant names, portrait beside each ---------- */
function teaches(id) {
  var names = [];
  EF.api.week().forEach(function (day) { day.occs.forEach(function (o) { if (o.coach.id === id && names.indexOf(o.cls.name) < 0) { names.push(o.cls.name); } }); });
  if (names.length < 2) { return names.join(''); }
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}
function renderCoaches() {
  var box = qs('[data-coaches]');
  if (!box) { return; }
  box.innerHTML = DATA.coaches.map(function (c, i) {
    return '<button class="coach" type="button" data-testid="coach-' + esc(c.id) + '" data-coach="' + esc(c.id) + '">' +
      '<span class="coach__grid">' +
      '<span class="coach__name" data-chars data-drift="' + (i % 2 ? 'l' : 'r') + '">' + esc(c.name) + '</span>' +
      '<span class="coach__text"><span class="coach__role">' + esc(c.role || ('Teaches ' + teaches(c.id))) + '</span>' +
      '<span class="coach__count">' + plural(EF.api.coachWeekly(c.id), 'class', 'classes') + ' a week</span>' +
      '<span class="coach__link"><span>Meet ' + esc(c.name) + '</span> ' + arrow() + '</span></span>' +
      '<span class="coach__photo" data-motion="lift"><img src="' + esc(c.photo) + '" alt="' + esc(c.name + ', coach at Elite Fit') + '" width="600" height="750" loading="lazy" decoding="async"></span>' +
      '</span></button>';
  }).join('');
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-coach]');
    if (b && EF.booking && EF.booking.openCoach) { EF.booking.openCoach(b.getAttribute('data-coach')); }
  });
  rescan(box);
}

/* ---------- P2 · the sticky bar (phones and desktop). It shows only once the hero Book and every rating on screen have
   scrolled away (phones: the hero rating and quote; desktop: the trust row), and hides over the +1 offer, the visit rating,
   the footer, an open sheet and a focused page field. Hidden means not focusable. ---------- */
function initBars() {
  var bar = qs('[data-buybar]'), hdr = qs('#hdr');
  var marks = [qs('[data-testid="hero-book"]'), qs('.htrust .trust'), qs('[data-hq]'), qs('[data-trust-badge]')].filter(Boolean), gone = [];
  var barBtn = bar && qs('button', bar), hdrBtn = hdr && qs('.hdr__cta', hdr);
  var st = { pastHero: false, blocked: {}, sheet: !!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen()), typing: false };
  function apply() {
    var blocked = st.blocked.offer || st.blocked.footer || st.blocked.rating;
    var onBar = st.pastHero && !blocked && !st.sheet && !st.typing;
    /* v1.4 motion: over the visit rating the bar leaves at once (no slide), so two ratings never share a screen mid-slide */
    if (bar) { bar.classList.toggle('is-cut', !!st.blocked.rating); bar.classList.toggle('is-on', onBar); bar.setAttribute('aria-hidden', onBar ? 'false' : 'true'); if (barBtn) { barBtn.tabIndex = onBar ? 0 : -1; } }
    if (hdr) { hdr.classList.toggle('cta-on', st.pastHero && !st.sheet && !mq('(min-width: 1024px)').matches); if (hdrBtn) { hdrBtn.tabIndex = -1; hdrBtn.setAttribute('aria-hidden', 'true'); } }
  }
  if ('IntersectionObserver' in w) {
    if (marks.length) {
      /* a mark counts as gone once it has scrolled away above (a mark hidden at this width counts as gone) */
      var mio = new w.IntersectionObserver(function (es) {
        es.forEach(function (e) { gone[marks.indexOf(e.target)] = !e.isIntersecting && e.boundingClientRect.bottom <= 0; });
        st.pastHero = marks.every(function (m, i) { return !!gone[i]; });
        apply();
      });
      marks.forEach(function (m) { mio.observe(m); });
    }
    [['offer', '#plus-one', 10], ['footer', '#footer', 10], ['rating', '[data-rating-mark]', 140]].forEach(function (p) {
      var el = qs(p[1]);
      /* -10 px: the bar hides as soon as the block reaches the bar's zone, so it never shares a screen with it (P2-3, P6).
         v1.4 motion: the visit rating starts the hide 140 px early (the bar's height plus margin), so the rating figure is
         never seen above the bar while the bar is still sliding away */
      if (el) { new w.IntersectionObserver(function (es) { st.blocked[p[0]] = es[0].isIntersecting; apply(); }, { rootMargin: '0px 0px ' + p[2] + 'px 0px' }).observe(el); }
    });
  }
  d.addEventListener('ef:sheet', function (e) { st.sheet = !!(e.detail && e.detail.open); apply(); });
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { st.typing = true; apply(); } });
  /* keyboard focus never ends up under the sticky bar: nudge the page up by the overlap */
  d.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!bar || !t || !t.getBoundingClientRect || st.sheet || (bar.contains && bar.contains(t)) || !(t.closest && t.closest('#page'))) { return; }
    w.requestAnimationFrame(function () {
      if (!bar.classList.contains('is-on')) { return; }
      var r = t.getBoundingClientRect(), top = bar.getBoundingClientRect().top, over = r.bottom - (top - 16);
      if (over > 0 && r.top - over > 0) { w.scrollBy(0, over); }
    });
  });
  d.addEventListener('focusout', function () { if (st.typing) { st.typing = false; apply(); } });
  /* v1.4 motion: the header hairline shows once the page has moved 5 px, read from a sentinel (no scroll listener, no
     scrollY read in a frame) */
  if (hdr && 'IntersectionObserver' in w) {
    var sen = d.createElement('div');
    sen.setAttribute('aria-hidden', 'true');
    sen.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:5px;pointer-events:none;visibility:hidden';
    d.body.insertBefore(sen, d.body.firstChild);
    new w.IntersectionObserver(function (es) { hdr.classList.toggle('is-scrolled', !es[0].isIntersecting); }).observe(sen);
  }
  apply();
}

/* ---------- sheet skin: the step as a giant numeral ("01//03"). engine-v2 writes data-step-pos / data-steps on #sheet
   (data-step itself is logical: 0, 1, 2, pay, done); no numeral on pay, done, coach and filters. ---------- */
function initSheetNum() {
  var sheet = qs('#sheet'), num = qs('#sheet [data-sheet-num]');
  if (!sheet || !num || !w.MutationObserver) { return; }
  var last = '';
  function paint() {
    var n = +sheet.getAttribute('data-step-pos'), m = +sheet.getAttribute('data-steps');
    var key = n && m ? n + '/' + m : '';
    if (key === last) { return; }
    last = key;
    if (!key) { num.hidden = true; num.innerHTML = ''; return; }
    num.innerHTML = pad(n) + '<i>//</i><b>' + pad(m) + '</b>';
    num.hidden = false;
    num.classList.remove('is-new'); void num.offsetWidth; num.classList.add('is-new');
  }
  new w.MutationObserver(paint).observe(sheet, { attributes: true, attributeFilter: ['data-step-pos', 'data-steps'] });
  paint();
  /* v1.5 (F5, A.5): sheet titles never leave one word alone on the last line. text-wrap: balance (sheet-v2.css) can't
     help a 4-word title that splits 3 + 1 ("Pay for your / booking"), so the last two words are bound, when they fit */
  var body = qs('[data-sheet-body]', sheet), queued = false;
  function bindTitles() {
    queued = false;
    qsa('.sh-title, .done-title, .find-title', body).forEach(function (h) {
      if (h.__nw) { return; }
      h.__nw = true;
      var tw = d.createTreeWalker(h, 4, null, false), words = [], n, m, re;
      while ((n = tw.nextNode())) { re = /\S+/g; while ((m = re.exec(n.nodeValue))) { words.push({ n: n, at: m.index }); } }
      if (words.length < 3) { return; }
      var st = words[words.length - 2], r = d.createRange(), wrap = d.createElement('span');
      r.setStart(st.n, st.at); r.setEndAfter(h.lastChild);
      wrap.className = 'nw';
      wrap.appendChild(r.extractContents());
      h.appendChild(wrap);
      if (wrap.getBoundingClientRect().width > h.clientWidth + 0.5) { while (wrap.firstChild) { h.insertBefore(wrap.firstChild, wrap); } h.removeChild(wrap); h.normalize(); }
    });
  }
  if (body) { new w.MutationObserver(function () { if (!queued) { queued = true; w.requestAnimationFrame(bindTitles); } }).observe(body, { childList: true, subtree: true }); }
}

/* ---------- actions. engine-v2 binds the generic Book buttons ([data-book-next] opens the finder) and the Duo offer
   ([data-duo-start], a pass journey); the page keeps only the family links. ---------- */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-filter-family]');
    if (!t) { return; }
    e.preventDefault();
    EF.schedule.show({ family: t.getAttribute('data-filter-family') });
  });
}

function refresh() {
  renderNext();
  renderDays();
  renderRows(false);
}

/* ---------- boot ---------- */
function fail() {
  var n = qs('[data-nextup]');
  if (n) { n.innerHTML = '<p class="nextup__loading">The timetable didn\'t load. This week\'s classes are on <a href="https://elitefitbali.com/class-schedule/">elitefitbali.com/class-schedule</a>.</p>'; }
}
function landHash() {
  var id = (w.location.hash || '').slice(1), t = id && d.getElementById(id), n = 0;
  if (!t) { return; }
  function go() { try { t.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { t.scrollIntoView(); } }
  w.requestAnimationFrame(go);
  try { if (d.fonts && d.fonts.ready) { d.fonts.ready.then(go); } } catch (e) { }
  w.addEventListener('load', function () { w.setTimeout(go, 60); });
  var iv = w.setInterval(function () { if (++n > 6) { w.clearInterval(iv); } else { go(); } }, 250);
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { w.addEventListener(ev, function () { w.clearInterval(iv); }, { once: true, passive: true }); });
}
function boot() {
  if (!EF.api || !EF.api.load) { fail(); return; }
  EF.api.load().then(function (data) {
    DATA = data;
    /* v1.8: the engine renders coach.avatar too (step-2 strip, finder rows): point it at the same new crop */
    (DATA.coaches || []).forEach(function (c) { try { c.avatar = new w.URL(AV_BASE + c.id + '-64.webp', w.location.href).href; } catch (e) { } });
    bindStatic();
    initNowBar();
    initQuotes();
    initSchedule();
    renderNext();
    renderChapters();
    renderCoaches();
    initBars();
    initSheetNum();
    initActions();
    rescan(d.getElementById('main'));
    if (EF.media && EF.media.sync) { EF.media.sync(); }
    d.addEventListener('ef:booked', refresh);
    landHash();
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.open) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) { }
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
