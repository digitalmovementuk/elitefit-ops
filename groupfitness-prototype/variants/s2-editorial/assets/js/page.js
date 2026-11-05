/* Elite Fit /groupfitness · Editorial · page.js (v2.0, 28 Oct 2026)
   Renders and wires this variant from the shared data (EF.api): visitor toggle, next up (seat rows and a class clip per row),
   the four class features, the week (printed timetable from 1024 px when it has room, date strip + list below), the filter drawer (an EF.sheet
   view), coaches, prices, the cover's rotating review quotes, the sticky bar and its show rule. Booking itself is the shared engine.
   Hooks and test ids follow the shared page contract. Classic deferred script, ES5, no dependencies. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function emit(name, detail) { try { d.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { } }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false, addListener: function () {} }; } }
function onMq(m, fn) { if (m.addEventListener) { m.addEventListener('change', fn); } else if (m.addListener) { m.addListener(fn); } }
var mqDesk = mq('(min-width: 1024px)');
var mqTable = mq('(min-width: 1024px)');
function motionOn() { return root.classList.contains('motion-ok'); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function store() { try { return (EF.api && EF.api.store && EF.api.store.get()) || {}; } catch (e) { return {}; } }
function storeSet(p) { try { if (EF.api && EF.api.store) { EF.api.store.set(p); } } catch (e) { } }
function scrollToEl(el) {
  if (!el) { return; }
  try { el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' }); } catch (e) { el.scrollIntoView(); }
}
function openOcc(id, opts) { if (EF.booking && EF.booking.open && id) { EF.booking.open(id, opts || {}); } }
function dayPhrase(occ) { return occ.dayIndex === 0 ? 'today' : (occ.dayIndex === 1 ? 'tomorrow' : EF.api.dateShort(occ.ymd)); }
function dayLabel(occ) { return occ.dayIndex === 0 ? 'Today' : (occ.dayIndex === 1 ? 'Tomorrow' : EF.api.dateShort(occ.ymd).split(' ')[0]); }
function spotsText(occ) {
  if (occ.past) { return 'Finished'; }
  return spotsLabel(occ.full ? 0 : occ.spotsLeft);
}
/* free-spots seat row (P13): engine-v2 exposes EF.seats; until then the same markup is built here. Capacity is Sample data. */
function spotsLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function capOf(occ) {
  var m = (DATA && DATA.timetable && DATA.timetable.capacity) || {};
  return occ.capacity || occ.cap || m[occ.classId || (occ.cls && occ.cls.id)] || Math.max(12, occ.spotsLeft || 0);
}
function seatRow(occ) {
  var free = occ.full ? 0 : Math.max(0, occ.spotsLeft || 0), cap = Math.max(capOf(occ), free);
  if (EF.seats && EF.seats.html) { return EF.seats.html(free, cap).replace('class="seatrow__lbl"', 'class="seatrow__lbl meta"'); }
  var i, out = '', group = cap > 12, n = Math.min(free, cap), lbl = spotsLabel(free), num = /^\d+/.exec(lbl);
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { out += '<b class="seat-gap"></b>'; }
    out += '<i class="seat' + (i < n ? ' seat--free' : '') + '" style="--s:' + i + '"></i>';
  }
  return '<span class="seatrow' + (free <= 0 ? ' seatrow--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '">' +
    '<span class="seats" aria-hidden="true">' + out + '</span>' +
    '<span class="seatrow__lbl meta" aria-hidden="true">' + (num ? '<b>' + num[0] + '</b>' + lbl.slice(num[0].length) : lbl) + '</span>' +
    '<span class="vh">' + (free <= 0 ? 'Full, ' + cap + ' of ' + cap + ' spots taken. Join the waitlist.' : free + ' of ' + cap + ' spots free') + '</span></span>';
}
/* Google rating: engine-v2's overlay holds 4.7 / 497 read on 28 Oct 2026; the v1 file still says 488, so 497 is the floor */
var RATING = { value: 4.7, count: 497 };
function rating() { var r = DATA && DATA.club && DATA.club.rating; return (r && r.count >= RATING.count) ? r : RATING; }
/* class clips for the Next up rows: one per family, 9:16, played in view by media.js; three are stock (credited off the clip) */
/* RULINGS #53/#53a: every coach avatar on this page comes from the engine's head-and-shoulders crops (engine-v2/img/r,
   48/64/96/128 px), never the shared v1 avatar files. sizes = the displayed size; width/height kept so nothing shifts */
var AV = '../../engine-v2/img/r/avatar-';
function avImg(c, px, extra) { var id = esc((c && c.id) || ''), b = AV + id; return '<img src="' + b + '-' + (px > 32 ? 128 : 64) + '.webp" srcset="' + b + '-48.webp 48w, ' + b + '-64.webp 64w, ' + b + '-96.webp 96w, ' + b + '-128.webp 128w" sizes="' + px + 'px" alt="" width="' + px + '" height="' + px + '"' + (extra || '') + '>'; }
var CLIPS = { boxing: { f: 'boxing-facesafe', stock: true }, conditioning: { f: 'conditioning-ef-facesafe', stock: false }, sculpt: { f: 'sculpt', stock: false }, mobility: { f: 'mobility', stock: true } };
/* the class features whose picture is stock (boxing inset clip, mobility still): labelled in the feature's meta line (ruling #28) */
var STOCK_MEDIA = { boxing: 'Stock clip', mobility: 'Stock photo' };
function isSample(cls, field) { return !!(cls.sample_fields && cls.sample_fields.indexOf(field) > -1) || (field === 'length' && !!cls.length_sample); }
var CHIP = ' <span class="sample">Sample</span>';
function levelHtml(cls) { return esc(cls.level) + (isSample(cls, 'level') ? CHIP : ''); }
function lengthHtml(cls) { return cls.length_min + ' min' + (isSample(cls, 'length') ? CHIP : ''); }
/* One Sample chip per row or card, at its end, instead of one per field */
function plainLevel(cls) { return esc(cls.level); }
function plainLength(cls) { return cls.length_min + ' min'; }
function rowSample(cls) { return isSample(cls, 'level') || isSample(cls, 'length'); }
/* headings keep their last two words together (no one-word last line on phones); the words never change */
function kt(text) { var s = esc(text), i = s.lastIndexOf(' '), j = i > 0 ? s.lastIndexOf(' ', i - 1) : -1; return i < 0 ? s : s.slice(0, j + 1) + '<span class="kt">' + s.slice(j + 1) + '</span>'; }
function scanMotion(el) { try { if (EF.motion && EF.motion.scan) { EF.motion.scan(el); } } catch (e) { } }

var DATA = null;

/* ---------- cover band (P16): phones get the 800 px cut, wider screens the 1120 px cut; set now, media.js plays it after load ---------- */
(function () {
  var v = qs('video[data-band]');
  if (v && !v.getAttribute('src') && !v.getAttribute('data-src')) { v.setAttribute('data-src', 'assets/video/cover-band-' + (mq('(min-width: 768px)').matches ? 'd' : 'm') + '.mp4'); }
})();

/* ---------- static bindings ---------- */
function bindStatic() {
  var p = DATA.passes, c = DATA.club, one = null;
  (p.packs || []).forEach(function (k) { if (k.id === 'class-1') { one = k; } });
  var prices = { day: p.day && p.day.price_idr, 'class-1': (one && one.price_idr) || (p['class-1'] && p['class-1'].price_idr), duo: p.duo.price_idr, 'duo-total': p.duo.price_idr * (p.duo.people || 2), 'duo-old': p.duo.old_price_idr, recharge_day: p.recharge_day && p.recharge_day.price_idr };
  var r = rating();
  qsa('[data-rate="value"]').forEach(function (el) { el.textContent = String(r.value); });
  qsa('[data-rate="count"]').forEach(function (el) { el.textContent = String(r.count); });
  qsa('.grate[role="img"]').forEach(function (el) { el.setAttribute('aria-label', 'Rated ' + r.value + ' out of 5 from ' + r.count + ' Google reviews'); });
  qsa('[data-price]').forEach(function (el) { var v = prices[el.getAttribute('data-price')]; if (v) { el.textContent = EF.api.k(v); } });
  qsa('[data-bind="weekly-count"]').forEach(function (el) { el.textContent = EF.api.weeklyCount(); });
  qsa('[data-bind="weekend-note"]').forEach(function (el) { el.textContent = DATA.timetable.weekend_note; });
  qsa('[data-bind="address"]').forEach(function (el) { el.textContent = c.address; });
  qsa('[data-bind="wa-link"]').forEach(function (el) { el.textContent = c.whatsapp.number; el.href = 'https://wa.me/' + c.whatsapp.wa; });
}

/* ---------- 01 next up: three hairline rows ---------- */
var nextBox = null, lastSpots = {};
function renderNext(roll) {
  nextBox = nextBox || qs('[data-nextup]');
  if (!nextBox) { return; }
  var list = EF.api.upcoming(3);
  if (!list.length) { nextBox.innerHTML = '<p class="nextup__loading">No classes left this week. New dates appear every day.</p>'; return; }
  nextBox.innerHTML = list.map(function (o, i) {
    var when = dayLabel(o) + (o.dayIndex < 2 ? ' · ' + EF.api.dateShort(o.ymd) : ' ' + EF.api.dateShort(o.ymd).split(' ').slice(1).join(' '));
    var cap = Math.max(capOf(o), o.spotsLeft), clip = CLIPS[o.family && o.family.id] || CLIPS.sculpt;
    return '<button class="ncard" type="button" data-testid="next-card" data-occ="' + esc(o.id) + '" style="--i:' + i + '" aria-haspopup="dialog" aria-label="' + esc(o.cls.name + ', ' + when + ' at ' + o.time + ' with ' + o.coach.name + '. ' + (o.full ? 'Full. Join the waitlist' : o.spotsLeft + ' of ' + cap + ' spots free. Book')) + '">' +
      '<span class="ncard__when meta">' + esc(when) + '</span>' +
      '<span class="ncard__time">' + esc(o.time) + '</span>' +
      '<span class="ncard__main"><span class="ncard__name">' + esc(o.cls.name) + '</span>' +
      '<span class="ncard__meta"><span class="who">' + avImg(o.coach, 28, ' loading="lazy"') + 'with ' + esc(o.coach.name) + '</span><span>' + plainLength(o.cls) + '</span><span>' + plainLevel(o.cls) + '</span>' + (clip.stock ? '<span class="stocktag">Stock clip</span>' : '') + '</span></span>' +
      '<span class="ncard__clip" aria-hidden="true"><span class="ncard__frame" data-family="' + esc(clip.f) + '">' +
        '<img class="media__poster" src="assets/img/' + clip.f + '-tall-poster.webp" alt="" width="720" height="1280" loading="lazy" decoding="async">' +
        '<video data-clip data-group="nextup" muted loop playsinline preload="none" src="assets/video/' + clip.f + '-tall.mp4" aria-hidden="true" tabindex="-1"></video></span></span>' +
      '<span class="ncard__foot"><span class="spots" data-spots="' + esc(o.id) + '">' + seatRow(o) + '</span>' +
      '<span class="fauxbtn">' + (o.full ? 'Join waitlist' : 'Book') + ' <span class="arr" aria-hidden="true">→</span></span></span>' +
    '</button>';
  }).join('');
  list.forEach(function (o) { lastSpots[o.id] = o.spotsLeft; });
  qsa('.ncard', nextBox).forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-occ')); }); });
  scanMotion(nextBox.parentNode);
  if (EF.media && EF.media.scan) { EF.media.scan(nextBox); }
}

/* ---------- 02 the four features ---------- */
function renderFeatures() {
  qsa('[data-feat-body]').forEach(function (box) {
    var fid = box.getAttribute('data-feat-body'), fam = EF.api.family(fid);
    if (!fam) { return; }
    var classes = EF.api.classesInFamily(fid), weekly = 0, coachIds = [];
    classes.forEach(function (c) { weekly += EF.api.slots(c.id).length; if (coachIds.indexOf(c.coach) < 0) { coachIds.push(c.coach); } });
    var coaches = coachIds.map(function (id) { return EF.api.coach(id); }).filter(Boolean);
    var html = '<p class="eyebrow feat__label" data-rule><span class="meta">' + esc(fam.label) + '</span><span class="meta">' + plural(weekly, 'class', 'classes') + ' a week</span></p>' +
      '<h3 class="feat__name" data-lines>' + kt(fam.name) + '</h3>' +
      '<p class="feat__feel">' + esc(fam.feel) + '</p>' +
      '<ul class="feat__meta"><li>60 min</li><li>' + esc(fam.level_line) + '</li>' + (STOCK_MEDIA[fid] ? '<li class="stocktag">' + STOCK_MEDIA[fid] + '</li>' : '') + '<li>' +
        coaches.map(function (co) { return '<span class="who">' + avImg(co, 28, ' loading="lazy"') + esc(co.name) + '</span>'; }).join(' ') + '</li></ul>' +
      '<ol class="cidx">' + classes.map(function (c) {
        var slots = EF.api.slots(c.id).map(function (s) { return s.dowShort + ' ' + s.time; }).join(', ');
        var co = EF.api.coach(c.coach), next = EF.api.occ(c.id);
        var lvl = plainLevel(c) + (isSample(c, 'length') ? ' · ' + plainLength(c) : '');
        return '<li class="cidx__row" data-rule><button class="cidx__hit" type="button" aria-expanded="false" aria-controls="cx-' + esc(c.id) + '">' +
          '<span class="cidx__name">' + esc(c.name) + '</span>' +
          '<span class="cidx__sub">with ' + esc(co ? co.name : '') + ' · ' + lvl + '<br>' + esc(slots) + '</span>' +
          '<span class="cidx__plus" aria-hidden="true"></span></button>' +
          '<div class="cidx__more" id="cx-' + esc(c.id) + '" inert><div><div class="cidx__in">' +
          '<p>' + esc(c.description) + '</p>' +
          (next ? '<button class="link-t" type="button" data-open-occ="' + esc(next.id) + '"><span>Book the next one: ' + esc(dayPhrase(next) + ' at ' + next.time) + '</span> <span aria-hidden="true">→</span></button>' : '') +
          '</div></div></div></li>';
      }).join('') + '</ol>' +
      '<a class="link-t" href="#schedule" data-filter-family="' + esc(fid) + '"><span>See ' + esc(fam.name.toLowerCase()) + ' times</span> <span aria-hidden="true">→</span></a>';
    box.innerHTML = html;
  });
  qsa('.cidx__hit').forEach(function (b) {
    b.addEventListener('click', function () {
      var row = b.parentNode, open = !row.classList.contains('is-open');
      row.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var more = qs('.cidx__more', row);
      if (more) { if (open) { more.removeAttribute('inert'); } else { more.setAttribute('inert', ''); } }
    });
  });
  qsa('[data-open-occ]').forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-open-occ')); }); });
}

/* ---------- 03 the week ---------- */
var S = { day: 0, family: '', coaches: [], times: [], levels: [] };
var sched = {};
var mode = '';
var TIMES = [
  { id: 'morning', name: 'Morning, before 12:00', band: 'Morning', sub: 'Before 12:00', test: function (t) { return t < '12:00'; } },
  { id: 'afternoon', name: 'Afternoon, from 12:00', band: 'Afternoon', sub: 'From 12:00', test: function (t) { return t >= '12:00' && t < '17:00'; } },
  { id: 'evening', name: 'Evening, from 17:00', band: 'Evening', sub: 'From 17:00', test: function (t) { return t >= '17:00'; } }
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
function weekRows(f) { var n = 0; EF.api.week().forEach(function (day) { n += day.occs.filter(function (o) { return matches(o, f); }).length; }); return n; }
function stateOf(o) {
  if (o.booking && !o.booking.waitlist) { return { spots: "You're booked", act: 'Booked', aria: 'Booked: ' }; }
  if (o.booking && o.booking.waitlist) { return { spots: 'On the waitlist', act: 'On the list', aria: 'On the waitlist: ' }; }
  if (o.full) { return { spots: 'Full · Join waitlist', act: 'Join waitlist', aria: 'Join waitlist for ', seats: true }; }
  return { spots: o.spotsLeft + ' of ' + Math.max(capOf(o), o.spotsLeft) + ' spots free', act: 'Book', aria: 'Book ', seats: true };
}

/* list (phones and tablets) */
/* Both modes share one day control (shared page contract: [data-days] with day-0 … day-6, [data-day-title], [data-day-count],
   [data-day-done]); "row" / "row-book" always mean the selected day's classes.
   Phones and tablets: the date strip and the list.
   1024 px and up (and room for seven columns): the same 7 day tabs sit on top of a printed 7-column timetable; the selected day's column is marked
   and its classes are the rows. Every other class in the week stays bookable from its cell. */
function dayControlHtml() {
  return '<div class="days" role="tablist" aria-label="Pick a day" data-days></div>';
}
function dayMetaHtml() {
  return '<div class="sched__day" aria-live="polite"><h3 class="sched__date" data-day-title>This week</h3><p class="sched__count" data-day-count></p></div>' +
    '<p class="sched__done" data-day-done hidden></p>';
}
function bindDays() {
  sched.days.addEventListener('click', function (e) { var b = e.target.closest('.day'); if (b) { selectDay(+b.getAttribute('data-day')); } });
  sched.days.addEventListener('keydown', function (e) {
    var k = e.key, n = EF.api.week().length, i = S.day;
    if (k === 'ArrowRight') { i = (i + 1) % n; } else if (k === 'ArrowLeft') { i = (i - 1 + n) % n; } else if (k === 'Home') { i = 0; } else if (k === 'End') { i = n - 1; } else { return; }
    e.preventDefault(); selectDay(i, true);
  });
}
function grabShell() {
  sched.days = qs('[data-days]', sched.view);
  sched.title = qs('[data-day-title]', sched.view);
  sched.count = qs('[data-day-count]', sched.view);
  sched.done = qs('[data-day-done]', sched.view);
  bindDays();
}
function listShell() {
  sched.view.innerHTML = dayControlHtml() + dayMetaHtml() + '<ol class="rows" data-rows id="sched-rows" aria-label="Classes"></ol>';
  grabShell();
  sched.rows = qs('[data-rows]', sched.view);
  sched.tt = null;
  sched.rows.addEventListener('click', function (e) { var t = e.target.closest('[data-book], [data-open]'); if (t) { openOcc(t.getAttribute('data-book') || t.getAttribute('data-open')); } });
}
function tableShell() {
  sched.view.innerHTML = dayMetaHtml() + '<div class="tt-days">' + dayControlHtml() + '</div><div class="tt-wrap" data-tt data-rows id="sched-rows"></div>';
  grabShell();
  sched.rows = null;
  sched.tt = qs('[data-tt]', sched.view);
  sched.tt.addEventListener('click', function (e) { var t = e.target.closest('[data-book]'); if (t) { openOcc(t.getAttribute('data-book')); } });
}
function renderDays() {
  var wk = EF.api.week(), booked = {};
  (store().bookings || []).forEach(function (b) { booked[b.ymd] = true; });
  sched.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (day.isToday ? ' is-today' : '') + (booked[day.ymd] ? ' has-booking' : '') + '" style="--d:' + i + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
      '<span class="day__dow meta">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span><span class="day__num">' + day.dayNum + '</span><span class="day__mon meta" aria-hidden="true">' + esc(day.monthShort) + '</span><span class="vh">, ' + esc(day.long + ', ' + plural(day.occs.length, 'class', 'classes')) + '</span><span class="day__dot" aria-hidden="true"></span></button>';
  }).join('');
  moveInd();
}
function moveInd() {
  if (!sched.days) { return; }
  var ind = qs('.days__ind', sched.days), btn = qs('[data-day="' + S.day + '"]', sched.days);
  if (!ind || !btn) { return; }
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
}
function vt(fn) {
  if (motionOn() && d.startViewTransition && !(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) { try { d.startViewTransition(fn); return true; } catch (e) { } }
  fn(); return false;
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
  if (mode === 'table') { vt(function () { renderTable(false); }); flashCol(i); } else { vt(function () { renderRows(false); }); }
}
function renderDayMeta(count) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day || !sched.title) { return; }
  sched.title.innerHTML = kt((day.isToday ? 'Today, ' : '') + day.long);
  sched.count.textContent = plural(count, 'class', 'classes');
  var left = day.occs.filter(function (o) { return !o.past; }).length;
  if (day.isToday && day.occs.length && !left) {
    var tmr = wk[1] && wk[1].occs[0];
    sched.done.textContent = "That's today done." + (tmr ? ' Tomorrow starts at ' + tmr.time + ' with ' + tmr.cls.name + '.' : '');
    sched.done.hidden = false;
  } else { sched.done.hidden = true; }
}
function lrHtml(o, i) {
  var st = stateOf(o), act;
  if (o.past) { act = '<span class="row__label">Finished</span>'; }
  else { act = '<button class="rbtn' + (o.booking && !o.booking.waitlist ? ' rbtn--booked' : '') + '" type="button" data-testid="row-book" data-book="' + esc(o.id) + '" aria-label="' + esc(st.aria + o.cls.name + ' at ' + o.time) + '">' + esc(st.act) + '</button>'; }
  return '<li class="lr' + (o.past ? ' is-past' : '') + (o.booking ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '"' + (o.past ? ' data-past' : '') + ' style="--i:' + i + '">' +
    (o.past ? '' : '<button class="lr__hit" type="button" data-open="' + esc(o.id) + '" aria-label="' + esc(o.cls.name + ', ' + o.time + ' with ' + o.coach.name + '. ' + st.spots + '. See details') + '" tabindex="-1"></button>') +
    '<p class="lr__time">' + esc(o.time) + '<span class="lr__len">' + plainLength(o.cls) + '</span></p>' +
    '<p class="lr__name">' + esc(o.cls.name) + '</p>' +
    '<div class="lr__act">' + act + '</div>' +
    '<p class="lr__by">' + avImg(o.coach, 28, ' loading="lazy"') + '<span>' + esc(o.coach.name) + '</span><span aria-hidden="true">·</span><span>' + plainLevel(o.cls) + '</span></p>' +
    '<p class="lr__spots">' + (o.past ? 'Finished' : (st.seats ? seatRow(o) : esc(st.spots))) + '</p></li>';
}
var swapTimer = 0;
function renderRows(animate) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day || !sched.rows) { return; }
  var list = dayRows(S.day, S);
  var draw = function () {
    sched.rows.innerHTML = list.map(lrHtml).join('');
    if (animate && motionOn()) { qsa('.lr', sched.rows).forEach(function (r) { r.classList.add('is-enter'); }); }
    sched.rows.classList.remove('is-swapping');
    sched.empty.hidden = list.length > 0;
    qs('p', sched.empty).textContent = 'Nothing matches on this day. Try another day or clear the filters.';
    renderDayMeta(list.length);
  };
  clearTimeout(swapTimer);
  if (animate && motionOn()) { sched.rows.classList.add('is-swapping'); swapTimer = setTimeout(draw, 160); } else { draw(); }
  renderBadge();
}

/* timetable (1024 px and up, with room): 7 day columns × 3 bands; the selected day's entries are the shared page-contract rows */
/* class names wrap on whole words only: no soft hyphens (visual audit v2, G-1) */
function tcHtml(o, i, sel, col, k) {
  var st = stateOf(o), rowId = sel ? 'row' : 'tt-cell', btnId = sel ? 'row-book' : 'tt-book';
  if (o.past) {
    return '<li class="tc is-past" data-testid="' + rowId + '" data-occ="' + esc(o.id) + '" data-past><span class="tc__time">' + esc(o.time) + '</span><span class="tc__name">' + esc(o.cls.name) + '</span><span class="tc__spots">Finished</span></li>';
  }
  return '<li class="tc' + (o.booking && !o.booking.waitlist ? ' tc--booked' : '') + '" data-testid="' + rowId + '" data-occ="' + esc(o.id) + '" style="--i:' + Math.min(i, 12) + ';--c:' + (col || 0) + ';--r:' + (k || 0) + '">' +
    '<button class="tc__hit" type="button" id="tc-' + esc(o.id) + '" data-testid="' + btnId + '" data-book="' + esc(o.id) + '" aria-haspopup="dialog" aria-label="' + esc(st.aria + o.cls.name + ', ' + dayLabel(o) + ' at ' + o.time + ' with ' + o.coach.name + ', ' + o.cls.level + '. ' + st.spots) + '">' +
    '<span class="tc__time">' + esc(o.time) + '</span>' +
    '<span class="tc__name">' + esc(o.cls.name) + '</span>' +
    '<span class="tc__spots">' + (o.booking ? esc(st.spots) : seatRow(o)) + '</span>' +
    '</button></li>';
}
function renderTable(animate) {
  var wk = EF.api.week(), total = 0, n = 0;
  if (!sched.tt) { return; }
  var bands = S.times.length ? TIMES.filter(function (t) { return S.times.indexOf(t.id) > -1; }) : TIMES;
  var head = '<thead class="tt__head"><tr><th scope="col" class="tt__corner"><span class="vh">Time of day</span></th>' + wk.map(function (day, i) {
    return '<th scope="col" data-col="' + i + '"' + (i === S.day ? ' class="is-sel"' : '') + '><span class="vh">' + esc((day.isToday ? 'Today, ' : '') + day.long) + '</span></th>';
  }).join('') + '</tr></thead>';
  var body = '<tbody>' + bands.map(function (b) {
    return '<tr><th scope="row" class="tt__band"><b>' + esc(b.band) + '</b><span>' + esc(b.sub) + '</span></th>' + wk.map(function (day, i) {
      var occs = day.occs.filter(function (o) { return b.test(o.time) && matches(o, S); });
      total += occs.length;
      return '<td data-col="' + i + '"' + (i === S.day ? ' class="is-sel"' : '') + '>' + (occs.length ? '<ul class="tt__list">' + occs.map(function (o, k) { return tcHtml(o, n++, i === S.day, i, k); }).join('') + '</ul>' : '<span class="tt__none"><span aria-hidden="true">—</span><span class="vh">No classes</span></span>') + '</td>';
    }).join('') + '</tr>';
  }).join('') + '</tbody>';
  var draw = function () {
    sched.tt.innerHTML = '<table class="tt" data-testid="timetable"><caption class="tt__cap"><span class="vh">Classes for the next seven days, by day and time of day. </span>Spots, waitlists and most levels in this grid are sample data.</caption>' + head + body + '</table>';
    if (animate && motionOn()) { qsa('.tc', sched.tt).forEach(function (r) { r.classList.add('is-enter'); }); }
    sched.empty.hidden = dayRows(S.day, S).length > 0;
    qs('p', sched.empty).textContent = total ? 'Nothing matches on this day. Pick another day in the timetable or clear the filters.' : 'Nothing matches this week. Clear the filters to see every class.';
    sched.tt.style.opacity = '';
    renderDayMeta(dayRows(S.day, S).length);
  };
  clearTimeout(swapTimer);
  if (animate && motionOn() && sched.tt.firstChild) { sched.tt.style.transition = 'opacity .16s linear'; sched.tt.style.opacity = '0'; swapTimer = setTimeout(draw, 160); } else { draw(); }
  renderBadge();
}
function flashCol(i) {
  if (!sched.tt) { return; }
  qsa('td[data-col="' + i + '"]', sched.tt).forEach(function (td) { td.classList.remove('is-flash'); void td.offsetWidth; td.classList.add('is-flash'); });
}
function renderSchedule(animate) {
  if (animate) { vt(function () { renderDays(); if (mode === 'table') { renderTable(false); } else { renderRows(false); } }); return; }
  renderDays();
  if (mode === 'table') { renderTable(false); } else { renderRows(false); }
}
function setMode() {
  var room = sched.box ? sched.box.getBoundingClientRect().width : 0;
  var m = (mqTable.matches && room >= 780) ? 'table' : 'list';
  if (m === mode) { return; }
  mode = m;
  if (mode === 'list') { listShell(); } else { tableShell(); }
  renderSchedule(false);
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
  var wk = EF.api.week(), i;
  for (i = 0; i < wk.length; i++) { if (wk[i].occs.some(function (o) { return !o.past; })) { return i; } }
  return 0;
}
function initSchedule() {
  var box = qs('[data-schedule]');
  if (!box) { return; }
  sched = { box: box, view: qs('[data-sched-view]', box), chips: qs('[data-fchips]', box), badge: qs('[data-filter-count]', box), empty: qs('[data-empty]', box) };
  S.day = firstOpenDay();
  setMode();
  onMq(mqTable, function () { setMode(); });
  if (w.ResizeObserver) { var rw = 0; new w.ResizeObserver(function () { clearTimeout(rw); rw = setTimeout(setMode, 80); }).observe(box); }
  sched.chips.addEventListener('click', function (e) {
    var c = e.target.closest('.fchip'); if (!c) { return; }
    S.family = c.getAttribute('data-fam') || '';
    renderSchedule(true);
  });
  qsa('[data-clear-filters]').forEach(function (b) { b.addEventListener('click', function () { S.family = ''; S.coaches = []; S.times = []; S.levels = []; renderSchedule(true); }); });
  var fb = qs('[data-open-filters]', box);
  if (fb) { fb.addEventListener('click', function () { if (EF.sheet && EF.sheet.open) { EF.sheet.open('filters', {}, '?view=filters'); } }); }
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(moveInd, 120); });
  registerFilters();
}
EF.schedule = {
  show: function (o) {
    o = o || {};
    if (!sched.view) { return; }
    if (o.ymd) { EF.api.week().forEach(function (day, i) { if (day.ymd === o.ymd) { S.day = i; } }); }
    if (o.family != null) { S.family = o.family; }
    renderBadge();
    selectDay(S.day);
    var sec = d.getElementById('schedule');
    scrollToEl(sec);
    try { sec.focus({ preventScroll: true }); } catch (e) { }
  },
  state: function () { var s = copyF(S); s.mode = mode; return s; }
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
          return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? avImg(img, 26) : '') + esc(name) + '</button>';
        }
        var scope = 'For ' + esc(EF.api.week()[S.day].long) + (mode === 'table' ? ', and the rest of the week in the timetable.' : '.');
        body.innerHTML = '<div data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">' + scope + '</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="opts">' + tog('family', '', 'All classes', !F.family) + DATA.families.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="opts">' + DATA.coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c); }).join('') + '</div></fieldset>' +
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
          var n = dayRows(S.day, F).length;
          apply.innerHTML = 'Show ' + plural(n, 'class', 'classes') + (mode === 'table' ? ' <span class="apply__wk">· ' + weekRows(F) + ' this week</span>' : '') + ' <span class="arr" aria-hidden="true">→</span>';
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
          renderSchedule(true);
          EF.sheet.close();
        });
        sync();
      }
    };
  });
}

/* ---------- 04 coaches ---------- */
function teaches(id) {
  var names = [];
  DATA.classes.forEach(function (c) { if (c.coach === id && names.indexOf(c.name) < 0) { names.push(c.name); } });
  if (names.length < 2) { return names.join(''); }
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}
function renderCoaches() {
  var box = qs('[data-coaches]');
  if (!box) { return; }
  box.innerHTML = DATA.coaches.map(function (c, i) {
    return '<button class="coach" type="button" data-testid="coach-' + esc(c.id) + '" data-coach="' + esc(c.id) + '" style="--i:' + i + '">' +
      '<span class="coach__photo"><img src="' + esc(c.photo) + '" alt="' + esc(c.name + ', coach at Elite Fit') + '" width="600" height="750" loading="lazy" decoding="async"><span class="coach__n meta" aria-hidden="true">0' + (i + 1) + '</span></span>' +
      '<span class="coach__name">' + esc(c.name) + '</span>' +
      '<span class="coach__role">' + esc(c.role || ('Teaches ' + teaches(c.id))) + '</span>' +
      '<span class="coach__count">' + plural(EF.api.coachWeekly(c.id), 'class', 'classes') + ' a week</span>' +
      '<span class="link-t coach__link"><span>Meet ' + esc(c.name) + '</span> <span aria-hidden="true">→</span></span></button>';
  }).join('');
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-coach]');
    if (b && EF.booking && EF.booking.openCoach) { EF.booking.openCoach(b.getAttribute('data-coach')); }
  });
  scanMotion(box.parentNode);
}

/* ---------- sticky bar (P2, P6): shown only once the hero Book, the hero rating and quote and, on desktop, the trust badge have all
   left the screen above (a mark hidden at this width counts as gone). Hidden over the +1 offer, the pull-quote score, the footer,
   while the sheet is open and while a page field has focus. The Now bar (and on desktop the masthead) is pinned by CSS. ---------- */
function initBars() {
  var bar = qs('[data-buybar]'), hdr = qs('#hdr'), hero = qs('[data-testid="hero-book"]') || qs('#top');
  var marks = [hero, qs('#top .trust'), qs('#top .hq'), qs('[data-trust-badge]')].filter(Boolean);
  var barBtn = bar && qs('button', bar), hdrBtn = hdr && qs('.hdr__cta', hdr);
  var st = { pastHero: false, blocked: {}, sheet: !!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen()), typing: false, jump: /^#./.test(w.location.hash || '') };
  var barWasOn = false, lastFocusAt = 0;
  function apply() {
    var blocked = st.blocked.offer || st.blocked.footer || st.blocked.score;
    var onBar = st.pastHero && !blocked && !st.sheet && !st.typing && !st.jump;
    var onHdr = st.pastHero && !st.sheet && !mqDesk.matches;
    if (bar) { bar.classList.toggle('is-on', onBar); bar.setAttribute('aria-hidden', onBar ? 'false' : 'true'); if (barBtn) { barBtn.tabIndex = onBar ? 0 : -1; } }
    /* handover v2 D4d: the bar that just slid in must not land on the control that keyboard focus moved to a moment ago */
    if (onBar && !barWasOn) { var a = d.activeElement; if (a && a !== d.body && Date.now() - lastFocusAt < 1500 && qs('#page').contains(a)) { keepClear(a, true); } }
    barWasOn = onBar;
    if (hdr) { hdr.classList.toggle('cta-on', onHdr); if (hdrBtn) { hdrBtn.tabIndex = onHdr ? 0 : -1; hdrBtn.setAttribute('aria-hidden', onHdr ? 'false' : 'true'); } }
  }
  /* a mark counts as gone once it is entirely above the screen. The observer's root reaches far below the screen, so a mark below it
     still "intersects" and an anchor jump that carries a mark from below to above crosses the edge and is reported. A mark hidden at
     this width never intersects and counts as gone. No scroll listener, no layout reads. */
  if ('IntersectionObserver' in w) {
    if (marks.length) {
      var gone = [];
      var mio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { gone[marks.indexOf(e.target)] = !e.isIntersecting; });
        st.pastHero = marks.every(function (m, i) { return !!gone[i]; });
        apply();
      }, { rootMargin: '0px 0px 100000px 0px' });
      marks.forEach(function (m) { mio.observe(m); });
    }
    /* the pull-quote's 4.7 is a rating: the bar hides as soon as it enters the screen (one rating per screen), the offer and footer a little later */
    [['offer', '#plus-one', '0px 0px -60px 0px'], ['score', '#review .pq__score', '0px'], ['footer', '#footer', '0px 0px -60px 0px']].forEach(function (p) {
      var el = qs(p[1]);
      if (el) { new IntersectionObserver(function (es) { st.blocked[p[0]] = es[0].isIntersecting; apply(); }, { rootMargin: p[2] }).observe(el); }
    });
  }
  d.addEventListener('ef:sheet', function (e) { st.sheet = !!(e.detail && e.detail.open); apply(); });
  /* #34: at rest after an anchor jump no fixed bar sits on a face or a heading, so the bottom bar waits until the visitor scrolls again
     (wheel, touch or a scrolling key). Jumps: a page loaded with a #hash, an in-page link, a hash change. No scroll listener. */
  var jumpAt = 0;
  function jumped() { st.jump = true; jumpAt = Date.now(); apply(); }
  function moved(e) { if (!st.jump || Date.now() - jumpAt < 350) { return; } if (e.type === 'keydown' && !/^(Arrow|Page|Home|End| )/.test(e.key || '')) { return; } st.jump = false; apply(); }
  d.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href').length > 1) { jumped(); } });
  w.addEventListener('hashchange', jumped);
  ['wheel', 'touchmove', 'keydown'].forEach(function (n) { w.addEventListener(n, moved, { passive: true }); });
  if (st.jump) { jumpAt = Date.now(); }
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { st.typing = true; apply(); } });
  d.addEventListener('focusin', function (e) {
    var t = e.target; if (!t || !t.getBoundingClientRect || !qs('#page').contains(t) || (t.closest && t.closest('.nowbar, .hdr'))) { return; }
    /* anchor targets (sections focused by a jump) and anything taller than half the screen are left where the jump put them */
    if (t.matches('section, [tabindex="-1"]') || t.getBoundingClientRect().height > (w.innerHeight || 800) / 2) { return; }
    lastFocusAt = Date.now();
    w.requestAnimationFrame(function () { keepClear(t, false); });
    /* the bar may slide in after this focus (the focus scroll carries the page past the hero): check again once things settle */
    [600, 1100].forEach(function (ms) { w.setTimeout(function () { if (d.activeElement === t) { keepClear(t, true); } }, ms); });
  });
  /* the bar's resting top (its slide-in transform is ignored), so a check made mid-slide aims at where the bar will stop */
  function barRestTop() {
    if (!bar || !bar.classList.contains('is-on')) { return w.innerHeight || 0; }
    return (w.innerHeight || 0) - (parseFloat(w.getComputedStyle(bar).bottom) || 0) - bar.offsetHeight;
  }
  /* keep focus clear of the fixed bars. settle = a later re-check: it never pulls back a control the visitor has scrolled away from */
  function keepClear(t, settle) {
    if (!t || !t.getBoundingClientRect || d.activeElement !== t) { return; }
    var r = t.getBoundingClientRect(), vh = w.innerHeight || 0;
    if (settle && (r.bottom <= 0 || r.top >= vh)) { return; }
    var top = (qs('.nowbar') ? qs('.nowbar').getBoundingClientRect().bottom : 0), hd = mqDesk.matches && hdr ? hdr.getBoundingClientRect().bottom : 0;
    var low = barRestTop();
    top = Math.max(top, hd);
    if (r.bottom > low - 8) { nudge(r.bottom - low + 24); } else if (r.top < top + 8) { nudge(r.top - top - 24); }
  }
  /* a focus nudge is instant, like the browser's own focus scroll: a smooth one is still under way when the next control gets focus */
  function nudge(dy) { try { w.scrollBy({ top: dy, left: 0, behavior: 'instant' }); } catch (e) { w.scrollBy(0, dy); } }
  d.addEventListener('focusout', function () { if (st.typing) { st.typing = false; apply(); } });
  onMq(mqDesk, apply);
  apply();
}

/* ---------- cover pull-quote (P4): one real Google review at a time, verbatim cuts of 12 words or fewer, a 0.4 s crossfade every 3.5 s.
   All five slides are in the HTML, so the box is sized before any script runs (no layout shift). A quote that needs more lines than the
   box allows at the current width (2 on phones, 3 from 1024 px) is skipped there, never cut. Pauses while the cover is off screen, on
   hover, on focus, with the pause control and while the tab is hidden; static under reduced motion and Save-Data. ---------- */
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var items = qsa('.hq__slide', box), btn = qs('[data-hq-pause]', box), usable = [], cur = 0, timer = 0, userPaused = false, hover = false, focusIn = false, inView = true;
  if (!items.length) { return; }
  function show(i) {
    items.forEach(function (it) { it.classList.remove('is-on'); it.setAttribute('aria-hidden', 'true'); });
    cur = (i + usable.length) % usable.length;
    usable[cur].classList.add('is-on'); usable[cur].removeAttribute('aria-hidden');
  }
  function measure() {
    var max = mqDesk.matches ? 3 : 2;
    items.forEach(function (it) { it.classList.remove('is-skip'); });
    usable = items.filter(function (it) {
      var p = qs('blockquote p', it), lh = parseFloat(getComputedStyle(p).lineHeight) || 26;
      var fits = p.getBoundingClientRect().height <= lh * max + 2;
      it.classList.toggle('is-skip', !fits);
      return fits;
    });
    if (!usable.length) { usable = [items[0]]; items[0].classList.remove('is-skip'); }
    show(0);
    if (btn) { btn.hidden = usable.length < 2 || !motionOn(); }
    items.forEach(function (it, i) { it.setAttribute('aria-label', (usable.indexOf(it) + 1 || i + 1) + ' of ' + usable.length); });
  }
  function auto() { return motionOn() && !userPaused && !hover && !focusIn && inView && !d.hidden && usable.length > 1; }
  function tick() { clearTimeout(timer); if (auto()) { timer = setTimeout(function () { show(cur + 1); tick(); }, 3500); } }
  if ('IntersectionObserver' in w) { new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== inView) { inView = v; tick(); } }).observe(box); }
  if (btn) { btn.addEventListener('click', function () { userPaused = !userPaused; btn.setAttribute('aria-pressed', userPaused ? 'true' : 'false'); btn.setAttribute('aria-label', (userPaused ? 'Play' : 'Pause') + ' the review quotes'); tick(); }); }
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  box.addEventListener('focusin', function () { focusIn = true; tick(); });
  box.addEventListener('focusout', function () { focusIn = false; tick(); });
  d.addEventListener('visibilitychange', tick);
  var rt = 0, lastW = w.innerWidth;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (w.innerWidth === lastW) { return; } lastW = w.innerWidth; measure(); tick(); }, 200); });
  measure(); tick();
}

/* ---------- P23: the live Now / Next bar. Finds the class running now (start <= now < end) or the next one, in Bali time from EF.api.now()
   (which honours ?now=), ticks every second (mm:ss under an hour, h:mm:ss above) and rolls over by itself. A tap opens the sheet for the
   next bookable session of that class (a class-specific entry). Screen readers get a role="timer" line updated once a minute. ---------- */
var NB_ICON = {
  boxing: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.5 17.5V9.6a4.6 4.6 0 0 1 9.2 0v3.9a4 4 0 0 1-4 4z"/><path d="M7.5 12.2H6a1.7 1.7 0 0 1 0-3.4h1.5"/><path d="M8.5 17.5v3h7.2v-3"/><path d="M11 9.4h3.6"/></svg>',
  conditioning: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.6 9.6 8.2 6.8a3.8 3.8 0 0 1 7.6 0l-.4 2.8"/><circle cx="12" cy="14.6" r="5.9"/><path d="M9.8 15.2h4.4"/></svg>',
  sculpt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 10v4M6 7.5v9M18 7.5v9M21 10v4M6 12h12"/></svg>',
  mobility: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="15.5" cy="4.8" r="1.9"/><path d="M14.6 7.6 11.5 13.4l5.6 3.2M11.5 13.4 5 17.6M13.9 9.5l5.4-1.2M3.5 20.5h17"/></svg>'
};
var NB_SHORT = { 'hyrox-conditioning': 'HYROX', 'off-court-training': 'Off-Court', 'boxercise-beginner': 'Boxercise', 'boxercise-advanced': 'Boxercise', 'booty-and-core': 'Booty & Core', 'injury-prevention-mobility': 'Injury Prevention' };
function nbFmt(ms) {
  var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return h > 0 ? h + ':' + p(m) + ':' + p(x) : p(m) + ':' + p(x);
}
function nbWords(ms) {
  var mins = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  return (h ? plural(h, 'hour', 'hours') + (m ? ' ' : '') : '') + (m ? plural(m, 'minute', 'minutes') : '');
}
function initNowBar() {
  var bar = qs('[data-nowbar]');
  if (!bar || !EF.api || !EF.api.now || !EF.api.week) { return; }
  var hit = qs('[data-nb-hit]', bar), bg = qs('[data-nb-bg]', bar), sr = qs('[data-nb-sr]', bar);
  var el = { k: qs('[data-nb-k]', bar), ic: qs('[data-nb-ic]', bar), full: qs('[data-nb-full]', bar), short: qs('[data-nb-short]', bar), who: qs('[data-nb-who]', bar), pd: qs('[data-nb-pd]', bar), pm: qs('[data-nb-pm]', bar), am: qs('[data-nb-am]', bar), cd: qs('[data-nb-cd]', bar) };
  var cur = null, fam = '', lastMin = -1, timer = 0;
  function pick() {
    var t = EF.api.now(), now = null, next = null;
    EF.api.week().forEach(function (day) { day.occs.forEach(function (o) {
      if (o.start <= t && t < o.end && !now) { now = o; }
      if (o.start > t && (!next || o.start < next.start)) { next = o; }
    }); });
    return now ? { live: true, o: now, at: now.end } : (next ? { live: false, o: next, at: next.start } : null);
  }
  function surface(f) {
    if (f === fam) { return; }
    fam = f;
    bg.innerHTML = '<img src="assets/img/nowbar-' + f + '.webp" alt="" width="480" height="60" decoding="async">' +
      '<video data-clip data-group="nowbar" muted loop playsinline preload="none" src="assets/video/nowbar-' + f + '.mp4" aria-hidden="true" tabindex="-1"></video>';
    if (EF.media && EF.media.scan) { EF.media.scan(bg); }
  }
  function draw() {
    var o = cur.o, f = (o.family && o.family.id) || 'sculpt';
    el.k.textContent = cur.live ? 'Now' : 'Next';
    el.ic.innerHTML = NB_ICON[f] || NB_ICON.sculpt;
    el.full.textContent = o.cls.name;
    el.short.textContent = NB_SHORT[o.classId || o.cls.id] || o.cls.name;
    el.who.innerHTML = avImg(o.coach, 20) + esc(o.coach.name);
    /* #43: wider screens "ends in 23:14" / "starts in 1:12:05"; phones (414 px and below) "23:14 left" / "in 1:12:05" */
    el.pd.textContent = cur.live ? 'ends in' : 'starts in';
    el.pm.textContent = cur.live ? '' : 'in';
    el.am.textContent = cur.live ? 'left' : '';
    surface(f);
    hit.hidden = false;
    bar.classList.add('is-live');
  }
  function tick() {
    var t = EF.api.now();
    if (!cur || t >= cur.at) { cur = pick(); lastMin = -1; if (!cur) { hit.hidden = true; bar.classList.remove('is-live'); return; } draw(); }
    var left = cur.at - t;
    el.cd.textContent = nbFmt(left);
    var mins = Math.ceil(left / 60000);
    if (mins !== lastMin) {
      lastMin = mins;
      var line = (cur.live ? 'Now: ' : 'Next: ') + cur.o.cls.name + ' with ' + cur.o.coach.name + ', ' + (cur.live ? 'ends' : 'starts') + ' in ' + nbWords(left) + '.';
      sr.textContent = line;
    }
  }
  hit.addEventListener('click', function () {
    if (!cur) { return; }
    var t = EF.api.now(), id = cur.o.classId || cur.o.cls.id, pickO = null, any = null;
    EF.api.week().forEach(function (day) { day.occs.forEach(function (o) {
      if ((o.classId || o.cls.id) !== id || o.start <= t) { return; }
      if (!any) { any = o; }
      if (!pickO && !o.full) { pickO = o; }
    }); });
    var go = pickO || any || (EF.api.occ && EF.api.occ(id));
    if (go && EF.booking && EF.booking.open) { EF.booking.open(go.id, { src: 'nowbar' }); }
  });
  tick();
  function loop() { tick(); timer = setTimeout(loop, 1000 - (EF.api.now() % 1000) + 5); }
  timer = setTimeout(loop, 1000 - (EF.api.now() % 1000) + 5);
}

/* ---------- actions: engine-v2 binds the generic Book buttons ([data-book-next]), the Duo offer ([data-duo-start]) and the finder;
   the page keeps only its own links into the week ---------- */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-filter-family]');
    if (!t) { return; }
    e.preventDefault();
    EF.schedule.show({ family: t.getAttribute('data-filter-family') });
  });
}

/* ---------- the sheet's folio: engine-v2 sets data-step-pos / data-steps on #sheet (data-step is logical: 0, 1, 2, pay, done);
   the skin shows them as "01//03" over the view name. No folio on pay and Confirmed (no position there). ---------- */
function initSheetSkin() {
  var st = qs('[data-sheet-step]'), sh = qs('#sheet');
  if (!st || !sh || !w.MutationObserver) { return; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function apply() {
    var n = parseInt(sh.getAttribute('data-step-pos'), 10), m = parseInt(sh.getAttribute('data-steps'), 10);
    if (n > 0 && m > 0) { st.setAttribute('data-n', pad(n)); st.setAttribute('data-m', pad(m)); }
    else { st.removeAttribute('data-n'); st.removeAttribute('data-m'); }
  }
  new w.MutationObserver(apply).observe(sh, { attributes: true, attributeFilter: ['data-step', 'data-step-pos', 'data-steps'] });
  apply();
}

function refresh() { renderNext(true); renderSchedule(false); }

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
    renderNext(false);
    renderFeatures();
    initSchedule();
    renderCoaches();
    initNowBar();
    initBars();
    initQuotes();
    initActions();
    initSheetSkin();
    scanMotion(d.getElementById('main'));
    if (EF.media && EF.media.scan) { EF.media.scan(d); }
    d.addEventListener('ef:booked', refresh);
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.open) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) { }
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
