/* Forked from groupfitness-prototype/v1/assets/js/api.js on 28 Oct 2026 for Home v2a, booking-first (one-sheet journey). v1 is unchanged.
   Elite Fit · Design concept, Home v2a, booking-first · api.js · v1.0
   What changed against v1 (UX-SPEC §15.2):
   - load() fetches the shared ../../v1/assets/data/groupfitness.json and this page's assets/data/v2.json in parallel
     and deep-merges the overlay (overlay wins; objects merge, arrays replace).
   - Store key ef-gf-v2a (the six shipped pages keep ef-gf-v1; Home v2 keeps ef-gf-v2). Shape:
     {v:2, contact, remember, prefPass, lastPass, lastPay, bookings, flow}.
   - passes() returns the four booking options in sheet order (Raoul, 28 Oct: member, class drop-in, membership, Duo day pass).
   - Free spots use a Sample capacity per class from the overlay (timetable.capacity): free = min(capacity, sample hash) - bookings.
   - No email anywhere (Raoul, 28 Oct): the contact and the payload carry full name and WhatsApp only.
   - book() keeps pass, people, total, pay choice, member and waitlist; payload() builds the production record;
     submit() resolves locally after 600 ms (ENDPOINT = null: the prototype sends nothing anywhere).
   - e164(), parsePhone(), contact.get/set/forget(), nextChip(), icsText() with the Google-listing address and the pay line.
   Unchanged: now() with ?now=, wita, week, occ, upcoming, the FNV sample spots, k, idr, time12, dateShort.
   The only network calls are the two same-origin JSON files. Nothing a visitor types leaves the page. */
(function (win, doc) {
'use strict';
var EF = win.EF = win.EF || {};
if (EF.api) { return; }

var OFFSET = 8 * 3600000;
var CAPACITY = 14;
var KEY = 'ef-gf-v2a';
var CONTACT_DAYS = 90;
var DOW_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var DOW_LONG = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var PASS_IDS = ['class-1', 'duo', 'perform-4w', 'elite-4w', 'member'];
var script = doc.currentScript;
var data = null;
var maps = { cls: {}, coach: {}, family: {} };
var loadPromise = null;
var lastPayload = null;

/* ---------- helpers ---------- */
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
function isObj(o) { return !!o && typeof o === 'object' && Object.prototype.toString.call(o) !== '[object Array]'; }
function merge(base, over) {
  var k;
  if (!isObj(base) || !isObj(over)) { return clone(over); }
  for (k in over) {
    if (!Object.prototype.hasOwnProperty.call(over, k) || k === '_meta') { continue; }
    base[k] = (isObj(base[k]) && isObj(over[k])) ? merge(base[k], over[k]) : clone(over[k]);
  }
  return base;
}
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
  return { y: y, m: m, d: day, dow: g === 0 ? 7 : g, hh: d.getUTCHours(), mm: d.getUTCMinutes(), ymd: y + '-' + pad2(m) + '-' + pad2(day), key: '' + y + pad2(m) + pad2(day) };
}
function ymdParts(ymd) { var p = ymd.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
function ymdAdd(ymd, n) {
  var p = ymdParts(ymd);
  var d = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}
function ymdDow(ymd) { var p = ymdParts(ymd); var g = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); return g === 0 ? 7 : g; }
function ymdDiff(a, b) { var pa = ymdParts(a), pb = ymdParts(b); return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000); }
function startMs(ymd, time) { var p = ymdParts(ymd), t = time.split(':'); return Date.UTC(p.y, p.m - 1, p.d, +t[0], +t[1]) - OFFSET; }
function isoWita(ms) {
  var w = wita(ms), d = new Date(ms + OFFSET);
  return w.ymd + 'T' + pad2(w.hh) + ':' + pad2(w.mm) + ':' + pad2(d.getUTCSeconds()) + '+08:00';
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
  var h12 = h % 12; if (h12 === 0) { h12 = 12; }
  return h12 + (m ? ':' + pad2(m) : '') + (h >= 12 ? 'pm' : 'am');
}
function dateShort(ymd) { var p = ymdParts(ymd); return DOW_SHORT[ymdDow(ymd)] + ' ' + p.d + ' ' + MON_SHORT[p.m - 1]; }
function dateLong(ymd) { var p = ymdParts(ymd); return DOW_LONG[ymdDow(ymd)] + ' ' + p.d + ' ' + MON_LONG[p.m - 1]; }

/* ---------- store (localStorage, memory fallback) ---------- */
var memOnly = false;
var mem = null;
var cache = null;
var lastRaw = null;
function defaults() { return { v: 2, contact: null, remember: true, prefPass: null, lastPass: null, lastPay: null, bookings: [], flow: null }; }
function normalise(o) {
  var d = defaults();
  if (!o || typeof o !== 'object' || o.v !== 2) { return d; }
  if (o.contact && typeof o.contact === 'object' && o.contact.phone) { d.contact = o.contact; }
  if (o.remember === false) { d.remember = false; }
  if (PASS_IDS.indexOf(o.prefPass) >= 0) { d.prefPass = o.prefPass; }
  if (PASS_IDS.indexOf(o.lastPass) >= 0) { d.lastPass = o.lastPass; }
  if (o.lastPay === 'now' || o.lastPay === 'reception') { d.lastPay = o.lastPay; }
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
  s.v = 2;
  mem = s; cache = s;
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
    var s = clone(readState()), key;
    for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { s[key] = clone(patch[key]); } }
    commit(s);
    return clone(s);
  },
  persistent: function () { readState(); return !memOnly; }
};

/* ---------- returning contact ---------- */
var contact = {
  get: function () {
    var c = readState().contact;
    if (!c) { return null; }
    if (c.savedAt && (now() - c.savedAt) > CONTACT_DAYS * 86400000) { store.set({ contact: null }); return null; }
    return clone(c);
  },
  set: function (c) {
    if (readState().remember === false) { return null; }
    var rec = { name: String(c.name || ''), cc: c.cc || '+62', phone: String(c.phone || ''), member: !!c.member, savedAt: now() };
    store.set({ contact: rec });
    return rec;
  },
  forget: function () { store.set({ contact: null, remember: false, lastPass: null, lastPay: null, flow: null }); fire('ef:forget', {}); }
};

/* ---------- phone helpers ---------- */
/* parsePhone("+44 7700 900123") -> {cc:'+44', national:'7700900123', zero:false}; "0812 3456" -> {cc:null, national:'8123456', zero:true} */
function parsePhone(raw, ccList) {
  var s = String(raw || '').replace(/[\s\-.()\/]/g, ''), cc = null, zero = false, i, list = ccList || [];
  if (/^00\d/.test(s)) { s = '+' + s.slice(2); }
  if (s.charAt(0) === '+') {
    var digits = s.slice(1).replace(/\D/g, ''), best = '';
    for (i = 0; i < list.length; i++) {
      var c = list[i].replace('+', '');
      if (digits.indexOf(c) === 0 && c.length > best.length) { best = c; }
    }
    if (best) { cc = '+' + best; s = digits.slice(best.length); } else { s = digits; }
  } else { s = s.replace(/\D/g, ''); }
  if (s.charAt(0) === '0') { s = s.slice(1); zero = true; }
  return { cc: cc, national: s, zero: zero };
}
function e164(cc, national) {
  var c = String(cc || '').replace(/\D/g, ''), n = String(national || '').replace(/\D/g, '');
  if (n.charAt(0) === '0') { n = n.slice(1); }
  return '+' + c + n;
}
function phoneOk(cc, national) {
  var c = String(cc || '').replace(/\D/g, ''), n = String(national || '').replace(/\D/g, '');
  return n.length >= 6 && (c.length + n.length) <= 15;
}
function maskPhone(cc, national) {
  var n = String(national || '').replace(/\D/g, '');
  if (n.length < 7) { return cc + ' ' + n; }
  return cc + ' ' + n.slice(0, 3) + ' ••• ' + n.slice(-4);
}

/* ---------- data ---------- */
function urlFrom(rel, fallback) {
  try { if (script && script.src) { return new win.URL(rel, script.src).href; } } catch (e) {}
  return fallback;
}
function index(d) {
  var i;
  maps = { cls: {}, coach: {}, family: {} };
  for (i = 0; i < d.classes.length; i++) { maps.cls[d.classes[i].id] = d.classes[i]; }
  for (i = 0; i < d.coaches.length; i++) { maps.coach[d.coaches[i].id] = d.coaches[i]; }
  for (i = 0; i < d.families.length; i++) { maps.family[d.families[i].id] = d.families[i]; }
}
function getJson(url) {
  return win.fetch(url, { credentials: 'same-origin' }).then(function (res) {
    if (!res.ok) { throw new Error('Could not load ' + url + ' (' + res.status + ')'); }
    return res.json();
  });
}
function load() {
  if (loadPromise) { return loadPromise; }
  var shared = getJson(urlFrom('../../../../v1/assets/data/groupfitness.json', '../../v1/assets/data/groupfitness.json'));
  var overlay = getJson(urlFrom('../data/v2.json', 'assets/data/v2.json')).then(null, function () { return {}; });
  loadPromise = win.Promise.all([shared, overlay]).then(function (r) {
    var d = merge(r[0], r[1] || {});
    data = d; api.data = d;
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
function capOf(classId) {
  var t = data && data.timetable, c = t && t.capacity && t.capacity[classId];
  return c > 0 ? c : CAPACITY;
}
function makeOcc(classId, ymd, time, dayIndex, nowMs, st) {
  var c = maps.cls[classId];
  if (!c) { return null; }
  var cap = capOf(classId);
  var id = classId + '-' + ymd.replace(/-/g, '') + '-' + time.replace(':', '');
  var start = startMs(ymd, time);
  var taken = 0, last = null, i, b, list = st.bookings || [];
  for (i = 0; i < list.length; i++) {
    b = list[i];
    if (b.occId === id) { last = b; if (!b.waitlist) { taken += (b.people || 1); } }
  }
  var spots = Math.max(0, Math.min(cap, baseSpots(classId, ymd)) - taken);
  return {
    id: id, classId: classId, cls: c,
    family: maps.family[c.family], familyId: c.family,
    coach: maps.coach[c.coach], coachId: c.coach,
    ymd: ymd, time: time, start: start, end: start + (c.length_min || 60) * 60000,
    dayIndex: dayIndex, capacity: cap, spotsLeft: spots, full: spots === 0,
    past: start <= nowMs, booking: last
  };
}
function dayOccs(ymd, dayIndex, nowMs, st) {
  var list = data.timetable.week[ymdDow(ymd)] || [], out = [], i, o;
  for (i = 0; i < list.length; i++) { o = makeOcc(list[i][1], ymd, list[i][0], dayIndex, nowMs, st); if (o) { out.push(o); } }
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
function nextOfClass(classId, opts) {
  var all = ahead(14), out = [], i, n = (opts && opts.n) || 1, skip = (opts && opts.skip) || '';
  for (i = 0; i < all.length && out.length < n; i++) {
    if (all[i].classId === classId && !all[i].past && all[i].id !== skip && (!(opts && opts.open) || !all[i].full)) { out.push(all[i]); }
  }
  return (opts && opts.n) ? out : (out[0] || null);
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
/* next n bookable occurrences: not started, not full, not already booked on this device (the Today card rule) */
function upcoming(n) {
  var all = ahead(14), out = [], i;
  for (i = 0; i < all.length && out.length < n; i++) { if (!all[i].past && !all[i].full && !all[i].booking) { out.push(all[i]); } }
  return out;
}
function nextChip() {
  var o = upcoming(1)[0];
  if (!o) { return null; }
  var minutes = Math.max(1, Math.ceil((o.start - now()) / 60000)), text;
  var sp = o.spotsLeft === 1 ? '1 spot free' : o.spotsLeft + ' spots free';
  if (o.dayIndex === 0) { text = minutes <= 60 ? 'Next class in ' + minutes + ' min · ' + sp : 'Next class at ' + time12(o.time) + ' · ' + sp; }
  else if (o.dayIndex === 1) { text = 'Next class tomorrow, ' + time12(o.time); }
  else { text = 'Next class ' + DOW_SHORT[ymdDow(o.ymd)] + ', ' + time12(o.time); }
  return { occ: o, minutes: minutes, text: text };
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
function weeklyCount() { var n = 0, d; if (!data) { return 0; } for (d = 1; d <= 7; d++) { n += (data.timetable.week[d] || []).length; } return n; }
function coachWeekly(id) {
  var n = 0, d, list, i;
  if (!data) { return 0; }
  for (d = 1; d <= 7; d++) { list = data.timetable.week[d] || []; for (i = 0; i < list.length; i++) { if (maps.cls[list[i][1]] && maps.cls[list[i][1]].coach === id) { n++; } } }
  return n;
}
function coachOccs(id) {
  var out = [], w = week(), i, j;
  for (i = 0; i < w.length; i++) { for (j = 0; j < w[i].occs.length; j++) { if (w[i].occs[j].coachId === id && !w[i].occs[j].past) { out.push(w[i].occs[j]); } } }
  return out;
}

/* ---------- passes ---------- */
function packOf(id) {
  var packs = (data && data.passes.packs) || [], i;
  for (i = 0; i < packs.length; i++) { if (packs[i].id === id) { return packs[i]; } }
  return null;
}
/* price and people per pass id ('membership' resolves to its chosen tier) */
function passInfo(id) {
  var P = data.passes, pk;
  if (id === 'member') { return { id: id, unit: 0, people: 1, total: 0 }; }
  if (id === 'duo') { return { id: id, unit: P.duo.price_idr, old: P.duo.old_price_idr, people: 2, total: P.duo.price_idr * 2 }; }
  pk = packOf(id);
  if (pk) { return { id: id, unit: pk.price_idr, people: 1, total: pk.price_idr }; }
  return null;
}
function passes() {
  var order = (data && data.passes.order) || ['member', 'class-1', 'membership', 'duo'];
  return order.map(function (id) {
    if (id === 'membership') { return { id: 'membership', tiers: ['perform-4w', 'elite-4w'], from: packOf('perform-4w').price_idr }; }
    if (id === 'member') { return { id: 'member', unit: 0, people: 1, total: 0 }; }
    return passInfo(id);
  });
}

/* ---------- booking ---------- */
function firstNameOf(name) {
  var s = String(name || '').replace(/^\s+|\s+$/g, '').split(/\s+/)[0] || '';
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
function newRef(st) {
  var ref, tries = 0, used = {}, i;
  for (i = 0; i < st.bookings.length; i++) { used[st.bookings[i].ref] = true; }
  do { ref = 'EF-DEMO-' + (1000 + Math.floor(Math.random() * 9000)); tries++; } while (used[ref] && tries < 50);
  return ref;
}
/* flow: {occId, pass, pay, member, waitlist, name, cc, phone, section, returning} */
function book(flow) {
  var st = clone(readState());
  var p = parseOccId(flow.occId);
  var pass = flow.waitlist ? null : (flow.member ? 'member' : flow.pass);
  var info = pass ? passInfo(pass) : null;
  var membership = pass === 'perform-4w' || pass === 'elite-4w';
  var b = {
    ref: flow.ref || newRef(st), occId: flow.occId, classId: p ? p.classId : '', ymd: p ? p.ymd : '', time: p ? p.time : '',
    pass: pass, people: info ? info.people : 1, unit_idr: info ? info.unit : 0, total_idr: info ? info.total : 0,
    pay: (flow.waitlist || flow.member) ? null : flow.pay, paid: !!(flow.pay === 'now' && !flow.waitlist && !flow.member),
    method: null,
    firstName: firstNameOf(flow.name),
    member: !!flow.member, waitlist: !!flow.waitlist,
    intent: flow.waitlist ? 'waitlist' : (membership ? 'membership_start' : 'class_booking'),
    membershipStart: membership && p ? p.ymd : null,
    createdAt: now()
  };
  st.bookings.push(b);
  if (pass && pass !== 'member') { st.lastPass = pass; }
  if (b.pay) { st.lastPay = b.pay; }
  st.prefPass = null;
  st.flow = null;
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

/* ---------- production payload (UX-SPEC §14). Built and kept in memory only; shown behind ?payload=1 ---------- */
function utm(name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(win.location.search); try { return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; } }
function payload(b, flow) {
  var o = occExact(b.occId) || {}, c = o.cls || maps.cls[b.classId] || {}, co = o.coach || maps.coach[c.coach] || {};
  var ref = '';
  try { ref = doc.referrer ? new win.URL(doc.referrer).origin : ''; } catch (e) { ref = ''; }
  var meta = (data && data.payload) || {};
  return {
    schema_version: meta.schema_version || 'ef-booking-1',
    booking_ref: b.ref,
    created_at: isoWita(b.createdAt || now()),
    intent: b.intent,
    class_id: b.classId, class_name: c.name || '',
    occurrence_id: b.occId,
    class_start: o.start ? isoWita(o.start) : null, class_end: o.end ? isoWita(o.end) : null,
    coach_id: co.id || '', coach_name: co.name || '',
    pass_id: b.pass, people: b.people,
    unit_price_idr: b.unit_idr, total_idr: b.total_idr, currency: 'IDR',
    membership_start_date: b.membershipStart,
    pay_choice: b.pay, payment_status: b.paid ? 'paid' : (b.pay === 'now' ? 'pending' : 'unpaid'),
    payment_method: null, payment_ref: b.paid ? 'DEMO-' + b.ref.slice(-4) : null,
    full_name: (flow && flow.name) ? String(flow.name).replace(/^\s+|\s+$/g, '') : null,
    first_name: b.firstName || null,
    whatsapp_e164: flow ? e164(flow.cc, flow.phone) : null,
    whatsapp_country_code: flow ? flow.cc : null,
    is_member: !!b.member,
    returning_device: !!(flow && flow.returning),
    waitlist: !!b.waitlist,
    reminder_channel: 'whatsapp',
    marketing_opt_in: false,
    privacy_notice_version: meta.privacy_notice_version || '2026-10-28',
    source_page: meta.source_page || 'https://elitefitbali.com/class-schedule/',
    source_section: (flow && flow.section) || 'week',
    utm_source: utm('utm_source'), utm_medium: utm('utm_medium'), utm_campaign: utm('utm_campaign'),
    referrer_origin: ref,
    locale: (win.navigator && (win.navigator.language || '')) || ''
  };
}
/* the live page POSTs the payload to one first-party endpoint; the prototype resolves locally and sends nothing */
function submit(p) {
  lastPayload = p;
  return new win.Promise(function (resolve) { win.setTimeout(function () { resolve({ ok: true, ref: p.booking_ref, demo: true }); }, 600); });
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
function passName(id) {
  return { 'class-1': 'Class drop-in', duo: 'Duo day pass', 'perform-4w': 'Perform 4 weeks', 'elite-4w': 'Elite 4 weeks', member: 'Membership' }[id] || '';
}
function payLine(b) {
  if (b.member) { return 'included in your membership'; }
  if (b.paid) { return 'paid ' + k(b.total_idr) + ' (demo)'; }
  return 'pay ' + k(b.total_idr) + ' at reception';
}
function icsText(o, booking) {
  var club = data.club, ref = booking && booking.ref ? booking.ref : 'EF-DEMO-0000';
  var desc = 'Arrive 10 minutes early. ' + passName(booking.pass) + ', ' + payLine(booking) + '. Ref ' + ref + '. Demo booking from the Elite Fit concept page.';
  var lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elite Fit//Home v2a concept//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + ref + '@elitefit-concept',
    'DTSTAMP:' + utcStamp(now()),
    'DTSTART:' + utcStamp(o.start),
    'DTEND:' + utcStamp(o.end),
    'SUMMARY:' + icsEscape(o.cls.name + ' with ' + o.coach.name + ' · Elite Fit'),
    'LOCATION:' + icsEscape('Elite Fit Bali, ' + (club.address_gbp || club.address)),
    'DESCRIPTION:' + icsEscape(desc),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(o.cls.name + ' at Elite Fit'), 'TRIGGER:-PT1H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
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
  ENDPOINT: null,
  nowParam: nowParam,
  load: load,
  now: now,
  wita: wita,
  week: week,
  occ: occ,
  occById: occExact,
  parseOccId: parseOccId,
  upcoming: upcoming,
  nextOfClass: nextOfClass,
  nextChip: nextChip,
  cls: function (id) { return maps.cls[id] || null; },
  coach: function (id) { return maps.coach[id] || null; },
  family: function (id) { return maps.family[id] || null; },
  classesInFamily: function (fid) { return data ? data.classes.filter(function (c) { return c.family === fid; }) : []; },
  slots: slots,
  weeklyCount: weeklyCount,
  coachWeekly: coachWeekly,
  coachOccs: coachOccs,
  passes: passes,
  capacity: capOf,
  passInfo: passInfo,
  passName: passName,
  payLine: payLine,
  k: k, idr: idr, time12: time12, dateShort: dateShort, dateLong: dateLong,
  firstName: firstNameOf,
  parsePhone: parsePhone, e164: e164, phoneOk: phoneOk, maskPhone: maskPhone,
  store: store,
  contact: contact,
  book: book,
  bookingFor: bookingFor,
  payload: payload,
  submit: submit,
  lastPayload: function () { return clone(lastPayload); },
  reset: reset,
  icsText: icsText,
  downloadIcs: downloadIcs
};
})(window, document);
