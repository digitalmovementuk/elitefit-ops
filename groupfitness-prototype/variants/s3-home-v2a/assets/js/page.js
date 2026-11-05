/* Elite Fit · Design concept, Home v2a, booking-first · page.js · v1.0, 28 Oct 2026
   Enhances the crawlable page in place (one DOM for crawlers and people):
   - the timetable <table>: day strip (day-0…6), one day shown, Book buttons replacing the WhatsApp links, coach faces,
     the free-spots seat row on every row, the now-line, type chips, "Who's coaching today?", the filters drawer (EF.sheet view);
   - the Today cards (hero and bottom) through the inline first-view renderer (window.EFtoday), refreshed every 30 s;
   - class family lists (next time + Book), coach name tags that flip to the next class, price CTAs that open the sheet
     with that option selected, the hero quote rotator, the mobile dock and the desktop header CTA (one terracotta button per screen).
   Classic deferred script, ES5, one IIFE. Nothing leaves the page. */
(function (w, d) {
'use strict';
var EF = w.EF = w.EF || {};
var root = d.documentElement;

/* ---------- helpers ---------- */
function qs(s, c) { return (c || d).querySelector(s); }
function qsa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function mq(q) { try { return w.matchMedia(q); } catch (e) { return { matches: false }; } }
var mqDesk = mq('(min-width: 1024px)');
var mqReduce = mq('(prefers-reduced-motion: reduce)');
function motionOn() { return root.classList.contains('motion-ok'); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function api() { return EF.api; }
function scrollToEl(el) { if (!el) { return; } try { el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' }); } catch (e) { el.scrollIntoView(); } }
function openOcc(id, opts) { if (EF.booking && EF.booking.open && id) { EF.booking.open(id, opts || {}); } }
function t12(t) { return api().time12(t); }
function seats(free, cap, opts) { return EF.seats ? EF.seats.html(free, cap, opts) : ''; }
var DATA = null;

/* ---------- hero clip: the right cut for the screen (src is only set when media.js decides to play it) ---------- */
function heroClip() {
  var v = qs('[data-hero-video]');
  if (!v || v.getAttribute('data-src')) { return; }
  v.setAttribute('data-src', mqDesk.matches ? v.getAttribute('data-src-d') : v.getAttribute('data-src-m'));
}

/* ---------- Today cards (hero + bottom): the inline renderer keeps one template for first paint and updates ---------- */
function renderToday() {
  if (!w.EFtoday) { return; }
  qsa('[data-today]').forEach(function (el) { w.EFtoday.render(el, el.getAttribute('data-today')); });
}

/* ---------- the week: enhance the static table ---------- */
var S = { day: 0, family: '', coaches: [], times: [] };
var T = {};
var TIMES = [
  { id: 'morning', name: 'Morning, before 12pm', test: function (t) { return t < '12:00'; } },
  { id: 'afternoon', name: 'Afternoon, 12pm to 5pm', test: function (t) { return t >= '12:00' && t < '17:00'; } },
  { id: 'evening', name: 'Evening, from 5pm', test: function (t) { return t >= '17:00'; } }
];
function matches(o, f) {
  if (f.family && o.familyId !== f.family) { return false; }
  if (f.coaches.length && f.coaches.indexOf(o.coachId) < 0) { return false; }
  if (f.times.length && !TIMES.some(function (t) { return f.times.indexOf(t.id) > -1 && t.test(o.time); })) { return false; }
  return true;
}
function filterCount(f) { return (f.family ? 1 : 0) + f.coaches.length + f.times.length; }
function copyF(f) { return { day: f.day, family: f.family, coaches: f.coaches.slice(), times: f.times.slice() }; }
function dayOccs(i) { var wk = api().week(); return wk[i] ? wk[i].occs : []; }
var panelOcc = null;
/* Handover fix, RULINGS #53 and #56: coach avatars come from the re-cropped files in ../../engine-v2/img/r/ (head-and-shoulders, 48/64/96/128 px). `src` is the 96 px file; srcset lets the browser pick by device pixel ratio. The 28 px filter chips start at the 96 px file: at that size the 48 px file's face box touches the circle edge (the face check's paint-order test hits the chip button there). */
function avSet(src, px, from) {
  var b = String(src || '').replace(/-\d+\.webp$/, '');
  return 'src="' + esc(b + '-96.webp') + '" srcset="' + [48, 64, 96, 128].filter(function (n) { return n >= (from || 48); }).map(function (n) { return esc(b + '-' + n + '.webp ' + n + 'w'); }).join(', ') + '" sizes="' + px + 'px"';
}

function rowAct(o) {
  var lab = o.cls.name + ', ' + api().dateLong(o.ymd) + ', ' + t12(o.time);
  if (o.past) { return '<span class="row__label">Started</span>'; }
  if (o.booking && !o.booking.waitlist) { return '<button class="rbtn rbtn--booked" type="button" data-testid="row-book" data-book-occ="' + o.id + '" data-src="week" aria-haspopup="dialog" aria-label="Booked: ' + esc(lab) + '">Booked</button>'; }
  if (o.booking) { return '<button class="rbtn rbtn--booked" type="button" data-testid="row-book" data-book-occ="' + o.id + '" data-src="week" aria-haspopup="dialog" aria-label="On the waitlist: ' + esc(lab) + '">Waitlist</button>'; }
  if (panelOcc === o.id) { return '<button class="rbtn rbtn--inpanel" type="button" data-testid="row-book" data-book-occ="' + o.id + '" data-src="week" aria-label="' + esc('In panel, ' + lab) + '">In panel</button>'; }
  if (o.full) { return '<button class="rbtn" type="button" data-testid="row-book" data-book-occ="' + o.id + '" data-src="week" aria-haspopup="dialog" aria-label="' + esc('Join the waitlist for ' + lab) + '">Waitlist</button>'; }
  return '<button class="rbtn" type="button" data-testid="row-book" data-book-occ="' + o.id + '" data-src="week" aria-haspopup="dialog" aria-label="' + esc('Book ' + lab) + '">Book</button>';
}
function enhanceRow(tr, o) {
  tr.setAttribute('data-occ', o.id);
  tr.setAttribute('data-testid', 'row');
  tr.classList.toggle('is-booked', !!(o.booking && !o.booking.waitlist));
  tr.classList.toggle('is-full', !!o.full);
  var coach = qs('.tt__coach', tr);
  if (coach && !coach.getAttribute('data-done')) {
    coach.setAttribute('data-done', '1');
    coach.innerHTML = '<img ' + avSet(o.coach.avatar, 24) + ' alt="" width="24" height="24" loading="lazy"><b>' + esc(o.coach.name) + '</b>';
  }
  var sp = qs('.tt__spots', tr);
  if (!sp) { sp = d.createElement('td'); sp.className = 'tt__spots'; sp.setAttribute('role', 'cell'); tr.insertBefore(sp, qs('.tt__act', tr)); }
  var nowFree = o.past ? -1 : o.spotsLeft, prevFree = sp.hasAttribute('data-free') ? +sp.getAttribute('data-free') : null;
  if (prevFree !== nowFree) {
    var dots = qsa('.seat', sp);
    if (prevFree !== null && prevFree > nowFree && nowFree >= 0 && dots.length === o.capacity) {
      /* a booking took spots: tick the seats down in place (no re-reveal), then refresh the label */
      dots.forEach(function (el, i) { el.classList.toggle('seat--free', i < nowFree); });
      var lab = qs('.spots__lbl', sp), sr = qs('.spots .vh', sp), txt = EF.seats.label(nowFree), m = /^\d+/.exec(txt);
      if (lab) { lab.innerHTML = m ? '<b>' + m[0] + '</b>' + esc(txt.slice(m[0].length)) : esc(txt); }
      if (sr) { sr.textContent = nowFree <= 0 ? 'Full, ' + o.capacity + ' of ' + o.capacity + ' spots taken. Join the waitlist.' : nowFree + ' of ' + o.capacity + ' spots free'; }
      qs('.spots', sp).classList.toggle('spots--full', nowFree <= 0);
      qs('.spots', sp).setAttribute('data-free', nowFree);
    } else { sp.innerHTML = o.past ? '' : seats(o.spotsLeft, o.capacity); }
    sp.setAttribute('data-free', nowFree);
  }
  qs('.tt__act', tr).innerHTML = rowAct(o);
}
function initWeek() {
  var tbl = qs('.tt');
  if (!tbl) { return; }
  T = {
    tbl: tbl, days: qs('[data-days]'), chips: qs('[data-fchips]'), badge: qs('[data-filter-count]'), title: qs('[data-day-title]'), count: qs('[data-day-count]'),
    empty: qs('[data-empty]'), faces: qs('[data-who-faces]'), whoTitle: qs('[data-who-title]')
  };
  var th = qs('thead tr', tbl);
  if (th && !qs('.tt__spots-h', th)) { var c = d.createElement('th'); c.className = 'tt__spots-h'; c.setAttribute('scope', 'col'); c.setAttribute('role', 'columnheader'); c.innerHTML = '<span class="vh">Free spots</span>'; th.insertBefore(c, th.lastElementChild); }
  tbl.classList.add('is-enhanced');
  S.day = 0;
  renderDays();
  renderWeek(false);
  T.days.addEventListener('click', function (e) { var b = e.target.closest('.day'); if (b) { selectDay(+b.getAttribute('data-day')); } });
  T.days.addEventListener('keydown', function (e) {
    var k = e.key, i = S.day;
    if (k === 'ArrowRight') { i = (i + 1) % 7; } else if (k === 'ArrowLeft') { i = (i + 6) % 7; } else if (k === 'Home') { i = 0; } else if (k === 'End') { i = 6; } else { return; }
    e.preventDefault(); selectDay(i, true);
  });
  T.chips.addEventListener('click', function (e) { var c2 = e.target.closest('.fchip'); if (!c2) { return; } S.family = c2.getAttribute('data-fam') || ''; renderWeek(true); });
  T.faces.addEventListener('click', function (e) {
    var f = e.target.closest('.face'); if (!f) { return; }
    var id = f.getAttribute('data-face');
    S.coaches = (S.coaches.length === 1 && S.coaches[0] === id) ? [] : [id];
    renderWeek(true);
  });
  qsa('[data-clear-filters]').forEach(function (b) { b.addEventListener('click', function () { S.family = ''; S.coaches = []; S.times = []; renderWeek(true); }); });
  var fb = qs('[data-open-filters]');
  if (fb) { fb.addEventListener('click', function () { if (EF.sheet && EF.sheet.open) { EF.sheet.open('filters', {}, location.pathname + location.search.replace(/([?&])view=filters&?/, '$1')); } }); }
  var rt = 0;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(moveInd, 120); });
  registerFilters();
}
function renderDays() {
  var wk = api().week(), booked = {};
  (api().store.get().bookings || []).forEach(function (b) { booked[b.ymd] = true; });
  T.days.innerHTML = '<span class="days__ind" aria-hidden="true"></span>' + wk.map(function (day, i) {
    var sel = i === S.day;
    return '<button class="day' + (booked[day.ymd] ? ' has-booking' : '') + '" type="button" role="tab" id="day-tab-' + i + '" data-testid="day-' + i + '" data-day="' + i + '" aria-selected="' + sel + '" aria-controls="sched-rows" tabindex="' + (sel ? 0 : -1) + '">' +
      '<span class="day__dow">' + esc(day.isToday ? 'Today' : day.dowShort) + '</span><span class="day__num">' + day.dayNum + '</span>' +
      '<span class="vh">, ' + esc(day.long + ', ' + plural(day.occs.length, 'class', 'classes')) + (booked[day.ymd] ? ', you have a booking' : '') + '</span><span class="day__dot" aria-hidden="true"></span></button>';
  }).join('');
  moveInd();
}
function moveInd() {
  var ind = qs('.days__ind', T.days), btn = qs('[data-day="' + S.day + '"]', T.days);
  if (!ind || !btn) { return; }
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.left = btn.offsetLeft + 'px';
}
function selectDay(i, focus) {
  var dir = i > S.day ? 'l' : 'r';
  S.day = i;
  qsa('.day', T.days).forEach(function (b) {
    var on = +b.getAttribute('data-day') === i;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
    if (on && focus) { b.focus(); }
  });
  moveInd();
  renderWeek(true, dir);
}
function whoTitle(day) {
  if (day.i === 0) { return "Who's coaching today?"; }
  if (day.i === 1) { return "Who's coaching tomorrow?"; }
  return "Who's coaching on " + day.long.split(' ')[0] + '?';
}
function renderWho(day, pop) {
  T.whoTitle.textContent = whoTitle(day);
  var ids = [];
  day.occs.forEach(function (o) { if (ids.indexOf(o.coachId) < 0) { ids.push(o.coachId); } });
  T.faces.innerHTML = ids.map(function (id, i) {
    var c = api().coach(id), on = S.coaches.length === 1 && S.coaches[0] === id;
    return '<button class="face' + (pop && motionOn() ? ' is-new' : '') + '" type="button" data-face="' + esc(id) + '" aria-pressed="' + on + '" style="--i:' + i + '"><img ' + avSet(c.avatar, 48) + ' alt="" width="48" height="48"><b>' + esc(c.name) + '</b><span class="vh">, show only ' + esc(c.name) + "'s classes</span></button>";
  }).join('');
}
var swapT = 0;
function renderWeek(animate, dir) {
  var wk = api().week(), day = wk[S.day];
  if (!day) { return; }
  var bodies = qsa('tbody', T.tbl), shown = 0;
  function draw() {
    bodies.forEach(function (tb) {
      var on = +tb.getAttribute('data-dow') === day.dow;
      tb.hidden = !on;
      if (!on) { return; }
      var occs = day.occs, vis = 0;
      qsa('tr.tt__row', tb).forEach(function (tr, k) {
        var o = occs[k];
        if (!o || o.classId !== tr.getAttribute('data-class')) { o = null; occs.forEach(function (x) { if (x.classId === tr.getAttribute('data-class') && x.time === tr.getAttribute('data-time')) { o = x; } }); }
        if (!o) { return; }
        enhanceRow(tr, o);
        var m = matches(o, S);
        tr.hidden = !m;
        if (m) { vis++; }
      });
      shown = vis;
      if (day.isToday && w.EFtoday) { w.EFtoday.mark(T.tbl); } else { var nl = qs('.tt__now', tb); if (nl) { nl.parentNode.removeChild(nl); } }
      var nowRow = qs('.tt__now', tb);
      if (nowRow) { nowRow.hidden = filterCount(S) > 0 && !shown; }
    });
    T.empty.hidden = shown > 0;
    T.title.textContent = (day.isToday ? 'Today, ' : (day.i === 1 ? 'Tomorrow, ' : '')) + day.long;
    T.count.textContent = plural(shown, 'class', 'classes');
    var left = day.occs.filter(function (o) { return !o.past; }).length, done = qs('[data-day-done]');
    if (done) {
      if (day.isToday && day.occs.length && !left && wk[1] && wk[1].occs[0]) { done.textContent = "That's today done. Tomorrow starts at " + t12(wk[1].occs[0].time) + '.'; done.hidden = false; }
      else { done.hidden = true; }
    }
    renderWho(day, animate);
    renderBadge();
    T.tbl.classList.remove('is-swapping', 'is-swap-l', 'is-swap-r');
    if (animate && motionOn()) { void T.tbl.offsetWidth; T.tbl.classList.add(dir === 'r' ? 'is-swap-r' : 'is-swap-l'); }
  }
  clearTimeout(swapT);
  if (animate && motionOn()) { T.tbl.classList.add('is-swapping'); swapT = setTimeout(draw, 110); } else { draw(); }
}
function renderBadge() {
  var n = filterCount(S), b = T.badge;
  if (b) { b.textContent = n; b.hidden = n === 0; }
  qsa('.fchip', T.chips).forEach(function (c) { c.setAttribute('aria-pressed', (c.getAttribute('data-fam') || '') === S.family ? 'true' : 'false'); });
}
EF.schedule = {
  show: function (o) {
    o = o || {};
    if (!T.days) { return; }
    if (o.ymd) { api().week().forEach(function (day, i) { if (day.ymd === o.ymd) { S.day = i; } }); }
    if (o.family != null) { S.family = o.family; }
    selectDay(S.day);
    var sec = d.getElementById('week');
    scrollToEl(sec);
    try { sec.focus({ preventScroll: true }); } catch (e) { }
  },
  state: function () { return copyF(S); }
};
function registerFilters() {
  if (!EF.sheet || !EF.sheet.register) { return; }
  EF.sheet.register('filters', function () {
    var F = copyF(S);
    return {
      label: 'Filters', testid: 'step-filters', mode: 'filters', tall: true,
      render: function (body, foot) {
        function tog(group, id, name, on, img) { return '<button class="tog" type="button" data-g="' + group + '" data-v="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (img ? '<img ' + avSet(img, 28, 96) + ' alt="" width="28" height="28">' : '') + esc(name) + '</button>'; }
        body.innerHTML = '<div class="view" data-testid="step-filters"><h2 class="sh-title" id="sheet-title" tabindex="-1">Filters</h2>' +
          '<p class="sh-lead">' + esc(api().week()[S.day].long) + '</p>' +
          '<fieldset class="fgroup"><legend>Class type</legend><div class="togs">' + tog('family', '', 'All classes', !F.family) + DATA.families.map(function (f) { return tog('family', f.id, f.name, F.family === f.id); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Coach</legend><div class="togs">' + DATA.coaches.map(function (c) { return tog('coaches', c.id, c.name, F.coaches.indexOf(c.id) > -1, c.avatar); }).join('') + '</div></fieldset>' +
          '<fieldset class="fgroup"><legend>Time of day</legend><div class="togs">' + TIMES.map(function (t) { return tog('times', t.id, t.name, F.times.indexOf(t.id) > -1); }).join('') + '</div></fieldset></div>';
        foot.innerHTML = '<div class="foot-row"><button class="btn btn--outline btn--sm" type="button" data-testid="filters-clear" data-fclear>Clear all</button><button class="btn btn--primary" type="button" data-testid="filters-apply" data-fapply></button></div>';
        var apply = qs('[data-fapply]', foot);
        function sync() {
          qsa('.tog', body).forEach(function (b) { var g = b.getAttribute('data-g'), v = b.getAttribute('data-v'); b.setAttribute('aria-pressed', (g === 'family' ? F.family === v : F[g].indexOf(v) > -1) ? 'true' : 'false'); });
          apply.innerHTML = 'Show ' + plural(dayOccs(S.day).filter(function (o) { return matches(o, F); }).length, 'class', 'classes') + ' <span class="arr" aria-hidden="true">→</span>';
        }
        body.addEventListener('click', function (e) {
          var b = e.target.closest('.tog'); if (!b) { return; }
          var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
          if (g === 'family') { F.family = v; } else { var at = F[g].indexOf(v); if (at > -1) { F[g].splice(at, 1); } else { F[g].push(v); } }
          sync();
        });
        qs('[data-fclear]', foot).addEventListener('click', function () { F.family = ''; F.coaches = []; F.times = []; sync(); });
        apply.addEventListener('click', function () { S.family = F.family; S.coaches = F.coaches; S.times = F.times; renderWeek(true); EF.sheet.close(); });
        sync();
      }
    };
  });
}

/* ---------- class families: next time + Book ---------- */
function renderFamilies() {
  qsa('.frow[data-class]').forEach(function (li) {
    var id = li.getAttribute('data-class'), o = api().nextOfClass(id), meta = qs('.frow__meta', li);
    var old = qs('.frow__next', li); if (old) { old.parentNode.removeChild(old); }
    var oldB = qs('.frow__go', li); if (oldB) { oldB.parentNode.removeChild(oldB); }
    if (!o) { return; }
    var when = o.dayIndex === 0 ? 'Today ' : (o.dayIndex === 1 ? 'Tomorrow ' : api().dateShort(o.ymd).split(' ')[0] + ' ');
    meta.insertAdjacentHTML('beforeend', '<span class="frow__next"> · Next <b>' + esc(when + t12(o.time)) + '</b></span>');
    li.insertAdjacentHTML('beforeend', '<button class="btn btn--ghost btn--sm frow__go" type="button" data-book-occ="' + o.id + '" data-src="classes" aria-haspopup="dialog" aria-label="' + esc((o.full ? 'Join the waitlist for ' : 'Book ') + o.cls.name + ', ' + api().dateLong(o.ymd) + ', ' + t12(o.time)) + '">' + (o.full ? 'Waitlist' : 'Book') + '</button>');
  });
}

/* ---------- coach name tags: flip to the next class ---------- */
function renderTagBack(tag) {
  var id = tag.getAttribute('data-coach'), c = api().coach(id), next = api().coachOccs(id).filter(function (o) { return !o.full; })[0], back = qs('[data-tag-back]', tag);
  var when = next ? (next.dayIndex === 0 ? 'Today' : (next.dayIndex === 1 ? 'Tomorrow' : api().dateLong(next.ymd).split(' ')[0])) + ' · ' + t12(next.time) : '';
  back.innerHTML = '<p class="ntag__hello">Next class<button class="ntag__back-btn" type="button" data-unflip aria-label="Turn ' + esc(c.name) + "'s name tag back\"><span aria-hidden=\"true\">↺</span></button></p>" +
    '<div class="ntag__body"><p class="ntag__k">' + esc(c.name) + '</p>' +
    (next ? '<p class="ntag__next">' + esc(next.cls.name) + '</p><p class="ntag__when">' + esc(when) + '</p>' + seats(next.spotsLeft, next.capacity) +
      '<div class="ntag__acts"><button class="btn btn--ghost btn--sm" type="button" data-book-occ="' + next.id + '" data-src="coach" aria-haspopup="dialog" aria-label="' + esc('Book ' + next.cls.name + ' with ' + c.name + ', ' + api().dateLong(next.ymd) + ', ' + t12(next.time)) + '">Book</button>' +
      '<button class="link-u" type="button" data-coach-sheet="' + esc(id) + '" aria-haspopup="dialog"><span>' + esc(c.name) + "'s week</span> <span class=\"arr\" aria-hidden=\"true\">→</span></button></div>"
      : '<p class="ntag__when">No classes in the next seven days.</p>') + '</div>';
}
function initTags() {
  qsa('.ntag').forEach(function (tag, i) {
    tag.parentNode.style.setProperty('--i', String(i));
    var front = qs('[data-tag-front]', tag), back = qs('[data-tag-back]', tag), btn = qs('[data-flip]', tag);
    back.id = 'tag-back-' + tag.getAttribute('data-coach');
    btn.setAttribute('aria-controls', back.id);
    function set(on) {
      if (on) { renderTagBack(tag); back.hidden = false; }
      tag.classList.toggle('is-flipped', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      back.setAttribute('aria-hidden', on ? 'false' : 'true');
      front.setAttribute('aria-hidden', on ? 'true' : 'false');
      if (on) { back.removeAttribute('inert'); front.setAttribute('inert', ''); } else { front.removeAttribute('inert'); back.setAttribute('inert', ''); }
      var target = on ? qs('[data-unflip]', back) : btn;
      setTimeout(function () { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }, on && motionOn() ? 260 : 0);
    }
    back.setAttribute('inert', '');
    btn.addEventListener('click', function () { set(true); });
    tag.addEventListener('click', function (e) {
      if (e.target.closest('[data-unflip]')) { set(false); }
      var cs = e.target.closest('[data-coach-sheet]'); if (cs && EF.booking) { EF.booking.openCoach(cs.getAttribute('data-coach-sheet')); }
    });
  });
}

/* ---------- prices: every CTA opens the sheet with that option selected ---------- */
function nextFor(pass) {
  var need = pass === 'duo' ? 2 : 1, wk = api().upcoming(30), i;
  for (i = 0; i < wk.length; i++) { if (wk[i].spotsLeft >= need) { return wk[i]; } }
  return null;
}
function bookWith(pass, src) { var o = nextFor(pass); if (o) { openOcc(o.id, { pass: pass, src: src }); } }

/* ---------- hero quotes: one at a time, crossfade, pause on hover and focus, a visible pause/play (WCAG 2.2.2) ---------- */
function initQuotes() {
  var box = qs('[data-hq]');
  if (!box) { return; }
  var list = (DATA.reviews || []).filter(function (r) { return r.tags && r.tags.hero; });
  var slides = qs('.hq__slides', box), ctrl = qs('.hq__ctrl', box);
  if (list.length) {
    slides.innerHTML = list.map(function (r, i) {
      return '<figure class="hq__slide' + (i === 0 ? ' is-on' : '') + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '"' + (i ? ' aria-hidden="true"' : '') + '><blockquote><p>“' + esc(r.text) + '”</p></blockquote><figcaption>' + esc(r.by) + '</figcaption></figure>';
    }).join('');
  }
  var items = qsa('.hq__slide', slides);
  if (items.length < 2) { if (ctrl) { ctrl.hidden = true; } return; }
  ctrl.hidden = false;
  var cur = 0, timer = 0, userPaused = false, hover = false, focusIn = false;
  var pauseBtn = qs('[data-hq-pause]', box), nextBtn = qs('[data-hq-next]', box);
  function show(i) {
    items[cur].classList.remove('is-on'); items[cur].setAttribute('aria-hidden', 'true');
    cur = (i + items.length) % items.length;
    items[cur].classList.add('is-on'); items[cur].removeAttribute('aria-hidden');
  }
  function auto() { return motionOn() && !mqReduce.matches && !userPaused && !hover && !focusIn && !d.hidden; }
  function tick() { clearTimeout(timer); if (auto()) { timer = setTimeout(function () { show(cur + 1); tick(); }, 6500); } }
  function paint() {
    var playing = motionOn() && !userPaused;
    pauseBtn.hidden = !motionOn();
    pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' the review quotes');
  }
  pauseBtn.addEventListener('click', function () { userPaused = !userPaused; paint(); tick(); });
  nextBtn.addEventListener('click', function () { show(cur + 1); tick(); });
  box.addEventListener('mouseenter', function () { hover = true; tick(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  box.addEventListener('focusin', function () { focusIn = true; tick(); });
  box.addEventListener('focusout', function () { focusIn = false; tick(); });
  d.addEventListener('visibilitychange', tick);
  paint(); tick();
}

/* ---------- dock (phones) and header CTA (desktop): one terracotta button per screen ---------- */
function initBars() {
  var bar = qs('[data-buybar]'), hdr = qs('#hdr'), barBtn = bar && qs('button', bar), hdrBtn = hdr && qs('.hdr__cta', hdr);
  var st = { pastHero: false, block: {}, sheet: false, typing: false };
  function apply() {
    var blocked = st.block.offer || st.block.book || st.block.footer;
    var onBar = st.pastHero && !blocked && !st.sheet && !st.typing;
    var onHdr = st.pastHero && !st.sheet && !st.block.offer && !st.block.book;
    if (bar) { bar.classList.toggle('is-on', onBar); bar.setAttribute('aria-hidden', onBar ? 'false' : 'true'); if (barBtn) { barBtn.tabIndex = onBar ? 0 : -1; } }
    if (hdr) { hdr.classList.toggle('cta-on', onHdr); if (hdrBtn) { hdrBtn.tabIndex = onHdr ? 0 : -1; hdrBtn.setAttribute('aria-hidden', onHdr ? 'false' : 'true'); } }
  }
  if ('IntersectionObserver' in w) {
    var heroTodayIo = new IntersectionObserver(function (es) {
      var e = es[0];
      st.pastHero = !e.isIntersecting;
      apply();
    }, { rootMargin: '0px 0px 0px 0px' });
    var watchHero = function () { var b = qs('[data-testid="hero-book"]') || qs('.hero__today'); if (b) { heroTodayIo.disconnect(); heroTodayIo.observe(b); } };
    watchHero();
    d.addEventListener('ef:today', watchHero);
    [['offer', '.offer__actions'], ['book', '.book__today'], ['footer', '#footer']].forEach(function (p) {
      var el = qs(p[1]);
      if (el) { new IntersectionObserver(function (es) { st.block[p[0]] = es[0].isIntersecting; apply(); }).observe(el); }
    });
  }
  d.addEventListener('ef:sheet', function (e) { st.sheet = !!(e.detail && e.detail.open); apply(); });
  d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('#page input, #page select, #page textarea')) { st.typing = true; apply(); } });
  d.addEventListener('focusout', function () { if (st.typing) { st.typing = false; apply(); } });
  var ticking = false;
  w.addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    w.requestAnimationFrame(function () { ticking = false; if (hdr) { hdr.classList.toggle('is-scrolled', (w.pageYOffset || 0) > 4); } });
  }, { passive: true });
  apply();
}

/* ---------- clicks ---------- */
function initActions() {
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-book-occ], [data-book-next], [data-use-pass], [data-offer-book], [data-duo-book], [data-forget]');
    if (!t) { return; }
    if (t.hasAttribute('data-book-occ')) { e.preventDefault(); openOcc(t.getAttribute('data-book-occ'), { src: t.getAttribute('data-src') || 'week' }); }
    else if (t.hasAttribute('data-book-next')) { var o = api().upcoming(1)[0]; if (o) { openOcc(o.id, { src: t.getAttribute('data-src') || 'hero' }); } }
    else if (t.hasAttribute('data-use-pass')) { bookWith(t.getAttribute('data-use-pass'), 'prices'); }
    else if (t.hasAttribute('data-offer-book') || t.hasAttribute('data-duo-book')) { bookWith('duo', t.hasAttribute('data-offer-book') ? 'prices' : 'day'); }
    else if (t.hasAttribute('data-forget')) { api().contact.forget(); EF.toast('Your details are forgotten on this device.'); }
  });
  /* JS on: the static WhatsApp links in the timetable become in-page booking (the buttons replace them) */
}

/* ---------- refresh on bookings and on the clock ---------- */
function refresh() {
  renderToday();
  if (T.days) { renderDays(); renderWeek(false); }
  renderFamilies();
  d.dispatchEvent(new CustomEvent('ef:today'));
}
function clock() {
  var lastMin = -1;
  setInterval(function () {
    renderToday();
    var m = new Date(api().now()).getUTCMinutes();
    if (m !== lastMin) { lastMin = m; if (T.days && S.day === 0) { renderWeek(false); } }
  }, 30000);
}

/* ---------- boot ---------- */
function fail() { root.classList.add('tt-all'); }
function boot() {
  heroClip();
  if (!api() || !api().load) { fail(); return; }
  api().load().then(function (data) {
    DATA = data;
    renderToday();
    initWeek();
    renderFamilies();
    initTags();
    initQuotes();
    initBars();
    initActions();
    clock();
    if (EF.motion && EF.motion.scan) { EF.motion.scan(d.getElementById('main')); }
    if (EF.media && EF.media.sync) { EF.media.sync(); }
    d.addEventListener('ef:booked', refresh);
    d.addEventListener('ef:forget', refresh);
    d.addEventListener('ef:sheet', function (e) {
      var det = e.detail || {}, next = (det.open && det.panel && (det.kind === 'class' || det.kind === 'membership' || det.kind === 'pay')) ? det.occId : null;
      if (next !== panelOcc) { panelOcc = next; if (T.days) { renderWeek(false); } }
    });
    if (/[?&]view=filters\b/.test(w.location.search) && EF.sheet && EF.sheet.open) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) { }
      EF.sheet.open('filters', {}, '?view=filters');
    }
  }, fail);
}
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window, document);
