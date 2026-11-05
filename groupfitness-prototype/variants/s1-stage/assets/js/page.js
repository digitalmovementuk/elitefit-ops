/* Elite Fit /groupfitness · Cinematic stage · page.js (27 Oct 2026)
   Wires the cinematic page to v1's engine (EF.api + EF.booking + EF.sheet, unchanged): prices and counts, chapter class
   lines, next-up showtimes, the week schedule (days, family chips, filter drawer as an EF.sheet view), coaches, the visitor
   toggle, Duo preference and the sticky CTAs. Hooks follow the shared page contract (data-testid and data-* hooks). Classic deferred script, ES5, no libraries. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function emit(name, detail) { try { d.dispatchEvent(new w.CustomEvent(name, { detail: detail })); } catch (e) { } }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false }; } }
var mqDesk = mq('(min-width: 1024px)');
function motionOn() { return root.classList.contains('motion-ok'); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function store() { try { return (EF.api && EF.api.store && EF.api.store.get()) || {}; } catch (e) { return {}; } }
function storeSet(p) { try { if (EF.api && EF.api.store) { EF.api.store.set(p); } } catch (e) { } }
function scrollToEl(el) {
  if (!el) { return; }
  try { el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' }); } catch (e) { el.scrollIntoView(); }
}
function openOcc(id, opts) { if (EF.booking && EF.booking.open && id) { EF.booking.open(id, opts || {}); } }
function dayLabel(occ) {
  if (occ.dayIndex === 0) { return 'Today'; }
  if (occ.dayIndex === 1) { return 'Tomorrow'; }
  return EF.api.dateShort(occ.ymd);
}
function dayPhrase(occ) { return occ.dayIndex === 0 ? 'today' : (occ.dayIndex === 1 ? 'tomorrow' : EF.api.dateShort(occ.ymd)); }
function spotsLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function spotsText(occ) {
  if (occ.past) { return 'Finished'; }
  return spotsLabel(occ.full ? 0 : occ.spotsLeft);
}
/* the free-spots seat row (Raoul, 28 Oct): the engine's EF.seats when it has one (engine-v2), else the same markup here */
function localSeats(free, cap) {
  var i, out = '', group = cap > 12, n = Math.max(0, Math.min(free, cap)), lbl = spotsLabel(free), num = /^\d+/.exec(lbl);
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { out += '<b class="seat-gap"></b>'; }
    out += '<i class="seat' + (i < n ? ' seat--free' : '') + '" style="--s:' + i + '"></i>';
  }
  return '<span class="seatrow' + (free <= 0 ? ' seatrow--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '"><span class="seats" aria-hidden="true">' + out + '</span>' +
    '<span class="seatrow__lbl" aria-hidden="true">' + (num ? '<b>' + num[0] + '</b>' + lbl.slice(num[0].length) : lbl) + '</span>' +
    '<span class="vh">' + (free <= 0 ? 'Full, ' + cap + ' of ' + cap + ' spots taken. Join the waitlist.' : free + ' of ' + cap + ' spots free') + '</span></span>';
}
function seatsFor(o) {
  var free = o.full ? 0 : Math.max(0, o.spotsLeft), cap = Math.max(o.capacity || 12, free);
  return (EF.seats && EF.seats.html) ? EF.seats.html(free, cap) : localSeats(free, cap);
}
/* one real clip per class family on the Next up cards; the stock ones say so outside the clip */
var CLIPS = {
  boxing: { v: 'assets/video/boxing-tall.mp4', p: 'assets/img/boxing-tall-poster.webp', w: 720, h: 1280, pillar: true, stock: true },
  conditioning: { v: 'assets/video/conditioning-wide.mp4', p: 'assets/img/conditioning-wide-poster.webp', w: 1280, h: 720 },
  sculpt: { v: 'assets/video/sculpt-d.mp4', p: 'assets/img/sculpt-d-poster.webp', w: 1280, h: 720 },
  mobility: { v: 'assets/video/mobility-d.mp4', p: 'assets/img/mobility-d-poster.webp', w: 1280, h: 720, stock: true }
};
function clipHtml(fam) {
  var c = CLIPS[fam];
  if (!c) { return ''; }
  return '<span class="ncard__media' + (c.pillar ? ' ncard__media--pillar' : '') + '" data-fam="' + esc(fam) + '"><span class="ncard__screen">' +
    '<img class="media__poster" src="' + c.p + '" alt="" width="' + c.w + '" height="' + c.h + '" loading="lazy" decoding="async">' +
    '<video data-clip data-group="next" muted loop playsinline preload="none" data-src-tall="' + c.v + '" aria-hidden="true"></video></span></span>';
}
function isSample(cls, field) { return !!(cls.sample_fields && cls.sample_fields.indexOf(field) > -1) || (field === 'length' && !!cls.length_sample); }
var CHIP = ' <span class="sample">Sample</span>';
function levelHtml(cls) { return esc(cls.level) + (isSample(cls, 'level') ? CHIP : ''); }
function lengthHtml(cls) { return cls.length_min + ' min' + (isSample(cls, 'length') ? CHIP : ''); }
function scanMotion(el) { if (EF.motion && EF.motion.scan && el) { EF.motion.scan(el); } }

var DATA = null;

/* ---------- static bindings ---------- */
function bindStatic() {
  var p = DATA.passes, c = DATA.club;
  var prices = { day: p.day.price_idr, duo: p.duo.price_idr, 'duo-total': p.duo.price_idr * (p.duo.people || 2), 'duo-old': p.duo.old_price_idr, recharge_day: p.recharge_day.price_idr };
  qsa('[data-price]').forEach(function (el) { var v = prices[el.getAttribute('data-price')]; if (v) { el.textContent = EF.api.k(v); } });
  qsa('[data-bind="weekly-count"]').forEach(function (el) { el.textContent = EF.api.weeklyCount(); });
  qsa('[data-bind="weekend-note"]').forEach(function (el) { el.textContent = DATA.timetable.weekend_note; });
  qsa('[data-bind="address"]').forEach(function (el) { el.textContent = c.address; });
  qsa('[data-bind="wa-link"]').forEach(function (el) { el.textContent = c.whatsapp.number; el.href = 'https://wa.me/' + c.whatsapp.wa; });
}

/* ---------- visitor toggle ---------- */
var NOTES = { first: "Welcome. Pick a class and we'll take it from there.", returning: "Haven't seen you in a while? Your spot's still here." };
function readNotes() {
  var note = qs('[data-visitor-note]');
  if (!note || NOTES._read) { return; }
  NOTES.first = note.getAttribute('data-note-first') || note.textContent.trim() || NOTES.first;
  NOTES.returning = note.getAttribute('data-note-returning') || NOTES.returning;
  NOTES._read = true;
}
function setVisitor(v, save) {
  readNotes();
  qsa('[data-visitor]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-visitor') === v ? 'true' : 'false'); });
  var note = qs('[data-visitor-note]');
  if (note) { note.textContent = NOTES[v] || NOTES.first; }
  if (save) { storeSet({ visitor: v }); emit('ef:visitor', { visitor: v }); }
}
function initVisitor() {
  setVisitor(store().visitor === 'returning' ? 'returning' : 'first', false);
  qsa('[data-visitor]').forEach(function (b) { b.addEventListener('click', function () { setVisitor(b.getAttribute('data-visitor'), true); }); });
}

/* ---------- chapters: class lines ---------- */
function slotText(classId) {
  var s = EF.api.slots(classId);
  if (s.length > 4) { return s.length + ' times a week'; }
  return s.map(function (x) { return x.dowShort + ' ' + x.time; }).join(', ');
}
function renderChapters() {
  qsa('[data-chap-classes]').forEach(function (box) {
    var fid = box.getAttribute('data-chap-classes');
    var classes = EF.api.classesInFamily(fid), weekly = 0;
    box.innerHTML = classes.map(function (c) {
      weekly += EF.api.slots(c.id).length;
      var co = EF.api.coach(c.coach), next = EF.api.occ(c.id);
      var when = 'with ' + esc(co ? co.name : '') + ' · ' + esc(slotText(c.id));
      var nextTxt = next ? ('Next: ' + dayPhrase(next) + ' at ' + next.time) : '';
      return '<li class="cline"><button class="cline__btn" type="button" data-open-occ="' + esc(next ? next.id : c.id) + '" aria-label="' + esc(c.name + '. ' + nextTxt + '. See details') + '">' +
        '<span class="cline__name">' + esc(c.name) + '</span>' +
        '<span class="cline__when">' + when + (nextTxt ? '<br>' + esc(nextTxt) : '') + '</span>' +
        '<span class="arr" aria-hidden="true">→</span></button></li>';
    }).join('');
    var cnt = qs('[data-chap-count="' + fid + '"]');
    if (cnt) { cnt.textContent = plural(weekly, 'class', 'classes'); }
    scanMotion(box.parentNode);
  });
  if (EF.motion && EF.motion.refreshBar) { EF.motion.refreshBar(); }
}

/* ---------- next up (showtimes) ---------- */
var nextBox;
function renderNext() {
  nextBox = nextBox || qs('[data-nextup]');
  if (!nextBox) { return; }
  var list = EF.api.upcoming(3);
  if (!list.length) { nextBox.innerHTML = '<p class="nextup__loading">No classes left this week. New dates appear every day.</p>'; return; }
  nextBox.innerHTML = list.map(function (o) {
    var dl = dayLabel(o), fam = o.family && o.family.id, c = CLIPS[fam];
    return '<button class="ncard" type="button" data-testid="next-card" data-occ="' + esc(o.id) + '" aria-haspopup="dialog">' + clipHtml(fam) +
      '<span class="ncard__when">' + esc(dl === 'Today' || dl === 'Tomorrow' ? dl + ' · ' + EF.api.dateShort(o.ymd) : EF.api.dateShort(o.ymd)) + (c && c.stock ? ' <span class="ncard__stock">· Stock clip</span>' : '') + '</span>' +
      '<span class="ncard__time">' + esc(o.time) + '</span>' +
      '<span class="ncard__name">' + esc(o.cls.name) + '</span>' +
      '<span class="who"><img src="' + esc(o.coach.avatar) + '" alt="" width="28" height="28" loading="lazy">with ' + esc(o.coach.name) + '</span>' +
      '<span class="ncard__meta">' + o.cls.length_min + ' min · ' + esc(o.cls.level) + '</span>' +
      '<span class="ncard__foot">' + seatsFor(o) + '<span class="fauxbtn">Book <span class="arr" aria-hidden="true">→</span></span></span>' +
    '</button>';
  }).join('');
  qsa('.ncard', nextBox).forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-occ')); }); });
  scanMotion(nextBox.parentNode);
  if (EF.media && EF.media.scan) { EF.media.scan(nextBox); }
}

/* ---------- title card: next class line ---------- */
function renderHeroNext() {
  var box = qs('[data-hero-next]'), o = EF.api.upcoming(1)[0];
  if (!box) { return; }
  if (!o) { box.style.visibility = 'hidden'; return; }
  box.innerHTML = '<button class="nextline" type="button" data-open-occ="' + esc(o.id) + '"><span class="nextline__k">Next up</span> <span class="nextline__v">' +
    esc(dayLabel(o) + ' ' + o.time + ' · ' + o.cls.name) + '</span> <span class="arr" aria-hidden="true">→</span></button>';
  box.style.visibility = '';
}

/* ---------- sheet slate: the step label shown as a film slate ("02 / 05") ---------- */
function pad2(n) { n = +n; return (n < 10 ? '0' : '') + n; }
/* engine-v2 1.1: data-step is logical (0 | 1 | 2 | pay | done), the numeral is pad2(data-step-pos) / pad2(data-steps); the scene names the screen */
var SCENES2 = { mode: 'Pick a class', day: 'Showtimes', 'class': 'The programme', sessions: 'Showtimes', week: 'The week', '1': 'Who and how', '2': 'Your details', pay: 'Demo payment', done: 'See you there' };
function initSlate() {
  var sheet = qs('#sheet'), step = qs('[data-sheet-step]'), body = qs('[data-sheet-body]');
  if (!sheet || !step || !body || !w.MutationObserver) { return; }
  var slate = d.createElement('p');
  slate.className = 'sheet__slate';
  slate.setAttribute('aria-hidden', 'true');
  step.parentNode.insertBefore(slate, step);
  function upd() {
    var st = sheet.getAttribute('data-step'), pos = sheet.getAttribute('data-step-pos'), n = sheet.getAttribute('data-steps');
    var scene = st == null ? '' : (st === '0' ? SCENES2[sheet.getAttribute('data-finder') || 'mode'] : SCENES2[st]);
    var num = /^\d+$/.test(pos || '') && /^\d+$/.test(n || '') ? '<b>' + pad2(pos) + ' / ' + pad2(n) + '</b>' : '';
    slate.innerHTML = num + '<span>' + esc(scene || String(step.textContent || '')) + '</span>';
  }
  new w.MutationObserver(upd).observe(step, { childList: true, characterData: true, subtree: true });
  new w.MutationObserver(upd).observe(sheet, { attributes: true, attributeFilter: ['data-step', 'data-step-pos', 'data-steps', 'data-finder'] });
  upd();
}

/* ---------- schedule ---------- */
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
  var wk = EF.api.week(), booked = {};
  (store().bookings || []).forEach(function (b) { booked[b.ymd] = true; });
  sched.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (day.isToday ? ' is-today' : '') + (booked[day.ymd] ? ' has-booking' : '') + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
      '<span class="day__dow">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span> <span class="day__num">' + day.dayNum + '</span><span class="vh">, ' + esc(day.long + ', ' + plural(day.occs.length, 'class', 'classes')) + '</span><span class="day__dot" aria-hidden="true"></span></button>';
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
  var label = o.cls.name + ', ' + o.time + ' with ' + o.coach.name + '. ' + spotsText(o) + '. See details';
  var act;
  if (o.past) { act = '<span class="row__label">Finished</span>'; }
  else if (o.booking && !o.booking.waitlist) { act = '<button class="rbtn rbtn--booked" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="Booked: ' + esc(o.cls.name + ' ' + o.time) + '">Booked</button>'; }
  else if (o.full) { act = '<button class="rbtn" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Join waitlist for ' + o.cls.name + ' at ' + o.time) + '">Join waitlist</button>'; }
  else { act = '<button class="rbtn" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc('Book ' + o.cls.name + ' at ' + o.time) + '">Book</button>'; }
  var spots = o.booking && !o.booking.waitlist ? esc("You're booked") : (o.booking && o.booking.waitlist ? 'On the waitlist' : (o.past ? 'Finished' : seatsFor(o)));
  return '<li class="row' + (o.past ? ' is-past' : '') + (o.booking ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '" style="--i:' + i + '">' +
    (o.past ? '' : '<button class="row__hit" type="button" data-open="' + esc(o.id) + '" aria-label="' + esc(label) + '"></button>') +
    '<div class="row__when"><span class="row__time">' + esc(o.time) + '</span><span class="row__len">' + o.cls.length_min + ' min</span></div>' +
    '<div class="row__main"><p class="row__name">' + esc(o.cls.name) + '</p>' +
    '<p class="row__by"><img src="' + esc(o.coach.avatar) + '" alt="" width="28" height="28" loading="lazy"><span>' + esc(o.coach.name) + ' · ' + esc(o.cls.level) + '</span></p></div>' +
    '<span class="row__spots">' + spots + '</span>' +
    '<div class="row__act">' + act + '</div></li>';
}
var swapTimer = 0, flipT = 0;
function renderRows(animate) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day) { return; }
  var list = dayRows(S.day, S);
  var draw = function () {
    sched.rows.innerHTML = list.map(rowHtml).join('');
    if (animate && motionOn()) { qsa('.row', sched.rows).forEach(function (r) { r.classList.add('is-enter'); }); }
    sched.rows.classList.remove('is-swapping');
    sched.empty.hidden = mqDesk.matches ? renderGrid() > 0 : list.length > 0;
    if (animate && motionOn() && sched.grid && mqDesk.matches) { sched.grid.classList.remove('is-flip'); void sched.grid.offsetWidth; sched.grid.classList.add('is-flip'); clearTimeout(flipT); flipT = setTimeout(function () { sched.grid.classList.remove('is-flip'); }, 900); }
    sched.title.textContent = (day.isToday ? 'Today, ' : '') + day.long;
    sched.count.textContent = plural(list.length, 'class', 'classes');
    var left = day.occs.filter(function (o) { return !o.past; }).length;
    if (day.isToday && day.occs.length && !left) {
      var tmr = wk[1] && wk[1].occs[0];
      sched.done.textContent = "That's today done." + (tmr ? ' Tomorrow starts at ' + tmr.time + ' with ' + tmr.cls.name + '.' : '');
      sched.done.hidden = false;
    } else { sched.done.hidden = true; }
  };
  clearTimeout(swapTimer);
  if (animate && motionOn()) { sched.rows.classList.add('is-swapping'); swapTimer = setTimeout(draw, 160); } else { draw(); }
  renderBadge();
}
/* P22 (Raoul, 29 Oct: "well visible and easy to understand what classes take place on what day"): from 1024 px the week is a
   showtimes board, Monday to Sunday, every class a compact stub (time + class). Today's column is marked in white, never terracotta.
   The family chips and the filter drawer filter it; a tap opens the sheet. Phones keep the day selector and that day's list.
   Returns the number of stubs shown. */
function renderGrid() {
  var box = sched.grid, n = 0;
  if (!box) { return 0; }
  var cols = EF.api.week(); /* RULINGS #32: today first, the same order as the phone day selector */
  box.innerHTML = cols.map(function (day, ci) {
    var ds = String(EF.api.dateShort(day.ymd)), sp = ds.indexOf(' '), dow = sp > 0 ? ds.slice(0, sp) : ds, date = sp > 0 ? ds.slice(sp + 1) : '';
    var occs = day.occs.filter(function (o) { return matches(o, S); });
    n += occs.filter(function (o) { return !o.past; }).length;
    return '<div class="wcol' + (day.isToday ? ' is-today' : '') + '" role="group" aria-labelledby="wcol-' + ci + '">' +
      '<p class="wcol__h" id="wcol-' + ci + '"><span class="wcol__dow">' + esc(dow) + '</span> <span class="wcol__date">' + esc(date) + '</span>' + (day.isToday ? ' <span class="wcol__today">Today</span>' : '') + '</p>' +
      (occs.length ? '<ol class="wcol__list">' + occs.map(function (o, oi) {
        var st = o.past ? 'Finished' : (o.booking && !o.booking.waitlist ? "You're booked" : (o.booking ? 'On the waitlist' : ''));
        var lbl = o.cls.name + ', ' + day.long + ', ' + o.time + ' with ' + o.coach.name + '. ' + (st || spotsText(o)) + (o.past ? '' : '. Book');
        return '<li style="--c:' + (ci + oi) + '"><button class="wchip' + (o.past ? ' is-past' : '') + (o.full ? ' is-full' : '') + (o.booking ? ' is-booked' : '') + '" type="button" data-testid="grid-class" data-open="' + esc(o.id) + '"' + (o.past ? ' disabled' : ' aria-haspopup="dialog"') + ' aria-label="' + esc(lbl) + '">' +
          '<span class="wchip__t">' + esc(o.time) + '</span><span class="wchip__n">' + esc(o.cls.name) + '</span>' + (st ? '<span class="wchip__s">' + esc(st) + '</span>' : '<span class="wchip__seats">' + seatsFor(o) + '</span>') + '</button></li>';
      }).join('') + '</ol>' : '<p class="wcol__none">No classes</p>') + '</div>';
  }).join('');
  return n;
}
function renderBadge() {
  var n = filterCount(S), b = sched.badge;
  if (b) {
    var before = b.textContent;
    b.textContent = n;
    b.hidden = n === 0;
    if (String(n) !== before && n > 0 && motionOn()) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  }
  qsa('.fchip', sched.chips).forEach(function (c) { c.setAttribute('aria-pressed', (c.getAttribute('data-fam') || '') === S.family ? 'true' : 'false'); });
}
function firstOpenDay() {
  var wk = EF.api.week();
  for (var i = 0; i < wk.length; i++) { if (wk[i].occs.some(function (o) { return !o.past; })) { return i; } }
  return 0;
}
function initSchedule() {
  var box = qs('[data-schedule]');
  if (!box) { return; }
  sched = {
    box: box, days: qs('[data-days]', box), chips: qs('[data-fchips]', box), badge: qs('[data-filter-count]', box),
    title: qs('[data-day-title]', box), count: qs('[data-day-count]', box), done: qs('[data-day-done]', box),
    rows: qs('[data-rows]', box), empty: qs('[data-empty]', box), grid: qs('[data-wgrid]', box)
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
  if (sched.grid) {
    sched.grid.addEventListener('click', function (e) { var t = e.target.closest('[data-open]'); if (t && !t.disabled) { openOcc(t.getAttribute('data-open')); } });
    if (mqDesk.addEventListener) { mqDesk.addEventListener('change', function () { renderRows(false); }); }
  }
  sched.rows.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book], [data-open]');
    if (t) { openOcc(t.getAttribute('data-book') || t.getAttribute('data-open')); }
  });
  qsa('[data-clear-filters]').forEach(function (b) { b.addEventListener('click', function () { S.family = ''; S.coaches = []; S.times = []; S.levels = []; renderRows(true); }); });
  var fb = qs('[data-open-filters]', box);
  if (fb) { fb.addEventListener('click', function () { if (EF.sheet && EF.sheet.open) { EF.sheet.open('filters', {}, '?view=filters'); } }); }
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(moveInd, 120); });
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
      label: 'Filters', progress: null, testid: 'step-filters',
      render: function (body, foot) {
        function tog(group, id, name, on, img) {
          return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? '<img src="' + esc(img) + '" alt="" width="26" height="26">' : '') + esc(name) + '</button>';
        }
        body.innerHTML = '<div data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">For ' + esc(EF.api.week()[S.day].long) + '.</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="opts">' + tog('family', '', 'All classes', !F.family) + DATA.families.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="opts">' + DATA.coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c.avatar); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Time of day</legend><div class="opts">' + TIMES.map(function (t) { return tog('times', t.id, t.name, F.times.indexOf(t.id) > -1); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Level</legend><div class="opts">' + LEVELS.map(function (l) { return tog('levels', l.id, l.name, F.levels.indexOf(l.id) > -1); }).join('') + '</div></fieldset>' +
          '<p class="sh-lead"><span class="sample">Sample</span> Most class levels are placeholders until the club confirms them.</p></div>';
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
          if (g === 'family') { F.family = v; }
          else { var at = F[g].indexOf(v); if (at > -1) { F[g].splice(at, 1); } else { F[g].push(v); } }
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

/* ---------- coaches ---------- */
function teaches(id) {
  var names = [];
  EF.api.week().forEach(function (day) { day.occs.forEach(function (o) { if (o.coach.id === id && names.indexOf(o.cls.name) < 0) { names.push(o.cls.name); } }); });
  if (names.length < 2) { return names.join(''); }
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}
function initCoaches() {
  var box = qs('[data-coaches]');
  if (!box) { return; }
  DATA.coaches.forEach(function (c) {
    var cnt = qs('[data-coach-count="' + c.id + '"]', box), role = qs('[data-coach-role="' + c.id + '"]', box), t;
    if (cnt) { cnt.textContent = plural(EF.api.coachWeekly(c.id), 'class', 'classes'); }
    if (role && !c.role) { t = teaches(c.id); if (t) { role.textContent = 'Teaches ' + t; } }
  });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-coach]');
    if (b && EF.booking && EF.booking.openCoach) { EF.booking.openCoach(b.getAttribute('data-coach')); }
  });
}

/* ---------- sticky bar: one terracotta button and one rating per screen ----------
   Rulings 6 and 9 (28 Oct): the bar shows only once the title card's Book, its rating line and its quote have all scrolled away
   above, and it hides while any other rating is on screen (the desktop trust badge, the Visit quote), over the +1 offer, the footer,
   an open sheet and a focused page field. The header has no CTA any more: the bar carries Book on desktop too. */
function initBars() {
  var bar = qs('[data-buybar]'), hdr = qs('#hdr');
  var barBtn = bar && qs('.buybar__btn', bar);
  var marks = [qs('[data-testid="hero-book"]'), qs('#top .trust'), qs('#top .hq')].filter(Boolean), gone = [];
  var st = { pastHero: false, blocked: {}, sheet: !!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen()), typing: false };
  function apply() {
    var b = st.blocked, blocked = b.offer || b.footer || b.badge || b.rated;
    var onBar = st.pastHero && !blocked && !st.sheet && !st.typing;
    if (bar) { bar.classList.toggle('is-on', onBar); bar.setAttribute('aria-hidden', onBar ? 'false' : 'true'); if (barBtn) { barBtn.tabIndex = onBar ? 0 : -1; } }
  }
  if ('IntersectionObserver' in w) {
    if (marks.length) {
      /* every title-card mark has scrolled away above (a mark hidden at this width counts as gone) */
      var mio = new w.IntersectionObserver(function (es) {
        es.forEach(function (e) { gone[marks.indexOf(e.target)] = !e.isIntersecting && e.boundingClientRect.bottom <= 0; });
        st.pastHero = marks.every(function (m, i) { return !!gone[i]; });
        apply();
      });
      marks.forEach(function (m) { mio.observe(m); });
    }
    [['offer', '#plus-one'], ['footer', '#footer'], ['badge', '[data-trust-badge]'], ['rated', '#visit .quote']].forEach(function (p) {
      var el = qs(p[1]);
      if (el) { new w.IntersectionObserver(function (es) { st.blocked[p[0]] = es[0].isIntersecting; apply(); }, { rootMargin: '0px 0px -60px 0px' }).observe(el); }
    });
  }
  d.addEventListener('ef:sheet', function (e) { st.sheet = !!(e.detail && e.detail.open); apply(); });
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { st.typing = true; apply(); } });
  d.addEventListener('focusout', function () { if (st.typing) { st.typing = false; apply(); } });
  /* the desktop header's hairline once the page has scrolled: a 4 px sentinel at the top, watched by an IntersectionObserver (no scroll listener) */
  if (hdr && 'IntersectionObserver' in w) {
    var sen = d.createElement('i');
    sen.setAttribute('aria-hidden', 'true');
    sen.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:4px;pointer-events:none;visibility:hidden';
    d.body.insertBefore(sen, d.body.firstChild);
    new w.IntersectionObserver(function (es) { hdr.classList.toggle('is-scrolled', !es[0].isIntersecting); }).observe(sen);
  }
  apply();
}

/* ---------- title card: rotating review quotes (Raoul, 28 Oct: "quicker alternating ... make citations more prominent") ----------
   Real Google reviews tagged hero in the data, verbatim cuts of 12 words or fewer, one at a time, every 3.5 s, 0.4 s crossfade (CSS).
   Pauses on hover, focus, off screen, hidden tab and the pause button; static under reduced motion / Save-Data. A quote that needs more
   than the two reserved lines at this width is skipped. Without hero reviews in the data the HTML's first quote stays. */
function words(t) { return String(t).replace(/[…"“”]/g, ' ').split(/\s+/).filter(Boolean).length; }
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var list = (DATA.reviews || []).filter(function (r) { return r && r.text && r.tags && r.tags.hero && words(r.text) <= 12; });
  var slides = qs('.hq__slides', box), btn = qs('[data-hq-pause]', box), g = qs('#top .gmark');
  var gm = g ? g.outerHTML : '';
  if (list.length) {
    slides.innerHTML = list.map(function (r, i) {
      return '<figure class="hq__slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '" aria-hidden="true"><blockquote><p>“' + esc(r.text) + '”</p></blockquote><figcaption>' + gm + '<span>' + esc(r.by) + '</span></figcaption></figure>';
    }).join('');
  } else {
    var cap = qs('.hq__slide figcaption', slides);
    if (cap && gm && !qs('.gmark', cap)) { cap.insertAdjacentHTML('afterbegin', gm); }
  }
  var items = qsa('.hq__slide', slides), usable = [], cur = 0, timer = 0, userPaused = false, hover = false, focusIn = false, inView = true;
  function show(i) {
    items.forEach(function (it) { it.classList.remove('is-on'); it.setAttribute('aria-hidden', 'true'); });
    cur = (i + usable.length) % usable.length;
    usable[cur].classList.add('is-on'); usable[cur].removeAttribute('aria-hidden');
  }
  function measure() {
    items.forEach(function (it) { it.classList.remove('is-skip'); });
    usable = items.filter(function (it) {
      var p = qs('blockquote p', it), lh = parseFloat(w.getComputedStyle(p).lineHeight) || 25;
      var r = d.createRange(); r.selectNodeContents(p);
      var fits = r.getBoundingClientRect().height <= lh * 2 + 2;
      it.classList.toggle('is-skip', !fits);
      return fits;
    });
    if (!usable.length) { usable = [items[0]]; usable[0].classList.remove('is-skip'); }
    show(Math.min(cur, usable.length - 1));
    btn.hidden = usable.length < 2 || !motionOn();
  }
  function auto() { return motionOn() && !userPaused && !hover && !focusIn && inView && !d.hidden && usable.length > 1; }
  function tick() { clearTimeout(timer); if (auto()) { timer = setTimeout(function () { show(cur + 1); tick(); }, 3500); } }
  if ('IntersectionObserver' in w) { new w.IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== inView) { inView = v; tick(); } }).observe(box); }
  btn.addEventListener('click', function () { userPaused = !userPaused; btn.setAttribute('aria-pressed', userPaused ? 'true' : 'false'); btn.setAttribute('aria-label', (userPaused ? 'Play' : 'Pause') + ' the review quotes'); tick(); });
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  box.addEventListener('focusin', function () { focusIn = true; tick(); });
  box.addEventListener('focusout', function () { focusIn = false; tick(); });
  d.addEventListener('visibilitychange', tick);
  var rt = 0; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); tick(); }, 200); });
  measure(); tick();
}

/* ---------- 0. Now / Next bar (P23): the class running now, or the next one, with a live countdown (WITA, ?now= aware) ----------
   Ticks every second (mm:ss under an hour, h:mm:ss above) and rolls over by itself. Tap opens the sheet for the next bookable
   session of that class (a class-specific entry). The hidden timer text for screen readers changes once a minute. */
var NB_ICON = {
  boxing: '<svg viewBox="0 0 24 24"><path d="M8 20h8M8 20v-3.2C6.2 15.6 5 13.7 5 11.4V8a5 5 0 0 1 5-5h2.5A5.5 5.5 0 0 1 18 8.5v3.4c0 2-1 3.8-2 4.9V20"/><path d="M5 10.5h3.2a2 2 0 0 1 0 4H6.4"/></svg>',
  conditioning: '<svg viewBox="0 0 24 24"><path d="M8.5 9.5V8a3.5 3.5 0 0 1 7 0v1.5"/><path d="M7.4 9.5h9.2a4.6 4.6 0 0 1 1.9 6.9l-1 1.6a2 2 0 0 1-1.7 1H7.2a2 2 0 0 1-1.7-1l-1-1.6a4.6 4.6 0 0 1 1.9-6.9z"/></svg>',
  sculpt: '<svg viewBox="0 0 24 24"><path d="M3 10v4M6 7.5v9M18 7.5v9M21 10v4M6 12h12"/></svg>',
  mobility: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="1.8"/><path d="M4 9.5l8 1.5 8-1.5M12 11v4.5M12 15.5L8 21M12 15.5l4 5.5"/></svg>'
};
var mqPhone = mq('(max-width: 414px)');
var NB_FILE = { sculpt: 'sculpt-v2' }; /* cut from the clean sculpt-d band (the first sculpt band held a head cut by its source edge) */
function nbFmt(ms) { var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? h + ':' + pad2(m) + ':' + pad2(x) : pad2(m) + ':' + pad2(x); }
function nbWords(ms) { var m = Math.max(1, Math.round(ms / 60000)), h = Math.floor(m / 60), r = m % 60; return h ? plural(h, 'hour', 'hours') + (r ? ' ' + plural(r, 'minute', 'minutes') : '') : plural(m, 'minute', 'minutes'); }
function initNowbar() {
  var bar = qs('[data-nowbar]');
  if (!bar || !EF.api || !EF.api.now) { return; }
  var E = {}, cur = null, fam = '', lastMin = -1;
  ['open', 'k', 'icon', 'cls', 'coach', 'av', 'lbl', 'lbl2', 'count', 'sr', 'video', 'poster'].forEach(function (k) { E[k] = qs('[data-nowbar-' + k + ']', bar); });
  function all() { var out = []; EF.api.week().forEach(function (d) { out = out.concat(d.occs); }); return out; }
  function pick() {
    var t = EF.api.now(), run = null, next = null;
    all().forEach(function (o) {
      if (o.start <= t && t < o.end) { if (!run) { run = o; } }
      else if (o.start > t && (!next || o.start < next.start)) { next = o; }
    });
    if (!run && !next) { next = EF.api.upcoming(1)[0] || null; }
    return run ? { now: true, o: run } : (next ? { now: false, o: next } : null);
  }
  function setFam(f) {
    if (!f || f === fam) { return; }
    fam = f;
    bar.setAttribute('data-fam', f);
    var nf = NB_FILE[f] || f;
    if (E.poster) { E.poster.src = 'assets/img/nowbar-' + nf + '-poster.webp'; }
    if (E.video) { E.video.setAttribute('data-src-tall', 'assets/video/nowbar-' + nf + '.mp4'); if (E.video.getAttribute('src')) { E.video.removeAttribute('src'); try { E.video.load(); } catch (e) { } } }
    if (E.icon) { E.icon.innerHTML = NB_ICON[f] || ''; }
    if (EF.media && EF.media.sync) { EF.media.sync(); }
  }
  function render() {
    if (!cur) { E.open.hidden = true; return; }
    var o = cur.o;
    setFam(o.family && o.family.id);
    E.k.textContent = cur.now ? 'Now' : 'Next';
    E.cls.textContent = o.cls.name;
    E.coach.textContent = o.coach.name;
    E.av.src = o.coach.avatar;
    labels();
    E.open.hidden = false;
    lastMin = -1;
  }
  /* RULINGS #43: 'ends in 23:14' / 'starts in 1:12:05' above 414 px; '23:14 left' / 'in 1:12:05' on phones */
  function labels() {
    if (!cur) { return; }
    var ph = mqPhone.matches;
    E.lbl.textContent = ph ? (cur.now ? '' : 'in') : (cur.now ? 'ends in' : 'starts in');
    E.lbl2.textContent = ph && cur.now ? ' left' : '';
  }
  if (mqPhone.addEventListener) { mqPhone.addEventListener('change', labels); }
  function tick() {
    var t = EF.api.now();
    if (!cur || (cur.now ? t >= cur.o.end : t >= cur.o.start)) { cur = pick(); render(); }
    if (!cur) { return; }
    var left = (cur.now ? cur.o.end : cur.o.start) - t, min = Math.ceil(left / 60000);
    E.count.textContent = nbFmt(left);
    if (min !== lastMin) {
      lastMin = min;
      E.sr.textContent = (cur.now ? 'Now on: ' : 'Next class: ') + cur.o.cls.name + ' with ' + cur.o.coach.name + (cur.now ? ', ends in ' : ', starts in ') + nbWords(left) + '.';
    }
  }
  E.open.addEventListener('click', function () {
    if (!cur) { return; }
    var id = cur.o.classId, t = EF.api.now(), list = all().filter(function (o) { return o.classId === id && o.start > t; });
    var pickO = list.filter(function (o) { return !o.full; })[0] || list[0];
    if (EF.booking && EF.booking.open) { EF.booking.open(pickO ? pickO.id : cur.o.id, { src: 'nowbar' }); }
  });
  tick();
  w.setTimeout(function () { tick(); w.setInterval(tick, 1000); }, 1000 - (EF.api.now() % 1000));
}

/* ---------- actions ---------- */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-filter-family], [data-open-occ]');
    if (!t) { return; }
    if (t.hasAttribute('data-open-occ')) {
      openOcc(t.getAttribute('data-open-occ'));
    } else if (t.hasAttribute('data-filter-family')) {
      e.preventDefault();
      EF.schedule.show({ family: t.getAttribute('data-filter-family') });
    }
  });
}

function refresh() {
  renderHeroNext();
  renderChapters();
  renderNext();
  renderDays();
  renderRows(false);
}

/* ---------- boot ---------- */
function fail() {
  var n = qs('[data-nextup]');
  if (n) { n.innerHTML = '<p class="nextup__loading">The timetable didn\'t load. This week\'s classes are on <a href="https://elitefitbali.com/class-schedule/">elitefitbali.com/class-schedule</a>.</p>'; }
}
function boot() {
  if (!EF.api || !EF.api.load) { fail(); return; }
  EF.api.load().then(function (data) {
    DATA = data;
    bindStatic();
    initVisitor();
    renderChapters();
    renderNext();
    renderHeroNext();
    initSlate();
    initSchedule();
    initCoaches();
    initBars();
    initActions();
    initQuotes();
    initNowbar();
      scanMotion(d.getElementById('main'));
    if (EF.media && EF.media.sync) { EF.media.sync(); }
    d.addEventListener('ef:booked', refresh);
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.open) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) { }
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
