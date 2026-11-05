/* footer.js · Version: v3.0 — 2026-10-02 · owner: footer lane · loads after `load` in idle time (main.js), no first-view cost
   Changelog: v3.0 created (Phase 2). Fills the footer from the data files and keeps it honest:
   - section links whose target id is not in the page are hidden (so the footer never points at a section that is not built);
   - address + map link + WhatsApp link from assets/data/site.json (the number's status "TO CONFIRM" stays in the data; no number = no WhatsApp button),
     hours + open state from assets/data/hours.json through the shared helpers in timetable.js (club time, Asia/Makassar);
   - the year after the club name; the open state refreshes every 30 s while the footer is near the screen.
   The blocks that are filled here have their final height reserved in footer.css, so nothing moves when the data arrives. Nothing is hard-coded: strings are data-copy slots
   (the ones JS needs sit in <template id="ftr-strings">), URLs and numbers come from the data files or the partial. */
import { witaNow, loadHours, openState } from './timetable.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const getJson = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const fill = (s, v) => { if (v) for (const k in v) s = s.split('{' + k + '}').join(String(v[k])); return s; };

export async function init(ctx) {
  const root = document.getElementById('footer');
  if (!root) return;
  const DEF = {};
  const tpl = $('#ftr-strings', root);
  if (tpl) $$('[data-copy]', tpl.content).forEach((el) => { DEF[el.getAttribute('data-copy')] = el.textContent.trim(); });
  const T = (k, v) => { const s = ctx.t(k, v); return s === k ? fill(DEF[k] != null ? DEF[k] : k, v) : s; };

  // 1. links: only to ids that exist in the page
  $$('[data-ftr-link]', root).forEach((a) => { if (!document.getElementById(a.getAttribute('href').slice(1))) a.closest('li').hidden = true; });

  // 2. year after the club name (club time)
  const yr = $('[data-ftr-year]', root);
  if (yr) yr.textContent = String(witaNow().date.slice(0, 4));

  // 3. data
  const [site, hours] = await Promise.all([getJson('assets/data/site.json'), loadHours()]);
  const addr = $('[data-ftr-addr]', root), a = site && site.address;
  if (addr) {
    if (a && a.line && a.mapsUrl) { $('[data-ftr-addr-t]', addr).textContent = a.line; addr.href = a.mapsUrl; } else addr.hidden = true;
  }
  const wa = $('[data-ftr-wa]', root), num = site && site.whatsapp && site.whatsapp.number;
  if (wa) {
    if (num) wa.href = 'https://wa.me/' + String(num).replace(/\D/g, '') + '?text=' + encodeURIComponent(T('footer.wa_text')); else wa.hidden = true;
  }

  const box = $('[data-ftr-hours]', root), dl = $('[data-ftr-dl]', root), st = $('[data-ftr-state]', root);
  const range = (d) => (d && d.open && d.close ? d.open + '–' + d.close : null);
  const same = (days) => { const v = Object.values(days || {}).map((d) => d.open + '|' + d.close); return v.length === 7 && v.every((x) => x === v[0]); };
  function paintHours() {
    if (!box) return;
    if (!hours || !hours.days) { box.hidden = true; return; }
    const now = witaNow();
    const areas = hours.areas ? Object.values(hours.areas).filter((x) => x && x.days) : [];
    const rows = areas.length ? areas.map((x) => ({ k: x.label, days: x.days })) : [{ k: null, days: hours.days }];
    const every = rows.every((r) => same(r.days));
    dl.textContent = '';
    rows.forEach((r) => {
      const v = range(every ? r.days['1'] : r.days[String(now.dow)]); if (!v) return;
      const row = document.createElement('div');
      if (r.k) { const dt = document.createElement('dt'); dt.textContent = r.k; row.appendChild(dt); }
      const dd = document.createElement('dd'); dd.textContent = v; row.appendChild(dd); dl.appendChild(row);
    });
    if (dl.children.length) {
      const note = document.createElement('p'); note.className = 'ftr__note'; note.textContent = T(every ? 'footer.hours_every_day' : 'footer.hours_today');
      box.appendChild(note);
    }
    paintState(); box.hidden = !dl.children.length;
  }
  function paintState() {
    if (!st) return;
    const o = openState(hours, witaNow()), k = $('[data-ftr-state-k]', st), v = $('[data-ftr-state-v]', st);
    if (o.open === true) { k.textContent = T('footer.open_now'); v.textContent = T('footer.open_until', { t: o.closes }); st.dataset.state = 'open'; }
    else if (o.open === false) { k.textContent = T('footer.closed_now'); v.textContent = o.opens ? T('footer.opens_at', { t: o.opens }) : ''; st.dataset.state = 'closed'; }
    else { st.hidden = true; }
  }
  paintHours();
  root.dataset.ready = '1';

  // 4. keep the open state right while the footer is near the screen
  if ('IntersectionObserver' in window && hours) {
    let timer = 0;
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) { paintState(); timer = setInterval(() => { if (!document.hidden) paintState(); }, 30000); }
    }, { rootMargin: '200px 0px' }).observe(root);
  }
}
