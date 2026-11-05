# Elite Fit Group Fitness page: Loud concept

| | |
| --- | --- |
| Name | **Loud** (RULINGS #48, 29 Oct 2026; earlier "Kinetic type", then "Big Hello"). Folder and URL stay `variants/s4-kinetic/`. |
| Version | v1.10, 30 Oct 2026 |
| Live page | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s4-kinetic/ |
| Engine | `../../engine-v2/` (shared booking engine with the class finder), store key `ef-gf-v3-s4` |
| Status | Design concept. Not the club's live website. The page carries `noindex, nofollow`. |

## The direction in three lines

1. Type is the hero: Gilroy ExtraBold at poster size, fitted to the column ("FIND / YOUR / PEOPLE.", the class families, the coach names, "BRING YOUR +1.").
2. The type is the motion: headlines rise from their line mask, display words arrive letter by letter, the class-name strip speeds up with your scroll, and the real numbers count up. Native scroll only.
3. Real club footage sits in the gaps the words leave, never behind or inside the letters. Black stage, white bands, one full-bleed terracotta moment (the Duo Day Pass).

## How to view and test

- Tap **Book a class** (hero, sticky bar) to open the class finder (By day, By class, Show week). A class card, a schedule row, a week chip or the Now bar opens that class directly.
- `?class=<occId>` opens a class sheet directly. `?now=2026-10-28T07:30` pins the Bali clock (the Now bar counts down from it).
- Demo state lives in the `ef-gf-v3-s4` localStorage key. It is separate from the other concepts.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1.10 | 30 Oct 2026 | HANDOVER-QA-v2 cards (builder Loud). The Sculpt card and chapter use a face-safe re-cut, `card-sculpt-v110b.mp4` (the foreground head the old cut lost at its bottom edge is out of frame, #46; smaller file than before). The display letters (class names, coach names, "BRING YOUR +1.", the After-class words) now reveal in place with a bottom-up wipe instead of rising from below their line, so a rising letter never paints over a head in the clip under it (#51). The two row hit-layer cards are skipped under RULINGS #55. Archived before: `archive/v1.9-pre-handover2/`. |
| v1.9 | 29 Oct 2026 | RULINGS #54: the sticky-bar face row overlaps by 5 px instead of 10, so no circle paints over a neighbour's face box. WebKit: `assets/js/avatars.js` (loaded right after api.js) points the engine's coach avatars at the engine-v2 head-and-shoulders crops before anything renders, so the shared v1 avatar files are never requested. Archived before: `archive/v1.8-pre-stack/`. |
| v1.8 | 29 Oct 2026 | Coach avatars (RULINGS #53, #53a): every avatar on the page and in the sheet (Now bar, sticky-bar faces, Next-up cards, schedule rows, chapter chips, filter toggles, the engine's step-2 strip and finder rows) uses engine-v2's head-and-shoulders crops `engine-v2/img/r/avatar-<coach>-{48,64,96,128}.webp` with srcset and a `sizes` per rendered size; one crop per coach across the page; 0 requests to `v1/assets/img/avatar-*`. A small concept overlay (`assets/data/engine-overlay-v18.json`, on the api.js tag) points the engine's avatar srcset at the same set. `faces.js`: 0 avatar findings. Archived before: `archive/v1.7-pre-avatars/`. |
| v1.7 | 29 Oct 2026 | Faces round (RULINGS #51: whole head inside, ≥8 px clear in every frame and poster). The boxing Next-up card is now a club still (glove at the bag, no face); the conditioning card and chapter use a face-safe re-cut (`card-conditioning-v17.mp4`); the three Next-up cards sit in a row only from a 900 px page (760–899 px stack as on phones). engine-v2 `faces.js`: 0 fails for this concept's media. Layout gate: 0 findings. Archived before: `archive/v1.6-pre-faces51/`. |
| v1.6 | 29 Oct 2026 | Layout gate v1: 28 findings down to 7, all allowed by a ruling (see "QA"). The class-name strip's Pause button has its own lane under the names; chapter clips are no longer sticky on desktop; reveals start as soon as an element enters the screen; the headline scale settle is removed (it shifted the heading box); Now-bar focus rings are drawn inset. Boxing card clip re-cut face-safe (`card-boxing-v16c.mp4`). |
| v1.5 | 29 Oct 2026 | Fix round from QA, VISUAL-AUDIT-v1 and HANDOVER-QA-v1. The page steps down cleanly while the desktop panel is open (container queries on the page). Now bar wording per #43: trainer name at every width, phone labels "in 1:12:05" / "23:14 left", separators, concept line at the right end. Real class names everywhere. Axe: 0 serious. Faces #46: six media swaps (listed below). Visit email back (#47). Name Loud (#48). Dead joke CSS removed. |
| v1.4 | 29 Oct 2026 | Motion and scroll pass (MOTION-BRIEF, RULINGS #39): the motion table below. 0 forced layouts in scroll frames (v1.3: 87). The pulse is now a ring on transform and opacity. |
| v1.3 | 29 Oct 2026 | Home v2 best practices (P1 to P23) in this concept's own style, on engine-v2. The week moves into section 1 (P22). The Now / Next bar (P23) is pinned at the top (#38). Real club footage in the hero. Joke removed. 497 reviews. "Full · Join waitlist". The First class / Been before toggle is removed (#29). |
| v1.2 | 28 Oct 2026 | Final QA fixes. Archived unchanged in `ef-gf/variants/s4-kinetic/archive/v1.2/`. |
| v1.1 | 27 Oct 2026 | Review fixes (count-ups, sculpt clip, marquee dock, sheet skin, concept bar). |
| v1 | 27 Oct 2026 | First release of the style on v1's engine. |

Archives (scratchpad, never overwritten): `archive/v1.2/`, `archive/v1.3-pre-motion/`, `archive/v1.5-pre-layoutgate/`.

## What changed in v1.3 to v1.6: difference table

Every visible change, with where it lives and why. Patterns are the BEST-PRACTICES cards (P1 to P23) and RULINGS numbers.

| Pattern | Where | Why |
| --- | --- | --- |
| P1 Google rating line ([G] 4.7, stars drawn to 4.7, "497 Google reviews") | one component in the hero (phones and tablets), the desktop trust row and the sticky bar; white ink on black | Raoul's widget; the G is the only colour exception; never five full stars |
| P2 Sticky bar on phones and desktop | `.buybar`: black, hairline; phones edge to edge (118 px), desktop a floating 760 px bar (74 px); faces of the four coaches, the dictated quote, the G line, "Book a class →" | Raoul: sticky bar on desktop too; one terracotta button per screen. The header CTA is gone on desktop. |
| P2 show rule | `initBars` in page.js: shown only after the hero Book, the hero rating and quote (phones) or the trust row (desktop) have scrolled away; hidden over the +1 offer, the visit rating, the footer, an open sheet and a focused field | RULINGS #6; one rating per screen (P6) |
| P3 Pulse | `.buybar__btn::before`: a terracotta ring on scale and opacity, every 2.2 s, paused on hover and focus, off under reduced motion | Raoul: "gently but noticeably pulsing"; MOTION-BRIEF rule 7 (no box-shadow animation) |
| P4 Hero quotes | `.htrust` under Book: the G line, then one real review at a time (≤12-word verbatim cuts), every 3.5 s; the words of the new quote rise from their line mask (Loud's own move); pause control; static under reduced motion | Raoul: quicker, more prominent citations. 19 px at 390, 25 px at 1440, attribution 15 px. |
| P5 Mobile fold | phones: the headline size is budgeted against the screen height (`--hs`), "See the schedule" is gone (the week is right below), so Book, the G line and the full quote are on the first screen at 390x664 and 360x640 | RULINGS #17 |
| P6 One rating per screen | the bar waits for every rating mark; the visit rating hides it | BRIEF decision |
| P13 Seat dots | every class row, week chip, Next-up card and the sheet: free dots solid and first, taken dots as rings, "N spots free" / "Full · Join waitlist"; screen readers hear "5 of 12 spots free"; legend once, in the week note | Raoul's free-spots graphic |
| P14 Class clips on Next-up cards | `.ncard__media`, 16:9 on top of each card, nothing over the clip, one "Pause clips" control in the section head; stock clips say "Stock clip" in the card's meta line | Raoul: see each class without reading; RULINGS #28 |
| P15 Desktop trust row | in the hero's top line, right of "(.01) PERFORM · GROUP CLASSES": the Google badge plus 2 to 3 verified facts (open 6am to 10pm every day F2-HRS-01; Arsenal Strength, Panatta and Prime kit F2-FAC-04; pool, ice bath, sauna and steam room F2-FAC-06) | Builder call (RULINGS): in Loud the empty desktop space is the hero head, so the first screen at 1440 shows exactly one rating |
| P16 Dynamic hero video | the video stays in its tile in the gap the words leave; real club footage replaces the stock clip: a tall cut for phones, a 2.1:1 cut from 768 px | Builder call: a type-first hero; video inside or behind the letters would cut faces and hurt reading, and a full-bleed band would push Book, rating and quote out of the phone fold. The club has no real boxing or HYROX footage, so the montage uses its outdoor kettlebell class. |
| P17 Copy | joke removed; "Room for N more" replaced by the seat row; "Full · Join waitlist"; 497 reviews; FAQ now points to the class drop-in (300K) | BRIEF decisions |
| P18 Brand | controls on footage are flat black (no scrim); "Stock clip" chips moved off the clips into meta lines | RUBRIC D2, P14 |
| P21 Data | the rating, prices and counts bind from engine-v2's data (`club.rating` 4.7 / 497 / 2026-10-28) | one source |
| P22 The week in section 1 | `#schedule` right after the hero: phones a day selector (today first) plus that day's list with seat dots and Book (outline); from 1024 px a 7-day grid, today first (RULINGS #32), one chip per class (time, name, seat dots) that opens step 1. It is the only timetable on the page. While the desktop panel is open the page steps down to the phone layout where the grid no longer fits. | Raoul: the schedule in section 1, easy to read by day |
| P23 Now / Next bar | `.nowbar`, pinned at the top (#38): "Next · [icon] Boxercise Beginner · [avatar] Rey · starts in 29:58" (phones "in 29:58" / "23:14 left"), a live countdown in Bali time, a blurred class surface under a 70 % black layer; tap opens that class; the concept line "Loud · demo" and "All concepts →" sit at the right end from 1024 px (phones: "All concepts" in the header) | Raoul's live bar; RULINGS #31, #38, #43 |
| Next up | the First class / Been before toggle, its helper line and the "next three classes" lead are gone | RULINGS #29 |
| Section order | hero → the week (.02) → next up (.03) → class-name strip → numbers (.04) → classes (.05) → coaches (.06) → after class (.07) → +1 offer → first class (.08) → visit (.09) | P22 puts the week first |
| Sheet skin (P7 to P12) | `assets/css/sheet-v2.css` on top of `engine-v2/sheet-base.css`: black panel, the giant step numeral "01//03" from `data-step-pos` / `data-steps`, the coach name in poster type, the full review, four big tiles (drop-in outlined with "Most chosen"), one-line strip, equal pay pair, hero-scale Confirmed | Raoul: low cognitive effort, coach and quote well visible |
| Finder skin (#30) | the same file: modes numbered 01 to 03, names in 800 caps, white selected day, no terracotta | engine-v2 FINDER-SPEC §7.9 |
| Desktop panel | non-modal, starts below the Now bar, the page makes room and steps down (container queries) | RULINGS #20, #38 |
| Text and taps | content ≥14 px, meta ≥12 px; taps ≥44 px; day tabs 8 px apart above 375 px (2 px at ≤375) | RULINGS #40, #41 |

## Motion (v1.4): pattern, where, why

| Pattern | Where | Why |
| --- | --- | --- |
| Hero is final on first paint; only video and the quote move | `.hero` | Skim-first: Book, rating and quote never wait |
| Hero exit layers | the FIND / YOUR / PEOPLE. lines part sideways and the tile frame rises 6 % over the first 90vh (scroll-linked) | Depth as you leave; the picture never moves inside its frame, so faces stay whole |
| Headline words rise | `.h2[data-split]`: words rise from their line mask once (.52 s), starting as soon as the heading enters the screen | The type is the motion; the v1.4 scale settle was removed in v1.6 because it moved the heading box |
| Split letters on display type only (v1.10: each letter reveals in place with a bottom-up wipe, never leaving its line) | chapter names, coach names, "BRING YOUR +1." | Loud's signature; a hidden full-text copy keeps them readable for screen readers |
| Whole-word rise | Train. Recover. Eat. Work. | A calmer counterpoint |
| Type drift | `[data-drift]` words and the class-name strip, on the compositor | Scroll-linked, never scroll-jacked |
| Class-name strip follows scroll speed | `.marq__track` playbackRate from a ScrollTimeline snapshot (no layout reads); pauses off-screen, on hover, focus and with its button, which sits in its own lane under the names; the moving copy is aria-hidden with a hidden full list (RULINGS #50); one static line without motion | MOTION-BRIEF seed for Loud |
| Numbers band | the rule draws in (scaleX), the numeral rises and counts up once in .7 s | Real numbers, final value in the HTML |
| Week cascade, once | phone day tabs then rows; desktop columns then chips (≤.87 s) | Section 1 arrives as one gesture |
| Day switch and filters | View Transition on the list and grid, instant fallback | Calm in-page change |
| People media: opacity and translate only | chapter clips, After-class photos, coach photos, Next-up cards | Faces rule: no mask, clip or scale on people |
| Media without people: mask | the entrance wall and the sauna | Allowed, no people in shot |
| Sticky Book ring | see P3 | Replaces the box-shadow pulse |
| Micro-interactions | press .97, anchor jumps glide only during the jump | Polish without moving focus |
| Easing | `--ease-out` for reveals, `--ease-spring` (`linear()`) for UI | One family, no bounce |
| Fallbacks | reduced motion and Save-Data: final state at once, posters only, static strip; no JS: all content visible | MOTION-BRIEF rule 6 |

## Sample list (placeholders until the club confirms)

On the page each list carries ONE Sample marker (the week note, the Next-up footnote, the classes footnote; VISUAL-AUDIT S4-1). Tracked here and in GO-LIVE:

- Class capacities (10 to 16 per class) behind the seat dots, and spots, waitlists and dates in the week.
- Class levels, the "60 min" length of Injury Prevention & Mobility, the family level lines and the "how it feels" lines.
- The coaches' invitation lines in the sheet (until each coach approves).
- "Most chosen" on the drop-in tile (until the club confirms drop-in is the most-booked option).
- The sticky-bar quote "One of the top premium gyms in Bali! Must see!" (dictated by Raoul; not found in the 120 pulled reviews: source the reviewer or get the club's OK).

## Media: provenance (RULINGS #28, #33, #46)

Real club footage first. Every clip and photo was checked for heads cut by the source edge or by the page crop at 360, 390, 1440 and 1920 (frames every 0.5 s).

| File (this folder unless noted) | Where | Source | Notes |
| --- | --- | --- | --- |
| `assets/video/hero-tall.mp4`, `assets/img/hero-tall-poster.webp` | hero tile, phones | Elite Fit's own footage (the club's landscape header film, via `v1/assets/video/sculpt.mp4` and `variants/s1-stage/assets/video/conditioning-wide.mp4`, `sculpt-wide.mp4`) | 720x900, 8.7 s, three shots, 0.4 s crossfades, faces inside a safe zone for the tile crop |
| `assets/video/hero-wide-v15.mp4` (poster `assets/img/hero-wide-poster.webp`) | hero tile from 768 px | Elite Fit's own footage (kettlebell shots only) | 1280x610, 4.6 s; replaces `hero-wide.mp4`, whose core-work shot had a head cut by the bottom edge (#46) |
| `assets/video/card-conditioning-v17.mp4` (+ `assets/img/card-conditioning-v17-poster.webp`) | Next-up cards and the Conditioning chapter | Elite Fit's own footage (`s1-stage/conditioning-wide.mp4`, crop x 0–1173, y 27–687) | 960x540; every head ≥125 px clear, the fourth woman's head out of frame (#51). `card-conditioning.mp4` is the earlier cut, kept but unused. |
| `assets/video/card-sculpt-v110b.mp4` (+ `assets/img/card-sculpt-v110b-poster.webp`) | Next-up cards and the Sculpt chapter | Elite Fit's own footage (`s1-stage/sculpt-wide.mp4`, crop x 520–1195, y 60–440 of 1280x720) | 960x540, 382 KB; every head ≥64 px clear, checked every 0.1 s and by eye on a 0.5 s sheet (#46, #51). `card-sculpt.mp4`, `card-sculpt-v110.mp4` are earlier cuts, kept but unused. |
| `assets/img/card-boxing-v17-poster.webp` | Next-up boxing card (a still, no clip) | Elite Fit's own footage: a copy of `variants/s3-home-v2/assets/img/nextup-boxing.webp` (from the club's film) | a glove at the bag, no face, so no "Stock clip" label; replaces the stock boxing card, because no 16:9 window of the stock clip keeps a head 8 px clear (#51). `card-boxing.mp4`, `-v15`, `-v16`, `-v16b`, `-v16c` are earlier cuts, kept but unused. |
| `assets/video/card-mobility.mp4` (+ poster) | Next-up cards | Stock: Pexels 6326792 (Pavel Danilyuk), from `s1-stage/mobility-wide.mp4` | "Stock clip" in the meta line |
| `../../v1/assets/video/boxing.mp4` (+ poster) | Boxing chapter | Stock: Pexels 34801443 (khezez) | "Stock clip" in the chapter meta line |
| `assets/video/chap-mobility.mp4` (+ poster) | Mobility & Stretch chapter | Stock: Pexels 6326791 (Pavel Danilyuk), v1's clip cropped to 620x960 | "Stock clip" in the chapter meta line; replaces v1's crop, which cut a third head at the right edge (#46) |
| `assets/video/bar-*.mp4` (+ posters) | Now-bar surface | blurred (sigma 22) and slowed from the four card clips; boxing and mobility are stock | Under 23 KB each; no recognisable person, so no on-bar label (#33) |
| `assets/img/eat-bowl.webp` | "Eat." | copy of `homepage-prototype/v2/assets/img/nutrition-bowl.webp` (club restaurant, no people) | replaces eat-together, which had heads cut at both edges (#46) |
| `assets/img/bring-training.webp` | "What to bring" | copy of `homepage-prototype/v2/assets/img/training-clip-poster.webp` (club gym floor) | replaces zone-classes, which had a head cut by the left edge (#46) |
| `../../engine-v2/img/r/avatar-*-{48,64,96,128}.webp` | every coach avatar (page and sheet) | engine-v2's head-and-shoulders re-crops of the club's coach photos | v1.8, RULINGS #53a |
| `../../v1/assets/img/…` | coach photos, train-together, rec-ice, hero-cafe, rec-sauna, visit-entrance | the club's own photos (see `../../v1/README.md`) | unchanged |

Reviews: the hero quotes are verbatim cuts of ≤12 words from engine-v2's data (checked against the raw Google Maps text). The visit quote is Skye D.S. (FACTS F2-REV-02, shown on elitefitbali.com). Rating 4.7 from 497 Google reviews, read 28 Oct 2026.

## GO-LIVE notes

1. Replace the stock clips (boxing: the chapter; mobility: the Next-up card and the chapter; the boxing and mobility Now-bar surfaces) with club footage of those classes. Then drop the "Stock clip" labels. The boxing Next-up card is already a club still.
2. The club has no real boxing or HYROX class footage; the hero montage uses its outdoor kettlebell class. A short real boxing or HYROX session would make the hero match the headline classes.
3. Confirm the Sample items above (capacities, levels, invitation lines, "Most chosen", the sticky-bar quote).
4. Get written OK for the people in the club footage.
5. Bookings are a demo: connect the engine's `submit()` to the club's booking system or HubSpot.

## What is shared, what is in this folder

- Shared, linked and not copied: `../../engine-v2/` (api.js, booking.js, sheet-base.css, data), `../../v1/assets/` (fonts, logo, photos, the boxing chapter clip and posters).
- In this folder: `index.html`; `assets/css/kinetic.css` (tokens, layout, the v1.3 to v1.6 blocks, motion); `assets/css/sheet-v2.css` (sheet and finder skin); `assets/js/page.js` (page rendering, Now bar, quotes, week, bars); `assets/js/motion.js` (reveals, letter splits, strip speed, count-ups); `assets/js/media.js` (lazy, capped, pausable clips); `assets/js/avatars.js` (points the engine's coach avatars at the head-and-shoulders crops before it renders); `assets/video/` and `assets/img/` (the files in the provenance table). `assets/css/sheet.css` and `assets/js/bridge.js` are the v1-engine skin and path fixer, kept but no longer loaded.

## Requests for engine-v2 (not fixed here)

- The engine's By-class thumbnails (`engine-v2/media/nextup-conditioning.*`, `nextup-sculpt.webp`) show tiny background heads 55 to 82 % inside the 96x72 crop at 1440 and 1920: worth a re-crop under #46.
- README §4 still documents `version: '1.0'`; the runtime reads 1.2.

## QA (29 Oct 2026)

- Fold at 390x664 / 360x640: Book 530 / 505, G line 584 / 559, quote 658 / 634 px (all inside).
- Sticky bar 118 px on phones, 74 px on desktop; never shown with the hero rating or quote; ≤1 terracotta button and ≤1 rating line at every half-screen step at 360, 390, 1024 and 1440.
- Tap counts: class journeys 4 / 4 / 5 / 3 (+ fields); finder: shortcut drop-in 5, By day today 6, another day 7, Show week Duo 6, shortcut member 4. Every path reaches Confirmed.
- Lighthouse mobile (gzip server, median of 3): Performance 97, Accessibility 100, CLS 0. Scroll trace: 0 forced layouts, ≥99 % frames on time at 1440 and at 390 with 4x CPU.
- Axe: 0 serious or critical on the page and in the finder and sheet at 390 and 1440.
- 0 console errors, 0 404s, 0 third-party requests; no horizontal scroll at 360, 375, 390, 414, 768, 1024, 1440, 1920.
- Faces: every clip and photo at 360, 390, 1440 and 1920 (frames every 0.5 s; reveals every 0.1 s; the boxing card every 0.1 s): pass, incl. engine-v2 `qa/faces.js` at 390 and 1440 (v1.7: 0 fails under RULINGS #51; avatars are handled under #53).
- Layout gate v1 (`ef-gf/audit-visual/builder-checks/s4-kinetic/LAYOUT-GATE-v1.md`): 7 findings left, each allowed by a ruling: the strip's names cut at its own edge (#50), the PERFORM lockup at 13 px (logo, exempt), the Now-bar text at 13 px at 360 (#43: 14 px overflows "CONDITIONING").
- Lighthouse after v1.6: 96 / 96 / 98 (median 96), Accessibility 100, CLS 0.
