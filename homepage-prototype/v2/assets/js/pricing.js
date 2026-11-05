/* pricing.js · Version: v3.0 — 2026-10-02 · owner: pricing lane
   Changelog: v3.0 created. Own implementation (nothing from v2.x).
   What it does: reads assets/data/{passes,site,offers,reviews,hours}.json and renders the Pricing section (#pricing): length selector (radiogroup with a sliding pill),
   Duo switch, three tier cards with a price odometer, selected-card frame that travels, one WhatsApp button per card (wa.me link, url-encoded text with tier + length),
   notes, partner-discount note, live offers, trust stack. The card button dispatches ef:checkout {tier, length, duo} once window.EF.checkoutReady is true (wa.me link until then). Prices, lengths, names, include lists, hours, address and rating always come from data, never from markup.
   Exports for the other two modules of this lane (buybar.js, whatsapp.js): loadData(), fmt(), waUrl(), lex(). */
import { loadHours } from './timetable.js';

const BASE = 'assets/data/';
let _data;
/** One cached load of every data file; a missing optional file resolves to null. Resolves { passes, site, offers, reviews, hours }. */
export function loadData() {
  if (_data) return _data;
  const get = (f) => fetch(BASE + f).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  _data = Promise.all([get('passes.json'), get('site.json'), get('offers.json'), get('reviews.json'), loadHours()])
    .then(([passes, site, offers, reviews, hours]) => ({ passes, site: site || {}, offers, reviews, hours }));
  return _data;
}

/** 2700000 -> '2.700.000' (group separator from site.json.numberFormat.group). */
export function fmt(n, site) {
  const g = (site && site.numberFormat && site.numberFormat.group) || '.';
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, g);
}
/** wa.me link with a url-encoded text. number comes from site.json.whatsapp.number (digits only). */
export function waUrl(site, text) {
  const num = site && site.whatsapp && site.whatsapp.number;
  return num ? 'https://wa.me/' + String(num).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '') : null;
}
/** Reads a provisional-or-final string from a [data-lex] element inside `scope` and fills {vars}. */
export function lex(scope, key, vars) {
  const el = scope.querySelector('[data-lex="' + key + '"]');
  let s = el ? el.textContent.trim() : key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

const h = (tag, cls, attrs, kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (kids) for (const c of [].concat(kids)) e.append(c);
  return e;
};
const isDigit = (c) => c >= '0' && c <= '9';

/* ------------------------------------------------------------------ odometer
   Digits roll by transform only. Slots are indexed from the RIGHT, so digits keep their place when leading digits appear or leave.
   Interruptible: every set() just retargets --d; the CSS transition continues from where the strip is. Stagger right to left, 20 ms per slot. */
export function createOdometer(host, site) {
  host.classList.add('odo');
  const sr = h('span', 'sr-only');
  const vis = h('span', 'odo__vis', { 'aria-hidden': 'true' });
  host.append(sr, vis);
  const slots = []; // slots[i] = { el, strip, digit, timer }
  let current = null, runTimer = 0;
  const makeSlot = (digit, ch) => {
    if (!digit) return { el: h('span', 'odo__sep', null, ch), digit: false };
    const strip = h('span', 'odo__s');
    for (let k = 0; k < 10; k++) strip.append(h('span', null, null, String(k)));
    return { el: h('span', 'odo__d', null, strip), strip, digit: true };
  };
  function set(value, motion) {
    if (value === current) return;
    current = value;
    const str = fmt(value, site);
    sr.textContent = str;
    const chars = [...str].reverse();
    const live = host.classList.contains('is-live') && motion;
    chars.forEach((ch, i) => {
      let s = slots[i];
      if (s && s.leaving) { clearTimeout(s.timer); s.leaving = false; s.el.removeAttribute('data-s'); } // interrupted exit: bring it back
      if (!s) {
        s = slots[i] = makeSlot(isDigit(ch), ch);
        vis.insertBefore(s.el, vis.firstChild);
        if (live) { s.el.setAttribute('data-s', 'pre'); requestAnimationFrame(() => requestAnimationFrame(() => s.el.removeAttribute('data-s'))); }
      }
      if (s.strip) { s.strip.style.transitionDelay = live ? i * 20 + 'ms' : '0ms'; s.strip.style.setProperty('--d', ch); }
    });
    for (let i = chars.length; i < slots.length; i++) {
      const s = slots[i];
      if (!s || s.leaving) continue;
      s.leaving = true;
      if (live) { s.el.setAttribute('data-s', 'out'); s.timer = setTimeout(() => { if (slots[i] === s && s.leaving) { s.el.remove(); slots[i] = undefined; while (slots.length && !slots[slots.length - 1]) slots.pop(); } }, 360); }
      else { s.el.remove(); slots[i] = undefined; }
    }
    while (slots.length && !slots[slots.length - 1]) slots.pop();
    if (!host.classList.contains('is-live')) requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add('is-live')));
    if (live) { host.classList.add('is-run'); clearTimeout(runTimer); runTimer = setTimeout(() => host.classList.remove('is-run'), 760); }   // will-change only while a roll runs
  }
  return { set, get value() { return current; } };
}

/* ------------------------------------------------------------------ section */
export async function init(ctx) {
  const root = document.getElementById('pricing');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const data = await loadData();
  const { passes, site, offers, reviews, hours } = data;
  const L = (k, v) => lex(root, k, v);
  const motion = () => ctx.motion;

  if (!passes || !passes.tiers || !passes.lengths) { renderFail(root, site, L); return; }

  const lengths = passes.lengths, tiers = passes.tiers, duo = passes.duo || null;
  const pcfg = (site && site.pricing) || {};
  const byLen = Object.fromEntries(lengths.map((l) => [l.id, l]));
  const state = { length: byLen[pcfg.defaultLength] ? pcfg.defaultLength : lengths[0].id, duo: false, tier: null };

  /* ---- helpers on data */
  const unitWord = (days) => (days === 1 ? L('unit_day') : days % 7 === 0 && days / 7 === 1 ? L('unit_week') : L('unit_weeks'));
  const lenParts = (l) => (l.days === 1 ? ['1', L('unit_day')] : l.days % 7 === 0 ? [String(l.days / 7), unitWord(l.days)] : [String(l.days), L('unit_days') ]);
  const lenText = (l) => lenParts(l).join(' ');
  // Duo: per-person ("each") prices as the club prints them on /promo-duo/. The day pass applies to the tiers site.json lists (Elite only, FACTS F-PRC-06);
  // 4 weeks = passes.json duo.fourWeek (price for two) / people; further lengths (yearly) come from site.json pricing.duoEach (FACTS F-PRC-05).
  const duoDayTiers = pcfg.duoDayPassTiers || (duo && duo.dayPassTiers) || [];
  const duoExtra = pcfg.duoEach || {};
  const duoEach = (tierId, len) => {
    if (duoExtra[len] && duoExtra[len][tierId] != null) return duoExtra[len][tierId];
    if (!duo) return null;
    if (len === 'day') return duoDayTiers.includes(tierId) && duo.dayPassEach != null ? duo.dayPassEach : null;
    if (len === 'w4' && duo.fourWeek && duo.fourWeek[tierId] != null) return duo.fourWeek[tierId] / (duo.people || 2);
    return null;
  };
  const duoLengths = lengths.filter((l) => tiers.some((t) => duoEach(t.id, l.id) != null)).map((l) => l.id);
  const duoEligible = (len) => duoLengths.includes(len);
  /** { value, kind } kind: single | duo-each | duo-na (a Duo price the club does not publish for this pass: the single price stays shown) */
  const priceFor = (tier, len, wantDuo) => {
    const single = tier.prices[len];
    if (!wantDuo || !duoEligible(len)) return { value: single, kind: 'single' };
    const each = duoEach(tier.id, len);
    return each != null ? { value: each, kind: 'duo-each' } : { value: single, kind: 'duo-na' };
  };
  const partnerLens = (offers && offers.partner && offers.partner.appliesTo) || [];

  /* ---- head sticky bar: segmented length selector */
  const seg = $('[data-prc-seg]');
  seg.style.setProperty('--n', lengths.length);
  const pillIn = h('span', 'prc-pill__in');
  const pill = h('span', 'prc-pill', { 'aria-hidden': 'true' }, pillIn);
  seg.append(pill);
  const chips = lengths.map((l, i) => {
    const [n, u] = lenParts(l);
    const b = h('button', 'prc-seg__b', { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1', 'data-length': l.id, 'aria-label': l.label || lenText(l) },
      [h('span', 'prc-seg__n', null, n), h('span', 'prc-seg__u', null, u)]);
    pillIn.append(h('span', 'prc-pill__c', null, [h('span', 'prc-seg__n', null, n), h('span', 'prc-seg__u', null, u)]));
    seg.append(b);
    return b;
  });

  /* ---- cards */
  const cardsEl = $('[data-prc-cards]');
  const frame = $('[data-prc-frame]');
  const tpl = document.getElementById('prc-tpl-card');
  const cards = tiers.map((tier) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.tier = tier.id;
    const f = (k) => node.querySelector('[data-f="' + k + '"]');
    const pick = node.querySelector('.prc-card__pick');
    const nameId = 'prc-n-' + tier.id;
    f('name').id = nameId;
    f('name').textContent = tier.name;
    node.setAttribute('role', 'group');
    node.setAttribute('aria-labelledby', nameId);
    const badge = pcfg.badges && pcfg.badges[tier.id];
    if (badge) f('name').append(h('span', 'prc-card__badge', null, badge));
    const odo = createOdometer(f('price'), site);
    const incList = (tier.includes || (pcfg.includes && pcfg.includes[tier.id]) || (tier.description ? [tier.description] : []));
    f('inc').textContent = incList.join(' · ');
    cardsEl.insertBefore(node, frame);
    const c = { tier, node, pick, odo, per: f('per'), inc: f('inc'), bundle: f('bundle'), cta: f('cta'), incList };
    pick.addEventListener('click', () => selectTier(state.tier === tier.id ? null : tier.id, true));
    // primary button: open the checkout journey (CONTRACT 3b). Until the checkout module says it is ready the wa.me link in href does the job.
    c.cta.addEventListener('click', (e) => {
      if (!(window.EF && window.EF.checkoutReady === true)) return;
      e.preventDefault();
      selectTier(tier.id, false);
      document.dispatchEvent(new CustomEvent('ef:checkout', { detail: { tier: tier.id, length: state.length, duo: c.node.dataset.kind === 'duo-each' } }));
    });
    return c;
  });

  /* ---- Duo switch */
  const duoBtn = $('[data-prc-duo-btn]');
  const duoWrap = $('[data-prc-duo]');
  if (!duoLengths.length) duoWrap.hidden = true;
  duoBtn.addEventListener('click', () => {
    if (duoBtn.getAttribute('aria-disabled') === 'true') return;
    state.duo = !state.duo;
    render(true);
  });

  /* ---- selector interactions */
  chips.forEach((b, i) => b.addEventListener('click', () => setLength(lengths[i].id, false)));
  seg.addEventListener('keydown', (e) => {
    const k = e.key, cur = chips.findIndex((b) => b.dataset.length === state.length);
    let to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (cur + 1) % chips.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (cur - 1 + chips.length) % chips.length;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = chips.length - 1;
    if (to < 0) return;
    e.preventDefault();
    setLength(lengths[to].id, true);
  });
  function setLength(id, focus) {
    if (id === state.length) { if (focus) chips.find((b) => b.dataset.length === id).focus(); return; }
    state.length = id;
    render(true);
    if (focus) chips.find((b) => b.dataset.length === id).focus();
  }

  /* ---- selected card + travelling frame */
  function placeFrame(animate) {
    const c = cards.find((x) => x.tier.id === state.tier);
    if (!c) { frame.classList.remove('is-on'); return; }
    const first = !frame.classList.contains('is-on');
    if (first || !animate) frame.classList.add('no-trans');
    frame.style.setProperty('--x', c.node.offsetLeft + 'px');
    frame.style.setProperty('--y', c.node.offsetTop + 'px');
    frame.style.setProperty('--w', c.node.offsetWidth + 'px');
    frame.style.setProperty('--h', c.node.offsetHeight + 'px');
    if (first || !animate) { void frame.offsetWidth; frame.classList.remove('no-trans'); }
    frame.classList.add('is-on');
  }
  function selectTier(id, announce) {
    state.tier = id;
    cards.forEach((c) => {
      const on = c.tier.id === id;
      c.pick.setAttribute('aria-pressed', on ? 'true' : 'false');
      c.node.toggleAttribute('data-selected', on);
    });
    placeFrame(true);
    if (announce && id) { const c = cards.find((x) => x.tier.id === id); $('[data-prc-status]').textContent = L('status_pick', { tier: c.tier.name }); }
    emit();
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (state.tier) placeFrame(false); }).observe(cardsEl);

  /* ---- render: everything that depends on length / Duo */
  function render(announce) {
    const len = byLen[state.length];
    const duoOn = state.duo && duoEligible(state.length);
    // selector
    const idx = lengths.findIndex((l) => l.id === state.length);
    seg.style.setProperty('--i', idx);
    chips.forEach((b, i) => { b.setAttribute('aria-checked', i === idx ? 'true' : 'false'); b.tabIndex = i === idx ? 0 : -1; });
    // Duo switch
    const ok = duoEligible(state.length);
    duoBtn.setAttribute('aria-checked', duoOn ? 'true' : 'false');
    duoBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
    duoWrap.toggleAttribute('data-off', !ok);
    // cards
    const sumParts = tiers.filter((t) => t.id === 'perform' || t.id === 'recharge');
    const cur = (site.numberFormat && site.numberFormat.currency) || 'IDR';
    const money = (n) => cur + ' ' + fmt(n, site);   // placeholders such as {price} carry the currency, so copy never has to repeat it
    cards.forEach((c) => {
      const p = priceFor(c.tier, state.length, duoOn);
      c.node.dataset.kind = p.kind;
      c.odo.set(p.value, motion());
      let per = (site.numberFormat && site.numberFormat.currency || 'IDR') + ' · ' + len.per;
      if (p.kind === 'duo-each') per += ' · ' + L('duo_each');
      else if (p.kind === 'duo-na') per += ' · ' + L('duo_na');
      c.per.textContent = per;
      // include list; a line the club does not state for this length is left out (site.json pricing.includesSkip, FACTS section 17)
      const skip = (pcfg.includesSkip && pcfg.includesSkip[c.tier.id] && pcfg.includesSkip[c.tier.id][state.length]) || [];
      c.inc.textContent = c.incList.filter((x) => !skip.includes(x)).join(' \u00B7 ');
      // Elite only: what the two halves cost on their own, from the same data
      let bundle = '';
      if (pcfg.bundleLine !== false && c.tier.id === 'elite' && sumParts.length === 2 && p.kind !== 'duo-na') {
        const q = sumParts.map((t) => priceFor(t, state.length, duoOn));
        if (q.every((x) => x.kind === p.kind)) bundle = L('bundle', { sum: money(q[0].value + q[1].value) });
      }
      c.bundle.textContent = bundle;
      c.bundle.hidden = !bundle;
      // WhatsApp message with tier + length (+ Duo)
      const price = money(p.value);
      const msg = p.kind === 'duo-each'
        ? L('wa_pass_duo', { tier: c.tier.name, length: lenText(len), price, duo: L('duo_each') })
        : L('wa_pass', { tier: c.tier.name, length: lenText(len), price });
      const url = waUrl(site, msg);
      if (url) c.cta.href = url; else c.cta.removeAttribute('href');
      c.cta.setAttribute('aria-label', L('cta_aria', { tier: c.tier.name, length: lenText(len) }));
      c.pick.setAttribute('aria-label', [c.tier.name, price, len.per + (p.kind === 'duo-each' ? ', ' + L('duo_each') : '')].join(', '));
    });
    if (state.tier) placeFrame(false);
    if (announce) $('[data-prc-status]').textContent = L(duoOn ? 'status_len_duo' : 'status_len', { length: lenText(len) });
    emit();
  }
  function emit() {
    const detail = { tier: state.tier, length: state.length, duo: state.duo && duoEligible(state.length) };
    document.dispatchEvent(new CustomEvent('ef:pricechange', { detail }));
    if (state.tier) document.dispatchEvent(new CustomEvent('ef:passselect', { detail }));
    root.dataset.length = state.length;
    root.dataset.duo = detail.duo ? 'true' : 'false';
  }

  /* ---- sticky bar pinned state (sentinel) */
  const bar = $('[data-prc-bar]'), sent = $('[data-prc-sentinel]');
  if ('IntersectionObserver' in window) {
    const hh = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56);
    const mk = () => new IntersectionObserver(([e]) => { bar.toggleAttribute('data-pinned', !e.isIntersecting && e.boundingClientRect.top < hh()); }, { rootMargin: '-' + (hh() + 1) + 'px 0px 0px 0px', threshold: 0 });
    mk().observe(sent);
  }

  /* ---- the rest of the section: notes, partner note, offers, trust stack */
  renderMore(root, data, L, partnerLens);

  render(false);
  root.setAttribute('data-ready', '');
  relaxReserve(root);
  // small public handle for the motion/hero lanes
  window.EF = window.EF || {};
  window.EF.pricing = {
    get state() { return { ...state }; },
    setLength, selectTier,
    setDuo(on) { state.duo = !!on; render(false); },
  };
}

/** The section holds the final height of its data-filled blocks (data-reserve, pricing.css) until it is rendered. Drop the reservation only while the section is wholly below the
 *  viewport, where nothing visible can move; a visitor who is on or past the section keeps the reserved space (a drop would shift what they see). */
function relaxReserve(root) {
  if (!root.hasAttribute('data-reserve')) return;
  const below = () => root.getBoundingClientRect().top > window.innerHeight + 8;
  if (below()) { root.removeAttribute('data-reserve'); return; }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting && below()) { root.removeAttribute('data-reserve'); io.disconnect(); } });
  io.observe(root);
}

function renderFail(root, site, L) {
  root.removeAttribute('data-reserve');
  const box = root.querySelector('[data-prc-cards]');
  const url = waUrl(site, 'Hello Elite Fit Bali, I have a question about the club.');
  box.append(h('p', 'prc-fail', null, L('fail')));
  if (url) box.append(h('a', 'prc-cta', { href: url, target: '_blank', rel: 'noopener' }, [h('span', null, null, L('fail_cta'))]));
  root.querySelector('[data-prc-bar]').hidden = true;
  const d = root.querySelector('[data-prc-duo]'); if (d) d.hidden = true;
}

/* ---- notes / partner / offers / trust (all from data) */
function renderMore(root, data, L, partnerLens) {
  const $ = (s) => root.querySelector(s);
  const { passes, site, offers, reviews, hours } = data;
  const pcfg = site.pricing || {};
  const partner = (offers && offers.partner) || null;
  const isPartnerNote = (s) => /partner|discount/i.test(s);
  const cur = (site.numberFormat && site.numberFormat.currency) || 'IDR';
  const dayEach = (passes.duo && passes.duo.dayPassEach != null) ? fmt(passes.duo.dayPassEach, site) : '';
  const fill = (str) => String(str).split('{duoDayEach}').join(dayEach);

  // notes: the club's own wording (site.json pricing.notes, with FACTS ids), else passes.json notes without the partner one; plus the class passes
  const notes = (pcfg.notes && pcfg.notes.length ? pcfg.notes.map((n) => n.text) : (passes.notes || []).filter((n) => !isPartnerNote(n)));
  const cp = passes.classPasses || [];
  const one = cp.find((c) => c.classes === 1), ten = cp.find((c) => c.classes === 10);
  const notesAll = notes.slice();
  if (one && ten) notesAll.push(L('classes_only', { single: cur + ' ' + fmt(one.price, site), ten: cur + ' ' + fmt(ten.price, site) }));
  if (notesAll.length) {
    const ul = $('[data-prc-notes-list]');
    notesAll.forEach((n) => ul.append(h('li', null, null, n)));
    $('[data-prc-notes]').hidden = false;
  }

  // partner discounts: the club's note + the numbers it prints (offers.json), no partner names (the club prints none as text)
  const pText = (partner && partner.text) || (passes.notes || []).find(isPartnerNote);
  if (pText) {
    $('[data-prc-partner-text]').textContent = pText;
    const stat = $('[data-prc-partner-stat]');
    if (partner && partner.count && partner.min && partner.max) stat.textContent = L('partner_stat', { count: partner.count, min: partner.min, max: partner.max }); else stat.hidden = true;
    const cats = (partner && partner.categories) || [];
    const ul = $('[data-prc-partner-cats]');
    cats.forEach((c) => ul.append(h('li', 'prc-chip', null, [c.label, c.count != null ? h('span', 'prc-chip__n', null, String(c.count)) : ''])));
    ul.hidden = !cats.length;
    const ask = $('[data-prc-partner-ask]');
    const url = waUrl(site, L('wa_partner'));
    if (url) ask.href = url; else ask.hidden = true;
    $('[data-prc-partner]').hidden = false;
  }

  // offers the club publishes now (empty list = the block stays hidden)
  const list = (offers && Array.isArray(offers.offers) ? offers.offers : []).filter((o) => o && o.title && o.status !== 'expired');
  if (list.length) {
    const ul = $('[data-prc-offers-list]');
    list.forEach((o) => {
      const li = h('li', 'prc-offer');
      li.append(h('p', 'prc-offer__t', null, o.title));
      if (o.text) li.append(h('p', 'prc-offer__x', null, fill(o.text)));
      if (o.until) li.append(h('p', 'prc-offer__u', null, L('offer_until', { date: o.until })));
      const wa = o.waText ? waUrl(site, o.waText) : null;
      if (wa) li.append(h('a', 'prc-link', { href: wa, target: '_blank', rel: 'noopener' }, [h('span', null, null, L('offer_wa'))]));
      else if (o.url) li.append(h('a', 'prc-link', { href: o.url, target: '_blank', rel: 'noopener' }, [h('span', null, null, L('offer_more'))]));
      ul.append(li);
    });
    $('[data-prc-offers]').hidden = false;
  }

  // trust stack: rating, hours, location, what every pass includes
  const trust = $('[data-prc-trust]');
  const cell = (label, valueEl, extra) => { const li = h('li', 'prc-t'); li.append(h('p', 'prc-t__l', null, label), valueEl); if (extra) li.append(extra); return li; };
  const rating = (reviews && reviews.rating) || (site.rating && site.rating.value);
  const count = (reviews && reviews.count) || (site.rating && site.rating.count);
  if (rating && count) {
    const v = h('p', 'prc-t__v prc-t__v--big', null, [h('span', 'prc-t__n', null, String(rating)), ' ', h('span', 'prc-t__s', null, L('trust_reviews', { count }))]);
    const link = (reviews && reviews.url) ? h('a', 'prc-link', { href: reviews.url, target: '_blank', rel: 'noopener' }, [h('span', null, null, L('trust_read'))]) : null;
    trust.append(cell(L('trust_google'), v, link));
  }
  const hl = hoursLines(hours, L);
  if (hl.length) trust.append(cell(L('trust_hours'), h('p', 'prc-t__v', null, hl.flatMap((x, i) => (i ? [h('br'), x] : [x])))));
  if (site.address && site.address.line) {
    const dir = site.address.mapsUrl ? h('a', 'prc-link', { href: site.address.mapsUrl, target: '_blank', rel: 'noopener' }, [h('span', null, null, L('trust_directions'))]) : null;
    trust.append(cell(L('trust_find'), h('p', 'prc-t__v', null, site.address.line), dir));
  }
  const every = pcfg.includedEvery;
  if (every && every.length) trust.append(cell(L('trust_every'), h('p', 'prc-t__v', null, every.join(' · '))));
  trust.hidden = !trust.children.length;   // hidden until filled: an empty box would sit at the top of the reserved area and jump when the blocks above appear
}

/** One line per run of identical days for a { 1..7: {open, close} } map. */
function dayRuns(days, L) {
  const names = L('days_short').split(',');
  const to = ' ' + L('days_to') + ' ';
  const rows = [];
  for (let d = 1; d <= 7; d++) {
    const x = days[String(d)]; if (!x || !x.close) continue;
    const key = (x.open || '') + '|' + x.close;
    const last = rows[rows.length - 1];
    if (last && last.key === key && last.to === d - 1) last.to = d; else rows.push({ key, from: d, to: d, open: x.open, close: x.close });
  }
  if (!rows.length) return [];
  if (rows.length === 1 && rows[0].from === 1 && rows[0].to === 7 && rows[0].open) return [L('hours_every', { open: rows[0].open, close: rows[0].close })];
  return rows.map((r) => {
    if (!r.open) return L('hours_until', { close: r.close });
    const days = r.from === r.to ? names[r.from - 1] : names[r.from - 1] + to + names[r.to - 1];
    return L('hours_range', { days, open: r.open, close: r.close });
  });
}
/** Opening hours from hours.json: the club-wide line, then a line for any area (e.g. Recharge) that opens later or closes earlier. */
function hoursLines(hours, L) {
  if (!hours || !hours.days) return [];
  const lines = dayRuns(hours.days, L);
  const base = hours.days['1'];
  const areas = hours.areas || {};
  Object.keys(areas).forEach((k) => {
    const a = areas[k]; if (!a || !a.days) return;
    const first = a.days['1'];
    const same = Object.keys(a.days).every((d) => hours.days[d] && hours.days[d].open === a.days[d].open && hours.days[d].close === a.days[d].close);
    if (same) return;
    const uniform = Object.keys(a.days).every((d) => a.days[d].open === first.open && a.days[d].close === first.close);
    if (uniform && base && first.close === base.close && first.open) lines.push(L('hours_area_open', { area: a.label || k, open: first.open }));
    else lines.push((a.label || k) + ': ' + dayRuns(a.days, L).join(', '));
  });
  return lines;
}
