/* Forked from groupfitness-prototype/v1/assets/js/booking.js on 28 Oct 2026 for Home v2a, booking-first (one-sheet journey). v1 is unchanged.
   Elite Fit · Design concept, Home v2a, booking-first · booking.js · v1.0
   EF.sheet: one dialog for every view. Below 1024 px a modal bottom sheet (inert page, scroll lock, Tab trap, drag to close);
   from 1024 px a non-modal side panel (html.has-panel, the page makes room, no inert, no trap, Esc closes).
   EF.booking: the one-sheet journey (UX-SPEC, then Raoul's 28 Oct decisions): a coach header (portrait, name, class and time,
   the coach's invitation, one real review when one exists), exactly four options (I'm a member, Class drop-in, Membership,
   Duo day pass), full name + WhatsApp only (members: WhatsApp only, no email), pay now or pay at reception (an equal choice,
   nothing preselected: DEFAULT_PAY), one terracotta button, then Confirmed. Membership opens one next screen (Perform or Elite).
   Pay now shows one demo payment screen. Plus: returning visitor, waitlist, coach view, class swap in the desktop panel,
   deep links (?class= &pass= &step=), keyboard compact mode (the coach header folds to a 56 px strip), .ics, WhatsApp share,
   and the free-spots seat row (EF.seats).
   Demo only: EF.api.ENDPOINT is null, EF.api.submit() resolves locally; nothing is charged or sent. Vanilla ES5, one IIFE.
   Strings: ef-gf/s3v2/COPY.md v1.1 (SHEET.* slots), verbatim. */
(function (win, doc) {
'use strict';
var EF = win.EF = win.EF || {};
if (EF.sheet) { return; }

/* Payment default for a first-timer. Raoul, 28 Oct 2026: equal choice, nothing preselected. 'now' | 'reception' | null */
var DEFAULT_PAY = null;

function A() { return EF.api; }
var root = doc.documentElement;

/* ---------- copy (COPY.md v1.1, booking sheet) ---------- */
var T = {
  joinLegend: 'How are you joining?',
  opt: {
    member: ["I'm a member", 'Book with your WhatsApp number'],
    'class-1': ['Class drop-in', '300K, one class, no gym floor'],
    membership: ['Membership', 'From 2.2M / 4 weeks, every class included'],
    duo: ['Duo day pass', '225K each, two of you, all day']
  },
  duoShort: 'Needs 2 spots free. This class has 1 spot free.',
  membershipH: ['Which ', 'membership', ' suits you?'],
  tiers: {
    'perform-4w': { name: 'Perform 4 weeks', price: '2.2M', line: 'Gym, outdoor area and every class' },
    'elite-4w': { name: 'Elite 4 weeks', price: '2.7M', badge: 'Most popular', line: 'Everything in Perform, plus Recharge' }
  },
  membershipStart: 'Your membership starts on the class date, with this class. Every class after that is included.',
  detailsLegend: 'Your details',
  fName: 'Full name', hName: 'So the front desk can find your booking.',
  fWa: 'WhatsApp', hWa: 'Include your country code, like +61 or +44.',
  payLegend: 'When would you like to pay?',
  payNow: ['Pay now', 'Before you arrive'], payReception: ['Pay at reception', 'When you arrive'],
  ctaReception: 'Confirm booking', ctaMembership: 'Confirm membership start', ctaWaitlist: 'Join the waitlist', ctaMember: 'Book with my membership',
  payDemoH: ['Pay for your ', 'booking'], payDemoLine: "On the live page, the club's payment partner opens here for {total}.", payDemoLabel: 'Demo, no payment taken',
  privacy: 'We use your name and WhatsApp only for this booking and a reminder. Demo: nothing is sent.',
  remember: "We'll remember your details on this device.",
  bookingAs: 'Booking as', notYou: 'Not you?',
  memberLead: 'Members book with their WhatsApp number.', memberNote: "Demo: we don't check memberships.", memberIncluded: 'Included in your membership',
  waitlistLead: "This class is full. Join the waitlist and we'll WhatsApp you if a spot opens up.",
  yourCoach: 'Your coach', about: 'About this class',
  err: {
    name: 'Please add your full name so the front desk can find you.',
    wa: 'Please add your WhatsApp number so we can reach you.',
    wa62: 'Numbers starting with 0 need a country code, like +62.',
    pay: 'Please choose Pay now or Pay at reception.',
    summary: 'Please check the highlighted fields, then confirm again.',
    started: 'This class has just started. Here are the next ones.',
    network: "We couldn't reach the club. Your details are safe here. Try again, or send it on WhatsApp."
  },
  doneLead: 'Your coach is saving you a spot.', doneLeadWait: "We'll WhatsApp you if a spot opens.",
  labels: { cls: 'Class', when: 'When', where: 'Where', booking: 'Booking', pay: 'Payment', ref: 'Ref' },
  arrive: 'Arrive 10 minutes early and say hi at the desk.',
  ctaIcs: 'Add to calendar', ctaShare: 'WhatsApp your +1', ctaDirections: 'Get directions', ctaForget: 'Forget my details',
  toast: { switched: 'Switched to {class} at {time}.', forgotten: 'Your details are forgotten on this device.', started: "That class just started. Here's the next one.", notfound: "We couldn't find that class. Pick another below." }
};

/* ---------- the free-spots seat row (Raoul, 28 Oct): one dot per place, FREE dots solid and first, taken dots as rings.
   Always with the label "N spots free" / "1 spot free" / "Full · Join waitlist"; screen readers hear "N of C spots free".
   Over 12 places the dots sit in groups of 5. Never terracotta, never a % bar. Capacity is Sample (data overlay). ---------- */
function spotsLabel(free) { return free <= 0 ? 'Full · Join waitlist' : (free === 1 ? '1 spot free' : free + ' spots free'); }
function seatsHtml(free, cap, opts) {
  opts = opts || {};
  var i, out = '', group = cap > 12, n = Math.max(0, Math.min(free, cap));
  for (i = 0; i < cap; i++) {
    if (group && i > 0 && i % 5 === 0) { out += '<b class="seat-gap"></b>'; }
    out += '<i class="seat' + (i < n ? ' seat--free' : '') + (opts.mine && i >= n && i < n + opts.mine ? ' seat--mine' : '') + '" style="--s:' + i + '"></i>';
  }
  var lbl = opts.label || spotsLabel(free);
  var num = /^\d+/.exec(lbl);
  var vis = num ? '<b>' + num[0] + '</b>' + lbl.slice(num[0].length) : lbl;
  return '<span class="spots' + (free <= 0 ? ' spots--full' : '') + '" data-free="' + free + '" data-cap="' + cap + '">' +
    '<span class="seats" aria-hidden="true">' + out + '</span>' +
    '<span class="spots__lbl" aria-hidden="true">' + vis + '</span>' +
    '<span class="vh">' + (opts.sr || (free <= 0 ? 'Full, ' + cap + ' of ' + cap + ' spots taken. Join the waitlist.' : free + ' of ' + cap + ' spots free')) + '</span></span>';
}
EF.seats = { html: seatsHtml, label: spotsLabel };

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
function q(sel, rootEl) { return (rootEl || doc).querySelector(sel); }
function qa(sel, rootEl) { return Array.prototype.slice.call((rootEl || doc).querySelectorAll(sel)); }
function sampleChip() { return h('span', { cls: 'sample', 'data-wc': 'skip', text: 'Sample' }); }
function arrow() { return h('span', { cls: 'arr', 'aria-hidden': 'true', text: '→' }); }
function tWord(w) { return h('span', { cls: 't', text: w }); }
function fire(name, detail) {
  var ev;
  try { ev = new win.CustomEvent(name, { detail: detail }); }
  catch (e) { ev = doc.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail); }
  doc.dispatchEvent(ev);
}
function mq(s) { try { return win.matchMedia(s); } catch (e) { return { matches: false, addEventListener: function () {} }; } }
var MQ_PANEL = mq('(min-width: 1024px)');
function isPanel() { return !!MQ_PANEL.matches; }
function motionOn() { return root.classList.contains('motion-ok'); }

/* ---------- toast ---------- */
var toastTimer = null;
EF.toast = function (text) {
  var el = q('[data-toast]');
  if (!el) { return; }
  el.textContent = text;
  el.hidden = false;
  win.clearTimeout(toastTimer);
  toastTimer = win.setTimeout(function () { el.hidden = true; }, 2800);
};

/* =====================================================================
   EF.sheet
   ===================================================================== */
var S = {};
var views = {};
var depth = 0;
var opened = false;
var modal = false;
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
  S.step = q('[data-sheet-step]', S.el);
  S.back = q('[data-sheet-back]', S.el);
  S.page = q('#page');
  S.buybar = q('[data-buybar]');
}
function lockScroll() {
  var b = doc.body;
  savedY = win.pageYOffset || root.scrollTop || 0;
  root.classList.add('sheet-open');
  root.style.overflowY = 'scroll';
  b.style.position = 'fixed'; b.style.top = (-savedY) + 'px'; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%';
}
function unlockScroll() {
  var b = doc.body;
  root.classList.remove('sheet-open');
  root.style.overflowY = '';
  b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = '';
  root.style.scrollBehavior = 'auto';
  win.scrollTo(0, savedY);
  root.style.scrollBehavior = '';
}
function setInert(on) {
  var list = [S.page, S.buybar], i, el, rec;
  if (on) {
    inertPrev = [];
    for (i = 0; i < list.length; i++) {
      el = list[i];
      if (!el) { continue; }
      inertPrev.push({ el: el, aria: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') });
      el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true');
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
/* modal below 1024 px, non-modal side panel from 1024 px; re-applied when the width crosses 1024 while open */
function applyMode() {
  if (!opened) { return; }
  var panel = isPanel();
  if (panel && modal) { setInert(false); unlockScroll(); modal = false; }
  if (!panel && !modal) { lockScroll(); setInert(true); modal = true; }
  S.panel.setAttribute('aria-modal', panel ? 'false' : 'true');
  root.classList.toggle('has-panel', panel);
  S.el.classList.toggle('is-panel', panel);
}
function captureOpener() {
  var a = doc.activeElement;
  var fresh = lastTrigger && (Date.now() - lastTriggerAt < 1500) && root.contains(lastTrigger);
  opener = fresh ? lastTrigger : ((a && a !== doc.body && a !== root) ? a : lastTrigger);
  openerKey = null;
  if (opener && opener.closest) {
    var r = opener.closest('[data-occ]');
    openerKey = { id: opener.id || '', tid: opener.getAttribute('data-testid') || '', occ: r ? r.getAttribute('data-occ') : '' };
  }
}
function restoreFocus() {
  var el = opener;
  if (el && (!root.contains(el) || el.closest('[hidden]'))) {
    el = null;
    if (openerKey) {
      if (openerKey.occ) { el = q('[data-occ="' + openerKey.occ + '"] button') || q('[data-occ="' + openerKey.occ + '"]'); }
      if (!el && openerKey.id) { el = doc.getElementById(openerKey.id); }
      if (!el && openerKey.tid) { el = q('[data-testid="' + openerKey.tid + '"]'); }
    }
  }
  if (!el) { el = doc.getElementById('week'); }
  if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  opener = null;
}
function showSheet() {
  win.clearTimeout(closeTimer);
  if (opened) { return; }
  opened = true;
  captureOpener();
  S.el.hidden = false;
  modal = false;
  applyMode();
  void S.panel.offsetWidth;
  S.el.classList.add('is-open');
}
function hideSheet() {
  if (!opened) { return; }
  opened = false;
  var kind = current ? current.kind : '';
  S.el.classList.remove('is-open', 'has-kb');
  S.el.style.setProperty('--kb', '0px');
  S.panel.style.transform = '';
  root.classList.remove('has-panel');
  if (modal) { setInert(false); unlockScroll(); modal = false; }
  restoreFocus();
  current = null;
  win.clearTimeout(closeTimer);
  closeTimer = win.setTimeout(function () {
    if (opened) { return; }
    S.el.hidden = true;
    S.el.classList.remove('is-panel');
    S.body.innerHTML = '';
    S.foot.innerHTML = '';
  }, 400);
  fire('ef:sheet', { open: false, kind: kind, occId: null });
}
function renderView(kind, params, dir, guard) {
  var f = views[kind], v, r, t;
  if (!f) { return false; }
  v = f(params || {}, dir);
  if (!v) { return false; }
  if (v.redirect) {
    if ((guard || 0) > 2) { return false; }
    r = v.redirect;
    try { win.history.replaceState({ ef: 'gf2', kind: r.kind, params: r.params, d: depth }, '', r.url || win.location.href); } catch (e) {}
    return renderView(r.kind, r.params, dir, (guard || 0) + 1);
  }
  current = { kind: kind, params: params, view: v };
  S.step.textContent = v.label || '';
  S.el.setAttribute('data-kind', kind);
  S.el.setAttribute('data-mode', v.mode || '');
  S.el.classList.toggle('sheet--tall', v.tall !== false);
  S.body.innerHTML = '';
  S.foot.innerHTML = '';
  v.render(S.body, S.foot);
  S.body.classList.remove('step-in', 'step-back', 'step-swap');
  if (dir === 'fwd' || dir === 'back' || dir === 'swap') {
    void S.body.offsetWidth;
    S.body.classList.add(dir === 'back' ? 'step-back' : (dir === 'swap' ? 'step-swap' : 'step-in'));
  }
  S.body.scrollTop = 0;
  S.back.hidden = depth <= 1 || !!v.noBack;
  try { if (EF.media && EF.media.scan) { EF.media.scan(S.body); } } catch (e1) {}
  try { if (EF.motion && EF.motion.scan) { EF.motion.scan(S.body); } } catch (e2) {}
  t = q('#sheet-title', S.body);
  if (t) { t.setAttribute('tabindex', '-1'); try { t.focus({ preventScroll: true }); } catch (e3) { t.focus(); } }
  fire('ef:sheet', { open: true, kind: kind, occId: (params && params.occId) || null, panel: isPanel() });
  return true;
}
function navigate(mode, kind, params, url, quiet, dir) {
  if (!views[kind]) { return false; }
  if (pendingTraverse) { queued = function () { navigate(mode, kind, params, url, quiet, dir); }; return true; }
  var wasOpen = opened;
  if (!wasOpen) { depth = 0; }
  var replacing = mode === 'replace' && wasOpen;
  var d = replacing ? depth : depth + 1;
  var st = { ef: 'gf2', kind: kind, params: params, d: d };
  try {
    if (replacing) { win.history.replaceState(st, '', url || win.location.href); }
    else { win.history.pushState(st, '', url || win.location.href); }
  } catch (e) {}
  depth = d;
  if (!wasOpen) { showSheet(); }
  if (!quiet) { renderView(kind, params, dir || (wasOpen ? 'fwd' : 'none')); }
  return true;
}
function flushQueue() { var fn = queued; queued = null; if (fn) { fn(); } }
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
function backSheet() { if (depth > 1) { win.history.back(); } else { closeSheet(); } }

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
  for (i = 0; i < all.length; i++) { el = all[i]; if (el.type === 'radio' && el.name && el.checked) { hasChecked[el.name] = true; } }
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
  var bar = q('.sheet__bar', S.panel), startY = 0, dy = 0, startT = 0, dragging = false, hgt = 1;
  if (!bar || !win.PointerEvent) { return; }
  bar.addEventListener('pointerdown', function (e) {
    if (isPanel()) { return; }
    if (e.pointerType === 'mouse' && e.button !== 0) { return; }
    if (e.target.closest && e.target.closest('button')) { return; }
    dragging = true; startY = e.clientY; dy = 0; startT = Date.now(); hgt = S.panel.offsetHeight || 1;
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
    if (dy > hgt * 0.3 || (dy > 40 && v > 0.6)) { closeSheet(); }
  }
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

/* ----- on-screen keyboard: the foot rides on the keyboard, the focused field is centred, the pass list folds to one row ----- */
var kbTimers = [];
function textField(el) { return !!(el && el.tagName && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'checkbox' && el.type !== 'radio' && S.body && S.body.contains(el)); }
function centerField(el) {
  if (!opened || !textField(el) || isPanel()) { return; }
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
  if (vv && !isPanel()) { kb = Math.max(0, Math.round(win.innerHeight - vv.height - vv.offsetTop)); }
  if (kb < 80) { kb = 0; }
  S.el.style.setProperty('--kb', kb + 'px');
  if (vv) { S.el.style.setProperty('--vvh', Math.round(vv.height) + 'px'); }
  S.el.classList.toggle('has-kb', kb > 0 && textField(doc.activeElement));
  settleField();
}

function initSheet() {
  dom();
  if (!S.el) { return; }
  S.body.addEventListener('focusin', function (e) { if (textField(e.target)) { settleField(); win.setTimeout(syncKeyboard, 60); } });
  S.body.addEventListener('focusout', function () { win.setTimeout(syncKeyboard, 80); });
  if (win.visualViewport) {
    win.visualViewport.addEventListener('resize', syncKeyboard);
    win.visualViewport.addEventListener('scroll', syncKeyboard);
  }
  win.addEventListener('resize', function () { syncKeyboard(); applyMode(); });
  S.el.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) { return; }
    if (t.closest('[data-sheet-close]')) { closeSheet(); return; }
    if (t.closest('[data-sheet-back]')) { backSheet(); }
  });
  doc.addEventListener('keydown', function (e) {
    if (!opened) { return; }
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (!modal && e.target && e.target.closest && !S.panel.contains(e.target) && e.target.closest('input, select, textarea')) { return; }
      e.preventDefault(); closeSheet(); return;
    }
    if (e.key === 'Tab' && modal) { trapTab(e); }
    if (e.key === 'F6' && !modal) {
      e.preventDefault();
      if (S.panel.contains(doc.activeElement)) { var m = q('#week'); if (m) { m.focus(); } } else { var tt = q('#sheet-title', S.body); if (tt) { tt.focus(); } }
    }
  });
  doc.addEventListener('focusin', function (e) {
    if (opened && modal && S.panel && !S.panel.contains(e.target) && !q('[data-toast]').contains(e.target)) {
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
    /* browser-back on Confirmed never shows the filled form again: it closes */
    if (opened && current && current.kind === 'done' && st && st.ef === 'gf2' && st.d < depth) {
      var rest = st.d;
      depth = 0;
      hideSheet();
      if (rest > 0) {
        pendingTraverse = true;
        travTimer = win.setTimeout(function () { pendingTraverse = false; flushQueue(); }, 700);
        try { win.history.go(-rest); } catch (er) { pendingTraverse = false; }
      }
      return;
    }
    if (st && st.ef === 'gf2' && views[st.kind]) {
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
  isPanel: function () { return opened && !modal; },
  kind: function () { return current ? current.kind : null; },
  params: function () { return current ? current.params : null; }
};

/* =====================================================================
   EF.booking
   ===================================================================== */
var COUNTRIES = [
  ['+62', 'Indonesia'], ['+61', 'Australia'], ['+64', 'New Zealand'], ['+65', 'Singapore'], ['+60', 'Malaysia'],
  ['+66', 'Thailand'], ['+63', 'Philippines'], ['+84', 'Vietnam'], ['+44', 'UK'], ['+353', 'Ireland'],
  ['+1', 'US/Canada'], ['+49', 'Germany'], ['+31', 'Netherlands'], ['+33', 'France'], ['+41', 'Switzerland'],
  ['+46', 'Sweden'], ['+47', 'Norway'], ['+45', 'Denmark'], ['+34', 'Spain'], ['+39', 'Italy'],
  ['+7', 'Russia'], ['+380', 'Ukraine'], ['+972', 'Israel'], ['+971', 'UAE'], ['+91', 'India'],
  ['+86', 'China'], ['+81', 'Japan'], ['+82', 'South Korea'], ['+55', 'Brazil'], ['+27', 'South Africa']
];
var CC_LIST = COUNTRIES.map(function (c) { return c[0]; });
var REGION_CC = { ID: '+62', AU: '+61', NZ: '+64', SG: '+65', MY: '+60', TH: '+66', PH: '+63', VN: '+84', GB: '+44', UK: '+44', IE: '+353', US: '+1', CA: '+1', DE: '+49', NL: '+31', FR: '+33', CH: '+41', SE: '+46', NO: '+47', DK: '+45', ES: '+34', IT: '+39', RU: '+7', UA: '+380', IL: '+972', AE: '+971', IN: '+91', CN: '+86', JP: '+81', KR: '+82', BR: '+55', ZA: '+27' };
var LETTER = (function () { try { return new RegExp('\\p{L}', 'gu'); } catch (e) { return /[A-Za-zÀ-ɏͰ-ϿЀ-ӿ֐-ۿऀ-ॿ฀-๿぀-ヿ㐀-鿿가-힯]/g; } })();
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var TESTID = { member: 'join-member', 'class-1': 'pack-class-1', membership: 'join-membership', duo: 'join-duo', 'perform-4w': 'pack-perform-4w', 'elite-4w': 'pack-elite-4w' };
var payloadView = /[?&]payload=1\b/.test(win.location.search);

function letters(s) { var m = String(s).match(LETTER); return m ? m.length : 0; }
function trim(s) { return String(s || '').replace(/^\s+|\s+$/g, ''); }
function defaultCc() {
  var lang = '';
  try { lang = (win.navigator.languages && win.navigator.languages[0]) || win.navigator.language || ''; } catch (e) {}
  var m = /[-_]([A-Za-z]{2})$/.exec(lang);
  return (m && REGION_CC[m[1].toUpperCase()]) || '+62';
}
function isTier(id) { return id === 'perform-4w' || id === 'elite-4w'; }
function cardOf(id) { return isTier(id) ? 'membership' : id; }
function titleOf(name) { var i = name.indexOf(' '); return i < 0 ? [tWord(name)] : [tWord(name.slice(0, i)), name.slice(i)]; }
function k(n) { return A().k(n); }
function t12(t) { return A().time12(t); }
function dayLong(o) { return A().dateLong(o.ymd); }
function hm(ms) { var w = A().wita(ms); return (w.hh < 10 ? '0' : '') + w.hh + ':' + (w.mm < 10 ? '0' : '') + w.mm; }

/* ---- the draft: one per visitor, kept across class swaps, reloads and Back (never lose input) ---- */
var OPTIONS = ['member', 'class-1', 'membership', 'duo'];
function getOcc(id) { var b = A().bookingFor(id); return (b && A().occById(id)) || A().occ(id); }
function readDraft() { return A().store.get().flow || null; }
function saveDraft(f) { A().store.set({ flow: f }); }
function passValid(id, occ) { if (!id) { return false; } if (id === 'duo') { return occ.spotsLeft >= 2; } return isTier(id) || id === 'member' || id === 'class-1'; }
function ensureDraft(occ, opts) {
  var st = A().store.get(), c = A().contact.get(), f = st.flow, fresh = !f;
  if (!f) {
    f = { occId: occ.id, pass: null, pay: null, name: '', cc: defaultCc(), phone: '', notYou: false, section: 'week' };
    if (c) { f.name = c.name || ''; f.cc = c.cc || f.cc; f.phone = c.phone || ''; }
  }
  f.occId = occ.id;
  if (opts && opts.src) { f.section = opts.src; }
  var want = opts && opts.pass ? (opts.pass === 'membership' ? 'perform-4w' : opts.pass) : null;
  var last = c ? (c.member ? 'member' : ((st.lastPass === 'duo' || st.lastPass === 'class-1') ? st.lastPass : null)) : null;
  if (want && passValid(want, occ)) { f.pass = want; }
  else if (opts && opts.fromPage) { f.pass = (last && passValid(last, occ)) ? last : 'class-1'; }   /* Book on a class: Class drop-in is preselected */
  else if (fresh || !f.pass) { f.pass = (last && passValid(last, occ)) ? last : 'class-1'; }
  if (!passValid(f.pass, occ)) { f.pass = 'class-1'; }
  if (!f.pay) { f.pay = (c && st.lastPay) ? st.lastPay : DEFAULT_PAY; }
  saveDraft(f);
  return f;
}
function totalOf(f) { var i = A().passInfo(f.pass); return i ? i.total : 0; }

/* ---- urls ---- */
function urlFor(kind, occId) {
  var parts = [], np = A().nowParam;
  if (kind === 'coach') { parts.push('coach=' + encodeURIComponent(occId)); }
  else { parts.push('class=' + encodeURIComponent(occId)); if (kind !== 'class') { parts.push('step=' + kind); } }
  if (np) { parts.push('now=' + encodeURIComponent(np).replace(/%3A/g, ':')); }
  if (payloadView) { parts.push('payload=1'); }
  return '?' + parts.join('&');
}
function goStep(step, occId) { EF.sheet.open(step, { occId: occId }, urlFor(step, occId)); }

/* ---- shared view bits ---- */
function primary(label, testid, onClick) {
  var b = h('button', { type: 'button', cls: 'btn btn--primary', 'data-testid': testid }, [h('span', { cls: 'btn__label', text: label }), ' ', arrow()]);
  b.addEventListener('click', onClick);
  return b;
}
function html(str) { var d = h('span'); d.innerHTML = str; return d.firstChild; }
/* sheet quotes: the coach invitation (COPY SHEET.coach.<class-id>, Sample until the coaches approve) and one REAL review
   tagged with this coach or class. No real review: nothing is shown. The hero uses class-general quotes, never these. */
function coachLine(occ) { var m = (A().data.coach_lines || {}), l = m[occ.classId]; return l ? l.replace('{time}', t12(occ.time)) : null; }
function coachReview(occ) {
  var list = (A().data.reviews || []).filter(function (r) { return r && r.text && r.tags && !r.tags.hero; }), i;
  for (i = 0; i < list.length; i++) { if ((list[i].tags.classes || []).indexOf(occ.classId) >= 0) { return list[i]; } }   /* this class first */
  for (i = 0; i < list.length; i++) { if (list[i].tags.coach === occ.coachId) { return list[i]; } }                          /* then this coach */
  return null;                                                                                                               /* none: show nothing */
}
function coachHead(occ, mode, opts) {
  opts = opts || {};
  var co = occ.coach, line = coachLine(occ), rev = coachReview(occ);
  var whenTxt = A().dateShort(occ.ymd).split(' ')[0] + ' ' + t12(occ.time);
  var head = h('div', { cls: 'coachhead', 'data-coachhead': '' });
  head.appendChild(h('span', { cls: 'coachhead__photo', 'data-coach': co.id }, h('img', { src: co.photo, alt: co.name + ', coach at Elite Fit', width: '600', height: '750' })));
  var txt = h('div', { cls: 'coachhead__txt' }, [
    h('p', { cls: 'coachhead__k', text: T.yourCoach }),
    h('h2', { cls: 'coachhead__name', id: 'sheet-title', tabindex: '-1' }, [co.name, h('span', { cls: 'vh', text: ', ' + occ.cls.name + ', ' + dayLong(occ) + ', ' + t12(occ.time) })]),
    h('p', { cls: 'coachhead__cls', id: 'sheet-sum' }, [h('b', { text: occ.cls.name }), ' · ' + whenTxt + (occ.cls.length_sample ? '' : '')])
  ]);
  if (!opts.noSeats) { txt.appendChild(h('div', { cls: 'coachhead__seats' }, html(seatsHtml(mode === 'waitlist' ? 0 : occ.spotsLeft, occ.capacity)))); }
  head.appendChild(txt);
  var more = h('div', { cls: 'coachhead__more' });
  var inner = h('div', { cls: 'coachhead__inner' });
  if (line) { inner.appendChild(h('blockquote', { cls: 'coachhead__say' }, [h('p', null, ['“' + line + '”', sampleChip()]), h('cite', { cls: 'vh', text: co.name + ', your coach' })])); }
  if (rev) { inner.appendChild(h('blockquote', { cls: 'coachhead__rev' }, [h('span', { cls: 'stars5', 'aria-hidden': 'true', text: '★★★★★' }), h('span', { cls: 'vh', text: '5 stars. ' }), h('p', { text: '“' + rev.text + '”' }), h('cite', { text: '· ' + rev.by })])); }
  more.appendChild(inner);
  if (line || rev) { head.appendChild(more); }
  return head;
}
function aboutBlock(occ) {
  var d = h('details', { cls: 'sh-about', 'data-testid': 'about-class' }, [h('summary', null, [h('span', { text: T.about })])]);
  var p = h('p', null, occ.cls.description + ' ' + occ.cls.length_min + ' min.');
  if (occ.cls.sample || occ.cls.length_sample) { p.appendChild(sampleChip()); }
  d.appendChild(p);
  return d;
}
function missingView() {
  return {
    label: '', testid: 'step-class', tall: false,
    render: function (body, foot) {
      body.appendChild(h('div', { cls: 'view', 'data-testid': 'step-class' }, [h('h2', { cls: 'sh-title', id: 'sheet-title', tabindex: '-1', text: "That class isn't on the timetable" }), h('p', { cls: 'sh-lead', text: T.toast.notfound })]));
      foot.appendChild(primary('Close', 'cta-book', closeSheet));
    }
  };
}
function pickAnother(occ) {
  closeSheet();
  var opts = { ymd: occ.ymd, family: occ.familyId, focusList: true }, landed = false;
  var land = function () {
    if (landed) { return; }
    landed = true;
    win.removeEventListener('popstate', land);
    win.setTimeout(function () { if (EF.schedule && EF.schedule.show) { EF.schedule.show(opts); } }, 40);
  };
  if (pendingTraverse) { win.addEventListener('popstate', land); win.setTimeout(land, 750); } else { land(); }
}
function otherTimes(occ, cls) {
  var list = A().nextOfClass(occ.classId, { n: 2, skip: occ.id, open: true }), box = h('div', { cls: 'sh-others' });
  list.forEach(function (o) {
    var lbl = (o.dayIndex === 0 ? 'Today' : (o.dayIndex === 1 ? 'Tomorrow' : A().dateShort(o.ymd))) + ' ' + t12(o.time);
    box.appendChild(h('button', { type: 'button', cls: 'chipbtn', 'data-testid': 'other-time', 'aria-label': 'Switch to ' + o.cls.name + ', ' + dayLong(o) + ', ' + t12(o.time), text: lbl, on: { click: function () { openClass(o.id, { swap: true }); } } }));
  });
  box.appendChild(h('button', { type: 'button', cls: 'link-u sh-pick', 'data-testid': 'pick-another', on: { click: function () { pickAnother(occ); } } }, [h('span', { text: 'Pick another time' }), ' ', arrow()]));
  if (cls) { box.className += ' ' + cls; }
  return box;
}

/* ---- fields ---- */
function field(id, label, hint, input) {
  var f = h('div', { cls: 'field', 'data-field': id });
  f.appendChild(h('label', { 'for': id, text: label }));
  if (hint) { f.appendChild(h('p', { cls: 'hint', id: id + '-hint', text: hint })); }
  f.appendChild(input);
  f.appendChild(h('p', { cls: 'err', id: 'err-' + id, 'aria-live': 'off' }));
  var inp = input.tagName === 'INPUT' ? input : q('input', input);
  if (hint && inp) { inp.setAttribute('aria-describedby', id + '-hint'); }
  return f;
}
function nameInput(val) { var i = h('input', { cls: 'input', id: 'f-name', name: 'name', type: 'text', autocomplete: 'name', autocapitalize: 'words', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'next', 'aria-required': 'true', 'data-testid': 'f-name' }); i.value = val || ''; return i; }
function phoneGroup(cc, phone) {
  var sel = h('select', { cls: 'select', id: 'f-cc', name: 'cc', autocomplete: 'tel-country-code', 'data-testid': 'f-cc', 'aria-label': 'Country code' });
  COUNTRIES.forEach(function (c) { sel.appendChild(h('option', { value: c[0], text: c[0] + ' ' + c[1] })); });
  sel.value = cc; if (sel.value !== cc) { sel.value = '+62'; }
  var tel = h('input', { cls: 'input', id: 'f-phone', name: 'phone', type: 'tel', inputmode: 'tel', autocomplete: 'tel-national', enterkeyhint: 'done', 'aria-required': 'true', 'data-testid': 'f-phone' });
  tel.value = phone || '';
  var g = h('div', { cls: 'phone' }, [h('div', { cls: 'selectwrap' }, sel), tel]);
  g.sel = sel; g.tel = tel;
  return g;
}
function markBad(fieldEl, input, msg) {
  fieldEl.classList.add('is-bad');
  var e = q('.err', fieldEl); e.textContent = msg;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', e.id + (q('.hint', fieldEl) ? ' ' + q('.hint', fieldEl).id : ''));
}
function clearBad(fieldEl, input) {
  fieldEl.classList.remove('is-bad');
  input.removeAttribute('aria-invalid');
  var hint = q('.hint', fieldEl);
  if (hint) { input.setAttribute('aria-describedby', hint.id); } else { input.removeAttribute('aria-describedby'); }
}
function softHint(fieldEl, msg) {
  var s2 = q('.soft', fieldEl);
  if (!msg) { if (s2) { s2.parentNode.removeChild(s2); } return; }
  if (!s2) { s2 = h('p', { cls: 'soft', 'aria-live': 'polite' }); fieldEl.appendChild(s2); }
  s2.textContent = msg;
}
function normalisePhone(g) {
  var p = A().parsePhone(g.tel.value, CC_LIST);
  if (p.cc && p.cc !== g.sel.value) { g.sel.value = p.cc; }
  return p;
}

/* ---- busy state + submit ---- */
var busy = false;
function setBusy(btn, on) {
  busy = on;
  if (!btn) { return; }
  btn.disabled = on;
  btn.classList.toggle('is-busy', on);
  btn.setAttribute('aria-busy', on ? 'true' : 'false');
  qa('input, select', S.body).forEach(function (i) { if (on) { i.setAttribute('readonly', ''); } else { i.removeAttribute('readonly'); } });
}
function submitFlow(occ, f, extra, btn) {
  if (busy) { return; }
  setBusy(btn, true);
  var member = f.pass === 'member' && !extra.waitlist;
  var flow = {
    occId: occ.id, pass: member ? 'member' : f.pass, pay: member ? null : f.pay, waitlist: !!extra.waitlist, member: member,
    name: extra.name !== undefined ? extra.name : f.name, cc: extra.cc || f.cc, phone: A().parsePhone(extra.phone !== undefined ? extra.phone : f.phone, CC_LIST).national,
    section: f.section, returning: !!extra.returning
  };
  var bk = A().book(flow);
  var pl = A().payload(bk, flow);
  A().submit(pl).then(function () {
    setBusy(btn, false);
    A().contact.set({ name: flow.name, cc: flow.cc, phone: flow.phone, member: !!flow.member });
    EF.sheet.replace('done', { occId: occ.id }, urlFor('done', occ.id));
  }, function () {
    setBusy(btn, false);
    var ban = q('[data-banner]', S.body);
    if (ban) { ban.hidden = false; ban.textContent = T.err.network; }
  });
}

/* ---------------- the one sheet ---------------- */
function viewClass(p) {
  var occ = getOcc(p.occId);
  if (!occ) { return missingView(); }
  if (A().bookingFor(occ.id)) { return { redirect: { kind: 'done', params: { occId: occ.id }, url: urlFor('done', occ.id) } }; }
  var f = ensureDraft(occ, p);
  var c = A().contact.get();
  var known = !!(c && !f.notYou);
  var mode = occ.full ? 'waitlist' : (known ? 'returning' : 'guest');
  return {
    label: mode === 'waitlist' ? 'Waitlist' : 'Book a class', mode: mode, testid: 'step-class', noBack: true,
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view view--class', 'data-testid': 'step-class', 'data-mode': mode });
      wrap.appendChild(coachHead(occ, mode));
      wrap.appendChild(aboutBlock(occ));
      var banner = h('div', { cls: 'sh-banner', 'data-banner': '', role: 'status', hidden: true });
      wrap.appendChild(banner);
      var refs = {}, failed = false;

      if (known) {
        var who = A().firstName(c.name);
        wrap.appendChild(h('div', { cls: 'returning', 'data-testid': 'returning-summary' }, [
          h('div', null, [h('p', { cls: 'returning__who' }, T.bookingAs + ' ' + (who || A().maskPhone(c.cc, c.phone))), who ? h('p', { cls: 'returning__tel', text: A().maskPhone(c.cc, c.phone) }) : null]),
          h('button', { type: 'button', cls: 'link-u', 'data-testid': 'not-you', on: { click: function () { f.notYou = true; saveDraft(f); EF.sheet.replace('class', { occId: occ.id }, urlFor('class', occ.id)); } } }, [h('span', { text: T.notYou })])
        ]));
      }
      if (mode === 'waitlist') { wrap.appendChild(h('p', { cls: 'sh-lead' }, [T.waitlistLead, sampleChip()])); }

      /* the four options */
      if (mode !== 'waitlist') {
        var fs = h('fieldset', { cls: 'group passes', id: 'grp-pass' }, h('legend', { cls: 'group__legend', text: T.joinLegend }));
        var sumRow = h('div', { cls: 'passes__sum', 'data-pass-sum': '' }, [h('span', { 'data-pass-sum-text': '' })]);
        fs.appendChild(sumRow);
        var list = h('div', { cls: 'opts', id: 'pass-list' });
        refs.inputs = {};
        var duoOk = occ.spotsLeft >= 2;
        OPTIONS.forEach(function (id) {
          var checked = id === 'membership' ? isTier(f.pass) : f.pass === id;
          var input = h('input', { type: 'radio', name: 'pass', value: id, 'data-testid': TESTID[id], 'aria-describedby': 'note-' + id });
          input.checked = checked;
          if (id === 'duo' && !duoOk) { input.disabled = true; input.setAttribute('aria-disabled', 'true'); }
          refs.inputs[id] = input;
          var note = h('span', { cls: 'opt__note', id: 'note-' + id });
          if (id === 'duo' && !duoOk) { note.appendChild(doc.createTextNode(T.duoShort)); note.appendChild(sampleChip()); }
          else if (id === 'membership' && isTier(f.pass)) { var tr = T.tiers[f.pass]; note.appendChild(doc.createTextNode(tr.name + ' · ' + tr.price)); }
          else { note.appendChild(doc.createTextNode(T.opt[id][1])); }
          var cardKids = [h('span', { cls: 'opt__name', text: T.opt[id][0] }), note, h('span', { cls: 'opt__check', 'aria-hidden': 'true' })];
          var item = h('div', { cls: 'optwrap', 'data-optwrap': id }, h('label', { cls: 'opt', 'data-opt': id }, [input, h('span', { cls: 'opt__card' }, cardKids)]));
          if (id === 'membership' && isTier(f.pass)) {
            item.appendChild(h('button', { type: 'button', cls: 'link-u opt__change', 'data-testid': 'change-membership', 'aria-label': 'Change the membership', on: { click: function () { saveDraft(f); goStep('membership', occ.id); } } }, [h('span', { text: 'Change' })]));
          }
          list.appendChild(item);
        });
        fs.appendChild(list);
        wrap.appendChild(fs);
      }

      /* details: full name + WhatsApp (members: WhatsApp only); hidden when this device knows the visitor */
      var det = h('fieldset', { cls: 'group details', id: 'grp-details' }, h('legend', { cls: 'group__legend', text: T.detailsLegend }));
      refs.memberLead = h('p', { cls: 'sh-lead sh-lead--member', text: T.memberLead });
      det.appendChild(refs.memberLead);
      refs.name = nameInput(f.name);
      refs.nameF = field('f-name', T.fName, T.hName, refs.name);
      det.appendChild(refs.nameF);
      refs.phone = phoneGroup(f.cc, f.phone);
      refs.phoneF = field('f-phone', T.fWa, T.hWa, refs.phone);
      q('label', refs.phoneF).setAttribute('for', 'f-phone');
      det.appendChild(refs.phoneF);
      refs.memberNote = h('p', { cls: 'sh-remember', text: T.memberNote });
      det.appendChild(refs.memberNote);
      if (!known) { wrap.appendChild(det); }

      /* pay: two equal radio cards, nothing preselected for a first-timer */
      if (mode !== 'waitlist') {
        var pay = h('fieldset', { cls: 'group pay', id: 'grp-pay', 'aria-describedby': 'err-pay' }, h('legend', { cls: 'group__legend', text: T.payLegend }));
        var payRow = h('div', { cls: 'pay__row' });
        refs.pay = {};
        [['now', 'pay-now', T.payNow], ['reception', 'pay-reception', T.payReception]].forEach(function (pp) {
          var inp = h('input', { type: 'radio', name: 'pay', value: pp[0], 'data-testid': pp[1] });
          inp.checked = f.pay === pp[0];
          refs.pay[pp[0]] = inp;
          payRow.appendChild(h('label', { cls: 'opt opt--pay' }, [inp, h('span', { cls: 'opt__card' }, [h('span', { cls: 'opt__name', text: pp[2][0] }), h('span', { cls: 'opt__note', text: pp[2][1] }), h('span', { cls: 'opt__check', 'aria-hidden': 'true' })])]));
        });
        pay.appendChild(payRow);
        refs.payErr = h('p', { cls: 'err err--group', id: 'err-pay' });
        pay.appendChild(refs.payErr);
        refs.payF = pay;
        wrap.appendChild(pay);
      }
      if (mode === 'waitlist') { wrap.appendChild(otherTimes(occ)); }
      if (!known && A().store.get().remember !== false) { wrap.appendChild(h('p', { cls: 'sh-remember', text: T.remember })); }
      body.appendChild(wrap);

      var total = h('p', { cls: 'sh-total', 'data-total': '', 'aria-live': 'polite' });
      var errSum = h('p', { cls: 'err-summary', id: 'err-summary', role: 'alert', 'data-testid': 'err-summary', hidden: true });
      var cta = primary('', 'cta-book', onConfirm);
      cta.setAttribute('aria-describedby', 'sheet-privacy');
      foot.appendChild(total);
      foot.appendChild(errSum);
      foot.appendChild(cta);
      foot.appendChild(h('p', { cls: 'sh-privacy', id: 'sheet-privacy', text: T.privacy }));

      function isMember() { return mode !== 'waitlist' && f.pass === 'member'; }
      function store() { f.name = refs.name.value; f.cc = refs.phone.sel.value; f.phone = refs.phone.tel.value; saveDraft(f); }
      function sync() {
        var tot = totalOf(f), label, m = isMember();
        refs.nameF.hidden = m;
        refs.memberLead.hidden = !m;
        refs.memberNote.hidden = !m;
        if (refs.payF) { refs.payF.hidden = m; }
        if (mode === 'waitlist') { total.hidden = true; label = T.ctaWaitlist; }
        else if (m) { total.hidden = true; label = T.ctaMember; }
        else {
          total.hidden = false;
          total.textContent = k(tot) + (f.pay === 'now' ? ' · pay now' : (f.pay === 'reception' ? ' · pay at reception' : ''));
          label = f.pay === 'now' ? 'Confirm and pay ' + k(tot) : (isTier(f.pass) ? T.ctaMembership : T.ctaReception);
        }
        q('.btn__label', cta).textContent = label;
        var st = q('[data-pass-sum-text]', S.body);
        if (st) { st.textContent = isTier(f.pass) ? T.tiers[f.pass].name + ' · ' + T.tiers[f.pass].price : (f.pass === 'member' ? T.opt.member[0] : T.opt[f.pass][0] + (f.pass === 'class-1' ? ' · 300K' : ' · 225K each')); }
      }
      function validate(focus) {
        var bad = [], pr, m = isMember();
        if (!known) {
          store();
          clearBad(refs.nameF, refs.name);
          if (!m && letters(trim(refs.name.value)) < 2) { markBad(refs.nameF, refs.name, T.err.name); bad.push(refs.name); }
          clearBad(refs.phoneF, refs.phone.tel);
          pr = normalisePhone(refs.phone);
          f.cc = refs.phone.sel.value;
          softHint(refs.phoneF, pr.zero ? T.err.wa62 : '');
          if (!A().phoneOk(f.cc, pr.national)) { markBad(refs.phoneF, refs.phone.tel, T.err.wa); bad.push(refs.phone.tel); }
        }
        if (refs.payF) {
          refs.payF.classList.remove('is-bad'); refs.payErr.textContent = '';
          if (!m && !f.pay) { refs.payF.classList.add('is-bad'); refs.payErr.textContent = T.err.pay; bad.push(refs.pay.now); }
        }
        saveDraft(f);
        var fieldBad = bad.filter(function (x) { return !refs.pay || x !== refs.pay.now; }).length;
        errSum.hidden = fieldBad === 0;
        errSum.textContent = fieldBad ? T.err.summary : '';
        if (bad.length && focus) {
          var first = bad[0];
          try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
          var tgt = first.closest('.field') || first.closest('fieldset');
          if (tgt && tgt.scrollIntoView) { try { tgt.scrollIntoView({ block: 'center', behavior: motionOn() ? 'smooth' : 'auto' }); } catch (e2) { tgt.scrollIntoView(); } }
        }
        return bad.length === 0;
      }
      function showStarted() {
        banner.hidden = false;
        banner.innerHTML = '';
        banner.appendChild(h('p', { text: T.err.started }));
        banner.appendChild(otherTimes(occ, 'sh-others--banner'));
        try { banner.scrollIntoView({ block: 'nearest' }); } catch (e) {}
      }
      function onConfirm() {
        if (busy) { return; }
        var fresh = A().occById(occ.id);
        if (fresh && fresh.past) { showStarted(); return; }
        if (!validate(true)) { failed = true; return; }
        var ex = { returning: known };
        if (known) { ex.name = c.name; ex.cc = c.cc; ex.phone = c.phone; }
        if (mode === 'waitlist') { ex.waitlist = true; submitFlow(occ, f, ex, cta); return; }
        if (isMember()) { if (!known) { ex.name = (c && c.name) || ''; } submitFlow(occ, f, ex, cta); return; }
        if (f.pay === 'now') { if (known) { f.name = c.name; f.cc = c.cc; f.phone = c.phone; } saveDraft(f); fire('ef:pay', { pay: 'now' }); goStep('pay', occ.id); return; }
        submitFlow(occ, f, ex, cta);
      }

      if (refs.inputs) {
        OPTIONS.forEach(function (id) {
          refs.inputs[id].addEventListener('change', function () {
            if (!this.checked) { return; }
            if (id === 'membership') { store(); goStep('membership', occ.id); return; }   /* the next screen: Perform or Elite */
            f.pass = id; saveDraft(f); sync(); fire('ef:pass', { pass: id });
            if (id === 'member') { fire('ef:member', { occId: occ.id }); }
            if (failed) { validate(false); }
          });
        });
      }
      if (refs.pay) {
        ['now', 'reception'].forEach(function (pp) {
          refs.pay[pp].addEventListener('change', function () { if (!this.checked) { return; } f.pay = pp; saveDraft(f); sync(); fire('ef:pay', { pay: pp }); if (failed) { validate(false); } });
        });
      }
      refs.name.addEventListener('input', function () { store(); if (failed) { validate(false); } });
      refs.phone.tel.addEventListener('input', function () { store(); if (failed) { validate(false); } });
      refs.phone.tel.addEventListener('blur', function () { if (this.value) { var pr = normalisePhone(refs.phone); softHint(refs.phoneF, pr.zero ? T.err.wa62 : ''); store(); } });
      refs.phone.sel.addEventListener('change', function () { store(); if (failed) { validate(false); } });
      refs.name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); refs.phone.tel.focus(); } });
      refs.phone.tel.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); refs.phone.tel.blur(); } });
      var title = q('#sheet-title', S.body);
      if (known && title) { title.addEventListener('keydown', function (e) { if (e.key === 'Tab' && !e.shiftKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); cta.focus(); } }); }
      sync();
    }
  };
}

/* ---------------- membership: the next screen (Perform or Elite, one line each) ---------------- */
function viewMembership(p) {
  var occ = getOcc(p.occId);
  if (!occ || A().bookingFor(occ.id) || occ.full) { return { redirect: { kind: 'class', params: { occId: p.occId }, url: urlFor('class', p.occId) } }; }
  var f = ensureDraft(occ, {});
  return {
    label: 'Membership', mode: 'membership', testid: 'step-membership',
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view view--membership', 'data-testid': 'step-membership' });
      wrap.appendChild(h('h2', { cls: 'sh-title', id: 'sheet-title', tabindex: '-1' }, [T.membershipH[0], tWord(T.membershipH[1]), T.membershipH[2]]));
      wrap.appendChild(h('p', { cls: 'sh-lead' }, occ.cls.name + ' · ' + A().dateShort(occ.ymd) + ' · ' + t12(occ.time) + ' · with ' + occ.coach.name));
      var list = h('div', { cls: 'tiers', role: 'group', 'aria-label': 'Which membership?' });
      ['perform-4w', 'elite-4w'].forEach(function (tid) {
        var tr = T.tiers[tid];
        var name = [h('span', { cls: 'tier__name', text: tr.name })];
        if (tr.badge) { name.push(h('span', { cls: 'badge-terra', text: tr.badge })); }
        list.appendChild(h('button', { type: 'button', cls: 'tier' + (f.pass === tid ? ' is-on' : ''), 'aria-pressed': f.pass === tid ? 'true' : 'false', 'data-testid': TESTID[tid], on: { click: function () {
          f.pass = tid; saveDraft(f); fire('ef:pass', { pass: tid });
          backSheet();
        } } }, [h('span', { cls: 'tier__top' }, name), h('span', { cls: 'tier__price', text: tr.price }), h('span', { cls: 'tier__line', text: tr.line }), h('span', { cls: 'tier__go', 'aria-hidden': 'true', text: '→' })]));
      });
      wrap.appendChild(list);
      wrap.appendChild(h('p', { cls: 'sh-remember', text: T.membershipStart }));
      body.appendChild(wrap);
    }
  };
}

/* ---------------- pay now: one demo payment screen ---------------- */
function viewPay(p) {
  var occ = getOcc(p.occId);
  var f = readDraft();
  if (!occ || A().bookingFor(occ.id) || occ.full || !f || f.pay !== 'now' || f.pass === 'member') { return { redirect: { kind: 'class', params: { occId: p.occId }, url: urlFor('class', p.occId) } }; }
  var c = A().contact.get(), known = !!(c && !f.notYou), name = known ? c.name : f.name, phone = known ? c.phone : f.phone, cc = known ? c.cc : f.cc;
  if (letters(trim(name)) < 2 || !A().phoneOk(cc, A().parsePhone(phone, CC_LIST).national)) { return { redirect: { kind: 'class', params: { occId: occ.id }, url: urlFor('class', occ.id) } }; }
  var tot = totalOf(f);
  return {
    label: 'Pay (demo)', mode: 'pay', testid: 'step-pay',
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view view--pay', 'data-testid': 'step-pay' });
      wrap.appendChild(h('h2', { cls: 'sh-title', id: 'sheet-title', tabindex: '-1' }, [T.payDemoH[0], tWord(T.payDemoH[1])]));
      wrap.appendChild(h('p', { cls: 'demo-flag', 'data-testid': 'demo-flag', text: T.payDemoLabel }));
      wrap.appendChild(h('p', { cls: 'sh-lead', text: T.payDemoLine.replace('{total}', k(tot)) }));
      wrap.appendChild(h('dl', { cls: 'ticket ticket--mini' }, [
        row(T.labels.cls, occ.cls.name + ' · with ' + occ.coach.name),
        row(T.labels.when, A().dateShort(occ.ymd) + ' · ' + t12(occ.time)),
        row(T.labels.booking, A().passName(f.pass)),
        h('div', { cls: 'ticket__total' }, [h('dt', { text: 'Total' }), h('dd', null, [k(tot), h('small', { text: A().idr(tot) })])])
      ]));
      body.appendChild(wrap);
      var cta = primary('Pay ' + k(tot) + ' (demo)', 'cta-pay', function () { submitFlow(occ, f, { name: name, cc: cc, phone: phone, returning: known }, cta); });
      foot.appendChild(h('p', { cls: 'sh-total', text: k(tot) + ' · pay now' }));
      foot.appendChild(cta);
      foot.appendChild(h('p', { cls: 'sh-privacy', text: 'Demo: nothing is sent.' }));
    }
  };
}

/* ---------------- confirmed ---------------- */
function row(label, value) { return h('div', null, [h('dt', { text: label }), h('dd', null, value)]); }
function shareHref(occ) {
  var base = win.location.href.split('#')[0].split('?')[0];
  var day = occ.dayIndex === 0 ? 'today' : (occ.dayIndex === 1 ? 'tomorrow' : A().dateShort(occ.ymd));
  var text = "I'm going to " + occ.cls.name + ' at Elite Fit on ' + day + ' at ' + t12(occ.time) + '. Come with me? The Duo day pass is ' + k(A().passInfo('duo').unit) + ' each. ' + base + '?class=' + occ.classId + '&pass=duo';
  return 'https://wa.me/?text=' + encodeURIComponent(text);
}
function payText(bk) {
  if (bk.member) { return T.memberIncluded; }
  if (bk.paid) { return 'Paid ' + k(bk.total_idr) + ' (demo)'; }
  return 'Pay ' + k(bk.total_idr) + ' at reception';
}
function viewDone(p) {
  var bk = A().bookingFor(p.occId);
  if (!bk) { return { redirect: { kind: 'class', params: { occId: p.occId }, url: urlFor('class', p.occId) } }; }
  var occ = getOcc(p.occId);
  if (!occ) { return missingView(); }
  var wl = !!bk.waitlist, club = A().data.club;
  return {
    label: wl ? 'On the waitlist' : 'Booked', mode: 'done', testid: 'step-done', noBack: true,
    render: function (body, foot) {
      var wrap = h('div', { cls: 'view view--done', 'data-testid': 'step-done', role: 'status' });
      wrap.insertAdjacentHTML('beforeend', '<svg class="done-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="29"></circle><path d="M19 33l9 9 17-20"></path></svg>');
      var title = bk.firstName
        ? (wl ? ["You're on the list, ", tWord(bk.firstName), '.'] : ['See you at ' + t12(occ.time) + ', ', tWord(bk.firstName), '.'])
        : (wl ? ["You're on the ", tWord('list'), '.'] : ['See you at ', tWord(t12(occ.time)), '.']);
      wrap.appendChild(h('h2', { cls: 'done-title', id: 'sheet-title', tabindex: '-1', 'data-testid': 'done-title' }, title));
      var lead = h('p', { cls: 'done-lead' }, wl ? T.doneLeadWait : T.doneLead);
      if (wl) { lead.appendChild(sampleChip()); }
      wrap.appendChild(lead);
      var rows = [
        row(T.labels.cls, occ.cls.name + ' · with ' + occ.coach.name),
        row(T.labels.when, A().dateShort(occ.ymd) + ' · ' + t12(occ.time) + ' · ' + occ.cls.length_min + ' min'),
        row(T.labels.where, club.address_short || 'Jl. Sempol No.26, Pererenan')
      ];
      if (!wl) {
        rows.push(row(T.labels.booking, A().passName(bk.pass) + (bk.pass === 'duo' ? ', for two' : '')));
        rows.push(row(T.labels.pay, payText(bk)));
      }
      rows.push(row(T.labels.ref, bk.ref));
      var ticket = h('div', { cls: 'ticket-wrap' }, [h('dl', { cls: 'ticket' }, rows), h('img', { cls: 'ticket__mark', src: '../../v1/assets/logo/elitefit-logogram-black.svg', width: '40', height: '24', alt: '', 'aria-hidden': 'true' })]);
      wrap.appendChild(ticket);
      if (bk.membershipStart) { wrap.appendChild(h('p', { cls: 'done-note', text: 'Your ' + (bk.pass === 'elite-4w' ? 'Elite' : 'Perform') + ' membership starts ' + A().dateShort(bk.membershipStart) + '.' })); }
      wrap.appendChild(h('p', { cls: 'done-note', text: T.arrive }));
      var links = h('div', { cls: 'done-links' }, [
        h('a', { cls: 'link-u', href: club.maps_url || club.maps_url, target: '_blank', rel: 'noopener', 'data-testid': 'cta-directions' }, [h('span', { text: T.ctaDirections }), ' ', arrow()])
      ]);
      if (A().contact.get()) {
        links.appendChild(h('button', { type: 'button', cls: 'link-u', 'data-testid': 'cta-forget', on: { click: function () { A().contact.forget(); EF.toast(T.toast.forgotten); this.hidden = true; } } }, [h('span', { text: T.ctaForget })]));
      }
      wrap.appendChild(links);
      if (!wl) {
        var after = A().occById(occ.id) || occ, took = bk.people || 1;
        wrap.appendChild(h('div', { cls: 'done-seats', 'data-testid': 'done-seats' }, html(seatsHtml(after.spotsLeft, after.capacity, { mine: took, label: 'You took ' + took + ' of the ' + (after.spotsLeft + took) + ' free spots', sr: 'You took ' + took + ' of the ' + (after.spotsLeft + took) + ' free spots. ' + after.spotsLeft + ' of ' + after.capacity + ' spots are still free.' }))));
      }
      wrap.appendChild(h('div', { cls: 'mini-recharge' }, [
        h('img', { src: 'assets/img/rec-sauna.webp', alt: 'The sauna at Recharge', width: '96', height: '120', loading: 'lazy' }),
        h('div', null, [h('p', { cls: 'mini-recharge__h' }, ['Recover ', tWord('together'), '.']), h('p', { text: 'Outdoor pool with sunbeds, ice bath, jacuzzi, sauna and steam room, 6:30am to 10pm daily. It comes with the Duo day pass and the Elite membership.' })])
      ]));
      if (payloadView) {
        var pl = A().lastPayload();
        wrap.appendChild(h('details', { cls: 'payload', 'data-testid': 'payload', open: true }, [h('summary', { text: 'Production payload (QA, ?payload=1): built here, sent nowhere' }), h('pre', { text: JSON.stringify(pl, null, 1) || 'Built at submit time; book again in this tab to see it.' })]));
      }
      body.appendChild(wrap);
      if (wl) {
        foot.appendChild(primary('See other times', 'cta-other-time', function () { pickAnother(occ); }));
      } else {
        foot.appendChild(primary(T.ctaIcs, 'cta-ics', function () {
          try { A().downloadIcs(occ, bk); EF.toast('Calendar file saved.'); fire('ef:ics', { ref: bk.ref }); }
          catch (e) { EF.toast("Couldn't save the calendar file."); }
        }));
        foot.appendChild(h('a', { cls: 'btn btn--outline', href: shareHref(occ), target: '_blank', rel: 'noopener', 'data-testid': 'cta-wa-share', text: T.ctaShare, on: { click: function () { fire('ef:share', { ref: bk.ref }); } } }));
      }
    }
  };
}

/* ---------------- coach ---------------- */
function coachRole(coach) {
  if (coach.role) { return coach.role.replace(/ · Weight loss/, ''); }
  var names = A().data.classes.filter(function (c) { return c.coach === coach.id; }).map(function (c) { return c.name; });
  return 'Teaches ' + (names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]);
}
function viewCoach(p) {
  var coach = A().coach(p.coachId);
  if (!coach) { return missingView(); }
  return {
    label: 'Coach', mode: 'coach', testid: 'step-coach',
    render: function (body) {
      var wrap = h('div', { cls: 'view', 'data-testid': 'step-coach' });
      wrap.appendChild(h('div', { cls: 'csheet__top' }, [
        h('div', { cls: 'csheet__photo' }, h('img', { src: coach.photo, alt: coach.name + ', coach at Elite Fit', width: '360', height: '450' })),
        h('div', null, [h('p', { cls: 'sh-k', text: "Hello, I'm" }), h('h2', { cls: 'sh-title', id: 'sheet-title', tabindex: '-1' }, [tWord(coach.name)]), h('p', { cls: 'sh-lead', text: coachRole(coach) })])
      ]));
      wrap.appendChild(h('p', { cls: 'sh-lead' }, [coach.bio, sampleChip()]));
      wrap.appendChild(h('h3', { cls: 'sh-h', text: coach.name + "'s week" }));
      var occs = A().coachOccs(coach.id);
      if (!occs.length) { wrap.appendChild(h('p', { cls: 'sh-lead', text: 'No classes with ' + coach.name + ' in the next seven days.' })); }
      else {
        var ul = h('ul', { cls: 'mrows' });
        occs.forEach(function (o) {
          var bk = o.booking, lbl = bk ? 'Booked' : (o.full ? 'Waitlist' : 'Book');
          var btn = h('button', { type: 'button', cls: 'btn btn--outline btn--sm rbtn', 'data-testid': 'mrow-book', 'aria-haspopup': 'dialog', 'aria-label': lbl + ' ' + o.cls.name + ', ' + dayLong(o) + ', ' + t12(o.time), text: lbl });
          btn.addEventListener('click', function () { openClass(o.id, { src: 'coach' }); });
          ul.appendChild(h('li', { cls: 'mrow', 'data-mocc': o.id }, [h('div', null, [h('b', { text: o.cls.name }), h('span', { text: A().dateShort(o.ymd) + ' · ' + t12(o.time) })]), btn]));
        });
        wrap.appendChild(ul);
      }
      body.appendChild(wrap);
    }
  };
}

/* ---------------- public API ---------------- */
function openClass(idOrOcc, opts) {
  opts = opts || {};
  if (!A().data) { A().load().then(function () { openClass(idOrOcc, opts); }); return false; }
  var occ = A().occ(idOrOcc);
  if (!occ) { EF.toast(T.toast.notfound); var wk = doc.getElementById('week'); if (wk) { try { wk.focus({ preventScroll: true }); } catch (e) {} if (wk.scrollIntoView) { wk.scrollIntoView(); } } return false; }
  if (!A().bookingFor(occ.id)) { ensureDraft(occ, { pass: opts.pass, src: opts.src, fromPage: true }); }
  var k0 = EF.sheet.kind(), cur = EF.sheet.params();
  /* desktop panel (or a swap chip inside the sheet): swap the class in place, keep the details, pass and pay choice */
  if (EF.sheet.isOpen() && (EF.sheet.isPanel() || opts.swap) && (k0 === 'class' || k0 === 'membership' || k0 === 'pay' || k0 === 'done' || k0 === 'coach')) {
    if (cur && cur.occId === occ.id && k0 !== 'coach') { var tt = q('#sheet-title', S.body); if (tt) { tt.focus(); } return true; }
    var r = navigate('replace', 'class', { occId: occ.id }, urlFor('class', occ.id), false, 'swap');
    if (k0 !== 'done' && k0 !== 'coach') { EF.toast(T.toast.switched.replace('{class}', occ.cls.name).replace('{time}', A().dateShort(occ.ymd).split(' ')[0] + ' ' + t12(occ.time))); }
    return r;
  }
  return EF.sheet.open('class', { occId: occ.id }, urlFor('class', occ.id));
}
function openCoach(id) {
  if (!A().data) { A().load().then(function () { openCoach(id); }); return false; }
  if (!A().coach(id)) { return false; }
  if (EF.sheet.isOpen() && EF.sheet.isPanel()) { return navigate('replace', 'coach', { coachId: id }, urlFor('coach', id), false, 'swap'); }
  return EF.sheet.open('coach', { coachId: id }, urlFor('coach', id));
}
EF.booking = {
  open: openClass,
  openCoach: openCoach,
  draft: readDraft,
  DEFAULT_PAY: DEFAULT_PAY
};

/* ---------------- boot: deep links and reload ---------------- */
function parseQuery() {
  var out = {}, s = win.location.search.replace(/^\?/, ''), parts, i, kv;
  if (!s) { return out; }
  parts = s.split('&');
  for (i = 0; i < parts.length; i++) { kv = parts[i].split('='); try { out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) {} }
  return out;
}
function cleanUrl() {
  var np = A().nowParam, qs = [];
  if (np) { qs.push('now=' + encodeURIComponent(np).replace(/%3A/g, ':')); }
  if (payloadView) { qs.push('payload=1'); }
  try { win.history.replaceState(null, '', win.location.pathname + (qs.length ? '?' + qs.join('&') : '') + win.location.hash); } catch (e) {}
}
function boot() {
  try { win.history.scrollRestoration = 'manual'; } catch (e) {}
  var qs = parseQuery(), occ, chain, i, f, exact;
  if (qs['class']) {
    occ = A().occ(qs['class']);
    cleanUrl();
    if (!occ) { EF.toast(T.toast.notfound); var wk = doc.getElementById('week'); if (wk) { try { wk.focus({ preventScroll: true }); } catch (er) {} } return; }
    exact = A().parseOccId(qs['class']);
    if (exact && exact.classId && occ.id !== qs['class']) { win.setTimeout(function () { EF.toast(T.toast.started); }, 300); }
    var bk = A().bookingFor(occ.id);
    if (!bk) { ensureDraft(occ, { pass: qs.step === 'member' ? 'member' : qs.pass, src: qs.pass ? 'share' : 'deeplink', fromPage: !!qs.pass || qs.step === 'member' }); }
    chain = ['class'];
    if (qs.step === 'membership' && !bk && !occ.full) { chain.push('membership'); }
    else if (qs.step === 'pay' && !bk && !occ.full) { f = readDraft(); if (f && f.pay === 'now') { chain.push('pay'); } }
    else if (qs.step === 'done' && bk) { chain = ['done']; }
    for (i = 0; i < chain.length; i++) { navigate('push', chain[i], { occId: occ.id }, urlFor(chain[i], occ.id), i < chain.length - 1); }
  } else if (qs.coach) {
    cleanUrl();
    if (A().coach(qs.coach)) { openCoach(qs.coach); }
  }
}

views['class'] = viewClass;
views.membership = viewMembership;
views.pay = viewPay;
views.done = viewDone;
views.coach = viewCoach;

initSheet();
A().load().then(boot, function () {});
})(window, document);
