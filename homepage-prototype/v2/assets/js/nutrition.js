/* nutrition.js · Version: v3.0 — 2026-10-02 · owner: nutrition lane
   Changelog: v3.0 created. Elite Nutrition block: shared clip helper (verbatim from _build/pillar-anatomy.md), fact rows filled from assets/data/menu.json, the
   data-driven "create your own bowl" step flow, and the honest card that shows while menu.json has no bowl. No fact, item, step or price is typed here. Exports init(ctx).

   WHAT SHOWS
   - Default (menu.json "bowl": null, as today): fact rows + the card "Create your own bowl / built at the cafe, ask the team" with a WhatsApp link. No fake flow.
   - menu.json "bowl" valid: the tappable step flow below renders from it, nothing else to change.
   - ?demo=bowl in the URL (design review of the INTERACTION only): loads assets/data/menu.demo.json (placeholder options) instead, with a banner; the action only previews
     the message and never opens WhatsApp. Never the default, never linked.

   DATA SCHEMA (assets/data/menu.json, key "bowl"; the demo file has the same shape):
   bowl: {
     currency: "IDR",                 // shown next to the total; falls back to site.json numberFormat.currency
     priceUnitConfirmed: true,        // prices and the running total appear ONLY when this is true AND every option has a numeric price
     basePrice: 0,                    // optional, added to the total (default 0)
     steps: [                         // in the order shown; the club defines the names (base, protein, toppings, sauce are Raoul's wording, not the club's)
       { id: "base", name: "Base",
         pick: "one" | "many",        // one = radio buttons (aria-checked), many = toggle buttons (aria-pressed); default "one"
         max: 3,                      // many only: most options allowed (default: unlimited)
         required: true,              // default false; a required one-pick step cannot be un-chosen; drives the summary line ("Still to choose: ...")
         options: [ { id: "base-1", name: "Base 1", price: 40000 } ]   // price = what the option ADDS to the total, full amount in `currency` (0 = included)
       } ] }
   Items (menu.json items[]): a price chip shows only if priceUnitConfirmed === true, price is a number and currency is a real code (not "...assumed..."). Set price to the FULL
   amount (250 NET on the board probably means 250000) when the club confirms. item.show === false hides an item. Facts rows come from items[] (category "specials"),
   fridge.itemIds and drinks[] (minus fridge and specials = the coolers). WhatsApp number: assets/data/site.json whatsapp.number (status TO CONFIRM). */
/* >>> pil-clip v1 · identical in nutrition.js, training.js, rest.js · source: _build/pillar-anatomy.md */
const EFNS = (window.EF = window.EF || {});
EFNS.clips = EFNS.clips || (() => {            // request(el) -> true when el may play; release(el); max 2 on a phone, 4 elsewhere
  const on = new Set(), phone = matchMedia('(max-width: 759px)');
  return { request(el) { if (on.has(el)) return true; if (on.size >= (phone.matches ? 2 : 4)) return false; on.add(el); return true; },
           release(el) { if (on.delete(el)) document.dispatchEvent(new Event('ef-clip-free')); }, count: () => on.size };
})();
function pilClip(v, ctx) {                      // lazy, poster first, plays only near the viewport, never when reduced motion / data-saver
  if (!v || !ctx.motion || (navigator.connection && navigator.connection.saveData)) return () => {};
  let seen = false;
  const stop = () => { v.pause(); EFNS.clips.release(v); };
  const start = () => { if (document.hidden || !EFNS.clips.request(v)) return; const p = v.play(); if (p && p.catch) p.catch(() => EFNS.clips.release(v)); };
  const io = new IntersectionObserver((es) => { for (const e of es) { seen = e.isIntersecting; seen ? start() : stop(); } }, { rootMargin: '80px 0px', threshold: 0.25 });
  const retry = () => { if (seen && v.paused) start(); };
  const vis = () => (document.hidden ? (v.pause(), EFNS.clips.release(v)) : retry());
  document.addEventListener('ef-clip-free', retry); document.addEventListener('visibilitychange', vis); io.observe(v);
  return () => { io.disconnect(); document.removeEventListener('ef-clip-free', retry); document.removeEventListener('visibilitychange', vis); stop(); };
}
/* <<< pil-clip v1 */

/* ---- Elite Nutrition only ---- */
const FB = {  // provisional strings, used only until copy/copy.json carries the key (same text as copy/slots/nutrition.json)
  'nutrition.bowl.title': 'Create your own bowl', 'nutrition.bowl.cta': 'Ask or order at the cafe',
  'nutrition.bowl.steps.aria': 'Bowl steps', 'nutrition.bowl.stepDone': 'chosen', 'nutrition.bowl.step': 'Step {n} of {total}',
  'nutrition.bowl.hint.one': 'Choose one', 'nutrition.bowl.hint.many': 'Choose any', 'nutrition.bowl.hint.max': 'Choose up to {n}', 'nutrition.bowl.hint.optional': 'Optional',
  'nutrition.bowl.back': 'Back', 'nutrition.bowl.next': 'Next', 'nutrition.bowl.reset': 'Start again',
  'nutrition.bowl.vessel.empty': 'Your bowl is empty', 'nutrition.bowl.total': 'Total', 'nutrition.bowl.included': 'Included',
  'nutrition.bowl.sum.start': 'Start with {step}.', 'nutrition.bowl.sum.partial': '{items}. Still to choose: {step}.', 'nutrition.bowl.sum.done': 'Your bowl: {items}.',
  'nutrition.bowl.added': 'Added {name}.', 'nutrition.bowl.removed': 'Removed {name}.', 'nutrition.bowl.full': 'This step takes up to {n}.',
  'nutrition.wa.generic': "Hello Elite Fit Bali, I'm planning to visit the cafe. What is on the menu today?",
  'nutrition.wa.bowlAsk': "Hello Elite Fit Bali, can I build my own bowl at the cafe? What is on offer today?",
  'nutrition.wa.bowl': "Hello Elite Fit Bali, I'd like a bowl at the cafe. {items}. Is that available today?",
  'nutrition.wa.dietitian': "Hello Elite Fit Bali, I'd like to ask about seeing the dietitian.",
};
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };
const h = (tag, cls, attrs, kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (kids != null) for (const c of [].concat(kids)) e.append(c);
  return e;
};
const getJSON = (u) => fetch(u, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const fmtNum = (n, site) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, (site && site.numberFormat && site.numberFormat.group) || '.');
const waUrl = (site, text) => { const n = site && site.whatsapp && site.whatsapp.number; return n ? 'https://wa.me/' + String(n).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '') : null; };
/** A price is shown only when the data confirms it: priceUnitConfirmed === true, a numeric price and a real currency code. */
const confirmedPrice = (it, site) => (it && it.priceUnitConfirmed === true && Number.isFinite(it.price) && it.currency && !/assumed|not printed/i.test(it.currency) ? it.currency + ' ' + fmtNum(it.price, site) : '');
let uid = 0;

/* ------------------------------------------------------------------ odometer
   Digits are strips (0-9) rolled by transform. Slots are indexed from the RIGHT, so a digit keeps its place when a leading digit appears or goes.
   Interruptible: set() only retargets --d, the CSS transition continues from where the strip is. Stagger right to left, 20 ms per slot (under 600 ms in all). */
function odometer(host, motion) {
  host.classList.add('nut-odo');
  const sr = h('span', 'sr-only'), vis = h('span', 'nut-odo__vis', { 'aria-hidden': 'true' });
  host.append(sr, vis);
  const slots = [];
  const isD = (c) => c >= '0' && c <= '9';
  const make = (digit, ch) => {
    if (!digit) return { digit, el: h('span', 'nut-odo__sep', null, ch) };
    const strip = h('span', 'nut-odo__s');
    for (let k = 0; k < 10; k++) strip.append(h('span', null, null, String(k)));
    return { digit, strip, el: h('span', 'nut-odo__d', null, strip) };
  };
  return {
    set(str) {
      sr.textContent = str;
      const chars = [...str].reverse(), live = motion() && host.classList.contains('is-live');
      chars.forEach((ch, i) => {
        let s = slots[i];
        if (!s || s.digit !== isD(ch)) { const n = make(isD(ch), ch); if (s) s.el.replaceWith(n.el); else vis.insertBefore(n.el, vis.firstChild); s = slots[i] = n; }
        if (s.digit) { s.strip.style.transitionDelay = live ? i * 20 + 'ms' : '0ms'; s.strip.style.setProperty('--d', ch); }
        else s.el.textContent = ch;
      });
      while (slots.length > chars.length) slots.pop().el.remove();
      if (!host.classList.contains('is-live')) requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add('is-live')));
    },
  };
}

/* ------------------------------------------------------------------ fact rows from data */
function renderFacts(root, menu, o) {
  const show = (i) => i && i.show !== false;
  const byId = new Map(((menu && menu.items) || []).map((i) => [i.id, i]));
  const fridgeIds = new Set((menu && menu.fridge && menu.fridge.itemIds) || []);
  const lists = {
    specials: ((menu && menu.items) || []).filter((i) => i.category === 'specials' && show(i)),
    fridge: [...fridgeIds].map((id) => byId.get(id)).filter(show),
    coolers: ((menu && menu.drinks) || []).filter((id) => !fridgeIds.has(id)).map((id) => byId.get(id)).filter((i) => show(i) && i.category !== 'specials'),
  };
  for (const key in lists) {
    const ul = root.querySelector('[data-bind="' + key + '"]'); if (!ul) continue;
    ul.replaceChildren(...lists[key].map((it) => {
      const li = h('li', 'nut-tag', { 'data-item': it.id }, h('span', 'nut-tag__n', null, it.name));
      const p = confirmedPrice(it, o.site); if (p) li.append(h('span', 'nut-tag__p', null, p));
      return li;
    }));
    if (!lists[key].length && key !== 'coolers') { const row = ul.closest('.pil__fact'); if (row) row.hidden = true; }
  }
  // "Prices at the cafe." disappears once every special carries a confirmed price
  const note = root.querySelector('[data-hide-when-priced]');
  if (note && lists.specials.length && lists.specials.every((i) => confirmedPrice(i, o.site))) note.hidden = true;
}

function ask(el, o, key) {
  const u = waUrl(o.site, o.tt(key));
  if (!el || !u) return;
  el.href = u; el.target = '_blank'; el.rel = 'noopener'; el.hidden = false;
}

/* ------------------------------------------------------------------ the bowl step flow (data-driven, see schema at the top of this file) */
function validBowl(b) {
  return !!(b && Array.isArray(b.steps) && b.steps.length && b.steps.every((s) => s && s.id && s.name && Array.isArray(s.options) && s.options.length && s.options.every((op) => op && op.id && op.name)));
}

function mountFlow(box, bowl, o) {
  const { tt, site, ctx, demo } = o, motion = () => ctx.motion, id = ++uid;
  const steps = bowl.steps.map((s) => ({
    id: String(s.id), name: s.name, pick: s.pick === 'many' ? 'many' : 'one', required: s.required === true,
    max: s.pick === 'many' && Number.isInteger(s.max) && s.max > 0 ? s.max : Infinity,
    options: s.options.map((op) => ({ id: String(op.id), name: op.name, price: Number.isFinite(op.price) ? op.price : null })),
  }));
  // a running total only when the data confirms the price unit AND every option has a price (a partial total would mislead)
  const priced = bowl.priceUnitConfirmed === true && steps.every((s) => s.options.every((op) => op.price != null));
  const base = priced && Number.isFinite(bowl.basePrice) ? bowl.basePrice : 0;
  const cur = String(bowl.currency || (site.numberFormat && site.numberFormat.currency) || '').trim();
  const sel = steps.map(() => []);   // chosen option ids per step, in the order tapped
  let at = 0;

  /* skeleton */
  const flow = h('div', 'nut-flow' + (demo ? ' nut-flow--demo' : ''), { role: 'group', 'aria-labelledby': 'nut-flow-h-' + id });
  if (demo) flow.append(h('p', 'nut-demo', { role: 'note' }, demo.banner || "DEMO DATA: not the club's menu"));
  flow.append(h('h3', 'nut-flow__title', { id: 'nut-flow-h-' + id }, tt('nutrition.bowl.title')));
  const nav = h('ol', 'nut-steps', { 'aria-label': tt('nutrition.bowl.steps.aria') });
  nav.style.setProperty('--n', String(Math.min(steps.length, 5)));
  const tabs = steps.map((s, i) => {
    const b = h('button', 'nut-step', { type: 'button' }, [h('span', 'nut-step__n', null, String(i + 1).padStart(2, '0')), h('span', 'nut-step__t', null, s.name), h('span', 'sr-only', null, '')]);
    b.addEventListener('click', () => go(i, false));
    nav.append(h('li', null, null, b));
    return b;
  });
  const panel = h('div', 'nut-panel');
  const pName = h('h4', 'nut-panel__name', { id: 'nut-step-h-' + id, tabindex: '-1' }), pHint = h('p', 'nut-panel__hint');
  const opts = h('div', 'nut-opts');
  const back = h('button', 'pil__btn nut-quiet', { type: 'button' }, tt('nutrition.bowl.back'));
  const next = h('button', 'pil__btn', { type: 'button' }, tt('nutrition.bowl.next'));
  panel.append(h('div', 'nut-panel__head', null, [pName, pHint]), opts, h('div', 'nut-nav', null, [back, next]));
  back.addEventListener('click', () => go(at - 1, true));
  next.addEventListener('click', () => go(at + 1, true));

  const out = h('div', 'nut-out');
  const landed = h('ul', 'nut-landed'), empty = h('p', 'nut-vessel__empty', null, tt('nutrition.bowl.vessel.empty'));
  const vessel = h('div', 'nut-vessel', { 'aria-hidden': 'true' }, [landed, empty]);
  out.append(vessel);
  let odo = null;
  if (priced) {
    const tot = h('div', 'nut-total'), val = h('span', 'nut-total__v');
    if (cur) val.append(h('span', 'nut-total__cur', null, cur));
    const od = h('span'); val.append(od); odo = odometer(od, motion);
    tot.append(h('span', 'nut-total__k', null, tt('nutrition.bowl.total')), val);
    out.append(tot);
  }
  const sum = h('p', 'nut-sum');
  const live = h('p', 'sr-only', { role: 'status', 'aria-live': 'polite' });
  const cta = demo ? h('button', 'pil__btn nut-cta', { type: 'button' }, tt('nutrition.bowl.cta')) : h('a', 'pil__btn nut-cta', { target: '_blank', rel: 'noopener' }, tt('nutrition.bowl.cta'));
  const reset = h('button', 'nut-quiet', { type: 'button', hidden: '' }, tt('nutrition.bowl.reset'));
  const preview = h('p', 'nut-preview', { hidden: '' });
  out.append(sum, cta);
  if (demo) out.append(preview);
  out.append(reset, live);
  flow.append(nav, panel, out);
  box.replaceChildren(flow);

  /* helpers */
  const say = (m) => { live.textContent = ''; setTimeout(() => { live.textContent = m; }, 30); };
  const hint = (s) => (s.pick === 'one' ? tt('nutrition.bowl.hint.one') : (Number.isFinite(s.max) ? tt('nutrition.bowl.hint.max', { n: s.max }) : tt('nutrition.bowl.hint.many'))) + (s.required ? '' : ' · ' + tt('nutrition.bowl.hint.optional'));
  const chosen = () => { const r = []; steps.forEach((s, si) => s.options.forEach((op, oi) => { if (sel[si].includes(op.id)) r.push({ si, oi, s, op }); })); return r; };
  const summaryText = () => {
    const c = chosen();
    if (!c.length) return tt('nutrition.bowl.sum.start', { step: steps[0].name.toLowerCase() });
    const items = c.map((x) => x.op.name).join(', '), miss = steps.find((s, i) => s.required && !sel[i].length);
    return miss ? tt('nutrition.bowl.sum.partial', { items, step: miss.name.toLowerCase() }) : tt('nutrition.bowl.sum.done', { items });
  };
  const waText = () => {
    if (!chosen().length) return tt('nutrition.wa.generic');
    const items = steps.map((s, i) => (sel[i].length ? s.name + ': ' + s.options.filter((op) => sel[i].includes(op.id)).map((op) => op.name).join(' + ') : null)).filter(Boolean).join('; ');
    return tt('nutrition.wa.bowl', { items });
  };

  /* the chip flies from the tapped option into the bowl (transform + opacity, 460 ms, interruptible, none when motion is off) */
  const fly = (btn) => {
    if (!motion() || !btn.animate) return;
    const a = btn.getBoundingClientRect(), b = vessel.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const c = btn.cloneNode(true);
    c.removeAttribute('role'); c.removeAttribute('data-opt'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
    c.classList.add('nut-fly');
    Object.assign(c.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.append(c);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height * 0.5 - (a.top + a.height / 2);
    const an = c.animate([{ transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }, { transform: `translate3d(${dx}px,${dy}px,0) scale(.5)`, opacity: 0 }], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    an.onfinish = an.oncancel = () => c.remove();
  };

  /* reconcile the chips inside the vessel with the selection */
  const syncVessel = () => {
    const want = chosen(), keys = new Set(want.map((x) => x.si + ':' + x.oi)), have = new Map();
    [...landed.children].forEach((li) => { if (li.dataset.leaving) return; if (keys.has(li.dataset.k)) have.set(li.dataset.k, li); else if (motion() && li.animate) { li.dataset.leaving = '1'; li.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.8)' }], { duration: 160, easing: 'ease-out', fill: 'forwards' }).onfinish = () => li.remove(); } else li.remove(); });
    let prev = null;
    want.forEach((x) => {
      const k = x.si + ':' + x.oi; let li = have.get(k);
      if (!li) {
        li = h('li', 'nut-chip', { 'data-k': k }, x.op.name);
        if (prev) prev.after(li); else landed.prepend(li);
        if (motion() && li.animate) li.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, delay: 280, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      }
      prev = li;
    });
    empty.hidden = want.length > 0;
  };
  const syncOpts = () => {
    const s = steps[at];
    [...opts.children].forEach((b, k) => {
      const on = sel[at].includes(b.dataset.opt);
      if (s.pick === 'one') { b.setAttribute('aria-checked', String(on)); b.tabIndex = on || (!sel[at].length && k === 0) ? 0 : -1; }
      else { b.setAttribute('aria-pressed', String(on)); if (!on && sel[at].length >= s.max) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled'); }
    });
    next.dataset.ready = String(sel[at].length > 0);
  };
  const sync = () => {
    syncVessel();
    if (odo) odo.set(fmtNum(base + chosen().reduce((t, x) => t + x.op.price, 0), site));
    sum.textContent = summaryText();
    tabs.forEach((b, i) => { b.toggleAttribute('data-done', sel[i].length > 0); b.lastElementChild.textContent = sel[i].length ? tt('nutrition.bowl.stepDone') : ''; });
    reset.hidden = !chosen().length;
    if (demo) preview.hidden = true; else { const u = waUrl(site, waText()); if (u) cta.href = u; }
  };

  const pick = (si, oid, btn) => {
    const s = steps[si], list = sel[si], i = list.indexOf(oid), name = s.options.find((op) => op.id === oid).name;
    let msg;
    if (i >= 0) { if (s.pick === 'one' && s.required) return; list.splice(i, 1); msg = tt('nutrition.bowl.removed', { name }); }
    else if (s.pick === 'one') { list.length = 0; list.push(oid); fly(btn); msg = tt('nutrition.bowl.added', { name }); }
    else { if (list.length >= s.max) { say(tt('nutrition.bowl.full', { n: s.max })); return; } list.push(oid); fly(btn); msg = tt('nutrition.bowl.added', { name }); }
    syncOpts(); sync(); say(msg + ' ' + summaryText());
  };

  const optBtn = (si, s, op) => {
    const b = h('button', 'nut-opt', { type: 'button', 'data-opt': op.id }, h('span', 'nut-opt__n', null, op.name));
    if (priced) b.append(h('span', 'nut-opt__p', null, op.price > 0 ? '+' + fmtNum(op.price, site) : tt('nutrition.bowl.included')));
    if (s.pick === 'one') b.setAttribute('role', 'radio');
    b.addEventListener('click', () => pick(si, op.id, b));
    return b;
  };
  opts.addEventListener('keydown', (e) => {   // radio pattern: arrows move and select, Home/End jump
    if (steps[at].pick !== 'one') return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d && e.key !== 'Home' && e.key !== 'End') return;
    const bs = [...opts.children], cur0 = bs.indexOf(document.activeElement); if (cur0 < 0) return;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (cur0 + d + bs.length) % bs.length;
    e.preventDefault(); bs[to].focus();
    if (bs[to].getAttribute('aria-checked') !== 'true') bs[to].click();
  });

  function go(i, focusHead, quiet) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    const changed = i !== at || !opts.childElementCount, s = steps[i];
    at = i;
    pName.textContent = s.name; pHint.textContent = hint(s);
    opts.setAttribute('role', s.pick === 'one' ? 'radiogroup' : 'group'); opts.setAttribute('aria-labelledby', pName.id);
    opts.replaceChildren(...s.options.map((op) => optBtn(i, s, op)));
    syncOpts();
    tabs.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    back.hidden = i === 0; next.hidden = i === steps.length - 1;
    if (changed && !quiet && motion() && opts.animate) opts.animate([{ opacity: 0, transform: 'translate3d(14px,0,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    if (focusHead) pName.focus({ preventScroll: true });
    if (!quiet) say(tt('nutrition.bowl.step', { n: i + 1, total: steps.length }) + ': ' + s.name + '. ' + hint(s));
  }

  reset.addEventListener('click', () => { sel.forEach((l) => (l.length = 0)); go(0, false, true); sync(); say(summaryText()); });
  if (demo) cta.addEventListener('click', () => { preview.textContent = (demo.previewLabel || 'Demo only, nothing is sent. This button would open WhatsApp with:') + ' “' + waText() + '”'; preview.hidden = false; });

  go(0, false, true);
  sync();
}

export async function init(ctx) {
  const root = document.getElementById('elite-nutrition'); if (!root) return;
  const tt = (k, v) => { const s = ctx.t(k, v); return s !== k ? s : fill(FB[k] || k, v); };
  pilClip(root.querySelector('[data-clip]'), ctx);
  const wantDemo = new URLSearchParams(location.search).get('demo') === 'bowl';   // review aid only: never the default
  const [menu, site, demoData] = await Promise.all([getJSON('assets/data/menu.json'), getJSON('assets/data/site.json'), wantDemo ? getJSON('assets/data/menu.demo.json') : null]);
  const o = { tt, site: site || {}, ctx, demo: null };
  renderFacts(root, menu, o);
  ask(root.querySelector('[data-bind="ask-dietitian"]'), o, 'nutrition.wa.dietitian');
  const box = root.querySelector('[data-bowl]'); if (!box) return;
  if (wantDemo && demoData && validBowl(demoData.bowl)) { o.demo = demoData; mountFlow(box, demoData.bowl, o); return; }
  if (menu && validBowl(menu.bowl)) { mountFlow(box, menu.bowl, o); return; }
  ask(box.querySelector('[data-bind="ask"]'), o, 'nutrition.wa.bowlAsk');   // bowl is null in menu.json: the honest card stays
}
