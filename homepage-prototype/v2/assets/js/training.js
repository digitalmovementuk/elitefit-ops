/* training.js · Version: v3.0 — 2026-10-02 · owner: training lane
   Changelog: v3.0 created. Clip behaviour (shared block, verbatim from _build/pillar-anatomy.md) + data binding for the Elite Training list:
   coaches from assets/data/coaches.json, opening hours from assets/data/hours.json, class count from the timetable. No fact is typed here. Contract: export function init(ctx). */
import { loadHours, loadTimetable, openState, witaNow } from './timetable.js';

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

/* ---- lane: data binding ---- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fill = (s, vars) => { if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k])); return s; };

/** Group Mon..Sun by identical open/close. Returns [{ label: 'Mon–Fri', open, close }] in week order. */
function groupHours(hours) {
  const rows = [];
  for (let i = 1; i <= 7; i++) {
    const d = hours.days && hours.days[String(i)];
    if (!d || !d.close) continue;
    const key = (d.open || '') + '|' + d.close, last = rows[rows.length - 1];
    if (last && last.key === key && last.to === i - 1) last.to = i; else rows.push({ key, from: i, to: i, open: d.open || null, close: d.close });
  }
  return rows.map((r) => ({ label: r.from === r.to ? DAYS[r.from - 1] : DAYS[r.from - 1] + '–' + DAYS[r.to - 1], open: r.open, close: r.close, all: r.from === 1 && r.to === 7 }));
}

function renderHours(root, hours, tr) {
  const el = root.querySelector('[data-bind="hours"]'), live = root.querySelector('[data-bind="open"]');
  if (!el || !hours || !hours.days) return;
  const groups = groupHours(hours);
  if (!groups.length) return;
  const range = (g) => (g.open ? g.open + '–' + g.close : null);
  if (groups.length === 1) {
    const g = groups[0];
    el.textContent = g.open
      ? tr(g.all ? 'training.hours.daily' : 'training.hours.range', 'Every day, {open}–{close}', { open: g.open, close: g.close, days: g.label })
      : tr('training.hours.until', 'Open every day until {close}', { close: g.close });
  } else {
    el.textContent = '';
    for (const g of groups) {
      const row = document.createElement('span'); row.className = 'trn-hrow';
      const b = document.createElement('b'); b.textContent = g.label;
      row.append(b, document.createTextNode(range(g) || tr('training.hours.until.short', 'until {close}', { close: g.close })));
      el.append(row);
    }
  }
  if (live) {
    const st = openState(hours, witaNow());
    if (st.open === true) { live.dataset.open = 'true'; live.textContent = tr('training.hours.open', 'Open now, until {close}', { close: st.closes }); live.hidden = false; }
    else if (st.open === false) { live.dataset.open = 'false'; live.textContent = st.opens ? tr('training.hours.closed', 'Closed now, opens {open}', { open: st.opens }) : tr('training.hours.closed.plain', 'Closed now'); live.hidden = false; }
  }
}

function renderCoaches(root, data) {
  const ul = root.querySelector('[data-bind="coaches"]');
  const list = Array.isArray(data) ? data : data && (data.coaches || data.trainers || data.items);
  if (!ul || !Array.isArray(list) || !list.length) return;
  const shown = list.filter((c) => c && c.onTimetable !== false);   // coaches who teach a class on the timetable (F-COA-01); others only when a role is confirmed
  if (!shown.length) return;
  ul.textContent = '';
  for (const c of shown) {
    const name = typeof c === 'string' ? c : (c.display || c.name || c.firstName);
    if (!name) continue;
    const li = document.createElement('li'); li.textContent = name; ul.append(li);
  }
}

const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);

export async function init(ctx) {
  const root = document.getElementById('elite-training');
  if (!root) return;
  const tr = (key, fallback, vars) => { const s = ctx.t(key, vars); return s === key ? fill(fallback, vars) : s; };
  pilClip(root.querySelector('[data-clip]'), ctx);
  const [hours, coaches, model] = await Promise.all([loadHours(), getJSON('assets/data/coaches.json'), loadTimetable().catch(() => null)]);
  renderHours(root, hours, tr);
  renderCoaches(root, coaches);
  const n = root.querySelector('[data-bind="class-count"]');
  if (n && model && model.total) n.textContent = String(model.total);
}
