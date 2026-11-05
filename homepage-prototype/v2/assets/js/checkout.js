/* checkout.js · Version: v3.0 — 2026-10-02 · owner: checkout lane
   Changelog: v3.0 created. Own implementation (nothing from v2.x).
   The checkout journey: a sheet (bottom sheet on phones, centred dialog from 760 px, two columns with a running summary from 960 px) with five steps:
   1 your pass (tier, length, Duo, start date, live price) · 2 your details · 3 review · 4 payment (a CONCEPT screen) · 5 confirmation + the real WhatsApp handoff.
   Opens on the document event ef:checkout { tier, length, duo } (ids as in passes.json); sets window.EF.checkoutReady once its data has loaded (until then the pricing buttons keep their wa.me links).
   Hard rules kept here: NO network request after init (all data is fetched once, in init), NO storage (no localStorage, sessionStorage, cookie, history entry), state lives in memory and is cleared when the sheet closes,
   no real card or bank field exists anywhere (step 4 is a drawn illustration), nothing is sent by the page: the visitor taps send in WhatsApp themselves.
   Prices, tier names, lengths and the Duo rules come from passes.json + site.json (the same derivation as the pricing cards); the club's included lists and terms come from checkout.json (FACTS ids).
   Events out: ef:checkout:open, ef:checkout:step { from, to, dir }, ef:checkout:close. Handle: window.EF.checkout = { open(detail), close() }. Any element with data-checkout (+ data-tier, data-length, data-duo) also opens it. */
import { witaNow, loadHours, openState } from './timetable.js';

const BASE = 'assets/data/';
const N_STEPS = 5;
const SHEET_PARTS = ['.chk__head', '.chk__prog', '[data-chk-body]', '.chk__aside', '[data-chk-foot]'];   // made inert while the discard bar is open

const h = (tag, cls, attrs, kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of [].concat(kids == null ? [] : kids)) if (c !== false && c != null) e.append(c);
  return e;
};
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };

export async function init(ctx) {
  const root = document.getElementById('checkout');
  if (!root) return;
  const get = (f) => fetch(BASE + f).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [passes, site, cfg, hours] = await Promise.all([get('passes.json'), get('site.json'), get('checkout.json'), loadHours()]);
  if (!passes || !passes.tiers || !passes.lengths || !cfg) return;   // checkoutReady stays false: the pricing buttons keep their WhatsApp links

  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const lexEl = {};
  $$('[data-lex]').forEach((e) => { lexEl[e.dataset.lex] = e; });
  /** copy.json wins when it knows the key (ctx.t), else the provisional text of the lexicon in the partial */
  const L = (k, v) => (ctx.copy && ctx.copy['checkout.' + k] != null ? ctx.t('checkout.' + k, v) : fill(lexEl[k] ? lexEl[k].textContent.trim() : k, v));
  const group = (site && site.numberFormat && site.numberFormat.group) || '.';
  const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const cur = (site && site.numberFormat && site.numberFormat.currency) || passes.currency || 'IDR';
  $$('[data-chk-cur]').forEach((e) => { e.textContent = cur; });

  /* ---------------------------------------------------------------- data */
  const tiers = passes.tiers, lengths = passes.lengths;
  const tierBy = Object.fromEntries(tiers.map((t) => [t.id, t]));
  const lenBy = Object.fromEntries(lengths.map((l) => [l.id, l]));
  const pc = (site && site.pricing) || {};
  const duoCfg = passes.duo || null;
  const blocked = (cfg.duo && cfg.duo.notOfferedFor) || [];
  const duoDayTiers = pc.duoDayPassTiers || (duoCfg && duoCfg.dayPassTiers) || [];
  /** Duo price per person, only where the club publishes one (same derivation as the pricing cards: site.json overrides, then passes.json) */
  const duoEach = (tid, lid) => {
    if (blocked.includes(tid)) return null;
    const x = pc.duoEach && pc.duoEach[lid] && pc.duoEach[lid][tid];
    if (x != null) return x;
    if (!duoCfg) return null;
    if (lid === 'day') return duoDayTiers.includes(tid) && duoCfg.dayPassEach != null ? duoCfg.dayPassEach : null;
    if (lid === 'w4' && duoCfg.fourWeek && duoCfg.fourWeek[tid] != null) return duoCfg.fourWeek[tid] / (duoCfg.people || 2);
    return null;
  };
  const defLen = lenBy[pc.defaultLength] ? pc.defaultLength : lengths[0].id;
  const defTier = tiers.reduce((a, t) => (!a || t.prices[defLen] < a.prices[defLen] ? t : a), null).id;   // the cheapest day pass, as the buy bar shows
  const lenName = (l) => (l.days === 1 ? L('unit_day') : l.days === 7 ? L('unit_week') : l.days % 7 === 0 ? L('unit_weeks', { n: l.days / 7 }) : l.label);
  const joinList = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' ' + L('and') + ' ' + a[a.length - 1] : a.join(''));
  const maxAhead = cfg.start && cfg.start.maxDaysAhead;
  const fcfg = cfg.fields || {};
  const methods = (cfg.concept && cfg.concept.methods) || [];

  /* dates: club-local (WITA) calendar days, formatted from UTC so a visitor's own time zone never shifts them */
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fmtDate = (s, long) => !s ? '' : new Intl.DateTimeFormat('en-GB', long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(s + 'T00:00:00Z')).replace(',', '');

  /* ---------------------------------------------------------------- state (memory only; cleared on close) */
  let S = {};
  let opener = null, lastTrigger = null, wipeT = 0, anim = null, liveT = 0, held = [];
  const css = getComputedStyle(root);
  const EASE = css.getPropertyValue('--ease-out').trim() || 'ease-out';
  const DUR = Math.round(Math.min(320, parseFloat(css.getPropertyValue('--dur-ui')) || 320) * 0.85);   // steps slide in 272 ms at most
  const sheet = $('[data-chk-sheet]'), body = $('[data-chk-body]'), nextBtn = $('[data-chk-next]'), waBtn = $('[data-chk-wa]'), live = $('[data-chk-live]');
  const panels = $$('.chk__panel'), progLi = $$('.chk__prog li'), discard = $('[data-chk-discard]');
  const inputs = { name: $('#chk-name'), phone: $('#chk-phone'), email: $('#chk-email'), partner: $('#chk-partner') };
  const dateIn = $('#chk-date');

  const duoOk = () => duoEach(S.tier, S.length) != null;
  const duoOn = () => !!S.duo && duoOk();
  const unitOf = (tid, lid) => { const t = tierBy[tid]; if (!t) return null; const e = S.duo ? duoEach(tid, lid) : null; return e != null ? e : t.prices[lid] != null ? t.prices[lid] : null; };
  const unit = () => unitOf(S.tier, S.length);
  const total = () => { const u = unit(); return u == null ? null : u * (duoOn() ? 2 : 1); };
  const dateOk = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= S.today && (!maxAhead || v <= S.max);
  const startISO = () => (S.start === 'today' ? S.today : S.start === 'tomorrow' ? S.tomorrow : dateOk(S.date || '') ? S.date : '');
  const startLine = () => { const s = startISO(); return s ? L('start_line', { date: fmtDate(s, true) }) : ''; };
  const fresh = (d) => {
    const today = witaNow().date;
    const closed = openState(hours).open === false;
    const tier = tierBy[d.tier] ? d.tier : defTier;
    const length = lenBy[d.length] ? d.length : defLen;
    S = { step: 1, tier, length, duo: !!d.duo, start: closed ? 'tomorrow' : 'today', date: '', today, tomorrow: addDays(today, 1), max: maxAhead ? addDays(today, maxAhead) : '', method: (methods[0] && methods[0].id) || '', busy: false, payT: 0 };
    if (!duoOk()) S.duo = false;
  };

  /* ---------------------------------------------------------------- odometer: digits roll by transform (slots count from the right, interruptible) */
  function odometer(host) {
    host.classList.add('chk-odo');
    const sr = h('span', 'sr-only'), vis = h('span', 'chk-odo__v', { 'aria-hidden': 'true' });
    host.append(sr, vis);
    let slots = [], cur = null, armed = false;
    const mk = (digit, ch) => {
      if (!digit) return { el: h('span', 'chk-odo__p', null, ch) };
      const s = h('span', 'chk-odo__s');
      for (let k = 0; k < 10; k++) s.append(h('span', null, null, String(k)));
      return { el: h('span', 'chk-odo__d', null, s), s };
    };
    const trim = () => { while (slots.length && !slots[slots.length - 1]) slots.pop(); };
    return {
      reset() { vis.textContent = ''; sr.textContent = ''; slots = []; cur = null; armed = false; host.classList.remove('is-live'); },
      set(n, anim) {
        if (n === cur) return;
        cur = n;
        const str = n == null ? '' : money(n);
        sr.textContent = str;
        const go = armed && anim;
        [...str].reverse().forEach((ch, i) => {
          let s = slots[i];
          if (s && s.out) { clearTimeout(s.t); s.out = false; s.el.removeAttribute('data-s'); }   // an interrupted exit comes back
          if (!s) {
            s = slots[i] = mk(/\d/.test(ch), ch);
            vis.insertBefore(s.el, vis.firstChild);
            if (go) { s.el.dataset.s = 'pre'; requestAnimationFrame(() => requestAnimationFrame(() => s.el.removeAttribute('data-s'))); }
          }
          if (s.s) { s.s.style.transitionDelay = go ? i * 16 + 'ms' : '0ms'; s.s.style.setProperty('--d', ch); }
        });
        for (let i = str.length; i < slots.length; i++) {
          const s = slots[i];
          if (!s || s.out) continue;
          s.out = true;
          if (go) { s.el.dataset.s = 'out'; s.t = setTimeout(() => { if (slots[i] === s && s.out) { s.el.remove(); slots[i] = undefined; trim(); } }, 320); }
          else { s.el.remove(); slots[i] = undefined; }
        }
        trim();
        if (!armed) requestAnimationFrame(() => requestAnimationFrame(() => { armed = true; host.classList.add('is-live'); }));
      },
    };
  }
  const odos = {};
  $$('[data-chk-odo]').forEach((el) => { odos[el.dataset.chkOdo] = odometer(el); });

  /* ---------------------------------------------------------------- step 1: build the option lists once, update text on every change */
  const tierEls = tiers.map((t) => {
    const inp = h('input', null, { type: 'radio', name: 'chk-tier', value: t.id });
    const op = h('span', 'chk__op');
    const lab = (cfg.tierLabels && cfg.tierLabels[t.id] && cfg.tierLabels[t.id].sub) || '';
    const el = h('label', 'chk__opt chk__opt--t', null, [inp, h('span', 'chk__mk'), h('span', 'chk__ot', null, t.name), h('span', 'chk__os', null, lab), op]);
    $('[data-chk-tiers]').append(el);
    return { id: t.id, el, inp, op };
  });
  const lenEls = lengths.map((l) => {
    const inp = h('input', null, { type: 'radio', name: 'chk-len', value: l.id });
    const os = h('span', 'chk__os');
    const el = h('label', 'chk__opt chk__opt--c', null, [inp, h('span', 'chk__ot', null, l.chip || l.label), os]);
    $('[data-chk-lens]').append(el);
    return { id: l.id, el, inp, os };
  });
  const startIns = $$('[data-chk-starts] input');
  const duoBox = $('[data-chk-duo]'), duoIn = $('[data-chk-duo-in]'), duoHint = $('[data-chk-duo-hint]');
  const duoLens = lengths.filter((l) => tiers.some((t) => duoEach(t.id, l.id) != null));
  duoBox.hidden = !duoLens.length;

  const duoWhere = () => joinList(duoLens.map((l) => {
    if (l.id !== 'day') return lenName(l).toLowerCase();
    const ts = tiers.filter((t) => duoEach(t.id, 'day') != null);
    return ts.length < tiers.length ? L('duo_day', { tiers: joinList(ts.map((t) => t.name)) }) : lenName(l).toLowerCase();
  }));
  const inclList = () => (cfg.includes[S.tier] || [])
    .filter((x) => !(x.skip || []).some((p) => { const [a, b] = p.split(':'); return (a === '*' || a === S.tier) && b === S.length; }))
    .filter((x) => !x.only || x.only.includes(S.length)).map((x) => x.t);
  const termList = () => ((cfg.terms && cfg.terms.items) || []).filter((x) => (!x.not || !x.not.includes(S.length)) && (!x.only || x.only.includes(S.length))).map((x) => x.t);
  const ul = (el, items) => { el.textContent = ''; items.forEach((t) => el.append(h('li', null, null, t))); };

  /** The running summary: one line item (pass, start, Duo calc) and, where asked, the total row. */
  function renderSum(el) {
    el.textContent = '';
    const t = tierBy[S.tier], l = lenBy[S.length], tot = total();
    if (!t || tot == null) { el.append(h('p', 'chk__empty', null, L('price_missing'))); return; }
    const duo = duoOn(), st = startLine();
    el.append(h('div', 'chk__li', null, [
      h('p', 'chk__lit', null, (duo ? L('duo_name', { tier: t.name }) : t.name) + ' · ' + lenName(l)),
      h('p', 'chk__lip', null, cur + ' ' + money(tot)),
      st && h('p', 'chk__lis', null, st),
      duo && h('p', 'chk__lis', null, L('duo_each', { each: cur + ' ' + money(unit()) })),
    ]));
    if (el.dataset.chkSum !== 'aside') el.append(h('div', 'chk__lt', null, [h('span', 'chk__pl', null, L('total')), h('span', 'chk__ltv', null, cur + ' ' + money(tot))]));
  }

  function sync(user) {
    const t = tierBy[S.tier], l = lenBy[S.length], tot = total(), duo = duoOn();
    tierEls.forEach((x) => {
      const on = x.id === S.tier, u = unitOf(x.id, S.length), each = S.duo && duoEach(x.id, S.length) != null;
      x.el.toggleAttribute('data-on', on); x.inp.checked = on;
      x.op.textContent = u == null ? '' : cur + ' ' + money(u) + (each ? ' ' + L('each') : '');
    });
    lenEls.forEach((x) => { const on = x.id === S.length, u = unitOf(S.tier, x.id); x.el.toggleAttribute('data-on', on); x.inp.checked = on; x.os.textContent = u == null ? '' : money(u); });
    const ok = duoOk();
    duoIn.checked = duo; duoIn.disabled = !ok;
    duoHint.textContent = ok ? L('duo_hint') : L('duo_where', { where: duoWhere() });
    startIns.forEach((i) => { i.checked = i.value === S.start; i.closest('label').toggleAttribute('data-on', i.checked); });
    $('[data-chk-d="today"]').textContent = fmtDate(S.today);
    $('[data-chk-d="tomorrow"]').textContent = fmtDate(S.tomorrow);
    $('[data-chk-d="date"]').textContent = S.date && dateOk(S.date) ? fmtDate(S.date) : '';
    $('[data-chk-datef]').hidden = S.start !== 'date';
    $('[data-chk-calc]').textContent = tot == null ? L('price_missing') : (duo ? L('duo_name', { tier: t.name }) : t.name) + ' · ' + lenName(l) + (duo ? ' · ' + L('duo_each', { each: cur + ' ' + money(unit()) }) : '');
    Object.values(odos).forEach((o) => o.set(tot, ctx.motion && !!user));
    ul($('[data-chk-incl="1"]'), inclList());
    ul($('[data-chk-incl="a"]'), inclList());
    renderSum($('[data-chk-sum="aside"]'));
    if (S.step === 1) nextBtn.disabled = tot == null;
    if (user) announceTotal(tot);
  }
  function announceTotal(tot) {
    clearTimeout(liveT);
    liveT = setTimeout(() => { if (tot != null && root.dataset.state === 'open') live.textContent = L('announce_total', { total: cur + ' ' + money(tot) }); }, 500);
  }

  /* ---------------------------------------------------------------- step 2: details, inline validation */
  const digits = (s) => s.replace(/\D/g, '');
  function problem(k) {
    const v = inputs[k].value.trim();
    if (k === 'name') return v ? '' : 'name_err';
    if (k === 'phone') { const d = digits(v).length; return v && /^\+?[\d\s().-]+$/.test(v) && d >= (fcfg.phoneMinDigits || 7) && d <= (fcfg.phoneMaxDigits || 15) ? '' : 'phone_err'; }
    if (k === 'email') return !v || (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= (fcfg.emailMax || 254)) ? '' : 'email_err';
    if (k === 'partner') return duoOn() && !v ? 'partner_err' : '';
    return '';
  }
  function mark(k, key, shake) {
    const f = $('[data-f="' + k + '"]'), e = $('[data-chk-err="' + k + '"]');
    f.toggleAttribute('data-bad', !!key);
    if (key) inputs[k].setAttribute('aria-invalid', 'true'); else inputs[k].removeAttribute('aria-invalid');
    e.hidden = !key; e.textContent = key ? L(key) : '';
    if (key && shake && ctx.motion) { f.classList.remove('is-shake'); void f.offsetWidth; f.classList.add('is-shake'); }
  }
  const check = (k, shake) => { const p = problem(k); mark(k, p, shake); return !p; };
  function validateDetails() {
    const bad = ['name', 'phone', 'email', 'partner'].filter((k) => !check(k, true));
    if (!bad.length) return true;
    inputs[bad[0]].focus();
    live.textContent = L('err_summary');
    return false;
  }
  function validateStart() {
    if (S.start !== 'date' || dateOk(S.date)) { $('[data-chk-err="date"]').hidden = true; return true; }
    const e = $('[data-chk-err="date"]');
    e.hidden = false; e.textContent = L('date_err'); dateIn.setAttribute('aria-invalid', 'true'); dateIn.focus();
    return false;
  }
  const collect = () => { for (const k in inputs) S[k] = inputs[k].value.trim(); if (!duoOn()) S.partner = ''; };

  /* ---------------------------------------------------------------- step 3 and 5: review, confirmation */
  function renderReview() {
    collect();
    renderSum($('[data-chk-sum="review"]'));
    const dl = $('[data-chk-dl]');
    dl.textContent = '';
    const row = (lab, val) => dl.append(h('div', null, null, [h('dt', null, null, L(lab)), val ? h('dd', null, null, val) : h('dd', null, { 'data-empty': '' }, L('l_empty'))]));
    row('l_name', S.name); row('l_phone', S.phone); row('l_email', S.email);
    if (duoOn()) row('l_partner', S.partner);
    ul($('[data-chk-incl="3"]'), inclList());
    ul($('[data-chk-terms]'), termList());
    const a = $('[data-chk-terms-link]');
    if (cfg.termsUrl) a.href = cfg.termsUrl; else a.hidden = true;
  }
  function waText() {
    const w = cfg.whatsapp, t = tierBy[S.tier], l = lenBy[S.length], duo = duoOn();
    const v = { tier: t.name, length: lenName(l), partner: S.partner, start: fmtDate(startISO(), true), name: S.name, number: S.phone, email: S.email, total: money(total()) };
    const lines = [w.greeting];
    (w.order || []).forEach((k) => { if ((k === 'duo' && !duo) || (k === 'email' && !S.email) || !w.lines[k]) return; lines.push(fill(w.lines[k], v)); });
    return lines.join('\n');
  }
  function renderDone() {
    collect();
    renderSum($('[data-chk-sum="done"]'));
    const first = S.name.split(/\s+/)[0];
    $('[data-chk-h5]').textContent = L('done_h', { name: first.length > 20 ? first.slice(0, 19) + '…' : first });
    const msg = waText(), wa = (site && site.whatsapp) || {};
    const num = digits(String(wa.number || ''));
    waBtn.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);   // wa.me without a number still opens WhatsApp's contact picker with the text ready
    $('[data-chk-msg]').textContent = msg;
    $('[data-chk-wa-note]').textContent = L('wa_note', { number: wa.display || (num ? '+' + num : '') });
  }

  /* ---------------------------------------------------------------- step 4: payment concept (drawn, nothing real) */
  const methodsEl = $('[data-chk-methods]'), ills = $$('[data-ill]');
  const methodEls = methods.map((m) => {
    const inp = h('input', null, { type: 'radio', name: 'chk-pay', value: m.id });
    const el = h('label', 'chk__opt chk__opt--m', { 'data-status': m.status || 'concept' }, [inp, h('span', 'chk__ot', null, m.label)]);
    methodsEl.append(el);
    return { id: m.id, el, inp };
  });
  if (!methods.length) { $('[data-chk-methodset]').hidden = true; $('[data-chk-draw]').hidden = true; }
  if (cfg.concept && cfg.concept.notice === false) $$('[data-chk-notice]').forEach((n) => n.remove());
  function syncMethod() {
    methodEls.forEach((m) => { const on = m.id === S.method; m.el.toggleAttribute('data-on', on); m.inp.checked = on; });
    const known = ills.some((s) => s.dataset.ill === S.method);
    ills.forEach((s) => { s.hidden = s.dataset.ill !== (known ? S.method : 'card'); });
  }
  function pay() {
    if (S.busy) return;
    S.busy = true;
    nextBtn.dataset.busy = ''; nextBtn.setAttribute('aria-busy', 'true'); nextBtn.setAttribute('aria-disabled', 'true');
    $('[data-chk-nl]').textContent = L('paying');
    S.payT = setTimeout(() => { S.busy = false; nextBtn.removeAttribute('data-busy'); nextBtn.removeAttribute('aria-busy'); nextBtn.removeAttribute('aria-disabled'); show(5, 1); }, Math.min(700, (cfg.concept && cfg.concept.payDelayMs) || 700));
  }

  /* ---------------------------------------------------------------- steps: show, move, animate */
  function show(n, dir) {
    const from = S.step;
    S.step = n;
    root.dataset.step = String(n);
    panels.forEach((p) => { p.hidden = +p.dataset.step !== n; });
    progLi.forEach((li, i) => {
      const b = li.firstElementChild, k = i + 1, name = $('.chk__pt', li).textContent;
      li.classList.toggle('is-cur', k === n); li.classList.toggle('is-done', k < n);
      b.disabled = k >= n; b.setAttribute('aria-label', L('goto', { n: k, name }));
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    const name = $('.chk__pt', progLi[n - 1]).textContent;
    $('[data-chk-stepl]').textContent = L('step_n', { n, total: N_STEPS });
    $('[data-chk-stepn]').textContent = ' · ' + name;
    nextBtn.hidden = n === 5; waBtn.hidden = n !== 5;
    nextBtn.disabled = n === 1 && total() == null;
    if (n < 5) $('[data-chk-nl]').textContent = L('next_' + n);
    $('[data-chk-ptag]').hidden = n !== 4;
    if (n === 4) nextBtn.setAttribute('aria-label', L('pay_aria', { total: cur + ' ' + money(total()) })); else nextBtn.removeAttribute('aria-label');
    if (n === 2) $('[data-chk-partner]').hidden = !duoOn();
    if (n === 3) renderReview();
    if (n === 4) syncMethod();
    if (n === 5) renderDone();
    body.scrollTop = 0;
    const p = panels[n - 1], hd = $('.chk__h', p);
    if (anim) anim.cancel();
    if (dir && ctx.motion && p.animate) anim = p.animate([{ opacity: 0, transform: 'translate3d(' + dir * 24 + 'px,0,0)' }, { opacity: 1, transform: 'none' }], { duration: DUR, easing: EASE });
    if (hd) hd.focus({ preventScroll: true });
    live.textContent = '';
    if (from !== n) document.dispatchEvent(new CustomEvent('ef:checkout:step', { detail: { from, to: n, dir: dir || 0 } }));
  }
  function next() {
    if (S.busy) return;
    const n = S.step;
    if (n === 1) { if (validateStart() && total() != null) { collect(); show(2, 1); } }
    else if (n === 2) { if (validateDetails()) show(3, 1); }
    else if (n === 3) show(4, 1);
    else if (n === 4) pay();
  }
  const back = (to) => { if (!S.busy && S.step > 1) show(to || S.step - 1, -1); };

  /* ---------------------------------------------------------------- open, close, page lock, focus */
  const dirty = () => S.step < 5 && Object.values(inputs).some((i) => i.value.trim());
  function askDiscard() {
    S.from = document.activeElement;
    SHEET_PARTS.forEach((q) => { const e = $(q); if (e) e.inert = true; });
    discard.hidden = false;
    $('[data-chk-keep]').focus();
  }
  function endDiscard() {
    discard.hidden = true;
    SHEET_PARTS.forEach((q) => { const e = $(q); if (e) e.inert = false; });
    if (S.from && S.from.isConnected) S.from.focus({ preventScroll: true });
  }
  const tryClose = () => { if (!discard.hidden) endDiscard(); else if (dirty()) askDiscard(); else close(); };

  function lockPage() {
    document.documentElement.classList.add('chk-lock');   // overflow hidden + the scrollbar gutter stays: the page behind does not move or jump
    held = [...document.body.children].filter((el) => el !== root && !/^(SCRIPT|STYLE|LINK|TEMPLATE|SVG)$/i.test(el.tagName) && !el.inert);
    held.forEach((el) => { el.inert = true; });
  }
  function unlockPage() {
    document.documentElement.classList.remove('chk-lock');
    held.forEach((el) => { el.inert = el.id === 'buybar' ? el.dataset.state !== 'open' : false; });   // the buy bar keeps its own open/closed state
    held = [];
  }
  /* keyboard-safe on phones: the sheet sits on top of the keyboard (visual viewport) */
  const vv = window.visualViewport;
  let vvRaf = 0;
  const vvSync = () => {
    cancelAnimationFrame(vvRaf);
    vvRaf = requestAnimationFrame(() => {
      const kb = vv && vv.scale <= 1.01 ? Math.round(window.innerHeight - vv.height - vv.offsetTop) : 0, on = kb > 80;
      root.style.setProperty('--chk-kb', on ? kb + 'px' : '0px');
      if (on) root.style.setProperty('--chk-vvh', Math.round(vv.height) + 'px'); else root.style.removeProperty('--chk-vvh');
      root.classList.toggle('is-kb', on);
    });
  };
  const coarse = window.matchMedia('(pointer: coarse)');

  function open(detail) {
    const d = detail || {};
    const was = root.dataset.state === 'open';
    if (was && S.busy) return;
    clearTimeout(wipeT);
    if (!was) { const a = document.activeElement; opener = a && a !== document.body && !root.contains(a) ? a : lastTrigger && lastTrigger.isConnected ? lastTrigger : null; }
    wipe();
    fresh(d);
    dateIn.min = S.today;
    if (S.max) dateIn.max = S.max; else dateIn.removeAttribute('max');
    Object.values(odos).forEach((o) => o.reset());
    if (!was) lockPage();
    root.removeAttribute('inert');
    root.dataset.state = 'open';
    show(1, 0);
    sync(false);
    if (vv) { vv.addEventListener('resize', vvSync); vv.addEventListener('scroll', vvSync); vvSync(); }
    document.addEventListener('keydown', onKey);
    document.dispatchEvent(new CustomEvent('ef:checkout:open', { detail: { tier: S.tier, length: S.length, duo: duoOn() } }));
  }
  function close() {
    if (root.dataset.state !== 'open') return;
    clearTimeout(S.payT); clearTimeout(liveT);
    if (!discard.hidden) endDiscard();
    root.dataset.state = 'closed';
    root.setAttribute('inert', '');
    document.removeEventListener('keydown', onKey);
    if (vv) { vv.removeEventListener('resize', vvSync); vv.removeEventListener('scroll', vvSync); }
    root.style.removeProperty('--chk-kb'); root.style.removeProperty('--chk-vvh'); root.classList.remove('is-kb');
    unlockPage();
    const o = opener; opener = null;
    if (o && o.isConnected) { try { o.focus({ preventScroll: true }); } catch (_) { /* element not focusable any more */ } }
    wipeT = setTimeout(wipe, 340);   // after the exit animation: nothing of the visitor's input stays anywhere
    document.dispatchEvent(new CustomEvent('ef:checkout:close'));
  }
  /** Clears every trace of the visitor's input: form values, message text, WhatsApp link, summaries, state. */
  function wipe() {
    $('[data-chk-form]').reset();
    for (const k in inputs) mark(k, '');
    dateIn.value = ''; dateIn.removeAttribute('aria-invalid'); $('[data-chk-err="date"]').hidden = true;
    ['[data-chk-msg]', '[data-chk-wa-note]', '[data-chk-h5]', '[data-chk-dl]', '[data-chk-sum="review"]', '[data-chk-sum="done"]', '[data-chk-sum="aside"]', '[data-chk-terms]', '[data-chk-incl="3"]', '[data-chk-incl="a"]', '[data-chk-incl="1"]'].forEach((q) => { const e = $(q); if (e) e.textContent = ''; });
    waBtn.removeAttribute('href');
    ['data-busy', 'aria-busy', 'aria-disabled'].forEach((a) => nextBtn.removeAttribute(a));
    live.textContent = '';
    S = { step: 1 };
  }

  /* ---------------------------------------------------------------- events */
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); tryClose(); return; }
    if (e.key !== 'Tab' || root.dataset.state !== 'open') return;
    const f = $$('button, a[href], input, summary, [tabindex="0"]', sheet).filter((el) => !el.disabled && !el.closest('[inert]') && !el.closest('[hidden]') && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { if (i === 0 || document.activeElement === sheet) { e.preventDefault(); f[f.length - 1].focus(); } }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-chk-scrim]')) return tryClose();
    const b = t.closest('button, a');
    if (!b) return;
    if (b.matches('[data-chk-close]')) tryClose();
    else if (b.matches('[data-chk-back]')) back();
    else if (b.matches('[data-chk-next]')) next();
    else if (b.matches('[data-chk-goto]')) back(+b.dataset.chkGoto);
    else if (b.matches('[data-chk-keep]')) endDiscard();
    else if (b.matches('[data-chk-drop]')) { discard.hidden = true; SHEET_PARTS.forEach((q) => { $(q).inert = false; }); close(); }
  });
  body.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'chk-tier') { S.tier = t.value; sync(true); }
    else if (t.name === 'chk-len') { S.length = t.value; sync(true); }
    else if (t.name === 'chk-start') {
      S.start = t.value;
      if (t.value === 'date' && !S.date) S.date = addDays(S.today, 2);
      if (t.value === 'date') dateIn.value = S.date;
      sync(true);
      if (t.value === 'date') dateIn.focus();
    }
    else if (t === duoIn) { S.duo = t.checked; sync(true); }
    else if (t === dateIn) { S.date = t.value; dateIn.removeAttribute('aria-invalid'); $('[data-chk-err="date"]').hidden = true; sync(true); }
    else if (t.name === 'chk-pay') { S.method = t.value; syncMethod(); }
  });
  dateIn.addEventListener('input', () => { S.date = dateIn.value; });
  for (const k in inputs) {
    const i = inputs[k];
    i.addEventListener('blur', () => { if (i.value.trim() || i.hasAttribute('aria-invalid') || k !== 'email') check(k, false); });
    i.addEventListener('input', () => { if (i.hasAttribute('aria-invalid')) check(k, false); });
    i.addEventListener('keydown', (e) => {   // Enter moves on; on the last field it continues
      if (e.key !== 'Enter' || e.isComposing) return;
      e.preventDefault();
      const list = Object.values(inputs).filter((x) => x.getClientRects().length), j = list.indexOf(i);
      if (j < list.length - 1) list[j + 1].focus(); else next();
    });
    i.addEventListener('focus', () => { if (coarse.matches) setTimeout(() => { if (document.activeElement === i) i.scrollIntoView({ block: 'center' }); }, 350); });
  }
  $('[data-chk-form]').addEventListener('submit', (e) => e.preventDefault());

  /* the pricing lane dispatches ef:checkout; any other buy action may carry data-checkout. Remember the clicked control: Safari does not focus a button on click. */
  document.addEventListener('ef:checkout', (e) => open(e.detail));
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('button, a');
    if (el && !root.contains(el)) { lastTrigger = el; setTimeout(() => { if (lastTrigger === el) lastTrigger = null; }, 0); }
    const b = e.target.closest && e.target.closest('[data-checkout]');
    if (b && !root.contains(b)) { e.preventDefault(); open({ tier: b.dataset.tier, length: b.dataset.length, duo: b.dataset.duo === 'true' }); }
  }, true);

  window.EF = window.EF || {};
  window.EF.checkout = { open, close };
  window.EF.checkoutReady = true;
}
