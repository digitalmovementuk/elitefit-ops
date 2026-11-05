# Elite Fit Group Fitness page: Glossy concept (`variants/s2-editorial`)

| | |
| --- | --- |
| Version | v2.10, 29 Oct 2026 |
| Live page | <https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s2-editorial/> |
| Status | Design concept, one of five style variants of the same page. Not the club's live website. `noindex, nofollow`. Named "Glossy" by Raoul (RULINGS #48, supersedes "Coffee Table" #44; was "Editorial"); the folder and URL stay `s2-editorial`. |
| Previous versions | v1.2 and v2.1 (before the motion pass), archived unchanged in `ef-gf/variants/s2-editorial/archive/v1.2/` and `archive/v2.1-pre-motion/` |

## Direction in three lines

1. The page reads like Elite Fit's own magazine: numbered spreads "01//07" to "07//07" in the style of the handbook's section covers, alternating black and paper white, with one terracotta offer spread.
2. An asymmetric 12-column grid, oversized Gilroy ExtraBold caps that slide up line by line inside masks, hairline rules and numbered index rows, real Elite Fit footage, and the review quotes set as pull-quotes.
3. The week comes first: a printed seven-day grid on desktop, a date strip and that day's list on the phone. Every Book opens the same booking sheet.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v2.10 | 29 Oct 2026 | Handover QA v2, card D4d (archive `archive/v2.9-pre-handover2/`). On phones, Tab to the first schedule chip ("All classes") left it under the bottom Book bar, because the bar slid in after the one-off keep-clear check. `assets/js/page.js` now runs that check (`keepClear`) in the next frame as before, again at 600 and 1100 ms while the control keeps focus, and once more when the bar turns on within 1.5 s of a focus change. It aims at the bar's resting top rather than its mid-slide position, and the nudge is instant (`behavior: 'instant'`), like the browser's own focus scroll; a smooth one was still under way 70 ms later, when the mobile audit measures. The later checks skip a control the visitor has scrolled off screen, so a clicked button never pulls the page back. Measured after 1 s, the chip sits 24 px above the bar on iPhone 390 and 375 (WebKit) and 35 px above it at 390 in Chromium; before, it was 70 to 93 px under the bar. None of the next 30 tab stops is covered. The two stack cards are closed by v2.9. The two row hit-layer cards are dropped under RULINGS #55. |
| v2.9 | 29 Oct 2026 | Face row overlap, RULINGS #54 (archive `archive/v2.8-pre-stack/`). In the bottom bar the four 34 px coach faces overlapped by 10 px, so each circle painted over the face box of the one before (Rey, Ain, Icha). The overlap is now 5 px (`.buybar__faces img { margin-left: -5px }`); at 6 px, 3 of 81 points on Rey's face box were still painted over at 1440 on a 1x screen (the 48 px file). Only the outer edge of each circle is covered, and every face stays clear. The row is 15 px wider (123 px). The bar keeps its height and rows at 360, 390 and 1440, with no wrap and the quote on one line. The faces row is the only size that overlaps (it hides below 360 px), so no other value changed. |
| v2.8 | 29 Oct 2026 | Avatar swap, RULINGS #53 and #53a (archive `archive/v2.7-pre-avatars/`). Every coach avatar on the page now loads the engine's head-and-shoulders crops in `../../engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp`, with `srcset` 48w/64w/96w/128w, `sizes` set to the displayed size and the width/height attributes kept. That covers the Now bar (20 px), the Next-up cards, the class features and list rows (28 px), the filter toggles (26 px) and the bottom bar faces (34 px, `index.html`). `assets/js/page.js` builds them with one helper, `avImg()`. The engine sheet's avatars use a new concept overlay, `assets/data/avatars.json`, loaded after the engine's own `data/v2.json` through `data-overlay` on the `api.js` tag. It replaces the engine's avatar `srcset`, whose 96w step still pointed at v1. The shared `v1/assets/img/avatar-*.webp` files are untouched and no longer requested: 0 requests at 390 (WebKit, 2x and 4x) and 1440 (Chromium, 1x and 4x), with the filters and the booking sheet opened. Checked by eye at 4x: whole heads, hair clear of the circle. The faces check (#53a) passes at 390 and 1440, with at least 3.8 px of clear space against the required 3. |
| v2.7 | 29 Oct 2026 | Faces fix, RULINGS #51 (archive `archive/v2.6-pre-faces51/`). In the conditioning Next-up card the member's whole head came 4 to 5 px from the card's right edge in 68 frames. The clip and card share the 9:16 shape, so `object-position` cannot move it, and the clip was re-cropped instead. New pair: `assets/video/conditioning-ef-facesafe-tall.mp4` (295 KB) and `assets/img/conditioning-ef-facesafe-tall-poster.webp`, the same club footage (`../s1-stage/assets/video/conditioning-wide.mp4`) cropped 405×720 at x 410 (was 330) and scaled to 720×1280. `assets/js/page.js` points the conditioning clip at it. The old pair stays in the folder, unused. The engine faces run on port 8851 has 0 fails for this page's media at 390 and 1440. A per-frame check (YuNet, all 81 frames) gives a whole-head clearance of at least 19.5 px in the 76 px card and 21.5 px in the 84 px card, and the poster about 20 px. The only other detections are body-sized false boxes scoring below 0.58. The boxing pair from v2.5 is unchanged. |
| v2.6 | 29 Oct 2026 | Visual audit v2, card G-1 (archive `archive/v2.5-pre-hyphens/`). Class names in the desktop week grid no longer hyphenate ("BOXER-CISE BEGIN-NER"). The soft-hyphen map is gone from `assets/js/page.js`, and `.tc__name` has `hyphens: none` and `overflow-wrap: normal`, so names wrap only between whole words. To fit the longest word (CONDITIONING), the grid gains room. At 1024 to 1279: cell padding 5 px, column padding 0 and letter-spacing -0.025em; the text stays at 14 px. At 1280 to 1439: the band column is 7 rem (was 8.5, and the day tabs move with it), cell padding 8 px and letter-spacing -0.01em. Checked in Chromium and WebKit at 1024, 1100, 1279, 1280, 1320, 1440 and 1920: no soft hyphens, no word overflows its cell, nothing is cut off with an ellipsis, and the day tabs stay over their columns. The tightest fit is CONDITIONING with 2.9 px to spare at 1024. |
| v2.5 | 29 Oct 2026 | Faces fix, RULINGS #46 (archive `archive/v2.4-pre-faces/`). The boxing clip in Next up (`boxing-tall.mp4`) had a head cut by the source frame's left edge at 4.3 s and heads 2 px from the edge at 2.6 to 2.7 s. Next up now uses a new face-safe pair cut from the same Pexels footage: `assets/video/boxing-facesafe-tall.mp4` (218 KB) and `assets/img/boxing-facesafe-tall-poster.webp`. `assets/js/page.js` points the boxing clip at it. The old pair stays in the folder, unused. The engine faces check (`engine-v2/qa/faces.js`) passes at 390 and 1440 with 0 issues. A per-frame check of the 76 and 84 px cards at 30 fps found every detected face at least 15 % inside the frame (the boxer's head at least 33 %). The poster is at least 15 % inside too. |
| v2.4 | 29 Oct 2026 | Layout gate v1 fixes (archive `archive/v2.3-pre-layoutgate/`): the line reveal is now a wipe up from each line's baseline with a 14 % rise (clip-path on the type, reaching 0.24 em past each line), so no line box leaves its place and nothing clips at rest (the quote mark, "people.", "//" and "Bring your" are whole); focus rings in the week grid, the Now bar and on the band's pause are inset and never cut (the grid cells no longer clip; the Now bar's hairline is an inset shadow so its 44 px targets fit, and its focus ring is an inset 2 px shadow, with an outline only in forced-colours mode); headings keep their last two words together from 340 px (`.kt`, words unchanged) and use `text-wrap: pretty`; the Recover card heading is a touch smaller on phones so its two words share a line; the footer note keeps ≤62 characters a line; the Now bar is 14 px at every width; meta labels (day labels, dates, folio numbers, field labels, seat counts) carry a `meta` class (#41: 12 px allowed); a page anchor jump is never re-scrolled by the focus fix. |
| v2.3 | 29 Oct 2026 | Handover QA v1 fixes: the restaurant photo uses a new crop (`table-crop-800.webp`, `table-crop-1360.webp`: x 10–95 % of the 1600 px still, every head whole, ≥4 % margin, RULINGS #46); the quote pause wraps inside its box at 320 px; one Sample marker for the class index (the footnote); focus never rests under a pinned bar; the Now-bar label, the concept line and "All concepts" at 14 px (13 px at 375 px and below); the separator dots dim by colour, not opacity; the pulse pauses on hover and focus; at 320 px (400 % zoom) the masthead drops its PERFORM label and the bottom bar's quote may wrap, so nothing scrolls sideways. Name: Glossy (#48). The Visit email stays (#47). |
| v2.2 | 29 Oct 2026 | **Motion and scroll pass** ("print in motion", MOTION-BRIEF v1.0, RULINGS #39): rows M1–M17 below. **engine-v2 1.1**: the page runs on `../../engine-v2/` (store key `ef-gf-v3-s2`, `sheet-base.css` before `sheet-v2.css`); the generic Book and the Duo offer open the class finder; the finder is skinned as the magazine's contents page, index and listing; the folio reads `data-step-pos` / `data-steps`. |
| v2.1 | 29 Oct 2026 | The Now / Next bar is pinned at the top (#38; on desktop the masthead pins under it, 117 px in all; on phones the masthead scrolls away, 44 px pinned); anchors clear the pinned chrome; after an anchor jump the bottom bar waits for the next scroll (#34). One bar wording (#43): "starts in" / "ends in" above 414 px, "in 01:58" / "01:58 left" on phones, avatar and trainer name at every width, no ellipsis. Text floor (#41): class and coach names 14 px (13 px in the bar at 375 px and below), labels 12 px, the week-grid chips 14 px with soft hyphens. Visual audit v1: the cover lines go two columns from 768 to 1179 px (S2-1); the chapter anchors sit on each chapter's text column (S2-3). Name: Coffee Table (#44). |
| v2.0 | 29 Oct 2026 | Home v2's best practices applied in the Editorial style (P1–P23 in `ef-gf/upgrade/BEST-PRACTICES.md`, `RULINGS.md` v1.1): Google rating line, rotating real review quotes, mobile fold, sticky bar with Raoul's quote and the pulse, seat dots, class clips, desktop trust row, a class-action cover band, the week as section 1, the live Now / Next bar, no joke, 497 reviews, "Full · Join waitlist". New skin `assets/css/sheet-v2.css` for the two-step sheet, ready for engine-v2. Every visible change is in the table below. |
| v1.2 | 28 Oct 2026 | Final QA fixes. |
| v1.1 | 27 Oct 2026 | Review fixes (cover first on phones, editorial sheet skin, folio step labels, and more). |
| v1 | 27 Oct 2026 | First release of the Editorial style. |

## Every visible change in v2.0, and why

| # | Pattern | Where | Change | Why |
| --- | --- | --- | --- | --- |
| 1 | P23 | Very top | The concept line becomes a 44 px live bar: "Next · [icon] Boxercise · [avatar] Rey · starts in 29:12" (or "Now … ends in"), ticking every second in Bali time, over the class's own footage blurred under a 70 % black layer. Tap opens that class's next bookable session. "Concept · Editorial · demo bookings only" stays on desktop; "All concepts →" stays at every width. | Raoul 29 Oct, ruling #31. Merged with the concept line so nothing stacks and the fold does not move. |
| 2 | P16 | Cover | The still cover photo becomes a class-action video band: full-bleed edge to edge (8:3) under the folio on phones; on desktop it bleeds off the right edge beside the copy. Poster first, pause control, poster only under reduced motion and Save-Data. | Raoul 28 Oct: "a much more dynamic video … stretch across width". See the P16 call below. |
| 3 | P5 | Cover, phones | The title sets on two lines ("FIND YOUR / PEOPLE."), the cover caption hides on phones, and the standfirst moves under the buttons. | Book, the Google line and the full quote must all be in the first view at 390×664 and 360×640. |
| 4 | P4 | Cover | One real Google review at a time as a pull-quote under the title (phones) or beside it (desktop): 20 px on phones, 22–27 px on desktop, a hanging quote mark, "Name, Google review" with the G. 0.4 s crossfade every 3.5 s, a pause control, static under reduced motion. | Raoul 28 Oct: quicker quotes, more prominent citations. |
| 5 | P1 | Cover | The rating line "[G] 4.7 ★★★★☆ 497 Google reviews" on a hairline under the quote, linked to the Maps reviews. | Raoul 28 Oct, Google widget with the G. |
| 6 | #29 | Cover | The "First class / Been before" toggle and its helper line are gone. | Raoul 29 Oct: "Don't understand this, remove". |
| 7 | P22 | Section 01 | The week is now the first spread after the cover (was 03). Spreads renumber to //07, the masthead nav follows. | Raoul 29 Oct: the schedule in section 1. |
| 8 | P22 | The week, desktop | The printed grid shows from 1024 px when seven columns fit (was 1200 px), and each class is a compact chip: time, class, free spots. Coach and level stay in the button's accessible name. Today's column keeps its grey tint and black day tab; no terracotta. | "Easy to understand what classes take place on what day". With the push panel open the grid falls back to the date strip and list. |
| 9 | P22 | The week, phones | Unchanged pattern: the date strip (today first) and that day's list with time, class, coach, seat dots and an outline Book. | Ruling: row Book buttons are secondary style. |
| 10 | P22, P14 | Section 01, under the week | "Next up" now sits inside the week spread, with the headline "Your coach is saving you a spot." as an H3. Its lead "The next three classes…" is gone. | P22 (Next up right after the week, or inside it); #29. |
| 11 | P14, #28 | Next up rows | Each ruled row gets a small 9:16 class clip as an inset frame beside it; nothing sits on the clip. Stock clips say "Stock clip" in the row's meta line. One "Class clips" pause control under the rows. | Raoul 28 Oct: a clip per class. WCAG 2.2.2 needs one pause for looping clips. |
| 12 | P13 | Next up, the week grid, the phone list | "Room for N more" becomes the seat row: one dot per place, free dots solid and first, "9 spots free" / "1 spot free" / "Full · Join waitlist". The legend "● free spot ○ taken" appears once, in the week's Sample note. | Raoul 28 Oct, seat row; P17 label. |
| 13 | P15 | The week head, 1024 px and up | A hairline-chip trust row beside the lead: the Google badge, "33 classes a week", "4 coaches", and from 1600 px "Open 6am to 10pm daily". | Raoul 28 Oct, desktop trust row. The hours chip waits for room so the head grows ≤10 %. |
| 14 | P2, P3 | Bottom, phones and desktop | The bar becomes a ruled black strip: "One of the top premium gyms in Bali! Must see!", the Google line, the four coach avatars and "Book a class →", which pulses (a 10 px terracotta ring, 2.4 s). Desktop: a 700 px strip 20 px above the bottom; it replaces the masthead CTA. Shown only once the hero Book, rating and quote (and on desktop the trust badge) are above the screen; hidden over the pull-quote score, the +1 offer, the footer, an open sheet and a focused field. | Raoul 28 Oct, sticky bar on desktop too, the pulse, the quote. The desktop strip is 700 px (Home v2: 620) so the dictated quote fits on one line. |
| 15 | P17 | After class | "The ice bath is cold. We checked. Twice." is gone. | Raoul 28 Oct: no joke. |
| 16 | P21, ruling 4 | Pull-quote insert | "Elite Fit's rating from 497 Google reviews" (was 488, October 2026); the read date is in the title. | Rulings 4 and 23. |
| 17 | P17 | First class FAQ | "Book a single class (300K) or bring a friend on the Duo Day Pass (225K each)" (was "Get a Day Pass (350K)"). | FACTS F2-PRC-05: the 350K day pass is never sold as a way to book a class. |
| 18 | #28 | Class features | The "Stock clip" (boxing inset) and "Stock photo" (mobility) chips move off the media into each feature's meta line. | Ruling #28: label in the meta line, nothing over media. |
| 19 | P17 | Classes, the week, Next up | One Sample marker per section: per-row chips are gone; the section notes carry it. | P17: one Sample marker per section. |
| 20 | P6 | Spreads | A hairline now separates Classes and Coaches, which are both black after the week moved up. | Keeps the spread edge readable. |
| 21 | P7–P12 | Booking sheet (after the engine switch) | `sheet-v2.css`: flat black, white top hairline, folio "01//02" from `data-step` / `data-steps`, a byline-style coach head (112×140 portrait), the full review as a ruled pull-quote, four numbered tiles "(.01)" to "(.04)" with the drop-in outline and "Most chosen" pill, a one-line ruled strip, underlined fields, an equal outline pay pair, ruled pay-demo and Confirmed tables. Desktop: a non-modal push panel; the page makes room. | Raoul 28 Oct, two steps and low cognitive effort, in this concept's look. |
| 22 | — | Footer | "Design concept, Coffee Table, 29 October 2026." | Date of the upgrade; the concept's name (#44). |
| 23 | #38 | Top | The Now / Next bar stays pinned while scrolling. Phones: only the bar (44 px plus the safe area); the masthead scrolls away. Desktop: the masthead pins under it (117 px together). The desktop push panel starts under the bar; the phone sheet's backdrop covers it. | Raoul 29 Oct: "top slim bar with current class is sticky". |
| 24 | #38, #34 | Every anchor | Anchor targets and focused elements clear the pinned chrome (scroll-margin-top = chrome + 16 px). After an anchor jump the bottom bar waits until the visitor scrolls again, so no fixed bar rests on a face or a heading. | #34 at rest after a jump. |
| 25 | #43 | Now / Next bar | One wording: "Next · [icon] Boxercise Beginner · [avatar] Rey · starts in 29:58" above 414 px; "Next · [icon] Boxercise · [avatar] Rey · in 29:58" (Now: "39:58 left") on phones, on up to two lines inside the bar. The concept line shows from 1024 px only. | RULINGS #43. |
| 26 | #41 | Bar, week grid, sheet | Text floor: 14 px for class and coach names (13 px in the bar at 375 px and below), 12 px for labels; the grid chips keep 14 px from 1024 px with soft hyphens in long class names. | RULINGS #41. |
| 27 | S2-1 | Cover, 768–1179 px | "In this issue" sets in two columns, so no title runs into the next. | Visual audit v1, P0. |
| 28 | S2-3 | Class chapters | `#family-…` anchors sit on each chapter's text column, so a cover-line jump lands on the chapter title, not on the photo above it. | Visual audit v1. |
| 29 | #40 | The week's day selector | Tabs sit 8 px apart (2 px at 375 px and below), each at least 44 × 44; phones use 16 px insets; on desktop the grid's day columns share the same 8 px spacing, so each tab stays over its column. | RULINGS #40. |
| 30 | P6 | Pull-quote insert | The bottom bar now hides as soon as the 4.7 score enters the screen (it hid 60 px later, so the score could peek in under the bar at 360 px). | One rating per screen. |
| 31 | Layout gate v1 | Headlines, the week grid, the Now bar, headings, footer note | Line reveals wipe up from the baseline (clip-path on type, no box leaves its line, nothing clips at rest); inset focus rings in the grid, the bar and on the band pause; the last two heading words stay together from 340 px; footer note ≤62 ch; Now bar 14 px; `meta` class on meta labels. | LAYOUT-GATE-v1 (P0 clipping, focus rings, #41 text, widows, line length). |
| M1 | Motion: easing | Everywhere | One family: `--ease-out: cubic-bezier(.2,.7,.2,1)` for reveals, `--ease` for UI, and a critically damped spring `linear()` (no overshoot) for the bar, the day indicator, the masthead indicator and the sheet. | MOTION-BRIEF: one easing family, no bounce. |
| M2 | Motion: skim-first | Cover | The cover's load entrances (title slide-up, frame clip, copy fade) are gone: the headline, Book, rating and quote paint final. Anything already on screen at load is marked revealed by motion.js. Ambient motion only: the band video, the quote rotator, the Now-bar surface. | Hard rule 2. |
| M3 | Motion: page turn | Cover, scrolling away | The band dims to 45 % and the "00//07" folio lifts a little faster than the type (scroll timeline, opacity and transform only, no transform on the footage). | Layered speeds in the hero without touching faces. |
| M4 | Motion: hairlines | Every rule, Next up rows, index rows, facts, cover lines | Rules draw from the left like a ruler (scaleX, 0.6 s). | Print in motion. |
| M5 | Motion: folios tick | Every spread head; the 4.7 score | The second folio digit rolls from 0 to its number (transform on a digit column, 0.6 s); the 4.7 rolls up once. The final text stays for screen readers. | "Folio numbers ticking". |
| M6 | Motion: line masks | Headlines and the pull-quote | One mask per line, 0.5 s, 55 ms apart; never on body copy. | "Pull-quotes revealed line by line". |
| M7 | Motion: heads | Section leads, trust row, filter chips, feature lines, offer copy, notes | They follow the headline with a short rise (≤0.56 s, delays ≤0.2 s). | Calm, literary pace. |
| M8 | Motion: photographs | Features, After class, First class, Visit | Frames settle onto the page (opacity and a 28 px drop, no clip-path). Stills drift with the scroll (view timeline: ±4 % at 1.09, the sculpt still ±2.5 % at 1.06) only where every face keeps ≥10 % of the frame at both extremes, measured at 390, 768, 1440 and 1920: boxing 18.6 %, mobility 12.9 %, sculpt ≥14.8 %. Coach-spot, the restaurant table and the jacuzzi stay still (7.3 % or less). | Faces rule 4; "images settling inside their frames with slight parallax". |
| M9 | Motion: rows | First-class steps, Next up rows, coaches | Staggered rises (60–80 ms apart, groups end ≤0.9 s); the big step numerals rise from their baseline (clip on type only). Portraits: opacity and translate only, no scale, no hover zoom. | Faces rule 4. |
| M10 | Motion: the week | The week | Day tabs and grid chips cascade column by column (55 ms a column, ≤0.8 s); phone rows rise; the day indicator glides on the spring; day and filter changes cross over as one View Transition (old day out left, new day in), instant without support or under reduced motion. | "Tile or row cascades in the week grid"; View Transitions for in-page states. |
| M11 | Motion: cover lines | "In this issue" | The four lines rise one after another under their hairlines. | Contents-page feel. |
| M12 | Motion: footer | Logotype | The ELITE FIT logotype rises into its mast once. | A closing page. |
| M13 | Motion: running head | Masthead, 1024 px and up | One 2 px rule glides to the nav link of the spread in view (IntersectionObserver; one transform write per hand-over). | "Spreads handing over with sticky folios". |
| M14 | Motion: micro | Buttons, chips, coach cards, focus, FAQ | Press scale 0.97; 2–3 px lifts on fine pointers; the focus ring settles in; an opened FAQ answer fades down. | Micro-interaction menu. |
| M15 | Motion: bar | Sticky bar | Slides in on the spring (0.45 s); the pulse is now a ring on a pseudo-element (opacity and transform), not a box-shadow. | Hard rule 7. |
| M16 | Motion: finder and sheet | The class finder, the sheet | Finder rows cascade (35 ms apart, ≤0.5 s); the sheet slides on the spring (0.45 s). | Sheet open with a spring ≤0.45 s. |
| M17 | Motion: removed | motion.js | The JS parallax fallback and the fast-scroll class (both scroll listeners) and the clip-path frame reveal are gone. Browsers without scroll timelines show the stills still. | No scroll listeners for animation; faces. |
| E1 | engine-v2 | Sheet, finder | Generic "Book a class" (hero, sticky bar) and "Get a Duo Day Pass" open the finder (step 0 "How do you want to pick?" as a contents page, By day, By class as a numbered index of all ten classes, Show week as a listing). Class Books (Next up rows, the week, the Now bar, coaches) go straight to step 1. The Duo note under the week is gone (the engine keeps the pass). | RULINGS #30, #36, #37. |

## P16: how much full-bleed fits Editorial

Editorial's cover was a still photo, with video only in small inset frames. Raoul's request ("much more dynamic video … stretch across width") is kept in a magazine form, not as Home v2's full-screen hero:

- **Phones:** the cover band runs edge to edge under the folio, like a cover photo that bleeds off the page. At 8:3 it keeps the first view for the title, the quote, the Google line and Book.
- **Desktop:** the band sits beside the copy and bleeds off the right edge of the screen. A band across the whole width under the title would push Book below 900 px, and a full-screen video behind the title would put text on moving footage.
- **Footage:** a 8.8 s montage of three real Elite Fit class shots (kettlebell deadlifts wide, kettlebell close, core work on mats), 8:3, every face whole in frames sampled every 0.5 s. It is calmer than Home v2's new montage, which is still being cut; that montage can replace this file once it lands in `variants/s3-home-v2/assets/video/`.

## How to view and test

- `?now=2026-10-28T07:30` sets the Bali clock (the Now / Next bar, Next up and the week follow it); `?class=<id>` opens that class.
- The page runs on engine-v2 1.1 (`../../engine-v2/api.js` with `data-store-key="ef-gf-v3-s2"`, `booking.js`, `sheet-base.css` then `assets/css/sheet-v2.css`). `?finder=1` opens the finder.
- The step folio reads `data-step-pos` / `data-steps` on `#sheet` ("01//03" on the finder, "02//03" on step 1); none on pay and Confirmed.
- `assets/css/sheet.css` (the v1 five-step skin) and `assets/js/paths.js` stay in the folder but are no longer loaded.

## Files

This variant's own files (new in v2.0 marked):

| File | Purpose |
| --- | --- |
| `index.html` | The page |
| `assets/css/editorial.css` | Tokens, grid, type, every section, the v2.0 components (rating line, seat row, clips, trust row, sticky strip, pulse, Now / Next bar, week chips), the motion block at the end |
| `assets/css/sheet.css` | The v1 five-step skin, unchanged, used until the engine switch |
| `assets/css/sheet-v2.css` (new) | The Editorial skin for engine-v2's two-step sheet |
| `assets/js/page.js` | Renders and wires the page: the Now / Next bar, the cover quotes, Next up, the class features, the week, filters, coaches, the sticky bar rule |
| `assets/js/paths.js`, `assets/js/motion.js` | Unchanged |
| `assets/video/cover-band-d.mp4`, `cover-band-m.mp4`, `assets/img/cover-band-d.webp`, `cover-band-m.webp` (new) | The cover band (1120×420, 560 KB; 800×300, 300 KB) and its posters |
| `assets/video/{boxing,conditioning,mobility,sculpt}-tall.mp4`, `assets/img/*-tall-poster.webp` (new copies) | Next up clips, copied from `../s1-stage/assets/` |
| `assets/video/conditioning-ef-tall.mp4`, `assets/img/conditioning-ef-tall-poster.webp` (new) | Next up clip for conditioning, club footage (296 KB) |
| `assets/video/nowbar-{boxing,conditioning,sculpt,mobility}.mp4`, `assets/img/nowbar-*.webp` (new) | The Now / Next bar surfaces, 480×60, blurred, 8–25 KB each |

Shared and untouched: `../../v1/assets/js/{api,booking,media}.js`, `../../v1/assets/data/groupfitness.json`, fonts, logos, coach photos and avatars. `conditioning-tall.mp4` (stock) stays in the folder but is no longer used, because club footage exists for conditioning (ruling #28).

## Media and provenance (ruling #28)

| Use | File | Source | Real or stock |
| --- | --- | --- | --- |
| Cover band | `cover-band-*.mp4` | Shot 1: `../s3-home-v2a/assets/video/hero-d.mp4` (club header film 0:04.9–0:05.7, kettlebell deadlifts), crop 1184×444 at 96,96. Shot 2: `../../v1/assets/video/sculpt.mp4` 0–1.4 s (header film 4.84–5.60 s, kettlebells close), crop 1120×420 at 160,60. Shot 3: `../s1-stage/assets/video/sculpt-wide.mp4` (header film core-work shot), crop 800×300 at 480,130. Hard cuts, 24 fps. | Real, Elite Fit |
| Next up, sculpt | `sculpt-tall.mp4` | `../s1-stage/assets/video/` (header film core-work shot, 9:16) | Real, Elite Fit |
| Next up, conditioning | `conditioning-ef-facesafe-tall.mp4` (v2.7, crop at x 410; was `conditioning-ef-tall.mp4`, crop at x 330) | `../s1-stage/assets/video/conditioning-wide.mp4` (header film kettlebell shot), 9:16 crop 405×720 at 410,0 (v2.7; 330,0 before): one member, whole head at least 19 px inside the card in every frame | Real, Elite Fit |
| Next up, boxing | `boxing-facesafe-tall.mp4` (v2.5; replaces `boxing-tall.mp4`) | Pexels video 34801443 (khezez), original 2160×3840 download: the 0.33 to 0.70 s stretch, scaled to 720×1280, slowed 3x with motion interpolation, played forward then back (2.33 s loop). The poster is its first frame. The window ends before a second person enters at the left edge. Every frame was checked with YuNet at 30 fps. | Stock, labelled "Stock clip" in the row |
| Next up, mobility | `mobility-tall.mp4` | `../s1-stage/assets/video/`, Pexels video 6326791 (Pavel Danilyuk) | Stock, labelled "Stock clip" in the row |
| Now / Next bar | `nowbar-*.mp4` | Conditioning and sculpt: the two club shots above; boxing: `../../v1/assets/video/boxing.mp4` (Pexels); mobility: `../s1-stage/assets/video/mobility-wide.mp4` (Pexels 6326792). Strips cut from legs, equipment and the gym wall (no face in any crop), then blurred (sigma 25) and slowed to 0.6×. | Real for conditioning and sculpt; stock for boxing and mobility, blurred to colour only |
| Class features | unchanged from v1.2 | See v1.2 credits: boxing inset clip and mobility still are Pexels stock, now labelled in the meta line | as before |

GO-LIVE: replace the boxing and mobility stock clips, and the boxing and mobility Now-bar surfaces (stock, blurred to colour, no on-bar label per RULINGS #33), with club footage.

## Reviews and rating

- Rating 4.7 from 497 Google reviews, read 28 Oct 2026 (FACTS F2-REV-01). Shown with no date on the page (ruling 4); the date is in the link titles.
- Cover quotes, verbatim cuts of 12 words or fewer from `ef-gf/s3v2/reviews/` (raw text checked): "Amazing facilities and great classes." (Alex F., R02); "…the trainers are friendly, knowledgeable…" (Sonal P., R01); "Excellent gym with top-level equipment, a great range of classes…" (Tom H., R03); "…The trainers are absolute experts…" (Edi H., R04); "…Great variety of classes and equipment is exceptional ." (Kieran H., R05). They are in the HTML, so the box is sized before any script runs. A quote that needs more than 2 lines on phones (3 on desktop) is skipped at that width; at 360 px that is Tom H.'s.
- The pull-quote insert keeps Skye D.S. from v1.2.

## Sample items (one marker per section on the page)

- Free spots, waitlists, dates and the capacity per class (engine-v2's `v2.json` capacity; until the switch the seat row falls back to 12 places or the free count).
- Levels marked Sample, the four families and their feel lines, the Injury Prevention & Mobility length, and the class descriptions the club has not written (one Sample note covers them under the class chapters).
- The coach invitation lines in the sheet, until each coach approves.
- "Most chosen" on the Class drop-in tile (no chip on the page; GO-LIVE).
- The sticky-bar quote "One of the top premium gyms in Bali! Must see!" (no reviewer found in the 120 pulled reviews; GO-LIVE: source it or have the club approve it).
- The stock clips and stock photo above.

## Desktop trust row facts

"33 classes a week" and "4 coaches" (FACTS F2-CLB-03), "Open 6am to 10pm daily" (F2-HRS-01), the Google badge (F2-REV-01). No awards or certifications are claimed.

## Deviations

- **Week order:** seven days from today, not Mon–Sun, so the dates read left to right in order and match the phone's date strip (today first).
- **Grid chips:** time, class and free spots only; coach and level are in the accessible name and the sheet.
- **Desktop strip width:** 700 px instead of 620 px (row 14).
- **Next up inside the week spread:** the classes in it repeat the first rows of today's list; the rows add the clips and the "saving you a spot" line.

## Fonts and logo

Same as v1, see `../../v1/README.md` ("Fonts and logo").

## QA (29 Oct 2026, v2.2 on engine-v2 1.1, after the motion pass)

- **Journeys** (scripted, WebKit 390 and Chromium 1440, each to Confirmed): class drop-in 4 taps + 2 fields, Duo 4 + 2, membership 5 + 2, member 3 + 1; finder shortcut drop-in 5 + 2, By day today 6 + 2, By day another day 7 + 2, Show week Duo 6 + 2; the Duo offer through the finder 5 + 2. 0 errors, 0 404s, 0 third-party requests.
- **Finder layout sweep** (step 0, By day, By class, one class's sessions, Show week at 360, 375, 390, 1440): 0 overlaps, 0 clipped text, every target ≥44 px, text ≥12 px and class names and times ≥14 px. No terracotta on any finder screen; By class lists all 10 classes.
- **Focus:** phones modal (Tab stays in the sheet, the Now bar is inert), desktop non-modal; Esc returns focus to the opener at both.
- **Folio:** 01//03 on the finder, 02//03 on step 1, 03//03 on step 2, none on pay and Confirmed.
- **Fold:** hero Book bottom 646 px at 390×664 and 629 px at 360×640, with the rating and the full quote above it, motion on and off.
- **Sweeps** at 360, 390, 1024 and 1440, also with motion mid-flight (150 ms a step): at most 1 rating and 1 terracotta button per screen; no horizontal scroll.
- **#38 / #34:** the Now bar stays at the top at every width (masthead pinned under it from 1024 px: 117 px); every anchor lands with its heading below the pinned chrome; after all 11 anchor jumps no fixed bar rests on a face (YuNet face boxes, 390×844, 390×664, 1440). The visual-audit probes: `coverlines.mjs` overflow 0 and overlaps 0 at 768–1920; `anchorprobe.mjs` `bad: []` at m390 and d1440.
- **Scroll trace** (Chromium, real wheel input, top to bottom, GPU raster): 390 with 4× CPU throttle 97.6 % of frames on time, 1440 99.1 %; 0 forced layouts in scroll or animation frames; one task of about 52–55 ms at the very first wheel (y = 120) at both sizes. It is almost all `Commit` (the renderer waiting for the compositor) and also shows with reduced motion, so it is not the motion pass. Motion JS 3.4 KB gzip.
- **Faces through motion:** frame strips of three reveals (coaches and the week at 1440, a class chapter at 390) with the face boxes checked on every frame: 0 faces cut. Parallax extremes: see M8.
- **Lighthouse mobile,** gzip server, median of 3: performance 100, accessibility 100, best practices 100, CLS 0, LCP 1.8 s, TBT 3 ms.
- **Reduced motion and Save-Data:** final states at once, posters only, no rotation, no pulse, no parallax; the countdown keeps ticking.
