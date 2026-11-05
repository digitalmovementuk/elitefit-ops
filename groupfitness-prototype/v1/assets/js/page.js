/* Elite Fit Group Fitness concept v1 · page.js · v1.2, 28 Oct 2026
   Renders and wires the page from EF.api data: hero panels, hero review quotes, next up (with class clips and seat rows),
   class chapters, schedule (days, family chips, seat rows, filter drawer as an EF.sheet view), coaches, the sticky bar.
   Hooks follow the shared page contract (data-testid and data-* hooks). Classic deferred script, ES5, no dependencies.
   v1.2: the Home v2 best practices (ef-gf/upgrade/BEST-PRACTICES.md) in the Original's own parts; see README "v3 upgrade".
   v1.6: runs on engine-v2 1.1 (../engine-v2/api.js + booking.js); the engine owns the generic Book buttons and the finder. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function emit(name, detail) { try { d.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { } }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false }; } }
var mqDesk = mq('(min-width: 1024px)');
var motionOn = function () { return root.classList.contains('motion-ok'); };
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
/* RULINGS 25: "Full · Join waitlist" everywhere */
function spotsLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function spotsText(occ) {
  if (occ.past) { return 'Finished'; }
  return spotsLabel(occ.full ? 0 : occ.spotsLeft);
}
/* P13 seat row: one dot per place of the (Sample) capacity, free dots solid and first, taken dots as rings, the label always shown.
   The shared engine's EF.seats wins when it is loaded; this copy keeps the same markup for the v1 engine. */
function seatsHtml(free, cap) {
  if (EF.seats && EF.seats.html) { return EF.seats.html(free, cap); }
  var i, out = '', group = cap > 12, n = Math.max(0, Math.min(free, cap)), lbl = spotsLabel(free), m = /^\d+/.exec(lbl);
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { out += '<b class="seat-gap"></b>'; }
    out += '<i class="seat' + (i < n ? ' seat--free' : '') + '" style="--s:' + i + '"></i>';
  }
  return '<span class="seatrow' + (free <= 0 ? ' seatrow--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '">' +
    '<span class="seats" aria-hidden="true">' + out + '</span>' +
    '<span class="seatrow__lbl" aria-hidden="true">' + (m ? '<b>' + m[0] + '</b>' + lbl.slice(m[0].length) : lbl) + '</span>' +
    '<span class="vh">' + (free <= 0 ? 'Full, ' + cap + ' of ' + cap + ' spots taken. Join the waitlist.' : free + ' of ' + cap + ' spots free') + '</span></span>';
}
function capOf(occ) { return occ.capacity || 14; }
/* RULINGS 11: on the page, a Sample chip sits only on the coach invitation line (sheet) and on ONE capacity chip per list.
   Levels, lengths, descriptions and family lines are listed in the README Sample list instead. */
var CHIP = ' <span class="sample">Sample</span>';
function levelHtml(cls) { return esc(cls.level); }
function lengthHtml(cls) { return cls.length_min + ' min'; }
function dayPhrase(occ) { return occ.dayIndex === 0 ? 'today' : (occ.dayIndex === 1 ? 'tomorrow' : EF.api.dateShort(occ.ymd)); }

var DATA = null;

/* ---------- data binding ---------- */
function bindStatic() {
  var p = DATA.passes, c = DATA.club;
  var prices = {
    day: p.day.price_idr, duo: p.duo.price_idr, 'duo-total': p.duo.price_idr * (p.duo.people || 2),
    'duo-old': p.duo.old_price_idr, recharge_day: p.recharge_day.price_idr
  };
  (p.packs || []).forEach(function (k) { if (k.id === 'class-1' && k.price_idr) { prices['class-1'] = k.price_idr; } });
  if (!prices['class-1'] && p['class-1'] && p['class-1'].price_idr) { prices['class-1'] = p['class-1'].price_idr; }
  qsa('[data-price]').forEach(function (el) {
    var v = prices[el.getAttribute('data-price')];
    if (v) { el.textContent = EF.api.k(v); }
  });
  qsa('[data-bind="weekly-count"]').forEach(function (el) { el.textContent = EF.api.weeklyCount(); });
  qsa('[data-bind="weekend-note"]').forEach(function (el) { el.textContent = DATA.timetable.weekend_note; });
  qsa('[data-bind="address"]').forEach(function (el) { el.textContent = c.address; });
  qsa('[data-bind="wa-link"]').forEach(function (el) { el.textContent = c.whatsapp.number; el.href = 'https://wa.me/' + c.whatsapp.wa; });
}

/* ---------- hero panels ---------- */
var panelsBox, panels = [];
function setPanel(fid, fromUser) {
  panels.forEach(function (p) {
    var on = p.getAttribute('data-family') === fid;
    p.classList.toggle('is-open', on);
    var hit = qs('.panel__hit', p);
    if (hit) { hit.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    var link = qs('.panel__more a', p);
    if (link) { link.tabIndex = on ? 0 : -1; }
    var st = qs('[data-panel-state]', p);
    if (st) { st.textContent = on ? ', show less' : ', show more'; }
  });
  emit('ef:panel', { family: fid, user: !!fromUser });
  if (EF.media && EF.media.sync) { EF.media.sync(); }
}
function heroNext() {
  panels.forEach(function (p) {
    var fid = p.getAttribute('data-family'), fam = EF.api.family(fid);
    var lvl = qs('[data-bind="level-line"]', p);
    if (lvl && fam) { lvl.textContent = fam.level_line; }
    var next = null;
    EF.api.week().some(function (day) {
      return day.occs.some(function (o) { if (!o.past && o.family.id === fid) { next = o; return true; } return false; });
    });
    var el = qs('[data-bind="family-next"]', p);
    if (el) { el.textContent = next ? 'Next: ' + dayPhrase(next) + ' at ' + next.time + ', ' + next.cls.name : ''; }
  });
}
function initPanels() {
  panelsBox = qs('[data-panels]');
  if (!panelsBox) { return; }
  panels = qsa('.panel', panelsBox);
  panels.forEach(function (p) {
    var fid = p.getAttribute('data-family');
    var hit = qs('.panel__hit', p);
    if (!qs('[data-panel-state]', hit)) { var vs = d.createElement('span'); vs.className = 'vh'; vs.setAttribute('data-panel-state', ''); hit.appendChild(vs); }
    hit.addEventListener('click', function () {
      if (mqDesk.matches) {
        if (p.classList.contains('is-open')) { scrollToEl(d.getElementById('family-' + fid)); }
        else { setPanel(fid, true); }
        return;
      }
      setPanel(p.classList.contains('is-open') ? '' : fid, true);
    });
    p.addEventListener('mouseenter', function () { if (mqDesk.matches) { panelsBox.classList.add('is-spot'); if (!p.classList.contains('is-open')) { setPanel(fid, true); } } });
    p.addEventListener('focusin', function () { if (mqDesk.matches) { panelsBox.classList.add('is-spot'); if (!p.classList.contains('is-open')) { setPanel(fid, true); } } });
  });
  var first = EF.api.upcoming(1)[0];
  setPanel(first ? first.family.id : 'boxing');
  panelsBox.addEventListener('mouseleave', function () { panelsBox.classList.remove('is-spot'); });
  panelsBox.addEventListener('focusout', function (e) { if (!panelsBox.contains(e.relatedTarget)) { panelsBox.classList.remove('is-spot'); } });
  heroNext();
}

/* (v1.2: the "First class / Been before" toggle is gone, RULINGS 29) */

/* ---------- next up: a 16:9 class clip on top of each card (P14), the seat row in the foot (P13) ---------- */
/* one clip per class family, real Elite Fit footage for conditioning and sculpt; boxing and mobility are Pexels stock (marked outside the clip) */
var CLIPS = {
  boxing: { v: 'assets/video/next-boxing.mp4', p: 'assets/img/next-boxing-poster.webp', stock: true },
  conditioning: { v: 'assets/video/next-conditioning.mp4', p: 'assets/img/next-conditioning-poster.webp', stock: false },
  sculpt: { v: 'assets/video/next-sculpt.mp4', p: 'assets/img/next-sculpt-poster.webp', stock: false },
  mobility: { v: 'assets/video/next-mobility.mp4', p: 'assets/img/next-mobility-poster.webp', stock: true }
};
var nextBox, lastSpots = {};
function renderNext() {
  nextBox = nextBox || qs('[data-nextup]');
  if (!nextBox) { return; }
  var list = EF.api.upcoming(3);
  if (!list.length) { nextBox.innerHTML = '<p class="nextup__loading">No classes left this week. New dates appear every day.</p>'; return; }
  nextBox.innerHTML = list.map(function (o, i) {
    var c = CLIPS[o.family.id] || CLIPS.sculpt;
    return '<button class="ncard" type="button" data-testid="next-card" data-occ="' + esc(o.id) + '" style="--i:' + i + '">' +
      '<span class="ncard__media" aria-hidden="true"><img class="media__poster" src="' + c.p + '" alt="" width="960" height="540" loading="lazy" decoding="async">' +
      '<video data-clip data-group="next" muted loop playsinline preload="none" src="' + c.v + '"></video></span>' +
      '<span class="ncard__body">' +
      '<span class="ncard__when">' + esc(dayLabel(o) === 'Today' || dayLabel(o) === 'Tomorrow' ? dayLabel(o) + ' · ' + EF.api.dateShort(o.ymd) : EF.api.dateShort(o.ymd)) + (i === 0 ? CHIP : '') + '</span>' +
      '<span class="ncard__time">' + esc(o.time) + '</span>' +
      '<span class="ncard__name">' + esc(o.cls.name) + '</span>' +
      '<span class="who"><img src="' + esc(o.coach.avatar) + '" alt="" width="36" height="36" loading="lazy">with ' + esc(o.coach.name) + '</span>' +
      '<span class="ncard__meta">' + lengthHtml(o.cls) + ' · ' + levelHtml(o.cls) + (c.stock ? ' · Stock clip' : '') + '</span>' +
      '<span class="ncard__foot"><span class="spots" data-spots="' + esc(o.id) + '">' + seatsHtml(o.spotsLeft, capOf(o)) + '</span>' +
      '<span class="fauxbtn">Book <span class="arr" aria-hidden="true">→</span></span></span>' +
      '</span></button>';
  }).join('');
  list.forEach(function (o) { lastSpots[o.id] = o.spotsLeft; });
  qsa('.ncard', nextBox).forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-occ')); }); });
  if (EF.media && EF.media.scan) { EF.media.scan(nextBox); }
  if (EF.motion && EF.motion.scan) { EF.motion.scan(nextBox.parentNode); }
}

/* ---------- class chapters ---------- */
function renderChapters() {
  qsa('[data-chap-body]').forEach(function (box) {
    var fid = box.getAttribute('data-chap-body'), fam = EF.api.family(fid);
    if (!fam) { return; }
    var classes = EF.api.classesInFamily(fid);
    var weekly = 0, coachIds = [];
    classes.forEach(function (c) { weekly += EF.api.slots(c.id).length; if (coachIds.indexOf(c.coach) < 0) { coachIds.push(c.coach); } });
    var coaches = coachIds.map(function (id) { return EF.api.coach(id); }).filter(Boolean);
    var html = '<p class="chap__label">' + esc(fam.label) + ' · ' + plural(weekly, 'class', 'classes') + ' a week</p>' +
      '<h3 class="chap__title">' + esc(fam.name) + '</h3>' +
      '<p class="chap__feel">' + esc(fam.feel) + '</p>' +
      '<ul class="chap__meta"><li class="chip">60 min</li><li class="chip">' + esc(fam.level_line) + '</li>' +
      '<li class="chip">' + coaches.map(function (co) { return '<span class="who"><img src="' + esc(co.avatar) + '" alt="" width="28" height="28" loading="lazy">' + esc(co.name) + '</span>'; }).join(' ') + '</li></ul>' +
      '<ul class="ccards">' + classes.map(function (c) {
        var slots = EF.api.slots(c.id).map(function (s) { return s.dowShort + ' ' + s.time; }).join(', ');
        var co = EF.api.coach(c.coach);
        var next = EF.api.occ(c.id);
        var lvl = levelHtml(c);
        return '<li class="ccard"><button class="ccard__hit" type="button" aria-expanded="false" aria-controls="cc-' + esc(c.id) + '">' +
          '<span class="ccard__name">' + esc(c.name) + '</span>' +
          '<span class="ccard__sub">with ' + esc(co ? co.name : '') + ' · ' + lvl + '<br>' + esc(slots) + '</span>' +
          '<span class="ccard__plus" aria-hidden="true"></span></button>' +
          '<div class="ccard__more" id="cc-' + esc(c.id) + '" inert><div><div class="ccard__in">' +
          '<p>' + esc(c.description) + '</p>' +
          (next ? '<button class="link-t" type="button" data-open-occ="' + esc(next.id) + '"><span>Book the next one: ' + esc(dayPhrase(next) + ' at ' + next.time) + '</span> <span class="arr" aria-hidden="true">→</span></button>' : '') +
          '</div></div></div></li>';
      }).join('') + '</ul>' +
      '<a class="link-t" href="#schedule" data-filter-family="' + esc(fid) + '"><span>See ' + esc(fam.name.toLowerCase()) + ' times</span> <span class="arr" aria-hidden="true">→</span></a>';
    box.innerHTML = html;
  });
  qsa('.ccard__hit').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.parentNode, open = !card.classList.contains('is-open');
      card.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var more = qs('.ccard__more', card);
      if (more) { if (open) { more.removeAttribute('inert'); } else { more.setAttribute('inert', ''); } }
    });
  });
  qsa('[data-open-occ]').forEach(function (b) { b.addEventListener('click', function () { openOcc(b.getAttribute('data-open-occ')); }); });
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
/* desktop shows the whole week at once (P22): filters count the week there, the selected day on phones */
function weekView() { return mqDesk.matches; }
function shownRows(f) { if (!weekView()) { return dayRows(S.day, f); } var n = []; EF.api.week().forEach(function (d, i) { n = n.concat(dayRows(i, f)); }); return n; }

/* ---------- the week at a glance (P22, desktop >= 1024 px): seven columns, today first, each class a compact chip.
   Today's column is marked in black, never terracotta. A chip opens the class sheet; it carries the seat row (P13). ---------- */
function weekChip(o) {
  var st = o.past ? '<span class="wk__st">Finished</span>' :
    (o.booking && !o.booking.waitlist ? '<span class="wk__st">You\'re booked</span>' :
      (o.booking && o.booking.waitlist ? '<span class="wk__st">On the waitlist</span>' : seatsHtml(o.full ? 0 : o.spotsLeft, capOf(o))));
  var inner = '<span class="wk__time">' + esc(o.time) + '</span><span class="wk__name">' + esc(o.cls.name) + '</span><span class="wk__by">' + esc(o.coach.name) + '</span>' + st;
  if (o.past) { return '<li class="wk__item is-past"><span class="wk__cls">' + inner + '</span></li>'; }
  return '<li class="wk__item' + (o.booking ? ' is-booked' : '') + '"><button class="wk__cls" type="button" data-testid="week-class" data-open="' + esc(o.id) + '" aria-label="' + esc(o.cls.name + ', ' + EF.api.dateShort(o.ymd) + ' at ' + o.time + ' with ' + o.coach.name + '. ' + (o.booking ? (o.booking.waitlist ? 'On the waitlist' : 'You\'re booked') : spotsText(o))) + '">' + inner + '</button></li>';
}
function renderWeek() {
  if (!sched.week) { return; }
  var wk = EF.api.week();
  sched.week.innerHTML = wk.map(function (day, i) {
    var list = dayRows(i, S);
    return '<li class="wk__col' + (day.isToday ? ' is-today' : '') + '"><h3 class="wk__day"><span class="wk__dow">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span> <span class="wk__date">' + esc(day.dayNum + ' ' + day.monthShort) + '</span>' +
      '<span class="vh">, ' + plural(list.length, 'class', 'classes') + '</span></h3>' +
      (list.length ? '<ul class="wk__list">' + list.map(weekChip).join('') + '</ul>' : '<p class="wk__none">No class</p>') + '</li>';
  }).join('');
}

function renderDays() {
  var wk = EF.api.week();
  var bookedDays = {};
  (store().bookings || []).forEach(function (b) { bookedDays[b.ymd] = true; });
  sched.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (day.isToday ? ' is-today' : '') + (bookedDays[day.ymd] ? ' has-booking' : '') + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
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
  return '<li class="row' + (o.past ? ' is-past' : '') + (o.booking ? ' is-booked' : '') + '" data-testid="row" data-occ="' + esc(o.id) + '" style="--i:' + i + '">' +
    (o.past ? '' : '<button class="row__hit" type="button" data-open="' + esc(o.id) + '" aria-label="' + esc(label) + '"></button>') +
    '<div class="row__when"><span class="row__time">' + esc(o.time) + '</span><span class="row__len">' + lengthHtml(o.cls) + '</span></div>' +
    '<div class="row__main"><p class="row__name">' + esc(o.cls.name) + '</p>' +
    '<p class="row__by"><img src="' + esc(o.coach.avatar) + '" alt="" width="28" height="28" loading="lazy"><span>' + esc(o.coach.name) + ' · ' + levelHtml(o.cls) + '</span></p></div>' +
    '<span class="row__spots">' + (o.booking && !o.booking.waitlist ? 'You\'re booked' : (o.booking && o.booking.waitlist ? 'On the waitlist' : (o.past ? 'Finished' : seatsHtml(o.full ? 0 : o.spotsLeft, capOf(o))))) + '</span>' +
    '<div class="row__act">' + act + '</div></li>';
}
var swapTimer = 0;
function renderRows(animate) {
  var wk = EF.api.week(), day = wk[S.day];
  if (!day) { return; }
  var list = dayRows(S.day, S);
  var draw = function () {
    sched.rows.innerHTML = list.map(rowHtml).join('');
    if (animate && motionOn()) { qsa('.row', sched.rows).forEach(function (r) { r.classList.add('is-enter'); }); }
    sched.rows.classList.remove('is-swapping');
    sched.empty.hidden = list.length > 0;
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
  renderWeek();
  renderBadge();
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
  if (sched.week) { sched.week.addEventListener('click', function (e) { var t = e.target.closest('[data-open]'); if (t) { openOcc(t.getAttribute('data-open')); } }); }
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
    var target = sched.box || d.getElementById('schedule');
    var land = function (smooth) {
      try { target.scrollIntoView({ block: 'start', behavior: smooth && motionOn() ? 'smooth' : 'auto' }); } catch (e) { target.scrollIntoView(); }
      if (o.focusList) {
        sched.rows.setAttribute('tabindex', '-1');
        try { sched.rows.focus({ preventScroll: true }); } catch (e2) { sched.rows.focus(); }
      } else {
        var sec = d.getElementById('schedule');
        try { sec.focus({ preventScroll: true }); } catch (e3) { }
      }
    };
    if (!o.afterSheet) { land(true); return; }
    /* coming from the sheet ("Pick another time"): the sheet unlocks the page scroll and walks history back first,
       so land once that has settled (popstate, or 750 ms at most) */
    land(false);
    var done = false;
    var again = function () { if (done) { return; } done = true; w.removeEventListener('popstate', again); setTimeout(function () { land(false); }, 40); };
    w.addEventListener('popstate', again);
    setTimeout(again, 750);
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
        var fams = DATA.families, coaches = DATA.coaches;
        function tog(group, id, name, on, img) {
          return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? '<img src="' + esc(img) + '" alt="" width="26" height="26">' : '') + esc(name) + '</button>';
        }
        body.innerHTML = '<div data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">For ' + esc(weekView() ? 'this week' : EF.api.week()[S.day].long) + '.</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="opts">' + tog('family', '', 'All classes', !F.family) + fams.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="opts">' + coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c.avatar); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Time of day</legend><div class="opts">' + TIMES.map(function (t) { return tog('times', t.id, t.name, F.times.indexOf(t.id) > -1); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Level</legend><div class="opts">' + LEVELS.map(function (l) { return tog('levels', l.id, l.name, F.levels.indexOf(l.id) > -1); }).join('') + '</div></fieldset></div>';
        foot.innerHTML = '<div class="foot-row"><button class="btn btn--outline btn--sm" type="button" data-testid="filters-clear" data-fclear>Clear all</button>' +
          '<button class="btn btn--primary" type="button" data-testid="filters-apply" data-fapply></button></div>';
        var apply = qs('[data-fapply]', foot);
        function sync() {
          qsa('.tog', body).forEach(function (b) {
            var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
            var on = g === 'family' ? F.family === v : F[g].indexOf(v) > -1;
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          var n = shownRows(F).length;
          apply.innerHTML = 'Show ' + plural(n, 'class', 'classes') + ' <span class="arr" aria-hidden="true">→</span>';
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
function renderCoaches() {
  var box = qs('[data-coaches]');
  if (!box) { return; }
  box.innerHTML = DATA.coaches.map(function (c, i) {
    return '<button class="coach" type="button" data-testid="coach-' + esc(c.id) + '" data-coach="' + esc(c.id) + '" data-motion="tilt" style="--i:' + i + '">' +
      '<span class="coach__photo" data-tilt-target><img src="' + esc(c.photo) + '" alt="' + esc(c.name + ', coach at Elite Fit') + '" width="600" height="750" loading="lazy" decoding="async"></span>' +
      '<span class="coach__text"><span class="coach__name">' + esc(c.name) + '</span>' +
      '<span class="coach__role">' + esc(c.role || ('Teaches ' + teaches(c.id))) + '</span>' +
      '<span class="coach__count">' + plural(EF.api.coachWeekly(c.id), 'class', 'classes') + ' a week</span>' +
      '<span class="coach__link"><span>Meet ' + esc(c.name) + '</span> <span class="arr" aria-hidden="true">→</span></span></span></button>';
  }).join('');
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-coach]');
    if (b && EF.booking && EF.booking.openCoach) { EF.booking.openCoach(b.getAttribute('data-coach')); }
  });
  if (EF.motion && EF.motion.scan) { EF.motion.scan(box.parentNode); }
}

/* ---------- the sticky bar (P2): phones and desktop, it replaces the header CTA ----------
   Shows only once the hero Book AND every rating and quote of the first view have left the screen (RULINGS 6):
   phones, the hero Book, Google line and quote; desktop, the hero Book, quote and the trust row. A mark hidden at this width counts as gone.
   Hidden over the +1 offer, the location quote (its rating) and the footer, while the sheet is open and while a page field is focused. */
function initBars() {
  var bar = qs('[data-buybar]'), hdr = qs('#hdr'), hero = qs('[data-testid="hero-book"]') || qs('#top');
  var marks = [hero, qs('#top .trust'), qs('#top .hq'), qs('[data-trust-badge]')].filter(Boolean), gone = [];
  var barBtn = bar && qs('button', bar);
  var st = { pastHero: false, blocked: {}, sheet: !!(EF.sheet && EF.sheet.isOpen && EF.sheet.isOpen()), typing: false, focusHide: false };
  function apply() {
    var blocked = st.blocked.offer || st.blocked.footer || st.blocked.quote;
    var onBar = st.pastHero && !blocked && !st.sheet && !st.typing && !st.focusHide;
    if (bar) { bar.classList.toggle('is-on', onBar); bar.setAttribute('aria-hidden', onBar ? 'false' : 'true'); if (barBtn) { barBtn.tabIndex = onBar ? 0 : -1; } }
  }
  if ('IntersectionObserver' in w) {
    if (marks.length) {
      /* every mark has scrolled away above (a mark that is display:none at this width reports a zero box: gone) */
      var mio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { gone[marks.indexOf(e.target)] = !e.isIntersecting && e.boundingClientRect.bottom <= 0; });
        st.pastHero = marks.every(function (m, i) { return !!gone[i]; });
        apply();
      });
      marks.forEach(function (m) { mio.observe(m); });
    }
    /* the location quote carries a rating: the bar hides as soon as any of it is on screen (one rating per screen, P6) */
    [['offer', '#plus-one', '0px 0px -60px 0px'], ['footer', '#footer', '0px 0px -60px 0px'], ['quote', '#visit .quote', '0px']].forEach(function (p) {
      var el = qs(p[1]);
      if (el) { new IntersectionObserver(function (es) { st.blocked[p[0]] = es[0].isIntersecting; apply(); }, { rootMargin: p[2] }).observe(el); }
    });
  }
  d.addEventListener('ef:sheet', function (e) { st.sheet = !!(e.detail && e.detail.open); apply(); });
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { st.typing = true; apply(); } });
  d.addEventListener('focusout', function () { if (st.typing) { st.typing = false; apply(); } });
  /* keyboard focus under the sticky bar: scroll the element clear; if the page cannot scroll that far, hide the bar until focus leaves */
  function underBar(el) {
    if (!bar || !bar.classList.contains('is-on')) { return false; }
    var r = el.getBoundingClientRect(), b = bar.getBoundingClientRect();
    return r.height > 0 && r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right;
  }
  /* only keyboard or scripted focus moves the page: a tap must never shift the page between press and release */
  var lastPointer = 0;
  ['pointerdown', 'mousedown', 'touchstart'].forEach(function (n) { d.addEventListener(n, function () { lastPointer = Date.now(); }, { capture: true, passive: true }); });
  d.addEventListener('keydown', function () { lastPointer = 0; }, true);
  d.addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el || !el.closest || !el.closest('#page')) { return; }
    if (Date.now() - lastPointer < 800) { return; }
    if (!underBar(el)) { return; }
    /* instant (no smooth scroll) so the element is clear the moment it has focus */
    var gap = el.getBoundingClientRect().bottom - bar.getBoundingClientRect().top + 24;
    try { w.scrollBy({ top: gap, left: 0, behavior: 'auto' }); } catch (err) { w.scrollBy(0, gap); }
    if (underBar(el)) { st.focusHide = true; apply(); }
  });
  d.addEventListener('focusout', function () { if (st.focusHide) { st.focusHide = false; apply(); } });
  /* the header hairline once the page has moved: a 1 px sentinel at the top, watched (no scroll listener, no layout read) */
  var sen = qs('[data-scroll-sentinel]');
  if (sen && hdr && 'IntersectionObserver' in w) { new IntersectionObserver(function (es) { hdr.classList.toggle('is-scrolled', !es[0].isIntersecting); }).observe(sen); }
  apply();
}

/* ---------- hero quotes (P4): one real Google review at a time, the shortest verbatim cuts (<= 12 words), a 0.4 s crossfade every 3.5 s.
   Pauses while the hero is off screen, on hover and focus, while the tab is hidden and with its pause control; static under reduced motion.
   Each quote fits 2 lines of a reserved box (no layout shift); one that needs more lines at this width is skipped there, never cut. ---------- */
/* the hero set comes from engine-v2's data/v2.json (reviews[] with tags.hero, verbatim cuts <= 12 words) */
var GMARK = '<svg class="gmark" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
function heroQuotes() {
  var list = (DATA && DATA.reviews || []).filter(function (r) { return r.tags && r.tags.hero && r.text && r.text.split(/\s+/).length <= 12; });
  /* the static first slide in the HTML (Alex F.) stays first */
  list.sort(function (a, b) { return (/^Alex F\./.test(b.by) ? 1 : 0) - (/^Alex F\./.test(a.by) ? 1 : 0); });
  return list;
}
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var list = heroQuotes(), slides = qs('.hq__slides', box), btn = qs('[data-hq-pause]', box);
  if (list.length < 2) { return; }   /* the static quote stays */
  slides.innerHTML = list.map(function (r, i) {
    return '<figure class="hq__slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '" aria-hidden="true"><blockquote><p>\u201c' + esc(r.text) + '\u201d</p></blockquote><figcaption>' + GMARK + '<span>' + esc(r.by) + '</span></figcaption></figure>';
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
      var p = qs('blockquote p', it), cs = w.getComputedStyle(p), lh = parseFloat(cs.lineHeight) || 27;
      p.style.minHeight = '0px';
      var fits = p.getBoundingClientRect().height <= lh * 2 + 2;
      p.style.minHeight = '';
      it.classList.toggle('is-skip', !fits);
      return fits;
    });
    if (!usable.length) { usable = [items[0]]; usable[0].classList.remove('is-skip'); }
    show(0);
    btn.hidden = usable.length < 2 || !motionOn();
  }
  function auto() { return motionOn() && !userPaused && !hover && !focusIn && inView && !d.hidden && usable.length > 1; }
  function tick() { clearTimeout(timer); if (auto()) { timer = setTimeout(function () { show(cur + 1); tick(); }, 3500); } }
  if ('IntersectionObserver' in w) { new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v !== inView) { inView = v; tick(); } }).observe(box); }
  btn.addEventListener('click', function () { userPaused = !userPaused; btn.setAttribute('aria-pressed', userPaused ? 'true' : 'false'); btn.setAttribute('aria-label', (userPaused ? 'Play' : 'Pause') + ' the review quotes'); tick(); });
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  box.addEventListener('focusin', function () { focusIn = true; tick(); });
  box.addEventListener('focusout', function () { focusIn = false; tick(); });
  d.addEventListener('visibilitychange', tick);
  var rt = 0; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); tick(); }, 200); });
  measure(); tick();
}

/* ---------- P23 the live "Now / Next" bar: the class running now (ends in) or the next one (starts in), ticking every second in Bali time
   (EF.api.now() honours ?now=), rolling over by itself. Tap opens the next bookable session of that class (a class-specific entry).
   Screen readers get a role="timer" line updated once a minute, not every second. ---------- */
var ICONS = {
  boxing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17V14.5C6.8 13.6 6 12.2 6 10.5V9a5 5 0 0 1 5-5h1.5A5.5 5.5 0 0 1 18 9.5V13c0 1.6-.8 2.8-2 3.5V17"/><path d="M6.3 11.2C4.9 11.4 4 12.3 4 13.5S5 15.6 6.4 15.6"/><path d="M8 17h8v3H8z"/><path d="M10.5 8.5h4"/></svg>',
  conditioning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.6 10.3 8 7.6a4 4 0 0 1 8 0l-.6 2.7"/><circle cx="12" cy="15" r="5.5"/><path d="M10 15h4"/></svg>',
  sculpt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/></svg>',
  mobility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="8" r="2"/><path d="M7 11c0 3 1.5 6 5 6h8"/><path d="M8.5 12.5 15 15.5"/><path d="M3 20h18"/></svg>'
};
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clock(ms) {
  var t = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h ? h + ':' + pad2(m) + ':' + pad2(sec) : pad2(m) + ':' + pad2(sec);
}
function inWords(ms) {
  var mins = Math.max(1, Math.round(ms / 60000)), h = Math.floor(mins / 60), m = mins % 60;
  return h ? plural(h, 'hour', 'hours') + (m ? ' ' + plural(m, 'minute', 'minutes') : '') : plural(mins, 'minute', 'minutes');
}
function initNowBar() {
  var bar = qs('[data-nowbar]');
  if (!bar) { return; }
  var go = qs('[data-now-open]', bar), sr = qs('[data-now-sr]', bar), vid = qs('[data-now-video]', bar), poster = qs('[data-now-poster]', bar);
  var el = { k: qs('[data-now-k]', bar), cls: qs('[data-now-cls]', bar), coach: qs('[data-now-coach]', bar), av: qs('[data-now-av]', bar), preD: qs('[data-now-pre-d]', bar), preM: qs('[data-now-pre-m]', bar), postM: qs('[data-now-post-m]', bar), t: qs('[data-now-t]', bar), icon: qs('[data-now-icon]', bar) };
  var cur = null, lastMin = -1;
  function all() { var a = []; EF.api.week().forEach(function (d) { a = a.concat(d.occs); }); return a; }
  function pick() {
    var t = EF.api.now(), run = null, next = null;
    all().forEach(function (o) {
      if (o.start <= t && t < o.end && !run) { run = o; }
      if (o.start > t && (!next || o.start < next.start)) { next = o; }
    });
    if (run) { return { o: run, now: true, until: run.end }; }
    return next ? { o: next, now: false, until: next.start } : null;
  }
  function paint() {
    cur = pick(); lastMin = -1;
    if (!cur) { go.hidden = true; return; }
    var o = cur.o, fam = o.family.id;
    el.k.textContent = cur.now ? 'Now' : 'Next';
    el.cls.textContent = o.cls.name;
    el.coach.textContent = o.coach.name;
    el.av.setAttribute('src', o.coach.avatar);
    /* RULINGS 43: wider than 414 px "ends in 23:14" / "starts in 1:12:05"; phones "23:14 left" / "in 1:12:05" (CSS picks) */
    el.preD.textContent = cur.now ? 'ends in\u00a0' : 'starts in\u00a0';
    el.preM.textContent = cur.now ? '' : 'in\u00a0';
    el.postM.textContent = cur.now ? '\u00a0left' : '';
    el.icon.innerHTML = ICONS[fam] || ICONS.sculpt;
    var v = 'assets/video/now-' + fam + '.mp4', p = 'assets/img/now-' + fam + '-poster.webp';
    if (poster && poster.getAttribute('src') !== p) { poster.setAttribute('src', p); }
    if (vid && vid.getAttribute('src') !== v) { vid.setAttribute('src', v); if (EF.media && EF.media.sync) { EF.media.sync(); } }
    go.hidden = false;
    tick();
  }
  function tick() {
    if (!cur) { return; }
    var left = cur.until - EF.api.now();
    if (left <= 0) { paint(); return; }
    el.t.textContent = clock(left);
    var mins = Math.ceil(left / 60000);
    if (mins !== lastMin) {
      lastMin = mins;
      sr.textContent = (cur.now ? 'Now: ' : 'Next class: ') + cur.o.cls.name + ' with ' + cur.o.coach.name + ', ' + (cur.now ? 'ends in ' : 'starts in ') + inWords(left) + '.';
    }
  }
  go.addEventListener('click', function () {
    if (!cur) { return; }
    var t = EF.api.now(), id = cur.o.classId, best = null, any = null;
    all().forEach(function (o) {
      if (o.classId !== id || o.start <= t) { return; }
      if (!any || o.start < any.start) { any = o; }
      if (!o.full && (!best || o.start < best.start)) { best = o; }
    });
    var target = best || any || cur.o;
    /* a class-specific entry: never the finder (engine-v2 README section 3) */
    if (EF.booking && EF.booking.open) { EF.booking.open(target.id, { src: 'nowbar' }); }
  });
  paint();
  w.setInterval(tick, 1000);
  d.addEventListener('visibilitychange', function () { if (!d.hidden) { tick(); } });
}

/* ---------- actions ----------
   engine-v2 owns the generic entries: [data-book-next] (hero, sticky bar, header) and [data-duo-start] (the +1 offer) open its
   class finder (RULINGS 30, 36). The page keeps only its own links into the schedule. */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-filter-family]');
    if (!t) { return; }
    e.preventDefault();
    EF.schedule.show({ family: t.getAttribute('data-filter-family') });
  });
}

function refresh() {
  heroNext();
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
    initPanels();
    renderNext();
    renderChapters();
    initSchedule();
    renderCoaches();
    initBars();
    initActions();
    initQuotes();
    initNowBar();
    if (EF.motion && EF.motion.scan) { EF.motion.scan(d.getElementById('main')); }
    if (EF.media && EF.media.sync) { EF.media.sync(); }
    d.addEventListener('ef:booked', refresh);
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.replace) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) { }
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
