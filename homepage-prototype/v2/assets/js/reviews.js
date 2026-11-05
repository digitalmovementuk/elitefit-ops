/* reviews.js · Version: v3.0 — 2026-10-02 · owner: reviews lane (Phase 2) · contract: export function init(ctx)
   Changelog: v3.0 created. Fills the Reviews section (#reviews) from data; the partial holds no quote, number or name.
   Data: assets/data/reviews.json (rating, count, url: the same file the hero and the pricing section read) and assets/data/reviews.verified.json (the verbatim quotes FACTS section 14 marks eligible).
   Eligibility, the hero's rule plus the FACTS list: a quote shows only if stars === 5, verified !== false, origin === 'google', and, where reviews.json holds the same author, that text (ignoring a trailing
   ellipsis) is the start of ours. Nothing else is ever shown; if nothing qualifies the list disappears and the section keeps its heading and the Google link.
   Motion: none of its own. The numerals carry data-count (their text IS the value), so the motion layer rolls them; the five <li> are filled in place so a reveal hook on the list keeps working. */
const MAX = 5;                                    // brief: 4 to 5 quotes at most (the partial has five placeholders)
const $ = (s, r = document) => r.querySelector(s);
const J = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const stars = (cls, label, f) => { const s = h('span', cls); if (label) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', label); } else s.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) { const x = document.createElement('i'); if (f) x.style.setProperty('--f', f(i)); s.append(x); } return s; };

/** the hero's rule (5 stars, not flagged unverified) + the FACTS list (Google-labelled, full text); reviews.json may hold a trimmed copy of the same quote */
const eligible = (q, club) => {
  if (!q || q.stars !== 5 || q.verified === false || q.origin !== 'google' || !q.text || !q.author) return false;
  const c = ((club && club.reviews) || []).find((r) => r.author === q.author);
  if (!c) return true;
  if (c.stars !== 5 || c.verified === false) return false;
  return q.text.startsWith(String(c.text || '').replace(/[…\s.]+$/, ''));
};

export async function init(ctx) {
  const root = $('#reviews'), grid = root && $('[data-rvw]', root); if (!grid) return;
  const lex = (k, v) => { const el = $('[data-lex="' + k + '"]', root); return el ? fill(el.textContent.trim(), v || {}) : ''; };
  const [club, ver] = await Promise.all([J('assets/data/reviews.json'), J('assets/data/reviews.verified.json')]);

  // rating, count and the club's Google link: reviews.json
  const rating = club && Number.isFinite(club.rating) && club.rating > 0 && club.rating <= 5 ? club.rating : null;
  const count = club && Number.isInteger(club.count) && club.count > 0 ? club.count : null;
  const score = $('[data-rvw-score]', root), cnt = $('[data-rvw-count]', root);
  if (rating != null) {
    const t = rating.toFixed(1); score.textContent = t; score.dataset.count = t;
    const st = $('[data-rvw-stars]', root); [...st.children].forEach((i, n) => i.style.setProperty('--f', Math.max(0, Math.min(1, rating - n)).toFixed(2)));
  }
  if (count != null) { const t = String(count); cnt.textContent = t; cnt.dataset.count = t; }
  if (rating == null) score.closest('.rvw__r').hidden = true;        // no number from the data: no placeholder left on the page
  if (count == null) cnt.closest('.rvw__r').hidden = true;
  if (rating == null && count == null) $('.rvw__read', root).hidden = true;
  const link = $('[data-rvw-link]', root);
  if (club && typeof club.url === 'string' && /^https:\/\//.test(club.url)) link.href = club.url;

  // quotes
  const list = $('[data-rvw-list]', root), slots = [...list.children];
  const quotes = ((ver && ver.quotes) || []).filter((q) => eligible(q, club)).slice(0, MAX);
  slots.forEach((li, i) => {
    const q = quotes[i];
    if (!q) { li.remove(); return; }
    const fig = h('figure', 'rvw__fig'), bq = h('blockquote', 'rvw__q'), by = h('figcaption', 'rvw__by'), meta = h('span', 'rvw__meta');
    bq.append(h('p', 'rvw__t', q.text));
    meta.append(stars('rvw__st', lex('stars_aria', { n: q.stars })), h('span', 'rvw__src', lex('src_google')));
    by.append(h('span', 'rvw__name', q.author), meta);
    fig.append(bq, by);
    li.replaceChildren(fig); li.classList.remove('is-sk'); li.removeAttribute('aria-hidden'); if (q.fact) li.dataset.fact = q.fact;
  });
  list.setAttribute('aria-busy', 'false');
  grid.dataset.state = quotes.length ? 'ready' : 'empty';
}
