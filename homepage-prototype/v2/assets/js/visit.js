/* visit.js · Version: v3.0 — 2026-10-02 · owner: visit lane
   Changelog: v3.0 created (Phase 2). Visit block: address and map link re-read from assets/data/site.json (the markup carries the same facts so the primary action works without JavaScript),
   WhatsApp link from site.json (status TO CONFIRM stays in the data; no number = the tile stays disabled and is hidden), opening hours per area from assets/data/hours.json with a live
   open/closed readout (timetable.js loadHours/openState, club time WITA), poster set lazily, the entrance loop plays only near the viewport through window.EF.clips (at most 2 on a phone).
   Nothing about hours is typed here. Exports init(ctx). */
import { witaNow, loadHours, openState } from './timetable.js';

const $ = (s, r = document) => r.querySelector(s);
const getJson = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const put = (n, t) => { if (n && n.textContent !== t) n.textContent = t; };      // untouched text means no style or layout work
const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

const EFNS = (window.EF = window.EF || {});
EFNS.clips = EFNS.clips || (() => {            // same helper as the pillar lanes: request(el) -> true when el may play; max 2 on a phone, 4 elsewhere
  const on = new Set(), phone = matchMedia('(max-width: 759px)');
  return { request(e) { if (on.has(e)) return true; if (on.size >= (phone.matches ? 2 : 4)) return false; on.add(e); return true; },
           release(e) { if (on.delete(e)) document.dispatchEvent(new Event('ef-clip-free')); }, count: () => on.size };
})();

function clip(v, ctx) {
  if (!v) return;
  const C = EFNS.clips;
  const near = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { v.poster = v.dataset.poster; near.disconnect(); } }, { rootMargin: '700px 0px' });
  near.observe(v);                                                    // the poster is fetched only when the block is about to come into view
  if (!ctx.motion) return;                                            // reduced motion or data-saver: poster only
  let seen = false;
  const stop = () => { v.pause(); C.release(v); };
  const start = () => { if (document.hidden || !C.request(v)) return; const p = v.play(); if (p && p.catch) p.catch(() => C.release(v)); };
  new IntersectionObserver((es) => { for (const e of es) { seen = e.isIntersecting; seen ? start() : stop(); } }, { rootMargin: '80px 0px', threshold: 0.25 }).observe(v);
  const retry = () => { if (seen && v.paused) start(); };
  document.addEventListener('ef-clip-free', retry);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : retry()));
}

export async function init(ctx) {
  const root = document.getElementById('visit'); if (!root) return;
  const DEF = {};
  const tpl = $('#vis-strings', root);
  if (tpl) tpl.content.querySelectorAll('[data-copy]').forEach((n) => { DEF[n.getAttribute('data-copy')] = n.textContent.trim(); });
  const T = (k, v) => { const s = ctx.t(k, v); return s === k ? fill(DEF[k] != null ? DEF[k] : k, v) : s; };

  clip($('[data-clip]', root), ctx);

  const [site, hours] = await Promise.all([getJson('assets/data/site.json'), loadHours()]);

  /* address, map link, WhatsApp: from the data files */
  const a = site && site.address, num = site && site.whatsapp && site.whatsapp.number;
  if (site && site.club && site.club.area) put($('[data-vis-place]', root), site.club.area);
  if (a && a.line) put($('[data-vis-addr]', root), a.line.replace(/No\. (\d)/, 'No.\u00a0$1'));   // no line break between 'No.' and the number
  const map = $('[data-vis-map]', root);
  if (map && a && a.mapsUrl) map.href = a.mapsUrl;
  const wa = $('[data-vis-wa]', root);
  if (wa) {
    if (num) { wa.href = 'https://wa.me/' + String(num).replace(/\D/g, '') + '?text=' + encodeURIComponent(T('visit.wa_text')); wa.removeAttribute('aria-disabled'); }
    else wa.hidden = true;
  }

  /* opening hours */
  const box = $('.vis__hours', root), rowsEl = $('[data-vis-rows]', root), stateEl = $('[data-vis-state]', root);
  if (!hours || !hours.days) { if (box) box.hidden = true; return; }
  const areas = hours.areas ? Object.values(hours.areas).filter((x) => x && x.days) : [];
  const rows = (areas.length ? areas.map((x) => ({ k: x.label, days: x.days })) : [{ k: '', days: hours.days }]);
  const uniform = (days) => { const v = Object.values(days).map((d) => d.open + '|' + d.close); return v.length === 7 && v.every((x) => x === v[0]); };
  const every = rows.every((r) => uniform(r.days)) && uniform(hours.days);
  const range = (d) => (d && d.close ? (d.open ? d.open + '–' + d.close : '–' + d.close) : null);
  put($('[data-vis-every]', root), T(every ? 'visit.every_day' : 'visit.today'));

  const built = rows.map((r) => {
    const li = el('li', 'vis-h'), k = el('span', 'vis-h__k'), dot = el('i', 'vis-h__dot'), sr = el('span', 'sr-only'), t = el('span', 'vis-h__t');
    dot.setAttribute('aria-hidden', 'true'); k.append(dot, el('span', null, r.k), sr);
    li.append(k, t); return { li, t, sr, r };
  });
  rowsEl.replaceChildren(...built.map((b) => b.li));

  function paint() {
    const now = witaNow();
    for (const b of built) {
      const d = b.r.days[String(every ? 1 : now.dow)], v = range(d);
      if (v && b.t.dataset.v !== v) { const [x, y] = v.split('–'); b.t.dataset.v = v; b.t.replaceChildren(x, el('i', null, '–'), y); }
      const s = openState({ days: b.r.days }, now), st = s.open === true ? 'open' : s.open === false ? 'closed' : '';
      b.li.dataset.state = st; put(b.sr, st ? ', ' + T(st === 'open' ? 'visit.open_now' : 'visit.closed_now') : '');
    }
    const o = openState(hours, now), kEl = $('[data-vis-k]', stateEl), vEl = $('[data-vis-v]', stateEl);
    if (o.open === true) { put(kEl, T('visit.open_now')); put(vEl, T('visit.open_until', { t: o.closes })); stateEl.dataset.state = 'open'; }
    else if (o.open === false) {
      let msg = '';
      if (o.opens) {
        if (now.minutes < toMin(o.opens)) msg = T('visit.opens_at', { t: o.opens });
        else { const nx = hours.days[String((now.dow % 7) + 1)]; if (nx && nx.open) msg = T('visit.opens_tomorrow', { t: nx.open }); }
      }
      put(kEl, T('visit.closed_now')); put(vEl, msg); stateEl.dataset.state = 'closed';
    } else { put(kEl, ''); put(vEl, ''); stateEl.removeAttribute('data-state'); }
  }
  paint();

  /* keep the readout current while the block is on screen (20 s, only text that changed is written) */
  let timer = 0;
  const run = () => { if (!timer) timer = setInterval(() => { if (!document.hidden) paint(); }, 20000); };
  const halt = () => { clearInterval(timer); timer = 0; };
  new IntersectionObserver((es) => { for (const e of es) { if (e.isIntersecting) { paint(); run(); } else halt(); } }, { rootMargin: '200px 0px' }).observe(root);
}
