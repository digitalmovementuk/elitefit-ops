/* coaches.js · Version: v3.0 — 2026-10-02 · owner: coaches lane
   Changelog: v3.0 created. Renders the Coaches section: one native <details> per coach (portrait, name, class count; opened: role line, weekly classes by day, link per day).
   Data (read-only, nothing retyped): the real timetable via timetable.js (schedule.club.json), names and role lines from coaches.json, portrait list and switches from coaches-section.json.
   A coach with no class in the timetable is never shown (Putu, FACTS F-COA-07). A day row is a link to #classes: it first selects that day's tab of the Classes section (a click on #cls-tab-N),
   then the hero's global anchor handler does the jump and the highlight (with no JS the plain #classes anchor still works). Weekday names, "Today" and the weekend note are read from the classes lane's
   copy keys (classes.day-short-N, classes.day-long-N, classes.today, classes.weekend-note), so there is one wording; weekday names fall back to Intl.
   Strings of its own: <template id="crc-strings"> in the partial. Event on #coaches: ef:coaches:render {n}. Budget: <= 4 KB gzip. */
import { witaNow, loadTimetable } from './timetable.js';

const json = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const h = (tag, cls, kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...[].concat(kids == null ? [] : kids).filter((k) => k != null));
  return e;
};
const key = (s) => String(s == null ? '' : s).trim().toLowerCase();
const ARROW = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>';

export async function init(ctx) {
  const root = document.getElementById('coaches');
  const list = root && root.querySelector('[data-role="list"]');
  if (!list) return;

  /* strings: the template carries the (build-swapped) copy; ctx.t wins when it knows the key */
  const base = {}, tpl = root.querySelector('#crc-strings');
  if (tpl) tpl.content.querySelectorAll('[data-copy]').forEach((e) => { base[e.dataset.copy] = e.textContent; });
  const S = (k, v) => {
    let s = ctx.t(k);
    if (s === k) s = base[k] != null ? base[k] : k;
    for (const n in v || {}) s = s.split('{' + n + '}').join(v[n]);
    return s;
  };
  const R = (k) => { const s = ctx.t(k); return s === k ? '' : s; };   // a classes-lane key, read-only; '' when the copy lacks it
  const day = (d, long) => R('classes.day-' + (long ? 'long-' : 'short-') + d)
    || new Intl.DateTimeFormat('en', { weekday: long ? 'long' : 'short', timeZone: 'UTC' }).format(Date.UTC(2024, 0, d));   // 2024-01-01 is a Monday

  const fail = () => {
    list.hidden = true; list.removeAttribute('aria-busy');
    const m = root.querySelector('[data-role="msg"]'); if (m) m.hidden = false;
  };
  const [model, people, cfg] = await Promise.all([loadTimetable().catch(() => null), json('assets/data/coaches.json'), json('assets/data/coaches-section.json')]);
  if (!model) return fail();
  const C = cfg || {};

  /* the week per coach, straight from the timetable: trainer -> { days: Map(dow -> [class]), n } */
  const week = new Map();
  for (let d = 1; d <= 7; d++) {
    for (const c of model.days[d] || []) {
      const k = key(c.trainer); if (!k) continue;
      let w = week.get(k); if (!w) week.set(k, (w = { name: String(c.trainer).trim(), days: new Map(), n: 0 }));
      if (!w.days.has(d)) w.days.set(d, []);
      w.days.get(d).push(c); w.n++;
    }
  }
  /* order and display names from coaches.json; anyone teaching in the timetable but missing there is appended; anyone not teaching is never shown */
  const out = [];
  for (const p of Array.isArray(people) ? people : []) {
    const w = week.get(key(p.display)) || week.get(key(p.published));
    if (w && !out.includes(w)) { w.name = p.display || w.name; w.role = p.role; out.push(w); }
  }
  for (const w of week.values()) if (!out.includes(w)) out.push(w);
  if (!out.length) return fail();

  const now = witaNow(), tod = R('classes.today'), weekend = R('classes.weekend-note');
  const rows = out.map((w) => {
    const id = key(w.name).replace(/[^a-z]/g, '');

    const av = h('span', 'crc__av'); av.setAttribute('aria-hidden', 'true');
    const mono = () => { av.classList.add('crc__av--mono'); av.replaceChildren(w.name.charAt(0).toUpperCase()); };
    if ((C.portraits || []).includes(id)) {
      const img = new Image();
      img.alt = ''; img.width = img.height = 128; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', mono, { once: true });
      img.src = 'assets/img/coach-' + id + '.webp';
      av.append(img);
    } else mono();

    const tile = h('span', 'crc__tile'); tile.setAttribute('aria-hidden', 'true');
    const sum = h('summary', 'crc__s', [av, h('h3', 'crc__name', w.name), h('span', 'crc__meta', w.n === 1 ? S('coaches.count-one') : S('coaches.count-many', { n: w.n })), tile]);

    const days = h('ol', 'crc__days', [...w.days].sort((a, b) => a[0] - b[0]).map(([d, cs]) => {
      const arr = h('span', 'crc__arr'); arr.innerHTML = ARROW;
      const a = h('a', 'crc__day', [
        h('span', 'crc__d', [day(d), d === now.dow && tod ? h('i', 'crc__now', tod) : null]),
        h('span', 'crc__ls', cs.map((c) => h('span', 'crc__l', [h('b', '', c.start), h('span', '', c.title)]))),
        arr,
        h('span', 'sr-only', S('coaches.go-sr', { day: day(d, 1) })),
      ]);
      a.href = '#classes'; a.dataset.dow = d;
      return h('li', d === now.dow ? 'is-today' : '', a);
    }));
    const role = w.role && (C.roleLines || []).includes(id) ? h('p', 'crc__role', w.role) : null;
    const note = weekend && (w.days.has(6) || w.days.has(7)) ? h('p', 'crc__note', weekend) : null;

    const d = h('details', 'crc__c', [sum, h('div', 'crc__body', [role, days, note])]);
    d.setAttribute('name', 'crc');   // one open at a time where the browser supports exclusive groups
    if (C.facts && C.facts[id]) d.dataset.fact = C.facts[id];
    return h('li', 'crc__li', d);
  });
  list.replaceChildren(...rows);
  list.removeAttribute('aria-busy');

  /* a day row opens the Classes section on that day: select its tab first, the global anchor handler then jumps */
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-dow]'), t = a && document.getElementById('cls-tab-' + a.dataset.dow);
    if (t) t.click();
  });
  root.dispatchEvent(new CustomEvent('ef:coaches:render', { detail: { n: rows.length } }));
}
