/* Shared time and timetable helpers · Version: v3.0 — 2026-10-02 · owner: orchestrator (hero and classes both import this; neither edits it, ask for changes via _build/requests/)
   Changelog: v3.0 created.
   Club time = WITA (Asia/Makassar, UTC+8, no daylight saving). All results are computed from the club's own timetable file and hours file. */
export const TZ = 'Asia/Makassar';
const OFFSET_MS = 8 * 3600 * 1000;
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const pad = (n) => String(n).padStart(2, '0');

/** Club-local "now": { dow 1..7 (Mon=1), h, m, s, minutes (since midnight), secs, hhmm 'HH:MM', hhmmss, iso date 'YYYY-MM-DD' } */
export function witaNow(d = new Date()) {
  const x = new Date(d.getTime() + OFFSET_MS);
  const h = x.getUTCHours(), m = x.getUTCMinutes(), s = x.getUTCSeconds();
  const dow = x.getUTCDay() === 0 ? 7 : x.getUTCDay();
  return { dow, h, m, s, minutes: h * 60 + m, secs: (h * 60 + m) * 60 + s, hhmm: pad(h) + ':' + pad(m), hhmmss: pad(h) + ':' + pad(m) + ':' + pad(s),
    date: x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate()) };
}

let _model;
/** Loads assets/data/schedule.club.json and returns { days: {1..7: [class]}, total, raw }. class = { id, dow, start, end, startMin, endMin, title, trainer, source } */
export function loadTimetable(url = 'assets/data/schedule.club.json') {
  if (_model) return _model;
  _model = fetch(url).then((r) => r.json()).then((j) => {
    const days = {}; let total = 0;
    for (let i = 1; i <= 7; i++) days[i] = [];
    for (const d of j.template) {
      days[d.dow] = d.classes.map((c) => ({ id: c.id, dow: d.dow, start: c.start, end: c.end, startMin: toMin(c.start), endMin: toMin(c.end), title: c.title, trainer: c.trainer, source: c._source }))
        .sort((a, b) => a.startMin - b.startMin);
      total += d.classes.length;
    }
    return { days, total, raw: j };
  });
  return _model;
}

/** Live and next class. Next rolls over to the following days when today is done. Returns
 * { live, next, nextDayOffset (0 = today), secsToNext, classesToday, classesLeftToday } */
export function nowNext(model, now = witaNow()) {
  const today = model.days[now.dow] || [];
  const live = today.find((c) => c.startMin <= now.minutes && now.minutes < c.endMin) || null;
  let next = today.find((c) => c.startMin > now.minutes) || null, off = 0;
  if (!next) {
    for (off = 1; off <= 7 && !next; off++) { const dd = model.days[((now.dow - 1 + off) % 7) + 1]; if (dd && dd.length) next = dd[0]; }
    off -= 1;
  }
  const secsToNext = next ? off * 86400 + next.startMin * 60 - now.secs : null;
  return { live, next, nextDayOffset: next ? off : null, secsToNext, classesToday: today.length, classesLeftToday: today.filter((c) => c.startMin > now.minutes).length + (live ? 1 : 0) };
}

/** 3725 -> '1:02:05'; 125 -> '2:05' */
export function clock(secs) {
  secs = Math.max(0, Math.floor(secs));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return h ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
}

let _hours;
/** assets/data/hours.json (written by the facts lane; schema: { days: { "1": { open: "HH:MM"|null, close: "HH:MM" } ... }, source, sourceUrl, status }). Resolves null when absent. */
export function loadHours(url = 'assets/data/hours.json') {
  return _hours || (_hours = fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null));
}
/** { open: true|false|null (null = opening time unknown), closes: 'HH:MM'|null, opens: 'HH:MM'|null } */
export function openState(hours, now = witaNow()) {
  const d = hours && hours.days && hours.days[String(now.dow)];
  if (!d) return { open: null, closes: null, opens: null };
  const close = d.close ? toMin(d.close) : null, open = d.open ? toMin(d.open) : null;
  if (close == null) return { open: null, closes: null, opens: d.open || null };
  if (open == null) return { open: now.minutes < close ? null : false, closes: d.close, opens: null };
  return { open: now.minutes >= open && now.minutes < close, closes: d.close, opens: d.open };
}
