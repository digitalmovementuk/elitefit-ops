/* Elite Fit Group Fitness concept v1 · booking.js (27 Oct 2026)
   The sheet (EF.sheet) and the booking flow (EF.booking): class, join, details, pay, done, plus the coach view.
   Demo only: nothing is charged, nothing leaves the page. Vanilla ES5, one IIFE.
   Strings follow the approved copy deck and the booking copy review. */
(function (win, doc) {
'use strict';
var EF = win.EF = win.EF || {};
if (EF.sheet) { return; }

function A() { return EF.api; }

/* ---------- tiny DOM helpers ---------- */
function add(el, kids) {
  var i;
  if (kids === undefined || kids === null || kids === false) { return; }
  if (Object.prototype.toString.call(kids) === '[object Array]') { for (i = 0; i < kids.length; i++) { add(el, kids[i]); } }
  else if (typeof kids === 'string' || typeof kids === 'number') { el.appendChild(doc.createTextNode(String(kids))); }
  else { el.appendChild(kids); }
}
function h(tag, props, kids) {
  var el = doc.createElement(tag), key, v, ev;
  if (props) {
    for (key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) { continue; }
      v = props[key];
      if (v === null || v === undefined || v === false) { continue; }
      if (key === 'cls') { el.className = v; }
      else if (key === 'text') { el.textContent = v; }
      else if (key === 'on') { for (ev in v) { if (Object.prototype.hasOwnProperty.call(v, ev)) { el.addEventListener(ev, v[ev]); } } }
      else { el.setAttribute(key, v === true ? '' : String(v)); }
    }
  }
  add(el, kids);
  return el;
}
function q(sel, root) { return (root || doc).querySelector(sel); }
function sampleChip() { return h('span', { cls: 'sample', text: 'Sample' }); }
function arrow() { return h('span', { cls: 'arr', 'aria-hidden': 'true', text: '→' }); }
function hasField(obj, field) { var f = obj && obj.sample_fields; return !!(f && f.indexOf(field) >= 0); }
function listJoin(items) {
  if (items.length < 2) { return items.join(''); }
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function plural(n, one, many) { return n === 1 ? one : many; }
function hm(ms) {
  var w = A().wita(ms);
  return (w.hh < 10 ? '0' : '') + w.hh + ':' + (w.mm < 10 ? '0' : '') + w.mm;
}
function fire(name, detail) {
  var ev;
  try { ev = new win.CustomEvent(name, { detail: detail }); }
  catch (e) { ev = doc.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail); }
  doc.dispatchEvent(ev);
}

/* ---------- toast ---------- */
var toastTimer = null;
EF.toast = function (text) {
  var el = q('[data-toast]');
  if (!el) { return; }
  el.textContent = text;
  el.hidden = false;
  win.clearTimeout(toastTimer);
  toastTimer = win.setTimeout(function () { el.hidden = true; }, 2600);
};

/* =====================================================================
   EF.sheet: one dialog for every view (class flow, coach, filters)
   ===================================================================== */
var S = {};
var views = {};
var depth = 0;
var opened = false;
var current = null;
var closeTimer = null;
var travTimer = null;
var pendingTraverse = false;
var queued = null;
var opener = null;
var openerKey = null;
var lastTrigger = null;
var lastTriggerAt = 0;
var savedY = 0;
var inertPrev = [];

function dom() {
  S.el = q('#sheet');
  S.panel = q('.sheet__panel', S.el);
  S.body = q('[data-sheet-body]', S.el);
  S.foot = q('[data-sheet-foot]', S.el);
  S.prog = q('[data-sheet-progress]', S.el);
  S.step = q('[data-sheet-step]', S.el);
  S.back = q('[data-sheet-back]', S.el);
  S.page = q('#page');
  S.buybar = q('[data-buybar]');
}

function lockScroll() {
  var de = doc.documentElement, b = doc.body;
  savedY = win.pageYOffset || de.scrollTop || 0;
  de.classList.add('sheet-open');
  de.style.overflowY = 'scroll';
  b.style.position = 'fixed';
  b.style.top = (-savedY) + 'px';
  b.style.left = '0';
  b.style.right = '0';
  b.style.width = '100%';
}
function unlockScroll() {
  var de = doc.documentElement, b = doc.body;
  de.classList.remove('sheet-open');
  de.style.overflowY = '';
  b.style.position = '';
  b.style.top = '';
  b.style.left = '';
  b.style.right = '';
  b.style.width = '';
  de.style.scrollBehavior = 'auto';
  win.scrollTo(0, savedY);
  de.style.scrollBehavior = '';
}
function setInert(on) {
  var list = [S.page, S.buybar], i, el, rec;
  if (on) {
    inertPrev = [];
    for (i = 0; i < list.length; i++) {
      el = list[i];
      if (!el) { continue; }
      inertPrev.push({ el: el, aria: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') });
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    }
  } else {
    for (i = 0; i < inertPrev.length; i++) {
      rec = inertPrev[i];
      if (!rec.inert) { rec.el.removeAttribute('inert'); }
      if (rec.aria === null) { rec.el.removeAttribute('aria-hidden'); } else { rec.el.setAttribute('aria-hidden', rec.aria); }
    }
    inertPrev = [];
  }
}
function captureOpener() {
  var a = doc.activeElement;
  /* Safari does not focus a button on click (it focuses a focusable ancestor), so a fresh click wins over activeElement */
  var fresh = lastTrigger && (Date.now() - lastTriggerAt < 1500) && doc.documentElement.contains(lastTrigger);
  opener = fresh ? lastTrigger : ((a && a !== doc.body && a !== doc.documentElement) ? a : lastTrigger);
  openerKey = null;
  if (opener && opener.closest) {
    var row = opener.closest('[data-occ]');
    openerKey = {
      id: opener.id || '',
      tid: opener.getAttribute('data-testid') || '',
      occ: row ? row.getAttribute('data-occ') : ''
    };
  }
}
function restoreFocus() {
  var el = opener;
  if (el && !doc.documentElement.contains(el)) {
    el = null;
    if (openerKey) {
      if (openerKey.occ && openerKey.tid) { el = q('[data-testid="' + openerKey.tid + '"][data-occ="' + openerKey.occ + '"]') || q('[data-occ="' + openerKey.occ + '"] [data-testid="' + openerKey.tid + '"]'); }
      if (!el && openerKey.occ) { el = q('[data-occ="' + openerKey.occ + '"] [data-testid="row-book"]'); }
      if (!el && openerKey.id) { el = doc.getElementById(openerKey.id); }
      if (!el && openerKey.tid) { el = q('[data-testid="' + openerKey.tid + '"]'); }
    }
  }
  if (!el) { el = doc.getElementById('schedule'); }
  if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  opener = null;
}

function showSheet() {
  win.clearTimeout(closeTimer);
  if (opened) { return; }
  opened = true;
  captureOpener();
  S.el.hidden = false;
  lockScroll();
  setInert(true);
  void S.panel.offsetWidth;
  S.el.classList.add('is-open');
}
function hideSheet() {
  if (!opened) { return; }
  opened = false;
  var kind = current ? current.kind : '';
  S.el.classList.remove('is-open');
  S.el.classList.remove('has-kb');
  S.el.style.setProperty('--kb', '0px');
  S.panel.style.transform = '';
  setInert(false);
  unlockScroll();
  restoreFocus();
  current = null;
  win.clearTimeout(closeTimer);
  closeTimer = win.setTimeout(function () {
    if (opened) { return; }
    S.el.hidden = true;
    S.body.innerHTML = '';
    S.foot.innerHTML = '';
  }, 380);
  fire('ef:sheet', { open: false, kind: kind });
}

/* header label + progress bars; "total" is the number of steps on this path (5, or 4 for members, 3 for the waitlist) */
function applyStep(v) {
  var i, total = v.total || 5;
  S.step.textContent = v.label || '';
  if (v.progress === null || v.progress === undefined) { S.prog.hidden = true; return; }
  S.prog.hidden = false;
  for (i = 0; i < S.prog.children.length; i++) {
    S.prog.children[i].hidden = i >= total;
    S.prog.children[i].classList.toggle('is-on', i <= v.progress);
  }
}
function updateStep(patch) {
  var k;
  if (!current) { return; }
  for (k in patch) { if (Object.prototype.hasOwnProperty.call(patch, k)) { current.view[k] = patch[k]; } }
  applyStep(current.view);
}

function renderView(kind, params, dir, guard) {
  var f = views[kind], v, r, i, t;
  if (!f) { return false; }
  v = f(params || {}, dir);
  if (!v) { return false; }
  if (v.redirect) {
    if ((guard || 0) > 2) { return false; }
    r = v.redirect;
    try { win.history.replaceState({ ef: 'gf', kind: r.kind, params: r.params, d: depth }, '', r.url || win.location.href); } catch (e) {}
    return renderView(r.kind, r.params, dir, (guard || 0) + 1);
  }
  if (v.stepKind) { var info = stepInfo(v.stepKind, v.path); v.label = info.label; v.progress = info.progress; v.total = info.total; }
  current = { kind: kind, params: params, view: v };
  applyStep(v);
  S.el.classList.toggle('sheet--tall', v.tall !== undefined ? !!v.tall : (kind === 'class' || kind === 'coach' || kind === 'filters'));
  S.el.setAttribute('data-kind', kind);
  S.body.innerHTML = '';
  S.foot.innerHTML = '';
  v.render(S.body, S.foot);
  if (v.testid && !q('[data-testid="' + v.testid + '"]', S.body) && S.body.firstElementChild) { S.body.firstElementChild.setAttribute('data-testid', v.testid); }
  S.body.classList.remove('step-in');
  S.body.classList.remove('step-back');
  if (dir === 'fwd' || dir === 'back') {
    void S.body.offsetWidth;
    S.body.classList.add(dir === 'back' ? 'step-back' : 'step-in');
  }
  S.body.scrollTop = 0;
  S.back.hidden = depth <= 1;
  try { if (EF.media && EF.media.scan) { EF.media.scan(S.body); } } catch (e1) {}
  try { if (EF.motion && EF.motion.scan) { EF.motion.scan(S.body); } } catch (e2) {}
  t = q('#sheet-title', S.body);
  if (t) {
    t.setAttribute('tabindex', '-1');
    try { t.focus({ preventScroll: true }); } catch (e3) { t.focus(); }
  }
  fire('ef:sheet', { open: true, kind: kind });
  return true;
}

function navigate(mode, kind, params, url, quiet) {
  if (!views[kind]) { return false; }
  if (pendingTraverse) { queued = function () { navigate(mode, kind, params, url, quiet); }; return true; }
  var wasOpen = opened;
  if (!wasOpen) { depth = 0; }
  var replacing = mode === 'replace' && wasOpen;
  var d = replacing ? depth : depth + 1;
  var st = { ef: 'gf', kind: kind, params: params, d: d };
  try {
    if (replacing) { win.history.replaceState(st, '', url || win.location.href); }
    else { win.history.pushState(st, '', url || win.location.href); }
  } catch (e) {}
  depth = d;
  if (!wasOpen) { showSheet(); }
  if (!quiet) { renderView(kind, params, wasOpen ? 'fwd' : 'none'); }
  return true;
}
function flushQueue() {
  var fn = queued;
  queued = null;
  if (fn) { fn(); }
}
function closeSheet() {
  if (!opened) { return; }
  var d = depth;
  depth = 0;
  hideSheet();
  if (d > 0) {
    pendingTraverse = true;
    win.clearTimeout(travTimer);
    travTimer = win.setTimeout(function () { pendingTraverse = false; flushQueue(); }, 700);
    try { win.history.go(-d); } catch (e) { pendingTraverse = false; }
  }
}
function backSheet() {
  if (depth > 1) { win.history.back(); } else { closeSheet(); }
}

function focusables() {
  var nodes = S.panel.querySelectorAll('a[href], button, input, select, textarea, [tabindex]'), out = [], i, el;
  for (i = 0; i < nodes.length; i++) {
    el = nodes[i];
    if (el.disabled || el.getAttribute('tabindex') === '-1') { continue; }
    if (el.getClientRects().length === 0) { continue; }
    if (win.getComputedStyle(el).visibility === 'hidden') { continue; }
    out.push(el);
  }
  return out;
}
function tabStops() {
  var all = focusables(), out = [], hasChecked = {}, seen = {}, i, el, key;
  for (i = 0; i < all.length; i++) {
    el = all[i];
    if (el.type === 'radio' && el.name && el.checked) { hasChecked[el.name] = true; }
  }
  for (i = 0; i < all.length; i++) {
    el = all[i];
    if (el.type === 'radio' && el.name) {
      key = el.name;
      if (hasChecked[key] ? !el.checked : seen[key]) { continue; }
      seen[key] = true;
    }
    out.push(el);
  }
  return out;
}
/* Tab is handled here, not left to the browser: Safari skips buttons by default, and a modal needs a reliable loop. */
function trapTab(e) {
  var stops = tabStops(), a = doc.activeElement, target = null, i;
  e.preventDefault();
  if (!stops.length) { S.panel.focus(); return; }
  if (a && S.panel.contains(a) && a !== S.panel) {
    var idx = stops.indexOf(a);
    if (idx >= 0) { target = stops[(idx + (e.shiftKey ? stops.length - 1 : 1)) % stops.length]; }
    else if (e.shiftKey) {
      for (i = stops.length - 1; i >= 0; i--) { if (a.compareDocumentPosition(stops[i]) & 2) { target = stops[i]; break; } }
      target = target || stops[stops.length - 1];
    } else {
      for (i = 0; i < stops.length; i++) { if (a.compareDocumentPosition(stops[i]) & 4) { target = stops[i]; break; } }
      target = target || stops[0];
    }
  } else { target = e.shiftKey ? stops[stops.length - 1] : stops[0]; }
  target.focus();
}

function initDrag() {
  var bar = q('.sheet__bar', S.panel), startY = 0, dy = 0, startT = 0, dragging = false;
  if (!bar || !win.PointerEvent) { return; }
  bar.addEventListener('pointerdown', function (e) {
    if (win.matchMedia('(min-width: 1024px)').matches) { return; }
    if (e.pointerType === 'mouse' && e.button !== 0) { return; }
    if (e.target.closest && e.target.closest('button')) { return; }
    dragging = true; startY = e.clientY; dy = 0; startT = Date.now();
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}
    S.panel.classList.add('is-drag');
  });
  bar.addEventListener('pointermove', function (e) {
    if (!dragging) { return; }
    dy = Math.max(0, e.clientY - startY);
    S.panel.style.transform = 'translateY(' + dy + 'px)';
  });
  function end() {
    if (!dragging) { return; }
    dragging = false;
    var v = dy / Math.max(1, Date.now() - startT);
    S.panel.classList.remove('is-drag');
    S.panel.style.transform = '';
    if (dy > 110 || (dy > 40 && v > 0.6)) { closeSheet(); }
  }
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

/* ----- on-screen keyboard: keep the focused field and the primary button in view ----- */
var kbTimers = [];
function isPhoneSheet() { return win.matchMedia && win.matchMedia('(max-width: 1023px)').matches; }
function textField(el) {
  return !!(el && el.tagName && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'checkbox' && el.type !== 'radio' && S.body.contains(el));
}
function centerField(el) {
  if (!opened || !textField(el) || !isPhoneSheet()) { return; }
  var b = S.body.getBoundingClientRect(), r = el.getBoundingClientRect();
  var delta = (r.top - b.top) - (b.height - r.height) / 2;
  if (Math.abs(delta) > 1) { S.body.scrollTop += delta; }
}
function settleField() {
  var el = doc.activeElement, i;
  if (!textField(el)) { return; }
  for (i = 0; i < kbTimers.length; i++) { win.clearTimeout(kbTimers[i]); }
  kbTimers = [];
  centerField(el);
  kbTimers.push(win.setTimeout(function () { centerField(el); }, 120));
  kbTimers.push(win.setTimeout(function () { centerField(el); }, 380));
}
function syncKeyboard() {
  if (!opened) { return; }
  var vv = win.visualViewport, kb = 0;
  if (vv && isPhoneSheet()) { kb = Math.max(0, Math.round(win.innerHeight - vv.height - vv.offsetTop)); }
  if (kb < 80) { kb = 0; }
  S.el.style.setProperty('--kb', kb + 'px');
  S.el.classList.toggle('has-kb', kb > 0);
  settleField();
}

function initSheet() {
  dom();
  if (!S.el) { return; }
  S.body.addEventListener('focusin', function (e) { if (textField(e.target)) { settleField(); } });
  if (win.visualViewport) {
    win.visualViewport.addEventListener('resize', syncKeyboard);
    win.visualViewport.addEventListener('scroll', syncKeyboard);
  }
  win.addEventListener('resize', syncKeyboard);
  S.el.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) { return; }
    if (t.closest('[data-sheet-close]')) { closeSheet(); return; }
    if (t.closest('[data-sheet-back]')) { backSheet(); }
  });
  doc.addEventListener('keydown', function (e) {
    if (!opened) { return; }
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeSheet(); return; }
    if (e.key === 'Tab') { trapTab(e); }
  });
  doc.addEventListener('focusin', function (e) {
    if (opened && S.panel && !S.panel.contains(e.target) && !q('[data-toast]').contains(e.target)) {
      var t = q('#sheet-title', S.body);
      if (t) { t.focus(); } else { S.panel.focus(); }
    }
  });
  doc.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('button, a, [role="button"]') : null;
    if (t && !(S.panel && S.panel.contains(t))) { lastTrigger = t; lastTriggerAt = Date.now(); }
  }, true);
  win.addEventListener('popstate', function (e) {
    var st = e.state;
    if (pendingTraverse) {
      pendingTraverse = false;
      win.clearTimeout(travTimer);
      depth = 0;
      flushQueue();
      return;
    }
    if (st && st.ef === 'gf' && views[st.kind]) {
      var dir = st.d < depth ? 'back' : 'fwd';
      var wasOpen = opened;
      depth = st.d;
      if (!wasOpen) { showSheet(); }
      renderView(st.kind, st.params, wasOpen ? dir : 'none');
    } else {
      depth = 0;
      if (opened) { hideSheet(); }
    }
  });
  initDrag();
}

EF.sheet = {
  register: function (kind, factory) { views[kind] = factory; },
  open: function (kind, params, url) { return navigate('push', kind, params, url); },
  replace: function (kind, params, url) { return navigate('replace', kind, params, url); },
  back: backSheet,
  close: closeSheet,
  isOpen: function () { return opened; },
  kind: function () { return current ? current.kind : null; },
  update: updateStep
};

/* =====================================================================
   EF.booking
   ===================================================================== */
var STEP_NO = { 'class': 1, join: 2, details: 3, pay: 4, done: 5 };
var COUNTRIES = [
  ['+62', 'Indonesia'], ['+61', 'Australia'], ['+64', 'New Zealand'], ['+65', 'Singapore'], ['+60', 'Malaysia'],
  ['+66', 'Thailand'], ['+63', 'Philippines'], ['+84', 'Vietnam'], ['+44', 'UK'], ['+353', 'Ireland'],
  ['+1', 'US/Canada'], ['+49', 'Germany'], ['+31', 'Netherlands'], ['+33', 'France'], ['+41', 'Switzerland'],
  ['+46', 'Sweden'], ['+47', 'Norway'], ['+45', 'Denmark'], ['+34', 'Spain'], ['+39', 'Italy'],
  ['+7', 'Russia'], ['+380', 'Ukraine'], ['+972', 'Israel'], ['+971', 'UAE'], ['+91', 'India'],
  ['+86', 'China'], ['+81', 'Japan'], ['+82', 'South Korea'], ['+55', 'Brazil'], ['+27', 'South Africa']
];
var REGION_CC = {
  ID: '+62', AU: '+61', NZ: '+64', SG: '+65', MY: '+60', TH: '+66', PH: '+63', VN: '+84', GB: '+44', UK: '+44',
  IE: '+353', US: '+1', CA: '+1', DE: '+49', NL: '+31', FR: '+33', CH: '+41', SE: '+46', NO: '+47', DK: '+45',
  ES: '+34', IT: '+39', RU: '+7', UA: '+380', IL: '+972', AE: '+971', IN: '+91', CN: '+86', JP: '+81',
  KR: '+82', BR: '+55', ZA: '+27'
};
var ERR = {
  name: "Please add your name so your coach knows who's coming.",
  phoneEmpty: 'Please add a phone number so the club can reach you.',
  phoneShort: 'That number looks short. Check it, with the country code.',
  phoneLong: 'That number looks too long. Check it, with the country code.',
  email: "That email doesn't look right. You can also leave it empty.",
  pay: "Pick how you'd like to pay.",
  join: "Pick how you're joining to continue."
};
var LETTER = (function () {
  try { return new RegExp('\\p{L}', 'gu'); }
  catch (e) { return /[A-Za-zÀ-ɏͰ-ϿЀ-ӿ֐-ۿऀ-ॿ฀-๿぀-ヿ㐀-鿿가-힯]/g; }
})();
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function letterCount(s) { var m = String(s).match(LETTER); return m ? m.length : 0; }
function phoneDigits(v) { var d = String(v).replace(/\D/g, ''); if (d.charAt(0) === '0') { d = d.slice(1); } return d; }
function defaultCc() {
  var lang = '';
  try { lang = (win.navigator.languages && win.navigator.languages[0]) || win.navigator.language || ''; } catch (e) {}
  var m = /[-_]([A-Za-z]{2})$/.exec(lang);
  return (m && REGION_CC[m[1].toUpperCase()]) || '+62';
}
function defaultDetails() {
  var st = A().store.get();
  return { name: '', cc: defaultCc(), phone: '', email: '', plus1: '', wa: true, first: st.visitor !== 'returning' };
}
function detailsValid(d) {
  if (!d) { return false; }
  var n = phoneDigits(d.phone).length;
  return letterCount(d.name) >= 2 && n >= 6 && n <= 15 && (!d.email || EMAIL_RE.test(d.email));
}

/* ---- flow draft ---- */
function getOcc(id) {
  var b = A().bookingFor(id);
  return (b && A().occById(id)) || A().occ(id);
}
function readFlow(occId) {
  var f = A().store.get().flow;
  return (f && f.occId === occId) ? f : null;
}
function saveFlow(f) { A().store.set({ flow: f }); }
function newFlow(occ, opts) {
  var st = A().store.get();
  var join = (opts && opts.join) ? opts.join : (st.prefJoin === 'duo' ? 'duo' : (st.visitor === 'returning' ? 'member' : 'day'));
  return { occId: occ.id, join: join, pack: 'class-1', pay: 'card', details: null, waitlist: false, ref: null };
}
function ensureFlow(occ, opts) {
  var f = readFlow(occ.id), st;
  if (!f || f.ref) { f = newFlow(occ, opts); }
  else if (opts && opts.join) { f.join = opts.join; }
  else {
    st = A().store.get();
    if (st.prefJoin === 'duo') { f.join = 'duo'; }
  }
  f.waitlist = !!occ.full;
  saveFlow(f);
  return f;
}
function flowFor(occ) {
  var f = readFlow(occ.id);
  if (!f || f.ref) { f = ensureFlow(occ); }
  f.waitlist = !!occ.full;
  return f;
}
function pathFor(flow) {
  if (flow.waitlist) { return ['class', 'details', 'done']; }
  if (flow.join === 'member') { return ['class', 'join', 'details', 'done']; }
  return ['class', 'join', 'details', 'pay', 'done'];
}
function pathForBooking(bk) {
  if (bk.waitlist) { return ['class', 'details', 'done']; }
  if (bk.pass === 'member') { return ['class', 'join', 'details', 'done']; }
  return ['class', 'join', 'details', 'pay', 'done'];
}

/* ---- urls ---- */
function urlFor(kind, p) {
  var parts = [], np = A().nowParam;
  if (kind === 'coach') { parts.push('coach=' + encodeURIComponent(p.coachId)); }
  else {
    parts.push('class=' + encodeURIComponent(p.occId));
    if (kind !== 'class') { parts.push('step=' + kind); }
  }
  if (np) { parts.push('now=' + encodeURIComponent(np).replace(/%3A/g, ':')); }
  return '?' + parts.join('&');
}
function goStep(step, occId) { EF.sheet.open(step, { occId: occId }, urlFor(step, { occId: occId })); }
function redirectToClass(occId) { return { redirect: { kind: 'class', params: { occId: occId }, url: urlFor('class', { occId: occId }) } }; }

/* ---- shared view bits ---- */
function stepInfo(kind, path) {
  var i = path.indexOf(kind);
  if (i < 0) { i = STEP_NO[kind] - 1; }
  return { label: 'Step ' + (i + 1) + ' of ' + path.length, progress: i, total: path.length };
}

function primary(label, testid, onClick) {
  var b = h('button', { type: 'button', cls: 'btn btn--primary', 'data-testid': testid }, [label + ' ', arrow()]);
  b.addEventListener('click', onClick);
  return b;
}
function head(parts) { return h('h2', { cls: 'sh-title', id: 'sheet-title', tabindex: '-1' }, parts); }
function t(word) { return h('span', { cls: 't', text: word }); }
function whenText(occ) { return A().dateShort(occ.ymd) + ' · ' + occ.time; }
function dayWord(occ) {
  var today = A().wita(A().now()).ymd;
  if (occ.ymd === today) { return 'Today'; }
  if (occ.dayIndex === 1) { return 'Tomorrow'; }
  return A().dateLong(occ.ymd).split(' ')[0];
}
function packOf(id) {
  var packs = A().data.passes.packs, i;
  for (i = 0; i < packs.length; i++) { if (packs[i].id === id) { return packs[i]; } }
  return null;
}
function passName(pass) {
  var P = A().data.passes, pk;
  if (pass === 'member') { return 'Member'; }
  if (pass === 'day') { return P.day.name; }
  if (pass === 'duo') { return P.duo.name + ' for 2'; }
  pk = packOf(pass);
  return pk ? pk.name : pass;
}
function priceOf(flow) {
  var P = A().data.passes, pk;
  if (flow.join === 'member') { return 0; }
  if (flow.join === 'day') { return P.day.price_idr; }
  if (flow.join === 'duo') { return P.duo.price_idr * P.duo.people; }
  pk = packOf(flow.pack);
  return pk ? pk.price_idr : 0;
}
function row(label, value) { return h('div', null, [h('dt', { text: label }), h('dd', null, value)]); }
function coachRole(coach) {
  if (coach.role) { return coach.role; }
  var names = A().data.classes.filter(function (c) { return c.coach === coach.id; }).map(function (c) { return c.name; });
  return 'Teaches ' + listJoin(names);
}
function missingView() {
  return {
    label: '', progress: null, testid: 'step-class', tall: false,
    render: function (body, foot) {
      body.appendChild(h('div', { cls: 'view', 'data-testid': 'step-class' }, [
        head("That class isn't on the timetable"),
        h('p', { cls: 'sh-lead', text: 'Pick another time from the schedule.' })
      ]));
      foot.appendChild(primary('Close', 'cta-book', closeSheet));
    }
  };
}
function pickAnother(occ) {
  /* "Pick another time": close the sheet, then land on the schedule with the same day and class type, list focused.
     Wait until closing has walked history back (popstate) and unlocked the page scroll, or the landing gets undone. */
  closeSheet();
  var opts = { ymd: occ.ymd, family: occ.familyId, focusList: true };
  var landed = false;
  var land = function () {
    if (landed) { return; }
    landed = true;
    win.removeEventListener('popstate', land);
    win.setTimeout(function () {
      if (EF.schedule && EF.schedule.show) { EF.schedule.show(opts); }
      else { var s = doc.getElementById('schedule'); if (s && s.scrollIntoView) { s.scrollIntoView(); } }
    }, 40);
  };
  if (pendingTraverse) { win.addEventListener('popstate', land); win.setTimeout(land, 750); } else { land(); }
}

/* ---------------- class view ---------------- */
function viewClass(p) {
  var occ = getOcc(p.occId);
  if (!occ) { return missingView(); }
  var cls = occ.cls, fam = occ.family, coach = occ.coach;
  var bk = A().bookingFor(occ.id);
  return {
    stepKind: 'class',
    path: bk ? pathForBooking(bk) : pathFor({ waitlist: occ.full, join: (readFlow(occ.id) || {}).join || 'day' }),
    testid: 'step-class',
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-class' });
      var media = h('div', { cls: 'sh-media', style: '--focus:' + fam.focus });
      media.appendChild(h('img', { cls: 'media__poster', src: fam.poster, alt: '', width: '720', height: '960' }));
      var video = h('video', { 'data-clip': '', 'data-group': 'sheet', muted: true, loop: true, playsinline: true, preload: 'none', src: fam.video, 'aria-hidden': 'true' });
      video.muted = true;
      media.appendChild(video);
      if (fam.stock) { media.appendChild(h('span', { cls: 'chip chip--media', text: 'Stock clip' })); }
      media.appendChild(h('button', { type: 'button', cls: 'pause', 'data-pause': 'sheet', 'aria-pressed': 'false', 'aria-label': 'Pause the class video' }, h('span', { cls: 'pause__icon', 'aria-hidden': 'true' })));
      wrap.appendChild(media);

      wrap.appendChild(h('p', { cls: 'sh-when', text: A().dateLong(occ.ymd) + ' · ' + occ.time + ' to ' + hm(occ.end) }));
      wrap.appendChild(head(cls.name));

      var chips = h('ul', { cls: 'sh-chips' });
      var lenChip = h('li', { cls: 'chip' }, cls.length_min + ' min');
      if (hasField(cls, 'length')) { lenChip.appendChild(sampleChip()); }
      chips.appendChild(lenChip);
      var lvlChip = h('li', { cls: 'chip' }, cls.level);
      if (hasField(cls, 'level')) { lvlChip.appendChild(sampleChip()); }
      chips.appendChild(lvlChip);
      var spots;
      if (bk && !bk.waitlist) { spots = "You're booked"; }
      else if (bk) { spots = 'On the waitlist'; }
      else if (occ.full) { spots = 'Full'; }
      else { spots = 'Room for ' + occ.spotsLeft + ' more'; }
      var spotChip = h('li', { cls: 'chip' }, spots);
      spotChip.appendChild(sampleChip());
      chips.appendChild(spotChip);
      wrap.appendChild(chips);

      if (bk && !bk.waitlist) {
        wrap.appendChild(h('p', { cls: 'sh-full sh-full--ok', 'data-testid': 'booked-note' }, "You're booked for this one. Ref " + bk.ref + '.'));
      } else if (bk) {
        wrap.appendChild(h('p', { cls: 'sh-full', 'data-testid': 'booked-note' }, [sampleChip(), "You're on the waitlist for this one. Ref " + bk.ref + '.']));
      } else if (occ.full) {
        wrap.appendChild(h('p', { cls: 'sh-full', 'data-testid': 'full-note' }, [sampleChip(), "This one's full. Join the waitlist and we'll WhatsApp you if a spot opens."]));
      }

      wrap.appendChild(h('div', { cls: 'sh-coach' }, [
        h('img', { src: coach.avatar, alt: '', width: '56', height: '56' }),
        h('div', null, [h('b', { text: coach.name }), h('span', { text: coachRole(coach) })])
      ]));

      var desc = h('p', { cls: 'sh-desc' });
      if (cls.sample || hasField(cls, 'description')) { desc.appendChild(sampleChip()); }
      desc.appendChild(doc.createTextNode(cls.description));
      wrap.appendChild(desc);

      wrap.appendChild(h('h3', { cls: 'sh-h', text: 'What to bring' }));
      wrap.appendChild(h('p', { cls: 'sh-desc', text: 'Your own water bottle and clothes you can move in. Towels, showers and lockers are at the club.' }));

      var alt = h('div', { cls: 'sh-alt' });
      var altBtn = h('button', { type: 'button', cls: 'link-t', 'data-testid': 'pick-another' }, [h('span', { text: 'Pick another time' }), ' ', h('span', { 'aria-hidden': 'true', text: '→' })]);
      altBtn.addEventListener('click', function () { pickAnother(occ); });
      alt.appendChild(altBtn);
      wrap.appendChild(alt);
      body.appendChild(wrap);

      var label = bk ? 'View your booking' : (occ.full ? 'Join the waitlist' : 'Book this class');
      foot.appendChild(primary(label, 'cta-book', function () {
        if (bk) { goStep('done', occ.id); return; }
        saveFlow(flowFor(occ));
        goStep(occ.full ? 'details' : 'join', occ.id);
      }));
    }
  };
}

/* ---------------- join view ---------------- */
function radioOpt(name, value, testid, checked, disabled, nameKids, priceNode, noteKids) {
  var input = h('input', { type: 'radio', name: name, value: value, 'data-testid': testid });
  input.checked = !!checked;
  input.disabled = !!disabled;
  var card = h('span', { cls: 'opt__card' }, [
    h('span', { cls: 'opt__name' }, nameKids),
    priceNode,
    h('span', { cls: 'opt__note' }, noteKids)
  ]);
  var label = h('label', { cls: 'opt' }, [input, card]);
  return { label: label, input: input };
}
function viewJoin(p) {
  var occ = getOcc(p.occId);
  if (!occ || occ.full || A().bookingFor(occ.id)) { return redirectToClass(p.occId); }
  var flow = flowFor(occ);
  var P = A().data.passes;
  var duoOk = occ.spotsLeft >= 2;
  if (flow.join === 'duo' && !duoOk) { flow.join = 'day'; saveFlow(flow); }
  if (!flow.pack || !packOf(flow.pack)) { flow.pack = 'class-1'; }
  return {
    stepKind: 'join',
    path: pathFor(flow),
    testid: 'step-join',
    render: function (body, foot) {
      var K = A().k;
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-join' });
      wrap.appendChild(head(['How are you ', t('joining?')]));
      wrap.appendChild(h('p', { cls: 'sh-lead', text: occ.cls.name + ' · ' + whenText(occ) }));

      var fs = h('fieldset', { cls: 'opts' }, h('legend', { cls: 'vh', text: 'How are you joining?' }));
      var errEl = h('p', { cls: 'err fine-err', id: 'join-err', role: 'alert' });
      errEl.style.display = 'none';

      /* member */
      var mem = radioOpt('join', 'member', 'join-member', flow.join === 'member', false,
        P.member.name, h('span', { cls: 'opt__price', text: P.member.price_label }), P.member.note);
      var signin = h('div', { cls: 'field signin', 'data-signin': '' }, [
        h('label', { 'for': 'f-member', text: 'Member email or phone' }),
        h('input', { cls: 'input', id: 'f-member', type: 'text', autocomplete: 'off', autocapitalize: 'off', 'data-testid': 'f-member' }),
        h('p', { cls: 'hint', text: 'Demo sign-in. Any details work here and nothing is checked.' })
      ]);
      /* day */
      var dayNote = P.day.note.replace(/^Today's class/, dayWord(occ) + "'s class");
      var day = radioOpt('join', 'day', 'join-day', flow.join === 'day', false,
        P.day.name, h('span', { cls: 'opt__price', text: K(P.day.price_idr) }), dayNote);
      /* duo */
      var duoNote = duoOk ? P.duo.note : 'Needs two spots. Only ' + occ.spotsLeft + ' left in this class.';
      var duo = radioOpt('join', 'duo', 'join-duo', flow.join === 'duo', !duoOk,
        [h('span', { cls: 'opt__badge', text: P.duo.badge }), P.duo.name],
        h('span', { cls: 'opt__price' }, [
          h('s', null, [h('span', { cls: 'vh', text: 'Was ' }), K(P.duo.old_price_idr)]),
          h('span', { cls: 'vh', text: 'Now ' }),
          h('span', { cls: 'deal', text: K(P.duo.price_idr) }),
          h('small', { text: P.duo.per })
        ]), duoNote);
      /* pack */
      var minPack = 0, i;
      for (i = 0; i < P.packs.length; i++) { if (!minPack || P.packs[i].price_idr < minPack) { minPack = P.packs[i].price_idr; } }
      var pack = radioOpt('join', 'pack', 'join-pack', flow.join === 'pack', false,
        'Class pack or membership', h('span', { cls: 'opt__price', text: 'from ' + K(minPack) }), "Class passes don't include the gym floor.");
      pack.input.setAttribute('aria-controls', 'join-packs');
      var subs = h('fieldset', { cls: 'subopts', id: 'join-packs' }, h('legend', { cls: 'vh', text: 'Pick a class pack or membership' }));
      var subInputs = [];
      P.packs.forEach(function (pk) {
        var nm = [pk.name];
        if (pk.badge) { nm.push(h('span', { cls: 'badge-terra', text: pk.badge })); }
        var so = radioOpt('pack', pk.id, 'pack-' + pk.id, flow.pack === pk.id, false, nm, h('span', { cls: 'opt__price', text: K(pk.price_idr) }), pk.note);
        subInputs.push(so.input);
        subs.appendChild(so.label);
      });

      function wrapOpt(o, extra) { var w = h('div', { cls: 'optwrap' }, o.label); if (extra) { w.appendChild(extra); } return w; }
      fs.appendChild(wrapOpt(mem, signin));
      fs.appendChild(wrapOpt(day));
      fs.appendChild(wrapOpt(duo));
      fs.appendChild(wrapOpt(pack, subs));
      wrap.appendChild(fs);
      wrap.appendChild(errEl);
      body.appendChild(wrap);

      function sync() {
        signin.hidden = flow.join !== 'member';
        subs.hidden = flow.join !== 'pack';
        errEl.style.display = 'none';
      }
      sync();
      [mem, day, duo, pack].forEach(function (o) {
        o.input.addEventListener('change', function () {
          if (o.input.checked) {
            flow.join = o.input.value; saveFlow(flow); sync();
            EF.sheet.update(stepInfo('join', pathFor(flow)));
            if (flow.join === 'pack') { win.setTimeout(function () { try { subs.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 60); }
          }
        });
      });
      subInputs.forEach(function (inp) {
        inp.addEventListener('change', function () { if (inp.checked) { flow.pack = inp.value; saveFlow(flow); } });
      });

      foot.appendChild(primary('Continue', 'cta-continue', function () {
        if (!flow.join || (flow.join === 'pack' && !flow.pack)) {
          errEl.textContent = ERR.join;
          errEl.style.display = 'block';
          return;
        }
        saveFlow(flow);
        goStep('details', occ.id);
      }));
    }
  };
}

/* ---------------- details view ---------------- */
function confirmBooking(occ, flow, btn) {
  if (btn) { btn.disabled = true; }
  if (!A().bookingFor(occ.id)) {
    var bk = A().book(flow);
    flow.ref = bk.ref;
    flow.details = null;
    saveFlow(flow);
  }
  goStep('done', occ.id);
}
function viewDetails(p) {
  var occ = getOcc(p.occId);
  if (!occ || A().bookingFor(occ.id)) { return redirectToClass(p.occId); }
  var flow = flowFor(occ);
  if (!flow.waitlist && !flow.join) { flow.join = 'day'; }
  if (!flow.details) { flow.details = defaultDetails(); }
  saveFlow(flow);
  var d = flow.details;
  var isDuo = !flow.waitlist && flow.join === 'duo';
  var ctaLabel = flow.waitlist ? 'Join the waitlist' : (flow.join === 'member' ? 'Confirm booking' : 'Continue to payment');
  return {
    stepKind: 'details',
    path: pathFor(flow),
    testid: 'step-details',
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-details' });
      wrap.appendChild(head(['Your ', t('details.')]));
      var ctx = occ.cls.name + ' · ' + whenText(occ) + ' · ' + (flow.waitlist ? 'Waitlist' : passName(flow.join === 'pack' ? flow.pack : flow.join));
      wrap.appendChild(h('p', { cls: 'sh-lead', text: ctx }));

      var form = h('form', { cls: 'form', novalidate: '', autocomplete: 'on', 'data-testid': 'details-form' });
      form.addEventListener('submit', function (e) { e.preventDefault(); });
      var refs = {};

      function mkField(key, labelText, control, hintText) {
        var fieldEl = h('div', { cls: 'field' });
        fieldEl.appendChild(h('label', { 'for': control.id, text: labelText }));
        if (hintText) { fieldEl.appendChild(h('p', { cls: 'hint', id: control.id + '-hint', text: hintText })); }
        return fieldEl;
      }

      /* name */
      var name = h('input', { cls: 'input', id: 'f-name', type: 'text', autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next', 'aria-required': 'true', 'data-testid': 'f-name' });
      name.value = d.name;
      var nameField = mkField('name', 'Your name', name);
      var nameErr = h('p', { cls: 'err', id: 'f-name-err' });
      nameField.appendChild(name); nameField.appendChild(nameErr);
      refs.name = { field: nameField, input: name, err: nameErr };

      /* phone */
      var cc = h('select', { cls: 'select', id: 'f-cc', autocomplete: 'tel-country-code', 'data-testid': 'f-cc' });
      COUNTRIES.forEach(function (c) { cc.appendChild(h('option', { value: c[0], text: c[0] + ' ' + c[1] })); });
      cc.value = d.cc;
      if (cc.value !== d.cc) { cc.value = '+62'; }
      var phone = h('input', { cls: 'input', id: 'f-phone', type: 'tel', inputmode: 'tel', autocomplete: 'tel-national', enterkeyhint: 'next', 'aria-required': 'true', 'data-testid': 'f-phone' });
      phone.value = d.phone;
      var phoneField = mkField('phone', 'Phone', phone, 'With country code, so the club can reach you about this booking.');
      var phoneErr = h('p', { cls: 'err', id: 'f-phone-err' });
      phoneField.appendChild(h('div', { cls: 'phone' }, [h('div', { cls: 'selectwrap' }, [h('label', { cls: 'vh', 'for': 'f-cc', text: 'Phone country code' }), cc]), phone]));
      phoneField.appendChild(phoneErr);
      refs.phone = { field: phoneField, input: phone, err: phoneErr };

      /* email */
      var email = h('input', { cls: 'input', id: 'f-email', type: 'email', inputmode: 'email', autocomplete: 'email', autocapitalize: 'off', enterkeyhint: isDuo ? 'next' : 'done', 'data-testid': 'f-email' });
      email.value = d.email;
      var emailField = mkField('email', 'Email (optional)', email);
      var emailErr = h('p', { cls: 'err', id: 'f-email-err' });
      emailField.appendChild(email); emailField.appendChild(emailErr);
      refs.email = { field: emailField, input: email, err: emailErr };

      form.appendChild(nameField);
      form.appendChild(phoneField);
      form.appendChild(emailField);

      var plus1 = null;
      if (isDuo) {
        plus1 = h('input', { cls: 'input', id: 'f-plus1', type: 'text', autocomplete: 'off', autocapitalize: 'words', enterkeyhint: 'done', 'data-testid': 'f-plus1' });
        plus1.value = d.plus1;
        var plusField = mkField('plus1', "Your +1's first name (optional)", plus1);
        plusField.appendChild(plus1);
        form.appendChild(plusField);
      }

      /* checkboxes */
      function check(id, testid, labelText, on) {
        var input = h('input', { type: 'checkbox', id: id, 'data-testid': testid });
        input.checked = !!on;
        return { input: input, label: h('label', { cls: 'check' }, [input, h('span', { cls: 'check__box', 'aria-hidden': 'true' }), h('span', { text: labelText })]) };
      }
      var wa = check('f-wa', 'f-wa', 'Send me a WhatsApp reminder the evening before', d.wa);
      var first = check('f-first', 'f-first', 'This is my first class at Elite Fit', d.first);
      form.appendChild(wa.label);
      form.appendChild(first.label);
      form.appendChild(h('p', { cls: 'privacy', text: 'This is a demo. What you type stays in this browser and nothing is sent.' }));
      wrap.appendChild(form);
      body.appendChild(wrap);

      /* keep the draft */
      function store() {
        d.name = name.value; d.cc = cc.value; d.phone = phone.value; d.email = email.value;
        if (plus1) { d.plus1 = plus1.value; }
        d.wa = wa.input.checked; d.first = first.input.checked;
        flow.details = d;
        saveFlow(flow);
      }
      function clearBad(key) {
        var r = refs[key];
        r.field.classList.remove('is-bad');
        r.input.removeAttribute('aria-invalid');
        r.input.removeAttribute('aria-describedby');
        if (key === 'phone') { r.input.setAttribute('aria-describedby', 'f-phone-hint'); }
      }
      function markBad(key, msg) {
        var r = refs[key];
        r.field.classList.add('is-bad');
        r.err.textContent = msg;
        r.input.setAttribute('aria-invalid', 'true');
        r.input.setAttribute('aria-describedby', r.err.id);
      }
      clearBad('phone');
      [name, phone, email].forEach(function (inp) {
        inp.addEventListener('input', function () { store(); clearBad(inp === name ? 'name' : (inp === phone ? 'phone' : 'email')); });
      });
      if (plus1) { plus1.addEventListener('input', store); }
      cc.addEventListener('change', store);
      wa.input.addEventListener('change', store);
      first.input.addEventListener('change', store);

      function validate() {
        var bad = null, n;
        store();
        clearBad('name'); clearBad('phone'); clearBad('email');
        if (letterCount(name.value) < 2) { markBad('name', ERR.name); bad = bad || name; }
        n = phoneDigits(phone.value).length;
        if (n === 0) { markBad('phone', ERR.phoneEmpty); bad = bad || phone; }
        else if (n < 6) { markBad('phone', ERR.phoneShort); bad = bad || phone; }
        else if (n > 15) { markBad('phone', ERR.phoneLong); bad = bad || phone; }
        if (email.value && !EMAIL_RE.test(email.value.replace(/^\s+|\s+$/g, ''))) { markBad('email', ERR.email); bad = bad || email; }
        if (bad) { bad.focus(); return false; }
        return true;
      }
      var btn = primary(ctaLabel, 'cta-details', function () {
        if (!validate()) { return; }
        if (flow.waitlist || flow.join === 'member') { confirmBooking(occ, flow, btn); }
        else { goStep('pay', occ.id); }
      });
      foot.appendChild(btn);
      [name, phone, email, plus1].forEach(function (inp) {
        if (!inp) { return; }
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
        });
      });
    }
  };
}

/* ---------------- pay view ---------------- */
function viewPay(p) {
  var occ = getOcc(p.occId);
  if (!occ || A().bookingFor(occ.id)) { return redirectToClass(p.occId); }
  var flow = readFlow(occ.id);
  if (!flow || flow.waitlist || flow.join === 'member') { return redirectToClass(p.occId); }
  if (!detailsValid(flow.details)) {
    return { redirect: { kind: 'details', params: { occId: occ.id }, url: urlFor('details', { occId: occ.id }) } };
  }
  return {
    stepKind: 'pay',
    path: pathFor(flow),
    testid: 'step-pay',
    render: function (body, foot) {
      var K = A().k, total = priceOf(flow);
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-pay' });
      wrap.appendChild(head(['Check and ', t('pay.')]));
      wrap.appendChild(h('p', { cls: 'demo-flag', 'data-testid': 'demo-flag', text: 'Demo, no payment taken' }));

      var totalDd = [K(total)];
      if (flow.join === 'duo') { totalDd.push(h('small', { text: 'for two (' + K(A().data.passes.duo.price_idr) + ' each)' })); }
      totalDd.push(h('small', { text: A().idr(total) }));
      wrap.appendChild(h('dl', { cls: 'summary' }, [
        row('Class', occ.cls.name),
        row('When', A().dateShort(occ.ymd) + ', ' + occ.time + ' to ' + hm(occ.end)),
        row('Pass', passName(flow.join === 'pack' ? flow.pack : flow.join)),
        h('div', { cls: 'total' }, [h('dt', { text: 'Total' }), h('dd', null, totalDd)])
      ]));

      var fs = h('fieldset', { cls: 'opts' }, h('legend', { cls: 'sh-h', style: 'margin-top:0' }, ['How would you like to pay?']));
      var methods = [['card', 'Card'], ['qris', 'QRIS'], ['desk', 'Pay at the front desk']];
      var qr = h('div', { cls: 'qr-ph', text: 'QR code appears here in the live version' });
      var deskNote = h('p', { cls: 'fine', text: "You'll pay at the front desk when you arrive." });
      var errEl = h('p', { cls: 'err', id: 'pay-err', role: 'alert' });
      errEl.style.display = 'none';
      if (!flow.pay) { flow.pay = 'card'; }
      var inputs = [];
      methods.forEach(function (m) {
        var o = radioOpt('pay', m[0], 'pay-' + m[0], flow.pay === m[0], false, [m[1], sampleChip()], h('span', { cls: 'opt__price' }), []);
        o.label.querySelector('.opt__note').style.display = 'none';
        inputs.push(o.input);
        fs.appendChild(o.label);
      });
      wrap.appendChild(fs);
      wrap.appendChild(h('div', { 'aria-live': 'polite' }, [qr, deskNote]));
      wrap.appendChild(h('p', { cls: 'fine', style: 'margin-top:14px', text: "In the live version, card and QRIS would open the club's payment partner." }));
      wrap.appendChild(errEl);
      body.appendChild(wrap);

      function sync() {
        qr.style.display = flow.pay === 'qris' ? 'grid' : 'none';
        deskNote.style.display = flow.pay === 'desk' ? 'block' : 'none';
        errEl.style.display = 'none';
      }
      sync();
      inputs.forEach(function (inp) {
        inp.addEventListener('change', function () { if (inp.checked) { flow.pay = inp.value; saveFlow(flow); sync(); } });
      });

      var btn = primary('Confirm demo booking', 'cta-pay', function () {
        if (!flow.pay) { errEl.textContent = ERR.pay; errEl.style.display = 'block'; return; }
        confirmBooking(occ, flow, btn);
      });
      foot.appendChild(btn);
    }
  };
}

/* ---------------- done view ---------------- */
function shareHref(occ) {
  var base = win.location.href.split('#')[0].split('?')[0];
  var duo = A().data.passes.duo;
  var text = "I'm going to " + occ.cls.name + ' at Elite Fit on ' + A().dateShort(occ.ymd) + ' at ' + A().time12(occ.time) +
    '. Come with me? The Duo Day Pass is ' + A().k(duo.price_idr) + ' each. ' + base + '?class=' + occ.classId;
  return 'https://wa.me/?text=' + encodeURIComponent(text);
}
function viewDone(p) {
  var bk = A().bookingFor(p.occId);
  if (!bk) { return redirectToClass(p.occId); }
  var occ = getOcc(p.occId);
  if (!occ) { return missingView(); }
  var wl = !!bk.waitlist;
  return {
    stepKind: 'done',
    path: pathForBooking(bk),
    testid: 'step-done',
    render: function (body, foot) {
      var coach = occ.coach, P = A().data.passes;
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-done' });
      wrap.insertAdjacentHTML('beforeend', '<svg class="done-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="29"></circle><path d="M19 33l9 9 17-20"></path></svg>');
      var first = bk.firstName || 'friend';
      var time = A().time12(occ.time);
      var title;
      if (wl) { title = ["You're on the list, ", t(first + '.')]; }
      else if (bk.pass === 'duo' && bk.plus1) { title = ['See you at ' + time + ', ', t(first), ' and ' + bk.plus1 + '.']; }
      else if (bk.pass === 'duo') { title = ['See you both at ' + time + ', ', t(first + '.')]; }
      else { title = ['See you at ' + time + ', ', t(first + '.')]; }
      var h2 = h('h2', { cls: 'done-title', id: 'sheet-title', tabindex: '-1', 'data-testid': 'done-title' }, title);
      wrap.appendChild(h2);
      var lead = h('p', { cls: 'done-lead' });
      if (wl) {
        lead.appendChild(doc.createTextNode(bk.wa === false ? 'No WhatsApp message chosen. Check the schedule for a free spot. ' : "We'll WhatsApp you if a spot opens. "));
        lead.appendChild(sampleChip());
      }
      else if (bk.pass === 'duo') { lead.textContent = coach.name + ' is saving you two spots.'; }
      else { lead.textContent = coach.name + ' is saving you a spot.'; }
      wrap.appendChild(lead);

      var rows = [
        row('Class', occ.cls.name),
        row('When', A().dateShort(occ.ymd) + ', ' + occ.time + ' to ' + hm(occ.end)),
        row('Coach', coach.name)
      ];
      if (wl) {
        rows.push(row('Status', 'On the waitlist'));
        rows.push(row('WhatsApp', bk.wa === false ? 'Off' : 'On'));
      } else { rows.push(row('Pass', passName(bk.pass))); }
      rows.push(row('Ref', bk.ref));
      wrap.appendChild(h('dl', { cls: 'summary' }, rows));
      wrap.appendChild(h('p', { cls: 'fine', text: 'Demo booking.' }));

      /* spot counter, announced politely (B22) */
      var live = h('p', { cls: 'vh', role: 'status', 'aria-live': 'polite', 'data-testid': 'done-live' });
      wrap.appendChild(live);
      if (!wl) {
        win.setTimeout(function () {
          var o = getOcc(bk.occId);
          if (!o) { return; }
          live.textContent = o.spotsLeft > 0 ? 'Booked. Room for ' + o.spotsLeft + ' more in this class.' : 'Booked. This class is now full.';
        }, 250);
      }

      var rc = P.recharge_day;
      var mini = h('div', { cls: 'mini-recharge' }, [
        h('img', { src: 'assets/img/rec-sauna.webp', alt: '', width: '96', height: '120', loading: 'lazy' }),
        h('div', null, [
          h('b', { text: 'Recover together.' }),
          h('p', { text: 'Sauna, ice bath and pool at Recharge. Day pass ' + A().k(rc.price_idr) + '.' }),
          h('a', { cls: 'link-t', href: A().data.club.recharge_url, target: '_blank', rel: 'noopener', 'data-testid': 'recharge-link' }, [h('span', { text: 'Book a soak' }), ' ', h('span', { 'aria-hidden': 'true', text: '→' })])
        ])
      ]);
      wrap.appendChild(mini);
      body.appendChild(wrap);

      if (wl) {
        /* on the waitlist they are not booked yet: no calendar file, one primary action */
        foot.appendChild(primary('Pick another time', 'cta-other-time', function () { pickAnother(occ); }));
      } else {
        foot.appendChild(primary('Add to calendar', 'cta-ics', function () {
          try { A().downloadIcs(occ, bk); EF.toast('Calendar file saved.'); }
          catch (e) { EF.toast("Couldn't save the calendar file."); }
        }));
        foot.appendChild(h('a', { cls: 'btn btn--outline', href: shareHref(occ), target: '_blank', rel: 'noopener', 'data-testid': 'cta-wa-share', text: 'Bring your +1 on WhatsApp' }));
      }
    }
  };
}

/* ---------------- coach view ---------------- */
function viewCoach(p) {
  var coach = A().coach(p.coachId);
  if (!coach) { return missingView(); }
  return {
    label: 'Coach',
    progress: null,
    testid: 'step-coach',
    render: function (body) {
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-coach' });
      wrap.appendChild(h('div', { cls: 'csheet__top' }, [
        h('div', { cls: 'csheet__photo' }, h('img', { src: coach.photo, alt: 'Coach ' + coach.name, width: '360', height: '450' })),
        h('div', null, [
          h('p', { cls: 'sh-when', text: 'Coach' }),
          head(coach.name),
          h('p', { cls: 'sh-desc', text: coachRole(coach) })
        ])
      ]));
      var bio = h('p', { cls: 'sh-desc' });
      if (coach.bio_sample) { bio.appendChild(sampleChip()); }
      bio.appendChild(doc.createTextNode(coach.bio));
      wrap.appendChild(bio);
      wrap.appendChild(h('h3', { cls: 'sh-h', text: 'This week with ' + coach.name }));
      var occs = A().coachOccs(coach.id);
      if (!occs.length) {
        wrap.appendChild(h('p', { cls: 'sh-desc', text: 'No classes with ' + coach.name + ' in the next seven days.' }));
      } else {
        var ul = h('ul', { cls: 'mrows' });
        occs.forEach(function (o) {
          var bk = o.booking;
          var state = bk ? (bk.waitlist ? 'On the waitlist' : "You're booked") : (o.full ? 'Full' : 'Room for ' + o.spotsLeft + ' more');
          var lbl = bk ? 'Booked' : (o.full ? 'Waitlist' : 'Book');
          var btn = h('button', { type: 'button', cls: 'btn btn--outline btn--sm rbtn', 'data-testid': 'mrow-book', 'aria-label': lbl + ' ' + o.cls.name + ', ' + whenText(o), text: lbl });
          btn.addEventListener('click', function () { EF.booking.open(o.id); });
          ul.appendChild(h('li', { cls: 'mrow', 'data-mocc': o.id }, [
            h('div', null, [h('b', { text: o.cls.name }), h('span', { text: whenText(o) + ' · ' + state })]),
            btn
          ]));
        });
        wrap.appendChild(ul);
      }
      body.appendChild(wrap);
    }
  };
}

/* ---------------- public booking API ---------------- */
function openClass(idOrOcc, opts) {
  var occ = A().occ(idOrOcc);
  if (!occ) {
    if (!A().data) { A().load().then(function () { openClass(idOrOcc, opts); }); return false; }
    EF.toast("That class isn't on this week's timetable.");
    return false;
  }
  if (!A().bookingFor(occ.id)) { ensureFlow(occ, opts); }
  return EF.sheet.open('class', { occId: occ.id }, urlFor('class', { occId: occ.id }));
}
function openCoach(id) {
  if (!A().data) { A().load().then(function () { openCoach(id); }); return false; }
  if (!A().coach(id)) { return false; }
  return EF.sheet.open('coach', { coachId: id }, urlFor('coach', { coachId: id }));
}
EF.booking = {
  open: openClass,
  openCoach: openCoach,
  flow: function () { return A().store.get().flow; }
};

/* ---------------- boot: deep links and reload ---------------- */
function parseQuery() {
  var out = {}, s = win.location.search.replace(/^\?/, ''), parts, i, kv;
  if (!s) { return out; }
  parts = s.split('&');
  for (i = 0; i < parts.length; i++) {
    kv = parts[i].split('=');
    try { out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) {}
  }
  return out;
}
function cleanUrl() {
  var np = A().nowParam;
  var url = win.location.pathname + (np ? '?now=' + encodeURIComponent(np).replace(/%3A/g, ':') : '') + win.location.hash;
  try { win.history.replaceState(null, '', url); } catch (e) {}
}
function chainFor(occ, step) {
  var bk = A().bookingFor(occ.id), flow, path, idx, max, i, s;
  if (!step || step === 'class') { return ['class']; }
  if (bk) { return step === 'done' ? pathForBooking(bk) : ['class']; }
  flow = readFlow(occ.id);
  if (!flow || flow.ref) { return ['class']; }
  flow.waitlist = !!occ.full;
  path = pathFor(flow);
  idx = path.indexOf(step);
  if (idx < 0) { return ['class']; }
  max = 0;
  for (i = 1; i <= idx; i++) {
    s = path[i];
    if (s === 'join') { max = i; }
    else if (s === 'details') { if (flow.waitlist || flow.join) { max = i; } else { break; } }
    else if (s === 'pay') { if (detailsValid(flow.details)) { max = i; } else { break; } }
    else { break; }
  }
  return path.slice(0, max + 1);
}
function boot() {
  try { win.history.scrollRestoration = 'manual'; } catch (e) {}
  var qs = parseQuery(), occ, chain, i;
  if (qs['class']) {
    occ = A().occ(qs['class']);
    cleanUrl();
    if (!occ) { return; }
    chain = chainFor(occ, qs.step);
    for (i = 0; i < chain.length; i++) {
      navigate('push', chain[i], { occId: occ.id }, urlFor(chain[i], { occId: occ.id }), i < chain.length - 1);
    }
  } else if (qs.coach) {
    cleanUrl();
    if (A().coach(qs.coach)) { openCoach(qs.coach); }
  }
}

views['class'] = viewClass;
views.join = viewJoin;
views.details = viewDetails;
views.pay = viewPay;
views.done = viewDone;
views.coach = viewCoach;

initSheet();
A().load().then(boot, function () {});
})(window, document);
