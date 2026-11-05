/* classes.js · Version: v3.3 — 2026-10-02 · owner: classes lane · own engine (nothing from v2.x)
   Changelog: v3.3 round instructor portraits on the live card and every row (assets/img/coach-<id>.webp, 192 px, monogram when none). v3.0 created. Day tabs (roving tabindex, arrows, Home/End) with a sliding indicator driven by one CSS variable, rows that arrive with a stagger
   when the day changes, live now/next block with a real ticking countdown, empty and error states.
   Data: assets/data/schedule.club.json via the shared helpers in timetable.js (read-only). Coach names: assets/data/coaches.json when the facts lane has written it,
   else the timetable's own `trainer` field. Static strings: <template id="cls-strings"> in the partial (so build.mjs swaps copy), ctx.t when present.
   Events on #classes: ef:classes:render {dow, animated} after each panel render, ef:classes:nownext {state} when the now/next state changes. */
import { witaNow, loadTimetable, nowNext, clock } from './timetable.js';

const pad = (n) => String(n).padStart(2, '0');
const h = (tag, cls, kids) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const k of [].concat(kids == null ? [] : kids)) e.append(k);
  return e;
};
/** 125 -> '00:02:05' (always H:MM:SS so the readout never changes width) */
const fmt = (secs) => { const p = clock(secs).split(':'); if (p.length === 2) p.unshift('0'); return p.map((x) => x.padStart(2, '0')).join(':'); };

/** coaches.json is the facts lane's file; its schema is read tolerantly: an array (or {coaches|trainers: [...]}) of objects with a display `name`
 *  and any of timetable / published / key / id / slug / alias(es), or an object keyed by the timetable spelling. Result: lowercase key -> display name. */
function coachMap(j) {
  const m = new Map();
  if (!j || typeof j !== 'object') return m;
  const list = Array.isArray(j) ? j : Array.isArray(j.coaches) ? j.coaches : Array.isArray(j.trainers) ? j.trainers : null;
  const put = (k, v) => { if (typeof k === 'string' && k && typeof v === 'string' && v) m.set(k.trim().toLowerCase(), v.trim()); };
  if (list) {
    for (const c of list) {
      if (!c || typeof c !== 'object') continue;
      const name = c.display || c.displayName || c.name || c.firstName;
      for (const k of [c.timetable, c.timetableName, c.published, c.trainerPublished, c.key, c.id, c.slug, c.firstName, c.name].concat(c.aliases || c.alias || [])) put(k, name);
    }
  } else {
    for (const [k, v] of Object.entries(j)) { if (typeof v === 'string') put(k, v); else if (v && typeof v === 'object') put(k, v.display || v.displayName || v.name); }
  }
  return m;
}
const loadCoaches = () => fetch('assets/data/coaches.json').then((r) => (r.ok ? r.json() : null)).then(coachMap).catch(() => new Map());

/** instructor portraits the club's own media gave us (assets/img/coach-<id>.webp, id = lowercase display name); any other name gets a monogram */
const PORTRAIT = new Set(['rey', 'ain', 'icha', 'tinos']);
const coachId = (name) => String(name).toLowerCase().replace(/[^a-z]/g, '');
const mono = (el, name) => { el.classList.add('cls__av--mono'); el.replaceChildren(String(name).trim().charAt(0).toUpperCase()); };
/** fills a .cls__av with the round portrait (decorative: the name is printed next to it); lazy = rows below the first view */
function fillAvatar(el, name, lazy) {
  const id = coachId(name);
  el.classList.remove('cls__av--mono');
  el.dataset.coach = id;
  if (!PORTRAIT.has(id)) { mono(el, name); return; }
  const img = new Image();
  img.alt = ''; img.width = 192; img.height = 192; img.decoding = 'async';
  if (lazy) img.loading = 'lazy';
  img.addEventListener('error', () => mono(el, name), { once: true });
  img.src = 'assets/img/coach-' + id + '.webp';
  el.replaceChildren(img);
}

export async function init(ctx) {
  const root = document.getElementById('classes');
  if (!root) return;
  const q = (s) => root.querySelector(s);
  const tabsEl = q('.cls__tabs'), tabs = [...tabsEl.querySelectorAll('.cls__tab')];
  const panel = q('#cls-panel'), listEl = q('[data-role="list"]'), metaEl = q('.cls__daymeta');
  const dayEl = q('[data-role="day"]'), todayEl = q('[data-role="today"]'), countEl = q('[data-role="count"]');
  const emptyEl = q('[data-role="empty"]'), noteEl = q('[data-role="note"]');
  const live = q('.cls__live'), lv = (r) => live.querySelector(`[data-role="${r}"]`);

  /* strings: the template carries the (build-swapped) copy; ctx.t wins when it knows the key */
  const base = {};
  const tpl = q('#cls-strings');
  if (tpl) tpl.content.querySelectorAll('[data-copy]').forEach((e) => { base[e.dataset.copy] = e.textContent; });
  const S = (key, vars) => {
    let s = ctx.t(key);
    if (s === key) s = base[key] != null ? base[key] : key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  };
  const dayName = (dow) => S('classes.day-long-' + dow);

  let model, coaches = new Map();
  try { [model, coaches] = await Promise.all([loadTimetable(), loadCoaches()]); } catch (e) { model = null; }
  if (!model) {
    live.dataset.state = 'none'; lv('clock').textContent = '--:--:--';
    panel.dataset.state = 'error'; emptyEl.hidden = false; emptyEl.textContent = S('classes.error');
    return;
  }
  const coach = (name) => coaches.get(String(name).trim().toLowerCase()) || name;
  const coachLine = (c) => S('classes.with', { coach: coach(c.trainer) });

  let sel = 0, lastKey = '', cur = { nn: null, now: null };

  /* ---------- day tabs ---------- */
  const markToday = (dow) => tabs.forEach((t, i) => {
    const on = i + 1 === dow, n = (model.days[i + 1] || []).length;
    if (on) t.setAttribute('data-today', ''); else t.removeAttribute('data-today');
    const count = n === 1 ? S('classes.count-one') : S('classes.count-many', { n });
    t.setAttribute('aria-label', S(on ? 'classes.tab-aria-today' : 'classes.tab-aria', { day: dayName(i + 1), count }));
  });
  tabs.forEach((t, i) => { t.querySelector('.cls__tab-n').textContent = (model.days[i + 1] || []).length; });

  function select(dow, o = {}) {
    const idx = dow - 1;
    tabs.forEach((t, i) => { t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); t.tabIndex = i === idx ? 0 : -1; });
    tabsEl.style.setProperty('--cls-i', idx);
    tabsEl.setAttribute('data-set', '');
    panel.setAttribute('aria-labelledby', 'cls-tab-' + dow);
    if (o.focus) tabs[idx].focus();
    if (dow !== sel) { sel = dow; renderPanel(dow, !!o.animate); }
  }
  tabsEl.addEventListener('click', (e) => { const t = e.target.closest('.cls__tab'); if (t) select(+t.dataset.dow, { animate: ctx.motion }); });
  tabsEl.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = e.key === 'ArrowRight' ? (i + 1) % 7 : e.key === 'ArrowLeft' ? (i + 6) % 7 : e.key === 'Home' ? 0 : e.key === 'End' ? 6 : -1;
    if (n < 0) return;
    e.preventDefault();
    select(n + 1, { focus: true, animate: ctx.motion });
  });

  /* ---------- rows ---------- */
  const stateOf = (c, dow) => {
    const { nn, now } = cur;
    if (nn && nn.live && nn.live.id === c.id) return 'now';
    if (nn && nn.next && nn.next.id === c.id && !(now && dow === now.dow && c.endMin <= now.minutes)) return 'next';
    return now && dow === now.dow && c.endMin <= now.minutes ? 'past' : '';
  };
  function setState(li, st) {
    if (li.dataset.state === st) return;
    li.dataset.state = st;
    li.querySelector('.cls__tag').textContent = st === 'now' ? S('classes.state-now') : st === 'next' ? S('classes.state-next') : '';
    li.querySelector('.cls__sr-state').textContent = st === 'past' ? S('classes.state-past') + '. ' : '';
  }
  const row = (c, i, dow) => {
    const av = h('span', 'cls__av'); av.setAttribute('aria-hidden', 'true'); fillAvatar(av, coach(c.trainer), true);
    const li = h('li', 'cls__row', [
      h('div', 'cls__t', [
        h('span', 'cls__t-a', [h('span', 'sr-only cls__sr-state'), c.start]),
        h('span', 'cls__t-b', [h('span', 'sr-only', S('classes.range-sr') + ' '), c.end]),
        h('span', 'cls__tag'),
      ]),
      av,
      h('div', 'cls__c', [h('p', 'cls__name', c.title), h('p', 'cls__coach', coachLine(c))]),
    ]);
    li.style.setProperty('--i', Math.min(i, 7));
    li.dataset.id = c.id;
    setState(li, stateOf(c, dow));
    return li;
  };
  const firstClassAfter = (dow) => {
    for (let o = 1; o <= 7; o++) { const d = ((dow - 1 + o) % 7) + 1; if ((model.days[d] || []).length) return model.days[d][0]; }
    return null;
  };

  function renderPanel(dow, animate) {
    const rows = model.days[dow] || [];
    dayEl.textContent = dayName(dow);
    const isToday = cur.now && cur.now.dow === dow;
    todayEl.hidden = !isToday; todayEl.textContent = isToday ? S('classes.today') : '';
    countEl.textContent = rows.length === 1 ? S('classes.count-one') : S('classes.count-many', { n: rows.length });
    listEl.replaceChildren(...rows.map((c, i) => row(c, i, dow)));
    if (animate) { listEl.setAttribute('data-anim', ''); metaEl.removeAttribute('data-anim'); void metaEl.offsetWidth; metaEl.setAttribute('data-anim', ''); }
    else { listEl.removeAttribute('data-anim'); metaEl.removeAttribute('data-anim'); }
    emptyEl.hidden = rows.length > 0;
    if (!rows.length) {
      const n = firstClassAfter(dow);
      emptyEl.textContent = S('classes.empty-day', { day: dayName(dow) }) + (n ? ' ' + S('classes.empty-next', { name: n.title, day: dayName(n.dow), time: n.start }) : '');
    }
    noteEl.hidden = !(dow === 6 || dow === 7);   /* Sat + Sun are a standing pattern, weekend classes run on set dates */
    panel.dataset.state = 'ready';
    root.dispatchEvent(new CustomEvent('ef:classes:render', { detail: { dow, animated: animate } }));
  }

  /* ---------- live now / next ---------- */
  const when = (nn) => (nn.nextDayOffset === 0 ? S('classes.when-today', { time: nn.next.start })
    : S('classes.when-day', { day: nn.nextDayOffset === 1 ? S('classes.tomorrow') : dayName(nn.next.dow), time: nn.next.start }));
  function renderLive(nn, now, animate) {
    const L = nn.live, N = nn.next, cls = L || N;
    const state = L ? 'live' : N ? 'next' : 'none';
    live.dataset.state = state;
    const dayLabel = N && nn.nextDayOffset ? (nn.nextDayOffset === 1 ? S('classes.tomorrow') : dayName(N.dow)) : '';
    lv('label').textContent = L ? S('classes.live-now') : !N ? '' : nn.nextDayOffset ? S('classes.live-next-day', { day: dayLabel }) : S('classes.live-next');
    lv('name').textContent = cls ? cls.title : '';
    lv('time').textContent = cls ? cls.start + '–' + cls.end : '';
    lv('coach').textContent = cls ? coachLine(cls) : '';
    const av = lv('av'), who = cls ? coach(cls.trainer) : '';
    if (cls && av.dataset.coach !== coachId(who)) fillAvatar(av, who, false);
    let then = '';
    if (L && N) then = S('classes.live-then', { when: when(nn), name: N.title, coach: coach(N.trainer) });
    else if (!L && N && nn.nextDayOffset) then = S(nn.classesToday ? 'classes.live-done' : 'classes.live-none-today');
    lv('then').textContent = then;
    if (animate && ctx.motion) { live.removeAttribute('data-swap'); void live.offsetWidth; live.setAttribute('data-swap', ''); }
    root.dispatchEvent(new CustomEvent('ef:classes:nownext', { detail: { state } }));
  }
  function readout(nn, now) {
    const clockEl = lv('clock');
    let secs = null, p = 0;
    if (nn.live) { const len = (nn.live.endMin - nn.live.startMin) * 60; secs = nn.live.endMin * 60 - now.secs; p = Math.min(1, Math.max(0, 1 - secs / len)); }
    else if (nn.next) secs = nn.secsToNext;
    const txt = secs == null ? '--:--:--' : fmt(secs);
    if (clockEl.textContent !== txt) clockEl.textContent = txt;
    lv('bar').style.setProperty('--cls-p', p.toFixed(4));
  }

  /* ---------- the tick: one timer, aligned to the second, only while the section is on screen ---------- */
  let timer = 0, visible = false;
  function tick() {
    timer = 0;
    const now = witaNow(), nn = nowNext(model, now);
    const key = [now.dow, nn.live && nn.live.id, nn.next && nn.next.id, nn.nextDayOffset].join('|');
    if (key !== lastKey) {
      const first = lastKey === '';
      const dayChanged = !cur.now || cur.now.dow !== now.dow;
      lastKey = key; cur = { nn, now };
      renderLive(nn, now, !first);
      if (dayChanged) markToday(now.dow);
      if (!first) {
        [...listEl.children].forEach((li) => { const c = (model.days[sel] || []).find((x) => x.id === li.dataset.id); if (c) setState(li, stateOf(c, sel)); });
        todayEl.hidden = sel !== now.dow; todayEl.textContent = sel === now.dow ? S('classes.today') : '';
      }
    }
    cur = { nn, now };
    readout(nn, now);
    arm();
  }
  function arm() { if (!timer && visible && !document.hidden) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 15); }
  function disarm() { clearTimeout(timer); timer = 0; }

  /* first render (today, no stagger: the rows are part of the page, they do not "arrive") */
  const now0 = witaNow();
  cur = { nn: nowNext(model, now0), now: now0 };
  markToday(now0.dow);
  select(now0.dow, { animate: false });
  tick();
  requestAnimationFrame(() => requestAnimationFrame(() => tabsEl.setAttribute('data-anim', '')));
  /* announce later changes of now/next politely, but not the first fill at page load */
  setTimeout(() => { const m = q('.cls__live-main'); m.setAttribute('aria-live', 'polite'); m.setAttribute('aria-atomic', 'true'); }, 1500);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { root.setAttribute('data-visible', ''); disarm(); tick(); } else { root.removeAttribute('data-visible'); disarm(); }
    }, { rootMargin: '160px 0px' }).observe(root);
  } else { visible = true; arm(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) disarm(); else if (visible) { disarm(); tick(); } });
}
