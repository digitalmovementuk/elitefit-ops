/* homepage-v3 boot · Version: v3.0 — 2026-10-02 · owner: orchestrator
   Changelog: v3.0 created.
   Loads lane modules. Each lane module exports init(ctx). The hero module loads first (first view); every other module loads after the
   load event, in idle time, so the first view carries the least JavaScript. A module that is missing or throws is logged and skipped. */
const copyEl = document.getElementById('ef-copy');
const COPY = copyEl ? JSON.parse(copyEl.textContent || '{}') : {};
/** t('key', {n: 5}) -> copy string with {n} filled; returns the key itself when the copy is missing (visible in the live tab). */
export const t = (key, vars) => {
  let s = COPY[key];
  if (s == null) return key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
};
const mq = (q) => window.matchMedia(q);
const reduced = mq('(prefers-reduced-motion: reduce)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);
export const ctx = {
  t, copy: COPY, reduced, saveData,
  motion: !reduced && !saveData,
  phone: mq('(max-width: 759px)'),   // MediaQueryList, use .matches
  root: document.documentElement,
};
ctx.root.classList.add(ctx.motion ? 'motion-ok' : 'motion-off');

const FIRST = ['hero'];
const LATER = ['classes', 'nutrition', 'training', 'rest', 'coaches', 'reviews', 'visit', 'footer', 'pricing', 'buybar', 'whatsapp', 'menu', 'checkout', 'motion'];
async function load(name) {
  try {
    const m = await import(`./${name}.js`);
    if (m && typeof m.init === 'function') await m.init(ctx);
  } catch (e) { console.warn('[ef] module "' + name + '" skipped:', e && e.message); }
}
const idle = window.requestIdleCallback ? (f) => window.requestIdleCallback(f, { timeout: 600 }) : (f) => setTimeout(f, 120);
const boot = () => {
  Promise.all(FIRST.map(load)).then(() => {
    const go = () => LATER.forEach(load);
    if (document.readyState === 'complete') idle(go); else window.addEventListener('load', () => idle(go), { once: true });
  });
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
