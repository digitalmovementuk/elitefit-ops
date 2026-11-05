# engine-v2: the shared booking engine

**Version 1.2.2, 30 Oct 2026.** The shared engine for the group-fitness concepts. It is the Home v2 two-step booking sheet, forked from `variants/s3-home-v2/assets/js/` (final sheet, 28–29 Oct 2026) and made concept-agnostic. Version 1.1 adds the class finder (step 0) from `upgrade/FINDER-SPEC.md` v1.1. Each concept switches its script tags here and writes its own CSS skin.

| Version | Date | Change |
| --- | --- | --- |
| 1.2.2 | 30 Oct 2026 | Layout gate A, pass 2 (visual audit; RULINGS #57). CSS only in `sheet-base.css`; the API, the markup and the hooks are unchanged.
- **Field labels:** `#sheet .field > label` and `> .label` are at least 14 px (`max(14px, var(--field-label-size, .875rem))`). Form labels are content under #57. Loud's skin set them to 13 px (`sheet-v2.css`); that is lifted to 14 px. A skin that wants larger sets `--field-label-size` on its own label rule: Warm and Tactile set `1rem`, so they render as before. Glossy (14 px) is unchanged. Ensemble (s1-stage, 16 px, no token) now shows 14 px.
- **Pay title:** the pay step's title text is "Pay for your\u00a0" + "booking" (`T.payDemoH` in `booking.js`, a no-break space), so "your booking" travels together and "booking" is never alone on the last line (Glossy at 390: "Pay for your / booking" is now "Pay for / your booking"; the same at 360 and 1440 in Glossy, Warm, Ensemble and the demo). Only the break moves; the line count and the heights stay. `text-wrap: balance` was tried first and does not decide this split: "Pay for your" and "your booking" are the same width, so the browsers pick different breaks (WebKit keeps 3 + 1).
- **Upfront (variants/s3-home-v2a, frozen, RULINGS #56) is not affected:** it loads its own `assets/css/sheet.css`, `assets/js/api.js` and `assets/js/booking.js`, never the engine's `sheet-base.css`, `api.js` or `booking.js`, so none of this reaches it. Checked with a page load and the sheet opened: the only `engine-v2/` requests are the four coach avatars in `engine-v2/img/r/` (RULINGS #53 and #56), which this change does not touch.
- `EF.engine.version` and `EF.booking.version` read "1.2.2". Archive of the 1.2.1 files: `ef-gf/upgrade/engine-archive/1.2.1-pre-gate2/`. |
| 1.2.1 | 29 Oct 2026 | Faces, stock label, hidden text, observers. The API is backward compatible; new keys are optional.
- **Faces (HARD, RULINGS #46):**
  - New optional `thumb_pos` per `nextup_media` item: the finder thumbnail's object-position, falling back to `pos`. `pos` stays for other uses such as cards.
  - Face-safe defaults in the shared data, measured with YuNet every 0.1 s over every frame plus the poster:
    - conditioning "92% 50%" (safe band 75–100 %)
    - sculpt "6% 50%" (safe 0–16 %)
    - boxing still: any position
    - boxing still "100% 50%": a no-people crop (glove and forearm). At 50 % the shoulder at the top edge read as a cut head at 64×48 (visual audit ENG-1).
    - stock mobility clip "50% 2%" (portrait; safe at y 0–20 % with ≥8 px headroom above the estimated head top)
  - New `qa/faces.js` (geometry from the handover faces gate) checks the finder thumbnails and Next-up cards on the demo and the four finder concepts at 390 and 1440.
- **Faces check:** `qa/faces.js` refreshes its media list from the pages and runs YuNet only on new files (`--only-new`). Class thumbnails also need ≥8 px headroom above the estimated head top. Every thumbnail is saved as an element screenshot for review by eye, because YuNet can miss a head cut at the edge.
- **Sample chip:** `#sheet .sample` has a 12 px floor (RULINGS #41 meta, visual audit ENG-2); a skin can raise it with `--sample-size`.
- **Close during submit:** if the sheet is closed, or has moved on, while a booking is sending, it no longer reopens; the booking stands and a toast confirms it.
- **Confirm under a long press:** leaving a field restores the full foot, which moves Confirm. While a pointer is pressed in the sheet, that restore now waits until after the click. Before, a press longer than 80 ms could land its release next to the moved button, and the booking was lost (seen on Home v2, 2 of 6 runs; Home v2's own engine has the same flaw).
- **Faces rule:** the faces check applies RULINGS #51 (whole head inside with ≥8 px clear to every edge, every frame and the poster) to the finder thumbnails and the Next-up cards.
- **Stock label:** an overlay `nextup_media` item's `stock: true` is kept, so the "Stock clip" label shows on the By class header.
- **Hidden text:** the engine's hidden-text class is `.ef-vh`. Every engine element also keeps `vh`. `sheet-base.css` styles only `.ef-vh`, so a page's own `.vh` is never restyled.
- **Now bar:** its geometry comes from an IntersectionObserver entry, re-armed by a ResizeObserver. There is no layout read in a scroll handler.
- **QA:**
  - `qa/finder.js` takes `PAGE=<path under groupfitness-prototype/>` and reads the store key, the sticky bar, class entries and the axe row from the page. A hook the page lacks gives N/A instead of FAIL. Colour contrast in a page's own skin is listed as `skinOwned`.
  - `qa/concepts.js` covers Home v2 (`ef-gf-v2`). |
| 1.2 | 29 Oct 2026 | Small fixes; the API, classes and hooks are unchanged.
- Copy: the step 0 "By class" sub line reads "Boxing, HYROX, Sculpt, Mobility".
- Step 2 strip: a compact one-line string, "Thu 8:30 · Rey · Drop-in" (24-hour time, the pass short name: Drop-in, Duo, Member, Perform, Elite, Waitlist; "Plan" while a membership tier is still to pick, because "Membership" overflows 360 px by 5 to 25 px). It fits 360 px at the 14 px floor beside "Change". The full detail (class, coach, long date, time, the pass and its price) is in the visually hidden part of the title, `[data-strip-sr]`.
- Focus: after a booking re-renders the page, Esc or Close returns focus to the same control in the same `[data-occ]` row (matched by testid, then by class), so the row's Book rather than its tap area.
- Handover QA cards (owner orchestrator, engine-v2):
  - axe `label-content-name-mismatch` (WCAG 2.5.3): the finder controls (mode tiles, the shortcut, rows, chips, class rows, day tabs) and step 1's "other time" chips carry no `aria-label`. Their name comes from their content, visible text first, with the extra detail as visually hidden text after it. "Last used" is now readable. The Sample chip inside a control is `aria-hidden`.
  - Confirmed within RULINGS #24 for Duo and membership: the Booking row reads "Duo day pass" (was "…, for two") and "Perform membership" / "Elite membership", and the separate "Your … membership starts …" line is gone (the When row has the date; step 2 says the membership starts with this class). Measured: drop-in 56, Duo 57, membership 56, membership on the longest class name 57 words (body + foot), ≤38 by the handover's count; 24 elements, 1 control.
- The drop-in tile has no `aria-label` either. Its name is its visible text, "Class drop-in, 300K, Most chosen" (P10 order). The "Most chosen" pill is readable now and comes last in the tile's DOM; it is absolutely positioned on the top edge, so nothing moves on screen.
- Demo page skin only: the terracotta buttons' white labels are 19 px / 800 (large text, so 3.73:1 passes AA), as Home v2's buttons. #1B1B1B on #E94A2B measures 4.49:1, just short of 4.5.
- QA: `finder.js` runs axe (handover tags) on every finder screen, step 1, step 2 and Confirmed at 390 and 1440. Under `SKIN=home`, colour contrast is listed as `skinOwned` (Home v2's sheet.css) and doesn't fail the run.
- `EF.engine.version` and `EF.booking.version` read "1.2". |
| 1.1 | 29 Oct 2026 | The class finder (RULINGS #30, #36, #37, #38, #40, #41; FINDER-SPEC v1.1):
- Screens: step 0 (By day, By class, Show week, the Next-class shortcut), By day, By class (all 10 classes, then that class's times) and Show week, then the existing step 1.
- Entries: the engine owns `[data-book-next]`, `[data-use-pass]` and `[data-duo-start]`. Price buttons and the Duo offer open the finder with the pass kept and land on step 2.
- Step attributes: `data-step` is now the logical step (`0`, `1`, `2`, `pay`, `done`), with `data-step-pos`, `data-entry`, `data-finder` and `data-pass`.
- Accessibility: one `[data-sheet-live]` region; the step label loses `aria-live`; the title gets the ", step N of M" SR suffix; focus goes back to the control that led forward.
- Core finder CSS and `--find-*` tokens (7.9). The Now bar (`[data-nowbar]`) is inert under the phone sheet, and the desktop panel starts below it.
- Data: payload `finder_mode`; overlay `finder.lines`, `finder.template` and `nextup_media` (`media/`).
- Focus returns one frame after close. |
| 1.0 | 29 Oct 2026 | First release. Forked from Home v2's `booking.js` and `api.js`. Added config (store key, overlay, step numerals), paths resolved from the engine's own URL, `data-step`/`data-steps`, the `{join}`/`prefJoin` aliases and RULINGS #27 (all four tiles in view). Added the RULINGS #30 finder slot (`EF.booking.openFinder()`, `step0` numbering) and ported RULINGS #29 (no visitor flag). Also: shared data, `sheet-base.css`, a demo page and QA. |

Owner: the engine-v2 builder. Concepts never edit this folder; send change requests to the orchestrator.

## 1. Files

| File | What it is |
| --- | --- |
| `api.js` | `EF.api`: data, clock, week, occurrences, Sample spots, passes, store, booking record, payload, .ics. Also `EF.engine` (config). |
| `booking.js` | `EF.sheet` (the dialog), `EF.booking` (the journey), `EF.seats`, `EF.toast`. |
| `sheet-base.css` | Structure and behaviour only: layout mechanics, keyboard (`--kb`, `--vvh`), `.is-typing`, `.is-compact`, hidden states. No colours, fonts, radii, shadows or motion. |
| `data/v2.json` | Shared overlay: club (rating 4.7 / 497 / 2026-10-28), passes order, payload meta, Sample capacities, coach lines (Sample), reviews (hero cuts ≤12 words, sheet reviews with full verbatim text and `review_id`), srcset for the sheet photos. |
| `img/r/` | Responsive coach portraits and avatars (copied from Home v2) used by the srcset. |
| `qa/faces.js`, `qa/faces-collect.js`, `qa/faces01.json`, `qa/faces_build01.py`, `qa/faces-media.json` | The faces check (1.2.1): YuNet face boxes at 0.1 s, the handover gate's geometry. |
| `media/` | The finder's By class header media: real club stills and clips for Boxing, Conditioning and Sculpt (copied from Home v2's Next-up media; sources in `data/v2.json`). Mobility & Stretch uses the v1 family clip, labelled "Stock clip". |
| `demo/` | Test page with a neutral skin (`index.html`, `skin.css`, `demo-page.css`, `demo.js`). `?skin=home` uses Home v2's own skin; `?numerals=1` turns on step numerals. |
| `qa/` | `flows.js`, `sheetfix.js`, `reviews.js`, `finder.js`, `concepts.js`, `lib.js`; results in `qa/results/`. |

## 2. Include it

Script tags in this order, all `defer`. The concept's own scripts stay where they are.

```html
<link rel="stylesheet" href="../../engine-v2/sheet-base.css">   <!-- BEFORE your skin -->
<link rel="stylesheet" href="assets/css/sheet.css">              <!-- your skin -->
...
<script src="../../engine-v2/api.js" data-store-key="ef-gf-v3-s5" defer></script>
<script src="assets/js/paths.js" defer></script>        <!-- optional now: the engine already resolves media paths -->
<script src="assets/js/motion.js" defer></script>
<script src="assets/js/media.js" defer></script>
<script src="../../engine-v2/booking.js" defer></script>
<script src="assets/js/page.js" defer></script>
```

For `v1/` the paths are `../engine-v2/…`.

### Config

Set config as `data-*` on the `api.js` tag, or as `window.EF_ENGINE = {…}` in an inline script before it. If both give a key, the tag wins. `booking.js` also reads `data-step-numerals` on its own tag.

| Key (JS / attribute) | Default | What it does |
| --- | --- | --- |
| `storeKey` / `data-store-key` | `ef-gf-v3` | The localStorage key. Always set it (section 6). Allowed: letters, digits, `_ . : -`, ≤64 characters. |
| `overlay` / `data-overlay` | `data/v2.json` | The overlay URL(s), relative to the engine folder. Several URLs separated by spaces or commas are merged in order over the shared data (overlay wins; objects merge, arrays replace). A concept overlay goes after the engine's: `data-overlay="data/v2.json ../variants/s5-panels/assets/data/extra.json"`. |
| `data` / `data-data` | `../v1/assets/data/groupfitness.json` | The shared v1 data, relative to the engine folder. |
| `bookNext` / (JS only) | on | `false` stops the engine from binding `[data-book-next]`, `[data-use-pass]` and `[data-duo-start]`. Leave it on: the finder depends on it. |
| `stepNumerals` / `data-step-numerals` | off | When on, the step label also gets a hidden `<span data-step-numeral hidden>01 / 03</span>`, built from `data-step-pos` / `data-steps`. Old label parsers (`/(\d+)\D+(\d+)/`) keep working. It is never shown or read out. `"false"`, `"0"`, `"off"` and `"no"` mean off. |

**Paths.** Every path is resolved from the engine script's own URL (`document.currentScript.src`), never from the page.
- The v1 media paths in the shared data (`families[].video/poster`, `coaches[].photo/avatar`, `classes[].video`) become absolute URLs under `v1/`. Concept path fixers (`base.js`, `paths.js`, `bridge.js`) then match nothing, so they are harmless and can stay or go.
- Each overlay's `srcset` paths resolve against that overlay file, so the coach portraits load from every concept folder. This is the s1/s2 desktop 404.

## 3. Markup the engine needs

Use the concepts' current sheet skeleton unchanged:

```html
<div class="page" id="page">…</div>
<div class="…" data-buybar aria-hidden="true">…</div>
<div class="sheet" id="sheet" hidden>
  <div class="sheet__scrim" data-sheet-close></div>
  <div class="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1" data-testid="sheet">
    <div class="sheet__bar">
      <span class="sheet__handle" aria-hidden="true"></span>
      <button class="iconbtn" type="button" data-sheet-back data-testid="sheet-back" aria-label="Back">…</button>
      <p class="sheet__step" data-sheet-step aria-live="polite"></p>
      <button class="iconbtn" type="button" data-sheet-close data-testid="sheet-close" aria-label="Close">…</button>
    </div>
    <div class="sheet__progress" data-sheet-progress aria-hidden="true">…</div>   <!-- optional; the engine hides it -->
    <div class="sheet__body" data-sheet-body></div>
    <div class="sheet__foot" data-sheet-foot></div>
  </div>
</div>
<p class="toast" data-toast role="status" aria-live="polite" hidden></p>
```

- The engine also reads `#schedule` (or `#week`) as the focus fallback, and `[data-testid="hero-book"]` as the last-resort focus target.
- `#page` and `[data-buybar]` get `inert` and `aria-hidden` while the phone sheet is open. So does a Now bar marked `[data-nowbar]` when it sits outside `#page`.
- **Now bar (RULINGS #31, #38):** put `data-nowbar` on the bar's root. On desktop the engine sets `--sheet-top` (the bar's bottom edge), and the panel gets that as `margin-top`, so it starts below the sticky bar. The bar opens a class with `EF.booking.open(nextOcc.id, { src: 'nowbar' })`, never the finder.
- The engine adds a visually hidden `[data-sheet-live]` (`role="status"`) to the panel if the markup has none, and removes `aria-live` from `[data-sheet-step]` (FINDER-SPEC 6.1).

## 4. JS API

**`EF.engine`**: `{ name: 'engine-v2', version: '1.2.1', storeKey, base, url(rel), config }`. `version` is the runtime version; `EF.booking.version` reads the same.

**`EF.booking`**
- `open(idOrOccId, opts)`: class-specific entry (rows, cards, the Now bar). It opens step 1 for that class, or the next session of a class id. Options:
  - `{pass}`: `'duo'`, `'class-1'`, `'member'`, `'membership'`, `'perform-4w'`, `'elite-4w'`. Opens step 1, then step 2 with that pass (the Duo shortcut). Back returns to step 1.
  - `{join}`: alias of `pass` (section 7).
  - `{src}`: source tag for the payload.
  - `{swap}`: swap in place.
  - On the desktop panel, opening another class swaps it in place and keeps the details.
- `openFinder({src, pass, mode, ymd, cls})`: **the class finder** (RULINGS #30).
  - It opens step 0. With `mode` (`day`, `class`, `week`) it pushes step 0 underneath, then that screen; with `cls` it also pushes that class's times. Back walks up.
  - `pass` (`class-1`, `duo`, `membership`) makes it a pass journey (RULINGS #36).
  - It returns `false` while the sheet is already open.
  - **You don't call it for the standard buttons: the engine binds them** (section 9).
- `finderMode()`: the remembered mode (`day`, `class`, `week`) or `null`.
- `openCoach(id)`: the coach view.
- `draft()`, `DEFAULT_PAY` (always `null`), `version`.

**`EF.sheet`**
- `register(kind, factory)`. The factory returns `{label, mode, testid, tall, noBack, render(body, foot)}`. The v1 form `{label, progress, testid, render}` still works (`progress` is ignored).
- `open(kind, params, url)`, `replace(…)`, `back()`, `close()`, `update()` (re-render, v1 parity).
- `isOpen()`, `isPanel()` (open as the desktop non-modal panel), `kind()`, `params()`.
- `step()` returns `{step, steps, pos, entry, finder}` or `null`.
- `live(text)` announces through `[data-sheet-live]`.

**`EF.api`**
- Data: `load()` (a Promise; the data is merged and its paths resolved before it resolves), `data`.
- Clock: `now()` (`?now=2026-10-28T07:30` pins Bali time), `nowParam`, `wita(ms)`.
- Timetable: `week()` (7 days, today first; each `occs[]` entry has `start`, `end`, `capacity`, `spotsLeft`, `full`, `past`, `booking`, `coach`, `family`), `occ(idOrClassId)`, `occById(occId)`, `parseOccId()`, `upcoming(n)`, `nextOfClass(classId, {n, skip, open})`, `nextChip()`.
- Lookups: `cls(id)`, `coach(id)`, `family(id)`, `classesInFamily(fid)`, `slots(classId)`, `weeklyCount()`, `coachWeekly(id)`, `coachOccs(id)`.
- Passes: `passes()`, `capacity(classId)` (Sample capacity per class), `passInfo(id)`, `passName(id)`, `payLine(booking)`.
- Formatting: `k()`, `idr()`, `time12()`, `dateShort()`, `dateLong()`, `firstName()`.
- Phone: `parsePhone()`, `e164()`, `phoneOk()`, `maskPhone()`.
- Store and contact: `store.get()`, `store.set(patch)`, `store.persistent()`, `contact.get()`, `contact.set()`, `contact.forget()`.
- Booking: `book(flow)`, `bookingFor(occId)`, `payload()`, `submit()` (local only; `ENDPOINT` is `null`), `lastPayload()`, `reset()`, `icsText()`, `downloadIcs()`.

**`EF.seats`**: `html(free, cap, opts)` and `label(free)` (`'N spots free'`, `'1 spot free'`, `'Full · Join waitlist'`). Screen readers hear "N of C spots free".

**`EF.toast(text)`**.

**Your page provides:** `EF.schedule.show({ymd, family, focusList})`, used by "Pick another time".

### Events (on `document`)

| Event | Detail |
| --- | --- |
| `ef:sheet` | `{open, kind, occId, panel}`, on every show and hide |
| `ef:booked` | `{booking, occ}` |
| `ef:pass` | `{pass}` |
| `ef:pay` | `{pay}` |
| `ef:member` | `{occId}` |
| `ef:ics` | `{ref}` |
| `ef:share` | `{ref}` |
| `ef:finder` | `{screen, mode, src, pass}`, on each finder screen (`screen`: `mode`, `day`, `class`, `sessions`, `week`) |
| `ef:finder-mode` | `{mode, last}`, a mode tile tap |
| `ef:finder-day` | `{ymd, count}`, a day change on By day |
| `ef:finder-class` | `{classId, count}`, a class row tap on By class |
| `ef:finder-pick` | `{mode, occId, via, pass}`, hand-over to step 1 (`via`: `row`, `chip`, `shortcut`, `page`) |
| `ef:forget` | `{}` |
| `ef:reset` | `{}` |

## 5. Hooks and states a skin styles

**On `#sheet`:**
- `hidden`, `.is-open`, `.is-panel` (desktop non-modal), `.sheet--tall`, `.has-kb` (keyboard up on phones), `.is-typing` (a sheet field has focus).
- `data-kind` (`class`, `details`, `pay`, `done`, `coach`, `filters`, …).
- `data-mode` (`step1`, `step2`, `pay`, `done`, `coach`, empty).
- Step attributes (FINDER-SPEC 6.3). None of them is set on coach, filters or missing views; all are removed on close. **Changed in 1.1:** `data-step` is the logical step, so render numerals from `data-step-pos` / `data-steps`.
  - `data-step`, the logical step: `0` on every finder screen, then `1`, `2`, `pay`, `done`.
  - `data-steps`: `3` in a finder journey, `2` in a class or pass journey.
  - `data-step-pos`, 1-based and removed on `pay` and `done`:
    - finder journey: finder 1, step 1 = 2, step 2 = 3
    - class journey: 1, 2
    - pass journey: finder 1, steps 1 and 2 = 2
  - `data-entry`: `finder`, `class` or `pass`.
  - `data-finder`: `mode`, `day`, `class`, `sessions` or `week`.
  - `data-pass`: the pass in a pass journey.
- Custom properties: `--kb`, `--vvh`.

**On `<html>`:** `.has-panel` (desktop panel open; your page makes room, e.g. `margin-right: calc(min(540px, 42vw) + 24px)`) and `.sheet-open` (phone sheet open, scroll locked).

**The finder (FINDER-SPEC v1.1 section 7.9, the skinning contract):**
- The engine ships the structure (semantic HTML, stable classes, the core CSS in `sheet-base.css`). The concept ships the look.
- **Classes:**
  - Step 0: `view--finder`, `find-title`, `find-modes`, `find-mode[data-index]`, `find-mode__glyph` (replaceable SVG), `find-mode__name`, `find-mode__sub`, `find-mode__go`, `find-mode__last`, `find-sep`, `find-next`, `find-next__k`, `find-next__cls`, `find-next__seats`, `find-next__go`.
  - By day: `view--fday`, `find-days`, `find-day` (`.is-today`, `.is-done`, `[aria-selected="true"]`), `find-day__dow`, `find-day__num`, `find-dayline`, `find-daybox`.
  - Lists (By day, B2): `find-list`, `find-groups`, `find-group[data-index]`, `find-group__h`, `find-row[data-index]`, `find-row__time`, `find-row__name` (not on B2), `find-row__who`, `find-row__seats`, `find-row__go`, `find-row--full`, `find-row--booked`, `find-row[aria-disabled="true"]`.
  - By class: `view--fclass`, `find-types`, `find-type[data-type][data-index]`, `find-type__head`, `find-type__media` (4:3, img + `video[data-clip][data-group="sheet"]`), `find-type__icon` (empty slot), `find-type__name`, `find-type__stock`, `find-cls[data-class][data-family][data-index]`, `find-cls__name`, `find-cls__line`, `find-cls__next`, `find-cls__day`, `find-cls__time`, `find-cls__go`.
  - B2: `view--fsessions[data-class]`, `find-sub`.
  - Show week: `view--fweek`, `find-week`, `find-wday[data-index]`, `find-wday__h`, `find-chips`, `find-chip[data-index]`, `find-chip__time`, `find-chip__name`, `find-chip__seats` (`find-chip__l` lines for the Duo reason), `find-chip--full`, `find-chip--booked`, `find-chip[aria-disabled="true"]`.
  - Shared: `find-empty`, `find-note`, `chipbtn`, `seatrow`, `sample`, `vh`.
- **Tokens:** set on `.sheet`, `#sheet` or `:root`; the defaults are Home v2's white sheet. Never terracotta.
  - Colours: `--find-surface`, `--find-ink`, `--find-ink-soft`, `--find-line`, `--find-line-w`, `--find-line-hover`, `--find-sel-bg`, `--find-sel-ink`, `--find-full-ink`, `--find-full-line`, `--find-focus`.
  - Shape: `--find-radius`, `--find-media-radius`, `--find-gap` (≥8 px).
  - Type: `--find-title-size`, `--find-name-size` (≥17 px), `--find-time-size` (≥16 px), `--find-sub-size` (≥14 px), `--find-meta-size` (≥12 px).
  - Motion: `--find-press-scale`, `--find-dur` (≤0.6 s), `--find-ease`.
- **Core rules, not to override** (normal specificity in `sheet-base.css`):
  - Targets: tiles 76 px, class rows 60, rows, chips and the shortcut 56, day tabs 44×44; gaps ≥8 px (day tabs 2 px at ≤375 px, RULINGS #40). Below 420 px the strip uses 16 px insets so 7 × 44 + 6 × 8 fits.
  - Text floors (RULINGS #41): content 14, names 17, meta 12.
  - Wrapping: no ellipsis; `text-wrap: balance` on finder titles and headings; no sticky headings.
  - Focus and media: inset focus on the day tabs; 4:3 media with a poster.
- **Hooks for your own look:**
  - `data-index` counters (Editorial "(.01)", Kinetic numerals, the Cinematic slate).
  - `data-type` and `data-family` for per-type styling.
  - The empty `.find-type__icon` slot.
  - Numerals from `data-step-pos` / `data-steps`; hide them on step 0 with `.sheet[data-step="0"]` if you like.
- **Panels:** pair the picked row's or chip's class name with step 1's `.coachhead__cls b` in your View Transition.

**Classes in the sheet** (Home v2 names; reference skin: `variants/s3-home-v2/assets/css/sheet.css`):
- Step 1:
  - Coach header: `view view--step1 [.is-compact]`, `coachwrap`, `coachhead`, `coachhead__photo[data-coach]`, `coachhead__txt`, `coachhead__k`, `coachhead__name`, `coachhead__cls b`, `coachhead__seats`.
  - Invitation and review: `coachhead__say` (+ `.sample`), `coachhead__rev[.is-after]`, `coachhead__stars`, `coachhead__text p`, `coachhead__cite` (+ `.gmark`).
  - Tiles: `joining`, `group__legend`, `jtiles`, `jtile`, `jtile--hl`, `jtile--wide` (waitlist), `jtile__badge`, `jtile__name`, `jtile__price`, `jtile__go`, `jtile[aria-pressed]`, `jtile:disabled`.
  - Waitlist: `sh-lead`, `sh-others`, `chipbtn`, `link-t sh-pick`.
- Step 2:
  - Strip and tiers: `view view--step2`, `strip`, `strip__photo`, `strip__h` (with `[data-strip-opt]`), `strip__change`, `group tiers`, `ttile`, `ttile__name`, `ttile__line`, `group.is-bad`.
  - Fields: `details`, `field`, `field.is-bad`, `label`, `input`, `phone phone--cc`, `selectwrap cc`, `select`, `cc__shown`, `err`, `err--group`, `soft`.
  - Pay and foot: `group pay`, `paybtns`, `paybtn`, `paybtn__face` (radio `:checked + .paybtn__face`), `sh-remember`, `sh-total`, `err-summary`, `sh-privacy`.
- Buttons: `btn btn--primary` (the one terracotta button, in the foot), `btn__label`, `arr`, `btn.is-busy`, `btn--outline`, `link-t`, `iconbtn`.
- Pay demo and Confirmed: `view--pay`, `sh-title` (+ `.t`), `demo-flag`, `summary` (+ `.total`, `small`), `view--done`, `done-mark`, `done-title` (+ `.t`), `done-lead`, `done-note`, `done-links`, `payload`.
- Coach view: `csheet__top`, `csheet__photo`, `sh-k`, `sh-h`, `mrows`, `mrow`, `rbtn`.
- Shared: `seatrow`, `seatrow--free`, `seatrow--full`, `seats`, `seat`, `seat--free`, `seat-gap`, `seatrow__lbl`, `sample`, `gmark`, `vh`, `step-in`, `step-back`, `step-swap` (on the body).

**`sheet-base.css` already does:**
- The frame: fixed sheet, bottom sheet ≤94dvh, step-1 auto height, side panel `min(540px, 42vw)` from 1024 px, non-modal pointer events.
- The keyboard: `--kb`, a `--vvh` cap, folded chrome.
- `.is-typing`: foot is Confirm only.
- Portrait sizes 112×140 / `.is-compact` 96×120 / 148×185, with the per-coach crop (faces gate).
- The grids: tiles 2×2, 76 px; tiers; pay pair 56 px equal; code picker 96 px.
- The strip cap: one line, ≤56 px.
- Error visibility, busy Confirm, `.vh`, and border-box sizing inside the sheet.

The layout defaults are zero-specificity `:where()`, so your rules win. The states use normal specificity. **Your skin does everything else:** colours, type, radii, borders, the slide or fade motion, the scrim colour, seat-dot looks, the drop-in highlight (2 px #E94A2B outline plus the pill), the pay pair look and the focus rings. Keep the rules: one terracotta button per screen, inputs ≥16 px, the G ≥16 px.

### Test hooks (`data-testid`)

- **Static (yours):** `sheet`, `sheet-back`, `sheet-close`, `hero-book`; `row` (+ `data-occ`), `row-book` and `coach-<id>` as before.
- **Engine views:** `step-class`, `step-details`, `step-pay`, `step-done`, `step-coach`.
- **Engine tiles and options:** `join-member`, `pack-class-1`, `join-membership`, `join-duo`, `join-waitlist`, `pack-perform-4w`, `pack-elite-4w`.
- **Engine step 2:** `details-strip`, `change-option`, `f-name`, `f-cc`, `f-phone`, `pay-now`, `pay-reception`, `err-summary`, `cta-book`, `cta-pay`, `demo-flag`.
- **Engine Confirmed:** `done-title`, `ticket`, `cta-ics`, `cta-wa-share`, `cta-directions`, `cta-other-time`.
- **Engine other:** `other-time`, `pick-another`, `mrow-book`, `payload`.
- **Finder:**
  - Step 0: `step-finder`, `finder-mode-day`, `finder-mode-class`, `finder-mode-week`, `finder-last-used`, `finder-next`, `finder-error`.
  - By day: `step-finder-day`, `finder-daystrip`, `finder-day-0` … `finder-day-6`, `finder-row` (+ `data-occ`, `data-free`, `data-full`, `data-index`), `finder-done-today`, `finder-empty`, `finder-see-day`, `finder-weekend-note`.
  - By class: `step-finder-class`, `finder-typehead-<familyId>`, `finder-class-<classId>`, `finder-class-next`.
  - B2: `step-finder-sessions`, `finder-row`, `finder-empty`.
  - Show week: `step-finder-week`, `finder-chip`.
- **Page entry buttons the engine binds:** `hero-book`, `buybar-book`, `hdr-book` (`[data-book-next]`); `use-pass-class-1`, `use-pass-duo`, `use-pass-membership` (`[data-use-pass]`); `offer-book` (`[data-duo-start]`).

## 6. Store keys (RULINGS)

| Page | Key |
| --- | --- |
| Cinematic stage `variants/s1-stage` | `ef-gf-v3-s1` |
| Editorial `variants/s2-editorial` | `ef-gf-v3-s2` |
| Kinetic `variants/s4-kinetic` | `ef-gf-v3-s4` |
| Panels `variants/s5-panels` | `ef-gf-v3-s5` |
| Original `v1/` | `ef-gf-v3-v1` |
| Home v2 (when it switches) | `ef-gf-v2` (kept) |
| This demo | `ef-gf-v3-demo` |

The state shape is Home v2's: `{v:2, contact, remember, prefPass, lastPass, lastPay, bookings, flow}`. The finder's last mode lives in `sessionStorage` under `<storeKey>:finder` (`{"mode":"day"}`), never in localStorage. A tile tap writes it; deep links and the shortcut don't (FINDER-SPEC 1.3).
- There is no `visitor` flag (RULINGS #29).
- There is no email.
- Name and WhatsApp may be remembered (90 days). The pay choice never is (RULINGS #15).

## 7. Aliases (v1 page calls that keep working)

| v1 form (current pages) | v2 form | engine-v2 |
| --- | --- | --- |
| `EF.booking.open(id, {join:'duo'})` | `{pass:'duo'}` | Both work. `pass` wins when both are given (s1, s2 and s5 send both). `join` also takes `member`, `class-1`, `membership`, `perform-4w`, `elite-4w`. |
| `store.set({prefJoin:'duo'})` / `store.get().prefJoin` | `prefPass` | One value. `get()` returns both; `set()` takes either (`prefPass` wins); it persists across reloads. Any booking clears it (Home v2 behaviour). The engine never reads it by itself. Since 1.1 "Get a Duo Day Pass" (`[data-duo-start]`) opens the finder with the Duo pass, so pages no longer need this flag. |
| `?class=<id>&join=duo` | `&pass=duo` | Both deep links open step 2 with the pass. |
| `EF.sheet.register(kind, {label, progress, testid, render})` | `{label, mode, testid, tall, noBack, render}` | Both work; `progress` is ignored. |
| `EF.sheet.update()` | (none) | Re-renders the current view. |
| `#week` focus fallback | (none) | Falls back to `#schedule`. |

The engine-related calls the five concepts' scripts make (scanned 29 Oct 2026) all exist at runtime. `qa/concepts.js` checks them, and `missing` was empty for all five:
- `EF.api`: `load`, `data`, `week`, `occ`, `occById`, `upcoming`, `now`, `wita`, `coach`, `family`, `classesInFamily`, `slots`, `weeklyCount`, `coachWeekly`, `coachOccs`, `k`, `dateShort`, `store.get`, `store.set`.
- `EF.booking`: `open`, `openCoach`.
- `EF.sheet`: `open`, `close`, `register`, `isOpen`, `kind`, `replace`.
- `EF.seats.html`.

## 8. Differences from v1's engine (`v1/assets/js/{api,booking}.js`)

| Area | v1 engine | engine-v2 |
| --- | --- | --- |
| Journey | 5 steps: class, join, details, pay, done; progress bar; "Step 2 of 5" | Two steps, then Confirmed (pay now adds one demo pay screen). No progress bar (the engine hides it). The label holds the view name only; numbers are in `data-step`/`data-steps`. |
| Options | Member, day pass, Duo, packs (10-class, Perform, Elite) | Four tiles: I'm a member, Class drop-in 300K ("Most chosen" highlight, never preselected), Membership (Perform 2.2M or Elite 2.7M on step 2), Duo day pass 225K each |
| Preselection | Join defaulted from `visitor` / `prefJoin`; Card preselected | Nothing preselected, ever. The pay pair is an equal choice, never remembered. |
| Fields | Name, phone, email, +1, WhatsApp reminder and first-class checkboxes | Full name + WhatsApp (members: WhatsApp only). No email, no checkboxes. |
| Pay | Card / QRIS / desk picker | Pay now or Pay at reception; pay now shows one demo pay screen |
| Desktop | Panel at 1024+ | Non-modal push panel (no `aria-modal`, no trap, Esc closes); the page stays usable; desktop class swap in place |
| Phone | Modal sheet | Modal, Tab trapped, page inert, drag to close; keyboard handling (`--kb`, `.has-kb`, `.is-typing`, `keepPayInView`) |
| Step 1 | Class media and description | Coach header (portrait, "Your coach", name, class and time, free seats), invitation line (Sample), the full verbatim Google review (moves under the tiles when needed, RULINGS #27) |
| Spots | Fixed capacity 14 | Sample capacity per class (`timetable.capacity`), `EF.seats` dot rows |
| Store | `ef-gf-v1`, `{v:1, visitor, prefJoin, bookings, flow}` | Per-concept key, Home v2 shape (section 6); `prefJoin` aliased |
| Data | v1 JSON only, page-relative media | v1 JSON + engine overlay; every path resolved from the engine URL; rating 4.7 / 497 |
| History state | `{ef:'gf'}` | `{ef:'gf2', d}`; Back on Confirmed closes |
| Removed test ids | | `step-join`, `cta-continue`, `cta-details`, `join-day`, `join-pack`, `pack-class-10`, `f-email`, `f-plus1`, `f-wa`, `f-first`, `f-member`, `pay-card`, `pay-qris`, `pay-desk`, `details-form`, `booked-note`, `full-note`, `done-live`, `recharge-link` |
| New API | | `EF.seats`, `EF.engine`, `EF.booking.openFinder`, `EF.sheet.isPanel/step/params`, `EF.api.contact/passes/passInfo/capacity/payload/submit/parsePhone/e164/nextOfClass/nextChip`, events `ef:pass`, `ef:pay`, `ef:member`, `ef:ics`, `ef:share`, `ef:forget`, `ef:reset` |

### Differences from Home v2's own engine (behaviour otherwise identical)

| Change | Why |
| --- | --- |
| Config, store key and paths from the engine URL; the v1 media paths are made absolute; per-overlay srcset | Concept-agnostic (RULINGS "Engine-v2 gaps"); fixes the coach-portrait 404 outside Home v2 |
| `data-step`/`data-steps` and optional hidden numerals | RULINGS: concepts render "01 / 02" from them |
| `{join}`, `prefJoin`, `&join=` aliases; `EF.sheet.update()`; `#schedule` fallback; null-safe toast lookup | v1 pages keep working |
| The progress element is hidden | The concept markup has no `hidden` on it; P7 has no progress bar |
| `placeReview` (RULINGS #27): checks every tile, tries the 96×120 portrait first, then moves the review under the tiles and restores 112×140 if the tiles still fit | #27 plus #26 ("96×120 only when needed"). Home v2's own #27 version keeps the compact portrait after the move. |
| The class finder (section 9); the engine owns the entry buttons | RULINGS #30, #36, #37; FINDER-SPEC v1.1 |
| Focus returns one frame after close, after the page shows its bar again; a hidden or `aria-hidden` opener falls back to `hero-book` | FINDER-SPEC 6.4 |
| The .ics PRODID reads "engine-v2" | Not Home-specific |

## 9. The class finder (RULINGS #30, #36, #37; FINDER-SPEC v1.1)

**Entries. The engine binds these buttons; pages remove their own handlers for them:**

| Button | Engine call | Journey |
| --- | --- | --- |
| `[data-book-next]`: hero, sticky bar, header (`hero-book`, `buybar-book`, `hdr-book`) | `openFinder({ src: 'hero' \| 'bar' \| 'header' })` | Finder journey: step 0 → a finder screen → step 1 → step 2 (3 steps) |
| `[data-use-pass="class-1\|duo\|membership"]`: price buttons | `openFinder({ pass, src: 'prices' })` | Pass journey: step 0 → a finder screen → **step 2** (step 1 sits underneath) |
| `[data-duo-start]`: "Get a Duo Day Pass" (`offer-book`) | `openFinder({ pass: 'duo', src: 'offer' })` | Pass journey; classes with 1 spot free are greyed out ("1 spot free · Duo needs 2") |
| Rows, cards, the Now bar, the coach sheet (class-specific) | `EF.booking.open(occId, opts)`, as today | Class journey: step 1 → step 2 (2 steps); no finder |

**Rules:**
- A generic button tapped while the sheet is open does nothing.
- A page's leftover handler that fires for the same click is ignored, so the sheet never opens twice. Still, remove those handlers.
- A class tap on the page while the desktop panel shows a finder screen pushes step 1 on top of it, with no toast; Back returns to the finder.

**Screens** (copy exactly as in FINDER-SPEC v1.1):

| Kind | Screen | URL | Back |
| --- | --- | --- | --- |
| `finder` | Step 0 "How do you want to pick?": By day, By class, Show week ("Last used" from session memory), then "Next class: HYROX · Today 8:30am" | `?finder=1` (`&pass=`) | hidden |
| `finder-day` | "When can you come?": 7-day strip (today first; opens on today or the first day with classes left), rows, today-done and empty states, weekend note | `?finder=day&day=YYYYMMDD` | to step 0 |
| `finder-class` | "What do you want to train?": 4 type headers (one still or clip each, Mobility & Stretch "Stock clip"), 10 class rows with a short line and the next free time | `?finder=class` | to step 0 |
| `finder-sessions` | "{Class name}": "N classes in the next 7 days", day groups, rows; empty state with the next session beyond the week | `?finder=class&cls=<classId>` | to By class |
| `finder-week` | "The week, today first": 7 day groups, chips (2 columns, 3 from a 460 px body) | `?finder=week` | to step 0 |

**Hand-over:**
- Every row, chip and the shortcut **pushes** step 1 (or, in a pass journey, step 1 quietly and then step 2).
- Step 1 shows Back in a finder or pass journey.
- Waitlist "Pick another time" goes Back to the finder screen. "See other times" on a waitlist Confirmed reopens the finder at the mode used.
- Browser Back on Confirmed closes the whole sheet.

**Payload:**
- `source_section` = `hero`, `bar`, `header`, `prices`, `offer`, `nowbar` or a class-journey value.
- `finder_mode` = `day`, `class`, `week`, `next` or `null` (a new optional field on `ef-booking-1`).

**Taps** (scripted in `qa/finder.js`, clock `2026-10-29T07:30`):

| Path | Taps + fields |
| --- | --- |
| Generic: shortcut drop-in | 5 + 2 |
| Generic: By day today drop-in | 6 + 2 |
| Generic: By day another day | 7 + 2 |
| Generic: Show week Duo | 6 + 2 |
| Generic: By day membership | 7 + 2 |
| Generic: shortcut member | 4 + 1 |
| Price drop-in via the shortcut | 4 + 2 |
| Price membership via By class | 7 + 2 |
| Class Book on the page (baseline) | 4 / 4 / 5 / 3 |

## 10. Data and Samples

`data/v2.json` is Home v2's overlay without the page-only keys (`nextup_media`, `nowbar_media`).
- Verbatim reviews; the hero cuts are ≤12 words (RULINGS #2), checked against the raw Google Maps data in `qa/reviews.js`.
- Rating 4.7 from 497 reviews, read 28 Oct 2026 (RULINGS #23).
- **Samples to list in each concept README:** class capacities, coach invitation lines, "Most chosen".

## 11. Switching a concept over (checklist)

1. Script tags (section 2): `api.js` with your `data-store-key`, then `booking.js`. Add `sheet-base.css` before your skin.
2. **Remove your page handlers** for `[data-book-next]`, `[data-use-pass]` and `[data-duo-start]` (the `openOcc(EF.api.upcoming(1)[0]…)` branch, `bookWith()`, and the `prefJoin` Duo flag and note). The engine handles those buttons. Keep the attributes and testids.
3. Class-specific entries (rows, cards, the Now bar, the coach sheet) keep `EF.booking.open(occId, opts)`. The Now bar uses `{ src: 'nowbar' }`. Put `data-nowbar` on the bar's root if it sits outside `#page`.
4. Price cards: the foot line "The next class" becomes "Pick your class" (RULINGS #42). Price buttons carry `data-use-pass="class-1|duo|membership"` and the testids `use-pass-…`; the Duo offer button is `[data-duo-start]` with testid `offer-book`.
5. Skin: style the sheet classes and the finder (section 5) in your own look, through the `--find-*` tokens or the classes, without overriding the core rules. Delete old 5-step skin rules you no longer need.
6. Step numerals, if you show them: render `pad2(data-step-pos) + ' / ' + pad2(data-steps)` from `#sheet`, or set `data-step-numerals` to keep a label parser. Don't read `data-step` as a number any more: it can be `0`, `pay` or `done`.
7. Optional cleanup: the path fixer (`base.js`, `paths.js`, `bridge.js`) and the progress markup can go. Both are harmless if they stay.
8. Run `qa/concepts.js` (or your own self-test) on your page.

## 12. QA (29 Oct 2026, engine-v2 1.1; results in `qa/results/`, screenshots in the OS temp folder or `SHOTS=`)

Run from `qa/` with a static server whose root contains `groupfitness-prototype/`, e.g. `ORIGIN=http://127.0.0.1:8820 node finder.js`. Add `SKIN=home` for Home v2's own skin.

| Check | Result (neutral skin and Home v2 skin) |
| --- | --- |
| `flows.js`: class journeys from a row Book, WebKit 390×844 and Chromium 1440×900 | Taps + fields: drop-in 4+2, pay now 4+2 (plus the demo-pay tap), Duo 4+2, membership 5+2, member 3+1, waitlist 3+2. Aliases, numerals and deep links pass. 0 console errors, 0 HTTP errors, 0 third-party requests. |
| `sheetfix.js` | Phone: modal, Tab trapped, page inert. Desktop: non-modal, Tab leaves. Esc, close and row Book return focus. Strip 56 px. Pay pair never preselected. `.is-typing` foot; 390×460 and 390×664 keep the field and pay pair in view. Confirmed 56 words, 29 elements, 4 controls. |
| `reviews.js` | Verbatim against the raw Maps data; hero cuts 5–8 words; all four tiles in view at 390×844 for every coach (RULINGS #27); Ain shows no review. |
| `finder.js`, 41 runs: FQ1–FQ24 of FINDER-SPEC v1.1, the Now bar and the pass journeys | Step 0: no scroll at 390×664 and 360×640, 30 words, 0 terracotta, ≤6 controls. Attributes as in 6.3. By day: the live text "Friday 30 October, 7 classes." and arrow keys. By class: 10 rows, 4 headers, unique media, the next times match table 2.3, ≤100 words. B2 and Back focus. Show week: 33 chips, 2 / 2 / 3 columns at 390 / 1024 / 1440. Generic taps 5, 6, 7, 6, 7, 4; price taps 4 (drop-in) and 7 (membership). Duo 1-spot rows and chips disabled. Last used in sessionStorage only. Deep links incl. `cls=` and `pass=duo`. Today done at 5pm. Tab trap at 390, none at 1440. Layout gate at 360, 375, 390 and 1440 on all five screens: 0 findings (targets ≥44, gaps ≥8 (2 on the strip at ≤375), content ≥14 px, meta ≥12 px, no ellipsis, no sticky heads, no horizontal scroll). |
| `concepts.js`: s1, s2, s4, s5, v1 on temp copies (only their two engine script tags switched) | Every named API exists. Generic Book opens step 0 (their own `[data-book-next]` handler is ignored), then the shortcut, step 1 `1/3/2`, Confirmed. Row Book, coach, filters. `[data-duo-start]` opens the finder with the Duo pass, then step 2. Portrait loads on phone and desktop. Panels' View Transitions leave no names. 0 errors. |
