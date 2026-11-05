/* buybar.js · Version: v3.0 — 2026-10-02 · owner: pricing lane
   Changelog: v3.0 created. Own implementation (nothing from v2.x).
   Sticky buy bar (phones only, < 760 px). Content from assets/data/passes.json: the cheapest day pass and its tier name.
   Opens after the hero has left the screen, closes while #pricing (or a footer, when it exists) is on screen. State: #buybar[data-state], html[data-buybar] (the WhatsApp button lifts on it).
   "Buy a pass" jumps to #pricing and highlights the destination: window.EF.highlight(el) when the hero lane provides it (its global anchor handler then does the jump), else this module's own jump + the pricing section's fallback highlight (class .prc-hl). */
import { loadData, fmt, lex } from './pricing.js';

export async function init(ctx) {
  const bar = document.getElementById('buybar');
  if (!bar) return;
  const root = document.documentElement;
  const { passes, site } = await loadData();
  if (!passes || !passes.tiers) { root.dataset.buybar = 'closed'; return; }

  // cheapest day pass, from data (never hard-coded): the shortest length is the one with 1 day
  const dayLen = (passes.lengths || []).find((l) => l.days === 1) || (passes.lengths || [])[0];
  let best = null;
  for (const t of passes.tiers) {
    const p = t.prices && t.prices[dayLen.id];
    if (p != null && (!best || p < best.price)) best = { tier: t, price: p };
  }
  if (!best) { root.dataset.buybar = 'closed'; return; }
  bar.querySelector('[data-buy-label]').textContent = lex(bar, 'buy_label', { tier: best.tier.name });
  bar.querySelector('[data-buy-cur]').textContent = (site.numberFormat && site.numberFormat.currency) || 'IDR';
  bar.querySelector('[data-buy-price]').textContent = fmt(best.price, site);

  /* ---- when to show: phone + hero left the screen + pricing not on screen + no footer on screen */
  let heroGone = false, pricingOn = false, footerOn = false;
  const set = (open) => {
    const was = bar.dataset.state === 'open';
    if (open === was && root.dataset.buybar) return;
    bar.dataset.state = open ? 'open' : 'closed';
    bar.inert = !open;
    root.dataset.buybar = open ? 'open' : 'closed';
  };
  const update = () => set(ctx.phone.matches && heroGone && !pricingOn && !footerOn);
  update();

  // the bar waits for the hero's own Buy a pass button to leave the screen (so two never show at once); falls back to the hero section
  const heroEl = ['[data-buybar-after]', '#hero-cta', '[data-hero-cta]', '.hero [href="#pricing"]', '[data-sec="hero"]', '#hero', '.hero'].map((q) => document.querySelector(q)).find(Boolean) || null;
  const pricingEl = document.getElementById('pricing');
  const footerEl = document.querySelector('[data-sec="footer"], footer.ftr, #footer');
  if ('IntersectionObserver' in window) {
    if (heroEl) new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting && e.boundingClientRect.bottom <= 0; update(); }).observe(heroEl);
    else { // no hero in the page yet: open after the first screen
      const onScroll = () => { heroGone = window.scrollY > window.innerHeight * 0.66; update(); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    if (pricingEl) new IntersectionObserver(([e]) => { pricingOn = e.isIntersecting; update(); }).observe(pricingEl);
    if (footerEl) new IntersectionObserver(([e]) => { footerOn = e.isIntersecting; update(); }).observe(footerEl);
  }
  if (ctx.phone.addEventListener) ctx.phone.addEventListener('change', update);

  /* ---- Buy a pass: jump to #pricing, then highlight the destination */
  const go = bar.querySelector('[data-buy-go]');
  go.addEventListener('click', (e) => {
    if (!pricingEl) return;
    if (window.EF && typeof window.EF.highlight === 'function') return;   // the hero lane's global anchor handler jumps and highlights (hero.js); this is the fallback
    e.preventDefault();
    const keyboard = e.detail === 0;
    pricingEl.scrollIntoView({ behavior: ctx.motion ? 'smooth' : 'auto', block: 'start' });
    try { history.replaceState(null, '', '#pricing'); } catch (_) { /* file:// or sandbox */ }
    afterScroll(() => {
      highlight(pricingEl);
      if (keyboard) { const hd = document.getElementById('pricing-h'); if (hd) { hd.tabIndex = -1; hd.focus({ preventScroll: true }); } }
    });
  });
}

/** Calls fn once scrolling has stopped (scrollend where supported, else when the position stayed put for 140 ms; gives up after 1.6 s). */
function afterScroll(fn) {
  let done = false, last = -1, still = 0;
  const fin = () => { if (done) return; done = true; window.removeEventListener('scrollend', fin); fn(); };
  window.addEventListener('scrollend', fin, { once: true });
  const t0 = performance.now();
  const tick = () => {
    if (done) return;
    const y = window.scrollY;
    still = Math.abs(y - last) < 0.5 ? still + 1 : 0; last = y;
    if (still >= 8 || performance.now() - t0 > 1600) fin(); else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function highlight(el) {
  if (window.EF && typeof window.EF.highlight === 'function') { window.EF.highlight(el); return; }
  el.classList.remove('prc-hl'); void el.offsetWidth; el.classList.add('prc-hl');
  setTimeout(() => el.classList.remove('prc-hl'), 1400);
}
