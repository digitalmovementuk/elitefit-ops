/* Elite Fit Group Fitness concept v1 · api.js (27 Oct 2026)
   Mock API for the demo booking. Same pattern as the homepage prototype's EFApi.
   - The only network call is one same-origin fetch of assets/data/groupfitness.json.
   - Nothing a visitor types ever leaves the page. Bookings live in localStorage (try/catch, memory fallback).
   - "Today" and every date are Bali time (Asia/Makassar, UTC+8, no DST), whatever the device timezone.
   - Spots left are SAMPLE numbers: a stable hash of class and date, minus the demo bookings made here.
   Testing: ?now=2026-10-28T07:30 sets the clock (read as Bali time; it keeps ticking from there). */
(function (win, doc) {
'use strict';
var EF = win.EF = win.EF || {};
if (EF.api) { return; }

var OFFSET = 8 * 3600000;
var CAPACITY = 14;
var KEY = 'ef-gf-v1';
var DOW_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var DOW_LONG = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var script = doc.currentScript;
var data = null;
var maps = { cls: {}, coach: {}, family: {} };
var loadPromise = null;

/* ---------- helpers ---------- */
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
function fire(name, detail) {
  var ev;
  try { ev = new win.CustomEvent(name, { detail: detail }); }
  catch (e) { ev = doc.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail); }
  doc.dispatchEvent(ev);
}

/* ---------- clock (Bali time) ---------- */
var t0 = Date.now();
var nowParam = null;
var nowBase = null;
(function () {
  try {
    var m = /[?&]now=([^&#]+)/.exec(win.location.search);
    if (m) {
      var raw = decodeURIComponent(m[1]);
      var p = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(raw);
      if (p) {
        nowBase = Date.UTC(+p[1], +p[2] - 1, +p[3], +p[4], +p[5]) - OFFSET;
        nowParam = raw;
      }
    }
  } catch (e) {}
})();
function now() { return nowBase === null ? Date.now() : nowBase + (Date.now() - t0); }

function wita(ms) {
  var d = new Date(ms + OFFSET);
  var g = d.getUTCDay();
  var y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  return {
    y: y, m: m, d: day, dow: g === 0 ? 7 : g,
    hh: d.getUTCHours(), mm: d.getUTCMinutes(),
    ymd: y + '-' + pad2(m) + '-' + pad2(day),
    key: '' + y + pad2(m) + pad2(day)
  };
}
function ymdParts(ymd) { var p = ymd.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
function ymdAdd(ymd, n) {
  var p = ymdParts(ymd);
  var d = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}
function ymdDow(ymd) { var p = ymdParts(ymd); var g = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); return g === 0 ? 7 : g; }
function ymdDiff(a, b) { var pa = ymdParts(a), pb = ymdParts(b); return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000); }
function startMs(ymd, time) {
  var p = ymdParts(ymd), t = time.split(':');
  return Date.UTC(p.y, p.m - 1, p.d, +t[0], +t[1]) - OFFSET;
}

/* ---------- formats ---------- */
function k(n) {
  n = Math.round(n);
  if (n >= 1000000) { return (Math.round(n / 100000) / 10) + 'M'; }
  return Math.round(n / 1000) + 'K';
}
function idr(n) { return 'IDR ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function time12(t) {
  var p = t.split(':'), h = +p[0], m = +p[1];
  var suf = h >= 12 ? 'pm' : 'am';
  var h12 = h % 12; if (h12 === 0) { h12 = 12; }
  return h12 + (m ? ':' + pad2(m) : '') + suf;
}
function dateShort(ymd) { var p = ymdParts(ymd); return DOW_SHORT[ymdDow(ymd)] + ' ' + p.d + ' ' + MON_SHORT[p.m - 1]; }
function dateLong(ymd) { var p = ymdParts(ymd); return DOW_LONG[ymdDow(ymd)] + ' ' + p.d + ' ' + MON_LONG[p.m - 1]; }

/* ---------- store (localStorage, memory fallback) ---------- */
var memOnly = false;
var mem = null;
var cache = null;
var lastRaw = null;
function defaults() { return { v: 1, visitor: 'first', prefJoin: null, bookings: [], flow: null }; }
function normalise(o) {
  var d = defaults();
  if (!o || typeof o !== 'object' || o.v !== 1) { return d; }
  if (o.visitor === 'first' || o.visitor === 'returning') { d.visitor = o.visitor; }
  if (o.prefJoin === 'duo') { d.prefJoin = 'duo'; }
  if (Object.prototype.toString.call(o.bookings) === '[object Array]') { d.bookings = o.bookings; }
  if (o.flow && typeof o.flow === 'object') { d.flow = o.flow; }
  return d;
}
function readState() {
  if (!memOnly) {
    var raw;
    try { raw = win.localStorage.getItem(KEY); }
    catch (e) { memOnly = true; }
    if (!memOnly) {
      if (cache && raw === lastRaw) { return cache; }
      var parsed = null;
      if (raw) { try { parsed = JSON.parse(raw); } catch (e2) { parsed = null; } }
      lastRaw = raw;
      cache = normalise(parsed);
      mem = cache;
      return cache;
    }
  }
  if (!mem) { mem = defaults(); }
  return mem;
}
function commit(s) {
  s.v = 1;
  mem = s;
  cache = s;
  var raw = JSON.stringify(s);
  lastRaw = raw;
  if (!memOnly) {
    try { win.localStorage.setItem(KEY, raw); }
    catch (e) { memOnly = true; }
  }
}
var store = {
  get: function () { return clone(readState()); },
  set: function (patch) {
    var s = clone(readState());
    var key;
    for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { s[key] = clone(patch[key]); } }
    commit(s);
    return clone(s);
  }
};

/* ---------- data ---------- */
function dataUrl() {
  try { if (script && script.src) { return new win.URL('../data/groupfitness.json', script.src).href; } } catch (e) {}
  return 'assets/data/groupfitness.json';
}
function index(d) {
  var i;
  maps = { cls: {}, coach: {}, family: {} };
  for (i = 0; i < d.classes.length; i++) { maps.cls[d.classes[i].id] = d.classes[i]; }
  for (i = 0; i < d.coaches.length; i++) { maps.coach[d.coaches[i].id] = d.coaches[i]; }
  for (i = 0; i < d.families.length; i++) { maps.family[d.families[i].id] = d.families[i]; }
}
function load() {
  if (loadPromise) { return loadPromise; }
  loadPromise = win.fetch(dataUrl(), { credentials: 'same-origin' }).then(function (res) {
    if (!res.ok) { throw new Error('Could not load the class data (' + res.status + ')'); }
    return res.json();
  }).then(function (d) {
    data = d;
    api.data = d;
    index(d);
    return d;
  });
  return loadPromise;
}

/* ---------- occurrences ---------- */
function fnv(str) {
  var h = 0x811c9dc5, i;
  for (i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}
function baseSpots(classId, ymd) {
  var h = fnv(classId + '|' + ymd);
  if (h % 100 < 12) { return 0; }
  return 2 + ((h >>> 8) % 11);
}
function parseOccId(s) {
  var m = /^(.+)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/.exec(String(s));
  if (!m) { return null; }
  return { classId: m[1], ymd: m[2] + '-' + m[3] + '-' + m[4], time: m[5] + ':' + m[6] };
}
function slotExists(classId, ymd, time) {
  var list = data.timetable.week[ymdDow(ymd)] || [], i;
  for (i = 0; i < list.length; i++) { if (list[i][0] === time && list[i][1] === classId) { return true; } }
  return false;
}
function makeOcc(classId, ymd, time, dayIndex, nowMs, st) {
  var c = maps.cls[classId];
  if (!c) { return null; }
  var id = classId + '-' + ymd.replace(/-/g, '') + '-' + time.replace(':', '');
  var start = startMs(ymd, time);
  var taken = 0, last = null, i, b;
  var list = st.bookings || [];
  for (i = 0; i < list.length; i++) {
    b = list[i];
    if (b.occId === id) { last = b; if (!b.waitlist) { taken += (b.people || 1); } }
  }
  var spots = Math.max(0, baseSpots(classId, ymd) - taken);
  return {
    id: id, classId: classId, cls: c,
    family: maps.family[c.family], familyId: c.family,
    coach: maps.coach[c.coach], coachId: c.coach,
    ymd: ymd, time: time, start: start, end: start + (c.length_min || 60) * 60000,
    dayIndex: dayIndex, capacity: CAPACITY, spotsLeft: spots, full: spots === 0,
    past: start <= nowMs, booking: last
  };
}
function dayOccs(ymd, dayIndex, nowMs, st) {
  var list = data.timetable.week[ymdDow(ymd)] || [], out = [], i, o;
  for (i = 0; i < list.length; i++) {
    o = makeOcc(list[i][1], ymd, list[i][0], dayIndex, nowMs, st);
    if (o) { out.push(o); }
  }
  return out;
}
function week() {
  if (!data) { return []; }
  var nowMs = now(), today = wita(nowMs), st = readState(), out = [], i;
  for (i = 0; i < 7; i++) {
    var ymd = ymdAdd(today.ymd, i), p = ymdParts(ymd), dow = ymdDow(ymd);
    out.push({
      i: i, ymd: ymd, key: ymd.replace(/-/g, ''), dow: dow, isToday: i === 0,
      label: i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : DOW_SHORT[dow]),
      dowShort: DOW_SHORT[dow], dayNum: p.d, monthShort: MON_SHORT[p.m - 1],
      long: DOW_LONG[dow] + ' ' + p.d + ' ' + MON_LONG[p.m - 1],
      occs: dayOccs(ymd, i, nowMs, st)
    });
  }
  return out;
}
function ahead(days) {
  var nowMs = now(), today = wita(nowMs), st = readState(), out = [], i;
  for (i = 0; i < days; i++) { out = out.concat(dayOccs(ymdAdd(today.ymd, i), i, nowMs, st)); }
  out.sort(function (a, b) { return a.start - b.start; });
  return out;
}
function nextOfClass(classId) {
  var all = ahead(14), i;
  for (i = 0; i < all.length; i++) { if (all[i].classId === classId && !all[i].past) { return all[i]; } }
  return null;
}
function occExact(occId) {
  if (!data) { return null; }
  var p = parseOccId(occId);
  if (!p || !maps.cls[p.classId] || !slotExists(p.classId, p.ymd, p.time)) { return null; }
  var nowMs = now();
  return makeOcc(p.classId, p.ymd, p.time, ymdDiff(wita(nowMs).ymd, p.ymd), nowMs, readState());
}
function occ(x) {
  if (!data || !x) { return null; }
  var p = parseOccId(x);
  if (p && maps.cls[p.classId]) {
    var o = occExact(x);
    if (o && !o.past) { return o; }
    return nextOfClass(p.classId);
  }
  if (maps.cls[x]) { return nextOfClass(x); }
  return null;
}
function upcoming(n) {
  var all = ahead(14), out = [], i;
  for (i = 0; i < all.length && out.length < n; i++) { if (!all[i].past && !all[i].full) { out.push(all[i]); } }
  return out;
}
function slots(classId) {
  var out = [], d, list, i;
  if (!data) { return out; }
  for (d = 1; d <= 7; d++) {
    list = data.timetable.week[d] || [];
    for (i = 0; i < list.length; i++) { if (list[i][1] === classId) { out.push({ dow: d, dowShort: DOW_SHORT[d], time: list[i][0] }); } }
  }
  return out;
}
function weeklyCount() {
  var n = 0, d;
  if (!data) { return 0; }
  for (d = 1; d <= 7; d++) { n += (data.timetable.week[d] || []).length; }
  return n;
}
function coachWeekly(id) {
  var n = 0, d, list, i;
  if (!data) { return 0; }
  for (d = 1; d <= 7; d++) {
    list = data.timetable.week[d] || [];
    for (i = 0; i < list.length; i++) { if (maps.cls[list[i][1]] && maps.cls[list[i][1]].coach === id) { n++; } }
  }
  return n;
}
function coachOccs(id) {
  var out = [], w = week(), i, j;
  for (i = 0; i < w.length; i++) {
    for (j = 0; j < w[i].occs.length; j++) { if (w[i].occs[j].coachId === id && !w[i].occs[j].past) { out.push(w[i].occs[j]); } }
  }
  return out;
}

/* ---------- booking ---------- */
function firstNameOf(name) {
  var s = String(name || '').replace(/^\s+|\s+$/g, '').split(/\s+/)[0] || '';
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
function passOf(flow) {
  if (flow.join === 'pack') { return flow.pack || 'class-1'; }
  return flow.join || 'day';
}
function book(flow) {
  var st = clone(readState());
  var p = parseOccId(flow.occId);
  var pass = passOf(flow);
  var ref, tries = 0, used = {}, i;
  for (i = 0; i < st.bookings.length; i++) { used[st.bookings[i].ref] = true; }
  do { ref = 'EF-DEMO-' + (1000 + Math.floor(Math.random() * 9000)); tries++; } while (used[ref] && tries < 50);
  var b = {
    ref: ref, occId: flow.occId, classId: p ? p.classId : '', ymd: p ? p.ymd : '', time: p ? p.time : '',
    pass: pass, people: pass === 'duo' ? 2 : 1,
    firstName: firstNameOf(flow.details && flow.details.name),
    plus1: pass === 'duo' ? firstNameOf(flow.details && flow.details.plus1) : '',
    wa: !!(flow.details && flow.details.wa),
    waitlist: !!flow.waitlist, createdAt: now()
  };
  st.bookings.push(b);
  if (pass === 'duo') { st.prefJoin = null; }
  commit(st);
  fire('ef:booked', { booking: clone(b), occ: occExact(flow.occId) });
  return clone(b);
}
function bookingFor(occId) {
  var list = readState().bookings, i, found = null;
  for (i = 0; i < list.length; i++) { if (list[i].occId === occId) { found = list[i]; } }
  return found ? clone(found) : null;
}
function reset() {
  cache = null; mem = null; lastRaw = null;
  try { win.localStorage.removeItem(KEY); } catch (e) {}
  memOnly = false;
  fire('ef:reset', {});
}

/* ---------- calendar file ---------- */
function utcStamp(ms) {
  var d = new Date(ms);
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
}
function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
function fold(line) {
  var out = [], cur = '', bytes = 0, i, ch, code, n;
  for (i = 0; i < line.length; i++) {
    ch = line.charAt(i); code = line.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < line.length) { ch += line.charAt(i + 1); i++; n = 4; }
    else { n = code < 0x80 ? 1 : (code < 0x800 ? 2 : 3); }
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}
function icsText(o, booking) {
  var club = data.club;
  var waitlist = !!(booking && booking.waitlist);
  var desc = 'Arrive 10 minutes early and say hi at the front desk. Bring your own water bottle. Demo booking.';
  if (waitlist) { desc += " You're on the waitlist. We'll WhatsApp you if a spot opens."; }
  var ref = booking && booking.ref ? booking.ref : 'EF-DEMO-0000';
  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elite Fit//Group classes concept v1//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + ref + '@elitefit-concept',
    'DTSTAMP:' + utcStamp(now()),
    'DTSTART:' + utcStamp(o.start),
    'DTEND:' + utcStamp(o.end),
    'SUMMARY:' + icsEscape(o.cls.name + ' with ' + o.coach.name + ' at Elite Fit'),
    'LOCATION:' + icsEscape(club.name + ', ' + club.address),
    'DESCRIPTION:' + icsEscape(desc),
    'STATUS:' + (waitlist ? 'TENTATIVE' : 'CONFIRMED'),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:' + icsEscape(o.cls.name + ' at Elite Fit'),
    'TRIGGER:-PT60M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  var i, out = [];
  for (i = 0; i < lines.length; i++) { out.push(fold(lines[i])); }
  return out.join('\r\n') + '\r\n';
}
function downloadIcs(o, booking) {
  var text = icsText(o, booking);
  var name = 'elite-fit-' + o.classId + '-' + o.ymd.replace(/-/g, '') + '.ics';
  var blob = new win.Blob([text], { type: 'text/calendar;charset=utf-8' });
  var url = win.URL.createObjectURL(blob);
  var a = doc.createElement('a');
  a.href = url; a.download = name; a.style.display = 'none';
  doc.body.appendChild(a);
  a.click();
  win.setTimeout(function () { if (a.parentNode) { a.parentNode.removeChild(a); } win.URL.revokeObjectURL(url); }, 1500);
  return name;
}

/* ---------- public ---------- */
var api = EF.api = {
  data: null,
  nowParam: nowParam,
  load: load,
  now: now,
  wita: wita,
  week: week,
  occ: occ,
  occById: occExact,
  upcoming: upcoming,
  cls: function (id) { return maps.cls[id] || null; },
  coach: function (id) { return maps.coach[id] || null; },
  family: function (id) { return maps.family[id] || null; },
  classesInFamily: function (fid) { return data ? data.classes.filter(function (c) { return c.family === fid; }) : []; },
  slots: slots,
  weeklyCount: weeklyCount,
  coachWeekly: coachWeekly,
  coachOccs: coachOccs,
  k: k,
  idr: idr,
  time12: time12,
  dateShort: dateShort,
  dateLong: dateLong,
  firstName: firstNameOf,
  store: store,
  book: book,
  bookingFor: bookingFor,
  reset: reset,
  icsText: icsText,
  downloadIcs: downloadIcs
};
})(window, document);
