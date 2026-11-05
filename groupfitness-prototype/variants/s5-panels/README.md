# Elite Fit Group Fitness page: Tactile concept

Raoul named this concept Tactile on 29 Oct 2026 (RULINGS #48, which replaces #44 "Pocket Club"; it was "Panels app"). Every block is a card or a button. The panel you tap grows into the booking, and phones get a tab bar. The folder and URL stay `variants/s5-panels`.

| | |
| --- | --- |
| Version | v2.8.2, 30 Oct 2026 (on engine-v2 1.2.2) |
| Live page | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s5-panels/ |
| Baseline | [`../../v1/`](../../v1/) (same content, data and brand rules) |
| Previous versions | Archived unchanged in `ef-gf/variants/s5-panels/archive/` (scratchpad): `v1.2/` and `v2.0-pre-motion/` |
| Status | Design concept, not the club's live website. The page carries `noindex, nofollow`. |

## Direction in three lines

1. Booking-first and app-like: the page behaves like the club's booking app, and every block is a control or a card.
2. It opens on full-height class panels, then the week straight away on a white app surface (phones: a day selector and that day's classes; desktop: the seven days side by side), then Next up with a small clip per class.
3. One app unit at the bottom on phones: the tab bar, and once the hero has scrolled away, the sticky bar's quote and rating strip on top of it with the pulsing Book in the tab row. The tapped panel, row, chip, ticket, coach card or Now bar grows into the booking sheet (View Transitions, slide as the fallback).

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v2.8.2 | 30 Oct 2026 | **Layout gate A, pass 2 (`ef-gf/audit-visual/GATE2-FIXES-v1.md`).** (1) `h2#schedule-title` moved 18 px "after load" at 1440 and 1920. The cause is the rise reveal, not content: the heading waits at `translateY(18px)` until it has been scrolled into view, and its box then moved 18 px (the browser's CLS stays 0 because a transform is not a layout shift). The rise now runs on a `span.rise-in` inside the heading (same 18 px, fade and spring), so the heading's own box is fixed from the first frame; the page looks and moves as before. (2) `.panel__hit:focus-visible` draws its ring as an inset 3 px white shadow on its own box (`box-shadow: inset 0 0 0 3px`; it was an outline at offset -3 px, the same band), so `.panel`'s `overflow: hidden` can never cut it; forced-colours mode keeps an outline. The 1200 px and wider `::after` ring over the caption is unchanged. (3) `--field-label-size: 1rem` on the sheet's label rule keeps the 16 px labels under engine-v2 1.2.2's 14 px floor. `.offer__tag` is untouched (it passes under RULINGS #57). Archive: `ef-gf/variants/s5-panels/archive/v2.8.1-pre-gate2/`. |
| v2.8.1 | 29 Oct 2026 | Faces (#51): the Mobility panel's source frame showed a 1 to 3 px sliver of a third person's head at its right edge. From 1200 px the open tile's picture runs 4 % wider to the right, and the panel crops that strip. A closed tile is taller than the frame and already crops its sides, so it keeps its framing. Archive: `archive/v2.8-pre-sliver/`. |
| v2.8 | 29 Oct 2026 | RULINGS #54 and HANDOVER-QA v2. The dock's coach face row keeps its overlap, but smaller: 3 px at 24 px and 5 px at 34 px, so a neighbour only covers hair, shoulder or background, never a face. On desktop the faces fade out before the dock slides away and fade in once it has landed, so no face is cut by the screen edge mid-slide. The faces stay hit-testable while the dock hides. New `assets/js/avatars.js`, loaded right after api.js, points the coach data at the engine avatar set before anything renders, so WebKit never fetches a v1 avatar (it did on the finder and step 2 deep links). T-3: from 1200 px the focus ring is also drawn on a layer above the caption strip, so it is whole all round. That also undoes a v2.3 side effect: the open panel's hit area runs the full column again, so its caption fills the column at the bottom (Mobility & Stretch no longer spills out of the tile) and no clip shows below the ring. Beside the open side panel, Next up tickets keep at least 300 px (two per row at 1440). Ticket notches sit on the dashed line even when the foot wraps, and a shorter card keeps its foot at the bottom. At 360 px the dock gives back 8 px, so the rating keeps a right gutter. The row hit-layer card is skipped (RULINGS #55). Archives: `archive/v2.7-pre-stack/`, `archive/v2.8-pre-handover2/`. |
| v2.7 | 29 Oct 2026 | We looked for a sharper Boxing still and found no larger source. The club's "Better together" film is only 720×1280, so the current 640×300 still already holds every native pixel of that shot. No other club video contains it. The page is unchanged; a sharper ticket needs the club's original master of the film. Archive: `archive/v2.6-pre-still/`. |
| v2.6 | 29 Oct 2026 | Final faces round. The Boxing ticket is now the club still Loud uses (a glove at the bag, no face) with a slow ken-burns for motion-ok visitors, so it no longer says "Stock clip". The Conditioning ticket window was nudged (`conditioning-ticket2.mp4`) so the headless shoulder at the right edge is gone, and both heads stay at least 11.8 % clear. Coach avatars now come from `engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp` with srcset and sizes (RULINGS #53, #53a), in the page and in the engine sheets. The page makes 0 requests to the v1 avatars. Archive: `archive/v2.5-pre-final/`. |
| v2.5 | 29 Oct 2026 | Faces (RULINGS #51, engine 1.2.1 faces run): the Boxing and Conditioning tickets get new face-safe clips, `boxing-ticket.mp4` and `conditioning-ticket.mp4` with their posters. Every whole head sits at least 14.9 % inside the frame, or fully outside it. `conditioning-wide.mp4` stays on the hero panel, and `boxing-wide.mp4` is now unused. Archive: `archive/v2.4-pre-faces51/`. |
| v2.4 | 29 Oct 2026 | Visual audit v2 card T-3: the panel focus ring sits 3 px inside the panel edge, so the Play pill no longer covers it. Archive: `archive/v2.3-pre-T3/`. |
| v2.3 | 29 Oct 2026 | Layout gate v1 fixes (see the difference table). Archive: `archive/v2.2-pre-layout/`. |
| v2.2 | 29 Oct 2026 | Named Tactile (#48). Handover QA v1 fixes: label-in-name on the Now bar and the clip control, 320 px reflow, the sticky Book as large text, the hero G line back on desktop with the trust row moved to the Next up head, the day-selector targets and gaps (#40), full-opacity panel text, posters only under Save-Data, the week-grid headings and 14 px names, the bar's box clear of the tabs, the week and Next up as direct sections of main, the dead joke rule removed. |
| v2.1 | 29 Oct 2026 | On engine-v2 1.1 with the class finder (store key `ef-gf-v3-s5`), skinned in the app look. Named Tactile (#48, after Pocket Club under #44). The Now / Next bar is pinned at the top (#38) with the #43 wording. Visual audit cards S5-1 and S5-2 fixed. The motion and scroll pass (MOTION-BRIEF, #39): app physics in every section (see Motion). |
| v2.0 | 29 Oct 2026 | The Home v2 best practices (P1 to P23) and rulings 1 to 31, each in this concept's own components. See the difference table. The booking sheet skin for the two-step engine-v2 sheet is written; the script switch to engine-v2 follows when it is ready. |
| v1.2 | 28 Oct 2026 | Final QA fixes. |
| v1.1 | 27 Oct 2026 | Review fixes (phones open on the panel stack, phone sheet transition, Book pill in the tab bar, ticket confirmation). |
| v1 | 27 Oct 2026 | First version. |

## Difference table (v1.2 → v2.0)

Every visible change, where it sits, and why. Anything not listed here did not change.

| Pattern | Where | Why |
| --- | --- | --- |
| P1 Google line | Hero (under the Book), the sticky bar, the desktop trust row. One component: official G, 4.7, stars drawn to 4.7, "497 Google reviews". White on black, black on the white surface. | Raoul's Google widget with the G. Ruling 4: no date on the widgets; the read date (28 Oct 2026) is in the link title and here. |
| P2 sticky bar, phones | Joins the tab bar as one black unit: a strip with the quote "One of the top premium gyms in Bali! Must see!", the four coach avatars and the Google line sits on top of the tabs, and "Book a class →" takes the right end of the tab row (where v1.2's small Book pill was). 117 px together. On narrow phones (<480 px) the tab names hide while the Book is in the row; the icons stay, and screen readers still hear the names. | The bar vs tab bar call (see below). Stacking a separate bar would have cost about 180 px of screen; this keeps both within the 120 px cap. |
| P2 sticky bar, desktop | A floating grey app card, bottom centre, 700 px wide, 78 px tall: avatars, quote over the Google line, Book. It replaces the header CTA, which no longer shows at any width. | Raoul: "add bottom sticky bar to desktop as well". 700 px instead of v2's 620 px, so the quote stays on one line beside the Book. |
| P2 show rule | Shown only once the hero Book, the hero rating and the hero quote have scrolled away and the desktop trust row is off screen. Hidden over the +1 offer and the footer, with a sheet open and while a page field has focus. | Rulings 6 and P6: one rating and one terracotta button per screen. |
| P3 pulse | A terracotta ring grows about 10 px from the Book and fades, every 2.2 s. box-shadow only. Off on hover and focus, with the tab hidden, under reduced motion and Save-Data, and whenever the bar is hidden. | Raoul: "gently but noticeably pulsing". |
| P4 hero quotes | Under the rating line: one real Google quote at a time, every 3.5 s, 0.4 s crossfade, 19 px on phones and 26 px on desktop, attribution 15 to 16 px with the G. The pause control sits at the end of the rating line (phones) or beside the quote (desktop). Static under reduced motion. | Raoul: "quicker alternating ... make citations more prominent". |
| P5 fold | Phones: Book, rating and the full quote with attribution end at 256 / 307 / 385 px at 360 to 390 wide. | Raoul: rating and quote above the fold on mobile. |
| P6 / P15 trust row | Desktop only: top right of the week head, above the lead. The Google badge plus "33 classes a week", "10 class types · 4 coaches" and "Open 06:00 to 22:00, every day" (the last one from 1440 px). On desktop the hero's rating line moves here. The head stays its height (165 px at 1280 to 1920). | Raoul: "make better use of this section here ... trust badges". Facts: F2-CLB-03, F2-HRS-01. |
| P13 seat dots | Replace the 14-bar spot meter everywhere (schedule rows, desktop grid chips, tickets, and the hero panel class lines as text). Free dots solid and first, taken ones as rings, in groups of five above 12 places, label "N spots free" / "1 spot free" / "Full · Join waitlist", screen readers hear "5 of 12 spots free". Fill in 0.4 s at most. The legend appears once, in the schedule's Sample note. | The meter read as a bar meter (catalogue note). |
| P14 clips on tickets | A 16:9 clip on top of each Next up ticket, one per class family, nothing on the clip. "Stock clip" sits in the ticket's meta line. One "Pause class clips" control under the tickets. | Raoul: "Add a small video on top of each black card". |
| P16 panels' footage | The panels stay this concept's hero. Conditioning now plays the club's own film (ruling 28), framed per shape like Sculpt: full height on phones, the whole 16:9 frame on tablets, its 9:16 window on desktop. Every clip stays poster-first and pauses off screen. The pause control has a solid black background, never a translucent scrim. | P16 adapted: Panels has no single hero video. |
| P17 copy | No ice bath joke. 497 reviews (also in the Visit quote caption, with 28 Oct 2026). "Full · Join waitlist". The FAQ now names the sheet's products: class drop-in 300K and the Duo day pass 225K each. | Rulings 19, 23 and 25. |
| P18 brand | "Stock clip" chips no longer sit on clips. The "together" chips on the photo cards are solid black instead of a translucent scrim. | Nothing overlays a clip; no scrims. |
| P22 week first | The week moved straight after the hero; Next up follows it. Phones: the existing day selector and that day's list. Desktop (1024 px and up): the seven days side by side, today first and outlined in black (no terracotta), each class a chip with time, class, coach and seat row; a tap opens the sheet. One timetable only. | Raoul, 29 Oct: "Add the schedule in section 1 immediately". |
| P23 Now / Next bar | Takes the concept line's place at the very top, 44 px, on phones and desktop: class icon, Now or Next, the class, the coach's avatar and name, "ends in" / "starts in" with a ticking countdown. The surface is that class's footage, blurred past recognition and darkened in the file itself, so no overlay sits on the page. A tap opens the next bookable session of that class. "All concepts" stays in the bar ("All →" on phones). | Raoul, 29 Oct: "Show as a minimal top bar what's running right now with a countdown". |
| Ruling 29 | The "First class / Been before" switch, its helper line and the "next three classes" lead are gone. | Raoul: "Don't understand this, remove". |
| 360 px overflow | Fixed (was 5 px, from the coach cards). Narrow phones get a 104 px coach photo. | Catalogue note. |
| #38 pinned bar | The Now / Next bar stays at the top while scrolling. Phones: only the bar (45 px); the app bar scrolls away. Desktop: the app bar sticks under it (117 px together). The week's date bar docks under that chrome, every anchor lands below it, the phone sheet's backdrop covers the bar, and the desktop panel starts below it. | Raoul: "top slim bar with current class is sticky on desktop and mobile". |
| #43 bar wording | The trainer's name at every width, "01:58" under an hour and "1:12:05" from an hour, short phone labels ("23:14 left", "in 1:12:05") at 414 px and below, no ellipsis (13 px only at 375 px and below). | The same wording in every concept. |
| S5-1 (P0) | The concept note in the bar shows only from 1024 px; below that only "All concepts". The countdown no longer runs into it at 768 to 1023 px. | Visual audit v1. |
| S5-2 (P1) | The Sample chip under the panels is gone (the item is in the Sample list below), and so is the Sample line in the filters sheet. One capacity chip per list remains. | Ruling 11. |
| Name | "Tactile" in the page title ("Group classes · Elite Fit Bali · Tactile"), og:title, the concept note, the footer and this README. The folder stays `s5-panels`. | RULINGS #48 (replaces #44). |
| Engine switch | The page runs on engine-v2 1.1: `../../engine-v2/api.js` (store key `ef-gf-v3-s5`), `sheet-base.css` before this skin, `../../engine-v2/booking.js`. "Book a class" in the hero and the sticky bar opens the class finder, and "Get a Duo Day Pass" opens it with the Duo pass. The engine binds those buttons, so the page's own Duo flag and its note are gone, and `paths.js` is no longer loaded (the file stays). Rows, week chips, tickets, the panels' class lines, the coach view and the Now bar open the class directly. | RULINGS #30, #36, ENGINE-SWITCH. |
| Finder skin | The finder in the app skin: grey cards, white for the picked day, dashed for full, no terracotta; the type headers carry the same line icons as the Now bar; each screen's rows settle in a short cascade on the spring. The engine's sizes, gaps and text floors are untouched. | FINDER-SPEC v1.1 §7.9. |
| Shared elements in the sheet | Tapping a finder row or chip morphs its class name onto step 1's class line; tapping a tile morphs the coach portrait into the step-2 strip avatar. Shared boxes clip their own crop, so no face is cut mid-morph. | Panels' View Transitions, kept and extended. |
| #32, #33 | The desktop grid stays today-first. The Now bar's stock-derived surfaces (boxing, mobility) are blurred past recognition, carry no on-bar label, and are listed below as "replace with club footage". | Rulings 32 and 33. |
| Sculpt ticket clip and crops | The Sculpt ticket plays a 16:9 window of the club's sculpt film that keeps every head well inside the frame or out of it; the full frame put the instructor on its edge. The boxer gets more headroom on phones. "What to bring" is now a 4:3 crop of the top of the photo, so the reclining woman (whose head the photo's own edge cuts) is out of frame. | Faces rule, from the motion QA. |
| QA fixes | The hero quote box reserves its height. The Now bar's content and "Open now" keep their space while the data loads (CLS). The tab and nav indicators never read layout while scrolling. The header hairline uses a sentinel, not a scroll listener. Reduced motion and Save-Data get no transform transitions. A touch tap no longer scrolls under the finger before its click lands. | MOTION-BRIEF performance gates, rule 6. |
| Handover QA v1 | The Now bar's and the clip control's names start with their visible text. PERFORM steps out of the app bar below 360 px (no sideways scroll at 320). The sticky Book is 19 px bold, which counts as large text. The hero keeps its G line on desktop too, so the first screen at 1440 shows one rating; the trust row moved to the empty top right of the Next up head, a section away, so a screen never shows two. Day targets are at least 44 px: 2 px gaps at 375 and below, 8 px above. The panels scale back but never dim. Under Save-Data no Now bar video loads. The week-grid dates are 800 caps and the class names 14 px. The bar's box on phones is only the strip above the tabs, so it never covers a focused tab, and a hidden bar is never hit-tested. The open desktop panel's hit covers its media column only. The week and Next up are direct sections of `main`. | HANDOVER-QA-v1, RULINGS #3, #40, #41, #43. |
| Layout gate v1 | The date bar steps out where the week ends instead of sliding under the pinned Now bar, so "All concepts" never lands on Filters. Anchors land exactly below the pinned chrome (scroll-margin only, no double offset), and a deep link is placed again after the timetable renders. A hash jump no longer pushes the page 1,700 px down. The bar no longer clips focus rings, and rings in rounded cards sit inset. Collapsed panel details are hidden. The "together" chips wrap, and row seat labels wrap at tablet width. The open desktop panel has room for its last link on short windows. Text: dates, tab and day labels, pass tags and the Visit labels are 14 px (the Now bar stays 13 px at 375 and below, per #43). Headings use `text-wrap: balance` (no widows), and the footer note is held to 80 characters a line. | LAYOUT-GATE-v1, RULINGS #34, #38, #41. |
| T-3 focus ring | `.panel__hit:focus-visible` is offset −3 px (it was −11 px). The ring runs along the panel edge, outside the Play pill (10 px in), and keeps the 24 px rounded corner. | VISUAL-AUDIT-v2 T-3. |
| Sheet skin | Written for the two-step engine-v2 sheet (coach header, full review card, four tiles with the drop-in highlight, one-line strip, fields, equal pay pair, Confirm). Phones: modal bottom sheet. Desktop: a floating side panel that does not cover the page, which makes room so the week stays visible. | P7 to P12, ruling 20. The engine switch follows. |

## Motion (v2.1, app physics)

Native scroll only. Everything animates on the compositor (transform, opacity, clip-path). One easing family (`--ease-out`, expo-out) and one spring for the UI (`--spring`, a critically damped `linear()`, no overshoot). Above the fold renders final on the first paint. Every reveal plays once, takes 0.6 s or less, and a group ends within 0.9 s. Reduced motion and Save-Data show the final states and posters at once.

| Pattern | Where | Why |
| --- | --- | --- |
| No load entrances | Hero headline and panels (the v1.2 line rise and panel deal are gone) | Skim-first: the first screen renders final. |
| Panels change state in one frame | The panel stack: phone taps and desktop hover. A View Transition cross-dissolves the two states in 0.36 s. The old width and height animations are gone. | Never animate layout. No box is clipped mid-change, so no face is cut. |
| Stack scales back | The hero panels scale to 0.94 and dim as the white booking surface rises over them (scroll timeline, IntersectionObserver fallback) | "Stacked panels scaling back as the next arrives". |
| Indicators glide | Tab bar and day selector on transform, the desktop nav pill on clip-path, all on the spring | App chrome that moves like an app. |
| Week deals in | Phone rows cascade (35 ms apart), the desktop grid deals its seven columns (45 ms apart), seat dots fill in sequence | One read of the week, in order. |
| Tickets deal in | Next up tickets rise 70 ms apart; the clip on each ticket only fades (no scale: faces sit close to the clip edges) | Faces rule. |
| Section heads, chips, trust row | Headlines rise on the spring, filter chips cascade, the desktop trust badges only fade (the Google G never moves beyond a fade) | Brand rule 5. |
| Photos | Scale settle 1.04 → 1 only on the two face-free frames (the entrance wall in Visit, the ice baths in Recharge; the Recharge card also opens with its clip-path mask). Every photo with people, and every coach portrait, moves by opacity and translate only. | Faces rule 4. |
| Draws | The "What to bring" ticks and the booked check draw with clip-path (no dash-offset) | Compositor only. |
| Pulse | The Book's terracotta halo is a pseudo-element on opacity and transform (the box-shadow pulse is gone) | MOTION-BRIEF rule 7. |
| Hover and press | A 2 to 3 px lift on desktop tickets, coach cards and grid chips (fine pointers only); press scale kept | Micro-interaction. |
| Skeletons | Grey placeholders breathe while the timetable loads (the only async data), then the real tickets and rows replace them | Skeleton to content on load. |
| Sheet | Opens and closes on the spring (0.42 s); step 1's four tiles settle in a 0.3 s cascade and are tappable from the first frame. The shared-element morphs (avatar to portrait, class name) are kept. | App physics; View Transitions kept. |
| Off-screen | Coaches, First class, After class, Visit and the footer skip rendering until they come near (`content-visibility: auto`) | Smooth scroll on phones. |

## The sticky bar and the tab bar

The tab bar is this concept's signature, so the sticky bar does not stack a second bar on top of it. They form one unit:

- Above the tabs, a short black strip carries the quote and the avatars with the Google line.
- The tab row keeps the four tabs and gains "Book a class →" at its right end, under the right thumb.
- While the hero's own Book, rating and quote are on screen, only the tabs show.

Together the unit is 117 px tall, inside the 120 px cap. On phones narrower than 480 px the four tabs keep their icons and drop their visible names while the Book is in the row. Every tab is still at least 44 px wide (45 px at 360), and screen readers still hear the names. With a sheet open, the whole unit slides away. On desktop there is no tab bar, so the bar is a floating card.

## Sample list (tracked here, not as chips)

- Capacity per class (10 to 16 places, engine-v2 data; 14 on the v1 engine), and with it spots, waitlists and full classes. One Sample chip per list on the page.
- Coach invitation lines in the sheet (Sample chip in the sheet).
- "Most chosen" on the drop-in tile, and the sticky-bar quote "One of the top premium gyms in Bali! Must see!" (no reviewer found; GO-LIVE item). No chip on either (ruling 11).
- The four families, their levels and feel lines (one Sample line under the panels).
- The note that the four families, their levels and feel lines are our suggestion (the hero no longer carries a chip for it, S5-2).
- "Open now" and the Now / Next bar are worked out in the browser from the published hours and the timetable; the live page would read them from the booking system.

## Media and provenance (ruling 28)

| File (this folder unless noted) | Used in | Source |
| --- | --- | --- |
| `../../v1/assets/video/boxing.mp4` + poster | Boxing panel, "Stock clip" | Pexels 34801443 by khezez. Replace with club footage. |
| `../../v1/assets/video/mobility.mp4` + poster | Mobility & Stretch panel, "Stock clip" | Pexels 6326791 by Pavel Danilyuk. Replace with club footage. |
| `../../v1/assets/video/sculpt.mp4` + poster | Sculpt panel | Elite Fit, own footage. |
| `assets/video/conditioning-wide.mp4`, `assets/img/conditioning-wide-poster.webp` | Conditioning panel | Elite Fit, own footage (copied unchanged from s1-stage). |
| `assets/video/sculpt-wide.mp4` + poster | Source of the Sculpt ticket clip and the Now bar surface | Elite Fit, own footage (copied from s1-stage). |
| `assets/video/sculpt-ticket2.mp4`, `assets/img/sculpt-ticket2-poster.webp` | Sculpt ticket | Elite Fit, own footage: a static 16:9 window of `sculpt-wide.mp4` (x 528 to 1280, y 104 to 527, frames 8 to 92, 960×540, 358 KB). Every visible head sits at least 11 % inside the frame, or fully outside it. (`sculpt-ticket.mp4`, an earlier trim, is unused.) |
| `assets/video/mobility-wide.mp4` + poster | Mobility ticket, "Stock clip" | Pexels 6326792 by Pavel Danilyuk (copied from s1-stage). Replace with club footage. |
| `assets/video/conditioning-ticket2.mp4`, `assets/img/conditioning-ticket2-poster.webp` | Conditioning ticket (v2.6) | Elite Fit, own footage: a static 16:9 window of `conditioning-wide.mp4` (x 304 to 1056, y 100 to 523, 960×540, full length, 361 KB). Two heads sit at least 11.8 % inside the frame; the outer women, heads and bodies, are fully outside. |
| `assets/video/conditioning-ticket.mp4`, `assets/img/conditioning-ticket-poster.webp` | Unused since v2.6 (kept) | Elite Fit, own footage: a static 16:9 window of `conditioning-wide.mp4` (x 300 to 1180, y 100 to 595, 960×540, full length, 360 KB). Two heads sit at least 15.6 % inside the frame; the two outer heads are fully outside. |
| `assets/img/nextup-boxing.webp` | Boxing ticket (v2.6), a still with a ken-burns | Elite Fit, own footage: copied unchanged from s3-home-v2. It is a 1:1 crop (x 80 to 720, y 545 to 845) of `../s2-editorial/assets/img/boxing-bag-720.webp`, which is frame t ≈ 2.90 s of the club's film `EF-Better-Together-30mbps.mp4` (720×1280, kept in the Sales prospect folder, homepage-v3 inputs), rows 60 to 960. The head is outside the crop. 640×300, 5 KB, native resolution: no larger source exists in the project (checked in v2.7). |
| `assets/video/boxing-ticket.mp4`, `assets/img/boxing-ticket-poster.webp` | Unused since v2.6 (kept) | Pexels 34801443 by khezez: the portrait `../../v1/assets/video/boxing.mp4` (0 to 2.97 s) centred on a blurred, darkened copy of itself (960×540, 2.7 s loop, 339 KB). Her whole head sits at least 14.9 % inside the frame. No 16:9 crop window keeps the head clear. Replace with club footage. |
| `assets/video/boxing-wide.mp4` + poster | Unused since v2.5 (kept, assets are never deleted) | Pexels 34801443 by khezez: a static 16:9 window cut from s1-stage `boxing-tall.mp4` (crop 720×405 at y 330, 960×540). It cut the head at 2.9 s. |
| `assets/video/now-*.mp4`, `assets/img/now-*-poster.webp` | Now / Next bar surfaces | Cut from the four 16:9 v2.4 ticket files (`boxing-wide`, `conditioning-wide`, `sculpt-wide`, `mobility-wide`): 320×180, Gaussian blur (sigma 24, boxing 40), darkened in the pixels to the look of #1B1B1B at 70 % (brightest pixel 77, about 8:1 for white text), 0.6x speed, 22 to 77 KB. The boxing and mobility surfaces come from stock footage: replace with club footage. |
| `../../engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp` | Coach avatars (v2.6): Now bar, dock, tickets, rows, filters, and the engine sheet strip and finder rows | engine-v2 head-and-shoulders re-crops of the club's coach photos (RULINGS #53, #53a). `assets/js/avatars.js` (v2.8) points the shared coach data at them before the engine renders. The shared `v1/assets/img/avatar-*.webp` files are not requested here any more, in Chromium or WebKit. |
| `../../v1/assets/video/visit-entrance.mp4`, photos, logo, fonts | As in v1.2 | As in v1. |

Faces: the four 16:9 files were checked every 0.5 s (boxing every 0.25 s); no face is cut or covered. Two notes on the stock clips: the mobility hair touches the top edge for about a second, with no face visible, and the boxing clip has a 0.2 s dissolve between two takes, where the face is whole but ghosted. The conditioning film passes as the centred 1.44:1 window (phones) and as the 9:16 window at 44 % (desktop). The 1.6:1 tablet window failed, so tablets show the whole 16:9 frame. The Now bar surfaces show no recognisable face, even with their darkening undone. v2.5: the engine 1.2.1 faces run (RULINGS #51) passes every ticket clip at 390 and 1440. The new boxing loop has a 0.3 s cross-fade where her face is whole but double-exposed. Contact sheets: `ef-gf/variants/s5-panels/qa/clips/`; frame shots: `ef-gf/variants/s5-panels/qa/faces51/frames/`. v2.6: with the avatar sweep, faces.js passes at 390 (21 avatar elements, minimum clearance 3.4 px). At 1440 every avatar measures at least 3.7 px clear, but the run lists 6 findings. Five are dock and Now bar avatars marked "covered" by heading text that actually scrolls under those fixed bars; a paint-order probe shows the avatar on top every time. The sixth is one scroll stop that could not be measured, for an avatar that measures 5.2 px clear in every other state. Final shots: `ef-gf/variants/s5-panels/qa/final/`.

## How to view and test

- Deep links: `?class=boxercise-beginner` or a session id opens the class. `?coach=rey`, `?view=filters`.
- Another time: `?now=2026-10-28T07:30` (Bali time; the clock keeps ticking from there, so the Now bar counts down).
- Reset: the demo stores under `ef-gf-v3-s5` (engine-v2). A private tab always starts clean.
- The finder: "Book a class" in the hero or the sticky bar opens it. Deep links: `?finder=1`, `?finder=day`, `?finder=class`, `?finder=week`.

## Tech notes

Static files, vanilla ES5, no libraries, no third-party requests. Script order (all `defer`): `../../engine-v2/api.js` (`data-store-key="ef-gf-v3-s5"`) → `motion.js` → `media.js` → `../../engine-v2/booking.js` → `page.js`. CSS: `app.css` → `../../engine-v2/sheet-base.css` → `sheet.css`. View Transitions: the coach's avatar on a ticket or row grows into the sheet's coach portrait, the class name is shared, and the portrait box is shared whole, so its crop holds during the morph. Do not add custom keyframes on the scrim pseudo-element (they crashed headless WebKit in v1).

## Checked (29 Oct 2026, engine-v2 1.1)

- **Journeys** (own self-test, WebKit iPhone 390×844 and Chromium 1440×900), every one reaches Confirmed, 0 console errors, 0 404s, 0 third-party requests, store key `ef-gf-v3-s5`:
  - class Book: drop-in 4 + 2, Duo 4 + 2, membership 5 + 2, member 3 + 1
  - finder: shortcut 5 + 2, By day today 6 + 2, Show week Duo 6 + 2
  - Now bar 4 + 2
- **Sheet frame.** Phones: modal, and the Now bar is inert under the backdrop. Desktop: non-modal panel below the pinned bar, and the page makes room. Esc returns focus to the opening Book.
- **Finder screens** at 360, 390 and 1440: By class has 10 rows and Show week has 33 chips. 0 terracotta, no cut text, no target under 44 px, no sideways scroll.
- **Layout.** No horizontal scroll at 360, 375, 390, 1024, 1280, 1440 and 1920. Fold at 390×664 and 360×640: Book 256, rating 308, quote 385 px. Half-viewport sweeps, with motion mid-flight: at most one terracotta button and one rating per screen. Anchors (5) land clear of the pinned chrome.
- **Now bar:** 45 px at every width, no overlap, nothing cut. The #43 wording passes at 360 to 1440, including with the desktop panel open.
- **Scroll trace** (Chromium, 4× CPU at 390): 0 forced layouts, 0 forced style recalcs, 98.7 to 98.9 % of frames on time. One task over 50 ms remains: the first frame after scrolling starts, with no script or layout inside it. At 1440: 0 forced layouts, and 95 to 96 % on time in the clean runs. The machine was shared, so some runs were slower.
- **Lighthouse mobile** (gzip server, 3 runs): performance 98 / 97 / 99, accessibility 100 ×3, CLS 0 ×3, TBT 21 to 55 ms.
- **Reduced motion and Save-Data:** no transform, clip-path or keyframe motion; videos paused; pulse off.
- **Faces:** the motion frames were checked every 0.1 s at 390 and 1440, with no face cut by a mask, an edge or a scale. The two 0.1 to 0.2 s cross-dissolve ghosts over the coach portrait are fixed: the in-sheet morphs no longer cross-dissolve, and the desktop close without an avatar to pair slides out instead. The Boxing and Mobility panels and the four photo cards pass.
