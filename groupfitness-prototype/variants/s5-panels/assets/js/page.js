/* Elite Fit /groupfitness · Panels app · page.js · 27 Oct 2026
   Renders and wires the page from EF.api (shared v1 engine): hero panels (accordion), visitor switch, next-up tickets,
   schedule (date bar, chips, filter sheet, rows with FLIP), coaches, tab bar + nav scroll-spy, open status,
   and the View Transitions bridge that morphs the tapped panel, ticket, row, coach card or button into the sheet.
   Contract hooks: the shared page contract. Classic deferred script, ES5, no dependencies. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function emit(name, detail) { try { d.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {} }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false }; } }
var mqDesk = mq('(min-width: 1024px)');
var mqWide = mq('(min-width: 1200px)');
var mqHover = mq('(hover: hover) and (pointer: fine)');
var mqReduce = mq('(prefers-reduced-motion: reduce)');
function motionOn() { return root.classList.contains('motion-ok') && !mqReduce.matches; }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function store() { try { return (EF.api && EF.api.store && EF.api.store.get()) || {}; } catch (e) { return {}; } }
function storeSet(p) { try { if (EF.api && EF.api.store) { EF.api.store.set(p); } } catch (e) {} }
function raf(f) { return (w.requestAnimationFrame || w.setTimeout)(f); }
function scrollToEl(el) { if (!el) { return; } try { el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' }); } catch (e) { el.scrollIntoView(); } }
function dayPhrase(o) { return o.dayIndex === 0 ? 'today' : (o.dayIndex === 1 ? 'tomorrow' : EF.api.dateShort(o.ymd)); }
function dayWord(o) { return o.dayIndex === 0 ? 'Today' : (o.dayIndex === 1 ? 'Tomorrow' : EF.api.dateShort(o.ymd).split(' ')[0]); }
/* free-spots seat row (Raoul 28 Oct): one dot per place of the Sample capacity, free dots solid and first, taken dots as rings,
   always with the label; screen readers hear "5 of 12 spots free". Same markup and logic as the v2 engine's EF.seats. */
function seatLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function spotsText(o) { if (o.past) { return 'Finished'; } return seatLabel(o.full ? 0 : o.spotsLeft); }
function capOf(o) { return Math.max(1, +(o && o.capacity) || 14); }
function seatsHtml(o) {
  var cap = capOf(o), free = o.full ? 0 : Math.max(0, Math.min(o.spotsLeft, cap)), group = cap > 12, i, dots = '';
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { dots += '<b class="seat-gap"></b>'; }
    dots += '<i class="seat' + (i < free ? ' seat--free' : '') + '" style="--s:' + i + '"></i>';
  }
  var lbl = seatLabel(free), m = /^\d+/.exec(lbl);
  var vis = m ? '<b data-spots="' + esc(o.id) + '">' + m[0] + '</b>' + lbl.slice(m[0].length) : lbl;
  return '<span class="seatrow m-wait' + (free <= 0 ? ' seatrow--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '">' +
    '<span class="seats" aria-hidden="true">' + dots + '</span><span class="seatrow__lbl" aria-hidden="true">' + vis + '</span>' +
    '<span class="vh">' + (free <= 0 ? 'Full, ' + cap + ' of ' + cap + ' spots taken. Join the waitlist.' : free + ' of ' + cap + ' spots free') + '</span></span>';
}
/* one real Elite Fit (or marked stock) 16:9 clip per class family, for the Next up tickets.
   Boxing is a club still (a glove at the bag, no face) with a slow ken-burns, not a clip (faces #51). */
var CLIPS = {
  boxing: { still: true, p: 'assets/img/nextup-boxing.webp', w: 640, h: 300, stock: false },
  conditioning: { v: 'assets/video/conditioning-ticket2.mp4', p: 'assets/img/conditioning-ticket2-poster.webp', w: 960, h: 540, stock: false },
  sculpt: { v: 'assets/video/sculpt-ticket2.mp4', p: 'assets/img/sculpt-ticket2-poster.webp', w: 960, h: 540, stock: false },
  mobility: { v: 'assets/video/mobility-wide.mp4', p: 'assets/img/mobility-wide-poster.webp', w: 1280, h: 720, stock: true }
};
var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var DATA = null;

/* =====================================================================
   View Transitions bridge: shared-element open and close of the sheet.
   ===================================================================== */
var VT = { busy: false, src: null };
function vtOk() { return !!d.startViewTransition && motionOn(); }
function seen(el) {
  if (!el || !root.contains(el)) { return false; }
  var r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (w.innerHeight || 0) && r.right > 0 && r.left < (w.innerWidth || 0);
}
function nameIt(el, n) { if (el) { el.style.setProperty('view-transition-name', n || 'none'); if (!n) { el.style.removeProperty('view-transition-name'); } } }
function textOf(el) { return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() : ''; }
function partsOf(src, closing) {
  if (!src) { return null; }
  var box = null, media = null, title = null, row, tic, order, i;
  if (src.type === 'occ') {
    row = qs('[data-testid="row"][data-occ="' + src.occ + '"]');
    tic = qs('[data-testid="next-card"][data-occ="' + src.occ + '"]');
    order = src.prefer === 'ticket' ? [tic, row] : [row, tic];
    if (src.fromEl && !closing) { order.unshift(src.fromEl); }
    for (i = 0; i < order.length; i++) { if (seen(order[i])) { box = order[i]; break; } }
    title = box ? qs('[data-vt-title]', box) : null;
    /* the coach's avatar on the ticket or row grows into the portrait of the sheet's coach header */
    media = box ? qs('[data-vt-coach]', box) : null;
  } else if (src.type === 'pclass') {
    box = qs('[data-open-occ="' + src.occ + '"]');
    title = box ? qs('[data-vt-title]', box) : null;
  } else if (src.type === 'coach') {
    box = qs('[data-coach="' + src.id + '"]');
    media = box ? qs('.coach__photo', box) : null;
  } else if (src.type === 'el' && !closing) {
    box = src.el;
  }
  if (!seen(box)) { return null; }
  if (media && !seen(media)) { media = null; }
  return { box: box, media: media, title: title };
}
/* phones share the image itself; a box that clips its own crop (the coach portrait, the strip avatar, an avatar) is shared whole,
   so its snapshot keeps the crop and no face is ever shown uncropped or cut mid-transition */
function inner(el, on) {
  if (!el) { return el; }
  if (el.matches && el.matches('.coachhead__photo, .strip__photo, [data-vt-coach]')) { return el; }
  return on ? (el.querySelector('img') || el) : el;
}
/* the sheet's shared elements: step 1's coach portrait (or step 2's strip avatar, the coach sheet's photo) and the class name */
function sheetParts() {
  var s = qs('#sheet');
  return {
    panel: qs('.sheet__panel', s),
    media: qs('.coachhead__photo', s) || qs('.strip__photo', s) || qs('.sh-media', s) || qs('.csheet__photo', s),
    title: qs('.coachhead__cls b', s) || qs('.sh-title', s)
  };
}
function settle(t, done) {
  var fin = function () { try { done(); } catch (e) {} };
  try { t.finished.then(fin, fin); } catch (e) { fin(); }
  try { if (t.ready) { t.ready.catch(function () {}); } } catch (e) {}
  try { if (t.updateCallbackDone) { t.updateCallbackDone.catch(function () {}); } } catch (e) {}
}
function openVia(src, fn) {
  var p = (!VT.busy && vtOk()) ? partsOf(src, false) : null;
  VT.src = src;
  if (!p) { fn(); return; }
  /* phones: only the poster or title is shared and the sheet slides up on its own (no container ghost); desktop: container transform */
  var m = !mqDesk.matches, scrim = qs('#sheet .sheet__scrim');
  VT.busy = true;
  p.media = inner(p.media, m);
  if (!m) { nameIt(p.box, 'ef-sheet'); }
  nameIt(p.media, 'ef-media'); nameIt(p.title, 'ef-title');
  root.classList.add('vt-run');
  if (m) { root.classList.add('vt-m'); }
  var s = null, t;
  var clear = function () { if (s) { nameIt(s.panel, ''); nameIt(s.media, ''); nameIt(s.title, ''); } nameIt(scrim, ''); root.classList.remove('vt-run'); root.classList.remove('vt-m'); VT.busy = false; };
  try {
    t = d.startViewTransition(function () {
      nameIt(p.box, ''); nameIt(p.media, ''); nameIt(p.title, '');
      fn();
      s = sheetParts();
      s.media = inner(s.media, m);
      if (EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen()) {
        nameIt(s.panel, 'ef-sheet');
        if (m) { nameIt(scrim, 'ef-scrim'); }
        if (p.media && s.media) { nameIt(s.media, 'ef-media'); }
        if (p.title && s.title && textOf(s.title) === textOf(p.title)) { nameIt(s.title, 'ef-title'); }
      }
    });
  } catch (e) {
    nameIt(p.box, ''); nameIt(p.media, ''); nameIt(p.title, '');
    clear();
    if (!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen())) { fn(); }
    return;
  }
  settle(t, clear);
}
function closeVia() {
  if (VT.busy || !vtOk() || !VT.src || !EF.sheet || !EF.sheet.isOpen()) { return false; }
  var kind = EF.sheet.kind();
  var p = partsOf(VT.src, true);
  if (!p) { return false; }
  var m = !mqDesk.matches, s = sheetParts(), scrim = qs('#sheet .sheet__scrim');
  s.media = inner(s.media, m); p.media = inner(p.media, m);
  var useMedia = (kind === 'class' || kind === 'details' || kind === 'coach') && p.media && s.media;
  var useTitle = kind === 'class' && p.title && s.title && textOf(s.title) === textOf(p.title);
  if (!m && !useMedia) { return false; }   /* a fading panel would show the page through the coach portrait (faces rule) */
  VT.busy = true;
  nameIt(s.panel, 'ef-sheet'); if (m) { nameIt(scrim, 'ef-scrim'); }
  if (useMedia) { nameIt(s.media, 'ef-media'); } if (useTitle) { nameIt(s.title, 'ef-title'); }
  root.classList.add('vt-run');
  if (m) { root.classList.add('vt-m'); }
  var q = null, t;
  var clear = function () { if (q) { nameIt(q.box, ''); nameIt(q.media, ''); nameIt(q.title, ''); } root.classList.remove('vt-run'); root.classList.remove('vt-m'); VT.busy = false; };
  try {
    t = d.startViewTransition(function () {
      nameIt(s.panel, ''); nameIt(s.media, ''); nameIt(s.title, ''); nameIt(scrim, '');
      EF.sheet.close();
      q = partsOf(VT.src, true);
      if (q) { q.media = inner(q.media, m); }
      if (q) { if (!m) { nameIt(q.box, 'ef-sheet'); } if (useMedia) { nameIt(q.media, 'ef-media'); } if (useTitle) { nameIt(q.title, 'ef-title'); } }
    });
  } catch (e) {
    nameIt(s.panel, ''); nameIt(s.media, ''); nameIt(s.title, ''); nameIt(scrim, '');
    clear();
    return false;
  }
  settle(t, clear);
  return true;
}
/* the sheet's close button and scrim: morph back into the source when it is on screen (capture runs before booking.js) */
d.addEventListener('click', function (e) {
  var t = e.target && e.target.closest ? e.target.closest('#sheet [data-sheet-close]') : null;
  if (!t) { return; }
  if (closeVia()) { e.stopPropagation(); e.preventDefault(); }
}, true);

var INSHEET = '.find-row, .find-chip, .find-next, .jtile';
d.addEventListener('click', function (e) {
  if (VT.inner || VT.busy || !vtOk() || !EF.sheet || !EF.sheet.isOpen || !EF.sheet.isOpen()) { return; }
  var t = e.target && e.target.closest ? e.target.closest(INSHEET) : null;
  if (!t || !t.closest('#sheet') || t.disabled || t.getAttribute('aria-disabled') === 'true') { return; }
  var tile = t.classList.contains('jtile'), sh = qs('#sheet');
  var from = tile ? qs('.coachhead__photo', sh) : qs('.find-row__name, .find-chip__name, .find-next__cls', t);
  if (!from) { return; }
  e.stopImmediatePropagation(); e.preventDefault();
  VT.busy = true; root.classList.add('vt-run'); root.classList.add('vt-in');
  nameIt(from, tile ? 'ef-media' : 'ef-title');
  var to = null, tr;
  var done = function () { nameIt(from, ''); nameIt(to, ''); VT.busy = false; root.classList.remove('vt-run'); root.classList.remove('vt-in'); };
  try {
    tr = d.startViewTransition(function () {
      nameIt(from, '');
      VT.inner = true; try { t.click(); } finally { VT.inner = false; }
      to = tile ? qs('.strip__photo', sh) : qs('.coachhead__cls b', sh);
      if (to && (tile || textOf(to) === textOf(from))) { nameIt(to, tile ? 'ef-media' : 'ef-title'); } else { to = null; }
    });
  } catch (err) { done(); VT.inner = true; try { t.click(); } finally { VT.inner = false; } return; }
  settle(tr, done);
}, true);

function openOcc(id, opts, src) {
  if (!EF.booking || !EF.booking.open || !id) { return; }
  openVia(src || { type: 'occ', occ: id }, function () { EF.booking.open(id, opts || {}); });
}

/* ---------- data binding ---------- */
function bindStatic() {
  var p = DATA.passes, c = DATA.club;
  var drop = p['class-1'] || p.class1 || null;
  var prices = { day: p.day && p.day.price_idr, 'class-1': drop && drop.price_idr, duo: p.duo.price_idr, 'duo-total': p.duo.price_idr * (p.duo.people || 2), 'duo-old': p.duo.old_price_idr, recharge_day: p.recharge_day.price_idr };
  qsa('[data-price]').forEach(function (el) { var v = prices[el.getAttribute('data-price')]; if (v) { el.textContent = EF.api.k(v); } });
  qsa('[data-bind="weekly-count"]').forEach(function (el) { el.textContent = EF.api.weeklyCount(); });
  var types = {}; (DATA.classes || []).forEach(function (k) { types[k.id] = 1; });
  qsa('[data-bind="type-count"]').forEach(function (el) { var n = Object.keys(types).length; if (n) { el.textContent = n; } });
  qsa('[data-bind="coach-count"]').forEach(function (el) { var n = (DATA.coaches || []).length; if (n) { el.textContent = n; } });
  bindRating();
  qsa('[data-bind="weekend-note"]').forEach(function (el) { el.textContent = DATA.timetable.weekend_note; });
  qsa('[data-bind="address"]').forEach(function (el) { el.textContent = c.address; });
  qsa('[data-bind="wa-link"]').forEach(function (el) { el.textContent = c.whatsapp.number; el.href = 'https://wa.me/' + c.whatsapp.wa; });
}

/* =====================================================================
   Hero panels: vertical stack (phones, tablets) and horizontal accordion with spotlight (>= 1200 px)
   ===================================================================== */
var panelsBox, panels = [], hoverTimer = 0;
function setPanel(fid, user) {
  panels.forEach(function (p) {
    var on = p.getAttribute('data-family') === fid;
    p.classList.toggle('is-open', on);
    var hit = qs('.panel__hit', p), more = qs('.panel__more', p);
    hit.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (mqWide.matches && on) { hit.setAttribute('aria-disabled', 'true'); } else { hit.removeAttribute('aria-disabled'); }
    if (more) { if (on) { more.removeAttribute('inert'); } else { more.setAttribute('inert', ''); } }
  });
  emit('ef:panel', { family: fid, user: !!user });
}
/* the panel stack never animates its layout (MOTION-BRIEF rule 7): a user change happens in one frame inside a View Transition,
   which cross-dissolves the two states on the compositor. No box is clipped or stretched, so no face is ever cut mid-change. */
function swapPanel(fid) {
  if (!vtOk() || VT.busy) { setPanel(fid, true); return; }
  VT.busy = true; root.classList.add('vt-panels');
  var t;
  try { t = d.startViewTransition(function () { setPanel(fid, true); }); }
  catch (e) { VT.busy = false; root.classList.remove('vt-panels'); setPanel(fid, true); return; }
  settle(t, function () { VT.busy = false; root.classList.remove('vt-panels'); });
}
function nextOfFamily(fid) {
  var found = null;
  EF.api.week().some(function (day) { return day.occs.some(function (o) { if (!o.past && o.familyId === fid) { found = o; return true; } return false; }); });
  return found;
}
function heroNext() {
  panels.forEach(function (p) {
    var fid = p.getAttribute('data-family'), fam = EF.api.family(fid);
    if (!fam) { return; }
    var lvl = qs('[data-bind="level-line"]', p);
    if (lvl) { lvl.textContent = fam.level_line; }   /* the section's one Sample marker is the hero foot line */
    var nx = nextOfFamily(fid), el = qs('[data-bind="family-next"]', p);
    if (el) { el.textContent = nx ? 'Next: ' + dayPhrase(nx) + ' at ' + nx.time : fam.level_line; }
    var list = qs('[data-panel-classes]', p);
    if (!list) { return; }
    list.innerHTML = EF.api.classesInFamily(fid).map(function (c) {
      var o = EF.api.occ(c.id);
      if (!o) { return ''; }
      var st = o.booking && !o.booking.waitlist ? "You're booked" : (o.booking ? 'On the waitlist' : spotsText(o));
      return '<li><button class="pclass" type="button" data-open-occ="' + esc(o.id) + '" data-fam="' + esc(fid) + '">' +
        '<span><span class="pclass__name" data-vt-title>' + esc(c.name) + '</span><span class="pclass__sub">' + esc(dayWord(o) + ' ' + o.time + ' · ' + st) + '</span></span>' +
        '<span class="pclass__go" aria-hidden="true">→</span></button></li>';
    }).join('');
  });
}
function initPanels() {
  panelsBox = qs('[data-panels]');
  if (!panelsBox) { return; }
  panels = qsa('.panel', panelsBox);
  panels.forEach(function (p) {
    var fid = p.getAttribute('data-family'), hit = qs('.panel__hit', p);
    hit.addEventListener('click', function () {
      if (mqWide.matches) { if (!p.classList.contains('is-open')) { swapPanel(fid); } return; }
      var opening = !p.classList.contains('is-open');
      swapPanel(opening ? fid : '');
      if (opening) {
        w.setTimeout(function () {
          var r = p.getBoundingClientRect(), bottom = (w.innerHeight || 0) - (mqDesk.matches ? 0 : 70);
          if (r.top < 0 || r.bottom > bottom) { try { p.scrollIntoView({ block: r.height > bottom ? 'start' : 'nearest', behavior: motionOn() ? 'smooth' : 'auto' }); } catch (e) {} }
        }, 400);
      }
    });
    p.addEventListener('mouseenter', function () {
      if (!mqWide.matches || !mqHover.matches) { return; }
      panelsBox.classList.add('is-spot');
      w.clearTimeout(hoverTimer);
      hoverTimer = w.setTimeout(function () { if (!p.classList.contains('is-open')) { swapPanel(fid); } }, 70);
    });
    p.addEventListener('focusin', function () {
      if (!mqWide.matches) { return; }
      panelsBox.classList.add('is-spot');
      if (!p.classList.contains('is-open')) { setPanel(fid, true); }
    });
  });
  panelsBox.addEventListener('mouseleave', function () { w.clearTimeout(hoverTimer); panelsBox.classList.remove('is-spot'); });
  panelsBox.addEventListener('focusout', function (e) { if (!panelsBox.contains(e.relatedTarget)) { panelsBox.classList.remove('is-spot'); } });
  panelsBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open-occ]');
    if (b) { var id = b.getAttribute('data-open-occ'); openOcc(id, duoOpts(), { type: 'pclass', occ: id }); }
  });
  var open = qs('.panel.is-open', panelsBox);
  setPanel(open ? open.getAttribute('data-family') : 'boxing', false);
  var lastWide = mqWide.matches;
  w.addEventListener('resize', function () {
    if (mqWide.matches !== lastWide) {
      lastWide = mqWide.matches;
      var cur = qs('.panel.is-open', panelsBox);
      setPanel(cur ? cur.getAttribute('data-family') : 'boxing', false);
    }
  });
  heroNext();
}

/* ---------- visitor switch: off the page since ruling 29 (Raoul: "Don't understand this, remove"); nothing calls it ---------- */
var NOTES = { first: '', returning: '' };
function setVisitor(v, save) {
  var note = qs('[data-visitor-note]'), seg = qs('[data-seg]');
  if (note && !NOTES.first) { NOTES.first = note.textContent.trim(); NOTES.returning = note.getAttribute('data-note-returning') || ''; }
  qsa('[data-visitor]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-visitor') === v ? 'true' : 'false'); });
  if (seg) { seg.setAttribute('data-on', v); seg.classList.add('has-ind'); }
  if (note) { note.textContent = NOTES[v] || NOTES.first; }
  if (save) { storeSet({ visitor: v }); emit('ef:visitor', { visitor: v }); }
}
function initVisitor() {
  setVisitor(store().visitor === 'returning' ? 'returning' : 'first', false);
  qsa('[data-visitor]').forEach(function (b) { b.addEventListener('click', function () { setVisitor(b.getAttribute('data-visitor'), true); }); });
}

/* =====================================================================
   Next up: three ticket cards
   ===================================================================== */
var nextBox;
function ticketHtml(o, i) {
  var bk = o.booking && !o.booking.waitlist, clip = CLIPS[o.familyId];
  var when = o.dayIndex < 2 ? dayWord(o) + ' · ' + EF.api.dateShort(o.ymd).replace(/^\w+ /, '') : EF.api.dateShort(o.ymd);
  return '<button class="ticket' + (bk ? ' is-booked' : '') + '" type="button" data-testid="next-card" data-occ="' + esc(o.id) + '" style="--t:' + i + '">' +
    (clip ? '<span class="ticket__clip' + (clip.still ? ' ticket__clip--still' : '') + '" aria-hidden="true"><img class="media__poster" src="' + clip.p + '" alt="" width="' + clip.w + '" height="' + clip.h + '" loading="lazy" decoding="async">' +
      (clip.still ? '' : '<video data-clip data-group="next" muted loop playsinline preload="none" src="' + clip.v + '" aria-hidden="true"></video>') + '</span>' : '') +
    '<span class="ticket__top">' + (i === 0 ? '<span class="live">Next</span>' : '') + '<span class="ticket__day">' + esc(when) + '</span><span class="ticket__go">' + (bk ? 'View' : 'Book') + ' <span class="arr" aria-hidden="true">→</span></span></span>' +
    '<span class="ticket__when"><span class="ticket__time">' + esc(o.time) + '</span></span>' +
    '<span class="ticket__main"><span class="ticket__name" data-vt-title>' + esc(o.cls.name) + '</span>' +
    '<span class="who">' + avImg(o.coach, 28, '28px', ' loading="lazy" data-vt-coach') + 'with ' + esc(o.coach.name) + '</span>' +
    '<span class="ticket__meta">' + o.cls.length_min + ' min · ' + esc(o.cls.level) + (clip && clip.stock ? ' · Stock clip' : '') + '</span></span>' +
    '<span class="ticket__foot">' + (bk ? '<span class="spots">You\'re booked</span>' : seatsHtml(o)) +
    (i === 0 ? '<span class="sample">Sample</span>' : '') + '</span></button>';
}
function renderNext() {
  nextBox = nextBox || qs('[data-nextup]');
  if (!nextBox) { return; }
  if (!nextBox.__wired) {
    nextBox.__wired = true;
    nextBox.addEventListener('click', function (e) {
      var c = e.target.closest ? e.target.closest('[data-testid="next-card"]') : null;
      if (c) { var id = c.getAttribute('data-occ'); openOcc(id, duoOpts(), { type: 'occ', occ: id, prefer: 'ticket' }); }
    });
  }
  var list = EF.api.upcoming(3);
  if (!list.length) { nextBox.innerHTML = '<p class="tickets__loading">No classes left this week. New dates appear every day.</p>'; return; }
  nextBox.innerHTML = list.map(ticketHtml).join('');
  if (nextBox.classList.contains('m-in') && EF.motion) { EF.motion.fillMeters(nextBox); }
  if (EF.media && EF.media.scan) { EF.media.scan(nextBox); }
  var ctl = qs('[data-pause="next"]');
  if (ctl) { ctl.hidden = !qs('video[data-clip]', nextBox); }
}
/* class-specific entries carry no pass: the Duo shortcut lives in the engine's finder now (RULINGS #36) */
function duoOpts() { return {}; }

/* =====================================================================
   Schedule: sticky date bar, chips, filters, rows
   ===================================================================== */
var S = { day: 0, family: '', coaches: [], times: [], levels: [] };
var sched = {};
var TIMES = [
  { id: 'morning', name: 'Morning, before 12:00', test: function (t) { return t < '12:00'; } },
  { id: 'afternoon', name: 'Afternoon, from 12:00', test: function (t) { return t >= '12:00' && t < '17:00'; } },
  { id: 'evening', name: 'Evening, from 17:00', test: function (t) { return t >= '17:00'; } }
];
var LEVELS = [{ id: 'beginner', name: 'Beginner' }, { id: 'advanced', name: 'Advanced' }, { id: 'all', name: 'All levels' }];
function matches(o, f) {
  if (f.family && o.familyId !== f.family) { return false; }
  if (f.coaches.length && f.coaches.indexOf(o.coachId) < 0) { return false; }
  if (f.times.length && !TIMES.some(function (t) { return f.times.indexOf(t.id) > -1 && t.test(o.time); })) { return false; }
  if (f.levels.length && f.levels.indexOf(o.cls.level_key) < 0) { return false; }
  return true;
}
function filterCount(f) { return (f.family ? 1 : 0) + f.coaches.length + f.times.length + f.levels.length; }
function copyF(f) { return { day: f.day, family: f.family, coaches: f.coaches.slice(), times: f.times.slice(), levels: f.levels.slice() }; }
function dayRows(i, f) { var day = EF.api.week()[i]; return day ? day.occs.filter(function (o) { return matches(o, f); }) : []; }

function renderDays() {
  var wk = EF.api.week(), booked = {};
  (store().bookings || []).forEach(function (b) { if (!b.waitlist) { booked[b.ymd] = true; } });
  sched.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (booked[day.ymd] ? ' has-booking' : '') + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
      '<span class="day__dow">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span><span class="day__num">' + day.dayNum + '</span>' +
      '<span class="vh">, ' + esc(day.long + ', ' + plural(day.occs.length, 'class', 'classes') + (booked[day.ymd] ? ', you have a booking' : '')) + '</span><span class="day__dot" aria-hidden="true"></span></button>';
  }).join('');
  sched.days.classList.add('has-ind');
  moveInd();
}
function moveInd() {
  var ind = qs('.days__ind', sched.days), btn = qs('[data-day="' + S.day + '"]', sched.days);
  if (!ind || !btn) { return; }
  ind.style.setProperty('--w', btn.offsetWidth + 'px');
  ind.style.setProperty('--x', btn.offsetLeft + 'px');
}
function selectDay(i, focus) {
  var dir = i > S.day ? 1 : (i < S.day ? -1 : 0);
  S.day = i;
  qsa('.day', sched.days).forEach(function (b) {
    var on = +b.getAttribute('data-day') === i;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
    if (on && focus) { b.focus(); }
  });
  moveInd();
  renderRows(dir ? 'day' : 'filter', dir);
}
function rowHtml(o, i) {
  var bk = o.booking, mine = bk && !bk.waitlist, label = o.cls.name + ', ' + o.time + ' with ' + o.coach.name + '. ' + (mine ? "You're booked" : (bk ? 'On the waitlist' : spotsText(o))) + '. See details';
  var act;
  if (o.past) { act = '<span class="row__label">Finished</span>'; }
  else if (mine) { act = '<button class="rbtn rbtn--booked" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="Booked: ' + esc(o.cls.name + ' ' + o.time) + '">' + CHECK + 'Booked</button>'; }
  else if (bk) { act = '<button class="rbtn rbtn--wait" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="On the list: ' + esc(o.cls.name + ' ' + o.time) + '">On the list</button>'; }
  else if (o.full) { act = '<button class="rbtn rbtn--wait" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Join waitlist for ' + o.cls.name + ' at ' + o.time) + '">Join waitlist</button>'; }
  else { act = '<button class="rbtn" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Book ' + o.cls.name + ' at ' + o.time) + '">Book</button>'; }
  var spots = o.past ? '' : (mine ? "<span>You're booked</span>" : (bk ? '<span>On the waitlist</span>' : seatsHtml(o)));
  return '<li class="row' + (o.past ? ' is-past' : '') + (mine ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '"' + (o.past ? ' data-past' : '') + ' style="--r:' + (i || 0) + '">' +
    (o.past ? '' : '<button class="row__hit" type="button" data-open="' + esc(o.id) + '" aria-label="' + esc(label) + '"></button>') +
    '<div class="row__when"><span class="row__time">' + esc(o.time) + '</span><span class="row__len">' + o.cls.length_min + ' min</span></div>' +
    '<p class="row__name" data-vt-title>' + esc(o.cls.name) + '</p>' +
    '<p class="row__by">' + avImg(o.coach, 28, '28px', ' loading="lazy" data-vt-coach') + '<span>' + esc(o.coach.name) + ' · ' + esc(o.cls.level) + '</span></p>' +
    '<p class="row__spots">' + spots + '</p>' +
    '<div class="row__act">' + act + '</div></li>';
}
function animateRows(mode, dir, before) {
  if (!motionOn() || !w.Element || !Element.prototype.animate) { return; }
  qsa('.row', sched.rows).forEach(function (r, i) {
    var id = r.getAttribute('data-occ'), old = before[id];
    try {
      if (mode === 'day') {
        r.animate([{ opacity: 0, transform: 'translateX(' + (dir * 28) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: i * 26, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      } else if (old !== undefined) {
        var dy = old - r.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) { r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
      } else {
        r.animate([{ opacity: 0, transform: 'translateY(10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: 40 + i * 24, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      }
    } catch (e) {}
  });
}
/* P22 (Raoul 29 Oct: "Add the schedule in section 1 immediately, well visible and easy to understand what classes take place on what day").
   Desktop: the seven days side by side, today first (the app's rolling week, the same order as the day selector), each class a compact
   chip with time, class, coach and its seat row; a tap opens the sheet. Phones keep the day selector and that day's list. One timetable. */
function chipHtml(o, day) {
  var bk = o.booking, mine = bk && !bk.waitlist;
  var st = o.past ? '<span class="wchip__st">Finished</span>' : (mine ? '<span class="wchip__st">' + CHECK + "You're booked</span>" : (bk ? '<span class="wchip__st">On the waitlist</span>' : seatsHtml(o)));
  var inner = '<span class="wchip__time">' + esc(o.time) + '</span><span class="vh">, ' + esc(day.long) + ', </span><span class="wchip__name" data-vt-title>' + esc(o.cls.name) + '</span><span class="wchip__by">' + esc(o.coach.name) + '</span>' + st;
  return '<li class="wcell' + (o.past ? ' is-past' : '') + (mine ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '"' + (o.past ? ' data-past' : '') + '>' +
    (o.past ? '<span class="wchip">' + inner + '</span>' : '<button class="wchip' + (o.full && !bk ? ' is-full' : '') + '" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-haspopup="dialog">' + inner + '</button>') + '</li>';
}
function renderGrid() {
  var wk = EF.api.week(), total = 0;
  sched.grid.innerHTML = wk.map(function (day, i) {
    var list = dayRows(i, S);
    total += list.length;
    return '<section class="wcol' + (day.isToday ? ' is-today' : '') + '" aria-labelledby="wcol-' + i + '" style="--c:' + i + '">' +
      '<h3 class="wcol__h" id="wcol-' + i + '"><span class="wcol__dow">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span> <span class="wcol__date">' + esc(EF.api.dateShort(day.ymd).replace(/^\w+ /, '')) + '</span></h3>' +
      (list.length ? '<ol class="wcol__list">' + list.map(function (o) { return chipHtml(o, day); }).join('') + '</ol>' : '<p class="wcol__none">No classes</p>') + '</section>';
  }).join('');
  sched.title.textContent = 'This week';
  sched.count.textContent = '· ' + plural(total, 'class', 'classes');
  sched.empty.hidden = total > 0;
  sched.done.hidden = true;
  if (EF.motion && sched.grid.classList.contains('m-in')) { EF.motion.fillMeters(sched.grid); }
  renderBadge();
}
function renderRows(mode, dir) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day) { return; }
  var desk = mqDesk.matches && !!sched.grid;
  if (sched.grid) { sched.grid.hidden = !desk; }
  sched.rows.hidden = desk;
  if (sched.days) { sched.days.hidden = desk; }
  if (desk) { sched.rows.innerHTML = ''; renderGrid(); return; }
  if (sched.grid) { sched.grid.innerHTML = ''; }
  var list = dayRows(S.day, S), before = {};
  if (mode === 'filter') { qsa('.row', sched.rows).forEach(function (r) { before[r.getAttribute('data-occ')] = r.getBoundingClientRect().top; }); }
  sched.rows.innerHTML = list.map(rowHtml).join('');
  sched.empty.hidden = list.length > 0;
  sched.title.textContent = (day.isToday ? 'Today, ' : '') + day.long;
  sched.count.textContent = '· ' + plural(list.length, 'class', 'classes');
  var left = day.occs.filter(function (o) { return !o.past; }).length;
  if (day.isToday && day.occs.length && !left) {
    var tmr = wk[1] && wk[1].occs[0];
    sched.done.textContent = "That's today done." + (tmr ? ' Tomorrow starts at ' + tmr.time + ' with ' + tmr.cls.name + '.' : '');
    sched.done.hidden = false;
  } else { sched.done.hidden = true; }
  if (mode === 'day' || mode === 'filter') { animateRows(mode, dir || 0, before); }
  if (EF.motion && (sched.rows.classList.contains('m-in') || mode === 'day' || mode === 'filter')) { EF.motion.fillMeters(sched.rows); }
  renderBadge();
}
function renderBadge() {
  var n = filterCount(S), b = sched.badge;
  if (b) {
    var before = b.textContent;
    b.textContent = n; b.hidden = n === 0;
    if (String(n) !== before && n > 0 && motionOn()) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  }
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
    rows: qs('[data-rows]', box), empty: qs('[data-empty]', box), bar: qs('[data-datebar]', box), grid: qs('[data-wgrid]', box)
  };
  if (sched.grid) { sched.grid.setAttribute('data-m', 'meters'); }
  sched.rows.id = 'sched-rows';
  sched.rows.setAttribute('data-m', 'meters');
  S.day = firstOpenDay();
  renderDays();
  renderRows('none');
  sched.days.addEventListener('click', function (e) { var b = e.target.closest('.day'); if (b) { selectDay(+b.getAttribute('data-day')); } });
  sched.days.addEventListener('keydown', function (e) {
    var k = e.key, n = EF.api.week().length, i = S.day;
    if (k === 'ArrowRight') { i = (i + 1) % n; } else if (k === 'ArrowLeft') { i = (i - 1 + n) % n; } else if (k === 'Home') { i = 0; } else if (k === 'End') { i = n - 1; } else { return; }
    e.preventDefault(); selectDay(i, true);
  });
  sched.chips.addEventListener('click', function (e) {
    var c = e.target.closest('.fchip'); if (!c) { return; }
    S.family = c.getAttribute('data-fam') || '';
    renderRows('filter');
  });
  [sched.rows, sched.grid].forEach(function (el) {
    if (!el) { return; }
    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book], [data-open]');
      if (t) { var id = t.getAttribute('data-book') || t.getAttribute('data-open'); openOcc(id, duoOpts(), { type: 'occ', occ: id, prefer: 'row' }); }
    });
  });
  var lastDesk = mqDesk.matches;
  w.addEventListener('resize', function () { if (mqDesk.matches !== lastDesk) { lastDesk = mqDesk.matches; renderRows('none'); } });
  qsa('[data-clear-filters]').forEach(function (b) { b.addEventListener('click', function () { S.family = ''; S.coaches = []; S.times = []; S.levels = []; renderRows('filter'); }); });
  var fb = qs('[data-open-filters]', box);
  if (fb) { fb.addEventListener('click', function () { if (EF.sheet && EF.sheet.open) { openVia({ type: 'el', el: fb }, function () { EF.sheet.open('filters', {}, '?view=filters'); }); } }); }
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(moveInd, 120); });
  /* docked state of the sticky date bar */
  var sent = qs('[data-dock-sentinel]', box);
  if (sent && sched.bar && 'IntersectionObserver' in w) {
    var mk = function () {
      if (mk.io) { mk.io.disconnect(); }
      var top = parseFloat(w.getComputedStyle(sched.bar).top) || 0;   /* under the pinned Now bar (and the desktop app bar) */
      mk.io = new w.IntersectionObserver(function (es) { var e = es[0]; sched.bar.classList.toggle('is-docked', !e.isIntersecting && e.boundingClientRect.top < top + 2); }, { rootMargin: '-' + top + 'px 0px 0px 0px', threshold: 0 });
      mk.io.observe(sent);
      /* the end of the week: once the date bar would be pushed up under the pinned chrome, it steps out instead of sliding under it */
      var end = qs('[data-dock-end]', box);
      if (end) {
        if (mk.eo) { mk.eo.disconnect(); }
        var lim = top + (sched.bar.offsetHeight || 0);
        mk.eo = new w.IntersectionObserver(function (es) { var e = es[0]; sched.bar.classList.toggle('is-leaving', !e.isIntersecting && e.boundingClientRect.top < lim + 2); }, { rootMargin: '-' + Math.round(lim) + 'px 0px 0px 0px', threshold: 0 });
        mk.eo.observe(end);
      }
    };
    mk();
    if (mqDesk.addEventListener) { mqDesk.addEventListener('change', mk); }
  }
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
    try { sec.focus({ preventScroll: true }); } catch (e) {}
  },
  state: function () { return copyF(S); }
};

function registerFilters() {
  if (!EF.sheet || !EF.sheet.register) { return; }
  EF.sheet.register('filters', function () {
    var F = copyF(S);
    return {
      label: 'Filters', progress: null, testid: 'step-filters',
      render: function (body, foot) {
        var fams = DATA.families, coaches = DATA.coaches;
        function tog(group, id, name, on, img) {
          return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? avImg(img, 26, '26px', '') : '') + esc(name) + '</button>';
        }
        body.innerHTML = '<div data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">For ' + esc(EF.api.week()[S.day].long) + '.</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="opts">' + tog('family', '', 'All classes', !F.family) + fams.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="opts">' + coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Time of day</legend><div class="opts">' + TIMES.map(function (t) { return tog('times', t.id, t.name, F.times.indexOf(t.id) > -1); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Level</legend><div class="opts">' + LEVELS.map(function (l) { return tog('levels', l.id, l.name, F.levels.indexOf(l.id) > -1); }).join('') + '</div></fieldset>' +
          '</div>';
        foot.innerHTML = '<div class="foot-row"><button class="btn btn--outline btn--sm" type="button" data-testid="filters-clear" data-fclear>Clear all</button>' +
          '<button class="btn btn--primary" type="button" data-testid="filters-apply" data-fapply></button></div>';
        var apply = qs('[data-fapply]', foot);
        function sync() {
          qsa('.tog', body).forEach(function (b) {
            var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
            b.setAttribute('aria-pressed', (g === 'family' ? F.family === v : F[g].indexOf(v) > -1) ? 'true' : 'false');
          });
          apply.innerHTML = 'Show ' + plural(dayRows(S.day, F).length, 'class', 'classes') + ' <span class="arr" aria-hidden="true">→</span>';
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
          EF.sheet.close();
          renderRows('filter');
        });
        sync();
      }
    };
  });
}

/* =====================================================================
   Coaches
   ===================================================================== */
function teaches(id) {
  var names = [];
  DATA.classes.forEach(function (c) { if (c.coach === id && names.indexOf(c.name) < 0) { names.push(c.name); } });
  if (names.length < 2) { return names.join(''); }
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}
function renderCoaches() {
  var box = qs('[data-coaches]');
  if (!box) { return; }
  box.innerHTML = DATA.coaches.map(function (c) {
    var nx = EF.api.coachOccs(c.id)[0];
    return '<button class="coach" type="button" data-testid="coach-' + esc(c.id) + '" data-coach="' + esc(c.id) + '">' +
      '<span class="coach__photo"><img src="' + esc(c.photo) + '" alt="' + esc(c.name + ', coach at Elite Fit') + '" width="600" height="750" loading="lazy" decoding="async"></span>' +
      '<span class="coach__text"><span class="coach__name">' + esc(c.name) + '</span>' +
      '<span class="coach__role">' + esc(c.role || ('Teaches ' + teaches(c.id))) + '</span>' +
      (nx ? '<span class="coach__next"><span class="status__dot" aria-hidden="true"></span>Next: ' + esc(dayPhrase(nx) + ' at ' + nx.time) + '</span>' : '') +
      '<span class="coach__count">' + plural(EF.api.coachWeekly(c.id), 'class', 'classes') + ' a week</span>' +
      '<span class="coach__link"><span>Meet ' + esc(c.name) + '</span> <span class="arr" aria-hidden="true">→</span></span></span></button>';
  }).join('');
  if (!box.__wired) {
    box.__wired = true;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-coach]');
      if (b && EF.booking && EF.booking.openCoach) { var id = b.getAttribute('data-coach'); openVia({ type: 'coach', id: id }, function () { EF.booking.openCoach(id); }); }
    });
  }
  if (EF.motion && EF.motion.scan) { EF.motion.scan(box); }
}

/* =====================================================================
   App chrome: tab bar, desktop nav scroll-spy, header CTA, badges, open status
   ===================================================================== */
var TABS = ['classes', 'schedule', 'coaches', 'visit'];
var chrome = { tab: '', pastHero: false, sheet: false, typing: false, blocked: {} };
function setTab(tab) {
  if (!tab || tab === chrome.tab) { return; }
  chrome.tab = tab;
  qsa('[data-tab-link]').forEach(function (a) { if (a.getAttribute('data-tab-link') === tab) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); } });
  moveTabInd();
  moveNav();
}
/* indicators never read layout while the page scrolls (0 forced layouts): the tab bar's four equal columns are computed from the
   viewport width; the desktop nav links are measured once (fonts ready, resize) and cached */
var NAVGEO = {}, VW = 0;   /* the viewport width, read once and on resize: reading it on a phone mid-scroll forces a layout */
function measureNav() {
  var nav = qs('[data-segnav]');
  if (!nav || w.getComputedStyle(nav).display === 'none') { return; }
  qsa('[data-tab-link]', nav).forEach(function (a) { NAVGEO[a.getAttribute('data-tab-link')] = [a.offsetLeft, a.offsetWidth]; });
}
function moveTabInd() {
  var bar = qs('[data-tabbar]'), i = TABS.indexOf(chrome.tab);
  if (!bar || i < 0 || mqDesk.matches) { return; }
  if (!VW) { VW = w.innerWidth || 0; }
  var col = (VW - 16 - (bar.classList.contains('has-book') ? 166 : 0)) / 4;
  bar.style.setProperty('--tx', (8 + i * col).toFixed(1) + 'px');
  bar.style.setProperty('--tw', col.toFixed(1) + 'px');
  bar.classList.add('has-active');
}
function moveNav() {
  var nav = qs('[data-segnav]'), g = NAVGEO[chrome.tab], ind = nav && qs('.segnav__ind', nav);
  if (!ind || !g || !g[1]) { return; }
  ind.style.setProperty('--w', g[1] + 'px');
  ind.style.setProperty('--x', g[0] + 'px');
  nav.classList.add('has-active');
}
function bookingCount() {
  var nowMs = EF.api.now();
  return (store().bookings || []).filter(function (b) {
    if (b.waitlist) { return false; }
    var o = EF.api.occById ? EF.api.occById(b.occId) : null;
    return o ? o.start > nowMs : false;
  }).length;
}
function renderTabBadge() {
  var b = qs('[data-tab-badge]');
  if (!b) { return; }
  var n = bookingCount(), before = b.getAttribute('data-n') || '0';
  b.setAttribute('data-n', String(n));
  b.innerHTML = n ? n + '<span class="vh"> ' + (n === 1 ? 'booking' : 'bookings') + '</span>' : '';
  b.hidden = !n;
  if (n && String(n) !== before && motionOn()) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
}
/* the sticky bar (Raoul 28 Oct: on phones and desktop, quote + Google line + pulsing Book). Phones: it joins the tab bar as one unit,
   the quote and rating strip above the tabs and the Book at the right end of the tab row. Desktop: a floating app card, and it
   replaces the header CTA. It shows only once the hero Book, the hero rating, the hero quote and the desktop trust row have all
   scrolled away above, never over the +1 offer or the footer, never with a sheet open or a page field focused. */
function applyChrome() {
  var hdr = qs('#hdr'), cta = hdr && qs('.hdr__cta', hdr), bar = qs('[data-tabbar]'), dock = qs('[data-buybar]');
  var onDock = chrome.pastHero && !chrome.blocked.offer && !chrome.blocked.footer && !chrome.sheet && !chrome.typing;
  if (hdr) { hdr.classList.remove('cta-on'); }
  if (cta) { cta.tabIndex = -1; cta.setAttribute('aria-hidden', 'true'); }
  if (dock && dock.classList.contains('is-on') !== onDock) {
    dock.classList.toggle('is-on', onDock);
    dock.setAttribute('aria-hidden', onDock ? 'false' : 'true');
    var btn = qs('.dock__btn', dock);
    if (btn) { btn.tabIndex = onDock ? 0 : -1; if (!onDock && d.activeElement === btn) { btn.blur(); } }
    var fa = d.activeElement;
    if (onDock && fa && fa !== d.body && fa.matches && fa.matches(':focus-visible')) { w.setTimeout(function () { if (d.activeElement === fa) { keepFocusVisible({ target: fa }); } }, 0); }
  }
  if (bar) {
    bar.classList.toggle('is-away', chrome.sheet);
    var onBook = onDock && !mqDesk.matches;
    if (bar.classList.contains('has-book') !== onBook) {
      bar.classList.toggle('has-book', onBook);
      moveTabInd();
    }
  }
}
function initChrome() {
  chrome.blocked = {};
  if ('IntersectionObserver' in w) {
    var spy = new w.IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { setTab(e.target.getAttribute('data-tab')); } });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    qsa('[data-tab]').forEach(function (s) { spy.observe(s); });
    var marks = [qs('[data-testid="hero-book"]'), qs('#top .trust'), qs('#top [data-hq]'), qs('[data-trust-badge]')].filter(Boolean), gone = [];
    if (marks.length) {
      /* a mark counts as gone once it has scrolled away above, or when it is not shown at this width */
      var mio = new w.IntersectionObserver(function (es) {
        es.forEach(function (e) { var k = marks.indexOf(e.target); gone[k] = e.target.hasAttribute('data-trust-badge') ? !e.isIntersecting : (!e.isIntersecting && e.boundingClientRect.bottom <= 0); });
        chrome.pastHero = marks.every(function (m, i) { return !!gone[i]; });
        applyChrome();
      });
      marks.forEach(function (m) { mio.observe(m); });
    }
    [['offer', '#plus-one'], ['footer', '#footer']].forEach(function (p) {
      var el = qs(p[1]);
      if (el) { new w.IntersectionObserver(function (es) { chrome.blocked[p[0]] = es[0].isIntersecting; applyChrome(); }, { rootMargin: '0px 0px -60px 0px' }).observe(el); }
    });
  }
  setTab('classes');
  qsa('[data-tab-link]').forEach(function (a) { a.addEventListener('click', function () { setTab(a.getAttribute('data-tab-link')); }); });
  d.addEventListener('ef:sheet', function (e) { chrome.sheet = !!(e.detail && e.detail.open); applyChrome(); });
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { chrome.typing = true; applyChrome(); } });
  d.addEventListener('focusout', function () { if (chrome.typing) { chrome.typing = false; applyChrome(); } });
  var dk = qs('[data-buybar]');
  if (dk) {
    /* the pulse pauses on hover and focus (CSS), and while the tab is hidden */
    d.addEventListener('visibilitychange', function () { dk.classList.toggle('is-idle', d.hidden); });
  }
  d.addEventListener('focusin', keepFocusVisible);
  /* the header's hairline: a sentinel at the very top, no scroll listener */
  var hdr = qs('#hdr'), top = qs('[data-top-sentinel]');
  if (hdr && top && 'IntersectionObserver' in w) { new w.IntersectionObserver(function (es) { hdr.classList.toggle('is-scrolled', !es[0].isIntersecting); }).observe(top); }
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { VW = w.innerWidth || 0; measureNav(); moveNav(); applyChrome(); moveTabInd(); }, 120); });
  VW = w.innerWidth || 0;
  measureNav();
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(function () { measureNav(); moveNav(); moveInd(); moveTabInd(); }); }
  applyChrome();
  renderTabBadge();
}
function openStatus() {
  var t = EF.api.wita(EF.api.now()), m = t.hh * 60 + t.mm, open = m >= 360 && m < 1320;
  var txt = open ? 'Open now · until 22:00' : 'Closed now · opens at 06:00';
  [['[data-open-status]', '[data-open-text]'], ['[data-open-status-big]', '[data-open-text-big]']].forEach(function (p) {
    var box = qs(p[0]), el = box && qs(p[1], box);
    if (!box || !el) { return; }
    el.textContent = p[0] === '[data-open-status]' ? (open ? 'Open now' : 'Closed now') : txt;
    box.classList.toggle('is-closed', !open);
    box.removeAttribute('data-wait');
  });
}

/* keyboard (and scripted) focus never ends up under the tab bar (bottom) or the docked date bar (top); taps are left alone */
/* a touch tap's focus and click arrive after pointerup, so the "pointer is down" flag holds until the click has landed:
   the page never scrolls under a finger between touch and click (that made row taps miss on WebKit) */
var pointerDown = false, pendingFocus = null, releaseT = 0;
d.addEventListener('pointerdown', function () { pointerDown = true; w.clearTimeout(releaseT); }, true);
function release() {
  pointerDown = false;
  if (pendingFocus) { var el = pendingFocus; pendingFocus = null; w.setTimeout(function () { if (d.activeElement === el) { keepFocusVisible({ target: el }); } }, 0); }
}
function pointerEnd(e) { w.clearTimeout(releaseT); releaseT = w.setTimeout(release, e && e.pointerType === 'touch' ? 450 : 0); }
d.addEventListener('pointerup', pointerEnd, true);
d.addEventListener('pointercancel', pointerEnd, true);
d.addEventListener('click', function () { if (pointerDown) { w.clearTimeout(releaseT); releaseT = w.setTimeout(release, 0); } }, true);
function keepFocusVisible(e) {
  var el = e.target;
  if (!el || !el.getBoundingClientRect || (EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen())) { return; }
  if (!qs('#page').contains(el) || (el.closest && el.closest('[data-tabbar], [data-buybar], .appbar'))) { return; }
  var inDock = !!(el.closest && el.closest('[data-datebar]'));
  if (pointerDown) { pendingFocus = el; return; }   /* a tap: adjust after the click lands, never under the finger */
  var r = el.getBoundingClientRect(), vh = w.innerHeight || 0, dy = 0;
  var bar = qs('[data-tabbar]'), bt = vh, dk = qs('[data-buybar]');
  if (bar && !bar.classList.contains('is-away') && w.getComputedStyle(bar).display !== 'none') { bt = bar.getBoundingClientRect().top; }
  if (dk && dk.classList.contains('is-on')) { bt = Math.min(bt, dk.getBoundingClientRect().top); }
  var top = 0, dbar = sched.bar, ap = qs('#hdr'), nb = qs('[data-nowbar]');
  if (nb) { top = Math.max(top, nb.getBoundingClientRect().bottom); }
  if (ap && w.getComputedStyle(ap).position === 'sticky') { top = Math.max(top, ap.getBoundingClientRect().bottom); }
  if (dbar && !inDock && dbar.classList.contains('is-docked')) { top = Math.max(top, dbar.getBoundingClientRect().bottom); }
  /* only controls: a programmatic target (an anchor's section, a heading with tabindex -1) or anything taller than the free area
     is left where the browser put it (a hash jump to #schedule used to be pushed 1,700 px down) */
  if (el.getAttribute('tabindex') === '-1' || r.height > (bt - top) * 0.8) { return; }
  if (r.bottom > bt - 8) { dy = r.bottom - bt + 16; }
  else if (r.top < top + 8) { dy = r.top - top - 16; }
  if (dy) {
    var de = d.documentElement, prev = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    w.scrollBy(0, dy);
    de.style.scrollBehavior = prev;
  }
}

/* sheet media crop: a 16:10 frame needs the landscape focus of the family, read from its panel */
function sheetFocus() {
  var m = /[?&]class=([^&#]+)/.exec(w.location.search), sh = qs('#sheet');
  if (!sh) { return; }
  var o = m ? EF.api.occ(decodeURIComponent(m[1])) : null, p = o && qs('.panel[data-family="' + o.familyId + '"]');
  var f = p ? (p.style.getPropertyValue('--focus-m') || '').trim() : '';
  if (f) { sh.style.setProperty('--focus-sheet', f); } else { sh.style.removeProperty('--focus-sheet'); }
}

/* ---------- actions ---------- */
/* engine-v2 binds the generic entries itself: [data-book-next] (hero, sticky bar) opens the class finder, [data-duo-start] the finder
   with the Duo pass (RULINGS #30, #36). The page keeps only its own "See … times" links. */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-filter-family]') : null;
    if (!t) { return; }
    e.preventDefault();
    EF.schedule.show({ family: t.getAttribute('data-filter-family') });
  });
}

/* ---------- P23 live "Now / Next" bar (Raoul 29 Oct: "Show as a minimal top bar what's running right now with a countdown timer
   running down, including name of class, icon and name of trainer and an animated background surface with a dark layover").
   Bali time from EF.api.now() (it keeps ticking from ?now=). Ticks every second, rolls over to the next class by itself.
   Screen readers: role="timer" text, updated once a minute. Tap = the next bookable session of that class (a class-specific entry). */
var NOW_ICON = {
  boxing: '<svg viewBox="0 0 24 24" focusable="false"><path d="M7.5 10V8.2A4.7 4.7 0 0 1 12.2 3.5h1.3a4.5 4.5 0 0 1 4.5 4.5v4.4a4.1 4.1 0 0 1-4.1 4.1H9.8a2.3 2.3 0 0 1-2.3-2.3V10z"/><path d="M7.5 11.5H6a1.8 1.8 0 0 1 0-3.6h1.5M8.8 16.5v4h8v-4M11 7.5h4"/></svg>',
  conditioning: '<svg viewBox="0 0 24 24" focusable="false"><path d="M8.6 9.4a3.4 3.4 0 1 1 6.8 0"/><path d="M8 9h8l1.3 3.2a5.6 5.6 0 1 1-10.6 0z"/></svg>',
  sculpt: '<svg viewBox="0 0 24 24" focusable="false"><path d="M6.5 7.5v9M17.5 7.5v9M4 10v4M20 10v4M6.5 12h11"/></svg>',
  mobility: '<svg viewBox="0 0 24 24" focusable="false"><circle cx="15.5" cy="5" r="1.9"/><path d="M3.5 19.5h17M6 19.5l4.5-5.5 3 1.5 1.5-6.5M10.5 14l-3.5-3.5L12 8.5"/></svg>'
};
var NOW_BG = {
  boxing: ['assets/video/now-boxing.mp4', 'assets/img/now-boxing-poster.webp'],
  conditioning: ['assets/video/now-conditioning.mp4', 'assets/img/now-conditioning-poster.webp'],
  sculpt: ['assets/video/now-sculpt.mp4', 'assets/img/now-sculpt-poster.webp'],
  mobility: ['assets/video/now-mobility.mp4', 'assets/img/now-mobility-poster.webp']
};
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clockText(ms) { var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? h + ':' + pad2(m) + ':' + pad2(x) : pad2(m) + ':' + pad2(x); }
function minutesText(ms) { var t = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(t / 60), m = t % 60; return (h ? plural(h, 'hour', 'hours') + (m ? ' ' : '') : '') + (m ? plural(m, 'minute', 'minutes') : ''); }
function initNow() {
  var bar = qs('[data-nowbar]');
  if (!bar) { return; }
  var el = { go: qs('[data-now-open]', bar), k: qs('[data-now-k]', bar), icon: qs('[data-now-icon]', bar), cls: qs('[data-now-cls]', bar), av: qs('[data-now-av]', bar), coach: qs('[data-now-coach]', bar), book: qs('[data-now-book]', bar), preL: qs('[data-now-pre-long]', bar), preS: qs('[data-now-pre-short]', bar), postS: qs('[data-now-post-short]', bar), count: qs('[data-now-count]', bar), sr: qs('[data-now-sr]', bar), v: qs('[data-now-video]', bar), poster: qs('[data-now-poster]', bar) };
  var cur = null, key = '', fam = '', srMin = -1, timer = 0;
  function occs() { var out = []; EF.api.week().forEach(function (day) { day.occs.forEach(function (o) { out.push(o); }); }); return out; }
  function pick(now) {
    var run = null, nx = null;
    occs().forEach(function (o) {
      var end = o.end || (o.start + (o.cls.length_min || 60) * 60000);
      if (o.start <= now && now < end) { if (!run) { run = o; } }
      else if (o.start > now && (!nx || o.start < nx.start)) { nx = o; }
    });
    if (run) { return { mode: 'now', o: run, at: run.end || (run.start + (run.cls.length_min || 60) * 60000) }; }
    return nx ? { mode: 'next', o: nx, at: nx.start } : null;
  }
  function bookable(o) {
    var now = EF.api.now(), best = null, open = null;
    occs().forEach(function (x) {
      if (x.classId !== o.classId || x.start <= now) { return; }
      if (!best || x.start < best.start) { best = x; }
      if (!x.full && (!open || x.start < open.start)) { open = x; }
    });
    return open || best;
  }
  function setBg(f) {
    if (f === fam || !NOW_BG[f]) { return; }
    fam = f;
    if (el.poster) { el.poster.src = NOW_BG[f][1]; }
    if (el.v && motionOn()) { if (el.v.__efm) { el.v.__efm.failed = false; } el.v.classList.remove('is-playing'); el.v.setAttribute('src', NOW_BG[f][0]); try { el.v.load(); } catch (e) {} if (EF.media && EF.media.sync) { EF.media.sync(); } }
  }
  function draw() {
    var now = EF.api.now();
    if (!cur || now >= cur.at) { cur = pick(now); }
    if (!cur) { el.go.setAttribute('data-wait', ''); return; }
    var o = cur.o, left = cur.at - now, k = cur.mode + o.id;
    if (k !== key) {
      key = k; srMin = -1;
      el.go.removeAttribute('data-wait');
      bar.setAttribute('data-mode', cur.mode);
      el.k.textContent = cur.mode === 'now' ? 'Now' : 'Next';
      el.icon.innerHTML = NOW_ICON[o.familyId] || '';
      el.cls.textContent = o.cls.name;
      el.coach.textContent = o.coach.name;
      if (el.av && o.coach.avatar) { el.av.src = o.coach.avatar; if (o.coach.avatarSet) { el.av.srcset = o.coach.avatarSet; } }
      /* #43: "ends in 23:14" / "starts in 1:12:05" above 414 px, "23:14 left" / "in 1:12:05" on phones */
      el.preL.textContent = cur.mode === 'now' ? 'ends in' : 'starts in';
      el.preS.textContent = cur.mode === 'now' ? '' : 'in';
      el.postS.textContent = cur.mode === 'now' ? ' left' : '';
      var nb = bookable(o);
      el.go.setAttribute('data-occ', nb ? nb.id : '');
      /* the visible words are the button's name (WCAG 2.5.3); the booking hint follows them for screen readers */
      if (el.book) { el.book.textContent = ', book ' + (nb ? (nb.id === o.id ? 'this class' : 'the next one, ' + dayPhrase(nb) + ' at ' + nb.time) : 'a class'); }
      setBg(o.familyId);
    }
    el.count.textContent = clockText(left);
    var mins = Math.ceil(left / 60000);
    if (mins !== srMin) { srMin = mins; el.sr.textContent = o.cls.name + ' with ' + o.coach.name + (cur.mode === 'now' ? ' ends in ' : ' starts in ') + minutesText(left) + '.'; }
  }
  function loop() { draw(); w.clearTimeout(timer); timer = w.setTimeout(loop, 1000 - (EF.api.now() % 1000) + 5); }
  el.go.addEventListener('click', function () {
    var id = el.go.getAttribute('data-occ');
    if (id) { openOcc(id, { src: 'nowbar' }, { type: 'el', el: el.go }); }
  });
  loop();
}

/* the finder's empty type-icon slot gets the same line icon as the Now bar (one icon set per concept) */
function fillFinderIcons() {
  qsa('#sheet .find-type[data-type]').forEach(function (t) {
    var slot = qs('.find-type__icon', t), ic = NOW_ICON[t.getAttribute('data-type')];
    if (slot && ic && !slot.firstChild) { slot.innerHTML = ic; slot.setAttribute('aria-hidden', 'true'); }
  });
}
d.addEventListener('ef:finder', function () { fillFinderIcons(); });

/* ---------- Google rating line: numbers from the data when the data carries them (engine-v2 club.rating) ---------- */
function bindRating() {
  var r = DATA && DATA.club && DATA.club.rating;
  /* only the 28 Oct 2026 read (engine-v2 overlay); the v1 data still carries the older count, which stays unused */
  var asof = String((r && r.as_of) || '');
  if (!r || !r.value || !r.count || !/^\d{4}-\d{2}-\d{2}$/.test(asof) || asof < '2026-10-28') { return; }
  var v = String(r.value), n = String(r.count);
  qsa('[data-grate]').forEach(function (g) {
    g.setAttribute('aria-label', 'Rated ' + v + ' out of 5 from ' + n + ' Google reviews');
    var num = qs('.grate__num', g), src = qs('.grate__src', g), clip = qs('[data-star-clip]', g);
    if (num) { num.textContent = v; }
    if (src) { src.textContent = n + ' Google reviews'; }
    /* stars drawn to the rating: 4 full stars plus part of the fifth, never five full */
    if (clip) { var x = +r.value, full = Math.floor(x), part = x - full; clip.setAttribute('width', String(Math.min(104, full * 21 + part * 21).toFixed(1))); }
  });
  qsa('[data-bind="rating-count"]').forEach(function (el) { el.textContent = n; });
}

/* ---------- hero quotes: one real Google review at a time, shortest verbatim cuts (<= 12 words), 0.4 s crossfade every 3.5 s
   (Raoul 28 Oct: "quicker alternating of review preview in hero as users will scroll quickly; and make citations more prominent").
   Pauses off screen, on hover and focus, with the pause control and while the tab is hidden; static under reduced motion.
   Each quote fits two lines of a reserved box (no layout shift); one that needs more at this width is skipped there, never cut. ---------- */
var GMARK = '<svg class="gmark" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
/* used only while the page runs on the v1 engine (no reviews in its data). Verbatim cuts from ef-gf/s3v2/reviews (R01 to R05, hero set). */
var HERO_QUOTES = [
  { id: 'R02', text: 'Amazing facilities and great classes.', by: 'Alex F., Google review' },
  { id: 'R01', text: '…There’s a great variety of classes to suit everyone…', by: 'Sonal P., Google review' },
  { id: 'R03', text: 'Excellent gym with top-level equipment, a great range of classes…', by: 'Tom H., Google review' },
  { id: 'R04', text: '…The trainers are absolute experts…', by: 'Edi H., Google review' },
  { id: 'R05', text: '…Great variety of classes and equipment is exceptional .', by: 'Kieran H., Google review' }
];
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var list = (DATA.reviews || []).filter(function (r) { return r.tags && r.tags.hero && r.text && r.by; });
  if (!list.length) { list = HERO_QUOTES; }
  var slides = qs('.hq__slides', box), btn = qs('[data-hq-pause]', box);
  slides.innerHTML = list.map(function (r, i) {
    return '<div class="hq__slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '" aria-hidden="true" data-review="' + esc(r.id || '') + '"><blockquote><p>' + esc(r.text) + '</p></blockquote><p class="hq__by">' + GMARK + '<span>' + esc(r.by) + '</span></p></div>';
  }).join('');
  var items = qsa('.hq__slide', slides), usable = [], cur = 0, timer = 0, userPaused = false, hover = false, focusIn = false, inView = true;
  function show(i) {
    items.forEach(function (it) { it.classList.remove('is-on'); it.setAttribute('aria-hidden', 'true'); });
    cur = (i + usable.length) % usable.length;
    usable[cur].classList.add('is-on'); usable[cur].removeAttribute('aria-hidden');
  }
  function measure() {
    items.forEach(function (it) { it.classList.remove('is-skip'); });
    usable = items.filter(function (it) {
      var p = qs('blockquote p', it), lh = parseFloat(w.getComputedStyle(p).lineHeight) || 26;
      var fits = p.getBoundingClientRect().height <= lh * 2 + 2;
      it.classList.toggle('is-skip', !fits);
      return fits;
    });
    if (!usable.length) { usable = [items[0]]; usable[0].classList.remove('is-skip'); }
    show(0);
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
  var rt = 0; w.addEventListener('resize', function () { w.clearTimeout(rt); rt = w.setTimeout(function () { measure(); tick(); }, 200); });
  measure(); tick();
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(function () { measure(); tick(); }); }
}

/* after a booking: refresh behind the sheet, then play the booked state once the visitor sees the page again */
var fresh = null;
function refresh() {
  heroNext();
  renderNext();
  renderDays();
  renderRows('none');
  renderTabBadge();
}
function playFresh() {
  if (!fresh) { return; }
  var f = fresh; fresh = null;
  var row = qs('[data-testid="row"][data-occ="' + f.occId + '"]');
  if (row) { row.classList.remove('is-fresh'); void row.offsetWidth; row.classList.add('is-fresh'); w.setTimeout(function () { row.classList.remove('is-fresh'); }, 1200); }
  if (!f.waitlist && EF.motion && EF.motion.roll) {
    qsa('[data-spots="' + f.occId + '"]').forEach(function (el) { var n = +el.textContent; EF.motion.roll(el, n, n + f.people); });
  }
}

/* ---------- boot ---------- */
function fail() {
  var n = qs('[data-nextup]');
  if (n) { n.innerHTML = '<p class="tickets__loading">The timetable didn\'t load. This week\'s classes are on <a href="https://elitefitbali.com/class-schedule/">elitefitbali.com/class-schedule</a>.</p>'; }
}
/* RULINGS #53/#53a: avatars.js (loaded right after api.js) points every coach at engine-v2/img/r/ and gives it an avatarSet */
function avImg(c, px, sizes, extra) {
  return '<img src="' + esc(c.avatar) + '"' + (c.avatarSet ? ' srcset="' + esc(c.avatarSet) + '" sizes="' + sizes + '"' : '') + ' alt="" width="' + px + '" height="' + px + '"' + extra + '>';
}
function boot() {
  if (!EF.api || !EF.api.load) { fail(); return; }
  EF.api.load().then(function (data) {
    DATA = data;
    bindStatic();
    initNow();
    initQuotes();
    initPanels();
    var nb = qs('[data-nextup]'); if (nb) { nb.setAttribute('data-m', 'meters'); }
    renderNext();
    initSchedule();
    renderCoaches();
    initChrome();
    initActions();
    openStatus();
    w.setInterval(openStatus, 60000);
    if (EF.motion && EF.motion.scan) { EF.motion.scan(d.getElementById('main')); }
    /* a deep link (#schedule, #coaches …): the browser jumped before the timetable rendered above it; land it again, exactly under the pinned chrome */
    var hashT = w.location.hash.length > 1 ? d.getElementById(decodeURIComponent(w.location.hash.slice(1))) : null;
    if (hashT && !(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen())) { raf(function () { raf(function () { try { hashT.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { hashT.scrollIntoView(); } }); }); }
    if (EF.media && EF.media.sync) { EF.media.sync(); }
    d.addEventListener('ef:booked', function (e) {
      var b = e.detail && e.detail.booking;
      if (b) { fresh = { occId: b.occId, people: b.people || 1, waitlist: !!b.waitlist }; }
      refresh();
    });
    d.addEventListener('ef:sheet', function (e) {
      if (!(e.detail && e.detail.open)) { w.setTimeout(function () { if (!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen())) { VT.src = null; } }, 0); }
      if (e.detail && e.detail.open) { sheetFocus(); fillFinderIcons(); }
      else if (fresh) { w.setTimeout(playFresh, VT.busy ? 380 : 260); }
    });
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.open) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) {}
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
