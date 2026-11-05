/* whatsapp.js · Version: v3.0 — 2026-10-02 · owner: pricing lane
   Changelog: v3.0 created. Own implementation (nothing from v2.x).
   v3.0 (later, same day): first-viewport rule. At the very top of the page the button steps aside (fades out) only when its resting place would cover the live class card
   (.cls__live or any [data-wa-clear] element); it comes back with the first scroll. On 390x844 nothing is covered, so it stays visible there.
   The always-visible WhatsApp button (#wa-fab): sets the wa.me link with a neutral hello text from assets/data/site.json (whatsapp.number; status stays
   "TO CONFIRM by Raoul before launch") and reveals the button. No number = the button stays hidden (nothing points anywhere wrong). */
import { loadData, waUrl } from './pricing.js';

export async function init(ctx) {
  const a = document.getElementById('wa-fab');
  if (!a) return;
  const { site } = await loadData();
  const hello = document.querySelector('[data-wa-hello]');
  const url = waUrl(site, hello ? hello.textContent.trim() : 'Hello Elite Fit Bali, I have a question about the club.');
  if (!url) return;
  a.href = url;
  a.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => a.classList.add('is-ready')));

  /* ---- first view: do not sit on top of the live class card */
  let raf = 0;
  const clearEls = () => [...document.querySelectorAll('[data-wa-clear], .cls__live')];
  const hit = (f, r) => r.width > 0 && r.height > 0 && !(f.right <= r.left || f.left >= r.right || f.bottom <= r.top || f.top >= r.bottom);
  const check = () => {
    raf = 0;
    let away = false;
    if (window.scrollY < 8 && ctx.phone.matches) {
      const f = a.getBoundingClientRect();
      away = f.width > 0 && clearEls().some((el) => hit(f, el.getBoundingClientRect()));
    }
    a.toggleAttribute('data-away', away);
  };
  const soon = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener('scroll', soon, { passive: true });
  window.addEventListener('resize', soon);
  if (ctx.phone.addEventListener) ctx.phone.addEventListener('change', soon);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(soon); clearEls().forEach((el) => ro.observe(el)); ro.observe(document.documentElement); }
  // the classes lane fills its card after load: look again a few times while the page is still at the top
  [300, 900, 2000].forEach((t) => setTimeout(soon, t));
  soon();
}
