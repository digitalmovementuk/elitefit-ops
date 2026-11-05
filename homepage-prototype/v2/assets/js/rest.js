/* rest.js · Version: v3.0 — 2026-10-02 · owner: rest lane
   Changelog: v3.0 created. Elite Rest block: shared clip helper (verbatim from _build/pillar-anatomy.md), four-room readout from assets/data/rest.json, opening hours from assets/data/hours.json. Exports init(ctx). */
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

/* ---- Elite Rest only ---- */
import { loadHours } from './timetable.js';

const FB = {  // provisional strings, used only until copy/copy.json carries the key (same text as copy/slots/rest.json)
  'rest.hours.daily': 'Every day, {open}–{close}', 'rest.hours.until': 'Every day until {close}',
  'rest.hours.range': '{days}, {open}–{close}', 'rest.hours.rangeUntil': '{days}, until {close}',
  'rest.readout.sr': '{a} to {b} degrees Celsius', 'rest.readout.srOne': '{a} degrees Celsius',
};
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

/* Four rooms and their temperatures: everything comes from assets/data/rest.json (name, range, unit, fact id). */
async function renderRooms(root, tt) {
  const box = root.querySelector('[data-rest-rooms]'), list = box && box.querySelector('[data-bind="rooms"]'), pin = root.querySelector('[data-rest-pin]');
  if (!box || !list) return;
  const off = () => { box.hidden = true; if (pin) pin.hidden = true; };
  let data;
  try { const r = await fetch('assets/data/rest.json', { cache: 'no-cache' }); if (!r.ok) throw new Error(r.status); data = await r.json(); } catch (e) { return off(); }
  const rooms = (data.rooms || []).filter((r) => Number.isFinite(r.min) && Number.isFinite(r.max));
  if (!rooms.length) return off();
  const lo = data.scale && Number.isFinite(data.scale.min) ? data.scale.min : 0, hi = data.scale && Number.isFinite(data.scale.max) ? data.scale.max : 100;
  const pct = (x) => Math.min(100, Math.max(0, ((x - lo) / (hi - lo)) * 100));
  const items = rooms.map((rm) => {
    const unit = rm.unit || (data.scale && data.scale.unit) || '';
    const one = rm.min === rm.max;
    const li = el('li', 'rest-room'); li.dataset.room = rm.id; if (rm.fact) li.dataset.fact = rm.fact;
    li.appendChild(el('span', 'rest-room__name', rm.name));
    const temp = el('span', 'rest-room__temp');
    temp.appendChild(el('span', 'sr-only', tt(one ? 'rest.readout.srOne' : 'rest.readout.sr', { a: rm.min, b: rm.max })));
    const vis = el('span', 'rest-room__vis'); vis.setAttribute('aria-hidden', 'true');
    const nLo = el('b', null, String(rm.min)); nLo.dataset.count = String(rm.min); vis.appendChild(nLo);
    if (!one) { vis.appendChild(el('span', 'rest-room__dash', '–')); const nHi = el('b', null, String(rm.max)); nHi.dataset.count = String(rm.max); vis.appendChild(nHi); }
    vis.appendChild(el('span', 'rest-room__unit', unit));
    temp.appendChild(vis); li.appendChild(temp);
    const track = el('span', 'rest-room__track'); track.setAttribute('aria-hidden', 'true');
    const bar = el('span', 'rest-room__range');
    bar.style.setProperty('--a', pct(rm.min).toFixed(2)); bar.style.setProperty('--w', Math.max((pct(rm.max) - pct(rm.min)) / 100, 0.02).toFixed(4));
    track.appendChild(bar); li.appendChild(track);
    return li;
  });
  list.replaceChildren(...items);
  if (pin) {   // pinned phone box: the same rooms in one compact row (CSS shows it under 760 px only); decorative twin of the list, so aria-hidden in the partial
    pin.style.setProperty('--rest-n', rooms.length);
    pin.replaceChildren(...rooms.map((rm) => {
      const c = el('div', 'rest-pin__cell'); c.dataset.room = rm.id; if (rm.fact) c.dataset.fact = rm.fact;
      c.appendChild(el('span', 'rest-pin__k', rm.short || rm.name));
      const v = el('span', 'rest-pin__v', rm.min === rm.max ? String(rm.min) : rm.min + '–' + rm.max);
      v.appendChild(el('span', 'rest-pin__u', rm.unit || (data.scale && data.scale.unit) || '')); c.appendChild(v); return c;
    }));
    markCurrent(items, [...pin.children]);
  }
}

/* The room row nearest the middle of the screen marks its cell in the pinned box (and its own bar); nothing is marked while the list is off screen. */
function markCurrent(rows, cells) {
  if (!('IntersectionObserver' in window)) return;
  const live = new Set();
  const io = new IntersectionObserver((es) => {
    for (const e of es) (e.isIntersecting ? live.add(e.target) : live.delete(e.target));
    const mid = innerHeight * 0.45; let best = null, bd = 1e9;
    live.forEach((n) => { const r = n.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = n; } });
    rows.forEach((r, i) => { const on = r === best; r.classList.toggle('is-current', on); if (cells[i]) cells[i].classList.toggle('is-current', on); });
  }, { rootMargin: '-40% 0px -50% 0px' });
  rows.forEach((r) => io.observe(r));
}

/* Recharge opening hours from assets/data/hours.json (areas.recharge, falls back to days; written by the facts lane), grouped by consecutive days with equal hours. */
const dayName = (d) => new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, d)));  // 2024-01-01 is a Monday
function hoursLine(h, tt) {
  const days = (h && h.areas && h.areas.recharge && h.areas.recharge.days) || (h && h.days); if (!days) return '';   // the Recharge side has its own hours (F-HRS-02)
  const g = [];
  for (let d = 1; d <= 7; d++) {
    const x = days[String(d)]; if (!x || !x.close) continue;
    const last = g[g.length - 1];
    if (last && last.end === d - 1 && last.open === (x.open || null) && last.close === x.close) last.end = d; else g.push({ start: d, end: d, open: x.open || null, close: x.close });
  }
  if (!g.length) return '';
  const all = g.length === 1 && g[0].start === 1 && g[0].end === 7;
  return g.map((r) => {
    const v = { open: r.open, close: r.close, days: r.start === r.end ? dayName(r.start) : dayName(r.start) + '–' + dayName(r.end) };
    return tt(all ? (r.open ? 'rest.hours.daily' : 'rest.hours.until') : (r.open ? 'rest.hours.range' : 'rest.hours.rangeUntil'), v);
  }).join('; ');
}
async function renderHours(root, tt) {
  const out = root.querySelector('[data-bind="hours"]'); if (!out) return;
  const h = await loadHours();
  const line = hoursLine(h, tt);
  if (line) out.textContent = line; else { const row = out.closest('.pil__fact'); if (row) row.hidden = true; }
}

export function init(ctx) {
  const root = document.getElementById('elite-rest'); if (!root) return;
  const tt = (k, v) => { const s = ctx.t(k, v); return s !== k ? s : fill(FB[k] || k, v); };
  pilClip(root.querySelector('[data-clip]'), ctx);
  renderRooms(root, tt);
  renderHours(root, tt);
}
